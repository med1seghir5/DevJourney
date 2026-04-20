"use client";

import React from 'react';
import LegoCard from '@/components/ui/LegoCard';
import LegoButton from '@/components/ui/LegoButton';
import { useAuthStore } from '@/store/authStore';

import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      logout();
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-pixel-grass p-4 md:p-8">

      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Avatar & Quick Info */}
          <div className="space-y-8">
            <LegoCard variant="dark">
              <div className="flex flex-col items-center py-6">
                <div className="w-32 h-32 bg-lego-yellow border-4 border-black rounded-brick relative mb-6 shadow-brick">
                  <div className="absolute top-10 left-6 w-3 h-3 bg-black rounded-full" />
                  <div className="absolute top-10 right-6 w-3 h-3 bg-black rounded-full" />
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-8 h-2 bg-black rounded-full opacity-30" />
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-16 h-8 bg-lego-red border-2 border-black rounded-t-brick" />
                </div>
                <h2 className="font-pixel text-lg text-white mb-2">{user?.username || 'MASTER BUILDER'}</h2>
                <p className="font-retro text-lg text-gray-400">LEVEL 12 BUILDER</p>
              </div>
              <div className="border-t-4 border-black pt-6 space-y-4">
                 <div className="flex justify-between font-retro text-lg">
                   <span className="text-gray-400">EMAIL:</span>
                   <span>{user?.email || 'dev@brick.com'}</span>
                 </div>
                 <div className="flex justify-between font-retro text-lg">
                   <span className="text-gray-400">JOINED:</span>
                   <span>APR 2026</span>
                 </div>
              </div>
              <div className="space-y-4">
                <LegoButton variant="blue" className="w-full mt-8" size="sm">EDIT PROFILE</LegoButton>
                <LegoButton variant="red" className="w-full" size="sm" onClick={handleLogout}>LOGOUT</LegoButton>
              </div>
            </LegoCard>


            <LegoCard variant="yellow">
              <h3 className="font-pixel text-[10px] mb-4">INVENTORY (BADGES)</h3>
              <div className="flex flex-wrap gap-3">
                {['🏅', '🚀', '🛠️', '🧱', '💎', '🔥'].map((emoji, i) => (
                  <div key={i} className="w-10 h-10 bg-black/10 border-2 border-yellow-700 rounded-brick flex items-center justify-center text-xl">
                    {emoji}
                  </div>
                ))}
              </div>
            </LegoCard>
          </div>

          {/* Right Column: History & Stats */}
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-3 gap-4">
               {[
                 { label: 'COMPLETED', val: '45', color: 'green' },
                 { label: 'SOLUTIONS', val: '128', color: 'blue' },
                 { label: 'XP', val: '12K', color: 'red' },
               ].map((stat, i) => (
                 <LegoCard key={i} variant={stat.color as any} showStuds={false}>
                   <div className="text-center">
                     <div className="font-pixel text-[8px] opacity-70 mb-1">{stat.label}</div>
                     <div className="font-pixel text-xl">{stat.val}</div>
                   </div>
                 </LegoCard>
               ))}
            </div>

            <LegoCard variant="white">
               <h3 className="font-pixel text-xs mb-8 border-b-2 border-gray-100 pb-4">🔨 RECENT BUILD STEPS (HISTORY)</h3>
               <div className="space-y-6">
                 {[
                   { title: 'PIXEL BUFFER ALGORITHM', time: '2 hours ago', xp: '+450' },
                   { title: 'RECURSIVE TOWER', time: 'Yesterday', xp: '+250' },
                   { title: 'ARRAY BRICK SORTER', time: '3 days ago', xp: '+100' },
                 ].map((hist, i) => (
                   <div key={i} className="flex items-center gap-4 group cursor-pointer">
                     <div className="w-12 h-12 bg-lego-dark border-4 border-black rounded-brick flex items-center justify-center text-white font-pixel text-xs shrink-0">
                       {i + 1}
                     </div>
                     <div className="flex-grow">
                        <div className="font-pixel text-[10px] group-hover:text-lego-blue transition-colors">{hist.title}</div>
                        <div className="font-retro text-sm text-gray-500">{hist.time}</div>
                     </div>
                     <div className="font-pixel text-[10px] text-lego-green">{hist.xp} XP</div>
                   </div>
                 ))}
               </div>
               <LegoButton variant="dark" size="sm" className="w-full mt-10">VIEW ALL HISTORY</LegoButton>
            </LegoCard>
          </div>
        </div>
      </div>
    </div>
  );
}
