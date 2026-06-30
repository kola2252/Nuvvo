import React, { useState, useEffect, useRef } from 'react';
import { Clock, MapPin, Activity, CloudSun, AlertCircle, Navigation, Info, Sparkles, ThumbsUp } from 'lucide-react';
import { APIProvider, Map, AdvancedMarker, Pin, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { Restaurant, Address } from '../types';

interface SmartDeliveryEstimatorProps {
  restaurant: Restaurant;
  currentAddress: Address | null;
}

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

// Stable GPS Seed coordinates for Chirala area (Center: 15.8246, 80.3533)
const CHIRALA_CENTER = { lat: 15.8246, lng: 80.3533 };

function getSeedCoordinates(id: string, indexOffset: number = 0) {
  // Generate slightly dispersed coordinates around Chirala
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + indexOffset;
  const latDisp = ((hash % 37) - 18.5) * 0.0006; // ~1-2km spread
  const lngDisp = ((hash % 43) - 21.5) * 0.0006;
  return {
    lat: CHIRALA_CENTER.lat + latDisp,
    lng: CHIRALA_CENTER.lng + lngDisp,
  };
}

// Sub-component that actually calls Maps Route computation. Only mounted when hasValidKey holds true.
function LiveRouteEstimator({
  restaurantCoords,
  destinationCoords,
  isHeavyTraffic,
  onResult,
  onError,
}: {
  restaurantCoords: { lat: number; lng: number };
  destinationCoords: { lat: number; lng: number };
  isHeavyTraffic: boolean;
  onResult: (data: { distanceKm: number; durationMins: number; polylinePath: google.maps.LatLngLiteral[] }) => void;
  onError: (err: string) => void;
}) {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const polylinesRef = useRef<google.maps.Polyline[]>([]);

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
            // Style the route line with a premium theme color
            p.setOptions({
              strokeColor: isHeavyTraffic ? '#f97316' : '#22c55e',
              strokeOpacity: 0.8,
              strokeWeight: 5,
            });
            p.setMap(map);
          });
          polylinesRef.current = newPolylines;

          // Compute distance and base duration
          const distanceKm = parseFloat((route.distanceMeters / 1000).toFixed(1));
          let durationMins = Math.ceil(route.durationMillis / 1000 / 60);

          // Approximate polyline coordinates
          const pathCoords: google.maps.LatLngLiteral[] = [];
          if (route.path) {
            route.path.forEach(latLng => {
              const anyLatLng = latLng as any;
              const latVal = typeof anyLatLng.lat === 'function' ? anyLatLng.lat() : anyLatLng.lat;
              const lngVal = typeof anyLatLng.lng === 'function' ? anyLatLng.lng() : anyLatLng.lng;
              pathCoords.push({ lat: Number(latVal), lng: Number(lngVal) });
            });
          }

          onResult({ distanceKm, durationMins, polylinePath: pathCoords });

          // Auto zoom to encompass full path
          if (route.viewport) {
            map.fitBounds(route.viewport);
          }
        } else {
          onError('No routes returned from Routes service.');
        }
      })
      .catch((err) => {
        console.error('Routes compute failed:', err);
        onError(err.message || 'Error occurred during route computation.');
      });

    return () => {
      polylinesRef.current.forEach(p => p.setMap(null));
    };
  }, [routesLib, map, restaurantCoords, destinationCoords, isHeavyTraffic]);

  return (
    <>
      {/* Restaurant origin pin */}
      <AdvancedMarker position={restaurantCoords} title="Restaurant Kitchen">
        <Pin background="#f97316" glyphColor="#fff" scale={0.9} />
      </AdvancedMarker>

      {/* Customer drop area pin */}
      <AdvancedMarker position={destinationCoords} title="Your Dropzone">
        <Pin background="#3b82f6" glyphColor="#fff" scale={0.9} />
      </AdvancedMarker>
    </>
  );
}

