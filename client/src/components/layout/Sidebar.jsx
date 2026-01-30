'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  ArrowRightLeft,
  Send,
  Users,
  Landmark,
  Store,
  Settings,
  Menu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transactions', icon: ArrowRightLeft },
  { href: '/payouts', label: 'Payouts', icon: Send },
  { href: '/beneficiaries', label: 'Beneficiaries', icon: Users },
  { href: '/bank-account', label: 'Bank Account', icon: Landmark },
  { href: '/merchant', label: 'Merchant Center', icon: Store },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 border-r border-white/5 bg-sidebar">
          <div className="flex h-20 items-center justify-center border-b border-white/5 bg-transparent">
             {/* Logo Placeholder */}
             <div className="flex items-center gap-2">
                 <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg shadow-primary/40">
                    S
                 </div>
                 <span className="text-xl font-bold text-white tracking-wide">SilkPay</span>
             </div>
          </div>
          <NavContent pathname={pathname} />
      </aside>
    </>
  );
}

export function NavContent({ pathname }) {
  return (
    <nav className="flex-1 overflow-y-auto py-4">
      <ul className="space-y-3 px-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <li key={item.href} className='mb-1.5'>
              <Link
                href={item.href}
                className={cn(
                  "relative flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-all duration-300 group overflow-hidden",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className={cn("h-5 w-5 transition-transform duration-300", isActive ? "scale-100" : "group-hover:scale-100")} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
