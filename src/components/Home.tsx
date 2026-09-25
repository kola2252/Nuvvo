/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'motion/react';
import { 
  MapPin, Search, Tag, Star, Clock, Filter, Sparkles, ChevronRight, ChevronLeft,
  Heart, Plus, Minus, Check, Moon, Sun, ShieldCheck, HeartCrack, Compass,
  Bell, BellOff, Trash2, ThumbsUp, X, Mic, MicOff, Store, UtensilsCrossed
} from 'lucide-react';
import { CATEGORIES, CATEGORY_DETAILS } from '../data/catalog';
import { FoodItem, VegIndicator } from '../types';
import SmartDeliveryEstimator from './SmartDeliveryEstimator';
import AddressSelectorModal from './AddressSelectorModal';
import { useBannerActions } from './BannerSlider';
import PromotionalCarousel from './PromotionalCarousel';
import { LazyImage } from './LazyImage';

export default function Home() {
  const { 
    user, toggleDarkMode, darkMode,
    foodCatalog, restaurants, isOffline,
    addToCart, updateCartQuantity, cart, 
    favoriteFoods, favoriteRestaurants, toggleFavoriteFood, toggleFavoriteRestaurant,
    setSelectedFoodItem, setCurrentPage, currentAddress,
    notifications, markNotificationAsRead, clearAllNotifications, requestNotificationPermission, notificationPermission, deleteNotification,
    orders,
    banners, addAuditLog, applyCouponCode, appliedCoupon,
    getRestaurantOpenStatus, restaurantReviews, currentTheme,
    clickToWhatsAppFoodBooking,
    pageHistory, goBack, closePage
  } = useApp();

  const [localSearch, setLocalSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [vegOnly, setVegOnly] = useState(false);
  const [highRated, setHighRated] = useState(false);
  const [sortBy, setSortBy] = useState<'rating' | 'price' | 'time'>('rating');
  const [isLoading, setIsLoading] = useState(true);
  const [showNotifCenter, setShowNotifCenter] = useState(false);
  const [notifTab, setNotifTab] = useState<'all' | 'customers' | 'riders' | 'restaurants' | 'admin'>('all');
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null);
  const [modalTab, setModalTab] = useState<'overview' | 'reviews'>('overview');
  const [reviewStarFilter, setReviewStarFilter] = useState<number | 'all'>('all');

  // Clear legacy recent searches from storage to keep top position pristine
  useEffect(() => {
    try {
      localStorage.removeItem('nuvvo_recent_searches');
    } catch {}
  }, []);

  // Global search input ref & filter tabs
  const globalSearchInputRef = useRef<HTMLInputElement>(null);
  const [searchTabFilter, setSearchTabFilter] = useState<'all' | 'restaurants' | 'items'>('all');

  // Keyboard shortcut (⌘K / Ctrl+K) to focus global search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        globalSearchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  // Dynamic Meal Tag Categories
  const [selectedMealTag, setSelectedMealTag] = useState<string>('All');
  const [tagFilteredItems, setTagFilteredItems] = useState<FoodItem[] | null>(null);
  const [isTagLoading, setIsTagLoading] = useState<boolean>(false);

  const handleMealTagSelect = async (tag: string) => {
    setSelectedMealTag(tag);
    
    // Smooth scroll down to the dishes catalog showcase
    setTimeout(() => {
      const element = document.getElementById('dishes-showcase');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);

    if (tag === 'All') {
      setTagFilteredItems(null);
      return;
    }

    setIsTagLoading(true);
    
    // Define local helper for fallback
    const filterLocal = (t: string) => {
      const targetTag = t.toLowerCase();
      return foodCatalog.filter(item => {
        const cat = item.category.toLowerCase();
        const sub = (item.subcategory || '').toLowerCase();
        const name = item.name.toLowerCase();
        const desc = item.description.toLowerCase();

        if (targetTag === 'breakfast') {
          return (
            cat.includes('tiffin') || 
            cat.includes('south indian') || 
            cat.includes('tea & coffee') ||
            sub.includes('breakfast') || 
            sub.includes('idli') || 
            sub.includes('dosa') || 
            sub.includes('upma') ||
            name.includes('breakfast') || 
            name.includes('idli') || 
            name.includes('dosa')
          );
        }

        if (targetTag === 'dinner') {
          return (
            cat.includes('biryani') || 
            cat.includes('north indian') || 
            cat.includes('chinese') || 
            cat.includes('chicken') || 
            cat.includes('mutton') || 
            cat.includes('seafood') || 
            cat.includes('combo') || 
            cat.includes('dinner') ||
            sub.includes('dinner') || 
            sub.includes('curry') || 
            sub.includes('mandi') || 
            sub.includes('gravy') || 
            name.includes('dinner') || 
            name.includes('thali') || 
            name.includes('biryani')
          );
        }

        if (targetTag === 'snacks') {
          return (
            cat.includes('fast food') || 
            cat.includes('pizza') || 
            cat.includes('burger') || 
            cat.includes('sandwich') || 
            cat.includes('rolls') || 
            cat.includes('shawarma') || 
            cat.includes('bakery') || 
            cat.includes('kids') || 
            cat.includes('snack') ||
            cat.includes('dessert') ||
            cat.includes('ice cream') ||
            cat.includes('milkshake') ||
            sub.includes('snack') || 
            sub.includes('fries') || 
            sub.includes('nuggets') || 
            sub.includes('bite') || 
            name.includes('snack') || 
            name.includes('fries') || 
            name.includes('burger') || 
            name.includes('pizza')
          );
        }

        if (targetTag === 'healthy') {
          return (
            cat.includes('healthy') || 
            cat.includes('juice') || 
            desc.includes('healthy') || 
            desc.includes('protein') || 
            desc.includes('salad') || 
            desc.includes('fresh') || 
            desc.includes('fiber') || 
            desc.includes('vitamins') || 
            desc.includes('keto') || 
            desc.includes('diet') ||
            name.includes('healthy') || 
            name.includes('salad') || 
            name.includes('oats') || 
            name.includes('sprouts')
          );
        }

        return false;
      });
    };

    if (isOffline) {
      setTagFilteredItems(filterLocal(tag));
      setIsTagLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/food-items?tag=${tag}`);
      if (response.ok) {
        const data = await response.json();
        setTagFilteredItems(data);
      } else {
        console.warn('Failed to fetch food items for tag, falling back to local filter:', tag);
        setTagFilteredItems(filterLocal(tag));
      }
    } catch (err) {
      console.warn('Error fetching food items for tag, falling back to local filter:', tag, err);
      setTagFilteredItems(filterLocal(tag));
    } finally {
      setIsTagLoading(false);
    }
  };

  const [showAddressModal, setShowAddressModal] = useState(false);

  // Voice Search States
  const [isListening, setIsListening] = useState(false);
  const [voiceToast, setVoiceToast] = useState<string | null>(null);
  const [recognitionObj, setRecognitionObj] = useState<any>(null);

  // Initialize Speech Recognition on component side
  const handleVoiceSearchToggle = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceToast("🎤 Voice search not supported in this browser.");
      setTimeout(() => setVoiceToast(null), 3000);
      return;
    }

    if (isListening) {
      if (recognitionObj) {
        recognitionObj.stop();
      }
      setIsListening(false);
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = 'en-IN'; // Optimized for general user demographics in India or default en-US

    rec.onstart = () => {
      setIsListening(true);
      setVoiceToast("🎤 Listening... Speak a dish or cuisine!");
    };

    rec.onresult = (e: any) => {
      const resultTranscript = e.results[0][0].transcript;
      if (resultTranscript) {
        const cleaned = resultTranscript.replace(/[.*+?^${}()|[\]\\]/g, '').trim();
        setLocalSearch(cleaned);
        setSelectedCategory(null);
        setVoiceToast(`🔍 Voice Searched for: "${cleaned}"`);
        setTimeout(() => setVoiceToast(null), 3500);
      }
    };

    rec.onerror = (e: any) => {
      console.error("Speech Recognition Error:", e);
      if (e.error === 'not-allowed') {
        setVoiceToast("⚠️ Microphone access denied.");
      } else {
        setVoiceToast("⚠️ Voice recognition failed. Try again.");
      }
      setTimeout(() => setVoiceToast(null), 3000);
      setIsListening(false);
    };

    rec.onend = () => {
      setIsListening(false);
    };

    rec.start();
    setRecognitionObj(rec);
  };

  // Auto-trigger address selection modal at app startup if first run of the session
  useEffect(() => {
    const prompted = sessionStorage.getItem('nuvvo_startup_address_prompted');
    if (!prompted) {
      sessionStorage.setItem('nuvvo_startup_address_prompted', 'true');
      setShowAddressModal(true);
    }
  }, []);

  const getFoodItemRestaurant = (foodId: string) => {
    if (!restaurants || restaurants.length === 0) return null;
    const foodItem = foodCatalog?.find(f => f.id === foodId);
    if (foodItem?.restaurantId) {
      const rest = restaurants.find(r => r.id === foodItem.restaurantId);
      if (rest) return rest;
    }
    const match = foodId.match(/\d+/);
    const num = match ? parseInt(match[0], 10) : 0;
    return restaurants[num % restaurants.length];
  };

  // Restaurant Filter states
  const [restSearch, setRestSearch] = useState('');
  const [restCategory, setRestCategory] = useState('All');
  const [restMaxDistance, setRestMaxDistance] = useState<number | null>(null);
  const [restMinRating, setRestMinRating] = useState<number | null>(null);

  // Computed and filtered Active approved Restaurants
  const customerRestaurants = useMemo(() => {
    let basePool = restaurants;
    if (isOffline) {
      const stored = localStorage.getItem('nuvvo_last_viewed_restaurants');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            basePool = parsed;
          }
        } catch (e) {
          console.error('Failed to parse cached restaurant list:', e);
        }
      }
    }

    let list = basePool.filter(r => r.isApproved !== false && r.isActive !== false);

    const q = localSearch.trim().toLowerCase();
    if (q) {
      list = list.filter(r => {
        // 1. Matches restaurant name
        const matchName = r.name.toLowerCase().includes(q);
        
        // 2. Matches cuisines
        const matchCuisine = r.cuisines ? r.cuisines.some(c => c.toLowerCase().includes(q)) : false;
        
        // 3. Matches dishes served
        const matchDishes = foodCatalog.some(item => {
          const itemRest = getFoodItemRestaurant(item.id);
          return itemRest && itemRest.id === r.id && 
            (item.name.toLowerCase().includes(q) || 
             item.category.toLowerCase().includes(q) || 
             item.description.toLowerCase().includes(q));
        });

        return matchName || matchCuisine || matchDishes;
      });
    }

    if (restCategory !== 'All') {
      list = list.filter(r => r.businessType === restCategory);
    }

    if (restMaxDistance !== null) {
      list = list.filter(r => (r.distance || 0.1) <= restMaxDistance);
    }

    if (restMinRating !== null) {
      list = list.filter(r => (r.rating || 4.0) >= restMinRating);
    }

    // Sort by descending rating to match Swiggy popularity
    return list.sort((a,b) => (b.rating || 4) - (a.rating || 4));
  }, [restaurants, localSearch, restCategory, restMaxDistance, restMinRating, foodCatalog, isOffline]);

  // Cache the last viewed restaurant list to localStorage when online
  useEffect(() => {
    if (!isOffline && customerRestaurants && customerRestaurants.length > 0) {
      localStorage.setItem('nuvvo_last_viewed_restaurants', JSON.stringify(customerRestaurants));
    }
  }, [customerRestaurants, isOffline]);

  // Experience-enhancing shimmer simulated delay on component mount and filter switching
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearch, selectedCategory, vegOnly, highRated, sortBy, restSearch, restCategory, restMaxDistance, restMinRating, selectedMealTag]);

  // Filter computation
  const filteredCatalog = useMemo(() => {
    let list = (selectedMealTag !== 'All' && tagFilteredItems) ? [...tagFilteredItems] : [...foodCatalog];

    if (localSearch.trim() !== '') {
      const q = localSearch.trim().toLowerCase();
      list = list.filter(item => {
        const matchName = item.name.toLowerCase().includes(q);
        const matchCat = item.category.toLowerCase().includes(q);
        const matchDesc = item.description.toLowerCase().includes(q);
        const matchedRest = getFoodItemRestaurant(item.id);
        const matchRestName = matchedRest ? matchedRest.name.toLowerCase().includes(q) : false;
        return matchName || matchCat || matchDesc || matchRestName;
      });
    }

    if (selectedCategory) {
      list = list.filter(item => item.category === selectedCategory);
    }

    if (vegOnly) {
      list = list.filter(item => item.vegIndicator === VegIndicator.VEG);
    }

    if (highRated) {
      list = list.filter(item => item.rating >= 4.5);
    }

    // Sort operations
    if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'price') {
      list.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
    } else if (sortBy === 'time') {
      list.sort((a, b) => a.prepTime - b.prepTime);
    }

    return list.slice(0, 48); // Lazy windowing of first 48 records to maintain high CPU speed
  }, [foodCatalog, localSearch, selectedCategory, vegOnly, highRated, sortBy, restaurants, selectedMealTag, tagFilteredItems]);

  // Global search direct name match collections
  const matchingRestaurantsByName = useMemo(() => {
    if (!localSearch.trim()) return [];
    const q = localSearch.trim().toLowerCase();
    return customerRestaurants.filter(r => 
      r.name.toLowerCase().includes(q) || 
      (r.cuisines && r.cuisines.some(c => c.toLowerCase().includes(q))) ||
      (r.businessType && r.businessType.toLowerCase().includes(q))
    );
  }, [customerRestaurants, localSearch]);

  const matchingFoodItemsByName = useMemo(() => {
    if (!localSearch.trim()) return [];
    const q = localSearch.trim().toLowerCase();
    return filteredCatalog.filter(item => 
      item.name.toLowerCase().includes(q) || 
      item.category.toLowerCase().includes(q) ||
      (item.description && item.description.toLowerCase().includes(q))
    );
  }, [filteredCatalog, localSearch]);

  // Distinct section filters
  const trendingMeals = useMemo(() => {
    return foodCatalog.filter(item => item.isTrending).slice(0, 8);
  }, [foodCatalog]);

  const bestSellerMeals = useMemo(() => {
    return foodCatalog.filter(item => item.isBestSeller).slice(0, 8);
  }, [foodCatalog]);

  const ruleBasedRecommendations = useMemo(() => {
    const userOrders = orders.filter(
      o => o.customerId === user?.id || (user?.phone && o.customerPhone === user.phone)
    );

    const itemCounts: { [foodId: string]: number } = {};
    const categoryCounts: { [category: string]: number } = {};

    userOrders.forEach(order => {
      order.items?.forEach(cartItem => {
        if (cartItem.foodItem) {
          const foodId = cartItem.foodItem.id;
          itemCounts[foodId] = (itemCounts[foodId] || 0) + cartItem.quantity;

          const cat = cartItem.foodItem.category;
          if (cat) {
            categoryCounts[cat] = (categoryCounts[cat] || 0) + cartItem.quantity;
          }
        }
      });
    });

    const sortedByFreq = Object.entries(itemCounts).sort((a, b) => b[1] - a[1]);

    const sortedCategories = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([cat]) => cat);

    const recommendations: { food: FoodItem; reason: string }[] = [];
    const addedIds = new Set<string>();

    // 1. Add direct frequency matches (previously ordered items, sorted by freq)
    sortedByFreq.forEach(([foodId, count]) => {
      const food = foodCatalog.find(f => f.id === foodId);
      if (food) {
        recommendations.push({
          food,
          reason: count >= 2 ? `Your Regular • Ordered ${count}x` : 'Ordered Before'
        });
        addedIds.add(foodId);
      }
    });

    // 2. Discover new items in their favorite categories
    if (sortedCategories.length > 0) {
      sortedCategories.forEach(cat => {
        const catItems = foodCatalog
          .filter(item => item.category === cat && !addedIds.has(item.id))
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 2);

        catItems.forEach(item => {
          recommendations.push({
            food: item,
            reason: `Highly Rated in ${cat}`
          });
          addedIds.add(item.id);
        });
      });
    }

    // 3. Fallback to highly-rated best sellers or trending items to pad recommendations up to 8 items
    const fallbacks = foodCatalog
      .filter(item => !addedIds.has(item.id) && (item.isBestSeller || item.isTrending || item.rating >= 4.7))
      .sort((a, b) => b.rating - a.rating);

    fallbacks.forEach(item => {
      if (recommendations.length < 10) {
        recommendations.push({
          food: item,
          reason: item.isBestSeller ? 'Best Seller Choice' : 'Trending Choice'
        });
        addedIds.add(item.id);
      }
    });

    return recommendations.slice(0, 8);
  }, [orders, user, foodCatalog]);

  // Gemini AI recommendation state and lifecycle
  const [geminiRec, setGeminiRec] = useState<{ foodId: string; reason: string } | null>(null);
  const [geminiLoading, setGeminiLoading] = useState(false);

  const userId = user?.id;
  const userPhone = user?.phone;
  const ordersCount = orders.length;
  const catalogCount = foodCatalog.length;

  useEffect(() => {
    if (!catalogCount) return;

    let isMounted = true;
    const cacheKey = `gemini_rec_${userId || 'guest'}_${ordersCount}_${catalogCount}`;

    // Read cache first
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.foodId) {
          setGeminiRec(parsed);
          return;
        }
      }
    } catch (e) {
      // Ignore cache retrieval errors
    }

    const fetchGeminiRecommendations = async () => {
      setGeminiLoading(true);
      try {
        const userOrders = orders.filter(
          o => o.customerId === userId || (userPhone && o.customerPhone === userPhone)
        );

        const response = await fetch("/api/recommendations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orders: userOrders.slice(0, 5), // last 5 orders
            catalog: foodCatalog.slice(0, 40), // first 40 available catalog foods
          }),
        });

        if (!response.ok) {
          throw new Error("HTTP status " + response.status);
        }

        const data = await response.json();
        if (isMounted && data && data.foodId) {
          const recObj = {
            foodId: data.foodId,
            reason: data.reason || "Curated just for your palate!"
          };
          setGeminiRec(recObj);
          try {
            sessionStorage.setItem(cacheKey, JSON.stringify(recObj));
          } catch (e) {
            // Ignore cache save errors
          }
        }
      } catch (err: any) {
        console.warn("Notice: Gemini recommendation is using dynamic catalog fallback:", err?.message || err);
      } finally {
        if (isMounted) {
          setGeminiLoading(false);
        }
      }
    };

    fetchGeminiRecommendations();

    return () => {
      isMounted = false;
    };
  }, [ordersCount, userId, userPhone, catalogCount]);

  // Expose the final recommended set: prioritized by Gemini AI suggestions if loaded successfully
  const recommendedMeals = useMemo(() => {
    if (geminiRec && geminiRec.foodId) {
      const matchedFood = foodCatalog.find(f => f.id === geminiRec.foodId);
      if (matchedFood) {
        const primary = {
          food: matchedFood,
          reason: `✨ Gemini AI: ${geminiRec.reason}`
        };
        const remaining = ruleBasedRecommendations.filter(r => r.food.id !== matchedFood.id);
        return [primary, ...remaining].slice(0, 8);
      }
    }
    return ruleBasedRecommendations;
  }, [geminiRec, ruleBasedRecommendations, foodCatalog]);

  // Dynamic Banner click action system with support for date schedule validation
  const activeBanners = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return (banners || []).filter(b => {
      if (!b.enabled) return false;
      if (b.startDate && b.startDate > todayStr) return false;
      if (b.endDate && b.endDate < todayStr) return false;
      return true;
    });
  }, [banners]);

  const restaurantSpecificBanners = useMemo(() => {
    return activeBanners.filter(b => b.actionType === 'restaurant');
  }, [activeBanners]);

  const valueOfferBanners = useMemo(() => {
    return activeBanners.filter(b => b.actionType === 'coupon' || b.actionType === 'offer');
  }, [activeBanners]);

  // Handle banner actions dynamically using custom action handle hook
  const { handleBannerClick } = useBannerActions({
    setSelectedRestaurant,
    setLocalSearch,
    setSelectedCategory,
    setCurrentPage,
    setHighRated,
    setVoiceToast: setVoiceToast
  });

  // Helper dictionary checking quantities
  const getCartQuantityOfItem = (itemId: string) => {
    const item = cart.find(c => c.foodItem.id === itemId);
    return item ? item.quantity : 0;
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const restaurantsSectionJSX = (
    <div className="space-y-4 border-t border-slate-100 dark:border-zinc-800 pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-50 tracking-tight flex items-center gap-2">
            <Compass className={`w-5 h-5 ${currentTheme.textClass} animate-spin-slow`} /> Culinary Partner Kitchens
          </h3>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
            {localSearch ? (
              <span>Matched <span className="font-bold text-orange-550 dark:text-orange-400">{customerRestaurants.length}</span> kitchens by name, cuisine, or specific dish names</span>
            ) : (
              <span>Explore approved and active regional kitchens in Chirala region</span>
            )}
          </p>
          {isOffline && (
            <div className="mt-2 inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse animate-duration-1000"></span>
              Showing Cached Offline List
            </div>
          )}
        </div>

        {/* Restaurant filters */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setRestMinRating(restMinRating === 4.0 ? null : 4.0)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors flex items-center gap-1 cursor-pointer ${
              restMinRating === 4.0
                ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-800'
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-current" />
            Rating 4.0+
          </button>

          <select
            value={restCategory}
            onChange={e => setRestCategory(e.target.value)}
            className="bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-slate-250 dark:border-zinc-800 text-xs font-bold px-3 py-1.5 rounded-full focus:outline-none"
          >
            <option value="All">All Categories</option>
            <option value="Family">Family Dining</option>
            <option value="Biryani & Mandi">Biryani & Mandi</option>
            <option value="Fast Food">Fast Food</option>
            <option value="Meals & Tiffins">Meals & Tiffins</option>
            <option value="Desserts & Bakery">Desserts & Bakery</option>
            <option value="Juices & Cafe">Juices & Cafe</option>
            <option value="Seafood">Seafood</option>
            <option value="Hotel & Resort">Hotel & Resort</option>
          </select>

          {localSearch && (
            <button
              onClick={() => setLocalSearch('')}
              className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-350 border shadow-xs cursor-pointer"
            >
              Reset Search
            </button>
          )}
        </div>
      </div>

      {/* Quick Access to Top 13 Chirala Partner Restaurants */}
      <div className="bg-gradient-to-r from-orange-50/80 via-amber-50/50 to-orange-50/80 dark:from-zinc-900 dark:via-zinc-800/80 dark:to-zinc-900 p-3 rounded-2xl border border-orange-100/80 dark:border-zinc-800 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">🔥</span>
            <span className="text-xs font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
              చీరాల పాపులర్ రెస్టారెంట్లు (Chirala Top Partner Spots)
            </span>
          </div>
          <span className="text-[11px] font-black text-orange-600 dark:text-orange-400">
            హోటల్ & ఫుడ్ బుకింగ్స్: 9063692135
          </span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar">
          {restaurants.slice(0, 13).map((r) => (
            <button
              key={r.id}
              onClick={() => {
                setSelectedRestaurant(r);
                setModalTab('overview');
                setReviewStarFilter('all');
              }}
              className="shrink-0 px-3 py-1.5 bg-white dark:bg-zinc-800 hover:bg-orange-500 hover:text-white border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-zinc-800 dark:text-zinc-200 shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
              <span className="whitespace-nowrap">{r.name}</span>
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 animate-pulse">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-3 flex flex-col justify-between shadow-xs relative">
              <div>
                {/* Image block shimmer */}
                <div className="rounded-xl mb-3 aspect-[16/9] w-full shimmer-bg" />
                {/* Title and Rating Row */}
                <div className="flex justify-between items-start gap-4 mb-2.5">
                  <div className="h-4.5 rounded-lg w-1/2 shimmer-bg" />
                  <div className="h-4.5 rounded-full w-12 shimmer-bg shrink-0" />
                </div>
                {/* Cuisines tag list mock */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <div className="h-3 rounded-md w-16 shimmer-bg" />
                  <div className="h-3 rounded-md w-12 shimmer-bg" />
                  <div className="h-3 rounded-md w-20 shimmer-bg" />
                </div>
              </div>
              {/* Footer row */}
              <div className="border-t border-slate-50 dark:border-zinc-800/60 pt-2.5 flex items-center justify-between">
                <div className="h-3.5 rounded-md w-16 shimmer-bg" />
                <div className="h-3.5 rounded-md w-20 shimmer-bg" />
              </div>
            </div>
          ))}
        </div>
      ) : customerRestaurants.length === 0 ? (
        <div className="text-center py-10 bg-white dark:bg-zinc-950 rounded-3xl border border-slate-100 dark:border-zinc-900 flex flex-col items-center justify-center">
          <HeartCrack className="w-10 h-10 text-zinc-350 mb-2" />
          <p className="text-zinc-500 text-xs font-bold">No partner kitchens found matching your criteria.</p>
          <p className="text-[10px] text-zinc-400 mt-0.5">Try searching for other dish names, food groups, or cuisines.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {customerRestaurants.map(rest => {
            const servesDishes = foodCatalog.filter(item => item.restaurantId === rest.id);
            // Highlight matching dish name if any
            const query = localSearch.trim().toLowerCase();
            const matchedDish = query ? servesDishes.find(item => 
              item.name.toLowerCase().includes(query) || 
              item.category.toLowerCase().includes(query)
            ) : null;

            return (
              <div
                key={rest.id}
                onClick={() => {
                  setSelectedRestaurant(rest);
                  setModalTab('overview');
                  setReviewStarFilter('all');
                }}
                className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-3 flex flex-col justify-between shadow-xs relative group cursor-pointer hover:shadow-md hover:border-orange-100 dark:hover:border-zinc-700 transition"
              >
                <div>
                  {/* Image block */}
                  <div className="overflow-hidden rounded-xl relative mb-2.5 aspect-[16/9] bg-slate-50 dark:bg-zinc-800">
                    <LazyImage
                      src={rest.image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=450"}
                      alt={rest.name}
                      parentClassName="w-full h-full"
                      className="w-full h-full object-cover group-hover:scale-102 transition-all duration-300"
                      referrerPolicy="no-referrer"
                    />
                    {rest.businessType && (
                      <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs text-white font-extrabold text-[8px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {rest.businessType}
                      </span>
                    )}
                    {rest.isPromoted && (
                      <span className="absolute top-2 right-2 bg-orange-600 text-white font-black text-[8px] px-2 py-0.5 rounded-lg uppercase tracking-wider shadow-sm">
                        PROMOTED
                      </span>
                    )}
                    {rest.offers && rest.offers.length > 0 && (
                      <span className="absolute bottom-2 left-2 bg-orange-500 text-white font-black text-[8px] px-2 py-0.5 rounded-md uppercase tracking-wider">
                        🏷️ {rest.offers[0]}
                      </span>
                    )}
                    {(() => {
                      const statusObj = getRestaurantOpenStatus(rest);
                      return (
                        <span className={`absolute bottom-2 right-2 font-black text-[8px] px-2 py-0.5 rounded-md uppercase tracking-wider border shadow-sm ${
                          statusObj.status === 'open' 
                            ? 'bg-emerald-600/90 text-white border-emerald-500' 
                            : 'bg-rose-600/95 text-white border-rose-500 animate-pulse'
                        }`}>
                          {statusObj.label}
                        </span>
                      );
                    })()}
                  </div>

                  {/* Details block */}
                  <div>
                    <div className="flex justify-between items-start gap-1">
                      <h4 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 line-clamp-1 group-hover:text-orange-500 transition-colors tracking-tight">
                        {rest.name}
                      </h4>
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-0.5 line-clamp-1 font-medium">
                      {rest.cuisines?.join(', ')}
                    </p>
                    
                    {query && rest.name.toLowerCase().includes(query) && (
                      <div className="mt-1 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/25 rounded-md inline-flex items-center gap-1 text-[9px] text-emerald-600 dark:text-emerald-400 font-bold max-w-full">
                        <Store className="w-3 h-3 shrink-0" />
                        <span className="truncate">Matches Restaurant Name</span>
                      </div>
                    )}

                    {matchedDish && (
                      <div className="mt-1.5 px-2 py-1 bg-orange-550/5 dark:bg-orange-950/10 border border-dashed border-orange-500/25 rounded-lg flex items-center gap-1 text-[9px] text-orange-600 dark:text-orange-400 font-bold max-w-full">
                        <span className="text-xs">🍳</span>
                        <span className="truncate">Serves match: "{matchedDish.name}"</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-50 dark:border-zinc-800/60 text-[10px] text-zinc-500">
                  <div className="flex items-center gap-1 font-black text-amber-600 dark:text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-amber-550 text-amber-550" />
                    <span>{rest.rating?.toFixed(1) || '4.0'}</span>
                    <span className="text-zinc-400 font-bold">({rest.reviewsCount || 20} Reviews)</span>
                  </div>
                  
                  <div className="flex items-center gap-2 font-mono">
                    <span className="flex items-center gap-0.5 text-zinc-650 dark:text-zinc-400">
                      <Clock className="w-3 h-3" /> {rest.deliveryTime || '25'}m
                    </span>
                    <span className="text-zinc-300">|</span>
                    <span>{rest.distance || '1.5'} km</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const foodCatalogSectionJSX = (
    <div id="dishes-showcase">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
            Dishes Showcase Catalog
          </h3>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5 font-bold">Explore our delicious premium range containing signature plates</p>
        </div>

        {/* Micro Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setVegOnly(!vegOnly)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
              vegOnly 
                ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm' 
                : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-800'
            }`}
          >
            <span className={`w-2.5 h-2.5 rounded-full border ${vegOnly ? 'bg-white border-white' : 'bg-emerald-600 border-emerald-600'}`} />
            Veg Only
          </button>

          <button
            onClick={() => setHighRated(!highRated)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors flex items-center gap-1 cursor-pointer ${
              highRated 
                ? 'bg-amber-500 text-white border-amber-500 shadow-sm' 
                : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-800'
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-current" />
            Rated 4.5+
          </button>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-slate-250 dark:border-zinc-800 text-xs font-bold px-3 py-1.5 rounded-full focus:outline-none"
          >
            <option value="rating">Sort: High Rating</option>
            <option value="price">Sort: Budget Price</option>
            <option value="time">Sort: Fastest Prep</option>
          </select>
        </div>
      </div>

      {/* Dynamic Meal Tag Category Navigation Bar */}
      <div className="mb-5 p-2 rounded-2xl bg-zinc-50 dark:bg-zinc-950/40 border border-slate-100 dark:border-zinc-900">
        <div className="flex items-center justify-between mb-2 px-1">
          <p className="text-[11px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-mono flex items-center gap-1">
            <Filter className="w-3 h-3 text-orange-500" /> Meal Time Tag
          </p>
          {selectedMealTag !== 'All' && (
            <span className="text-[10px] bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-black px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
              {selectedMealTag} Active
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
          {[
            { id: 'All', label: 'All', icon: '🍽️' },
            { id: 'Breakfast', label: 'Breakfast', icon: '🥞' },
            { id: 'Dinner', label: 'Dinner', icon: '🍛' },
            { id: 'Snacks', label: 'Snacks', icon: '🍟' },
            { id: 'Healthy', label: 'Healthy', icon: '🥗' }
          ].map(tagItem => {
            const isSelected = selectedMealTag === tagItem.id;
            return (
              <button
                key={tagItem.id}
                onClick={() => handleMealTagSelect(tagItem.id)}
                disabled={isTagLoading}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed ${
                  isSelected
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20 border border-orange-400'
                    : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-slate-150 dark:border-zinc-800 hover:bg-slate-100/50 dark:hover:bg-zinc-800/50'
                }`}
              >
                <span>{tagItem.icon}</span>
                <span>{tagItem.label}</span>
              </button>
            );
          })}
        </div>
        
        {/* Loading Indicator */}
        {isTagLoading && (
          <div className="flex items-center gap-2 mt-2 px-1 text-zinc-400 text-[11px] font-mono font-bold animate-pulse">
            <div className="w-2.5 h-2.5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <span>Fetching dishes matching {selectedMealTag}...</span>
          </div>
        )}
      </div>

      {/* Core Grid mapping up to 48 lazy loaded items perfectly to avoid huge memory hit */}
      {isLoading ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {Array.from({ length: 8 }).map((_, idx) => (
            <div 
              key={idx}
              className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-3 flex flex-col justify-between shadow-sm relative animate-pulse"
            >
              {/* Mock Favorite Button */}
              <div className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full shimmer-bg" />

              <div>
                {/* Mock Image Area */}
                <div className="aspect-square rounded-2xl mb-3 w-full relative overflow-hidden shimmer-bg">
                  {/* Veg indicator badge placeholder */}
                  <div className="absolute bottom-2 left-2 w-5 h-5 rounded-md bg-white/20 dark:bg-black/20" />
                </div>
                
                {/* Mock Meta info */}
                <div className="space-y-2">
                  <div className="h-3 rounded-md w-1/3 shimmer-bg" />
                  <div className="h-4.5 rounded-lg w-3/4 shimmer-bg" />
                  <div className="space-y-1.5 pt-1">
                    <div className="h-2.5 rounded-md w-full shimmer-bg" />
                    <div className="h-2.5 rounded-md w-5/6 shimmer-bg" />
                  </div>
                  
                  {/* Mock ratings/prep time */}
                  <div className="flex items-center gap-2 pt-1.5">
                    <div className="h-3.5 rounded-md w-10 shimmer-bg" />
                    <span className="text-slate-100 dark:text-zinc-800 font-bold select-none">|</span>
                    <div className="h-3.5 rounded-md w-12 shimmer-bg" />
                  </div>
                </div>
              </div>
              
              {/* Mock Pricing & Action Button */}
              <div className="flex items-center justify-between mt-4 border-t border-slate-50 dark:border-zinc-800/60 pt-2.5">
                <div className="space-y-1.5 w-1/3">
                  <div className="h-4 rounded-md w-full shimmer-bg" />
                  <div className="h-2.5 rounded-md w-2/3 shimmer-bg" />
                </div>
                <div className="h-8 rounded-xl w-14 shimmer-bg" />
              </div>
            </div>
          ))}
        </motion.div>
      ) : filteredCatalog.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-zinc-950 rounded-3xl border border-slate-100 dark:border-zinc-900 flex flex-col items-center justify-center">
          <HeartCrack className="w-12 h-12 text-zinc-300 mb-2" />
          <p className="text-zinc-500 font-bold">No dishes found matching your precise criteria.</p>
          <button 
            onClick={() => { setLocalSearch(''); setSelectedCategory(null); setVegOnly(false); setHighRated(false); }}
            className="mt-3 text-xs bg-slate-100 dark:bg-zinc-800 font-bold text-zinc-800 dark:text-zinc-200 px-3 py-2 rounded-xl cursor-pointer"
          >
            Reset active filters
          </button>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {filteredCatalog.map(food => {
            const qty = getCartQuantityOfItem(food.id);
            const isFav = favoriteFoods.includes(food.id);
            return (
              <div 
                key={food.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFoodItem(food);
                }}
                className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-3 flex flex-col justify-between shadow-sm relative group cursor-pointer hover:shadow-md hover:border-orange-100 dark:hover:border-zinc-700 transition"
              >
                {/* Favorite Button */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavoriteFood(food.id);
                  }}
                  className="absolute top-2.5 right-2.5 z-10 p-2 bg-white/90 dark:bg-zinc-800/90 backdrop-blur rounded-full shadow-md text-zinc-650 hover:text-red-500 cursor-pointer"
                >
                  <Heart className={`w-3 h-3 ${isFav ? 'fill-red-500 text-red-500' : 'text-zinc-500'}`} />
                </button>

                {/* Image Area */}
                <div className="overflow-hidden rounded-2xl relative mb-2.5 aspect-[4/3] bg-slate-50 dark:bg-zinc-800">
                  <LazyImage 
                    src={food.image} 
                    alt={food.name}
                    parentClassName="w-full h-full"
                    className="w-full h-full object-cover group-hover:scale-103 transition-all"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Veg indicator badge */}
                  <span className="absolute bottom-2 right-2 shadow-sm bg-white dark:bg-zinc-805 p-1 rounded-lg flex items-center justify-center">
                    {food.vegIndicator === VegIndicator.VEG ? (
                      <span className="veg-icon"><span className="veg-dot" /></span>
                    ) : (
                      <span className="nonveg-icon"><span className="nonveg-dot" /></span>
                    )}
                  </span>
                </div>

                {/* Meta info */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest block mb-0.5">
                      {food.category} • {food.subcategory}
                    </span>
                    <h4 className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100 line-clamp-1 group-hover:text-orange-500 transition-colors tracking-tight">
                      {food.name}
                    </h4>
                    
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        const r = getFoodItemRestaurant(food.id);
                        if (r) setSelectedRestaurant(r);
                      }}
                      className="mt-0.5 inline-flex items-center gap-1 text-[9.5px] font-black text-orange-500 dark:text-orange-400 hover:text-orange-600 dark:hover:text-orange-300 hover:underline cursor-pointer tracking-tight"
                      title="Click to view full restaurant details"
                    >
                      <span className="text-[9px]">📍</span>
                      <span>{getFoodItemRestaurant(food.id)?.name || 'Ecosystem Kitchen'}</span>
                    </div>

                    <p className="text-[10px] text-zinc-500 line-clamp-2 mt-1 leading-snug h-8 font-medium">
                      {food.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 mt-2 text-[10px]">
                    <span className="flex items-center gap-0.5 font-bold text-amber-600">
                      <Star className="w-3 h-3 fill-amber-550 text-amber-550" /> {food.rating}
                    </span>
                    <span className="text-zinc-300 dark:text-zinc-700">|</span>
                    <span className="text-zinc-500 flex items-center gap-0.5 font-mono">
                      <Clock className="w-3 h-3" /> {food.prepTime}m
                    </span>
                  </div>
                </div>

                {/* Pricing with Swiggy style Quantities addition */}
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center justify-between mt-3 border-t border-slate-50 dark:border-zinc-800/80 pt-2"
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-zinc-900 dark:text-zinc-100 font-mono">
                      ₹{food.discountPrice || food.price}
                    </span>
                    {food.discountPrice && (
                      <span className="text-[9px] line-through text-zinc-400 font-mono">
                        ₹{food.price}
                      </span>
                    )}
                  </div>

                  <div>
                    {(() => {
                      const restOfFood = restaurants.find(r => r.id === food.restaurantId);
                      const isRestClosed = restOfFood ? getRestaurantOpenStatus(restOfFood).status !== 'open' : false;
                      
                      if (isRestClosed) {
                        return (
                          <span className="text-[8px] font-black bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 px-2.5 py-1 rounded-lg uppercase tracking-wide">
                            Closed
                          </span>
                        );
                      }
                      
                      return qty > 0 ? (
                        <div className="flex items-center bg-orange-500 text-white px-2 py-1 rounded-xl text-xs font-bold gap-2 shadow-sm">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              updateCartQuantity(food.id, -1);
                            }} 
                            className="p-0.5 hover:bg-orange-600 rounded cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span>{qty}</span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              updateCartQuantity(food.id, 1);
                            }} 
                            className="p-0.5 hover:bg-orange-600 rounded cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(food);
                          }}
                          className="bg-white dark:bg-zinc-800 border-2 border-orange-500 text-orange-500 font-black text-[9px] px-3 py-1 rounded-xl uppercase tracking-wider hover:bg-orange-500 hover:text-white transition-all cursor-pointer shadow-md shadow-orange-500/5 active:scale-95 whitespace-nowrap"
                        >
                          Add
                        </button>
                      );
                    })()}
                  </div>
                </div>

              </div>
            );
          })}
        </motion.div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 pb-32 transition-colors duration-300">
      
      {/* Dynamic Header */}
      <header className="sticky top-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur shadow-sm z-40 py-3 px-4 flex items-center justify-between border-b border-slate-100 dark:border-zinc-800">
        <div className="flex items-center gap-1.5 mr-1 max-w-[82%]">
          {/* Universal navigation options */}
          <div className="flex items-center gap-1 shrink-0 mr-1">
            <button
              onClick={() => {
                if (selectedCategory) {
                  setSelectedCategory(null);
                } else if (localSearch) {
                  setLocalSearch('');
                } else if (selectedMealTag !== 'All') {
                  setSelectedMealTag('All');
                } else if (pageHistory.length > 1) {
                  goBack();
                } else {
                  closePage();
                }
              }}
              className="p-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-full text-zinc-700 dark:text-zinc-300 transition-all cursor-pointer active:scale-95 flex items-center justify-center shrink-0"
              title="Go Back"
              id="home-screen-back-btn"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={closePage}
              className="p-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-full text-zinc-700 dark:text-zinc-300 transition-all cursor-pointer active:scale-95 flex items-center justify-center shrink-0"
              title="Close to Home"
              id="home-screen-close-btn"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <button 
            onClick={() => setShowAddressModal(true)}
            aria-label="Select delivery address"
            aria-haspopup="dialog"
            className="flex items-center gap-1.5 overflow-hidden text-left cursor-pointer hover:opacity-85 active:scale-[0.99] transition"
          >
            <div className="p-1.5 bg-orange-500/10 rounded-full text-orange-500 font-bold shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold font-mono tracking-wider text-zinc-400 dark:text-zinc-500 uppercase truncate">Deliver: {currentAddress?.type || 'Home'}</span>
              </div>
              <p className="text-xs font-extrabold text-zinc-800 dark:text-zinc-100 truncate">
                {currentAddress ? `${currentAddress.flatNo}, ${currentAddress.area}` : 'Click to select geolocation'}
              </p>
            </div>
          </button>
        </div>
 
        {/* Global toggles */}
        <div className="flex items-center gap-2 relative">
          <button 
            onClick={() => setShowNotifCenter(!showNotifCenter)}
            aria-label="Notifications panel"
            aria-expanded={showNotifCenter}
            aria-haspopup="true"
            className="p-2.5 bg-slate-150 dark:bg-zinc-805 hover:bg-slate-250 dark:hover:bg-zinc-800 rounded-full text-zinc-600 dark:text-orange-500 cursor-pointer active:scale-95 relative"
            title="Notifications"
          >
            <Bell className="w-4.5 h-4.5" />
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="absolute top-0 right-0 bg-orange-600 border border-white dark:border-zinc-900 text-white font-extrabold text-[8px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                {notifications.filter(n => !n.read).length}
              </span>
            )}
          </button>
 
          <button 
            onClick={toggleDarkMode}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            className="p-2.5 bg-slate-150 dark:bg-zinc-800 hover:bg-slate-230/80 rounded-full text-zinc-600 dark:text-amber-400 cursor-pointer active:scale-95"
          >
            {darkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
          </button>
          
          {(user?.phone === '9063692135' || user?.phone === '8328355812' || user?.role === 'Super Admin') && (
            <button
              onClick={() => setCurrentPage('super-admin')}
              aria-label="Access Super Admin Master Control Panel"
              className="text-[10px] bg-red-500 hover:bg-red-600 text-white font-extrabold px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer animate-pulse"
            >
              👑 SUPER
            </button>
          )}

          {showNotifCenter && (
            <div className="absolute right-0 top-12 w-[350px] sm:w-[420px] bg-white dark:bg-zinc-900 rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-2xl z-55 overflow-hidden backdrop-blur-md">
              {/* Header */}
              <div className="p-4 border-b border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-orange-500/10 text-orange-500 rounded-xl">
                    <Bell className="w-4 h-4 animate-swing" />
                  </span>
                  <div>
                    <span className="font-extrabold text-sm text-zinc-800 dark:text-zinc-100 block">Notification Hub</span>
                    <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 block">FCM Cloud Sync Node: Active</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {notifications.length > 0 && (
                    <button 
                      onClick={clearAllNotifications}
                      className="text-[10px] font-bold text-zinc-400 hover:text-red-500 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3 h-3" /> Clear All
                    </button>
                  )}
                  <button 
                    onClick={() => setShowNotifCenter(false)}
                    className="text-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 px-2 py-1.5 rounded-xl font-bold cursor-pointer transition-colors flex items-center justify-center"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Tabs Filter */}
              <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 dark:bg-zinc-900/60 border-b border-slate-100 dark:border-zinc-800 overflow-x-auto scrollbar-none">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'customers', label: 'Customer' },
                  { id: 'riders', label: 'Rider' },
                  { id: 'restaurants', label: 'Kitchen' },
                  { id: 'admin', label: 'Admin' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setNotifTab(tab.id as any)}
                    className={`px-3 py-1 text-[10px] font-extrabold rounded-full whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                      notifTab === tab.id
                        ? 'bg-orange-500 text-white shadow-sm'
                        : 'bg-white dark:bg-zinc-800 text-zinc-500 dark:text-zinc-450 border border-slate-100 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-750'
                    }`}
                  >
                    {tab.label}
                    {notifications.filter(n => (tab.id === 'all' || n.targetAudience === tab.id) && !n.read).length > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              {/* List Container */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-50 dark:divide-zinc-800/50">
                {notificationPermission !== 'granted' && (
                  <div className="p-3 bg-orange-500/5 dark:bg-orange-500/2 border-b border-orange-500/10 flex flex-col gap-1.5">
                    <p className="text-[10px] font-bold text-orange-600 dark:text-orange-400 leading-normal text-center">
                      Enable desktop alerts to get updates while background running!
                    </p>
                    <button 
                      onClick={requestNotificationPermission}
                      className="bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-[10px] font-extrabold px-3 py-1.5 rounded-xl cursor-pointer text-center transition-all"
                    >
                      🔔 Enable Push Alerts
                    </button>
                  </div>
                )}

                {notifications.filter(n => notifTab === 'all' || n.targetAudience === notifTab).length === 0 ? (
                  <div className="py-12 px-4 text-center flex flex-col items-center justify-center">
                    <BellOff className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mb-2 animate-bounce" />
                    <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500">No alerts in {notifTab}</p>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-650 mt-1 leading-relaxed max-w-[80%]">
                      Meal status updates of 'Preparing' or 'Out for Delivery' will broadcast instantly!
                    </p>
                  </div>
                ) : (
                  notifications
                    .filter(n => notifTab === 'all' || n.targetAudience === notifTab)
                    .map(notif => (
                      <div 
                        key={notif.id}
                        className={`p-3 transition-colors flex gap-2 relative justify-between items-start text-left border-b border-slate-50 dark:border-zinc-850/30 ${
                          !notif.read ? 'bg-orange-600/[0.04] dark:bg-orange-600/[0.02]' : 'hover:bg-slate-50 dark:hover:bg-zinc-850/40'
                        }`}
                      >
                        {/* Red Accent Dot */}
                        <div className="flex gap-2.5 flex-1">
                          <div className="mt-1.5 relative shrink-0">
                            {!notif.read ? (
                              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                            ) : (
                              <div className="w-1.5 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full" />
                            )}
                          </div>

                          <div 
                            onClick={() => {
                              markNotificationAsRead(notif.id);
                              if (notif.orderId && notif.orderId !== 'permission_check' && !notif.orderId.includes('broadcast') && !notif.orderId.includes('scheduled')) {
                                setCurrentPage('orders');
                                setShowNotifCenter(false);
                              }
                            }}
                            className="flex-1 cursor-pointer"
                          >
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[11px] font-extrabold text-zinc-800 dark:text-zinc-100 leading-tight">
                                {notif.title}
                              </span>
                              {notif.isPromo && (
                                <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-[7px] font-extrabold px-1.5 py-0.5 rounded-md animate-pulse">
                                  PROMO
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-zinc-550 dark:text-zinc-400 mt-0.5 leading-snug">
                              {notif.body}
                            </p>

                            {/* Optional image banner preview like zomato/swiggy */}
                            {notif.imageUrl && (
                              <div className="mt-2 rounded-lg overflow-hidden border border-slate-100 dark:border-zinc-800 shadow-sm max-w-[180px] max-h-[100px]">
                                <img 
                                  src={notif.imageUrl} 
                                  alt="Campaign Banner" 
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                            )}

                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-[8px] font-mono font-medium text-zinc-400 dark:text-zinc-500">
                                {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                              </span>
                              <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800/80 text-zinc-500 dark:text-zinc-500 uppercase">
                                {notif.targetAudience || 'customer'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right side delete / read controls */}
                        <div className="flex flex-col items-center gap-2 self-center shrink-0">
                          {!notif.read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markNotificationAsRead(notif.id);
                              }}
                              className="text-[9px] font-extrabold text-orange-600 hover:text-orange-700 bg-orange-100 dark:bg-orange-500/10 px-2 py-0.5 rounded-md cursor-pointer transition-colors"
                            >
                              Read
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notif.id);
                            }}
                            className="text-zinc-300 hover:text-red-500 p-1 rounded-md cursor-pointer transition-colors"
                            title="Delete notification"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="p-4 space-y-6 max-w-7xl mx-auto">
        
        {/* Global Search Input Field at the Top of Home Screen */}
        <div className="relative group">
          <label htmlFor="global-search-input" className="sr-only">
            Search restaurants and food items by name
          </label>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500 w-5 h-5 transition-transform group-focus-within:scale-110" />
          <input 
            ref={globalSearchInputRef}
            id="global-search-input"
            name="globalSearch"
            type="text"
            placeholder="Search restaurants and food items by name..."
            value={localSearch}
            aria-label="Search restaurants and food items by name"
            onChange={e => {
              const val = e.target.value;
              setLocalSearch(val);
              if (val.trim() !== '') {
                setSelectedCategory(null);
              } else {
                setSearchTabFilter('all');
              }
            }}
            className={`w-full bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 pl-12 pr-32 py-3.5 rounded-2xl border border-slate-200/90 dark:border-zinc-800 shadow-sm shadow-zinc-200/50 dark:shadow-none focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm font-medium transition-all`}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {/* Quick ⌘K hint badge on desktop */}
            {!localSearch && (
              <span className="hidden md:inline-flex items-center text-[10px] font-mono text-zinc-400 bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-slate-200/60 dark:border-zinc-750 mr-1 select-none">
                ⌘K
              </span>
            )}

            {localSearch && (
              <button 
                type="button"
                onClick={() => {
                  setLocalSearch('');
                  setSearchTabFilter('all');
                  globalSearchInputRef.current?.focus();
                }}
                aria-label="Clear search input"
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg text-xs font-bold cursor-pointer transition flex items-center"
                title="Clear Search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            
            {/* Elegant Voice-to-Text Button */}
            <button
              id="voice-search-button"
              type="button"
              onClick={handleVoiceSearchToggle}
              aria-label={isListening ? "Stop voice input recognition" : "Search using voice input speech"}
              className={`p-2 rounded-xl transition-all duration-300 flex items-center justify-center cursor-pointer ${
                isListening 
                  ? 'bg-red-500 text-white animate-bounce scale-110 shadow-lg shadow-red-500/30' 
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-orange-500/10 hover:text-orange-500'
              }`}
              title="Search using voice"
            >
              {isListening ? (
                <div className="relative flex items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <Mic className="w-4 h-4 z-10" />
                </div>
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Quick inline speech feedback pill */}
          {voiceToast && (
            <div className="absolute left-0 right-0 -bottom-10 mx-auto w-max bg-zinc-900 dark:bg-zinc-800 text-white border border-zinc-700/50 text-xs font-bold px-4 py-2 rounded-full shadow-2xl z-20 flex items-center gap-2 animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isListening ? 'bg-red-400' : 'bg-emerald-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isListening ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
              </span>
              <span>{voiceToast}</span>
            </div>
          )}
        </div>

        {/* Dynamic Meal Tag Category Navigation Bar */}
        <div className="p-3.5 rounded-3xl bg-zinc-50 dark:bg-zinc-950/40 border border-slate-150 dark:border-zinc-900/60 shadow-sm">
          <div className="flex items-center justify-between mb-2 px-1">
            <p className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-orange-500" /> Meal Time Categories
            </p>
            {selectedMealTag !== 'All' && (
              <span className="text-[10px] bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                {selectedMealTag} Filter Active
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
            {[
              { id: 'All', label: 'All Dishes', icon: '🍽️' },
              { id: 'Breakfast', label: 'Breakfast Specials', icon: '🥞' },
              { id: 'Dinner', label: 'Dinner Delights', icon: '🍛' },
              { id: 'Snacks', label: 'Savory Snacks', icon: '🍟' },
              { id: 'Healthy', label: 'Healthy & Light', icon: '🥗' }
            ].map(tagItem => {
              const isSelected = selectedMealTag === tagItem.id;
              return (
                <button
                  key={tagItem.id}
                  onClick={() => handleMealTagSelect(tagItem.id)}
                  disabled={isTagLoading}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed ${
                    isSelected
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20 border border-orange-400'
                      : 'bg-white dark:bg-zinc-900 text-zinc-650 dark:text-zinc-400 border border-slate-150 dark:border-zinc-800 hover:bg-slate-100/50 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  <span>{tagItem.icon}</span>
                  <span>{tagItem.label}</span>
                </button>
              );
            })}
          </div>
          
          {/* Loading Indicator */}
          {isTagLoading && (
            <div className="flex items-center gap-2 mt-2 px-1 text-zinc-400 text-[11px] font-mono font-bold animate-pulse">
              <div className="w-2.5 h-2.5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              <span>Fetching dishes matching {selectedMealTag}...</span>
            </div>
          )}
        </div>

        {/* PROMOTIONAL BANNERS CAROUSEL */}
        {!localSearch && (
          isLoading ? (
            <div className="snap-center w-full h-[180px] sm:h-[196px] bg-slate-200 dark:bg-zinc-800/80 rounded-3xl animate-pulse" />
          ) : (
            <PromotionalCarousel
              setSelectedRestaurant={setSelectedRestaurant}
              setLocalSearch={setLocalSearch}
              setSelectedCategory={setSelectedCategory}
              setCurrentPage={setCurrentPage}
              setHighRated={setHighRated}
              setVoiceToast={setVoiceToast}
            />
          )
        )}

        {/* RECOMMENDED FOR YOU CORNER */}
        {!localSearch && recommendedMeals.length > 0 && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-50 tracking-tight flex items-center gap-2">
                <ThumbsUp className={`w-4.5 h-4.5 ${currentTheme.textClass}`} /> Recommended for You
              </h3>
              <span className="text-zinc-400 text-xs font-bold font-mono">Personalized for you</span>
            </div>
            
            <div className="overflow-x-auto scrollbar-hide flex gap-4 pb-3 snap-x">
              {recommendedMeals.map(({ food, reason }) => {
                const qty = getCartQuantityOfItem(food.id);
                const isFav = favoriteFoods.includes(food.id);
                return (
                  <div 
                    key={`rec-${food.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFoodItem(food);
                    }}
                    className="w-[230px] sm:w-[260px] flex-shrink-0 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-3 flex flex-col justify-between shadow-sm relative snap-center group cursor-pointer hover:shadow-md hover:border-orange-100 dark:hover:border-zinc-700 transition"
                  >
                    {/* Recommendation badge explanation */}
                    <div className="absolute top-3 left-3 z-10 bg-orange-600 text-white font-black text-[8px] px-2.5 py-1 rounded-full uppercase tracking-widest shadow-sm">
                      {reason}
                    </div>

                    {/* Favorite Button */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavoriteFood(food.id);
                      }}
                      className="absolute top-2.5 right-2.5 z-10 p-2 bg-white/90 dark:bg-zinc-800/90 backdrop-blur rounded-full shadow-md text-zinc-650 hover:text-red-500 cursor-pointer"
                    >
                      <Heart className={`w-3 h-3 ${isFav ? 'fill-red-500 text-red-500' : 'text-zinc-500'}`} />
                    </button>

                    {/* Image Area */}
                    <div className="overflow-hidden rounded-2xl relative mb-2.5 aspect-[4/3] bg-slate-50 dark:bg-zinc-800">
                      <LazyImage 
                        src={food.image} 
                        alt={food.name}
                        parentClassName="w-full h-full"
                        className="w-full h-full object-cover group-hover:scale-103 transition-all"
                        referrerPolicy="no-referrer"
                      />
                      
                      {/* Veg indicator badge */}
                      <span className="absolute bottom-2 right-2 shadow-sm bg-white dark:bg-zinc-800 p-1 rounded-lg flex items-center justify-center">
                        {food.vegIndicator === VegIndicator.VEG ? (
                          <span className="veg-icon"><span className="veg-dot" /></span>
                        ) : (
                          <span className="nonveg-icon"><span className="nonveg-dot" /></span>
                        )}
                      </span>
                    </div>

                    {/* Meta info */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest block mb-0.5">
                          {food.category} • {food.subcategory}
                        </span>
                        <h4 className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100 line-clamp-1 group-hover:text-orange-500 transition-colors tracking-tight">
                          {food.name}
                        </h4>
                        
                        <div 
                          onClick={(e) => {
                            e.stopPropagation();
                            const r = getFoodItemRestaurant(food.id);
                            if (r) setSelectedRestaurant(r);
                          }}
                          className="mt-0.5 inline-flex items-center gap-1 text-[9.5px] font-black text-orange-500 dark:text-orange-400 hover:text-orange-600 dark:hover:text-orange-300 hover:underline cursor-pointer tracking-tight"
                          title="Click to view full restaurant details"
                        >
                          <span className="text-[9px]">📍</span>
                          <span>{getFoodItemRestaurant(food.id)?.name || 'Ecosystem Kitchen'}</span>
                        </div>

                        <p className="text-[10px] text-zinc-500 line-clamp-2 mt-1 leading-snug h-8 font-medium">
                          {food.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 mt-2 text-[10px]">
                        <span className="flex items-center gap-0.5 font-bold text-amber-600">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> {food.rating}
                        </span>
                        <span className="text-zinc-300 dark:text-zinc-700">|</span>
                        <span className="text-zinc-500 flex items-center gap-0.5 font-mono">
                          <Clock className="w-3 h-3" /> {food.prepTime}m
                        </span>
                      </div>
                    </div>

                    {/* Pricing with Swiggy style Quantities addition */}
                    <div 
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center justify-between mt-3 border-t border-slate-50 dark:border-zinc-800/80 pt-2"
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-zinc-900 dark:text-zinc-100 font-mono">
                          ₹{food.discountPrice || food.price}
                        </span>
                        {food.discountPrice && (
                          <span className="text-[9px] line-through text-zinc-400 font-mono">
                            ₹{food.price}
                          </span>
                        )}
                      </div>

                      <div>
                        {(() => {
                          const restOfFood = restaurants.find(r => r.id === food.restaurantId);
                          const isRestClosed = restOfFood ? getRestaurantOpenStatus(restOfFood).status !== 'open' : false;
                          
                          if (isRestClosed) {
                            return (
                              <span className="text-[8px] font-black bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 px-2.5 py-1 rounded-lg uppercase tracking-wide">
                                Closed
                              </span>
                            );
                          }
                          
                          return qty > 0 ? (
                            <div className="flex items-center bg-orange-500 text-white px-2 py-1 rounded-xl text-xs font-bold gap-2 shadow-sm">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateCartQuantity(food.id, -1);
                                }} 
                                className="p-0.5 hover:bg-orange-600 rounded cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span>{qty}</span>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateCartQuantity(food.id, 1);
                                }} 
                                className="p-0.5 hover:bg-orange-600 rounded cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                addToCart(food);
                              }}
                              className="bg-white dark:bg-zinc-800 border-2 border-orange-500 text-orange-500 font-black text-[9px] px-3 py-1 rounded-xl uppercase tracking-wider hover:bg-orange-500 hover:text-white transition-all cursor-pointer shadow-md shadow-orange-500/5 active:scale-95 whitespace-nowrap"
                            >
                              Add
                            </button>
                          );
                        })()}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CATEGORIES THUMBNAILS CONTAINER */}
        {!localSearch && (
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-50 tracking-tight flex items-center gap-2">
                <Sparkles className={`w-5 h-5 ${currentTheme.textClass}`} /> What's on your mind?
              </h3>
              <span className="text-zinc-400 text-xs font-bold font-mono">25 Categories</span>
            </div>
            
            <div className="grid grid-cols-5 gap-3">
              {CATEGORIES.slice(0, 10).map(cat => {
                const meta = CATEGORY_DETAILS[cat];
                const isSel = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(isSel ? null : cat)}
                    className="flex flex-col items-center justify-center cursor-pointer focus:outline-none"
                  >
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all shadow-sm ${
                      isSel ? `${currentTheme.bgClass} text-white border-2 border-white/20 animate-pulse` : 'bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800'
                    }`}>
                      {meta?.icon || '🍔'}
                    </div>
                    <span className={`text-[10px] font-extrabold mt-1.5 text-center truncate w-full ${
                      isSel ? currentTheme.textClass : 'text-zinc-700 dark:text-zinc-400'
                    }`}>
                      {cat}
                    </span>
                  </button>
                );
              })}
            </div>
            {selectedCategory && (
              <div className={`mt-3 flex justify-between items-center ${currentTheme.lightBgClass} p-2.5 rounded-xl border border-dashed ${currentTheme.borderClass}/30`}>
                <p className={`text-xs font-bold ${currentTheme.textClass}`}>
                  Filtered Category: <span className="underline font-black">{selectedCategory}</span>
                </p>
                <button 
                  onClick={() => setSelectedCategory(null)}
                  className={`text-xs ${currentTheme.textClass} font-extrabold uppercase tracking-wider bg-white dark:bg-zinc-850 px-2 py-1 rounded-lg border shadow-sm cursor-pointer`}
                >
                  Clear Filter
                </button>
              </div>
            )}
          </div>
        )}

        {/* RESTAURANT SPOTLIGHT BANNERS */}
        {!localSearch && restaurantSpecificBanners.length > 0 && (
          <div className="space-y-3 pt-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 font-mono flex items-center gap-2">
              ⭐ Spotlight Partners
            </h4>
            <div className="overflow-x-auto scrollbar-hide flex gap-4 pb-2 snap-x">
              {restaurantSpecificBanners.map((banner) => (
                <div
                  key={banner.id}
                  onClick={() => handleBannerClick(banner)}
                  className={`snap-center min-w-[260px] sm:min-w-[300px] relative overflow-hidden p-4 rounded-2xl text-white flex flex-col justify-between transition-all active:scale-[0.98] cursor-pointer hover:shadow-lg h-32 ${banner.color || 'bg-gradient-to-r from-rose-500 to-red-500'}`}
                >
                  {banner.image && (
                    <>
                      <LazyImage src={banner.image} alt={banner.title} parentClassName="absolute inset-0 w-full h-full" className="absolute inset-0 w-full h-full object-cover opacity-25 pointer-events-none" />
                      <div className="absolute inset-0 bg-black/45 pointer-events-none" />
                    </>
                  )}
                  <div className="relative z-10">
                    <span className="text-[7.5px] bg-red-500 text-white font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">Spotlight Deal</span>
                    <h5 className="font-extrabold text-sm line-clamp-1 mt-1">{banner.title}</h5>
                    <p className="text-[10.5px] text-white/95 leading-snug line-clamp-2 mt-0.5">{banner.description}</p>
                  </div>
                  <div className="relative z-10 flex items-center justify-between text-[10px] font-bold text-red-100 mt-2">
                    <span>Explore Kitchen Menu ➔</span>
                    <ChevronRight className="w-4 h-4 text-white" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}



        {/* CONDITIONAL LAYOUTS */}
        {localSearch ? (
          <div className="space-y-6 animate-fadeIn">
            {/* Global Search Results Navigation Header */}
            <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-2xl bg-orange-500/10 text-orange-500 shrink-0">
                    <Search className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded-full">
                        Global Search Active
                      </span>
                      <span className="text-xs text-zinc-400 dark:text-zinc-500">
                        {matchingRestaurantsByName.length + matchingFoodItemsByName.length} total matches
                      </span>
                    </div>
                    <p className="text-sm font-black text-zinc-900 dark:text-zinc-100 mt-0.5">
                      Showing results for &ldquo;<span className="text-orange-600 dark:text-orange-400">{localSearch}</span>&rdquo;
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setLocalSearch('');
                    setSearchTabFilter('all');
                    globalSearchInputRef.current?.focus();
                  }}
                  className="self-start sm:self-auto text-xs bg-slate-100 dark:bg-zinc-800 hover:bg-red-50 dark:hover:bg-red-950/30 text-zinc-600 dark:text-zinc-300 hover:text-red-600 dark:hover:text-red-400 px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Clear Search</span>
                </button>
              </div>

              {/* Segmented Filter Controls for Restaurants vs Food Items */}
              <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-zinc-800 overflow-x-auto scrollbar-none">
                <button
                  type="button"
                  onClick={() => setSearchTabFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    searchTabFilter === 'all'
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  <span>All Results</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${searchTabFilter === 'all' ? 'bg-white/20 text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'}`}>
                    {matchingRestaurantsByName.length + matchingFoodItemsByName.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSearchTabFilter('restaurants')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    searchTabFilter === 'restaurants'
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Restaurants</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${searchTabFilter === 'restaurants' ? 'bg-white/20 text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'}`}>
                    {matchingRestaurantsByName.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSearchTabFilter('items')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    searchTabFilter === 'items'
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  <UtensilsCrossed className="w-3.5 h-3.5" />
                  <span>Food Items</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${searchTabFilter === 'items' ? 'bg-white/20 text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'}`}>
                    {matchingFoodItemsByName.length}
                  </span>
                </button>
              </div>
            </div>

            {/* Results Display */}
            {matchingRestaurantsByName.length === 0 && matchingFoodItemsByName.length === 0 ? (
              <div className="text-center py-14 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-6 flex flex-col items-center justify-center space-y-3">
                <div className="p-3.5 bg-orange-500/10 text-orange-500 rounded-2xl">
                  <Search className="w-8 h-8" />
                </div>
                <h4 className="text-base font-black text-zinc-800 dark:text-zinc-100">
                  No restaurants or food items found
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md">
                  We couldn&apos;t find any restaurant or food item matching &ldquo;{localSearch}&rdquo;. Try another name or click one of the popular options below:
                </p>
                <div className="flex flex-wrap gap-2 justify-center pt-2">
                  {['Biryani', 'Pizza', 'Burger', 'Dosa', 'Mandi', 'Coffee', 'Paradise', 'Bakery'].map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => {
                        setLocalSearch(suggestion);
                        setSearchTabFilter('all');
                      }}
                      className="px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-orange-500 hover:text-white dark:hover:bg-orange-500 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {(searchTabFilter === 'all' || searchTabFilter === 'items') && matchingFoodItemsByName.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-black text-zinc-900 dark:text-zinc-50 tracking-tight flex items-center gap-2">
                        <UtensilsCrossed className="w-4 h-4 text-orange-500" />
                        <span>Food Items matching &ldquo;{localSearch}&rdquo;</span>
                        <span className="text-xs font-mono text-zinc-400">({matchingFoodItemsByName.length})</span>
                      </h3>
                    </div>
                    {foodCatalogSectionJSX}
                  </div>
                )}

                {(searchTabFilter === 'all' || searchTabFilter === 'restaurants') && matchingRestaurantsByName.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-black text-zinc-900 dark:text-zinc-50 tracking-tight flex items-center gap-2">
                        <Store className="w-4 h-4 text-orange-500" />
                        <span>Restaurants matching &ldquo;{localSearch}&rdquo;</span>
                        <span className="text-xs font-mono text-zinc-400">({matchingRestaurantsByName.length})</span>
                      </h3>
                    </div>
                    {restaurantsSectionJSX}
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <>
            {restaurantsSectionJSX}
            {foodCatalogSectionJSX}
          </>
        )}

      </div>

      {/* RESTAURANT DETAILS EXPANDABLE CARD / MODAL */}
      {selectedRestaurant && (
        <div 
          onClick={() => setSelectedRestaurant(null)}
          className="fixed inset-0 bg-zinc-950/75 backdrop-blur-md z-70 flex items-center justify-center p-4 animate-fadeIn"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-zinc-900/95 backdrop-blur w-full max-w-md rounded-3xl border border-slate-100 dark:border-zinc-800/80 overflow-hidden shadow-2xl flex flex-col relative max-h-[85vh] animate-scaleUp"
          >
            {/* Top cover image */}
            <div className="relative h-44 bg-zinc-100 dark:bg-zinc-800">
              <img 
                src={selectedRestaurant.image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=400"} 
                alt={selectedRestaurant.name} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              {/* Subtle overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              
              {/* Close button */}
              <button 
                onClick={() => setSelectedRestaurant(null)}
                className="absolute top-3.5 right-3.5 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full transition cursor-pointer backdrop-blur-xs"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Floating Category/Tag overlay */}
              {selectedRestaurant.businessType && (
                <span className="absolute top-3.5 left-3.5 bg-orange-500 text-white font-extrabold text-[9px] px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {selectedRestaurant.businessType}
                </span>
              )}

              {/* Title overlay inside cover */}
              <div className="absolute bottom-4 left-4 right-4 text-left">
                <h2 className="text-xl font-black text-white leading-tight tracking-tight drop-shadow-sm">
                  {selectedRestaurant.name}
                </h2>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedRestaurant.cuisines?.map((c: string, i: number) => (
                    <span key={i} className="text-[9px] bg-white/20 backdrop-blur-xs text-white font-bold px-1.5 py-0.5 rounded">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Tabs Header inside Modal */}
            <div className="flex border-b border-zinc-100 dark:border-zinc-800 text-xs font-black uppercase tracking-wider bg-slate-50 dark:bg-zinc-850/40 relative z-10 select-none">
              <button 
                onClick={() => setModalTab('overview')}
                className={`flex-1 py-3.5 text-center border-b-2 transition-all cursor-pointer ${
                  modalTab === 'overview' 
                    ? 'border-orange-500 text-orange-600 dark:text-orange-400 font-extrabold' 
                    : 'border-transparent text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                }`}
              >
                Overview & Deals
              </button>
              <button 
                onClick={() => setModalTab('reviews')}
                className={`flex-1 py-3.5 text-center border-b-2 transition-all cursor-pointer ${
                  modalTab === 'reviews' 
                    ? 'border-orange-500 text-orange-600 dark:text-orange-400 font-extrabold' 
                    : 'border-transparent text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                }`}
              >
                Reviews & Ratings ({restaurantReviews.filter(r => r.restaurantId === selectedRestaurant.id && !r.hidden).length})
              </button>
            </div>

            {/* Detail panel lists */}
            <div className="p-5 overflow-y-auto space-y-4 text-left scrollbar-hide flex-1">
              
              {/* Force Closed Or Operating Status Warning */}
              {(() => {
                const statusObj = getRestaurantOpenStatus(selectedRestaurant);
                if (statusObj.status !== 'open') {
                  return (
                    <div className="p-3.5 bg-rose-500/10 border border-rose-500/25 rounded-2xl text-rose-600 dark:text-rose-400 text-xs flex gap-2.5 items-start">
                      <span className="text-base leading-none">⚠️</span>
                      <div className="flex-1">
                        <strong className="block font-black uppercase tracking-wide text-rose-700 dark:text-rose-350">{statusObj.label} Currently</strong>
                        <p className="text-[11px] mt-0.5 leading-relaxed">{statusObj.message}</p>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-600 dark:text-emerald-400 text-xs flex gap-2.5 items-center">
                      <span className="text-base leading-none">🟢</span>
                      <div>
                        <strong className="font-extrabold">Open & Operating Normally</strong>
                        <span className="text-[11px] block text-zinc-400 dark:text-zinc-500">Fast home delivery is currently active.</span>
                      </div>
                    </div>
                  );
                }
              })()}

              {modalTab === 'overview' ? (
                <>
                  {/* Key stats row */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-zinc-850 p-3 rounded-2xl border border-slate-100 dark:border-zinc-800/60">
                    <div className="flex flex-col items-center text-center">
                      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest leading-none mb-1">Rating</span>
                      <div className="flex items-center gap-0.5 text-amber-500 font-extrabold text-xs">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 animate-pulse" />
                        <span>{selectedRestaurant.rating || 4.5}</span>
                      </div>
                      <span className="text-[8px] text-zinc-400 mt-0.5">({selectedRestaurant.reviewsCount || 45} ratings)</span>
                    </div>

                    <div className="flex flex-col items-center text-center border-x border-slate-150 dark:border-zinc-700/60">
                      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest leading-none mb-1">Delivery</span>
                      <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400 font-extrabold text-xs">
                        <Clock className="w-3.5 h-3.5 animate-bounce" />
                        <span>{selectedRestaurant.deliveryTime || 30} mins</span>
                      </div>
                      <span className="text-[8px] text-zinc-400 mt-0.5">Distance: {selectedRestaurant.distance || 1.8} km</span>
                    </div>

                    <div className="flex flex-col items-center text-center">
                      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest leading-none mb-1">Cost for 2</span>
                      <div className="text-zinc-800 dark:text-zinc-150 font-black text-xs">
                        ₹{selectedRestaurant.costForTwo || 400}
                      </div>
                      <span className="text-[8px] text-zinc-400 mt-0.5">Budget-friendly</span>
                    </div>
                  </div>

                  {/* Offers & Promotional deals */}
                  {selectedRestaurant.offers && selectedRestaurant.offers.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-bold font-mono tracking-widest text-zinc-400 uppercase">Active Offers For You</h4>
                      <div className="space-y-1.5">
                        {selectedRestaurant.offers.map((offer: string, idx: number) => (
                          <div 
                            key={idx}
                            className="flex items-center gap-2.5 bg-orange-500/5 dark:bg-orange-950/20 border border-dashed border-orange-500/30 p-2.5 rounded-xl text-left"
                          >
                            <span className="text-sm">🏷️</span>
                            <div className="min-w-0 flex-1">
                              <p className="text-[10.5px] font-black text-orange-600 dark:text-orange-400 uppercase leading-tight font-sans">
                                {offer}
                              </p>
                              <p className="text-[8.5px] text-zinc-400 mt-0.5 leading-none">Auto-applied discount at final cart checkouts</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Smart Delivery Estimator with real-time GPS traffic & weather modeling */}
                  <SmartDeliveryEstimator 
                    restaurant={selectedRestaurant} 
                    currentAddress={currentAddress} 
                  />

                  {/* Extras detail row */}
                  <div className="space-y-2 bg-slate-50/50 dark:bg-zinc-850/40 p-3 rounded-2xl border border-slate-100 dark:border-zinc-800/40 text-xs text-zinc-600 dark:text-zinc-300">
                    <div className="flex justify-between items-center py-1 border-b border-dashed border-slate-200 dark:border-zinc-800">
                      <span className="font-medium">Onboarding Status</span>
                      <span className="font-extrabold text-[10px] text-emerald-500 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Approved Vendor
                      </span>
                    </div>
                    <div className="pt-2 flex flex-col gap-2">
                      <div className="flex justify-between items-center py-1">
                        <span className="font-medium">Direct Hotline / Booking</span>
                        <a 
                          href="tel:+919063692135" 
                          className="font-mono font-extrabold text-[10px] text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
                        >
                          +91 90636 92135
                        </a>
                      </div>

                      {/* Instant WhatsApp Food Booking Button */}
                      <button
                        type="button"
                        onClick={() => clickToWhatsAppFoodBooking({
                          restaurantName: selectedRestaurant.name,
                          customNote: `Hi! I would like to make a food booking / table reservation / takeaway order for ${selectedRestaurant.name}.`
                        })}
                        className="w-full py-2.5 px-3 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs rounded-xl shadow-sm flex items-center justify-center gap-2 cursor-pointer transition active:scale-95"
                      >
                        <span className="text-sm">💬</span>
                        <span>WhatsApp Food Booking (9063692135)</span>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  {/* Rating Breakdown Dashboard Header */}
                  {(() => {
                    const allR = restaurantReviews.filter(r => r.restaurantId === selectedRestaurant.id && !r.hidden);
                    const avgRating = allR.length > 0 
                      ? (allR.reduce((sum, r) => sum + r.restaurantRating, 0) / allR.length).toFixed(1) 
                      : selectedRestaurant.rating?.toFixed(1) || '4.5';
                    
                    const starCounts = [5, 4, 3, 2, 1].map(star => {
                      const c = allR.filter(r => r.restaurantRating === star).length;
                      const pct = allR.length > 0 ? (c / allR.length) * 100 : 0;
                      return { star, count: c, pct };
                    });

                    return (
                      <div className="bg-slate-50 dark:bg-zinc-850 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800">
                        <div className="flex items-center justify-between mb-3.5 pb-3 border-b border-slate-200 dark:border-zinc-800">
                          <div>
                            <span className="text-3xl font-black text-zinc-900 dark:text-zinc-100 block font-sans">
                              {avgRating} <span className="text-sm font-bold text-zinc-400">/ 5.0</span>
                            </span>
                            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                              Overall Satisfaction Rating
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-black text-zinc-800 dark:text-zinc-200 block">
                              {allR.length} verified reviews
                            </span>
                            <span className="text-[9px] text-emerald-500 font-bold">100% genuine order feedback</span>
                          </div>
                        </div>

                        {/* Star progression meters */}
                        <div className="space-y-1.5">
                          {starCounts.map(bar => (
                            <div key={bar.star} className="flex items-center gap-2.5 text-[10px]">
                              <span className="w-10 text-zinc-400 font-bold text-right flex items-center justify-end gap-0.5">
                                {bar.star} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              </span>
                              <div className="flex-1 h-2 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full" 
                                  style={{ width: `${bar.pct || (bar.star === 5 ? 70 : bar.star === 4 ? 20 : 5)}%` }}
                                />
                              </div>
                              <span className="w-8 text-zinc-500 text-right font-medium font-mono">
                                {bar.count || (bar.star === 5 ? '70%' : bar.star === 4 ? '20%' : '5%')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Review Filters Header */}
                  <div>
                    <h5 className="text-[10px] font-bold font-mono tracking-widest text-zinc-400 uppercase mb-2">Filter Reviews By Score</h5>
                    <div className="flex flex-wrap gap-1.5">
                      {['all', 5, 4, 3, 2, 1].map((st) => (
                        <button
                          key={st}
                          onClick={() => setReviewStarFilter(st as any)}
                          className={`text-[10px] font-extrabold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                            reviewStarFilter === st 
                              ? 'bg-zinc-900 border-zinc-900 dark:bg-zinc-100 dark:border-zinc-100 text-white dark:text-zinc-950 font-black shadow-xs' 
                              : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-slate-300'
                          }`}
                        >
                          {st === 'all' ? 'All Reviews' : `${st} ★`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Filtered reviews list */}
                  <div className="space-y-3 pt-1">
                    {(() => {
                      const allR = restaurantReviews.filter(rev => {
                        if (rev.restaurantId !== selectedRestaurant.id) return false;
                        if (rev.hidden) return false;
                        if (reviewStarFilter !== 'all' && rev.restaurantRating !== reviewStarFilter) return false;
                        return true;
                      });

                      if (allR.length === 0) {
                        return (
                          <div className="p-8 text-center border-2 border-dashed border-slate-100 dark:border-zinc-800 rounded-3xl">
                            <p className="text-xs text-zinc-400 font-bold">No verified reviews found matching {reviewStarFilter === 'all' ? 'this kitchen' : `${reviewStarFilter}-star score`}.</p>
                            <p className="text-[10px] text-zinc-500 mt-1 max-w-xs mx-auto">Be the first to leave an order-level review response upon delivery!</p>
                          </div>
                        );
                      }

                      return allR.map((rev) => {
                        const isTopReview = rev.restaurantRating === 5 && rev.comment.length > 50;
                        return (
                          <div 
                            key={rev.id} 
                            className={`p-3.5 rounded-2xl border text-xs transition-colors duration-300 relative ${
                              isTopReview 
                                ? 'bg-amber-500/5 dark:bg-amber-950/10 border-amber-500/30 dark:border-amber-900/30' 
                                : 'bg-white dark:bg-zinc-900/70 border-slate-100 dark:border-zinc-800/80'
                            }`}
                          >
                            {isTopReview && (
                              <span className="absolute top-3.5 right-3.5 bg-amber-500 text-zinc-950 font-black text-[8px] px-1.5 py-0.5 rounded uppercase tracking-wider font-mono">
                                🔥 Top Review
                              </span>
                            )}
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-zinc-700 dark:text-zinc-400 text-[10px] border border-slate-200 dark:border-zinc-700">
                                {rev.customerName?.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <span className="font-extrabold text-zinc-900 dark:text-zinc-150 block leading-tight">{rev.customerName}</span>
                                <span className="text-[8.5px] text-zinc-400 font-mono block leading-none">
                                  Rating: {new Date(rev.date).toLocaleDateString()}
                                </span>
                              </div>
                            </div>

                            {/* Ratings chips row */}
                            <div className="flex flex-wrap gap-1.5 mb-2.5">
                              <span className="bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold text-[9px] px-2 py-0.5 rounded-md">
                                Food: {rev.foodRating || 5} ★
                              </span>
                              <span className="bg-emerald-500/10 text-emerald-650 dark:text-emerald-400 font-bold text-[9px] px-2 py-0.5 rounded-md">
                                Kitchen: {rev.restaurantRating || 5} ★
                              </span>
                              <span className="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold text-[9px] px-2 py-0.5 rounded-md">
                                Rider: {rev.deliveryRating || 5} ★
                              </span>
                            </div>

                            {/* Comment */}
                            <p className="text-[11.5px] leading-relaxed text-zinc-700 dark:text-zinc-350 bg-slate-50 dark:bg-zinc-850/50 p-2.5 rounded-xl border border-dashed border-slate-200/50 dark:border-zinc-800">
                              {rev.comment || 'Perfect, high certified hygiene quality and flavor preservation standard! Highly recommended.'}
                            </p>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}
              </div>

            <div className="p-4 bg-slate-50 dark:bg-zinc-900/45 border-t border-slate-100 dark:border-zinc-800/80 flex justify-end">
              <button 
                onClick={() => setSelectedRestaurant(null)}
                className="bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-black px-6 py-2 rounded-xl uppercase tracking-wider cursor-pointer shadow-md shadow-orange-500/10 active:scale-95 transition"
              >
                Go Back to Feed
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Address selection modal */}
      <AddressSelectorModal 
        isOpen={showAddressModal} 
        onClose={() => setShowAddressModal(false)} 
      />

    </div>
  );
}
