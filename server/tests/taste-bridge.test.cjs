'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {readSharedTags,bridgeSignals}=require('../source/taste-bridge.cjs');
test('compare parser rejects malformed envelopes and filters untrusted labels and duplicate IDs',()=>{
 assert.throws(()=>readSharedTags({results:{a:[]}}));
 const shared=readSharedTags({results:{tags:[{tag_id:'urn:tag:style:qloo:a',name:'A'},{tag_id:'urn:tag:style:qloo:a',name:'Duplicate'},{tag_id:'https://evil.invalid',name:'Bad'},{tag_id:'urn:tag:style:qloo:b',name:'<script>'},{tag_id:'urn:tag:style:qloo:c',name:'C'},{tag_id:'urn:tag:style:qloo:d',name:'D'},{tag_id:'urn:tag:style:qloo:e',name:'E'}]}});
 assert.deepEqual(shared.map(tag=>tag.name),['A','C','D']);
});
test('bridge signals retain intent tags and deduplicate only verified ready themes',()=>{
 const params={'signal.interests.tags':'urn:tag:place:art'};
 const bridge={status:'ready',shared:[{id:'urn:tag:place:art'},{id:'urn:tag:genre:media:comedy'}]};
 assert.equal(bridgeSignals(params,bridge)['signal.interests.tags'],'urn:tag:place:art,urn:tag:genre:media:comedy');
 assert.deepEqual(bridgeSignals(params,{...bridge,status:'unavailable'}),params);assert.equal(params['signal.interests.tags'],'urn:tag:place:art');
});
