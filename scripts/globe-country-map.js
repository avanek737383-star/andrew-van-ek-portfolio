/* A political basemap drawn from the bundled Natural Earth snapshot. */
(function(root){
 'use strict';
 function drawMap(features,night,width){
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=width/2;
  const ctx=canvas.getContext('2d'),height=canvas.height;
  ctx.fillStyle=night?'#071321':'#dbeaf1';ctx.fillRect(0,0,width,height);
  ctx.lineJoin='round';ctx.lineWidth=width/4096*1.4;
  const xy=point=>[(point[0]+180)/360*width,(90-point[1])/180*height];
  features.forEach(feature=>{
   const polygons=feature.geometry.type==='Polygon'?[feature.geometry.coordinates]:feature.geometry.coordinates;
   ctx.fillStyle=night?'#1c2d42':'#f5f2e9';ctx.strokeStyle=night?'#6a869b':'#697f8d';
   polygons.forEach(polygon=>{ctx.beginPath();polygon.forEach(ring=>{ring.forEach((point,i)=>{const p=xy(point);if(i===0)ctx.moveTo(p[0],p[1]);else ctx.lineTo(p[0],p[1]);});ctx.closePath();});ctx.fill('evenodd');ctx.stroke();});
  });
  const placed=[];let labels=0;ctx.textAlign='center';ctx.textBaseline='middle';
  features.slice().sort((a,b)=>a.properties.labelRank-b.properties.labelRank).forEach(feature=>{
   const p=feature.properties,position=xy([p.labelLng,p.labelLat]);
   const size=(p.labelRank<=2?32:p.labelRank<=4?24:18)*width/4096;
   ctx.font='600 '+size+'px Inter,system-ui,sans-serif';
   const shortened={'United States of America':'United States','Democratic Republic of the Congo':'DR Congo','Central African Republic':'Central African Rep.'};
   const name=shortened[p.name]||p.name;
   const words=name.split(' '),lines=[];let line='';
   words.forEach(word=>{const next=line?line+' '+word:word;if(line&&ctx.measureText(next).width>190*width/4096){lines.push(line);line=word;}else line=next;});if(line)lines.push(line);
   if(lines.length>3)return;
   const textWidth=Math.max(...lines.map(t=>ctx.measureText(t).width)),textHeight=lines.length*size*1.15;
   const box={left:position[0]-textWidth/2-3,right:position[0]+textWidth/2+3,top:position[1]-textHeight/2-2,bottom:position[1]+textHeight/2+2};
   if(placed.some(b=>box.left<b.right&&box.right>b.left&&box.top<b.bottom&&box.bottom>b.top))return;
   placed.push(box);ctx.fillStyle=night?'#dbe7f0':'#263746';lines.forEach((text,i)=>ctx.fillText(text,position[0],position[1]+(i-(lines.length-1)/2)*size*1.15));labels++;
  });
  return {canvas,labels};
 }
 async function install(world){
  const material=world.globeMaterial();
  const ready=material.map&&material.map.image?Promise.resolve():new Promise(resolve=>world.onGlobeReady(resolve));
  const [data]=await Promise.all([fetch('data/countries.json').then(r=>{if(!r.ok)throw Error('Country map unavailable');return r.json();}),ready]);
  const width=Math.min(4096,world.renderer().capabilities.maxTextureSize);
  const day=drawMap(data.features,false,width),night=drawMap(data.features,true,width);
  const original=material.map;
  function texture(canvas){const image=new original.constructor(canvas);image.flipY=original.flipY;image.colorSpace=original.colorSpace;image.needsUpdate=true;return image;}
  const dayTexture=texture(day.canvas),nightTexture=texture(night.canvas);
  let mode=0,compiled=null,sun=null;
  material.map=dayTexture;material.color=(material.color||material.emissive.clone()).set('#ffffff');material.bumpMap=null;
  const state={mode:0,sun:null,labelCount:day.labels,featureCount:data.features.length};material.userData.politicalMap=state;
  function updateSun(){
   sun=root.PortfolioSolar.sunPosition(new Date());const vector=world.getCoords(sun.lat,sun.lng,0),length=Math.hypot(vector.x,vector.y,vector.z);
   state.sun=sun;state.direction={x:vector.x/length,y:vector.y/length,z:vector.z/length};
   if(compiled)compiled.uniforms.politicalSun.value=state.direction;
   const stamp=document.getElementById('globe-sun-time');if(stamp){stamp.dateTime=new Date().toISOString();stamp.textContent=new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',timeZone:'UTC'})+' UTC';}
  }
  material.onBeforeCompile=function(shader){
   compiled=shader;shader.uniforms.politicalNight={value:nightTexture};shader.uniforms.politicalSun={value:state.direction};shader.uniforms.politicalMode={value:mode};
   shader.vertexShader='varying vec3 vPoliticalNormal; varying vec2 vPoliticalUv;\n'+shader.vertexShader;
   shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvPoliticalNormal=normalize(position);vPoliticalUv=uv;');
   shader.fragmentShader='uniform sampler2D politicalNight; uniform vec3 politicalSun; uniform float politicalMode; varying vec3 vPoliticalNormal; varying vec2 vPoliticalUv;\n'+shader.fragmentShader;
   shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#ifdef USE_MAP
     float sunlight=smoothstep(-0.12,0.12,dot(normalize(vPoliticalNormal),normalize(politicalSun)));
     float blend=politicalMode<0.5?sunlight:(politicalMode<1.5?1.0:0.0);
     diffuseColor*=mix(texture2D(politicalNight,vPoliticalUv),texture2D(map,vPoliticalUv),blend);
     #endif`);
   shader.fragmentShader=shader.fragmentShader.replace(/#include <(opaque|output)_fragment>/,'outgoingLight=diffuseColor.rgb;\n$&');
  };
  material.customProgramCacheKey=()=> 'political-country-map-v1';updateSun();material.needsUpdate=true;world.globeMaterial(material);
  world.polygonsData(data.features).polygonAltitude(.0003).polygonCapColor(()=> 'rgba(0,0,0,0)').polygonSideColor(()=> 'rgba(0,0,0,0)').polygonStrokeColor(()=> 'rgba(0,0,0,0)').polygonLabel(feature=>feature.properties.name);
  const interval=setInterval(updateSun,60000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)updateSun();});window.addEventListener('pagehide',()=>clearInterval(interval),{once:true});
  const status=document.getElementById('country-map-status');if(status)status.textContent='Country outlines and names are ready. Zoom in for labels or hover over a country for its name.';
  return {setMode(value){mode=value;state.mode=value;if(compiled)compiled.uniforms.politicalMode.value=value;updateSun();},getMode:()=>mode};
 }
 root.PortfolioCountryMap={install};
})(window);
