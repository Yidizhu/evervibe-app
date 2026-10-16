(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.EverDiscoveryRules=api;})(typeof window==='object'?window:null,function(){
  'use strict';
  // These are explicit demo preferences, never inferred from a face or MBTI.
  function eligibility(visitor,candidate){
    const missing=[],rejected=[];
    if(!visitor.age)missing.push('age');else if(visitor.age<18||visitor.age<candidate.accepts.minAge||visitor.age>candidate.accepts.maxAge)rejected.push('age');
    if(!visitor.gender)missing.push('gender');else if(!candidate.accepts.genders.includes(visitor.gender))rejected.push('gender');
    if(visitor.genders?.length&&!visitor.genders.includes(candidate.gender))rejected.push('preferredGender');
    if(visitor.minAge&&candidate.age<visitor.minAge||visitor.maxAge&&candidate.age>visitor.maxAge)rejected.push('preferredAge');
    if(visitor.localOnly)missing.push('candidateLocation');
    return {eligible:!rejected.length&&!missing.length,exploratory:!rejected.length&&!!missing.length,missing,rejected};
  }
  function culturalRank(comparison){
    if(comparison?.source!=='qloo'||comparison.status!=='ready')return 0;
    return new Set((comparison.shared||[]).map(x=>String(x.name||x.id||'').toLowerCase()).filter(Boolean)).size;
  }
  const wishTerms={quiet:/quiet|slow|calm|安静|慢节奏|慢一点|平静/i,adventure:/adventur|spontaneous|unplanned|冒险|随性|新鲜/i,music:/live music|concert|演出|现场音乐|音乐会/i,outdoors:/outdoor|coast|hiking|户外|海边|徒步/i,art:/art|design|exhibition|艺术|设计|展览/i,conversation:/conversation|talk|聊天|交流|沟通/i};
  const authored={mira:['quiet','art'],eli:['adventure','music','art'],nora:['quiet'],theo:['conversation','art'],sana:['conversation','art'],kai:['outdoors','music','quiet'],lena:['adventure','art','conversation'],owen:['quiet','music']};
  function preferenceRank(wishes,candidate){
    const positive=String(wishes||'').replace(/(?:not|no|avoid|don't want|do not want|不想|不喜欢|不要)[^,.，。;；]*(?=[,.，。;；]|$)/gi,'');
    return Object.entries(wishTerms).filter(([key,re])=>re.test(positive)&&(authored[candidate.id]||[]).includes(key)).map(([key])=>key);
  }
  function rank(visitor,a,b){return Number(b.eligibility.eligible)-Number(a.eligibility.eligible)||preferenceRank(visitor.ideal,b.person).length-preferenceRank(visitor.ideal,a.person).length||culturalRank(b.comparison)-culturalRank(a.comparison);}
  return {eligibility,culturalRank,preferenceRank,rank};
});
