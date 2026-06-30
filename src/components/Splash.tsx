/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'motion/react';
import NuvvoLogo from './NuvvoLogo';

export default function Splash() {
  const { setCurrentPage, user } = useApp();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(old => {
        if (old >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            if (user && user.isProfileComplete) {
              setCurrentPage('home');
            } else {
              setCurrentPage('auth');
            }
          }, 300);
          return 100;
        }
        return old + 4;
      });
    }, 80);

    return () => clearInterval(timer);
  }, [user, setCurrentPage]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-zinc-950 transition-colors duration-300">
      <div className="text-center flex flex-col items-center justify-center p-8 max-w-sm">
        {/* Real Premium Brand Icon & Slogan */}
        <NuvvoLogo size="lg" showText={true} animate={true} className="mb-2" />

        {/* Loading details */}
        <div className="w-full mt-10 bg-zinc-200 dark:bg-zinc-800 h-1 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500 font-mono">
          Booting ecosystem... {progress}%
        </p>
      </div>

      {/* Decorative background gradients */}
      <div className="absolute top-0 left-0 w-48 h-48 bg-orange-200/20 dark:bg-orange-900/10 blur-3xl rounded-full" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-amber-200/20 dark:bg-amber-900/15 blur-3xl rounded-full" />
    </div>
  );
}
