"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import LegoCard from '@/components/ui/LegoCard';
import LegoButton from '@/components/ui/LegoButton';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';


export default function VerifyEmailPage() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const { setUser, setAuthenticated } = useAuthStore();

  React.useEffect(() => {
    setEmail(localStorage.getItem('verification_email'));
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next
    if (value && index < 5) {
      const nextInput = document.getElementById(`digit-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = code.join('');
    const currentEmail = email || localStorage.getItem('verification_email');

    if (!currentEmail) {
      alert("Email not found. Please register again.");
      router.push('/auth/register');
      return;
    }

    try {
      const response = await api.post('/auth/verify-otp', { email: currentEmail, otpCode });
      if (response.status === 200) {
        const { user, accessToken } = response.data;
        setUser({
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        });
        setAuthenticated(true);
        localStorage.setItem('accessToken', accessToken);
        localStorage.removeItem('verification_email');
        
        alert("ACCOUNT VERIFIED!");
        router.push('/dashboard');
      }
    } catch (error: any) {

      const msg = error.response?.data?.message || "INVALID CODE";
      alert(`ERROR: ${msg}`);
    }
  };

  return (
    <div className="min-h-screen bg-pixel-grass flex items-center justify-center p-4">
      <div className="w-full max-w-lg animate-brick">
        <LegoCard variant="dark" showStuds={true}>
          <div className="text-center mb-10">
            <h1 className="font-pixel text-2xl text-lego-blue mb-4">VERIFY BRAIN</h1>
            <p className="font-retro text-xl text-gray-300">WE SENT A 6-DIGIT BRICK CODE TO YOUR EMAIL</p>
          </div>

          <div className="flex justify-between gap-2 mb-10">
            {code.map((digit, i) => (
              <div key={i} className="flex-1 aspect-[3/4] bg-black/40 border-4 border-lego-dark rounded-brick flex items-center justify-center relative">
                <input
                  id={`digit-${i}`}
                  type="text"
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  className="w-full h-full bg-transparent text-center font-pixel text-2xl text-lego-yellow focus:outline-none"
                  maxLength={1}
                />
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-2 bg-lego-dark rounded-t-full opacity-50" />
              </div>
            ))}
          </div>

          <LegoButton variant="blue" className="w-full" onClick={handleVerify}>
            VERIFY ACCOUNT
          </LegoButton>

          <div className="mt-8 text-center">
            <button className="font-pixel text-[8px] text-gray-500 hover:text-white">
              RESEND CODE IN 00:59
            </button>
          </div>
        </LegoCard>
      </div>
    </div>
  );
}
