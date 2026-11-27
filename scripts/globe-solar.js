/* Approximate subsolar point from NOAA's fractional-year equations.
 * https://gml.noaa.gov/grad/solcalc/solareqns.PDF
 * UTC input; used for illustrative map shading, not navigation.
 */
(function(root){
 'use strict';
 function sunPosition(date){
  const year=date.getUTCFullYear(),start=Date.UTC(year,0,1),days=(Date.UTC(year+1,0,1)-start)/86400000;
  const day=(Date.UTC(year,date.getUTCMonth(),date.getUTCDate())-start)/86400000+1;
  const hours=date.getUTCHours()+date.getUTCMinutes()/60+date.getUTCSeconds()/3600;
  const gamma=2*Math.PI/days*(day-1+(hours-12)/24);
  const equation=229.18*(.000075+.001868*Math.cos(gamma)-.032077*Math.sin(gamma)-.014615*Math.cos(2*gamma)-.040849*Math.sin(2*gamma));
  const decl=.006918-.399912*Math.cos(gamma)+.070257*Math.sin(gamma)-.006758*Math.cos(2*gamma)+.000907*Math.sin(2*gamma)-.002697*Math.cos(3*gamma)+.00148*Math.sin(3*gamma);
  const longitude=((180-(hours*60+equation)/4+540)%360)-180;
  return {lat:decl*180/Math.PI,lng:longitude};
 }
 const api=Object.freeze({sunPosition});root.PortfolioSolar=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
