import { useEffect } from "react";
import { useAuthContext } from "@asgardeo/auth-react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, Zap, Lock, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Login() {
  const { state, signIn } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (state.isAuthenticated) navigate("/dashboard");
  }, [state.isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Glows */}
      <div className="absolute top-0 left-1/4 w-80 h-80 rounded-full bg-lime opacity-[0.07] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-emerald opacity-[0.07] blur-[100px] pointer-events-none" />

      <div className="w-full max-w-sm px-6 animate-slide-up relative">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-lime flex items-center justify-center mx-auto mb-5 shadow-lg shadow-lime/20">
            <MessageCircle className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="font-display font-extrabold text-3xl tracking-[-0.03em] text-foreground mb-2">
            PulseChat
          </h1>
          <p className="text-sm text-muted-foreground">Welcome back — sign in to continue</p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl">
          <p className="text-xs text-muted-foreground text-center mb-6 leading-relaxed">
            Sign in with your Asgardeo account to access your messages
          </p>

          <Button
            onClick={() => signIn()}
            className="w-full rounded-xl h-11 font-semibold text-sm gap-2 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-lime/20 transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            Sign in with Asgardeo
          </Button>

          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[10px] text-muted-foreground/60 font-medium">secured by WSO2</span>
            <div className="flex-1 h-px bg-border" />
          </div>
        </div>

        {/* Feature pills */}
        <div className="mt-6 grid grid-cols-3 gap-2.5 text-center">
          {[
            { icon: Zap, label: "Real-time" },
            { icon: Lock, label: "Secure" },
            { icon: Globe, label: "Anywhere" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="bg-card border border-border rounded-xl p-3 flex flex-col items-center gap-1.5">
              <Icon className="w-4 h-4 text-lime" />
              <p className="text-[11px] text-muted-foreground font-medium">{label}</p>
            </div>
          ))}
        </div>

        <p className="text-center mt-8 text-xs text-muted-foreground/40">
          Don&apos;t have an account?{" "}
          <span className="text-lime cursor-pointer hover:underline" onClick={() => signIn()}>
            Sign up free
          </span>
        </p>
      </div>
    </div>
  );
}
