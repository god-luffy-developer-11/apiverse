'use client';

import React, { useState, useEffect } from 'react';
import { GlassPanel, Badge, SpaceButton } from '@apiverse/ui';
import {
  GraduationCap,
  Award,
  Flame,
  CheckCircle2,
  Code2,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Shield,
  Zap,
  Check,
  Play,
  RotateCcw,
  Compass
} from 'lucide-react';
import { UIUX_MEDIA } from '@/lib/uiux-assets';
import { LiquidGlassVideoCard } from '@/components/ui/LiquidGlassVideoCard';

interface Mission {
  id: string;
  title: string;
  planet: string;
  xp: number;
  status: string;
  lessonsCount: number;
  description: string;
  sandbox: {
    prompt: string;
    starterCode: string;
    expectedKeyword: string;
  };
  quiz: {
    question: string;
    options: string[];
    correct: number;
    explanation: string;
  };
}

export default function LearningPage() {
  const [data, setData] = useState<any>(null);
  const [activeMission, setActiveMission] = useState<Mission | null>(null);
  const [userCode, setUserCode] = useState('');
  const [sandboxResult, setSandboxResult] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Quiz
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizResult, setQuizResult] = useState<any>(null);
  const [showCertificate, setShowCertificate] = useState(false);

  const loadData = () => {
    fetch('http://localhost:8000/api/v1/learning/missions')
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        if (d.missions?.length > 0 && !activeMission) {
          setActiveMission(d.missions[0]);
          setUserCode(d.missions[0].sandbox?.starterCode || '');
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectMission = (m: Mission) => {
    setActiveMission(m);
    setUserCode(m.sandbox?.starterCode || '');
    setSandboxResult(null);
    setSelectedOption(null);
    setQuizResult(null);
  };

  const handleVerifySandbox = async () => {
    if (!activeMission) return;
    setIsVerifying(true);
    try {
      const resp = await fetch('http://localhost:8000/api/v1/learning/verify-sandbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mission_id: activeMission.id,
          user_code: userCode
        })
      });
      const res = await resp.json();
      setSandboxResult(res);
      if (res.passed) {
        loadData();
      }
    } catch (e) {
      setSandboxResult({ passed: false, message: 'Sandbox execution error' });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!activeMission || selectedOption === null) return;
    try {
      const resp = await fetch('http://localhost:8000/api/v1/learning/submit-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mission_id: activeMission.id,
          question_index: 0,
          selected_option: selectedOption
        })
      });
      const res = await resp.json();
      setQuizResult(res);
      if (res.correct) {
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-zinc-200" />
            <span>LEARNING HUB & CELESTIAL MISSIONS</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Master production API engineering across celestial systems • Live interactive code sandboxes, quizzes, & certificates
          </p>
        </div>

        <SpaceButton
          variant="secondary"
          size="sm"
          icon={<Award className="w-4 h-4 text-zinc-200" />}
          onClick={() => setShowCertificate(true)}
        >
          View Orbital Certificate
        </SpaceButton>
      </div>

      {/* Astronaut Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassPanel glow="cyan" className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/[0.06] backdrop-blur-xl border border-white/30 flex items-center justify-center font-display font-bold text-zinc-200">
            <Compass className="w-6 h-6 text-zinc-200" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Astronaut Rank</div>
            <div className="text-base font-display font-bold text-zinc-200 mt-0.5">
              {data?.rank || 'Senior Orbital Architect'}
            </div>
          </div>
        </GlassPanel>

        <GlassPanel glow="gold" className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/[0.06] backdrop-blur-xl border border-white/30 flex items-center justify-center font-display font-bold text-zinc-200">
            <Sparkles className="w-6 h-6 text-zinc-200" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Experience Points</div>
            <div className="text-base font-display font-bold text-zinc-200 mt-0.5">
              {data?.totalXp || 1450} XP
            </div>
          </div>
        </GlassPanel>

        <GlassPanel glow="purple" className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/[0.06] backdrop-blur-xl border border-pink-500/40 flex items-center justify-center font-display font-bold text-pink-400">
            <Flame className="w-6 h-6 text-pink-400" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Active Daily Streak</div>
            <div className="text-base font-display font-bold text-pink-300 mt-0.5">
              {data?.currentStreakDays || 7} Days Orbiting
            </div>
          </div>
        </GlassPanel>
      </div>

      {/* UIUX Mission Briefing Video Feeds */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <LiquidGlassVideoCard
          src={UIUX_MEDIA.learningStream1}
          title="Mission Flight Briefing: Realtime Microservice Mesh Architecture"
          badge="SIMULATION BRIEFING"
          category="ORBITAL ACADEMY"
          glow="cyan"
        />
        <LiquidGlassVideoCard
          src={UIUX_MEDIA.learningStream2}
          title="Zero-G Protocol Training: Cryptographic Key Decryption & Audit"
          badge="FLIGHT PROTOCOL"
          category="SECURITY MATRIX"
          glow="gold"
        />
      </div>

      {/* Main Grid: Celestial Mission Map vs Active Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Star System Mission Map (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-1">
            Celestial Mission Trajectory
          </div>

          {data?.missions?.map((m: Mission, idx: number) => {
            const isSelected = activeMission?.id === m.id;
            return (
              <GlassPanel
                key={m.id}
                glow={isSelected ? 'cyan' : 'none'}
                className={`p-4 transition-all cursor-pointer ${
                  isSelected ? 'border-white/30 bg-white/10' : 'border-white/5 opacity-80 hover:opacity-100'
                }`}
                onClick={() => selectMission(m)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-zinc-200 uppercase">{m.planet}</span>
                      <span className="text-[10px] font-mono text-zinc-200">+{m.xp} XP</span>
                    </div>
                    <h3 className="font-display font-bold text-sm text-white mt-0.5">{m.title}</h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{m.description}</p>
                  </div>

                  <Badge variant={m.status === 'COMPLETED' ? 'healthy' : m.status === 'IN_PROGRESS' ? 'warning' : 'neutral'}>
                    {m.status}
                  </Badge>
                </div>
              </GlassPanel>
            );
          })}
        </div>

        {/* Right: Interactive Sandbox & Quiz Chamber (7 Cols) */}
        {activeMission && (
          <div className="lg:col-span-7 space-y-4">
            {/* Interactive Code Sandbox */}
            <GlassPanel glow="cyan" className="p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2 text-xs font-mono text-zinc-200 font-bold">
                  <Code2 className="w-4 h-4 text-zinc-200" />
                  <span>MISSION LIVE CODE SANDBOX</span>
                </div>
                <Badge variant="neutral">{activeMission.planet}</Badge>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-sans">{activeMission.sandbox.prompt}</p>

              {/* Code Editor */}
              <div className="space-y-2">
                <textarea
                  value={userCode}
                  onChange={(e) => setUserCode(e.target.value)}
                  className="w-full h-44 bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded-xl p-3.5 font-mono text-xs text-zinc-200 outline-none resize-none leading-relaxed focus:border-cyan-500"
                />

                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500">
                    Hint: Requires cryptographic keyword '{activeMission.sandbox.expectedKeyword}'
                  </span>
                  <SpaceButton
                    variant="primary"
                    size="sm"
                    icon={<Play className="w-3.5 h-3.5" />}
                    onClick={handleVerifySandbox}
                    disabled={isVerifying}
                  >
                    {isVerifying ? 'Verifying Sandbox...' : 'Run & Verify (+150 XP)'}
                  </SpaceButton>
                </div>
              </div>

              {/* Sandbox Execution Feedback */}
              {sandboxResult && (
                <div
                  className={`p-3 rounded-lg border text-xs font-mono flex items-center gap-2 ${
                    sandboxResult.passed
                      ? 'bg-white/10 border-white/30 text-zinc-200'
                      : 'bg-white/10 border-white/30 text-white'
                  }`}
                >
                  {sandboxResult.passed ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <Flame className="w-4 h-4 shrink-0" />}
                  <span>{sandboxResult.message}</span>
                </div>
              )}
            </GlassPanel>

            {/* Interactive Concept Quiz */}
            <GlassPanel glow="purple" className="p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2 text-xs font-mono text-pink-300 font-bold">
                  <HelpCircle className="w-4 h-4 text-pink-400" />
                  <span>KNOWLEDGE CHECKPOINT (+100 XP)</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">RFC & Security Standards</span>
              </div>

              <div className="font-display font-bold text-sm text-white">
                {activeMission.quiz.question}
              </div>

              {/* Options */}
              <div className="space-y-2 font-mono text-xs">
                {activeMission.quiz.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedOption(idx);
                      setQuizResult(null);
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      selectedOption === idx
                        ? 'bg-pink-500/20 border-pink-400 text-pink-200'
                        : 'bg-white/[0.06] backdrop-blur-xl border-white/10 text-slate-300 hover:text-white hover:border-white/20'
                    }`}
                  >
                    <span className="text-slate-500 mr-2 font-bold">{String.fromCharCode(65 + idx)}.</span>
                    <span>{opt}</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] font-mono text-slate-500">Pick an option to submit</span>
                <SpaceButton
                  variant="ultron"
                  size="sm"
                  onClick={handleSubmitQuiz}
                  disabled={selectedOption === null}
                >
                  Submit Answer
                </SpaceButton>
              </div>

              {/* Quiz Feedback */}
              {quizResult && (
                <div
                  className={`p-3 rounded-lg border text-xs font-mono ${
                    quizResult.correct
                      ? 'bg-white/10 border-white/30 text-zinc-200'
                      : 'bg-white/10 border-white/30 text-zinc-200'
                  }`}
                >
                  <div className="font-bold mb-1">{quizResult.correct ? '✓ Correct! +100 XP awarded.' : '✗ Try again.'}</div>
                  <p className="text-slate-300 font-sans">{quizResult.explanation}</p>
                </div>
              )}
            </GlassPanel>
          </div>
        )}
      </div>

      {/* Certificate Modal */}
      {showCertificate && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <GlassPanel glow="gold" className="p-8 max-w-xl w-full text-center space-y-5 border-white/30">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.5)]">
              <Award className="w-8 h-8 text-black" />
            </div>

            <div>
              <div className="text-[10px] font-mono tracking-widest text-zinc-200 uppercase">
                CERTIFICATE OF ORBITAL ARCHITECTURE
              </div>
              <h2 className="text-2xl font-display font-extrabold text-white mt-1">
                APIVERSE SYSTEM MASTERY
              </h2>
            </div>

            <p className="text-xs text-slate-300 font-mono leading-relaxed max-w-md mx-auto">
              This document certifies that <span className="text-zinc-200 font-bold">Astronaut Engineer</span> has successfully navigated the planetary mission trajectories of APIVerse, implementing AES-256-GCM zero-trust vault storage, idempotent REST architectures, and high-frequency real-time WebSocket telemetry.
            </p>

            <div className="p-3 bg-white/[0.06] backdrop-blur-xl rounded-xl border border-white/10 font-mono text-[11px] text-slate-400 flex justify-between max-w-md mx-auto">
              <span>Status: VERIFIED ON-CHAIN</span>
              <span className="text-zinc-200">ID: CERT-ORB-2026-0921</span>
            </div>

            <SpaceButton variant="primary" size="md" onClick={() => setShowCertificate(false)}>
              Dismiss Certificate
            </SpaceButton>
          </GlassPanel>
        </div>
      )}
    </div>
  );
}
