import { useEffect, useRef } from "react";
import { useAuthContext } from "@asgardeo/auth-react";
import { useNavigate } from "react-router-dom";
import {
  Zap, Lock, MessageSquare, Video, Smile, Paperclip,
  ArrowRight, Play, MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ── Scroll-reveal hook ─────────────────────────────────────────────────────
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); } }),
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

// ── Nav ───────────────────────────────────────────────────────────────────
function Nav({ onSignIn }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-6xl mx-auto px-10 py-4 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2.5 text-foreground no-underline">
          <div className="w-8 h-8 rounded-lg bg-lime flex items-center justify-center text-sm">
            <MessageCircle className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display font-extrabold text-lg tracking-tight">PulseChat</span>
        </a>
        <div className="hidden md:flex items-center gap-8">
          {["Features", "How it works", "Reviews"].map((l) => (
            <a key={l} href={`#${l.toLowerCase().replace(/ /g, "-")}`}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors no-underline">
              {l}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onSignIn}>Sign in</Button>
          <Button size="sm" onClick={onSignIn}>Get started free</Button>
        </div>
      </div>
    </nav>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────
function Hero({ onSignIn }) {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-10 pt-36 pb-20 relative overflow-hidden text-center">
      {/* Glows */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] rounded-full bg-lime opacity-[0.08] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-[-100px] w-[400px] h-[400px] rounded-full bg-emerald opacity-[0.08] blur-[100px] pointer-events-none" />

      {/* Badge */}
      <div className="reveal inline-flex items-center gap-2 border border-border rounded-full px-4 py-1.5 mb-9 bg-lime/5">
        <span className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse" />
        <span className="text-[11px] font-bold tracking-widest uppercase text-lime">Now in public beta — free forever</span>
      </div>

      {/* Headline */}
      <h1 className="reveal font-display font-extrabold text-[clamp(52px,8vw,108px)] leading-[0.95] tracking-[-0.04em] text-foreground mb-7 max-w-4xl">
        Chat that<br />
        <span className="[-webkit-text-stroke:2px_hsl(var(--lime))] text-transparent">moves</span> at your<br />
        <span className="text-lime">pulse.</span>
      </h1>

      <p className="reveal text-[clamp(16px,2vw,20px)] text-muted-foreground max-w-xl leading-relaxed mb-11 font-normal">
        Real-time messaging built for speed, clarity, and personality. Stay in sync with the people who matter.
      </p>

      <div className="reveal flex gap-3 justify-center flex-wrap mb-16">
        <Button size="lg" onClick={onSignIn} className="rounded-full px-9 font-bold gap-2 hover:shadow-lg hover:shadow-lime/20">
          Start for free <ArrowRight className="w-4 h-4" />
        </Button>
        <Button size="lg" variant="outline" className="rounded-full px-9 gap-2 hover:border-lime hover:text-lime">
          <Play className="w-4 h-4" /> Watch demo
        </Button>
      </div>

      {/* App mockup */}
      <div className="reveal animate-float w-full max-w-4xl">
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-[0_40px_120px_#00000080,0_0_0_1px_#ffffff08]">
          {/* Window chrome */}
          <div className="bg-card border-b border-border px-5 py-3.5 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
            <span className="flex-1 text-center text-[11px] text-muted-foreground font-medium">PulseChat — pulsechat.app</span>
          </div>
          {/* Body */}
          <div className="flex h-72 md:h-96">
            {/* Sidebar */}
            <div className="w-48 md:w-56 border-r border-border bg-sidebar p-2 flex flex-col gap-1 flex-shrink-0">
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground px-2 py-1.5">Messages</p>
              {[
                { init: "SC", color: "#D6FF00", name: "Sophia Chen", last: "Can you review the mockups?", badge: 3 },
                { init: "MW", color: "#00D084", name: "Marcus W.", last: "Meeting pushed to 4pm" },
                { init: "ER", color: "#A6FF4D", name: "Emma R.", last: "haha okay!! 😄", badge: 1 },
                { init: "DT", color: "#D6FF00", name: "Design Team 🎨", last: "Components are ready", badge: 7 },
              ].map((c, i) => (
                <div key={i} className={`flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer ${i === 0 ? "bg-lime/10" : "hover:bg-muted"}`}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold text-[#111] flex-shrink-0" style={{ background: c.color }}>{c.init}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-foreground truncate">{c.name}</p>
                    <p className="text-[9px] text-muted-foreground truncate">{c.last}</p>
                  </div>
                  {c.badge && <span className="text-[9px] font-black text-primary-foreground bg-lime rounded-full px-1.5 py-0.5">{c.badge}</span>}
                </div>
              ))}
            </div>
            {/* Chat */}
            <div className="flex-1 flex flex-col">
              <div className="border-b border-border px-4 py-3 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-lime flex items-center justify-center text-[9px] font-bold text-[#111]">SC</div>
                <div>
                  <p className="text-[12px] font-semibold text-foreground">Sophia Chen</p>
                  <p className="text-[9px] text-emerald">Active now</p>
                </div>
              </div>
              <div className="flex-1 p-4 flex flex-col gap-2.5 overflow-hidden">
                {[
                  { me: false, text: "Hey! Finished the new design iterations 🎨" },
                  { me: false, text: "Can you take a look when you get a chance?" },
                  { me: true, text: "Of course! Send them over 👍" },
                  { me: false, text: "These are the latest mockups!" },
                  { me: true, text: "These look amazing!! Love the new color palette ✨" },
                ].map((m, i) => (
                  <div key={i} className={`flex items-end gap-2 ${m.me ? "flex-row-reverse" : ""}`}>
                    {!m.me && <div className="w-5 h-5 rounded-full bg-lime flex items-center justify-center text-[7px] font-bold text-[#111] flex-shrink-0">SC</div>}
                    <div className={`px-3 py-1.5 rounded-xl text-[11px] leading-snug max-w-[200px] ${m.me ? "bg-lime text-primary-foreground font-medium rounded-tr-sm" : "bg-elevated text-foreground rounded-tl-sm"}`}>{m.text}</div>
                  </div>
                ))}
              </div>
              <div className="border-t border-border px-4 py-2.5 flex items-center gap-2">
                <div className="flex-1 bg-elevated border border-border rounded-lg px-3 py-1.5 text-[11px] text-muted-foreground">Message Sophia…</div>
                <div className="w-7 h-7 bg-lime rounded-lg flex items-center justify-center text-sm text-primary-foreground font-bold cursor-pointer">↑</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Stats ─────────────────────────────────────────────────────────────────
function Stats() {
  return (
    <div className="border-t border-b border-border bg-card">
      <div className="max-w-4xl mx-auto px-10 py-12 flex justify-center">
        {[
          { num: "2M+", label: "Active users" },
          { num: "99.9%", label: "Uptime guaranteed" },
          { num: "<50ms", label: "Message delivery" },
        ].map((s, i) => (
          <div key={i} className={`reveal flex-1 max-w-xs text-center px-8 ${i < 2 ? "border-r border-border" : ""}`}>
            <div className="font-display font-extrabold text-[clamp(36px,5vw,52px)] text-lime tracking-[-0.04em] leading-none mb-2">{s.num}</div>
            <div className="text-sm text-muted-foreground font-medium">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Features ──────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: Zap, title: "Real-time Delivery", desc: "Messages arrive instantly with sub-50ms latency. No delays, no dropped messages, ever." },
  { icon: Lock, title: "End-to-End Encrypted", desc: "Every message is encrypted before it leaves your device. Your conversations are yours alone." },
  { icon: MessageSquare, title: "Threaded Replies", desc: "Keep conversations organized with inline threads. Reply in context without cluttering the main chat." },
  { icon: Video, title: "HD Voice & Video", desc: "Crystal-clear calls built right into the chat. No third-party apps, no account switching." },
  { icon: Smile, title: "Reactions & Emoji", desc: "Express yourself instantly with emoji reactions. A quick ❤️ speaks louder than a one-word reply." },
  { icon: Paperclip, title: "Smart File Sharing", desc: "Drop images, videos, and documents inline. Preview everything without leaving the chat." },
];

function Features() {
  return (
    <section id="features" className="max-w-6xl mx-auto px-10 py-28">
      <div className="reveal flex items-center gap-2 text-lime text-[11px] font-bold uppercase tracking-[0.1em] mb-5">
        <span className="w-5 h-0.5 bg-lime rounded" /> Features
      </div>
      <h2 className="reveal font-display font-extrabold text-[clamp(36px,5vw,60px)] tracking-[-0.04em] leading-[1.0] text-foreground max-w-xl mb-16">
        Everything you need. <span className="text-muted-foreground/40">Nothing you don't.</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0.5">
        {FEATURES.map(({ icon: Icon, title, desc }, i) => (
          <div key={i} className={`reveal group bg-card hover:bg-elevated p-8 transition-colors relative overflow-hidden cursor-default
            ${i === 0 ? "rounded-tl-2xl" : ""} ${i === 2 ? "rounded-tr-2xl" : ""} ${i === 3 ? "rounded-bl-2xl" : ""} ${i === 5 ? "rounded-br-2xl" : ""}`}>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-lime to-emerald scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
            <div className="w-12 h-12 rounded-xl bg-lime/10 border border-lime/20 flex items-center justify-center mb-5">
              <Icon className="w-5 h-5 text-lime" />
            </div>
            <h3 className="font-display font-bold text-lg tracking-tight text-foreground mb-2.5">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── How It Works ──────────────────────────────────────────────────────────
const STEPS = [
  { num: "01", title: "Create your account", desc: "Sign up in seconds with just your email. No credit card, no catch. Free forever on the base plan." },
  { num: "02", title: "Invite your people", desc: "Share a link or search by username to add contacts. Build group chats in seconds." },
  { num: "03", title: "Start the pulse", desc: "Send messages, share files, react, call — everything flows naturally from one unified inbox." },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-card border-t border-b border-border py-24">
      <div className="max-w-5xl mx-auto px-10">
        <div className="reveal flex items-center gap-2 text-lime text-[11px] font-bold uppercase tracking-[0.1em] mb-5">
          <span className="w-5 h-0.5 bg-lime rounded" /> How it works
        </div>
        <h2 className="reveal font-display font-extrabold text-[clamp(36px,5vw,60px)] tracking-[-0.04em] leading-[1.0] text-foreground mb-16">
          Up and running<br /><span className="text-muted-foreground/40">in 3 steps.</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative">
          {STEPS.map((s, i) => (
            <div key={i} className="reveal relative" style={{ transitionDelay: `${i * 0.1}s` }}>
              <div className="font-display font-extrabold text-7xl text-lime/10 leading-none mb-4 select-none tracking-[-0.06em]">{s.num}</div>
              <h3 className="font-display font-bold text-xl tracking-tight mb-2.5">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Testimonials ──────────────────────────────────────────────────────────
const TESTIMONIALS = [
  { stars: 5, text: '"Finally a chat app that doesn\'t feel like it was designed in 2015. The interface is gorgeous and it\'s genuinely fast."', name: "Jordan Kim", role: "Product Designer, Figma", color: "#D6FF00", init: "JK" },
  { stars: 5, text: '"We switched our whole team over from Slack. The threaded replies and file sharing work exactly how you\'d expect — effortlessly."', name: "Aisha Torres", role: "Engineering Lead, Vercel", color: "#00D084", init: "AT" },
  { stars: 5, text: '"The video call quality blew me away. No lag, no dropped frames. My team is distributed across 6 time zones and it just works."', name: "Marco Levi", role: "Founder, Launchpad Studio", color: "#A6FF4D", init: "ML" },
];

function Testimonials() {
  return (
    <section id="reviews" className="max-w-6xl mx-auto px-10 py-28">
      <div className="reveal flex items-center gap-2 text-lime text-[11px] font-bold uppercase tracking-[0.1em] mb-5">
        <span className="w-5 h-0.5 bg-lime rounded" /> Reviews
      </div>
      <h2 className="reveal font-display font-extrabold text-[clamp(36px,5vw,60px)] tracking-[-0.04em] leading-[1.0] text-foreground mb-16">
        People <span className="text-muted-foreground/40">love it.</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {TESTIMONIALS.map((t, i) => (
          <div key={i} className="reveal group bg-card border border-border rounded-2xl p-7 hover:border-lime/30 hover:-translate-y-1 transition-all duration-200" style={{ transitionDelay: `${i * 0.1}s` }}>
            <div className="text-lime text-sm tracking-[2px] mb-4">{"★".repeat(t.stars)}</div>
            <p className="text-sm leading-relaxed text-foreground mb-6">{t.text}</p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-[#111] flex-shrink-0" style={{ background: t.color }}>{t.init}</div>
              <div>
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-[11px] text-muted-foreground/60 mt-0.5">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── CTA ───────────────────────────────────────────────────────────────────
function CTA({ onSignIn }) {
  return (
    <section className="relative overflow-hidden border-t border-border py-28">
      <div className="absolute w-[700px] h-[350px] rounded-full bg-lime blur-[160px] opacity-[0.06] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="relative max-w-4xl mx-auto px-10 text-center">
        <span className="reveal block text-[11px] font-bold tracking-[0.12em] uppercase text-lime mb-6">Get started today</span>
        <h2 className="reveal font-display font-extrabold text-[clamp(40px,6vw,80px)] tracking-[-0.04em] leading-[0.95] mb-5">
          Ready to feel<br />
          <span className="[-webkit-text-stroke:2px_hsl(var(--lime))] text-transparent">the pulse?</span>
        </h2>
        <p className="reveal text-base text-muted-foreground mb-12 max-w-md mx-auto">
          Join over 2 million people already using PulseChat. Free to start, no credit card required.
        </p>
        <div className="reveal flex gap-3 justify-center max-w-sm mx-auto">
          <input
            type="email"
            placeholder="Enter your email…"
            className="flex-1 px-5 py-3.5 rounded-full border border-border bg-elevated text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-lime transition-colors"
          />
          <Button onClick={onSignIn} className="rounded-full px-6 whitespace-nowrap gap-1.5 font-bold hover:shadow-lime/20 hover:shadow-lg">
            Get early access <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="max-w-6xl mx-auto px-10 py-8 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-lime flex items-center justify-center">
            <MessageCircle className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <span className="font-display font-extrabold text-sm tracking-tight">PulseChat</span>
        </div>
        <div className="flex gap-7">
          {["Privacy", "Terms", "Blog", "Careers", "Contact"].map((l) => (
            <a key={l} href="#" className="text-xs text-muted-foreground/60 hover:text-muted-foreground no-underline transition-colors">{l}</a>
          ))}
        </div>
        <span className="text-xs text-muted-foreground/40">© 2026 PulseChat, Inc.</span>
      </div>
    </footer>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────
export default function Landing() {
  const { signIn, state } = useAuthContext();
  const navigate = useNavigate();
  useReveal();

  useEffect(() => {
    if (!state.isLoading && state.isAuthenticated) navigate("/dashboard");
  }, [state.isLoading, state.isAuthenticated, navigate]);

  const handleSignIn = () => signIn();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Nav onSignIn={handleSignIn} />
      <Hero onSignIn={handleSignIn} />
      <Stats />
      <Features />
      <HowItWorks />
      <Testimonials />
      <CTA onSignIn={handleSignIn} />
      <Footer />
    </div>
  );
}
