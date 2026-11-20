import{m as e}from"./index-D_y0GiL8.js";import{t}from"./chunk-4BX2VUAB-B9m3Qa-7-BQlqoP2J.js";import{t as n}from"./ordinal-_1K_ve2E-Clnh2qh4.js";import{_ as r,t as i}from"./chunk-S3R3BYOJ-C-tVt2i5-DAmSYd7n.js";import{E as a,F as o,H as s,N as c,U as l,V as u,Y as d,et as f,k as p,o as m}from"./chunk-ABZYJK2D-bMRrxcPX-CgUke_8U.js";import{t as h}from"./arc-DcSV9F1z-CqLJIfiT.js";import{c as g,l as _}from"./src-iADVJDMk-Cv3e-mdz.js";import{n as v}from"./mermaid-parser.core-BmxuD2kc-CxnwLHq9.js";import{t as y}from"./array-CR4KRclK-BifhSqXX.js";import{n as b}from"./path-DJDuVeN--fybaL0A-.js";import{f as x}from"./math-DR-fZvqs-CAUENyng.js";function S(e,t){return t<e?-1:t>e?1:t>=e?0:NaN}function C(e){return e}function w(){var e=C,t=S,n=null,r=b(0),i=b(x),a=b(0);function o(o){var s,c=(o=y(o)).length,l,u,d=0,f=Array(c),p=Array(c),m=+r.apply(this,arguments),h=Math.min(x,Math.max(-x,i.apply(this,arguments)-m)),g,_=Math.min(Math.abs(h)/c,a.apply(this,arguments)),v=_*(h<0?-1:1),b;for(s=0;s<c;++s)(b=p[f[s]=s]=+e(o[s],s,o))>0&&(d+=b);for(t==null?n!=null&&f.sort(function(e,t){return n(o[e],o[t])}):f.sort(function(e,n){return t(p[e],p[n])}),s=0,u=d?(h-c*v)/d:0;s<c;++s,m=g)l=f[s],b=p[l],g=m+(b>0?b*u:0)+v,p[l]={data:o[l],index:s,value:b,startAngle:m,endAngle:g,padAngle:_};return p}return o.value=function(t){return arguments.length?(e=typeof t==`function`?t:b(+t),o):e},o.sortValues=function(e){return arguments.length?(t=e,n=null,o):t},o.sort=function(e){return arguments.length?(n=e,t=null,o):n},o.startAngle=function(e){return arguments.length?(r=typeof e==`function`?e:b(+e),o):r},o.endAngle=function(e){return arguments.length?(i=typeof e==`function`?e:b(+e),o):i},o.padAngle=function(e){return arguments.length?(a=typeof e==`function`?e:b(+e),o):a},o}var T=s.pie,E={sections:new Map,showData:!1,config:T},D=E.sections,O=E.showData,k=structuredClone(T),A={getConfig:g(()=>structuredClone(k),`getConfig`),clear:g(()=>{D=new Map,O=E.showData,u()},`clear`),setDiagramTitle:f,getDiagramTitle:p,setAccTitle:o,getAccTitle:c,setAccDescription:a,getAccDescription:d,addSection:g(({label:e,value:t})=>{if(t<0)throw Error(`"${e}" has invalid value: ${t}. Negative values are not allowed in pie charts. All slice values must be >= 0.`);D.has(e)||(D.set(e,t),_.debug(`added new section: ${e}, with value: ${t}`))},`addSection`),getSections:g(()=>D,`getSections`),setShowData:g(e=>{O=e},`setShowData`),getShowData:g(()=>O,`getShowData`)},j=g((e,n)=>{t(e,n),n.setShowData(e.showData),e.sections.map(n.addSection)},`populateDb`),M={parse:g(async e=>{let t=await v(`pie`,e);_.debug(t),j(t,A)},`parse`)},N=g(e=>`
  .pieCircle{
    stroke: ${e.pieStrokeColor};
    stroke-width : ${e.pieStrokeWidth};
    opacity : ${e.pieOpacity};
  }
  .pieOuterCircle{
    stroke: ${e.pieOuterStrokeColor};
    stroke-width: ${e.pieOuterStrokeWidth};
    fill: none;
  }
  .pieTitleText {
    text-anchor: middle;
    font-size: ${e.pieTitleTextSize};
    fill: ${e.pieTitleTextColor};
    font-family: ${e.fontFamily};
  }
  .slice {
    font-family: ${e.fontFamily};
    fill: ${e.pieSectionTextColor};
    font-size:${e.pieSectionTextSize};
    // fill: white;
  }
  .legend text {
    fill: ${e.pieLegendTextColor};
    font-family: ${e.fontFamily};
    font-size: ${e.pieLegendTextSize};
  }
`,`getStyles`),P=g(e=>{let t=[...e.values()].reduce((e,t)=>e+t,0),n=[...e.entries()].map(([e,t])=>({label:e,value:t})).filter(e=>e.value/t*100>=1).sort((e,t)=>t.value-e.value);return w().value(e=>e.value)(n)},`createPieArcs`),F={parser:M,db:A,renderer:{draw:g((t,a,o,s)=>{_.debug(`rendering pie chart
`+t);let c=s.db,u=m(),d=i(c.getConfig(),u.pie),f=e(a),p=f.append(`g`);p.attr(`transform`,`translate(225,225)`);let{themeVariables:g}=u,[v]=r(g.pieOuterStrokeWidth);v??=2;let y=d.textPosition,b=h().innerRadius(0).outerRadius(185),x=h().innerRadius(185*y).outerRadius(185*y);p.append(`circle`).attr(`cx`,0).attr(`cy`,0).attr(`r`,185+v/2).attr(`class`,`pieOuterCircle`);let S=c.getSections(),C=P(S),w=[g.pie1,g.pie2,g.pie3,g.pie4,g.pie5,g.pie6,g.pie7,g.pie8,g.pie9,g.pie10,g.pie11,g.pie12],T=0;S.forEach(e=>{T+=e});let E=C.filter(e=>(e.data.value/T*100).toFixed(0)!==`0`),D=n(w);p.selectAll(`mySlices`).data(E).enter().append(`path`).attr(`d`,b).attr(`fill`,e=>D(e.data.label)).attr(`class`,`pieCircle`),p.selectAll(`mySlices`).data(E).enter().append(`text`).text(e=>(e.data.value/T*100).toFixed(0)+`%`).attr(`transform`,e=>`translate(`+x.centroid(e)+`)`).style(`text-anchor`,`middle`).attr(`class`,`slice`),p.append(`text`).text(c.getDiagramTitle()).attr(`x`,0).attr(`y`,-200).attr(`class`,`pieTitleText`);let O=[...S.entries()].map(([e,t])=>({label:e,value:t})),k=p.selectAll(`.legend`).data(O).enter().append(`g`).attr(`class`,`legend`).attr(`transform`,(e,t)=>{let n=22*O.length/2;return`translate(216,`+(t*22-n)+`)`});k.append(`rect`).attr(`width`,18).attr(`height`,18).style(`fill`,e=>D(e.label)).style(`stroke`,e=>D(e.label)),k.append(`text`).attr(`x`,22).attr(`y`,14).text(e=>c.getShowData()?`${e.label} [${e.value}]`:e.label);let A=512+Math.max(...k.selectAll(`text`).nodes().map(e=>e?.getBoundingClientRect().width??0));f.attr(`viewBox`,`0 0 ${A} 450`),l(f,450,A,d.useMaxWidth)},`draw`)},styles:N};export{F as diagram};