const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
// Fake time and a small graph isolate hover behavior from WebGL and force layout.
async function setup(reducedMotion = false) {
 let now = 0, nextId = 0; const jobs = new Map(), handlers = {}, elements = new Map();
 const schedule = (fn, delay) => { const id = ++nextId; jobs.set(id, {time: now + delay, fn}); return id; };
 const tick = ms => { const end = now + ms; for (;;) { const next = [...jobs].filter(([,j])=>j.time<=end).sort((a,b)=>a[1].time-b[1].time)[0]; if (!next) break; now=next[1].time; jobs.delete(next[0]); next[1].fn(now); } now=end; };
 function el(id) { if (!elements.has(id)) elements.set(id, {style:{setProperty(){}},classList:{add(){},remove(){},toggle(){}},listeners:{},addEventListener(name,fn){this.listeners[name]=fn;},setAttribute(){},appendChild(){},querySelector(){return null;},clientWidth:1000,clientHeight:700}); return elements.get(id); }
 const a={id:'a',name:'A',type:'project',color:'#38bdf8',x:10,y:10,z:10}, b={id:'b',name:'B',type:'project',color:'#34d399'}, c={id:'c',name:'C',type:'project',color:'#c084fc'};
 let graphData={nodes:[a,b,c],links:[{source:a,target:b,type:'project-tech'}]};
 const controls={addEventListener(name,fn){handlers['controls-'+name]=fn;}};
 let graph; graph=new Proxy({}, {get(_,name){return (...args)=>{if(name==='graphData'){if(args.length)graphData=args[0];else return graphData;}else if(name==='controls')return controls;else if(name==='d3Force')return {strength(){},distance(){}};else handlers[name]=args[0];return graph;};}});
 const context={console,Set,Date,Math,ResizeObserver:class{observe(){}},window:{matchMedia:()=>({matches:reducedMotion})},document:{getElementById:el,querySelectorAll:()=>[],addEventListener(){},createElement:()=>el('new')},performance:{now:()=>now},setTimeout:schedule,clearTimeout:id=>jobs.delete(id),requestAnimationFrame:fn=>schedule(fn,16),cancelAnimationFrame:id=>jobs.delete(id),fetch:async()=>({ok:true,json:async()=>graphData}),ForceGraph3D:()=>()=>graph};
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../scripts/knowledge-map.js'),'utf8'),context);
 await new Promise(resolve=>setImmediate(resolve));
 return {handlers,el,a,b,c,tick,color:n=>handlers.nodeColor(n)};
}
(async()=>{
 const {handlers:h,el,a,b,c,tick,color}=await setup();
 h.onNodeHover(a);tick(150);h.onNodeHover(null);tick(1000);assert.equal(color(c),c.color,'Quick pass must not dim the map');
 h.onNodeHover(a);tick(700);assert.match(color(c),/0\.450/);assert.equal(color(b),b.color,'Connected neighbor stays bright');
 h.onNodeHover(null);tick(200);assert.match(color(c),/0\.450/,'Brief pointer slip keeps focus');h.onNodeHover(a);tick(500);assert.match(color(c),/0\.450/,'Returning cancels clear');
 h.onNodeHover(null);tick(400);assert.notEqual(color(c),c.color,'Exit fades instead of snapping');tick(500);assert.equal(color(c),c.color);
 h.onNodeHover(a);tick(100);h.onNodeHover(c);tick(700);assert.equal(color(c),c.color);assert.match(color(a),/rgba/,'Newest hover wins');
 h.onNodeHover(b);el('hud-reset-btn').listeners.click();tick(1000);assert.equal(color(a),a.color,'Reset cancels pending hover');
 h.onNodeHover(a);tick(100);h.onNodeClick(a);tick(1000);assert.equal(color(c),c.color,'Click cancels pending hover');
 h.onNodeHover(a);tick(700);el('knowledge-graph-container').listeners.mouseleave();tick(200);assert.match(color(c),/rgba/);tick(700);assert.equal(color(c),c.color);
 const r=await setup(true);r.handlers.onNodeHover(r.a);r.tick(250);assert.match(r.color(r.c),/0\.450/);r.handlers.onNodeHover(null);r.tick(420);assert.equal(r.color(r.c),r.c.color);
 console.log('PASS: hover intent, brief exits, return, fade, adjacent nodes, reset/click cancellation, canvas exit, reduced motion.');
})().catch(e=>{console.error(e);process.exitCode=1;});

