/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  MapPin, X, Navigation, Check, Edit, AlertTriangle, Info, Map, CheckCircle, ChevronLeft
} from 'lucide-react';
import { Address } from '../types';

interface AddressSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAddress?: (addr: Address) => void;
}

export default function AddressSelectorModal({ isOpen, onClose, onSelectAddress }: AddressSelectorModalProps) {
  const { 
    user, 
    currentAddress, 
    setCurrentAddress, 
    updateUserAddresses, 
    saved_addresses, 
    validateDeliveryLocation,
    delivery_locations
  } = useApp();

  const [selectionMode, setSelectionMode] = useState<'CHOICE' | 'MANUAL' | 'ADDRESS_BOOK'>('CHOICE');

  // Manual Address Form states
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [mobileNumber, setMobileNumber] = useState(user?.phone || '');
  const [houseNumber, setHouseNumber] = useState('');
  const [streetName, setStreetName] = useState('');
  const [locality, setLocality] = useState('');
  const [landmark, setLandmark] = useState('');
  const [villageTown, setVillageTown] = useState('');
  const [city, setCity] = useState('Chirala');
  const [district, setDistrict] = useState('Bapatla');
  const [state, setState] = useState('Andhra Pradesh');
  const [pincode, setPincode] = useState('523155');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [addrType, setAddrType] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [lat, setLat] = useState(15.8270);
  const [lng, setLng] = useState(80.3551);
  const [isDefault, setIsDefault] = useState(false);

  // Map adjustment modes
  const [mapMode, setMapMode] = useState<'VIEW' | 'MOVE_PIN' | 'ADJUST_POINT'>('VIEW');
  const [isValidZone, setIsValidZone] = useState(true);

  // Pre-set delivery notes for fast selection
  const deliveryNotesPresets = [
    'Call Before Delivery',
    'Near Water Tank',
    '2nd Floor',
    'Blue Gate House',
    'Security Gate Entry Required'
  ];

  // Run validation whenever coordinates change
  useEffect(() => {
    setIsValidZone(validateDeliveryLocation(lat, lng));
  }, [lat, lng, validateDeliveryLocation]);

  if (!isOpen) return null;

  // Handles requesting and setting live browser location
  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          
          setLat(userLat);
          setLng(userLng);
          
          // Let's check location validation
          const withinZone = validateDeliveryLocation(userLat, userLng);
          
          const autoAddr: Address = {
            id: `addr_curr_${Date.now()}`,
            type: 'Other',
            flatNo: 'GPS Current Location',
            area: withinZone ? 'Within Active Delivery Corridor' : 'Outside Service Area',
            landmark: 'Pin-point coordinates verified',
            city: withinZone ? 'Chirala Region' : 'Detected Outer Bounds',
            gpsCoordinates: { lat: userLat, lng: userLng },
            isDefault: false,
            isManual: false,
            customerName: user?.name,
            mobileNumber: user?.phone
          };
          
          if (!withinZone) {
            alert("Sorry, delivery is currently unavailable for this location.");
          }
          
          setCurrentAddress(autoAddr);
          if (onSelectAddress) onSelectAddress(autoAddr);
          onClose();
        },
        (error) => {
          // Geolocation permission or sensor failure fallback
          console.warn('Geolocation failed, falling back to Town Center defaults', error);
          const fallbackLat = 15.8270;
          const fallbackLng = 80.3551;
          setLat(fallbackLat);
          setLng(fallbackLng);
          
          const fallbackAddr: Address = {
            id: `addr_def_gps_${Date.now()}`,
            type: 'Other',
            flatNo: 'Active Town Center GPS Pin',
            area: 'Muntha Vari bypass',
            landmark: 'Rapid snapped GPS point',
            city: 'Chirala',
            gpsCoordinates: { lat: fallbackLat, lng: fallbackLng },
            isDefault: false,
            isManual: false
          };
          
          setCurrentAddress(fallbackAddr);
          if (onSelectAddress) onSelectAddress(fallbackAddr);
          onClose();
        }
      );
    } else {
      alert('Your browser does not support Geolocation services. Please use manual entry!');
    }
  };

  const handleSaveManualAddress = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerName || !mobileNumber || !houseNumber || !streetName || !locality || !city || !pincode) {
      alert('Please fill out all required form fields highlighted with an asterisk (*).');
      return;
    }

    if (!isValidZone) {
      alert('Sorry, delivery is currently unavailable for this location. Zoom or snap back into active Chirala bounds!');
      return;
    }

    const newManualAddr: Address = {
      id: `addr_man_${Date.now()}`,
      type: addrType,
      flatNo: houseNumber, // Compatible model mappings
      area: locality,
      landmark: landmark,
      city: city,
      gpsCoordinates: { lat, lng },
      isDefault: isDefault,
      
      // Explicit requested Manual Location variables
      isManual: true,
      customerName,
      mobileNumber,
      houseNumber,
      streetName,
      locality,
      villageTown,
      district,
      state,
      pincode,
      deliveryNotes
    };

    // Update user's address array
    let updatedAddresses = [...saved_addresses];
    if (isDefault) {
      updatedAddresses = updatedAddresses.map(a => ({ ...a, isDefault: false }));
    }
    updatedAddresses = [...updatedAddresses, newManualAddr];

    updateUserAddresses(updatedAddresses);
    setCurrentAddress(newManualAddr);
    if (onSelectAddress) onSelectAddress(newManualAddr);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-zinc-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl max-w-md w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center bg-slate-50 dark:bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                if (selectionMode !== 'CHOICE') {
                  setSelectionMode('CHOICE');
                } else {
                  onClose();
                }
              }}
              className="p-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-full cursor-pointer transition text-zinc-600 dark:text-zinc-350 flex items-center justify-center shrink-0"
              title="Back"
              id="address-selector-back-btn"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div>
              <h3 className="font-extrabold text-zinc-900 dark:text-zinc-50 text-base flex items-center gap-1.5">
                <MapPin className="w-4.5 h-4.5 text-orange-500" /> Delivery Location Setup
              </h3>
              <p className="text-[10px] text-zinc-400 mt-0.5">Define your secure coordinates for Chirala local drops</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-full cursor-pointer transition text-zinc-600 dark:text-zinc-350 flex items-center justify-center"
            title="Close"
            id="address-selector-close-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal body content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          
          {selectionMode === 'CHOICE' && (
            <div className="space-y-4 py-4">
              <p className="text-xs text-zinc-500 text-center leading-relaxed">
                To guarantee lightning-fast deliveries within Chirala's operational zones, choose your convenient location entry mode:
              </p>

              {/* CHOICE 1: USE CURRENT LOCATION */}
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                className="w-full p-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl flex flex-col items-center justify-center gap-2 transition duration-200 active:scale-[0.98] shadow-lg shadow-orange-500/10 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Navigation className="w-5 h-5 animate-pulse" />
                  <span className="font-extrabold uppercase text-xs tracking-wider">📍 Use Current Location</span>
                </div>
                <span className="text-[10px] text-orange-100 font-medium">Verify coordinates automatically based on device sensors</span>
              </button>

              <div className="flex items-center gap-3 py-1">
                <div className="h-px bg-slate-150 flex-1 dark:bg-zinc-800" />
                <span className="text-[10px] text-zinc-400 uppercase font-black tracking-wider">OR</span>
                <div className="h-px bg-slate-150 flex-1 dark:bg-zinc-800" />
              </div>

              {/* CHOICE 2: MANUAL ENTRY */}
              <button
                type="button"
                onClick={() => setSelectionMode('MANUAL')}
                className="w-full p-4 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-850 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-2xl flex flex-col items-center justify-center gap-2 transition cursor-pointer"
              >
                <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-100">
                  <Edit className="w-5 h-5 text-zinc-500" />
                  <span className="font-extrabold uppercase text-xs tracking-wider">✍️ Enter Address Manually</span>
                </div>
                <span className="text-[10px] text-zinc-400 font-medium">Specify complete door numbers, street, village and pincodes</span>
              </button>

              {saved_addresses.length > 0 && (
                <div className="pt-2 text-center text-xs">
                  <button 
                    type="button"
                    onClick={() => setSelectionMode('ADDRESS_BOOK')}
                    className="text-orange-500 font-extrabold hover:underline"
                  >
                    📂 Browse Saved Addresses Book ({saved_addresses.length})
                  </button>
                </div>
              )}
            </div>
          )}

          {selectionMode === 'ADDRESS_BOOK' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black uppercase text-zinc-400">My Address book</span>
                <button 
                  type="button"
                  onClick={() => setSelectionMode('CHOICE')}
                  className="text-[10px] text-orange-500 font-bold hover:underline"
                >
                  ← Go Back
                </button>
              </div>

              <div className="space-y-2">
                {saved_addresses.map(addr => (
                  <button
                    key={addr.id}
                    onClick={() => {
                      setCurrentAddress(addr);
                      if (onSelectAddress) onSelectAddress(addr);
                      onClose();
                    }}
                    className="w-full p-3 bg-slate-50 dark:bg-zinc-850/60 hover:bg-orange-500/5 hover:border-orange-500 text-left rounded-xl border border-slate-150 dark:border-zinc-800 transition duration-150 flex justify-between items-start cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">
                          {addr.type === 'Home' ? '🏠' : addr.type === 'Work' ? '🏢' : '📍'}
                        </span>
                        <span className="font-bold text-zinc-800 dark:text-zinc-200 uppercase text-[10.5px]">
                          {addr.type} Address
                        </span>
                        {addr.isDefault && (
                          <span className="text-[8px] bg-amber-500/10 text-amber-600 font-black px-1.5 py-0.2 rounded">DEFAULT</span>
                        )}
                      </div>
                      <p className="text-[10.5px] text-zinc-700 dark:text-zinc-300 mt-1.5 leading-snug font-medium">
                        {addr.customerName ? `${addr.customerName} - ` : ''}{addr.flatNo}, {addr.area}
                      </p>
                      <p className="text-[9.5px] text-zinc-400 mt-0.5">{addr.landmark ? `Landmark: ${addr.landmark}` : ''}</p>
                    </div>
                    <CheckCircle className={`w-4 h-4 shrink-0 transition ${
                      currentAddress?.id === addr.id ? 'text-emerald-500' : 'text-zinc-200'
                    }`} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectionMode === 'MANUAL' && (
            <form onSubmit={handleSaveManualAddress} className="space-y-4 animate-slideIn">
              <div className="flex justify-between items-center pb-1">
                <span className="text-xs font-black uppercase tracking-wider text-orange-500">✍️ Complete Delivery Form</span>
                <button 
                  type="button"
                  onClick={() => setSelectionMode('CHOICE')}
                  className="text-[10px] text-zinc-400 hover:text-zinc-600 font-bold hover:underline"
                >
                  ← Change Method
                </button>
              </div>

              {/* Form group blocks */}
              <div className="space-y-3.5 text-xs bg-slate-50 dark:bg-zinc-850/40 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800">
                
                {/* 1. Name & Mobile */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9.5px] font-black text-zinc-450 uppercase mb-1">Customer Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Satish Rao"
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 p-2 rounded-xl border border-slate-200 dark:border-zinc-850 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[9.5px] font-black text-zinc-450 uppercase mb-1">Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="9-digit or 10-digit no"
                      value={mobileNumber}
                      onChange={e => setMobileNumber(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 p-2 rounded-xl border border-slate-200 dark:border-zinc-850 font-bold"
                    />
                  </div>
                </div>

                {/* 2. House No & Street */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9.5px] font-black text-zinc-450 uppercase mb-1">House Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Flat 5B / Plot 142"
                      value={houseNumber}
                      onChange={e => setHouseNumber(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 p-2 rounded-xl border border-slate-200 dark:border-zinc-850 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[9.5px] font-black text-zinc-455 uppercase mb-1">Street Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. EPR Road Highway"
                      value={streetName}
                      onChange={e => setStreetName(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 p-2 rounded-xl border border-slate-200 dark:border-zinc-850 font-bold"
                    />
                  </div>
                </div>

                {/* 3. Locality & Landmark */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9.5px] font-black text-zinc-455 uppercase mb-1">Area / Locality *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Bypass Market"
                      value={locality}
                      onChange={e => setLocality(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 p-2 rounded-xl border border-slate-200 dark:border-zinc-850 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[9.5px] font-black text-zinc-455 uppercase mb-1">Landmark</label>
                    <input
                      type="text"
                      placeholder="e.g. Opp Water Tank"
                      value={landmark}
                      onChange={e => setLandmark(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 p-2 rounded-xl border border-slate-200 dark:border-zinc-850 font-bold"
                    />
                  </div>
                </div>

                {/* 4. Village/Town & City */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9.5px] font-black text-zinc-455 uppercase mb-1">Village / Town</label>
                    <input
                      type="text"
                      placeholder="e.g. Ramapuram"
                      value={villageTown}
                      onChange={e => setVillageTown(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 p-2 rounded-xl border border-slate-200 dark:border-zinc-850 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[9.5px] font-black text-zinc-455 uppercase mb-1">City *</label>
                    <input
                      type="text"
                      required
                      placeholder="Chirala"
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-805 text-zinc-900 dark:text-zinc-100 p-2 rounded-xl border border-slate-200 dark:border-zinc-850 font-bold"
                    />
                  </div>
                </div>

                {/* 5. District & State & Pincode */}
                <div className="grid grid-cols-3 gap-1.5">
                  <div className="col-span-1">
                    <label className="block text-[9px] font-black text-zinc-450 uppercase mb-1">District</label>
                    <input
                      type="text"
                      value={district}
                      onChange={e => setDistrict(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 p-1.5 rounded-lg border border-slate-200 dark:border-zinc-850 font-bold text-[10.5px]"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[9px] font-black text-zinc-455 mb-1">State</label>
                    <input
                      type="text"
                      value={state}
                      onChange={e => setState(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 p-1.5 rounded-lg border border-slate-200 dark:border-zinc-850 font-bold text-[10.5px]"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[9px] font-black text-zinc-455 mb-1">Pincode *</label>
                    <input
                      type="text"
                      required
                      placeholder="523155"
                      value={pincode}
                      onChange={e => setPincode(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 p-1.5 rounded-lg border border-slate-200 dark:border-zinc-850 font-bold text-[10.5px]"
                    />
                  </div>
                </div>

                {/* 6. Address Type Section */}
                <div>
                  <label className="block text-[9.5px] font-black text-zinc-450 uppercase mb-1.5">Address Type label</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['Home', 'Work', 'Other'] as const).map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setAddrType(type)}
                        className={`py-2 rounded-xl font-extrabold uppercase text-[10px] border transition cursor-pointer ${
                          addrType === type
                            ? 'bg-orange-500 border-orange-500 text-white'
                            : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-750 text-zinc-650 dark:text-zinc-300 hover:bg-slate-50'
                        }`}
                      >
                        {type === 'Home' && '🏠 '}
                        {type === 'Work' && '🏢 '}
                        {type === 'Other' && '📍 '}
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 7. Map Geopin Integration Container */}
                <div className="space-y-2 pt-1 border-t border-slate-100/60 dark:border-zinc-800">
                  <div className="flex justify-between items-center">
                    <label className="block text-[9.5px] font-bold text-orange-500 uppercase tracking-wide">🗺️ Point Adjustment Map</label>
                    <span className="text-[8.5px] text-zinc-400 font-mono">Select pin via custom map below</span>
                  </div>

                  {/* SVG map canvas */}
                  <div className="relative w-full h-[150px] bg-slate-100 dark:bg-zinc-900 rounded-xl overflow-hidden border border-slate-205 dark:border-zinc-800 flex flex-col justify-end">
                    
                    <svg 
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;
                        
                        // Local mathematical map projection for Chirala Town Center at (15.8270, 80.3551)
                        const lngVal = 80.3551 + (x - 170) / 35000;
                        const latVal = 15.8270 - (y - 75) / 35000;
                        
                        setLat(parseFloat(latVal.toFixed(5)));
                        setLng(parseFloat(lngVal.toFixed(5)));
                      }}
                      className="absolute inset-0 w-full h-full cursor-crosshair select-none"
                    >
                      {/* Grid overlays */}
                      <line x1="0" y1="35" x2="100%" y2="35" stroke="#ececec" strokeDasharray="3,3" className="dark:stroke-zinc-800" />
                      <line x1="0" y1="75" x2="100%" y2="75" stroke="#ececec" strokeDasharray="3,3" className="dark:stroke-zinc-800" />
                      <line x1="0" y1="115" x2="100%" y2="115" stroke="#ececec" strokeDasharray="3,3" className="dark:stroke-zinc-800" />
                      
                      <line x1="85" y1="0" x2="85" y2="100%" stroke="#ececec" strokeDasharray="3,3" className="dark:stroke-zinc-800" />
                      <line x1="170" y1="0" x2="170" y2="100%" stroke="#ececec" strokeDasharray="3,3" className="dark:stroke-zinc-800" />
                      <line x1="255" y1="0" x2="255" y2="100%" stroke="#ececec" strokeDasharray="3,3" className="dark:stroke-zinc-800" />

                      {/* Map zones */}
                      <path d="M 230 150 Q 280 110 340 90 L 340 150 Z" fill="#bae6fd" className="dark:fill-sky-950/40 opacity-70" />
                      <path d="M 10 100 Q 50 105 45 150 Z" fill="#dcfce7" className="dark:fill-emerald-950/20" />
                      
                      <path d="M 0 30 H 340" stroke="#cbd5e1" strokeWidth="4" fill="none" className="dark:stroke-zinc-700/60" />
                      <path d="M 170 0 V 150" stroke="#cbd5e1" strokeWidth="2.5" fill="none" className="dark:stroke-zinc-750" />

                      {/* Highlight centers */}
                      <circle cx="170" cy="75" r="8" fill="#fddf47" className="dark:fill-amber-950/60" />

                      {/* PLOTTED GEOPIN OVERLAY */}
                      {(() => {
                        const pinX = 170 + (lng - 80.3551) * 35000;
                        const pinY = 75 - (lat - 15.8270) * 35000;

                        const safeX = Math.max(12, Math.min(328, pinX));
                        const safeY = Math.max(12, Math.min(138, pinY));

                        return (
                          <g transform={`translate(${safeX}, ${safeY})`}>
                            <circle cx="0" cy="0" r="12" fill={isValidZone ? "#f97316" : "#ef4444"} className="animate-ping opacity-30 pointer-events-none" />
                            <path 
                              d="M 0 0 C -3 -3, -6 -8, -6 -12 C -6 -16, -3 -18, 0 -18 C 3 -18, 6 -16, 6 -12 C 6 -8, 3 -3, 0 0 Z" 
                              fill={isValidZone ? "#ea580c" : "#dc2626"} 
                              stroke="#ffffff" 
                              strokeWidth="1" 
                              className="pointer-events-none"
                            />
                            <circle cx="0" cy="-12" r="2.5" fill="#ffffff" />
                          </g>
                        );
                      })()}
                    </svg>

                    <div className="z-10 bg-zinc-900/90 text-[8px] border-t border-zinc-800 text-zinc-150 backdrop-blur-xs py-1 px-3.5 flex justify-between font-mono">
                      <span>Live Snapped: {lat.toFixed(4)}°N, {lng.toFixed(4)}°E</span>
                      <span className={isValidZone ? "text-emerald-400 font-extrabold" : "text-red-400 font-extrabold"}>
                        {isValidZone ? "● Within Operational Area" : "● Outside Zone"}
                      </span>
                    </div>
                  </div>

                  {/* Operational map adjust action buttons requested */}
                  <div className="grid grid-cols-3 gap-1 pt-1 text-[9px] font-black uppercase text-center font-mono">
                    <button
                      type="button"
                      onClick={() => {
                        setMapMode('MOVE_PIN');
                        // Simulation snap alert
                        alert("Pin Movement Mode Activated! Tap on the vector grid above to precisely relocate your delivery destination.");
                      }}
                      className={`p-1.5 border rounded-lg transition ${
                        mapMode === 'MOVE_PIN'
                          ? 'bg-orange-500 border-orange-500 text-white'
                          : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-zinc-650 hover:bg-slate-50'
                      }`}
                    >
                      📍 Move Pin
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMapMode('ADJUST_POINT');
                        // Simulate snapping to nearest zone
                        const nearest = delivery_locations[0];
                        setLat(nearest.lat);
                        setLng(nearest.lng);
                        alert(`Adjusted point precisely to nearest main regional center: ${nearest.label}`);
                      }}
                      className={`p-1.5 border rounded-lg transition ${
                        mapMode === 'ADJUST_POINT'
                          ? 'bg-orange-500 border-orange-500 text-white'
                          : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-zinc-650 hover:bg-slate-50'
                      }`}
                    >
                      🎯 Adjust Pt
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMapMode('VIEW');
                        if (isValidZone) {
                          alert(`Location verified! Verified distance within active Chirala drop corridor.`);
                        } else {
                          alert(`Warning: This coordinate point falls outside active regional bounds! Delivery will be blocked unless coordinates are adjusted.`);
                        }
                      }}
                      className="p-1.5 border bg-emerald-600 text-white border-emerald-600 rounded-lg hover:bg-emerald-700 transition"
                    >
                      🤝 Confirm Loc
                    </button>
                  </div>

                  {/* Delivery validation check notification banner */}
                  {!isValidZone && (
                    <div className="p-3 bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 rounded-xl flex items-start gap-2 border border-red-200 dark:border-red-900 animate-pulse">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <p className="text-[10px] leading-snug font-extrabold text-left">
                        Sorry, delivery is currently unavailable for this location.
                      </p>
                    </div>
                  )}
                </div>

                {/* 8. Delivery notes & Presets */}
                <div className="space-y-1.5 pt-1.5 border-t border-slate-100/60 dark:border-zinc-800">
                  <label className="block text-[9.5px] font-black text-zinc-450 uppercase mb-0.5">Delivery Notes for Rider</label>
                  <input
                    type="text"
                    placeholder="e.g. Near Clock tower, Blue Gate House"
                    value={deliveryNotes}
                    onChange={e => setDeliveryNotes(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 p-2 rounded-xl border border-slate-200 dark:border-zinc-850 font-bold"
                  />
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {deliveryNotesPresets.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setDeliveryNotes(preset)}
                        className="py-1 px-2 text-[8.5px] bg-slate-100 dark:bg-zinc-800 hover:text-orange-600 text-zinc-650 dark:text-zinc-300 font-bold hover:bg-orange-500/10 rounded-lg transition border border-slate-200/50 dark:border-zinc-750"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Default address setting checkbox */}
                <div className="flex items-center gap-2 pt-1 pb-0.5">
                  <input
                    type="checkbox"
                    id="manualAddrDefault"
                    checked={isDefault}
                    onChange={e => setIsDefault(e.target.checked)}
                    className="w-3.5 h-3.5 text-orange-500 focus:ring-orange-500 rounded border-slate-250 cursor-pointer"
                  />
                  <label htmlFor="manualAddrDefault" className="font-extrabold text-[10px] text-zinc-600 dark:text-zinc-300 select-none cursor-pointer">
                    Set as my primary default delivery address
                  </label>
                </div>
              </div>

              {/* Form Footer Buttons */}
              <div className="flex gap-2 justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setSelectionMode('CHOICE')}
                  className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-zinc-700 dark:text-zinc-300 rounded-xl font-bold uppercase text-[10px] tracking-wider transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isValidZone}
                  className={`px-5 py-2 rounded-xl font-black uppercase text-[10px] tracking-wider transition cursor-pointer shadow-md ${
                    isValidZone 
                      ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/10' 
                      : 'bg-zinc-200 text-zinc-400 cursor-not-allowed dark:bg-zinc-800'
                  }`}
                >
                  Save Delivery Address
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
