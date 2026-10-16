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
  return {eligibility,culturalRank};
});
