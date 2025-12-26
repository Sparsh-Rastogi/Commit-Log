import { UserProfile } from '@/types';
import { User, LogOut, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ProfileSectionProps {
  user: UserProfile;
  onLogout?: () => void;
}

export function ProfileSection({ user, onLogout }: ProfileSectionProps) {
  const navigate = useNavigate();
  const nextLevelXp = 100 + (user.level - 1) * 50;
  const xpPercentage = Math.min((user.xp / nextLevelXp) * 100, 100);

  return (
    <div className="p-4 border-b border-sidebar-border">
      <div className="flex items-center gap-3">
        {/* Avatar with dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative group focus:outline-none focus:ring-2 focus:ring-commit/30 rounded-full">
              <div className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center ring-2 ring-commit/30 transition-all group-hover:ring-commit/60">
                {user.avatarUrl ? (
                  <img 
                    src={user.avatarUrl} 
                    alt={user.username} 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-5 h-5 text-muted-foreground group-hover:text-commit transition-colors" />
                )}
              </div>
              {/* Online indicator */}
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-commit rounded-full border-2 border-sidebar" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem onClick={() => navigate('/auth')} className="gap-2">
              <Settings className="w-4 h-4" />
              Account Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={onLogout} 
              className="gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
            >
              <LogOut className="w-4 h-4" />
              Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sidebar-foreground truncate">
              {user.username}
            </span>
            <span className="px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-xp/20 text-xp rounded">
              LVL {user.level}
            </span>
          </div>
          
          {/* XP Bar */}
          <div className="mt-1.5">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-surface-3 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-xp/80 to-xp rounded-full transition-all duration-500"
                  style={{ width: `${xpPercentage}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-muted-foreground whitespace-nowrap">
                {user.xp}/{nextLevelXp}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
