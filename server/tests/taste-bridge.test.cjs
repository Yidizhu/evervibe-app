'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {readSharedTags,bridgeSignals}=require('../source/taste-bridge.cjs');
test('compare parser rejects malformed envelopes and filters untrusted labels and duplicate IDs',()=>{
 assert.throws(()=>readSharedTags({results:{a:[]}}));
 const shared=readSharedTags({results:{tags:[{tag_id:'urn:tag:style:qloo:a',name:'A'},{tag_id:'urn:tag:style:qloo:a',name:'Duplicate'},{tag_id:'https://evil.invalid',name:'Bad'},{tag_id:'urn:tag:style:qloo:b',name:'<script>'},{tag_id:'urn:tag:style:qloo:c',name:'C'},{tag_id:'urn:tag:style:qloo:d',name:'D'},{tag_id:'urn:tag:style:qloo:e',name:'E'}]}});
 assert.deepEqual(shared.map(tag=>tag.name),['A','C','D']);
});
test('compare deduplicates the actual Parasite and Lost in Translation overlap by normalized name',()=>{
 // Names, IDs and subtypes observed in the live compare response on 2026-10-14.
 const tags=[
  {tag_id:'urn:tag:genre:media:drama',name:'Drama',subtype:'urn:tag:genre:media'},
  {tag_id:'urn:tag:character:qloo:complex',name:'Complex',subtype:'urn:tag:character:qloo'},
  {tag_id:'urn:tag:genre:qloo:drama',name:'Drama',subtype:'urn:tag:genre:qloo'}
 ];
 const shared=readSharedTags({results:{tags,a:[{tag_id:'urn:tag:style:qloo:cinematic',name:'Cinematic'}],b:[]}});
 assert.deepEqual(shared,[{id:tags[1].tag_id,name:'Complex'},{id:tags[0].tag_id,name:'Drama'}]);
 assert.equal(shared.length,2,'No invented third theme or one-sided replacement');
 tags.push({tag_id:'urn:tag:genre:qloo:another',name:'  ＤＲＡＭＡ  '});
 assert.deepEqual(readSharedTags({results:{tags}}),shared);
});
test('specific themes are considered before the display cap without inventing a Qloo score',()=>{
 const tags=[
  {tag_id:'urn:tag:genre:media:drama',name:'Drama'},
  {tag_id:'urn:tag:genre:media:comedy',name:'Comedy'},
  {tag_id:'urn:tag:genre:media:thriller',name:'Thriller'},
  {tag_id:'urn:tag:style:qloo:stylized',name:'Stylized',query:{score:.4}},
  {tag_id:'urn:tag:character:qloo:eccentric',name:'Eccentric',query:{score:.3}}
 ];
 assert.deepEqual(readSharedTags({results:{tags}}),[
  {id:tags[3].tag_id,name:'Stylized'},{id:tags[4].tag_id,name:'Eccentric'},{id:tags[0].tag_id,name:'Drama'}
 ]);
 assert.deepEqual(readSharedTags({results:{tags:[{tag_id:'urn:tag:style:qloo:x',name:'Slow  cinema'},{tag_id:'urn:tag:style:media:x',name:' slow cinema '}]}}),[{id:'urn:tag:style:qloo:x',name:'Slow  cinema'}]);
});
test('bridge signals retain intent tags and deduplicate only verified ready themes',()=>{
 const params={'signal.interests.tags':'urn:tag:place:art'};
 const bridge={status:'ready',shared:[{id:'urn:tag:place:art'},{id:'urn:tag:genre:media:comedy'}]};
 assert.equal(bridgeSignals(params,bridge)['signal.interests.tags'],'urn:tag:place:art,urn:tag:genre:media:comedy');
 assert.deepEqual(bridgeSignals(params,{...bridge,status:'unavailable'}),params);assert.equal(params['signal.interests.tags'],'urn:tag:place:art');
});
