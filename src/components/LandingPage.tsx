import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { 
  Tv, 
  Sparkles, 
  GraduationCap, 
  Briefcase, 
  Globe, 
  BookOpen, 
  Users, 
  Download, 
  ArrowRight,
  LogIn,
  User as UserIcon,
  Upload,
  Info,
  Layers,
  LogOut,
  Sliders,
  CheckCircle2
} from 'lucide-react';
// @ts-ignore
import edgardoPortrait from '../assets/images/edgardo_portrait_1780973621766.png';

interface LandingPageProps {
  onLoginSuccess: (user: User) => void;
}

export default function LandingPage({ onLoginSuccess }: LandingPageProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Complete clean up of dynamic picture states in favor of persistent static assets
  const devPicture = edgardoPortrait;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
      if (user) {
        onLoginSuccess(user);
      }
    });
    return () => unsubscribe();
  }, [onLoginSuccess]);

  const handleGoogleLogin = async () => {
    try {
      setErrorMsg(null);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        onLoginSuccess(result.user);
      }
    } catch (err: any) {
      console.error('Login failed', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMsg('The Google Sign-In popup was closed before completing authentication. Please try again or use the Guest Demo Access.');
      } else if (err.code === 'auth/popup-blocked') {
        setErrorMsg('The Sign-In popup was blocked by your browser. Please allow popups or use the Guest Demo Access.');
      } else {
        setErrorMsg(err.message || 'Authentication failed. Please verify your internet connection.');
      }
    }
  };

  const handleDemoBypass = () => {
    // Elegant fallback simulation user for local testing/offline reviews
    const demoUser = {
      uid: 'demo-teacher-001',
      displayName: 'Edgardo Rojas (Demo Mode)',
      email: 'edgardo.rojas@demo.edu.ph',
      photoURL: null
    } as unknown as User;
    onLoginSuccess(demoUser);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans select-none" id="landing-screen-root">
      
      {/* Absolute background accent lights */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Landing Header toolbar */}
      <nav className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between relative z-10">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-teal-500 rounded-xl flex items-center justify-center border border-teal-400 shadow-md">
            <Tv className="w-4 h-4 text-slate-950 animate-pulse" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white font-mono">EduFlow</h1>
            <p className="text-[9px] text-teal-400 font-mono uppercase tracking-widest leading-none">Presentation Suite</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">Active Recitation Sandbox v2.5</span>
          <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-xs" title="Systems online" />
        </div>
      </nav>

      {/* Main Grid Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* Left Column: WebApp Description & Hero */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[10px] uppercase tracking-widest font-bold rounded-full font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            Interactive Presentation Suite
          </div>

          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Elevate Classroom Engagement with <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">EduFlow</span>
          </h2>

          <p className="text-sm md:text-base text-slate-400 leading-relaxed max-w-2xl">
            EduFlow Interactive is a custom-coded modern application engineered specifically for instructors and educators. Craft dynamic content with beautiful styled slide overlays, embed quick oral tests, and trigger our fair Recitation wheels for classroom student selection.
          </p>

          {/* Bulleted Core Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="flex gap-3 bg-slate-950/40 p-4 border border-slate-800 rounded-2xl">
              <div className="h-8 w-8 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-xl flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Dynamic Slide Builder</h4>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Create headings, rich lists, and custom formatted lesson slides on-the-fly.
                </p>
              </div>
            </div>

            <div className="flex gap-3 bg-slate-950/40 p-4 border border-slate-800 rounded-2xl">
              <div className="h-8 w-8 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-xl flex items-center justify-center shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Recitation Roulette</h4>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Spin a native SVG ease-controlled wheel to pick students, maintaining safe recitation histories.
                </p>
              </div>
            </div>

            <div className="flex gap-3 bg-slate-950/40 p-4 border border-slate-800 rounded-2xl">
              <div className="h-8 w-8 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-xl flex items-center justify-center shrink-0">
                <Download className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Export Hub Packages</h4>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Download instantly in PowerPoint Slide Shows (.pptx), landscape PDF, or legacy Office (.ppt).
                </p>
              </div>
            </div>

            <div className="flex gap-3 bg-slate-950/40 p-4 border border-slate-800 rounded-2xl">
              <div className="h-8 w-8 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-xl flex items-center justify-center shrink-0">
                <Sliders className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Dual-View Projection</h4>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Dual-panel split screen outputs perfect for simultaneous control and student board.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Login Card & Bio */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Sign In Terminal Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden" id="auth-form-card">
            <div className="absolute top-0 right-0 py-1 px-3 bg-teal-500 text-slate-950 text-[9px] font-mono font-bold uppercase rounded-bl-xl tracking-wider">
              Secure Auth Gate
            </div>
            
            <div className="space-y-2 mb-4">
              <h3 className="text-sm font-bold tracking-wider text-slate-200 uppercase font-mono">Instructor Workspace Portal</h3>
              <p className="text-xs text-slate-400">Authenticate to design and synchronize persistent presentations catalogs.</p>
            </div>

            {errorMsg && (
              <div className="p-4 bg-rose-950/40 border border-rose-500/30 rounded-xl text-xs text-rose-350 space-y-2.5 animate-fade-in" id="auth-error-alert-box">
                <div className="flex items-start gap-2">
                  <span className="font-bold shrink-0 text-rose-400 select-none">Notice:</span>
                  <span className="leading-relaxed text-[11px] font-medium">{errorMsg}</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1 border-t border-rose-500/10">
                  <button
                    type="button"
                    onClick={handleDemoBypass}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Use Guest Demo
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-2.5 px-4 py-3 bg-slate-800 border border-slate-700 hover:bg-slate-750 text-white hover:text-teal-400 font-bold rounded-xl text-xs transition-all cursor-pointer shadow-md"
                id="btn-google-sign-in"
              >
                <LogIn className="w-4 h-4 text-teal-400" />
                <span>Sign In via Firebase Google Account</span>
              </button>

              <div className="text-right px-1 text-[10px]">
                <span className="text-slate-500 font-mono select-none">Clean OAuth Flow</span>
              </div>

              <div className="text-center py-1">
                <span className="text-[9px] font-bold text-slate-500 font-mono uppercase tracking-widest">- Or for instantaneous testing -</span>
              </div>

              <button
                type="button"
                onClick={handleDemoBypass}
                className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white font-semibold rounded-xl text-[11px] transition-all cursor-pointer"
                id="btn-guest-bypass"
              >
                <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                <span>Launch App in Guest Demo Access</span>
              </button>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[9px] font-mono text-slate-500 uppercase">
              <span>Client State is Secured</span>
              <span className="text-teal-400 font-bold">2026 UTC</span>
            </div>
          </div>

          {/* About Us Developer Biography Card */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden" id="about-us-card">
            
            <div className="flex items-start gap-4">
              
              {/* Static Developer Portrait Display */}
              <div className="flex flex-col items-center gap-1 shrink-0 select-none">
                <div className="relative h-20 w-20 rounded-xl border border-teal-500/40 overflow-hidden shadow-lg">
                  <img 
                    src={devPicture} 
                    alt="Developer Portrait Edgardo" 
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <span className="text-[8px] text-teal-400 font-mono font-bold uppercase tracking-widest mt-1">Verified</span>
              </div>

              {/* Bio description */}
              <div className="space-y-2 flex-1">
                <div className="space-y-0.5">
                  <span className="text-[9px] bg-teal-500/10 text-teal-400 font-bold px-1.5 py-0.5 rounded tracking-widest uppercase font-mono leading-none inline-block">Developer Bio</span>
                  <h3 className="text-base font-extrabold text-white tracking-tight">Edgardo, Jr. B. Rojas</h3>
                  <p className="text-[10px] text-teal-400 font-bold uppercase font-mono tracking-wider">Lead Application Developer</p>
                </div>
                
                <div className="mt-2 space-y-1.5 text-xs text-slate-350 leading-relaxed font-medium font-mono">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4.5 h-4.5 text-teal-500 shrink-0" />
                    <span>1st year Master's in Information Technology</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4.5 h-4.5 text-cyan-500 shrink-0" />
                    <span>College Instructor</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4.5 h-4.5 text-purple-500 shrink-0" />
                    <span>English for Specific Language Teacher</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3.5 border-t border-slate-800/60 flex items-start gap-1 p-2 bg-slate-950/30 rounded-xl border border-slate-900">
              <Info className="w-4 h-4 text-teal-500 shrink-0" />
              <p className="text-[10px] text-slate-400 leading-normal">
                "Welcome to EduFlow. This presentation system was engineered from scratch to simplify active student learning, instant layout feedback, and lightning-fast slide conversions for offline study."
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* Landing Footer */}
      <footer className="bg-slate-950 py-5 text-center text-[10px] font-mono text-slate-500 border-t border-slate-800 relative z-10">
        <p>© 2026 EduFlow Interactive Suite • Engineered by Edgardo, Jr. B. Rojas • Authenticated with Firebase Auth & Cloud Firestore</p>
      </footer>

    </div>
  );
}
