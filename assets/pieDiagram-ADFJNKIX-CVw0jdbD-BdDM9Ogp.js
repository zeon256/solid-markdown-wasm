import{p as u,$ as U,M as q,L as H,A as I,F as J,E as K,R,d as X,G as Y,a3 as Z,a5 as ee,y as te,B as ae,Q as ie,a6 as y,a7 as ne,a8 as O}from"./index-EvFfW_6K.js";import{m as re}from"./chunk-4BX2VUAB-BGPvTzTU-BSrdcege.js";import{j as le}from"./treemap-KMMF4GRG-BQu1KQqq-BxzQKUA8.js";import{h as G}from"./arc-DUFaZNjh-CkJ4XHPM.js";import{l as se}from"./ordinal-C4kwyI7I-DaIU-pNn.js";import"./solid-monaco-UmqbK_QA.js";import"./min-Bdw3L8_w-DNqxvqy3.js";import"./_baseUniq-Ct25NOJ9-BqPXUSUN.js";import"./init-DjUOC4st-DHuO7-vr.js";function oe(e,a){return a<e?-1:a>e?1:a>=e?0:NaN}function ce(e){return e}function pe(){var e=ce,a=oe,f=null,s=y(0),o=y(O),w=y(0);function l(t){var n,c=(t=ne(t)).length,d,v,x=0,p=new Array(c),r=new Array(c),m=+s.apply(this,arguments),$=Math.min(O,Math.max(-O,o.apply(this,arguments)-m)),h,C=Math.min(Math.abs($)/c,w.apply(this,arguments)),b=C*($<0?-1:1),g;for(n=0;n<c;++n)(g=r[p[n]=n]=+e(t[n],n,t))>0&&(x+=g);for(a!=null?p.sort(function(S,A){return a(r[S],r[A])}):f!=null&&p.sort(function(S,A){return f(t[S],t[A])}),n=0,v=x?($-c*b)/x:0;n<c;++n,m=h)d=p[n],g=r[d],h=m+(g>0?g*v:0)+b,r[d]={data:t[d],index:n,value:g,startAngle:m,endAngle:h,padAngle:C};return r}return l.value=function(t){return arguments.length?(e=typeof t=="function"?t:y(+t),l):e},l.sortValues=function(t){return arguments.length?(a=t,f=null,l):a},l.sort=function(t){return arguments.length?(f=t,a=null,l):f},l.startAngle=function(t){return arguments.length?(s=typeof t=="function"?t:y(+t),l):s},l.endAngle=function(t){return arguments.length?(o=typeof t=="function"?t:y(+t),l):o},l.padAngle=function(t){return arguments.length?(w=typeof t=="function"?t:y(+t),l):w},l}var ue=ie.pie,z={sections:new Map,showData:!1},D=z.sections,B=z.showData,de=structuredClone(ue),ge=u(()=>structuredClone(de),"getConfig"),fe=u(()=>{D=new Map,B=z.showData,ae()},"clear"),me=u(({label:e,value:a})=>{if(a<0)throw new Error(`"${e}" has invalid value: ${a}. Negative values are not allowed in pie charts. All slice values must be >= 0.`);D.has(e)||(D.set(e,a),R.debug(`added new section: ${e}, with value: ${a}`))},"addSection"),he=u(()=>D,"getSections"),xe=u(e=>{B=e},"setShowData"),ye=u(()=>B,"getShowData"),P={getConfig:ge,clear:fe,setDiagramTitle:K,getDiagramTitle:J,setAccTitle:I,getAccTitle:H,setAccDescription:q,getAccDescription:U,addSection:me,getSections:he,setShowData:xe,getShowData:ye},we=u((e,a)=>{re(e,a),a.setShowData(e.showData),e.sections.map(a.addSection)},"populateDb"),ve={parse:u(async e=>{const a=await le("pie",e);R.debug(a),we(a,P)},"parse")},$e=u(e=>`
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
`,"getStyles"),Se=$e,Ae=u(e=>{const a=[...e.values()].reduce((s,o)=>s+o,0),f=[...e.entries()].map(([s,o])=>({label:s,value:o})).filter(s=>s.value/a*100>=1).sort((s,o)=>o.value-s.value);return pe().value(s=>s.value)(f)},"createPieArcs"),Ce=u((e,a,f,s)=>{R.debug(`rendering pie chart
`+e);const o=s.db,w=X(),l=Y(o.getConfig(),w.pie),t=40,n=18,c=4,d=450,v=d,x=Z(a),p=x.append("g");p.attr("transform","translate("+v/2+","+d/2+")");const{themeVariables:r}=w;let[m]=ee(r.pieOuterStrokeWidth);m??(m=2);const $=l.textPosition,h=Math.min(v,d)/2-t,C=G().innerRadius(0).outerRadius(h),b=G().innerRadius(h*$).outerRadius(h*$);p.append("circle").attr("cx",0).attr("cy",0).attr("r",h+m/2).attr("class","pieOuterCircle");const g=o.getSections(),S=Ae(g),A=[r.pie1,r.pie2,r.pie3,r.pie4,r.pie5,r.pie6,r.pie7,r.pie8,r.pie9,r.pie10,r.pie11,r.pie12];let T=0;g.forEach(i=>{T+=i});const E=S.filter(i=>(i.data.value/T*100).toFixed(0)!=="0"),k=se(A);p.selectAll("mySlices").data(E).enter().append("path").attr("d",C).attr("fill",i=>k(i.data.label)).attr("class","pieCircle"),p.selectAll("mySlices").data(E).enter().append("text").text(i=>(i.data.value/T*100).toFixed(0)+"%").attr("transform",i=>"translate("+b.centroid(i)+")").style("text-anchor","middle").attr("class","slice"),p.append("text").text(o.getDiagramTitle()).attr("x",0).attr("y",-400/2).attr("class","pieTitleText");const L=[...g.entries()].map(([i,F])=>({label:i,value:F})),M=p.selectAll(".legend").data(L).enter().append("g").attr("class","legend").attr("transform",(i,F)=>{const N=n+c,j=N*L.length/2,_=12*n,Q=F*N-j;return"translate("+_+","+Q+")"});M.append("rect").attr("width",n).attr("height",n).style("fill",i=>k(i.label)).style("stroke",i=>k(i.label)),M.append("text").attr("x",n+c).attr("y",n-c).text(i=>o.getShowData()?`${i.label} [${i.value}]`:i.label);const V=Math.max(...M.selectAll("text").nodes().map(i=>(i==null?void 0:i.getBoundingClientRect().width)??0)),W=v+t+n+c+V;x.attr("viewBox",`0 0 ${W} ${d}`),te(x,d,W,l.useMaxWidth)},"draw"),be={draw:Ce},Ee={parser:ve,db:P,renderer:be,styles:Se};export{Ee as diagram};
