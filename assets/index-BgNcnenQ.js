import{c as A,o as $e,a as Me,t as B,i as S,m as Z,b as p,u as G,d as R,e as Q,S as Se,f as J,r as P,g as I,s as qe,h as ze,D as Ae,F as K,j as Pe,M as Oe,k as Ne}from"./solid-monaco-FpBXto3M.js";(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))o(t);new MutationObserver(t=>{for(const d of t)if(d.type==="childList")for(const l of d.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&o(l)}).observe(document,{childList:!0,subtree:!0});function r(t){const d={};return t.integrity&&(d.integrity=t.integrity),t.referrerPolicy&&(d.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?d.credentials="include":t.crossOrigin==="anonymous"?d.credentials="omit":d.credentials="same-origin",d}function o(t){if(t.ep)return;t.ep=!0;const d=r(t);fetch(t.href,d)}})();let E;function Ie(e,n){return e=e>>>0,Re(e,n)}let F=null;function j(){return(F===null||F.byteLength===0)&&(F=new Uint8Array(E.memory.buffer)),F}function Be(e,n,r){if(r===void 0){const f=W.encode(e),m=n(f.length,1)>>>0;return j().subarray(m,m+f.length).set(f),ee=f.length,m}let o=e.length,t=n(o,1)>>>0;const d=j();let l=0;for(;l<o;l++){const f=e.charCodeAt(l);if(f>127)break;d[t+l]=f}if(l!==o){l!==0&&(e=e.slice(l)),t=r(t,o,o=l+e.length*3,1)>>>0;const f=j().subarray(t+l,t+o),m=W.encodeInto(e,f);l+=m.written,t=r(t,o,l,1)>>>0}return ee=l,t}let U=new TextDecoder("utf-8",{ignoreBOM:!0,fatal:!0});U.decode();const De=2146435072;let Y=0;function Re(e,n){return Y+=n,Y>=De&&(U=new TextDecoder("utf-8",{ignoreBOM:!0,fatal:!0}),U.decode(),Y=n),U.decode(j().subarray(e,e+n))}const W=new TextEncoder;"encodeInto"in W||(W.encodeInto=function(e,n){const r=W.encode(e);return n.set(r),{read:e.length,written:r.length}});let ee=0;const Fe=["1337","OneHalfDark","OneHalfLight","Tomorrow","agola-dark","ascetic-white","axar","ayu-dark","ayu-light","ayu-mirage","base16-atelierdune-light","base16-ocean-dark","base16-ocean-light","bbedit","boron","charcoal","cheerfully-light","classic-modified","demain","dimmed-fluid","dracula","gray-matter-dark","green","gruvbox-dark","gruvbox-light","idle","inspired-github","ir-white","kronuz","material-dark","material-light","monokai","nord","nyx-bold","one-dark","railsbase16-green-screen-dark","solarized-dark","solarized-light","subway-madrid","subway-moscow","two-dark","visual-studio-dark","zenburn"];function We(e,n){let r,o;try{const t=Be(e,E.__wbindgen_malloc,E.__wbindgen_realloc),d=ee,l=E.render_md(t,d,(Fe.indexOf(n)+1||44)-1);return r=l[0],o=l[1],Ie(l[0],l[1])}finally{E.__wbindgen_free(r,o,1)}}const He=new Set(["basic","cors","default"]);async function je(e,n){if(typeof Response=="function"&&e instanceof Response){if(typeof WebAssembly.instantiateStreaming=="function")try{return await WebAssembly.instantiateStreaming(e,n)}catch(o){if(e.ok&&He.has(e.type)&&e.headers.get("Content-Type")!=="application/wasm")console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n",o);else throw o}const r=await e.arrayBuffer();return await WebAssembly.instantiate(r,n)}else{const r=await WebAssembly.instantiate(e,n);return r instanceof WebAssembly.Instance?{instance:r,module:e}:r}}function Ue(){const e={};return e.wbg={},e.wbg.__wbindgen_init_externref_table=function(){const n=E.__wbindgen_externrefs,r=n.grow(4);n.set(0,void 0),n.set(r+0,void 0),n.set(r+1,null),n.set(r+2,!0),n.set(r+3,!1)},e}function Xe(e,n){return E=e.exports,Te.__wbindgen_wasm_module=n,F=null,E.__wbindgen_start(),E}async function Te(e){if(E!==void 0)return E;typeof e<"u"&&(Object.getPrototypeOf(e)===Object.prototype?{module_or_path:e}=e:console.warn("using deprecated parameters for the initialization function; pass a single object instead")),typeof e>"u"&&(e=new URL("/assets/markdown_renderer_bg.wasm?url",import.meta.url).href);const n=Ue();(typeof e=="string"||typeof Request=="function"&&e instanceof Request||typeof URL=="function"&&e instanceof URL)&&(e=fetch(e));const{instance:r,module:o}=await je(await e,n);return Xe(r,o)}/**
* @license lucide-solid v0.562.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/var Ve={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":2,"stroke-linecap":"round","stroke-linejoin":"round"},O=Ve,Ge=B("<svg>"),ye=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),Ye=e=>e.replace(/^([A-Z])|[\s-_]+(\w)/g,(n,r,o)=>o?o.toUpperCase():r.toLowerCase()),Ze=e=>{const n=Ye(e);return n.charAt(0).toUpperCase()+n.slice(1)},Qe=(...e)=>e.filter((n,r,o)=>!!n&&n.trim()!==""&&o.indexOf(n)===r).join(" ").trim(),Je=e=>{const[n,r]=qe(e,["color","size","strokeWidth","children","class","name","iconNode","absoluteStrokeWidth"]);return(()=>{var o=Ge();return ze(o,I(O,{get width(){return n.size??O.width},get height(){return n.size??O.height},get stroke(){return n.color??O.stroke},get"stroke-width"(){return Z(()=>!!n.absoluteStrokeWidth)()?Number(n.strokeWidth??O["stroke-width"])*24/Number(n.size):Number(n.strokeWidth??O["stroke-width"])},get class(){return Qe("lucide","lucide-icon",...n.name!=null?[`lucide-${ye(Ze(n.name))}`,`lucide-${ye(n.name)}`]:[],n.class!=null?n.class:"")}},r),!0,!0),S(o,p(K,{get each(){return n.iconNode},children:([t,d])=>p(Ae,I({component:t},d))})),o})()},X=Je,Ke=[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]],en=e=>p(X,I(e,{iconNode:Ke,name:"check"})),nn=en,tn=[["path",{d:"m7 20 5-5 5 5",key:"13a0gw"}],["path",{d:"m7 4 5 5 5-5",key:"1kwcof"}]],an=e=>p(X,I(e,{iconNode:tn,name:"chevrons-down-up"})),we=an,rn=[["path",{d:"m7 15 5 5 5-5",key:"1hf1tw"}],["path",{d:"m7 9 5-5 5 5",key:"sgt6xg"}]],on=e=>p(X,I(e,{iconNode:rn,name:"chevrons-up-down"})),sn=on,ln=[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]],dn=e=>p(X,I(e,{iconNode:ln,name:"copy"})),xe=dn,cn=B("<div><div></div><div>"),ve=B("<div>");const N=16,un=e=>{let n=0;for(let r=0;r<e.length;r++){const o=e.charCodeAt(r);n=(n<<5)-n+o,n=n&n}return`iframe_${Math.abs(n).toString(36)}`},mn=e=>{const n=e.match(/width=["']?(\d+(?:px|%)?)/i),r=e.match(/height=["']?(\d+(?:px|%)?)/i),o=n?/^\d+$/.test(n[1])?`${n[1]}px`:n[1]:null,t=r?/^\d+$/.test(r[1])?`${r[1]}px`:r[1]:null;return{width:o,height:t}},fn=e=>{const n=new Map,r=/<iframe[^>]*src="([^"]*)"[^>]*>.*?<\/iframe>/gi,o=new Map;return{html:e.replace(r,(t,d)=>{const l=o.get(d)||0;o.set(d,l+1);const f=`${un(d)}_${l}`,{width:m,height:$}=mn(t);n.set(f,{html:t,src:d,width:m,height:$});const v=[m?`width:${m}`:"",$?`height:${$}`:""].filter(Boolean).join(";"),C=v?` style="${v}"`:"";return`<div data-iframe-id="${f}" class="iframe-placeholder"${C}></div>`}),iframes:n}},hn=e=>{const[n,r]=A(""),[o,t]=A(!0),[d,l]=A(null),f=new Map;let m,$,v,C;const D=()=>{if(!m||!v||!$)return;const u=$.getBoundingClientRect();for(const[s,a]of f){const c=m.querySelector(`[data-iframe-id="${s}"]`);if(c){const h=c.getBoundingClientRect();a.wrapper.style.position="absolute",a.wrapper.style.left=`${h.left-u.left}px`,a.wrapper.style.top=`${h.top-u.top}px`,a.wrapper.style.width=`${h.width}px`,a.wrapper.style.height=`${h.height}px`,a.wrapper.style.display="block"}else a.wrapper.style.display="none"}},q=[],H=()=>{if(!m)return;const u=m.querySelectorAll(".code-block-header");for(const s of u){if(s.querySelector(".code-block-copy"))continue;const a=document.createElement("div");a.className="code-block-buttons";const c=document.createElement("button");c.className="code-block-collapse",c.setAttribute("aria-label","Collapse code");const h=P(()=>p(we,{size:N}),c);q.push(h),a.appendChild(c);const y=document.createElement("button");y.className="code-block-copy",y.setAttribute("aria-label","Copy code");const x=P(()=>p(xe,{size:N}),y);q.push(x),a.appendChild(y),s.appendChild(a)}},w=u=>{const s=u.target;if(!(m!=null&&m.contains(s)))return;const a=s.closest(".code-block-collapse");if(a){u.stopPropagation();const h=a.closest(".code-block-wrapper");if(!h)return;const y=h.classList.toggle("collapsed");if(a.textContent="",y){const x=P(()=>p(sn,{size:N}),a);q.push(x),a.setAttribute("aria-label","Expand code")}else{const x=P(()=>p(we,{size:N}),a);q.push(x),a.setAttribute("aria-label","Collapse code")}return}const c=s.closest(".code-block-copy");if(c){u.stopPropagation();const h=c.closest(".code-block-wrapper");if(!h)return;const y=h.querySelector("code");if(!y)return;const x=y.textContent||"";navigator.clipboard.writeText(x).then(()=>{c.textContent="";const k=P(()=>p(nn,{size:N}),c);q.push(k),c.classList.add("copied"),setTimeout(()=>{c.textContent="";const g=P(()=>p(xe,{size:N}),c);q.push(g),c.classList.remove("copied")},2e3)}).catch(k=>{console.error("Failed to copy code:",k)})}};return $e(async()=>{var u;document.addEventListener("click",w),C=new ResizeObserver(()=>{D()});const s=()=>D();window.addEventListener("scroll",s,!0),t(!0);try{const a=await Te();console.debug(a)}catch(a){console.error("Error initializing WASM:",a),l(`Failed to initialize WASM: ${a}`)}finally{t(!1),console.debug("Loaded WASM successfully"),(u=e.onLoaded)==null||u.call(e)}J(()=>{document.removeEventListener("click",w),window.removeEventListener("scroll",s,!0),C==null||C.disconnect();for(const a of q)a()})}),Me(()=>{const u=e.markdown,s=e.theme??"one-dark";if(!o()){const a=performance.now();console.log("[MarkdownRenderer] Rendering with theme:",s);const c=We(u,s),{html:h,iframes:y}=fn(c),x=new Set;if(v)for(const[g,b]of y){x.add(g);const L=f.get(g);if(L)L.src!==b.src?(console.debug("[iframe-cache] Src changed for:",g),L.iframe.src=b.src,L.src=b.src):console.debug("[iframe-cache] Reusing existing iframe:",g);else{console.debug("[iframe-cache] Creating new iframe:",g);const _=document.createElement("div");_.className="iframe-overlay-wrapper",_.style.position="absolute",_.style.display="none",_.style.pointerEvents="auto";const M=document.createElement("div");M.innerHTML=b.html;const z=M.firstElementChild;z&&(z.style.width="100%",z.style.height="100%",z.style.border="none",_.appendChild(z),v.appendChild(_),f.set(g,{iframe:z,wrapper:_,src:b.src,width:b.width,height:b.height}))}}for(const[g,b]of f)x.has(g)||(console.debug("[iframe-cache] Removing unused iframe:",g),b.wrapper.remove(),f.delete(g));r(h),queueMicrotask(()=>{if(!m)return;const g=m.querySelectorAll(".code-block-wrapper");for(const b of g){const L=b.querySelector(".code-lang-data"),_=b.querySelector(".code-block-language");if(L&&_){const M=L.getAttribute("data-lang");M&&(_.textContent=M)}}H(),C&&m&&(C.disconnect(),C.observe(m)),D(),console.debug("[iframe-cache] Cache after update:",[...f.keys()])});const k=performance.now();console.debug(`Time taken: ${k-a}`)}}),(()=>{var u=ve();return S(u,(()=>{var s=Z(()=>!!d());return()=>s()&&(()=>{var a=ve();return a.style.setProperty("color","red"),S(a,d),a})()})(),null),S(u,p(Se,{get when(){return Z(()=>!o())()&&!d()},get fallback(){return e.fallback},get children(){var s=cn(),a=s.firstChild,c=a.nextSibling,h=$;typeof h=="function"?G(h,s):$=s,s.style.setProperty("position","relative");var y=v;typeof y=="function"?G(y,a):v=a,a.style.setProperty("position","absolute"),a.style.setProperty("top","0"),a.style.setProperty("left","0"),a.style.setProperty("width","100%"),a.style.setProperty("pointer-events","none"),a.style.setProperty("z-index","10"),a.style.setProperty("overflow","visible");var x=m;return typeof x=="function"?G(x,c):m=c,c.style.setProperty("position","relative"),R(k=>{var g=e.class,b=n();return g!==k.e&&Q(s,k.e=g),b!==k.t&&(c.innerHTML=k.t=b),k},{e:void 0,t:void 0}),s}}),null),u})()},gn="/assets/haxiom-B8CuNmdl.svg",ke=`# Markdown syntax guide 🔥🔥🔥🔥

