/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useApp } from './context/AppContext';
import { Bell, X, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Splash from './components/Splash';
import Auth from './components/Auth';
import Home from './components/Home';
import BottomNav from './components/BottomNav';
import FoodDetails from './components/FoodDetails';
import FavoritesScreen from './components/FavoritesScreen';
import CartScreen from './components/CartScreen';
import AccountScreen from './components/AccountScreen';
import DeliveryOptionsScreen from './components/DeliveryOptionsScreen';
import DesktopSupportWidgets from './components/DesktopSupportWidgets';

// Code-split heavy secondary screens to speed up initial bundle load
const TrackingScreen = lazy(() => import('./components/TrackingScreen'));
const PartnerScreen = lazy(() => import('./components/PartnerScreen'));
const FranchiseScreen = lazy(() => import('./components/FranchiseScreen'));
const AdminPanel = lazy(() => import('./components/AdminPanel'));
const SuperAdminPanel = lazy(() => import('./components/SuperAdminPanel'));

export default function App() {
  const { user, currentPage, selectedFoodItem, notifications, markNotificationAsRead, setCurrentPage, isOffline, cartSuccessAnimation } = useApp();
  const [activeToast, setActiveToast] = useState<any>(null);
  
  // Fast splash screen: skip if already seen this session, else quick 650ms intro
  const [showSplash, setShowSplash] = useState(() => {
    try {
      return !sessionStorage.getItem('nuvvo_splash_seen');
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (!showSplash) return;
    try {
      sessionStorage.setItem('nuvvo_splash_seen', 'true');
    } catch {}
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 650);
    return () => clearTimeout(timer);
  }, [showSplash]);

  useEffect(() => {
    if (notifications && notifications.length > 0) {
      const latest = notifications[0];
      // Only serve toast for items created in the last 4 seconds
      const isRecent = (Date.now() - new Date(latest.timestamp).getTime()) < 4000;
      if (!latest.read && isRecent && latest.id !== 'permission_check') {
        setActiveToast(latest);
        const timer = setTimeout(() => {
          setActiveToast(null);
        }, 4000);
        return () => clearTimeout(timer);
      }
    }
  }, [notifications]);

  // Show Splash welcome animation screen at startup
  if (showSplash) {
    return <Splash />;
  }

  // 3. Main views
  const renderCurrentPage = () => {
    if (!user) {
      return <Auth />;
    }

    switch (currentPage) {
      case 'auth':
        return <Auth />;
      case 'home':
        return <Home />;
      case 'orders':
      case 'tracking':
        return <TrackingScreen />;
      case 'favorites':
        return <FavoritesScreen />;
      case 'cart':
        return <CartScreen />;
      case 'account':
        return <AccountScreen />;
      case 'partner':
        return <PartnerScreen />;
      case 'franchise':
        return <FranchiseScreen />;
      case 'admin':
        return <AdminPanel />;
      case 'super-admin':
        return <SuperAdminPanel />;
      case 'delivery-options':
        return <DeliveryOptionsScreen />;
      default:
        return <Home />;
    }
  };

  // Determine if we should show standard persistent bottom nav bar
  // The bottom nav makes sense on Home, Orders/Tracking, Favorites, Cart, Account pages
  const showBottomNav = true;

  return (
    <div className="relative font-sans min-h-screen bg-slate-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      
      {/* Offline network connection status persistent banner */}
      {isOffline && (
        <motion.div
          id="offline-indicator-banner"
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-110 bg-amber-500 text-amber-950 dark:bg-amber-600 dark:text-amber-50 shadow-sm border-b border-amber-600/20 py-2.5 px-4 font-black text-[10.5px] uppercase tracking-wider flex items-center justify-center gap-2"
        >
          <WifiOff className="w-4 h-4 animate-pulse shrink-0" />
          <span>No internet connection. Operating in cached offline mode.</span>
        </motion.div>
      )}

      {/* Real-time Toast push alert banners */}
      {activeToast && (
        <motion.div
          initial={{ opacity: 0, y: -80, scale: 0.95, x: '-50%' }}
          animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
          exit={{ opacity: 0, y: -40, scale: 0.95, x: '-50%' }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          onClick={() => {
            markNotificationAsRead(activeToast.id);
            setCurrentPage('orders');
            setActiveToast(null);
          }}
          className="fixed top-4 left-1/2 z-100 w-[92%] max-w-sm bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-orange-500/25 dark:border-orange-500/20 p-4 rounded-3xl shadow-xl shadow-zinc-950/20 flex gap-3 items-start cursor-pointer active:scale-98 transition-all"
        >
          <div className="p-2 bg-orange-500/10 text-orange-500 rounded-2xl relative">
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            <Bell className="w-5 h-5" />
          </div>
          <div className="flex-1 text-left">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest font-mono">Real-time Order Alert</span>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveToast(null);
                }}
                className="p-1 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded bg-transparent text-zinc-400 hover:text-zinc-650 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 mt-1">
              {activeToast.title}
            </p>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
              {activeToast.body}
            </p>
          </div>
        </motion.div>
      )}

      {/* Dynamic Viewport */}
      <main className="w-full">
        {renderCurrentPage()}
      </main>

      {/* Global Product Customization overlay */}
      {selectedFoodItem && <FoodDetails />}

      {/* Persistent Swiggy Bottom Control Deck */}
      {showBottomNav && <BottomNav />}

      {/* Responsive WhatsApp & AI Chatbot desktop widgets */}
      <DesktopSupportWidgets />

      {/* Lightweight Add-To-Cart success notification - 300ms timing constraint */}
      <AnimatePresence>
        {cartSuccessAnimation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 25, x: '-50%' }}
            animate={{ opacity: 1, scale: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, scale: 0.85, y: -20, x: '-50%' }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 left-1/2 z-110 bg-emerald-500 text-white font-extrabold text-[11px] px-5 py-2.5 rounded-full shadow-lg flex items-center gap-2 select-none border border-emerald-400/20"
          >
            <span>✔</span> Added To Cart
          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
}
