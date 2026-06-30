/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { downloadPayoutInvoice } from '../utils/payoutInvoiceGenerator';
import { motion, AnimatePresence } from 'motion/react';
import RiderDashboard from './RiderDashboard';
import { 
  Bike, Wallet, CheckCircle, FileText, Upload, ToggleLeft, ToggleRight, 
  MapPin, Clipboard, Landmark, ShieldCheck, ChevronRight, ChevronLeft, X, TrendingUp,
  Calendar, Clock, Star, Gift, Shield, Check, Info, Award, Download,
  ArrowUpRight, AlertCircle, RefreshCw, CalendarDays, IndianRupee,
  Plus, Trash, Sparkles, Play, HelpCircle, ShieldAlert, BadgeCheck, Compass,
  Activity
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar
} from 'recharts';

export default function PartnerScreen() {
  const { 
    deliveryPartner, registerAsPartner, partnerOtpVerify, 
    updatePartnerAvailability, orders, partnerAcceptOrder, 
    partnerCompleteDelivery, clickToWhatsAppSupport,
    requestPayout, incentiveSettings, deliveryPartners,
    pageHistory, goBack, closePage
  } = useApp();

  const [isLogin, setIsLogin] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [licenseNo, setLicenseNo] = useState('');
  const [aadhaarNo, setAadhaarNo] = useState('');
  const [bankAcc, setBankAcc] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');
  const [isLogged, setIsLogged] = useState(false);

  // New states for the interactive Rider Earnings & Payout systems
  const [partnerTab, setPartnerTab] = useState<'jobs' | 'earnings' | 'advanced' | 'dashboard'>('dashboard');
  const [earningFilter, setEarningFilter] = useState<'today' | 'week' | 'month' | 'custom'>('week');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [showInvoiceDetails, setShowInvoiceDetails] = useState<string | null>(null);

  // Advanced Rider Console State Declarations
  const [localWalletBonus, setLocalWalletBonus] = useState<number>(0);
  const [tempCheck, setTempCheck] = useState<string>('98.4');
  const [hasHelmet, setHasHelmet] = useState<boolean>(false);
  const [hasReflectiveVest, setHasReflectiveVest] = useState<boolean>(false);
  const [hasTireCheck, setHasTireCheck] = useState<boolean>(false);
  const [safetySubmitted, setSafetySubmitted] = useState<boolean>(false);

  interface ExpenseLog {
    id: string;
    date: string;
    type: 'Fuel' | 'Maintenance' | 'Other';
    amount: number;
    notes: string;
  }

  const [expenses, setExpenses] = useState<ExpenseLog[]>([
    { id: 'exp_1', date: '2026-06-21', type: 'Fuel', amount: 350, notes: 'Refueling Splendor at Bypass IndianOil' },
    { id: 'exp_2', date: '2026-06-22', type: 'Maintenance', amount: 120, notes: 'Tire air fill and chain lube spray' }
  ]);
  const [newExpType, setNewExpType] = useState<'Fuel' | 'Maintenance' | 'Other'>('Fuel');
  const [newExpAmount, setNewExpAmount] = useState<string>('');
  const [newExpNotes, setNewExpNotes] = useState<string>('');

  const [activeZoneId, setActiveZoneId] = useState<string | null>(null);
  const [zoneAlertMessage, setZoneAlertMessage] = useState<string | null>(null);

  // Active unassigned or preparing/picked orders for driver assignment
  const pendingJobs = orders.filter(o => o.status === 'accepted' || o.status === 'preparing');

  const handleDemoBypass = () => {
    registerAsPartner("Srinivas Rao (Demo Rider)", "9988776655", {
      licenseUrl: "DL-AP39X4859",
      aadhaarUrl: "3948-2849-1058",
      vehicleDocsUrl: "RC-AP39-9521",
      bankAccount: "918239485901",
      bankIfsc: "SBIN0005012"
    });
    setIsLogged(true);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerName.trim() || !phoneNumber.trim()) return;

    registerAsPartner(partnerName, phoneNumber, {
      licenseUrl: licenseNo,
      aadhaarUrl: aadhaarNo,
      vehicleDocsUrl: 'scanned_vehicle_card.pdf',
      bankAccount: bankAcc,
      bankIfsc: bankIfsc
    });
    setIsLogged(true);
  };

  const handleVerifyLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const succ = partnerOtpVerify(phoneNumber);
    if (succ) {
      setIsLogged(true);
    } else {
      alert('Verification cell is not registered yet. Kindly trigger registration first.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 pb-32 transition-colors duration-300">
      
      {/* Upper header */}
      <div className="sticky top-0 bg-white dark:bg-zinc-900 border-b border-slate-100 dark:border-zinc-800 p-4 z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={pageHistory.length > 1 ? goBack : closePage}
            className="p-1.5 bg-slate-150 dark:bg-zinc-800 hover:bg-slate-250 dark:hover:bg-zinc-700 rounded-full text-zinc-700 dark:text-zinc-300 transition-all cursor-pointer active:scale-95 flex items-center justify-center shrink-0"
            title="Go Back"
            id="partner-screen-back-btn"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={closePage}
            className="p-1.5 bg-slate-150 dark:bg-zinc-800 hover:bg-slate-250 dark:hover:bg-zinc-700 rounded-full text-zinc-700 dark:text-zinc-300 transition-all cursor-pointer active:scale-95 flex items-center justify-center shrink-0"
            title="Close to Home"
            id="partner-screen-close-btn"
          >
            <X className="w-4 h-4" />
          </button>
          <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight flex items-center gap-1.5 ml-1">
            <Bike className="w-5.5 h-5.5 text-orange-500" /> Courier Logistics portal
          </h2>
        </div>
        <span className="text-[10px] font-mono bg-zinc-900 dark:bg-zinc-800 text-white dark:text-zinc-300 px-2 py-1 rounded font-bold uppercase">Consolidated</span>
      </div>

      <div className="p-4 max-w-md mx-auto space-y-4">
        
        {!isLogged && !deliveryPartner ? (
          <div className="bg-white dark:bg-zinc-900 border rounded-3xl p-6 shadow-sm">
            <div className="flex bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl mb-4 text-xs font-bold border">
              <button 
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 rounded-lg text-center ${isLogin ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 shadow-xs' : 'text-zinc-500'}`}
              >
                OTP Login
              </button>
              <button 
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 rounded-lg text-center ${!isLogin ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 shadow-xs' : 'text-zinc-500'}`}
              >
                Register
              </button>
            </div>

            {isLogin ? (
              <form onSubmit={handleVerifyLogin} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-zinc-500 uppercase tracking-widest mb-1 text-[10px]">Verify cell number</label>
                  <input 
                    type="tel"
                    placeholder="Enter registered mobile number"
                    value={phoneNumber}
                    onChange={e => setPhoneNumber(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2.5 rounded-xl border font-bold"
                  />
                  <p className="text-[10px] text-zinc-400 mt-1">First register using the toggle above to configure records.</p>
                </div>
                <button type="submit" className="w-full bg-orange-500 hover:bg-orange-650 text-white font-black py-3 rounded-xl uppercase tracking-wider">
                  Verify & Log In
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-zinc-500 uppercase mb-1">Rider Full Name</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Ramesh Patil"
                    value={partnerName}
                    onChange={e => setPartnerName(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-zinc-850 p-2.5 rounded-xl border focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-500 uppercase mb-1">Mobile Cell</label>
                  <input 
                    type="tel"
                    required
                    placeholder="e.g. 7702906994"
                    value={phoneNumber}
                    onChange={e => setPhoneNumber(e.target.value)}
                    className="w-full bg-slate-150 dark:bg-zinc-850 p-2.5 rounded-xl border focus:outline-none"
                  />
                </div>

                <div className="border-t border-slate-100 pt-3 space-y-3">
                  <p className="font-bold text-zinc-700 dark:text-zinc-300">Identity Document Scans upload</p>
                  
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-[10px] uppercase text-zinc-400 mb-0.5">Driving License No.</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="DL-2234..." 
                        value={licenseNo}
                        onChange={e => setLicenseNo(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-zinc-800 p-2 rounded-lg border text-xs"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[10px] uppercase text-zinc-400 mb-0.5">Aadhaar UID-Card No.</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="UID 4820..." 
                        value={aadhaarNo}
                        onChange={e => setAadhaarNo(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-zinc-800 p-2 rounded-lg border text-xs"
                      />
                    </div>
                  </div>

                  {/* Drag and drop mock area */}
                  <div className="border-2 border-dashed border-slate-200 dark:border-zinc-800 p-4 rounded-xl text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800/40">
                    <Upload className="w-5 h-5 mx-auto mb-1.5 text-zinc-450" />
                    <p className="font-bold text-zinc-700 dark:text-zinc-300">Drag & Drop Vehicle Registration certificate</p>
                    <p className="text-[9px] text-zinc-400 mt-0.5">Supports PDF or High-res JPEG scans up to 5MB</p>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <p className="font-bold text-zinc-700 dark:text-zinc-300 mb-2">Payout Bank details</p>
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="text" 
                      required 
                      placeholder="Acc Number" 
                      value={bankAcc} 
                      onChange={e => setBankAcc(e.target.value)} 
                      className="p-2.5 bg-slate-50 dark:bg-zinc-800 rounded-lg border text-xs"
                    />
                    <input 
                      type="text" 
                      required 
                      placeholder="IFSC Code" 
                      value={bankIfsc} 
                      onChange={e => setBankIfsc(e.target.value)} 
                      className="p-2.5 bg-slate-50 dark:bg-zinc-800 rounded-lg border text-xs"
                    />
                  </div>
                </div>

                <button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-3 rounded-xl shadow-lg mt-3 uppercase tracking-wider">
                  Complete Logistics Application
                </button>
              </form>
            )}

            {/* Quick Demo Bypass Access Panel */}
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-zinc-800 text-center">
              <p className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-widest">Testing / Demonstration Access</p>
              <button
                type="button"
                onClick={handleDemoBypass}
                className="mt-2 w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 border-0"
              >
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                Bypass & Launch Demo Rider Panel 🚀
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* DRIVER STATS CARD */}
            <div className="bg-gradient-to-tr from-orange-500 to-amber-500 rounded-3xl p-5 text-white shadow-lg shadow-orange-500/10 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-mono bg-white/20 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-widest inline-block">Nuvvo Logistics Specialist</p>
                <h3 className="text-xl font-black mt-2 leading-none whitespace-nowrap">{deliveryPartner?.name || partnerName}</h3>
                <p className="text-xs text-white/80 mt-1 font-mono font-bold">Cell: +91 {deliveryPartner?.phone || phoneNumber}</p>
              </div>
              
              <div className="bg-white/10 border border-white/20 p-2.5 rounded-2xl text-center">
                <Wallet className="w-5 h-5 mx-auto mb-1 text-white" />
                <p className="text-[9px] text-white/70 uppercase font-bold tracking-tight">Active Balance Ledger</p>
                <p className="font-bold text-lg font-mono">₹{(deliveryPartner?.walletBalance || 250) + localWalletBonus}</p>
              </div>
            </div>

            {/* NAVIGATION TABS */}
            <div className="grid grid-cols-4 gap-1 bg-white dark:bg-zinc-900 p-1 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-xs">
              <button
                onClick={() => setPartnerTab('dashboard')}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl font-black text-[9px] sm:text-xs transition-colors cursor-pointer select-none border-0 bg-transparent ${partnerTab === 'dashboard' ? 'bg-orange-500 text-white shadow-md shadow-orange-500/15' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-805'}`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => setPartnerTab('jobs')}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl font-black text-[9px] sm:text-xs transition-colors cursor-pointer select-none border-0 bg-transparent ${partnerTab === 'jobs' ? 'bg-orange-500 text-white shadow-md shadow-orange-500/15' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-805'}`}
              >
                <Clipboard className="w-3.5 h-3.5" />
                <span>Jobs</span>
              </button>
              <button
                onClick={() => setPartnerTab('earnings')}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl font-black text-[9px] sm:text-xs transition-colors cursor-pointer select-none border-0 bg-transparent ${partnerTab === 'earnings' ? 'bg-orange-500 text-white shadow-md shadow-orange-500/15' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-805'}`}
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>Earnings</span>
              </button>
              <button
                onClick={() => setPartnerTab('advanced')}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl font-black text-[9px] sm:text-xs transition-colors cursor-pointer select-none border-0 bg-transparent ${partnerTab === 'advanced' ? 'bg-orange-500 text-white shadow-md shadow-orange-500/15' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-805'}`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Hub 🚀</span>
              </button>
            </div>

            {/* TAB CONTENT: DASHBOARD */}
            {partnerTab === 'dashboard' && <RiderDashboard />}

            {/* TAB CONTENT: JOBS */}
            {partnerTab === 'jobs' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 text-left"
              >
                {/* TOGGLE AVAILABILITY */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border p-4 shadow-sm flex justify-between items-center">
                  <div>
                    <h4 className="font-extrabold text-xs text-zinc-900 dark:text-zinc-50">Active Duty availability Status</h4>
                    <p className="text-[10px] text-zinc-400 mt-0.5">Toggle off duty to prevent route assignments from hot kitchens.</p>
                  </div>
                  <button 
                    onClick={() => updatePartnerAvailability(!deliveryPartner?.isAvailable)}
                    className="cursor-pointer border-0 bg-transparent"
                  >
                    {deliveryPartner?.isAvailable ? (
                      <ToggleRight className="w-12 h-12 text-emerald-500" />
                    ) : (
                      <ToggleLeft className="w-12 h-12 text-zinc-300 dark:text-zinc-600" />
                    )}
                  </button>
                </div>

                {/* PENDING ASSIGNMENTS LIST */}
                <div className="bg-white dark:bg-zinc-900 border rounded-3xl p-4 shadow-sm space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-zinc-800">
                    <h3 className="text-xs font-bold font-mono text-zinc-400 uppercase">Incoming territory Jobs</h3>
                    <span className="text-[10px] font-bold font-mono bg-orange-500/10 text-orange-600 px-2 py-0.5 rounded-full">{pendingJobs.length} Jobs</span>
                  </div>

                  {pendingJobs.length === 0 ? (
                    <div className="text-center py-8 text-xs text-zinc-400 font-bold">
                      No pending package drops registered in this micro-territory.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingJobs.map(order => (
                        <div key={order.id} className="bg-slate-50 dark:bg-zinc-800/20 p-3 rounded-2xl border flex flex-col justify-between">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-[10px] font-bold text-zinc-500 text-left">JOB RECEIPT #{order.id.split('_')[1]}</p>
                              <div className="text-xs font-black text-zinc-800 dark:text-zinc-200 mt-0.5 text-left">
                                <span className="block font-extrabold uppercase text-[9px] text-zinc-400 tracking-wider">Drop Coordinates Pin:</span>
                                {order.address.isManual ? (
                                  <div className="text-[10.5px] text-zinc-650 dark:text-zinc-350 font-medium pl-2 mt-1 space-y-0.5 border-l-2 border-orange-500">
                                    <p className="font-black text-zinc-850 dark:text-zinc-50">Recipient: {order.address.customerName} (+91 {order.address.mobileNumber})</p>
                                    <p>H.No: {order.address.houseNumber}, {order.address.streetName}</p>
                                    <p>Area: {order.address.locality} {order.address.landmark ? `• Landmark: ${order.address.landmark}` : ''}</p>
                                    {order.address.villageTown && <p>Village/Town: {order.address.villageTown}</p>}
                                    <p className="text-[9px] text-zinc-400 font-mono">{order.address.city}, {order.address.pincode}</p>
                                  </div>
                                ) : (
                                  <div className="text-[10.5px] text-zinc-650 dark:text-zinc-350 font-medium pl-2 mt-1 space-y-0.5 border-l-2 border-orange-505">
                                    <p className="font-black text-zinc-850 dark:text-zinc-50">{order.address.flatNo}</p>
                                    <p>{order.address.area} {order.address.landmark ? `• Landmark: ${order.address.landmark}` : ''}</p>
                                    <p className="text-[9px] text-zinc-400 font-mono">{order.address.city}</p>
                                  </div>
                                )}

                                {order.address.deliveryNotes && (
                                  <div className="mt-2.5 p-2 bg-amber-500/10 text-amber-800 dark:text-amber-400 text-[10px] rounded-lg font-black border border-amber-300/30">
                                    📢 RIDER INSTRUCTION: "{order.address.deliveryNotes}"
                                  </div>
                                )}
                              </div>
                              {order.scheduledTime && (
                                <span className="text-[10px] text-orange-500 font-bold block mt-1">⏰ Scheduled: {order.scheduledTime}</span>
                              )}
                            </div>
                            <span className="font-mono font-bold text-xs text-orange-600">payout ₹{order.deliveryFee || 65}</span>
                          </div>

                          <div className="flex gap-2 mt-4 text-[11px]">
                            {order.status === 'accepted' ? (
                              <button 
                                onClick={() => partnerAcceptOrder(order.id)}
                                className="bg-orange-500 text-white font-extrabold flex-1 py-2 rounded-xl text-center cursor-pointer border-0"
                              >
                                Accept drop
                              </button>
                            ) : (
                              <div className="w-full space-y-2">
                                <div className="p-2 bg-slate-100 dark:bg-zinc-800 rounded-xl border border-slate-200/50 dark:border-zinc-700/50 flex items-center justify-between">
                                  <label className="text-[10px] text-zinc-550 font-bold">Add Optional tip received (₹):</label>
                                  <input 
                                    id={`tip_${order.id}`}
                                    type="number"
                                    placeholder="e.g. 25"
                                    className="w-16 bg-white dark:bg-zinc-900 border text-center p-1 rounded font-bold font-mono text-xs text-zinc-850 dark:text-zinc-50"
                                  />
                                </div>
                                <button 
                                  onClick={() => {
                                    const tipInput = document.getElementById(`tip_${order.id}`) as HTMLInputElement;
                                    const customTipValue = tipInput ? parseInt(tipInput.value || '0', 10) : 0;
                                    partnerCompleteDelivery(order.id, customTipValue);
                                  }}
                                  className="w-full bg-emerald-500 text-white font-extrabold py-2.5 rounded-xl text-center cursor-pointer border-0 hover:bg-emerald-650 transition-colors"
                                >
                                  Mark Delivered & Collect Earnings ✓
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* LOGISTICS SYSTEM INTEGRITY HELPLINE */}
                <div className="p-4 bg-zinc-900 text-zinc-50 rounded-2xl flex items-center justify-between border border-zinc-800">
                  <div>
                    <p className="text-xs font-black block text-left">24/7 Logistics Control Desk</p>
                    <p className="text-[9px] text-zinc-400 mt-0.5 block text-left font-mono">Quick-connect directly to WhatsApp control channels.</p>
                  </div>
                  <button 
                    onClick={() => clickToWhatsAppSupport('Logistics help required')}
                    className="text-xs text-orange-500 font-extrabold uppercase hover:underline border-0 bg-transparent cursor-pointer"
                  >
                    Click to Chat
                  </button>
                </div>
              </motion.div>
            )}

            {/* TAB CONTENT: EARNINGS & PAYOUTS DASHBOARD */}
            {partnerTab === 'earnings' && (() => {
              // Date checks for filtering calculations
              const records = deliveryPartner?.earningRecords || [];
              
              // Helper to filter items based on selected tab
              const getFilteredRecords = () => {
                if (earningFilter === 'today') {
                  return records.filter(r => {
                    const d = new Date(r.date);
                    return d.getUTCFullYear() === 2026 && d.getUTCMonth() === 5 && d.getUTCDate() === 22; // June 22, 2026
                  });
                }
                if (earningFilter === 'week') {
                  const start = new Date("2026-06-15T00:00:00Z").getTime();
                  const end = new Date("2026-06-22T23:59:59Z").getTime();
                  return records.filter(r => {
                    const t = new Date(r.date).getTime();
                    return t >= start && t <= end;
                  });
                }
                if (earningFilter === 'month') {
                  return records.filter(r => {
                    const d = new Date(r.date);
                    return d.getUTCFullYear() === 2026 && d.getUTCMonth() === 5; // June 2026
                  });
                }
                if (earningFilter === 'custom') {
                  if (!customStart || !customEnd) return records;
                  const start = new Date(customStart + "T00:00:00Z").getTime();
                  const end = new Date(customEnd + "T23:59:59Z").getTime();
                  return records.filter(r => {
                    const t = new Date(r.date).getTime();
                    return t >= start && t <= end;
                  });
                }
                return records;
              };

              const filteredRecords = getFilteredRecords();

              // Compute Career Stats for top Overview
              const todayRecords = records.filter(r => {
                const d = new Date(r.date);
                return d.getUTCFullYear() === 2026 && d.getUTCMonth() === 5 && d.getUTCDate() === 22;
              });
              const todayEarnedSum = todayRecords.reduce((acc, r) => acc + r.totalEarned, 0);

              const weekStart = new Date("2026-06-15T00:00:00Z").getTime();
              const weekEnd = new Date("2026-06-22T23:59:59Z").getTime();
              const weekRecords = records.filter(r => {
                const t = new Date(r.date).getTime();
                return t >= weekStart && t <= weekEnd;
              });
              const weekEarnedSum = weekRecords.reduce((acc, r) => acc + r.totalEarned, 0);

              const monthRecords = records.filter(r => {
                const d = new Date(r.date);
                return d.getUTCFullYear() === 2026 && d.getUTCMonth() === 5;
              });
              const monthEarnedSum = monthRecords.reduce((acc, r) => acc + r.totalEarned, 0);

              // Compute metrics for CURRENT selected timeframe filter
              const completedDeliveries = filteredRecords.length;
              const deliveryChargesEarned = filteredRecords.reduce((acc, r) => acc + r.deliveryFee, 0);
              const totalTips = filteredRecords.reduce((acc, r) => acc + r.tip, 0);
              
              // Bonus system breakdown sum
              const peakHourBonusSum = filteredRecords.reduce((acc, r) => acc + (r.bonus?.peakHour || 0), 0);
              const festivalBonusSum = filteredRecords.reduce((acc, r) => acc + (r.bonus?.festival || 0), 0);
              const rainBonusSum = filteredRecords.reduce((acc, r) => acc + (r.bonus?.rain || 0), 0);
              const weekendBonusSum = filteredRecords.reduce((acc, r) => acc + (r.bonus?.weekend || 0), 0);
              const referralBonusSum = filteredRecords.reduce((acc, r) => acc + (r.bonus?.referral || 0), 0);
              const totalBonuses = peakHourBonusSum + festivalBonusSum + rainBonusSum + weekendBonusSum + referralBonusSum;
              const grandTimeframeTotal = deliveryChargesEarned + totalBonuses + totalTips;

              // Payout metrics
              const payoutsList = deliveryPartner?.payouts || [];
              const pendingPayoutSum = payoutsList
                .filter(p => p.status === 'Pending')
                .reduce((acc, p) => acc + p.amount, 0);
              const paidPayoutSum = payoutsList
                .filter(p => p.status === 'Paid')
                .reduce((acc, p) => acc + p.amount, 0);

              // Recharts data generator
              const getGraphData = () => {
                if (earningFilter === 'today') {
                  const sortedToday = [...todayRecords].reverse();
                  if (sortedToday.length === 0) {
                    return [
                      { name: '09:00 AM', Earnings: 0 },
                      { name: '01:00 PM', Earnings: 0 },
                      { name: '05:00 PM', Earnings: 0 },
                      { name: '09:00 PM', Earnings: 0 }
                    ];
                  }
                  return sortedToday.map(r => ({
                    name: new Date(r.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                    Earnings: r.totalEarned
                  }));
                }

                // Group by short dates
                const groupObj: { [key: string]: number } = {};
                // Fill default for week to look beautiful
                if (earningFilter === 'week') {
                  const days = ['15 Jun', '16 Jun', '17 Jun', '18 Jun', '19 Jun', '20 Jun', '21 Jun', '22 Jun'];
                  days.forEach(day => { groupObj[day] = 0; });
                }

                const sortedData = [...filteredRecords].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                sortedData.forEach(r => {
                  const label = new Date(r.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
                  groupObj[label] = (groupObj[label] || 0) + r.totalEarned;
                });

                return Object.entries(groupObj).map(([name, val]) => ({
                  name,
                  Earnings: val
                }));
              };

              const chartData = getGraphData();

              // Bar Chart Data for the current week (June 15 - June 22, 2026)
              const getWeeklyDailyEarnings = () => {
                const daysOfWeek = [
                  { short: 'Mon', fullDate: '15 Jun' },
                  { short: 'Tue', fullDate: '16 Jun' },
                  { short: 'Wed', fullDate: '17 Jun' },
                  { short: 'Thu', fullDate: '18 Jun' },
                  { short: 'Fri', fullDate: '19 Jun' },
                  { short: 'Sat', fullDate: '20 Jun' },
                  { short: 'Sun', fullDate: '21 Jun' },
                  { short: 'Mon (22)', fullDate: '22 Jun' }
                ];
                
                const groupObj: { [key: string]: number } = {};
                daysOfWeek.forEach(d => { groupObj[d.fullDate] = 0; });
                
                const start = new Date("2026-06-15T00:00:00Z").getTime();
                const end = new Date("2026-06-22T23:59:59Z").getTime();
                
                const weekRecords = records.filter(r => {
                  const t = new Date(r.date).getTime();
                  return t >= start && t <= end;
                });
                
                weekRecords.forEach(r => {
                  const label = new Date(r.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
                  if (groupObj[label] !== undefined) {
                    groupObj[label] += r.totalEarned;
                  } else {
                    groupObj[label] = r.totalEarned;
                  }
                });
                
                return daysOfWeek.map(d => ({
                  day: d.short,
                  dateLabel: d.fullDate,
                  Earnings: groupObj[d.fullDate] || 0
                }));
              };

              const weeklyBarData = getWeeklyDailyEarnings();

              // Manual payout requesting function
              const handleTriggerPayout = (e: React.FormEvent) => {
                e.preventDefault();
                const amt = parseInt(payoutAmount, 10);
                if (isNaN(amt) || amt <= 0) return;
                const walletLim = deliveryPartner?.walletBalance || 0;
                if (amt > walletLim) {
                  alert(`⚠️ Insufficient active balance! Your current wallet balance is ₹${walletLim}.`);
                  return;
                }
                if (amt < 100) {
                  alert('⚠️ Minimum instant settlement requested amount is ₹100.');
                  return;
                }
                requestPayout(deliveryPartner!.id, amt);
                setPayoutAmount('');
                setPayoutModalOpen(false);
                alert(`✅ Payout of ₹${amt} requested successfully! Pending approval from Super Admin.`);
              };

              // Export CSV / Report Downloading Simulation
              const downloadCSV = () => {
                const header = "Record ID,Order ID,Restaurant,Customer Area,Base Delivery Fee,Peak Hour,Festival,Rain,Weekend,Referral,Tips,Total Earned,Date\n";
                const rows = filteredRecords.map(r => 
                  `"${r.id}","${r.orderId}","${r.restaurantName}","${r.customerArea}",${r.deliveryFee},${r.bonus?.peakHour || 0},${r.bonus?.festival || 0},${r.bonus?.rain || 0},${r.bonus?.weekend || 0},${r.bonus?.referral || 0},${r.tip},${r.totalEarned},"${r.date}"`
                ).join("\n");
                
                const blob = new Blob([header + rows], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.setAttribute('href', url);
                a.setAttribute('download', `Earnings_Report_${earningFilter}_${Date.now()}.csv`);
                a.click();
              };

              return (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4 text-left"
                >
                  
                  {/* OVERVIEW FIVE CORE STATS */}
                  <div className="grid grid-cols-2 gap-2 text-zinc-900 dark:text-white">
                    <div className="bg-white dark:bg-zinc-900 border rounded-2xl p-3 shadow-xs">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                        <IndianRupee className="w-3.5 h-3.5 text-emerald-500" /> Today's Pay
                      </div>
                      <p className="text-xl font-bold font-mono mt-1">₹{todayEarnedSum}</p>
                      <span className="text-[9px] text-zinc-400 font-medium">Auto-calculated</span>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 border rounded-2xl p-3 shadow-xs">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                        <CalendarDays className="w-3.5 h-3.5 text-orange-500" /> Weekly Earnings
                      </div>
                      <p className="text-xl font-bold font-mono mt-1">₹{weekEarnedSum}</p>
                      <span className="text-[9px] text-zinc-400 font-medium font-mono">15 Jun - 22 Jun</span>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 border rounded-2xl p-3 shadow-xs">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                        <TrendingUp className="w-3.5 h-3.5 text-blue-500" /> Monthly Total
                      </div>
                      <p className="text-xl font-bold font-mono mt-1">₹{monthEarnedSum}</p>
                      <span className="text-[9px] text-zinc-400 font-medium">Entire June 2026</span>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 border rounded-2xl p-3 shadow-xs">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                        <Bike className="w-3.5 h-3.5 text-indigo-500" /> Deliveries
                      </div>
                      <p className="text-xl font-bold font-mono mt-1">{records.length} Drops</p>
                      <span className="text-[9px] text-zinc-400 font-medium">All-time record</span>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 border rounded-2xl p-3 shadow-xs col-span-2 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-sans">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" /> Rating & Score
                        </div>
                        <p className="text-sm font-extrabold text-zinc-800 dark:text-zinc-200 mt-0.5 font-sans">Top Tier Platinum Class</p>
                      </div>
                      <div className="bg-amber-400/10 text-amber-600 dark:text-amber-400 border border-amber-300/30 px-3 py-1 rounded-full font-black text-sm font-mono flex items-center gap-1">
                        ★ {deliveryPartner?.rating || '4.9'}
                      </div>
                    </div>
                  </div>

                  {/* TIMEFRAME SEARCH & FILTERS */}
                  <div className="bg-white dark:bg-zinc-900 border rounded-3xl p-4 shadow-sm space-y-3">
                    <h3 className="text-xs font-bold font-mono text-zinc-400 uppercase tracking-widest pl-1">Aggregate Timeframe</h3>
                    <div className="grid grid-cols-4 gap-1.5 bg-slate-50 dark:bg-zinc-950 p-1 rounded-xl border">
                      {(['today', 'week', 'month', 'custom'] as const).map(f => (
                        <button
                          key={f}
                          onClick={() => setEarningFilter(f)}
                          className={`py-1.5 rounded-lg text-center font-bold text-[10px] capitalize select-none cursor-pointer border-0 ${earningFilter === f ? 'bg-white dark:bg-zinc-805 text-zinc-900 dark:text-zinc-50 shadow-xs border' : 'text-zinc-400 hover:text-zinc-650 bg-transparent'}`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>

                    {earningFilter === 'custom' && (
                      <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 dark:bg-zinc-950 rounded-2xl border text-xs">
                        <div>
                          <label className="block text-[8.5px] uppercase font-bold text-zinc-400 mb-0.5">Start Date:</label>
                          <input 
                            type="date"
                            value={customStart}
                            onChange={e => setCustomStart(e.target.value)}
                            className="w-full bg-white dark:bg-zinc-900 border p-1 rounded font-bold font-mono text-zinc-800 dark:text-zinc-100"
                          />
                        </div>
                        <div>
                          <label className="block text-[8.5px] uppercase font-bold text-zinc-400 mb-0.5">End Date:</label>
                          <input 
                            type="date"
                            value={customEnd}
                            onChange={e => setCustomEnd(e.target.value)}
                            className="w-full bg-white dark:bg-zinc-900 border p-1 rounded font-bold font-mono text-zinc-800 dark:text-zinc-100"
                          />
                        </div>
                      </div>
                    )}

                    {/* METRICS DETAILED SUMMARY BREAKDOWN */}
                    <div className="p-3 bg-zinc-50 dark:bg-zinc-955 rounded-2xl border space-y-2 text-xs">
                      <p className="font-extrabold text-[10.5px] text-zinc-800 dark:text-zinc-300 flex justify-between items-center pb-1.5 border-b border-dashed">
                        <span>📊 Statement Period Breakdown</span>
                        <span className="font-mono bg-zinc-900 text-white font-normal text-[9px] px-1.5 py-0.5 rounded uppercase">June 2026</span>
                      </p>
                      
                      <div className="flex justify-between text-zinc-500 font-medium">
                        <span>Completed DeliveriesCount</span>
                        <span className="font-mono font-bold text-zinc-800 dark:text-zinc-100">{completedDeliveries} orders</span>
                      </div>
                      <div className="flex justify-between text-zinc-500 font-medium">
                        <span>Base Delivery Fees Charges</span>
                        <span className="font-mono font-bold text-zinc-800 dark:text-zinc-100">₹{deliveryChargesEarned}</span>
                      </div>
                      <div className="flex justify-between text-zinc-500 font-medium">
                        <span>Promotional Incentive Bonuses</span>
                        <span className="font-mono font-bold text-emerald-500 font-black">+ ₹{totalBonuses}</span>
                      </div>
                      <div className="flex justify-between text-zinc-500 font-medium">
                        <span>Tips Collected</span>
                        <span className="font-mono font-bold text-indigo-505 font-black">+ ₹{totalTips}</span>
                      </div>
                      <div className="flex justify-between pt-1.5 border-t font-black text-sm text-zinc-800 dark:text-zinc-50">
                        <span>Net Accountable Earnings</span>
                        <span className="font-mono text-orange-500">₹{grandTimeframeTotal}</span>
                      </div>

                      <button 
                        onClick={downloadCSV}
                        className="w-full flex items-center justify-center gap-1 bg-white dark:bg-zinc-900 border border-slate-205 py-2 rounded-xl text-[10.5px] font-extrabold text-zinc-700 dark:text-zinc-350 mt-2 hover:bg-slate-50 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" /> Download XLS Earnings Statement
                      </button>
                    </div>
                  </div>

                  {/* VISUAL EARNINGS GRAPH */}
                  <div className="bg-white dark:bg-zinc-900 border rounded-3xl p-4 shadow-sm">
                    <h3 className="text-xs font-bold font-mono text-zinc-400 uppercase tracking-widest pl-1 mb-3">Earnings Trendline</h3>
                    
                    <div className="h-44 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorEarn" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f97316" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="#f97316" stopOpacity={0.0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#888888" opacity={0.15} />
                          <XAxis dataKey="name" stroke="#888888" fontSize={9} tickLine={false} />
                          <YAxis stroke="#888888" fontSize={9} axisLine={false} tickFormatter={v => `₹${v}`} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#18181b', borderRadius: '12px', border: 'none', color: '#f5f5f7', fontFamily: 'monospace', fontSize: '11px' }}
                            formatter={(value: any) => [`₹${value}`, 'Earnings']}
                          />
                          <Area type="monotone" dataKey="Earnings" stroke="#f97316" strokeWidth={2.5} fillOpacity={1} fill="url(#colorEarn)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* VISUAL DAILY EARNINGS BAR CHART */}
                  <div id="rider-daily-earnings-barchart" className="bg-white dark:bg-zinc-900 border rounded-3xl p-4 shadow-sm space-y-3">
                    <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-850 pb-2">
                      <div>
                        <h4 className="text-xs font-bold font-mono text-zinc-400 uppercase tracking-widest pl-1">Daily Earnings (Current Week)</h4>
                        <p className="text-[10px] text-zinc-400 mt-0.5 font-sans">Bar visualization of daily consolidated rider payouts.</p>
                      </div>
                      <span className="text-[10px] bg-orange-500/15 text-orange-600 dark:text-orange-400 px-2.5 py-1 rounded-full font-bold font-mono">15 Jun - 22 Jun</span>
                    </div>

                    <div className="h-44 w-full pt-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={weeklyBarData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#888888" opacity={0.1} />
                          <XAxis dataKey="day" stroke="#888888" fontSize={9} tickLine={false} />
                          <YAxis stroke="#888888" fontSize={9} axisLine={false} tickFormatter={v => `₹${v}`} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#18181b', 
                              borderRadius: '12px', 
                              border: '1px solid #27272a', 
                              color: '#f5f5f7', 
                              fontFamily: 'monospace', 
                              fontSize: '11px' 
                            }}
                            labelFormatter={(label, items) => {
                              const item = items[0]?.payload;
                              return item ? `${item.dateLabel} (2026)` : label;
                            }}
                            formatter={(value: any) => [`₹${value}`, 'Earnings']}
                          />
                          <Bar 
                            dataKey="Earnings" 
                            fill="#f97316" 
                            radius={[6, 6, 0, 0]} 
                            maxBarSize={28}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Quick summaries underneath the weekly bar chart */}
                    <div className="grid grid-cols-3 gap-2 text-center text-[10px] pt-1">
                      <div className="bg-zinc-50 dark:bg-zinc-950 p-2 rounded-xl border border-zinc-100 dark:border-zinc-850">
                        <span className="text-zinc-400 block font-bold">Highest Day</span>
                        <span className="font-mono text-xs font-extrabold text-zinc-850 dark:text-zinc-200 mt-0.5 block">
                          ₹{Math.max(...weeklyBarData.map(d => d.Earnings))}
                        </span>
                      </div>
                      <div className="bg-zinc-50 dark:bg-zinc-950 p-2 rounded-xl border border-zinc-100 dark:border-zinc-850">
                        <span className="text-zinc-400 block font-bold">Weekly Total</span>
                        <span className="font-mono text-xs font-extrabold text-orange-500 mt-0.5 block">
                          ₹{weeklyBarData.reduce((sum, d) => sum + d.Earnings, 0)}
                        </span>
                      </div>
                      <div className="bg-zinc-50 dark:bg-zinc-950 p-2 rounded-xl border border-zinc-100 dark:border-zinc-850">
                        <span className="text-zinc-400 block font-bold">Daily Avg</span>
                        <span className="font-mono text-xs font-extrabold text-zinc-850 dark:text-zinc-200 mt-0.5 block">
                          ₹{Math.round(weeklyBarData.reduce((sum, d) => sum + d.Earnings, 0) / weeklyBarData.length)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* INSTANT PAYOUT STATUS & WITHDRAWALS */}
                  <div className="bg-white dark:bg-zinc-900 border rounded-3xl p-4 shadow-sm space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800 pb-2.5">
                      <div>
                        <h3 className="text-xs font-bold font-mono text-zinc-400 uppercase tracking-widest pl-1">Wallet Settlements</h3>
                        <p className="text-[10px] text-zinc-400 mt-0.5 leading-tight">Approved withdrawals are instant, Standard on Wed.</p>
                      </div>
                      <span className="text-[9.5px] bg-indigo-50 dark:bg-indigo-950 font-black text-indigo-550 border border-indigo-200 dark:border-indigo-800 px-2 py-0.5 rounded">AUTO: Wed, June 24</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-slate-100 dark:border-zinc-800">
                        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-wide">Locked Pending approval</p>
                        <p className="text-lg font-bold font-mono text-zinc-800 dark:text-zinc-200 mt-1">₹{pendingPayoutSum}</p>
                      </div>
                      <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-slate-100 dark:border-zinc-800">
                        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-wide">Direct Paid to Bank</p>
                        <p className="text-lg font-bold font-mono text-emerald-600 mt-1">₹{paidPayoutSum}</p>
                      </div>
                    </div>

                    <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-extrabold text-orange-900 dark:text-orange-400 block text-left">Request Instant Settlement Now</p>
                        <p className="text-[10px] text-zinc-500 mt-1 leading-tight block text-left">Transfer funds directly to your State Bank of India account: <b>****5012</b></p>
                      </div>
                      <button
                        onClick={() => setPayoutModalOpen(true)}
                        className="bg-orange-500 text-white font-extrabold text-[11px] px-4 py-2.5 rounded-xl uppercase tracking-wider select-none cursor-pointer border-0 hover:bg-orange-650 shadow shadow-orange-500/20 whitespace-nowrap"
                      >
                        withdraw ₹{deliveryPartner?.walletBalance || 0}
                      </button>
                    </div>

                    {/* TRANSACTIONS LOGS LIST */}
                    <div className="space-y-2 pt-2 text-left">
                      <p className="text-[10px] font-mono font-bold text-zinc-400 uppercase pl-1">Settlement Logs History</p>
                      
                      {payoutsList.length === 0 ? (
                        <p className="text-xs text-zinc-400 font-bold py-2 text-center bg-slate-50 dark:bg-zinc-950 rounded-xl">No payout transfers initiated yet.</p>
                      ) : (
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                          {payoutsList.map(pay => (
                            <div key={pay.id} className="bg-slate-50 dark:bg-zinc-955 border p-3 rounded-2xl flex items-center justify-between text-xs font-bold shadow-2xs">
                              <div>
                                <p className="text-[10px] font-mono font-black uppercase text-zinc-500 flex items-center gap-1">
                                  <Landmark className="w-3 h-3 text-zinc-400" /> SBI Payout {pay.referenceId ? `• ${pay.referenceId}` : ''}
                                </p>
                                <p className="text-[9px] text-zinc-400 mt-0.5">{new Date(pay.requestDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                              </div>
                              <div className="text-right flex items-center gap-2.5">
                                <div className="text-right">
                                  <p className="font-mono text-zinc-850 dark:text-zinc-100 font-black">₹{pay.amount}</p>
                                  <span className={`text-[9px] font-bold uppercase tracking-wider block ${pay.status === 'Paid' ? 'text-emerald-500' : 'text-amber-500'}`}>{pay.status}</span>
                                </div>
                                <button
                                  onClick={() => {
                                    downloadPayoutInvoice(pay, deliveryPartner?.earningRecords || []);
                                  }}
                                  className="bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-650 dark:text-zinc-300 p-2 rounded-xl cursor-pointer flex items-center justify-center transition"
                                  title="Download Payout Statement PDF"
                                >
                                  <Download className="w-3.5 h-3.5 text-red-500" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ACTIVE BONUS / INCENTIVE TRACKERS BREAKDOWN */}
                  <div className="bg-white dark:bg-zinc-900 border rounded-3xl p-4 shadow-sm space-y-3">
                    <h3 className="text-xs font-bold font-mono text-zinc-400 uppercase tracking-widest pl-1 border-b pb-1.5 flex items-center justify-between">
                      <span>🎉 Incentive Multiplier Targets</span>
                      <span className="text-[10px] bg-orange-500/10 text-orange-600 px-2 py-0.5 rounded-full font-bold">Active</span>
                    </h3>

                    <div className="space-y-2.5 text-xs text-zinc-500 dark:text-zinc-400">
                      
                      <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800 rounded-2xl flex items-center justify-between">
                        <div className="space-y-0.5">
                          <p className="font-black text-zinc-800 dark:text-zinc-200">✨ Peak Hours Lunch/Dinner multipliers</p>
                          <p className="text-[9.5px] text-zinc-400">12:00-14:00, 19:00-21:00 slots</p>
                        </div>
                        <div className="text-right">
                          <span className="font-mono bg-orange-500/10 text-orange-600 px-2 py-0.5 rounded-full font-bold">₹{incentiveSettings.peakHourBonus}/drop</span>
                          <p className="text-[9.5px] font-mono mt-0.5 font-bold text-zinc-520">Sum: ₹{peakHourBonusSum}</p>
                        </div>
                      </div>

                      <div className="p-3 bg-zinc-50 dark:bg-zinc-955 border border-slate-100 dark:border-zinc-800 rounded-2xl flex items-center justify-between">
                        <div className="space-y-0.5">
                          <p className="font-black text-zinc-800 dark:text-zinc-200">☔ Wet Weather Rain Delivery Allowance</p>
                          <p className="text-[9.5px] text-zinc-400">Extra safety allowance for rainy periods</p>
                        </div>
                        <div className="text-right">
                          <span className="font-mono bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded-full font-bold">₹{incentiveSettings.rainBonus}/drop</span>
                          <p className="text-[9.5px] font-mono mt-0.5 font-bold text-zinc-520">Sum: ₹{rainBonusSum}</p>
                        </div>
                      </div>

                      <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800 rounded-2xl flex items-center justify-between">
                        <div className="space-y-0.5">
                          <p className="font-black text-zinc-800 dark:text-zinc-200">🎪 Local Festival Celebration Bonus</p>
                          <p className="text-[9.5px] text-zinc-400">Ganesh, Diwali, Sankranti peaks</p>
                        </div>
                        <div className="text-right">
                          <span className="font-mono bg-purple-500/10 text-purple-600 px-2 py-0.5 rounded-full font-bold">₹{incentiveSettings.festivalBonus}/drop</span>
                          <p className="text-[9.5px] font-mono mt-0.5 font-bold text-zinc-520">Sum: ₹{festivalBonusSum}</p>
                        </div>
                      </div>

                      <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-855 rounded-2xl flex items-center justify-between">
                        <div className="space-y-0.5">
                          <p className="font-black text-zinc-800 dark:text-zinc-200">📅 Hot Weekend Saturday-Sunday allowances</p>
                          <p className="text-[9.5px] text-zinc-400">Full day weekend drops support</p>
                        </div>
                        <div className="text-right">
                          <span className="font-mono bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full font-bold">₹{incentiveSettings.weekendBonus}/drop</span>
                          <p className="text-[9.5px] font-mono mt-0.5 font-bold text-zinc-520">Sum: ₹{weekendBonusSum}</p>
                        </div>
                      </div>

                      <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800 rounded-2xl flex items-center justify-between">
                        <div className="space-y-0.5">
                          <p className="font-black text-zinc-800 dark:text-zinc-200">🤝 Peer-to-Peer Agent Onboarding Referral</p>
                          <p className="text-[9.5px] text-zinc-400">When referred accounts unlock 10 shipments</p>
                        </div>
                        <div className="text-right">
                          <span className="font-mono bg-indigo-500/10 text-indigo-600 px-2 py-0.5 rounded-full font-bold">₹{incentiveSettings.referralBonus}/rider</span>
                          <p className="text-[9.5px] font-mono mt-0.5 font-bold text-zinc-520">Sum: ₹{referralBonusSum}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ORDER WISE SHIPPED SHIPMENTS DETAILED LIST */}
                  <div className="bg-white dark:bg-zinc-900 border rounded-3xl p-4 shadow-sm space-y-3 font-sans">
                    <h3 className="text-xs font-bold font-mono text-zinc-400 uppercase tracking-widest pl-1 pb-1.5 border-b">Historical Order-wise Ledger ({filteredRecords.length})</h3>

                    {filteredRecords.length === 0 ? (
                      <p className="text-xs text-zinc-400 font-extrabold py-6 text-center bg-slate-50 dark:bg-zinc-950 rounded-2xl">No orders dispatched in selected period.</p>
                    ) : (
                      <div className="space-y-3">
                        {filteredRecords.map(rec => {
                          const orderRef = rec.orderId.split('_')[1] || rec.orderId.slice(-5);
                          const formattedTime = new Date(rec.date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          });

                          return (
                            <div key={rec.id} className="bg-slate-50 dark:bg-zinc-950 p-3.5 rounded-2xl border text-xs font-medium space-y-2">
                              <div className="flex justify-between items-start">
                                <div className="text-left">
                                  <p className="font-black text-zinc-850 dark:text-zinc-150 text-[12px]">{rec.restaurantName}</p>
                                  <p className="text-[10px] text-zinc-400 mt-0.5 mb-1 flex items-center gap-1 font-mono">
                                    <Clock className="w-3 h-3 text-zinc-400" /> {formattedTime} • ID: #{orderRef}
                                  </p>
                                  <p className="text-[10px] text-zinc-550 font-bold flex items-center gap-1 font-sans">
                                    <MapPin className="w-3 h-3 text-red-500" /> Area: {rec.customerArea}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-mono text-zinc-850 dark:text-white font-black text-sm">₹{rec.totalEarned}</p>
                                  <span className="text-[9px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">Approved</span>
                                </div>
                              </div>

                              <div className="pt-2 border-t border-dashed border-slate-200 dark:border-zinc-800 flex justify-between items-center text-[10px]">
                                <button 
                                  onClick={() => setShowInvoiceDetails(showInvoiceDetails === rec.id ? null : rec.id)}
                                  className="text-orange-500 text-[10px] font-black uppercase flex items-center gap-0.5 border-0 bg-transparent cursor-pointer"
                                >
                                  {showInvoiceDetails === rec.id ? 'Hide details ▲' : 'View structure ▼'}
                                </button>
                                <span className="font-mono text-zinc-400 text-[9.5px]">Fare: ₹{rec.deliveryFee} {rec.tip > 0 ? `• Tip: ₹${rec.tip}` : ''}</span>
                              </div>

                              {showInvoiceDetails === rec.id && (
                                <motion.div 
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  className="pt-2.5 space-y-1 bg-white dark:bg-zinc-900 border p-2.5 rounded-xl text-[9.5px]"
                                >
                                  <p className="font-bold uppercase tracking-widest text-[8.5px] text-zinc-400 border-b pb-1 text-left">Earnings Audit Details:</p>
                                  <div className="flex justify-between text-zinc-500">
                                    <span>Base fare payout allowance:</span>
                                    <span className="font-mono text-zinc-850 dark:text-zinc-100">₹{rec.deliveryFee}</span>
                                  </div>
                                  <div className="flex justify-between text-zinc-500">
                                    <span>Client-side tip added:</span>
                                    <span className="font-mono text-zinc-850 dark:text-zinc-100">₹{rec.tip}</span>
                                  </div>
                                  <div className="flex justify-between text-zinc-500">
                                    <span>Peak hour bonus segment:</span>
                                    <span className="font-mono text-zinc-850 dark:text-zinc-100 font-bold">₹{rec.bonus?.peakHour || 0}</span>
                                  </div>
                                  <div className="flex justify-between text-zinc-500">
                                    <span>Rain storm incentive multiplier:</span>
                                    <span className="font-mono text-zinc-850 dark:text-zinc-100 font-bold">₹{rec.bonus?.rain || 0}</span>
                                  </div>
                                  <div className="flex justify-between text-zinc-500">
                                    <span>Weekend hot dispatch bonus:</span>
                                    <span className="font-mono text-zinc-850 dark:text-zinc-100 font-bold">₹{rec.bonus?.weekend || 0}</span>
                                  </div>
                                  <div className="flex justify-between text-zinc-500">
                                    <span>National / regional festival index:</span>
                                    <span className="font-mono text-zinc-850 dark:text-zinc-100 font-bold">₹{rec.bonus?.festival || 0}</span>
                                  </div>
                                  <div className="flex justify-between text-[9.5px] pt-1.5 border-t font-black text-orange-500">
                                    <span>Reconciled Payout Received:</span>
                                    <span className="font-mono">₹{rec.totalEarned}</span>
                                  </div>
                                </motion.div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* POPUP WITHDRAWAL MODAL DIALOG */}
                  <AnimatePresence>
                    {payoutModalOpen && (
                      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                        <motion.div 
                          initial={{ scale: 0.95, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.95, opacity: 0 }}
                          className="bg-white dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl relative text-xs"
                        >
                          <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-50 tracking-tight text-left">Express Bank Settlement</h3>
                          <p className="text-[10px] text-zinc-400 mt-1 text-left">Instant payouts process in under 120 seconds to your bank.</p>
                          
                          <div className="p-3.5 bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-850 rounded-2xl mt-4 space-y-1 font-bold text-left">
                            <div className="flex justify-between text-zinc-500">
                              <span>Settlement Bank:</span>
                              <span className="text-zinc-850 dark:text-zinc-50 font-black">State Bank of India</span>
                            </div>
                            <div className="flex justify-between text-zinc-505 border-b pb-1.5 mb-1.5 border-dashed border-slate-200 dark:border-zinc-800">
                              <span>Account Number:</span>
                              <span className="text-zinc-800 dark:text-zinc-50 font-mono font-black">****5012</span>
                            </div>
                            <div className="flex justify-between text-zinc-805 dark:text-white text-[12px] font-black">
                              <span>Withdrawable Wallet Balance:</span>
                              <span className="text-orange-500 font-mono">₹{deliveryPartner?.walletBalance || 0}</span>
                            </div>
                          </div>

                          <form onSubmit={handleTriggerPayout} className="mt-4 space-y-3">
                            <div className="text-left">
                              <label className="block text-[8.5px] uppercase font-mono font-bold text-zinc-400 mb-1">Settlement Amount (INR):</label>
                              <input 
                                type="number"
                                required
                                placeholder="Enter amount to withdraw"
                                value={payoutAmount}
                                onChange={e => setPayoutAmount(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 p-2.5 rounded-xl border font-bold font-mono text-sm uppercase focus:outline-none"
                              />
                              <span className="text-[9px] text-zinc-400 block mt-1">Minimum withdrawal limit: ₹100.</span>
                            </div>

                            <div className="flex gap-2">
                              <button 
                                type="button"
                                onClick={() => {
                                  setPayoutModalOpen(false);
                                  setPayoutAmount('');
                                }}
                                className="flex-1 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 py-2.5 rounded-xl font-extrabold uppercase select-none cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button 
                                type="submit"
                                className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold py-2.5 rounded-xl border-y-0 border-x-0 uppercase select-none cursor-pointer hover:opacity-90"
                              >
                                Initiate Transfer
                              </button>
                            </div>
                          </form>
                        </motion.div>
                      </div>
                    )}
                  </AnimatePresence>

                </motion.div>
              );
            })()}

            {/* TAB CONTENT: ADVANCED RIDER HUB */}
            {partnerTab === 'advanced' && (() => {
               // Calculate total gross from selected records
               const records = deliveryPartner?.earningRecords || [];
               const grossEarnings = records.reduce((acc, r) => acc + r.totalEarned, 0);
               const totalExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);
               const netTakeHome = grossEarnings - totalExpenses;
               const profitMargin = grossEarnings > 0 ? Math.round((netTakeHome / grossEarnings) * 100) : 100;

               // Handle adding custom expense
               const handleAddExpense = (e: React.FormEvent) => {
                 e.preventDefault();
                 const amt = parseInt(newExpAmount, 10);
                 if (isNaN(amt) || amt <= 0) return;
                 const newExp: ExpenseLog = {
                   id: `exp_${Date.now()}`,
                   date: new Date().toISOString().split('T')[0],
                   type: newExpType,
                   amount: amt,
                   notes: newExpNotes.trim() || `${newExpType} Expense`
                 };
                 setExpenses(prev => [newExp, ...prev]);
                 setNewExpAmount('');
                 setNewExpNotes('');
                 alert(`✅ Logged ₹${amt} under ${newExpType} successfully!`);
               };

               // Delete expense log
               const handleDeleteExpense = (id: string) => {
                 setExpenses(prev => prev.filter(e => e.id !== id));
               };

               // Handle safety declaration submission
               const handleSafetySubmit = (e: React.FormEvent) => {
                 e.preventDefault();
                 if (!hasHelmet || !hasReflectiveVest || !hasTireCheck) {
                   alert('⚠️ Please acknowledge and check off all safety requirements first!');
                   return;
                 }
                 setSafetySubmitted(true);
                 setLocalWalletBonus(prev => prev + 25);
                 alert('🛡️ Safety check verified! Daily Safety Bonus of ₹25 has been credited to your active wallet balance. Drive safely!');
               };

               // Handle zone subscription
               const handleSubscribeZone = (zoneId: string, zoneName: string) => {
                 setActiveZoneId(zoneId);
                 setZoneAlertMessage(`🎯 Routing configured to high-demand hotspot: ${zoneName}. Surge multiplier 1.5x active. Navigation simulation active.`);
                 setTimeout(() => {
                   setZoneAlertMessage(null);
                 }, 6000);
               };

               // Local hotspots
               const demandHotspots = [
                 { id: 'zone_1', name: 'Chirala Bypass Cross Roads', multiplier: '1.5x Surge 🔥', deliveriesActive: 18, distance: '1.2 km', status: 'Very High Demand' },
                 { id: 'zone_2', name: 'Nuvvo Town Center Gate', multiplier: '1.3x Surge ⚡', deliveriesActive: 12, distance: '0.8 km', status: 'High Demand' },
                 { id: 'zone_3', name: 'Perala Bypass Cross', multiplier: '1.2x Surge 📍', deliveriesActive: 8, distance: '2.5 km', status: 'Moderate Demand' },
                 { id: 'zone_4', name: 'Kothapeta Industrial Gate', multiplier: '1.1x Surge', deliveriesActive: 5, distance: '4.1 km', status: 'Normal' }
               ];

               // Leaderboard mock
               const localRiderLeaderboard = [
                 { rank: 1, name: "Prasad Rao", orders: 124, earnings: 14200, rating: 4.95, isSelf: false },
                 { rank: 2, name: "Gopi Krishna", orders: 110, earnings: 12150, rating: 4.92, isSelf: false },
                 { rank: 3, name: deliveryPartner?.name || "Srinivas Rao (You)", orders: 98, earnings: 10450, rating: 4.90, isSelf: true },
                 { rank: 4, name: "Anil Kumar", orders: 92, earnings: 9800, rating: 4.88, isSelf: false },
                 { rank: 5, name: "K. Venkatesh", orders: 85, earnings: 8900, rating: 4.85, isSelf: false },
               ];

               return (
                 <motion.div 
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="space-y-4 text-left font-sans"
                 >
                   {/* DYNAMIC PERK AND MILESTONE PROGRESION */}
                   <div className="bg-white dark:bg-zinc-900 border rounded-3xl p-4 shadow-sm space-y-3">
                     <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800 pb-2">
                       <div className="flex items-center gap-2">
                         <div className="p-1.5 bg-amber-500/10 text-amber-500 rounded-xl">
                           <Award className="w-5 h-5" />
                         </div>
                         <div>
                           <h4 className="text-xs font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-wider">Rider Tier Status</h4>
                           <p className="text-[9px] text-zinc-400">Your current operational class rank</p>
                         </div>
                       </div>
                       <span className="text-[10px] bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2.5 py-1 rounded-full font-black tracking-wide uppercase">
                         👑 GOLD PRO CLASS
                       </span>
                     </div>

                     <div className="space-y-2 pt-1 text-xs">
                       <div className="flex justify-between font-bold text-zinc-700 dark:text-zinc-300">
                         <span>Next Rank: Platinum Star Rider</span>
                         <span className="font-mono text-orange-500">18 / 25 Deliveries</span>
                       </div>
                       <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                         <div className="bg-gradient-to-r from-orange-500 to-amber-500 h-full rounded-full" style={{ width: '72%' }} />
                       </div>
                       <div className="p-3 bg-amber-500/5 border border-amber-300/20 rounded-2xl flex items-center justify-between mt-2 text-[11px] leading-snug">
                         <p className="text-zinc-600 dark:text-zinc-400 text-left">
                           🎯 <b>Exclusive Gold Benefit:</b> Enjoy a guaranteed <b>1.15x Multiplier</b> on all base delivery fares and priority allotment in surge territories!
                         </p>
                       </div>
                     </div>
                   </div>

                   {/* ACTIVE HEALTH & SAFETY CHECK-IN */}
                   <div className="bg-white dark:bg-zinc-900 border rounded-3xl p-4 shadow-sm space-y-3">
                     <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800 pb-2.5">
                       <div className="flex items-center gap-2">
                         <div className="p-1.5 bg-emerald-500/10 text-emerald-600 rounded-xl">
                           <ShieldCheck className="w-5 h-5" />
                         </div>
                         <div>
                           <h4 className="text-xs font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-wider">Rider Safety Declaration</h4>
                           <p className="text-[9px] text-zinc-400 font-sans">Mandatory daily compliance verification check</p>
                         </div>
                       </div>
                       {safetySubmitted ? (
                         <span className="text-[9px] font-black uppercase bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-full flex items-center gap-1">
                           <CheckCircle className="w-3.5 h-3.5" /> Checked In
                         </span>
                       ) : (
                         <span className="text-[9.5px] font-black uppercase bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 px-2 py-1 rounded-full animate-pulse">
                           Pending Self-Test
                         </span>
                       )}
                     </div>

                     {safetySubmitted ? (
                       <div className="p-3.5 bg-emerald-500/5 border border-emerald-300/20 text-emerald-850 dark:text-emerald-400 rounded-2xl text-[11px] space-y-2 text-left">
                         <p className="font-extrabold flex items-center gap-1">
                           🛡️ Safety & Health declaration is complete for today!
                         </p>
                         <p className="text-zinc-500 text-[10.5px]">
                           You have unlocked your <b>₹25 Daily Safety Allowance Bonus</b>. Thank you for making Chirala roads safer for everyone. Remember to speed limit below 40 km/h.
                         </p>
                       </div>
                     ) : (
                       <form onSubmit={handleSafetySubmit} className="space-y-3 text-xs">
                         <p className="text-[10.5px] text-zinc-400 leading-normal">
                           Acknowledge today's vehicle health and gear conditions to activate active rider shifts and claim ₹25 safe rider bonus:
                         </p>

                         <div className="space-y-2">
                           <label className="flex items-center gap-2.5 p-2 bg-slate-50 dark:bg-zinc-950 rounded-xl border cursor-pointer hover:bg-slate-100/50 transition">
                             <input 
                               type="checkbox"
                               checked={hasHelmet}
                               onChange={e => setHasHelmet(e.target.checked)}
                               className="w-4 h-4 rounded text-orange-555 bg-zinc-800 border-zinc-700 focus:ring-orange-550 focus:ring-offset-zinc-900 focus:ring-2"
                             />
                             <div className="text-left leading-tight">
                               <p className="font-black text-zinc-800 dark:text-zinc-200">I am wearing a certified Helmet 🪖</p>
                               <span className="text-[9px] text-zinc-400">Helmet strap is securely locked and snug.</span>
                             </div>
                           </label>

                           <label className="flex items-center gap-2.5 p-2 bg-slate-50 dark:bg-zinc-950 rounded-xl border cursor-pointer hover:bg-slate-100/50 transition">
                             <input 
                               type="checkbox"
                               checked={hasReflectiveVest}
                               onChange={e => setHasReflectiveVest(e.target.checked)}
                               className="w-4 h-4 rounded text-orange-555 bg-zinc-800 border-zinc-700 focus:ring-orange-550 focus:ring-offset-zinc-900 focus:ring-2"
                             />
                             <div className="text-left leading-tight">
                               <p className="font-black text-zinc-800 dark:text-zinc-200">Reflective vest is on 🦺</p>
                               <span className="text-[9px] text-zinc-400">High-visibility safety gears are visible at night.</span>
                             </div>
                           </label>

                           <label className="flex items-center gap-2.5 p-2 bg-slate-50 dark:bg-zinc-950 rounded-xl border cursor-pointer hover:bg-slate-100/50 transition">
                             <input 
                               type="checkbox"
                               checked={hasTireCheck}
                               onChange={e => setHasTireCheck(e.target.checked)}
                               className="w-4 h-4 rounded text-orange-555 bg-zinc-800 border-zinc-700 focus:ring-orange-550 focus:ring-offset-zinc-900 focus:ring-2"
                             />
                             <div className="text-left leading-tight">
                               <p className="font-black text-zinc-800 dark:text-zinc-200">Vehicle brakes, tires & lights are functional 🏍️</p>
                               <span className="text-[9px] text-zinc-400">Tire pressure is adequate and headlamps/indicators are bright.</span>
                             </div>
                           </label>
                         </div>

                         <div className="flex items-center gap-2 p-2 bg-slate-100/60 dark:bg-zinc-850/60 rounded-xl border text-xs">
                           <span className="text-zinc-400 font-extrabold uppercase text-[8.5px] shrink-0 font-mono">Body Temp (F):</span>
                           <input 
                             type="text"
                             value={tempCheck}
                             onChange={e => setTempCheck(e.target.value)}
                             className="w-20 bg-white dark:bg-zinc-900 border text-center p-1 rounded font-bold font-mono text-zinc-800 dark:text-zinc-100 text-[10.5px]"
                           />
                           <span className="text-[10px] text-zinc-400">Normal Range: 97.5°F - 98.9°F</span>
                         </div>

                         <button
                           type="submit"
                           className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-extrabold py-2.5 rounded-xl uppercase tracking-wider text-[10.5px] cursor-pointer hover:opacity-90 transition border-0 active:scale-98"
                         >
                           Verify Safety Gear & Claim ₹25 Bonus
                         </button>
                       </form>
                     )}
                   </div>

                   {/* INTERACTIVE FUEL & MAINTENANCE EXPENSE LOGGER */}
                   <div className="bg-white dark:bg-zinc-900 border rounded-3xl p-4 shadow-sm space-y-3">
                     <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800 pb-2">
                       <div className="flex items-center gap-2">
                         <div className="p-1.5 bg-red-500/10 text-red-500 rounded-xl">
                           <TrendingUp className="w-5 h-5" />
                         </div>
                         <div>
                           <h4 className="text-xs font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-wider">Expense Tracker & Net Margin</h4>
                           <p className="text-[9px] text-zinc-400 font-sans">Track fuel, servicing and log net operational payouts</p>
                         </div>
                       </div>
                       <span className="text-[10px] bg-red-500/10 text-red-600 px-2 py-0.5 rounded-full font-bold font-mono">Real-time Margin</span>
                     </div>

                     {/* Visual Net Payout comparison card */}
                     <div className="grid grid-cols-3 gap-2 text-center pt-1">
                       <div className="bg-zinc-50 dark:bg-zinc-950 p-2.5 rounded-2xl border">
                         <span className="text-[8.5px] text-zinc-400 block font-bold uppercase tracking-wider">Gross Pay</span>
                         <span className="font-mono text-sm font-black text-zinc-850 dark:text-zinc-100 mt-0.5 block">
                           ₹{grossEarnings}
                         </span>
                       </div>
                       <div className="bg-zinc-50 dark:bg-zinc-950 p-2.5 rounded-2xl border">
                         <span className="text-[8.5px] text-zinc-400 block font-bold uppercase tracking-wider">Expenses</span>
                         <span className="font-mono text-sm font-black text-red-500 mt-0.5 block">
                           - ₹{totalExpenses}
                         </span>
                       </div>
                       <div className="bg-emerald-500/5 dark:bg-emerald-950/10 p-2.5 rounded-2xl border border-emerald-500/10">
                         <span className="text-[8.5px] text-emerald-600 dark:text-emerald-400 block font-bold uppercase tracking-wider">Net Profit</span>
                         <span className="font-mono text-sm font-black text-emerald-500 mt-0.5 block">
                           ₹{netTakeHome}
                         </span>
                       </div>
                     </div>

                     {/* Progress bar ratio of take home */}
                     <div className="p-3 bg-slate-50 dark:bg-zinc-950 rounded-2xl border text-xs">
                       <div className="flex justify-between font-bold text-zinc-700 dark:text-zinc-400 mb-1.5">
                         <span>Take-Home Profit Efficiency Margin:</span>
                         <span className="text-emerald-500">{profitMargin}% efficiency</span>
                       </div>
                       <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                         <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${profitMargin}%` }} />
                       </div>
                       <p className="text-[9px] text-zinc-400 mt-1.5">
                         💡 <b>Operational Tip:</b> Keep your expenses below 20% of your gross earnings to preserve prime carrier tax write-offs!
                       </p>
                     </div>

                     {/* Add expense form */}
                     <form onSubmit={handleAddExpense} className="p-3.5 bg-slate-50 dark:bg-zinc-950 rounded-2xl border space-y-2 text-xs">
                       <p className="font-black text-[10.5px] text-zinc-800 dark:text-zinc-200">Log Vehicle / Fuel Expense:</p>
                       <div className="grid grid-cols-2 gap-2">
                         <div>
                           <label className="block text-[8px] uppercase font-bold text-zinc-400 mb-0.5">Category</label>
                           <select 
                             value={newExpType}
                             onChange={e => setNewExpType(e.target.value as any)}
                             className="w-full bg-white dark:bg-zinc-900 border p-2 rounded-xl text-zinc-800 dark:text-zinc-100 font-bold"
                           >
                             <option value="Fuel">Fuel (Petrol)</option>
                             <option value="Maintenance">Maintenance / Lube</option>
                             <option value="Other">Other Miscellaneous</option>
                           </select>
                         </div>
                         <div>
                           <label className="block text-[8px] uppercase font-bold text-zinc-400 mb-0.5">Cost Amount (₹)</label>
                           <input 
                             type="number"
                             required
                             placeholder="e.g. 150"
                             value={newExpAmount}
                             onChange={e => setNewExpAmount(e.target.value)}
                             className="w-full bg-white dark:bg-zinc-900 border p-1.5 rounded-xl font-bold font-mono text-zinc-800 dark:text-zinc-100 text-xs"
                           />
                         </div>
                       </div>
                       <div>
                         <label className="block text-[8px] uppercase font-bold text-zinc-400 mb-0.5">Expense Notes & Location</label>
                         <input 
                           type="text"
                           placeholder="e.g. IndianOil bypass, full-tank service"
                           value={newExpNotes}
                           onChange={e => setNewExpNotes(e.target.value)}
                           className="w-full bg-white dark:bg-zinc-900 border p-1.5 rounded-xl font-bold text-zinc-800 dark:text-zinc-100 text-xs"
                         />
                       </div>
                       <button 
                         type="submit"
                         className="w-full bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white font-black py-2 rounded-xl text-[10.5px] uppercase tracking-wider border-0 cursor-pointer"
                       >
                         Log Expense Item
                       </button>
                     </form>

                     {/* Expense log table list */}
                     <div className="space-y-2 text-xs">
                       <p className="font-mono text-[9px] font-bold text-zinc-400 uppercase tracking-widest pl-1 pt-1">Recent Expenses Ledger</p>
                       {expenses.length === 0 ? (
                         <p className="text-[10px] text-zinc-400 text-center py-2 bg-slate-50 dark:bg-zinc-950 rounded-xl">No expenses logged yet.</p>
                       ) : (
                         <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                           {expenses.map(exp => (
                             <div key={exp.id} className="p-2.5 bg-slate-50 dark:bg-zinc-955 border rounded-xl flex justify-between items-center">
                               <div>
                                 <div className="flex items-center gap-1.5">
                                   <span className={`text-[8.5px] font-black uppercase px-1.5 py-0.5 rounded-md ${
                                     exp.type === 'Fuel' ? 'bg-amber-500/10 text-amber-600' : 'bg-red-500/10 text-red-600'
                                   }`}>
                                     {exp.type}
                                   </span>
                                   <span className="text-[10.5px] font-bold text-zinc-800 dark:text-zinc-200">{exp.notes}</span>
                                 </div>
                                 <span className="text-[9px] text-zinc-400 mt-0.5 block">{exp.date}</span>
                               </div>
                               <div className="flex items-center gap-2">
                                 <span className="font-mono font-black text-red-500 text-[11px]">- ₹{exp.amount}</span>
                                 <button
                                   onClick={() => handleDeleteExpense(exp.id)}
                                   className="p-1 text-zinc-400 hover:text-red-500 bg-transparent border-0 cursor-pointer"
                                   title="Delete expense"
                                 >
                                   <Trash className="w-3.5 h-3.5" />
                                 </button>
                               </div>
                             </div>
                           ))}
                         </div>
                       )}
                     </div>
                   </div>

                   {/* TERRITORY DEMAND HOTSPOTS AND SURGE ALERTS */}
                   <div className="bg-white dark:bg-zinc-900 border rounded-3xl p-4 shadow-sm space-y-3">
                     <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800 pb-2">
                       <div className="flex items-center gap-2">
                         <div className="p-1.5 bg-orange-500/10 text-orange-500 rounded-xl">
                           <Compass className="w-5 h-5" />
                         </div>
                         <div>
                           <h4 className="text-xs font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-wider">Demand Hotspots & Surge Alert Map</h4>
                           <p className="text-[9px] text-zinc-400 font-sans">High order density territories in Chirala right now</p>
                         </div>
                       </div>
                     </div>

                     {zoneAlertMessage && (
                       <motion.div 
                         initial={{ opacity: 0, scale: 0.95 }}
                         animate={{ opacity: 1, scale: 1 }}
                         className="p-3 bg-orange-500 text-white rounded-2xl text-[10.5px] font-bold text-left shadow-lg flex items-start gap-2"
                       >
                         <ShieldAlert className="w-4 h-4 text-white shrink-0 animate-bounce mt-0.5" />
                         <p>{zoneAlertMessage}</p>
                       </motion.div>
                     )}

                     <p className="text-[10.5px] text-zinc-400 leading-normal text-left">
                       Riders registered to active hotspots enjoy priority allocation on double-route orders. Select a zone to activate auto-payout multipliers:
                     </p>

                     <div className="grid grid-cols-1 gap-2">
                       {demandHotspots.map(zone => {
                         const isActive = activeZoneId === zone.id;
                         return (
                           <div 
                             key={zone.id}
                             className={`p-3 rounded-2xl border transition flex items-center justify-between cursor-pointer ${
                               isActive 
                                 ? 'border-2 border-orange-500 bg-orange-50/5 dark:bg-orange-950/10 shadow-sm' 
                                 : 'bg-slate-50 dark:bg-zinc-950 hover:bg-slate-100/50'
                             }`}
                             onClick={() => handleSubscribeZone(zone.id, zone.name)}
                           >
                             <div className="text-left leading-tight">
                               <div className="flex items-center gap-1.5">
                                 <h5 className="font-extrabold text-xs text-zinc-800 dark:text-zinc-200">{zone.name}</h5>
                                 <span className="text-[9.5px] font-mono font-extrabold text-orange-550">{zone.multiplier}</span>
                               </div>
                               <p className="text-[9px] text-zinc-400 mt-1">
                                 🚦 Status: <span className="text-zinc-650 dark:text-zinc-350 font-bold">{zone.status}</span> • {zone.deliveriesActive} active shipments • {zone.distance} away
                               </p>
                             </div>

                             <button
                               className={`px-3 py-1.5 rounded-xl font-black text-[9.5px] uppercase tracking-wider select-none border-0 ${
                                 isActive 
                                   ? 'bg-orange-500 text-white' 
                                   : 'bg-zinc-250 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-700'
                               }`}
                             >
                               {isActive ? 'Routing Active' : 'Set Route'}
                             </button>
                           </div>
                         );
                       })}
                     </div>
                   </div>

                   {/* TERRITORY RIDER LEADERBOARD FOR CAMARADERIE */}
                   <div className="bg-white dark:bg-zinc-900 border rounded-3xl p-4 shadow-sm space-y-3">
                     <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800 pb-2">
                       <div className="flex items-center gap-2">
                         <div className="p-1.5 bg-indigo-500/10 text-indigo-500 rounded-xl">
                           <TrendingUp className="w-5 h-5" />
                         </div>
                         <div>
                           <h4 className="text-xs font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-wider">Logistics Leaderboard (June 2026)</h4>
                           <p className="text-[9px] text-zinc-400 font-sans">Top performing delivery specialists in the local territory</p>
                         </div>
                       </div>
                       <span className="text-[10px] bg-indigo-500/10 text-indigo-600 px-2 py-0.5 rounded-full font-bold">₹1,500 Prize</span>
                     </div>

                     <p className="text-[10.5px] text-zinc-400 leading-normal text-left">
                       Compete in the weekly milestone log. The top 3 riders with the highest shipments completed and best star ratings win cash bonuses on Monday!
                     </p>

                     <div className="space-y-1.5">
                       {localRiderLeaderboard.map((rider, index) => (
                         <div 
                           key={index}
                           className={`p-2.5 rounded-2xl border flex items-center justify-between text-xs ${
                             rider.isSelf 
                               ? 'bg-orange-500/10 border-orange-500/50 shadow-xs' 
                               : 'bg-slate-50 dark:bg-zinc-950 border-slate-100 dark:border-zinc-900/40'
                           }`}
                         >
                           <div className="flex items-center gap-3">
                             <span className={`w-5.5 h-5.5 rounded-full flex items-center justify-center font-black font-mono text-[10.5px] ${
                               index === 0 
                                 ? 'bg-amber-400 text-amber-950' 
                                 : index === 1 
                                   ? 'bg-slate-300 text-slate-900' 
                                   : index === 2 
                                     ? 'bg-orange-500 text-white' 
                                     : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'
                             }`}>
                               {rider.rank}
                             </span>
                             <div className="text-left">
                               <p className="font-extrabold text-zinc-850 dark:text-zinc-150 flex items-center gap-1">
                                 {rider.name} {rider.isSelf && <span className="text-[8px] bg-orange-500 text-white px-1 py-0.2 rounded font-sans">YOU</span>}
                               </p>
                               <span className="text-[9.5px] text-zinc-400 font-mono">Completed: {rider.orders} drops • ★ {rider.rating.toFixed(2)}</span>
                             </div>
                           </div>

                           <div className="text-right">
                             <p className="font-mono font-black text-zinc-800 dark:text-zinc-200">₹{rider.earnings.toLocaleString('en-IN')}</p>
                             <span className="text-[9px] text-zinc-400 font-mono">Gross Pay</span>
                           </div>
                         </div>
                       ))}
                     </div>
                   </div>

                 </motion.div>
               );
            })()}

          </div>
        )}

      </div>
    </div>
  );
}
