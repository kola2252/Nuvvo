/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'motion/react';
import { 
  ShoppingBag, Trash2, Plus, Minus, Tag, Check, ArrowRight, MapPin, 
  Wallet, FileText, ChevronRight, ChevronLeft, X, PhoneCall, AlertTriangle, Coins, Sparkles,
  Calendar, Clock, PlusCircle, RefreshCw, Camera, Award, CreditCard
} from 'lucide-react';
import AddressSelectorModal from './AddressSelectorModal';
import QRCodeScannerModal from './QRCodeScannerModal';
import PaymentMethodScreen from './PaymentMethodScreen';
import { PaymentMethodType } from '../types';

export default function CartScreen() {
  const { 
    cart, updateCartQuantity, removeFromCart, currentAddress,
    appliedCoupon, applyCouponCode, removeCouponCode, couponsList,
    deliveryPartnerTip, setDeliveryPartnerTip,
    orderInstructions, setOrderInstructions,
    createNewOrder, setActiveTrackingOrder, setCurrentPage, setSelectedFoodItem,
    user, validateDeliveryLocation,
    nuvvoPoints, pointsToRedeem, redeemPointsForDiscount, cancelPointsRedemption,
    restaurants, clickToWhatsAppFoodBooking,
    pageHistory, goBack, closePage
  } = useApp();

  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'payment'>('cart');
  const [showAddrModal, setShowAddrModal] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [pointsInput, setPointsInput] = useState('');
  const [pointsError, setPointsError] = useState('');
  const [showCouponsDialog, setShowCouponsDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('UPI');
  const [lastPaymentDetails, setLastPaymentDetails] = useState<any>(null);
  const [phonePeNumber, setPhonePeNumber] = useState(() => {
    try {
      return localStorage.getItem('nuvvo_googlepay_number') || '7702906994';
    } catch {
      return '7702906994';
    }
  });
  
  // Custom tipping state
  const [showCustomTip, setShowCustomTip] = useState(false);
  const [customTipValue, setCustomTipValue] = useState('');

  const [selectedUPIId, setSelectedUPIId] = useState<string | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const savedCards = (() => {
    if (!user) return [];
    try {
      const stored = localStorage.getItem(`nuvvo_cards_${user.phone}`);
      return stored ? JSON.parse(stored) : [
        { id: 'card_demo_1', cardHolder: user.name || 'John Doe', cardNumber: '•••• •••• •••• 1256', expiryDate: '09/29', cardBrand: 'RuPay' },
        { id: 'card_demo_2', cardHolder: user.name || 'John Doe', cardNumber: '•••• •••• •••• 4821', expiryDate: '12/31', cardBrand: 'Visa' }
      ];
    } catch {
      return [];
    }
  })();

  const savedUPIs = (() => {
    if (!user) return [];
    const activeGPayNum = (() => {
      try {
        return localStorage.getItem('nuvvo_googlepay_number') || '7702906994';
      } catch {
        return '7702906994';
      }
    })();
    try {
      const stored = localStorage.getItem(`nuvvo_upis_${user.phone}`);
      return stored ? JSON.parse(stored) : [
        { id: 'upi_demo_1', name: 'Google Pay Primary', upiId: `${activeGPayNum}@okhdfcbank`, provider: 'GPAY' },
        { id: 'upi_demo_2', name: 'PhonePe Secondary', upiId: `${activeGPayNum}@ybl`, provider: 'PHONEPE' }
      ];
    } catch {
      return [];
    }
  })();

  // Scheduling states
  const [scheduleMode, setScheduleMode] = useState<'ASAP' | 'SCHEDULED'>('ASAP');
  
  // Calculate relative dates beautifully
  const todayISO = new Date().toISOString().split('T')[0];
  const tomDateObj = new Date();
  tomDateObj.setDate(tomDateObj.getDate() + 1);
  const tomorrowISO = tomDateObj.toISOString().split('T')[0];
  
  const dayAfterObj = new Date();
  dayAfterObj.setDate(dayAfterObj.getDate() + 2);
  const dayAfterISO = dayAfterObj.toISOString().split('T')[0];
  
  const [selectedDate, setSelectedDate] = useState<string>(todayISO);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('Lunch (12:00 PM - 01:00 PM)');
  const [customTime, setCustomTime] = useState<string>('12:00');

  // Helper date-format utility for nice UI pills
  const formatPillDate = (isoStr: string, label: string) => {
    const [year, month, day] = isoStr.split('-');
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const mIdx = parseInt(month, 10) - 1;
    return {
      label,
      dateFormatted: `${day} ${monthNames[mIdx] || month}`,
      iso: isoStr
    };
  };

  const dayPills = [
    formatPillDate(todayISO, 'Today'),
    formatPillDate(tomorrowISO, 'Tomorrow'),
    formatPillDate(dayAfterISO, 'Day After')
  ];

  const presets = [
    'Lunch (12:00 PM - 01:00 PM)',
    'Afternoon (02:00 PM - 03:00 PM)',
    'Evening (05:00 PM - 06:00 PM)',
    'Dinner (08:00 PM - 09:00 PM)',
    'Late Night (09:30 PM - 10:30 PM)',
    'Specify Custom Time'
  ];

  const getScheduledTimeString = () => {
    if (scheduleMode === 'ASAP') return undefined;
    
    let dateStr = selectedDate;
    if (selectedDate === todayISO) {
      dateStr = 'Today';
    } else if (selectedDate === tomorrowISO) {
      dateStr = 'Tomorrow';
    } else {
      const [year, month, day] = selectedDate.split('-');
      if (day && month) {
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const mIdx = parseInt(month, 10) - 1;
        dateStr = `${day} ${monthNames[mIdx] || month}`;
      }
    }
    
    let timeStr = selectedTimeSlot;
    if (selectedTimeSlot === 'Specify Custom Time') {
      if (customTime) {
        const [hours, minutes] = customTime.split(':');
        const h = parseInt(hours, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const formattedHours = h % 12 === 0 ? 12 : h % 12;
        timeStr = `${formattedHours}:${minutes} ${ampm}`;
      } else {
        timeStr = 'Custom Time';
      }
    }
    
    return `${dateStr}, ${timeStr}`;
  };

  // Calculates rates
  const subtotal = cart.reduce((temp, item) => temp + (item.foodItem.discountPrice || item.foodItem.price) * item.quantity, 0);

  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      discount = Math.min(100, Math.round(subtotal * (appliedCoupon.value / 100)));
    } else {
      discount = Math.min(subtotal, appliedCoupon.value);
    }
  }

  // Loyalty points discount calculation
  let pointsDiscount = 0;
  if (pointsToRedeem > 0) {
    pointsDiscount = Math.min(subtotal - discount, pointsToRedeem);
  }

  const deliveryFee = subtotal > 400 ? 0 : 39; // Free delivery threshold
  const packagingFee = subtotal > 0 ? 15 : 0;
  const tax = Math.round(subtotal * 0.05); // 5% GST on hotel foods
  const finalAmount = Math.max(0, subtotal - discount - pointsDiscount + deliveryFee + packagingFee + tax + deliveryPartnerTip);

  const handleApplyCoupon = (e?: React.FormEvent, directCode?: string) => {
    if (e) e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    
    const targetCode = directCode || couponInput;
    if (!targetCode.trim()) {
      setCouponError('Please enter a voucher key code.');
      return;
    }

    const res = applyCouponCode(targetCode);
    if (res.success) {
      setCouponSuccess(res.message);
      setCouponInput('');
      setShowCouponsDialog(false);
    } else {
      setCouponError(res.message);
    }
  };

  const handleApplyPoints = (e: React.FormEvent) => {
    e.preventDefault();
    setPointsError('');
    const pts = parseInt(pointsInput);
    if (isNaN(pts) || pts <= 0) {
      setPointsError('Please enter a valid positive rewards amount.');
      return;
    }
    const maxRedeemable = subtotal - discount;
    if (pts > maxRedeemable) {
      setPointsError(`Maximum points redeemable for this order value is ${maxRedeemable} points.`);
      return;
    }
    const res = redeemPointsForDiscount(pts);
    if (res.success) {
      setPointsInput('');
    } else {
      setPointsError(res.message);
    }
  };

  const handleApplyMaxPoints = () => {
    setPointsError('');
    const maxRedeemable = Math.min(nuvvoPoints, subtotal - discount);
    if (maxRedeemable <= 0) {
      setPointsError('Order value is fully discounted or points balance is empty.');
      return;
    }
    const res = redeemPointsForDiscount(maxRedeemable);
    if (!res.success) {
      setPointsError(res.message);
    }
  };

  const handleCreateOrder = () => {
    if (cart.length === 0) return;
    if (!currentAddress) {
      alert('Kindly configure or select a valid delivery address in your Profile or Cart.');
      return;
    }

    if (currentAddress.gpsCoordinates) {
      const isValid = validateDeliveryLocation(currentAddress.gpsCoordinates.lat, currentAddress.gpsCoordinates.lng);
      if (!isValid) {
        alert('Sorry, delivery is currently unavailable for this location. Please adjust your delivery pin closer to active operational sectors.');
        return;
      }
    }

    const scheduledVal = scheduleMode === 'SCHEDULED' ? getScheduledTimeString() : undefined;
    
    // Check if customer selected a saved card or saved UPI
    let checkoutMsg = '';
    if (paymentMethod === 'PhonePe' && selectedCardId) {
      const card = savedCards.find(c => c.id === selectedCardId);
      if (card) {
        checkoutMsg = `💳 Authorized with saved ${card.cardBrand} ${card.cardNumber}`;
      }
    } else if (paymentMethod === 'UPI' && selectedUPIId) {
      const upi = savedUPIs.find(u => u.id === selectedUPIId);
      if (upi) {
        checkoutMsg = `⚡ Secured with Saved UPI: ${upi.upiId}`;
      }
    }

    const created = createNewOrder(
      paymentMethod, 
      paymentMethod === 'PhonePe' ? phonePeNumber : undefined,
      scheduledVal
    );
    if (created) {
      if (checkoutMsg) {
        alert(`${checkoutMsg}\n\nYour order has been authorized securely and placed instantly!`);
      }
      setTimeout(() => {
        setCurrentPage('tracking'); // Redirect smoothly to real-time live map simulation
      }, 400);
    }
  };

  const handleExecuteOrderWithPayment = (method: PaymentMethodType, paymentDetails?: any) => {
    if (cart.length === 0) return;
    if (!currentAddress) {
      alert('Kindly configure or select a valid delivery address in your Profile or Cart.');
      setCheckoutStep('cart');
      return;
    }

    if (currentAddress.gpsCoordinates) {
      const isValid = validateDeliveryLocation(currentAddress.gpsCoordinates.lat, currentAddress.gpsCoordinates.lng);
      if (!isValid) {
        alert('Sorry, delivery is currently unavailable for this location. Please adjust your delivery pin closer to active operational sectors.');
        setCheckoutStep('cart');
        return;
      }
    }

    const scheduledVal = scheduleMode === 'SCHEDULED' ? getScheduledTimeString() : undefined;
    setPaymentMethod(method);
    setLastPaymentDetails(paymentDetails);

    const created = createNewOrder(
      method, 
      paymentDetails || (method === 'PhonePe' ? phonePeNumber : undefined),
      scheduledVal
    );

    if (created) {
      setTimeout(() => {
        setCurrentPage('tracking'); // Redirect smoothly to real-time live map simulation
      }, 400);
    }
  };

  if (cart.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, x: 35 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6 text-center pb-24 duration-300"
      >
        <div className="w-24 h-24 bg-gradient-to-tr from-orange-400/20 to-amber-500/15 rounded-full flex items-center justify-center mb-4 border text-orange-500">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-50">Your food basket is empty</h3>
        <p className="text-xs text-zinc-500 max-w-xs mt-1">Nuvvo offers approximately 200 culinary highlights customized to your cravings. Go add some!</p>
        <button 
          onClick={() => setCurrentPage('home')}
          aria-label="Return to dishes and kitchens home menu"
          className="mt-6 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md cursor-pointer"
        >
          Check out the Dishes Menu
        </button>
      </motion.div>
    );
  }

  // Dedicated Payment Method Selection Step
  if (checkoutStep === 'payment') {
    return (
      <PaymentMethodScreen
        amountPayable={finalAmount}
        deliveryAddress={currentAddress}
        itemCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        subtotal={subtotal}
        discount={discount + pointsDiscount}
        deliveryFee={deliveryFee}
        packagingFee={packagingFee}
        tax={tax}
        tip={deliveryPartnerTip}
        userPhone={user?.phone}
        userName={user?.name}
        onBack={() => setCheckoutStep('cart')}
        onCompletePayment={(method, details) => {
          handleExecuteOrderWithPayment(method, details);
        }}
      />
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: 35 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-screen bg-slate-50 dark:bg-zinc-950 pb-32 transition-colors duration-300"
    >
      
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-zinc-900 border-b border-slate-100 dark:border-zinc-800 p-4 z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={pageHistory.length > 1 ? goBack : closePage}
            className="p-1.5 bg-slate-150 dark:bg-zinc-800 hover:bg-slate-250 dark:hover:bg-zinc-700 rounded-full text-zinc-700 dark:text-zinc-300 transition-all cursor-pointer active:scale-95 flex items-center justify-center shrink-0"
            title="Go Back"
            id="cart-screen-back-btn"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={closePage}
            className="p-1.5 bg-slate-150 dark:bg-zinc-800 hover:bg-slate-250 dark:hover:bg-zinc-700 rounded-full text-zinc-700 dark:text-zinc-300 transition-all cursor-pointer active:scale-95 flex items-center justify-center shrink-0"
            title="Close to Home"
            id="cart-screen-close-btn"
          >
            <X className="w-4 h-4" />
          </button>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 tracking-tight ml-1">Shopping Checkout</h2>
        </div>
        <span className="text-xs font-mono font-bold text-zinc-400">Secure AES Endpoint</span>
      </div>

      <div className="p-4 max-w-md mx-auto space-y-4">
        
        {/* CART ITEMS LIST */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-4 shadow-sm space-y-4">
          <h3 className="text-xs font-bold font-mono tracking-widest text-zinc-400 uppercase">Items Selected</h3>
          
          <div className="divide-y divide-slate-100 dark:divide-zinc-800 space-y-3">
            {cart.map((item, idx) => (
              <div key={`${item.foodItem.id}_${idx}`} className="flex items-start gap-3 pt-3 first:pt-0">
                <img 
                  src={item.foodItem.image} 
                  alt={item.foodItem.name} 
                  className="w-14 h-14 rounded-xl object-cover cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setSelectedFoodItem(item.foodItem)}
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 overflow-hidden">
                  <h4 
                    className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100 truncate cursor-pointer hover:text-orange-500 transition-colors"
                    onClick={() => setSelectedFoodItem(item.foodItem)}
                  >
                    {item.foodItem.name}
                  </h4>
                  <p className="text-[9px] text-zinc-400 uppercase font-mono mt-0.5">{item.foodItem.category}</p>
                  
                  {/* Customization options listed */}
                  {Object.keys(item.selectedCustomizations).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {Object.entries(item.selectedCustomizations).map(([cat, choice]: any) => (
                        <span key={cat} className="text-[8px] bg-slate-100 dark:bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded font-bold">
                          {choice.name} {choice.price > 0 ? `(+₹${choice.price})` : ''}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs font-black font-mono text-zinc-800 dark:text-zinc-300">
                      ₹{(item.foodItem.discountPrice || item.foodItem.price) * item.quantity}
                    </span>
                    
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => removeFromCart(item.foodItem.id)}
                        aria-label={`Remove ${item.foodItem.name} from cart`}
                        className="text-zinc-400 hover:text-rose-500 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="flex items-center bg-slate-100 dark:bg-zinc-800 rounded-lg text-xs font-bold px-1.5 py-0.5 gap-2">
                        <button 
                          onClick={() => updateCartQuantity(item.foodItem.id, -1)} 
                          aria-label={`Decrease quantity of ${item.foodItem.name}`}
                          className="p-0.5"
                        >
                          <Minus className="w-3 h-3 text-zinc-500" />
                        </button>
                        <span>{item.quantity}</span>
                        <button 
                          onClick={() => updateCartQuantity(item.foodItem.id, 1)} 
                          aria-label={`Increase quantity of ${item.foodItem.name}`}
                          className="p-0.5"
                        >
                          <Plus className="w-3 h-3 text-zinc-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DRIVER TIPPING */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-4 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-amber-500" />
                Tip Delivery Partner
              </h4>
              <p className="text-[10px] text-zinc-400">100% of tips are credited directly to the rider's wallet.</p>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-1.5">
            {[10, 20, 30, 50].map(amt => {
              const isSelected = deliveryPartnerTip === amt;
              return (
                <button
                  key={amt}
                  type="button"
                  onClick={() => {
                    setDeliveryPartnerTip(isSelected ? 0 : amt);
                    setShowCustomTip(false);
                    setCustomTipValue('');
                  }}
                  className={`py-2 text-[11px] font-bold rounded-xl border font-mono transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-orange-500 text-white border-orange-500 shadow-xs'
                      : 'bg-slate-50 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 border-slate-200/60 dark:border-zinc-700/80 hover:bg-slate-100 dark:hover:bg-zinc-700/50'
                  }`}
                >
                  +₹{amt}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => {
                setShowCustomTip(!showCustomTip);
                if (deliveryPartnerTip > 0 && [10, 20, 30, 50].includes(deliveryPartnerTip)) {
                  setDeliveryPartnerTip(0);
                }
              }}
              className={`py-2 text-[10px] font-bold rounded-xl border transition-all cursor-pointer ${
                showCustomTip || (deliveryPartnerTip > 0 && ![10, 20, 30, 50].includes(deliveryPartnerTip))
                  ? 'bg-orange-500 text-white border-orange-500 shadow-xs'
                  : 'bg-slate-50 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 border-slate-200/60 dark:border-zinc-700/80 hover:bg-slate-100 dark:hover:bg-zinc-700/50'
              }`}
            >
              Custom
            </button>
          </div>

          {/* Expandable Custom Tip Input */}
          {(showCustomTip || (deliveryPartnerTip > 0 && ![10, 20, 30, 50].includes(deliveryPartnerTip))) && (
            <div className="bg-slate-50 dark:bg-zinc-900/40 p-2.5 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800/80 space-y-2 animate-fadeIn">
              <div className="flex items-center gap-2">
                <span className="text-[10.5px] font-bold text-zinc-650 dark:text-zinc-350 shrink-0">Enter Custom Tip (₹):</span>
                <input
                  type="number"
                  placeholder="e.g. 15, 40, 100"
                  value={customTipValue || (deliveryPartnerTip > 0 && ![10, 20, 30, 50].includes(deliveryPartnerTip) ? String(deliveryPartnerTip) : '')}
                  onChange={(e) => {
                    const raw = e.target.value;
                    setCustomTipValue(raw);
                    const val = parseInt(raw, 10);
                    if (!isNaN(val) && val >= 0) {
                      setDeliveryPartnerTip(Math.min(val, 500)); // cap at 500 to protect against typos
                    } else {
                      setDeliveryPartnerTip(0);
                    }
                  }}
                  className="flex-1 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 px-2.5 py-1.5 text-xs font-mono font-bold rounded-lg border border-slate-200 dark:border-zinc-800 focus:outline-none focus:border-orange-500"
                />
              </div>
              <p className="text-[9px] text-zinc-400">
                Please enter a reasonable tip amount (max ₹500). Thank you for supporting our delivery fleet!
              </p>
            </div>
          )}

          {/* Dynamic appreciation message */}
          {deliveryPartnerTip > 0 && (
            <div className="bg-amber-500/[0.03] dark:bg-amber-500/[0.01] border border-amber-500/10 p-2.5 rounded-2xl flex items-center gap-2 text-[10.5px] text-amber-700 dark:text-amber-400 font-medium animate-fadeIn">
              <span className="text-sm shrink-0">
                {deliveryPartnerTip <= 15 ? '🏍️' : deliveryPartnerTip <= 25 ? '😊' : deliveryPartnerTip <= 45 ? '🌟' : '🦸✨'}
              </span>
              <span>
                {deliveryPartnerTip <= 15 
                  ? `Thank you! This covers part of the rider's fuel costs.` 
                  : deliveryPartnerTip <= 25 
                    ? `Generous tip! This will bring a bright smile to your rider.` 
                    : deliveryPartnerTip <= 45 
                      ? `Fantastic support! This really motivates our hard-working partners.` 
                      : `Hero Status! A beautiful, exceptional gesture of appreciation!`}
              </span>
            </div>
          )}
        </div>

        {/* DELIVERY INSTRUCTIONS */}
        <div id="delivery-instructions-card" className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-4 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-50">Delivery Instructions</h4>
              <p className="text-[10px] text-zinc-400">Provide specific notes for the rider to find your location easily.</p>
            </div>
            <FileText className="w-5 h-5 text-orange-500" />
          </div>

          <div className="relative">
            <textarea 
              id="delivery-instructions-input"
              placeholder="Provide specific notes (like 'leave at door', 'gate code: 1234', 'avoid ringing bell')..."
              value={orderInstructions}
              onChange={e => setOrderInstructions(e.target.value)}
              className="w-full bg-slate-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 pl-4 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 focus:outline-none focus:border-orange-500 font-medium h-20 resize-none transition-all duration-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
            />
          </div>

          {/* Preset Utility Chips */}
          <div className="space-y-1.5">
            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Quick Presets:</span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: '🚪 Leave at door', value: 'Leave at door' },
                { label: '🔑 Gate code', value: 'Gate code: ' },
                { label: '🔕 Avoid ringing bell', value: 'Avoid ringing bell' },
                { label: '📞 Call on arrival', value: 'Call on arrival' }
              ].map(preset => {
                const isSelected = orderInstructions.includes(preset.value);
                return (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => {
                      setOrderInstructions(prev => {
                        const trimmed = prev.trim();
                        if (trimmed.includes(preset.value)) {
                          // Filter out the preset
                          const regex = new RegExp(`\\s*,?\\s*${preset.value.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\s*,?\\s*`, 'g');
                          let updated = trimmed.replace(regex, ' ').trim();
                          if (updated.startsWith(',')) updated = updated.substring(1).trim();
                          if (updated.endsWith(',')) updated = updated.substring(0, updated.length - 1).trim();
                          return updated;
                        } else {
                          return trimmed ? `${trimmed}, ${preset.value}` : preset.value;
                        }
                      });
                    }}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'bg-orange-500/10 text-orange-650 border-orange-550/30'
                        : 'bg-slate-50 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-355 border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-750'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* COUPON REDEMPTION VOUCHERS */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-4 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-xs font-black text-zinc-900 dark:text-zinc-50 tracking-tight flex items-center gap-1.5">
              <Tag className="w-4.5 h-4.5 text-orange-500" /> Apply Vouchers
            </h4>
            <button 
              onClick={() => setShowCouponsDialog(true)}
              className="text-[10px] text-orange-500 font-bold hover:underline bg-transparent border-none cursor-pointer"
            >
              View Coupons List
            </button>
          </div>

          {appliedCoupon ? (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3 flex items-center justify-between animate-fadeIn">
              <div className="overflow-hidden">
                <span className="text-[10px] font-mono font-black border border-emerald-500 text-emerald-600 px-2 py-0.5 rounded-md bg-white">
                  {appliedCoupon.code}
                </span>
                <p className="text-[10px] text-emerald-800 dark:text-emerald-400 font-medium mt-1.5 truncate">
                  Voucher applied successfully! Saved ₹{discount}.
                </p>
              </div>
              <button 
                onClick={removeCouponCode}
                className="text-[10px] text-rose-500 font-black uppercase hover:underline ml-2"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="space-y-3.5">
              <button
                type="button"
                onClick={() => setShowQRScanner(true)}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white py-3 rounded-2xl font-extrabold text-xs transition-all shadow-md shadow-orange-500/10 flex items-center justify-center gap-2 active:scale-98 cursor-pointer border-none"
              >
                <Camera className="w-4 h-4 text-white animate-pulse" />
                <span>Scan Physical Voucher QR / Flyer</span>
              </button>

              <div className="flex items-center gap-2 select-none">
                <div className="h-[1px] bg-slate-100 dark:bg-zinc-800 flex-1" />
                <span className="text-[9px] font-black uppercase text-zinc-400 font-mono tracking-widest whitespace-nowrap">Or type manually</span>
                <div className="h-[1px] bg-slate-105 dark:bg-zinc-800 flex-1" />
              </div>

              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input 
                  type="text"
                  placeholder="Try NUVVO50, FREEDELIVERY"
                  value={couponInput}
                  onChange={e => setCouponInput(e.target.value.toUpperCase())}
                  className="flex-1 bg-slate-50 dark:bg-zinc-850 text-zinc-900 dark:text-zinc-100 px-3 py-2.5 rounded-xl border border-slate-150 dark:border-zinc-750 text-xs font-bold"
                />
                <button 
                  type="submit"
                  className="bg-zinc-900 hover:bg-zinc-855 text-white dark:bg-zinc-800 dark:hover:bg-zinc-700 px-4 rounded-xl text-xs font-extrabold cursor-pointer border-none"
                >
                  Apply
                </button>
              </form>
            </div>
          )}

          {couponError && <p className="text-[10px] text-rose-500 font-bold mt-1">⚠️ {couponError}</p>}
        </div>

        {/* NUVVO LOYALTY REWARDS REDEMPTION */}
        <div id="nuvvo-loyalty-rewards-redemption" className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-4 shadow-sm space-y-3">
          <div className="flex justify-between items-center pb-2.5 border-b border-slate-100 dark:border-zinc-800/80">
            <h4 className="text-xs font-black text-zinc-900 dark:text-zinc-50 tracking-tight flex items-center gap-1.5">
              <Award className="w-4.5 h-4.5 text-[#554de6]" /> Redeem Nuvvo Points
            </h4>
            <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/30 text-indigo-705 dark:text-indigo-400 font-black px-2.5 py-0.5 rounded-full">
              🥈 {nuvvoPoints} PTS Avail.
            </span>
          </div>

          {pointsToRedeem > 0 ? (
            <div className="bg-indigo-500/10 dark:bg-indigo-950/15 border border-indigo-200 dark:border-indigo-900/40 rounded-2xl p-3 flex items-center justify-between animate-fadeIn">
              <div className="overflow-hidden">
                <span className="text-[9px] font-mono font-black border border-indigo-505 text-indigo-600 px-2 py-0.5 rounded-md bg-white">
                  Active Redeem
                </span>
                <p className="text-[10px] text-indigo-950 dark:text-indigo-300 font-semibold mt-1.5 leading-snug">
                  Applied ₹{pointsDiscount} discount using {pointsToRedeem} points!
                </p>
              </div>
              <button 
                onClick={cancelPointsRedemption}
                className="text-[10px] text-rose-500 font-black uppercase hover:underline ml-2 bg-transparent border-none cursor-pointer whitespace-nowrap"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-snug">
                Each Nuvvo Point is worth <strong className="text-zinc-800 dark:text-zinc-200 font-bold">₹1</strong> of direct order discount. Tap "Redeem Max" or enter any custom amount to apply cashback.
              </p>
              
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleApplyMaxPoints}
                  className="w-full bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/20 dark:hover:bg-indigo-100/10 text-indigo-650 dark:text-indigo-400 py-2.5 rounded-xl font-extrabold text-[10.5px] transition-all border-none cursor-pointer"
                >
                  ⚡ Redeem Max ({Math.min(nuvvoPoints, subtotal - discount)} pts)
                </button>
              </div>

              <div className="flex items-center gap-2 select-none">
                <div className="h-[1px] bg-slate-100 dark:bg-zinc-800 flex-1" />
                <span className="text-[8px] font-black uppercase text-zinc-400 font-mono tracking-widest whitespace-nowrap">Or custom points</span>
                <div className="h-[1px] bg-slate-100 dark:bg-zinc-800 flex-1" />
              </div>

              <form onSubmit={handleApplyPoints} className="flex gap-2">
                <input 
                  type="number"
                  placeholder={`Max: ${Math.min(nuvvoPoints, subtotal - discount)}`}
                  value={pointsInput}
                  onChange={e => setPointsInput(e.target.value)}
                  className="flex-1 bg-slate-50 dark:bg-zinc-850 text-zinc-900 dark:text-zinc-100 px-3 py-2.5 rounded-xl border border-slate-150 dark:border-zinc-750 text-xs font-bold font-mono"
                />
                <button 
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 rounded-xl text-xs font-extrabold cursor-pointer border-none"
                >
                  Apply
                </button>
              </form>
            </div>
          )}

          {pointsError && <p className="text-[10px] text-rose-500 font-bold mt-1">⚠️ {pointsError}</p>}
        </div>

        {/* BILLING BREAKDOWN */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-4 shadow-sm space-y-2">
          <h3 className="text-xs font-bold font-mono tracking-widest text-zinc-400 uppercase mb-2">Cost Breakdowns</h3>
          
          <div className="flex justify-between text-xs text-zinc-650 dark:text-zinc-400">
            <span>Dish Subtotal</span>
            <span className="font-mono">₹{subtotal}</span>
          </div>

          {appliedCoupon && (
            <div className="flex justify-between text-xs text-emerald-600 dark:text-emerald-400 font-bold">
              <span>Coupon Discount ({appliedCoupon.code})</span>
              <span className="font-mono">-₹{discount}</span>
            </div>
          )}

          {pointsToRedeem > 0 && (
            <div className="flex justify-between text-xs text-indigo-600 dark:text-indigo-400 font-bold animate-fadeIn">
              <span>Nuvvo Points Discount</span>
              <span className="font-mono">-₹{pointsDiscount}</span>
            </div>
          )}

          <div className="flex justify-between text-xs text-zinc-650 dark:text-zinc-400">
            <span>Local Packaging charges</span>
            <span className="font-mono">₹{packagingFee}</span>
          </div>

          <div className="flex justify-between text-xs text-zinc-650 dark:text-zinc-400">
            <span>Goverment Taxes (5% GST)</span>
            <span className="font-mono">₹{tax}</span>
          </div>

          <div className="flex justify-between text-xs text-zinc-650 dark:text-zinc-400">
            <span>Delivery Partner Fee</span>
            <span className="font-mono">{deliveryFee === 0 ? <strong className="text-emerald-500 uppercase">FREE</strong> : `₹${deliveryFee}`}</span>
          </div>

          {deliveryPartnerTip > 0 && (
            <div className="flex justify-between text-xs text-amber-600 dark:text-amber-400 font-bold">
              <span>Courier Tip</span>
              <span className="font-mono">₹{deliveryPartnerTip}</span>
            </div>
          )}

          <div className="border-t border-slate-100 dark:border-zinc-800 pt-2 flex justify-between text-sm font-black text-zinc-900 dark:text-zinc-50 mb-1">
            <span>Grand Total payable</span>
            <span className="font-mono text-base text-orange-500">₹{finalAmount}</span>
          </div>

          <div className="bg-emerald-500/5 dark:bg-emerald-500/10 rounded-2xl p-2.5 flex items-center justify-between text-[10.5px] text-emerald-700 dark:text-emerald-400 font-extrabold border border-emerald-500/15">
            <span className="flex items-center gap-1.5"><Award className="w-4 h-4 text-emerald-500 animate-pulse" /> Earning potential</span>
            <span className="font-mono font-black font-semibold">+{Math.round(subtotal / 10)} Nuvvo Points</span>
          </div>
        </div>

        {/* DELIVERY SCHEDULING CARD */}
        <div id="delivery-scheduling-picker" className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-4 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-500" />
              <div>
                <h4 className="text-xs font-bold text-zinc-950 dark:text-zinc-50">Delivery Schedule</h4>
                <p className="text-[10px] text-zinc-400">Specify when you would like to receive the order</p>
              </div>
            </div>
          </div>

          {/* Segment selection buttons */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-50 dark:bg-zinc-850 rounded-2xl border">
            <button
              type="button"
              onClick={() => setScheduleMode('ASAP')}
              className={`py-2 text-[11px] font-black rounded-xl transition-all cursor-pointer ${
                scheduleMode === 'ASAP'
                  ? 'bg-white dark:bg-zinc-800 text-orange-500 shadow-xs border border-slate-200/50 dark:border-zinc-700'
                  : 'text-zinc-500 hover:text-zinc-750'
              }`}
            >
              🚀 ASAP (25-30 mins)
            </button>
            <button
              type="button"
              onClick={() => setScheduleMode('SCHEDULED')}
              className={`py-2 text-[11px] font-black rounded-xl transition-all cursor-pointer ${
                scheduleMode === 'SCHEDULED'
                  ? 'bg-white dark:bg-zinc-800 text-orange-500 shadow-xs border border-slate-200/50 dark:border-zinc-700'
                  : 'text-zinc-500 hover:text-zinc-755'
              }`}
            >
              📅 Schedule Delivery
            </button>
          </div>

          {/* Expanded schedule inputs */}
          {scheduleMode === 'SCHEDULED' && (
            <div className="space-y-4 pt-2 overflow-hidden">
              {/* Date pills */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase text-zinc-400 tracking-wide">Select delivery date</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {dayPills.map(pill => (
                    <button
                      type="button"
                      key={pill.iso}
                      onClick={() => setSelectedDate(pill.iso)}
                      className={`p-2 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                        selectedDate === pill.iso
                          ? 'bg-orange-500/10 text-orange-500 border-orange-500 shadow-xs'
                          : 'bg-slate-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-[10px] font-bold">{pill.label}</span>
                      <span className="text-[9px] opacity-75 font-mono">{pill.dateFormatted}</span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[9px] text-zinc-400 font-bold shrink-0">Or pick other:</span>
                  <input
                    type="date"
                    min={todayISO}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="flex-1 bg-slate-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 px-3 py-1.5 text-[10px] font-mono rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 focus:ring-0"
                  />
                </div>
              </div>

              {/* Time slot selectors */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase text-zinc-400 tracking-wide">Select delivery time slot</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {presets.map(slot => (
                    <button
                      type="button"
                      key={slot}
                      onClick={() => setSelectedTimeSlot(slot)}
                      className={`px-2 py-2.5 rounded-xl border text-left flex items-center gap-1.5 transition-all text-[9.5px] cursor-pointer font-medium truncate ${
                        selectedTimeSlot === slot
                          ? 'bg-orange-500/10 text-orange-500 border-orange-500 shadow-xs font-bold'
                          : 'bg-slate-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-slate-100 dark:border-zinc-750 hover:bg-slate-100'
                      }`}
                    >
                      <Clock className="w-3 h-3 shrink-0" />
                      <span className="truncate">{slot}</span>
                    </button>
                  ))}
                </div>

                {selectedTimeSlot === 'Specify Custom Time' && (
                  <div className="p-3 bg-slate-50 dark:bg-zinc-850 rounded-xl border border-dashed border-slate-200 mt-2 flex items-center justify-between gap-3 animate-fadeIn">
                    <div className="w-1/2">
                      <label className="block text-[9px] font-bold text-zinc-500 dark:text-zinc-400 mb-1">Choose Exact Hour</label>
                      <input
                        type="time"
                        value={customTime}
                        onChange={(e) => setCustomTime(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 px-3 py-2 text-xs rounded-lg border focus:outline-none font-bold font-mono tracking-widest text-center"
                      />
                    </div>
                    <div className="text-right flex-1">
                      <span className="text-[9px] text-zinc-400 block font-bold uppercase">Estimated delivery time</span>
                      <span className="text-xs font-black text-orange-500 font-mono mt-0.5 block">{getScheduledTimeString()}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Informational scheduled time helper badge */}
          {scheduleMode === 'SCHEDULED' && (
            <div className="bg-orange-500/5 border border-orange-500/10 p-2.5 rounded-2xl flex items-center gap-2 text-[10px] text-orange-700 dark:text-orange-300 font-medium animate-fadeIn">
              <Sparkles className="w-4 h-4 text-orange-500 animate-pulse shrink-0" />
              <span>We'll dispatch fresh preparation units to match arrival around <strong className="font-mono underline">{getScheduledTimeString()}</strong>.</span>
            </div>
          )}
        </div>

        {/* DELIVERY ADDRESS COORDINATES MARK */}
        {(() => {
          const isAddressValidVal = currentAddress && currentAddress.gpsCoordinates
            ? validateDeliveryLocation(currentAddress.gpsCoordinates.lat, currentAddress.gpsCoordinates.lng)
            : true;

          return (
            <div className="bg-white dark:bg-zinc-900 border border-slate-105 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800/80 pb-2.5">
                <span className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Selected Delivery address</span>
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                  isAddressValidVal 
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                    : 'bg-rose-500/10 text-rose-600 animate-pulse'
                }`}>
                  {isAddressValidVal ? '● SERVICEABLE' : '🚫 OUTSIDE OPERATION ZONE'}
                </span>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-orange-500/10 text-orange-600 rounded-2xl shrink-0">
                  <MapPin className="w-5.5 h-5.5" />
                </div>
                
                <div className="flex-1 space-y-1.5 text-xs text-left">
                  {currentAddress ? (
                    <>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-zinc-900 dark:text-zinc-100 uppercase text-[11px] tracking-wider">
                          {currentAddress.type === 'Home' ? '🏠 Home' : currentAddress.type === 'Work' ? '🏢 Work' : '📍 Saved Destination'}
                        </span>
                        {currentAddress.customerName && (
                          <span className="text-zinc-400 font-bold">• {currentAddress.customerName}</span>
                        )}
                      </div>
                      
                      {currentAddress.isManual ? (
                        <div className="text-zinc-700 dark:text-zinc-300 space-y-0.5 leading-snug font-medium">
                          <p className="font-extrabold text-zinc-900 dark:text-zinc-50">House No: {currentAddress.houseNumber}</p>
                          <p>{currentAddress.streetName}, {currentAddress.locality}</p>
                          {currentAddress.villageTown && <p>Village: {currentAddress.villageTown}</p>}
                          <p className="text-[10px] text-zinc-400 font-mono">
                            {currentAddress.city}, {currentAddress.district || 'Bapatla'}, {currentAddress.state || 'AP'} - {currentAddress.pincode}
                          </p>
                        </div>
                      ) : (
                        <div className="text-zinc-700 dark:text-zinc-300 space-y-0.5 leading-snug font-medium">
                          <p className="font-extrabold text-zinc-900 dark:text-zinc-50">{currentAddress.flatNo}</p>
                          <p>{currentAddress.area} • Landmark: {currentAddress.landmark || 'None'}</p>
                          <p className="text-[10px] text-zinc-400 font-mono">{currentAddress.city}</p>
                        </div>
                      )}

                      {/* Display delivery notes */}
                      {(currentAddress.deliveryNotes || orderInstructions) && (
                        <div className="bg-amber-500/[0.04] border border-amber-500/10 p-2.5 rounded-xl text-[10px] text-zinc-650 dark:text-zinc-300 leading-snug flex items-start gap-1.5 mt-2">
                          <span className="font-bold text-orange-500">📝 Instruction/Note:</span>
                          <p className="italic">"{currentAddress.deliveryNotes || orderInstructions}"</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-zinc-450 italic">No delivery location chosen. Snaps can fall outside delivery corridor.</p>
                  )}
                </div>
              </div>

              {/* OUTSIDE ZONE ERRONEOUS CHANNELS WARNING */}
              {!isAddressValidVal && (
                <div className="p-3.5 bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 rounded-2xl flex items-start gap-2 border border-red-200 dark:border-red-900 animate-pulse text-left">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-black uppercase text-[10px] tracking-wide">Delivery Blocked</h5>
                    <p className="text-[10px] leading-relaxed mt-0.5">
                      Sorry, delivery is currently unavailable for this location.
                    </p>
                  </div>
                </div>
              )}

              {/* ACTION BUTTON TRIGGERS */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddrModal(true)}
                  className="py-2 px-3 hover:bg-slate-50 dark:bg-zinc-850 dark:hover:bg-zinc-805 border border-slate-205 dark:border-zinc-750 text-zinc-850 dark:text-zinc-200 font-black uppercase text-[10px] rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-zinc-400" /> Change Address
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddrModal(true)}
                  className="py-2 px-3 bg-orange-500 hover:bg-orange-600 text-white font-black uppercase text-[10px] rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md shadow-orange-500/5 hover:scale-[1.01] active:scale-[0.99]"
                >
                  <PlusCircle className="w-3.5 h-3.5" /> Add New Address
                </button>
              </div>
            </div>
          );
        })()}

        {/* PAYMENT METHOD PREVIEW & SELECTION CARD */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-orange-500" /> Payment Selection
            </span>
            <button
              id="change-payment-method-btn"
              type="button"
              onClick={() => setCheckoutStep('payment')}
              className="text-[11px] font-extrabold text-orange-500 hover:text-orange-600 transition cursor-pointer flex items-center gap-0.5"
            >
              <span>Change / Choose</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div 
            id="open-payment-screen-card"
            onClick={() => setCheckoutStep('payment')}
            className="p-3.5 bg-slate-50 dark:bg-zinc-850 hover:bg-slate-100 dark:hover:bg-zinc-800/90 rounded-2xl border border-slate-200/80 dark:border-zinc-750 flex items-center justify-between cursor-pointer transition group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center font-black text-lg">
                {paymentMethod === 'Credit Card' ? '💳' : paymentMethod === 'Wallet' ? '👛' : paymentMethod === 'COD' ? '🤝' : '📱'}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-black text-zinc-900 dark:text-zinc-100">
                    {paymentMethod === 'Credit Card' 
                      ? 'Credit / Debit Card' 
                      : paymentMethod === 'Wallet' 
                      ? 'Digital Wallet (Nuvvo / Apps)' 
                      : paymentMethod === 'COD' 
                      ? 'Cash / QR on Delivery' 
                      : 'UPI (Google Pay / PhonePe / QR)'}
                  </h4>
                  <span className="text-[8px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.2 rounded font-mono font-bold">
                    Secure
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 mt-0.5">
                  {lastPaymentDetails?.maskedInfo 
                    ? `Selected: ${lastPaymentDetails.maskedInfo}` 
                    : 'Tap to customize UPI apps, card details, or wallet balance'}
                </p>
              </div>
            </div>

            <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* LAUNCH PROCEED TO PAYMENT CALL */}
        <button
          id="proceed-to-payment-action-btn"
          onClick={() => {
            if (!currentAddress) {
              alert('Kindly configure or select a valid delivery address in your Profile or Cart.');
              setShowAddrModal(true);
              return;
            }
            if (currentAddress.gpsCoordinates) {
              const isValid = validateDeliveryLocation(currentAddress.gpsCoordinates.lat, currentAddress.gpsCoordinates.lng);
              if (!isValid) {
                alert('Sorry, delivery is currently unavailable for this location. Please adjust your delivery pin closer to active operational sectors.');
                setShowAddrModal(true);
                return;
              }
            }
            setCheckoutStep('payment');
          }}
          className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white py-4 rounded-3xl font-extrabold transition-all shadow-xl shadow-orange-500/10 flex items-center justify-center gap-2 active:scale-98 cursor-pointer mt-4 group"
        >
          <span>Proceed to Payment • ₹{finalAmount}</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* WhatsApp Food Booking & Direct Order Option */}
        <button
          id="cart-whatsapp-food-booking-btn"
          type="button"
          onClick={() => {
            const firstRestId = cart[0]?.foodItem.restaurantId;
            const matchedRest = restaurants?.find(r => r.id === firstRestId);
            const restName = matchedRest?.name || 'Nuvvo Kitchen Partner';

            clickToWhatsAppFoodBooking({
              restaurantName: restName,
              items: cart.map(item => ({
                name: item.foodItem.name,
                quantity: item.quantity,
                price: item.foodItem.discountPrice || item.foodItem.price
              })),
              totalAmount: finalAmount,
              deliveryAddress: currentAddress?.fullAddress || currentAddress?.landmark || 'Chirala, Andhra Pradesh',
              customerName: user?.name,
              customerPhone: user?.phone || '9063692135',
              customNote: orderInstructions || undefined
            });
          }}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3.5 rounded-3xl font-extrabold transition-all shadow-lg shadow-emerald-500/15 flex items-center justify-center gap-2 active:scale-98 cursor-pointer mt-2.5 text-xs group"
        >
          <span className="text-sm">💬</span>
          <span>Book / Order via WhatsApp (+91 9063692135)</span>
        </button>

      </div>

      {/* DIALOG FOR AVAILABLE SYSTEMIC COUPONS */}
      {showCouponsDialog && (
        <div className="fixed inset-0 bg-zinc-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-3xl p-5 border shadow-xl max-h-[70vh] flex flex-col">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-black text-sm text-zinc-900 dark:text-zinc-50">Available Nuvvo Savings</h3>
              <button onClick={() => setShowCouponsDialog(false)} className="text-zinc-400 hover:text-zinc-800 text-xs font-bold">Close</button>
            </div>
            
            <div className="overflow-y-auto space-y-3 flex-1 py-1 pr-1">
              {couponsList.map(item => (
                <div key={item.code} className="bg-slate-50 dark:bg-zinc-800 p-3 rounded-2xl border border-slate-100 dark:border-zinc-700 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-xs border border-orange-500 text-orange-500 px-2 py-0.5 rounded bg-white">
                      {item.code}
                    </span>
                    <button 
                      onClick={() => handleApplyCoupon(undefined, item.code)}
                      className="text-[10px] bg-orange-500 text-white font-extrabold px-3 py-1 rounded-lg uppercase"
                    >
                      Apply
                    </button>
                  </div>
                  <p className="text-[10px] text-zinc-650 dark:text-zinc-300 mt-2 font-medium">{item.description}</p>
                  <p className="text-[9px] text-zinc-400 mt-0.5">Minimum spend requirement: ₹{item.minOrder}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Address Selection Modal and Adjuster */}
      <AddressSelectorModal 
        isOpen={showAddrModal} 
        onClose={() => setShowAddrModal(false)} 
      />

      {/* Physical QR/Flyer Coupon QR Code Scanner Overlay */}
      <QRCodeScannerModal
        isOpen={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        onScanSuccess={(code) => {
          setCouponError('');
          setCouponSuccess('');
          const res = applyCouponCode(code);
          if (res.success) {
            setCouponSuccess(res.message);
            // Flash a dynamic visual toast to tell the user they got savings
            const notificationMsg = `🎉 Applied Promo: ${code}! Saved ₹${res.message.includes('₹') ? res.message.split('Saved ₹')[1] || '' : ' discount value'}`;
          } else {
            setCouponError(res.message);
          }
          setShowQRScanner(false);
        }}
      />

    </motion.div>
  );
}
