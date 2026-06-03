import { useEffect, useState, useRef } from "react";
import { useAuthContext } from "@asgardeo/auth-react";
import { useNavigate } from "react-router-dom";
import {
  motion, AnimatePresence,
  useMotionValue, useTransform, useSpring,
} from "framer-motion";
import {
  Zap, Lock, MessageSquare, Video, Paperclip, Smile,
  ArrowRight, MessageCircle, ChevronRight,
  Phone, MoreHorizontal, Shield, Globe, Hash,
} from "lucide-react";

/* ── tokens ──────────────────────────────────────────────────────────────── */
const LIME    = "#D6FF00";
const EMERALD = "#00D084";
const BG      = "#080808";
const sp      = [0.16, 1, 0.3, 1];

/* ── reusable animation helper ───────────────────────────────────────────── */
const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 28 },
  animate:    { opacity: 1, y: 0  },
  transition: { duration: 0.7, ease: sp, delay },
});
const fromRight = (delay = 0) => ({
  initial:    { opacity: 0, x: 48 },
  animate:    { opacity: 1, x: 0  },
  transition: { duration: 0.85, ease: sp, delay },
});
const inView = (delay = 0) => ({
  initial:    { opacity: 0, y: 28 },
  whileInView:{ opacity: 1, y: 0  },
  viewport:   { once: true, margin: "-50px" },
  transition: { duration: 0.65, ease: sp, delay },
});

/* ── 3D tilt ─────────────────────────────────────────────────────────────── */
function Tilt({ children }) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-120,120],[ 7,-7]), { stiffness:200,damping:24 });
  const ry = useSpring(useTransform(mx, [-120,120],[-7, 7]), { stiffness:200,damping:24 });
  return (
    <motion.div
      style={{ rotateX:rx, rotateY:ry, transformPerspective:1400 }}
      onMouseMove={e => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set(e.clientX - r.left  - r.width  / 2);
        my.set(e.clientY - r.top   - r.height / 2);
      }}
      onMouseLeave={() => { mx.set(0); my.set(0); }}
    >
      {children}
    </motion.div>
  );
}

/* ── live chat mockup ────────────────────────────────────────────────────── */
const MSGS = [
  { id:0, me:false, av:"SC", bg:LIME,    text:"New designs are live in Figma 🎨" },
  { id:1, me:false, av:"SC", bg:LIME,    text:"Shipped to staging too 🚀"          },
  { id:2, me:true,  av:"ME", bg:EMERALD, text:"This looks incredible!! ✨"         },
  { id:3, me:false, av:"SC", bg:LIME,    text:"Ready to merge? 👀"                 },
  { id:4, me:true,  av:"ME", bg:EMERALD, text:"Merging now 🔥"                     },
];

