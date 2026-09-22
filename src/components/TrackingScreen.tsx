/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle, Bike, MapPin, Phone, HelpCircle, AlertTriangle, 
  ChevronRight, ChevronLeft, Compass, Navigation, Clock, ShieldCheck,
  MessageSquare, Send, X, Store, ArrowLeft, ThumbsUp, Share2,
  Star, Smile, Activity, Wifi, Battery, Cpu, Terminal, Radio, RefreshCw
} from 'lucide-react';
import { OrderStatus } from '../types';
import { APIProvider, Map, AdvancedMarker, Pin, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';

// Stable GPS Seed coordinates for Chirala area (Center: 15.8246, 80.3533)
const CHIRALA_CENTER = { lat: 15.8246, lng: 80.3533 };

const getApiKey = () => {
  try {
    if (typeof process !== 'undefined' && process.env) {
      return process.env.GOOGLE_MAPS_PLATFORM_KEY || '';
    }
  } catch (e) {}
  try {
    return (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY || '';
  } catch (e) {}
  try {
    return (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY || '';
  } catch (e) {}
  return '';
};

const API_KEY = getApiKey();
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

function getSeedCoordinates(id: string, indexOffset: number = 0) {
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + indexOffset;
  const latDisp = ((hash % 37) - 18.5) * 0.0006; // ~1-2km spread
  const lngDisp = ((hash % 43) - 21.5) * 0.0006;
  return {
    lat: CHIRALA_CENTER.lat + latDisp,
    lng: CHIRALA_CENTER.lng + lngDisp,
  };
}

function LiveRouteTracker({
  restaurantCoords,
  destinationCoords,
  progress,
  restaurantName,
  riderName
}: {
  restaurantCoords: { lat: number; lng: number };
  destinationCoords: { lat: number; lng: number };
  progress: number;
  restaurantName: string;
  riderName: string;
}) {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const polylinesRef = useRef<google.maps.Polyline[]>([]);
  const [partnerCoords, setPartnerCoords] = useState<{ lat: number; lng: number }>(restaurantCoords);
  const [routePath, setRoutePath] = useState<google.maps.LatLngLiteral[]>([]);

  useEffect(() => {
    if (!routesLib || !map) return;

    // Clear previous polylines
    polylinesRef.current.forEach(p => p.setMap(null));
    polylinesRef.current = [];

    const request = {
      origin: restaurantCoords,
      destination: destinationCoords,
      travelMode: 'DRIVING' as const,
      fields: ['path', 'distanceMeters', 'durationMillis', 'viewport'],
    };

    routesLib.Route.computeRoutes(request)
      .then(({ routes }) => {
        if (routes && routes[0]) {
          const route = routes[0];
          // Draw polylines on map
          const newPolylines = route.createPolylines();
          newPolylines.forEach(p => {
            p.setOptions({
              strokeColor: '#f97316', // Warm Nuvvo orange
              strokeOpacity: 0.8,
              strokeWeight: 5,
            });
            p.setMap(map);
          });
          polylinesRef.current = newPolylines;

          // Approx polyline coordinates
          const pathCoords: google.maps.LatLngLiteral[] = [];
          if (route.path) {
            route.path.forEach(latLng => {
              const anyLatLng = latLng as any;
              const latVal = typeof anyLatLng.lat === 'function' ? anyLatLng.lat() : anyLatLng.lat;
              const lngVal = typeof anyLatLng.lng === 'function' ? anyLatLng.lng() : anyLatLng.lng;
              pathCoords.push({ lat: Number(latVal), lng: Number(lngVal) });
            });
          }
          setRoutePath(pathCoords);

          // Zoom map to cover both points
          if (route.viewport) {
            map.fitBounds(route.viewport);
          }
        }
      })
      .catch((err) => {
        console.error('Tracking Route compute failed:', err);
      });

    return () => {
      polylinesRef.current.forEach(p => p.setMap(null));
    };
  }, [routesLib, map, restaurantCoords, destinationCoords]);

  // Interpolate partner location along computed route path
  useEffect(() => {
    if (routePath.length === 0) {
      // Linear interpolation fallback if routes are loading or failed
      const lat = restaurantCoords.lat + (destinationCoords.lat - restaurantCoords.lat) * (progress / 100);
      const lng = restaurantCoords.lng + (destinationCoords.lng - restaurantCoords.lng) * (progress / 100);
      setPartnerCoords({ lat, lng });
      return;
    }

    // Find coordinate on route corresponding to the progress percentage
    const index = Math.min(
      routePath.length - 1,
      Math.max(0, Math.floor((progress / 100) * (routePath.length - 1)))
    );
    if (routePath[index]) {
      setPartnerCoords(routePath[index]);
    }
  }, [progress, routePath, restaurantCoords, destinationCoords]);

  return (
    <>
      {/* Restaurant origin pin */}
      <AdvancedMarker position={restaurantCoords} title={restaurantName}>
        <Pin background="#3b82f6" glyphColor="#fff" scale={0.95} />
      </AdvancedMarker>

      {/* Customer drop area pin */}
      <AdvancedMarker position={destinationCoords} title="Your Delivery Address">
        <Pin background="#10b981" glyphColor="#fff" scale={0.95} />
      </AdvancedMarker>

      {/* Delivery Partner's Moving Pin */}
      <AdvancedMarker position={partnerCoords} title={riderName}>
        <div className="relative flex items-center justify-center" style={{ width: '40px', height: '40px' }}>
          {/* Animated ping effect */}
          <span className="absolute inline-flex h-10 w-10 rounded-full bg-orange-500/30 animate-ping" />
          <div className="relative w-8 h-8 rounded-full bg-orange-500 border-2 border-white flex items-center justify-center shadow-lg text-white text-base">
            🛵
          </div>
        </div>
      </AdvancedMarker>
    </>
  );
}

export default function TrackingScreen() {
  const { 
    activeTrackingOrder, deliveryRouteProgress, 
    clickToWhatsAppSupport, changeOrderStatus, setCurrentPage,
    restaurants, submitRestaurantReview, user,
    pageHistory, goBack, closePage,
    notificationPermission, requestNotificationPermission
  } = useApp();

  const restaurantId = activeTrackingOrder?.items[0]?.foodItem?.restaurantId || 'rest_1';
  const restaurantName = restaurants.find(r => r.id === restaurantId)?.name || 'Nuvvo Kitchens';
  const restaurantCoords = getSeedCoordinates(restaurantId, 10);
  const rawDestinationCoords = activeTrackingOrder?.address?.gpsCoordinates || getSeedCoordinates(activeTrackingOrder?.address?.id || 'default_cust', 25);
  // Auto-snap destination if they are way too far apart (e.g. Hyderabad vs Chirala)
  const destinationCoords = Math.abs(rawDestinationCoords.lat - restaurantCoords.lat) > 0.5
    ? getSeedCoordinates(activeTrackingOrder?.address?.id || 'default_cust', 25)
    : rawDestinationCoords;

  const [simulatedDistance, setSimulatedDistance] = useState(2.8); // in km
  const [etaRemaining, setEtaRemaining] = useState(24); // in minutes
  const [timeLeftMs, setTimeLeftMs] = useState<number>(0);

  // Real-time WebSocket Polling & Telemetry States
  const [isPolling, setIsPolling] = useState(true);
  const [telemetryLogs, setTelemetryLogs] = useState<{ id: string; timestamp: string; message: string; type: 'info' | 'rx' | 'warn' }[]>([]);
  const [currentSpeed, setCurrentSpeed] = useState(38);
  const [batteryLevel, setBatteryLevel] = useState(89);
  const [gpsAccuracy, setGpsAccuracy] = useState(4.2);
  const [satelliteCount, setSatelliteCount] = useState(11);
  const [jitterCoords, setJitterCoords] = useState<{ lat: number; lng: number }>(restaurantCoords);

  // Initialize initial WebSocket logs
  useEffect(() => {
    if (!activeTrackingOrder) return;
    setTelemetryLogs([
      {
        id: 'init_conn',
        timestamp: new Date().toLocaleTimeString(),
        message: `Establishing secure WS connection to wss://gateway.nuvvo.in/tracking/live...`,
        type: 'info'
      },
      {
        id: 'init_auth',
        timestamp: new Date().toLocaleTimeString(),
        message: `Authorized token for Order ID ${activeTrackingOrder.id.slice(-6).toUpperCase()}`,
        type: 'info'
      },
      {
        id: 'init_sub',
        timestamp: new Date().toLocaleTimeString(),
        message: `Subscribed to channel: rider_coordinates_shravan`,
        type: 'info'
      }
    ]);
  }, [activeTrackingOrder?.id]);

  // Periodic simulated polling for WS frame receipt
  useEffect(() => {
    if (!activeTrackingOrder || !isPolling) return;

    // Run first coordinate snap
    const baseLat = restaurantCoords.lat + (destinationCoords.lat - restaurantCoords.lat) * (deliveryRouteProgress / 100);
    const baseLng = restaurantCoords.lng + (destinationCoords.lng - restaurantCoords.lng) * (deliveryRouteProgress / 100);
    setJitterCoords({ lat: parseFloat(baseLat.toFixed(6)), lng: parseFloat(baseLng.toFixed(6)) });

    const interval = setInterval(() => {
      // 1. Calculate base coordinate
      const currentProgressLat = restaurantCoords.lat + (destinationCoords.lat - restaurantCoords.lat) * (deliveryRouteProgress / 100);
      const currentProgressLng = restaurantCoords.lng + (destinationCoords.lng - restaurantCoords.lng) * (deliveryRouteProgress / 100);

      // 2. Add realistic GPS jitter
      const latJitter = (Math.random() - 0.5) * 0.00015;
      const lngJitter = (Math.random() - 0.5) * 0.00015;
      const finalLat = parseFloat((currentProgressLat + latJitter).toFixed(6));
      const finalLng = parseFloat((currentProgressLng + lngJitter).toFixed(6));
      setJitterCoords({ lat: finalLat, lng: finalLng });

      // 3. Fluctuating statistics
      const nextSpeed = Math.floor(32 + Math.random() * 14); // 32 to 45 km/h
      const nextAccuracy = parseFloat((3.0 + Math.random() * 3.5).toFixed(1)); // 3.0 to 6.5 meters
      const nextSatellites = Math.floor(10 + Math.random() * 4); // 10 to 13
      setCurrentSpeed(nextSpeed);
      setGpsAccuracy(nextAccuracy);
      setSatelliteCount(nextSatellites);
      setBatteryLevel(prev => Math.max(10, prev - (Math.random() < 0.1 ? 1 : 0))); // occasionally drop battery by 1%

      // 4. Build telemetry log message
      const frameData = {
        lat: finalLat,
        lng: finalLng,
        speed: `${nextSpeed}km/h`,
        satellites: nextSatellites,
        accuracy: `${nextAccuracy}m`,
        progress: `${deliveryRouteProgress}%`
      };

      setTelemetryLogs(prev => [
        {
          id: `log_${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          message: `Frame Rx: ${JSON.stringify(frameData)}`,
          type: 'rx'
        },
        ...prev.slice(0, 24) // Keep last 25 logs
      ]);

    }, 2000); // Polling every 2 seconds

    return () => clearInterval(interval);
  }, [isPolling, deliveryRouteProgress, restaurantCoords, destinationCoords, activeTrackingOrder]);
  
  // Post-order feedback states - Rate Food, Rate Restaurant, Rate Delivery Partner
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [mealRating, setMealRating] = useState(0);
  const [restaurantRating, setRestaurantRating] = useState(0);
  const [deliveryRating, setDeliveryRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [isFeedbackSubmitted, setIsFeedbackSubmitted] = useState(false);
  const [hoverMealRating, setHoverMealRating] = useState(0);
  const [hoverRestaurantRating, setHoverRestaurantRating] = useState(0);
  const [hoverDeliveryRating, setHoverDeliveryRating] = useState(0);

  useEffect(() => {
    if (activeTrackingOrder?.status === 'delivered') {
      const feedbackKey = `nuvvo_feedback_${activeTrackingOrder.id}`;
      if (!localStorage.getItem(feedbackKey)) {
        const timer = setTimeout(() => {
          setShowFeedbackModal(true);
        }, 800);
        return () => clearTimeout(timer);
      }
    }
  }, [activeTrackingOrder?.status, activeTrackingOrder?.id]);

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mealRating === 0 || restaurantRating === 0 || deliveryRating === 0) return;

    const restId = activeTrackingOrder?.items[0]?.foodItem?.restaurantId || 'rest_1';

    submitRestaurantReview({
      orderId: activeTrackingOrder?.id || `ord_${Date.now()}`,
      customerId: user?.id || 'anon',
      customerName: user?.name || 'Anonymous Customer',
      restaurantId: restId,
      foodRating: mealRating,
      restaurantRating: restaurantRating,
      deliveryRating: deliveryRating,
      comment: feedbackComment,
    });

    localStorage.setItem(`nuvvo_feedback_${activeTrackingOrder?.id}`, 'submitted');
    setIsFeedbackSubmitted(true);
  };
  
  // Share Action Toast States
  const [shareCopied, setShareCopied] = useState(false);
  const [shareError, setShareError] = useState(false);

  const handleShareTrackingLink = async () => {
    const trackingUrl = `${window.location.origin}${window.location.pathname}?orderId=${activeTrackingOrder?.id}&track=true`;
    
    const shareData = {
      title: `🍔 Track my Nuvvo Feast Live!`,
      text: `My order "${activeTrackingOrder?.id.split('_')[1] || activeTrackingOrder?.id}" from Nuvvo is on its way! Track my live delivery route in real-time here:`,
      url: trackingUrl
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(trackingUrl);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 3000);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error("Web Share API failed, using clipboard fallback:", err);
        try {
          await navigator.clipboard.writeText(trackingUrl);
          setShareCopied(true);
          setTimeout(() => setShareCopied(false), 3000);
        } catch (clipErr) {
          console.error("Clipboard copy failed as well:", clipErr);
          setShareError(true);
          setTimeout(() => setShareError(false), 3000);
        }
      }
    }
  };

  // Chat Support Interface State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'driver' | 'restaurant'>('driver');
  const [inputText, setInputText] = useState('');
  
  const [driverMessages, setDriverMessages] = useState<{ id: string; sender: 'user' | 'partner'; text: string; timestamp: string }[]>(() => {
    if (!activeTrackingOrder) return [];
    const key = `nuvvo_chat_driver_${activeTrackingOrder.id}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse driver messages:', e);
      }
    }
    return [
      {
        id: 'driver_init',
        sender: 'partner',
        text: "Hi there, this is Suresh, your delivery executive. I'm prep-riding my vehicle near Chirala road and heading to the kitchen coordinate. Feel free to text me with gate codes or other drop instructions! 🛵",
        timestamp: new Date(new Date(activeTrackingOrder.date).getTime() + 10000).toISOString()
      }
    ];
  });

  const [restaurantMessages, setRestaurantMessages] = useState<{ id: string; sender: 'user' | 'partner'; text: string; timestamp: string }[]>(() => {
    if (!activeTrackingOrder) return [];
    const key = `nuvvo_chat_restaurant_${activeTrackingOrder.id}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse restaurant messages:', e);
      }
    }
    return [
      {
        id: 'restaurant_init',
        sender: 'partner',
        text: `Chef team here! We've received your ticket and are currently hot-boxing your fresh culinary package. Let us know if you have any special instructions like spice adjustment or cutlery packing! 🍳`,
        timestamp: new Date(new Date(activeTrackingOrder.date).getTime() + 2000).toISOString()
      }
    ];
  });

  const [isDriverTyping, setIsDriverTyping] = useState(false);
  const [isRestaurantTyping, setIsRestaurantTyping] = useState(false);
  const [unreadDriverCount, setUnreadDriverCount] = useState(0);
  const [unreadRestaurantCount, setUnreadRestaurantCount] = useState(1); // Start with welcome indicator

  const messageEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom helper
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [driverMessages, restaurantMessages, isDriverTyping, isRestaurantTyping, activeTab, isChatOpen]);

  // Persist messages to LocalStorage
  useEffect(() => {
    if (!activeTrackingOrder) return;
    localStorage.setItem(`nuvvo_chat_driver_${activeTrackingOrder.id}`, JSON.stringify(driverMessages));
  }, [driverMessages, activeTrackingOrder]);

  useEffect(() => {
    if (!activeTrackingOrder) return;
    localStorage.setItem(`nuvvo_chat_restaurant_${activeTrackingOrder.id}`, JSON.stringify(restaurantMessages));
  }, [restaurantMessages, activeTrackingOrder]);

  // Clear unreads on tab dynamic shift
  useEffect(() => {
    if (isChatOpen) {
      if (activeTab === 'driver') {
        setUnreadDriverCount(0);
      } else {
        setUnreadRestaurantCount(0);
      }
    }
  }, [isChatOpen, activeTab]);

  // Automated intelligent replying router
  const handleSendMessage = (textOverride?: string) => {
    const rawMsg = textOverride || inputText;
    if (!rawMsg.trim()) return;

    const userMessage = {
      id: `msg_${Date.now()}`,
      sender: 'user' as const,
      text: rawMsg,
      timestamp: new Date().toISOString()
    };

    if (activeTab === 'driver') {
      setDriverMessages(prev => [...prev, userMessage]);
      setInputText('');
      setIsDriverTyping(true);

      setTimeout(() => {
        setIsDriverTyping(false);
        let replyText = "Understood perfectly! I have registered your message and will adhere strictly to it during navigation. Riding safely near the corridors!";
        const low = rawMsg.toLowerCase();
        
        if (low.includes('where') || low.includes('status') || low.includes('far') || low.includes('location') || low.includes('map')) {
          replyText = `I am currently crossing the Chirala bypass bypass speedways. The live tracking radar shows about ${simulatedDistance} km remaining! I will make sure the food package stays ultra-piping hot inside our thermal secure carrier box. 🏍️`;
        } else if (low.includes('spoon') || low.includes('fork') || low.includes('cutlery') || low.includes('tissue') || low.includes('napkin')) {
          replyText = "Rest assured! I am checking with the hotel kitchen dispatcher to verify they added heavy-duty wooden cutleries and multiple hygiene tissues before sealing up the outer packet. 🍴";
        } else if (low.includes('call') || low.includes('phone') || low.includes('dial') || low.includes('reach') || low.includes('arrive')) {
          replyText = "Absolutely! As soon as my motorcycle rolls up near your street coordinate or apartment lobby, I will stop and dial your phone number instantly so you can receive the hot bag! 📞";
        } else if (low.includes('gate') || low.includes('code') || low.includes('security') || low.includes('flat') || low.includes('floor') || low.includes('watchman')) {
          replyText = "Got it! Noted down the gate and flat guidelines. I will pass the security counter peacefully and deliver straight to your door step. 🚪";
        } else if (low.includes('spicy') || low.includes('spice') || low.includes('salt') || low.includes('chill')) {
          replyText = "Ah! For direct food culinary adjustments, you can drop a chat message to the Restaurant Chef on the other tab too! I'll also double check the package label before departing.";
        }

        const systemReply = {
          id: `reply_${Date.now()}`,
          sender: 'partner' as const,
          text: replyText,
          timestamp: new Date().toISOString()
        };

        setDriverMessages(prev => [...prev, systemReply]);
        if (!isChatOpen) {
          setUnreadDriverCount(prev => prev + 1);
        }
      }, 1500);

    } else {
      setRestaurantMessages(prev => [...prev, userMessage]);
      setInputText('');
      setIsRestaurantTyping(true);

      setTimeout(() => {
        setIsRestaurantTyping(false);
        let replyText = "Hello! The chef team has received and registered your instruction. We are crafting and double-checking your orders with care.";
        const low = rawMsg.toLowerCase();
        
        if (low.includes('spicy') || low.includes('spice') || low.includes('hot') || low.includes('pepper') || low.includes('chill') || low.includes('masala')) {
          replyText = "Perfect! Our head chef of the tiffin station has adjusted the coastal spice blend to match your request perfectly. Your dishes are sizzling inside the tandoor clay ovens right now! 🌶️";
        } else if (low.includes('cutlery') || low.includes('spoon') || low.includes('fork') || low.includes('tissue') || low.includes('plates')) {
          replyText = "Of course! We are dropping high-grade disposable eco-friendly wooden spoons and hand-towel napkins inside the secure heat-lock bag right now. 🍴";
        } else if (low.includes('fresh') || low.includes('hot') || low.includes('good') || low.includes('cook') || low.includes('clean')) {
          replyText = "We source all premium ingredients fresh daily from Chirala's local farmer co-ops and clean seafood docks. Your checkout order is cooked and packed under 100% strict hygienic compliance rules. 🔥";
        } else if (low.includes('onion') || low.includes('garlic') || low.includes('diet') || low.includes('allergy') || low.includes('veg')) {
          replyText = "Understood. The chef has highlighted this constraint on the prep board. We are isolating clean utensils to prepare your meal safely away from non-eligible allergens. 🥦";
        }

        const systemReply = {
          id: `reply_${Date.now()}`,
          sender: 'partner' as const,
          text: replyText,
          timestamp: new Date().toISOString()
        };

        setRestaurantMessages(prev => [...prev, systemReply]);
        if (!isChatOpen) {
          setUnreadRestaurantCount(prev => prev + 1);
        }
      }, 1500);
    }
  };

  // Countdown timer for 2-minute cancellation limit
  useEffect(() => {
    if (!activeTrackingOrder) return;
    const orderTime = new Date(activeTrackingOrder.date).getTime();
    
    const updateTime = () => {
      const elapsed = Date.now() - orderTime;
      const remaining = 120000 - elapsed; // 2 minutes in ms
      setTimeLeftMs(Math.max(0, remaining));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [activeTrackingOrder]);

  useEffect(() => {
    if (!activeTrackingOrder) return;
    // Decrement distance based on progress
    const pct = deliveryRouteProgress / 100;
    const nextDist = Math.max(0.1, parseFloat((2.8 * (1 - pct)).toFixed(1)));
    const nextEta = Math.max(1, Math.round(24 * (1 - pct)));
    setSimulatedDistance(nextDist);
    setEtaRemaining(nextEta);
  }, [deliveryRouteProgress, activeTrackingOrder]);

  if (!activeTrackingOrder) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6 text-center pb-24 transition-colors duration-300">
        <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400 mb-4 border">
          <Navigation className="w-10 h-10" />
        </div>
        <p className="text-zinc-600 dark:text-zinc-450 font-bold text-sm">No active delivery is currently underway.</p>
        <p className="text-xs text-zinc-450 dark:text-zinc-500 mt-1 max-w-xs">Once you submit an order request from your cart, live coordinate simulations appear here.</p>
        <button 
          onClick={() => setCurrentPage('home')}
          className="mt-5 bg-orange-500 text-white font-bold text-xs px-5 py-2.5 rounded-lg shadow"
        >
          Browse Dishes
        </button>
      </div>
    );
  }

  // Beautifully handle when this order gets cancelled (either in the history or directly here)
  if (activeTrackingOrder.status === 'cancelled') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6 text-center pb-24 transition-colors duration-300">
        <div className="w-20 h-20 bg-rose-100 dark:bg-rose-950/20 rounded-full flex items-center justify-center text-rose-500 mb-4 border border-rose-200">
          <AlertTriangle className="w-10 h-10 animate-bounce text-rose-500" />
        </div>
        <h2 className="text-base font-black text-rose-600 dark:text-rose-450 uppercase tracking-tight">Order Cancelled</h2>
        <p className="text-zinc-600 dark:text-zinc-300 font-bold text-sm mt-2 max-w-sm">
          Order #{activeTrackingOrder.id.split('_')[1] || activeTrackingOrder.id} has been voided.
        </p>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 max-w-xs mx-auto leading-relaxed">
          The transaction logs were cleared and preparation slips aborted. Full reimbursement balance back on source.
        </p>
        <button 
          onClick={() => setCurrentPage('home')}
          className="mt-6 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs px-6 py-3 rounded-2xl shadow transition cursor-pointer"
        >
          Back To Kitchen Store
        </button>
      </div>
    );
  }

  interface TrackingStage {
    label: string;
    desc: string;
    icon: string;
    isActive: boolean;
    isCompleted: boolean;
  }

  const stages: TrackingStage[] = [
    {
      label: 'Accepted',
      desc: 'Order received & confirmed by the kitchen',
      icon: '📝',
      isActive: activeTrackingOrder.status === 'accepted',
      isCompleted: ['preparing', 'picked', 'on_the_way', 'delivered'].includes(activeTrackingOrder.status)
    },
    {
      label: 'Preparing',
      desc: 'Our chefs are cooking your fresh plate with care',
      icon: '🍳',
      isActive: activeTrackingOrder.status === 'preparing',
      isCompleted: ['picked', 'on_the_way', 'delivered'].includes(activeTrackingOrder.status)
    },
    {
      label: 'Out for Delivery',
      desc: 'Rider is speeding down the path with your hot bag',
      icon: '🛵',
      isActive: ['picked', 'on_the_way'].includes(activeTrackingOrder.status),
      isCompleted: activeTrackingOrder.status === 'delivered'
    },
    {
      label: 'Delivered',
      desc: 'Arrived! Consolidated package dropped at your door',
      icon: '😋',
      isActive: activeTrackingOrder.status === 'delivered',
      isCompleted: activeTrackingOrder.status === 'delivered'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 pb-32 transition-colors duration-300 relative">
      
      {/* Custom Share Toast Notification overlays */}
      <AnimatePresence>
        {shareCopied && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 20, x: "-50%" }}
            className="fixed bottom-24 left-1/2 bg-zinc-900 border border-zinc-800 text-white font-sans text-xs px-4 py-2.5 rounded-full shadow-2xl z-50 flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Tracking link copied to clipboard!</span>
          </motion.div>
        )}
        {shareError && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 20, x: "-50%" }}
            className="fixed bottom-24 left-1/2 bg-red-650 border border-red-550 text-white font-sans text-xs px-4 py-2.5 rounded-full shadow-2xl z-50 flex items-center gap-2"
          >
            <AlertTriangle className="w-4 h-4 text-amber-300" />
            <span>Unable to share the tracking link.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-zinc-900 border-b border-slate-100 dark:border-zinc-800 p-4 z-10 flex items-center justify-between">
        <div className="flex items-center gap-2 max-w-[65%]">
          <div className="flex items-center gap-1 shrink-0 mr-1">
            <button
              onClick={pageHistory.length > 1 ? goBack : closePage}
              className="p-1.5 bg-slate-150 dark:bg-zinc-800 hover:bg-slate-250 dark:hover:bg-zinc-700 rounded-full text-zinc-700 dark:text-zinc-300 transition-all cursor-pointer active:scale-95 flex items-center justify-center shrink-0"
              title="Go Back"
              id="tracking-screen-back-btn"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={closePage}
              className="p-1.5 bg-slate-150 dark:bg-zinc-800 hover:bg-slate-250 dark:hover:bg-zinc-700 rounded-full text-zinc-700 dark:text-zinc-300 transition-all cursor-pointer active:scale-95 flex items-center justify-center shrink-0"
              title="Close to Home"
              id="tracking-screen-close-btn"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="overflow-hidden">
            <span className="text-[10px] font-mono bg-orange-500/10 text-orange-600 px-2 py-0.5 rounded-md font-bold inline-block">LIVE GPS POSITIONING</span>
            <h2 className="text-sm font-black text-zinc-900 dark:text-zinc-50 tracking-tight mt-0.5 truncate">Tracking Order {activeTrackingOrder.id.split('_')[1] || activeTrackingOrder.id}</h2>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            id="share-tracking-button"
            onClick={handleShareTrackingLink}
            className="p-2 bg-orange-50 dark:bg-orange-950/25 text-orange-600 dark:text-orange-400 rounded-full hover:bg-orange-100 dark:hover:bg-orange-955/30 flex items-center gap-1.5 text-xs font-bold cursor-pointer transition-colors duration-200"
            title="Share tracking link with friends"
          >
            <Share2 className="w-3.5 h-3.5" /> Share
          </button>

          <button 
            onClick={() => clickToWhatsAppSupport(`Queries about order index ${activeTrackingOrder.id}`)}
            className="p-2 bg-emerald-50 text-emerald-600 rounded-full hover:bg-emerald-100 flex items-center gap-1 text-xs font-bold cursor-pointer"
          >
            <Phone className="w-4 h-4" /> Help
          </button>
        </div>
      </div>

      <div className="p-4 max-w-md mx-auto space-y-4">
        
        {/* PREMIUM MAP VIEWPORT WITH GOOGLE MAPS API INTEGRATION */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-4 shadow-md overflow-hidden relative">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
              <Compass className="w-5 h-5 text-orange-500 animate-spin" />
              <span className="text-xs font-black">
                {hasValidKey ? "Live GPS Navigation Map" : "GPS Routing Simulator"}
              </span>
            </div>
            
            <div className="flex items-center gap-2 bg-orange-500/10 px-2.5 py-1 rounded-xl text-orange-600">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-[10px] font-black font-mono">
                {activeTrackingOrder.scheduledTime 
                  ? `SCHEDULED: ${activeTrackingOrder.scheduledTime}` 
                  : `ETA: ${etaRemaining} MINS`
                }
              </span>
            </div>
          </div>

          {hasValidKey ? (
            <div className="border rounded-2xl h-72 relative overflow-hidden flex items-center justify-center shadow-inner">
              <APIProvider apiKey={API_KEY} version="weekly">
                <Map
                  defaultCenter={CHIRALA_CENTER}
                  defaultZoom={14}
                  mapId="DEMO_MAP_ID"
                  internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                  style={{ width: '100%', height: '100%' }}
                >
                  <LiveRouteTracker
                    restaurantCoords={restaurantCoords}
                    destinationCoords={destinationCoords}
                    progress={deliveryRouteProgress}
                    restaurantName={restaurantName}
                    riderName="Suresh (Rider)"
                  />
                </Map>
              </APIProvider>
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-zinc-950 border rounded-2xl p-4 flex flex-col items-center justify-center min-h-[280px] text-center">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-950/20 rounded-full flex items-center justify-center text-orange-500 mb-2">
                <MapPin className="w-6 h-6 animate-bounce" />
              </div>
              <h4 className="text-sm font-black text-zinc-900 dark:text-zinc-50">Google Maps API Key Required</h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs">
                To display the interactive live tracking route map, please configure your Google Maps API Key.
              </p>
              
              <div className="mt-3 text-left text-[11px] space-y-1.5 bg-white dark:bg-zinc-900 p-3 rounded-xl border w-full max-w-sm text-zinc-650 dark:text-zinc-350 shadow-xs">
                <p><strong>Step 1:</strong> <a href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais" target="_blank" rel="noopener noreferrer" className="text-orange-500 underline font-bold">Get an API Key</a></p>
                <p><strong>Step 2:</strong> Add your key as a secret in AI Studio:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Open <strong>Settings</strong> (⚙️ gear icon, <strong>top-right corner</strong>)</li>
                  <li>Select <strong>Secrets</strong></li>
                  <li>Type <code>GOOGLE_MAPS_PLATFORM_KEY</code> as the secret name</li>
                  <li>Paste your API key as the value, and press <strong>Enter</strong></li>
                </ul>
              </div>
              <p className="text-[10px] text-zinc-400 mt-2">The app will rebuild automatically once saved.</p>
            </div>
          )}

          <div className="mt-3 flex items-center justify-between text-xs border-t pt-3">
            <div>
              <p className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider">Distance residual</p>
              <p className="font-extrabold text-zinc-900 dark:text-zinc-100 font-mono text-sm">{simulatedDistance} km remaining</p>
            </div>
            <div className="text-right">
              <p className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider">Rider Assignment</p>
              <p className="font-extrabold text-zinc-900 dark:text-zinc-100 text-xs">Shravan Kumar (Nuvvo Elite)</p>
            </div>
          </div>
        </div>

        {/* BACKGROUND NOTIFICATION PERMISSION PROMPT BANNER */}
        {notificationPermission !== 'granted' && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-orange-500/10 via-orange-600/[0.04] to-transparent border border-orange-500/20 rounded-3xl p-4 shadow-sm flex items-start gap-3 text-left relative overflow-hidden"
          >
            {/* Subtle light pulse background overlay */}
            <span className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="p-2.5 bg-orange-500 text-white rounded-2xl shrink-0 mt-0.5 animate-pulse">
              <Radio className="w-5 h-5" />
            </div>
            
            <div className="space-y-1.5 flex-1 pr-2">
              <h4 className="text-xs font-black text-zinc-900 dark:text-zinc-50 leading-tight uppercase tracking-tight flex items-center gap-1.5">
                Enable Minimized Status Alerts!
              </h4>
              <p className="text-[10.5px] text-zinc-650 dark:text-zinc-400 leading-relaxed font-medium">
                Want real-time updates when backgrounded or minimized? Enable browser push notifications to track your delivery partner's precise location seamlessly!
              </p>
              
              <div className="pt-1 flex items-center gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    await requestNotificationPermission();
                  }}
                  className="px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white font-black text-[9.5px] uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-sm active:scale-95 flex items-center gap-1"
                >
                  ⚡ Enable Alerts
                </button>
                {notificationPermission === 'denied' && (
                  <span className="text-[8.5px] text-rose-500 font-bold uppercase tracking-wider italic">
                    ⚠ Blocked in browser settings
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* LIVE TELEMETRY & WEBSOCKET POLLING ENGINE */}
        <div id="live-telemetry-ws-panel" className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
          {/* Panel Header */}
          <div className="flex justify-between items-center border-b pb-2.5 dark:border-zinc-800/80">
            <div className="flex items-center gap-2 text-left">
              <Activity className={`w-4 h-4 text-emerald-500 ${isPolling ? 'animate-pulse' : ''}`} />
              <div>
                <h4 className="text-xs font-black text-zinc-955 dark:text-zinc-50 tracking-tight uppercase flex items-center gap-1.5">
                  Live Telemetry Desk
                </h4>
                <p className="text-[9px] text-zinc-400 font-bold uppercase leading-none">WebSocket Polling Protocol</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider font-mono ${
                isPolling 
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/15' 
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/15'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isPolling ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`} />
                {isPolling ? 'WS: Active' : 'WS: Paused'}
              </span>

              <button
                type="button"
                onClick={() => {
                  setIsPolling(!isPolling);
                  setTelemetryLogs(prev => [
                    {
                      id: `toggle_${Date.now()}`,
                      timestamp: new Date().toLocaleTimeString(),
                      message: isPolling ? '⚠️ WS Connection Paused. Polling thread suspended.' : '🟢 WS Connection Re-established. Polling thread resumed.',
                      type: isPolling ? 'warn' : 'info'
                    },
                    ...prev
                  ]);
                }}
                className="p-1 hover:bg-slate-150 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                title={isPolling ? "Pause Real-Time Polling" : "Resume Real-Time Polling"}
              >
                {isPolling ? <X className="w-3.5 h-3.5" /> : <RefreshCw className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Core GPS stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* Coordinates */}
            <div className="p-2.5 bg-slate-50 dark:bg-zinc-850 border border-slate-100 dark:border-zinc-800/80 rounded-2xl space-y-1 text-left">
              <span className="text-[8.5px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block flex items-center gap-1">
                <Radio className="w-2.5 h-2.5 text-orange-500" /> GPS Lat/Lng
              </span>
              <p className="font-mono text-[10.5px] font-black text-zinc-800 dark:text-zinc-150 leading-none">
                {jitterCoords.lat}
              </p>
              <p className="font-mono text-[10.5px] font-black text-zinc-800 dark:text-zinc-150 leading-none pt-0.5">
                {jitterCoords.lng}
              </p>
            </div>

            {/* Velocity */}
            <div className="p-2.5 bg-slate-50 dark:bg-zinc-850 border border-slate-100 dark:border-zinc-800/80 rounded-2xl space-y-1 text-left">
              <span className="text-[8.5px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block flex items-center gap-1">
                <Bike className="w-2.5 h-2.5 text-orange-500" /> Velocity
              </span>
              <p className="font-mono text-base font-black text-zinc-900 dark:text-zinc-50 leading-none flex items-baseline gap-0.5">
                {currentSpeed} <span className="text-[9px] text-zinc-450 font-bold uppercase">km/h</span>
              </p>
              <span className="text-[8px] font-bold text-emerald-500 uppercase leading-none block">Moving Smoothly</span>
            </div>

            {/* Link & Quality */}
            <div className="p-2.5 bg-slate-50 dark:bg-zinc-850 border border-slate-100 dark:border-zinc-800/80 rounded-2xl space-y-1 text-left">
              <span className="text-[8.5px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block flex items-center gap-1">
                <Wifi className="w-2.5 h-2.5 text-orange-500" /> Connection
              </span>
              <p className="font-mono text-xs font-black text-zinc-800 dark:text-zinc-150 leading-none flex items-center gap-1">
                98% <span className="text-[7.5px] bg-emerald-150 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 px-1 py-0.2 rounded uppercase font-black font-sans">5G</span>
              </p>
              <p className="text-[8px] text-zinc-450 leading-none pt-0.5">Sats: {satelliteCount} locked</p>
            </div>

            {/* Rider Device Battery */}
            <div className="p-2.5 bg-slate-50 dark:bg-zinc-850 border border-slate-100 dark:border-zinc-800/80 rounded-2xl space-y-1 text-left">
              <span className="text-[8.5px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block flex items-center gap-1">
                <Battery className="w-2.5 h-2.5 text-orange-500" /> Device Tele
              </span>
              <p className="font-mono text-xs font-black text-zinc-800 dark:text-zinc-150 leading-none flex items-center gap-1">
                {batteryLevel}% <span className="text-[8px] text-zinc-400 font-bold font-sans">charge</span>
              </p>
              <p className="text-[8px] text-zinc-450 leading-none pt-0.5">Acc: ±{gpsAccuracy}m</p>
            </div>
          </div>

          {/* WebSocket Terminal Stream Logs */}
          <div className="space-y-1.5 text-left">
            <span className="text-[9px] font-black uppercase tracking-wider text-orange-500 flex items-center gap-1.5">
              <Terminal className="w-3 h-3" /> Live WS Packet Stream
            </span>

            <div className="bg-zinc-950 dark:bg-black border border-zinc-850 rounded-2xl p-3 font-mono text-[9px] text-zinc-300 space-y-1.5 max-h-[140px] overflow-y-auto scrollbar-thin shadow-inner">
              {telemetryLogs.length === 0 ? (
                <p className="text-zinc-500 italic text-center py-2">Waiting for WebSocket connection telemetry...</p>
              ) : (
                telemetryLogs.map((log) => {
                  let textCol = 'text-zinc-300';
                  let prefix = '📥';
                  if (log.type === 'info') {
                    textCol = 'text-indigo-400';
                    prefix = 'ℹ️';
                  } else if (log.type === 'warn') {
                    textCol = 'text-amber-400';
                    prefix = '⚠️';
                  }

                  return (
                    <div key={log.id} className={`flex items-start gap-1 leading-relaxed ${textCol}`}>
                      <span className="text-zinc-500 shrink-0 select-none">[{log.timestamp}]</span>
                      <span className="shrink-0 select-none">{prefix}</span>
                      <span className="break-all whitespace-pre-wrap">{log.message}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Manual Repoll Option */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[10px] text-zinc-450 gap-2">
            <span className="flex items-center gap-1.5 text-left">
              <Cpu className="w-3 h-3 text-zinc-450" />
              <span>Simulating wss:// gateway coordinates via WebSocket frame emulation</span>
            </span>
            <button
              type="button"
              onClick={() => {
                const baseLat = restaurantCoords.lat + (destinationCoords.lat - restaurantCoords.lat) * (deliveryRouteProgress / 100);
                const baseLng = restaurantCoords.lng + (destinationCoords.lng - restaurantCoords.lng) * (deliveryRouteProgress / 100);
                const latJitter = (Math.random() - 0.5) * 0.00015;
                const lngJitter = (Math.random() - 0.5) * 0.00015;
                const finalLat = parseFloat((baseLat + latJitter).toFixed(6));
                const finalLng = parseFloat((baseLng + lngJitter).toFixed(6));
                
                setJitterCoords({ lat: finalLat, lng: finalLng });
                setTelemetryLogs(prev => [
                  {
                    id: `manual_${Date.now()}`,
                    timestamp: new Date().toLocaleTimeString(),
                    message: `⚡ Force Polled coordinates: [${finalLat}, ${finalLng}]`,
                    type: 'info'
                  },
                  ...prev
                ]);
              }}
              className="px-2.5 py-1 bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 font-extrabold uppercase rounded-lg transition text-center sm:self-end cursor-pointer"
            >
              Force Poll Now
            </button>
          </div>
        </div>

        {/* Dynamic Cancellation Grace Period Banner (Within 2 minutes of placement) */}
        {timeLeftMs > 0 && (activeTrackingOrder.status === 'accepted' || activeTrackingOrder.status === 'preparing') && (
          <div id="active-order-cancellation-banner" className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 rounded-3xl p-4 shadow-sm space-y-3 animate-fadeIn">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/45 text-[9px] font-black text-rose-600 dark:text-rose-450 uppercase tracking-wider font-mono">
                  ⏱️ Grace Period
                </span>
                <h4 className="text-xs font-black text-zinc-900 dark:text-zinc-50 leading-tight">
                  Cancel order without penalty
                </h4>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-snug">
                  Made a mistake? Cancelling now halts kitchen cooking and grants an instant zero-fee refund.
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[8px] text-zinc-400 uppercase font-bold block">Aborts in</span>
                <span className="text-sm font-black text-rose-500 font-mono tracking-wider">
                  {Math.floor(timeLeftMs / 60000)}:{(Math.floor((timeLeftMs % 60000) / 1000)).toString().padStart(2, '0')}
                </span>
              </div>
            </div>
            
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Do you really want to cancel this order? This will notify the kitchen to discard the preparation slip and immediately process a refund to your payment method.")) {
                  changeOrderStatus(activeTrackingOrder.id, 'cancelled');
                }
              }}
              className="w-full bg-rose-500 hover:bg-rose-600 active:scale-[0.99] text-white font-black uppercase text-[10.5px] py-2.5 rounded-2xl cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-rose-500/10"
            >
              🛑 Abort Cooking & Cancel Order
            </button>
          </div>
        )}

        {/* CHRONOLOGICAL STAGES OF ORDER (ACC -> PREP -> PICK -> ON THE WAY -> DEL) */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold font-mono tracking-widest text-zinc-400 uppercase">Chronological Steps</h3>
          
          <div className="relative pl-6 space-y-5">
            {/* Vertical connector line */}
            <div className="absolute left-2.5 top-2.5 bottom-2.5 w-0.5 bg-slate-100 dark:bg-zinc-800" />
            
            {stages.map((stage, idx) => {
              const isCompleted = stage.isCompleted;
              const isActive = stage.isActive;
              
              return (
                <div key={idx} className="relative flex gap-3.5">
                  {/* Bullet node */}
                  <div className={`absolute -left-5 top-1 w-5.5 h-5.5 rounded-full border-2 flex items-center justify-center text-[9px] z-10 transition-colors ${
                    isCompleted 
                      ? 'bg-emerald-500 border-emerald-500 text-white' 
                      : isActive 
                        ? 'bg-orange-500 border-orange-500 text-white animate-pulse' 
                        : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-zinc-400'
                  }`}>
                    {isCompleted ? '✓' : idx + 1}
                  </div>

                  <span className="text-lg flex-shrink-0 mt-0.5">{stage.icon}</span>

                  <div>
                    <h4 className={`text-xs font-extrabold ${isActive ? 'text-orange-500' : 'text-zinc-900 dark:text-zinc-200'}`}>
                      {stage.label}
                    </h4>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium leading-none mt-1">
                      {stage.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECURE PACKAGING STATS AND COMPLIANCE */}
        <div className="bg-emerald-500/10 p-3.5 rounded-2xl border border-emerald-500/20 flex gap-2.5 text-xs text-emerald-700 dark:text-emerald-400">
          <ShieldCheck className="w-5 h-5 flex-shrink-0 text-emerald-500 mt-0.5 animate-bounce" />
          <div>
            <strong className="font-extrabold block">Secure Safe Delivery Code</strong>
            Seals are 100% verified on leaving the kitchen. Do not accept parcel packs with compromised outer adhesive tapes or barcodes.
          </div>
        </div>

        {/* FORCE TRANSITION TRIGGERS (ONLY FOR EASY DEMO REVIEWING) */}
        <div className="bg-slate-100 dark:bg-zinc-900/50 p-4 rounded-2xl border space-y-2">
          <p className="text-[9px] font-bold font-mono tracking-wider text-zinc-500 uppercase text-center">Developer/Review Speed Dial Controls</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button 
              onClick={() => changeOrderStatus(activeTrackingOrder.id, 'picked')}
              className="p-2 bg-white dark:bg-zinc-800 rounded-lg shadow-sm border font-bold text-center"
            >
              Skip: Picked Up 📦
            </button>
            <button 
              onClick={() => changeOrderStatus(activeTrackingOrder.id, 'on_the_way')}
              className="p-2 bg-white dark:bg-zinc-800 rounded-lg shadow-sm border font-bold text-center"
            >
              Skip: On the way ⚡
            </button>
          </div>
          <button
            id="instant-delivered-feedback-btn"
            onClick={() => changeOrderStatus(activeTrackingOrder.id, 'delivered')}
            className="w-full text-center p-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold rounded-lg text-xs cursor-pointer transition-colors"
          >
            Instantly set status to Delivered (Triggers Feedback Modal) ⭐
          </button>
        </div>

      </div>

      {/* FLOATING ACTION CHAT SUPPORT TRIGGER BUTTON */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {/* Unread Pill notification when chat is closed */}
        {!isChatOpen && (unreadDriverCount + unreadRestaurantCount > 0) && (
          <div className="bg-rose-500 border border-white dark:border-zinc-900 text-white text-[9.5px] font-black rounded-full px-2.5 py-1 shadow-md animate-bounce select-none">
            ⚡ {unreadDriverCount + unreadRestaurantCount} New messages
          </div>
        )}
        
        <button
          type="button"
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`p-4 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 active:scale-95 border cursor-pointer hover:shadow-orange-500/20 focus:outline-none ${
            isChatOpen 
              ? 'bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-950' 
              : 'bg-orange-500 border-orange-400 text-white hover:bg-orange-600'
          }`}
          title="Direct Support Chat"
        >
          {isChatOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <MessageSquare className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* FLOATING SUPPORT CHAT INTERFACE CARD (FIXED DRAWER OVERLAY) */}
      {isChatOpen && (
        <div 
          className="fixed bottom-24 right-4 md:right-8 z-50 w-[calc(100vw-32px)] md:w-[410px] h-[550px] max-h-[80vh] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-850 rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all duration-200"
          id="partner-chat-support-modal"
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/70 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 rounded-full h-2 bg-emerald-500 animate-pulse" />
              <div>
                <h3 className="text-xs font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-wide">
                  Order Dispatch Helpline
                </h3>
                <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 block">
                  Support coordination channel for Order #{activeTrackingOrder.id.slice(-6).toUpperCase()}
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-800 text-zinc-400 dark:text-zinc-500 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Partner Selector Tabs */}
          <div className="grid grid-cols-2 text-center border-b border-slate-100 dark:border-zinc-800/80 bg-white dark:bg-zinc-900">
            <button
              type="button"
              onClick={() => setActiveTab('driver')}
              className={`p-3 text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                activeTab === 'driver'
                  ? 'border-orange-500 text-orange-500 bg-orange-50/10'
                  : 'border-transparent text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'
              }`}
            >
              <Bike className="w-3.5 h-3.5" />
              <span>Rider Suresh</span>
              {unreadDriverCount > 0 && (
                <span className="bg-rose-500 text-white rounded-full text-[9px] w-4.5 h-4.5 flex items-center justify-center font-bold">
                  {unreadDriverCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('restaurant')}
              className={`p-3 text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                activeTab === 'restaurant'
                  ? 'border-orange-500 text-orange-500 bg-orange-50/10'
                  : 'border-transparent text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span className="truncate max-w-[100px]">
                {restaurants.find(r => r.id === activeTrackingOrder.items[0]?.foodItem?.restaurantId)?.name || 'Kitchen'}
              </span>
              {unreadRestaurantCount > 0 && (
                <span className="bg-rose-500 text-white rounded-full text-[9px] w-4.5 h-4.5 flex items-center justify-center font-bold">
                  {unreadRestaurantCount}
                </span>
              )}
            </button>
          </div>

          {/* Chat Messages Log */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 cursor-default bg-slate-50/40 dark:bg-zinc-950/20 scrollbar-thin">
            {activeTab === 'driver' ? (
              driverMessages.map(msg => (
                <div 
                  key={msg.id} 
                  className={`flex flex-col max-w-[85%] ${
                    msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                  }`}
                >
                  <div className={`p-3 rounded-2xl text-[11px] leading-relaxed font-semibold transition-colors ${
                    msg.sender === 'user'
                      ? 'bg-orange-500 text-white rounded-tr-none shadow-sm shadow-orange-500/10'
                      : 'bg-white dark:bg-zinc-800/80 border border-slate-100 dark:border-zinc-800 text-zinc-800 dark:text-zinc-150 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-[8px] font-medium text-zinc-400 dark:text-zinc-500 mt-1 uppercase px-1">
                    {msg.sender === 'user' ? 'You' : 'Suresh'} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            ) : (
              restaurantMessages.map(msg => (
                <div 
                  key={msg.id} 
                  className={`flex flex-col max-w-[85%] ${
                    msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                  }`}
                >
                  <div className={`p-3 rounded-2xl text-[11px] leading-relaxed font-semibold transition-colors ${
                    msg.sender === 'user'
                      ? 'bg-orange-500 text-white rounded-tr-none shadow-sm shadow-orange-500/10'
                      : 'bg-white dark:bg-zinc-800/80 border border-slate-100 dark:border-zinc-800 text-zinc-800 dark:text-zinc-150 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-[8px] font-medium text-zinc-400 dark:text-zinc-500 mt-1 uppercase px-1">
                    {msg.sender === 'user' ? 'You' : 'Kitchen Chef'} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}

            {/* Simulated Typings Animating Bubble */}
            {((activeTab === 'driver' && isDriverTyping) || (activeTab === 'restaurant' && isRestaurantTyping)) && (
              <div className="flex flex-col items-start mr-auto max-w-[80%]">
                <div className="bg-white dark:bg-zinc-800/80 border border-slate-100 dark:border-zinc-800 p-2.5 px-3.5 rounded-2xl rounded-tl-none flex items-center gap-1">
                  <div className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-mono animate-pulse flex items-center gap-1.5">
                    <span>{activeTab === 'driver' ? 'Suresh' : 'Chef'} is writing</span>
                    <span className="flex gap-0.5 mt-0.5">
                      <span className="w-1 h-1 bg-zinc-400 dark:bg-zinc-500 rounded-full animate-bounce delay-75" />
                      <span className="w-1 h-1 bg-zinc-400 dark:bg-zinc-500 rounded-full animate-bounce delay-150" />
                      <span className="w-1 h-1 bg-zinc-400 dark:bg-zinc-500 rounded-full animate-bounce delay-225" />
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messageEndRef} />
          </div>

          {/* Quick Preset Message helper bubbled row */}
          <div className="px-3 py-2 border-t border-slate-100 dark:border-zinc-800/50 bg-white dark:bg-zinc-900 flex gap-2 overflow-x-auto scrollbar-none select-none">
            {(activeTab === 'driver' 
              ? [
                  "Where are you? 📍",
                  "Bring spoon/fork 🍴",
                  "Call on arrival 📞",
                  "Leave with security 🏢"
                ] 
              : [
                  "Make it extra spicy! 🌶️",
                  "Please drop extra tissues 🧻",
                  "Any allergy warnings? 🥦",
                  "Double packaged packaging 🔥"
                ]
            ).map((preset, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSendMessage(preset)}
                className="bg-slate-50 dark:bg-zinc-800/55 hover:bg-slate-100 dark:hover:bg-zinc-750 text-[10px] font-extrabold text-zinc-600 dark:text-zinc-350 px-2.5 py-1.5 rounded-full border border-slate-150 dark:border-zinc-800 cursor-pointer shrink-0 transition-all active:scale-[0.97]"
              >
                {preset}
              </button>
            ))}
          </div>

          {/* Form message input sender */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 border-t border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/70 flex gap-2 items-center"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={activeTab === 'driver' ? "Type a message to Rider Suresh..." : "Ask the Chef kitchen team details..."}
              className="flex-1 bg-white dark:bg-zinc-850 px-3.5 py-2 rounded-2xl border border-slate-100 dark:border-zinc-800/60 text-xs text-zinc-900 dark:text-zinc-50 focus:outline-none focus:border-orange-400 placeholder-zinc-400 dark:placeholder-zinc-500 font-semibold"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white p-2.5 rounded-2xl shadow-sm shadow-orange-500/10 cursor-pointer active:scale-95 transition-all flex items-center justify-center shrink-0 disabled:cursor-not-allowed"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* POST-ORDER FEEDBACK MODAL */}
      <AnimatePresence>
        {showFeedbackModal && (
          <div 
            id="post-order-feedback-modal-backdrop"
            className="fixed inset-0 bg-zinc-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              id="post-order-feedback-modal-card"
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl relative"
            >
              {/* Dismiss button */}
              <button
                id="feedback-modal-close-btn"
                onClick={() => {
                  setShowFeedbackModal(false);
                  setIsFeedbackSubmitted(false);
                }}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-50 dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-zinc-400 dark:text-zinc-500 transition-colors cursor-pointer"
                title="Dismiss rating modal"
              >
                <X className="w-4 h-4" />
              </button>

              {!isFeedbackSubmitted ? (
                <form id="post-order-feedback-form" onSubmit={handleFeedbackSubmit} className="space-y-5">
                  <div className="text-center space-y-1">
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-950/20 rounded-full flex items-center justify-center text-orange-500 mx-auto border border-orange-200">
                      <Smile className="w-6 h-6 animate-pulse" />
                    </div>
                    <h3 className="text-base font-black text-zinc-900 dark:text-zinc-50 tracking-tight pt-1">
                      Rate Your Nuvvo Experience
                    </h3>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                      Tell us how much you enjoyed the culinary feast and the delivery service.
                    </p>
                  </div>

                  {/* Rating Block 1: Meal Taste & Food Quality */}
                  <div className="p-4 bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-850 rounded-2xl space-y-2.5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                          🍔 Food Quality & Taste
                        </h4>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
                          From: <span className="font-bold text-zinc-700 dark:text-zinc-300">
                            {restaurants.find(r => r.id === activeTrackingOrder.items[0]?.foodItem?.restaurantId)?.name || "Hotel Kitchen"}
                          </span>
                        </p>
                      </div>
                      {mealRating > 0 && (
                        <span className="text-[10px] font-black text-orange-500 bg-orange-100/40 dark:bg-orange-950/30 px-2 py-0.5 rounded-lg border border-orange-200/40 font-semibold shrink-0">
                          {mealRating === 5 ? "Loved It! 😋" : mealRating === 4 ? "Delicious! 👍" : mealRating === 3 ? "Decent 😊" : mealRating === 2 ? "Below expectation" : "Not good"}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 justify-center py-1">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const isHighlighted = (hoverMealRating || mealRating) >= star;
                        return (
                          <button
                            key={star}
                            id={`meal-star-rating-${star}`}
                            type="button"
                            onMouseEnter={() => setHoverMealRating(star)}
                            onMouseLeave={() => setHoverMealRating(0)}
                            onClick={() => setMealRating(star)}
                            className="p-1 focus:outline-none transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                          >
                            <Star 
                              className={`w-7 h-7 stroke-[2] ${
                                isHighlighted 
                                  ? 'fill-orange-500 stroke-orange-500 text-orange-500' 
                                  : 'stroke-zinc-300 dark:stroke-zinc-700 text-transparent'
                              }`} 
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-850 rounded-2xl space-y-2.5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                          🏠 Restaurant & Kitchen Setup
                        </h4>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
                          Quality, Packaging & Hygiene
                        </p>
                      </div>
                      {restaurantRating > 0 && (
                        <span className="text-[10px] font-black text-amber-550 bg-amber-100/40 dark:bg-amber-950/30 px-2 py-0.5 rounded-lg border border-amber-200/40 font-semibold shrink-0 text-amber-600 dark:text-amber-400">
                          {restaurantRating === 5 ? "Top Notch! 🏆" : restaurantRating === 4 ? "Very Clean 👌" : restaurantRating === 3 ? "Good Packing 😊" : restaurantRating === 2 ? "Packing could improve" : "Poor packaging"}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 justify-center py-1">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const isHighlighted = (hoverRestaurantRating || restaurantRating) >= star;
                        return (
                          <button
                            key={star}
                            id={`restaurant-star-rating-${star}`}
                            type="button"
                            onMouseEnter={() => setHoverRestaurantRating(star)}
                            onMouseLeave={() => setHoverRestaurantRating(0)}
                            onClick={() => setRestaurantRating(star)}
                            className="p-1 focus:outline-none transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                          >
                            <Star 
                              className={`w-7 h-7 stroke-[2] ${
                                isHighlighted 
                                  ? 'fill-amber-500 stroke-amber-500 text-amber-500' 
                                  : 'stroke-zinc-300 dark:stroke-zinc-700 text-transparent'
                              }`} 
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Rating Block 3: Delivery & Rider Execution */}
                  <div className="p-4 bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-850 rounded-2xl space-y-2.5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                          🛵 Delivery Service
                        </h4>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
                          Partner Executive: <span className="font-bold text-zinc-700 dark:text-zinc-300">Suresh</span>
                        </p>
                      </div>
                      {deliveryRating > 0 && (
                        <span className="text-[10px] font-black text-emerald-500 bg-emerald-100/40 dark:bg-emerald-950/30 px-2 py-0.5 rounded-lg border border-emerald-200/40 font-semibold shrink-0">
                          {deliveryRating === 5 ? "Superfast! ⚡" : deliveryRating === 4 ? "Polite & Professional" : deliveryRating === 3 ? "Good service" : deliveryRating === 2 ? "A bit delayed" : "Poor experience"}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 justify-center py-1">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const isHighlighted = (hoverDeliveryRating || deliveryRating) >= star;
                        return (
                          <button
                            key={star}
                            id={`delivery-star-rating-${star}`}
                            type="button"
                            onMouseEnter={() => setHoverDeliveryRating(star)}
                            onMouseLeave={() => setHoverDeliveryRating(0)}
                            onClick={() => setDeliveryRating(star)}
                            className="p-1 focus:outline-none transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                          >
                            <Star 
                              className={`w-7 h-7 stroke-[2] ${
                                isHighlighted 
                                  ? 'fill-emerald-500 stroke-emerald-500 text-emerald-500' 
                                  : 'stroke-zinc-300 dark:stroke-zinc-700 text-transparent'
                              }`} 
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Comments Input */}
                  <div className="space-y-1.5">
                    <label htmlFor="feedback-comment" className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      Write a review (Optional)
                    </label>
                    <textarea
                      id="feedback-comment"
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      placeholder="Share your experience about the hot-locking, curry rich spice blend, or delivery experience..."
                      className="w-full bg-slate-50 dark:bg-zinc-950 px-3 py-2 rounded-2xl border border-slate-100 dark:border-zinc-800/80 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-orange-500 placeholder-zinc-400 dark:placeholder-zinc-500 font-semibold min-h-[70px] resize-none"
                    />
                  </div>

                  {/* Submit buttons */}
                  <div className="flex gap-2">
                    <button
                      id="feedback-skip-btn"
                      type="button"
                      onClick={() => {
                        setShowFeedbackModal(false);
                        setCurrentPage('orders');
                      }}
                      className="flex-1 bg-slate-50 dark:bg-zinc-850 hover:bg-slate-100 dark:hover:bg-zinc-800 text-zinc-605 dark:text-zinc-350 text-xs font-bold py-3 rounded-2xl border border-slate-150 dark:border-zinc-800 transition cursor-pointer text-center"
                    >
                      Skip
                    </button>
                    <button
                      id="feedback-submit-btn"
                      type="submit"
                      disabled={mealRating === 0 || restaurantRating === 0 || deliveryRating === 0}
                      className="flex-[2] bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-black uppercase py-3 rounded-2xl transition cursor-pointer shadow-md shadow-orange-500/10 flex items-center justify-center gap-1.5 disabled:cursor-not-allowed"
                    >
                      Submit Rating ✨
                    </button>
                  </div>
                </form>
              ) : (
                <div id="feedback-success-card" className="text-center py-6 space-y-4 animate-fadeIn">
                  <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-100 dark:border-emerald-800">
                    <CheckCircle className="w-10 h-10 animate-bounce text-emerald-500" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
                      Thank You for Your Feedback!
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto leading-relaxed">
                      Your valuable rating has been saved successfully! Your detailed comments were transmitted straight to coordinates and our rider partner executive Suresh to help them coordinate better next time! 🌟
                    </p>
                  </div>
                  <button
                    id="feedback-success-continue-btn"
                    onClick={() => {
                      setShowFeedbackModal(false);
                      setIsFeedbackSubmitted(false);
                      setCurrentPage('orders');
                    }}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs py-3 rounded-2xl shadow transition cursor-pointer"
                  >
                    View Order Invoice Receipt
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
