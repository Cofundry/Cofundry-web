'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GalleryVerticalEnd } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {  useDispatch, useSelector } from 'react-redux';


import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "../spinner";
import { login as loginAction } from "@/app/store/slices/userSlice";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { RootState } from "@/app/store/store";
import { FaGoogle, FaGithub } from 'react-icons/fa';
import { useEffect } from "react";

export default function RegisterForm({ className, ...props }: React.ComponentProps<"div">) {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user.user);
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState<{  email?: string; password?: string }>({});
  const [serverError, setServerError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
const [Loading, setLoading] = useState(false);
  const validate = () => {
    const newErrors: typeof errors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;
    setLoading(true);

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(formData),
      headers: { 'Content-Type': 'application/json' },
    });

    if (res.ok) {
      const data = await res.json();
      router.push('/dashboard');
      dispatch(loginAction(data.user));

      setLoading(false);
      setSuccessMessage('Welcome back');
    } else {
      setServerError('Login failed. Please check your credentials.');
      setSuccessMessage('');
      setLoading(false);
    }
  };

  async function handleOAuthLogin(provider:any) {
    // Redirect to provider (this will come back to your API route with ?code=...)
    window.location.href = `/api/auth/${provider}`;
  }

  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    // Determine provider from pathname or search param
    let provider = null;
    if (window.location.pathname.includes("google")) provider = "google";
    if (window.location.pathname.includes("github")) provider = "github";
    // Or, if you use a query param for provider, you can parse it here

    if (code && provider) {
      fetch(`/api/auth/${provider}?code=${code}`)
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            dispatch(loginAction(data.user));
            window.location.href = "/dashboard";
          } else {
            // Optionally show error
          }
        });
    }
  }, [dispatch]);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
         <div className="flex flex-col items-center gap-2">
            <a href="#" className="flex flex-col items-center gap-2 font-medium">
         
              <span className="sr-only">BotsCrafts.</span>
            </a>
            <h1 className="text-xl font-bold">Welcome toCofundry</h1>
            <div className="text-center text-sm">
              You have an account?{" "}
              <Link href="/register" >
                Sign in
              </Link>
            </div>
          </div>
          <div className="flex flex-col gap-3 w-full mb-6">
            <Button onClick={() => handleOAuthLogin("google")} className="flex items-center justify-center gap-2 px-4 py-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50 font-medium text-gray-700 transition">
              <FaGoogle className="text-lg" /> Continue with Google
            </Button>
            <Button onClick={() => handleOAuthLogin("github")} className="flex items-center justify-center gap-2 px-4 py-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50 font-medium text-gray-700 transition">
              <FaGithub className="text-lg" /> Continue with GitHub
            </Button>
          </div>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6">
       


          <div className="flex flex-col gap-6">
      
            {/* Email Field */}
            <div className="grid gap-3">
              <Label htmlFor="email">Email</Label>
              <Input
              placeholder="contact@cofundry.com"
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`${errors.email ? 'border-2 border-red-500' : ''}`}
              />
              {errors.email && (
                <Alert variant="destructive" className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg shadow-sm p-3 mt-1">
                  <AlertCircle className="text-red-500 w-5 h-5" />
                  <AlertDescription className="text-red-700 font-medium">{errors.email}</AlertDescription>
                </Alert>
              )}
            </div>

            {/* Password Field */}
            <div className="grid gap-3">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                placeholder="********"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={`${errors.password ? 'border-2 border-red-500' : ''}`}
              />
              {errors.password && (
                <Alert variant="destructive" className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg shadow-sm p-3 mt-1">
                  <AlertCircle className="text-red-500 w-5 h-5" />
                  <AlertDescription className="text-red-700 font-medium">{errors.password}</AlertDescription>
                </Alert>
              )}
            </div>


            <Button type="submit" className="w-full relative overflow-hidden">
              {/* Animated gradient background */}
              <span className="absolute " style={{ pointerEvents: 'none' }} />
              <span className="relative z-10 flex items-center justify-center">{Loading ? (<Spinner />):'Login'}</span>
            </Button>
          </div>
            {serverError && (
              <Alert variant="destructive" className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg shadow-sm p-3 mt-3">
                <AlertCircle className="text-red-500 w-5 h-5" />
                <AlertDescription className="text-red-700 font-medium">{serverError}</AlertDescription>
              </Alert>
            )}
            {successMessage && (
             
                <AlertDescription className="text-green-700 font-medium">{successMessage}</AlertDescription>
            )}

    
        </div>
      </form>

      <div className="text-muted-foreground text-center text-xs text-balance mt-4">
        By clicking continue, you agree to our <a href="#" className="underline hover:text-primary">Terms of Service</a> and <a href="#" className="underline hover:text-primary">Privacy Policy</a>.
      </div>
    </div>
  );
}
