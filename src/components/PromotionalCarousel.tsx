import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, ChevronRight, Play, Pause, Ticket, Sparkles, 
  MapPin, Star, Flame, Percent, ArrowRight, Check, AlertCircle 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Banner } from '../types';
import { useBannerActions } from './BannerSlider';
import { LazyImage } from './LazyImage';

interface PromotionalCarouselProps {
  setSelectedRestaurant?: (restaurant: any) => void;
  setLocalSearch?: (search: string) => void;
  setSelectedCategory?: (category: string | null) => void;
  setCurrentPage?: (page: string) => void;
  setHighRated?: (highRated: boolean) => void;
  setVoiceToast?: (toast: string | null) => void;
}

export default function PromotionalCarousel({
  setSelectedRestaurant,
  setLocalSearch,
  setSelectedCategory,
  setCurrentPage,
  setHighRated,
  setVoiceToast
}: PromotionalCarouselProps) {
  const { banners, applyCouponCode, restaurants } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'restaurants' | 'coupons'>('all');
  const touchStartX = useRef<number | null>(null);
  const autoPlayInterval = 6500;

  // Handle banner actions dynamically using the shared hook
  const { handleBannerClick } = useBannerActions({
    setSelectedRestaurant,
    setLocalSearch,
    setSelectedCategory,
    setCurrentPage,
    setHighRated,
    setVoiceToast
  });

  // Filter banners based on tab and schedule validity
  const filteredBanners = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const live = (banners || []).filter(b => {
      if (!b.enabled) return false;
      if (b.startDate && b.startDate > todayStr) return false;
      if (b.endDate && b.endDate < todayStr) return false;
      return true;
    });

    if (activeTab === 'restaurants') {
      return live.filter(b => b.actionType === 'restaurant');
    }
    if (activeTab === 'coupons') {
      return live.filter(b => b.actionType === 'coupon' || b.actionType === 'offer');
    }
    return live;
  }, [banners, activeTab]);

  // Reset current index if tab changes and filtered index is out of bounds
  useEffect(() => {
    setCurrentIndex(0);
  }, [activeTab]);

  // Auto-play cycling effect
  useEffect(() => {
    if (isPaused || filteredBanners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % filteredBanners.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isPaused, filteredBanners.length]);

  if (filteredBanners.length === 0) {
    return (
      <div className="w-full bg-slate-50 dark:bg-zinc-950/40 border border-dashed border-slate-200 dark:border-zinc-800 py-10 px-4 rounded-3xl text-center">
        <Percent className="w-8 h-8 text-zinc-400 mx-auto mb-2 opacity-60" />
        <p className="text-xs text-zinc-500 font-extrabold font-mono uppercase tracking-wider">No active promos in this campaign category</p>
      </div>
    );
  }

  const handlePrev = () => {
    setCurrentIndex(prev => (prev - 1 + filteredBanners.length) % filteredBanners.length);
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % filteredBanners.length);
  };

  // Swiping support for touch devices
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    // Minimum swipe distance
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartX.current = null;
  };

  // Apply Coupon Direct action with feedback toast
  const handleQuickApplyCoupon = (e: React.MouseEvent, code: string) => {
    e.stopPropagation();
    if (applyCouponCode) {
      const res = applyCouponCode(code);
      if (setVoiceToast) {
        setVoiceToast(
          res.success 
            ? `🎉 SUCCESS: coupon "${code}" applied! Save ₹${res.message.match(/\d+/)?.[0] || 'discount'} on your cart.`
            : `⚠️ COUPON ALERT: ${res.message}`
        );
        setTimeout(() => setVoiceToast(null), 4000);
      }
    }
  };

  const activeBanner = filteredBanners[currentIndex];

  // Helper to match corresponding restaurant object if available
  const getAssociatedRestaurant = (banner: Banner) => {
    if (banner.actionType !== 'restaurant' || !banner.actionValue) return null;
    const query = banner.actionValue.toLowerCase();
    return restaurants.find(r => r.id === banner.actionValue || r.name.toLowerCase().includes(query));
  };

  return (
    <div 
      id="promotional-carousel-section"
      className="space-y-4"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Category Tabs & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div>
          <h3 className="text-lg font-black text-zinc-950 dark:text-zinc-50 tracking-tight flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500 fill-orange-500 animate-pulse" />
            Spotlight Campaigns & Discounts
          </h3>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
            Swipeable seasonal vouchers and verified partner kitchen offers
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
          {[
            { id: 'all', label: 'All Campaigns', icon: Sparkles },
            { id: 'restaurants', label: 'Kitchen Spotlight', icon: MapPin },
            { id: 'coupons', label: 'Vouchers & Codes', icon: Ticket }
          ].map(tab => {
            const TabIcon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[10.5px] font-black uppercase tracking-wider transition-all whitespace-nowrap active:scale-95 cursor-pointer ${
                  isSelected
                    ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/20'
                    : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-slate-100 dark:border-zinc-800 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/60'
                }`}
              >
                <TabIcon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Viewport Container */}
      <div className="relative w-full">
        <div 
          className="relative w-full h-[180px] sm:h-[196px] overflow-hidden rounded-3xl shadow-lg border border-slate-100 dark:border-zinc-800 select-none bg-zinc-950"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Slide Deck */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeTab}-${currentIndex}-${activeBanner.id}`}
              initial={{ opacity: 0, x: 50, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -50, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => handleBannerClick(activeBanner)}
              className={`absolute inset-0 w-full h-full p-5 sm:p-6 text-white flex flex-col justify-between cursor-pointer ${
                activeBanner.color || 'bg-gradient-to-r from-zinc-800 to-zinc-900'
              }`}
            >
              {/* Background Photo Overlay */}
              {activeBanner.image && (
                <>
                  <LazyImage
                    src={activeBanner.image}
                    alt={activeBanner.title}
                    parentClassName="absolute inset-0 w-full h-full"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 scale-100 hover:scale-103 opacity-25 pointer-events-none"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/35 pointer-events-none" />
                </>
              )}

              {/* CARD HEADER ROW */}
              <div className="relative z-10 flex justify-between items-start gap-4">
                <span className="text-[9.5px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1.5 bg-black/40 backdrop-blur-md border border-white/10 shadow-xs">
                  {activeBanner.actionType === 'restaurant' ? (
                    <>
                      <MapPin className="w-3 h-3 text-rose-400 fill-rose-400 animate-pulse" />
                      <span className="text-rose-100">Restaurant Special</span>
                    </>
                  ) : activeBanner.actionType === 'coupon' || activeBanner.actionType === 'offer' ? (
                    <>
                      <Ticket className="w-3 h-3 text-emerald-400 animate-bounce" />
                      <span className="text-emerald-100">Seasonal Voucher</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span className="text-amber-100">Regional Campaign</span>
                    </>
                  )}
                </span>

                {/* Promo Badge / Discount Indicator */}
                {activeBanner.discount ? (
                  <span className="text-[10px] bg-red-650 text-white font-black px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-sm animate-pulse flex items-center gap-1">
                    <Percent className="w-3 h-3" />
                    {activeBanner.discount}
                  </span>
                ) : getAssociatedRestaurant(activeBanner)?.rating ? (
                  <span className="text-[10px] bg-amber-500/90 backdrop-blur text-white font-extrabold px-2.5 py-0.5 rounded-lg flex items-center gap-1 shadow-xs font-mono">
                    <Star className="w-3 h-3 fill-current text-white" />
                    {getAssociatedRestaurant(activeBanner)?.rating?.toFixed(1)}
                  </span>
                ) : (
                  <span className="text-[9px] bg-orange-500 text-white font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider shadow-xs">
                    ACTIVE
                  </span>
                )}
              </div>

              {/* CARD DESCRIPTION BLOCK */}
              <div className="relative z-10 flex-1 flex flex-col justify-center mt-3 max-w-lg">
                <h3 className="text-base sm:text-xl font-black tracking-tight leading-snug drop-shadow-sm line-clamp-1">
                  {activeBanner.title}
                </h3>
                <p className="text-xs text-white/90 font-medium leading-relaxed mt-1 line-clamp-2 drop-shadow-sm max-w-md">
                  {activeBanner.description}
                </p>

                {/* Kitchen sub-indicator if it is a restaurant banner */}
                {activeBanner.actionType === 'restaurant' && (() => {
                  const r = getAssociatedRestaurant(activeBanner);
                  if (r) {
                    return (
                      <div className="flex items-center gap-2 mt-2 text-[10px] font-bold text-orange-200">
                        <span className="bg-orange-500/30 px-2 py-0.5 rounded border border-orange-500/20">
                          {r.cuisines?.slice(0, 2).join(' • ')}
                        </span>
                        <span>•</span>
                        <span>{r.deliveryTime || '25'} mins delivery</span>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>

              {/* CARD ACTION BAR */}
              <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-3 mt-2">
                <div className="flex items-center gap-2">
                  {activeBanner.couponCode ? (
                    <div className="flex items-center bg-white/10 rounded-lg overflow-hidden border border-white/20 p-0.5">
                      <span className="text-[10px] font-mono font-black px-2 py-1 text-orange-100 tracking-wider">
                        CODE: {activeBanner.couponCode}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleQuickApplyCoupon(e, activeBanner.couponCode!)}
                        className="bg-white text-zinc-950 hover:bg-orange-50 font-black text-[9px] uppercase px-2.5 py-1 rounded-md transition duration-150 active:scale-95"
                      >
                        Apply Code
                      </button>
                    </div>
                  ) : (
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange-200 flex items-center gap-1 group-hover:text-white transition">
                      {activeBanner.actionType === 'restaurant' ? 'Order Cuisine Menu' : 'Unlock Now'}
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 duration-200" />
                    </span>
                  )}

                  {activeBanner.expiryDate && (
                    <span className="text-[9px] text-white/60 italic font-mono hidden md:inline ml-2">
                      Ends: {activeBanner.expiryDate}
                    </span>
                  )}
                </div>

                {/* Primary CTA Button */}
                <button
                  type="button"
                  className="bg-white text-zinc-950 font-black text-[9.5px] uppercase px-4 py-2 rounded-xl shadow-md transition-all active:scale-95 duration-200 flex items-center gap-1 cursor-pointer hover:bg-orange-50"
                >
                  <span>{activeBanner.actionType === 'restaurant' ? 'View Menu' : 'Claim Offer'}</span>
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Floating Prev/Next controls */}
        {filteredBanners.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handlePrev(); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2.5 rounded-full border border-white/10 backdrop-blur-md transition hidden md:block cursor-pointer active:scale-90 z-20"
              aria-label="Previous Campaign"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2.5 rounded-full border border-white/10 backdrop-blur-md transition hidden md:block cursor-pointer active:scale-90 z-20"
              aria-label="Next Campaign"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Control bar: Auto cycle toggle and page dots */}
      {filteredBanners.length > 1 && (
        <div className="flex justify-between items-center px-1">
          {/* Play / Pause auto cycle */}
          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            className="p-1 px-2 text-zinc-400 hover:text-zinc-650 dark:hover:text-white transition flex items-center gap-1.5 cursor-pointer rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80"
          >
            {isPaused ? (
              <>
                <Play className="w-2.5 h-2.5 text-emerald-500 fill-emerald-500" />
                <span className="text-[8.5px] font-black font-mono tracking-wider uppercase">Auto-Paused</span>
              </>
            ) : (
              <>
                <Pause className="w-2.5 h-2.5 text-orange-500 fill-orange-500 animate-pulse" />
                <span className="text-[8.5px] font-black font-mono tracking-wider uppercase text-zinc-500">Auto-Cycling</span>
              </>
            )}
          </button>

          {/* Dynamic dot indicator bar */}
          <div className="flex gap-1.5 ml-auto">
            {filteredBanners.map((_, dotIdx) => (
              <button
                key={dotIdx}
                type="button"
                onClick={() => setCurrentIndex(dotIdx)}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  dotIdx === currentIndex 
                    ? 'w-5 bg-orange-500 shadow-xs' 
                    : 'w-1.5 bg-slate-200 dark:bg-zinc-800 hover:bg-orange-300'
                }`}
                aria-label={`Go to slide ${dotIdx + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