> You are using [solid-markdown-wasm (github)](https://github.com/zeon256/solid-markdown-wasm). 

## Blockquotes

> [!NOTE]
> This is an informational blockquote. $x+3$

> [!TIP]
> This is a tip blockquote.

> [!IMPORTANT]
> This is an important blockquote.

> [!WARNING]
> This is a warning blockquote.

> [!CAUTION]
> This is a caution blockquote.


> Markdown is a lightweight markup language with plain-text-formatting syntax, created in 2004 by John Gruber with Aaron Swartz.
>
>> Markdown is often used to format readme files, for writing messages in online discussion forums, and to create rich text using a plain text editor.

## Blocks of code

\`\`\`javascript
let message = 'Hello world';
alert(message);
\`\`\`

\`\`\`cpp
#include <iostream>
#include <vector>
 
auto main() -> int {
    std::vector<int> v = {8, 4, 5, 9};
 
    v.emplace_back(6);
    v.emplace_back(9);
 
    v[2] = -1;
 
    for (int n : v)
        std::cout << n << ' ';
    std::cout << '\\n';
}
\`\`\`

## Headers

# This is a Heading h1
## This is a Heading h2
###### This is a Heading h6

## Emphasis

*This text will be italic*  
_This will also be italic_

**This text will be bold**  
__This will also be bold__

_You **can** combine them_

## Lists

### Unordered

* Item 1
* Item 2
* Item 2a
* Item 2b
    * Item 3a
    * Item 3b

### Ordered

1. Item 1
2. Item 2
3. Item 3
    1. Item 3a
    2. Item 3b

### Tasklist
- [x] Wake up
- [ ] Drink water
- [ ] Make lunch

## Images

![This is an alt text.](/images/tung.jpeg "This is a sample image.")

## Links

You are using [solid-markdown-wasm](https://github.com/zeon256/solid-markdown-wasm).

## Tables

| Left columns  | Right columns |
| ------------- |:-------------:|
| left foo      | right foo     |
| left bar      | right bar     |
| left baz      | right baz     |

## Iframes

<iframe width="560" height="315" src="https://www.youtube.com/embed/7chBqP8W60M?si=E6RrZfaeuMmZtosb" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## Inline code

This web site is using \`solid-markdown-wasm\`.

# 🔬 Typst Math in Markdown!

## 1. Complex Multi-line Equations

### Maxwell's Equations in Differential Form
\`\`\`math
nabla dot bold(E) &= rho / epsilon_0 \\
nabla dot bold(B) &= 0 \\
nabla times bold(E) &= -(diff bold(B)) / (diff t) \\
nabla times bold(B) &= mu_0 bold(J) + mu_0 epsilon_0 (diff bold(E)) / (diff t)
\`\`\`

### Schrödinger Equation with Hamiltonian
\`\`\`math
i planck.reduce (diff Psi(bold(r), t)) / (diff t) = hat(H) Psi(bold(r), t) = [-(planck.reduce^2) / (2m) nabla^2 + V(bold(r), t)] Psi(bold(r), t)
\`\`\`

## 2. Inline Math Mixed with Text

The quadratic formula $x = (-b plus.minus sqrt(b^2 - 4a c)) / (2a)$ gives us the roots. When $Delta = b^2 - 4a c > 0$, we have two distinct real roots. The golden ratio $phi = (1 + sqrt(5)) / 2 approx 1.618$ appears throughout nature.

Einstein's famous equation $E = m c^2$ shows mass-energy equivalence, where $c approx 3 times 10^8 "m/s"$.

## 3. Matrices and Determinants

### Rotation Matrix
\`\`\`math
bold(R)(theta) = mat(
  cos theta, -sin theta, 0;
  sin theta, cos theta, 0;
  0, 0, 1
)
\`\`\`

### Determinant with Absolute Value
\`\`\`math
det(bold(A)) = abs(mat(a, b; c, d)) = a d - b c
\`\`\`

## 4. Calculus Heavy

### Triple Integral with Limits
\`\`\`math
V = integral_0^(2pi) integral_0^pi integral_0^R r^2 sin(theta) dif r dif theta dif phi
\`\`\`

### Partial Differential Equation (Wave Equation)
\`\`\`math
(diff^2 u) / (diff t^2) = c^2 ((diff^2 u) / (diff x^2) + (diff^2 u) / (diff y^2) + (diff^2 u) / (diff z^2))
\`\`\`

### Limits and Series
\`\`\`math
lim_(n -> infinity) sum_(k=1)^n 1/k^2 = pi^2 / 6
\`\`\`

## 5. Greek Letters and Special Symbols
\`\`\`math
alpha, beta, gamma, Delta, epsilon, zeta, eta, Theta, iota, kappa, lambda, mu, nu, xi, Pi, rho, sigma, tau, upsilon, Phi, chi, psi, Omega
\`\`\`

### Set Theory
\`\`\`math
A subset.eq B, quad A union B, quad A sect B, quad A \\\\ B, quad A times B, quad emptyset, quad forall x in A, exists y in B
\`\`\`

## 6. Nested Fractions and Complex Expressions
\`\`\`math
x = a_0 + 1 / (a_1 + 1 / (a_2 + 1 / (a_3 + 1 / (a_4 + dots.h))))
\`\`\`
\`\`\`math
f(x) = (sqrt(x^2 + sqrt(x^4 + sqrt(x^8 + sqrt(x^16))))) / (1 + (x^2) / (1 + (x^4) / (1 + x^8)))
\`\`\`

## 7. Cases and Piecewise Functions
\`\`\`math
f(x) = cases(
  x^2 & "if" x >= 0,
  -x^2 & "if" x < 0,
  0 & "otherwise"
)
\`\`\`
\`\`\`math
abs(x) = cases(
  x & "if" x > 0,
  0 & "if" x = 0,
  -x & "if" x < 0
)
\`\`\`

## 8. Summations and Products

### Fourier Series
\`\`\`math
f(x) = a_0 / 2 + sum_(n=1)^infinity (a_n cos((n pi x) / L) + b_n sin((n pi x) / L))
\`\`\`

### Product Notation
\`\`\`math
product_(k=1)^n k = n! quad "and" quad product_(p "prime")^infinity (1 - 1/p^2)^(-1) = (pi^2) / 6
\`\`\`

## 9. Vectors and Tensor Notation
\`\`\`math
bold(v) = vec(v_1, v_2, v_3), quad bold(v) dot bold(w) = sum_(i=1)^3 v_i w_i, quad bold(v) times bold(w) = det(mat(
  bold(i), bold(j), bold(k);
  v_1, v_2, v_3;
  w_1, w_2, w_3
))
\`\`\`

## 10. Quantum Mechanics Notation

### Dirac Notation
\`\`\`math
angle.l psi bar.v hat(H) bar.v psi angle.r = integral_(-infinity)^infinity Psi^*(x) hat(H) Psi(x) dif x
\`\`\`

### Commutator
\`\`\`math
[hat(x), hat(p)] = hat(x) hat(p) - hat(p) hat(x) = i planck.reduce
\`\`\`

## 11. Statistical Distributions

### Normal Distribution
\`\`\`math
f(x | mu, sigma^2) = 1 / (sqrt(2 pi sigma^2)) e^(-(x - mu)^2 / (2 sigma^2))
\`\`\`

### Bayes' Theorem
\`\`\`math
P(A | B) = (P(B | A) P(A)) / (P(B)) = (P(B | A) P(A)) / (sum_(i=1)^n P(B | A_i) P(A_i))
\`\`\`

## 12. Mixed Content with Code

The algorithm runs in $O(n log n)$ time:
\`\`\`python
def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)
\`\`\`

Its recurrence relation is $T(n) = 2T(n/2) + O(n)$.

## 13. Large Operators and Underover
\`\`\`math
lim_(x -> 0) (sin x) / x = 1, quad 
sum_(i=1)^n i = (n(n+1)) / 2, quad
integral_a^b f(x) dif x = F(b) - F(a)
\`\`\`

## 14. Aligned Equations
\`\`\`math
x + y &= 5 \\
2x - y &= 1 \\
therefore x &= 2, y = 3
\`\`\`

## 15. Special Functions

### Gamma and Beta Functions
\`\`\`math
Gamma(z) = integral_0^infinity t^(z-1) e^(-t) dif t, quad 
Beta(p, q) = integral_0^1 t^(p-1) (1-t)^(q-1) dif t
\`\`\`

## 16. Nested Lists with Math

1. **First Order ODE**: $(dif y) / (dif x) = f(x, y)$
   - Linear: $(dif y) / (dif x) + P(x)y = Q(x)$
   - Separable: $M(x) dif x = N(y) dif y$
   - Exact: $M(x,y) dif x + N(x,y) dif y = 0$ where $(diff M) / (diff y) = (diff N) / (diff x)$

2. **Second Order ODE**: $a (dif^2 y) / (dif x^2) + b (dif y) / (dif x) + c y = 0$
   - Characteristic equation: $a r^2 + b r + c = 0$

## 17. Tables with Math

| Distribution | PDF | Expected Value |
|--------------|-----|----------------|
| Uniform | $f(x) = 1/(b-a)$ | $E[X] = (a+b)/2$ |
| Exponential | $f(x) = lambda e^(-lambda x)$ | $E[X] = 1/lambda$ |
| Poisson | $P(X=k) = (lambda^k e^(-lambda))/(k!)$ | $E[X] = lambda$ |

## 18. Blockquotes with Math

> **Euler's Identity** is considered one of the most beautiful equations:
> 
> \`\`\`math
> e^(i pi) + 1 = 0
> \`\`\`
> 
> It connects five fundamental mathematical constants: $e$, $i$, $pi$, $1$, and $0$.

> [!WARNING]
> When $abs(z) < 1$, the geometric series converges: $sum_(n=0)^infinity z^n = 1/(1-z)$

## 19. Combining Everything

The **Cauchy-Riemann equations** for a complex function $f(z) = u(x,y) + i v(x,y)$:
\`\`\`math
(diff u) / (diff x) = (diff v) / (diff y) quad "and" quad (diff u) / (diff y) = -(diff v) / (diff x)
\`\`\`

When satisfied, $f$ is *holomorphic* and we can compute:

- Line integral: $integral_gamma f(z) dif z = 0$ for closed $gamma$
- Residue: $"Res"(f, z_0) = 1/(2pi i) integral_(abs(z-z_0)=r) f(z) dif z$

### Task List for Complex Analysis

- [x] Learn Cauchy integral theorem: $integral.cont f(z) dif z = 0$
- [x] Study Laurent series: $f(z) = sum_(n=-infinity)^infinity a_n (z-z_0)^n$
- [ ] Master residue theorem: $integral.cont f(z) dif z = 2pi i sum "residues inside" gamma$

## 20. Edge Cases and Advanced Features

### Derivatives with Primes
\`\`\`math
f'(x) = lim_(h -> 0) (f(x+h) - f(x))/h, quad f''(x), quad f'''(x), quad f^((n))(x)
\`\`\`

### Accents and Decorations
\`\`\`math
arrow(v), hat(x), tilde(y), overline(z), dot(x), dot.double(x), dot.triple(x), vec(x, y)
\`\`\`

Or if you want to show various vector notations:
\`\`\`math
arrow(v), hat(x), tilde(y), overline(z), dot(x), dot.double(x), dot.triple(x)
\`\`\`

Here are the key changes:
- \`macron(z)\` → \`overline(z)\` 
- \`ddot(x)\` → \`dot.double(x)\` (double dot accent)
- \`dddot(x)\` → \`dot.triple(x)\` (triple dot accent)
- \`vec(delim: #none, x, y)\` → \`vec(x, y)\` (remove the \`delim: #none\` parameter as that's not standard Typst math syntax)

Would you like me to generate a fully corrected version of the entire stress test with all Typst syntax errors fixed?

### Binomial Coefficients
\`\`\`math
binom(n, k) = (n!) / (k!(n-k)!) = binom(n, n-k)
\`\`\`

### Multiline Fractions
\`\`\`math
frac(
  sum_(i=1)^n x_i,
  n
) = macron(x)
\`\`\`

Multiple equations in one line: $a^2 + b^2 = c^2$, $E = mc^2$, $F = ma$.

---

**Final Challenge**: Can you render $sqrt(sum_(i=1)^n (x_i - macron(x))^2 / (n-1))$ inline while displaying:
\`\`\`math
hat(beta) = (bold(X)^top bold(X))^(-1) bold(X)^top bold(y)
\`\`\`

as a block? 🎯

## 21. Navier-Stokes
\`\`\`math
rho (diff bold(u)) / (diff t) + rho (bold(u) dot nabla) bold(u) = -nabla p + mu nabla^2 bold(u) + bold(f)
\`\`\`

## 22. Special Typst Features

### Floor and Ceiling
\`\`\`math
floor(x), ceil(x), round(x)
\`\`\`

### Norms
\`\`\`math
norm(bold(v)) = sqrt(sum_i v_i^2), quad norm(bold(v))_1 = sum_i abs(v_i), quad norm(bold(v))_infinity = max_i abs(v_i)
\`\`\`

### Underbrace and Overbrace
\`\`\`math
underbrace(1 + 2 + 3 + dots + n, "sum") = (n(n+1))/2
\`\`\`
\`\`\`math
overbrace(x + x + dots + x, n "times") = n x
\`\`\`
`;var bn=B('<div class="flex justify-center items-center h-full"><div class=spinner>'),pn=B('<div class="flex flex-col w-screen h-screen"><div class="flex items-center justify-between px-6 py-3 border-b"><div class="flex items-center gap-3"><img alt=Haxiom class="h-6 w-6"><span class=font-semibold>Haxiom</span><span>/</span><span>solid-markdown-wasm</span></div><div class="flex items-center gap-6"><div class="flex items-center gap-2"><label class="text-sm font-medium">Editor Theme:</label><select></select></div><div class="flex items-center gap-2"><label class="text-sm font-medium">Code Block Theme:</label><select></select></div><a href=https://haxiom.io target=_blank rel="noopener noreferrer"class="text-sm font-medium px-3 py-1.5 rounded transition-colors text-black hover:opacity-80">Try Haxiom</a></div></div><div class="flex flex-1 overflow-hidden"><div class="w-1/2 flex flex-col m-4"></div><div class="w-1/2 flex flex-col"><div class="m-0 h-full shadow-sm overflow-y-auto p-4 px-6">'),_e=B("<option>");const yn=["1337","OneHalfDark","OneHalfLight","Tomorrow","agola-dark","ascetic-white","axar","ayu-dark","ayu-light","ayu-mirage","base16-atelierdune-light","base16-ocean-dark","base16-ocean-light","bbedit","boron","charcoal","cheerfully-light","classic-modified","demain","dimmed-fluid","dracula","gray-matter-dark","green","gruvbox-dark","gruvbox-light","idle","inspired-github","ir-white","kronuz","material-dark","material-light","monokai","nord","nyx-bold","one-dark","railsbase16-green-screen-dark","solarized-dark","solarized-light","subway-madrid","subway-moscow","two-dark","visual-studio-dark","zenburn"],wn=[{value:"vs",label:"Light"},{value:"vs-dark",label:"Dark"},{value:"hc-black",label:"High Contrast"}],xn=()=>bn(),vn=()=>{const[e,n]=A(""),[r,o]=A(""),[t,d]=A(window.matchMedia("(prefers-color-scheme: dark)").matches),[l,f]=A(window.matchMedia("(prefers-color-scheme: dark)").matches?"ayu-dark":"ayu-light"),[m,$]=A(window.matchMedia("(prefers-color-scheme: dark)").matches?"vs-dark":"vs");let v;const C=w=>{v!==void 0&&clearTimeout(v);const u=w.length>1e5?50:0;v=setTimeout(()=>{o(w)},u)},D=w=>{n(w),C(w)};$e(async()=>{try{n(ke),o(ke)}catch(s){console.error("Failed to load initial markdown:",s)}const w=window.matchMedia("(prefers-color-scheme: dark)"),u=s=>{d(s.matches),f(s.matches?"ayu-dark":"ayu-light"),$(s.matches?"vs-dark":"vs")};w.addEventListener("change",u),J(()=>{w.removeEventListener("change",u)})}),J(()=>{v!==void 0&&clearTimeout(v)});const q=()=>({fontFamily:"'Iosevka', monospace",fontSize:22,theme:m()}),H=()=>`px-3 py-1.5 rounded border text-sm font-medium cursor-pointer ${t()?"bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600":"bg-white border-gray-300 text-gray-700 hover:bg-gray-50"}`;return(()=>{var w=pn(),u=w.firstChild,s=u.firstChild,a=s.firstChild,c=a.nextSibling,h=c.nextSibling,y=h.nextSibling,x=s.nextSibling,k=x.firstChild,g=k.firstChild,b=g.nextSibling,L=k.nextSibling,_=L.firstChild,M=_.nextSibling,z=L.nextSibling,Ee=u.nextSibling,ne=Ee.firstChild,V=ne.nextSibling,Ce=V.firstChild;return Pe(a,"src",gn),b.addEventListener("change",i=>$(i.currentTarget.value)),S(b,p(K,{each:wn,children:i=>(()=>{var T=_e();return S(T,()=>i.label),R(()=>T.value=i.value),T})()})),M.addEventListener("change",i=>f(i.currentTarget.value)),S(M,p(K,{each:yn,children:i=>(()=>{var T=_e();return T.value=i,S(T,i),T})()})),z.style.setProperty("background-color","#6fffe9"),S(ne,p(Oe,{language:"markdown",get options(){return q()},get value(){return e()},onChange:(i,T)=>{D(i)}})),S(Ce,p(hn,{get markdown(){return r()},get theme(){return l()},class:"markdown-body",get fallback(){return p(xn,{})},onLoaded:()=>console.log("WASM Loaded")})),R(i=>{var T=!!t(),te=!t(),Le={"bg-black border-gray-700":t(),"bg-gray-100 border-gray-200":!t()},ie=!!t(),ae=!!t(),re=!t(),oe=!!t(),se=!t(),le=!!t(),de=!t(),ce=!!t(),ue=!t(),me=H(),fe=!!t(),he=!t(),ge=H(),be=!!t(),pe=!t();return T!==i.e&&w.classList.toggle("bg-[#1e1e1e]",i.e=T),te!==i.t&&w.classList.toggle("bg-white",i.t=te),i.a=Ne(u,Le,i.a),ie!==i.o&&a.classList.toggle("invert",i.o=ie),ae!==i.i&&c.classList.toggle("text-white",i.i=ae),re!==i.n&&c.classList.toggle("text-gray-900",i.n=re),oe!==i.s&&h.classList.toggle("text-gray-500",i.s=oe),se!==i.h&&h.classList.toggle("text-gray-400",i.h=se),le!==i.r&&y.classList.toggle("text-gray-400",i.r=le),de!==i.d&&y.classList.toggle("text-gray-500",i.d=de),ce!==i.l&&g.classList.toggle("text-gray-300",i.l=ce),ue!==i.u&&g.classList.toggle("text-gray-700",i.u=ue),me!==i.c&&Q(b,i.c=me),fe!==i.w&&_.classList.toggle("text-gray-300",i.w=fe),he!==i.m&&_.classList.toggle("text-gray-700",i.m=he),ge!==i.f&&Q(M,i.f=ge),be!==i.y&&V.classList.toggle("bg-[#0d1117]",i.y=be),pe!==i.g&&V.classList.toggle("bg-white",i.g=pe),i},{e:void 0,t:void 0,a:void 0,o:void 0,i:void 0,n:void 0,s:void 0,h:void 0,r:void 0,d:void 0,l:void 0,u:void 0,c:void 0,w:void 0,m:void 0,f:void 0,y:void 0,g:void 0}),R(()=>b.value=m()),R(()=>M.value=l()),w})()},kn=document.getElementById("root");P(()=>p(vn,{}),kn);
