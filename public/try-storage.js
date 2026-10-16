(function(root){
  const KEY='evervibe:local:v1';
  function encode(data){return JSON.stringify({version:1,data},(key,value)=>value instanceof Set?{__eveSet:[...value]}:value);}
  function decode(raw){if(!raw)return null;const envelope=JSON.parse(raw,(key,value)=>value&&Array.isArray(value.__eveSet)?new Set(value.__eveSet):value);if(envelope.version!==1||!envelope.data||!Array.isArray(envelope.data.sessions)||!Array.isArray(envelope.data.entries))throw new Error('Unsupported saved data');return envelope.data;}
  const api={KEY,encode,decode,save(storage,data){storage.setItem(KEY,encode(data));},load(storage){return decode(storage.getItem(KEY));},clear(storage){storage.removeItem(KEY);}};
  if(typeof module==='object')module.exports=api;else root.EverTryStorage=api;
})(typeof window==='object'?window:globalThis);
