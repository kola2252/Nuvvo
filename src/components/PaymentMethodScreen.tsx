/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CreditCard, Wallet, Smartphone, CheckCircle, ChevronLeft, ShieldCheck, 
  Lock, AlertCircle, QrCode, Plus, RefreshCw, Sparkles, ArrowRight, 
  Tag, ChevronDown, ChevronUp, Info, Check, Zap, CheckCheck, Building2,
  Receipt, Shield, IndianRupee
} from 'lucide-react';
import { Address, SavedCard, SavedUPI, PaymentMethodType } from '../types';

interface PaymentMethodScreenProps {
  amountPayable: number;
  deliveryAddress: Address | null;
  itemCount: number;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  packagingFee: number;
  tax: number;
  tip: number;
  userPhone?: string;
  userName?: string;
  onBack: () => void;
  onCompletePayment: (method: PaymentMethodType, paymentDetails?: any) => void;
}

type PaymentCategory = 'UPI' | 'Credit Card' | 'Wallet' | 'COD';

export default function PaymentMethodScreen({
  amountPayable,
  deliveryAddress,
  itemCount,
  subtotal,
  discount,
  deliveryFee,
  packagingFee,
  tax,
  tip,
  userPhone = '9876543210',
  userName = 'Gourmet Customer',
  onBack,
  onCompletePayment
}: PaymentMethodScreenProps) {
  // Selected category & method
  const [selectedCategory, setSelectedCategory] = useState<PaymentCategory>('UPI');
  
  // UPI states
  const [selectedUpiApp, setSelectedUpiApp] = useState<string>('gpay');
  const [customUpiId, setCustomUpiId] = useState<string>('');
  const [isVerifyingUpi, setIsVerifyingUpi] = useState<boolean>(false);
  const [upiVerifiedName, setUpiVerifiedName] = useState<string | null>(null);
  const [upiVerifyError, setUpiVerifyError] = useState<string | null>(null);
  const [showQrModal, setShowQrModal] = useState<boolean>(false);

  // Google Pay / UPI Number for Future Payments
  const [googlePayNumber, setGooglePayNumber] = useState<string>(() => {
    try {
      return localStorage.getItem('nuvvo_googlepay_number') || '7702906994';
    } catch {
      return '7702906994';
    }
  });
  const [isEditingGPayNumber, setIsEditingGPayNumber] = useState<boolean>(false);
  const [tempGPayNumber, setTempGPayNumber] = useState<string>(googlePayNumber);
  const [gpaySaveSuccess, setGpaySaveSuccess] = useState<boolean>(false);

  const handleSaveGooglePayNumber = () => {
    const cleaned = tempGPayNumber.replace(/[^0-9]/g, '');
    if (cleaned.length !== 10) {
      alert('Please enter a valid 10-digit mobile number for Google Pay');
      return;
    }
    setGooglePayNumber(cleaned);
    try {
      localStorage.setItem('nuvvo_googlepay_number', cleaned);
    } catch (e) {
      console.error(e);
    }
    setIsEditingGPayNumber(false);
    setGpaySaveSuccess(true);
    setTimeout(() => setGpaySaveSuccess(false), 3000);
  };

  // Credit Card states
  const [selectedCardId, setSelectedCardId] = useState<string>('card_demo_1');
  const [cardCvvInput, setCardCvvInput] = useState<{ [cardId: string]: string }>({
    card_demo_1: '821',
    card_demo_2: '',
    card_demo_3: ''
  });
  const [showNewCardForm, setShowNewCardForm] = useState<boolean>(false);
  const [newCardNumber, setNewCardNumber] = useState<string>('');
  const [newCardHolder, setNewCardHolder] = useState<string>(userName || '');
  const [newCardExpiry, setNewCardExpiry] = useState<string>('');
  const [newCardCvv, setNewCardCvv] = useState<string>('');
  const [newCardBrand, setNewCardBrand] = useState<'Visa' | 'Mastercard' | 'RuPay' | 'Amex'>('RuPay');
  const [saveCardChecked, setSaveCardChecked] = useState<boolean>(true);

  // Wallets states
  const [selectedWalletId, setSelectedWalletId] = useState<string>('nuvvo_wallet');
  const [nuvvoWalletBalance, setNuvvoWalletBalance] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('nuvvo_wallet_balance');
      return stored ? Number(stored) : 500;
    } catch {
      return 500;
    }
  });

  // UI accordion & summary
  const [showPriceBreakdown, setShowPriceBreakdown] = useState<boolean>(false);

  // Processing state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStep, setProcessingStep] = useState<number>(0);
  const [processingMessage, setProcessingMessage] = useState<string>('');

  // Pre-configured dummy cards
  const [dummyCards, setDummyCards] = useState<SavedCard[]>([
    {
      id: 'card_demo_1',
      cardBrand: 'RuPay',
      cardNumber: '•••• •••• •••• 1256',
      cardHolder: userName || 'Rahul Sharma',
      expiryDate: '09/29'
    },
    {
      id: 'card_demo_2',
      cardBrand: 'Visa',
      cardNumber: '•••• •••• •••• 4821',
      cardHolder: userName || 'Rahul Sharma',
      expiryDate: '12/31'
    },
    {
      id: 'card_demo_3',
      cardBrand: 'Mastercard',
      cardNumber: '•••• •••• •••• 9043',
      cardHolder: userName || 'Rahul Sharma',
      expiryDate: '05/28'
    }
  ]);

  // Dummy UPI apps
  const upiApps = [
    {
      id: 'gpay',
      name: 'Google Pay',
      handle: `${googlePayNumber}@okhdfcbank`,
      iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900',
      badge: 'Fastest ⚡ (7702906994)',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
    },
    {
      id: 'phonepe',
      name: 'PhonePe',
      handle: `${googlePayNumber}@ybl`,
      iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900',
      badge: 'Popular ⭐',
      badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
    },
    {
      id: 'paytm',
      name: 'Paytm UPI',
      handle: `${userPhone}@paytm`,
      iconBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-900',
      badge: 'Instant 🚀',
      badgeColor: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20'
    },
    {
      id: 'cred',
      name: 'CRED UPI',
      handle: `${userPhone}@axis`,
      iconBg: 'bg-zinc-800 text-white dark:bg-zinc-700 border-zinc-700',
      badge: 'Cashback 🎁',
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
    },
    {
      id: 'bhim',
      name: 'BHIM UPI',
      handle: `${userPhone}@upi`,
      iconBg: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-900',
      badge: 'NPCI Direct',
      badgeColor: 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700'
    }
  ];

  // Dummy Wallets
  const walletList = [
    {
      id: 'nuvvo_wallet',
      name: 'Nuvvo Cash Wallet',
      description: 'Instant 1-tap checkout with store credit',
      balance: nuvvoWalletBalance,
      isNuvvo: true,
      badge: 'Zero Processing Fee'
    },
    {
      id: 'phonepe_wallet',
      name: 'PhonePe Wallet',
      description: `Linked to +91 ${userPhone}`,
      balance: 1250,
      isNuvvo: false,
      badge: 'Linked'
    },
    {
      id: 'paytm_wallet',
      name: 'Paytm Wallet',
      description: `Linked to +91 ${userPhone}`,
      balance: 680,
      isNuvvo: false,
      badge: 'Auto-Debit Active'
    },
    {
      id: 'amazon_pay',
      name: 'Amazon Pay Balance',
      description: 'Amazon account balance & gift card',
      balance: 920,
      isNuvvo: false,
      badge: 'Flat 2% Cashback'
    },
    {
      id: 'mobikwik',
      name: 'MobiKwik Wallet',
      description: `ZIP & SuperCash linked to +91 ${userPhone}`,
      balance: 340,
      isNuvvo: false,
      badge: 'SuperCash eligible'
    }
  ];

  // Verify Custom UPI ID
  const handleVerifyCustomUpi = () => {
    if (!customUpiId.trim()) {
      setUpiVerifyError('Please enter a valid UPI ID (e.g. name@bank)');
      return;
    }
    if (!customUpiId.includes('@')) {
      setUpiVerifyError('UPI ID must contain "@" (e.g. 9876543210@ybl)');
      return;
    }

    setIsVerifyingUpi(true);
    setUpiVerifyError(null);
    setUpiVerifiedName(null);

    setTimeout(() => {
      setIsVerifyingUpi(false);
      setUpiVerifiedName(userName || 'Verified Account Holder');
      setSelectedUpiApp('custom');
    }, 800);
  };

  // Card number input formatter & brand detection
  const handleCardNumberFormat = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const parts = [];
    for (let i = 0; i < raw.length && i < 16; i += 4) {
      parts.push(raw.substring(i, i + 4));
    }
    const formatted = parts.join(' ');
    setNewCardNumber(formatted);

    // Auto-detect brand
    const first = raw.charAt(0);
    if (first === '4') setNewCardBrand('Visa');
    else if (first === '5') setNewCardBrand('Mastercard');
    else if (first === '3') setNewCardBrand('Amex');
    else setNewCardBrand('RuPay');
  };

  const handleExpiryFormat = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length >= 2) {
      val = val.substring(0, 2) + '/' + val.substring(2, 4);
    }
    setNewCardExpiry(val.substring(0, 5));
  };

  const handleSaveAndSelectNewCard = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNum = newCardNumber.replace(/\s+/g, '');
    if (cleanNum.length < 13) {
      alert('Please enter a valid 16-digit card number.');
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(newCardExpiry)) {
      alert('Please enter expiration in MM/YY format (e.g., 08/29).');
      return;
    }
    if (newCardCvv.length < 3) {
      alert('Please enter a valid 3-digit CVV security code.');
      return;
    }

    const last4 = cleanNum.slice(-4);
    const newCard: SavedCard = {
      id: `card_${Date.now()}`,
      cardBrand: newCardBrand,
      cardNumber: `•••• •••• •••• ${last4}`,
      cardHolder: newCardHolder || userName || 'Cardholder',
      expiryDate: newCardExpiry
    };

    setDummyCards(prev => [newCard, ...prev]);
    setSelectedCardId(newCard.id);
    setCardCvvInput(prev => ({ ...prev, [newCard.id]: newCardCvv }));
    setShowNewCardForm(false);
  };

  // Top-up wallet dummy handler
  const handleQuickRechargeWallet = (amount: number) => {
    const updated = nuvvoWalletBalance + amount;
    setNuvvoWalletBalance(updated);
    try {
      localStorage.setItem('nuvvo_wallet_balance', updated.toString());
      const storedHistory = localStorage.getItem('nuvvo_wallet_history');
      const list = storedHistory ? JSON.parse(storedHistory) : [];
      list.unshift({
        id: `w_top_${Date.now()}`,
        type: 'credit',
        amount,
        description: 'Instant Wallet Top-up (Demo)',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      });
      localStorage.setItem('nuvvo_wallet_history', JSON.stringify(list));
    } catch (e) {
      console.warn(e);
    }
  };

  // Get active selected payment label for button
  const getPaymentButtonLabel = () => {
    if (selectedCategory === 'UPI') {
      if (selectedUpiApp === 'custom') {
        return `Pay ₹${amountPayable} with UPI (${customUpiId || 'VPA'})`;
      }
      const app = upiApps.find(a => a.id === selectedUpiApp);
      return `Pay ₹${amountPayable} with ${app?.name || 'UPI'}`;
    }

    if (selectedCategory === 'Credit Card') {
      const card = dummyCards.find(c => c.id === selectedCardId);
      return `Pay ₹${amountPayable} with ${card ? `${card.cardBrand} ${card.cardNumber.slice(-4)}` : 'Card'}`;
    }

    if (selectedCategory === 'Wallet') {
      const wallet = walletList.find(w => w.id === selectedWalletId);
      return `Pay ₹${amountPayable} with ${wallet?.name || 'Wallet'}`;
    }

    return `Place Order via Cash / COD • ₹${amountPayable}`;
  };

  // Execution of payment
  const handleInitiatePayment = () => {
    // Basic checks
    if (selectedCategory === 'Credit Card' && !showNewCardForm) {
      const cvv = cardCvvInput[selectedCardId];
      if (!cvv || cvv.length < 3) {
        alert('Please enter a 3-digit CVV for the selected card to authorize payment.');
        return;
      }
    }

    if (selectedCategory === 'Wallet' && selectedWalletId === 'nuvvo_wallet') {
      if (nuvvoWalletBalance < amountPayable) {
        const diff = amountPayable - nuvvoWalletBalance;
        alert(`Insufficient Nuvvo Wallet Balance. You need ₹${diff} more. Use the quick recharge button above to add funds.`);
        return;
      }
    }

    // Launch authorization animation
    setIsProcessing(true);
    setProcessingStep(1);
    setProcessingMessage('Connecting securely to payment gateway...');

    setTimeout(() => {
      setProcessingStep(2);
      if (selectedCategory === 'UPI') {
        setProcessingMessage(`Authorizing ₹${amountPayable} via UPI...`);
      } else if (selectedCategory === 'Credit Card') {
        setProcessingMessage(`Verifying Card Token & CVV with Bank...`);
      } else if (selectedCategory === 'Wallet') {
        setProcessingMessage(`Debiting ₹${amountPayable} from digital wallet...`);
      } else {
        setProcessingMessage(`Generating Cash-on-Delivery dispatch token...`);
      }

      setTimeout(() => {
        setProcessingStep(3);
        setProcessingMessage('Payment Authorized & Confirmed! 🎉');

        setTimeout(() => {
          setIsProcessing(false);
          
          // Build details
          let details: any = {
            category: selectedCategory,
            amount: amountPayable,
            transactionRef: `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`
          };

          if (selectedCategory === 'UPI') {
            const app = upiApps.find(a => a.id === selectedUpiApp);
            details.provider = app?.name || 'UPI';
            details.maskedInfo = selectedUpiApp === 'custom' ? customUpiId : (app?.handle || `${googlePayNumber}@okhdfcbank`);
            details.phonePeNumber = googlePayNumber;
          } else if (selectedCategory === 'Credit Card') {
            const card = dummyCards.find(c => c.id === selectedCardId);
            details.provider = card?.cardBrand || 'Card';
            details.maskedInfo = card?.cardNumber;
          } else if (selectedCategory === 'Wallet') {
            const wallet = walletList.find(w => w.id === selectedWalletId);
            details.provider = wallet?.name || 'Digital Wallet';
            details.maskedInfo = `Balance after debit: ₹${Math.max(0, (wallet?.balance || 0) - amountPayable)}`;
          } else {
            details.provider = 'Cash on Delivery';
            details.maskedInfo = 'Pay upon doorstep arrival';
          }

          onCompletePayment(selectedCategory, details);
        }, 800);
      }, 1200);
    }, 1000);
  };

  return (
    <div id="payment-selection-screen" className="min-h-screen bg-slate-50 dark:bg-zinc-950 pb-36 text-zinc-900 dark:text-zinc-50 transition-colors duration-200">
      
      {/* TOP HEADER */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            id="back-to-cart-review-btn"
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition cursor-pointer active:scale-95 flex items-center justify-center"
            title="Back to Cart Review"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-sm font-black tracking-tight text-zinc-900 dark:text-zinc-50 uppercase flex items-center gap-1.5">
              Select Payment Method
            </h1>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-500" />
              <span>100% Encrypted & RBI Compliant</span>
            </p>
          </div>
        </div>

        {/* Amount Chip */}
        <div className="bg-orange-500/10 dark:bg-orange-500/20 border border-orange-500/30 px-3 py-1.5 rounded-2xl text-right">
          <span className="text-[9px] uppercase font-bold text-orange-600 dark:text-orange-400 block font-mono leading-tight">
            Amount Payable
          </span>
          <span className="text-sm font-black text-orange-600 dark:text-orange-400 font-mono">
            ₹{amountPayable}
          </span>
        </div>
      </header>

      <div className="p-4 max-w-xl mx-auto space-y-4">
        
        {/* COMPACT ORDER & ADDRESS SUMMARY CARD */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center font-black text-xs">
                {itemCount}
              </div>
              <div className="text-left">
                <span className="text-xs font-black text-zinc-900 dark:text-zinc-100 block">
                  Order Summary ({itemCount} {itemCount === 1 ? 'item' : 'items'})
                </span>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate max-w-[200px] block">
                  Deliver to: {deliveryAddress ? `${deliveryAddress.flatNo || deliveryAddress.houseNumber || ''}, ${deliveryAddress.area || deliveryAddress.locality || ''}` : 'Chirala'}
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowPriceBreakdown(!showPriceBreakdown)}
              className="text-[10px] font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1 bg-orange-500/5 px-2.5 py-1.5 rounded-xl transition cursor-pointer"
            >
              <span>{showPriceBreakdown ? 'Hide Breakdown' : 'View Breakdown'}</span>
              {showPriceBreakdown ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          {/* Collapsible price details */}
          <AnimatePresence>
            {showPriceBreakdown && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-3 border-t border-dashed border-slate-200 dark:border-zinc-800 text-xs font-mono space-y-1.5 text-zinc-600 dark:text-zinc-400"
              >
                <div className="flex justify-between">
                  <span>Items Subtotal:</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">₹{subtotal}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span>Discount / Points:</span>
                    <span>-₹{discount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery Fee:</span>
                  <span>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>Packaging & Taxes:</span>
                  <span>₹{packagingFee + tax}</span>
                </div>
                {tip > 0 && (
                  <div className="flex justify-between text-amber-600 dark:text-amber-400">
                    <span>Driver Tip:</span>
                    <span>+₹{tip}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-zinc-800 font-black text-zinc-900 dark:text-zinc-50 text-sm">
                  <span>Total Amount:</span>
                  <span className="text-orange-600 dark:text-orange-400">₹{amountPayable}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* OFFERS / CASHBACK BANNER */}
        <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
          <Sparkles className="w-4 h-4 text-emerald-500 shrink-0 animate-pulse" />
          <div className="flex-1 text-[11px] leading-snug">
            <span className="font-extrabold">Instant Savings: </span>
            <span>Zero convenience fee on UPI & up to ₹50 cashback on Google Pay or PhonePe!</span>
          </div>
        </div>

        {/* PAYMENT METHOD SELECTION TABS / CATEGORIES */}
        <div className="space-y-3">
          <span className="text-[10.5px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block px-1">
            Payment Categories
          </span>

          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'UPI' as PaymentCategory, label: 'UPI', icon: Smartphone, subtitle: 'Apps & QR' },
              { id: 'Credit Card' as PaymentCategory, label: 'Cards', icon: CreditCard, subtitle: 'Debit/Credit' },
              { id: 'Wallet' as PaymentCategory, label: 'Wallets', icon: Wallet, subtitle: 'Nuvvo / Apps' },
              { id: 'COD' as PaymentCategory, label: 'Cash / COD', icon: IndianRupee, subtitle: 'On Delivery' }
            ].map(tab => {
              const Icon = tab.icon;
              const isSelected = selectedCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`payment-tab-${tab.id.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`p-3 rounded-2xl border flex flex-col items-center justify-center transition-all cursor-pointer text-center relative ${
                    isSelected
                      ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500 shadow-sm ring-1 ring-orange-500/30 font-bold'
                      : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-850'
                  }`}
                >
                  <Icon className="w-5 h-5 mb-1 text-inherit" />
                  <span className="text-xs font-black leading-tight">{tab.label}</span>
                  <span className="text-[8.5px] text-zinc-400 mt-0.5 leading-none">{tab.subtitle}</span>
                  {isSelected && (
                    <span className="absolute -bottom-1 w-6 h-1 bg-orange-500 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* CATEGORY 1: UPI SELECTION PANEL */}
        {selectedCategory === 'UPI' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Google Pay / UPI Linked Number for Future Payments Card */}
            <div id="gpay-payment-account-card" className="bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-purple-500/10 border border-blue-500/25 rounded-3xl p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                    G
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      Google Pay / UPI Payment Account
                      <span className="text-[9px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">
                        Default for Future Orders
                      </span>
                    </h4>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                      Auto-routes 1-tap checkout through verified mobile number
                    </p>
                  </div>
                </div>

                {!isEditingGPayNumber && (
                  <button
                    type="button"
                    onClick={() => {
                      setTempGPayNumber(googlePayNumber);
                      setIsEditingGPayNumber(true);
                    }}
                    className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 px-2.5 py-1 bg-white dark:bg-zinc-800 rounded-xl border border-blue-200 dark:border-zinc-700 shadow-xs cursor-pointer transition active:scale-95"
                  >
                    Change Number
                  </button>
                )}
              </div>

              {gpaySaveSuccess && (
                <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  Google Pay number successfully saved as <span className="font-mono">+91 {googlePayNumber}</span> for all future payments!
                </div>
              )}

              {!isEditingGPayNumber ? (
                <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-slate-200/80 dark:border-zinc-800">
                  <div>
                    <span className="text-[8.5px] uppercase font-bold text-zinc-400 font-mono tracking-wider block">
                      Active Google Pay Mobile Number
                    </span>
                    <p className="text-sm font-mono font-black text-zinc-900 dark:text-zinc-100 tracking-wide mt-0.5">
                      +91 {googlePayNumber}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[8.5px] font-mono text-zinc-400 block font-bold uppercase tracking-wider">
                      UPI VPA Handle
                    </span>
                    <span className="text-[11px] font-mono font-bold text-blue-600 dark:text-blue-400">
                      {googlePayNumber}@okhdfcbank
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-blue-400/80 space-y-2.5">
                  <label className="block text-[10px] uppercase font-bold text-zinc-600 dark:text-zinc-300 font-mono">
                    Update Google Pay Number for Future Orders
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-zinc-400">
                        +91
                      </span>
                      <input
                        type="tel"
                        maxLength={10}
                        value={tempGPayNumber}
                        onChange={e => setTempGPayNumber(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="7702906994"
                        className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl pl-11 pr-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-blue-500 text-zinc-900 dark:text-zinc-100"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleSaveGooglePayNumber}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs active:scale-95"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingGPayNumber(false)}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick UPI Apps */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800/80 pb-2.5">
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">
                  Popular UPI Apps (1-Tap Checkout)
                </span>
                <span className="text-[9px] font-bold text-emerald-500 flex items-center gap-0.5">
                  <Zap className="w-3 h-3" /> Auto-Authorized
                </span>
              </div>

              <div className="space-y-2">
                {upiApps.map(app => {
                  const isChecked = selectedUpiApp === app.id;
                  return (
                    <button
                      key={app.id}
                      id={`upi-app-${app.id}`}
                      type="button"
                      onClick={() => setSelectedUpiApp(app.id)}
                      className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition cursor-pointer ${
                        isChecked
                          ? 'bg-orange-500/5 dark:bg-orange-500/10 border-orange-500 ring-1 ring-orange-500/20'
                          : 'bg-white dark:bg-zinc-900 border-slate-200/80 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center font-black text-xs ${app.iconBg}`}>
                          {app.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-zinc-900 dark:text-zinc-100">
                              {app.name}
                            </span>
                            <span className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded-full border ${app.badgeColor}`}>
                              {app.badge}
                            </span>
                          </div>
                          <span className="text-[10px] text-zinc-400 font-mono block mt-0.5">
                            {app.handle}
                          </span>
                        </div>
                      </div>

                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        isChecked ? 'border-orange-500 bg-orange-500 text-white' : 'border-zinc-300 dark:border-zinc-700'
                      }`}>
                        {isChecked && <Check className="w-3 h-3" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom UPI ID Input */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-4 shadow-xs space-y-3">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider block">
                Or Enter Custom UPI VPA ID
              </span>

              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    id="custom-upi-input"
                    type="text"
                    placeholder="e.g. mobile@ybl or username@oksbi"
                    value={customUpiId}
                    onChange={e => {
                      setCustomUpiId(e.target.value);
                      setUpiVerifyError(null);
                      setUpiVerifiedName(null);
                    }}
                    className="flex-1 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono font-medium focus:outline-none focus:border-orange-500 text-zinc-900 dark:text-zinc-100"
                  />
                  <button
                    id="verify-upi-btn"
                    type="button"
                    onClick={handleVerifyCustomUpi}
                    disabled={isVerifyingUpi}
                    className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-900 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-white text-xs font-black rounded-xl transition cursor-pointer disabled:opacity-50 shrink-0 flex items-center gap-1.5"
                  >
                    {isVerifyingUpi ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CheckCircle className="w-3.5 h-3.5" />
                    )}
                    <span>Verify</span>
                  </button>
                </div>

                {upiVerifyError && (
                  <p className="text-[10px] text-rose-500 font-bold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {upiVerifyError}
                  </p>
                )}

                {upiVerifiedName && (
                  <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-700 dark:text-emerald-400 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <CheckCheck className="w-4 h-4 text-emerald-500" />
                      <span className="font-bold text-[11px]">Verified: {upiVerifiedName}</span>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 px-2 py-0.5 rounded-full">
                      Ready to Pay
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Scan UPI QR Code Trigger */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-4 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-orange-500/10 text-orange-600">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-zinc-900 dark:text-zinc-100">
                    Scan UPI QR Code
                  </h4>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                    Use any scanner app (Paytm, GPay, Cred, PhonePe)
                  </p>
                </div>
              </div>

              <button
                id="show-qr-code-btn"
                type="button"
                onClick={() => setShowQrModal(true)}
                className="px-3 py-1.5 bg-orange-500 text-white rounded-xl text-xs font-black hover:bg-orange-600 transition cursor-pointer"
              >
                Show QR
              </button>
            </div>
          </motion.div>
        )}

        {/* CATEGORY 2: CREDIT & DEBIT CARDS PANEL */}
        {selectedCategory === 'Credit Card' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Saved Cards List */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800/80 pb-2.5">
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">
                  Saved Cards ({dummyCards.length})
                </span>
                <span className="text-[9px] font-bold text-zinc-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" /> Tokenized Security
                </span>
              </div>

              <div className="space-y-2.5">
                {dummyCards.map(card => {
                  const isSelected = selectedCardId === card.id && !showNewCardForm;
                  return (
                    <div
                      key={card.id}
                      className={`p-3.5 rounded-2xl border transition ${
                        isSelected
                          ? 'bg-orange-500/5 dark:bg-orange-500/10 border-orange-500 ring-1 ring-orange-500/20'
                          : 'bg-white dark:bg-zinc-900 border-slate-200/80 dark:border-zinc-800 hover:border-slate-300'
                      }`}
                    >
                      <div
                        id={`saved-card-${card.id}`}
                        onClick={() => {
                          setSelectedCardId(card.id);
                          setShowNewCardForm(false);
                        }}
                        className="flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-7 rounded-lg bg-zinc-800 text-white dark:bg-zinc-700 flex items-center justify-center font-black text-[9px] tracking-wider uppercase">
                            {card.cardBrand}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-zinc-900 dark:text-zinc-100 font-mono">
                                {card.cardNumber}
                              </span>
                              <span className="text-[8.5px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                                {card.cardBrand}
                              </span>
                            </div>
                            <span className="text-[9.5px] text-zinc-400 font-medium block mt-0.5">
                              {card.cardHolder} • Exp: {card.expiryDate}
                            </span>
                          </div>
                        </div>

                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-orange-500 bg-orange-500 text-white' : 'border-zinc-300 dark:border-zinc-700'
                        }`}>
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                      </div>

                      {/* CVV input when card is active */}
                      {isSelected && (
                        <div className="mt-3 pt-3 border-t border-slate-200/80 dark:border-zinc-800 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400">
                              Enter CVV:
                            </label>
                            <input
                              type="password"
                              maxLength={4}
                              placeholder="•••"
                              value={cardCvvInput[card.id] || ''}
                              onChange={e => {
                                const val = e.target.value.replace(/\D/g, '');
                                setCardCvvInput(prev => ({ ...prev, [card.id]: val }));
                              }}
                              className="w-16 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-2 py-1 text-xs text-center font-mono font-bold focus:outline-none focus:border-orange-500"
                            />
                          </div>
                          <span className="text-[9px] text-zinc-400">3 digits on back of card</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Add New Card Button / Toggle */}
              {!showNewCardForm ? (
                <button
                  id="add-new-card-btn"
                  type="button"
                  onClick={() => setShowNewCardForm(true)}
                  className="w-full py-2.5 px-3 rounded-2xl border border-dashed border-slate-300 dark:border-zinc-700 text-orange-500 hover:bg-orange-500/5 transition font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add New Debit / Credit Card
                </button>
              ) : (
                /* Add New Card Form */
                <form onSubmit={handleSaveAndSelectNewCard} className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 space-y-3 text-left">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase text-zinc-800 dark:text-zinc-200">
                      Add New Card
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowNewCardForm(false)}
                      className="text-[10px] text-zinc-400 hover:text-zinc-600 font-bold"
                    >
                      Cancel
                    </button>
                  </div>

                  {/* Visual Card Preview */}
                  <div className="bg-gradient-to-br from-zinc-800 via-zinc-900 to-black text-white p-4 rounded-2xl shadow-md space-y-3 font-mono">
                    <div className="flex justify-between items-center">
                      <div className="w-8 h-6 bg-amber-400/80 rounded-md" />
                      <span className="text-xs font-bold uppercase tracking-wider">{newCardBrand}</span>
                    </div>
                    <div className="text-sm font-black tracking-widest">
                      {newCardNumber || '•••• •••• •••• ••••'}
                    </div>
                    <div className="flex justify-between text-[9px] text-zinc-300 uppercase">
                      <div>
                        <span className="block text-[7px] text-zinc-400">Cardholder</span>
                        <span>{newCardHolder || 'YOUR NAME'}</span>
                      </div>
                      <div>
                        <span className="block text-[7px] text-zinc-400">Expires</span>
                        <span>{newCardExpiry || 'MM/YY'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Form fields */}
                  <div className="space-y-2">
                    <div>
                      <label className="block text-[9.5px] font-bold text-zinc-500 dark:text-zinc-400 mb-0.5">Card Number</label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        value={newCardNumber}
                        onChange={handleCardNumberFormat}
                        className="w-full bg-white dark:bg-zinc-800 p-2 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[9.5px] font-bold text-zinc-500 dark:text-zinc-400 mb-0.5">Cardholder Name</label>
                      <input
                        type="text"
                        placeholder="Name as on card"
                        value={newCardHolder}
                        onChange={e => setNewCardHolder(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-800 p-2 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-bold"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[9.5px] font-bold text-zinc-500 dark:text-zinc-400 mb-0.5">Expiry (MM/YY)</label>
                        <input
                          type="text"
                          placeholder="08/29"
                          maxLength={5}
                          value={newCardExpiry}
                          onChange={handleExpiryFormat}
                          className="w-full bg-white dark:bg-zinc-800 p-2 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-mono text-center font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[9.5px] font-bold text-zinc-500 dark:text-zinc-400 mb-0.5">CVV</label>
                        <input
                          type="password"
                          placeholder="•••"
                          maxLength={4}
                          value={newCardCvv}
                          onChange={e => setNewCardCvv(e.target.value.replace(/\D/g, ''))}
                          className="w-full bg-white dark:bg-zinc-800 p-2 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-mono text-center font-bold"
                        />
                      </div>
                    </div>

                    <label className="flex items-center gap-2 pt-1 text-[10px] text-zinc-600 dark:text-zinc-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={saveCardChecked}
                        onChange={e => setSaveCardChecked(e.target.checked)}
                        className="rounded text-orange-500"
                      />
                      <span>Save card securely for future payments as per RBI</span>
                    </label>

                    <button
                      type="submit"
                      className="w-full mt-2 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs rounded-xl shadow cursor-pointer transition"
                    >
                      Save & Use This Card
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        )}

        {/* CATEGORY 3: DIGITAL WALLETS PANEL */}
        {selectedCategory === 'Wallet' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800/80 pb-2.5">
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">
                  Available Digital Wallets
                </span>
                <span className="text-[9px] font-bold text-emerald-500 flex items-center gap-1">
                  <Zap className="w-3 h-3" /> 1-Tap Instant Checkout
                </span>
              </div>

              <div className="space-y-2.5">
                {walletList.map(wallet => {
                  const isSelected = selectedWalletId === wallet.id;
                  const hasSufficient = wallet.balance >= amountPayable;

                  return (
                    <div
                      key={wallet.id}
                      id={`wallet-option-${wallet.id}`}
                      className={`p-3.5 rounded-2xl border transition ${
                        isSelected
                          ? 'bg-orange-500/5 dark:bg-orange-500/10 border-orange-500 ring-1 ring-orange-500/20'
                          : 'bg-white dark:bg-zinc-900 border-slate-200/80 dark:border-zinc-800 hover:border-slate-300'
                      }`}
                    >
                      <div
                        onClick={() => setSelectedWalletId(wallet.id)}
                        className="flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${
                            wallet.isNuvvo 
                              ? 'bg-emerald-500 text-white' 
                              : 'bg-slate-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200'
                          }`}>
                            <Wallet className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-zinc-900 dark:text-zinc-100">
                                {wallet.name}
                              </span>
                              <span className="text-[8.5px] font-bold px-1.5 py-0.2 rounded-full border bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                                {wallet.badge}
                              </span>
                            </div>
                            <span className="text-[10px] text-zinc-400 block mt-0.5">
                              {wallet.description}
                            </span>
                          </div>
                        </div>

                        <div className="text-right flex items-center gap-2.5">
                          <div>
                            <span className="text-[9px] text-zinc-400 uppercase block font-bold">Balance</span>
                            <span className={`text-xs font-black font-mono ${
                              hasSufficient ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                            }`}>
                              ₹{wallet.balance}
                            </span>
                          </div>

                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-orange-500 bg-orange-500 text-white' : 'border-zinc-300 dark:border-zinc-700'
                          }`}>
                            {isSelected && <Check className="w-3 h-3" />}
                          </div>
                        </div>
                      </div>

                      {/* Top-up helper for Nuvvo Wallet */}
                      {wallet.isNuvvo && isSelected && (
                        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-zinc-800 space-y-2">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-bold text-zinc-600 dark:text-zinc-400">
                              {hasSufficient
                                ? '✅ Full balance covers this order value.'
                                : `⚠️ Balance is short by ₹${amountPayable - wallet.balance}. Quick recharge:`}
                            </span>
                          </div>

                          <div className="flex gap-2">
                            {[100, 300, 500].map(amt => (
                              <button
                                key={amt}
                                type="button"
                                onClick={() => handleQuickRechargeWallet(amt)}
                                className="flex-1 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 rounded-xl text-[10px] font-black transition cursor-pointer"
                              >
                                +₹{amt}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* CATEGORY 4: CASH ON DELIVERY (COD) PANEL */}
        {selectedCategory === 'COD' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 shadow-xs space-y-3 text-left"
          >
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 shrink-0">
                <IndianRupee className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black text-zinc-900 dark:text-zinc-50">
                  Cash or UPI QR on Delivery
                </h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Pay directly to the delivery rider in cash or by scanning their contactless digital UPI QR code upon arrival.
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-zinc-850 rounded-2xl border border-slate-200 dark:border-zinc-750 text-[10.5px] text-zinc-500 dark:text-zinc-400 space-y-1">
              <span className="font-bold text-zinc-700 dark:text-zinc-300 block">💡 Doorstep Payment Guidelines:</span>
              <p>• Exact change is appreciated to ensure contactless delivery.</p>
              <p>• All riders carry dynamic UPI barcodes accepting GPay, PhonePe, Paytm, and BHIM.</p>
            </div>
          </motion.div>
        )}

        {/* SECURITY & TRUST BADGE */}
        <div className="flex items-center justify-center gap-3 text-zinc-400 dark:text-zinc-500 text-[10px] pt-2">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> 256-Bit SSL
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-emerald-500" /> PCI-DSS Compliant
          </span>
          <span>•</span>
          <span>Instant Refunds</span>
        </div>

      </div>

      {/* STICKY BOTTOM ACTION BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-slate-200 dark:border-zinc-800 p-4 shadow-xl">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-4">
          <div className="text-left">
            <span className="text-[9.5px] text-zinc-400 font-bold uppercase block font-mono leading-none">
              To Pay
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-black text-zinc-900 dark:text-zinc-50 font-mono">
                ₹{amountPayable}
              </span>
            </div>
            <span className="text-[9.5px] text-orange-500 font-bold truncate max-w-[140px] block">
              via {selectedCategory}
            </span>
          </div>

          <button
            id="confirm-pay-btn"
            type="button"
            disabled={isProcessing}
            onClick={handleInitiatePayment}
            className="flex-1 max-w-xs bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white py-3.5 px-4 rounded-2xl font-extrabold text-xs transition shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 active:scale-98 cursor-pointer disabled:opacity-50"
          >
            <span>{getPaymentButtonLabel()}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* QR CODE SIMULATION MODAL */}
      <AnimatePresence>
        {showQrModal && (
          <div className="fixed inset-0 z-50 bg-zinc-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 rounded-3xl p-6 max-w-xs w-full border border-slate-200 dark:border-zinc-800 shadow-2xl text-center space-y-4"
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-black uppercase text-zinc-800 dark:text-zinc-200">
                  Scan to Pay ₹{amountPayable}
                </span>
                <button
                  onClick={() => setShowQrModal(false)}
                  className="text-zinc-400 hover:text-zinc-600 text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Dynamic QR Code mockup */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-inner flex flex-col items-center justify-center">
                <div className="w-48 h-48 border-4 border-zinc-900 p-2 rounded-xl flex items-center justify-center relative bg-white">
                  {/* Outer corner squares */}
                  <div className="absolute top-3 left-3 w-8 h-8 border-4 border-zinc-900 flex items-center justify-center">
                    <div className="w-4 h-4 bg-zinc-900" />
                  </div>
                  <div className="absolute top-3 right-3 w-8 h-8 border-4 border-zinc-900 flex items-center justify-center">
                    <div className="w-4 h-4 bg-zinc-900" />
                  </div>
                  <div className="absolute bottom-3 left-3 w-8 h-8 border-4 border-zinc-900 flex items-center justify-center">
                    <div className="w-4 h-4 bg-zinc-900" />
                  </div>
                  
                  {/* Center branding */}
                  <div className="w-10 h-10 rounded-full bg-orange-500 text-white font-black flex items-center justify-center text-xs shadow">
                    N
                  </div>
                </div>
                <p className="text-[10px] font-mono text-zinc-500 mt-2">
                  UPI ID: {googlePayNumber}@okhdfcbank
                </p>
              </div>

              <div className="text-[10px] text-zinc-500">
                Scan using Google Pay, PhonePe, Paytm or BHIM to pay instantly.
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowQrModal(false);
                  handleInitiatePayment();
                }}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs rounded-xl transition cursor-pointer"
              >
                Simulate QR Scan & Pay ₹{amountPayable}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PAYMENT PROCESSING SIMULATION OVERLAY */}
      <AnimatePresence>
        {isProcessing && (
          <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center p-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 rounded-3xl p-6 max-w-sm w-full border border-slate-200 dark:border-zinc-800 shadow-2xl text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center relative">
                {processingStep < 3 ? (
                  <div className="w-14 h-14 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin flex items-center justify-center">
                    <Lock className="w-6 h-6 text-orange-500" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center animate-bounce">
                    <CheckCircle className="w-10 h-10" />
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-base font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
                  {processingStep === 3 ? 'Payment Confirmed!' : 'Processing Payment...'}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  {processingMessage}
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-zinc-800 p-3 rounded-2xl text-[11px] font-mono flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                <span>Amount: ₹{amountPayable}</span>
                <span>Gateway: 256-bit SSL</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
