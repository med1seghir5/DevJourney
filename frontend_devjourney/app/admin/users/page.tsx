"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import LegoCard from '@/components/ui/LegoCard';
import LegoButton from '@/components/ui/LegoButton';
import LegoBadge from '@/components/ui/LegoBadge';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

export default function AdminUsersPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [users, setUsers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
    } else if (user) {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handeRoleChange = async (userId: string, newRole: string) => {
    try {
      await api.put('/users/role', { userId, role: newRole });
      fetchUsers(); // Refresh list
    } catch (err) {
       alert("Error changing user role");
    }
  };

  if (!mounted || !user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-pixel-grass p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 flex justify-between items-end animate-brick">
          <div>
            <h1 className="font-pixel text-4xl text-white mb-2 [text-shadow:4px_4px_0px_#FFD700]">🛡️ ADMIN PANEL</h1>
            <p className="font-retro text-2xl text-lego-yellow uppercase tracking-widest">MANAGE SYSTEM ROLES & ACCESS</p>
          </div>
          <LegoButton variant="dark" size="sm" onClick={() => router.push('/dashboard')}>BACK TO BASE</LegoButton>
        </header>

        <LegoCard variant="dark">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-4 border-black font-pixel text-[8px] text-lego-yellow uppercase">
                  <th className="py-4 px-2">BUILDER</th>
                  <th className="py-4">EMAIL</th>
                  <th className="py-4">CURRENT ROLE</th>
                  <th className="py-4 text-center">CHANGE ROLE</th>
                </tr>
              </thead>
              <tbody className="font-retro text-lg">
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse border-b-2 border-black/10">
                      <td colSpan={4} className="py-8"><div className="h-6 bg-black/20 w-full rounded" /></td>
                    </tr>
                  ))
                ) : users.map((u) => (
                  <tr key={u._id} className="border-b-2 border-black/20 hover:bg-black/5 transition-all">
                    <td className="py-4 px-2">
                       <div className="flex items-center gap-3">
                         <div className={`w-8 h-8 rounded-brick border-2 border-black flex items-center justify-center ${u.role === 'admin' ? 'bg-lego-red' : u.role === 'teacher' ? 'bg-lego-blue' : 'bg-lego-dark'}`}>
                           {u.username?.[0] || '?'}
                         </div>
                         <span className="font-pixel text-xs">{u.username}</span>
                       </div>
                    </td>
                    <td className="py-4 text-white/60 text-sm">{u.email}</td>
                    <td className="py-4">
                       <LegoBadge variant={u.role === 'admin' ? 'red' : u.role === 'teacher' ? 'blue' : 'dark' as any}>
                          {u.role.toUpperCase()}
                       </LegoBadge>
                    </td>
                    <td className="py-4">
                       <div className="flex justify-center gap-2">
                          {['user', 'teacher', 'admin'].map((r) => (
                            <button
                              key={r}
                              disabled={u.role === r}
                              onClick={() => handeRoleChange(u._id, r)}
                              className={`px-3 py-1 font-pixel text-[8px] border-2 border-black transition-all ${
                                u.role === r ? 'opacity-0 scale-0 cursor-default' : 'hover:scale-110 active:translate-y-1'
                              } ${r === 'user' ? 'bg-lego-dark text-white' : r === 'teacher' ? 'bg-lego-blue text-white' : 'bg-lego-red text-white'}`}
                            >
                              MAKE {r.toUpperCase()}
                            </button>
                          ))}
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </LegoCard>
      </div>
    </div>
  );
}
