'use client';

import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Copy, RefreshCw, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function MerchantPage() {
  const [profile, setProfile] = useState(null);
  const [apiKeys, setApiKeys] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching merchant data...");
        const [profileRes, apiRes] = await Promise.all([
          api.get('/merchant/profile'),
          api.get('/merchant/api-keys')
        ]);
        
        console.log("Profile Res:", profileRes);
        console.log("API Keys Res:", apiRes);

        if (profileRes.success) {
             setProfile(profileRes.data);
        } else if (profileRes.data) {
             // Fallback if success flag is missing but data exists
             setProfile(profileRes.data);
        }

        if (apiRes.success) {
            setApiKeys(apiRes.data);
        } else if (apiRes.data) {
            setApiKeys(apiRes.data);
        }
        
      } catch (error) {
        console.error("Failed to load merchant data", error);
        toast.error("Failed to load merchant profile");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
        <div className="space-y-6">
            <div className="h-8 w-48 bg-muted animate-pulse rounded" />
            <div className="grid gap-6 md:grid-cols-2">
                <div className="h-64 bg-muted animate-pulse rounded-lg" />
                <div className="h-64 bg-muted animate-pulse rounded-lg" />
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Merchant Center</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Information */}
        {profile ? (
            <ProfileInfoCard profile={profile} />
        ) : (
            <Card className="border-red-500/20">
                <CardHeader>
                    <CardTitle className="text-red-500">Profile Not Loaded</CardTitle>
                    <CardDescription>Could not retrieve profile info.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
                </CardContent>
            </Card>
        )}

        {/* API Security */}
        <APISecurityCard initialKeys={apiKeys} />
      </div>
    </div>
  );
}

function ProfileInfoCard({ profile }) {
  if (!profile) return null;
  
  const copyMerchantNo = () => {
      navigator.clipboard.writeText(profile.merchant_no);
      toast.success("Merchant ID copied");
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Merchant Profile</CardTitle>
        <CardDescription>Your business details and integration ID.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label>Merchant No. (ID)</Label>
          <div className="flex items-center gap-2">
             <Input value={profile.merchant_no} readOnly className="font-mono bg-secondary/50" />
             <Button variant="outline" size="icon" onClick={copyMerchantNo}>
                 <Copy className="h-4 w-4" />
             </Button>
          </div>
          <div className="flex mt-1">
             <Badge variant="outline" className={
                 profile.status === 'ACTIVE' ? "text-green-500 border-green-500 bg-green-500/10" : "text-yellow-500"
             }>
                 {profile.status}
             </Badge>
          </div>
        </div>
        
        <div className="grid gap-2">
          <Label>Business Name</Label>
          <Input value={profile.name} readOnly className="bg-muted" />
        </div>
        
        <div className="grid gap-2">
          <Label>Registered Email</Label>
          <Input value={profile.email} readOnly className="bg-muted" />
        </div>

        <div className="text-xs text-muted-foreground mt-4">
            To update these details, please contact support.
        </div>
      </CardContent>
    </Card>
  );
}

