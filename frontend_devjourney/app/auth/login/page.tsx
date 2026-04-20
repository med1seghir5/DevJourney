"use client";

import React from 'react';
import Link from 'next/link';
import LegoCard from '@/components/ui/LegoCard';
import LegoInput from '@/components/ui/LegoInput';
import LegoButton from '@/components/ui/LegoButton';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';


const loginSchema = z.object({
  email: z.string().email("INVALID BRAIN DATA (EMAIL)"),
  password: z.string().min(6, "PASSWORD TOO SHORT (MIN 6 BRICKS)"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { setAuthenticated, setUser } = useAuthStore();
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      console.log("Logging in...", data);
      const response = await api.post('/auth/login', data);
      
      if (response.status === 200) {
        const { user, token } = response.data;
        setUser({
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        });
        setAuthenticated(true);
        localStorage.setItem('accessToken', token);
        router.push('/dashboard');
      }
    } catch (error: any) {
      console.error("Login error:", error);
      const errorMsg = error.response?.data?.message || "ÉCHEC DE CONNEXION";
      alert(`ERREUR: ${errorMsg}`);
    }
  };


  return (
    <div className="min-h-screen bg-pixel-grass flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-brick">
        <LegoCard variant="dark" showStuds={true}>
          <div className="text-center mb-8">
            <h1 className="font-pixel text-2xl text-lego-yellow mb-2">LOGIN</h1>
            <p className="font-retro text-lg text-gray-400">READY TO CONTINUE BUILDING?</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <LegoInput
              label="EMAIL ADDRESS"
              placeholder="e.g. steve@craft.com"
              {...register('email')}
              error={errors.email?.message}
            />
            <LegoInput
              label="PASSWORD"
              type="password"
              placeholder="••••••••"
              {...register('password')}
              error={errors.password?.message}
            />

            <div className="pt-4">
              <LegoButton variant="blue" className="w-full !text-lego-green" type="submit">
                LOGIN 🧱
              </LegoButton>
            </div>
          </form>

          <div className="mt-8 text-center space-y-4">
            <Link href="/auth/register" className="block font-pixel text-[8px] text-gray-400 hover:text-white transition-colors">
              NEW BUILDER? CREATE ACCOUNT
            </Link>
            <Link href="/" className="block font-pixel text-[8px] text-lego-red hover:brightness-125">
              FORGOT PASSWORD?
            </Link>
          </div>
        </LegoCard>
      </div>
    </div>
  );
}
