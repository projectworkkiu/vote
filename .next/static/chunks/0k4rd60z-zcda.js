(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,18566,(e,t,i)=>{t.exports=e.r(76562)},88653,e=>{"use strict";e.i(47167);var t=e.i(43476),i=e.i(71645),n=e.i(31178),r=e.i(47414),a=e.i(74008),s=e.i(21476),o=e.i(72846),l=i,d=e.i(37806);function c(e,t){if("function"==typeof e)return e(t);null!=e&&(e.current=t)}class h extends l.Component{getSnapshotBeforeUpdate(e){let t=this.props.childRef.current;if((0,o.isHTMLElement)(t)&&e.isPresent&&!this.props.isPresent&&!1!==this.props.pop){let e=t.offsetParent,i=(0,o.isHTMLElement)(e)&&e.offsetWidth||0,n=(0,o.isHTMLElement)(e)&&e.offsetHeight||0,r=getComputedStyle(t),a=this.props.sizeRef.current;a.height=parseFloat(r.height),a.width=parseFloat(r.width),a.top=t.offsetTop,a.left=t.offsetLeft,a.right=i-a.width-a.left,a.bottom=n-a.height-a.top}return null}componentDidUpdate(){}render(){return this.props.children}}function m({children:e,isPresent:n,anchorX:r,anchorY:a,root:s,pop:o}){let u=(0,l.useId)(),p=(0,l.useRef)(null),f=(0,l.useRef)({width:0,height:0,top:0,left:0,right:0,bottom:0}),{nonce:x}=(0,l.useContext)(d.MotionConfigContext),g=function(...e){return i.useCallback(function(...e){return t=>{let i=!1,n=e.map(e=>{let n=c(e,t);return i||"function"!=typeof n||(i=!0),n});if(i)return()=>{for(let t=0;t<n.length;t++){let i=n[t];"function"==typeof i?i():c(e[t],null)}}}}(...e),e)}(p,e.props?.ref??e?.ref);return(0,l.useInsertionEffect)(()=>{let{width:e,height:t,top:i,left:l,right:d,bottom:c}=f.current;if(n||!1===o||!p.current||!e||!t)return;let h="left"===r?`left: ${l}`:`right: ${d}`,m="bottom"===a?`bottom: ${c}`:`top: ${i}`;p.current.dataset.motionPopId=u;let g=document.createElement("style");x&&(g.nonce=x);let b=s??document.head;return b.appendChild(g),g.sheet&&g.sheet.insertRule(`
          [data-motion-pop-id="${u}"] {
            position: absolute !important;
            width: ${e}px !important;
            height: ${t}px !important;
            ${h}px !important;
            ${m}px !important;
          }
        `),()=>{p.current?.removeAttribute("data-motion-pop-id"),b.contains(g)&&b.removeChild(g)}},[n]),(0,t.jsx)(h,{isPresent:n,childRef:p,sizeRef:f,pop:o,children:!1===o?e:l.cloneElement(e,{ref:g})})}let u=({children:e,initial:n,isPresent:a,onExitComplete:o,custom:l,presenceAffectsLayout:d,mode:c,anchorX:h,anchorY:u,root:f})=>{let x=(0,r.useConstant)(p),g=(0,i.useId)(),b=!0,v=(0,i.useMemo)(()=>(b=!1,{id:g,initial:n,isPresent:a,custom:l,onExitComplete:e=>{for(let t of(x.set(e,!0),x.values()))if(!t)return;o&&o()},register:e=>(x.set(e,!1),()=>x.delete(e))}),[a,x,o]);return d&&b&&(v={...v}),(0,i.useMemo)(()=>{x.forEach((e,t)=>x.set(t,!1))},[a]),i.useEffect(()=>{a||x.size||!o||o()},[a]),e=(0,t.jsx)(m,{pop:"popLayout"===c,isPresent:a,anchorX:h,anchorY:u,root:f,children:e}),(0,t.jsx)(s.PresenceContext.Provider,{value:v,children:e})};function p(){return new Map}var f=e.i(64978);let x=e=>e.key||"";function g(e){let t=[];return i.Children.forEach(e,e=>{(0,i.isValidElement)(e)&&t.push(e)}),t}e.s(["AnimatePresence",0,({children:e,custom:s,initial:o=!0,onExitComplete:l,presenceAffectsLayout:d=!0,mode:c="sync",propagate:h=!1,anchorX:m="left",anchorY:p="top",root:b})=>{let[v,y]=(0,f.usePresence)(h),j=(0,i.useMemo)(()=>g(e),[e]),k=h&&!v?[]:j.map(x),w=(0,i.useRef)(!0),M=(0,i.useRef)(j),C=(0,r.useConstant)(()=>new Map),L=(0,i.useRef)(new Set),[N,z]=(0,i.useState)(j),[E,S]=(0,i.useState)(j);(0,a.useIsomorphicLayoutEffect)(()=>{w.current=!1,M.current=j;for(let e=0;e<E.length;e++){let t=x(E[e]);k.includes(t)?(C.delete(t),L.current.delete(t)):!0!==C.get(t)&&C.set(t,!1)}},[E,k.length,k.join("-")]);let P=[];if(j!==N){let e=[...j];for(let t=0;t<E.length;t++){let i=E[t],n=x(i);k.includes(n)||(e.splice(t,0,i),P.push(i))}return"wait"===c&&P.length&&(e=P),S(g(e)),z(j),null}let{forceRender:R}=(0,i.useContext)(n.LayoutGroupContext);return(0,t.jsx)(t.Fragment,{children:E.map(e=>{let i=x(e),n=(!h||!!v)&&(j===E||k.includes(i));return(0,t.jsx)(u,{isPresent:n,initial:(!w.current||!!o)&&void 0,custom:s,presenceAffectsLayout:d,mode:c,root:b,onExitComplete:n?void 0:()=>{if(L.current.has(i)||!C.has(i))return;L.current.add(i),C.set(i,!0);let e=!0;C.forEach(t=>{t||(e=!1)}),e&&(R?.(),S(M.current),h&&y?.(),l&&l())},anchorX:m,anchorY:p,children:e},i)})})}],88653)},74732,e=>{"use strict";var t=e.i(43476),i=e.i(71645),n=e.i(18566);e.s(["default",0,function(){let e=(0,n.useRouter)(),[r,a]=(0,i.useState)(!0);return(0,i.useEffect)(()=>{"light"===localStorage.getItem("theme")&&(document.documentElement.classList.add("light-mode"),a(!1))},[]),(0,t.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:"0.25rem"},children:[(0,t.jsx)("button",{onClick:()=>e.back(),className:"btn btn-sm btn-ghost",style:{padding:"0.4rem"},title:"Go Back",children:(0,t.jsxs)("svg",{width:"18",height:"18",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[(0,t.jsx)("line",{x1:"19",y1:"12",x2:"5",y2:"12"}),(0,t.jsx)("polyline",{points:"12 19 5 12 12 5"})]})}),(0,t.jsx)("button",{onClick:()=>e.forward(),className:"btn btn-sm btn-ghost",style:{padding:"0.4rem"},title:"Go Forward",children:(0,t.jsxs)("svg",{width:"18",height:"18",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[(0,t.jsx)("line",{x1:"5",y1:"12",x2:"19",y2:"12"}),(0,t.jsx)("polyline",{points:"12 5 19 12 12 19"})]})}),(0,t.jsxs)("button",{onClick:()=>{r?(document.documentElement.classList.add("light-mode"),localStorage.setItem("theme","light"),a(!1)):(document.documentElement.classList.remove("light-mode"),localStorage.setItem("theme","dark"),a(!0))},className:"btn btn-sm btn-secondary",style:{padding:"0.4rem 0.6rem",borderRadius:"2rem"},title:"Toggle Theme",children:[(0,t.jsx)("span",{className:"theme-label",children:r?"☀️ Light":"🌙 Dark"}),(0,t.jsx)("span",{className:"theme-icon",children:r?"☀️":"🌙"})]}),(0,t.jsx)("style",{children:`
        .theme-icon { display: none; }
        @media (max-width: 639px) {
          .theme-label { display: none; }
          .theme-icon { display: inline; }
        }
      `})]})}])},88760,e=>{"use strict";var t=e.i(43476),i=e.i(71645),n=e.i(18566),r=e.i(46932),a=e.i(88653),s=e.i(5766),o=e.i(74732);let l=[{href:"/admin/dashboard",label:"Dashboard",icon:"M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4"},{href:"/admin/elections",label:"Elections",icon:"M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"},{href:"/admin/candidates",label:"Candidates",icon:"M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"},{href:"/admin/students",label:"Students",icon:"M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"},{href:"/admin/results",label:"Results",icon:"M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"},{href:"/admin/voting-booth",label:"Voting Booth",icon:"M5 3a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2H5zm4 8l2 2 4-4m-9 8h14"},{href:"/admin/settings",label:"Settings",icon:"M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z"}];e.s(["default",0,function({children:e}){let d=(0,n.usePathname)(),c=(0,n.useRouter)(),[h,m]=(0,i.useState)(!1),u=async()=>{try{await fetch("/api/auth/logout",{method:"POST"}),s.default.success("Logged out"),c.push("/auth/login")}catch{s.default.error("Logout failed")}};return(0,t.jsxs)("div",{className:"admin-shell",children:[(0,t.jsx)(a.AnimatePresence,{children:h&&(0,t.jsx)(r.motion.div,{initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},onClick:()=>m(!1),className:"sidebar-overlay lg-hidden"})}),(0,t.jsxs)("aside",{className:`admin-sidebar sidebar-desktop ${h?"open":""}`,children:[(0,t.jsxs)("div",{className:"sidebar-brand",children:[(0,t.jsx)("div",{className:"sidebar-logo",children:(0,t.jsxs)("svg",{width:"18",height:"18",viewBox:"0 0 24 24",fill:"none",stroke:"white",strokeWidth:"2.5",strokeLinecap:"round",strokeLinejoin:"round",children:[(0,t.jsx)("path",{d:"M9 11l3 3L22 4"}),(0,t.jsx)("path",{d:"M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"})]})}),(0,t.jsxs)("div",{children:[(0,t.jsx)("h2",{style:{fontSize:"1rem",fontWeight:800},className:"gradient-text",children:"Smart Vote"}),(0,t.jsx)("p",{style:{fontSize:"0.6875rem",color:"var(--slate-500)"},children:"Admin Panel"})]})]}),(0,t.jsx)("nav",{className:"sidebar-nav",children:l.map(e=>{let i=d.startsWith(e.href);return(0,t.jsxs)("a",{href:e.href,onClick:t=>{t.preventDefault(),c.push(e.href),m(!1)},className:`sidebar-link ${i?"active":""}`,children:[(0,t.jsx)("svg",{width:"20",height:"20",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round",children:(0,t.jsx)("path",{d:e.icon})}),e.label,i&&(0,t.jsx)("div",{className:"sidebar-dot"})]},e.href)})}),(0,t.jsx)("div",{className:"sidebar-footer",children:(0,t.jsxs)("button",{onClick:u,className:"sidebar-link",children:[(0,t.jsx)("svg",{width:"20",height:"20",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round",children:(0,t.jsx)("path",{d:"M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"})}),"Logout"]})})]}),(0,t.jsxs)("main",{className:"admin-main main-with-sidebar",children:[(0,t.jsxs)("header",{className:"admin-topbar",children:[(0,t.jsx)("button",{onClick:()=>m(!h),className:"sidebar-toggle btn btn-ghost",style:{padding:"0.5rem"},children:(0,t.jsxs)("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[(0,t.jsx)("line",{x1:"3",y1:"12",x2:"21",y2:"12"}),(0,t.jsx)("line",{x1:"3",y1:"6",x2:"21",y2:"6"}),(0,t.jsx)("line",{x1:"3",y1:"18",x2:"21",y2:"18"})]})}),(0,t.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:"0.75rem",marginLeft:"auto"},children:[(0,t.jsx)(o.default,{}),(0,t.jsx)("div",{className:"admin-avatar",children:"A"})]})]}),(0,t.jsx)("div",{className:"admin-content",children:e})]}),(0,t.jsx)("style",{children:`
        .admin-shell { display: flex; min-height: 100vh; min-height: 100dvh; background: var(--slate-950); }

        /* Sidebar */
        .admin-sidebar {
          width: 260px; background: var(--slate-900); border-right: 1px solid var(--slate-800);
          display: flex; flex-direction: column; position: fixed; top: 0; bottom: 0;
          left: -260px; z-index: 50; transition: left 0.3s ease;
          overflow-y: auto; -webkit-overflow-scrolling: touch;
        }
        .admin-sidebar.open { left: 0; }
        .sidebar-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 40; }
        .sidebar-brand {
          padding: 1rem 1.25rem; border-bottom: 1px solid var(--slate-800);
          display: flex; align-items: center; gap: 0.75rem; flex-shrink: 0;
        }
        .sidebar-logo {
          width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
          background: linear-gradient(135deg, #059669, #10b981);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }
        .sidebar-nav { flex: 1; padding: 0.75rem; display: flex; flex-direction: column; gap: 0.125rem; }
        .sidebar-link {
          display: flex; align-items: center; gap: 0.75rem;
          padding: 0.625rem 0.875rem; border-radius: 0.5rem;
          font-size: 0.875rem; font-weight: 400; color: var(--slate-400);
          background: transparent; text-decoration: none; cursor: pointer;
          transition: all 0.2s; border: none; width: 100%; text-align: left;
          font-family: 'Inter', sans-serif; -webkit-tap-highlight-color: transparent;
        }
        .sidebar-link:hover { background: var(--slate-800); color: var(--slate-200); }
        .sidebar-link.active { font-weight: 600; color: var(--green-400); background: rgba(16, 185, 129, 0.1); }
        .sidebar-dot {
          width: 6px; height: 6px; border-radius: 50%; background: var(--green-400);
          margin-left: auto; box-shadow: 0 0 8px var(--green-400);
        }
        .sidebar-footer { padding: 0.75rem; border-top: 1px solid var(--slate-800); }

        /* Main area */
        .admin-main { flex: 1; min-width: 0; transition: margin 0.3s; }
        .admin-topbar {
          height: 56px; background: var(--slate-900); backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--slate-800);
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 var(--page-px); position: sticky; top: 0; z-index: 30;
        }
        .admin-avatar {
          width: 32px; height: 32px; border-radius: 50%;
          background: linear-gradient(135deg, #059669, #10b981);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.8125rem; font-weight: 700; color: white; flex-shrink: 0;
        }
        .admin-content {
          padding: var(--page-px);
          max-width: 1400px;
        }

        @media (min-width: 1024px) {
          .admin-sidebar { left: 0 !important; }
          .admin-main { margin-left: 260px !important; }
          .sidebar-toggle { display: none !important; }
          .lg-hidden { display: none !important; }
          .admin-topbar { height: 64px; }
        }
        @media (min-width: 1440px) {
          .admin-content { max-width: 1600px; margin: 0 auto; }
        }
      `})]})}])}]);