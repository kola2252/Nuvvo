import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ChevronLeft, X, MapPin, Sparkles, Clock, Compass, HelpCircle, 
  Bike, AlertCircle, CloudSun, Activity, Check, CheckCircle2, Navigation, Heart
} from 'lucide-react';
import SmartDeliveryEstimator from './SmartDeliveryEstimator';
import AddressSelectorModal from './AddressSelectorModal';

export default function DeliveryOptionsScreen() {
  const {
    currentAddress,
    deliveryPartnerTip,
    setDeliveryPartnerTip,
    restaurants,
    pageHistory,
    goBack,
    closePage,
    user
  } = useApp();

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [deliveryMode, setDeliveryMode] = useState<'standard' | 'express' | 'scheduled'>('standard');
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [scheduledTime, setScheduledTime] = useState<string>('');
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>(restaurants[0]?.id || 'rest_1');

  // Handle restaurant selection for the estimator sandbox
  const selectedRestaurant = restaurants.find(r => r.id === selectedRestaurantId) || restaurants[0];

  // Delivery modes pricing and text
  const modes = [
    {
      id: 'standard' as const,
      title: 'Standard Delivery',
      desc: 'Balanced and cost-effective. Direct drop-off at your pinned coordinates.',
      price: '₹39 (FREE over ₹400)',
      timeAdjust: 'Normal prep & transit',
      color: 'border-slate-200 dark:border-zinc-800'
    },
    {
      id: 'express' as const,
      title: 'Express Flash Courier',
      desc: 'Top priority dispatch. Assigns the nearest online rider instantly.',
      price: '₹39 + ₹25 Priority',
      timeAdjust: 'Saves 5-10 mins',
      color: 'border-orange-500/30 bg-orange-550/5 dark:bg-orange-950/10'
    },
    {
      id: 'scheduled' as const,
      title: 'Scheduled Slot drop',
      desc: 'Pre-book a specific time window. Ideal for parties or event planning.',
      price: '₹39 Flat fee',
      timeAdjust: 'At your selected hour',
      color: 'border-blue-500/30 bg-blue-550/5 dark:bg-blue-950/10'
    }
  ];

  return (
    <div className="pb-32 min-h-screen bg-slate-50 dark:bg-zinc-950">
      {/* HEADER */}
      <div className="sticky top-0 bg-white dark:bg-zinc-900 border-b border-slate-100 dark:border-zinc-800 p-4 z-40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={pageHistory.length > 1 ? goBack : closePage}
            className="p-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-full text-zinc-700 dark:text-zinc-300 transition-all cursor-pointer active:scale-95 flex items-center justify-center shrink-0"
            title="Go Back"
            id="delivery-options-back-btn"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={closePage}
            className="p-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-full text-zinc-700 dark:text-zinc-300 transition-all cursor-pointer active:scale-95 flex items-center justify-center shrink-0"
            title="Close to Home"
            id="delivery-options-close-btn"
          >
            <X className="w-4 h-4" />
          </button>
          <h2 className="text-lg font-black text-zinc-900 dark:text-zinc-50 tracking-tight ml-1">Delivery Settings & Options</h2>
        </div>
        <span className="text-[10px] font-mono font-bold bg-orange-500/15 text-orange-600 dark:text-orange-400 px-2.5 py-1 rounded-full uppercase">Logistics Desk</span>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* INFO HERO CARD */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl p-5 text-white shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="relative z-10 space-y-2 text-left">
            <span className="text-[9px] font-extrabold uppercase bg-white/20 border border-white/20 px-2.5 py-0.5 rounded-full tracking-wider">Smart Coordinate Fleet</span>
            <h3 className="text-xl font-extrabold tracking-tight">Configure Your Delivery Protocol</h3>
            <p className="text-xs text-white/90 leading-relaxed max-w-lg">
              Set your global delivery addresses, configure dispatch speed, tip courier executives, and run our real-time GPS traffic & weather simulator.
            </p>
          </div>
        </div>

        {/* SECTION 1: DELIVERY ADDRESS MANAGEMENT */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-5 shadow-xs space-y-4 text-left">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-zinc-800">
            <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-mono flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-500" /> Active Destination Address
            </h4>
            <button
              onClick={() => setShowAddressModal(true)}
              className="text-xs text-orange-500 font-extrabold hover:underline flex items-center gap-1 cursor-pointer"
            >
              Change Address
            </button>
          </div>

          {currentAddress ? (
            <div className="flex gap-3 items-start bg-slate-50 dark:bg-zinc-950 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800">
              <div className="p-2.5 bg-orange-500/10 text-orange-550 rounded-xl font-bold mt-0.5">
                <span className="text-xs uppercase font-mono font-black">{currentAddress.type || 'HOME'}</span>
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <p className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 leading-tight">
                  {currentAddress.flatNo}, {currentAddress.area}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                  Landmark: {currentAddress.landmark || 'No custom landmark noted'}
                </p>
                <div className="flex items-center gap-2 pt-1 text-[10px] font-mono text-zinc-400">
                  <span>GPS: {currentAddress.gpsCoordinates.lat.toFixed(4)}°N, {currentAddress.gpsCoordinates.lng.toFixed(4)}°E</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center p-6 border border-dashed rounded-2xl bg-amber-500/5 border-amber-500/20 space-y-2">
              <p className="text-sm font-extrabold text-amber-600">No Address Currently Chosen</p>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto">Please select your primary delivery coordinate to begin dispatch operations.</p>
              <button
                onClick={() => setShowAddressModal(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs px-4 py-2 rounded-xl"
              >
                Set Geolocation
              </button>
            </div>
          )}
        </div>

        {/* SECTION 2: DISPATCH SPEED OPTIONS */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-5 shadow-xs space-y-4 text-left">
          <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-mono flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-zinc-800">
            <Compass className="w-4 h-4 text-orange-500" /> Dispatch Delivery Speeds
          </h4>

          <div className="space-y-3">
            {modes.map((m) => {
              const isSelected = deliveryMode === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => setDeliveryMode(m.id)}
                  className={`p-4 rounded-2.5xl border-2 transition-all cursor-pointer relative ${
                    isSelected 
                      ? 'border-orange-500 bg-orange-500/5 dark:bg-orange-950/10' 
                      : 'border-slate-150 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-zinc-900 dark:text-zinc-55">{m.title}</span>
                        {isSelected && <span className="bg-orange-500 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md">ACTIVE</span>}
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{m.desc}</p>
                      <div className="flex items-center gap-3 pt-1 text-[10px] font-semibold text-zinc-450">
                        <span className="text-orange-500">{m.price}</span>
                        <span className="text-zinc-300 dark:text-zinc-700">•</span>
                        <span>{m.timeAdjust}</span>
                      </div>
                    </div>
                    <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-zinc-700 flex items-center justify-center shrink-0">
                      {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />}
                    </div>
                  </div>

                  {m.id === 'scheduled' && isSelected && (
                    <div className="mt-4 pt-4 border-t border-dashed border-slate-200 dark:border-zinc-800 grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-black uppercase text-zinc-400 tracking-wider mb-1">Select Delivery Date</label>
                        <input
                          type="date"
                          value={scheduledDate}
                          onChange={(e) => setScheduledDate(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs rounded-xl p-2.5 outline-none focus:border-orange-500 text-zinc-800 dark:text-zinc-200"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black uppercase text-zinc-400 tracking-wider mb-1">Select Time Window</label>
                        <select
                          value={scheduledTime}
                          onChange={(e) => setScheduledTime(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs rounded-xl p-2.5 outline-none focus:border-orange-500 text-zinc-800 dark:text-zinc-200"
                        >
                          <option value="">Choose slot</option>
                          <option value="12:00 PM - 01:00 PM">12:00 PM - 01:00 PM</option>
                          <option value="01:00 PM - 02:00 PM">01:00 PM - 02:00 PM</option>
                          <option value="07:00 PM - 08:00 PM">07:00 PM - 08:00 PM</option>
                          <option value="08:00 PM - 09:00 PM">08:00 PM - 09:00 PM</option>
                          <option value="09:00 PM - 10:00 PM">09:00 PM - 10:00 PM</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 3: RIDER TIPPING */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-5 shadow-xs space-y-4 text-left">
          <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-mono flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-zinc-800">
            <Bike className="w-4 h-4 text-orange-500" /> Tipping Support Preference
          </h4>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Support our delivery executives with an optional tip. 100% of the tips are directly credited to the assigned rider's bank account instantly upon final delivery reconciliation.
          </p>

          <div className="flex gap-2.5">
            {[0, 10, 20, 30, 50].map((amt) => {
              const isSelected = deliveryPartnerTip === amt;
              return (
                <button
                  key={amt}
                  onClick={() => setDeliveryPartnerTip(amt)}
                  className={`flex-1 py-3 px-2 rounded-2xl border text-center transition-all cursor-pointer font-bold ${
                    isSelected 
                      ? 'border-orange-500 bg-orange-500 text-white shadow-xs' 
                      : 'border-slate-150 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 hover:border-slate-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold tracking-wider block opacity-75">{amt === 0 ? 'No Tip' : 'Tip'}</span>
                  <span className="font-mono text-sm mt-0.5 block">{amt === 0 ? '₹0' : `₹${amt}`}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 4: SMART DELIVERY ESTIMATOR SANDBOX */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-5 shadow-xs space-y-4 text-left">
            <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-mono flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-zinc-800">
              <Sparkles className="w-4 h-4 text-orange-500" /> Logistics Estimate Sandbox
            </h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Test prep delays, traffic density multipliers, and weather conditions for any active kitchen outlet in Chirala mapped directly to your current address coordinates.
            </p>

            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-zinc-400 tracking-wider">Select Kitchen / Restaurant</label>
              <select
                value={selectedRestaurantId}
                onChange={(e) => setSelectedRestaurantId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs rounded-xl p-3 outline-none focus:border-orange-500 font-extrabold text-zinc-800 dark:text-zinc-200"
              >
                {restaurants.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.cuisines?.slice(0, 2).join(', ') || 'Multi-cuisine'})
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2">
              <SmartDeliveryEstimator 
                restaurant={selectedRestaurant}
                currentAddress={currentAddress}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ADDRESS MODAL LINKAGE */}
      {showAddressModal && (
        <AddressSelectorModal 
          isOpen={showAddressModal}
          onClose={() => setShowAddressModal(false)}
        />
      )}
    </div>
  );
}
