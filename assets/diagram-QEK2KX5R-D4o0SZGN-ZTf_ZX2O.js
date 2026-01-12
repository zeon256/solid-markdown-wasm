import{p as l,M as S,$ as E,F,E as I,L as R,A as z,a3 as B,B as P,G as y,J as w,Q as j,R as D,a9 as G}from"./index-EvFfW_6K.js";import{m as V}from"./chunk-4BX2VUAB-BGPvTzTU-BSrdcege.js";import{j as W}from"./treemap-KMMF4GRG-BQu1KQqq-BxzQKUA8.js";import"./solid-monaco-UmqbK_QA.js";import"./min-Bdw3L8_w-DNqxvqy3.js";import"./_baseUniq-Ct25NOJ9-BqPXUSUN.js";var h={showLegend:!0,ticks:5,max:null,min:0,graticule:"circle"},M={axes:[],curves:[],options:h},p=structuredClone(M),Z=j.radar,_=l(()=>y({...Z,...w().radar}),"getConfig"),b=l(()=>p.axes,"getAxes"),J=l(()=>p.curves,"getCurves"),N=l(()=>p.options,"getOptions"),Q=l(a=>{p.axes=a.map(t=>({name:t.name,label:t.label??t.name}))},"setAxes"),q=l(a=>{p.curves=a.map(t=>({name:t.name,label:t.label??t.name,entries:H(t.entries)}))},"setCurves"),H=l(a=>{if(a[0].axis==null)return a.map(e=>e.value);const t=b();if(t.length===0)throw new Error("Axes must be populated before curves for reference entries");return t.map(e=>{const r=a.find(i=>{var n;return((n=i.axis)==null?void 0:n.$refText)===e.name});if(r===void 0)throw new Error("Missing entry for axis "+e.label);return r.value})},"computeCurveEntries"),K=l(a=>{var t,e,r,i,n;const o=a.reduce((s,c)=>(s[c.name]=c,s),{});p.options={showLegend:((t=o.showLegend)==null?void 0:t.value)??h.showLegend,ticks:((e=o.ticks)==null?void 0:e.value)??h.ticks,max:((r=o.max)==null?void 0:r.value)??h.max,min:((i=o.min)==null?void 0:i.value)??h.min,graticule:((n=o.graticule)==null?void 0:n.value)??h.graticule}},"setOptions"),U=l(()=>{P(),p=structuredClone(M)},"clear"),f={getAxes:b,getCurves:J,getOptions:N,setAxes:Q,setCurves:q,setOptions:K,getConfig:_,clear:U,setAccTitle:z,getAccTitle:R,setDiagramTitle:I,getDiagramTitle:F,getAccDescription:E,setAccDescription:S},X=l(a=>{V(a,f);const{axes:t,curves:e,options:r}=a;f.setAxes(t),f.setCurves(e),f.setOptions(r)},"populate"),Y={parse:l(async a=>{const t=await W("radar",a);D.debug(t),X(t)},"parse")},tt=l((a,t,e,r)=>{const i=r.db,n=i.getAxes(),o=i.getCurves(),s=i.getOptions(),c=i.getConfig(),d=i.getDiagramTitle(),g=B(t),u=et(g,c),x=s.max??Math.max(...o.map(v=>Math.max(...v.entries))),m=s.min,$=Math.min(c.width,c.height)/2;at(u,n,$,s.ticks,s.graticule),rt(u,n,$,c),C(u,n,o,m,x,s.graticule,c),T(u,o,s.showLegend,c),u.append("text").attr("class","radarTitle").text(d).attr("x",0).attr("y",-c.height/2-c.marginTop)},"draw"),et=l((a,t)=>{const e=t.width+t.marginLeft+t.marginRight,r=t.height+t.marginTop+t.marginBottom,i={x:t.marginLeft+t.width/2,y:t.marginTop+t.height/2};return a.attr("viewbox",`0 0 ${e} ${r}`).attr("width",e).attr("height",r),a.append("g").attr("transform",`translate(${i.x}, ${i.y})`)},"drawFrame"),at=l((a,t,e,r,i)=>{if(i==="circle")for(let n=0;n<r;n++){const o=e*(n+1)/r;a.append("circle").attr("r",o).attr("class","radarGraticule")}else if(i==="polygon"){const n=t.length;for(let o=0;o<r;o++){const s=e*(o+1)/r,c=t.map((d,g)=>{const u=2*g*Math.PI/n-Math.PI/2,x=s*Math.cos(u),m=s*Math.sin(u);return`${x},${m}`}).join(" ");a.append("polygon").attr("points",c).attr("class","radarGraticule")}}},"drawGraticule"),rt=l((a,t,e,r)=>{const i=t.length;for(let n=0;n<i;n++){const o=t[n].label,s=2*n*Math.PI/i-Math.PI/2;a.append("line").attr("x1",0).attr("y1",0).attr("x2",e*r.axisScaleFactor*Math.cos(s)).attr("y2",e*r.axisScaleFactor*Math.sin(s)).attr("class","radarAxisLine"),a.append("text").text(o).attr("x",e*r.axisLabelFactor*Math.cos(s)).attr("y",e*r.axisLabelFactor*Math.sin(s)).attr("class","radarAxisLabel")}},"drawAxes");function C(a,t,e,r,i,n,o){const s=t.length,c=Math.min(o.width,o.height)/2;e.forEach((d,g)=>{if(d.entries.length!==s)return;const u=d.entries.map((x,m)=>{const $=2*Math.PI*m/s-Math.PI/2,v=L(x,r,i,c),k=v*Math.cos($),O=v*Math.sin($);return{x:k,y:O}});n==="circle"?a.append("path").attr("d",A(u,o.curveTension)).attr("class",`radarCurve-${g}`):n==="polygon"&&a.append("polygon").attr("points",u.map(x=>`${x.x},${x.y}`).join(" ")).attr("class",`radarCurve-${g}`)})}l(C,"drawCurves");function L(a,t,e,r){const i=Math.min(Math.max(a,t),e);return r*(i-t)/(e-t)}l(L,"relativeRadius");function A(a,t){const e=a.length;let r=`M${a[0].x},${a[0].y}`;for(let i=0;i<e;i++){const n=a[(i-1+e)%e],o=a[i],s=a[(i+1)%e],c=a[(i+2)%e],d={x:o.x+(s.x-n.x)*t,y:o.y+(s.y-n.y)*t},g={x:s.x-(c.x-o.x)*t,y:s.y-(c.y-o.y)*t};r+=` C${d.x},${d.y} ${g.x},${g.y} ${s.x},${s.y}`}return`${r} Z`}l(A,"closedRoundCurve");function T(a,t,e,r){if(!e)return;const i=(r.width/2+r.marginRight)*3/4,n=-(r.height/2+r.marginTop)*3/4,o=20;t.forEach((s,c)=>{const d=a.append("g").attr("transform",`translate(${i}, ${n+c*o})`);d.append("rect").attr("width",12).attr("height",12).attr("class",`radarLegendBox-${c}`),d.append("text").attr("x",16).attr("y",0).attr("class","radarLegendText").text(s.label)})}l(T,"drawLegend");var it={draw:tt},st=l((a,t)=>{let e="";for(let r=0;r<a.THEME_COLOR_LIMIT;r++){const i=a[`cScale${r}`];e+=`
		.radarCurve-${r} {
			color: ${i};
			fill: ${i};
			fill-opacity: ${t.curveOpacity};
			stroke: ${i};
			stroke-width: ${t.curveStrokeWidth};
		}
		.radarLegendBox-${r} {
			fill: ${i};
			fill-opacity: ${t.curveOpacity};
			stroke: ${i};
		}
		`}return e},"genIndexStyles"),nt=l(a=>{const t=G(),e=w(),r=y(t,e.themeVariables),i=y(r.radar,a);return{themeVariables:r,radarOptions:i}},"buildRadarStyleOptions"),ot=l(({radar:a}={})=>{const{themeVariables:t,radarOptions:e}=nt(a);return`
	.radarTitle {
		font-size: ${t.fontSize};
		color: ${t.titleColor};
		dominant-baseline: hanging;
		text-anchor: middle;
	}
	.radarAxisLine {
		stroke: ${e.axisColor};
		stroke-width: ${e.axisStrokeWidth};
	}
	.radarAxisLabel {
		dominant-baseline: middle;
		text-anchor: middle;
		font-size: ${e.axisLabelFontSize}px;
		color: ${e.axisColor};
	}
	.radarGraticule {
		fill: ${e.graticuleColor};
		fill-opacity: ${e.graticuleOpacity};
		stroke: ${e.graticuleColor};
		stroke-width: ${e.graticuleStrokeWidth};
	}
	.radarLegendText {
		text-anchor: start;
		font-size: ${e.legendFontSize}px;
		dominant-baseline: hanging;
	}
	${st(t,e)}
	`},"styles"),pt={parser:Y,db:f,renderer:it,styles:ot};export{pt as diagram};
