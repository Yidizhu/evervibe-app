'use strict';

// Public city centres, never device/user coordinates. WKT uses longitude first.
const CITIES = Object.freeze({
  tokyo:{label:'Tokyo',country:'Japan',countryCode:'JP',lat:35.6762,lon:139.6503},
  'new-york':{label:'New York',country:'United States',countryCode:'US',lat:40.7128,lon:-74.0060},
  london:{label:'London',country:'United Kingdom',countryCode:'GB',lat:51.5074,lon:-0.1278},
  wellington:{label:'Wellington',country:'New Zealand',countryCode:'NZ',lat:-41.2866,lon:174.7756},
  auckland:{label:'Auckland',country:'New Zealand',countryCode:'NZ',lat:-36.8485,lon:174.7633}
});
const STORY_CITIES=Object.freeze({meet:'tokyo',date:'new-york',daily:'london',repair:'london',lifetime:'wellington',older:'wellington'});
const CATEGORY_VALUES=Object.freeze(['movie','date','activity','travel']);
const PLANNING_VALUES=Object.freeze({
  cities:Object.freeze(Object.keys(CITIES)),
  durations:Object.freeze(['few-hours','day','weekend','long']),
  moods:Object.freeze(['gentle','playful','curious','romantic','repair']),
  interests:Object.freeze(['art','food','nature','music','photography','film','history'])
});

// All these exact IDs were observed in Qloo /v2/tags or /v2/insights on 2026-10-13.
// Mood itself is not sent to Qloo; Gemini uses it to select/explain the returned candidates.
const INTEREST_TAGS=Object.freeze({
  art:'urn:tag:interests:qloo:contemporary_art',
  food:'urn:tag:interests:qloo:food_exploration',
  nature:'urn:tag:interests:qloo:outdoor_recreation',
  music:'urn:tag:interests:qloo:live_entertainment',
  photography:'urn:tag:interests:qloo:photography',
  film:'urn:tag:interests:qloo:independent_cinema',
  history:'urn:tag:interests:qloo:history'
});
const DATE_TAGS=Object.freeze([
  'urn:tag:genre:place:restaurant:cafe','urn:tag:genre:place:restaurant:coffee_shop',
  'urn:tag:genre:place:restaurant:bistro','urn:tag:genre:place:restaurant:italian',
  'urn:tag:genre:place:restaurant:japanese','urn:tag:genre:place:restaurant:mediterranean',
  'urn:tag:genre:place:restaurant:ice_cream_shop','urn:tag:genre:place:restaurant:dessert_shop'
]);
const ACTIVITY_TAGS=Object.freeze([
  'urn:tag:genre:place:museum','urn:tag:genre:place:art_gallery',
  'urn:tag:genre:place:movie_theater','urn:tag:genre:place:tourist_attraction'
]);

function normalizePlanning(episode,category,planning={}) {
  if(!Object.hasOwn(STORY_CITIES,episode)||!CATEGORY_VALUES.includes(category)||!planning||typeof planning!=='object'||Array.isArray(planning))return null;
  const value={city:planning.city??STORY_CITIES[episode],duration:planning.duration??(category==='travel'?'weekend':'few-hours'),mood:planning.mood??(episode==='repair'?'repair':'curious'),interests:planning.interests??[]};
  if(!validCity(value.city)||!PLANNING_VALUES.durations.includes(value.duration)||!PLANNING_VALUES.moods.includes(value.mood)||!Array.isArray(value.interests)||value.interests.length>7||value.interests.some(x=>!PLANNING_VALUES.interests.includes(x)))return null;
  value.city=value.city.trim();
  if(Object.hasOwn(planning,'location')) {
    value.location=normalizeLocation(planning.location);
    if(!value.location)return null;
  }
  value.interests=[...new Set(value.interests)].sort();
  return value;
}
function validCity(value) {
  // This is a locality search string, never an origin, endpoint, or arbitrary URL.
  return typeof value==='string'&&value.trim().length>0&&value.length<=100
    &&!/[\p{Cc}\u2028\u2029<>\\/]/u.test(value)&&!/(?:[a-z][a-z\d+.-]*:|www\.|[\p{L}\d-]+\.[\p{L}]{2,}(?=$|[\s:.]))/iu.test(value);
}
function normalizeLocation(value) {
  if(!value||typeof value!=='object'||Array.isArray(value))return null;
  const {lat,lon,accuracy}=value;
  if(typeof lat!=='number'||typeof lon!=='number'||!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180)return null;
  if(accuracy!==undefined&&(typeof accuracy!=='number'||!Number.isFinite(accuracy)||accuracy<0))return null;
  // Precision is deliberately limited before any provider call or cache key. Accuracy is not forwarded.
  return {lat:Number(lat.toFixed(3)),lon:Number(lon.toFixed(3))};
}
function distanceMetres(a,b) {
  const rad=n=>n*Math.PI/180,dLat=rad(b.lat-a.lat),dLon=rad(b.lon-a.lon);
  const h=Math.sin(dLat/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dLon/2)**2;
  return 6371000*2*Math.atan2(Math.sqrt(h),Math.sqrt(Math.max(0,1-h)));
}
function requestParameters(category,planning) {
  const params={'filter.type':category==='movie'?'urn:entity:movie':category==='travel'?'urn:entity:destination':'urn:entity:place'};
  // An explicit device point takes precedence; do not accidentally inherit the story's country.
  const city=!planning.location&&Object.hasOwn(CITIES,planning.city)?CITIES[planning.city]:undefined;
  if(category!=='movie') {
    if(city)params['filter.geocode.country_code']=city.countryCode;
    if(category!=='travel'||planning.duration!=='long'||!city) {
      const point=planning.location||city;
      if(point)params['filter.location']=`POINT(${point.lon} ${point.lat})`;
      else params['filter.location.query']=planning.city;
      params['filter.location.radius']=String(category==='travel'?({ 'few-hours':40000,day:100000,weekend:300000,long:500000}[planning.duration]):15000);
    }
    if(category==='date'||category==='activity') {
      let tags=category==='date'?DATE_TAGS.slice(0,6):[...ACTIVITY_TAGS];
      if(['gentle','repair'].includes(planning.mood)) {
        tags=category==='date'?DATE_TAGS.slice(0,3):ACTIVITY_TAGS.slice(0,2);
        params['filter.exclude.tags']='urn:tag:activity_type:qloo:nightlife';
      } else if(category==='date'&&planning.mood==='romantic')tags=[DATE_TAGS[2],DATE_TAGS[3],DATE_TAGS[5]];
      else if(category==='date'&&planning.mood==='playful')tags=[DATE_TAGS[0],DATE_TAGS[6],DATE_TAGS[7]];
      params['filter.tags']=tags.join(',');
      params['operator.filter.tags']='union';
    }
  }
  if(planning.interests.length)params['signal.interests.tags']=planning.interests.map(id=>INTEREST_TAGS[id]).join(',');
  return params;
}

module.exports={CITIES,CATEGORY_VALUES,PLANNING_VALUES,DATE_TAGS,ACTIVITY_TAGS,validCity,normalizeLocation,normalizePlanning,requestParameters,distanceMetres};
