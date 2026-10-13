import {mountModel} from './tripo-viewer.js';
const proceduralTree=window.mountEverTree;
window.mountEverTree=(host,stage,hasMemory,care={})=>{if(stage!==3)return proceduralTree(host,stage,hasMemory,care);const height=host.style.height;host.style.height='340px';const dispose=mountModel(host,'tree',undefined,stage,care);return()=>{dispose();host.style.height=height;};};
// Loading the mature-tree viewer must not replace an in-progress box or chat interaction.
if(document.querySelector('[data-tree-stage="3"]')) render();
