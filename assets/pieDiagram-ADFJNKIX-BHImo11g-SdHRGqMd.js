import{p,D as U,d as H,E as I,$ as J,R as K,O as Q,F,y as X,z as Y,a3 as Z,a5 as ee,C as te,q as ae,A as ie,a6 as y,a7 as ne,a8 as z}from"./index-BvrQ_PGV.js";import{m as re}from"./chunk-4BX2VUAB-Bi3F7Sum-DlNsS7i3.js";import{j as le}from"./treemap-KMMF4GRG-VEltIM-G-CpdR6GmT.js";import{h as P}from"./arc-D6ydluwD-B-PkC1Cv.js";import{l as se}from"./ordinal-C4kwyI7I-DaIU-pNn.js";import"./solid-monaco-CPPlqGHr.js";import"./min-C3Ea0Fk6-D9Yh4HEC.js";import"./_baseUniq-CPBJXqHP-C7eKc09X.js";import"./init-DjUOC4st-DHuO7-vr.js";function oe(e,a){return a<e?-1:a>e?1:a>=e?0:NaN}function ue(e){return e}function ce(){var e=ue,a=oe,g=null,s=y(0),o=y(z),w=y(0);function l(t){var n,u=(t=ne(t)).length,d,v,x=0,c=new Array(u),r=new Array(u),m=+s.apply(this,arguments),$=Math.min(z,Math.max(-z,o.apply(this,arguments)-m)),h,A=Math.min(Math.abs($)/u,w.apply(this,arguments)),D=A*($<0?-1:1),f;for(n=0;n<u;++n)(f=r[c[n]=n]=+e(t[n],n,t))>0&&(x+=f);for(a!=null?c.sort(function(S,C){return a(r[S],r[C])}):g!=null&&c.sort(function(S,C){return g(t[S],t[C])}),n=0,v=x?($-u*D)/x:0;n<u;++n,m=h)d=c[n],f=r[d],h=m+(f>0?f*v:0)+D,r[d]={data:t[d],index:n,value:f,startAngle:m,endAngle:h,padAngle:A};return r}return l.value=function(t){return arguments.length?(e=typeof t=="function"?t:y(+t),l):e},l.sortValues=function(t){return arguments.length?(a=t,g=null,l):a},l.sort=function(t){return arguments.length?(g=t,a=null,l):g},l.startAngle=function(t){return arguments.length?(s=typeof t=="function"?t:y(+t),l):s},l.endAngle=function(t){return arguments.length?(o=typeof t=="function"?t:y(+t),l):o},l.padAngle=function(t){return arguments.length?(w=typeof t=="function"?t:y(+t),l):w},l}var pe=ie.pie,R={sections:new Map,showData:!1},b=R.sections,E=R.showData,de=structuredClone(pe),fe=p(()=>structuredClone(de),"getConfig"),ge=p(()=>{b=new Map,E=R.showData,ae()},"clear"),me=p(({label:e,value:a})=>{if(a<0)throw new Error(`"${e}" has invalid value: ${a}. Negative values are not allowed in pie charts. All slice values must be >= 0.`);b.has(e)||(b.set(e,a),F.debug(`added new section: ${e}, with value: ${a}`))},"addSection"),he=p(()=>b,"getSections"),xe=p(e=>{E=e},"setShowData"),ye=p(()=>E,"getShowData"),V={getConfig:fe,clear:ge,setDiagramTitle:Q,getDiagramTitle:K,setAccTitle:J,getAccTitle:I,setAccDescription:H,getAccDescription:U,addSection:me,getSections:he,setShowData:xe,getShowData:ye},we=p((e,a)=>{re(e,a),a.setShowData(e.showData),e.sections.map(a.addSection)},"populateDb"),ve={parse:p(async e=>{const a=await le("pie",e);F.debug(a),we(a,V)},"parse")},$e=p(e=>`
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
`,"getStyles"),Se=$e,Ce=p(e=>{const a=[...e.values()].reduce((s,o)=>s+o,0),g=[...e.entries()].map(([s,o])=>({label:s,value:o})).filter(s=>s.value/a*100>=1).sort((s,o)=>o.value-s.value);return ce().value(s=>s.value)(g)},"createPieArcs"),Ae=p((e,a,g,s)=>{F.debug(`rendering pie chart
`+e);const o=s.db,w=X(),l=Y(o.getConfig(),w.pie),t=40,n=18,u=4,d=450,v=d,x=Z(a),c=x.append("g");c.attr("transform","translate("+v/2+","+d/2+")");const{themeVariables:r}=w;let[m]=ee(r.pieOuterStrokeWidth);m??(m=2);const $=l.textPosition,h=Math.min(v,d)/2-t,A=P().innerRadius(0).outerRadius(h),D=P().innerRadius(h*$).outerRadius(h*$);c.append("circle").attr("cx",0).attr("cy",0).attr("r",h+m/2).attr("class","pieOuterCircle");const f=o.getSections(),S=Ce(f),C=[r.pie1,r.pie2,r.pie3,r.pie4,r.pie5,r.pie6,r.pie7,r.pie8,r.pie9,r.pie10,r.pie11,r.pie12];let T=0;f.forEach(i=>{T+=i});const W=S.filter(i=>(i.data.value/T*100).toFixed(0)!=="0"),k=se(C);c.selectAll("mySlices").data(W).enter().append("path").attr("d",A).attr("fill",i=>k(i.data.label)).attr("class","pieCircle"),c.selectAll("mySlices").data(W).enter().append("text").text(i=>(i.data.value/T*100).toFixed(0)+"%").attr("transform",i=>"translate("+D.centroid(i)+")").style("text-anchor","middle").attr("class","slice"),c.append("text").text(o.getDiagramTitle()).attr("x",0).attr("y",-400/2).attr("class","pieTitleText");const N=[...f.entries()].map(([i,O])=>({label:i,value:O})),M=c.selectAll(".legend").data(N).enter().append("g").attr("class","legend").attr("transform",(i,O)=>{const L=n+u,G=L*N.length/2,_=12*n,q=O*L-G;return"translate("+_+","+q+")"});M.append("rect").attr("width",n).attr("height",n).style("fill",i=>k(i.label)).style("stroke",i=>k(i.label)),M.append("text").attr("x",n+u).attr("y",n-u).text(i=>o.getShowData()?`${i.label} [${i.value}]`:i.label);const j=Math.max(...M.selectAll("text").nodes().map(i=>(i==null?void 0:i.getBoundingClientRect().width)??0)),B=v+t+n+u+j;x.attr("viewBox",`0 0 ${B} ${d}`),te(x,d,B,l.useMaxWidth)},"draw"),De={draw:Ae},We={parser:ve,db:V,renderer:De,styles:Se};export{We as diagram};
