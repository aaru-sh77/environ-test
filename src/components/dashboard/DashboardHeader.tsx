'use client';

import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { signOut } from '@/lib/firebase/auth';
import { useRouter } from 'next/navigation';
import { LogOut, Map } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function DashboardHeader() {
  const router = useRouter();
  const { user } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth');
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-2">
          <Map className="h-6 w-6 text-green-600" />
          <h1 className="text-xl font-bold">Environ</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">
            {user?.email}
          </span>
          <ThemeToggle />
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  );
}