function APISecurityCard({ initialKeys }) {
    const [keys, setKeys] = useState(initialKeys || { secret_key: '', whitelist_ips: [] });
    const [showKey, setShowKey] = useState(false);
    const [regenerating, setRegenerating] = useState(false);
    const [newIp, setNewIp] = useState('');
    const [updatingIp, setUpdatingIp] = useState(false);
    
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success("Secret Key copied to clipboard");
    };

    const handleRotateKey = async () => {
        if (!confirm("⚠️ CAUTION: Rotating your Secret Key will immediately invalidate the old one. Your API integrations will stop working until you update them. Are you sure?")) return;
        
        setRegenerating(true);
        try {
            // Corrected endpoint
            const res = await api.post('/merchant/api-keys/rotate', {});
            if (res.success) {
                setKeys(prev => ({ ...prev, secret_key: res.data.secret_key }));
                setShowKey(true);
                toast.success("New Secret Key generated");
            }
        } catch (err) {
            toast.error("Failed to rotate key");
        } finally {
            setRegenerating(false);
        }
    };

    const handleAddIp = async () => {
        if (!newIp) return;
        
        // Simple IP validation
        const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
        if (!ipRegex.test(newIp)) {
            toast.error("Invalid IP address format");
            return;
        }

        if (keys.whitelist_ips?.includes(newIp)) {
            toast.error("IP already whitelisted");
            return;
        }

        const updatedIps = [...(keys.whitelist_ips || []), newIp];
        await updateWhitelist(updatedIps);
        setNewIp('');
    };

    const handleRemoveIp = async (ipToRemove) => {
        if (!confirm(`Remove ${ipToRemove} from whitelist?`)) return;
        const updatedIps = keys.whitelist_ips.filter(ip => ip !== ipToRemove);
        await updateWhitelist(updatedIps);
    };

    const updateWhitelist = async (ips) => {
        setUpdatingIp(true);
        try {
            // Corrected endpoint: PUT /merchant/whitelist-ips
            const res = await api.put('/merchant/whitelist-ips', { ips });
            console.log(res);
            if (res.success) {
                setKeys(prev => ({ ...prev, whitelist_ips: res.data.whitelist_ips }));
                toast.success("IP Whitelist updated");
            }
        } catch (err) {
            toast.error("Failed to update whitelist");
        } finally {
            setUpdatingIp(false);
        }
    };

    return (
        <Card className="border-orange-500/20">
            <CardHeader>
                <CardTitle>API Security</CardTitle>
                <CardDescription>Manage your API credentials and IP whitelist.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                
                {/* Secret Key Section */}
                <div className="space-y-3">
                    <Label className="text-orange-500">Secret Key (Payout API)</Label>
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <Input 
                                type={showKey ? "text" : "password"} 
                                value={keys.secret_key || ''} 
                                readOnly 
                                className="pr-10 font-mono bg-secondary/50" 
                            />
                        </div>
                        <Button variant="outline" size="icon" onClick={() => setShowKey(!showKey)}>
                            {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => copyToClipboard(keys.secret_key)}>
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                    <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={handleRotateKey} 
                        disabled={regenerating}
                        className="w-full"
                    >
                        <RefreshCw className={`mr-2 h-4 w-4 ${regenerating ? 'animate-spin' : ''}`} />
                        {regenerating ? 'Regenerating...' : 'Rotate Secret Key'}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                        Keep this key secure. Do not share it in client-side code.
                    </p>
                </div>

                <div className="border-t border-border/50 my-4" />

                {/* IP Whitelist Section */}
                <div className="space-y-3">
                    <Label>IP Whitelist</Label>
                    <div className="flex items-center gap-2">
                        <Input 
                            placeholder="Enter IP Address (e.g. 192.168.1.1)" 
                            value={newIp}
                            onChange={(e) => setNewIp(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddIp()}
                            disabled={updatingIp}
                        />
                        <Button size="icon" onClick={handleAddIp} disabled={updatingIp || !newIp}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                    
                    <div className="space-y-2 mt-2">
                        {keys.whitelist_ips?.map((ip) => (
                            <div key={ip} className="flex items-center justify-between p-2 rounded-md border bg-muted/40 text-sm">
                                <div className="flex items-center gap-2 font-mono">
                                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                                    {ip}
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6 text-muted-foreground hover:text-red-500"
                                    onClick={() => handleRemoveIp(ip)}
                                    disabled={updatingIp}
                                >
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </div>
                        ))}
                        {(!keys.whitelist_ips || keys.whitelist_ips.length === 0) && (
                            <div className="p-3 border border-dashed rounded-md text-sm text-yellow-600 bg-yellow-500/5">
                                ⚠️ No IPs whitelisted. Your API is vulnerable. Please add your server IP.
                            </div>
                        )}
                    </div>
                </div>

            </CardContent>
        </Card>
    );
}
