import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Zap, Lock, Moon, Sun, ArrowRight, Activity, Server, Globe } from 'lucide-react';

interface LandingPageProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ darkMode, setDarkMode }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50 dark:bg-[#050B14] transition-colors duration-300">
      {/* Decorative Grid Overlay */}
      <div className="absolute inset-0 bg-grid-pattern dark:bg-grid-pattern-dark pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-banking-cyan/40 dark:from-banking-navy-light/10 to-transparent pointer-events-none" />
      
      {/* Glowing background highlights */}
      <div className="absolute top-1/4 left-10 w-[500px] h-[500px] bg-banking-teal/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 w-[500px] h-[500px] bg-banking-accent/10 rounded-full blur-3xl pointer-events-none" />

      {/* Navigation header */}
      <header className="relative z-10 border-b border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-tr from-banking-teal to-banking-blue p-2.5 rounded-xl shadow-lg shadow-banking-teal/20 text-white">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-banking-blue-light via-banking-teal to-banking-accent bg-clip-text text-transparent dark:from-white dark:to-slate-300">
                SecureKYC
              </span>
              <span className="text-xs block text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                Validator Portal
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/about')}
              className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-banking-teal transition-all"
            >
              Specifications
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 rounded-xl bg-slate-200/50 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all duration-200 border border-slate-300/30 dark:border-slate-700/30"
              aria-label="Toggle Dark Mode"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-5 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-banking-teal to-banking-blue hover:shadow-lg hover:shadow-banking-teal/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              Launch Console
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section Container */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Side: Brand Text & CTAs */}
        <div className="lg:col-span-7 space-y-6 text-left">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-banking-teal/10 border border-banking-teal/20 text-banking-teal dark:text-banking-teal-light text-xs font-bold tracking-wide uppercase">
            <Activity className="w-4 h-4 text-banking-teal animate-pulse" />
            <span>Enterprise Compliance Engine v2.0</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-banking-navy dark:text-white leading-[1.1]">
            Automate Financial Guardrails With{' '}
            <span className="bg-gradient-to-r from-banking-teal via-banking-teal-light to-banking-accent bg-clip-text text-transparent">
              Smart Pre-Validation
            </span>
          </h1>

          <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
            SecureKYC validates PAN and Aadhaar formats directly inside the user's browser before hit routes. Eliminate database latency, reduce API costs, and verify Aadhaar checksum integrity with the Verhoeff algorithm.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-banking-teal via-banking-teal-dark to-banking-blue hover:shadow-xl hover:shadow-banking-teal/20 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 flex items-center justify-center space-x-2 group"
            >
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/about')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-slate-700 dark:text-slate-300 bg-white/40 dark:bg-slate-800/40 hover:bg-white/60 dark:hover:bg-slate-800/60 transition-all border border-slate-300/40 dark:border-slate-700/40 block text-center"
            >
              View Specifications
            </button>
          </div>
        </div>

        {/* Right Side: Glowing Banking SVG Illustration */}
        <div className="lg:col-span-5 flex justify-center relative">
          <div className="w-72 h-72 sm:w-96 sm:h-96 relative flex items-center justify-center">
            {/* Spinning background rings */}
            <div className="absolute inset-0 border border-slate-300/20 dark:border-slate-700/10 rounded-full scale-105 animate-[spin_40s_linear_infinite]" />
            <div className="absolute inset-0 border-2 border-dashed border-banking-teal/10 rounded-full scale-95 animate-[spin_20s_linear_infinite]" />
            <div className="absolute inset-10 bg-gradient-to-tr from-banking-teal/10 to-banking-accent/5 rounded-full blur-2xl animate-pulse" />

            {/* Glowing Shield & lock SVG block */}
            <div className="relative z-10 glass-card p-8 rounded-full border border-white/20 dark:border-slate-800/30 flex items-center justify-center w-52 h-52 shadow-2xl">
              <svg className="w-24 h-24 text-banking-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div className="absolute -top-1 right-12 bg-banking-accent text-banking-navy text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider border border-white dark:border-banking-navy animate-bounce">
                Secure
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Why Client Side Pre-validation Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-16 border-t border-slate-200/50 dark:border-slate-800/50 bg-white/25 dark:bg-slate-900/10 backdrop-blur-sm">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <h2 className="text-3xl font-extrabold text-banking-navy dark:text-white">Why Client-Side Validation?</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Optimizing core enterprise networks by executing local validation parameters before calling backend microservices.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card p-6 rounded-3xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-banking-teal/15 text-banking-teal flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-banking-navy dark:text-white text-lg">0ms Instancy</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Provides validation error responses immediately to the user while typing. Eliminates waiting times and ensures a friction-free user onboarding experience.
            </p>
          </div>

          <div className="glass-card p-6 rounded-3xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 text-indigo-500 flex items-center justify-center">
              <Server className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-banking-navy dark:text-white text-lg">Reduce Backend Load</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Stops malformed inputs (incomplete lengths, invalid alphanumeric segments, lowercase strings) from hitting Spring Boot servers, saving database CPU overhead.
            </p>
          </div>

          <div className="glass-card p-6 rounded-3xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
              <Globe className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-banking-navy dark:text-white text-lg">Gateway Cost Savings</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Prevents submitting typing errors to paid government APIs (UIDAI/NSDL), saving thousands of dollars in query licensing fees.
            </p>
          </div>
        </div>
      </section>

      {/* Tech Stack Specs */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="glass-card p-8 rounded-3xl text-center space-y-8">
          <div>
            <h3 className="text-2xl font-bold text-banking-navy dark:text-white">FinTech Architecture Stack</h3>
            <p className="text-xs text-slate-400 mt-1">Built using industry-standard engineering guidelines for high scalability.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-1">
              <div className="text-xl font-bold text-banking-navy dark:text-white">React + TS</div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">User Experience</div>
            </div>
            <div className="space-y-1">
              <div className="text-xl font-bold text-banking-teal">Tailwind CSS</div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Adaptive UI Design</div>
            </div>
            <div className="space-y-1">
              <div className="text-xl font-bold text-indigo-500">Spring Boot</div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Secure API Services</div>
            </div>
            <div className="space-y-1">
              <div className="text-xl font-bold text-emerald-500">Java 21</div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">JVM Execution</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-200/50 dark:border-slate-800/50 py-10 text-center text-sm text-slate-500 dark:text-slate-400 bg-white/20 dark:bg-slate-900/20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Lock className="w-4 h-4 text-banking-teal" />
            <span className="font-semibold text-slate-600 dark:text-slate-300">SecureKYC Validator</span>
          </div>
          <div>
            &copy; {new Date().getFullYear()} SecureKYC. Licensed for corporate evaluation.
          </div>
        </div>
      </footer>
    </div>
  );
};
