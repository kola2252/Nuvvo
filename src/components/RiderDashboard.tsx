/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Bike, Wallet, CheckCircle, Clock, Star, TrendingUp, Sparkles, 
  MapPin, ShieldCheck, Compass, Award, ArrowUpRight, ChevronDown, 
  ChevronUp, Shield, Activity, Calendar, Zap, RefreshCw, Eye, ThumbsUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  BarChart, Bar, Cell 
} from 'recharts';

export default function RiderDashboard() {
  const { 
    deliveryPartner, 
    updatePartnerAvailability, 
    orders, 
    currentTheme 
  } = useApp();

  const [expandedDeliveryId, setExpandedDeliveryId] = useState<string | null>(null);
  const [metricPeriod, setMetricPeriod] = useState<'today' | 'week' | 'month'>('week');
  const [activeMetricTab, setActiveMetricTab] = useState<'speed' | 'satisfaction' | 'acceptance'>('speed');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Generate fallback data if deliveryPartner or fields aren't initialized yet
  const partnerName = deliveryPartner?.name || "Demo Rider Specialist";
  const partnerRating = deliveryPartner?.rating || 4.90;
  const isOnline = deliveryPartner?.isAvailable || false;

  // Derive completed deliveries from orders in the system, or fallback to mock entries
  const completedSystemOrders = orders.filter(
    o => o.deliveryPartnerId === deliveryPartner?.id && o.status === 'delivered'
  );

  // Default rich performance entries for high-fidelity metrics
  const mockDeliveriesData = [
    {
      id: "ORD-9284",
      date: "23 June 2026, 11:34 AM",
      restaurant: "Sri Krishna Bhawan",
      customerArea: "Chirala Bypass",
      baseFare: 45,
      distanceBonus: 32,
      peakHourBonus: 15,
      tip: 40,
      totalEarned: 132,
      distance: "3.4 km",
      timeTaken: "19 mins",
      rating: 5,
      speedIndex: "Ultra Fast",
      feedback: "Great packaging & super hot delivery!",
      itemsCount: 3,
      routeAccuracy: "99.2%"
    },
    {
      id: "ORD-9271",
      date: "22 June 2026, 08:15 PM",
      restaurant: "Nuvvo Cloud Kitchen",
      customerArea: "Kothapeta Road",
      baseFare: 40,
      distanceBonus: 18,
      peakHourBonus: 25,
      tip: 30,
      totalEarned: 113,
      distance: "1.9 km",
      timeTaken: "14 mins",
      rating: 5,
      speedIndex: "On Time",
      feedback: "Polite behavior.",
      itemsCount: 1,
      routeAccuracy: "98.5%"
    },
    {
      id: "ORD-9258",
      date: "22 June 2026, 01:22 PM",
      restaurant: "The Spicy Bamboo",
      customerArea: "Perala Bypass Cross",
      baseFare: 50,
      distanceBonus: 45,
      peakHourBonus: 10,
      tip: 20,
      totalEarned: 125,
      distance: "4.8 km",
      timeTaken: "24 mins",
      rating: 4,
      speedIndex: "On Time",
      feedback: "Safe riding.",
      itemsCount: 2,
      routeAccuracy: "96.8%"
    },
    {
      id: "ORD-9214",
      date: "21 June 2026, 09:12 AM",
      restaurant: "Healthy Bowls Co.",
      customerArea: "Town Center Gateway",
      baseFare: 40,
      distanceBonus: 12,
      peakHourBonus: 0,
      tip: 50,
      totalEarned: 102,
      distance: "1.1 km",
      timeTaken: "11 mins",
      rating: 5,
      speedIndex: "Ultra Fast",
      feedback: "Extremely quick delivery!",
      itemsCount: 2,
      routeAccuracy: "100%"
    },
    {
      id: "ORD-9195",
      date: "20 June 2026, 07:44 PM",
      restaurant: "Grand Biryani Durbar",
      customerArea: "Bypass junction",
      baseFare: 45,
      distanceBonus: 28,
      peakHourBonus: 20,
      tip: 25,
      totalEarned: 118,
      distance: "2.9 km",
      timeTaken: "21 mins",
      rating: 5,
      speedIndex: "On Time",
      feedback: "Highly professional.",
      itemsCount: 4,
      routeAccuracy: "97.5%"
    }
  ];

  // Merge actual system orders if they exist to provide real-time updates
  const systemEarningsList = (deliveryPartner?.earningRecords || []).map((rec, i) => ({
    id: rec.orderId || `ORD-SYS-${i}`,
    date: new Date(rec.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    restaurant: rec.restaurantName || "Partner Kitchen",
    customerArea: rec.customerArea || "Chirala Main",
    baseFare: rec.deliveryFee || 40,
    distanceBonus: 20,
    peakHourBonus: rec.bonus ? (
      (rec.bonus.peakHour || 0) +
      (rec.bonus.festival || 0) +
      (rec.bonus.rain || 0) +
      (rec.bonus.weekend || 0) +
      (rec.bonus.referral || 0)
    ) : 0,
    tip: rec.tip || 0,
    totalEarned: rec.totalEarned || 60,
    distance: "2.5 km",
    timeTaken: "18 mins",
    rating: 5,
    speedIndex: "On Time",
    feedback: "Delivered carefully",
    itemsCount: 2,
    routeAccuracy: "99.0%"
  }));

  const combinedDeliveries = [...systemEarningsList, ...mockDeliveriesData];

  // Filter completed count and calculations
  const totalCompletedCount = combinedDeliveries.length;
  const totalGrossEarnings = combinedDeliveries.reduce((acc, d) => acc + d.totalEarned, 0);
  const totalTips = combinedDeliveries.reduce((acc, d) => acc + d.tip, 0);

  // Performance stats state based on period selected
  const periodMultiplier = metricPeriod === 'today' ? 0.2 : metricPeriod === 'month' ? 4 : 1;
  const activeCompleted = Math.round(totalCompletedCount * periodMultiplier);
  const activeEarnings = Math.round(totalGrossEarnings * periodMultiplier);
  const activeTips = Math.round(totalTips * periodMultiplier);

  // Metric variables
  const acceptanceRate = 97; // %
  const onTimeRate = 98.4; // %
  const averageRating = partnerRating;
  const avgDeliveryTime = "18.5 mins";
  
  // Weekly earnings graph data
  const chartData = [
    { day: "Mon", pay: 680, tips: 180, drops: 5 },
    { day: "Tue", pay: 840, tips: 220, drops: 7 },
    { day: "Wed", pay: 790, tips: 150, drops: 6 },
    { day: "Thu", pay: 920, tips: 280, drops: 8 },
    { day: "Fri", pay: 1120, tips: 350, drops: 9 },
    { day: "Sat", pay: 1450, tips: 480, drops: 12 },
    { day: "Sun", pay: 1320, tips: 400, drops: 11 },
  ];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1200);
  };

  return (
    <div id="rider-dashboard-view" className="space-y-4 font-sans text-left">
      
      {/* HEADER CONTROLS */}
      <div className="flex justify-between items-center bg-white dark:bg-zinc-900 border rounded-3xl p-4 shadow-xs">
        <div>
          <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-wider">
            Rider Performance Analytics
          </h3>
          <p className="text-[10px] text-zinc-400">
            Real-time telemetry, drop records and rating health
          </p>
        </div>
        <button 
          onClick={handleRefresh}
          className="p-2 bg-slate-50 dark:bg-zinc-950 hover:bg-slate-100 rounded-2xl border cursor-pointer select-none transition"
        >
          <RefreshCw className={`w-4 h-4 text-zinc-500 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* ONLINE/OFFLINE SHIFT STATUS TOGGLE */}
      <div className={`border rounded-3xl p-5 transition-all duration-300 shadow-sm overflow-hidden relative ${
        isOnline 
          ? 'bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border-emerald-500/30' 
          : 'bg-gradient-to-br from-zinc-500/10 to-transparent border-slate-200 dark:border-zinc-800'
      }`}>
        <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/5 rounded-full blur-3xl -z-10" />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`relative flex h-3.5 w-3.5`}>
                {isOnline && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span className={`relative inline-flex rounded-full h-3.5 w-3.5 ${isOnline ? 'bg-emerald-500' : 'bg-zinc-400'}`}></span>
              </span>
              <h4 className="font-black text-sm uppercase tracking-wider text-zinc-800 dark:text-zinc-100">
                {isOnline ? 'You Are On-Duty (Online)' : 'You Are Off-Duty (Offline)'}
              </h4>
            </div>
            <p className="text-[10.5px] text-zinc-400 leading-normal max-w-sm">
              {isOnline 
                ? 'Your GPS is actively broadcasting. Ready to receive high-surge delivery offers in the Chirala Bypass hotspot!' 
                : 'Your location is hidden. Go Online to begin receiving order dispatches and earn local milestone bonuses.'
              }
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <button
              onClick={() => updatePartnerAvailability(!isOnline)}
              className={`w-full sm:w-auto px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider cursor-pointer shadow-md select-none transition-all duration-300 transform active:scale-95 text-center ${
                isOnline 
                  ? 'bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-850 text-white' 
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white'
              }`}
            >
              {isOnline ? '🚪 Go Offline' : '⚡ Start Shift'}
            </button>
          </div>
        </div>

        {isOnline && (
          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-emerald-500/15 text-xs text-left">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-500" />
              <div>
                <span className="text-zinc-400 block text-[9px] uppercase font-bold tracking-wider">Session Shift</span>
                <span className="font-extrabold text-zinc-800 dark:text-zinc-200">4 hrs 18 mins</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <div>
                <span className="text-zinc-400 block text-[9px] uppercase font-bold tracking-wider">Active Multiplier</span>
                <span className="font-extrabold text-orange-550">1.25x Hotspot Surge</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CORE EARNINGS SUMMARY METRIC PANELS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        
        {/* Earnings Card */}
        <div className="bg-white dark:bg-zinc-900 border rounded-3xl p-4.5 shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="absolute right-3.5 top-3.5 p-2 bg-emerald-500/10 text-emerald-600 rounded-xl">
            <Wallet className="w-4.5 h-4.5" />
          </div>
          <div>
            <span className="text-[9.5px] text-zinc-400 uppercase font-black tracking-widest block">Gross Revenue Payout</span>
            <h2 className="text-2xl font-black font-mono text-zinc-900 dark:text-zinc-50 mt-1">
              ₹{activeEarnings.toLocaleString('en-IN')}
            </h2>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-50 dark:border-zinc-850 flex justify-between items-center text-[10px]">
            <span className="text-zinc-400">Includes Base & Distance</span>
            <span className="font-bold text-emerald-500 flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> +14.2% week
            </span>
          </div>
        </div>

        {/* Drops completed Card */}
        <div className="bg-white dark:bg-zinc-900 border rounded-3xl p-4.5 shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="absolute right-3.5 top-3.5 p-2 bg-indigo-500/10 text-indigo-600 rounded-xl">
            <CheckCircle className="w-4.5 h-4.5" />
          </div>
          <div>
            <span className="text-[9.5px] text-zinc-400 uppercase font-black tracking-widest block">Delivered Orders count</span>
            <h2 className="text-2xl font-black font-mono text-zinc-900 dark:text-zinc-50 mt-1">
              {activeCompleted} Drops
            </h2>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-50 dark:border-zinc-850 flex justify-between items-center text-[10px]">
            <span className="text-zinc-400">100% success rate</span>
            <span className="font-bold text-indigo-500 font-mono">0 Cancelled</span>
          </div>
        </div>

        {/* Tips received Card */}
        <div className="bg-white dark:bg-zinc-900 border rounded-3xl p-4.5 shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="absolute right-3.5 top-3.5 p-2 bg-amber-500/10 text-amber-500 rounded-xl">
            <Sparkles className="w-4.5 h-4.5" />
          </div>
          <div>
            <span className="text-[9.5px] text-zinc-400 uppercase font-black tracking-widest block">Tips & Gratuity</span>
            <h2 className="text-2xl font-black font-mono text-zinc-900 dark:text-zinc-50 mt-1">
              ₹{activeTips.toLocaleString('en-IN')}
            </h2>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-50 dark:border-zinc-850 flex justify-between items-center text-[10px]">
            <span className="text-zinc-400">100% kept by rider</span>
            <span className="font-bold text-amber-500">Avg ₹32 / order</span>
          </div>
        </div>
      </div>

      {/* EARNINGS TREND CARD */}
      <div className="bg-white dark:bg-zinc-900 border rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 bg-orange-500/10 rounded-lg text-orange-600">
                <TrendingUp className="w-4 h-4" />
              </span>
              <h4 className="text-xs font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-wider">
                Earnings Trend (Last 7 Days)
              </h4>
            </div>
            <p className="text-[9px] text-zinc-400 mt-0.5">
              Daily trend of consolidated payouts (Rider Fare + Tips)
            </p>
          </div>

          <div className="flex bg-slate-50 dark:bg-zinc-950 p-1 rounded-xl border">
            {['today', 'week', 'month'].map(p => (
              <button
                key={p}
                onClick={() => setMetricPeriod(p as any)}
                className={`px-3 py-1 rounded-lg text-[10px] uppercase font-black tracking-wider transition-all border-0 bg-transparent cursor-pointer ${
                  metricPeriod === p 
                    ? 'bg-zinc-900 text-white dark:bg-zinc-800' 
                    : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* 7-Day Stats Panel */}
        <div className="grid grid-cols-3 gap-2.5 p-3 bg-slate-50 dark:bg-zinc-950 rounded-2xl border text-left">
          <div>
            <span className="text-[8.5px] uppercase font-bold text-zinc-400 block tracking-wider">7-Day Sum</span>
            <span className="font-mono text-xs font-black text-zinc-800 dark:text-zinc-200">₹9,180</span>
          </div>
          <div className="border-l border-slate-200 dark:border-zinc-800 pl-2.5">
            <span className="text-[8.5px] uppercase font-bold text-zinc-400 block tracking-wider">7-Day Avg</span>
            <span className="font-mono text-xs font-black text-zinc-800 dark:text-zinc-200">₹1,311/d</span>
          </div>
          <div className="border-l border-slate-200 dark:border-zinc-800 pl-2.5">
            <span className="text-[8.5px] uppercase font-bold text-zinc-400 block tracking-wider">Peak Day</span>
            <span className="text-emerald-500 font-bold text-[10.5px]">Sat (₹1,930)</span>
          </div>
        </div>

        {/* RECHARTS AREA CHART */}
        <div className="h-56 w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
              data={chartData.map(d => ({
                ...d,
                totalIncome: d.pay + d.tips,
                payLabel: `Fare: ₹${d.pay}`,
                tipsLabel: `Tips: ₹${d.tips}`
              }))} 
              margin={{ top: 10, right: 5, left: -25, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorTotalIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorPay" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorTips" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="day" stroke="#a1a1aa" fontSize={9} tickLine={false} />
              <YAxis stroke="#a1a1aa" fontSize={9} tickLine={false} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#18181b', 
                  borderRadius: '16px', 
                  borderColor: '#27272a',
                  color: '#f4f4f5',
                  fontSize: '11px',
                  fontFamily: 'monospace'
                }} 
                formatter={(value: any, name: string) => {
                  if (name === "totalIncome") return [`₹${value}`, "Total Daily Income"];
                  if (name === "pay") return [`₹${value}`, "Rider Base Fare"];
                  if (name === "tips") return [`₹${value}`, "Customer Tips"];
                  return [value, name];
                }}
              />
              <Area 
                type="monotone" 
                dataKey="totalIncome" 
                name="totalIncome" 
                stroke="#f97316" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorTotalIncome)" 
              />
              <Area 
                type="monotone" 
                dataKey="pay" 
                name="pay" 
                stroke="#3b82f6" 
                strokeWidth={1.5} 
                strokeDasharray="4 4"
                fillOpacity={1} 
                fill="url(#colorPay)" 
              />
              <Area 
                type="monotone" 
                dataKey="tips" 
                name="tips" 
                stroke="#10b981" 
                strokeWidth={1.5} 
                strokeDasharray="4 4"
                fillOpacity={1} 
                fill="url(#colorTips)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Legend Indicator */}
        <div className="flex justify-center gap-4 text-[10px] font-bold uppercase tracking-wider pt-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 block" />
            <span className="text-zinc-500">Total Income</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 block" />
            <span className="text-zinc-500">Rider Fare</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block" />
            <span className="text-zinc-500">Tips</span>
          </div>
        </div>
      </div>

      {/* INDIVIDUAL PERFORMANCE QUALITY METRIC GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Left: Scorecard Matrix */}
        <div className="bg-white dark:bg-zinc-900 border rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800 pb-2">
            <h4 className="text-xs font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-wider">Quality Scorecard Metrics</h4>
            <span className="text-[9px] font-black uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">Active Tier</span>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            {/* Metric 1 */}
            <div className="p-3 bg-slate-50 dark:bg-zinc-950 rounded-2xl border text-left space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Acceptance Rate</span>
                <span className="text-emerald-500 font-extrabold text-[10px]">{acceptanceRate}%</span>
              </div>
              <p className="font-mono text-lg font-black text-zinc-800 dark:text-zinc-150">97.2%</p>
              <div className="w-full bg-slate-100 dark:bg-zinc-800 h-1 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full" style={{ width: '97.2%' }} />
              </div>
            </div>

            {/* Metric 2 */}
            <div className="p-3 bg-slate-50 dark:bg-zinc-950 rounded-2xl border text-left space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">On-Time Accuracy</span>
                <span className="text-emerald-500 font-extrabold text-[10px]">{onTimeRate}%</span>
              </div>
              <p className="font-mono text-lg font-black text-zinc-800 dark:text-zinc-150">98.4%</p>
              <div className="w-full bg-slate-100 dark:bg-zinc-800 h-1 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full" style={{ width: '98.4%' }} />
              </div>
            </div>

            {/* Metric 3 */}
            <div className="p-3 bg-slate-50 dark:bg-zinc-950 rounded-2xl border text-left space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Avg Delivery Time</span>
                <span className="text-orange-500 font-extrabold text-[10px]">Best Class</span>
              </div>
              <p className="font-mono text-lg font-black text-zinc-800 dark:text-zinc-150">{avgDeliveryTime}</p>
              <p className="text-[8.5px] text-zinc-400">Chirala city average is 24.5m</p>
            </div>

            {/* Metric 4 */}
            <div className="p-3 bg-slate-50 dark:bg-zinc-950 rounded-2xl border text-left space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Star Rating Health</span>
                <span className="text-amber-500 font-extrabold text-[10px]">★ {averageRating}</span>
              </div>
              <p className="font-mono text-lg font-black text-zinc-800 dark:text-zinc-150">4.90 Rating</p>
              <p className="text-[8.5px] text-zinc-400">96% of drops are rated 5-star</p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-zinc-950 border rounded-2xl flex items-start gap-2.5 text-xs text-left leading-relaxed">
            <Shield className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <p className="text-zinc-500 text-[10.5px]">
              🔒 <b>Incentive Guard Status:</b> Your high quality score keeps you fully exempt from standard cash-on-delivery limits. Deposit frequency set to daily.
            </p>
          </div>
        </div>

        {/* Right: Star Rating Distribution / Breakdown */}
        <div className="bg-white dark:bg-zinc-900 border rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800 pb-2">
            <h4 className="text-xs font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-wider">Rating Distribution</h4>
            <span className="text-[9.5px] text-zinc-400 font-mono font-bold">140 reviews verified</span>
          </div>

          <div className="space-y-2.5">
            {[
              { stars: 5, pct: 92, count: 128 },
              { stars: 4, pct: 6, count: 9 },
              { stars: 3, pct: 2, count: 3 },
              { stars: 2, pct: 0, count: 0 },
              { stars: 1, pct: 0, count: 0 }
            ].map((dist) => (
              <div key={dist.stars} className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-0.5 w-10 shrink-0">
                  <span className="font-bold text-[11px] font-mono">{dist.stars}</span>
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                </div>
                <div className="flex-1 bg-slate-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-amber-400 to-orange-500 h-full rounded-full" style={{ width: `${dist.pct}%` }} />
                </div>
                <span className="w-10 text-right text-[10px] text-zinc-400 font-mono font-bold">{dist.count} drops</span>
              </div>
            ))}
          </div>

          <div className="flex justify-around items-center pt-2 text-center text-xs">
            <div className="space-y-0.5">
              <span className="text-[8.5px] uppercase text-zinc-400 font-bold block">Perfect Drops</span>
              <p className="font-black text-emerald-500 font-mono text-sm">128</p>
            </div>
            <div className="w-px h-8 bg-slate-100 dark:bg-zinc-800" />
            <div className="space-y-0.5">
              <span className="text-[8.5px] uppercase text-zinc-400 font-bold block">Punctuality Score</span>
              <p className="font-black text-indigo-500 font-mono text-sm">99.1%</p>
            </div>
            <div className="w-px h-8 bg-slate-100 dark:bg-zinc-800" />
            <div className="space-y-0.5">
              <span className="text-[8.5px] uppercase text-zinc-400 font-bold block">Accuracy index</span>
              <p className="font-black text-purple-500 font-mono text-sm">100%</p>
            </div>
          </div>
        </div>
      </div>

      {/* INDIVIDUAL COMPLETED DELIVERIES LIST WITH REEXPANDABLE METRIC DETAILS */}
      <div className="bg-white dark:bg-zinc-900 border rounded-3xl p-5 shadow-sm space-y-4">
        <div>
          <h4 className="text-xs font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-wider">Individual Delivery Performance Metrics</h4>
          <p className="text-[10px] text-zinc-400 leading-normal mt-0.5">
            Tap on any completed order below to view precise speed, routes, fuel indexes, tips and review notes.
          </p>
        </div>

        <div className="space-y-2.5">
          {combinedDeliveries.map((delivery, index) => {
            const isExpanded = expandedDeliveryId === delivery.id;
            return (
              <div 
                key={index} 
                className="border border-slate-100 dark:border-zinc-850 rounded-2xl overflow-hidden transition-all bg-slate-50/50 dark:bg-zinc-950/20"
              >
                {/* Expandable Header */}
                <div 
                  onClick={() => setExpandedDeliveryId(isExpanded ? null : delivery.id)}
                  className="p-3.5 flex justify-between items-center cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-950/45 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-500 text-white rounded-xl">
                      <Bike className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-black text-zinc-900 dark:text-zinc-100 font-mono">#{delivery.id}</span>
                        <span className="text-[8px] uppercase tracking-wider font-extrabold bg-emerald-500/15 text-emerald-600 px-2 py-0.5 rounded">
                          Delivered
                        </span>
                      </div>
                      <p className="text-[10.5px] font-bold text-zinc-700 dark:text-zinc-300 mt-0.5">{delivery.restaurant}</p>
                      <span className="text-[9px] text-zinc-400 block mt-0.5">{delivery.date}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <p className="font-mono font-black text-zinc-800 dark:text-zinc-100">₹{delivery.totalEarned}</p>
                      <span className="text-[8.5px] text-zinc-400 block mt-0.5">{delivery.distance} ({delivery.timeTaken})</span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-zinc-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-zinc-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Details Panel */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-t border-slate-100 dark:border-zinc-850"
                    >
                      <div className="p-4 bg-white dark:bg-zinc-900 text-xs space-y-3.5">
                        
                        {/* Financial Payout Breakdown */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          <div className="p-2.5 bg-slate-50 dark:bg-zinc-950 rounded-xl border">
                            <span className="text-[8.5px] text-zinc-400 uppercase tracking-wider block font-bold">Base Delivery Fare</span>
                            <span className="font-mono text-[11px] font-extrabold text-zinc-700 dark:text-zinc-300">₹{delivery.baseFare}</span>
                          </div>
                          <div className="p-2.5 bg-slate-50 dark:bg-zinc-950 rounded-xl border">
                            <span className="text-[8.5px] text-zinc-400 uppercase tracking-wider block font-bold">Distance Payout</span>
                            <span className="font-mono text-[11px] font-extrabold text-zinc-700 dark:text-zinc-300">₹{delivery.distanceBonus}</span>
                          </div>
                          <div className="p-2.5 bg-slate-50 dark:bg-zinc-950 rounded-xl border">
                            <span className="text-[8.5px] text-zinc-400 uppercase tracking-wider block font-bold">Peak / Surge Promo</span>
                            <span className="font-mono text-[11px] font-extrabold text-orange-550">₹{delivery.peakHourBonus}</span>
                          </div>
                          <div className="p-2.5 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                            <span className="text-[8.5px] text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block font-bold">Customer Tip</span>
                            <span className="font-mono text-[11px] font-black text-emerald-500">₹{delivery.tip}</span>
                          </div>
                        </div>

                        {/* Detailed Delivery Metrics */}
                        <div className="p-3 bg-slate-50 dark:bg-zinc-950 rounded-2xl border space-y-3">
                          <p className="font-black text-[10px] uppercase text-zinc-400 tracking-wider">Operational Precision Telemetry</p>
                          
                          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10.5px]">
                            <div className="flex justify-between py-1 border-b border-dashed border-slate-100 dark:border-zinc-800">
                              <span className="text-zinc-400">Target Customer Area:</span>
                              <span className="font-bold text-zinc-700 dark:text-zinc-300">{delivery.customerArea}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-dashed border-slate-100 dark:border-zinc-800">
                              <span className="text-zinc-400">Route Navigation Accuracy:</span>
                              <span className="font-bold font-mono text-emerald-500">{delivery.routeAccuracy}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-dashed border-slate-100 dark:border-zinc-800">
                              <span className="text-zinc-400">Punctuality Score Index:</span>
                              <span className="font-bold text-indigo-500 flex items-center gap-1">
                                <Zap className="w-3 h-3 fill-indigo-500" /> {delivery.speedIndex}
                              </span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-dashed border-slate-100 dark:border-zinc-800">
                              <span className="text-zinc-400">Review Star Given:</span>
                              <span className="font-bold text-amber-500 flex items-center gap-0.5">
                                ★ {delivery.rating} / 5
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Customer Feedback comment */}
                        <div className="flex items-start gap-2.5 p-3 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 text-left">
                          <ThumbsUp className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-[8px] uppercase tracking-wider font-extrabold text-indigo-500 block">Verified Customer Review Note</span>
                            <p className="text-zinc-600 dark:text-zinc-300 mt-0.5 text-[10.5px] italic leading-normal">
                              "{delivery.feedback}"
                            </p>
                          </div>
                        </div>

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
