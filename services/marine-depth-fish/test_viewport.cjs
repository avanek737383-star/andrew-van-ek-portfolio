const fs=require('node:fs'), vm=require('node:vm'), assert=require('node:assert/strict');
const elements=new Map();
function element(id='') { return {id, value:'', textContent:'', innerText:'', hidden:false, children:[], listeners:{},style:{},
 addEventListener(event,cb){this.listeners[event]=cb;},replaceChildren(){this.children=[];},appendChild(c){this.children.push(c);},
 get firstElementChild(){return this.children[0];},click(){return this.listeners.click?.();}}; }
const document={getElementById(id){if(!elements.has(id))elements.set(id,element(id));return elements.get(id);},querySelectorAll(){return [];},addEventListener(){},createElement(){return element();}};
function group(){return {layers:[],addLayer(l){this.layers.push(l);},clearLayers(){this.layers=[];},eachLayer(cb){this.layers.forEach(cb);}};}
let bounds={w:-86.4,s:43.1,e:-86.2,n:43.3}, fitted=null;
const fakeMap={getBounds:()=>({getWest:()=>bounds.w,getSouth:()=>bounds.s,getEast:()=>bounds.e,getNorth:()=>bounds.n}),getZoom:()=>10,getSize:()=>({x:1000,y:600}),fitBounds:(b)=>{fitted=b;}};
const styles=[], requests=[];
const ctx=vm.createContext({document,window:{addEventListener(){}},console,AbortController,setTimeout,clearTimeout,
 fakeMap,L:{layerGroup:group,latLng:(lat,lng)=>({lat,lng}),geoJSON(f,o){styles.push(o.style);return {f,bindPopup(){}};}},
 fetch:(url,options)=>new Promise(resolve=>requests.push({url,options,resolve}))});
const html=fs.readFileSync(fs.existsSync(__dirname+'/static/index.html') ? __dirname+'/static/index.html' : __dirname+'/index.html','utf8');
const js=html.match(/<script>\s*\/\/ State([\s\S]*?)<\/script>/)[1];
vm.runInContext(js,ctx);
vm.runInContext('map=fakeMap;contoursLayerGroup=L.layerGroup();labelsLayerGroup=L.layerGroup();',ctx);
const reply=(r,features)=>r.resolve({ok:true,json:async()=>({features,complete:true,coverage:'Michigan surveys'})});
const feat=(id,depth)=>({id,properties:{OBJECTID:id,DEPTH_FT:depth,source:'test'},geometry:{type:'LineString',coordinates:[]}});
(async()=>{
 const first=vm.runInContext('loadVectorContours()',ctx);
 bounds={w:-83.3,s:41.7,e:-82.9,n:42};
 const second=vm.runInContext('loadVectorContours()',ctx);
 assert(requests[0].options.signal.aborted);
 assert(requests[1].url.includes('-83.36000,41.65500,-82.84000,42.04500'));
 reply(requests[1],[feat(2,150)]);await second;
 reply(requests[0],[feat(1,20)]);await first;
 assert.equal(vm.runInContext('contoursLayerGroup.layers[0].f.id',ctx),2,'stale viewport must not overwrite current');
 assert.equal(styles[0].dashArray,null,'deep contour must be solid');
 bounds={w:179,s:10,e:181,n:11};
 const wrapped=vm.runInContext('loadVectorContours()',ctx);
 assert.equal(requests.length,4,'antimeridian must query both halves');
 reply(requests[2],[]);reply(requests[3],[]);await wrapped;
 document.getElementById('lake-query').value='Upper Crooked Lake';
 const search=document.getElementById('lake-search').listeners.submit({preventDefault(){}});
 const req=requests[4];req.resolve({ok:true,json:async()=>({results:[{name:'Upper Crooked Lake',bbox:[-85.44,42.48,-85.41,42.50]}]})});await search;
 assert.equal(JSON.stringify(fitted),JSON.stringify([[42.48,-85.44],[42.5,-85.41]]),'unique search should jump to lake bounds');
 console.log('PASS: viewport padding, stale response cancellation, solid deep lines, dateline loading, search map jump');
})().catch(e=>{console.error(e);process.exitCode=1;});
