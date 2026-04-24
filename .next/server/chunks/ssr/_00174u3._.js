module.exports=[62036,a=>{"use strict";var b=a.i(87924),c=a.i(72131),d=a.i(86723),e=a.i(74290);let f=c.useEffect;var g=a.i(14800),h=a.i(91128),i=c,j=a.i(65802);function k(a,b){if("function"==typeof a)return a(b);null!=a&&(a.current=b)}class l extends i.Component{getSnapshotBeforeUpdate(a){let b=this.props.childRef.current;if((0,h.isHTMLElement)(b)&&a.isPresent&&!this.props.isPresent&&!1!==this.props.pop){let a=b.offsetParent,c=(0,h.isHTMLElement)(a)&&a.offsetWidth||0,d=(0,h.isHTMLElement)(a)&&a.offsetHeight||0,e=getComputedStyle(b),f=this.props.sizeRef.current;f.height=parseFloat(e.height),f.width=parseFloat(e.width),f.top=b.offsetTop,f.left=b.offsetLeft,f.right=c-f.width-f.left,f.bottom=d-f.height-f.top}return null}componentDidUpdate(){}render(){return this.props.children}}function m({children:a,isPresent:d,anchorX:e,anchorY:f,root:g,pop:h}){let n=(0,i.useId)(),o=(0,i.useRef)(null),p=(0,i.useRef)({width:0,height:0,top:0,left:0,right:0,bottom:0}),{nonce:q}=(0,i.useContext)(j.MotionConfigContext),r=function(...a){return c.useCallback(function(...a){return b=>{let c=!1,d=a.map(a=>{let d=k(a,b);return c||"function"!=typeof d||(c=!0),d});if(c)return()=>{for(let b=0;b<d.length;b++){let c=d[b];"function"==typeof c?c():k(a[b],null)}}}}(...a),a)}(o,a.props?.ref??a?.ref);return(0,i.useInsertionEffect)(()=>{let{width:a,height:b,top:c,left:i,right:j,bottom:k}=p.current;if(d||!1===h||!o.current||!a||!b)return;let l="left"===e?`left: ${i}`:`right: ${j}`,m="bottom"===f?`bottom: ${k}`:`top: ${c}`;o.current.dataset.motionPopId=n;let r=document.createElement("style");q&&(r.nonce=q);let s=g??document.head;return s.appendChild(r),r.sheet&&r.sheet.insertRule(`
          [data-motion-pop-id="${n}"] {
            position: absolute !important;
            width: ${a}px !important;
            height: ${b}px !important;
            ${l}px !important;
            ${m}px !important;
          }
        `),()=>{o.current?.removeAttribute("data-motion-pop-id"),s.contains(r)&&s.removeChild(r)}},[d]),(0,b.jsx)(l,{isPresent:d,childRef:o,sizeRef:p,pop:h,children:!1===h?a:i.cloneElement(a,{ref:r})})}let n=({children:a,initial:d,isPresent:f,onExitComplete:h,custom:i,presenceAffectsLayout:j,mode:k,anchorX:l,anchorY:n,root:p})=>{let q=(0,e.useConstant)(o),r=(0,c.useId)(),s=!0,t=(0,c.useMemo)(()=>(s=!1,{id:r,initial:d,isPresent:f,custom:i,onExitComplete:a=>{for(let b of(q.set(a,!0),q.values()))if(!b)return;h&&h()},register:a=>(q.set(a,!1),()=>q.delete(a))}),[f,q,h]);return j&&s&&(t={...t}),(0,c.useMemo)(()=>{q.forEach((a,b)=>q.set(b,!1))},[f]),c.useEffect(()=>{f||q.size||!h||h()},[f]),a=(0,b.jsx)(m,{pop:"popLayout"===k,isPresent:f,anchorX:l,anchorY:n,root:p,children:a}),(0,b.jsx)(g.PresenceContext.Provider,{value:t,children:a})};function o(){return new Map}var p=a.i(20410);let q=a=>a.key||"";function r(a){let b=[];return c.Children.forEach(a,a=>{(0,c.isValidElement)(a)&&b.push(a)}),b}a.s(["AnimatePresence",0,({children:a,custom:g,initial:h=!0,onExitComplete:i,presenceAffectsLayout:j=!0,mode:k="sync",propagate:l=!1,anchorX:m="left",anchorY:o="top",root:s})=>{let[t,u]=(0,p.usePresence)(l),v=(0,c.useMemo)(()=>r(a),[a]),w=l&&!t?[]:v.map(q),x=(0,c.useRef)(!0),y=(0,c.useRef)(v),z=(0,e.useConstant)(()=>new Map),A=(0,c.useRef)(new Set),[B,C]=(0,c.useState)(v),[D,E]=(0,c.useState)(v);f(()=>{x.current=!1,y.current=v;for(let a=0;a<D.length;a++){let b=q(D[a]);w.includes(b)?(z.delete(b),A.current.delete(b)):!0!==z.get(b)&&z.set(b,!1)}},[D,w.length,w.join("-")]);let F=[];if(v!==B){let a=[...v];for(let b=0;b<D.length;b++){let c=D[b],d=q(c);w.includes(d)||(a.splice(b,0,c),F.push(c))}return"wait"===k&&F.length&&(a=F),E(r(a)),C(v),null}let{forceRender:G}=(0,c.useContext)(d.LayoutGroupContext);return(0,b.jsx)(b.Fragment,{children:D.map(a=>{let c=q(a),d=(!l||!!t)&&(v===D||w.includes(c));return(0,b.jsx)(n,{isPresent:d,initial:(!x.current||!!h)&&void 0,custom:g,presenceAffectsLayout:j,mode:k,root:s,onExitComplete:d?void 0:()=>{if(A.current.has(c)||!z.has(c))return;A.current.add(c),z.set(c,!0);let a=!0;z.forEach(b=>{b||(a=!1)}),a&&(G?.(),E(y.current),l&&u?.(),i&&i())},anchorX:m,anchorY:o,children:a},c)})})}],62036)},12892,a=>{"use strict";var b=a.i(87924),c=a.i(72131),d=a.i(50944);a.s(["default",0,function(){let a=(0,d.useRouter)(),[e,f]=(0,c.useState)(!0);return(0,c.useEffect)(()=>{"light"===localStorage.getItem("theme")&&(document.documentElement.classList.add("light-mode"),f(!1))},[]),(0,b.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:"0.25rem"},children:[(0,b.jsx)("button",{onClick:()=>a.back(),className:"btn btn-sm btn-ghost",style:{padding:"0.4rem"},title:"Go Back",children:(0,b.jsxs)("svg",{width:"18",height:"18",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[(0,b.jsx)("line",{x1:"19",y1:"12",x2:"5",y2:"12"}),(0,b.jsx)("polyline",{points:"12 19 5 12 12 5"})]})}),(0,b.jsx)("button",{onClick:()=>a.forward(),className:"btn btn-sm btn-ghost",style:{padding:"0.4rem"},title:"Go Forward",children:(0,b.jsxs)("svg",{width:"18",height:"18",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[(0,b.jsx)("line",{x1:"5",y1:"12",x2:"19",y2:"12"}),(0,b.jsx)("polyline",{points:"12 5 19 12 12 19"})]})}),(0,b.jsxs)("button",{onClick:()=>{e?(document.documentElement.classList.add("light-mode"),localStorage.setItem("theme","light"),f(!1)):(document.documentElement.classList.remove("light-mode"),localStorage.setItem("theme","dark"),f(!0))},className:"btn btn-sm btn-secondary",style:{padding:"0.4rem 0.6rem",borderRadius:"2rem"},title:"Toggle Theme",children:[(0,b.jsx)("span",{className:"theme-label",children:e?"☀️ Light":"🌙 Dark"}),(0,b.jsx)("span",{className:"theme-icon",children:e?"☀️":"🌙"})]}),(0,b.jsx)("style",{children:`
        .theme-icon { display: none; }
        @media (max-width: 639px) {
          .theme-label { display: none; }
          .theme-icon { display: inline; }
        }
      `})]})}])},88615,a=>{"use strict";var b=a.i(87924),c=a.i(72131),d=a.i(50944),e=a.i(46271),f=a.i(62036),g=a.i(6704),h=a.i(12892);let i=[{href:"/admin/dashboard",label:"Dashboard",icon:"M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4"},{href:"/admin/elections",label:"Elections",icon:"M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"},{href:"/admin/candidates",label:"Candidates",icon:"M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"},{href:"/admin/students",label:"Students",icon:"M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"},{href:"/admin/results",label:"Results",icon:"M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"},{href:"/admin/voting-booth",label:"Voting Booth",icon:"M5 3a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2H5zm4 8l2 2 4-4m-9 8h14"},{href:"/admin/settings",label:"Settings",icon:"M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z"}];a.s(["default",0,function({children:a}){let j=(0,d.usePathname)(),k=(0,d.useRouter)(),[l,m]=(0,c.useState)(!1),n=async()=>{try{await fetch("/api/auth/logout",{method:"POST"}),g.default.success("Logged out"),k.push("/auth/login")}catch{g.default.error("Logout failed")}};return(0,b.jsxs)("div",{className:"admin-shell",children:[(0,b.jsx)(f.AnimatePresence,{children:l&&(0,b.jsx)(e.motion.div,{initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},onClick:()=>m(!1),className:"sidebar-overlay lg-hidden"})}),(0,b.jsxs)("aside",{className:`admin-sidebar sidebar-desktop ${l?"open":""}`,children:[(0,b.jsxs)("div",{className:"sidebar-brand",children:[(0,b.jsx)("div",{className:"sidebar-logo",children:(0,b.jsxs)("svg",{width:"18",height:"18",viewBox:"0 0 24 24",fill:"none",stroke:"white",strokeWidth:"2.5",strokeLinecap:"round",strokeLinejoin:"round",children:[(0,b.jsx)("path",{d:"M9 11l3 3L22 4"}),(0,b.jsx)("path",{d:"M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"})]})}),(0,b.jsxs)("div",{children:[(0,b.jsx)("h2",{style:{fontSize:"1rem",fontWeight:800},className:"gradient-text",children:"Smart Vote"}),(0,b.jsx)("p",{style:{fontSize:"0.6875rem",color:"var(--slate-500)"},children:"Admin Panel"})]})]}),(0,b.jsx)("nav",{className:"sidebar-nav",children:i.map(a=>{let c=j.startsWith(a.href);return(0,b.jsxs)("a",{href:a.href,onClick:b=>{b.preventDefault(),k.push(a.href),m(!1)},className:`sidebar-link ${c?"active":""}`,children:[(0,b.jsx)("svg",{width:"20",height:"20",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round",children:(0,b.jsx)("path",{d:a.icon})}),a.label,c&&(0,b.jsx)("div",{className:"sidebar-dot"})]},a.href)})}),(0,b.jsx)("div",{className:"sidebar-footer",children:(0,b.jsxs)("button",{onClick:n,className:"sidebar-link",children:[(0,b.jsx)("svg",{width:"20",height:"20",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round",children:(0,b.jsx)("path",{d:"M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"})}),"Logout"]})})]}),(0,b.jsxs)("main",{className:"admin-main main-with-sidebar",children:[(0,b.jsxs)("header",{className:"admin-topbar",children:[(0,b.jsx)("button",{onClick:()=>m(!l),className:"sidebar-toggle btn btn-ghost",style:{padding:"0.5rem"},children:(0,b.jsxs)("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[(0,b.jsx)("line",{x1:"3",y1:"12",x2:"21",y2:"12"}),(0,b.jsx)("line",{x1:"3",y1:"6",x2:"21",y2:"6"}),(0,b.jsx)("line",{x1:"3",y1:"18",x2:"21",y2:"18"})]})}),(0,b.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:"0.75rem",marginLeft:"auto"},children:[(0,b.jsx)(h.default,{}),(0,b.jsx)("div",{className:"admin-avatar",children:"A"})]})]}),(0,b.jsx)("div",{className:"admin-content",children:a})]}),(0,b.jsx)("style",{children:`
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
      `})]})}])}];

//# sourceMappingURL=_00174u3._.js.map