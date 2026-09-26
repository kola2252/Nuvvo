/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';

interface NuvvoLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  animate?: boolean;
}

export default function NuvvoLogo({
  className = '',
  size = 'md',
  showText = true,
  animate = true
}: NuvvoLogoProps) {
  // Dimensions based on size
  const iconSizes = {
    sm: 'w-16 h-16',
    md: 'w-32 h-32',
    lg: 'w-48 h-48',
    xl: 'w-64 h-64'
  };

  const containerSizes = {
    sm: 'space-y-1.5',
    md: 'space-y-3',
    lg: 'space-y-4',
    xl: 'space-y-5'
  };

  return (
    <div className={`flex flex-col items-center justify-center text-center ${containerSizes[size]} ${className}`}>
      {/* Official Nuvvo Logo Badge */}
      <motion.div
        animate={
          animate
            ? {
                y: [0, -4, 0],
                scale: [1, 1.015, 1],
              }
            : {}
        }
        transition={{
          repeat: Infinity,
          duration: 3.5,
          ease: "easeInOut"
        }}
        className={`relative ${iconSizes[size]} select-none rounded-full p-1 bg-gradient-to-tr from-amber-500/25 via-yellow-500/10 to-transparent shadow-xl`}
      >
        <img
          src="/nuvvo-logo.png"
          alt="Nuvvo Logo"
          className="w-full h-full object-contain rounded-full drop-shadow-xl"
          referrerPolicy="no-referrer"
        />
      </motion.div>

      {/* Brand Text & Slogan */}
      {showText && (
        <div className="flex flex-col items-center">
          <motion.h2
            initial={animate ? { scale: 0.95, opacity: 0 } : {}}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className={`font-black tracking-wider text-zinc-900 dark:text-zinc-100 font-sans uppercase ${
              size === 'sm' ? 'text-lg' : size === 'md' ? 'text-2xl' : size === 'lg' ? 'text-4xl' : 'text-5xl'
            }`}
          >
            Nuvvo
          </motion.h2>

          <motion.div
            initial={animate ? { opacity: 0, y: 5 } : {}}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex flex-col items-center w-full"
          >
            <p
              className={`text-amber-600 dark:text-amber-400 font-extrabold uppercase tracking-widest ${
                size === 'sm' ? 'text-[7px]' : size === 'md' ? 'text-[10px]' : size === 'lg' ? 'text-xs' : 'text-sm'
              }`}
            >
              Ruchi Nee Istam • Delivery Mem Istam
            </p>

            <div
              className={`h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent rounded-full mt-1.5 opacity-80 ${
                size === 'sm' ? 'w-24' : size === 'md' ? 'w-44' : size === 'lg' ? 'w-64' : 'w-80'
              }`}
            />
          </motion.div>
        </div>
      )}
    </div>
  );
}
