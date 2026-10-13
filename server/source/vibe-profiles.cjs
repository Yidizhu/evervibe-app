'use strict';
// Fictional black-box Vibe records shared by Gemini and Qloo. No real personal accounts.
const EPISODES=Object.freeze({meet:0,date:1,daily:2,repair:2,lifetime:3,older:3});
const PROFILES=[
 {leo:{name:'Kenji',city:'Tokyo',interests:['Blade Runner (1982)','Film photography','Building shadows and staircases','Listening to music on a city walk','Kino (Russian rock band)'],planning:'Tokyo: Saturday afternoon, one public architecture walk and time to sit.'},julian:{name:'Anya',city:'Tokyo',interests:['Amélie (2001)','Illustration','Photographs of concrete buildings and shadows','Pairing a photograph with a song','Kino (Russian rock band)'],planning:'Tokyo: daylight, a public place, time to share photographs and a song.'}},
 {leo:{name:'Chloe',city:'New York City',interests:['Knives Out (2019)','Mystery films','Small art exhibitions','Talking through the clues after a film'],planning:'New York City: a quiet Saturday date, one cultural stop and time to hear each other.'},julian:{name:'Sarah',city:'New York City',interests:['Amélie (2001)','Discovering songs','Live music','Record browsing','Nina Simone','Small exhibitions with a good conversation afterwards'],planning:'New York City: share a cultural discovery, keep the volume comfortable and leave time to talk.'}},
 {leo:{name:'Emma',city:'London',interests:['Paddington 2 (2017)','Gentle films','Browsing second-hand books','A short local walk','Tea and an unhurried conversation'],planning:'London: simple Friday time together, without a packed schedule.'},julian:{name:'Arjun',city:'London',interests:['Notting Hill (1999)','Music at home','Romantic comedies','Simple cooking when off duty','A short walk after dinner'],planning:'London: little preparation on a day off, with time to sit together and listen.'}},
 {leo:{name:'Leo',city:'Wellington',interests:['Before Sunrise (1995)','Architecture photography','Travel memories','Looking through selected old photographs','A quiet afternoon by the water'],planning:'Wellington: a quiet Saturday nearby, one old photograph and one small new discovery.'},julian:{name:'Julian',city:'Wellington',interests:['The Secret Life of Walter Mitty (2013)','Travel','Books and travel keepsakes','Simple picnics','Discovering a new detail in a familiar place'],planning:'Wellington: stay nearby this anniversary, bring simple food and leave time to sit.'}}
];
// Exact known works are taste signals, never compatibility scores or personal identities.
const CULTURAL_SEEDS=[
 [{name:'Blade Runner',year:1982},{name:'Amélie',year:2001}],
 [{name:'Knives Out',year:2019},{name:'Amélie',year:2001}],
 [{name:'Paddington 2',year:2017},{name:'Notting Hill',year:1999}],
 [{name:'Before Sunrise',year:1995},{name:'The Secret Life of Walter Mitty',year:2013}]
];
// Artist identifiers are server-owned, manually checked against official Qloo
// /search responses. Kino already belongs to the fictional Tokyo story. Sarah's
// Nina Simone preference is a NEW fictional detail authored on 2026-10-14 NZ;
// it is not extracted from the user's notes, real identity, or a private account.
const CULTURAL_ARTIST_SEEDS=Object.freeze([
 Object.freeze([{name:'Кино',type:'artist',id:'11970439-1E91-49FD-B3D4-8D9C01199470',profileInterest:'Kino (Russian rock band)',owners:['leo','julian'],verifiedOn:'2026-10-14',verifiedSource:'https://hackathon.api.qloo.com/search'}]),
 Object.freeze([{name:'Nina Simone',type:'artist',id:'AEB7DA4D-D5A8-43F1-9881-74DA17D8D521',profileInterest:'Nina Simone',owners:['julian'],verifiedOn:'2026-10-14',verifiedSource:'https://hackathon.api.qloo.com/search'}]),
 Object.freeze([]),Object.freeze([])
]);
const SHARED_EVENTS=Object.freeze({
 meet:'They have both chosen to connect and share Vibes. Kenji and Anya share an interest in photographs and architecture. This is an early connection: open with curiosity, not assumed intimacy.',
 date:'Chloe and Sarah are getting closer and both have opted into shared EVE. Offer a small cultural moment they could enjoy together; do not invent a scheduled date.',
 daily:'Emma and Arjun live together. In this fictional story they want a simple Friday meal and unhurried time together beyond chores. Offer a low-preparation ritual, not a packed schedule.',
 repair:'Shared story event: Emma was left waiting while Arjun worked late at the restaurant. In their direct conversation Emma said she needed to know whether to wait; Arjun snapped, "Then do not wait anymore." The conflict is unresolved. They are willing to work on it. Help Emma express the need, help Arjun take responsibility before explaining. Do not tell either to forgive or imply a date fixes it.',
 lifetime:'Leo and Julian have been together for fifteen years. Their shared wish for the anniversary is a quiet afternoon, old photos, and a simple meal. Do not disclose or invent a private proposal plan.',
 older:'Leo and Julian have long shared a life. Their shared plan preference is a short nearby outing and time to sit together tomorrow afternoon. Invite a small new memory, not assumptions about health or ability.'
});
module.exports={EPISODES,PROFILES,CULTURAL_SEEDS,CULTURAL_ARTIST_SEEDS,SHARED_EVENTS};
