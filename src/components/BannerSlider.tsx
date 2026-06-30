import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, ExternalLink, Ticket, Sparkles, MapPin } from 'lucide-react';
import { Banner } from '../types';
import { useApp } from '../context/AppContext';
import { LazyImage } from './LazyImage';

// 1. REUSABLE HOOK FOR ACTION HANDLING
export interface UseBannerActionsProps {
  setSelectedRestaurant?: (restaurant: any) => void;
  setLocalSearch?: (search: string) => void;
  setSelectedCategory?: (category: string | null) => void;
  setCurrentPage?: (page: string) => void;
  setHighRated?: (highRated: boolean) => void;
  setVoiceToast?: (toast: string | null) => void;
}

export function useBannerActions({
  setSelectedRestaurant,
  setLocalSearch,
  setSelectedCategory,
  setCurrentPage,
  setHighRated,
  setVoiceToast
}: UseBannerActionsProps = {}) {
  const { addAuditLog, applyCouponCode, restaurants } = useApp();

  const handleBannerClick = (banner: Banner) => {
    // Add audit log for banner click safely
    if (addAuditLog) {
      addAuditLog(
        'Banner Slider Interaction',
        `User clicked campaign banner "${banner.title}" (ID: ${banner.id}, Type: ${banner.actionType})`
      );
    }

    switch (banner.actionType) {
      case 'restaurant': {
        if (!banner.actionValue) break;
        const queryVal = banner.actionValue.toLowerCase();
        let foundRest = restaurants.find(r => r.id === banner.actionValue);
        if (!foundRest) {
          foundRest = restaurants.find(r => r.name.toLowerCase().includes(queryVal));
        }

        if (foundRest) {
          if (setSelectedRestaurant) {
            setSelectedRestaurant(foundRest);
            // Smooth scroll to restaurant spotlight section
            setTimeout(() => {
              window.scrollTo({ top: 300, behavior: 'smooth' });
            }, 150);
          }
        } else {
          if (setLocalSearch) {
            setLocalSearch(banner.actionValue);
          }
          if (setSelectedCategory) {
            setSelectedCategory(null);
          }
        }
        break;
      }

      case 'category': {
        if (banner.actionValue && setSelectedCategory) {
          setSelectedCategory(banner.actionValue);
          if (setLocalSearch) {
            setLocalSearch('');
          }
          setTimeout(() => {
            const el = document.getElementById('categories-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 150);
        }
        break;
      }

      case 'coupon':
      case 'offer': {
        if (banner.actionValue && applyCouponCode) {
          const res = applyCouponCode(banner.actionValue);
          if (setVoiceToast) {
            setVoiceToast(`${res.success ? '🎉 Promo Activated' : '⚠️ Promo Alert'} - ${res.message}`);
            setTimeout(() => setVoiceToast(null), 4000);
          }
        }
        break;
      }

      case 'franchise': {
        if (setCurrentPage) {
          setCurrentPage('franchise');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        break;
      }

      case 'external': {
        if (banner.actionValue) {
          window.open(banner.actionValue, '_blank', 'noopener,noreferrer');
        }
        break;
      }

      case 'custom': {
        if (banner.actionValue === 'free_delivery') {
          if (setLocalSearch) setLocalSearch('free delivery');
          if (setSelectedCategory) setSelectedCategory(null);
          if (setVoiceToast) {
            setVoiceToast('🚚 Displaying all Free Delivery eligible joints!');
            setTimeout(() => setVoiceToast(null), 3000);
          }
        } else if (banner.actionValue === 'top_rated') {
          if (setLocalSearch) setLocalSearch('');
          if (setHighRated) setHighRated(true);
          if (setVoiceToast) {
            setVoiceToast('🏆 Displaying Chirala\'s five-star gourmet partners.');
            setTimeout(() => setVoiceToast(null), 3000);
          }
        }
        break;
      }

      default:
        break;
    }
  };

  return { handleBannerClick };
}


// 2. REUSABLE BANNER SLIDER COMPONENT
interface BannerSliderProps {
  banners: Banner[];
  onBannerClick?: (banner: Banner) => void;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  className?: string;
  heightClass?: string;
  showControls?: boolean;
  showDots?: boolean;
  title?: string;
}

export function BannerSlider({
  banners,
  onBannerClick,
  autoPlay = true,
  autoPlayInterval = 6000,
  className = '',
  heightClass = 'h-40 sm:h-44',
  showControls = true,
  showDots = true,
  title
}: BannerSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  // Filter only active & currently scheduled banners
  const liveBanners = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return (banners || []).filter(b => {
      if (!b.enabled) return false;
      if (b.startDate && b.startDate > todayStr) return false;
      if (b.endDate && b.endDate < todayStr) return false;
      return true;
    });
  }, [banners]);

  // Handle auto-play cycle
  useEffect(() => {
    if (!autoPlay || isPaused || liveBanners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % liveBanners.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, isPaused, liveBanners.length, autoPlayInterval]);

  if (liveBanners.length === 0) {
    return null;
  }

  const navigatePrev = () => {
    setCurrentIndex(prev => (prev - 1 + liveBanners.length) % liveBanners.length);
  };

  const navigateNext = () => {
    setCurrentIndex(prev => (prev + 1) % liveBanners.length);
  };

  // Touch Swipe gestures implementation
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (diff > 50) {
      // Swiped Left - show next item
      navigateNext();
    } else if (diff < -50) {
      // Swiped Right - show prev item
      navigatePrev();
    }
    touchStartX.current = null;
  };

  const activeBanner = liveBanners[currentIndex];

  const getActionBadge = (b: Banner) => {
    switch (b.actionType) {
      case 'restaurant':
        return { label: 'Spotlight Partner', icon: MapPin, style: 'bg-rose-500/80 backdrop-blur text-white' };
      case 'category':
        return { label: 'Flavour Fest', icon: Sparkles, style: 'bg-amber-500/80 backdrop-blur text-white' };
      case 'coupon':
      case 'offer':
        return { label: 'Special Value', icon: Ticket, style: 'bg-emerald-500/85 backdrop-blur text-white' };
      default:
        return { label: 'Campaign', icon: Sparkles, style: 'bg-black/40 backdrop-blur text-white' };
    }
  };

  return (
    <div 
      className={`relative w-full ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {title && (
        <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 font-mono mb-3 flex items-center gap-1.5">
          ✨ {title}
        </h4>
      )}

      {/* Main viewport with animations and swipe support */}
      <div 
        className={`relative w-full ${heightClass} overflow-hidden rounded-3xl shadow-md border border-slate-100/50 dark:border-zinc-800 transition-all`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {liveBanners.map((banner, index) => {
          const isActive = index === currentIndex;
          const badge = getActionBadge(banner);
          const BadgeIcon = badge.icon;
          const hasImage = !!banner.image;

          return (
            <div
              key={banner.id || index}
              onClick={() => onBannerClick?.(banner)}
              className={`absolute inset-0 w-full h-full p-6 text-white flex flex-col justify-between transition-all duration-700 ease-in-out cursor-pointer select-none ${
                isActive ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 translate-x-8 pointer-events-none'
              } ${banner.color || 'bg-gradient-to-r from-zinc-800 to-zinc-900'}`}
            >
              {/* Lazy loaded background photo */}
              {hasImage && (
                <>
                  <LazyImage
                    src={banner.image}
                    referrerPolicy="no-referrer"
                    alt={banner.title}
                    parentClassName="absolute inset-0 w-full h-full"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 scale-100 hover:scale-105 pointer-events-none opacity-30"
                  />
                  {/* Subtle dark backdrop overlay to ensure pristine contrast for overlay typography */}
                  <div className="absolute inset-0 bg-black/55 hover:bg-black/50 transition-colors pointer-events-none" />
                </>
              )}

              {/* Top Row: Type sub-badge and discount state label */}
              <div className="relative z-10 flex justify-between items-start gap-4">
                <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1.5 ${badge.style}`}>
                  <BadgeIcon className="w-3 h-3" />
                  {badge.label}
                </span>

                {banner.discount && (
                  <span className="text-[10px] bg-red-600 text-white font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-sm animate-pulse">
                    {banner.discount}
                  </span>
                )}
              </div>

              {/* Middle Row: Campaign Details */}
              <div className="relative z-10 flex-1 flex flex-col justify-center mt-3 max-w-sm sm:max-w-md">
                <h3 className="text-base sm:text-lg font-black tracking-tight leading-snug drop-shadow-sm line-clamp-1">
                  {banner.title}
                </h3>
                <p className="text-xs text-white/90 font-medium leading-normal mt-1 line-clamp-2 drop-shadow-sm">
                  {banner.description}
                </p>
              </div>

              {/* Bottom Row: Call-to-action details */}
              <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-3 mt-2">
                <div className="flex items-center gap-2">
                  {banner.couponCode ? (
                    <span className="text-[11px] font-mono font-black bg-white/15 px-2.5 py-1 rounded-md border border-white/20">
                      CODE: {banner.couponCode}
                    </span>
                  ) : (
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange-200 hover:text-white transition flex items-center gap-1">
                      {banner.actionType === 'restaurant' ? 'Order cuisine menu' : banner.actionType === 'category' ? `Explore ${banner.actionValue}` : 'Collect voucher'} ➔
                    </span>
                  )}
                  {banner.expiryDate && (
                    <span className="text-[9px] text-white/60 italic font-mono hidden sm:inline">
                      Ends: {banner.expiryDate}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {banner.actionType === 'external' && (
                    <ExternalLink className="w-4 h-4 text-white/70" />
                  )}
                  
                  {/* Action prompt button */}
                  <span className="bg-white text-zinc-950 font-black text-[9px] uppercase px-3.5 py-1.5 rounded-xl transition-all shadow-sm hover:scale-105 active:scale-95">
                    {banner.actionType === 'coupon' || banner.actionType === 'offer' ? 'Apply Offer' : 'Claim Deal'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Left/Right navigation triggers */}
      {showControls && liveBanners.length > 1 && (
        <>
          <button
            type="button"
            onClick={navigatePrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2.5 rounded-full border border-white/10 backdrop-blur transition hidden md:block cursor-pointer active:scale-90"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={navigateNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2.5 rounded-full border border-white/10 backdrop-blur transition hidden md:block cursor-pointer active:scale-90"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}

      {/* Pause/Play controller & Position indicators dot bar */}
      <div className="flex justify-between items-center mt-3 px-1">
        {/* Play/Pause state */}
        {autoPlay && liveBanners.length > 1 && (
          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            className="p-1 px-2 text-zinc-400 hover:text-zinc-650 dark:hover:text-white transition flex items-center gap-1 cursor-pointer"
          >
            {isPaused ? (
              <>
                <Play className="w-3 h-3 text-emerald-500 fill-emerald-500" />
                <span className="text-[9px] font-bold font-mono tracking-wider uppercase">Auto-Paused</span>
              </>
            ) : (
              <>
                <Pause className="w-3 h-3 text-orange-500 fill-orange-505" />
                <span className="text-[9px] font-bold font-mono tracking-wider uppercase">Auto-Cycling</span>
              </>
            )}
          </button>
        )}

        {/* Dynamic Indicator dots */}
        {showDots && liveBanners.length > 1 && (
          <div className="flex gap-1.5 ml-auto">
            {liveBanners.map((_, dotIdx) => (
              <button
                key={dotIdx}
                type="button"
                onClick={() => setCurrentIndex(dotIdx)}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  dotIdx === currentIndex ? 'w-5 bg-orange-500' : 'w-1.5 bg-slate-200 dark:bg-zinc-800 hover:bg-orange-350'
                }`}
                aria-label={`Go to slide ${dotIdx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
