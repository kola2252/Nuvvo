/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Home as HomeIcon, ShoppingBag, Settings, Bike, Building, Compass } from 'lucide-react';
import { motion } from 'motion/react';

export default function BottomNav() {
  const { currentPage, setCurrentPage, cart, currentTheme } = useApp();

  const cartCount = cart.reduce((temp, item) => temp + item.quantity, 0);

  const [isPopping, setIsPopping] = useState(false);
  const prevCountRef = useRef(cartCount);

  useEffect(() => {
    if (cartCount > prevCountRef.current) {
      setIsPopping(true);
      const timer = setTimeout(() => {
        setIsPopping(false);
      }, 500);
      return () => clearTimeout(timer);
    }
    prevCountRef.current = cartCount;
  }, [cartCount]);

  const tabs = [
    { id: 'home', label: 'Home', icon: HomeIcon },
    { id: 'cart', label: 'Cart', icon: ShoppingBag, badge: cartCount },
    { id: 'partner', label: 'Rider', icon: Bike },
    { id: 'account', label: 'Settings', icon: Settings },
    { id: 'franchise', label: 'Franchise', icon: Building },
    { id: 'delivery-options', label: 'Delivery Options', icon: Compass },
  ];

  return (
    <nav role="navigation" aria-label="Bottom navigation menu" className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 py-2.5 px-4 shadow-[0_-10px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex justify-around items-center z-[150] transition-all duration-300">
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = currentPage === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => setCurrentPage(tab.id)}
            aria-label={tab.id === 'cart' && tab.badge && tab.badge > 0 ? `${tab.label}, ${tab.badge} items in cart` : tab.label}
            aria-current={isActive ? 'page' : undefined}
            className="flex flex-col items-center justify-center relative p-1.5 focus:outline-none transition-all cursor-pointer group"
          >
            {/* Animated background on active */}
            <div className={`absolute w-10 h-10 -z-10 rounded-xl transition-all scale-75 opacity-0 ${
              isActive ? `${currentTheme.lightBgClass} scale-100 opacity-100` : 'group-hover:bg-slate-100 dark:group-hover:bg-zinc-800'
            }`} />

            <motion.div 
              className="relative"
              animate={tab.id === 'cart' && isPopping ? {
                scale: [1, 1.35, 0.95, 1.1, 1],
                rotate: [0, -8, 8, -4, 0]
              } : {}}
              transition={{ duration: 0.45, ease: "easeOut" }}
            >
              <Icon className={`w-5 h-5 transition-colors ${
                isActive ? `${currentTheme.textClass} scale-110` : 'text-zinc-450 dark:text-zinc-400 group-hover:text-zinc-650 dark:group-hover:text-zinc-200'
              }`} />
              
              {/* Badge Counter for Cart */}
              {tab.badge && tab.badge > 0 ? (
                <span className={`absolute -top-1.5 -right-2.5 ${currentTheme.bgClass} border border-white dark:border-zinc-900 text-white font-bold text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center animate-bounce`}>
                  {tab.badge}
                </span>
              ) : null}
            </motion.div>

            <span className={`text-[9px] font-bold mt-1 tracking-tight transition-colors ${
              isActive ? currentTheme.textClass : 'text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200'
            }`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
