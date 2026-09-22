/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck } from 'lucide-react';

interface SuperAdminGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showBadge?: boolean;
}

export default function SuperAdminGuard({ children, fallback = null, showBadge = false }: SuperAdminGuardProps) {
  const { user, isSuperAdmin } = useApp();

  if (isSuperAdmin) {
    return <>{children}</>;
  }

  if (fallback !== null) {
    return <>{fallback}</>;
  }

  if (showBadge) {
    return (
      <div className="p-4 bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200/60 dark:border-amber-900/40 rounded-2xl flex items-center gap-3 text-zinc-650 dark:text-zinc-300">
        <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0 animate-pulse" />
        <div className="text-left font-sans">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">Super Admin Clearance Locked</p>
          <p className="text-[9px] text-zinc-450 dark:text-zinc-400 mt-0.5 leading-snug">Modifications on global application registries are locked to read-only. Elevate to cellular terminal 9063692135 to run write procedures.</p>
        </div>
      </div>
    );
  }

  return null;
}
