import{m as e}from"./index-D_y0GiL8.js";import{t}from"./chunk-4BX2VUAB-B9m3Qa-7-BQlqoP2J.js";import{t as n}from"./chunk-S3R3BYOJ-C-tVt2i5-DAmSYd7n.js";import{E as r,F as i,H as a,N as o,U as s,V as c,Y as l,et as u,k as d,v as f}from"./chunk-ABZYJK2D-bMRrxcPX-CgUke_8U.js";import{c as p,l as m}from"./src-iADVJDMk-Cv3e-mdz.js";import{n as h}from"./mermaid-parser.core-BmxuD2kc-CxnwLHq9.js";var g=a.packet,_=class{constructor(){this.packet=[],this.setAccTitle=i,this.getAccTitle=o,this.setDiagramTitle=u,this.getDiagramTitle=d,this.getAccDescription=l,this.setAccDescription=r}static{p(this,`PacketDB`)}getConfig(){let e=n({...g,...f().packet});return e.showBits&&(e.paddingY+=10),e}getPacket(){return this.packet}pushWord(e){e.length>0&&this.packet.push(e)}clear(){c(),this.packet=[]}},v=1e4,y=p((e,n)=>{t(e,n);let r=-1,i=[],a=1,{bitsPerRow:o}=n.getConfig();for(let{start:t,end:s,bits:c,label:l}of e.blocks){if(t!==void 0&&s!==void 0&&s<t)throw Error(`Packet block ${t} - ${s} is invalid. End must be greater than start.`);if(t??=r+1,t!==r+1)throw Error(`Packet block ${t} - ${s??t} is not contiguous. It should start from ${r+1}.`);if(c===0)throw Error(`Packet block ${t} is invalid. Cannot have a zero bit field.`);for(s??=t+(c??1)-1,c??=s-t+1,r=s,m.debug(`Packet block ${t} - ${r} with label ${l}`);i.length<=o+1&&n.getPacket().length<v;){let[e,r]=b({start:t,end:s,bits:c,label:l},a,o);if(i.push(e),e.end+1===a*o&&(n.pushWord(i),i=[],a++),!r)break;({start:t,end:s,bits:c,label:l}=r)}}n.pushWord(i)},`populate`),b=p((e,t,n)=>{if(e.start===void 0)throw Error(`start should have been set during first phase`);if(e.end===void 0)throw Error(`end should have been set during first phase`);if(e.start>e.end)throw Error(`Block start ${e.start} is greater than block end ${e.end}.`);if(e.end+1<=t*n)return[e,void 0];let r=t*n-1,i=t*n;return[{start:e.start,end:r,label:e.label,bits:r-e.start},{start:i,end:e.end,label:e.label,bits:e.end-i}]},`getNextFittingBlock`),x={parser:{yy:void 0},parse:p(async e=>{let t=await h(`packet`,e),n=x.parser?.yy;if(!(n instanceof _))throw Error(`parser.parser?.yy was not a PacketDB. This is due to a bug within Mermaid, please report this issue at https://github.com/mermaid-js/mermaid/issues.`);m.debug(t),y(t,n)},`parse`)},S=p((t,n,r,i)=>{let a=i.db,o=a.getConfig(),{rowHeight:c,paddingY:l,bitWidth:u,bitsPerRow:d}=o,f=a.getPacket(),p=a.getDiagramTitle(),m=c+l,h=m*(f.length+1)-(p?0:c),g=u*d+2,_=e(n);_.attr(`viewbox`,`0 0 ${g} ${h}`),s(_,h,g,o.useMaxWidth);for(let[e,t]of f.entries())C(_,t,e,o);_.append(`text`).text(p).attr(`x`,g/2).attr(`y`,h-m/2).attr(`dominant-baseline`,`middle`).attr(`text-anchor`,`middle`).attr(`class`,`packetTitle`)},`draw`),C=p((e,t,n,{rowHeight:r,paddingX:i,paddingY:a,bitWidth:o,bitsPerRow:s,showBits:c})=>{let l=e.append(`g`),u=n*(r+a)+a;for(let e of t){let t=e.start%s*o+1,n=(e.end-e.start+1)*o-i;if(l.append(`rect`).attr(`x`,t).attr(`y`,u).attr(`width`,n).attr(`height`,r).attr(`class`,`packetBlock`),l.append(`text`).attr(`x`,t+n/2).attr(`y`,u+r/2).attr(`class`,`packetLabel`).attr(`dominant-baseline`,`middle`).attr(`text-anchor`,`middle`).text(e.label),!c)continue;let a=e.end===e.start,d=u-2;l.append(`text`).attr(`x`,t+(a?n/2:0)).attr(`y`,d).attr(`class`,`packetByte start`).attr(`dominant-baseline`,`auto`).attr(`text-anchor`,a?`middle`:`start`).text(e.start),a||l.append(`text`).attr(`x`,t+n).attr(`y`,d).attr(`class`,`packetByte end`).attr(`dominant-baseline`,`auto`).attr(`text-anchor`,`end`).text(e.end)}},`drawWord`),w={draw:S},T={byteFontSize:`10px`,startByteColor:`black`,endByteColor:`black`,labelColor:`black`,labelFontSize:`12px`,titleColor:`black`,titleFontSize:`14px`,blockStrokeColor:`black`,blockStrokeWidth:`1`,blockFillColor:`#efefef`},E={parser:x,get db(){return new _},renderer:w,styles:p(({packet:e}={})=>{let t=n(T,e);return`
	.packetByte {
		font-size: ${t.byteFontSize};
	}
	.packetByte.start {
		fill: ${t.startByteColor};
	}
	.packetByte.end {
		fill: ${t.endByteColor};
	}
	.packetLabel {
		fill: ${t.labelColor};
		font-size: ${t.labelFontSize};
	}
	.packetTitle {
		fill: ${t.titleColor};
		font-size: ${t.titleFontSize};
	}
	.packetBlock {
		stroke: ${t.blockStrokeColor};
		stroke-width: ${t.blockStrokeWidth};
		fill: ${t.blockFillColor};
	}
	`},`styles`)};export{E as diagram};