const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const html=fs.readFileSync(__dirname+'/static/index.html','utf8');
const js=html.slice(html.indexOf('    // Keep disconnected'),html.indexOf('    // Load Real Vector'));
let zoom=8,markers=[];
const ctx=vm.createContext({Number,Math,contourLabelsZooming:false,map:{getZoom:()=>zoom,getSize:()=>({x:1000,y:600}),latLngToContainerPoint:p=>p,containerPointToLatLng:p=>p},
labelsLayerGroup:{clearLayers(){markers=[];}},activeContourLines:[],L:{latLng:(lat,lng)=>({lat,lng}),divIcon:o=>o,marker:(p,o)=>({addTo(){markers.push({p,icon:o.icon});}})}});
vm.runInContext(js,ctx);
ctx.activeContourLines=Array.from({length:25},(_,i)=>({depth:10+i,latlngs:[{x:-500,y:30+i*22},{x:1500,y:30+i*22}]}));
function run(z){zoom=z;vm.runInContext('updateSlidingLabels()',ctx);for(let i=0;i<markers.length;i++)for(let j=i+1;j<markers.length;j++){
const a=markers[i],b=markers[j];assert(Math.abs(a.p[0]-b.p[0])>=(a.icon.iconSize[0]+b.icon.iconSize[0])/2 || Math.abs(a.p[1]-b.p[1])>=22,'labels overlap');}
assert(markers.every(m=>/^\d+(\.\d+)? FT$/.test(m.icon.html)));return markers.length;}
let low=run(8),mid=run(12),high=run(16);assert(low>0);assert(mid>low);assert(high>mid);
assert.equal(vm.runInContext("extractContourParts({type:'MultiLineString',coordinates:[[[0,0],[1,1]],[[3,3],[4,4]]]}).length",ctx),2);
assert.equal(vm.runInContext("clipLabelSegment({x:-10,y:-10},{x:1100,y:-10},1000,600)",ctx),null);
console.log(`PASS: sparse crossing contours labeled, no pairwise overlaps, zoom density ${low}/${mid}/${high}, disconnected parts preserved`);
