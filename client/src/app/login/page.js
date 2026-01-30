'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, KeyRound, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState('email'); // 'email' | 'reset'
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState('');

  // Check if redirected after password reset
  const resetSuccess = searchParams?.get('reset');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store JWT token and merchant info
        localStorage.setItem('authToken', data.data.token);
        localStorage.setItem('merchantInfo', JSON.stringify(data.data.merchant));
        
        toast.success("Login Successful", {
          description: `Welcome back, ${data.data.merchant.name || 'to SilkPay'}`
        });
        
        // Redirect to dashboard
        router.push('/');
      } else {
        // Handle API errors
        toast.error(data.error?.message || "Login failed", {
          description: data.requestId ? `Support ID: ${data.requestId}` : undefined
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error("Network error", {
        description: "Please check your connection and try again"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Call forgot password API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Reset Link Sent", {
          description: "Check your email for password reset instructions."
        });
        
        // In development, show the token
        if (data.data?.token) {
          console.log('Reset token (dev):', data.data.token);
          setResetToken(data.data.token);
          setForgotStep('reset');
        } else {
          // In production, just close modal
          setShowForgot(false);
          setForgotEmail('');
        }
      } else {
        // Show error with request ID if available
        toast.error(data.error?.message || "Failed to send reset link", {
          description: data.requestId ? `Support ID: ${data.requestId}` : undefined
        });
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error("Network error", {
        description: "Please check your connection and try again"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newPassword = formData.get('newPassword');
    const confirmPassword = formData.get('confirmPassword');

    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, password: newPassword })
      });

      if (response.ok) {
        toast.success("Password Reset Successful", {
          description: "You can now login with your new password"
        });
        setShowForgot(false);
        setForgotStep('email');
        setResetToken('');
        setForgotEmail('');
      } else {
        const data = await response.json();
        toast.error(data.error?.message || "Invalid or expired reset token");
      }
    } catch (error) {
      toast.error("Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm z-10 relative">
        {/* Logo */}
        <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-2xl shadow-lg shadow-primary/40">
                  S
                </div>
                <span className="text-2xl font-bold text-white tracking-wide">SilkPay</span>
            </div>
        </div>

        {/* Success message if coming from password reset */}
        {resetSuccess && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm text-center">
            ✓ Password reset successful! Please login.
          </div>
        )}

        {!showForgot ? (
          // LOGIN FORM
          <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
              <CardDescription className="text-center">
                Enter your credentials to access your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                            id="email" 
                            name="email"
                            type="email" 
                            placeholder="name@example.com" 
                            required 
                            defaultValue="test@silkpay.local" 
                            className="bg-black/20 border-white/5 focus-visible:ring-primary/50 text-white placeholder:text-muted-foreground/50"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                            <Input 
                                id="password" 
                                name="password"
                                type={showPassword ? "text" : "password"}
                                required 
                                defaultValue="password123" 
                                className="bg-black/20 border-white/5 focus-visible:ring-primary/50 text-white pr-10"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Forgot Password Link */}
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setShowForgot(true)}
                        className="text-xs text-primary hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>

                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all duration-200" disabled={loading}>
                        {loading ? "Signing in..." : "Sign in"}
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 text-xs text-center text-muted-foreground pb-6">
                <div className="text-muted-foreground">
                    Don't have an account? <span className="text-primary cursor-pointer hover:underline">Contact Sales</span>
                </div>
                <div className="opacity-50">Protected by SilkPay Security</div>
            </CardFooter>
          </Card>
        ) : (
          // FORGOT PASSWORD FORM
          <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl">
            <CardHeader className="space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowForgot(false);
                    setForgotStep('email');
                    setResetToken('');
                  }}
                  className="h-8 w-8 p-0"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <KeyRound className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-2xl">
                {forgotStep === 'email' ? 'Forgot Password?' : 'Reset Password'}
              </CardTitle>
              <CardDescription className="text-center">
                {forgotStep === 'email' 
                  ? 'Enter your email to receive reset instructions' 
                  : 'Enter your new password'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {forgotStep === 'email' ? (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="forgot-email">Email</Label>
                      <Input 
                        id="email" 
                        name="email"
                        type="email" 
                        placeholder="name@example.com" 
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="bg-black/20 border-white/5 focus-visible:ring-primary/50 text-white placeholder:text-muted-foreground/50"
                      />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90" 
                    disabled={loading}
                  >
                    {loading ? "Sending..." : "Send Reset Link"}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input 
                      id="newPassword" 
                      name="newPassword"
                      type="password" 
                      placeholder="Enter new password" 
                      required 
                      minLength={6}
                      className="bg-black/20 border-white/5 focus-visible:ring-primary/50 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input 
                      id="confirmPassword" 
                      name="confirmPassword"
                      type="password" 
                      placeholder="Confirm new password" 
                      required 
                      minLength={6}
                      className="bg-black/20 border-white/5 focus-visible:ring-primary/50 text-white"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90" 
                    disabled={loading}
                  >
                    {loading ? "Resetting..." : "Reset Password"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0d0e12] relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-[#0d0e12] to-[#0d0e12] z-0 pointer-events-none" />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/40 rounded-full blur-[100px] opacity-30 animate-pulse delay-700" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-pink-500/40 rounded-full blur-[100px] opacity-30 animate-pulse" />

      <Suspense fallback={<div>Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
