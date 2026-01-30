'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/services/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Bell, Shield, Wallet, Code, Save, ChevronDown, ChevronUp, KeyRound } from 'lucide-react';
import { cn } from "@/lib/utils";

const PRESET_AVATARS = [
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    'https://images.unsplash.com/photo-1527980965255-d3b416303d12?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    'https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
];

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Change Password states
  const [passwordSectionOpen, setPasswordSectionOpen] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Check URL for auto-open
  useEffect(() => {
    const section = searchParams?.get('section');
    if (section === 'change-password') {
      setPasswordSectionOpen(true);
      // Scroll to security section
      setTimeout(() => {
        document.getElementById('security-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/settings');
        setSettings(res.data);
      } catch (error) {
        console.error("Failed to load settings", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const updateLocalSetting = (section, data) => {
      setHasChanges(true);
      setSettings(prev => {
          const newSettings = JSON.parse(JSON.stringify(prev));
          if (section === 'avatar') newSettings.avatar = data.avatar;
          if (section === 'notifications') newSettings.notifications = { ...prev.notifications, ...data };
          if (section === 'webhook') newSettings.webhook = { ...prev.webhook, ...data };
          if (section === 'security') newSettings.security = { ...prev.security, ...data };
          if (section === 'session') newSettings.session = { ...prev.session, timeout: data.timeout };
          return newSettings;
      });
  };

  const saveAllSettings = async () => {
      setSaving(true);
      try {
          await api.post('/settings/update', settings);
          await new Promise(resolve => setTimeout(resolve, 1000));
          setHasChanges(false);
          toast.success('Settings saved successfully');
      } catch (error) {
          console.error("Failed to save settings", error);
          toast.error("Failed to save settings");
      } finally {
          setSaving(false);
      }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const oldPassword = formData.get('oldPassword');
    const newPassword = formData.get('newPassword');
    const confirmPassword = formData.get('confirmPassword');

    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setChangingPassword(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/merchant/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ oldPassword, newPassword })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Password changed successfully");
        e.target.reset();
        setPasswordSectionOpen(false);
      } else {
        toast.error(data.error?.message || "Failed to change password");
      }
    } catch (error) {
      toast.error("Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6 max-w-5xl">
       <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
            <Button 
                onClick={saveAllSettings} 
                className="min-w-[140px]" 
                disabled={!hasChanges || saving}
            >
                {saving ? (
                    <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>
                        Saving...
                    </>
                ) : (
                    <>
                        <Save className="mr-2 h-4 w-4" /> Apply Changes
                    </>
                )}
            </Button>
       </div>

       <div className="grid gap-6">
            
            {/* 1. Profile Appearance */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Profile Appearance</CardTitle>
                    <CardDescription>Choose your profile picture</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-3">
                        {PRESET_AVATARS.map((avatar, idx) => (
                            <button
                                key={idx}
                                onClick={() => updateLocalSetting('avatar', { avatar })}
                                className={cn(
                                    "h-16 w-16 rounded-full overflow-hidden border-2 transition-all hover:scale-110",
                                    settings.avatar === avatar ? "border-primary ring-4 ring-primary/20" : "border-border"
                                )}
                            >
                                <img src={avatar} alt={`Avatar ${idx + 1}`} className="h-full w-full object-cover" />
                            </button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* 2. Notifications */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" /> Notifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label className="text-base">Email Notifications</Label>
                        <Switch 
                            checked={settings.notifications.email}
                            onCheckedChange={(checked) => updateLocalSetting('notifications', { email: checked })}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <Label className="text-base">SMS Notifications</Label>
                        <Switch 
                            checked={settings.notifications.sms}
                            onCheckedChange={(checked) => updateLocalSetting('notifications', { sms: checked })}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* 3. API & Webhooks */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Code className="h-5 w-5" /> API & Webhooks</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <Label>Webhook URL</Label>
                        <Input 
                            placeholder="https://api.example.com/webhook" 
                            value={settings.webhook.url}
                            onChange={(e) => updateLocalSetting('webhook', { url: e.target.value })}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* 4. Security with Change Password */}
            <Card id="security-section">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Security</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                        <Label className="text-base">Two-Factor Auth (2FA)</Label>
                        <Switch 
                            checked={settings.security.two_factor_enabled}
                            onCheckedChange={(checked) => updateLocalSetting('security', { two_factor_enabled: checked })}
                        />
                    </div>

                    <div className="border-t pt-6">
                        <div className="flex items-center justify-between">
                            <Label className="text-base cursor-pointer" onClick={() => setPasswordSectionOpen(!passwordSectionOpen)}>
                                Change Password
                            </Label>
                            <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setPasswordSectionOpen(!passwordSectionOpen)}
                                className="h-8 w-8 p-0"
                            >
                                {passwordSectionOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                        </div>
                            
                            <div className={cn(
                                "grid transition-all duration-200 ease-in-out",
                                passwordSectionOpen ? "grid-rows-[1fr] opacity-100 pt-4" : "grid-rows-[0fr] opacity-0"
                            )}>
                                <div className="overflow-hidden">
                                    <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                                        <div className="space-y-2">
                                            <Label htmlFor="oldPassword">Current Password</Label>
                                            <Input
                                                id="oldPassword"
                                                name="oldPassword"
                                                type="password"
                                                required
                                                placeholder="Enter current password"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="newPassword">New Password</Label>
                                            <Input
                                                id="newPassword"
                                                name="newPassword"
                                                type="password"
                                                required
                                                minLength={6}
                                                placeholder="Enter new password (min 6 chars)"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                                            <Input
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                type="password"
                                                required
                                                minLength={6}
                                                placeholder="Confirm new password"
                                            />
                                        </div>
                                        <Button type="submit" className="w-full" disabled={changingPassword}>
                                            {changingPassword ? "Changing..." : "Change Password"}
                                        </Button>
                                    </form>
                                </div>
                            </div>
                    </div>
                </CardContent>
             </Card>

             {/* 5. Session */}
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Wallet className="h-5 w-5" /> Session</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <Label>Session Timeout</Label>
                        <Select 
                            value={settings.session.timeout}
                            onValueChange={(val) => updateLocalSetting('session', { timeout: val })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select timeout" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="15m">15 Minutes</SelectItem>
                                <SelectItem value="30m">30 Minutes</SelectItem>
                                <SelectItem value="1h">1 Hour</SelectItem>
                                <SelectItem value="4h">4 Hours</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
             </Card>
        </div>

      </div>

  );
}
