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
    sm: 'space-y-1',
    md: 'space-y-3',
    lg: 'space-y-5',
    xl: 'space-y-6'
  };

  return (
    <div className={`flex flex-col items-center justify-center text-center ${containerSizes[size]} ${className}`}>
      {/* SCOOTER RIDER ILLUSTRATION */}
      <motion.div
        animate={
          animate
            ? {
                y: [0, -4, 0],
                rotate: [0, 1, 0, -1, 0]
              }
            : {}
        }
        transition={{
          repeat: Infinity,
          duration: 3,
          ease: "easeInOut"
        }}
        className={`relative ${iconSizes[size]} select-none`}
      >
        <svg
          viewBox="0 0 240 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-md"
        >
          {/* Circular Background Ring */}
          <circle
            cx="120"
            cy="110"
            r="62"
            stroke="#073B4C"
            strokeWidth="3.5"
            strokeDasharray="8 6"
            className="opacity-25"
          />

          {/* Clouds / Speed lines in background */}
          <path d="M40 70H70" stroke="#073B4C" strokeWidth="2" strokeLinecap="round" className="opacity-15" />
          <path d="M180 85H210" stroke="#073B4C" strokeWidth="2.5" strokeLinecap="round" className="opacity-15" />
          <path d="M30 130H55" stroke="#073B4C" strokeWidth="2" strokeLinecap="round" className="opacity-15" />

          {/* SCOOTER & RIDER */}
          <g>
            {/* Delivery Box (Teal Box on back) */}
            <rect
              x="50"
              y="85"
              width="48"
              height="42"
              rx="4"
              fill="#0F4C5C"
              stroke="#073B4C"
              strokeWidth="3"
            />
            {/* Delivery Box Lid details */}
            <path d="M48 93H100" stroke="#073B4C" strokeWidth="2" />
            <rect x="68" y="103" width="12" height="8" rx="2" fill="#E36414" />

            {/* Back Wheel */}
            <circle cx="85" cy="160" r="18" fill="#1C1C1E" stroke="#073B4C" strokeWidth="3" />
            <circle cx="85" cy="160" r="9" fill="#E2E8F0" stroke="#073B4C" strokeWidth="2.5" />

            {/* Front Wheel */}
            <circle cx="175" cy="160" r="18" fill="#1C1C1E" stroke="#073B4C" strokeWidth="3" />
            <circle cx="175" cy="160" r="9" fill="#E2E8F0" stroke="#073B4C" strokeWidth="2.5" />

            {/* Scooter Main Frame */}
            <path
              d="M85 160H115L145 140H175"
              stroke="#073B4C"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Scooter Body Shield (Teal) */}
            <path
              d="M102 152L144 140L165 92H150L135 125L95 132Z"
              fill="#0F4C5C"
              stroke="#073B4C"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />

            {/* Mudguards */}
            <path d="M72 150C75 140 92 142 95 148" stroke="#073B4C" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M160 148C163 140 185 142 188 150" stroke="#073B4C" strokeWidth="3.5" strokeLinecap="round" />

            {/* Steering Column & Handlebars */}
            <line x1="162" y1="92" x2="152" y2="146" stroke="#073B4C" strokeWidth="5" strokeLinecap="round" />
            <path d="M145 88H165" stroke="#073B4C" strokeWidth="4.5" strokeLinecap="round" />
            <circle cx="143" cy="88" r="4.5" fill="#1C1C1E" />
            <circle cx="167" cy="88" r="4.5" fill="#1C1C1E" />

            {/* Headlight */}
            <path d="M165 92L176 96L173 103L162 99Z" fill="#FFF" stroke="#073B4C" strokeWidth="2.5" />
            <polygon points="175,95 210,105 210,125 173,103" fill="#FBBF24" className="opacity-20" />

            {/* RIDER CHARACTER */}
            {/* Rider Legs */}
            <path
              d="M110 132L125 105H142"
              stroke="#073B4C"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M110 132L125 105H142"
              stroke="#E36414"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Rider Torso / Shirt */}
            <path
              d="M102 108C102 90 115 84 130 84C140 84 148 92 144 108H102Z"
              fill="#E36414"
              stroke="#073B4C"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />

            {/* Rider Neck */}
            <rect x="119" y="76" width="10" height="10" fill="#FDBA74" stroke="#073B4C" strokeWidth="3" />

            {/* Rider Face */}
            <circle cx="124" cy="64" r="14" fill="#FDBA74" stroke="#073B4C" strokeWidth="3" />
            {/* Friendly Smile & Eyes */}
            <path d="M124 67C124 71 131 71 131 67" stroke="#073B4C" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="128" cy="60" r="1.8" fill="#073B4C" />
            <circle cx="135" cy="59" r="1.8" fill="#073B4C" />

            {/* Orange Helmet */}
            <path
              d="M108 61C108 43 138 43 140 59C141 62 136 67 132 67C125 67 114 67 108 61Z"
              fill="#E36414"
              stroke="#073B4C"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            {/* Helmet Visor / Accent */}
            <path d="M114 50C114 44 135 44 138 52" stroke="#FFF" strokeWidth="3" strokeLinecap="round" className="opacity-60" />
            <path d="M111 62L120 68" stroke="#073B4C" strokeWidth="2.5" strokeLinecap="round" />

            {/* Rider Arms */}
            <path
              d="M125 90L144 91L156 90"
              stroke="#073B4C"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M125 90L144 91L156 90"
              stroke="#FDBA74"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>

          {/* Road shadow under wheels */}
          <ellipse cx="130" cy="180" rx="70" ry="6" fill="#000" className="opacity-15" />
        </svg>
      </motion.div>

      {/* BRAND TEXT & SLOGAN */}
      {showText && (
        <div className="flex flex-col items-center">
          {/* NUVVO Logo text */}
          <motion.h2
            initial={animate ? { scale: 0.95, opacity: 0 } : {}}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className={`font-black tracking-tight text-[#073B4C] dark:text-[#E2E8F0] font-sans uppercase ${
              size === 'sm' ? 'text-lg' : size === 'md' ? 'text-3xl' : size === 'lg' ? 'text-5xl' : 'text-6xl'
            }`}
          >
            Nuvvo
          </motion.h2>

          {/* Slogan Text: "RUCHI NEE ISHTAM DELIVERY MEM ISTHAM" */}
          <motion.div
            initial={animate ? { opacity: 0, y: 5 } : {}}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex flex-col items-center w-full"
          >
            <p
              className={`text-[#E36414] dark:text-orange-400 font-extrabold uppercase tracking-widest ${
                size === 'sm' ? 'text-[7px]' : size === 'md' ? 'text-[10px]' : size === 'lg' ? 'text-xs' : 'text-sm'
              }`}
            >
              Ruchi Nee Ishtam, Delivery Mem Istham
            </p>

            {/* Dynamic line underneath slogan */}
            <div
              className={`h-[3px] bg-gradient-to-r from-[#0F4C5C] via-[#E36414] to-[#0F4C5C] rounded-full mt-1.5 opacity-80 ${
                size === 'sm' ? 'w-24' : size === 'md' ? 'w-44' : size === 'lg' ? 'w-64' : 'w-80'
              }`}
            />
          </motion.div>
        </div>
      )}
    </div>
  );
}