function ChatMockup() {
  const [n,   setN]   = useState(1);
  const [dot, setDot] = useState(false);
  useEffect(() => {
    const t = [
      setTimeout(()=>setDot(true),  700),
      setTimeout(()=>{ setDot(false); setN(2); }, 1600),
      setTimeout(()=>setDot(true),  2200),
      setTimeout(()=>{ setDot(false); setN(3); }, 3100),
      setTimeout(()=>setDot(true),  3700),
      setTimeout(()=>{ setDot(false); setN(4); }, 4600),
      setTimeout(()=>setDot(true),  5200),
      setTimeout(()=>{ setDot(false); setN(5); }, 6100),
    ];
    return () => t.forEach(clearTimeout);
  }, []);

  const surf = { background:"rgba(255,255,255,0.03)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.07)" };

  return (
    <div style={{ ...surf, borderRadius:20, overflow:"hidden", boxShadow:"0 2px 4px rgba(0,0,0,0.4),0 24px 60px rgba(0,0,0,0.75),0 80px 160px rgba(0,0,0,0.6),0 0 0 1px rgba(255,255,255,0.05)" }}>
      {/* title bar */}
      <div style={{ background:"rgba(5,5,5,0.9)", borderBottom:"1px solid rgba(255,255,255,0.05)", padding:"10px 16px", display:"flex", alignItems:"center", gap:8 }}>
        <span style={{ width:12,height:12,borderRadius:"50%",background:"#ff5f57",display:"inline-block" }}/>
        <span style={{ width:12,height:12,borderRadius:"50%",background:"#febc2e",display:"inline-block" }}/>
        <span style={{ width:12,height:12,borderRadius:"50%",background:"#28c840",display:"inline-block" }}/>
        <div style={{ flex:1,display:"flex",justifyContent:"center" }}>
          <div style={{ display:"flex",alignItems:"center",gap:6,background:"rgba(255,255,255,0.05)",borderRadius:6,padding:"3px 10px" }}>
            <span style={{ width:6,height:6,borderRadius:"50%",background:LIME,display:"inline-block" }}/>
            <span style={{ fontSize:11,color:"rgba(255,255,255,0.28)" }}>pulsechat.app</span>
          </div>
        </div>
      </div>

      <div style={{ display:"flex", height:390 }}>
        {/* sidebar */}
        <div style={{ width:192,background:"rgba(4,4,4,0.7)",borderRight:"1px solid rgba(255,255,255,0.05)",padding:8,display:"flex",flexDirection:"column",gap:2,flexShrink:0 }}>
          <div style={{ display:"flex",alignItems:"center",gap:6,background:"rgba(255,255,255,0.04)",borderRadius:8,padding:"6px 10px",marginBottom:6 }}>
            <Hash size={11} color="rgba(255,255,255,0.2)"/>
            <span style={{ fontSize:11,color:"rgba(255,255,255,0.18)" }}>Search…</span>
          </div>
          <p style={{ fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.14em",color:"rgba(255,255,255,0.2)",padding:"4px 8px" }}>Messages</p>
          {[
            { av:"SC",bg:LIME,     name:"Sophia Chen", last:"New designs are live…", badge:2,  on:true,  active:true },
            { av:"MW",bg:EMERALD,  name:"Marcus W.",   last:"Meeting at 4pm",        badge:0,  on:true              },
            { av:"ER",bg:"#A6FF4D",name:"Emma R.",     last:"haha okay!! 😄",        badge:1,  on:false             },
            { av:"DT",bg:"#818cf8",name:"Design Team", last:"Components ready",      badge:0,  on:true              },
          ].map((c,i)=>(
            <div key={i} style={{ display:"flex",alignItems:"center",gap:8,padding:"7px 8px",borderRadius:8,background:c.active?`${LIME}0d`:"transparent",cursor:"pointer" }}>
              <div style={{ position:"relative",flexShrink:0 }}>
                <div style={{ width:28,height:28,borderRadius:"50%",background:c.bg,color:"#111",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700 }}>{c.av}</div>
                {c.on && <span style={{ position:"absolute",bottom:-1,right:-1,width:8,height:8,borderRadius:"50%",background:LIME,border:`1.5px solid ${BG}` }}/>}
              </div>
              <div style={{ flex:1,minWidth:0 }}>
                <p style={{ fontSize:11,fontWeight:600,color:c.active?"#fff":"rgba(255,255,255,0.55)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{c.name}</p>
                <p style={{ fontSize:9,color:"rgba(255,255,255,0.25)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{c.last}</p>
              </div>
              {c.badge>0 && <span style={{ fontSize:9,fontWeight:900,background:LIME,color:"#111",borderRadius:9,minWidth:16,height:16,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 3px" }}>{c.badge}</span>}
            </div>
          ))}
        </div>

        {/* chat */}
        <div style={{ flex:1,display:"flex",flexDirection:"column",minWidth:0 }}>
          <div style={{ borderBottom:"1px solid rgba(255,255,255,0.05)",padding:"10px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0 }}>
            <div style={{ display:"flex",alignItems:"center",gap:10 }}>
              <div style={{ position:"relative" }}>
                <div style={{ width:32,height:32,borderRadius:"50%",background:LIME,color:"#111",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700 }}>SC</div>
                <motion.span animate={{ scale:[1,1.5,1],opacity:[1,0.3,1] }} transition={{ duration:2,repeat:Infinity }}
                  style={{ position:"absolute",bottom:-1,right:-1,width:10,height:10,borderRadius:"50%",background:LIME,border:`1.5px solid ${BG}`,display:"inline-block" }}/>
              </div>
              <div>
                <p style={{ fontSize:13,fontWeight:600,color:"#fff" }}>Sophia Chen</p>
                <p style={{ fontSize:10,color:`${LIME}bb` }}>Active now</p>
              </div>
            </div>
            <div style={{ display:"flex",gap:12 }}>
              <Phone size={14} color="rgba(255,255,255,0.22)"/>
              <Video size={14} color="rgba(255,255,255,0.22)"/>
              <MoreHorizontal size={14} color="rgba(255,255,255,0.22)"/>
            </div>
          </div>

          <div style={{ flex:1,display:"flex",flexDirection:"column",justifyContent:"flex-end",gap:10,padding:16,overflow:"hidden" }}>
            <AnimatePresence initial={false}>
              {MSGS.slice(0,n).map(m=>(
                <motion.div key={m.id} initial={{ opacity:0,y:14,scale:0.95 }} animate={{ opacity:1,y:0,scale:1 }} transition={{ duration:0.3,ease:sp }}
                  style={{ display:"flex",alignItems:"flex-end",gap:8,flexDirection:m.me?"row-reverse":"row" }}>
                  {!m.me && <div style={{ width:24,height:24,borderRadius:"50%",background:m.bg,color:"#111",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:700,flexShrink:0 }}>{m.av}</div>}
                  <div style={m.me
                    ? { background:LIME,color:"#111",fontWeight:500,borderRadius:"16px 16px 4px 16px",padding:"8px 14px",fontSize:12,lineHeight:1.5,maxWidth:220 }
                    : { background:"rgba(255,255,255,0.07)",color:"rgba(255,255,255,0.88)",borderRadius:"16px 16px 16px 4px",padding:"8px 14px",fontSize:12,lineHeight:1.5,maxWidth:220 }}>
                    {m.text}
                  </div>
                </motion.div>
              ))}
              {dot && (
                <motion.div key="typing" initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,scale:0.9 }} transition={{ duration:0.2 }}
                  style={{ display:"flex",alignItems:"flex-end",gap:8 }}>
                  <div style={{ width:24,height:24,borderRadius:"50%",background:LIME,color:"#111",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:700,flexShrink:0 }}>SC</div>
                  <div style={{ background:"rgba(255,255,255,0.07)",borderRadius:"16px 16px 16px 4px",padding:"10px 14px",display:"flex",gap:5,alignItems:"center" }}>
                    {[0,1,2].map(i=>(
                      <motion.span key={i} style={{ width:5,height:5,borderRadius:"50%",background:"rgba(255,255,255,0.38)",display:"inline-block" }}
                        animate={{ y:[0,-5,0],opacity:[0.38,1,0.38] }} transition={{ duration:0.75,repeat:Infinity,delay:i*0.16,ease:"easeInOut" }}/>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div style={{ padding:"0 16px 16px",flexShrink:0 }}>
            <div style={{ display:"flex",alignItems:"center",gap:10,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"9px 14px" }}>
              <span style={{ flex:1,fontSize:11,color:"rgba(255,255,255,0.2)" }}>Message Sophia…</span>
              <Smile size={14} color="rgba(255,255,255,0.18)"/>
              <Paperclip size={14} color="rgba(255,255,255,0.18)"/>
              <div style={{ width:28,height:28,borderRadius:8,background:LIME,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,cursor:"pointer" }}>
                <ArrowRight size={14} color="#111"/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── BEAMS BACKGROUND (from 21st.dev / kokonutd) — recolored lime ────────── */
function createBeam(width, height) {
  return {
    x:          Math.random() * width  * 1.5 - width  * 0.25,
    y:          Math.random() * height * 1.5 - height * 0.25,
    width:      30  + Math.random() * 60,
    length:     height * 2.5,
    angle:      -35 + Math.random() * 10,
    speed:      0.6 + Math.random() * 1.2,
    opacity:    0.05 + Math.random() * 0.07,
    hue:        65  + Math.random() * 20,   // lime-green hue range
    pulse:      Math.random() * Math.PI * 2,
    pulseSpeed: 0.02 + Math.random() * 0.03,
  };
}

function BeamsBackground({ children }) {
  const canvasRef  = useRef(null);
  const beamsRef   = useRef([]);
  const rafRef     = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width  = window.innerWidth  * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width  = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
      beamsRef.current = Array.from({ length: 30 }, () =>
        createBeam(canvas.width, canvas.height)
      );
    };
    resize();
    window.addEventListener("resize", resize);

    function resetBeam(beam, i, total) {
      const col     = i % 3;
      const spacing = canvas.width / 3;
      beam.y       = canvas.height + 100;
      beam.x       = col * spacing + spacing / 2 + (Math.random() - 0.5) * spacing * 0.5;
      beam.width   = 100 + Math.random() * 100;
      beam.speed   = 0.5 + Math.random() * 0.4;
      beam.hue     = 65 + (i * 20) / total;
      beam.opacity = 0.07 + Math.random() * 0.05;
      return beam;
    }

    function drawBeam(beam) {
      ctx.save();
      ctx.translate(beam.x, beam.y);
      ctx.rotate((beam.angle * Math.PI) / 180);
      const op = beam.opacity * (0.8 + Math.sin(beam.pulse) * 0.2);
      const g  = ctx.createLinearGradient(0, 0, 0, beam.length);
      g.addColorStop(0,   `hsla(${beam.hue},100%,58%,0)`);
      g.addColorStop(0.1, `hsla(${beam.hue},100%,58%,${op * 0.5})`);
      g.addColorStop(0.4, `hsla(${beam.hue},100%,58%,${op})`);
      g.addColorStop(0.6, `hsla(${beam.hue},100%,58%,${op})`);
      g.addColorStop(0.9, `hsla(${beam.hue},100%,58%,${op * 0.5})`);
      g.addColorStop(1,   `hsla(${beam.hue},100%,58%,0)`);
      ctx.fillStyle = g;
      ctx.fillRect(-beam.width / 2, 0, beam.width, beam.length);
      ctx.restore();
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.filter = "blur(35px)";
      const total = beamsRef.current.length;
      beamsRef.current.forEach((beam, i) => {
        beam.y     -= beam.speed;
        beam.pulse += beam.pulseSpeed;
        if (beam.y + beam.length < -100) resetBeam(beam, i, total);
        drawBeam(beam);
      });
      rafRef.current = requestAnimationFrame(animate);
    }
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div style={{ position: "relative", width: "100%" }}>
      {/* canvas — fixed, behind everything */}
      <canvas
        ref={canvasRef}
        style={{ position:"fixed", top:0, left:0, width:"100%", height:"100%",
                 pointerEvents:"none", zIndex:0, filter:"blur(15px)" }}
      />
      {/* dark veil — tones down beams so content is clear */}
      <div style={{ position:"fixed", inset:0, background:"rgba(8,8,8,0.72)",
                    pointerEvents:"none", zIndex:0 }} />
      {/* subtle pulse on top of veil */}
      <motion.div
        animate={{ opacity: [0, 0.06, 0] }}
        transition={{ duration: 10, ease:"easeInOut", repeat:Infinity }}
        style={{ position:"fixed", inset:0, background:"rgba(214,255,0,0.04)",
                 pointerEvents:"none", zIndex:0 }}
      />
      {/* content */}
      <div style={{ position:"relative", zIndex:1 }}>{children}</div>
    </div>
  );
}

/* ── NAV ─────────────────────────────────────────────────────────────────── */
function Nav({ onSignIn }) {
  return (
    <motion.nav {...fadeUp(0)} style={{ position:"fixed",inset:"0 0 auto",zIndex:50,display:"flex",alignItems:"center",justifyContent:"space-between",height:60,padding:"0 40px",backdropFilter:"blur(28px)",WebkitBackdropFilter:"blur(28px)",background:"rgba(8,8,8,0.8)",borderBottom:"1px solid rgba(255,255,255,0.055)" }}>
      <a href="#" style={{ display:"flex",alignItems:"center",gap:10,textDecoration:"none" }}>
        <div style={{ position:"relative",width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center" }}>
          <MessageCircle size={20} color={LIME} strokeWidth={1.8}/>
          <motion.span animate={{ scale:[1,1.6,1],opacity:[0.6,0,0.6] }} transition={{ duration:2.4,repeat:Infinity }}
            style={{ position:"absolute",inset:0,borderRadius:"50%",border:`1px solid ${LIME}`,display:"block",pointerEvents:"none" }}/>
        </div>
        <span style={{ fontWeight:800,fontSize:15,letterSpacing:"-0.03em",color:"#fff" }}>
          Pulse<span style={{ color:LIME }}>Chat</span>
        </span>
      </a>

      <div style={{ display:"flex",alignItems:"center",gap:2,borderRadius:999,padding:"4px 6px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)" }}>
        {[["Features","#features"],["How it works","#how-it-works"],["Reviews","#reviews"]].map(([l,h])=>(
          <a key={l} href={h} style={{ padding:"5px 16px",borderRadius:999,fontSize:13,fontWeight:500,color:"rgba(255,255,255,0.5)",textDecoration:"none",transition:"color .15s" }}
            onMouseEnter={e=>{ e.target.style.color="#fff"; e.target.style.background="rgba(255,255,255,0.07)"; }}
            onMouseLeave={e=>{ e.target.style.color="rgba(255,255,255,0.5)"; e.target.style.background="transparent"; }}>
            {l}
          </a>
        ))}
      </div>

      <div style={{ display:"flex",alignItems:"center",gap:16 }}>
        <button onClick={onSignIn} style={{ background:"none",border:"none",cursor:"pointer",fontSize:13,fontWeight:500,color:"rgba(255,255,255,0.42)",padding:0,transition:"color .15s" }}
          onMouseEnter={e=>e.target.style.color="#fff"} onMouseLeave={e=>e.target.style.color="rgba(255,255,255,0.42)"}>
          Sign in
        </button>
        <motion.button whileHover={{ scale:1.05,boxShadow:`0 0 30px ${LIME}55` }} whileTap={{ scale:0.95 }}
          onClick={onSignIn} style={{ display:"flex",alignItems:"center",gap:6,fontSize:13,fontWeight:700,borderRadius:999,padding:"7px 16px",background:LIME,color:"#111",border:"none",cursor:"pointer",boxShadow:`0 0 18px ${LIME}30` }}>
          Get started <ChevronRight size={14}/>
        </motion.button>
      </div>
    </motion.nav>
  );
}

/* ── HERO ────────────────────────────────────────────────────────────────── */
function Hero({ onSignIn }) {
  return (
    <section style={{ position:"relative",minHeight:"100vh",display:"flex",alignItems:"center",overflow:"hidden",paddingTop:60 }}>
      {/* glows */}
      <div style={{ position:"absolute",inset:0,pointerEvents:"none",background:`radial-gradient(ellipse 55% 65% at 8% 55%, ${LIME}07 0%, transparent 60%)` }}/>
      <div style={{ position:"absolute",inset:0,pointerEvents:"none",background:`radial-gradient(ellipse 40% 40% at 85% 25%, ${EMERALD}05 0%, transparent 55%)` }}/>
      {/* grid */}
      <div style={{ position:"absolute",inset:0,pointerEvents:"none",backgroundImage:"linear-gradient(rgba(255,255,255,0.016) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.016) 1px,transparent 1px)",backgroundSize:"72px 72px" }}/>

      <div style={{ position:"relative",maxWidth:1280,margin:"0 auto",padding:"80px 40px",width:"100%",display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:80,alignItems:"center" }}
        className="grid-cols-1 lg:grid-cols-2">

        {/* LEFT */}
        <div>
          <motion.div {...fadeUp(0)}>
            <span style={{ display:"inline-flex",alignItems:"center",gap:8,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.13em",borderRadius:999,padding:"5px 14px",border:`1px solid ${LIME}30`,background:`${LIME}0a`,color:LIME }}>
              <motion.span animate={{ opacity:[1,0.35,1] }} transition={{ duration:1.6,repeat:Infinity }} style={{ width:6,height:6,borderRadius:"50%",background:LIME,display:"inline-block",flexShrink:0 }}/>
              Public beta · Free forever
            </span>
          </motion.div>

          <motion.h1 {...fadeUp(0.1)} style={{ fontSize:"clamp(52px,6vw,96px)",fontWeight:800,lineHeight:0.88,letterSpacing:"-0.045em",marginTop:28,marginBottom:24 }}>
            <span style={{ color:"#fff",display:"block" }}>Talk faster.</span>
            <span style={{ display:"block",background:`linear-gradient(118deg,${LIME} 0%,${EMERALD} 100%)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text" }}>
              Think clearer.
            </span>
          </motion.h1>

          <motion.p {...fadeUp(0.2)} style={{ fontSize:17,lineHeight:1.65,color:"rgba(255,255,255,0.42)",maxWidth:440,marginBottom:36 }}>
            PulseChat delivers every message in under 50 ms — real-time threads,
            HD calls, and end-to-end encryption for teams that move fast.
          </motion.p>

          <motion.div {...fadeUp(0.3)} style={{ display:"flex",gap:12,flexWrap:"wrap",marginBottom:44 }}>
            <motion.button whileHover={{ scale:1.05,boxShadow:`0 14px 44px ${LIME}42` }} whileTap={{ scale:0.96 }}
              onClick={onSignIn} style={{ display:"flex",alignItems:"center",gap:8,fontSize:15,fontWeight:700,borderRadius:999,padding:"13px 30px",background:LIME,color:"#111",border:"none",cursor:"pointer",boxShadow:`0 6px 26px ${LIME}2e` }}>
              Start for free <ArrowRight size={16}/>
            </motion.button>
            <motion.button whileHover={{ scale:1.04 }} whileTap={{ scale:0.96 }}
              onClick={onSignIn} style={{ display:"flex",alignItems:"center",gap:8,fontSize:15,fontWeight:500,borderRadius:999,padding:"13px 30px",background:"rgba(255,255,255,0.04)",color:"rgba(255,255,255,0.72)",border:"1px solid rgba(255,255,255,0.1)",cursor:"pointer" }}>
              See how it works
            </motion.button>
          </motion.div>

          <motion.div {...fadeUp(0.4)} style={{ display:"flex",alignItems:"center",gap:14 }}>
            <div style={{ display:"flex" }}>
              {[LIME,EMERALD,"#A6FF4D","#818cf8","#f59e0b"].map((c,i)=>(
                <div key={i} style={{ width:36,height:36,borderRadius:"50%",background:c,color:"#111",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,border:`2.5px solid ${BG}`,marginLeft:i?-10:0,zIndex:5-i }}>
                  {["JK","AT","ML","SR","DV"][i]}
                </div>
              ))}
            </div>
            <div>
              <p style={{ fontSize:13,fontWeight:600,color:"#fff" }}>Loved by 2M+ users</p>
              <div style={{ display:"flex",alignItems:"center",gap:2,marginTop:2 }}>
                {"★★★★★".split("").map((s,i)=><span key={i} style={{ color:LIME,fontSize:11 }}>{s}</span>)}
                <span style={{ fontSize:11,color:"rgba(255,255,255,0.32)",marginLeft:6 }}>5.0 avg rating</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* RIGHT */}
        <motion.div {...fromRight(0.25)} style={{ position:"relative" }}>
          <div style={{ position:"absolute",inset:-48,pointerEvents:"none",background:`radial-gradient(ellipse 70% 60% at 55% 45%, ${LIME}0e 0%, transparent 70%)` }}/>

          <motion.div animate={{ y:[0,-10,0] }} transition={{ duration:6,repeat:Infinity,ease:"easeInOut",delay:0.5 }} style={{ position:"absolute",top:-20,right:-12,zIndex:20 }}>
            <div style={{ display:"inline-flex",alignItems:"center",gap:8,borderRadius:14,padding:"7px 12px",background:"rgba(255,255,255,0.04)",backdropFilter:"blur(20px)",border:`1px solid ${LIME}25`,boxShadow:`0 8px 32px rgba(0,0,0,0.5)` }}>
              <span style={{ fontSize:15 }}>🔥</span>
              <span style={{ fontSize:12,fontWeight:600,color:"#fff" }}>Just shipped!</span>
            </div>
          </motion.div>

          <motion.div animate={{ y:[0,8,0] }} transition={{ duration:6.5,repeat:Infinity,ease:"easeInOut",delay:1 }} style={{ position:"absolute",bottom:-16,left:-20,zIndex:20 }}>
            <div style={{ display:"inline-flex",alignItems:"center",gap:8,borderRadius:12,padding:"7px 12px",background:"rgba(255,255,255,0.04)",backdropFilter:"blur(20px)",border:`1px solid ${EMERALD}30`,boxShadow:"0 8px 32px rgba(0,0,0,0.5)" }}>
              <motion.span animate={{ scale:[1,1.4,1],opacity:[1,0.4,1] }} transition={{ duration:1.5,repeat:Infinity }} style={{ width:8,height:8,borderRadius:"50%",background:LIME,display:"inline-block",flexShrink:0 }}/>
              <span style={{ fontSize:12,fontWeight:700,color:LIME }}>24ms</span>
              <span style={{ fontSize:11,color:"rgba(255,255,255,0.4)" }}>avg latency</span>
            </div>
          </motion.div>

          <Tilt><ChatMockup /></Tilt>
        </motion.div>
      </div>
    </section>
  );
}

/* ── LOGO MARQUEE ────────────────────────────────────────────────────────── */
/* SVG brand marks — inline so no external images needed */
const LOGOS = [
  { name:"Figma", mark:(
    <svg width="12" height="18" viewBox="0 0 38 57" fill="none">
      <path d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z" fill="#1ABCFE"/>
      <path d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 0 1-19 0z" fill="#0ACF83"/>
      <path d="M19 0h9.5a9.5 9.5 0 0 1 0 19H19V0z" fill="#FF7262"/>
      <path d="M0 9.5A9.5 9.5 0 0 1 9.5 0H19v19H9.5A9.5 9.5 0 0 1 0 9.5z" fill="#F24E1E"/>
      <path d="M0 28.5A9.5 9.5 0 0 1 9.5 19H19v19H9.5A9.5 9.5 0 0 1 0 28.5z" fill="#A259FF"/>
    </svg>
  )},
  { name:"Vercel", mark:(
    <svg width="18" height="16" viewBox="0 0 76 65" fill="none">
      <path d="M37.5 0L75 65H0Z" fill="white"/>
    </svg>
  )},
  { name:"Stripe", mark:(
    <svg width="18" height="18" viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="6" fill="#635BFF"/>
      <path d="M20.2 15c-3 0-4.8 1.4-4.8 3.5 0 4.4 6.8 2.8 6.8 5.3 0 .9-.8 1.5-2.2 1.5-2 0-3.5-1-4.4-2.3l-2.1 2c1.2 1.7 3.2 2.8 6.4 2.8 3.3 0 5.3-1.6 5.3-4 0-4.5-6.8-3-6.8-5.3 0-.8.7-1.3 1.8-1.3 1.5 0 3 .7 3.7 1.8l2-2C24.7 15.9 22.8 15 20.2 15z" fill="white"/>
    </svg>
  )},
  { name:"Linear", mark:(
    <svg width="18" height="18" viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="46" fill="#5E6AD2"/>
      <path d="M18 68L68 18M18 68l18-2M18 68l2-18M68 18l14 14M68 18l-14 14" stroke="white" strokeWidth="8" strokeLinecap="round"/>
    </svg>
  )},
  { name:"Notion", mark:(
    <svg width="18" height="18" viewBox="0 0 100 100" fill="none">
      <rect width="100" height="100" rx="14" fill="white"/>
      <path d="M28 22h30l16 16v40a4 4 0 0 1-4 4H28a4 4 0 0 1-4-4V26a4 4 0 0 1 4-4z" fill="#F7F6F3"/>
      <path d="M58 22l16 16H62a4 4 0 0 1-4-4V22z" fill="#E3E2E0"/>
      <path d="M36 42h28M36 52h28M36 62h18" stroke="#37352F" strokeWidth="4" strokeLinecap="round"/>
    </svg>
  )},
  { name:"Supabase", mark:(
    <svg width="18" height="20" viewBox="0 0 109 113" fill="none">
      <path d="M63.7 110.3c-2.8 3.6-8.7 1.7-8.9-2.9L53.2 62H97c3.8 0 5.9 4.4 3.5 7.3L63.7 110.3z" fill="url(#sb1)"/>
      <path d="M45.3 2.7c2.8-3.6 8.7-1.7 8.9 2.9L55 51H11c-3.8 0-5.9-4.4-3.5-7.3L45.3 2.7z" fill="#3ECF8E"/>
      <defs><linearGradient id="sb1" x1="53" y1="54" x2="94" y2="71" gradientUnits="userSpaceOnUse"><stop stopColor="#249361"/><stop offset="1" stopColor="#3ECF8E"/></linearGradient></defs>
    </svg>
  )},
  { name:"GitHub", mark:(
    <svg width="20" height="20" viewBox="0 0 98 96" fill="none">
      <path fillRule="evenodd" clipRule="evenodd" d="M49 0C21.9 0 0 22 0 49.1c0 21.7 14 40.1 33.4 46.6 2.4.5 3.3-1.1 3.3-2.4v-8.4c-13.5 3-16.4-6.5-16.4-6.5-2.2-5.6-5.4-7.1-5.4-7.1-4.4-3 .3-3 .3-3 4.9.4 7.5 5 7.5 5 4.3 7.4 11.4 5.3 14.1 4 .4-3.1 1.7-5.3 3.1-6.5-10.8-1.2-22.1-5.4-22.1-24.1 0-5.3 1.9-9.7 5-13.1-.5-1.2-2.2-6.2.5-12.9 0 0 4.1-1.3 13.4 5 3.9-1.1 8-1.6 12.2-1.6 4.1 0 8.3.5 12.2 1.6 9.3-6.3 13.4-5 13.4-5 2.7 6.7 1 11.7.5 12.9 3.1 3.4 5 7.8 5 13.1 0 18.8-11.4 22.9-22.2 24.1 1.7 1.5 3.3 4.5 3.3 9v13.3c0 1.3.9 2.9 3.4 2.4C84 89.1 98 70.8 98 49.1 98 22 76.1 0 49 0z" fill="white"/>
    </svg>
  )},
  { name:"Tailwind", mark:(
    <svg width="22" height="14" viewBox="0 0 54 33" fill="none">
      <path fillRule="evenodd" clipRule="evenodd" d="M27 0C19.8 0 15.3 3.6 13.5 10.8c2.7-3.6 5.85-4.95 9.45-4.05 2.054.514 3.522 2.004 5.147 3.653C30.744 12.672 33.179 15.3 38.7 15.3c7.2 0 11.7-3.6 13.5-10.8-2.7 3.6-5.85 4.95-9.45 4.05-2.054-.514-3.522-2.004-5.147-3.653C35.456 2.628 33.021 0 27 0zM13.5 15.3C6.3 15.3 1.8 18.9 0 26.1c2.7-3.6 5.85-4.95 9.45-4.05 2.054.514 3.522 2.004 5.147 3.653C17.244 27.972 19.679 30.6 25.2 30.6c7.2 0 11.7-3.6 13.5-10.8-2.7 3.6-5.85 4.95-9.45 4.05-2.054-.514-3.522-2.004-5.147-3.653C21.956 17.928 19.521 15.3 13.5 15.3z" fill="#38BDF8"/>
    </svg>
  )},
  { name:"Resend", mark:(
    <svg width="18" height="18" viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="8" fill="white"/>
      <path d="M10 12h12a8 8 0 0 1 0 16H10V12zm0 9h11" stroke="#111" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M22 28l8-4-8-4" stroke="#111" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )},
  { name:"Railway", mark:(
    <svg width="18" height="18" viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="8" fill="#B044F9"/>
      <rect x="12" y="8" width="5" height="24" rx="2" fill="white"/>
      <rect x="22" y="8" width="5" height="24" rx="2" fill="white"/>
      <rect x="8" y="17" width="24" height="5" rx="2" fill="white"/>
    </svg>
  )},
];

function Marquee() {
  const items = [...LOGOS,...LOGOS,...LOGOS];
  return (
    <div style={{ overflow:"hidden",position:"relative",borderTop:"1px solid rgba(255,255,255,0.055)",borderBottom:"1px solid rgba(255,255,255,0.055)",background:"rgba(255,255,255,0.014)",padding:"18px 0" }}>
      <div style={{ position:"absolute",top:0,bottom:0,left:0,width:120,background:`linear-gradient(90deg,${BG},transparent)`,zIndex:10,pointerEvents:"none" }}/>
      <div style={{ position:"absolute",top:0,bottom:0,right:0,width:120,background:`linear-gradient(-90deg,${BG},transparent)`,zIndex:10,pointerEvents:"none" }}/>

      <motion.div animate={{ x:["0%","-33.33%"] }} transition={{ duration:36,repeat:Infinity,ease:"linear" }}
        style={{ display:"flex",gap:52,whiteSpace:"nowrap",alignItems:"center" }}>
        {items.map((L,i)=>(
          <span key={i} style={{ display:"inline-flex",alignItems:"center",gap:9,userSelect:"none",opacity:0.55 }}>
            {L.mark}
            <span style={{ fontSize:13,fontWeight:600,letterSpacing:"0.05em",color:"rgba(255,255,255,0.7)",textTransform:"uppercase" }}>{L.name}</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ── FEATURES bento ──────────────────────────────────────────────────────── */
const GLASS = {
  background:"rgba(255,255,255,0.028)",
  backdropFilter:"blur(28px)",
  WebkitBackdropFilter:"blur(28px)",
  border:"1px solid rgba(255,255,255,0.07)",
  borderRadius:24,
};

function FeatureCard({ accent=LIME, delay=0, span=1, minH=280, children }) {
  return (
    <motion.div
      {...inView(delay)}
      whileHover={{ borderColor:`${accent}40`, boxShadow:`0 0 60px ${accent}0e, inset 0 1px 0 rgba(255,255,255,0.08)`, y:-6 }}
      transition={{ duration:0.25 }}
      style={{ ...GLASS, padding:36, position:"relative", overflow:"hidden", minHeight:minH,
        gridColumn: span>1 ? `span ${span}` : undefined, display:"flex", flexDirection:"column" }}
    >
      {/* top shine line */}
      <div style={{ position:"absolute",top:0,left:0,right:0,height:1,
        background:`linear-gradient(90deg,transparent 0%,${accent}30 50%,transparent 100%)`,pointerEvents:"none" }}/>
      {/* corner glow */}
      <div style={{ position:"absolute",top:0,right:0,width:200,height:200,pointerEvents:"none",
        background:`radial-gradient(circle at top right,${accent}07 0%,transparent 65%)` }}/>
      {children}
    </motion.div>
  );
}

function Features() {
  return (
    <section id="features" style={{ padding:"120px 0" }}>
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 40px" }}>

        {/* header */}
        <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:64, flexWrap:"wrap", gap:24 }}>
          <div>
            <motion.p {...inView(0)} style={{ fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.2em",color:LIME,marginBottom:14 }}>
              Features
            </motion.p>
            <motion.h2 {...inView(0.07)} style={{ fontSize:"clamp(38px,5vw,64px)",fontWeight:800,lineHeight:0.9,letterSpacing:"-0.045em",maxWidth:560 }}>
              Everything you need.<br/>
              <span style={{ color:"rgba(255,255,255,0.18)" }}>Nothing you don't.</span>
            </motion.h2>
          </div>
          <motion.p {...inView(0.12)} style={{ fontSize:15,lineHeight:1.7,color:"rgba(255,255,255,0.38)",maxWidth:320 }}>
            Designed for speed. Built for people. PulseChat keeps your team in perfect sync.
          </motion.p>
        </div>

        {/* bento grid — 3 cols */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>

          {/* ① Speed — spans 2, tall */}
          <FeatureCard accent={LIME} delay={0} span={2} minH={320}>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:28 }}>
              <div style={{ width:48,height:48,borderRadius:14,background:`${LIME}12`,border:`1px solid ${LIME}28`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                <Zap size={22} color={LIME}/>
              </div>
              <div>
                <h3 style={{ fontSize:21,fontWeight:700,letterSpacing:"-0.03em",marginBottom:4 }}>Sub-50ms delivery</h3>
                <p style={{ fontSize:13,color:"rgba(255,255,255,0.38)",lineHeight:1.5,maxWidth:320 }}>
                  Persistent WebSocket keeps every message instant. Zero polling, zero delays.
                </p>
              </div>
            </div>

            {/* live latency + bar chart */}
            <div style={{ flex:1, display:"flex", alignItems:"flex-end", justifyContent:"space-between", gap:20 }}>
              <div>
                <div style={{ fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.12em",color:"rgba(255,255,255,0.25)",marginBottom:8 }}>Live latency</div>
                <div style={{ display:"flex",alignItems:"baseline",gap:6 }}>
                  <motion.span
                    animate={{ opacity:[1,0.6,1] }} transition={{ duration:2,repeat:Infinity }}
                    style={{ fontSize:52,fontWeight:800,letterSpacing:"-0.05em",color:LIME,lineHeight:1 }}>
                    24
                  </motion.span>
                  <span style={{ fontSize:20,fontWeight:600,color:`${LIME}88` }}>ms</span>
                </div>
                <div style={{ display:"flex",alignItems:"center",gap:8,marginTop:12 }}>
                  <motion.span animate={{ scale:[1,1.5,1],opacity:[1,0.3,1] }} transition={{ duration:1.4,repeat:Infinity }}
                    style={{ width:8,height:8,borderRadius:"50%",background:LIME,display:"inline-block" }}/>
                  <span style={{ fontSize:12,color:"rgba(255,255,255,0.35)" }}>Live · avg over 24h</span>
                </div>
              </div>
              {/* bar chart */}
              <div style={{ display:"flex",alignItems:"flex-end",gap:5,paddingBottom:4 }}>
                {[28,52,38,70,45,88,58,95,67,82,74,90].map((h,i)=>(
                  <motion.div key={i}
                    style={{ width:10,borderRadius:"4px 4px 0 0",background:`linear-gradient(to top,${LIME}30,${LIME}80)` }}
                    animate={{ height:[`${h*.48}px`,`${h*.74}px`,`${h*.48}px`] }}
                    transition={{ duration:1.8+i*.11,repeat:Infinity,ease:"easeInOut",delay:i*.08 }}/>
                ))}
              </div>
            </div>
          </FeatureCard>

          {/* ② Encrypted — 1 col */}
          <FeatureCard accent={LIME} delay={0.06} minH={320}>
            <div style={{ width:48,height:48,borderRadius:14,background:`${LIME}12`,border:`1px solid ${LIME}28`,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:20 }}>
              <Lock size={22} color={LIME}/>
            </div>
            <h3 style={{ fontSize:21,fontWeight:700,letterSpacing:"-0.03em",marginBottom:10 }}>End-to-end encrypted</h3>
            <p style={{ fontSize:13,color:"rgba(255,255,255,0.38)",lineHeight:1.6,marginBottom:"auto" }}>
              Every message encrypted before it leaves your device. Not even we can read them.
            </p>
            {/* animated lock rings */}
            <div style={{ display:"flex",justifyContent:"center",paddingTop:28 }}>
              <div style={{ position:"relative",width:72,height:72,display:"flex",alignItems:"center",justifyContent:"center" }}>
                {[1,1.6,2.2].map((s,i)=>(
                  <motion.div key={i}
                    animate={{ scale:[1,s], opacity:[0.6-i*0.15,0] }}
                    transition={{ duration:2.5,repeat:Infinity,delay:i*0.7,ease:"easeOut" }}
                    style={{ position:"absolute",inset:0,borderRadius:"50%",border:`1px solid ${LIME}50` }}/>
                ))}
                <motion.div animate={{ boxShadow:[`0 0 0 ${LIME}00`,`0 0 36px ${LIME}60`,`0 0 0 ${LIME}00`] }}
                  transition={{ duration:2.8,repeat:Infinity }}
                  style={{ width:52,height:52,borderRadius:"50%",background:`${LIME}10`,border:`1px solid ${LIME}35`,display:"flex",alignItems:"center",justifyContent:"center" }}>
                  <Lock size={22} color={LIME}/>
                </motion.div>
              </div>
            </div>
          </FeatureCard>

          {/* ③ Threads — 1 col */}
          <FeatureCard accent={LIME} delay={0.04} minH={260}>
            <div style={{ width:48,height:48,borderRadius:14,background:`${LIME}12`,border:`1px solid ${LIME}28`,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:20 }}>
              <MessageSquare size={22} color={LIME}/>
            </div>
            <h3 style={{ fontSize:21,fontWeight:700,letterSpacing:"-0.03em",marginBottom:10 }}>Threaded replies</h3>
            <p style={{ fontSize:13,color:"rgba(255,255,255,0.38)",lineHeight:1.6,marginBottom:20 }}>
              Reply in context. Keep conversations focused without cluttering the main feed.
            </p>
            {/* mini thread viz */}
            <div style={{ display:"flex",flexDirection:"column",gap:7 }}>
              {[
                { w:"85%", indent:0,   c:"rgba(255,255,255,0.12)", h:10 },
                { w:"65%", indent:0,   c:"rgba(255,255,255,0.08)", h:10 },
                { w:"72%", indent:20,  c:`${LIME}22`,              h:10 },
                { w:"55%", indent:20,  c:`${LIME}18`,              h:10 },
                { w:"60%", indent:20,  c:`${LIME}14`,              h:10 },
              ].map((r,i)=>(
                <div key={i} style={{ display:"flex",alignItems:"center",gap:6,paddingLeft:r.indent }}>
                  {r.indent>0 && <div style={{ width:10,height:10,borderLeft:`1.5px solid ${LIME}40`,borderBottom:`1.5px solid ${LIME}40`,borderRadius:"0 0 0 4px",flexShrink:0,marginBottom:4 }}/>}
                  <motion.div style={{ height:r.h,borderRadius:5,background:r.c }}
                    initial={{ width:0 }} whileInView={{ width:r.w }} viewport={{ once:true }}
                    transition={{ duration:0.6,delay:i*0.1,ease:sp }}/>
                </div>
              ))}
            </div>
          </FeatureCard>

          {/* ④ Reactions — spans 2 */}
          <FeatureCard accent={LIME} delay={0.1} span={2} minH={240}>
            <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:20 }}>
              <div>
                <div style={{ width:48,height:48,borderRadius:14,background:`${LIME}12`,border:`1px solid ${LIME}28`,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:20 }}>
                  <Smile size={22} color={LIME}/>
                </div>
                <h3 style={{ fontSize:21,fontWeight:700,letterSpacing:"-0.03em",marginBottom:10 }}>Reactions & emoji</h3>
                <p style={{ fontSize:13,color:"rgba(255,255,255,0.38)",lineHeight:1.6,maxWidth:280 }}>
                  Express yourself instantly. One emoji reaction speaks louder than a one-word reply.
                </p>
              </div>
              {/* floating emoji with reaction counts */}
              <div style={{ display:"flex",flexWrap:"wrap",gap:10,paddingTop:8,maxWidth:220,justifyContent:"flex-end" }}>
                {[
                  { e:"❤️", n:12, delay:0    },
                  { e:"🔥", n:8,  delay:0.3  },
                  { e:"✨", n:24, delay:0.6  },
                  { e:"🚀", n:5,  delay:0.9  },
                  { e:"👀", n:17, delay:1.2  },
                  { e:"💯", n:3,  delay:1.5  },
                ].map(({ e,n,delay:d },i)=>(
                  <motion.div key={i}
                    whileHover={{ scale:1.2,y:-4 }}
                    animate={{ y:[0,i%2===0?-4:4,0] }}
                    transition={{ duration:2.5+i*.3,repeat:Infinity,ease:"easeInOut",delay:d }}
                    style={{ display:"flex",alignItems:"center",gap:5,padding:"5px 10px",borderRadius:999,background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.1)",cursor:"pointer" }}>
                    <span style={{ fontSize:16 }}>{e}</span>
                    <span style={{ fontSize:12,fontWeight:600,color:"rgba(255,255,255,0.55)" }}>{n}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </FeatureCard>

          {/* ⑤ Files — 1 col */}
          <FeatureCard accent="#818cf8" delay={0.08} minH={240}>
            <div style={{ width:48,height:48,borderRadius:14,background:"rgba(129,140,248,0.1)",border:"1px solid rgba(129,140,248,0.25)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:20 }}>
              <Paperclip size={22} color="#818cf8"/>
            </div>
            <h3 style={{ fontSize:21,fontWeight:700,letterSpacing:"-0.03em",marginBottom:10 }}>Smart file sharing</h3>
            <p style={{ fontSize:13,color:"rgba(255,255,255,0.38)",lineHeight:1.6,marginBottom:20 }}>
              Drop any file. Preview inline without leaving the conversation.
            </p>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
              {[["PDF","#f87171","doc.pdf","2.4 MB"],["PNG",LIME,"design.png","840 KB"],["MP4","#a78bfa","demo.mp4","18 MB"],["ZIP","rgba(255,255,255,0.4)","assets.zip","5.1 MB"]].map(([t,c,name,size],j)=>(
                <div key={j} style={{ padding:"8px 10px",borderRadius:10,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",display:"flex",flexDirection:"column",gap:4 }}>
                  <span style={{ fontSize:9,fontWeight:800,color:c,letterSpacing:"0.08em" }}>{t}</span>
                  <span style={{ fontSize:11,fontWeight:500,color:"rgba(255,255,255,0.6)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{name}</span>
                  <span style={{ fontSize:10,color:"rgba(255,255,255,0.28)" }}>{size}</span>
                </div>
              ))}
            </div>
          </FeatureCard>

          {/* ⑥ Cross-platform — spans 2 */}
          <FeatureCard accent={EMERALD} delay={0.12} span={2} minH={200}>
            <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:20 }}>
              <div>
                <div style={{ width:48,height:48,borderRadius:14,background:`${EMERALD}10`,border:`1px solid ${EMERALD}28`,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:20 }}>
                  <Globe size={22} color={EMERALD}/>
                </div>
                <h3 style={{ fontSize:21,fontWeight:700,letterSpacing:"-0.03em",marginBottom:10 }}>Works everywhere</h3>
                <p style={{ fontSize:13,color:"rgba(255,255,255,0.38)",lineHeight:1.6,maxWidth:280 }}>
                  Web, desktop, and mobile. Your conversations sync instantly across every device you own.
                </p>
              </div>
              {/* device silhouettes */}
              <div style={{ display:"flex",alignItems:"flex-end",gap:12,paddingBottom:4,flexShrink:0 }}>
                {[
                  { w:28,h:48,r:6,  label:"Mobile"  },
                  { w:52,h:38,r:8,  label:"Tablet"  },
                  { w:72,h:46,r:8,  label:"Desktop" },
                ].map((d,i)=>(
                  <motion.div key={i}
                    animate={{ y:[0,i%2===0?-3:3,0] }}
                    transition={{ duration:3+i*.8,repeat:Infinity,ease:"easeInOut",delay:i*.4 }}
                    style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:6 }}>
                    <div style={{ width:d.w,height:d.h,borderRadius:d.r,background:"rgba(255,255,255,0.06)",border:`1px solid ${EMERALD}30`,display:"flex",alignItems:"center",justifyContent:"center" }}>
                      <div style={{ width:"60%",height:"60%",borderRadius:d.r*.6,background:`${EMERALD}20`,border:`1px solid ${EMERALD}40` }}/>
                    </div>
                    <span style={{ fontSize:9,color:`${EMERALD}80`,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.1em" }}>{d.label}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </FeatureCard>

          {/* ⑦ Notifications — 1 col */}
          <FeatureCard accent={LIME} delay={0.15} minH={200}>
            <div style={{ width:48,height:48,borderRadius:14,background:`${LIME}12`,border:`1px solid ${LIME}28`,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:20 }}>
              <MessageCircle size={22} color={LIME}/>
            </div>
            <h3 style={{ fontSize:21,fontWeight:700,letterSpacing:"-0.03em",marginBottom:10 }}>Smart notifications</h3>
            <p style={{ fontSize:13,color:"rgba(255,255,255,0.38)",lineHeight:1.6,marginBottom:20 }}>
              Only get notified when it matters. Intelligent filters cut through the noise.
            </p>
            {/* notification pill stack */}
            {[
              { text:"Sophia mentioned you", t:"2s ago",  dot:LIME    },
              { text:"Marcus reacted: 🔥",   t:"1m ago",  dot:EMERALD },
            ].map((n,i)=>(
              <motion.div key={i}
                initial={{ opacity:0, x:-10 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }}
                transition={{ duration:0.5, delay:i*0.15+0.2, ease:sp }}
                style={{ display:"flex",alignItems:"center",gap:10,padding:"8px 12px",borderRadius:10,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",marginBottom:8 }}>
                <span style={{ width:7,height:7,borderRadius:"50%",background:n.dot,flexShrink:0,display:"inline-block" }}/>
                <span style={{ fontSize:12,color:"rgba(255,255,255,0.65)",flex:1 }}>{n.text}</span>
                <span style={{ fontSize:10,color:"rgba(255,255,255,0.28)",flexShrink:0 }}>{n.t}</span>
              </motion.div>
            ))}
          </FeatureCard>

        </div>
      </div>
    </section>
  );
}

/* ── HOW IT WORKS ────────────────────────────────────────────────────────── */
function HowItWorks() {
  const steps = [
    { n:"01", title:"Create your account", body:"Sign up in 30 seconds with just your email. No credit card, no commitment — free forever on the base plan." },
    { n:"02", title:"Invite your people",  body:"Share a link or search by username. Build group chats and channels in seconds." },
    { n:"03", title:"Feel the pulse",      body:"Messages, files, reactions, calls — all in one place. Your team in sync from the very first message." },
  ];
  return (
    <section id="how-it-works" style={{ padding:"112px 0",borderTop:"1px solid rgba(255,255,255,0.055)",position:"relative",overflow:"hidden" }}>
      <div style={{ position:"absolute",inset:0,pointerEvents:"none",background:`radial-gradient(ellipse 55% 40% at 50% 100%,${LIME}04 0%,transparent 68%)` }}/>
      <div style={{ maxWidth:1280,margin:"0 auto",padding:"0 40px" }}>
        <motion.p {...inView(0)} style={{ fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.18em",color:LIME,marginBottom:16 }}>How it works</motion.p>
        <motion.h2 {...inView(0.08)} style={{ fontSize:"clamp(36px,4.5vw,60px)",fontWeight:800,lineHeight:0.92,letterSpacing:"-0.04em",marginBottom:64 }}>
          Up and chatting <span style={{ color:"rgba(255,255,255,0.2)" }}>in minutes.</span>
        </motion.h2>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12 }}>
          {steps.map((s,i)=>(
            <motion.div key={i} {...inView(i*0.14)} whileHover={{ borderColor:`${LIME}28`,y:-4 }} transition={{ duration:0.22 }}
              style={{ ...GLASS,padding:32,position:"relative",minHeight:220 }}>
              <div style={{ position:"absolute",top:0,inset:"0 auto auto 0",width:"100%",height:1,background:`linear-gradient(90deg,transparent,${LIME}20,transparent)` }}/>
              <div style={{ fontSize:80,fontWeight:800,lineHeight:1,letterSpacing:"-0.06em",color:"rgba(255,255,255,0.022)",position:"absolute",top:12,right:20,userSelect:"none" }}>{s.n}</div>
              <div style={{ width:40,height:40,borderRadius:"50%",background:`${LIME}0f`,border:`1px solid ${LIME}2e`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:LIME,marginBottom:24 }}>{s.n}</div>
              <h3 style={{ fontSize:18,fontWeight:700,letterSpacing:"-0.02em",marginBottom:12 }}>{s.title}</h3>
              <p style={{ fontSize:14,lineHeight:1.65,color:"rgba(255,255,255,0.42)" }}>{s.body}</p>
              {i<2 && (
                <div style={{ position:"absolute",right:-21,top:"50%",transform:"translateY(-50%)",width:40,height:40,borderRadius:"50%",background:BG,border:"1px solid rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:10 }}>
                  <ChevronRight size={16} color={`${LIME}70`}/>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── TESTIMONIALS ────────────────────────────────────────────────────────── */
const REVIEWS = [
  { q:"Finally a chat app that doesn't feel like 2015. The interface is stunning and it's genuinely, measurably fast.",    name:"Jordan Kim",   role:"Product Designer · Figma",   av:"JK", ac:LIME    },
  { q:"We migrated our entire engineering team off Slack in a weekend. Threaded replies alone were worth the switch.",     name:"Aisha Torres", role:"Engineering Lead · Vercel",  av:"AT", ac:EMERALD },
  { q:"I've never had a video call drop mid-sentence. My team spans 6 time zones. PulseChat just works, every time.",     name:"Marco Levi",   role:"Founder · Launchpad Studio", av:"ML", ac:"#A6FF4D"},
];

function Testimonials() {
  return (
    <section id="reviews" style={{ padding:"112px 0",borderTop:"1px solid rgba(255,255,255,0.055)" }}>
      <div style={{ maxWidth:1280,margin:"0 auto",padding:"0 40px" }}>
        <motion.p {...inView(0)} style={{ fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.18em",color:LIME,marginBottom:16 }}>Reviews</motion.p>
        <motion.h2 {...inView(0.08)} style={{ fontSize:"clamp(36px,4.5vw,60px)",fontWeight:800,lineHeight:0.92,letterSpacing:"-0.04em",marginBottom:56 }}>
          People are talking. <span style={{ color:"rgba(255,255,255,0.2)" }}>Loudly.</span>
        </motion.h2>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16 }}>
          {REVIEWS.map((r,i)=>(
            <motion.div key={i} {...inView(i*0.12)} whileHover={{ borderColor:`${r.ac}30`,boxShadow:`0 0 50px ${r.ac}0a`,y:-6 }} transition={{ duration:0.22 }}
              style={{ ...GLASS,padding:28,position:"relative",overflow:"hidden",cursor:"default",display:"flex",flexDirection:"column",minHeight:220 }}>
              <div style={{ position:"absolute",top:0,inset:"0 auto auto 0",width:"100%",height:1,background:`linear-gradient(90deg,transparent,${r.ac}50,transparent)` }}/>
              <div style={{ display:"flex",gap:2,marginBottom:18 }}>
                {"★★★★★".split("").map((s,k)=><span key={k} style={{ color:r.ac,fontSize:13 }}>{s}</span>)}
              </div>
              <p style={{ fontSize:14,lineHeight:1.65,color:"rgba(255,255,255,0.68)",flex:1,marginBottom:24 }}>"{r.q}"</p>
              <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                <div style={{ width:40,height:40,borderRadius:"50%",background:r.ac,color:"#111",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,flexShrink:0 }}>{r.av}</div>
                <div>
                  <p style={{ fontSize:13,fontWeight:700,color:"#fff" }}>{r.name}</p>
                  <p style={{ fontSize:11,color:"rgba(255,255,255,0.32)",marginTop:2 }}>{r.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── CTA ─────────────────────────────────────────────────────────────────── */
function CTA({ onSignIn }) {
  return (
    <section style={{ position:"relative",overflow:"hidden",borderTop:"1px solid rgba(255,255,255,0.055)",padding:"144px 0" }}>
      {/* MASSIVE lime radial glow */}
      <motion.div initial={{ opacity:0,scale:0.6 }} whileInView={{ opacity:1,scale:1 }} viewport={{ once:true }} transition={{ duration:1.4,ease:sp }}
        style={{ position:"absolute",width:1000,height:1000,top:"50%",left:"50%",transform:"translate(-50%,-54%)",background:`radial-gradient(circle,${LIME}1c 0%,${LIME}0b 28%,${LIME}03 52%,transparent 68%)`,filter:"blur(1px)",pointerEvents:"none" }}/>
      <div style={{ position:"absolute",width:440,height:440,top:"50%",left:"50%",transform:"translate(-50%,-54%)",background:`radial-gradient(circle,${LIME}26 0%,transparent 65%)`,pointerEvents:"none" }}/>
      {/* horizontal beam */}
      <div style={{ position:"absolute",top:"50%",left:0,right:0,height:1,background:`linear-gradient(90deg,transparent 0%,${LIME}18 35%,${LIME}32 50%,${LIME}18 65%,transparent 100%)`,pointerEvents:"none" }}/>

      <div style={{ position:"relative",maxWidth:900,margin:"0 auto",padding:"0 40px",textAlign:"center" }}>
        <motion.p {...inView(0)} style={{ fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.18em",color:LIME,marginBottom:24 }}>Get started today</motion.p>
        <motion.h2 {...inView(0.08)} style={{ fontSize:"clamp(52px,8vw,110px)",fontWeight:800,lineHeight:0.86,letterSpacing:"-0.045em",marginBottom:24 }}>
          <span style={{ color:"#fff",display:"block" }}>Ready to feel</span>
          <span style={{ display:"block",background:`linear-gradient(120deg,${LIME} 0%,${EMERALD} 100%)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text" }}>
            the pulse?
          </span>
        </motion.h2>
        <motion.p {...inView(0.16)} style={{ fontSize:17,lineHeight:1.65,color:"rgba(255,255,255,0.38)",maxWidth:440,margin:"0 auto 48px" }}>
          Join 2 million+ people messaging at the speed of thought. Free forever on the base plan.
        </motion.p>
        <motion.div {...inView(0.22)} style={{ display:"flex",gap:12,justifyContent:"center",maxWidth:400,margin:"0 auto 16px" }}>
          <input type="email" placeholder="Enter your email…" style={{ flex:1,padding:"13px 20px",borderRadius:999,fontSize:14,color:"#fff",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",outline:"none" }}
            onFocus={e=>{ e.target.style.borderColor=`${LIME}40`; e.target.style.boxShadow=`0 0 0 3px ${LIME}0a`; }}
            onBlur={e=>{ e.target.style.borderColor="rgba(255,255,255,0.1)"; e.target.style.boxShadow="none"; }}/>
          <motion.button whileHover={{ scale:1.06,boxShadow:`0 16px 48px ${LIME}48` }} whileTap={{ scale:0.95 }}
            onClick={onSignIn} style={{ display:"flex",alignItems:"center",gap:8,fontSize:15,fontWeight:700,borderRadius:999,padding:"13px 24px",background:LIME,color:"#111",border:"none",cursor:"pointer",whiteSpace:"nowrap",boxShadow:`0 6px 28px ${LIME}30` }}>
            Get early access <ArrowRight size={16}/>
          </motion.button>
        </motion.div>
        <motion.p {...inView(0.28)} style={{ fontSize:12,color:"rgba(255,255,255,0.25)" }}>No credit card · Cancel anytime · Free forever on base plan</motion.p>
      </div>
    </section>
  );
}

/* ── FOOTER ──────────────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer style={{ borderTop:"1px solid rgba(255,255,255,0.055)",background:"rgba(4,4,4,0.98)",padding:"36px 40px" }}>
      <div style={{ maxWidth:1280,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:20 }}>
        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
          <MessageCircle size={20} color={LIME} strokeWidth={1.8}/>
          <span style={{ fontWeight:800,fontSize:15,letterSpacing:"-0.03em",color:"#fff" }}>
            Pulse<span style={{ color:LIME }}>Chat</span>
          </span>
        </div>
        <div style={{ display:"flex",gap:24,flexWrap:"wrap" }}>
          {["Privacy","Terms","Blog","Careers","Status","Contact"].map(l=>(
            <a key={l} href="#" style={{ fontSize:12,color:"rgba(255,255,255,0.28)",textDecoration:"none",transition:"color .15s" }}
              onMouseEnter={e=>e.target.style.color="rgba(255,255,255,0.62)"} onMouseLeave={e=>e.target.style.color="rgba(255,255,255,0.28)"}>{l}</a>
          ))}
        </div>
        <span style={{ fontSize:12,color:"rgba(255,255,255,0.2)" }}>© 2026 PulseChat, Inc.</span>
      </div>
    </footer>
  );
}

/* ── PAGE ────────────────────────────────────────────────────────────────── */
export default function Landing() {
  const { signIn, state } = useAuthContext();
  const navigate = useNavigate();

  const handleSignIn = () => signIn();

  useEffect(() => {
    if (document.getElementById("sg-font")) return;
    const l = document.createElement("link");
    l.id = "sg-font"; l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&display=swap";
    document.head.appendChild(l);
  }, []);

  useEffect(() => {
    if (!state.isLoading && state.isAuthenticated) navigate("/dashboard");
  }, [state.isLoading, state.isAuthenticated, navigate]);

  return (
    <div style={{ minHeight:"100vh",overflowX:"hidden",background:BG,color:"#f0f0f0",fontFamily:"'Space Grotesk',system-ui,sans-serif" }}>
      <BeamsBackground>
        <div style={{ position:"relative", zIndex:1 }}>
          <Nav onSignIn={handleSignIn} />
          <Hero onSignIn={handleSignIn} />
          <Marquee />
          <Features />
          <HowItWorks />
          <Testimonials />
          <CTA onSignIn={handleSignIn} />
          <Footer />
        </div>
      </BeamsBackground>
    </div>
  );
}
