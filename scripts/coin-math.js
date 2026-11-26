/* Shared, testable math for a synthetic coin process. Not a physical coin model. */
(function(root){
  'use strict';
  function nextFace(previous, random, persistence){
    return random() < persistence ? previous : 1-previous;
  }
  function persistenceFor(sequence, process){
    if(process==='fair')return .5;
    if(process==='persistent')return .515;
    var streak=1;
    for(var i=sequence.length-1;i>0&&sequence[i]===sequence[i-1];i--)streak++;
    return streak>=2?.18:.42;
  }
  function balanceEntropy(sequence){
    if(!sequence.length)return null;
    var p=sequence.reduce((a,b)=>a+b,0)/sequence.length;
    return p===0||p===1?0:-(p*Math.log2(p)+(1-p)*Math.log2(1-p));
  }
  function features(window){
    var f=window.slice(),current=window[window.length-1],streak=0,alts=0,heads=0,hh=0;
    for(var i=window.length-1;i>=0&&window[i]===current;i--)streak++;
    f.push((current===1?streak:-streak)/10);
    f.push(window.reduce((a,b)=>a+b,0)/window.length);
    for(var j=0;j<window.length-1;j++){
      if(window[j]!==window[j+1])alts++;
      if(window[j]===1){heads++;if(window[j+1]===1)hh++;}
    }
    f.push(alts/(window.length-1));f.push(heads?hh/heads:.5);return f;
  }
  function probability(input,w){
    var a=w.fc1_w.map((row,i)=>Math.max(0,row.reduce((s,v,j)=>s+v*input[j],w.fc1_b[i])));
    var b=w.fc2_w.map((row,i)=>Math.max(0,row.reduce((s,v,j)=>s+v*a[j],w.fc2_b[i])));
    var z=w.fc3_w[0].reduce((s,v,j)=>s+v*b[j],w.fc3_b[0]);
    return 1/(1+Math.exp(-Math.max(-40,Math.min(40,z))));
  }
  function seeded(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;var t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
  var api=Object.freeze({nextFace,persistenceFor,balanceEntropy,features,probability,seeded});
  root.PortfolioCoinMath=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
