'use strict';

// Compare returns cultural tags for two sets of public entities, not people scores.
const validTag=id=>typeof id==='string'&&/^urn:tag:[a-z0-9_.:-]{1,180}$/i.test(id);
function readSharedTags(body){
 if(!Array.isArray(body?.results?.tags))throw new Error('Invalid compare response');
 const seenIds=new Set(),seenNames=new Set();
 // Presentation priority, not a new Qloo score: its style/character namespaces
 // tell a more specific cultural story than genre. Preserve provider order
 // inside each tier and never promote tags from the one-sided a/b lists.
 const priority=tag=>/^urn:tag:(style|character):/i.test(tag.tag_id)?0:/^urn:tag:genre:/i.test(tag.tag_id)?2:1;
 return body.results.tags.slice(0,100).filter(tag=>{
  if(!validTag(tag?.tag_id)||typeof tag.name!=='string'||!tag.name.trim()||tag.name.length>100||/[\u0000-\u001f<>]/.test(tag.name)||seenIds.has(tag.tag_id))return false;
  seenIds.add(tag.tag_id);return true;
 }).sort((a,b)=>priority(a)-priority(b)).filter(tag=>{
  const name=tag.name.normalize('NFKC').trim().replace(/\s+/g,' ').toLocaleLowerCase('en');
  if(seenNames.has(name))return false;seenNames.add(name);return true;
 }).slice(0,3).map(tag=>({id:tag.tag_id,name:tag.name.trim()}));
}
function bridgeSignals(params,bridge){
 const existing=(params['signal.interests.tags']||'').split(',').filter(Boolean);
 const shared=bridge?.status==='ready'?bridge.shared.filter(tag=>validTag(tag.id)).map(tag=>tag.id):[];
 const tags=[...new Set([...existing,...shared])];
 return tags.length?{...params,'signal.interests.tags':tags.join(',')}:{...params};
}
module.exports={readSharedTags,bridgeSignals};
