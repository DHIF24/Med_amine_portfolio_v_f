import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  animate,
  AnimatePresence,
} from "framer-motion";

/* ── CONSTANTS ─────────────────────────────── */
const GRAD = "linear-gradient(135deg,#2563eb 0%,#1d4ed8 100%)";
const GRAD_TEXT = {
  background: GRAD,
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};
const GRADS = [
  "linear-gradient(135deg,#2563eb,#1d4ed8)",
  "linear-gradient(135deg,#3b82f6,#2563eb)",
  "linear-gradient(135deg,#60a5fa,#3b82f6)",
  "linear-gradient(135deg,#93c5fd,#60a5fa)",
];
const PILL_COLORS = [
  ["rgba(37,99,235,0.1)", "#2563eb"],
  ["rgba(59,130,246,0.1)", "#3b82f6"],
  ["rgba(96,165,250,0.1)", "#60a5fa"],
  ["rgba(147,197,253,0.1)", "#93c5fd"],
];

/* ── VARIANTS ──────────────────────────────── */
const fadeUp   = { hidden:{opacity:0,y:60}, visible:{opacity:1,y:0,transition:{duration:0.7,ease:"easeOut"}} };
const fadeLeft = { hidden:{opacity:0,x:-60}, visible:{opacity:1,x:0,transition:{duration:0.7,ease:"easeOut"}} };
const fadeRight= { hidden:{opacity:0,x:60},  visible:{opacity:1,x:0,transition:{duration:0.7,ease:"easeOut"}} };
const stagger  = { hidden:{}, visible:{transition:{staggerChildren:0.1}} };
const scaleIn  = { hidden:{opacity:0,scale:0.8}, visible:{opacity:1,scale:1,transition:{type:"spring",stiffness:260,damping:20}} };

/* ── COUNT-UP ──────────────────────────────── */
function useCountUp(target, inView) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, target, { duration:1.6, ease:"easeOut", onUpdate:(v)=>setVal(Math.floor(v)) });
    return c.stop;
  }, [inView, target]);
  return val;
}

/* ── HERO BG ───────────────────────────────── */
function HeroBg({ mouseX, mouseY }) {
  return (
    <div style={{ position:"absolute", inset:0, overflow:"hidden", zIndex:0 }}>
      {[
        {x:"6%",  y:"10%", s:560, c:"rgba(37,99,235,0.15)", d:0},
        {x:"62%", y:"50%", s:440, c:"rgba(59,130,246,0.12)", d:1.8},
        {x:"48%", y:"2%",  s:300, c:"rgba(96,165,250,0.10)",  d:3.2},
        {x:"78%", y:"72%", s:200, c:"rgba(37,99,235,0.08)", d:2.1},
      ].map((o,i)=>(
        <motion.div key={i} style={{
          position:"absolute", left:o.x, top:o.y, width:o.s, height:o.s,
          borderRadius:"50%", background:`radial-gradient(circle at 35% 35%,${o.c},transparent 70%)`,
          filter:"blur(45px)",
        }} animate={{y:[0,-32,0],scale:[1,1.1,1],opacity:[0.7,1,0.7]}}
          transition={{duration:8+i*2.5, repeat:Infinity, delay:o.d, ease:"easeInOut"}} />
      ))}
      <motion.div style={{
        position:"absolute", width:720, height:720, borderRadius:"50%",
        background:"radial-gradient(circle,rgba(37,99,235,0.08) 0%,transparent 65%)",
        filter:"blur(32px)", pointerEvents:"none",
        translateX:"-50%", translateY:"-50%", left:mouseX, top:mouseY,
      }} />
      <div style={{
        position:"absolute", inset:0,
        backgroundImage:"linear-gradient(rgba(37,99,235,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(37,99,235,0.04) 1px,transparent 1px)",
        backgroundSize:"64px 64px",
      }} />
    </div>
  );
}

/* ── MAGNETIC BUTTON ───────────────────────── */
function MagneticButton({ children, href, icon, variant="outline" }) {
  const ref = useRef(null);
  const x = useMotionValue(0), y = useMotionValue(0);
  const sx = useSpring(x,{stiffness:300,damping:20});
  const sy = useSpring(y,{stiffness:300,damping:20});
  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - r.left - r.width/2) * 0.35);
    y.set((e.clientY - r.top  - r.height/2) * 0.35);
  };
  const onLeave = () => { x.set(0); y.set(0); };
  const filled = variant==="filled";
  return (
    <motion.a ref={ref} href={href} onMouseMove={onMove} onMouseLeave={onLeave}
      whileHover={{scale:1.06}} whileTap={{scale:0.96}}
      transition={{type:"spring",stiffness:300,damping:20}}
      style={{
        x:sx, y:sy,
        background: filled ? GRAD : "rgba(255,255,255,0.92)",
        border: filled ? "none" : "2px solid rgba(37,99,235,0.2)",
        color: filled ? "#fff" : "#2563eb",
        backdropFilter:"blur(8px)",
        cursor:"pointer", textDecoration:"none",
        display:"inline-flex", alignItems:"center", gap:"10px",
        padding:"15px 32px", borderRadius:"50px",
        fontFamily:"DM Mono,monospace", fontSize:"13px", fontWeight:500,
        letterSpacing:"0.1em", textTransform:"uppercase",
        boxShadow: filled ? "0 8px 32px rgba(37,99,235,0.25)" : "0 4px 20px rgba(37,99,235,0.1)",
      }}>
      {icon && <span>{icon}</span>}
      {children}
    </motion.a>
  );
}

/* ── SECTION LABEL ─────────────────────────── */
function SectionLabel({ text }) {
  return (
    <motion.p variants={fadeUp} style={{
      fontFamily:"DM Mono,monospace", fontSize:"11px", letterSpacing:"0.25em",
      textTransform:"uppercase", ...GRAD_TEXT, marginBottom:"16px", display:"inline-block",
    }}>✦ {text}</motion.p>
  );
}

