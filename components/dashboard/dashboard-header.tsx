// components/dashboard/dashboard-header.tsx
'use client';

import Link from 'next/link';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { LogOut, User, ExternalLink } from 'lucide-react';
import { signOut } from '@/(auth)/actions';

interface DashboardHeaderProps {
  userEmail: string;
  profileSlug?: string | null;
}

export function DashboardHeader({ userEmail, profileSlug }: DashboardHeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border/60 px-6">
      <div>
        {profileSlug && (
          <Link
            href={`/${profileSlug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            View my live profile
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      <DropdownMenu.Root>
        <DropdownMenu.Trigger className="flex items-center gap-2 rounded-full border border-border/60 px-3 py-1.5 text-sm">
          <User className="h-4 w-4" />
          <span className="max-w-[160px] truncate">{userEmail}</span>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            className="z-50 min-w-[180px] rounded-md border border-border bg-popover p-1 shadow-md"
          >
            <DropdownMenu.Item asChild>
              <Link
                href="/dashboard/settings"
                className="flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm hover:bg-secondary"
              >
                Account settings
              </Link>
            </DropdownMenu.Item>
            <DropdownMenu.Separator className="my-1 h-px bg-border" />
            <DropdownMenu.Item asChild>
              <form action={signOut}>
                <button
                  type="submit"
                  className="flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </form>
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </header>
  );
}
