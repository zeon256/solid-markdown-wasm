import{p as f,G as w,a3 as C,y as v,R as x,A as P,L as F,E as z,F as E,$ as S,M as W,J as T,Q as D,B as A}from"./index-EvFfW_6K.js";import{m as L}from"./chunk-4BX2VUAB-BGPvTzTU-BSrdcege.js";import{j as M}from"./treemap-KMMF4GRG-BQu1KQqq-BxzQKUA8.js";import"./solid-monaco-UmqbK_QA.js";import"./min-Bdw3L8_w-DNqxvqy3.js";import"./_baseUniq-Ct25NOJ9-BqPXUSUN.js";var j=D.packet,u,m=(u=class{constructor(){this.packet=[],this.setAccTitle=P,this.getAccTitle=F,this.setDiagramTitle=z,this.getDiagramTitle=E,this.getAccDescription=S,this.setAccDescription=W}getConfig(){const t=w({...j,...T().packet});return t.showBits&&(t.paddingY+=10),t}getPacket(){return this.packet}pushWord(t){t.length>0&&this.packet.push(t)}clear(){A(),this.packet=[]}},f(u,"PacketDB"),u),R=1e4,Y=f((t,e)=>{L(t,e);let o=-1,r=[],l=1;const{bitsPerRow:n}=e.getConfig();for(let{start:a,end:s,bits:c,label:d}of t.blocks){if(a!==void 0&&s!==void 0&&s<a)throw new Error(`Packet block ${a} - ${s} is invalid. End must be greater than start.`);if(a??(a=o+1),a!==o+1)throw new Error(`Packet block ${a} - ${s??a} is not contiguous. It should start from ${o+1}.`);if(c===0)throw new Error(`Packet block ${a} is invalid. Cannot have a zero bit field.`);for(s??(s=a+(c??1)-1),c??(c=s-a+1),o=s,x.debug(`Packet block ${a} - ${o} with label ${d}`);r.length<=n+1&&e.getPacket().length<R;){const[p,i]=H({start:a,end:s,bits:c,label:d},l,n);if(r.push(p),p.end+1===l*n&&(e.pushWord(r),r=[],l++),!i)break;({start:a,end:s,bits:c,label:d}=i)}}e.pushWord(r)},"populate"),H=f((t,e,o)=>{if(t.start===void 0)throw new Error("start should have been set during first phase");if(t.end===void 0)throw new Error("end should have been set during first phase");if(t.start>t.end)throw new Error(`Block start ${t.start} is greater than block end ${t.end}.`);if(t.end+1<=e*o)return[t,void 0];const r=e*o-1,l=e*o;return[{start:t.start,end:r,label:t.label,bits:r-t.start},{start:l,end:t.end,label:t.label,bits:t.end-l}]},"getNextFittingBlock"),y={parser:{yy:void 0},parse:f(async t=>{var e;const o=await M("packet",t),r=(e=y.parser)==null?void 0:e.yy;if(!(r instanceof m))throw new Error("parser.parser?.yy was not a PacketDB. This is due to a bug within Mermaid, please report this issue at https://github.com/mermaid-js/mermaid/issues.");x.debug(o),Y(o,r)},"parse")},G=f((t,e,o,r)=>{const l=r.db,n=l.getConfig(),{rowHeight:a,paddingY:s,bitWidth:c,bitsPerRow:d}=n,p=l.getPacket(),i=l.getDiagramTitle(),b=a+s,h=b*(p.length+1)-(i?0:a),k=c*d+2,g=C(e);g.attr("viewbox",`0 0 ${k} ${h}`),v(g,h,k,n.useMaxWidth);for(const[$,B]of p.entries())I(g,B,$,n);g.append("text").text(i).attr("x",k/2).attr("y",h-b/2).attr("dominant-baseline","middle").attr("text-anchor","middle").attr("class","packetTitle")},"draw"),I=f((t,e,o,{rowHeight:r,paddingX:l,paddingY:n,bitWidth:a,bitsPerRow:s,showBits:c})=>{const d=t.append("g"),p=o*(r+n)+n;for(const i of e){const b=i.start%s*a+1,h=(i.end-i.start+1)*a-l;if(d.append("rect").attr("x",b).attr("y",p).attr("width",h).attr("height",r).attr("class","packetBlock"),d.append("text").attr("x",b+h/2).attr("y",p+r/2).attr("class","packetLabel").attr("dominant-baseline","middle").attr("text-anchor","middle").text(i.label),!c)continue;const k=i.end===i.start,g=p-2;d.append("text").attr("x",b+(k?h/2:0)).attr("y",g).attr("class","packetByte start").attr("dominant-baseline","auto").attr("text-anchor",k?"middle":"start").text(i.start),k||d.append("text").attr("x",b+h).attr("y",g).attr("class","packetByte end").attr("dominant-baseline","auto").attr("text-anchor","end").text(i.end)}},"drawWord"),N={draw:G},X={byteFontSize:"10px",startByteColor:"black",endByteColor:"black",labelColor:"black",labelFontSize:"12px",titleColor:"black",titleFontSize:"14px",blockStrokeColor:"black",blockStrokeWidth:"1",blockFillColor:"#efefef"},q=f(({packet:t}={})=>{const e=w(X,t);return`
	.packetByte {
		font-size: ${e.byteFontSize};
	}
	.packetByte.start {
		fill: ${e.startByteColor};
	}
	.packetByte.end {
		fill: ${e.endByteColor};
	}
	.packetLabel {
		fill: ${e.labelColor};
		font-size: ${e.labelFontSize};
	}
	.packetTitle {
		fill: ${e.titleColor};
		font-size: ${e.titleFontSize};
	}
	.packetBlock {
		stroke: ${e.blockStrokeColor};
		stroke-width: ${e.blockStrokeWidth};
		fill: ${e.blockFillColor};
	}
	`},"styles"),V={parser:y,get db(){return new m},renderer:N,styles:q};export{V as diagram};
