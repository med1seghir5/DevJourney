"use client";

import React from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import LegoCard from '@/components/ui/LegoCard';
import LegoInput from '@/components/ui/LegoInput';
import LegoButton from '@/components/ui/LegoButton';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { setAuthenticated, setUser, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => { setMounted(true); }, []);

  React.useEffect(() => {
    if (mounted && isAuthenticated) router.push('/dashboard');
  }, [mounted, isAuthenticated, router]);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      const response = await api.post('/auth/login', data);
      if (response.status === 200) {
        const { user } = response.data;
        setUser({ id: user._id, username: user.username, email: user.email, role: user.role });
        setAuthenticated(true);
        router.push('/dashboard');
      }
    } catch (error: any) {
      console.error("Login detail:", error);
      const errorMsg = error.response?.data?.message || error.message || 'Login failed';
      const status = error.response?.status;
      alert(`Login Error [${status || 'Network'}]: ${errorMsg}`);
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
