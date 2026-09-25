/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Smartphone, Download, X, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import AndroidInstallModal from './AndroidInstallModal';

export default function PWAInstallBanner() {
  const { isInstallable, isInstalled, isAndroid, install } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(() => {
    try {
      return sessionStorage.getItem('nuvvo_pwa_banner_dismissed') === 'true';
    } catch {
      return false;
    }
  });
  const [showModal, setShowModal] = useState(false);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDismissed(true);
    try {
      sessionStorage.setItem('nuvvo_pwa_banner_dismissed', 'true');
    } catch {}
  };

  if (isInstalled || isDismissed) {
    return (
      <AndroidInstallModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    );
  }

  return (
    <>
      <div 
        onClick={() => setShowModal(true)}
        className="w-full bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 text-white px-3.5 py-2.5 rounded-2xl shadow-md flex items-center justify-between gap-3 cursor-pointer group active:scale-[0.99] transition-all"
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="p-1.5 bg-white/20 rounded-xl shrink-0 group-hover:scale-105 transition-transform">
            <Smartphone className="w-4 h-4 text-white" />
          </div>
          <div className="truncate text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-tight">Get Nuvvo for Android</span>
              <span className="bg-white/20 text-[9px] font-extrabold px-1.5 py-0.2 rounded font-mono">APK / WebAPK</span>
            </div>
            <p className="text-[10.5px] text-orange-100 font-medium truncate">
              Fast install with offline menu and instant order notifications
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (isInstallable) {
                install();
              } else {
                setShowModal(true);
              }
            }}
            className="px-2.5 py-1 bg-white text-orange-600 rounded-xl text-xs font-black shadow-xs hover:bg-orange-50 active:scale-95 transition cursor-pointer"
          >
            Install
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss Android banner"
            className="p-1 hover:bg-white/20 rounded-lg text-white/80 hover:text-white transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <AndroidInstallModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
}
