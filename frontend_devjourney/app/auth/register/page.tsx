"use client";

import React from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import LegoCard from '@/components/ui/LegoCard';
import LegoInput from '@/components/ui/LegoInput';
import LegoButton from '@/components/ui/LegoButton';

const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password too short'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { setUser, setAuthenticated, isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => { setMounted(true); }, []);

  React.useEffect(() => {
    if (mounted && isAuthenticated) router.push('/dashboard');
  }, [mounted, isAuthenticated, router]);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      const response = await api.post('/auth/register', {
        username: data.username,
        email: data.email,
        password: data.password,
      });

      if (response.status === 201) {
        const { user } = response.data;
        setUser({ id: user._id, _id: user._id, username: user.username, email: user.email, role: user.role });
        setAuthenticated(true);
        router.push('/dashboard');
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Registration failed';
      alert(`Error: ${errorMsg}`);
    }
  };

  return (
    <div className="min-h-screen bg-pixel-grass flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-brick">
        <LegoCard variant="dark" showStuds={true}>
          <div className="text-center mb-8">
            <h1 className="font-pixel text-2xl text-lego-green mb-2">REGISTER</h1>
            <p className="font-retro text-lg text-gray-400">START YOUR JOURNEY TODAY</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <LegoInput
              label="USERNAME"
              placeholder="e.g. MasterBuilder42"
              {...register('username')}
              error={errors.username?.message}
            />
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
            <LegoInput
              label="CONFIRM PASSWORD"
              type="password"
              placeholder="••••••••"
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
            />
            <div className="pt-4">
              <LegoButton variant="green" className="w-full" type="submit">
                CREATE ACCOUNT 🧱
              </LegoButton>
            </div>
          </form>

          <div className="mt-8 text-center">
            <Link href="/auth/login" className="block font-pixel text-[8px] text-gray-400 hover:text-white transition-colors">
              ALREADY A BUILDER? LOGIN
            </Link>
          </div>
        </LegoCard>
      </div>
    </div>
  );
}
