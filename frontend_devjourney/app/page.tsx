"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import LegoButton from '@/components/ui/LegoButton';
import LegoCard from '@/components/ui/LegoCard';
import LegoBadge from '@/components/ui/LegoBadge';

const BackgroundElements = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {/* Floating Pixel Elements */}
    <div className="absolute top-[15%] left-[5%] w-20 h-20 border-8 border-white/5 rotate-12 animate-float" />
    <div className="absolute top-[25%] right-[10%] w-16 h-16 bg-lego-yellow/5 rounded-brick -rotate-12 animate-float" style={{ animationDelay: '2s' }} />
    <div className="absolute bottom-[20%] left-[20%] w-24 h-24 bg-lego-blue/5 rounded-brick rotate-45 animate-float" style={{ animationDelay: '4s' }} />

    <div className="absolute top-0 left-0 w-full h-full opacity-30" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
  </div>
);

export default function Home() {
  const [stats, setStats] = useState({ devs: 0, challenges: 0, blocks: 0 });

  useEffect(() => {
    const target = { devs: 420, challenges: 15, blocks: 1250 };
    const duration = 2000;
    const startTime = Date.now();

    const updateStats = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      setStats({
        devs: Math.floor(target.devs * progress),
        challenges: Math.floor(target.challenges * progress),
        blocks: Math.floor(target.blocks * progress),
      });
      if (progress < 1) requestAnimationFrame(updateStats);
    };
    updateStats();
  }, []);

  return (
    <div className="min-h-screen bg-pixel-grass flex flex-col pt-0">
      <BackgroundElements />

      {/* Hero Section - Balanced 2-Column Layout */}
      <section className="relative w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between py-6 lg:py-10 px-6 lg:px-12 z-10">

        <div className="flex-1 text-center lg:text-left space-y-8 animate-brick order-2 lg:order-1">
          <div className="inline-block">
            <LegoBadge variant="status" className="!text-[10px] bg-lego-blue border-none shadow-none">V1.0 INITIALIZED</LegoBadge>
          </div>

          <h1 className="font-pixel text-4xl md:text-5xl lg:text-7xl text-white uppercase tracking-tighter drop-shadow-lg [text-shadow:6px_6px_0px_#000] leading-tight">
            Build Your Future<br />
            <span className="text-lego-yellow">Brick by Brick</span>
          </h1>

          <p className="font-retro text-xl md:text-2xl text-blue-100 max-w-xl mx-auto lg:mx-0 leading-relaxed opacity-90">
            The ultimate gamified platform for developers to master coding through real missions and global ranking.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 pt-4">
            <Link href="/auth/register" className="w-full sm:w-auto">
              <LegoButton variant="green" size="lg" className="w-full h-16 md:h-18 !px-10 flex items-center justify-center gap-3">
                <span className="text-2xl not-italic">🧱</span>
                <span>START BUILDING</span>
              </LegoButton>
            </Link>
            <Link href="/challenges" className="w-full sm:w-auto">
              <LegoButton variant="blue" size="lg" className="w-full h-16 md:h-18 !px-10 flex items-center justify-center gap-3">
                <span className="text-2xl not-italic">🗺️</span>
                <span>EXPLORE MAP</span>
              </LegoButton>
            </Link>
          </div>
        </div>

        <div className="flex-1 flex justify-center lg:justify-end animate-brick order-1 lg:order-2 mb-10 lg:mb-0">
          <div className="relative w-72 h-72 md:w-[480px] md:h-[480px]">
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-lego-yellow/10 blur-[80px] rounded-full animate-pulse" />
            <Image
              src="/logo.png"
              alt="DevJourney Logo"
              fill
              className="object-contain filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)] animate-float"
              priority
            />
          </div>
        </div>
      </section>

      {/* Stats Row - Integrated into Flow */}
      <section className="relative z-10 px-6 mb-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: 'ACTIVE BUILDERS', value: stats.devs, icon: '👷' },
            { label: 'LIVE MISSIONS', value: stats.challenges, icon: '🚀' },
            { label: 'BLOCKS PLACED', value: stats.blocks, icon: '🧱' },
          ].map((s, i) => (
            <div key={i} className="animate-brick" style={{ animationDelay: `${i * 0.2}s` }}>
              <LegoCard variant="dark" className="border-b-[10px] border-black">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-4xl mb-2">{s.icon}</span>
                  <div className="font-pixel text-4xl text-white">{s.value}+</div>
                  <div className="font-pixel text-[10px] text-lego-yellow uppercase">{s.label}</div>
                </div>
              </LegoCard>
            </div>
          ))}
        </div>
      </section>

      {/* Mission Protocol Section */}
      <section className="py-24 px-4 bg-black/10 relative z-10 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-brick">
            <h2 className="font-pixel text-3xl md:text-4xl text-white mb-4 uppercase">Mission Protocol</h2>
            <p className="font-retro text-xl text-blue-200 uppercase tracking-widest">Start your journey in 4 steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { num: '01', title: 'JOIN BASE', desc: 'Secure your ID and join the global corps.', icon: '🔑' },
              { num: '02', title: 'PICK TRACK', desc: 'Select Web, Mobile, Backend or AI.', icon: '🎯' },
              { num: '03', title: 'STACK CODE', desc: 'Solve missions and push your repo.', icon: '🏗️' },
              { num: '04', title: 'LEVEL UP', desc: 'Gain XP and climb the leaderboard.', icon: '⚡' },
            ].map((step, i) => (
              <div key={i} className="group animate-brick" style={{ animationDelay: `${i * 0.15}s` }}>
                <LegoCard variant="dark" className="h-full border-t-8 border-lego-blue group-hover:border-lego-yellow transition-all">
                  <div className="font-pixel text-lego-yellow text-[8px] mb-4">{step.num}</div>
                  <div className="text-3xl mb-6">{step.icon}</div>
                  <h3 className="font-pixel text-sm mb-3 uppercase text-white">{step.title}</h3>
                  <p className="font-retro text-sm text-gray-400">{step.desc}</p>
                </LegoCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disciplines Section */}
      <section className="py-32 px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <LegoBadge variant="status" className="bg-lego-red">OUR DISCIPLINES</LegoBadge>
            <h2 className="font-pixel text-3xl md:text-4xl text-white mt-4 uppercase tracking-wider underline decoration-lego-yellow decoration-4 underline-offset-8">Master your discipline</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {[
              { title: 'WEB DEVELOPMENT', icon: '🌐', color: 'border-lego-blue', desc: 'Master frameworks like React & Next.js.' },
              { title: 'MOBILE APPS', icon: '📱', color: 'border-lego-green', desc: 'Build for iOS and Android.' },
              { title: 'BACKEND SYSTEMS', icon: '⚙️', color: 'border-lego-yellow', desc: 'Architect scalable server logic.' },
              { title: 'A.I. & DATA', icon: '🧠', color: 'border-lego-red', desc: 'Integrate machine learning models.' },
            ].map((d, i) => (
              <LegoCard key={i} variant="white" className={`group hover:-translate-y-4 transition-transform border-b-[12px] ${d.color}`}>
                <div className="w-16 h-16 bg-lego-dark rounded-brick border-4 border-black mb-6 flex items-center justify-center text-3xl">{d.icon}</div>
                <h3 className="font-pixel text-lg mb-4 text-black uppercase">{d.title}</h3>
                <p className="font-retro text-lg text-gray-600">{d.desc}</p>
              </LegoCard>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
