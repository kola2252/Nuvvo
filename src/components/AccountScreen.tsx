/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, MapPin, Heart, Shield, HelpCircle, PhoneCall, LogOut, Sun, Moon, 
  Settings, ToggleLeft, ToggleRight, Trash, Globe, ShieldAlert, Award, Upload,
  History, RefreshCw, ChevronDown, ChevronLeft, CheckCircle, Edit, Plus, X, Map, Check,
  Bell, Sparkles, CreditCard, Lock, Camera, Star, ShoppingBag, Search,
  Share2, Copy, Gift, Users, Wallet, Receipt, Printer, Download
} from 'lucide-react';
import { Address, SavedCard, SavedUPI } from '../types';
import OrderHistory from './OrderHistory';

export default function AccountScreen() {
  const { 
    user, toggleDarkMode, darkMode, logoutUser, setCurrentPage, 
    currentAddress, clickToWhatsAppSupport, logs, changeOrderStatus,
    registerNewRestaurantRequest, restaurants, toggleRestaurantActiveStatus,
    orders, reorderItems, updateUserAddresses, setCurrentAddress,
    orderUpdatesEnabled, promotionalAlertsEnabled, deliveryUpdatesEnabled,
    setOrderUpdatesEnabled, setPromotionalAlertsEnabled, setDeliveryUpdatesEnabled,
    triggerPromoAlert, triggerOrderUpdateAlert, triggerDeliveryUpdateAlert,
    nuvvoPoints, pointsHistory, awardPointsBonus, updateUserProfile,
    currentTheme, setThemeId, themesList, requestNotificationPermission, notificationPermission,
    pageHistory, goBack, closePage
  } = useApp();

  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [selectedPreviewThemeId, setSelectedPreviewThemeId] = useState<string>(currentTheme.id);
  const [showThemeAppliedMessage, setShowThemeAppliedMessage] = useState<boolean>(false);

  useEffect(() => {
    setSelectedPreviewThemeId(currentTheme.id);
  }, [currentTheme.id]);

  const selectedPreviewTheme = themesList.find(t => t.id === selectedPreviewThemeId) || currentTheme;
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profileFlatNo, setProfileFlatNo] = useState('');
  const [profileArea, setProfileArea] = useState('');
  const [profileCity, setProfileCity] = useState('');

  // Synchronize state variables with active user data on mount / change
  useEffect(() => {
    if (user) {
      setProfileName(user.name || '');
      setProfileEmail(user.email || '');
      setProfilePhone(user.phone || '');
      const primaryAddr = user.addresses?.find(a => a.isDefault) || user.addresses?.[0];
      setProfileFlatNo(primaryAddr?.flatNo || '');
      setProfileArea(primaryAddr?.area || '');
      setProfileCity(primaryAddr?.city || 'Chirala');
    }
  }, [user, isEditingInfo]);

  // Device camera photo capture states
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  // Hook to connect stream to video element when stream or active state updates
  useEffect(() => {
    if (isCameraActive && cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [isCameraActive, cameraStream]);

  const startCamera = async () => {
    setCameraError(null);
    setCapturedPhoto(null);
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 480 }, height: { ideal: 480 } },
        audio: false
      });
      setCameraStream(stream);
    } catch (err: any) {
      console.warn("Camera access failed:", err);
      setCameraError("Unable to access camera. Please prompt/allow permissions or upload a portrait file below.");
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      try {
        cameraStream.getTracks().forEach(track => track.stop());
      } catch (e) {
        // Safe stream closer
      }
      setCameraStream(null);
    }
    setIsCameraActive(false);
    setCameraError(null);
    setCapturedPhoto(null);
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (context) {
        const videoWidth = video.videoWidth || 480;
        const videoHeight = video.videoHeight || 480;
        const size = Math.min(videoWidth, videoHeight);
        canvas.width = size;
        canvas.height = size;
        
        const startX = (videoWidth - size) / 2;
        const startY = (videoHeight - size) / 2;
        
        context.drawImage(
          video, 
          startX, startY, size, size,
          0, 0, size, size
        );
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setCapturedPhoto(dataUrl);
      }
    }
  };

  const saveCapturedAvatar = () => {
    if (capturedPhoto && user) {
      updateUserProfile(user.name, user.email, capturedPhoto);
      stopCamera();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setCapturedPhoto(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Loyalty local UI triggers
  const [dailyClaimLoading, setDailyClaimLoading] = useState(false);
  const [dailyClaimed, setDailyClaimed] = useState<boolean>(() => {
    return localStorage.getItem('nuvvo_daily_pts_timestamp') === new Date().toLocaleDateString();
  });
  const [spinResultMsg, setSpinResultMsg] = useState<string | null>(null);

  // REFERRAL & STORE CREDITS SYSTEM STATES
  const [referralCode] = useState<string>(() => {
    const cached = localStorage.getItem('nuvvo_user_referral_code');
    if (cached) return cached;
    const userNamePart = user?.name ? user.name.split(' ')[0].replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase() : 'USER';
    const randPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    const newCode = `NUVVO-${userNamePart || 'VIP'}-${randPart}`;
    localStorage.setItem('nuvvo_user_referral_code', newCode);
    return newCode;
  });

  const [referralCredits, setReferralCredits] = useState<number>(() => {
    const stored = localStorage.getItem('nuvvo_referral_credits');
    return stored ? Number(stored) : 250;
  });

  const [inputReferralCode, setInputReferralCode] = useState('');
  const [appliedReferralCode, setAppliedReferralCode] = useState<string | null>(() => {
    return localStorage.getItem('nuvvo_applied_referral_code');
  });

  const [referralMessage, setReferralMessage] = useState<string | null>(null);
  const [referralMsgType, setReferralMsgType] = useState<'success' | 'error' | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSimulatingFriend, setIsSimulatingFriend] = useState(false);
  const [isConvertingCredits, setIsConvertingCredits] = useState(false);

  const [referredFriendsList, setReferredFriendsList] = useState<any[]>(() => {
    const stored = localStorage.getItem('nuvvo_referred_friends');
    return stored ? JSON.parse(stored) : [
      { id: 'f_1', name: 'Ravi Teja', status: 'Completed Order', reward: 150, date: 'June 18, 2026' },
      { id: 'f_2', name: 'Meera Rao', status: 'Signed Up', reward: 100, date: 'June 22, 2026' }
    ];
  });

  // Persist referral changes
  useEffect(() => {
    localStorage.setItem('nuvvo_referral_credits', referralCredits.toString());
  }, [referralCredits]);

  useEffect(() => {
    localStorage.setItem('nuvvo_referred_friends', JSON.stringify(referredFriendsList));
  }, [referredFriendsList]);

  // NUVVO WALLET STATES
  const [walletBalance, setWalletBalance] = useState<number>(() => {
    const stored = localStorage.getItem('nuvvo_wallet_balance');
    return stored ? Number(stored) : 500;
  });

  const [walletHistory, setWalletHistory] = useState<any[]>(() => {
    const stored = localStorage.getItem('nuvvo_wallet_history');
    return stored ? JSON.parse(stored) : [
      { id: 'w_1', type: 'credit', amount: 500, description: 'Opening Store Credit Balance', date: 'June 15, 2026' }
    ];
  });

  const [walletFlowStep, setWalletFlowStep] = useState<'view' | 'input' | 'processing' | 'success' | 'failed'>('view');
  const [walletRechargeAmt, setWalletRechargeAmt] = useState<string>('500');
  const [walletPaymentMethod, setWalletPaymentMethod] = useState<string>('UPI');
  const [walletProcessLog, setWalletProcessLog] = useState<string>('');
  const [walletSuccessMessage, setWalletSuccessMessage] = useState<string>('');

  useEffect(() => {
    localStorage.setItem('nuvvo_wallet_balance', walletBalance.toString());
  }, [walletBalance]);

  useEffect(() => {
    localStorage.setItem('nuvvo_wallet_history', JSON.stringify(walletHistory));
  }, [walletHistory]);

  // SAVED ADDRESSES MANAGEMENT STATES
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [editingAddrId, setEditingAddrId] = useState<string | null>(null);
  const [addrType, setAddrType] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [addrFlatNo, setAddrFlatNo] = useState('');
  const [addrArea, setAddrArea] = useState('');
  const [addrLandmark, setAddrLandmark] = useState('');
  const [addrCity, setAddrCity] = useState('Chirala');
  const [addrLat, setAddrLat] = useState(15.8270);
  const [addrLng, setAddrLng] = useState(80.3551);
  const [addrIsDefault, setAddrIsDefault] = useState(false);
  const [addressSuccessMsg, setAddressSuccessMsg] = useState<string | null>(null);

  // Vendor self-registration form states
  const [showRegForm, setShowRegForm] = useState(false);
  const [partnerName, setPartnerName] = useState('');
  const [partnerType, setPartnerType] = useState('Family');
  const [partnerCuisines, setPartnerCuisines] = useState('');
  const [partnerCost, setPartnerCost] = useState('250');
  const [partnerImage, setPartnerImage] = useState('');

  // Filter restaurants associated with the current user's phone
  const myRestaurants = user ? restaurants.filter(r => r.phone === user.phone) : [];

  const preSavedAddresses = user?.addresses || [];

  // INVOICE STATE FOR PROFILE VIEW
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<any | null>(null);
  const [invoiceSearchQuery, setInvoiceSearchQuery] = useState('');
  const [copiedInvoiceId, setCopiedInvoiceId] = useState<string | null>(null);

  const handlePrintInvoice = () => {
    window.print();
  };

  const handleCopyInvoiceText = (order: any) => {
    const itemsText = order.items.map((i: any) => `- ${i.foodItem.name} x${i.quantity} (₹${i.foodItem.price * i.quantity})`).join('\n');
    const invoiceText = `🧾 NUVVO GOURMET CO. - OFFICIAL TAX INVOICE
=========================================
Invoice Ref: INV-2026-${order.id.slice(-6).toUpperCase()}
Date: ${new Date(order.date).toLocaleString()}
Status: ${order.status.toUpperCase()} (${order.status !== 'cancelled' ? 'PAID' : 'CANCELLED'} via ${order.paymentMethod})
-----------------------------------------
CUSTOMER DETAILS:
Name: ${order.customerName || user?.name}
Phone: +91 ${order.customerPhone || user?.phone}
Address: ${order.deliveryAddress}
-----------------------------------------
ITEMIZED CHARGES:
${itemsText}

Subtotal: ₹${order.items.reduce((sum: number, i: any) => sum + (i.foodItem.price * i.quantity), 0)}
Packaging Charges: ₹${order.packagingFee !== undefined ? order.packagingFee : 10}
Delivery Fee: ₹${order.deliveryFee !== undefined ? order.deliveryFee : 20}
Rider Tip: ₹${order.deliveryPartnerTip || 0}
Promo Discount: -₹${order.discount || 0}
Loyalty Cashback: -₹${order.pointsRedeemed || 0}
-----------------------------------------
GRAND TOTAL: ₹${order.totalAmount}
=========================================
Thank you for dining with Nuvvo Gourmet!`;

    navigator.clipboard.writeText(invoiceText);
    setCopiedInvoiceId(order.id);
    setTimeout(() => setCopiedInvoiceId(null), 2000);
  };

  // SAVED PAYMENT STATE
  const [savedCards, setSavedCards] = useState<SavedCard[]>(() => {
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
  });

  const [savedUPIs, setSavedUPIs] = useState<SavedUPI[]>(() => {
    if (!user) return [];
    try {
      const stored = localStorage.getItem(`nuvvo_upis_${user.phone}`);
      return stored ? JSON.parse(stored) : [
        { id: 'upi_demo_1', name: 'Personal GPay', upiId: `${user.phone}@okaxis`, provider: 'GPAY' },
        { id: 'upi_demo_2', name: 'PhonePe Secondary', upiId: `${user.phone}@ybl`, provider: 'PHONEPE' }
      ];
    } catch {
      return [];
    }
  });

  const [showPayForm, setShowPayForm] = useState<'card' | 'upi' | null>(null);

  // Card Form State
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardBrand, setCardBrand] = useState<'Visa' | 'Mastercard' | 'RuPay' | 'Amex' | 'Other'>('Visa');

  // UPI Form State
  const [upiLabel, setUpiLabel] = useState('');
  const [upiIdInput, setUpiIdInput] = useState('');
  const [upiProvider, setUpiProvider] = useState<'GPAY' | 'PHONEPE' | 'PAYTM' | 'BHIM' | 'OTHER'>('GPAY');

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const parts = [];
    for (let i = 0; i < v.length; i += 4) {
      parts.push(v.substring(i, i + 4));
    }
    return parts.length > 0 ? parts.join(' ').substring(0, 19) : v;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return `${v.slice(0, 2)}/${v.slice(2, 4)}`.substring(0, 5);
    }
    return v;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);

    // Detect card brand automatically
    const firstDigit = formatted.charAt(0);
    if (firstDigit === '4') {
      setCardBrand('Visa');
    } else if (firstDigit === '5') {
      setCardBrand('Mastercard');
    } else if (firstDigit === '3') {
      setCardBrand('Amex');
    } else if (firstDigit === '6' || firstDigit === '8' || firstDigit === '9') {
      setCardBrand('RuPay');
    }
  };

  const handleSaveCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Please log in to preserve custom credit cards.");
      return;
    }
    if (!cardHolder.trim() || !cardNumber.trim() || !cardExpiry.trim() || !cardCvv.trim()) {
      alert('Kindly complete all fields to safely store card details.');
      return;
    }

    const cleanNum = cardNumber.replace(/\s+/g, '');
    if (cleanNum.length < 13 || isNaN(Number(cleanNum))) {
      alert('Invalid Card number. Please input a complete 13-16 digit number.');
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
      alert('Invalid Expiration format. Please use MM/YY (e.g., 12/28)');
      return;
    }
    if (cardCvv.length < 3 || isNaN(Number(cardCvv))) {
      alert('Kindly supply a valid 3-4 digit Security Code (CVV).');
      return;
    }

    const last4 = cleanNum.slice(-4);
    const hiddenNum = `•••• •••• •••• ${last4}`;

    const newCard: SavedCard = {
      id: `card_${Date.now()}`,
      cardHolder: cardHolder.trim(),
      cardNumber: hiddenNum,
      expiryDate: cardExpiry,
      cardBrand: cardBrand
    };

    const updated = [...savedCards, newCard];
    setSavedCards(updated);
    localStorage.setItem(`nuvvo_cards_${user.phone}`, JSON.stringify(updated));

    // Reset Form
    setCardHolder('');
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
    setShowPayForm(null);
    alert('💳 Card pre-authorized and securely saved inside your profile.');
  };

  const handleSaveUPI = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Please log in to preserve custom UPI IDs.");
      return;
    }
    if (!upiLabel.trim() || !upiIdInput.trim()) {
      alert('Kindly specify both Friendly Name and UPI Address fields.');
      return;
    }

    if (!upiIdInput.includes('@')) {
      alert('Invalid UPI format. An active UPI ID must contain "@" (e.g., name@okaxis)');
      return;
    }

    const newUpi: SavedUPI = {
      id: `upi_${Date.now()}`,
      name: upiLabel.trim(),
      upiId: upiIdInput.trim().toLowerCase(),
      provider: upiProvider
    };

    const updated = [...savedUPIs, newUpi];
    setSavedUPIs(updated);
    localStorage.setItem(`nuvvo_upis_${user.phone}`, JSON.stringify(updated));

    // Reset Form
    setUpiLabel('');
    setUpiIdInput('');
    setShowPayForm(null);
    alert('⚡ Secure UPI profile created and saved for direct one-tap checkout!');
  };

  const handleDeleteCard = (cardId: string) => {
    if (!user) return;
    if (window.confirm('Are you sure you want to remove this saved card?')) {
      const updated = savedCards.filter(c => c.id !== cardId);
      setSavedCards(updated);
      localStorage.setItem(`nuvvo_cards_${user.phone}`, JSON.stringify(updated));
    }
  };

  const handleDeleteUPI = (upiId: string) => {
    if (!user) return;
    if (window.confirm('Are you sure you want to remove this saved UPI address?')) {
      const updated = savedUPIs.filter(u => u.id !== upiId);
      setSavedUPIs(updated);
      localStorage.setItem(`nuvvo_upis_${user.phone}`, JSON.stringify(updated));
    }
  };

  // SAVED ADDRESS MANAGEMENT FUNCTIONS
  const handleOpenAddForm = () => {
    setEditingAddrId(null);
    setAddrType('Home');
    setAddrFlatNo('');
    setAddrArea('');
    setAddrLandmark('');
    setAddrCity('Chirala');
    setAddrLat(15.8270);
    setAddrLng(80.3551);
    setAddrIsDefault(preSavedAddresses.length === 0);
    setShowAddrForm(true);
  };

  const handleOpenEditForm = (addr: Address) => {
    setEditingAddrId(addr.id);
    setAddrType(addr.type);
    setAddrFlatNo(addr.flatNo);
    setAddrArea(addr.area);
    setAddrLandmark(addr.landmark || '');
    setAddrCity(addr.city);
    setAddrLat(addr.gpsCoordinates?.lat ?? 15.8270);
    setAddrLng(addr.gpsCoordinates?.lng ?? 80.3551);
    setAddrIsDefault(!!addr.isDefault);
    setShowAddrForm(true);
  };

  const handleDeleteAddress = (addrId: string) => {
    if (!user) return;
    const confirmDelete = window.confirm("Are you sure you want to delete this saved delivery address?");
    if (!confirmDelete) return;

    const target = preSavedAddresses.find(a => a.id === addrId);
    let updatedList = preSavedAddresses.filter(a => a.id !== addrId);

    if (target?.isDefault && updatedList.length > 0) {
      updatedList[0].isDefault = true;
      setCurrentAddress(updatedList[0]);
    } else if (updatedList.length === 0) {
      setCurrentAddress(null);
    }

    updateUserAddresses(updatedList);
    setAddressSuccessMsg("Delivery address deleted successfully from your book.");
    setTimeout(() => {
      setAddressSuccessMsg(null);
    }, 3800);
  };

  const handleSetAddressAsDefault = (addr: Address) => {
    if (!user) return;
    const updatedList = preSavedAddresses.map(a => ({
      ...a,
      isDefault: a.id === addr.id
    }));
    updateUserAddresses(updatedList);
    setCurrentAddress(addr);
    setAddressSuccessMsg(`"${addr.type}" is now configured as your Primary delivery address for faster checkouts.`);
    setTimeout(() => {
      setAddressSuccessMsg(null);
    }, 4500);
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Please log in to preserve custom delivery locations.");
      return;
    }
    if (!addrFlatNo.trim() || !addrArea.trim()) {
      alert("Flat/House Number and Area/Street details are required.");
      return;
    }

    const newAddr: Address = {
      id: editingAddrId || `addr_${Date.now()}`,
      type: addrType,
      flatNo: addrFlatNo,
      area: addrArea,
      landmark: addrLandmark,
      city: addrCity,
      gpsCoordinates: { lat: addrLat, lng: addrLng },
      isDefault: addrIsDefault
    };

    let updatedList: Address[] = [];
    if (editingAddrId) {
      updatedList = preSavedAddresses.map(a => a.id === editingAddrId ? newAddr : a);
    } else {
      updatedList = [...preSavedAddresses, newAddr];
    }

    if (addrIsDefault) {
      updatedList = updatedList.map(a => ({
        ...a,
        isDefault: a.id === newAddr.id
      }));
      setCurrentAddress(newAddr);
    } else {
      if (updatedList.length === 1) {
        updatedList[0].isDefault = true;
        setCurrentAddress(updatedList[0]);
      }
    }

    updateUserAddresses(updatedList);
    setShowAddrForm(false);
    setEditingAddrId(null);
    setAddressSuccessMsg(editingAddrId ? "Address updated successfully." : "New delivery location successfully stored in your profile.");
    setTimeout(() => {
      setAddressSuccessMsg(null);
    }, 4000);
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!profileName.trim()) {
      alert("Name is required.");
      return;
    }
    if (!profilePhone.trim()) {
      alert("Phone number is required.");
      return;
    }

    // 1. Update name, email, phone (pass avatar and phone number too!)
    updateUserProfile(profileName, profileEmail, user.avatar, profilePhone);

    // 2. Update address (flatNo, area, city)
    const primaryAddr = user.addresses?.find(a => a.isDefault) || user.addresses?.[0];
    let updatedAddresses = [...(user.addresses || [])];

    if (primaryAddr) {
      const updatedAddr = {
        ...primaryAddr,
        flatNo: profileFlatNo,
        area: profileArea,
        city: profileCity
      };
      updatedAddresses = updatedAddresses.map(a => a.id === primaryAddr.id ? updatedAddr : a);
      setCurrentAddress(updatedAddr);
    } else {
      const newAddr: Address = {
        id: `addr_${Date.now()}`,
        type: 'Home',
        flatNo: profileFlatNo || 'N/A',
        area: profileArea || 'Chirala Delivery Point',
        city: profileCity || 'Chirala',
        isDefault: true
      };
      updatedAddresses = [newAddr];
      setCurrentAddress(newAddr);
    }

    updateUserAddresses(updatedAddresses);
    alert('🎉 Profile updated successfully! Your updated details are saved.');
    setIsEditingInfo(false);
  };

  const handleSelfRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerName.trim()) {
      alert('Business name is required.');
      return;
    }
    const cuisinesList = partnerCuisines.split(',').map(s => s.trim()).filter(Boolean);
    registerNewRestaurantRequest(
      partnerName,
      cuisinesList.length ? cuisinesList : ['Andhra meals', 'Local specials'],
      parseInt(partnerCost) || 200,
      user?.phone || 'Guest Phone',
      partnerType,
      partnerImage
    );
    alert(`Thank you! "${partnerName}" registration has been filed successfully. Our Super Admin will verify and approve your listing shortly.`);
    setPartnerName('');
    setPartnerCuisines('');
    setPartnerImage('');
    setShowRegForm(false);
  };

  const handleClaimDailyReward = () => {
    if (dailyClaimed) return;
    setDailyClaimLoading(true);
    setSpinResultMsg(null);
    setTimeout(() => {
      const possibleAmounts = [15, 25, 35, 50];
      const selectedAmt = possibleAmounts[Math.floor(Math.random() * possibleAmounts.length)];
      awardPointsBonus(selectedAmt, "Daily reward gift claim bonus!", "spin_bonus");
      localStorage.setItem('nuvvo_daily_pts_timestamp', new Date().toLocaleDateString());
      setDailyClaimed(true);
      setDailyClaimLoading(false);
      setSpinResultMsg(`🎉 Congratulations! You received +${selectedAmt} Nuvvo Points!`);
    }, 1200);
  };

  const handleCopyReferralCode = () => {
    setCopied(true);
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(referralCode);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = referralCode;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
    } catch (e) {
      console.warn("Copy to clipboard failed:", e);
    }
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyReferralCode = (e: React.FormEvent) => {
    e.preventDefault();
    setReferralMessage(null);
    setReferralMsgType(null);

    const code = inputReferralCode.trim().toUpperCase();
    if (!code) {
      setReferralMessage("Please enter a valid referral code.");
      setReferralMsgType("error");
      return;
    }

    if (code === referralCode) {
      setReferralMessage("You cannot redeem your own referral code.");
      setReferralMsgType("error");
      return;
    }

    if (appliedReferralCode) {
      setReferralMessage(`You have already applied a referral code (${appliedReferralCode}).`);
      setReferralMsgType("error");
      return;
    }

    if (!code.startsWith("NUVVO-")) {
      setReferralMessage("Invalid code format. Referral codes must start with 'NUVVO-'.");
      setReferralMsgType("error");
      return;
    }

    // Add ₹100 credit on successful application
    setReferralCredits(prev => prev + 100);
    setAppliedReferralCode(code);
    localStorage.setItem('nuvvo_applied_referral_code', code);
    setReferralMessage("🎉 Code applied successfully! ₹100 Store Credits have been credited to your balance.");
    setReferralMsgType("success");
    setInputReferralCode('');
  };

  const handleSimulateFriendSignUp = () => {
    setIsSimulatingFriend(true);
    setReferralMessage(null);
    setReferralMsgType(null);

    setTimeout(() => {
      const names = [
        "Siddharth Sharma", "Ananya Deshmukh", "Vikram Sen", "Priya Nair", 
        "Rohan Malhotra", "Sneha Iyer", "Karan Johar", "Pooja Hegde"
      ];
      const selectedName = names[Math.floor(Math.random() * names.length)];
      const randomId = `friend_sim_${Date.now()}`;
      const isCompleted = Math.random() > 0.4;
      const rewardAmt = isCompleted ? 150 : 100;

      const newFriendObj = {
        id: randomId,
        name: selectedName,
        status: isCompleted ? 'Completed Order' : 'Signed Up',
        reward: rewardAmt,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      };

      setReferredFriendsList(prev => [newFriendObj, ...prev]);
      setReferralCredits(prev => prev + rewardAmt);
      
      setReferralMessage(`🎉 ${selectedName} joined using your code. You earned ₹${rewardAmt} Store Credits!`);
      setReferralMsgType("success");
      setIsSimulatingFriend(false);
    }, 1200);
  };

  const handleConvertCredits = () => {
    if (referralCredits <= 0) {
      setReferralMessage("No credits available for conversion.");
      setReferralMsgType("error");
      return;
    }

    setIsConvertingCredits(true);
    const amt = referralCredits;

    setTimeout(() => {
      awardPointsBonus(amt, `Converted ${amt} Store Credits from Referrals`, "welcome");
      setReferralCredits(0);
      setReferralMessage(`🎉 Successfully converted ₹${amt} Store Credits into ${amt} Nuvvo Points!`);
      setReferralMsgType("success");
      setIsConvertingCredits(false);
    }, 1200);
  };

  const handleAddWalletMoney = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(walletRechargeAmt);
    if (isNaN(amt) || amt <= 0) {
      alert("Please enter a valid amount.");
      return;
    }
    if (amt > 20000) {
      alert("Recharge limit exceeded. Maximum amount per transaction is ₹20,000.");
      return;
    }

    setWalletFlowStep('processing');
    setWalletProcessLog("Initializing secure checkout gateway...");

    setTimeout(() => {
      setWalletProcessLog("Establishing direct communication with bank gateway...");
      setTimeout(() => {
        setWalletProcessLog("Verifying security token and balance availability...");
        setTimeout(() => {
          setWalletProcessLog("Finalizing transaction settlement...");
          setTimeout(() => {
            const newBalance = walletBalance + amt;
            const newTx = {
              id: `w_tx_${Date.now()}`,
              type: 'credit',
              amount: amt,
              description: `Loaded via Mock Payment (${walletPaymentMethod})`,
              date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
            };
            const updatedHistory = [newTx, ...walletHistory];
            
            setWalletBalance(newBalance);
            setWalletHistory(updatedHistory);
            setWalletSuccessMessage(`₹${amt} successfully credited to your Nuvvo Wallet as active store credits!`);
            setWalletFlowStep('success');
          }, 800);
        }, 800);
      }, 800);
    }, 800);
  };

  const paymentProfilesMock = [
    { provider: 'PhonePe', value: '7702906994', checked: true, color: 'bg-violet-50 text-violet-600 border-violet-100' },
    { provider: 'Bharat UPI', value: '7702906994@ybl', checked: false, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 pb-32 transition-colors duration-300">
      
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-zinc-900 border-b border-slate-100 dark:border-zinc-800 p-4 z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={pageHistory.length > 1 ? goBack : closePage}
            className="p-1.5 bg-slate-150 dark:bg-zinc-800 hover:bg-slate-250 dark:hover:bg-zinc-700 rounded-full text-zinc-700 dark:text-zinc-300 transition-all cursor-pointer active:scale-95 flex items-center justify-center shrink-0"
            title="Go Back"
            id="account-screen-back-btn"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={closePage}
            className="p-1.5 bg-slate-150 dark:bg-zinc-800 hover:bg-slate-250 dark:hover:bg-zinc-700 rounded-full text-zinc-700 dark:text-zinc-300 transition-all cursor-pointer active:scale-95 flex items-center justify-center shrink-0"
            title="Close to Home"
            id="account-screen-close-btn"
          >
            <X className="w-4 h-4" />
          </button>
          <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight ml-1">Your Account</h2>
        </div>
        <button 
          onClick={logoutUser}
          className="text-xs text-rose-500 font-extrabold flex items-center gap-1 hover:underline cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" /> Log Out
        </button>
      </div>

      <div className="p-4 max-w-sm mx-auto space-y-4">
        
        {/* CORE USER BIO PROFILE */}
        <div className="bg-white dark:bg-zinc-900 border rounded-3xl p-5 shadow-sm space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl" />
          
          <div className="flex items-center gap-4">
            <div className="relative group shrink-0">
              <div id="user-avatar-badge-container" className="w-16 h-16 rounded-full bg-orange-500 text-white font-black flex items-center justify-center text-xl shadow-lg shadow-orange-500/20 overflow-hidden border border-orange-200 dark:border-zinc-800">
                {user?.avatar ? (
                  <img 
                    id="user-avatar-badge-img"
                    src={user.avatar} 
                    alt={`${user.name}'s Profile Avatar`} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-6 h-6" />
                )}
              </div>
              
              <button
                id="profile-avatar-camera-trigger"
                onClick={startCamera}
                type="button"
                className="absolute -bottom-1 -right-1 p-1.5 bg-orange-500 hover:bg-orange-600 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white rounded-full border border-white dark:border-zinc-900 shadow-lg cursor-pointer transition transform hover:scale-110 active:scale-95 flex items-center justify-center"
                title="Update Profile Photo with Camera"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <div>
              <h3 className="font-extrabold text-zinc-900 dark:text-zinc-50 leading-tight">
                {user?.name || 'Incomplete Profile'}
              </h3>
              <p className="text-[10px] text-zinc-400 font-mono font-bold mt-1 tracking-tight">MOBILE: +91 {user?.phone || 'Guest Mode'}</p>
              <div className="mt-1 flex gap-1">
                <span className="text-[9px] bg-orange-500/10 text-orange-600 px-2 py-0.5 rounded-full font-bold uppercase">
                  Role: {user?.role || 'Guest'}
                </span>
                {user?.phone === '8328355812' && (
                  <span className="text-[9px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold uppercase animate-pulse">Super Master</span>
                )}
              </div>
            </div>
          </div>

          {isEditingInfo ? (
            <form onSubmit={handleUpdateProfile} className="space-y-3.5 pt-3 border-t dark:border-zinc-800 text-xs">
              <div>
                <label className="block text-[9px] uppercase font-black text-zinc-400 dark:text-zinc-550 mb-0.5 tracking-wider">Customer Name</label>
                <input 
                  type="text" 
                  value={profileName} 
                  onChange={e => setProfileName(e.target.value)} 
                  required
                  className="w-full bg-slate-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 p-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 font-extrabold focus:outline-none focus:border-orange-500"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-[9px] uppercase font-black text-zinc-400 dark:text-zinc-550 mb-0.5 tracking-wider">Phone Number</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 font-bold font-mono">+91</span>
                  <input 
                    type="tel" 
                    value={profilePhone} 
                    onChange={e => setProfilePhone(e.target.value)} 
                    required
                    maxLength={10}
                    className="w-full bg-slate-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 pl-11 pr-2.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 font-mono font-black focus:outline-none focus:border-orange-500"
                    placeholder="10-digit mobile number"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] uppercase font-black text-zinc-400 dark:text-zinc-550 mb-0.5 tracking-wider">Email Address</label>
                <input 
                  type="email" 
                  value={profileEmail} 
                  onChange={e => setProfileEmail(e.target.value)} 
                  className="w-full bg-slate-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 p-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 font-bold focus:outline-none focus:border-orange-500"
                  placeholder="name@example.com"
                />
              </div>

              {/* PRIMARY DELIVERY PIN SUBSECTION */}
              <div className="pt-2.5 border-t border-dashed border-slate-200 dark:border-zinc-800 space-y-2">
                <span className="block text-[9.5px] uppercase font-black text-orange-500 tracking-wider">
                  Primary Delivery Location
                </span>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="col-span-2">
                    <label className="block text-[8.5px] font-bold text-zinc-400 dark:text-zinc-500 uppercase mb-0.5">Flat / House No / Floor</label>
                    <input 
                      type="text" 
                      value={profileFlatNo} 
                      onChange={e => setProfileFlatNo(e.target.value)} 
                      required
                      className="w-full bg-slate-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 p-2 rounded-lg border border-slate-250/60 dark:border-zinc-700 font-bold"
                      placeholder="e.g. Flat 301, Tulip Block"
                    />
                  </div>
                  <div>
                    <label className="block text-[8.5px] font-bold text-zinc-400 dark:text-zinc-500 uppercase mb-0.5">Area / Street Name</label>
                    <input 
                      type="text" 
                      value={profileArea} 
                      onChange={e => setProfileArea(e.target.value)} 
                      required
                      className="w-full bg-slate-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 p-2 rounded-lg border border-slate-250/60 dark:border-zinc-700 font-bold"
                      placeholder="e.g. Kothapet Road"
                    />
                  </div>
                  <div>
                    <label className="block text-[8.5px] font-bold text-zinc-400 dark:text-zinc-500 uppercase mb-0.5">City</label>
                    <input 
                      type="text" 
                      value={profileCity} 
                      onChange={e => setProfileCity(e.target.value)} 
                      required
                      className="w-full bg-slate-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 p-2 rounded-lg border border-slate-250/60 dark:border-zinc-700 font-bold"
                      placeholder="e.g. Chirala"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t dark:border-zinc-800">
                <button 
                  type="button" 
                  onClick={() => setIsEditingInfo(false)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-650 dark:text-zinc-300 rounded-xl font-black uppercase text-[10px] tracking-wider transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className={`px-4 py-2 ${currentTheme.bgClass} hover:opacity-90 text-white rounded-xl font-black uppercase text-[10px] tracking-wider transition cursor-pointer shadow-sm`}
                >
                  Save Profile
                </button>
              </div>
            </form>
          ) : (
            <div className="pt-3 border-t dark:border-zinc-800 text-xs space-y-2">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-400 font-semibold">Email:</span>
                  <strong className="text-zinc-800 dark:text-zinc-200 font-bold">{user?.email || 'Not configured'}</strong>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-400 font-semibold">Phone:</span>
                  <strong className="text-zinc-800 dark:text-zinc-200 font-mono font-bold">+91 {user?.phone || 'Guest Mode'}</strong>
                </div>
                <div className="flex items-start justify-between text-[11px] gap-4">
                  <span className="text-zinc-400 font-semibold shrink-0">Delivery Address:</span>
                  <strong className="text-zinc-850 dark:text-zinc-250 text-right font-medium leading-tight">
                    {user?.addresses && user.addresses.length > 0 ? (
                      (() => {
                        const defaultAddr = user.addresses.find(a => a.isDefault) || user.addresses[0];
                        return `${defaultAddr.flatNo}, ${defaultAddr.area}, ${defaultAddr.city}`;
                      })()
                    ) : (
                      'No addresses configured yet'
                    )}
                  </strong>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2.5 border-t border-dashed dark:border-zinc-800">
                <p className="text-[10px] text-zinc-400 dark:text-zinc-550 font-mono italic">First Joined: June 2026</p>
                <button 
                  onClick={() => setIsEditingInfo(true)}
                  className={`${currentTheme.textClass} font-extrabold text-[11px] focus:outline-none hover:underline cursor-pointer flex items-center gap-1`}
                >
                  <Edit className="w-3 h-3" /> Edit Profile Details
                </button>
              </div>
            </div>
          )}
        </div>

        {/* NUVVO POINTS LOYALTY REWARDS COMPONENT */}
        <div id="nuvvo-points-loyalty-rewards" className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-500 animate-bounce" />
              <div className="leading-tight">
                <h4 className="text-xs font-black text-zinc-950 dark:text-zinc-50 uppercase tracking-widest">
                  Loyalty Passport
                </h4>
                <p className="text-[9px] text-[#555a64] font-semibold dark:text-zinc-400">Nuvvo Rewards Club</p>
              </div>
            </div>
            
            {/* Tier Badge */}
            <span className={`text-[9.5px] px-2.5 py-1 rounded-full font-black tracking-wide uppercase ${
              nuvvoPoints <= 200 
                ? 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700'
                : nuvvoPoints <= 500
                  ? 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-500/30'
                  : 'bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-500/30 animate-pulse'
            }`}>
              {nuvvoPoints <= 200 ? '🥈 Silver Foodie' : nuvvoPoints <= 500 ? '🥇 Gold Gourmet' : '👑 Platinum Elite'}
            </span>
          </div>

          {/* Points Passport Card */}
          <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 shadow-md relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/5 rounded-full" />
            <div className="absolute right-4 top-4 opacity-10">
              <Sparkles className="w-16 h-16" />
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[9px] text-indigo-300 font-mono tracking-widest uppercase block font-bold">Available Balance</span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-3xl font-black font-mono tracking-tight text-white">{nuvvoPoints}</span>
                  <span className="text-[10px] text-indigo-300 font-black uppercase">Nuvvo Points</span>
                </div>
              </div>

              {/* Progress to next tier */}
              <div className="space-y-1 pt-1.5">
                <div className="flex justify-between items-center text-[9px] font-mono font-bold text-indigo-300">
                  <span>
                    {nuvvoPoints <= 200 
                      ? 'Progress to Gold' 
                      : nuvvoPoints <= 500 
                        ? 'Progress to Platinum Elite' 
                        : 'Max Tier Reached'}
                  </span>
                  <span>
                    {nuvvoPoints <= 200 
                      ? `${nuvvoPoints}/200 PTS` 
                      : nuvvoPoints <= 500 
                        ? `${nuvvoPoints}/500 PTS` 
                        : 'LEVEL MAX'}
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-indigo-400 h-full rounded-full transition-all duration-300"
                    style={{ 
                      width: `${
                        nuvvoPoints <= 200 
                          ? Math.min(100, (nuvvoPoints / 200) * 100)
                          : nuvvoPoints <= 500
                            ? Math.min(100, ((nuvvoPoints - 200) / 300) * 100)
                            : 100
                      }%` 
                    }}
                  />
                </div>
                <p className="text-[9px] text-indigo-200 leading-snug">
                  ✨ Earn 1 Point for every ₹10 spent. Redeem points at checkout for direct reward cashback.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Claim Bonus / Daily Gift */}
          <div className="bg-slate-50 dark:bg-zinc-800/40 rounded-2xl p-3.5 border border-slate-100 dark:border-zinc-800 space-y-2.5">
            <div className="flex items-center gap-2 justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-orange-500" />
                <span className="text-[11px] font-extrabold text-zinc-800 dark:text-zinc-200">Daily Rewards Challenge</span>
              </div>
              <span className="text-[8px] font-mono font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">24h Cooldown</span>
            </div>

            <p className="text-[10.5px] text-zinc-550 dark:text-zinc-400 leading-relaxed">
              Open today's mystery gourmet bundle to claim up to <strong className="text-indigo-600 dark:text-indigo-400 font-extrabold font-mono">50 Nuvvo Points</strong> instantly!
            </p>

            {spinResultMsg && (
              <div className="bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400 text-[10px] p-2.5 rounded-xl font-bold border border-emerald-200/50 dark:border-emerald-500/20 flex items-center gap-1.5">
                <span>{spinResultMsg}</span>
              </div>
            )}

            <button
              onClick={handleClaimDailyReward}
              disabled={dailyClaimed || dailyClaimLoading}
              className={`w-full py-2.5 rounded-xl text-[11px] font-black transition-all flex items-center justify-center gap-2 border-none cursor-pointer ${
                dailyClaimed 
                  ? 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-650 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/15 active:scale-98'
              }`}
            >
              {dailyClaimLoading ? (
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 border-2 border-indigo-200 border-t-white rounded-full animate-spin" />
                  <span>Unboxing Gourmet Parcel...</span>
                </div>
              ) : dailyClaimed ? (
                '🎁 Reward Claimed Today'
              ) : (
                '🎁 Claim Instant Nuvvo Points'
              )}
            </button>
          </div>

          {/* Points Transaction Ledger */}
          <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-zinc-800/85">
            <div className="flex items-center gap-1">
              <History className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase font-black">Points Ledger</span>
            </div>
            
            <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-100 dark:divide-zinc-800/60 font-mono text-[9.5px]">
              {pointsHistory && pointsHistory.length > 0 ? (
                pointsHistory.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between py-1.5 first:pt-0">
                    <div className="space-y-0.5">
                      <span className="font-extrabold text-zinc-800 dark:text-zinc-200 block truncate max-w-40 md:max-w-xs">{tx.description}</span>
                      <span className="text-[8px] text-zinc-450 dark:text-zinc-500 block">{tx.date}</span>
                    </div>
                    <span className={`font-black ${
                      tx.type === 'redeem' 
                        ? 'text-orange-600 dark:text-orange-400' 
                        : 'text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {tx.type === 'redeem' ? '-' : '+'}{tx.amount}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-zinc-400 text-center py-3">No transactions found.</p>
              )}
            </div>
          </div>
        </div>

        {/* NUVVO WALLET SECTION */}
        <div id="nuvvo-wallet-section" className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-500" />
              <div className="leading-tight">
                <h4 className="text-xs font-black text-zinc-950 dark:text-zinc-50 uppercase tracking-widest">
                  Nuvvo Wallet
                </h4>
                <p className="text-[9px] text-[#555a64] font-semibold dark:text-zinc-400">Manage Store Credits</p>
              </div>
            </div>
            
            <span className="text-[9.5px] bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full font-black tracking-wide uppercase">
              Secure Store Credits
            </span>
          </div>

          {walletFlowStep === 'view' && (
            <div className="space-y-4">
              {/* Wallet Card */}
              <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white rounded-2xl p-4 shadow-md relative overflow-hidden">
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/5 rounded-full" />
                <div className="absolute right-4 top-4 opacity-10">
                  <Wallet className="w-16 h-16" />
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-[9px] text-emerald-100 font-mono tracking-widest uppercase block font-bold">Active Store Credits</span>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-3xl font-black font-mono tracking-tight text-white">₹{walletBalance}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setWalletRechargeAmt('100');
                        setWalletFlowStep('input');
                      }}
                      className="flex-1 py-1.5 bg-white/15 hover:bg-white/25 active:scale-95 transition text-[10px] font-extrabold rounded-xl text-white cursor-pointer border-none"
                    >
                      +₹100
                    </button>
                    <button
                      onClick={() => {
                        setWalletRechargeAmt('500');
                        setWalletFlowStep('input');
                      }}
                      className="flex-1 py-1.5 bg-white/15 hover:bg-white/25 active:scale-95 transition text-[10px] font-extrabold rounded-xl text-white cursor-pointer border-none"
                    >
                      +₹500
                    </button>
                    <button
                      onClick={() => {
                        setWalletRechargeAmt('1000');
                        setWalletFlowStep('input');
                      }}
                      className="flex-1 py-1.5 bg-white/15 hover:bg-white/25 active:scale-95 transition text-[10px] font-extrabold rounded-xl text-white cursor-pointer border-none"
                    >
                      +₹1000
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Trigger */}
              <button
                onClick={() => setWalletFlowStep('input')}
                className="w-full py-2.5 rounded-xl text-[11px] font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-650/15 active:scale-98 transition flex items-center justify-center gap-2 border-none cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Money to Wallet
              </button>

              {/* Wallet Ledger */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-zinc-800/85">
                <div className="flex items-center gap-1">
                  <History className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase font-black">Wallet Statements</span>
                </div>
                
                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-100 dark:divide-zinc-800/60 font-mono text-[9.5px]">
                  {walletHistory && walletHistory.length > 0 ? (
                    walletHistory.map((tx: any) => (
                      <div key={tx.id} className="flex items-center justify-between py-1.5 first:pt-0">
                        <div className="space-y-0.5">
                          <span className="font-extrabold text-zinc-800 dark:text-zinc-200 block truncate max-w-40 md:max-w-xs">{tx.description}</span>
                          <span className="text-[8px] text-zinc-450 dark:text-zinc-500 block">{tx.date}</span>
                        </div>
                        <span className="font-black text-emerald-600 dark:text-emerald-400">
                          +₹{tx.amount}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-zinc-400 text-center py-3">No statements found.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {walletFlowStep === 'input' && (
            <form onSubmit={handleAddWalletMoney} className="space-y-3.5 text-xs animate-fadeIn">
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-zinc-800 dark:text-zinc-200 uppercase text-[9.5px] tracking-wider flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-500" /> Payment Simulation Setup
                </span>
                <button 
                  type="button" 
                  onClick={() => setWalletFlowStep('view')}
                  className="p-1 bg-slate-200 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-full transition cursor-pointer"
                >
                  <X className="w-3 h-3 text-zinc-500" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Recharge Amount (₹)</label>
                  <input
                    type="number"
                    min="1"
                    max="20000"
                    required
                    value={walletRechargeAmt}
                    onChange={(e) => setWalletRechargeAmt(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 p-2.5 rounded-lg border font-black font-mono text-sm"
                    placeholder="Enter amount (e.g. 500)"
                  />
                  <div className="flex gap-1.5 mt-2">
                    {['200', '500', '1000', '2000'].map((quickAmt) => (
                      <button
                        key={quickAmt}
                        type="button"
                        onClick={() => setWalletRechargeAmt(quickAmt)}
                        className={`px-3 py-1 rounded-lg font-bold font-mono text-[10px] border transition ${
                          walletRechargeAmt === quickAmt
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-800 dark:text-emerald-400'
                            : 'bg-slate-50 border-slate-200 text-zinc-600 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400 hover:bg-slate-100'
                        }`}
                      >
                        ₹{quickAmt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Select Payment Channel (Mock)</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'UPI', label: 'UPI / NetBanking', desc: 'Secure Instant' },
                      { id: 'Card', label: 'Saved Visa Card', desc: 'Ending in 4821' },
                      { id: 'RuPay', label: 'RuPay Debit Card', desc: 'Zero Merchant Charge' },
                      { id: 'NetBanking', label: 'HDFC NetBanking', desc: 'Bank Secure Redirect' }
                    ].map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setWalletPaymentMethod(method.id)}
                        className={`p-2.5 text-left rounded-xl border transition flex flex-col justify-between ${
                          walletPaymentMethod === method.id
                            ? 'bg-emerald-50/50 border-emerald-400 dark:bg-emerald-950/10 dark:border-emerald-800 text-zinc-800 dark:text-zinc-150'
                            : 'bg-slate-50 border-slate-200 dark:bg-zinc-800/30 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-slate-100/50'
                        }`}
                      >
                        <span className="font-extrabold text-[10px]">{method.label}</span>
                        <span className="text-[8.5px] text-zinc-450 mt-0.5">{method.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setWalletFlowStep('view')}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-650 dark:text-zinc-300 font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-xs transition cursor-pointer"
                >
                  Proceed to Pay ₹{walletRechargeAmt || '0'}
                </button>
              </div>
            </form>
          )}

          {walletFlowStep === 'processing' && (
            <div className="py-6 text-center space-y-4">
              <div className="relative w-12 h-12 mx-auto">
                <div className="absolute inset-0 border-4 border-emerald-100 rounded-full dark:border-emerald-950/20" />
                <div className="absolute inset-0 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              </div>
              <div className="space-y-1">
                <h5 className="font-black text-zinc-850 dark:text-zinc-150 text-xs uppercase tracking-wider">Securing Connection...</h5>
                <p className="text-[10px] text-zinc-500 font-mono italic max-w-[240px] mx-auto animate-pulse">
                  {walletProcessLog}
                </p>
              </div>
            </div>
          )}

          {walletFlowStep === 'success' && (
            <div className="py-4 text-center space-y-4 animate-fadeIn">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto text-2xl shadow-sm">
                <CheckCircle className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h5 className="font-black text-emerald-600 dark:text-emerald-400 text-sm uppercase tracking-wide">Transaction Approved</h5>
                <p className="text-[10.5px] text-zinc-600 dark:text-zinc-300 leading-relaxed font-bold px-2">
                  {walletSuccessMessage}
                </p>
                <div className="pt-2">
                  <div className="inline-block bg-slate-50 dark:bg-zinc-800 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800 text-left font-mono text-[9px] text-zinc-500">
                    <span className="block">📜 TX REF: NUV-RECH-{Date.now().toString().slice(-6)}</span>
                    <span className="block">💵 NEW BALANCE: ₹{walletBalance}</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setWalletFlowStep('view')}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] rounded-xl transition cursor-pointer"
              >
                Back to Wallet
              </button>
            </div>
          )}
        </div>

        {/* REFER A FRIEND & STORE CREDITS MODULE */}
        <div id="refer-a-friend-module" className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-orange-500 animate-bounce" />
              <div className="leading-tight">
                <h4 className="text-xs font-black text-zinc-950 dark:text-zinc-50 uppercase tracking-widest">
                  Refer & Earn
                </h4>
                <p className="text-[9px] text-[#555a64] font-semibold dark:text-zinc-400">Gourmet Rewards Program</p>
              </div>
            </div>
            
            <span className="text-[9.5px] bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full font-black tracking-wide uppercase">
              ₹150 Per Referral
            </span>
          </div>

          {/* Credits wallet view */}
          <div className="bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-2xl p-4 shadow-sm relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-white/10 rounded-full" />
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[9px] text-orange-100 font-mono tracking-widest uppercase block font-bold">Referral Wallet Balance</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-black font-mono tracking-tight text-white">₹{referralCredits}</span>
                  <span className="text-[9px] text-orange-100 font-extrabold uppercase">Store Credits</span>
                </div>
              </div>

              {referralCredits > 0 && (
                <button
                  onClick={handleConvertCredits}
                  disabled={isConvertingCredits}
                  className="px-2.5 py-1.5 bg-white text-orange-600 hover:bg-orange-50 transition text-[9px] font-black rounded-xl shadow-xs cursor-pointer flex items-center gap-1 border-none"
                >
                  {isConvertingCredits ? (
                    <span className="w-2.5 h-2.5 border-2 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
                  ) : (
                    <RefreshCw className="w-3 h-3" />
                  )}
                  <span>Convert to Points</span>
                </button>
              )}
            </div>
            <p className="text-[8.5px] text-orange-100 mt-2 leading-snug">
              ✨ Store credits can be converted directly into Nuvvo Points (1 Credit = 1 Point) to unlock immediate order checkout discounts!
            </p>
          </div>

          {/* User's Referral Code Section */}
          <div className="space-y-2">
            <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-mono tracking-wider uppercase font-black block">Your Unique Invite Code</span>
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-zinc-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800">
              <span className="font-mono text-xs font-black tracking-wider text-zinc-800 dark:text-zinc-150 flex-grow px-1">
                {referralCode}
              </span>
              
              <div className="relative flex items-center gap-1.5">
                <button
                  onClick={handleCopyReferralCode}
                  className="p-1.5 bg-white dark:bg-zinc-850 hover:bg-slate-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-lg border cursor-pointer transition relative group"
                  title="Copy Invite Code"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>

                <a
                  href={`https://api.whatsapp.com/send?text=Hey! Join me on Nuvvo, the premier food delivery app! Use my referral code *${referralCode}* to get ₹100 instantly on sign-up! Download now.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg cursor-pointer transition flex items-center justify-center"
                  title="Share on WhatsApp"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </a>

                <AnimatePresence>
                  {copied && (
                    <motion.span
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: -25, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="absolute right-0 bg-zinc-900 text-white text-[9px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap shadow-md z-20"
                    >
                      Copied!
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Form to Apply Friend's Code */}
          <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/60 space-y-2">
            <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-mono tracking-wider uppercase font-black block">Have a Referral Code?</span>
            
            {appliedReferralCode ? (
              <div className="bg-slate-50 dark:bg-zinc-800/30 p-2.5 rounded-xl border border-slate-150 dark:border-zinc-800/80 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[10px] text-zinc-650 dark:text-zinc-350 font-bold">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>Applied: <code className="font-black text-zinc-800 dark:text-zinc-200">{appliedReferralCode}</code></span>
                </div>
                <span className="text-[8px] bg-emerald-100 text-emerald-600 font-black px-2 py-0.5 rounded-full uppercase">Redeemed</span>
              </div>
            ) : (
              <form onSubmit={handleApplyReferralCode} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter friend's code (e.g. NUVVO-...)"
                  value={inputReferralCode}
                  onChange={e => setInputReferralCode(e.target.value)}
                  className="bg-slate-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-800/80 flex-grow font-mono font-bold placeholder-zinc-450 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 transition text-xs font-black rounded-xl cursor-pointer border-none"
                >
                  Apply
                </button>
              </form>
            )}

            {referralMessage && (
              <div className={`text-[10px] p-2.5 rounded-xl font-bold border ${
                referralMsgType === 'success'
                  ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-500/20'
                  : 'bg-rose-50 text-rose-800 dark:bg-rose-950/20 dark:text-rose-400 border-rose-200/50 dark:border-rose-500/20'
              }`}>
                {referralMessage}
              </div>
            )}
          </div>

          {/* Referred Friends Tracker list */}
          <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase font-black">Referred Friends</span>
              </div>
              
              <button
                onClick={handleSimulateFriendSignUp}
                disabled={isSimulatingFriend}
                className="text-[9px] text-orange-500 font-black hover:underline cursor-pointer flex items-center gap-1 bg-transparent border-none"
              >
                {isSimulatingFriend ? (
                  <span className="w-2.5 h-2.5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>⚡ Simulate Friend Sign-Up</span>
                )}
              </button>
            </div>

            <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-100 dark:divide-zinc-800/60 font-mono text-[9.5px]">
              {referredFriendsList && referredFriendsList.length > 0 ? (
                referredFriendsList.map((friend) => (
                  <div key={friend.id} className="flex items-center justify-between py-1.5 first:pt-0">
                    <div className="space-y-0.5">
                      <span className="font-extrabold text-zinc-800 dark:text-zinc-200 block truncate max-w-[150px]">{friend.name}</span>
                      <span className="text-[8px] text-zinc-400 dark:text-zinc-500 block">Joined {friend.date}</span>
                    </div>
                    <div className="text-right space-y-0.5 flex flex-col items-end">
                      <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md ${
                        friend.status === 'Completed Order'
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                          : 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400'
                      }`}>
                        {friend.status}
                      </span>
                      <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 block">+₹{friend.reward}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-zinc-400 text-center py-3">No referred friends yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* APP APPEARANCE & ACCENT THEMES QUICK SETTINGS */}
        <div id="quick-app-theme-settings" className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <Settings className={`w-5 h-5 ${currentTheme.textClass}`} />
              <div className="leading-tight">
                <h4 className="text-xs font-black text-zinc-950 dark:text-zinc-50 uppercase tracking-widest">
                  App Theme Settings
                </h4>
                <p className="text-[9px] text-[#555a64] font-semibold dark:text-zinc-400">Custom Accent & Style Toggles</p>
              </div>
            </div>
            
            <span className={`text-[9.5px] font-black uppercase px-2.5 py-1 rounded-full ${currentTheme.lightBgClass} ${currentTheme.textClass} tracking-wide`}>
              {currentTheme.name}
            </span>
          </div>

          {/* Quick Accent Color Picker option */}
          <div className="space-y-2">
            <label className="block text-[10px] uppercase font-black text-zinc-400 tracking-wider">
              Change App Accent Color Theme
            </label>
            <p className="text-[9.5px] text-zinc-400 dark:text-zinc-500 leading-relaxed mb-3">
              Personalize the interface beyond signature orange. Choose a new core shade to refresh your dashboard, carts, and buttons.
            </p>
            
            {/* Swatch circle row */}
            <div className="flex flex-wrap items-center gap-3 py-1">
              {[
                { id: 'classic-orange', colorClass: 'bg-orange-500', label: 'Orange' },
                { id: 'forest-emerald', colorClass: 'bg-emerald-600', label: 'Emerald' },
                { id: 'ocean-blue', colorClass: 'bg-sky-500', label: 'Sky' },
                { id: 'crimson-spice', colorClass: 'bg-red-600', label: 'Crimson' },
                { id: 'royal-velvet', colorClass: 'bg-purple-600', label: 'Royal' },
                { id: 'midnight-noir', colorClass: 'bg-zinc-900 dark:bg-zinc-100', label: 'Noir' },
                { id: 'cyber-neon', colorClass: 'bg-violet-600', label: 'Neon' },
                { id: 'bubblegum-pop', colorClass: 'bg-fuchsia-500', label: 'Pop' },
              ].map((swatch) => {
                const isSelected = currentTheme.id === swatch.id;
                return (
                  <button
                    key={swatch.id}
                    type="button"
                    onClick={() => {
                      setThemeId(swatch.id);
                      setSelectedPreviewThemeId(swatch.id);
                    }}
                    className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 active:scale-90 cursor-pointer ${swatch.colorClass} ${
                      isSelected 
                        ? 'ring-4 ring-offset-2 ring-zinc-400 dark:ring-offset-zinc-900 scale-110 shadow-md' 
                        : 'opacity-70 hover:opacity-100 hover:scale-105'
                    }`}
                    title={swatch.label}
                  >
                    {isSelected && (
                      <Check className="w-4.5 h-4.5 text-white stroke-[3.5] drop-shadow-sm" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dark Mode Toggle inside settings option */}
          <div className="pt-3 border-t border-slate-100 dark:border-zinc-800/60 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-extrabold text-zinc-800 dark:text-zinc-200 block uppercase tracking-wide">
                Dark Mode Palette
              </span>
              <span className="text-[9.5px] text-zinc-400 dark:text-zinc-550 leading-snug block">
                Toggle between bright crisp modes and dark night views.
              </span>
            </div>
            
            <button
              type="button"
              onClick={toggleDarkMode}
              className={`p-1 rounded-full transition-colors duration-200 cursor-pointer ${
                darkMode ? 'text-orange-500' : 'text-zinc-400'
              }`}
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? (
                <ToggleRight className="w-9 h-9 stroke-[1.5]" />
              ) : (
                <ToggleLeft className="w-9 h-9 stroke-[1.5]" />
              )}
            </button>
          </div>

          {/* Quick link button to advanced designer customizer */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                document.getElementById('app-theme-customizer')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`w-full py-2 bg-slate-50 dark:bg-zinc-850 hover:bg-slate-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 border border-slate-100 dark:border-zinc-800 cursor-pointer`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
              <span>Explore 20 Curated Designer Themes</span>
            </button>
          </div>
        </div>

        {/* BEAUTIFUL TOP 20 APP THEMES SELECTOR */}
        <div id="app-theme-customizer" className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className={`w-4.5 h-4.5 ${currentTheme.textClass}`} />
              <h4 className="text-xs font-black text-zinc-950 dark:text-zinc-50 uppercase tracking-wider">
                Aura & Theme Customizer
              </h4>
            </div>
            <span className={`text-[9px] font-black uppercase px-2.5 py-0.75 rounded-full ${currentTheme.lightBgClass} ${currentTheme.textClass} tracking-wider shadow-2xs`}>
              Active: {currentTheme.name}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left side: Grid of themes */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-3.5">
              <p className="text-[10px] text-zinc-500 dark:text-zinc-450 leading-relaxed">
                Select from our <span className="font-extrabold text-zinc-700 dark:text-zinc-300">20 curated designer themes</span>. Tap on any theme card to load its primary solid palettes, brand accents and live visual rendering in the smartphone mock on the right before applying.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1.5">
                {themesList.map((theme) => {
                  const isSelectedForPreview = selectedPreviewThemeId === theme.id;
                  const isCurrentlyApplied = currentTheme.id === theme.id;
                  return (
                    <button
                      key={theme.id}
                      onClick={() => setSelectedPreviewThemeId(theme.id)}
                      className={`group relative flex flex-col justify-between p-3.5 rounded-2xl border text-left cursor-pointer transition-all duration-300 ${
                        isSelectedForPreview 
                          ? `border-2 ${theme.borderClass} bg-slate-50/80 dark:bg-zinc-850/60 shadow-md scale-[1.01]` 
                          : 'border-slate-100 dark:border-zinc-800/80 hover:border-slate-350 dark:hover:border-zinc-700 hover:bg-slate-50/40 dark:hover:bg-zinc-850/10'
                      }`}
                    >
                      <div className="w-full space-y-3.5">
                        {/* Header: Name and Active Check */}
                        <div className="flex items-center justify-between gap-1.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${theme.bgGradient} shrink-0`} />
                            <span className="text-[11px] font-extrabold text-zinc-900 dark:text-zinc-100 truncate tracking-tight">
                              {theme.name}
                            </span>
                          </div>
                          {isSelectedForPreview ? (
                            <div className={`p-0.5 rounded-full ${theme.bgClass} text-white`}>
                              <Check className="w-2.5 h-2.5 stroke-[3.5]" />
                            </div>
                          ) : isCurrentlyApplied ? (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" title="Currently Active" />
                          ) : (
                            <div className="w-3.5 h-3.5 rounded-full border border-slate-200 dark:border-zinc-850 shrink-0" />
                          )}
                        </div>

                        {/* Description */}
                        <p className="text-[9px] text-zinc-450 dark:text-zinc-500 leading-normal line-clamp-2 h-7.5">
                          {theme.description}
                        </p>

                        {/* Rich Visual Palette Swatch Block */}
                        <div className="bg-slate-100/45 dark:bg-zinc-950/45 rounded-xl p-2.5 flex items-center justify-between border border-slate-100/60 dark:border-zinc-900/40 gap-2">
                          {/* Color dots */}
                          <div className="flex items-center gap-1 shrink-0">
                            <div 
                              className={`w-3.5 h-3.5 rounded-full ${theme.bgClass} shadow-xs`} 
                              title="Solid Accent"
                            />
                            <div 
                              className={`w-3.5 h-3.5 rounded-full border border-slate-200 dark:border-zinc-800 ${theme.lightBgClass}`} 
                              title="Light Backdrop"
                            />
                            <div 
                              className={`w-3.5 h-3.5 rounded-full bg-gradient-to-br ${theme.bgGradient}`} 
                              title="Linear Gradient"
                            />
                          </div>

                          {/* Micro components mock */}
                          <div className="flex items-center gap-1 shrink-0 scale-95 origin-right">
                            <span className={`text-[7px] font-black uppercase tracking-wider px-1 py-0.5 rounded-md ${theme.lightBgClass} ${theme.textClass}`}>
                              TAG
                            </span>
                            <div className={`h-2 w-5 rounded-md ${theme.bgClass}`} />
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right side: Sticky Live Preview frame */}
            <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-4 bg-slate-50/60 dark:bg-zinc-950/40 p-4.5 rounded-2xl border border-slate-150 dark:border-zinc-850 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  Live Preview Overlay
                </span>
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                </div>
              </div>

              {/* Simulated Mobile Interface Frame */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-150 dark:border-zinc-800 shadow-md overflow-hidden relative">
                {/* Simulated Notch / Topbar */}
                <div className="bg-slate-50 dark:bg-zinc-850 border-b border-slate-100 dark:border-zinc-800/60 px-3.5 py-1.5 flex justify-between text-[8px] text-zinc-400 font-bold font-mono">
                  <span>9:41 AM</span>
                  <div className="flex gap-1 items-center">
                    <span>5G</span>
                    <div className="w-3.5 h-1.75 border border-zinc-400 rounded-xs flex items-center p-0.25">
                      <div className="bg-zinc-400 h-full w-2" />
                    </div>
                  </div>
                </div>

                {/* Simulated App Header */}
                <div className="px-3 py-2.5 border-b border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[12px] font-black tracking-tight ${selectedPreviewTheme.textClass}`}>
                      nuvvo
                    </span>
                    <span className="w-1 h-1 rounded-full bg-red-500" />
                  </div>
                  <div className="flex items-center gap-2.5 text-zinc-400 dark:text-zinc-500">
                    <Search className="w-3.5 h-3.5 cursor-pointer" />
                    <div className="relative cursor-pointer">
                      <ShoppingBag className={`w-3.5 h-3.5 ${selectedPreviewTheme.textClass}`} />
                      <span className={`absolute -top-1 -right-1.5 text-[6.5px] font-bold text-white w-3 h-3 rounded-full flex items-center justify-center ${selectedPreviewTheme.bgClass} shadow-xs`}>
                        3
                      </span>
                    </div>
                  </div>
                </div>

                {/* Simulated Product Card Block */}
                <div className="p-3 space-y-3">
                  <div className="relative rounded-xl overflow-hidden h-28 bg-slate-50 dark:bg-zinc-850 flex items-center justify-center border border-slate-100 dark:border-zinc-800/60">
                    {/* Glowing Accent Gradient Background overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-tr ${selectedPreviewTheme.bgGradient} opacity-[0.08]`} />
                    <span className="text-4xl select-none drop-shadow-md">🍔</span>
                    
                    {/* Mini Badge overlay */}
                    <span className={`absolute top-2.5 right-2.5 text-[7px] font-black px-2 py-0.5 rounded-full text-white tracking-wider shadow-xs ${selectedPreviewTheme.bgClass}`}>
                      FREE DEL
                    </span>
                  </div>

                  {/* Rating, Title, Description */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <h5 className="text-[11px] font-black text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight">
                        Signature Spicy Tiffin
                      </h5>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                        <span className="text-[8px] font-black text-zinc-600 dark:text-zinc-400">4.8</span>
                      </div>
                    </div>
                    <p className="text-[8.5px] text-zinc-400 dark:text-zinc-500 leading-normal line-clamp-1">
                      Steaming hot homecooked multi-grain organic curry recipe.
                    </p>
                  </div>

                  {/* Simulated Core Application Button */}
                  <button className={`w-full py-2 rounded-xl text-[9px] font-black uppercase tracking-wider text-white text-center shadow-sm select-none transition-all duration-300 ${selectedPreviewTheme.bgClass} ${selectedPreviewTheme.hoverBgClass}`}>
                    Add to Basket • $12.50
                  </button>
                </div>
              </div>

              {/* Persistent Apply Choice Panel */}
              <div className="pt-3 border-t border-slate-150 dark:border-zinc-800">
                <button
                  onClick={() => {
                    setThemeId(selectedPreviewThemeId);
                    setShowThemeAppliedMessage(true);
                    setTimeout(() => {
                      setShowThemeAppliedMessage(false);
                    }, 3000);
                  }}
                  className={`w-full py-2.5 rounded-xl text-[10px] font-black tracking-wider uppercase text-white shadow-md transition-all duration-300 transform active:scale-95 cursor-pointer text-center flex items-center justify-center gap-1.5 ${
                    selectedPreviewTheme.bgClass
                  } ${selectedPreviewTheme.hoverBgClass}`}
                >
                  {currentTheme.id === selectedPreviewThemeId ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      Theme Active & Persisted
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                      Apply Theme: {selectedPreviewTheme.name}
                    </>
                  )}
                </button>

                <AnimatePresence>
                  {showThemeAppliedMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-2.5 text-center"
                    >
                      <p className={`text-[9.5px] font-black uppercase tracking-wider ${selectedPreviewTheme.textClass} flex items-center justify-center gap-1`}>
                        <CheckCircle className="w-3.5 h-3.5" /> Applied and Persisted Globally!
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* PUSH NOTIFICATIONS & ALERTS TOGGLES CARD */}
        <div id="push-notification-settings" className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-2.5">
            <Settings className="w-4.5 h-4.5 text-orange-500" />
            <h4 className="text-xs font-black text-zinc-950 dark:text-zinc-50 uppercase tracking-wider">
              Alert Preferences
            </h4>
          </div>

          <div className="space-y-4">
            {/* Permission status warning/info */}
            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2.5">
              <div className="space-y-0.5">
                <span className="text-[11px] font-extrabold text-zinc-900 dark:text-zinc-100 block uppercase tracking-wide">
                  Browser Push Permissions
                </span>
                <span className="text-[9.5px] text-zinc-400 dark:text-zinc-550 leading-snug block">
                  Enables background alerts when your app is minimized.
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {notificationPermission === 'granted' ? (
                  <span className="text-[9.5px] bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 font-mono font-black px-2.5 py-1 rounded-full border border-emerald-100/30">
                    🟢 ACTIVE
                  </span>
                ) : notificationPermission === 'denied' ? (
                  <button
                    type="button"
                    onClick={() => {
                      alert("Push Notifications are blocked in your browser. Please click the padlock icon in your URL address bar to enable notifications for this page.");
                    }}
                    className="text-[9.5px] bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 font-mono font-black px-2.5 py-1 rounded-full border border-red-100/30 hover:bg-red-100 cursor-pointer transition-colors"
                  >
                    🚫 BLOCKED ℹ️
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={async () => {
                      await requestNotificationPermission();
                    }}
                    className="text-[9.5px] bg-orange-100 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 font-mono font-black px-3 py-1 rounded-full border border-orange-200 hover:bg-orange-200 cursor-pointer transition-all active:scale-95 animate-pulse"
                  >
                    ⚡ REQUEST
                  </button>
                )}
              </div>
            </div>

            {/* Toggle 1: Order Updates */}
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">
                  Order Status Updates
                </span>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-snug block">
                  Receive instant push chime notifications for accepted, preparing, dispatcher picked up, and delivered states.
                </span>
              </div>
              <button
                type="button"
                id="toggle-order-updates-btn"
                onClick={async () => {
                  const nextVal = !orderUpdatesEnabled;
                  setOrderUpdatesEnabled(nextVal);
                  if (nextVal && notificationPermission !== 'granted') {
                    await requestNotificationPermission();
                  }
                }}
                className="focus:outline-none shrink-0 cursor-pointer pt-0.5 transition-transform active:scale-95"
              >
                {orderUpdatesEnabled ? (
                  <ToggleRight id="toggle-order-updates-on" className="w-11 h-7 text-orange-500" />
                ) : (
                  <ToggleLeft id="toggle-order-updates-off" className="w-11 h-7 text-zinc-300 dark:text-zinc-700" />
                )}
              </button>
            </div>

            {/* Toggle 2: Promotional Alerts */}
            <div className="flex items-start justify-between gap-3 pt-1 border-t border-slate-100/50 dark:border-zinc-800/40">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block mt-2">
                  Promotional Alerts
                </span>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-snug block">
                  Get real-time notification alerts regarding Chirala beach resort flash deals, active coupon codes, and meal combo offers.
                </span>
              </div>
              <button
                type="button"
                id="toggle-promo-alerts-btn"
                onClick={async () => {
                  const nextVal = !promotionalAlertsEnabled;
                  setPromotionalAlertsEnabled(nextVal);
                  if (nextVal && notificationPermission !== 'granted') {
                    await requestNotificationPermission();
                  }
                }}
                className="focus:outline-none shrink-0 cursor-pointer pt-2.5 transition-transform active:scale-95"
              >
                {promotionalAlertsEnabled ? (
                  <ToggleRight id="toggle-promo-alerts-on" className="w-11 h-7 text-orange-500" />
                ) : (
                  <ToggleLeft id="toggle-promo-alerts-off" className="w-11 h-7 text-zinc-300 dark:text-zinc-700" />
                )}
              </button>
            </div>

            {/* Toggle 3: Delivery Updates */}
            <div className="flex items-start justify-between gap-3 pt-1 border-t border-slate-100/50 dark:border-zinc-800/40">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block mt-2">
                  Delivery Updates
                </span>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-snug block">
                  Receive real-time push notes of rider assignment details, order picked up, and proximity alerts when approaching.
                </span>
              </div>
              <button
                type="button"
                id="toggle-delivery-updates-btn"
                onClick={async () => {
                  const nextVal = !deliveryUpdatesEnabled;
                  setDeliveryUpdatesEnabled(nextVal);
                  if (nextVal && notificationPermission !== 'granted') {
                    await requestNotificationPermission();
                  }
                }}
                className="focus:outline-none shrink-0 cursor-pointer pt-2.5 transition-transform active:scale-95"
              >
                {deliveryUpdatesEnabled ? (
                  <ToggleRight id="toggle-delivery-updates-on" className="w-11 h-7 text-orange-500" />
                ) : (
                  <ToggleLeft id="toggle-delivery-updates-off" className="w-11 h-7 text-zinc-300 dark:text-zinc-700" />
                )}
              </button>
            </div>
          </div>

          {/* SIMULATION WORKSPACE FOR REAL-TIME TESTING */}
          <div className="bg-slate-50 dark:bg-zinc-950/40 p-3.5 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 space-y-2.5">
            <div className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              <span className="text-[9.5px] font-black text-zinc-900 dark:text-zinc-350 uppercase tracking-wider font-mono">
                Sandbox Alert Broadcaster
              </span>
            </div>
            <p className="text-[9.5px] text-zinc-500 dark:text-zinc-400 leading-snug">
              Manually trigger test broadcasts below to verify your device filter suppression:
            </p>
            <div className="grid grid-cols-3 gap-2 pt-0.5">
              <button
                type="button"
                onClick={() => {
                  triggerOrderUpdateAlert(
                    "🍛 Kitchen Cooking Slip",
                    `Order #${Math.floor(100000 + Math.random() * 900000)} has entered 'Kitchen Preparing' pipeline!`
                  );
                }}
                className="bg-white dark:bg-zinc-850 hover:bg-slate-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-slate-100 dark:border-zinc-800 font-extrabold uppercase text-[8px] py-2 rounded-xl cursor-pointer active:scale-[0.98] transition-all"
              >
                📡 Test Order Status
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerDeliveryUpdateAlert(
                    "🏍️ Rider Heading Out",
                    "A delivery executive is assigned and traveling post-haste to deliver your hot meal container!"
                  );
                }}
                className="bg-white dark:bg-zinc-850 hover:bg-slate-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-slate-100 dark:border-zinc-800 font-extrabold uppercase text-[8px] py-1.5 rounded-xl cursor-pointer active:scale-[0.98] transition-all"
              >
                🚲 Test Delivery
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerPromoAlert(
                    "🔥 Chirala Sea Flash Deal",
                    "Claim 40% OFF or Free Seafood Tiffins! Code: SEAFEST40. Valid today."
                  );
                }}
                className="bg-white dark:bg-zinc-850 hover:bg-slate-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-slate-100 dark:border-zinc-800 font-extrabold uppercase text-[8px] py-1.5 rounded-xl cursor-pointer active:scale-[0.98] transition-all"
              >
                🎁 Test Promo Deal
              </button>
            </div>
          </div>
        </div>

        {/* COMPONENTIZED DYNAMIC ORDER HISTORY TRACKER */}
        <OrderHistory />

        {/* CUSTOMER PAYMENT INVOICES SECTION */}
        <div id="customer-payment-invoices-workspace" className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-orange-500" />
              <div>
                <h4 className="text-xs font-black text-zinc-950 dark:text-zinc-50 tracking-tight uppercase">
                  Payment Invoices Hub
                </h4>
                <p className="text-[9.5px] text-zinc-400 font-semibold dark:text-zinc-400">Verify GST, itemized billing, and download official receipts</p>
              </div>
            </div>
            <span className="text-[8.5px] font-mono bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 border border-orange-100/50 px-2 py-0.5 rounded font-black tracking-wider uppercase">
              Tax Compliant
            </span>
          </div>

          {/* Invoice search */}
          {orders.length > 0 && (
            <div className="relative">
              <input
                type="text"
                placeholder="Search by Order ID or restaurant..."
                value={invoiceSearchQuery}
                onChange={(e) => setInvoiceSearchQuery(e.target.value)}
                className="w-full text-[10.5px] pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-orange-500 transition-all font-medium placeholder-zinc-400"
              />
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              {invoiceSearchQuery && (
                <button
                  onClick={() => setInvoiceSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-650 text-[10px] font-bold"
                >
                  Clear
                </button>
              )}
            </div>
          )}

          {/* Invoices list */}
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {orders.length === 0 ? (
              <div className="py-6 text-center text-zinc-400">
                <Receipt className="w-8 h-8 text-zinc-300 mx-auto mb-1.5" />
                <p className="text-[10.5px] font-medium">No orders found to generate tax invoices.</p>
              </div>
            ) : (() => {
              const filteredOrders = orders.filter(o => {
                const search = invoiceSearchQuery.toLowerCase();
                const oId = o.id.toLowerCase();
                const firstItem = o.items?.[0]?.foodItem?.name?.toLowerCase() || '';
                return oId.includes(search) || firstItem.includes(search);
              });

              if (filteredOrders.length === 0) {
                return (
                  <p className="text-zinc-400 text-center py-4 text-[10px]">No matching order invoices found.</p>
                );
              }

              return filteredOrders.map((order) => {
                const itemNames = order.items.map(i => `${i.foodItem.name} x${i.quantity}`).join(', ');
                const formattedDate = new Date(order.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
                const isPaid = order.status !== 'cancelled';
                
                return (
                  <div 
                    key={order.id} 
                    className="p-3 bg-slate-50/60 dark:bg-zinc-900/60 border border-slate-100 dark:border-zinc-800/80 rounded-2xl flex items-center justify-between gap-3 hover:border-orange-500/30 transition-all"
                  >
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-[10.5px] text-zinc-850 dark:text-zinc-150 font-mono">
                          #INV-{order.id.slice(-6).toUpperCase()}
                        </span>
                        <span className={`text-[8px] font-extrabold px-1.5 py-0.2 rounded uppercase font-mono tracking-wider ${
                          isPaid 
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100/40' 
                            : 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-100/40'
                        }`}>
                          {isPaid ? 'PAID' : 'CANCELLED'}
                        </span>
                      </div>
                      <p className="text-[9.5px] text-zinc-450 dark:text-zinc-400 truncate font-semibold">
                        {itemNames}
                      </p>
                      <span className="text-[8.5px] text-zinc-400 font-medium block">
                        Placed on {formattedDate} • via {order.paymentMethod}
                      </span>
                    </div>

                    <div className="text-right shrink-0 space-y-1.5">
                      <span className="font-black text-[11.5px] text-zinc-900 dark:text-zinc-50 font-mono block">
                        ₹{order.totalAmount}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedInvoiceOrder(order)}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-black text-[9.5px] px-2.5 py-1 rounded-lg uppercase tracking-wider transition-all cursor-pointer shadow-xs"
                      >
                        Receipt 🧾
                      </button>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>

        {/* LOGISTICS BRIDGE HUB FOR MULTI-ROLE TESTING (AMAZING ADDITION!) */}
        <div className="bg-white dark:bg-zinc-900 border rounded-3xl p-5 shadow-sm space-y-3">
          <h4 className="text-xs font-black text-zinc-950 dark:text-zinc-50 tracking-tight uppercase flex items-center gap-1">
            <Settings className="w-4 h-4 text-orange-500" /> Multi-Role Portal Bridges
          </h4>
          <p className="text-[10px] text-zinc-400 leading-snug">Instantly transition your UI view into different sections of the Nuvvo Ecosystem below:</p>
          
          <div className={`${user?.phone === '8328355812' ? 'grid-cols-3' : 'grid-cols-2'} grid gap-2 text-center text-xs`}>
            <button 
              onClick={() => setCurrentPage('partner')}
              className="p-3 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 text-indigo-600 rounded-2xl font-black uppercase tracking-wider text-[9px] cursor-pointer"
            >
              🏍️ Partner
            </button>
            
            <button 
              onClick={() => setCurrentPage('franchise')}
              className="p-3 bg-amber-50 hover:bg-amber-100 border border-amber-100 text-amber-600 rounded-2xl font-black uppercase tracking-wider text-[9px] cursor-pointer"
            >
              🌴 Franchise
            </button>

            <button 
              onClick={() => setCurrentPage('admin')}
              className="p-3 bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-600 rounded-2xl font-black uppercase tracking-wider text-[9px] cursor-pointer"
            >
              📊 Admin {user?.phone !== '8328355812' && ' (View)'}
            </button>
          </div>
        </div>

        {/* VENDOR SELF-REGISTRATION & PARTNER MANAGEMENT */}
        <div id="vendor-onboarding-hub" className="bg-white dark:bg-zinc-900 border rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <h4 className="text-xs font-black text-zinc-950 dark:text-zinc-50 tracking-tight uppercase flex items-center gap-1.5">
              🏪 Partner Vendor Hub
            </h4>
            <span className="text-[9px] bg-red-550/10 text-red-600 px-2 py-0.5 rounded font-black font-mono">CHIRALA REGION</span>
          </div>

          {myRestaurants.length > 0 && (
            <div className="space-y-2.5">
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Your Registered Businesses ({myRestaurants.length})</p>
              <div className="space-y-2">
                {myRestaurants.map(myRest => {
                  const isApproved = myRest.isApproved !== false;
                  const isActive = myRest.isActive !== false;
                  
                  return (
                    <div key={myRest.id} className="p-3 bg-slate-50 dark:bg-zinc-850 rounded-2xl border border-slate-100 dark:border-zinc-800 space-y-2 text-xs">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-extrabold text-zinc-90 w-max">{myRest.name}</h5>
                          <p className="text-[9.5px] text-zinc-400 mt-0.5">{myRest.businessType || 'Family'} • {myRest.cuisines.slice(0,2).join(', ')}</p>
                        </div>
                        <span className={`text-[8.5px] px-2 py-0.5 rounded font-extrabold uppercase ${
                          isApproved ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700 animate-pulse'
                        }`}>
                          {isApproved ? 'Approved' : 'Pending Rev'}
                        </span>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t text-[10px]">
                        <span className="text-zinc-450">
                          Active State: <strong className={isActive ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-400"}>{isActive ? 'LIVE IN CHIRALA' : 'SLEEPING / SWEEP'}</strong>
                        </span>
                        
                        {isApproved ? (
                          <button 
                            onClick={() => toggleRestaurantActiveStatus(myRest.id)}
                            className={`px-3 py-1 rounded-xl font-bold uppercase text-[9.5px] cursor-pointer transition ${
                              isActive 
                                ? 'bg-rose-550/10 text-rose-600 border border-rose-500/25 hover:bg-rose-500/20' 
                                : 'bg-emerald-600 text-white hover:bg-emerald-700'
                            }`}
                          >
                            {isActive ? 'Go Offline' : 'Go Live'}
                          </button>
                        ) : (
                          <span className="text-[9px] text-zinc-400 italic">Locked until auto-approved by Admin</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!showRegForm ? (
            <div className="space-y-2 text-center pb-1">
              <p className="text-[10px] text-zinc-400 leading-relaxed">Own a restaurant, meals venue, fast food stall, sweet shop or resort in Chirala? Submit an onboarding application in seconds!</p>
              <button 
                onClick={() => setShowRegForm(true)}
                className="w-full bg-orange-500 hover:bg-orange-650 text-white font-black py-2.5 rounded-xl uppercase text-[10.5px] tracking-wide hover:scale-[1.01] active:scale-[0.99] transition cursor-pointer"
              >
                Onboard Your Restaurant Partner
              </button>
            </div>
          ) : (
            <form onSubmit={handleSelfRegister} className="space-y-3 pt-1 border-t text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9.5px] font-bold text-zinc-400 mb-0.5">Business Name *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Chirala Biryani Club"
                    value={partnerName}
                    onChange={e => setPartnerName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 p-2 rounded-lg border font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[9.5px] font-bold text-zinc-400 mb-0.5">Primary Category *</label>
                  <select 
                    value={partnerType}
                    onChange={e => setPartnerType(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 p-2 rounded-lg border font-bold"
                  >
                    <option value="Family">Family Multi-Cuisine</option>
                    <option value="Biryani & Mandi">Biryani & Mandi</option>
                    <option value="Fast Food">Fast Food & Snacks</option>
                    <option value="Meals & Tiffins">Andhra Meals & Tiffins</option>
                    <option value="Desserts & Bakery">Desserts & Cakes</option>
                    <option value="Juices & Cafe">Juice & Coffee Shop</option>
                    <option value="Seafood">Seafood Junction</option>
                    <option value="Hotel & Resort">Hotels & Resorts</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9.5px] font-bold text-zinc-400 mb-0.5">Estimated Cost for Two (₹)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 250"
                    value={partnerCost}
                    onChange={e => setPartnerCost(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 p-2 rounded-lg border font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[9.5px] font-bold text-zinc-400 mb-0.5">Linked Mobile Phone</label>
                  <input 
                    type="text" 
                    disabled 
                    value={user?.phone || 'Guest Phone'}
                    className="w-full bg-slate-100 dark:bg-zinc-800 text-zinc-400 tracking-wide p-2 rounded-lg border font-mono font-bold cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 mb-0.5">Cuisines Offered (comma separated)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Biryani, Mandi, Chinese, South Indian"
                  value={partnerCuisines}
                  onChange={e => setPartnerCuisines(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 p-2 rounded-lg border font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 mb-1">Business Image (Upload Photo)</label>
                <div className="space-y-2">
                  {partnerImage ? (
                    <div className="relative w-full h-28 bg-slate-50 dark:bg-zinc-850 rounded-xl overflow-hidden border flex items-center justify-center">
                      <img 
                        src={partnerImage} 
                        alt="Venue Preview" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <button
                        type="button"
                        onClick={() => setPartnerImage('')}
                        className="absolute top-2 right-2 p-1 bg-rose-600 text-white rounded-full hover:bg-rose-700 transition shadow-md cursor-pointer"
                      >
                        <Trash className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition">
                      <div className="flex flex-col items-center justify-center text-center px-4">
                        <Upload className="w-5 h-5 text-orange-500 mb-1" />
                        <p className="text-[10px] font-extrabold text-zinc-700 dark:text-zinc-300 uppercase tracking-tight">Upload Hotel/Restaurant JPG/PNG</p>
                        <p className="text-[8.5px] text-zinc-400">Tap to browse files</p>
                      </div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              if (typeof reader.result === 'string') {
                                setPartnerImage(reader.result);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-1 font-sans">
                <button 
                  type="button" 
                  onClick={() => setShowRegForm(false)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 text-zinc-650 hover:bg-slate-200 rounded-lg font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-1.5 bg-orange-500 hover:bg-orange-650 text-white rounded-lg font-black uppercase cursor-pointer"
                >
                  Submit Request
                </button>
              </div>
            </form>
          )}
        </div>

        {/* SECURE SAVED PAYMENTS & WALLET WORKSPACE */}
        <div id="saved-payments-workspace" className="bg-white dark:bg-zinc-900 border rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <div>
              <h4 className="text-xs font-black text-zinc-950 dark:text-zinc-50 tracking-tight uppercase flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-orange-500" /> Saved Payments
              </h4>
              <p className="text-[9px] text-zinc-400 font-bold uppercase mt-0.5">Secure card & UPI vault</p>
            </div>

            <div className="flex gap-1.5">
              <button 
                onClick={() => setShowPayForm(showPayForm === 'card' ? null : 'card')}
                className="text-[9.5px] bg-slate-100 hover:bg-slate-200 dark:bg-zinc-850 dark:hover:bg-zinc-805 text-zinc-800 dark:text-zinc-150 font-black px-2.5 py-1 rounded-xl uppercase tracking-wider flex items-center gap-1 cursor-pointer transition"
              >
                <Plus className="w-2.5 h-2.5" /> Card
              </button>
              <button 
                onClick={() => setShowPayForm(showPayForm === 'upi' ? null : 'upi')}
                className="text-[9.5px] bg-slate-100 hover:bg-slate-200 dark:bg-zinc-850 dark:hover:bg-zinc-805 text-zinc-800 dark:text-zinc-150 font-black px-2.5 py-1 rounded-xl uppercase tracking-wider flex items-center gap-1 cursor-pointer transition"
              >
                <Plus className="w-2.5 h-2.5" /> UPI
              </button>
            </div>
          </div>

          {/* CARD FORM */}
          {showPayForm === 'card' && (
            <form onSubmit={handleSaveCard} className="p-3 bg-slate-50 dark:bg-zinc-850 rounded-2xl border border-slate-150/75 dark:border-zinc-805 space-y-3.5 text-xs animate-fadeIn">
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-zinc-800 dark:text-zinc-200 uppercase text-[9.5px] tracking-wider flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-500" /> Secure Card Tokenizer
                </span>
                <button 
                  type="button" 
                  onClick={() => setShowPayForm(null)}
                  className="p-1 bg-slate-200 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-full transition cursor-pointer"
                >
                  <X className="w-3 h-3 text-zinc-500" />
                </button>
              </div>

              <div className="space-y-2 text-left">
                <div>
                  <label className="block text-[8.5px] uppercase font-bold text-zinc-400 mb-1">Cardholder Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. AMIT KUMAR" 
                    value={cardHolder} 
                    onChange={e => setCardHolder(e.target.value.toUpperCase())} 
                    className="w-full bg-white dark:bg-zinc-900 border p-2 rounded-xl text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-[8.5px] uppercase font-bold text-zinc-400 mb-1">Card Number (16-Digit)</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="4111 2222 3333 4444" 
                      value={cardNumber} 
                      onChange={handleCardNumberChange} 
                      className="w-full bg-white dark:bg-zinc-900 border p-2 pr-12 rounded-xl font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-orange-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black px-1.5 py-0.5 rounded border uppercase bg-slate-50 dark:bg-zinc-800 border-zinc-200 text-zinc-700 dark:text-zinc-250">
                      {cardBrand}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[8.5px] uppercase font-bold text-zinc-400 mb-1">Expiry Date</label>
                    <input 
                      type="text" 
                      placeholder="MM/YY" 
                      value={cardExpiry} 
                      onChange={e => setCardExpiry(formatExpiry(e.target.value))} 
                      className="w-full bg-white dark:bg-zinc-900 border p-2 text-center rounded-xl font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[8.5px] uppercase font-bold text-zinc-400 mb-1">Security Code (CVV)</label>
                    <input 
                      type="password" 
                      maxLength={4}
                      placeholder="•••" 
                      value={cardCvv} 
                      onChange={e => setCardCvv(e.target.value.replace(/[^0-9]/g, ''))} 
                      className="w-full bg-white dark:bg-zinc-900 border p-2 text-center rounded-xl font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-650 text-white font-black py-2.5 rounded-xl uppercase tracking-wider text-[9.5px]"
              >
                🔒 Secure and Save Card
              </button>
            </form>
          )}

          {/* UPI FORM */}
          {showPayForm === 'upi' && (
            <form onSubmit={handleSaveUPI} className="p-3 bg-slate-50 dark:bg-zinc-850 rounded-2xl border border-slate-150/75 dark:border-zinc-805 space-y-3.5 text-xs animate-fadeIn">
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-zinc-800 dark:text-zinc-200 uppercase text-[9.5px] tracking-wider flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-500" /> Link UPI ID Account
                </span>
                <button 
                  type="button" 
                  onClick={() => setShowPayForm(null)}
                  className="p-1 bg-slate-200 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-full transition cursor-pointer"
                >
                  <X className="w-3 h-3 text-zinc-500" />
                </button>
              </div>

              <div className="space-y-2 text-left">
                <div>
                  <label className="block text-[8.5px] uppercase font-bold text-zinc-400 mb-1">Account Label</label>
                  <input 
                    type="text" 
                    placeholder="e.g. My GPay, Business UPI" 
                    value={upiLabel} 
                    onChange={e => setUpiLabel(e.target.value)} 
                    className="w-full bg-white dark:bg-zinc-900 border p-2 rounded-xl text-xs font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-[8.5px] uppercase font-bold text-zinc-400 mb-1">VPA / UPI ID Input</label>
                  <input 
                    type="text" 
                    placeholder="e.g. yourname@okhdfcbank" 
                    value={upiIdInput} 
                    onChange={e => setUpiIdInput(e.target.value)} 
                    className="w-full bg-white dark:bg-zinc-900 border p-2 rounded-xl font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-[8.5px] uppercase font-bold text-zinc-400 mb-1">Select UPI App Handle</label>
                  <div className="grid grid-cols-3 gap-1.5 text-[9px] font-black uppercase text-center">
                    {(['GPAY', 'PHONEPE', 'PAYTM', 'BHIM', 'OTHER'] as const).map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setUpiProvider(p)}
                        className={`py-1.5 border rounded-lg transition-all cursor-pointer ${
                          upiProvider === p 
                            ? 'bg-orange-500 text-white border-orange-500' 
                            : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-350 hover:bg-slate-50'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-650 text-white font-black py-2.5 rounded-xl uppercase tracking-wider text-[9.5px]"
              >
                ⚡ Securely Register UPI ID
              </button>
            </form>
          )}

          {/* LIST SAVED METHODS */}
          <div className="space-y-4">
            
            {/* Cards Block */}
            <div className="space-y-2">
              <span className="text-[8.5px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                💳 Saved Cards ({savedCards.length})
              </span>
              
              {savedCards.length === 0 ? (
                <div className="text-center p-3.5 border border-dashed rounded-2xl bg-slate-50/50 dark:bg-zinc-950/20 text-zinc-400 text-[10px]">
                  No cards saved in your secure wallet yet. Add card for lightning-fast premium checkout!
                </div>
              ) : (
                <div className="space-y-2.5">
                  {savedCards.map(card => {
                    // Pick credit card skin according to brand
                    let skin = 'bg-gradient-to-tr from-slate-900 to-slate-800 text-white';
                    if (card.cardBrand === 'Visa') skin = 'bg-gradient-to-br from-blue-900 via-blue-805 to-sky-905 text-white';
                    else if (card.cardBrand === 'Mastercard') skin = 'bg-gradient-to-br from-orange-600 via-yellow-600 to-red-650 text-white';
                    else if (card.cardBrand === 'RuPay') skin = 'bg-gradient-to-tr from-emerald-800 via-emerald-700 to-teal-850 text-white';
                    else if (card.cardBrand === 'Amex') skin = 'bg-gradient-to-br from-zinc-900 via-yellow-950/80 to-stone-900 border border-yellow-600/30 text-yellow-100';

                    return (
                      <div key={card.id} className={`p-4 rounded-2xl h-28 relative flex flex-col justify-between overflow-hidden shadow-sm transition hover:shadow-md ${skin}`}>
                        <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                        
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10.5px] font-black uppercase tracking-wider block opacity-90">{card.cardBrand}</span>
                            <span className="text-[7.5px] font-mono leading-none tracking-tight block uppercase opacity-60">AUTHORIZED DEBT</span>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => handleDeleteCard(card.id)}
                            className="p-1.5 bg-white/10 hover:bg-white/20 hover:text-red-300 rounded-full cursor-pointer transition"
                            title="Delete card"
                          >
                            <Trash className="w-3 h-3 text-white" />
                          </button>
                        </div>

                        <div>
                          <p className="font-mono text-xs font-bold tracking-widest">{card.cardNumber}</p>
                        </div>

                        <div className="flex justify-between items-end text-[8.5px]">
                          <div>
                            <span className="text-[6.5px] uppercase block opacity-60">Card Holder</span>
                            <span className="font-extrabold uppercase font-mono tracking-tight">{card.cardHolder}</span>
                          </div>
                          <div>
                            <span className="text-[6.5px] uppercase block opacity-60">Expires</span>
                            <span className="font-extrabold font-mono">{card.expiryDate}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* UPI Profiles Block */}
            <div className="space-y-2 pt-1 border-t border-dashed border-slate-100 dark:border-zinc-800">
              <span className="text-[8.5px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1 mt-1.5">
                ⚡ Saved UPI IDs ({savedUPIs.length})
              </span>

              {savedUPIs.length === 0 ? (
                <div className="text-center p-3.5 border border-dashed rounded-2xl bg-slate-50/50 dark:bg-zinc-950/20 text-zinc-400 text-[10px]">
                  No VPA/UPI Addresses stored. Add a UPI ID profile for faster digital checkout.
                </div>
              ) : (
                <div className="space-y-2">
                  {savedUPIs.map(upi => {
                    let badgeColor = 'bg-slate-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200';
                    if (upi.provider === 'GPAY') badgeColor = 'bg-blue-500/10 text-blue-600 border border-blue-500/20';
                    else if (upi.provider === 'PHONEPE') badgeColor = 'bg-violet-500/10 text-violet-600 border border-violet-500/20';
                    else if (upi.provider === 'PAYTM') badgeColor = 'bg-cyan-500/10 text-cyan-600 border border-cyan-500/20';
                    else if (upi.provider === 'BHIM') badgeColor = 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20';

                    return (
                      <div key={upi.id} className="p-3 rounded-2xl border bg-slate-50/40 dark:bg-zinc-850/20 flex items-center justify-between text-xs transition hover:bg-slate-105">
                        <div className="flex gap-2 items-center">
                          <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${badgeColor}`}>
                            {upi.provider}
                          </span>
                          <div className="text-left">
                            <h5 className="font-black text-zinc-800 dark:text-zinc-200">{upi.name}</h5>
                            <p className="font-mono text-[9px] text-zinc-400 font-extrabold mt-0.5">{upi.upiId}</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteUPI(upi.id)}
                          className="p-1 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-full transition cursor-pointer"
                          title="Delete UPI Profile"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* MANAGE ADDRESSES INTEGRATIVE WORKSPACE */}
        <div id="manage-addresses-workspace" className="bg-white dark:bg-zinc-900 border rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <h4 className="text-xs font-black text-zinc-950 dark:text-zinc-50 tracking-tight uppercase flex items-center gap-1.5">
              <Map className="w-4 h-4 text-orange-500" /> Manage Addresses
            </h4>
            {!showAddrForm && (
              <button 
                onClick={handleOpenAddForm}
                className="text-[10px] bg-orange-500 hover:bg-orange-655 text-white font-black px-2.5 py-1 rounded-xl uppercase tracking-wider flex items-center gap-1 cursor-pointer transition shadow-sm"
              >
                <Plus className="w-3 h-3" /> Add New
              </button>
            )}
          </div>

          {/* ACTIVE SUCCESS MESSAGE BANNER */}
          {addressSuccessMsg && (
            <motion.div 
              id="address-success-banner"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-[11px] rounded-2xl flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{addressSuccessMsg}</span>
            </motion.div>
          )}

          {/* FAST CHECKOUT HIGHLIGHT INFO BANNER */}
          <div className="p-3 bg-orange-500/[0.03] border border-orange-500/10 rounded-2xl text-[10.5px] text-zinc-500 dark:text-zinc-450 font-medium leading-relaxed">
            💡 <strong className="text-orange-600 dark:text-orange-400">Instant Checkout Routing:</strong> Having multiple delivery locations lets you pre-configure standard destination pins. Your active <strong className="text-zinc-800 dark:text-zinc-200">Primary Location</strong> is auto-applied inside checkout workflows to bypass form entry steps!
          </div>

          {/* ADD / EDIT ADDRESS FORM */}
          {showAddrForm ? (
            <form onSubmit={handleSaveAddress} className="space-y-4 text-xs animate-fadeIn">
              <div className="p-3 bg-slate-50 dark:bg-zinc-850 rounded-2xl border border-slate-100 dark:border-zinc-800 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-zinc-800 dark:text-zinc-250 uppercase text-[10px] tracking-wider">
                    {editingAddrId ? '✍️ Modify Saved Address' : '📍 Add New Delivery Pin'}
                  </span>
                  <button 
                    type="button" 
                    onClick={() => { setShowAddrForm(false); setEditingAddrId(null); }}
                    className="p-1 bg-slate-200 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-full transition cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                  </button>
                </div>

                {/* ADDRESS LABELS BUTTON SELECTOR */}
                <div>
                  <label className="block text-[9.5px] font-bold text-zinc-450 uppercase mb-1">Address Label</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['Home', 'Work', 'Other'] as const).map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setAddrType(type)}
                        className={`py-2 px-1.5 rounded-xl font-bold uppercase text-[10px] border transition cursor-pointer ${
                          addrType === type
                            ? 'bg-orange-500 border-orange-500 text-white'
                            : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-750 text-zinc-650 dark:text-zinc-333 hover:bg-slate-50 dark:hover:bg-zinc-750'
                        }`}
                      >
                        {type === 'Home' && '🏠 '}
                        {type === 'Work' && '💼 '}
                        {type === 'Other' && '📍 '}
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* FORM FIELDS */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9.5px] font-bold text-zinc-455 uppercase mb-1">Flat / House / Wing *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Flat 405, Block B"
                      value={addrFlatNo}
                      onChange={e => setAddrFlatNo(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 p-2 rounded-xl border border-slate-200 dark:border-zinc-800 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[9.5px] font-bold text-zinc-455 uppercase mb-1">Street / Area Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. EPR Nagar bypass"
                      value={addrArea}
                      onChange={e => setAddrArea(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 p-2 rounded-xl border border-slate-200 dark:border-zinc-800 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9.5px] font-bold text-zinc-455 uppercase mb-1">Landmark (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Near Clock tower"
                      value={addrLandmark}
                      onChange={e => setAddrLandmark(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 p-2 rounded-xl border border-slate-200 dark:border-zinc-800 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[9.5px] font-bold text-zinc-455 uppercase mb-1">City / Town Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Chirala"
                      value={addrCity}
                      onChange={e => setAddrCity(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-805 text-zinc-900 dark:text-zinc-100 p-2 rounded-xl border border-slate-200 dark:border-zinc-800 font-bold"
                    />
                  </div>
                </div>

                {/* COMPACT INTERACTIVE MAP GEOPIN PICKER CONTAINER */}
                <div className="space-y-2 pt-1">
                  <div className="flex justify-between items-center">
                    <label className="block text-[9.5px] font-black text-orange-500 uppercase tracking-wide">📍 Delivery Geopin Locator</label>
                    <span className="text-[8.5px] text-zinc-400 dark:text-zinc-500 font-mono">Click anywhere to drop delivery pin</span>
                  </div>

                  {/* SVG MAP SHAPE PANEL */}
                  <div className="relative w-full h-[180px] bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-inner flex flex-col justify-between">
                    
                    {/* SVG Map Canvas */}
                    <svg 
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;
                        
                        // Conversion projections logic
                        // Center of map is Muntha Vari Center: x=170, y=90 at (15.8270, 80.3551)
                        const lng = 80.3551 + (x - 170) / 35000;
                        const lat = 15.8270 - (y - 90) / 35000;
                        setAddrLat(parseFloat(lat.toFixed(5)));
                        setAddrLng(parseFloat(lng.toFixed(5)));
                      }}
                      className="absolute inset-0 w-full h-full cursor-crosshair select-none"
                    >
                      {/* Grid Lines */}
                      <line x1="0" y1="45" x2="100%" y2="45" stroke="#ececec" strokeDasharray="3,3" className="dark:stroke-zinc-800" />
                      <line x1="0" y1="90" x2="100%" y2="90" stroke="#ececec" strokeDasharray="3,3" className="dark:stroke-zinc-800" />
                      <line x1="0" y1="135" x2="100%" y2="135" stroke="#ececec" strokeDasharray="3,3" className="dark:stroke-zinc-800" />
                      
                      <line x1="85" y1="0" x2="85" y2="100%" stroke="#ececec" strokeDasharray="3,3" className="dark:stroke-zinc-800" />
                      <line x1="170" y1="0" x2="170" y2="100%" stroke="#ececec" strokeDasharray="3,3" className="dark:stroke-zinc-800" />
                      <line x1="255" y1="0" x2="255" y2="100%" stroke="#ececec" strokeDasharray="3,3" className="dark:stroke-zinc-800" />

                      {/* Map Geography Shapes */}
                      {/* Gulf Coastline in south east corner */}
                      <path d="M 230 180 Q 280 140 340 120 L 340 180 Z" fill="#bae6fd" className="dark:fill-sky-950/40" />
                      <text x="290" y="160" className="text-[7.5px] font-bold font-mono fill-sky-500/80 tracking-wide rotate-[-15deg]">Bay Of Bengal</text>

                      {/* Greenary Area */}
                      <path d="M 10 110 Q 50 115 45 155 Z" fill="#dcfce7" className="dark:fill-emerald-950/20" />
                      <text x="18" y="135" className="text-[6.5px] font-bold font-sans fill-emerald-500/65 uppercase tracking-wider">ITC Reserve</text>

                      {/* Guntur Highway Main Line (West-East crossing) */}
                      <path d="M 0 35 H 340" stroke="#cbd5e1" strokeWidth="5" fill="none" className="dark:stroke-zinc-700/80" />
                      <path d="M 0 35 H 340" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4,4" fill="none" className="dark:stroke-zinc-500" />
                      <text x="10" y="28" className="text-[7px] font-mono font-extrabold fill-zinc-400 dark:fill-zinc-400 rotate-0">← Guntur Highway Bypass →</text>

                      {/* Direct Beach Highway road from Center to Coast */}
                      <path d="M 170 90 L 290 155" stroke="#94a3b8" strokeWidth="4" fill="none" className="dark:stroke-zinc-700/80" />
                      <text x="210" y="117" className="text-[7px] font-sans font-black fill-zinc-400 dark:fill-zinc-400 rotate-[25deg]">Ramapuram Beach Road</text>

                      {/* Local Market Lane (North-South Loop) */}
                      <path d="M 170 0 V 180" stroke="#e2e8f0" strokeWidth="3.5" fill="none" className="dark:stroke-zinc-805" />
                      <text x="175" y="145" className="text-[7.5px] font-bold font-sans fill-zinc-400 dark:fill-zinc-400 rotate-[90deg]">Station Loop</text>
                      
                      {/* Landmark Node Visuals */}
                      {/* Muntha Vari Center Circle (Central Crossing hub) */}
                      <circle cx="170" cy="90" r="10" fill="#fddf47" stroke="#fbbf24" strokeWidth="2" className="dark:fill-amber-950/60 dark:stroke-amber-500" />
                      <text x="183" y="93" className="text-[7.5px] font-black font-sans fill-amber-600 dark:fill-amber-400">Muntha Vari Center</text>

                      {/* Perala Clock Tower Node */}
                      <circle cx="260" cy="50" r="4" fill="#a78bfa" stroke="#c084fc" strokeWidth="1.5" />
                      <text x="268" y="52" className="text-[6.5px] font-bold font-mono fill-indigo-500">Perala Clock Tower</text>

                      {/* Missamma Temple Node */}
                      <polygon points="50,30 54,38 46,38" fill="#f43f5e" stroke="#fda4af" strokeWidth="1" />
                      <text x="35" y="47" className="text-[6.5px] font-bold font-semibold fill-rose-500">Missamma Devsthanam</text>

                      {/* ACTIVE DROPPED GEOPIN OVERLAY SHAPE */}
                      {(() => {
                        // Project live coordinates inside maps limits
                        // Reverse conversion: x = 170 + (lng - 80.3551) * 35000
                        //                    y = 90 - (lat - 15.8270) * 35000
                        const pinX = 170 + (addrLng - 80.3551) * 35000;
                        const pinY = 90 - (addrLat - 15.8270) * 35000;

                        // Ensure pins stay visible inside SVG frame boundaries
                        const safeX = Math.max(12, Math.min(328, pinX));
                        const safeY = Math.max(12, Math.min(168, pinY));

                        return (
                          <g transform={`translate(${safeX}, ${safeY})`} className="pointer-events-none">
                            {/* Glowing halo pulse */}
                            <circle cx="0" cy="0" r="15" fill="#f97316" className="animate-ping opacity-30" />
                            <circle cx="0" cy="0" r="5" fill="#ea580c" className="opacity-40" />
                            {/* Classic map pin path */}
                            <path 
                              d="M 0 0 C -4 -4, -8 -10, -8 -14 C -8 -19, -4 -22, 0 -22 C 4 -22, 8 -19, 8 -14 C 8 -10, 4 -4, 0 0 Z" 
                              fill="#ea580c" 
                              stroke="#ffffff" 
                              strokeWidth="1.5" 
                              className="filter drop-shadow-md"
                            />
                            {/* Inner white core dot */}
                            <circle cx="0" cy="-14" r="3.2" fill="#ffffff" />
                          </g>
                        );
                      })()}
                    </svg>

                    {/* Coordinates Monospace Ribbon Readout overlay */}
                    <div className="z-1 absolute bottom-0 left-0 right-0 py-1.5 px-3 bg-zinc-950/85 backdrop-blur-xs flex justify-between items-center text-[8.5px] text-zinc-100 border-t border-zinc-900 font-mono">
                      <span className="text-zinc-400">GPS ACCURATE LOCK:</span>
                      <span className="text-orange-400 font-black tracking-wider">
                        {addrLat.toFixed(5)}° N , {addrLng.toFixed(5)}° E
                      </span>
                    </div>
                  </div>

                  {/* QUICK ALIGNED RESTAURANT LANDMARK PRESETS */}
                  <div className="space-y-1">
                    <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Tap to auto-snap pin location:</p>
                    <div className="flex flex-wrap gap-1">
                      {[
                        { label: '📍 Town Center', lat: 15.8270, lng: 80.3551, landmark: 'Near Muntha Vari Center Ring', area: 'Chirala Main Market Road' },
                        { label: '🌊 Beach Side', lat: 15.8080, lng: 80.3810, landmark: 'Near Ramapuram Beach Road Arch', area: 'Beach Road Highway' },
                        { label: '🏛️ Clock Tower', lat: 15.8315, lng: 80.3602, landmark: 'Opposite Perala Heritage Clock Tower', area: 'Kothapet Loop Rd' },
                        { label: '🏗️ Missamma Temple', lat: 15.8322, lng: 80.3421, landmark: 'Near Entrance Arch', area: 'Missamma Guntur Bypass Rd' },
                        { label: '🚉 Rail Station', lat: 15.8252, lng: 80.3501, landmark: 'Near Platform 1 Parking Area', area: 'Station Junction Road' }
                      ].map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setAddrLat(preset.lat);
                            setAddrLng(preset.lng);
                            setAddrLandmark(preset.landmark);
                            setAddrArea(preset.area);
                          }}
                          className="px-2 py-1 text-[8.5px] bg-slate-100 hover:bg-orange-500/10 hover:text-orange-600 dark:bg-zinc-800 dark:hover:bg-zinc-750 font-bold border border-slate-200 dark:border-zinc-750 text-zinc-650 dark:text-zinc-300 rounded-lg transition cursor-pointer"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* DEFAULT TOGGLE */}
                <div className="flex items-center gap-2 py-0.5">
                  <input
                    type="checkbox"
                    id="addressIsDefault"
                    checked={addrIsDefault}
                    onChange={e => setAddrIsDefault(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-orange-500 focus:ring-orange-500 cursor-pointer"
                  />
                  <label htmlFor="addressIsDefault" className="font-extrabold text-zinc-700 dark:text-zinc-300 select-none cursor-pointer">
                    Set as my standard 'Default' checkout address
                  </label>
                </div>
              </div>

              {/* FORM FOOTER CONTROLS */}
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => { setShowAddrForm(false); setEditingAddrId(null); }}
                  className="px-3.5 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-zinc-700 dark:text-zinc-300 rounded-xl font-bold cursor-pointer transition uppercase text-[10px] tracking-wider"
                >
                  Discard Changes
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-655 text-white rounded-xl font-black transition uppercase text-[10px] tracking-wider cursor-pointer shadow-md shadow-orange-500/10 hover:scale-[1.01] active:scale-[0.99]"
                >
                  Save Delivery Address
                </button>
              </div>
            </form>
          ) : (
            /* LIST SAVED ADDRESSES */
            <div className="space-y-3 animate-fadeIn">
              {preSavedAddresses.length === 0 ? (
                <div className="py-6 text-center text-zinc-450 space-y-2 border border-dashed rounded-2xl p-4 bg-slate-50/50 dark:bg-zinc-850/20">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
                    <MapPin className="w-5 h-5 text-zinc-450" />
                  </div>
                  <div>
                    <h5 className="text-[11px] font-black text-zinc-700 dark:text-zinc-300 uppercase">No delivery locations saved yet</h5>
                    <p className="text-[9.5px] text-zinc-450 mt-0.5">Configure your Work, Home or other accurate destination pins to checkout under 3 seconds.</p>
                  </div>
                  <button
                    onClick={handleOpenAddForm}
                    className="text-[10px] bg-orange-500 hover:bg-orange-600 text-white font-black px-3.5 py-1.5 rounded-xl uppercase tracking-wider transition shadow-sm"
                  >
                    Setup Coordinates Now
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                  {preSavedAddresses.map(addr => (
                    <div 
                      key={addr.id} 
                      className={`p-3.5 rounded-2xl border transition-all text-[11px] text-left relative space-y-3 ${
                        addr.isDefault 
                          ? 'bg-orange-500/[0.02] dark:bg-orange-500/[0.01] border-orange-500/40 shadow-sm ring-1 ring-orange-500/10' 
                          : 'bg-slate-50/60 dark:bg-zinc-850/40 border-slate-100 dark:border-zinc-800/80 hover:border-slate-200 dark:hover:border-zinc-750'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <span className="text-orange-500 text-sm">
                            {addr.type === 'Home' && '🏠'}
                            {addr.type === 'Work' && '💼'}
                            {addr.type === 'Other' && '📍'}
                          </span>
                          <span className="font-extrabold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
                            {addr.type} Address
                          </span>
                          {addr.isDefault ? (
                            <span className="text-[8.5px] bg-orange-500/10 text-orange-600 dark:text-orange-400 font-black uppercase px-2 py-0.5 rounded-md border border-orange-500/20 flex items-center gap-0.5">
                              ★ PRIMARY TARGET
                            </span>
                          ) : (
                            <span className="text-[8.5px] bg-slate-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 font-bold uppercase px-1.5 py-0.5 rounded-md">
                              SECONDARY
                            </span>
                          )}
                        </div>

                        {/* Edit / Trash Actions */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditForm(addr)}
                            title="Edit Address"
                            className="p-1 px-1.5 bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 text-zinc-600 dark:text-zinc-350 hover:text-orange-500 rounded-md transition hover:border-orange-500/40 cursor-pointer"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(addr.id)}
                            title="Delete Address"
                            className="p-1 px-1.5 bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 text-zinc-650 dark:text-zinc-400 hover:text-rose-500 rounded-md transition hover:border-rose-500/40 cursor-pointer"
                          >
                            <Trash className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Info Readout */}
                      <div className="space-y-1 text-zinc-600 dark:text-zinc-350 text-left">
                        {addr.isManual ? (
                          <div className="space-y-0.5 font-medium leading-relaxed text-[11.5px]">
                            {addr.customerName && <p className="font-black text-zinc-900 dark:text-zinc-100">Contact: {addr.customerName} (+91 {addr.mobileNumber})</p>}
                            <p className="font-extrabold text-zinc-850 dark:text-zinc-150">Door: {addr.houseNumber}, {addr.streetName}</p>
                            <p>Locality: {addr.locality} {addr.landmark ? `• Landmark: ${addr.landmark}` : ''}</p>
                            {addr.villageTown && <p>Village/Town: {addr.villageTown}</p>}
                            <p className="text-[10px] text-zinc-450 font-mono font-bold">{addr.city}, {addr.district || 'Bapatla'}, {addr.state || 'AP'} - {addr.pincode}</p>
                          </div>
                        ) : (
                          <div className="space-y-0.5 font-medium leading-relaxed">
                            <p className="font-black text-zinc-850 dark:text-zinc-100">{addr.flatNo}</p>
                            <p>{addr.area}, {addr.landmark || 'No landmarks configured'}</p>
                            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">Location: {addr.city}</p>
                          </div>
                        )}

                        {addr.deliveryNotes && (
                          <p className="text-[10.5px] italic text-orange-655 font-bold bg-orange-500/5 p-2 rounded-xl border border-orange-500/10 mt-2">
                            📝 Delivery note: "{addr.deliveryNotes}"
                          </p>
                        )}

                        {addr.gpsCoordinates && (
                          <p className="text-[9px] font-mono text-zinc-400 italic pt-1 flex items-center gap-1">
                            📍 Geopin coordinates: ({addr.gpsCoordinates.lat}, {addr.gpsCoordinates.lng})
                          </p>
                        )}
                      </div>

                      {/* Default Toggle action button if not default */}
                      {!addr.isDefault && (
                        <div className="pt-2.5 border-t border-dashed border-slate-200/50 dark:border-zinc-800 flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleSetAddressAsDefault(addr)}
                            className="text-[9.5px] bg-orange-50 hover:bg-orange-500/10 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 font-extrabold uppercase px-3 py-1.5 rounded-xl border border-orange-200/50 dark:border-orange-900/40 cursor-pointer flex items-center gap-1 transition"
                          >
                            ☆ Set as Primary Location
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* DEVICE CAMERA PHOTO CAPTURE MODAL OVERLAY */}
      <AnimatePresence>
        {isCameraActive && (
          <div 
            id="camera-capture-modal-backdrop"
            className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              id="camera-capture-modal-card"
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl relative"
            >
              {/* Dismiss button */}
              <button
                id="camera-modal-close-btn"
                onClick={stopCamera}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-50 dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-zinc-400 dark:text-zinc-500 transition-colors cursor-pointer"
                title="Close camera"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center space-y-4">
                <div className="space-y-1">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-950/20 rounded-full flex items-center justify-center text-orange-500 mx-auto border border-orange-200 dark:border-orange-900/40">
                    <Camera className="w-6 h-6 animate-pulse" />
                  </div>
                  <h3 className="text-base font-black text-zinc-900 dark:text-zinc-50 tracking-tight pt-1">
                    Take Profile Selfie
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                    Use your device's camera to frame a real-time profile picture.
                  </p>
                </div>

                {/* Main Viewport Container */}
                <div className="relative w-48 h-48 mx-auto rounded-full border-4 border-slate-100 dark:border-zinc-800 shadow-inner overflow-hidden bg-slate-50 dark:bg-zinc-950 flex items-center justify-center aspect-square">
                  {capturedPhoto ? (
                    <img 
                      id="camera-captured-preview-img"
                      src={capturedPhoto} 
                      alt="Captured Profile Snapshot" 
                      className="w-full h-full object-cover rounded-full rotate-0 transition-transform animate-fadeIn"
                      referrerPolicy="no-referrer"
                    />
                  ) : cameraError ? (
                    <div id="camera-error-notice" className="flex flex-col items-center justify-center p-4 text-center space-y-2">
                      <ShieldAlert className="w-8 h-8 text-rose-500" />
                      <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest leading-none">Access Restricted</p>
                      <p className="text-[9px] text-zinc-400 dark:text-zinc-500 font-semibold px-2 leading-relaxed">
                        {cameraError}
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Active viewfinder guideline frame overlay */}
                      <div className="absolute inset-2 border border-dashed border-orange-500/20 rounded-full pointer-events-none animate-pulse z-10" />
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        muted 
                        className="w-full h-full object-cover rounded-full transform scale-x-[-1]" 
                      />
                    </>
                  )}
                  
                  {/* Subtle active camera indicator light */}
                  {!capturedPhoto && !cameraError && (
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      <span className="text-[7.5px] font-black uppercase text-emerald-400 font-mono tracking-widest">Live Feed</span>
                    </div>
                  )}
                </div>

                {/* Hidden drafting canvas of 480x480 resolution */}
                <canvas ref={canvasRef} className="hidden" />

                {/* Dynamic Context Controller Actions */}
                <div className="pt-2">
                  {capturedPhoto ? (
                    <div className="space-y-2.5">
                      <button
                        id="camera-confirm-photo-btn"
                        onClick={saveCapturedAvatar}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black text-xs uppercase py-3 rounded-2xl transition cursor-pointer shadow-lg shadow-orange-500/15 flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle className="w-4 h-4" /> Save As Profile Avatar
                      </button>
                      <button
                        id="camera-retake-photo-btn"
                        onClick={() => setCapturedPhoto(null)}
                        className="w-full bg-slate-50 dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-750 text-zinc-650 dark:text-zinc-300 font-bold text-xs py-2.5 rounded-2xl border border-slate-150 dark:border-zinc-750/80 transition cursor-pointer"
                      >
                        Retake Selfie Photo
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <button
                        id="camera-snap-trigger-btn"
                        type="button"
                        onClick={takePhoto}
                        disabled={!!cameraError}
                        className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-black text-xs uppercase py-3 rounded-2xl transition cursor-pointer shadow-lg shadow-orange-500/15 flex items-center justify-center gap-1.5 disabled:cursor-not-allowed"
                      >
                        <Camera className="w-4 h-4 font-black" /> Snap Photo 📸
                      </button>

                      {/* Fallback File Uploader Block */}
                      <div className="pt-2 border-t border-dashed border-slate-150 dark:border-zinc-800/60 space-y-2">
                        <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest">Or Import Photo</p>
                        <label 
                          id="avatar-file-upload-label"
                          className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-855 rounded-2xl cursor-pointer hover:bg-slate-105 dark:hover:bg-zinc-850/50 transition text-zinc-600 dark:text-zinc-300"
                        >
                          <Upload className="w-3.5 h-3.5 text-orange-500" />
                          <span className="text-[10px] font-extrabold uppercase tracking-tight">Browse portrait file</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleFileUpload}
                            className="hidden" 
                          />
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  id="camera-modal-cancel-btn"
                  onClick={stopCamera}
                  className="w-full text-zinc-400 hover:text-zinc-500 text-[10px] font-mono tracking-widest uppercase cursor-pointer py-1 block hover:underline animate-pulse"
                >
                  Cancel & Dismiss
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CUSTOMER TAX INVOICE GENERATOR / PREVIEW MODAL */}
      <AnimatePresence>
        {selectedInvoiceOrder && (() => {
          const order = selectedInvoiceOrder;
          const isPaid = order.status !== 'cancelled';
          const itemsSubtotal = order.items.reduce((sum: number, i: any) => sum + (i.foodItem.price * i.quantity), 0);
          const pkgFee = order.packagingFee !== undefined ? order.packagingFee : 10;
          const delFee = order.deliveryFee !== undefined ? order.deliveryFee : 20;
          const riderTip = order.deliveryPartnerTip || 0;
          const promoDiscount = order.discount || 0;
          const ptsRedeemed = order.pointsRedeemed || 0;
          
          // Composite 5% GST calculation for food items
          const cgst = parseFloat((itemsSubtotal * 0.025).toFixed(2));
          const sgst = parseFloat((itemsSubtotal * 0.025).toFixed(2));
          
          return (
            <div 
              id="customer-invoice-modal-backdrop"
              className="fixed inset-0 bg-zinc-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
            >
              <motion.div
                id="customer-invoice-modal-card"
                initial={{ opacity: 0, scale: 0.95, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 30 }}
                transition={{ type: "spring", duration: 0.4 }}
                className="w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl relative space-y-4 text-xs text-zinc-800 dark:text-zinc-200"
              >
                {/* Dismiss button */}
                <button
                  onClick={() => setSelectedInvoiceOrder(null)}
                  className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-50 dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-zinc-400 dark:text-zinc-500 transition-colors cursor-pointer"
                  title="Close Invoice"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Printable Invoice Container */}
                <div id="printable-invoice-container" className="space-y-4 p-2 print:p-0 print:text-black">
                  
                  {/* Brand & Invoice title */}
                  <div className="text-center pb-3 border-b border-dashed border-slate-200 dark:border-zinc-800 space-y-1">
                    <span className="text-xl font-black tracking-tight text-orange-500 font-mono">
                      NUVVO GOURMET CO.
                    </span>
                    <p className="text-[9px] text-zinc-400 font-mono font-bold tracking-widest uppercase">
                      CHIRALA REGIONAL FLAVOURS HUB
                    </p>
                    <p className="text-[8px] text-zinc-400 font-mono">
                      GSTIN: 37AAECN9912F1Z8 • Registered Composite Dealer
                    </p>
                    <div className="inline-block px-3 py-1 bg-zinc-50 dark:bg-zinc-950 rounded-lg text-[9.5px] font-black border border-slate-100 dark:border-zinc-850 tracking-wider uppercase mt-1">
                      OFFICIAL TAX INVOICE
                    </div>
                  </div>

                  {/* Meta Details Grid */}
                  <div className="grid grid-cols-2 gap-3 text-[9.5px] border-b border-dashed border-slate-200 dark:border-zinc-800 pb-3">
                    <div className="space-y-1.5">
                      <div>
                        <span className="text-zinc-400 uppercase font-black tracking-wider block text-[7.5px]">INVOICE REF</span>
                        <span className="font-extrabold text-zinc-800 dark:text-zinc-200 font-mono">
                          INV-2026-{order.id.slice(-6).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-400 uppercase font-black tracking-wider block text-[7.5px]">BILL DATE</span>
                        <span className="font-bold text-zinc-700 dark:text-zinc-300 font-mono">
                          {new Date(order.date).toLocaleDateString()} {new Date(order.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-400 uppercase font-black tracking-wider block text-[7.5px]">PAYMENT MODE</span>
                        <span className="font-bold text-orange-600 dark:text-orange-400 font-mono">
                          {order.paymentMethod}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-right">
                      <div>
                        <span className="text-zinc-400 uppercase font-black tracking-wider block text-[7.5px]">BILLED TO</span>
                        <span className="font-black text-zinc-855 dark:text-zinc-150 block truncate">
                          {order.customerName || user?.name}
                        </span>
                        <span className="font-semibold text-zinc-500 font-mono">
                          +91 {order.customerPhone || user?.phone || 'Guest'}
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-400 uppercase font-black tracking-wider block text-[7.5px]">DELIVERED AT</span>
                        <span className="font-medium text-zinc-500 block truncate max-w-[180px] ml-auto">
                          {order.deliveryAddress}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Itemized Table */}
                  <div className="space-y-2">
                    <span className="text-[8px] text-zinc-400 uppercase font-black tracking-widest block font-mono">Bill Items</span>
                    <div className="divide-y divide-slate-100 dark:divide-zinc-800/60 font-mono text-[9.5px]">
                      
                      {/* Table Header */}
                      <div className="flex justify-between font-black text-zinc-400 py-1 uppercase text-[8px]">
                        <span className="flex-1 text-left">Description</span>
                        <span className="w-12 text-center">Qty</span>
                        <span className="w-16 text-right">Rate</span>
                        <span className="w-16 text-right">Total</span>
                      </div>

                      {/* Items loop */}
                      {order.items.map((item: any, index: number) => {
                        const itemPrice = item.foodItem.price;
                        const itemTotal = itemPrice * item.quantity;
                        return (
                          <div key={index} className="flex justify-between items-start py-2">
                            <div className="flex-1 min-w-0 pr-2 text-left">
                              <span className="font-black text-zinc-800 dark:text-zinc-200 block truncate">{item.foodItem.name}</span>
                              {item.selectedCustomizations && Object.keys(item.selectedCustomizations).length > 0 && (
                                <span className="text-[8px] text-orange-500 block truncate">
                                  └ {Object.values(item.selectedCustomizations).map((v: any) => v.name || v).join(', ')}
                                </span>
                              )}
                            </div>
                            <span className="w-12 text-center text-zinc-500 font-extrabold">x{item.quantity}</span>
                            <span className="w-16 text-right text-zinc-500">₹{itemPrice}</span>
                            <span className="w-16 text-right font-bold text-zinc-800 dark:text-zinc-200 font-mono">₹{itemTotal}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Financial Breakdown Receipt */}
                  <div className="border-t border-dashed border-slate-200 dark:border-zinc-800 pt-2.5 text-[9.5px] font-mono space-y-1.5">
                    <div className="flex justify-between text-zinc-500">
                      <span>Items Subtotal:</span>
                      <span>₹{itemsSubtotal}</span>
                    </div>

                    {/* GST Breakdown Row */}
                    <div className="flex justify-between text-zinc-400 text-[8.5px] italic pl-2.5">
                      <span>• CGST (2.5%):</span>
                      <span>₹{cgst}</span>
                    </div>
                    <div className="flex justify-between text-zinc-400 text-[8.5px] italic pl-2.5">
                      <span>• SGST (2.5%):</span>
                      <span>₹{sgst}</span>
                    </div>

                    <div className="flex justify-between text-zinc-500">
                      <span>Restaurant Packaging Charge:</span>
                      <span>₹{pkgFee}</span>
                    </div>
                    <div className="flex justify-between text-zinc-500">
                      <span>Contactless Delivery Fee:</span>
                      <span>₹{delFee}</span>
                    </div>

                    {riderTip > 0 && (
                      <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                        <span>Delivery Partner Tip (100% credited):</span>
                        <span>₹{riderTip}</span>
                      </div>
                    )}

                    {promoDiscount > 0 && (
                      <div className="flex justify-between text-orange-600 dark:text-orange-400 font-bold">
                        <span>Promo Discount applied:</span>
                        <span>-₹{promoDiscount}</span>
                      </div>
                    )}

                    {ptsRedeemed > 0 && (
                      <div className="flex justify-between text-[#4f46e5] dark:text-indigo-400 font-bold">
                        <span>Nuvvo Points Cashback redeemed:</span>
                        <span>-₹{ptsRedeemed}</span>
                      </div>
                    )}

                    {/* Final Grand Total Row */}
                    <div className="flex justify-between items-baseline pt-2 border-t border-dashed border-slate-200 dark:border-zinc-800 text-xs font-black">
                      <span className="text-zinc-900 dark:text-zinc-50 uppercase tracking-wide">Grand Total Payable</span>
                      <span className="text-lg text-orange-500 font-black">₹{order.totalAmount}</span>
                    </div>
                  </div>

                  {/* Stamp of payment status */}
                  <div className="flex justify-between items-center pt-3 border-t border-dashed border-slate-200 dark:border-zinc-800">
                    <div className="text-[8px] text-zinc-400 max-w-[65%] leading-normal text-left">
                      This is a computer-generated tax invoice issued on behalf of the registered regional kitchen. No physical signature is required. For inquiries, contact support.
                    </div>
                    
                    {/* Stamp */}
                    <div className={`border-2 rounded-xl px-2.5 py-1 font-black text-[9.5px] uppercase tracking-widest font-mono text-center rotate-[-4deg] shrink-0 ${
                      isPaid 
                        ? 'border-emerald-500/50 text-emerald-600 bg-emerald-500/[0.04]' 
                        : 'border-rose-500/50 text-rose-600 bg-rose-500/[0.04]'
                    }`}>
                      {isPaid ? 'PAID IN FULL' : 'CANCELLED'}
                      <span className="block text-[7px] font-bold mt-0.5 tracking-tight font-sans text-zinc-400">
                        {isPaid ? `via ${order.paymentMethod}` : 'REFUND VOID'}
                      </span>
                    </div>
                  </div>

                </div>

                {/* Actions Bar */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-zinc-850">
                  <button
                    type="button"
                    onClick={handlePrintInvoice}
                    className="flex items-center justify-center gap-1 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-800 dark:text-zinc-200 font-bold text-[10px] py-2 rounded-xl border border-slate-200 dark:border-zinc-700 transition active:scale-95 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-orange-500" /> Print
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopyInvoiceText(order)}
                    className="flex items-center justify-center gap-1 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-800 dark:text-zinc-200 font-bold text-[10px] py-2 rounded-xl border border-slate-200 dark:border-zinc-700 transition active:scale-95 cursor-pointer"
                  >
                    {copiedInvoiceId === order.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-orange-500" /> Copy
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedInvoiceOrder(null)}
                    className="flex items-center justify-center gap-1 bg-orange-500 hover:bg-orange-600 text-white font-black text-[10px] py-2 rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>

              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
