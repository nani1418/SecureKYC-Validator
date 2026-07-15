import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Cpu, Database, BookOpen, GitBranch, Moon, Sun } from 'lucide-react';

interface AboutPageProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ darkMode, setDarkMode }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050B14] transition-colors duration-300 relative pb-20">
      <div className="absolute inset-0 bg-grid-pattern dark:bg-grid-pattern-dark pointer-events-none" />

      {/* Header bar */}
      <header className="relative z-10 border-b border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md bg-white/40 dark:bg-[#050B14]/40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white transition-all"
              title="Return to Home"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="bg-banking-teal p-2 rounded-lg text-white">
                <Shield className="w-5 h-5" />
              </div>
              <h1 className="text-lg font-bold text-banking-navy dark:text-white">GovTech Portal</h1>
            </div>
          </div>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-6 pt-12 relative z-10 space-y-12">
        {/* Title Banner */}
        <div className="space-y-4 text-center">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-banking-teal/10 border border-banking-teal/20 text-banking-teal text-xs font-bold tracking-wider uppercase">
            <span>Corporate Compliance Specifications</span>
          </div>
          <h2 className="text-4xl font-extrabold text-banking-navy dark:text-white">
            Architecture & Validation Framework
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-sm">
            Detailed breakdown of our client-server pre-validation strategy for enterprise banking portals.
          </p>
        </div>

        {/* Business Problem Card */}
        <section className="glass-card p-8 rounded-3xl space-y-4">
          <div className="flex items-center space-x-3 text-banking-teal">
            <Cpu className="w-6 h-6" />
            <h3 className="text-xl font-bold text-banking-navy dark:text-white">The Business Problem</h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            In modern financial portals, processing user registration mandates instant validation of documents (such as PAN cards and Aadhaar numbers) via official government repositories (like NSDL and UIDAI). However, checking incorrect identifiers due to simple typos costs companies significant licensing fees per API call and consumes massive backend computing resources unnecessarily.
          </p>
          <div className="p-4 rounded-xl bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            <strong>Key Metric:</strong> Approximately 23% of database validation failures are caused by character transpositions and casing mistakes which can be identified at the client interface prior to submission.
          </div>
        </section>

        {/* Architecture Specs */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-card p-6 rounded-3xl space-y-3">
            <div className="flex items-center space-x-3 text-indigo-500">
              <Database className="w-5 h-5" />
              <h4 className="font-bold text-banking-navy dark:text-white text-base">Hybrid Architecture</h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              We employ a hybrid validation approach. The browser normalizes inputs (trimming space offsets, auto-capping, stripping hyphens) and runs preliminary regex checks. The Spring Boot backend executes strict mathematical validation (Verhoeff checksum calculations and tax codes parsing) via REST endpoints, capturing duration metrics and compiling them into audit tables.
            </p>
          </div>

          <div className="glass-card p-6 rounded-3xl space-y-3">
            <div className="flex items-center space-x-3 text-emerald-500">
              <BookOpen className="w-5 h-5" />
              <h4 className="font-bold text-banking-navy dark:text-white text-base">The Verhoeff Math Model</h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              The Verhoeff algorithm uses dihedral group D5 multiplication and permutation matrices to compute a single check digit. This technique catches 100% of single digit substitution errors and 95.36% of adjacent transpositions, making Aadhaar checks highly accurate without database lookup latencies.
            </p>
          </div>
        </section>

        {/* Technology Specs */}
        <section className="glass-card p-8 rounded-3xl space-y-6">
          <div className="flex items-center space-x-3 text-pink-500">
            <GitBranch className="w-6 h-6" />
            <h3 className="text-xl font-bold text-banking-navy dark:text-white">Technology Stack</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-4 rounded-2xl bg-slate-100/40 dark:bg-slate-900/40 border">
              <div className="font-bold text-banking-teal text-lg">React 19</div>
              <div className="text-[10px] text-slate-400 uppercase mt-1">Frontend Base</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-100/40 dark:bg-slate-900/40 border">
              <div className="font-bold text-indigo-500 text-lg">TypeScript</div>
              <div className="text-[10px] text-slate-400 uppercase mt-1">Type Safety</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-100/40 dark:bg-slate-900/40 border">
              <div className="font-bold text-emerald-500 text-lg">Spring Boot</div>
              <div className="text-[10px] text-slate-400 uppercase mt-1">Backend Core</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-100/40 dark:bg-slate-900/40 border">
              <div className="font-bold text-orange-500 text-lg">Java 21</div>
              <div className="text-[10px] text-slate-400 uppercase mt-1">Runtime</div>
            </div>
          </div>
        </section>

        {/* Action button */}
        <div className="flex justify-center pt-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-8 py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-banking-teal to-banking-blue hover:shadow-xl hover:shadow-banking-teal/20 transition-all scale-100 active:scale-95"
          >
            Launch Live Console
          </button>
        </div>
      </main>
    </div>
  );
};