/* ── SECTION TITLE ─────────────────────────── */
function SectionTitle({ children, gradient=false }) {
  const ref = useRef(null);
  const inView = useInView(ref,{once:true,margin:"-60px"});
  return (
    <div ref={ref} style={{position:"relative",display:"inline-block",marginBottom:"56px"}}>
      <motion.h2 initial={{opacity:0,y:30}} animate={inView?{opacity:1,y:0}:{}} transition={{duration:0.6}}
        style={{ fontFamily:"Syne,sans-serif", fontSize:"clamp(1.7rem,6vw,3.5rem)", fontWeight:800,
          lineHeight:1.15, ...(gradient ? GRAD_TEXT : {color:"var(--text)"}) }}>
        {children}
      </motion.h2>
      <motion.div initial={{scaleX:0}} animate={inView?{scaleX:1}:{}}
        transition={{duration:0.7,delay:0.3,ease:"easeOut"}}
        style={{ position:"absolute", bottom:-10, left:0, width:"60%", height:"3px",
          background:GRAD, transformOrigin:"left", borderRadius:"2px" }} />
    </div>
  );
}

/* ── STAT CARD ─────────────────────────────── */
function StatCard({ number, suffix, label, idx }) {
  const ref = useRef(null);
  const inView = useInView(ref,{once:true});
  const count = useCountUp(number, inView);
  return (
    <motion.div ref={ref} variants={scaleIn}
      whileHover={{y:-4, boxShadow:"0 20px 60px rgba(37,99,235,0.15)"}}
      transition={{type:"spring",stiffness:280}}
      style={{
        background:"#fff", border:"1.5px solid rgba(0,0,0,0.08)", borderRadius:"20px",
        padding:"28px 22px", flex:"1 1 120px", minWidth:"120px", boxShadow:"0 4px 24px rgba(0,0,0,0.06)",
        position:"relative", overflow:"hidden",
      }}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:"3px",background:GRADS[idx%3]}} />
      <div style={{ fontFamily:"Syne,sans-serif", fontSize:"clamp(2rem,6vw,3rem)", fontWeight:800,
        background:GRADS[idx%3], WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
        backgroundClip:"text", lineHeight:1, marginBottom:"6px" }}>
        {count}{suffix}
      </div>
      <div style={{ fontFamily:"DM Mono,monospace", fontSize:"11px", letterSpacing:"0.12em",
        color:"var(--text-muted)", textTransform:"uppercase" }}>{label}</div>
    </motion.div>
  );
}

/* ── SKILL PILL ────────────────────────────── */
function SkillPill({ label, color=0 }) {
  const [bg, fg] = PILL_COLORS[color % PILL_COLORS.length];
  return (
    <motion.span variants={scaleIn} whileHover={{scale:1.08,y:-4,boxShadow:"0 8px 24px rgba(37,99,235,0.2)"}}
      transition={{type:"spring",stiffness:320}}
      style={{
        display:"inline-flex", alignItems:"center", gap:"8px",
        padding:"10px 20px", borderRadius:"50px",
        border:`1.5px solid ${fg}40`, background:bg, color:fg,
        fontFamily:"DM Mono,monospace", fontSize:"14px", fontWeight:500,
        letterSpacing:"0.04em", cursor:"default", whiteSpace:"nowrap",
        boxShadow:"0 2px 8px rgba(0,0,0,0.04)",
      }}>
      <span style={{width:8,height:8,borderRadius:"50%",background:fg,display:"inline-block",flexShrink:0}} />
      {label}
    </motion.span>
  );
}

/* ── SKILLS CAROUSEL ───────────────────────── */
const ALL_SKILLS = [
  "React.js","Next.js","Laravel","PHP","MySQL","JavaScript (ES6+)",
  "HTML5","CSS3","Git","Bootstrap","REST API","Responsive Design",
  "Node.js","Tailwind CSS","Linux","VS Code","TypeScript","Figma",
];