export default function SmartDeliveryEstimator({ restaurant, currentAddress }: SmartDeliveryEstimatorProps) {
  // Simulation factors
  const [trafficLevel, setTrafficLevel] = useState<'light' | 'moderate' | 'heavy' | 'jam'>('moderate');
  const [weatherLevel, setWeatherLevel] = useState<'sunny' | 'rainy' | 'storm'>('sunny');

  // Computed results state
  const [liveDistance, setLiveDistance] = useState<number>(restaurant.distance || 3.2);
  const [liveDuration, setLiveDuration] = useState<number>(restaurant.deliveryTime || 30);
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Setup Coordinate points
  const restaurantCoords = getSeedCoordinates(restaurant.id, 10);
  const destinationCoords = currentAddress?.gpsCoordinates || getSeedCoordinates(currentAddress?.id || 'default_cust', 25);

  // Multipliers for smart estimation
  const getTrafficMultiplier = () => {
    switch (trafficLevel) {
      case 'light': return 1.0;
      case 'moderate': return 1.3;
      case 'heavy': return 1.8;
      case 'jam': return 2.5;
    }
  };

  const getWeatherMultiplier = () => {
    switch (weatherLevel) {
      case 'sunny': return 1.0;
      case 'rainy': return 1.25;
      case 'storm': return 1.6;
    }
  };

  // Base Prep time depends on cuisines
  const getPrepTime = () => {
    const isBiryaniOrMughlai = restaurant.cuisines?.some(c => 
      c.toLowerCase().includes('biryani') || c.toLowerCase().includes('mughlai')
    );
    return isBiryaniOrMughlai ? 20 : 15;
  };

  const trafficMult = getTrafficMultiplier();
  const weatherMult = getWeatherMultiplier();
  const prepTime = getPrepTime();

  // Simulated duration calculation
  const calculatedSimDuration = Math.ceil(
    prepTime + (liveDistance * 4) * trafficMult * weatherMult
  );

  const handleLiveResult = (data: { distanceKm: number; durationMins: number }) => {
    setLiveDistance(data.distanceKm);
    // Base route driving duration from Google Maps API + Prep Time + Adjustments
    const totalWithAdjustments = Math.ceil(
      prepTime + (data.durationMins * trafficMult * weatherMult)
    );
    setLiveDuration(totalWithAdjustments);
    setIsLiveConnected(true);
    setApiError(null);
  };

  const handleLiveError = (err: string) => {
    setApiError(err);
    setIsLiveConnected(false);
  };

  return (
    <div className="bg-slate-50 dark:bg-zinc-850/40 border border-slate-150/70 dark:border-zinc-800 p-4 rounded-2xl space-y-4">
      {/* Title block */}
      <div className="flex justify-between items-center pb-2 border-b border-dashed border-slate-200 dark:border-zinc-800">
        <div>
          <h4 className="text-xs font-extrabold text-orange-500 uppercase tracking-wider flex items-center gap-1.5 leading-none">
            <Sparkles className="w-3.5 h-3.5 text-orange-550 animate-pulse" /> Smart Delivery Estimator
          </h4>
          <p className="text-[9px] text-zinc-400 font-bold mt-0.5 uppercase tracking-tight">
            Traffic-adjusted coordinate logistics model
          </p>
        </div>

        <span className={`text-[8.5px] font-black px-2 py-0.5 rounded-full border ${
          hasValidKey && !apiError
            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
            : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
        }`}>
          {hasValidKey && !apiError ? '🔴 Live GPS Ready' : '⚙️ Tuning Configured'}
        </span>
      </div>

      {/* Main estimate clock display and description */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center">
        {/* Estimator Clock */}
        <div className="md:col-span-5 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-3.5 rounded-2xl flex flex-col items-center justify-center text-center shadow-xs">
          <div className="relative flex items-center justify-center">
            <Clock className={`w-14 h-14 ${
              calculatedSimDuration > 45 
                ? 'text-red-500' 
                : calculatedSimDuration > 30 
                ? 'text-orange-500' 
                : 'text-emerald-500'
            }`} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-black text-zinc-900 dark:text-zinc-50 font-mono tracking-tighter">
                {hasValidKey && isLiveConnected ? liveDuration : calculatedSimDuration}
              </span>
            </div>
          </div>
          <span className="text-[10px] font-black uppercase text-zinc-800 dark:text-zinc-200 mt-2">
            Mins Est. Delivery
          </span>
          <span className="text-[8px] text-zinc-400 font-semibold mt-0.5 uppercase">
            {hasValidKey && isLiveConnected ? 'Calculated via Routes API' : 'Formula Simulation'}
          </span>
        </div>

        {/* Breakdown Panel */}
        <div className="md:col-span-7 space-y-1.5 text-[10.5px]">
          <div className="flex justify-between text-zinc-500">
            <span>Prepared inside kitchen:</span>
            <strong className="font-mono text-zinc-800 dark:text-zinc-200">~{prepTime} mins</strong>
          </div>
          <div className="flex justify-between text-zinc-500">
            <span>Route Transit Distance:</span>
            <strong className="font-mono text-zinc-800 dark:text-zinc-200">
              {hasValidKey && isLiveConnected ? liveDistance : liveDistance} km
            </strong>
          </div>
          <div className="flex justify-between text-zinc-500">
            <span>Traffic delay penalty:</span>
            <strong className={`font-mono ${trafficMult > 1.4 ? 'text-red-500' : 'text-zinc-800 dark:text-zinc-200'}`}>
              {trafficMult === 1.0 ? 'None' : `+${Math.round((trafficMult - 1) * 100)}% time`}
            </strong>
          </div>
          <div className="flex justify-between text-zinc-500">
            <span>Weather environment speed:</span>
            <span className="font-mono text-zinc-805 dark:text-zinc-250 font-bold">
              {weatherLevel === 'sunny' ? 'Optimal (1x)' : `Slick (+${Math.round((weatherMult - 1) * 100)}%)`}
            </span>
          </div>
          
          <div className="h-px bg-slate-200 dark:bg-zinc-800 my-1" />

          {/* Quick calculation sentence */}
          <div className="text-[9.5px] text-zinc-400 font-bold uppercase leading-tight font-mono">
            🍳 Prep [{prepTime}m] + 🛵 transit [{liveDistance}km] {trafficMult > 1 && `× Traffic[${trafficMult}]`} {weatherMult > 1 && `× Weather[${weatherMult}]`} = <span className="text-orange-550 underline">{hasValidKey && isLiveConnected ? liveDuration : calculatedSimDuration} mins total</span>
          </div>
        </div>
      </div>

      {/* Interactive adjustors - Highly interactive for testing */}
      <div className="grid grid-cols-2 gap-3 bg-white dark:bg-zinc-900 border p-3 rounded-xl">
        <div className="space-y-1 text-left">
          <label className="text-[8.5px] font-black uppercase text-zinc-400 tracking-wider flex items-center gap-1">
            <Activity className="w-3 h-3 text-red-500" /> Traffic Level
          </label>
          <div className="flex rounded-lg border overflow-hidden text-[9px] font-bold bg-slate-50 dark:bg-zinc-800">
            {(['light', 'moderate', 'heavy', 'jam'] as const).map(level => (
              <button
                key={level}
                onClick={() => setTrafficLevel(level)}
                className={`flex-1 py-1 uppercase text-center transition-all cursor-pointer ${
                  trafficLevel === level
                    ? 'bg-orange-500 text-white'
                    : 'text-zinc-500 hover:bg-slate-100 dark:hover:bg-zinc-750'
                }`}
              >
                {level.charAt(0)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1 text-left">
          <label className="text-[8.5px] font-black uppercase text-zinc-400 tracking-wider flex items-center gap-1">
            <CloudSun className="w-3 h-3 text-emerald-500" /> Weather Sky
          </label>
          <div className="flex rounded-lg border overflow-hidden text-[9px] font-bold bg-slate-50 dark:bg-zinc-800">
            {(['sunny', 'rainy', 'storm'] as const).map(weather => (
              <button
                key={weather}
                onClick={() => setWeatherLevel(weather)}
                className={`flex-1 py-1 uppercase text-center transition-all cursor-pointer ${
                  weatherLevel === weather
                    ? 'bg-orange-500 text-white'
                    : 'text-zinc-500 hover:bg-slate-100 dark:hover:bg-zinc-750'
                }`}
              >
                {weather === 'sunny' ? '☀️' : weather === 'rainy' ? '🌧️' : '🌩️'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Embedded Mini-Route Live Map widget */}
      {hasValidKey ? (
        <div className="space-y-1.5 text-left">
          <div className="flex justify-between items-center text-[9px] text-zinc-400 font-bold uppercase">
            <span>📡 Embedded Transit Route Map Overlay</span>
            <span className="text-emerald-500">API ACTIVE</span>
          </div>
          <div className="relative h-40 bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800 shadow-inner">
            <APIProvider apiKey={API_KEY} version="weekly">
              <Map
                defaultCenter={CHIRALA_CENTER}
                defaultZoom={13}
                mapId="RESTAURANT_ESTIMATOR_MAP"
                internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                style={{ width: '100%', height: '100%' }}
                disableDefaultUI={true}
                gestureHandling="cooperative"
              >
                <LiveRouteEstimator
                  restaurantCoords={restaurantCoords}
                  destinationCoords={destinationCoords}
                  isHeavyTraffic={trafficLevel === 'heavy' || trafficLevel === 'jam'}
                  onResult={handleLiveResult}
                  onError={handleLiveError}
                />
              </Map>
            </APIProvider>
          </div>
          {apiError && (
            <p className="text-[8.5px] text-zinc-400 leading-tight border p-2 bg-slate-50 rounded-lg">
              ⚠️ Note: GPS routes queried, falling back to simulated high resolution math because: <span className="font-mono text-zinc-650">{apiError}</span>
            </p>
          )}
        </div>
      ) : (
        <div className="bg-amber-500/5 border border-dashed border-amber-500/25 p-3 rounded-xl space-y-2 text-left">
          <p className="font-bold text-[9px] text-amber-600 dark:text-amber-400 uppercase flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500 animate-pulse" /> Live Telemetry Feed Paused
          </p>
          <p className="text-[9px] text-zinc-400 leading-normal">
            To visualize live GPS coordinates, vector directions and real-time Google Maps traffic lines:
          </p>
          <div className="bg-white dark:bg-zinc-900 border p-2 rounded-lg text-[8.5px] leading-relaxed text-zinc-500">
            Open <strong>Settings</strong> (⚙️ top-right) → <strong>Secrets</strong> → add <code>GOOGLE_MAPS_PLATFORM_KEY</code> as secret variable. Pasted API key is automatically bound without a reload!
          </div>
        </div>
      )}
    </div>
  );
}
