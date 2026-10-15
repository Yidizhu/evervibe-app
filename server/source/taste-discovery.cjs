'use strict';
// Provider input contributions are not personal liking or compatibility scores.
function explainedCandidates(entities,groups,catalogItem){
 const excluded=new Set(groups.flat()),seen=new Set();
 return entities.map(entity=>{
  const item=catalogItem(entity,'movie'),explain=entity.query?.explainability;
  if(!item||excluded.has(item.id)||seen.has(item.id)||explain?.warning)return;
  seen.add(item.id);
  const rows=explain?.['signal.interests.entities'];if(!Array.isArray(rows))return;
  const byId=new Map();
  for(const row of rows){const id=typeof row?.entity_id==='string'?row.entity_id.toLowerCase():'';if(!excluded.has(id)||byId.has(id)||typeof row.score!=='number'||!Number.isFinite(row.score)||row.score<0||row.score>1)continue;byId.set(id,row.score);}
  const contributions=groups.map(ids=>ids.filter(id=>byId.has(id)).map(id=>({id,score:byId.get(id)})));
  const totals=contributions.map(rows=>rows.reduce((sum,row)=>sum+row.score,0));
  if(totals.some(total=>total<0.1)||[...byId.values()].reduce((a,b)=>a+b,0)>1.001)return;
  return {...item,evidence:{method:'qloo-explainability',you:contributions[0],partner:contributions[1]},balance:Math.min(...totals)/Math.max(...totals)};
 }).filter(Boolean).sort((a,b)=>b.balance-a.balance).slice(0,3).map(({balance,...item})=>item);
}
module.exports={explainedCandidates};