function SkillsCarousel() {
  const doubled = [...ALL_SKILLS,...ALL_SKILLS];
  return (
    <div style={{overflow:"hidden",
      maskImage:"linear-gradient(90deg,transparent,black 8%,black 92%,transparent)",
      WebkitMaskImage:"linear-gradient(90deg,transparent,black 8%,black 92%,transparent)"}}>
      <div style={{display:"flex",gap:"14px",width:"max-content",
        animation:"carousel-scroll 30s linear infinite"}}>
        {doubled.map((s,i)=>(
          <span key={i} style={{
            display:"inline-flex", alignItems:"center", gap:"8px",
            padding:"10px 22px", borderRadius:"50px",
            background:"#fff", border:"1.5px solid rgba(0,0,0,0.08)",
            fontFamily:"DM Mono,monospace", fontSize:"13px", fontWeight:500,
            color:"var(--text-muted)", whiteSpace:"nowrap",
            boxShadow:"0 4px 16px rgba(0,0,0,0.06)",
          }}>
            <span style={{width:8,height:8,borderRadius:"50%",flexShrink:0,background:GRADS[i%3]}} />
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── TIMELINE LINE ─────────────────────────── */
function TimelineLine() {
  const ref = useRef(null);
  const inView = useInView(ref,{once:true,margin:"-100px"});
  return (
    <div ref={ref} style={{position:"absolute",left:"50%",top:0,bottom:0,
      transform:"translateX(-50%)",width:"4px"}}>
      <svg width="4" height="100%" style={{position:"absolute",top:0,height:"100%"}}
        preserveAspectRatio="none" viewBox="0 0 4 100">
        <defs>
          <linearGradient id="tlg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563eb"/>
            <stop offset="50%" stopColor="#3b82f6"/>
            <stop offset="100%" stopColor="#60a5fa"/>
          </linearGradient>
        </defs>
        <motion.line x1="2" y1="0" x2="2" y2="100"
          stroke="url(#tlg)" strokeWidth="4"
          initial={{pathLength:0}} animate={inView?{pathLength:1}:{}}
          transition={{duration:2,ease:"easeInOut"}} vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}

/* ── TIMELINE CARD ─────────────────────────── */
function TimelineCard({ role, period, company, location, points, side, idx=0 }) {
  const ref = useRef(null);
  const inView = useInView(ref,{once:true,margin:"-60px"});
  const v = side==="left" ? fadeLeft : fadeRight;
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 860);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return (
    <motion.div ref={ref} variants={v} initial="hidden" animate={inView?"visible":"hidden"}
      whileHover={{y:-4, boxShadow:"0 20px 60px rgba(0,0,0,0.1)"}}
      transition={{type:"spring",stiffness:260}}
      style={{
        background:"#fff", border:"1.5px solid rgba(0,0,0,0.08)", borderRadius:"20px",
        padding:isMobile ? "24px 20px" : "32px", flex:1, maxWidth:"480px", width:"100%", position:"relative",
        boxShadow:"0 4px 24px rgba(0,0,0,0.06)", overflow:"hidden",
        marginLeft:isMobile ? "0" : undefined,
        marginRight:isMobile ? "0" : undefined,
      }}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:"3px",background:GRADS[idx%2]}} />
      {!isMobile && (
        <div style={{
          position:"absolute", top:"38px",
          [side==="left"?"right":"left"]:"-9px",
          width:"18px", height:"18px", borderRadius:"50%",
          background:GRADS[idx%2], border:"3px solid #f7f5ff",
          boxShadow:`0 0 14px rgba(37,99,235,0.3)`,
        }} />
      )}
      <p style={{fontFamily:"DM Mono,monospace",fontSize:"11px",letterSpacing:"0.2em",
        background:GRADS[idx%2], WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
        backgroundClip:"text", marginBottom:"8px",textTransform:"uppercase",display:"inline-block"}}>
        {period}
      </p>
      <h3 style={{fontFamily:"Syne,sans-serif",fontSize:"1.3rem",fontWeight:700,
        color:"var(--text)",marginBottom:"4px"}}>{role}</h3>
      <p style={{fontFamily:"DM Mono,monospace",fontSize:"13px",color:"var(--text-muted)",marginBottom:"20px"}}>
        {company} · {location}
      </p>
      <ul style={{listStyle:"none",padding:0}}>
        {points.map((p,i)=>(
          <li key={i} style={{fontFamily:"DM Mono,monospace",fontSize:"13px",color:"var(--text-muted)",
            paddingLeft:"16px",position:"relative",marginBottom:"8px",lineHeight:1.6}}>
            <span style={{position:"absolute",left:0,color:"#2563eb",fontWeight:700}}>›</span>{p}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

/* ── PROJECT CARD ──────────────────────────── */
function ProjectCard({ title, year, description, stack, gradient, demoUrl, githubUrl }) {
  const [hov, setHov] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return (
    <motion.div variants={fadeUp}
      whileHover={!isMobile ? {y:-10,scale:1.02,rotateY:4} : {}}
      onHoverStart={()=>setHov(true)} onHoverEnd={()=>setHov(false)}
      transition={{type:"spring",stiffness:240,damping:18}}
      style={{
        background:"#fff", border:"1.5px solid rgba(0,0,0,0.08)", borderRadius:"24px",
        padding:isMobile ? "28px 22px" : "40px 36px", flex:"1 1 300px", minWidth:"280px", maxWidth:"520px",
        position:"relative", overflow:"hidden", transformPerspective:900,
        cursor:"default",
        boxShadow: hov ? "0 12px 40px rgba(0,0,0,0.1)" : "0 4px 24px rgba(0,0,0,0.06)",
        transition:"box-shadow 0.3s",
      }}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:"4px",background:gradient}} />
      <motion.div animate={{opacity:hov?1:0}} transition={{duration:0.3}}
        style={{position:"absolute",inset:0,zIndex:0,pointerEvents:"none",
          background:`radial-gradient(ellipse at top left,rgba(37,99,235,0.06),transparent 70%)`}} />
      <div style={{position:"relative",zIndex:1}}>
        <p style={{fontFamily:"DM Mono,monospace",fontSize:"11px",letterSpacing:"0.2em",
          background:gradient,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
          backgroundClip:"text",marginBottom:"12px",textTransform:"uppercase",display:"inline-block"}}>{year}</p>
        <h3 style={{fontFamily:"Syne,sans-serif",fontSize:"clamp(1.2rem,4vw,1.5rem)",fontWeight:800,
          color:"var(--text)",marginBottom:"12px",lineHeight:1.25}}>{title}</h3>
        <p style={{fontFamily:"DM Mono,monospace",fontSize:"clamp(12px,3vw,13px)",color:"var(--text-muted)",
          lineHeight:1.7,marginBottom:"20px"}}>{description}</p>
        <div style={{display:"flex",flexWrap:"wrap",gap:"8px",marginBottom:"24px"}}>
          {stack.map((s,i)=>(
            <span key={s} style={{
              fontFamily:"DM Mono,monospace",fontSize:"11px",letterSpacing:"0.08em",
              padding:"5px 14px",borderRadius:"50px",
              border:`1.5px solid ${PILL_COLORS[i%4][1]}33`,
              color:PILL_COLORS[i%4][1], background:PILL_COLORS[i%4][0],
            }}>{s}</span>
          ))}
        </div>
        <div style={{display:"flex", gap:"12px", flexWrap:"wrap"}}>
          {demoUrl && (
            <motion.a href={demoUrl} target="_blank" rel="noopener noreferrer"
              whileHover={{scale:1.04, y:-2}}
              whileTap={{scale:0.97}}
              transition={{type:"spring",stiffness:300,damping:18}}
              style={{
                display:"inline-flex", alignItems:"center", gap:"8px",
                padding:"11px 22px", borderRadius:"50px",
                background: gradient,
                color:"#fff", textDecoration:"none",
                fontFamily:"DM Mono,monospace", fontSize:"12px",
                fontWeight:500, letterSpacing:"0.1em", textTransform:"uppercase",
                boxShadow:`0 6px 24px rgba(37,99,235,0.25)`,
              }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
              Live Demo
            </motion.a>
          )}
          {githubUrl && (
            <motion.a href={githubUrl} target="_blank" rel="noopener noreferrer"
              whileHover={{scale:1.04, y:-2}}
              whileTap={{scale:0.97}}
              transition={{type:"spring",stiffness:300,damping:18}}
              style={{
                display:"inline-flex", alignItems:"center", gap:"8px",
                padding:"11px 22px", borderRadius:"50px",
                background:"transparent",
                color:"#6b6584", textDecoration:"none",
                fontFamily:"DM Mono,monospace", fontSize:"12px",
                fontWeight:500, letterSpacing:"0.1em", textTransform:"uppercase",
                border:"1.5px solid rgba(107,101,132,0.25)",
              }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </motion.a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ── LANGUAGE BAR ──────────────────────────── */
function LanguageBar({ lang, level, width, idx=0 }) {
  const ref = useRef(null);
  const inView = useInView(ref,{once:true,margin:"-40px"});
  return (
    <motion.div ref={ref} variants={fadeUp} style={{marginBottom:"28px"}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:"10px"}}>
        <span style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:"1rem",color:"var(--text)"}}>{lang}</span>
        <span style={{fontFamily:"DM Mono,monospace",fontSize:"12px",letterSpacing:"0.08em",
          background:GRADS[idx%3],WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
          backgroundClip:"text",display:"inline-block"}}>{level}</span>
      </div>
      <div style={{height:"8px",background:"rgba(37,99,235,0.08)",borderRadius:"50px",
        position:"relative",overflow:"hidden"}}>
        <motion.div initial={{scaleX:0}} animate={inView?{scaleX:1}:{}}
          transition={{duration:1.4,ease:[0.25,1,0.5,1],delay:0.2}}
          style={{position:"absolute",inset:0,width:width,background:GRADS[idx%3],
            transformOrigin:"left",borderRadius:"50px",
            boxShadow:`0 0 14px rgba(37,99,235,0.25)`}} />
      </div>
    </motion.div>
  );
}

/* ── EDU CARD ──────────────────────────────── */
function EduCard({ degree, school, period, detail, idx=0 }) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return (
    <motion.div variants={fadeUp}
      whileHover={!isMobile ? {y:-6,boxShadow:"0 20px 60px rgba(0,0,0,0.1)"} : {}}
      transition={{type:"spring",stiffness:260}}
      style={{
        background:"#fff", border:"1.5px solid rgba(0,0,0,0.08)", borderRadius:"20px",
        padding:isMobile ? "26px 22px" : "36px 32px", flex:"1 1 280px", minWidth:"260px", position:"relative",
        overflow:"hidden", boxShadow:"0 4px 24px rgba(0,0,0,0.06)",
      }}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:"3px",background:GRADS[idx%2]}} />
      <div style={{position:"absolute",bottom:-24,right:-24,width:"110px",height:"110px",
        borderRadius:"50%",background:`radial-gradient(circle,rgba(37,99,235,0.06),transparent 70%)`}} />
      <p style={{fontFamily:"DM Mono,monospace",fontSize:"11px",letterSpacing:"0.2em",
        background:GRADS[idx%2],WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
        backgroundClip:"text",marginBottom:"12px",textTransform:"uppercase",display:"inline-block"}}>{period}</p>
      <h3 style={{fontFamily:"Syne,sans-serif",fontSize:"clamp(1rem,3vw,1.15rem)",fontWeight:700,
        color:"var(--text)",lineHeight:1.3,marginBottom:"10px"}}>{degree}</h3>
      <p style={{fontFamily:"DM Mono,monospace",fontSize:"clamp(12px,2.5vw,13px)",color:"var(--text-muted)",lineHeight:1.6}}>{school}</p>
      {detail&&<p style={{fontFamily:"DM Mono,monospace",fontSize:"12px",marginTop:"8px",
        background:GRADS[idx%2],WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
        backgroundClip:"text",display:"inline-block"}}>{detail}</p>}
    </motion.div>
  );
}

/* ── NAV ───────────────────────────────────── */
function Nav() {
  const { scrollY } = useScroll();
  const bgOpacity = useTransform(scrollY,[0,80],[0,1]);
  const [active,setActive] = useState("");
  const links = ["About","Skills","Experience","Projects","Education","Contact"];
  return (
    <motion.nav style={{position:"fixed",top:0,left:0,right:0,zIndex:100,
      display:"flex",justifyContent:"space-between",alignItems:"center",
      padding:"14px clamp(16px,4vw,48px)",backdropFilter:"blur(16px)"}}>
      <motion.div style={{opacity:bgOpacity,position:"absolute",inset:0,zIndex:-1,
        background:"rgba(255,255,255,0.95)",
        borderBottom:"1px solid rgba(0,0,0,0.08)",
        boxShadow:"0 2px 20px rgba(0,0,0,0.05)"}} />
      <motion.a href="#hero" whileHover={{scale:1.05}} style={{
        fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:"clamp(1.1rem,3vw,1.2rem)",
        ...GRAD_TEXT, textDecoration:"none",zIndex:1}}>Portfolio</motion.a>
      <div style={{display:"flex",gap:"28px",alignItems:"center",zIndex:1}} className="desktop-nav">
        {links.map(l=>(
          <motion.a key={l} href={`#${l.toLowerCase()}`} onClick={()=>setActive(l)}
            whileHover={{color:"#2563eb"}}
            style={{fontFamily:"DM Mono,monospace",fontSize:"12px",letterSpacing:"0.12em",
              textTransform:"uppercase",color:active===l?"#2563eb":"var(--text-muted)",textDecoration:"none"}}>{l}</motion.a>
        ))}
        <motion.a href="https://linkedin.com/in/mohamed-amine-dhif/" target="_blank" rel="noopener noreferrer"
          whileHover={{scale:1.12, color:"#2563eb"}}
          whileTap={{scale:0.95}}
          title="LinkedIn"
          style={{
            display:"inline-flex", alignItems:"center", justifyContent:"center",
            width:"34px", height:"34px", borderRadius:"8px",
            border:"1.5px solid rgba(37,99,235,0.2)",
            background:"rgba(37,99,235,0.05)",
            color:"#2563eb", textDecoration:"none", flexShrink:0,
          }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        </motion.a>
      </div>
    </motion.nav>
  );
}

/* ── HERO ──────────────────────────────────── */
function Hero() {
  const heroRef = useRef(null);
  const {scrollYProgress} = useScroll({target:heroRef,offset:["start start","end start"]});
  const y = useTransform(scrollYProgress,[0,1],["0%","28%"]);
  const opacity = useTransform(scrollYProgress,[0,0.7],[1,0]);

  const mouseX = useMotionValue("50%");
  const mouseY = useMotionValue("50%");
  const onMove = useCallback((e)=>{ mouseX.set(e.clientX); mouseY.set(e.clientY); },[mouseX,mouseY]);

  const words = ["Mohamed","Amine","Dhif"];
  const roles = ["Full-Stack Developer","Laravel Expert","API Architect"];
  const [roleIdx,setRoleIdx] = useState(0);
  useEffect(()=>{
    const t = setInterval(()=>setRoleIdx(i=>(i+1)%roles.length),2500);
    return ()=>clearInterval(t);
  },[]);

  return (
    <section id="hero" ref={heroRef} onMouseMove={onMove} style={{
      minHeight:"100vh", display:"flex", flexDirection:"column",
      justifyContent:"center", alignItems:"center", position:"relative",
      overflow:"hidden", textAlign:"center", padding:"0 24px",
      background:"linear-gradient(160deg,#f7f5ff 0%,#fff0f8 42%,#eff9ff 100%)",
    }}>
      <HeroBg mouseX={mouseX} mouseY={mouseY} />

      <motion.div style={{y,opacity,position:"relative",zIndex:2,maxWidth:"1000px",width:"100%"}}>

        {/* Badge */}
        <motion.div initial={{opacity:0,scale:0.8}} animate={{opacity:1,scale:1}}
          transition={{duration:0.7,delay:0.1}}
          style={{display:"inline-flex",alignItems:"center",gap:"8px",
            padding:"8px 22px",borderRadius:"50px",marginBottom:"36px",
            background:"rgba(37,99,235,0.08)",border:"1.5px solid rgba(37,99,235,0.15)"}}>
          <motion.span animate={{scale:[1,1.5,1],opacity:[1,0.4,1]}}
            transition={{duration:2,repeat:Infinity}}
            style={{width:8,height:8,borderRadius:"50%",background:"#2563eb",display:"inline-block"}} />
          <span style={{fontFamily:"DM Mono,monospace",fontSize:"12px",letterSpacing:"0.15em",
            color:"#2563eb",textTransform:"uppercase"}}>Available for work · Nabeul, Tunisia</span>
        </motion.div>

        {/* Name */}
        <motion.h1 variants={{hidden:{},visible:{transition:{staggerChildren:0.12}}}}
          initial="hidden" animate="visible" aria-label="Mohamed Amine Dhif"
          style={{fontFamily:"Syne,sans-serif",fontWeight:800,
            fontSize:"clamp(2.2rem,10vw,9rem)",lineHeight:1.05,marginBottom:"20px",
            display:"flex",flexWrap:"wrap",justifyContent:"center",gap:"0 0.18em"}}>
          {words.map((w,wi)=>(
            <motion.span key={wi} variants={{
              hidden:{opacity:0,y:80,rotateX:-35},
              visible:{opacity:1,y:0,rotateX:0,transition:{type:"spring",stiffness:140,damping:15}},
            }} style={{display:"inline-block",transformPerspective:"900px",
              ...(wi===2 ? GRAD_TEXT : {color:"var(--text)"})}}>
              {w}
            </motion.span>
          ))}
        </motion.h1>

        {/* Role switcher */}
        <div style={{height:"48px",display:"flex",justifyContent:"center",alignItems:"center",marginBottom:"24px",overflow:"hidden"}}>
          <AnimatePresence mode="wait">
            <motion.p key={roleIdx}
              initial={{opacity:0,y:22}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-22}}
              transition={{duration:0.38}}
              style={{fontFamily:"Syne,sans-serif",fontWeight:600,
                fontSize:"clamp(1.1rem,3vw,1.65rem)",...GRAD_TEXT}}>
              {roles[roleIdx]}
            </motion.p>
          </AnimatePresence>
        </div>

        <motion.p initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}
          transition={{duration:0.8,delay:1.0}}
          style={{fontFamily:"DM Mono,monospace",fontSize:"clamp(0.85rem,2vw,1.1rem)",
            color:"var(--text-muted)",marginBottom:"48px",lineHeight:1.8}}>
          Building performant web apps from Nabeul to the world
        </motion.p>

        {/* Buttons */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}
          transition={{duration:0.7,delay:1.15}}
          style={{display:"flex",gap:"12px",justifyContent:"center",flexWrap:"wrap",marginBottom:"44px"}}>
          <MagneticButton href="#projects" variant="filled" icon="→">View Projects</MagneticButton>
          <MagneticButton href="#contact" variant="outline" icon="✉">Get In Touch</MagneticButton>
        </motion.div>

        {/* Floating tech pills */}
        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.6}}
          style={{display:"flex",gap:"10px",justifyContent:"center",flexWrap:"wrap"}}>
          {["React","Laravel","MySQL","PHP","Next.js"].map((t,i)=>(
            <motion.span key={t}
              animate={{y:[0,-8,0]}}
              transition={{duration:3+i*0.6,repeat:Infinity,delay:i*0.45,ease:"easeInOut"}}
              style={{fontFamily:"DM Mono,monospace",fontSize:"clamp(11px,2.5vw,12px)",padding:"6px 14px",
                borderRadius:"50px",background:"rgba(255,255,255,0.85)",
                border:"1.5px solid rgba(37,99,235,0.12)",color:"var(--text-muted)",
                boxShadow:"0 4px 16px rgba(0,0,0,0.06)",backdropFilter:"blur(8px)"}}>
              {t}
            </motion.span>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:2.2}}
        style={{position:"absolute",bottom:"36px",left:"50%",transform:"translateX(-50%)",zIndex:2}}>
        <motion.div animate={{y:[0,10,0]}} transition={{repeat:Infinity,duration:1.8,ease:"easeInOut"}}
          onClick={()=>document.getElementById("about")?.scrollIntoView({behavior:"smooth"})}
          style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"6px",cursor:"pointer"}}>
          <span style={{fontFamily:"DM Mono,monospace",fontSize:"10px",letterSpacing:"0.2em",
            color:"var(--text-muted)",textTransform:"uppercase"}}>Scroll</span>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 4L12 20M5 13L12 20L19 13" stroke="#2563eb"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ── ABOUT ─────────────────────────────────── */
function About() {
  const ref = useRef(null);
  const inView = useInView(ref,{once:true,margin:"-80px"});
  return (
    <section id="about" style={{padding:"clamp(80px,10vw,120px) clamp(20px,5vw,48px)",background:"#fff"}}>
      <div style={{maxWidth:"1200px",margin:"0 auto"}}>
        <motion.div ref={ref} variants={stagger} initial="hidden" animate={inView?"visible":"hidden"}>
          <SectionLabel text="Who I Am" />
          <div style={{display:"flex",gap:"clamp(32px,5vw,80px)",alignItems:"flex-start",flexWrap:"wrap"}}>
            <motion.div variants={fadeLeft} style={{flex:"1 1 280px"}}>
              <div style={{marginBottom:"40px"}}>
                <SectionTitle gradient>About Me</SectionTitle>
              </div>
              <p style={{fontFamily:"DM Mono,monospace",fontSize:"clamp(13px,2.5vw,14px)",lineHeight:"1.9",
                color:"var(--text-muted)",maxWidth:"520px"}}>
                I'm a Full-Stack Web Developer based in Nabeul, Tunisia — passionate
                about crafting clean, performant, and user-focused web applications.
                With hands-on experience in both frontend and backend development,
                I bridge the gap between design and logic to deliver complete digital
                products. I've worked on collaborative platforms, REST APIs, and
                client-facing dashboards, always pushing for quality and scalability.
              </p>
            </motion.div>
            <motion.div variants={stagger}
              style={{flex:"1 1 300px",display:"flex",gap:"10px",flexWrap:"wrap"}}>
              <StatCard number={2} suffix="+" label="Years Experience" idx={0} />
              <StatCard number={5} suffix="+" label="Projects Delivered" idx={1} />
              <StatCard number={3} suffix=""  label="Languages Spoken"  idx={2} />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ── SKILLS ────────────────────────────────── */
const SKILL_GROUPS = [
  {group:"Front-End", skills:["HTML5","CSS3","JavaScript (ES6+)","React.js","Next.js"], ci:0},
  {group:"Back-End",  skills:["PHP","Laravel"], ci:1},
  {group:"Database",  skills:["MySQL"], ci:2},
  {group:"Tools",     skills:["Git","Bootstrap","REST API","Responsive Design"], ci:3},
];

function Skills() {
  const ref = useRef(null);
  const inView = useInView(ref,{once:true,margin:"-60px"});
  return (
    <section id="skills" style={{padding:"clamp(80px,10vw,120px) clamp(20px,5vw,48px)",background:"var(--bg)",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:"-200px",right:"-150px",width:"500px",height:"500px",
        borderRadius:"50%",background:"radial-gradient(circle,rgba(37,99,235,0.06),transparent 70%)",pointerEvents:"none"}} />
      <div style={{maxWidth:"1200px",margin:"0 auto"}}>
        <motion.div ref={ref} variants={stagger} initial="hidden" animate={inView?"visible":"hidden"}>
          <SectionLabel text="What I Know" />
          <SectionTitle>Skills</SectionTitle>
          <div style={{display:"flex",flexDirection:"column",gap:"44px",marginBottom:"72px"}}>
            {SKILL_GROUPS.map(g=>(
              <motion.div key={g.group} variants={fadeUp} style={{
                background:"#fff",border:"1.5px solid rgba(0,0,0,0.08)",borderRadius:"24px",
                padding:"28px 32px",boxShadow:"0 4px 24px rgba(0,0,0,0.04)"
              }}>
                <p style={{fontFamily:"DM Mono,monospace",fontSize:"12px",letterSpacing:"0.15em",
                  color:"var(--text-muted)",textTransform:"uppercase",marginBottom:"18px",fontWeight:600}}>{g.group}</p>
                <motion.div variants={stagger} initial="hidden" animate={inView?"visible":"hidden"}
                  style={{display:"flex",flexWrap:"wrap",gap:"12px"}}>
                  {g.skills.map((s,si)=><SkillPill key={s} label={s} color={(g.ci+si)%4} />)}
                </motion.div>
              </motion.div>
            ))}
          </div>
          <motion.div variants={fadeUp} style={{
            background:"#fff",border:"1.5px solid rgba(0,0,0,0.08)",borderRadius:"24px",
            padding:"28px 32px",boxShadow:"0 4px 24px rgba(0,0,0,0.04)"
          }}>
            <p style={{fontFamily:"DM Mono,monospace",fontSize:"12px",letterSpacing:"0.15em",
              color:"var(--text-muted)",textTransform:"uppercase",marginBottom:"24px",fontWeight:600}}>All Technologies</p>
            <SkillsCarousel />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ── EXPERIENCE ────────────────────────────── */
function Experience() {
  const ref = useRef(null);
  const inView = useInView(ref,{once:true,margin:"-60px"});
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 860);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return (
    <section id="experience" style={{padding:"clamp(80px,10vw,120px) clamp(20px,5vw,48px)",background:"#fff"}}>
      <div style={{maxWidth:"1200px",margin:"0 auto"}}>
        <motion.div ref={ref} variants={stagger} initial="hidden" animate={inView?"visible":"hidden"}>
          <SectionLabel text="Work History" />
          <SectionTitle>Experience</SectionTitle>
        </motion.div>
        <div style={{position:"relative",paddingTop:"20px"}}>
          {!isMobile && <TimelineLine />}
          <div style={{display:"flex",flexDirection:"column",gap:isMobile ? "32px" : "60px"}}>
            <div style={{
              display:"flex",justifyContent:isMobile ? "center" : "flex-start",
              paddingRight:isMobile ? "0" : "calc(50% + 40px)",
              paddingLeft:isMobile ? "0" : undefined,
            }}>
              <TimelineCard side="left" idx={0} period="2024"
                role="Freelance Full-Stack Developer"
                company="Auto-entrepreneur" location="Tunis, Tunisia"
                points={[
                  "Built a collaborative project management platform",
                  "Laravel + RESTful API + MySQL backend architecture",
                  "Responsive Bootstrap frontend with dynamic UI",
                ]} />
            </div>
            <div style={{
              display:"flex",justifyContent:isMobile ? "center" : "flex-end",
              paddingLeft:isMobile ? "0" : "calc(50% + 40px)",
              paddingRight:isMobile ? "0" : undefined,
            }}>
              <TimelineCard side="right" idx={1} period="2022"
                role="Web Developer Intern"
                company="Tunisie Télécom" location="Nabeul, Tunisia"
                points={[
                  "Developed a client complaint management web application",
                  "HTML5 / CSS3 / JavaScript frontend experience",
                  "PHP backend with form handling and database integration",
                ]} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── PROJECTS ──────────────────────────────── */
function Projects() {
  const ref = useRef(null);
  const inView = useInView(ref,{once:true,margin:"-60px"});
  return (
    <section id="projects" style={{padding:"clamp(80px,10vw,120px) clamp(20px,5vw,48px)",background:"var(--bg)"}}>
      <div style={{maxWidth:"1200px",margin:"0 auto"}}>
        <motion.div ref={ref} variants={stagger} initial="hidden" animate={inView?"visible":"hidden"}>
          <SectionLabel text="Featured Work" />
          <SectionTitle>Projects</SectionTitle>
          <motion.div variants={stagger} style={{display:"flex",gap:"24px",flexWrap:"wrap",justifyContent:"center"}}>
            <ProjectCard title="Portfolio" year="2024"
              description="A modern, responsive portfolio website showcasing projects and skills. Built with clean HTML structure, custom CSS styling, and interactive JavaScript features."
              stack={["HTML5","CSS3","JavaScript"]}
              gradient="linear-gradient(135deg,#2563eb,#1d4ed8)"
              demoUrl="https://portfolio-wassim-eta.vercel.app"
              githubUrl="https://github.com/DHIF24/portfolio-wassim" />
            <ProjectCard title="Dhayoufi Store" year="2024"
              description="A modern e-commerce website with product catalog, shopping cart, and checkout flow. Built with responsive design and smooth user experience for online shopping."
              stack={["React","Next.js","Tailwind CSS","Vercel"]}
              gradient="linear-gradient(135deg,#3b82f6,#2563eb)"
              demoUrl="https://dhayoufi-store.vercel.app"
              githubUrl="https://github.com/DHIF24/dhayoufi_store" />
            <ProjectCard title="Inventory Management System" year="2024"
              description="A comprehensive inventory management system with real-time stock tracking, authentication, and cloud storage. Built with modern React tooling and Firebase backend services."
              stack={["React","Vite","Firebase","Firestore","Auth"]}
              gradient="linear-gradient(135deg,#60a5fa,#3b82f6)"
              demoUrl="https://inventory-management-system-mocha-phi.vercel.app/"
              githubUrl="https://github.com/DHIF24/Inventory-Management-System" />
            <ProjectCard title="Taba3 flousek" year="2024"
              description="A React-based progressive web application for personal budget management. Built with Vite and Tailwind CSS for responsive, mobile-first design. Integrates Firebase Authentication for secure user access and Firestore for real-time data persistence of transactions, custom categories, and user settings across devices. Features monthly expense tracking."
              stack={["React","Vite","Tailwind CSS","Firebase","Firestore","Auth"]}
              gradient="linear-gradient(135deg,#93c5fd,#60a5fa)"
              demoUrl="https://www.taba3flousek.online/"
              githubUrl="https://github.com/DHIF24/flowbudget" />
            <ProjectCard title="AURUM" year="2024"
              description="A luxury Swiss-inspired watch brand vitrine website featuring elegant animations and a premium dark aesthetic with gold accents. Built with Next.js 14, TypeScript, Tailwind CSS, and Framer Motion for smooth scroll animations and interactive components. Includes hero section, featured collection, brand heritage with animated counters, craftsmanship features, testimonials carousel, and contact form."
              stack={["Next.js 14","TypeScript","Tailwind CSS","Framer Motion"]}
              gradient="linear-gradient(135deg,#1e40af,#2563eb)"
              demoUrl="https://aurum-site-vitrine.vercel.app"
              githubUrl="https://github.com/DHIF24/aurum-site-vitrine" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ── EDUCATION ─────────────────────────────── */
function Education() {
  const ref = useRef(null);
  const inView = useInView(ref,{once:true,margin:"-60px"});
  return (
    <section id="education" style={{padding:"clamp(80px,10vw,120px) clamp(20px,5vw,48px)",background:"#fff"}}>
      <div style={{maxWidth:"1200px",margin:"0 auto"}}>
        <motion.div ref={ref} variants={stagger} initial="hidden" animate={inView?"visible":"hidden"}>
          <SectionLabel text="Academic Background" />
          <SectionTitle>Education</SectionTitle>
          <motion.div variants={stagger} style={{display:"flex",gap:"20px",flexWrap:"wrap",justifyContent:"center"}}>
            <EduCard degree="Licence en Informatique de Gestion — E-Business"
              school="FSEG Nabeul" period="2021 – 2024"
              detail="Specialization in E-Business & Information Systems" idx={0} />
            <EduCard degree="Baccalauréat Sciences de l'Informatique"
              school="Lycée Mahmoud Messadi" period="2020" detail={null} idx={1} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ── LANGUAGES ─────────────────────────────── */
function Languages() {
  const ref = useRef(null);
  const inView = useInView(ref,{once:true,margin:"-60px"});
  return (
    <section style={{padding:"clamp(80px,10vw,120px) clamp(20px,5vw,48px)",background:"var(--bg)"}}>
      <div style={{maxWidth:"1200px",margin:"0 auto"}}>
        <motion.div ref={ref} variants={stagger} initial="hidden" animate={inView?"visible":"hidden"}>
          <SectionLabel text="Communication" />
          <SectionTitle>Languages</SectionTitle>
          <div style={{maxWidth:"100%", width:"560px"}}>
            <LanguageBar lang="Arabic" level="Native"  width="100%" idx={0} />
            <LanguageBar lang="French" level="B2 – C1" width="85%"  idx={1} />
            <LanguageBar lang="English" level="B1"     width="60%"  idx={2} />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ── CONTACT ───────────────────────────────── */
function Contact() {
  const ref = useRef(null);
  const inView = useInView(ref,{once:true,margin:"-60px"});
  return (
    <section id="contact" style={{padding:"clamp(100px,12vw,140px) clamp(20px,5vw,48px)",background:"#fff",
      textAlign:"center",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:"50%",left:"50%",
        transform:"translate(-50%,-50%)",width:"700px",height:"700px",
        borderRadius:"50%",pointerEvents:"none",
        background:"radial-gradient(circle,rgba(37,99,235,0.06),rgba(59,130,246,0.04) 50%,transparent 70%)"}} />
      <motion.div ref={ref} variants={stagger} initial="hidden" animate={inView?"visible":"hidden"}
        style={{position:"relative",zIndex:1,maxWidth:"800px",margin:"0 auto"}}>
        <SectionLabel text="Get In Touch" />
        <motion.h2 variants={fadeUp} style={{fontFamily:"Syne,sans-serif",fontWeight:800,
          fontSize:"clamp(2.5rem,7vw,5.5rem)",lineHeight:1.1,marginBottom:"24px"}}>
          <span style={{color:"var(--text)"}}>Let's build something </span>
          <span style={{...GRAD_TEXT}}>great.</span>
        </motion.h2>
        <motion.p variants={fadeUp} style={{fontFamily:"DM Mono,monospace",fontSize:"14px",
          color:"var(--text-muted)",marginBottom:"56px",lineHeight:1.7}}>
          Open to freelance projects, collaborations, and full-time opportunities.<br/>
          Let's connect and create something meaningful together.
        </motion.p>
        <motion.div variants={stagger}
          style={{display:"flex",gap:"12px",justifyContent:"center",flexWrap:"wrap"}}>
          <motion.div variants={scaleIn}>
            <MagneticButton href="mailto:dhifamine18@gmail.com" variant="filled" icon="✉">
              dhifamine18@gmail.com
            </MagneticButton>
          </motion.div>
          <motion.div variants={scaleIn}>
            <MagneticButton href="tel:+21695269193" variant="outline" icon="↗">
              +216 95 269 193
            </MagneticButton>
          </motion.div>
          <motion.div variants={scaleIn}>
            <MagneticButton href="https://linkedin.com/in/mohamed-amine-dhif/" variant="filled" icon="in">
              LinkedIn
            </MagneticButton>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ── FOOTER ────────────────────────────────── */
function Footer() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return (
    <footer style={{background:"var(--bg)",borderTop:"1px solid rgba(0,0,0,0.08)",
      padding:isMobile ? "24px 20px" : "32px 48px",display:"flex",
      flexDirection:isMobile ? "column" : "row",
      justifyContent:"space-between",
      alignItems:"center",flexWrap:"wrap",gap:isMobile ? "8px" : "12px",
      textAlign:"center"}}>
      <span style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:"0.95rem",...GRAD_TEXT}}>
        Mohamed Amine Dhif
      </span>
      <span style={{fontFamily:"DM Mono,monospace",fontSize:"12px",
        color:"var(--text-muted)",letterSpacing:"0.05em"}}>
        Made with React &amp; Framer Motion
      </span>
    </footer>
  );
}

/* ── MOBILE MENU ─────────────────────────── */
function MobileMenu() {
  const [open, setOpen] = useState(false);
  const links = ["About","Skills","Experience","Projects","Education","Contact"];
  return (
    <>
      <motion.button
        onClick={() => setOpen(!open)}
        whileTap={{scale:0.95}}
        style={{
          display:"none",
          position:"fixed", top:"14px", right:"16px", zIndex:101,
          width:"44px", height:"44px", borderRadius:"12px",
          border:"1.5px solid rgba(37,99,235,0.2)",
          background:"rgba(255,255,255,0.95)",
          backdropFilter:"blur(12px)",
          alignItems:"center", justifyContent:"center",
          cursor:"pointer",
        }}
        className="mobile-menu-btn"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round">
          <motion.line x1="3" y1="6" x2="21" y2="6" animate={{rotate: open ? 45 : 0, y: open ? 0 : 0}} />
          <motion.line x1="3" y1="12" x2="21" y2="12" animate={{opacity: open ? 0 : 1}} />
          <motion.line x1="3" y1="18" x2="21" y2="18" animate={{rotate: open ? -45 : 0, y: open ? 0 : 0}} />
        </svg>
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{opacity:0, x:"100%"}}
            animate={{opacity:1, x:0}}
            exit={{opacity:0, x:"100%"}}
            transition={{type:"spring", damping:25, stiffness:200}}
            style={{
              position:"fixed", inset:0, zIndex:100,
              background:"rgba(255,255,255,0.98)",
              backdropFilter:"blur(20px)",
              display:"flex", flexDirection:"column",
              alignItems:"center", justifyContent:"center", gap:"28px",
              padding:"80px 24px",
            }}
          >
            {links.map((l,i) => (
              <motion.a
                key={l}
                href={`#${l.toLowerCase()}`}
                onClick={() => setOpen(false)}
                initial={{opacity:0, y:20}}
                animate={{opacity:1, y:0}}
                transition={{delay:i*0.08}}
                style={{
                  fontFamily:"Syne,sans-serif", fontSize:"2rem",
                  fontWeight:700, ...GRAD_TEXT,
                  textDecoration:"none",
                }}
              >
                {l}
              </motion.a>
            ))}
            <motion.a
              href="https://linkedin.com/in/mohamed-amine-dhif/"
              target="_blank" rel="noopener noreferrer"
              initial={{opacity:0, y:20}}
              animate={{opacity:1, y:0}}
              transition={{delay:0.5}}
              style={{
                marginTop:"20px",
                display:"inline-flex", alignItems:"center", gap:"10px",
                padding:"14px 28px", borderRadius:"50px",
                background:GRAD, color:"#fff",
                fontFamily:"DM Mono,monospace", fontSize:"13px",
                fontWeight:500, letterSpacing:"0.1em", textTransform:"uppercase",
                textDecoration:"none",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              LinkedIn
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ── ROOT ──────────────────────────────────── */
export default function Portfolio() {
  return (
    <div style={{background:"var(--bg)",minHeight:"100vh"}}>
      <MobileMenu />
      <style>{`
        @media(max-width:768px){
          .mobile-menu-btn{display:flex!important}
          nav>div:nth-of-type(2){display:none!important}
          section{padding-left:20px!important;padding-right:20px!important}
          footer{padding:24px 20px!important}
        }
        @media(max-width:860px){
          [data-tl-left]{padding-right:0!important}
          [data-tl-right]{padding-left:0!important}
        }
      `}</style>
      <Nav />
      <Hero />
      <About />
      <Skills />
      <Experience />
      <Projects />
      <Education />
      <Languages />
      <Contact />
      <Footer />
    </div>
  );
}