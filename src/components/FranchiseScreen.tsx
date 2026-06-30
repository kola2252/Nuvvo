/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building, Phone, ShieldCheck, Briefcase, MapPin, Users, CheckCircle2, 
  MessageSquare, TrendingUp, Video, BookOpen, Download, Calendar, Send, 
  Upload, Trash, Plus, Award, DollarSign, Globe, FileText, Check, X, ChevronLeft,
  HelpCircle, Info, Lock, ArrowRight, ShieldAlert, FileClock
} from 'lucide-react';
import { FranchiseApplication } from '../types';

export default function FranchiseScreen() {
  const { 
    franchiseApplications, 
    submitFranchiseForm, 
    clickToWhatsAppSupport, 
    user,
    pageHistory, goBack, closePage
  } = useApp();

  // Find applicant's profile associated with current log cell
  const myApps = franchiseApplications.filter(app => app.phone === user?.phone);
  // An active approved or active-franchise application grants dashboard access
  const activeFranchiseApp = myApps.find(app => app.status === 'Approved' || app.status === 'Active Franchise');

  // FORM CONTROLS
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [fullName, setFullName] = useState(user?.name || '');
  const [mobileNumber, setMobileNumber] = useState(user?.phone || '');
  const [whatsAppNumber, setWhatsAppNumber] = useState(user?.phone || '');
  const [emailAddress, setEmailAddress] = useState('');
  const [currentOccupation, setCurrentOccupation] = useState('Salaried Professional');
  const [businessExperience, setBusinessExperience] = useState('No prior experience');
  const [city, setCity] = useState('Chirala');
  const [district, setDistrict] = useState('Prakasam');
  const [state, setState] = useState('Andhra Pradesh');
  const [preferredType, setPreferredType] = useState('Area Franchise');
  const [investmentBudget, setInvestmentBudget] = useState('₹1–3 Lakhs');
  const [existingBusiness, setExistingBusiness] = useState('');
  const [officeAddress, setOfficeAddress] = useState('');
  const [numberOfEmployees, setNumberOfEmployees] = useState('2');
  const [timeline, setTimeline] = useState('Within 1 Month');
  const [whyJoin, setWhyJoin] = useState('');
  
  // DOCUMENT FILES (Base64)
  const [aadhaarFile, setAadhaarFile] = useState('');
  const [panFile, setPanFile] = useState('');
  const [businessFile, setBusinessFile] = useState('');

  // OTP SIMULATOR
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [otpError, setOtpError] = useState('');

  // Support / WhatsApp Callbacks state
  const [showMeetModal, setShowMeetModal] = useState(false);
  const [meetDate, setMeetDate] = useState('');
  const [meetTime, setMeetTime] = useState('');
  
  const [showAskModal, setShowAskModal] = useState(false);
  const [askText, setAskText] = useState('');

  // FAQ Expand
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const perks = [
    { title: "Low Investment Multiplier", desc: "Start as low as ₹1 Lakh entry points.", color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950/20" },
    { title: "Sustained Revenue Growth", desc: "Enjoy 2.5% recurring micro-royalties on each order.", color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/20" },
    { title: "Unfair Local Monopoly", desc: "Sealed geographic region parameters secured to one partner.", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/20" },
    { title: "Corporate Logistics Training", desc: "Comprehensive syllabus guidelines, video libraries & manuals.", color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-950/20" },
    { title: "SaaS Stack Operations", desc: "State-of-the-art rider terminal, monitoring & cloud database access.", color: "text-pink-500", bg: "bg-pink-50 dark:bg-pink-950/20" },
    { title: "A+ Marketing Campaigns", desc: "Fully subsidized custom banners, booklets & flyer templates.", color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950/20" },
  ];

  const handleSendOtp = () => {
    if (!mobileNumber || mobileNumber.length < 10) {
      alert("Please provide a valid 10-digit mobile number first.");
      return;
    }
    setOtpSent(true);
    setOtpError("");
    setOtpCode("");
    alert("NUVVO SYS: OTP Code [1234] broadcasted successfully. Enter code to complete verification.");
  };

  const handleVerifyOtp = () => {
    if (otpCode === '1234') {
      setIsOtpVerified(true);
      setOtpSent(false);
      setOtpError("");
    } else {
      setOtpError("Incorrect verification token credentials. Try 1234.");
    }
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>, setFileState: React.Dispatch<React.SetStateAction<string>>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setFileState(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOtpVerified) {
      alert("Mobile OTP Verification is mandatory before submitting. Click 'Send OTP' and use code 1234.");
      return;
    }
    if (!aadhaarFile || !panFile) {
      alert("Mandatory files missing. Aadhaar Card and PAN Card copies must be provided.");
      return;
    }

    const payload = {
      fullName,
      email: emailAddress,
      phone: mobileNumber,
      whatsAppPhone: whatsAppNumber,
      currentOccupation,
      businessExperience,
      city,
      district,
      state,
      preferredFranchiseType: preferredType,
      investmentRange: investmentBudget,
      existingBusinessDetails: existingBusiness,
      officeAddress,
      numberOfEmployees,
      expectedLaunchTimeline: timeline,
      whyJoinNuvvo: whyJoin,
      aadhaarCardImage: aadhaarFile,
      panCardImage: panFile,
      businessDocImage: businessFile
    };

    submitFranchiseForm(payload);
    alert(`Ecosystem Registered! Your "${preferredType}" application has been safely published to Nuvvo regional operations desk.`);
    setShowApplyModal(false);
  };

  // Callback / Whatsapp deep-links
  const triggerWhatsApp = (msg: string) => {
    clickToWhatsAppSupport(msg);
  };

  const handleMeetingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetDate || !meetTime) return;
    const text = `Hi Nuvvo Director, I would like to schedule a virtual franchise meet on ${meetDate} at ${meetTime} to discuss the Area Franchise program.`;
    triggerWhatsApp(text);
    setShowMeetModal(false);
  };

  const handleAskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!askText.trim()) return;
    const text = `Hi Nuvvo Support, I have a franchise business question: ${askText}`;
    triggerWhatsApp(text);
    setShowAskModal(false);
    setAskText('');
  };

  const triggerCallbackRequest = () => {
    const nameStr = user?.name ? `${user.name} (${user.phone})` : "Interested Entrepreneur";
    triggerWhatsApp(`Hi Nuvvo Team, my name is ${nameStr}. I want to request an immediate call back regarding Nuvvo Franchise Business packages.`);
  };

  // FAQ database
  const faqs = [
    { q: "What is Nuvvo's franchise commission split ratio?", a: "Nuvvo works on a localized sharing model. City Master and Area Franchisees retain up to 80% share on registration payouts from restaurants, plus a 2.5% lifetime platform volume bonus on total sales generated within their assigned zip codes." },
    { q: "Do I need physical premises or a storefront corporate office?", a: "For Area and Cloud Kitchen categories, a dedicated physical operations hub containing a minimum of 180 sq.ft for logistics sorting is mandatory. Business development roles can execute virtually from general home-offices." },
    { q: "Can I sell/transfer my territorial locks later on?", a: "Yes. Once an active franchise is operational for over 180 days, you can officially register a transfer request to an evaluated secondary buyer via Super Admin authorization." }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 pb-32 transition-colors duration-300 font-sans text-xs">
      
      {/* HEADER BAR */}
      <header className="sticky top-0 bg-white dark:bg-zinc-900 border-b border-slate-100 dark:border-zinc-800 p-4 z-40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={pageHistory.length > 1 ? goBack : closePage}
            className="p-1.5 bg-slate-150 dark:bg-zinc-800 hover:bg-slate-250 dark:hover:bg-zinc-700 rounded-full text-zinc-700 dark:text-zinc-300 transition-all cursor-pointer active:scale-95 flex items-center justify-center shrink-0"
            title="Go Back"
            id="franchise-screen-back-btn"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={closePage}
            className="p-1.5 bg-slate-150 dark:bg-zinc-800 hover:bg-slate-250 dark:hover:bg-zinc-700 rounded-full text-zinc-700 dark:text-zinc-300 transition-all cursor-pointer active:scale-95 flex items-center justify-center shrink-0"
            title="Close to Home"
            id="franchise-screen-close-btn"
          >
            <X className="w-4 h-4" />
          </button>
          <h2 className="text-lg font-black text-zinc-900 dark:text-zinc-50 tracking-tight flex items-center gap-2 ml-1">
            <Building className="w-5.5 h-5.5 text-orange-500 animate-pulse" />
            <span className="bg-gradient-to-r from-orange-550 to-red-500 bg-clip-text text-transparent">Nuvvo Partner Program</span>
          </h2>
        </div>
        <span className="text-[9px] font-mono bg-red-650 text-white font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider">
          ISO 9001
        </span>
      </header>

      {/* DASHBOARD RENDER FOR APPROVED PARTNERS */}
      {activeFranchiseApp ? (
        <div className="px-4 py-5 max-w-lg mx-auto space-y-6">
          
          {/* DASHBOARD HERO */}
          <div className="bg-slate-900 dark:bg-zinc-900 text-white rounded-3xl p-5 relative overflow-hidden border border-zinc-800/80 shadow-md">
            <div className="absolute right-0 bottom-0 translate-y-6 translate-x-4 opacity-5 pointer-events-none">
              <Building className="w-48 h-48" />
            </div>
            
            <div className="relative z-10">
              <span className="text-[8px] bg-emerald-500 text-white font-black px-2 py-0.5 rounded uppercase tracking-widest inline-block mb-2">
                {activeFranchiseApp.status}
              </span>
              <h3 className="text-lg font-black tracking-tight font-sans">Welcome, {activeFranchiseApp.fullName}</h3>
              <p className="text-[10px] text-zinc-400 mt-1">Ecosystem Partner ID: <strong className="font-mono text-zinc-200">{activeFranchiseApp.id}</strong></p>
              <p className="text-[10px] text-orange-400 font-bold mt-0.5">Assigned Location: {activeFranchiseApp.city}, {activeFranchiseApp.state}</p>
            </div>

            {/* QUICK STATS PANEL */}
            <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-zinc-805 text-center">
              <div>
                <p className="text-[9px] text-zinc-450 uppercase font-bold">Venues Onboarded</p>
                <p className="text-sm font-black text-emerald-400 mt-1">12 venues</p>
              </div>
              <div>
                <p className="text-[9px] text-zinc-450 uppercase font-bold">Fleet Size</p>
                <p className="text-sm font-black text-indigo-400 mt-1">8 riders</p>
              </div>
              <div>
                <p className="text-[9px] text-zinc-450 uppercase font-bold">Volume Month</p>
                <p className="text-sm font-black text-orange-400 mt-1">₹1,84,500</p>
              </div>
            </div>
          </div>

          {/* DYNAMIC ANALYTICS */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border shadow-sm space-y-4">
            <h4 className="font-extrabold text-orange-500 uppercase tracking-wider text-[11px] flex items-center gap-1.5 border-b pb-2">
              <TrendingUp className="w-4 h-4" /> Live Regional Performance Metrics
            </h4>

            <div className="grid grid-cols-2 gap-3.5 pt-1">
              <div className="bg-slate-50 dark:bg-zinc-850 p-3.5 rounded-2xl border text-left">
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Commission Earnings</span>
                <p className="text-base font-black text-zinc-850 dark:text-zinc-50 mt-1">₹4,612.50</p>
                <span className="text-[8.5px] text-emerald-500 font-bold">✓ Ready for Withdrawal</span>
              </div>
              <div className="bg-slate-50 dark:bg-zinc-850 p-3.5 rounded-2xl border text-left">
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Territory Orders</span>
                <p className="text-base font-black text-zinc-855 dark:text-zinc-50 mt-1">738 Bills</p>
                <span className="text-[8.5px] text-indigo-500 font-bold">This month count</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <p className="text-[10px] font-extrabold text-zinc-550 uppercase tracking-tight">Active Coverage Zone Map</p>
              <div className="bg-slate-100 dark:bg-zinc-800 rounded-2xl p-4 flex flex-col justify-center items-center h-28 border border-dashed border-zinc-200 dark:border-zinc-700">
                <Globe className="w-6 h-6 text-zinc-400 animate-spin" style={{ animationDuration: '8s' }} />
                <p className="text-[10px] text-zinc-700 dark:text-zinc-300 font-bold mt-2">Active Geo-fence Lock Verified</p>
                <p className="text-[8.5px] text-zinc-450 mt-0.5">{activeFranchiseApp.city} Urban Circle Zone</p>
              </div>
            </div>
          </div>

          {/* COMMISSION TRANSACTIONS */}
          <div className="bg-white dark:bg-zinc-900 border rounded-3xl p-5 shadow-sm space-y-3.5 text-left">
            <h4 className="text-[11px] font-black text-zinc-905 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-orange-500" /> Commission Ledgers & Payouts
            </h4>
            
            <div className="space-y-2">
              <div className="p-3 bg-zinc-50 dark:bg-zinc-850/80 border rounded-2xl flex justify-between items-center text-[10px]">
                <div>
                  <p className="font-extrabold text-zinc-700 dark:text-zinc-300">New Store Onboarding Bonus</p>
                  <p className="text-zinc-450 mt-0.5">Assigned to Srikrishna Andhra Mess</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-emerald-500">+ ₹1,500.00</p>
                  <span className="text-[8.5px] text-zinc-400 block font-mono">12 Jun 2026</span>
                </div>
              </div>

              <div className="p-3 bg-zinc-50 dark:bg-zinc-850/80 border rounded-2xl flex justify-between items-center text-[10px]">
                <div>
                  <p className="font-extrabold text-zinc-700 dark:text-zinc-300">Rider Recruitment Reward</p>
                  <p className="text-zinc-450 mt-0.5">Approved logistics operator ID 4410</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-emerald-500">+ ₹500.00</p>
                  <span className="text-[8.5px] text-zinc-400 block font-mono">11 Jun 2026</span>
                </div>
              </div>

              <div className="p-3 bg-zinc-50 dark:bg-zinc-850/80 border rounded-2xl flex justify-between items-center text-[10px]">
                <div>
                  <p className="font-extrabold text-zinc-700 dark:text-zinc-300">Geographic Revenue Share (2.5%)</p>
                  <p className="text-zinc-450 mt-0.5">Calculated pool for Week 24</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-emerald-500">+ ₹2,612.50</p>
                  <span className="text-[8.5px] text-zinc-400 block font-mono">09 Jun 2026</span>
                </div>
              </div>
            </div>
          </div>

          {/* PERMISSIONS CALLOUT */}
          <div className="bg-amber-500/10 border border-amber-300/30 rounded-3xl p-4 flex gap-3 text-amber-800 dark:text-amber-400 text-left">
            <Lock className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" />
            <div>
              <strong className="block text-[10.5px] uppercase tracking-wide">Enterprise Permissions Lock</strong>
              <p className="text-[9px] text-zinc-600 dark:text-zinc-400 leading-snug mt-0.5">
                You have active rights to recruit localized menus, register couriers, and extract zone performance files. Access to modifying database schema configs or setting visual gateways remains restricted to Super Admin cell.
              </p>
            </div>
          </div>

          {/* SYSTEM SUPPORT & MATERIALS */}
          <div className="bg-white dark:bg-zinc-900 border rounded-3xl p-5 shadow-sm space-y-4 text-left">
            <h4 className="text-[11px] font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-orange-500" /> Executive Training Toolkit
            </h4>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button 
                onClick={() => alert("Initializing Operations Dossier download. File: Nuvvo_SOP_V4.pdf (23.4 MB)")}
                className="p-3 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 dark:bg-indigo-950/20 dark:border-indigo-900/60 text-indigo-650 dark:text-indigo-400 rounded-2xl flex items-center gap-2 font-bold cursor-pointer transition duration-150"
              >
                <BookOpen className="w-4 h-4 shrink-0" />
                <span>Operations manual</span>
              </button>

              <button 
                onClick={() => alert("Launching training stream: Onboarding local restaurant vendors fast.")}
                className="p-3 bg-red-50 hover:bg-red-100 border border-red-100 dark:bg-red-950/20 dark:border-red-900/60 text-rose-650 dark:text-rose-405 rounded-2xl flex items-center gap-2 font-bold cursor-pointer transition duration-150"
              >
                <Video className="w-4 h-4 shrink-0" />
                <span>Training Videos</span>
              </button>

              <button 
                onClick={() => alert("Preparing high resolution graphics package download. File Size: 180MB.")}
                className="p-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/60 text-emerald-650 dark:text-emerald-400 rounded-2xl flex items-center gap-2 font-bold cursor-pointer transition duration-150"
              >
                <Download className="w-4 h-4 shrink-0" />
                <span>Marketing Toolkit</span>
              </button>

              <button 
                onClick={() => setShowAskModal(true)}
                className="p-3 bg-orange-50 hover:bg-orange-100 border border-orange-150 dark:bg-orange-950/20 dark:border-orange-900/60 text-orange-650 dark:text-orange-400 rounded-2xl flex items-center gap-2 font-bold cursor-pointer transition duration-150"
              >
                <HelpCircle className="w-4 h-4 shrink-0" />
                <span>Support FAQ Desk</span>
              </button>
            </div>
            
            {/* WHATSAPP DIRECT EMBED */}
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <strong className="text-emerald-700 dark:text-emerald-400 block text-[10px] uppercase">Corporate Desk</strong>
                <p className="text-[9px] text-zinc-500">Fast escalation support cell 8328355812</p>
              </div>
              <button 
                onClick={() => triggerWhatsApp(`Franchise Partner Account: support ticket escalated on region ${activeFranchiseApp.city}`)}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold uppercase py-2 px-4 rounded-xl text-[10px]"
              >
                Immediate Chat
              </button>
            </div>
          </div>

        </div>
      ) : (
        /* STANDARD REGISTER / INQUIRY PAGE WITH HERO AND FORM */
        <div className="px-4 py-5 max-w-lg mx-auto space-y-6">

          {/* HERO BANNER SECTION */}
          <div className="bg-gradient-to-tr from-slate-900 via-zinc-900 to-black text-white rounded-3xl p-6 relative overflow-hidden border shadow-lg text-left">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Building className="w-32 h-32" style={{ transform: 'rotate(-12deg)' }} />
            </div>
            
            <p className="text-[9px] font-mono tracking-widest bg-orange-500 text-white font-extrabold px-2.5 py-0.5 rounded-full uppercase inline-block mb-3.5">
              Partnership Alliance Pro
            </p>
            <h1 className="text-xl font-black leading-tight tracking-tight text-white mb-2 font-sans md:text-2xl">
              Partner with Nuvvo – Build Your Own Food Delivery Business
            </h1>
            <p className="text-[11px] text-zinc-400 leading-relaxed font-sans mb-5">
              Start your own food delivery business with Nuvvo and become part of the fastest-growing local delivery platform. Secure exclusive municipal territory lockups.
            </p>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <button 
                onClick={() => setShowApplyModal(true)}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-extrabold uppercase py-3 px-4 rounded-2xl text-[10.5px] flex items-center justify-center gap-1.5 shadow-md active:scale-[0.99] transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" /> Apply for Franchise
              </button>
              <button 
                onClick={() => triggerWhatsApp("Hi Nuvvo Director, I would like to download the details about Nuvvo food-partnership franchise files.")}
                className="bg-zinc-805 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 font-extrabold uppercase py-3 px-4 rounded-2xl text-[10px] flex items-center justify-center gap-1.5 cursor-pointer transition"
              >
                <Download className="w-3.5 h-3.5" /> Download Brochure
              </button>
            </div>
          </div>

          {/* APPLICATION STATUS TRACKER IF APPLIED */}
          {myApps.length > 0 && (
            <div className="bg-white dark:bg-zinc-900 border rounded-3xl p-5 shadow-sm space-y-4 text-left">
              <h3 className="font-extrabold text-[12px] flex items-center gap-2 text-zinc-900 dark:text-zinc-100 uppercase tracking-wider border-b pb-2">
                <FileClock className="w-4.5 h-4.5 text-orange-500 animate-pulse" /> Active Application Status Tracker
              </h3>
              
              <div className="space-y-4">
                {myApps.map((app) => {
                  const statuses = ['Submitted', 'Under Review', 'Verification Pending', 'Approved', 'Agreement Pending', 'Active Franchise'];
                  const currentIndex = statuses.indexOf(app.status);
                  
                  return (
                    <div key={app.id} className="p-4 bg-slate-50 dark:bg-zinc-850 border rounded-2xl space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-black text-xs text-zinc-800 dark:text-zinc-200">{app.preferredFranchiseType}</h4>
                          <p className="text-[9.5px] text-zinc-400 mt-0.5">Assigned Target: {app.city} • Filed: {app.date}</p>
                        </div>
                        <span className="text-[8px] bg-indigo-500 text-white px-2 py-0.5 rounded uppercase font-black font-mono">
                          {app.status}
                        </span>
                      </div>

                      {/* TRACKING PROGRESS LINE */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-[8px] text-zinc-400 font-bold uppercase tracking-wider">
                          <span>Submitted</span>
                          <span>Verification</span>
                          <span>Active Franchise</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden relative border border-slate-100 dark:border-zinc-700">
                          {app.status === 'Rejected' ? (
                            <div className="bg-rose-500 h-full w-full" />
                          ) : (
                            <div 
                              className="bg-orange-500 h-full rounded-full transition-all duration-500" 
                              style={{ width: `${Math.max(15, ((currentIndex + 1) / statuses.length) * 100)}%` }}
                            />
                          )}
                        </div>
                        <p className="text-[9.5px] font-medium text-zinc-500 italic">
                          {app.status === 'Rejected' 
                            ? "❌ Form evaluation failed compliance guidelines. Reach Support phone to escalate physical review." 
                            : `Current Status: Operational desk has set this to: "${app.status}". We will call back soon.`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* BENEFIT GRIDDINGS */}
          <div className="space-y-3.5 text-left">
            <h2 className="text-sm font-black text-zinc-900 dark:text-zinc-55 uppercase tracking-wide flex items-center gap-2">
              <Award className="w-5 h-5 text-orange-500" /> Exclusive Partnership Privileges
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {perks.map((p, idx) => (
                <div key={idx} className="bg-white dark:bg-zinc-900 border rounded-3xl p-4 shadow-xs flex items-start gap-3">
                  <div className={`p-2.5 rounded-2xl ${p.bg} ${p.color} shrink-0`}>
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-xs text-zinc-900 dark:text-zinc-200 tracking-tight">{p.title}</h3>
                    <p className="text-[10px] text-zinc-450 dark:text-zinc-400 mt-1 leading-snug">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FRANCHISE OPPORTUNITY CATEGORIES */}
          <div className="bg-zinc-950/95 border border-zinc-850 rounded-3xl p-5 shadow-xl text-left space-y-4">
            <h3 className="text-[11px] font-black uppercase tracking-wider text-white flex items-center gap-1.5">
              <Briefcase className="w-4.5 h-4.5 text-orange-500 animate-pulse" /> Available Business Formats
            </h3>

            <div className="space-y-3">
              <div className="p-3.5 bg-zinc-900/80 border border-zinc-800/80 rounded-2xl flex items-start gap-3 transition hover:border-orange-500/20">
                <div className="p-2 bg-orange-950/40 rounded-xl text-orange-400 shrink-0 mt-0.5">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-zinc-100">1. City Master Franchise</h4>
                  <p className="text-[10px] text-zinc-400 mt-0.5 leading-snug">Manage Nuvvo logistics operations, brand lockups, and rider networks for an entire designated municipal city.</p>
                </div>
              </div>

              <div className="p-3.5 bg-zinc-900/80 border border-zinc-800/80 rounded-2xl flex items-start gap-3 transition hover:border-indigo-500/20">
                <div className="p-2 bg-indigo-950/40 rounded-xl text-indigo-400 shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-zinc-100">2. Area Franchise</h4>
                  <p className="text-[10px] text-zinc-400 mt-0.5 leading-snug">Lock exclusive territorial parameters for a singular Mandal, suburban colony, or municipal ward.</p>
                </div>
              </div>

              <div className="p-3.5 bg-zinc-900/80 border border-zinc-800/80 rounded-2xl flex items-start gap-3 transition hover:border-emerald-500/20">
                <div className="p-2 bg-emerald-950/40 rounded-xl text-emerald-400 shrink-0 mt-0.5">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-zinc-100">3. Delivery Hub Franchise</h4>
                  <p className="text-[10px] text-zinc-400 mt-0.5 leading-snug">Run local courier driver enrollment, operations compliance, and localized dispatch terminals.</p>
                </div>
              </div>

              <div className="p-3.5 bg-zinc-900/80 border border-zinc-800/80 rounded-2xl flex items-start gap-3 transition hover:border-purple-500/20">
                <div className="p-2 bg-purple-950/40 rounded-xl text-purple-400 shrink-0 mt-0.5">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-zinc-100">4. Cloud Kitchen Franchise</h4>
                  <p className="text-[10px] text-zinc-400 mt-0.5 leading-snug font-medium">Establish state-subsidized commercial cooking kitchens optimized strictly for high volume digital order workflows.</p>
                </div>
              </div>

              <div className="p-3.5 bg-zinc-900/80 border border-zinc-800/80 rounded-2xl flex items-start gap-3 transition hover:border-pink-500/20">
                <div className="p-2 bg-pink-950/40 rounded-xl text-pink-400 shrink-0 mt-0.5">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-zinc-100">5. Restaurant Onboarding Franchise</h4>
                  <p className="text-[10px] text-zinc-400 mt-0.5 leading-snug">Onboard dining restaurants, establish localized catalog files, and earn flat signup commissions.</p>
                </div>
              </div>

              <div className="p-3.5 bg-zinc-900/80 border border-zinc-800/80 rounded-2xl flex items-start gap-3 transition hover:border-sky-500/20">
                <div className="p-2 bg-sky-950/40 rounded-xl text-sky-400 shrink-0 mt-0.5">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-zinc-100">6. Marketing Franchise</h4>
                  <p className="text-[10px] text-zinc-400 mt-0.5 leading-snug">Handle localized activations, corporate discount coupons circulation, and regional advertisement campaigns.</p>
                </div>
              </div>
            </div>
          </div>

          {/* INTEGRATED WHATSAPP CONTACT CARD */}
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-3xl space-y-3.5 text-left text-emerald-800 dark:text-emerald-400">
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-emerald-500" />
              <strong className="text-xs uppercase tracking-wide">Direct WhatsApp Business Helpline: 8328355812</strong>
            </div>
            
            <p className="text-[10px] leading-relaxed text-zinc-650 dark:text-zinc-350">
              Speak directly with our Chief Expansion Officer. Request calls, download presentation slides, and arrange site-verification meetings instantly.
            </p>

            <div className="grid grid-cols-2 gap-2 text-[10px] font-sans">
              <button 
                onClick={() => triggerWhatsApp("Hi Nuvvo Support, I want to immediately request a callback regarding franchise programs.")}
                className="bg-emerald-500 text-white font-extrabold uppercase py-3 rounded-2xl hover:bg-emerald-600 transition cursor-pointer text-center"
              >
                Chat on WhatsApp
              </button>

              <button 
                onClick={triggerCallbackRequest}
                className="bg-white hover:bg-slate-100 border text-zinc-800 font-extrabold uppercase py-3 rounded-2xl transition cursor-pointer text-center"
              >
                Call me back
              </button>

              <button 
                onClick={() => setShowMeetModal(true)}
                className="bg-indigo-600 text-white font-extrabold uppercase py-3 rounded-2xl hover:bg-indigo-700 transition cursor-pointer text-center text-[9px]"
              >
                Schedule Meeting
              </button>

              <button 
                onClick={() => setShowApplyModal(true)}
                className="bg-orange-500 text-white font-extrabold uppercase py-3 rounded-2xl hover:bg-orange-600 transition cursor-pointer text-center"
              >
                Apply Online Now
              </button>
            </div>
          </div>

          {/* FAQ COMPONENT */}
          <div className="bg-white dark:bg-zinc-900 border rounded-3xl p-5 shadow-sm text-left space-y-3.5">
            <h3 className="font-extrabold text-[11px] text-zinc-900 dark:text-zinc-50 uppercase tracking-widest flex items-center justify-between">
              <span>FAQ - Frequently Asked Business Queries</span>
              <Info className="w-4 h-4 text-orange-500" />
            </h3>

            <div className="space-y-2">
              {faqs.map((faq, idx) => (
                <div key={idx} className="border-b last:border-none pb-2 last:pb-0">
                  <button 
                    onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                    className="w-full text-left font-black text-[11px] text-zinc-800 dark:text-zinc-200 py-1 flex justify-between items-center"
                  >
                    <span>{faq.q}</span>
                    <span className="text-zinc-400 font-bold">{expandedFaq === idx ? '−' : '+'}</span>
                  </button>
                  {expandedFaq === idx && (
                    <p className="text-[10px] text-zinc-450 leading-relaxed mt-1.5 p-2 bg-slate-50 dark:bg-zinc-850 rounded-xl border animate-fadeIn">
                      {faq.a}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* REGISTRATION DETAILED MODAL */}
      <AnimatePresence>
        {showApplyModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 overflow-y-auto px-4 py-8 flex items-center justify-center">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 rounded-3xl border shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] text-left"
            >
              {/* Modal header */}
              <div className="p-4 bg-orange-500 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  <span className="font-extrabold tracking-tight uppercase text-xs">Franchise Onboarding Profile Form</span>
                </div>
                <button 
                  onClick={() => setShowApplyModal(false)}
                  className="p-1 hover:bg-white/20 rounded-full transition"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Form body */}
              <form onSubmit={handleFormSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
                
                <h4 className="text-[10px] font-black text-orange-500 uppercase tracking-widest border-b pb-1">1. Candidate particulars</h4>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-zinc-500 font-bold mb-0.5">Full Name</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Enter Full Name" 
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-zinc-800 p-2 rounded-xl border text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-500 font-bold mb-0.5">Email Address</label>
                    <input 
                      type="email" 
                      required 
                      placeholder="name@gmail.com" 
                      value={emailAddress}
                      onChange={e => setEmailAddress(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-zinc-800 p-2 rounded-xl border text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-zinc-500 font-bold mb-0.5 mb-1 flex items-center gap-1 justify-between">
                      <span>Mobile Number</span>
                      {isOtpVerified && <span className="text-[8px] text-emerald-500 font-black">✓ verified</span>}
                    </label>
                    <div className="flex gap-1">
                      <input 
                        type="tel" 
                        required 
                        disabled={isOtpVerified}
                        placeholder="e.g. 8328355812" 
                        value={mobileNumber}
                        onChange={e => setMobileNumber(e.target.value)}
                        className="flex-1 bg-slate-50 dark:bg-zinc-800 p-2 rounded-xl border text-xs font-mono"
                      />
                      {!isOtpVerified && (
                        <button 
                          type="button" 
                          onClick={handleSendOtp}
                          className="px-2.5 py-1 bg-orange-500 text-white font-extrabold rounded-xl text-[9px] hover:bg-orange-600 transition"
                        >
                          {otpSent ? "Resend" : "Send OTP"}
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-zinc-500 font-bold mb-0.5">WhatsApp Number</label>
                    <input 
                      type="tel" 
                      required 
                      placeholder="e.g. 8328355812" 
                      value={whatsAppNumber}
                      onChange={e => setWhatsAppNumber(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-zinc-800 p-2 rounded-xl border text-xs font-mono"
                    />
                  </div>
                </div>

                {/* OTP POPUP FIELD */}
                {otpSent && (
                  <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-2xl border border-orange-200/50 space-y-2 mt-1 animate-fadeIn">
                    <p className="font-bold text-orange-655 text-[10px]">Verify Mobile Number: Enter 1234 to clear SMS gate</p>
                    <div className="flex gap-1.5">
                      <input 
                        type="number" 
                        placeholder="Enter 4-digit code"
                        value={otpCode}
                        onChange={e => setOtpCode(e.target.value)}
                        className="flex-1 bg-white dark:bg-zinc-800 p-2 rounded-xl border text-xs font-mono text-center tracking-widest font-black"
                      />
                      <button 
                        type="button" 
                        onClick={handleVerifyOtp}
                        className="bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl"
                      >
                        Verify
                      </button>
                    </div>
                    {otpError && <p className="text-[9px] text-rose-500 font-bold">{otpError}</p>}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-zinc-500 font-bold mb-0.5">Current Occupation</label>
                    <select 
                      value={currentOccupation} 
                      onChange={e => setCurrentOccupation(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-zinc-800 p-2 rounded-xl border text-xs font-bold"
                    >
                      <option value="Salaried Professional">Salaried Professional</option>
                      <option value="Existing Merchant">Existing Merchant</option>
                      <option value="Hotelier">Hotelier</option>
                      <option value="Local Investor">Local Investor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-zinc-500 font-bold mb-0.5">Experience in Business</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 5 Years in retail, none" 
                      value={businessExperience}
                      onChange={e => setBusinessExperience(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-zinc-800 p-2 rounded-xl border text-xs"
                    />
                  </div>
                </div>

                <h4 className="text-[10px] font-black text-orange-500 uppercase tracking-widest border-b pb-1 pt-1">2. Target Region</h4>
                
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-zinc-500 font-bold mb-0.5">Proposed City</label>
                    <input 
                      type="text" 
                      required 
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-zinc-800 p-2 rounded-xl border text-xs font-black uppercase text-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-500 font-bold mb-0.5">District</label>
                    <input 
                      type="text" 
                      required 
                      value={district}
                      onChange={e => setDistrict(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-zinc-800 p-2 rounded-xl border text-xs uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-500 font-bold mb-0.5">State</label>
                    <input 
                      type="text" 
                      required 
                      value={state}
                      onChange={e => setState(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-zinc-800 p-2 rounded-xl border text-xs uppercase"
                    />
                  </div>
                </div>

                <h4 className="text-[10px] font-black text-orange-500 uppercase tracking-widest border-b pb-1 pt-1">3. Corporate Intent & Budgets</h4>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-zinc-500 font-bold mb-0.5">Preferred Format</label>
                    <select 
                      value={preferredType} 
                      onChange={e => setPreferredType(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-zinc-800 p-2 rounded-xl border text-xs font-bold"
                    >
                      <option value="City Master Franchise">City Master Franchise</option>
                      <option value="Area Franchise">Area Franchise</option>
                      <option value="Delivery Hub Franchise">Delivery Hub Franchise</option>
                      <option value="Cloud Kitchen Franchise">Cloud Kitchen Franchise</option>
                      <option value="Restaurant Acquisition Franchise">Restaurant Acquisition Franchise</option>
                      <option value="Marketing Franchise">Marketing Franchise</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-zinc-500 font-bold mb-0.5">Investment Budget Range</label>
                    <select 
                      value={investmentBudget} 
                      onChange={e => setInvestmentBudget(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-zinc-800 p-2 rounded-xl border text-xs font-bold"
                    >
                      <option value="Below ₹1 Lakh">Below ₹1 Lakh</option>
                      <option value="₹1–3 Lakhs">₹1–3 Lakhs</option>
                      <option value="₹3–5 Lakhs">₹3–5 Lakhs</option>
                      <option value="₹5–10 Lakhs">₹5–10 Lakhs</option>
                      <option value="₹10–25 Lakhs">₹10–25 Lakhs</option>
                      <option value="₹25 Lakhs and Above">₹25 Lakhs and Above</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-500 font-bold mb-0.5">Existing Business details (if any)</label>
                  <input 
                    type="text" 
                    placeholder="Brief description of active retail shops, hoteliers etc."
                    value={existingBusiness}
                    onChange={e => setExistingBusiness(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-800 p-2 rounded-xl border text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-zinc-500 font-bold mb-0.5">Proposed Office Address</label>
                    <input 
                      type="text" 
                      placeholder="Unit #, commercial block etc." 
                      value={officeAddress}
                      onChange={e => setOfficeAddress(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-zinc-800 p-2 rounded-xl border text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-500 font-bold mb-0.5">Launch Timeline</label>
                    <select 
                      value={timeline} 
                      onChange={e => setTimeline(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-zinc-800 p-2 rounded-xl border font-bold"
                    >
                      <option value="Immediate">Immediate / Within 1 Week</option>
                      <option value="Within 1 Month">Within 1 Month</option>
                      <option value="Within 3 Months">Within 3 Months</option>
                      <option value="Just Exploring">Just Exploring</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-zinc-500 font-bold mb-0.5">Expected Employees Count</label>
                    <input 
                      type="number" 
                      value={numberOfEmployees}
                      onChange={e => setNumberOfEmployees(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-zinc-800 p-2 rounded-xl border text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-500 font-bold mb-0.5">Why join Nuvvo Delivery Network?</label>
                    <input 
                      type="text" 
                      placeholder="My city demands high quality fast-commerce" 
                      value={whyJoin}
                      onChange={e => setWhyJoin(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-zinc-800 p-2 rounded-xl border text-xs"
                    />
                  </div>
                </div>

                <h4 className="text-[10px] font-black text-orange-500 uppercase tracking-widest border-b pb-1 pt-1">4. Official Candidate Credentials</h4>

                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    {/* Aadhaar Upload */}
                    <div>
                      <span className="block text-zinc-500 font-bold mb-1">Aadhaar Card copy (Front/Back) *</span>
                      {aadhaarFile ? (
                        <div className="relative w-full h-20 bg-slate-100 rounded-xl overflow-hidden border flex items-center justify-center">
                          <img src={aadhaarFile} alt="Aadhaar Preview" className="w-full h-full object-cover" />
                          <button 
                            type="button" 
                            onClick={() => setAadhaarFile('')}
                            className="absolute top-1 right-1 p-1 bg-red-650 text-white rounded-full hover:bg-rose-700 transition"
                          >
                            <Trash className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 transition">
                          <Upload className="w-4 h-4 text-orange-500" />
                          <span className="text-[8px] text-zinc-450 uppercase font-black mt-1">Upload Aadhaar JPG</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => handleDocumentUpload(e, setAadhaarFile)}
                            required
                          />
                        </label>
                      )}
                    </div>

                    {/* PAN Upload */}
                    <div>
                      <span className="block text-zinc-500 font-bold mb-1">PAN Card copy *</span>
                      {panFile ? (
                        <div className="relative w-full h-20 bg-slate-100 rounded-xl overflow-hidden border flex items-center justify-center">
                          <img src={panFile} alt="PAN Preview" className="w-full h-full object-cover" />
                          <button 
                            type="button" 
                            onClick={() => setPanFile('')}
                            className="absolute top-1 right-1 p-1 bg-red-655 text-white rounded-full hover:bg-rose-700 transition"
                          >
                            <Trash className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 transition">
                          <Upload className="w-4 h-4 text-orange-500" />
                          <span className="text-[8px] text-zinc-450 uppercase font-black mt-1">Upload PAN JPG</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => handleDocumentUpload(e, setPanFile)}
                            required
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Optional document */}
                  <div>
                    <span className="block text-zinc-505 font-bold mb-1">Corporate Registration Dossier / Trade License (Optional)</span>
                    {businessFile ? (
                      <div className="relative w-full h-16 bg-slate-105 rounded-xl overflow-hidden border flex items-center justify-center">
                        <img src={businessFile} alt="Trade Preview" className="w-full h-full object-cover" />
                        <button 
                          type="button" 
                          onClick={() => setBusinessFile('')}
                          className="absolute top-1 right-1 p-1 bg-red-655 text-white rounded-full hover:bg-rose-700 transition animate-pulse"
                        >
                          <Trash className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-16 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 transition">
                        <span className="text-[8.5px] text-zinc-450 uppercase font-black">Browse business certificate files</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => handleDocumentUpload(e, setBusinessFile)}
                        />
                      </label>
                    )}
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-orange-500 hover:bg-orange-655 text-white font-black py-3 rounded-2xl uppercase tracking-wider shadow-md mt-4 text-[10px]"
                >
                  Commit Franchise Application File
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MEET SCHEDULER MODAL */}
      <AnimatePresence>
        {showMeetModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 rounded-3xl border shadow-xl p-5 w-full max-w-sm text-left space-y-4"
            >
              <div className="flex justify-between items-center border-b pb-2">
                <h4 className="font-extrabold text-xs uppercase text-indigo-600 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" /> Book Consultation Call
                </h4>
                <button onClick={() => setShowMeetModal(false)} className="p-1 text-zinc-400 hover:text-zinc-650">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleMeetingSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-zinc-500 font-bold mb-1">Preferred Meeting Date</label>
                  <input 
                    type="date" 
                    required 
                    value={meetDate}
                    onChange={e => setMeetDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-800 p-2.5 rounded-xl border text-xs"
                  />
                </div>
                <div>
                  <label className="block text-zinc-500 font-bold mb-1">Time Slot Range</label>
                  <select 
                    value={meetTime} 
                    onChange={e => setMeetTime(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-zinc-800 p-2.5 rounded-xl border text-xs font-bold"
                  >
                    <option value="">Select slot...</option>
                    <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AMIST</option>
                    <option value="02:00 PM - 03:00 PM">02:00 PM - 03:00 PMIST</option>
                    <option value="04:30 PM - 05:30 PM">04:30 PM - 05:30 PMIST</option>
                  </select>
                </div>
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-2.5 rounded-xl uppercase">
                  Schedule on WhatsApp
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ASK BUSINESS QUESTION MODAL */}
      <AnimatePresence>
        {showAskModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 rounded-3xl border shadow-xl p-5 w-full max-w-sm text-left space-y-4"
            >
              <div className="flex justify-between items-center border-b pb-2">
                <h4 className="font-extrabold text-xs uppercase text-orange-500 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4" /> Ask Expansion Board
                </h4>
                <button onClick={() => setShowAskModal(false)} className="p-1 text-zinc-400 hover:text-zinc-650">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAskSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-zinc-500 font-bold mb-1">State Your Venture Inquiry</label>
                  <textarea 
                    required 
                    placeholder="E.g. What is the security deposit rate for Cloud Kitchen license packages?" 
                    value={askText}
                    onChange={e => setAskText(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-800 p-2.5 rounded-xl border h-20 resize-none text-xs"
                  />
                </div>
                <button type="submit" className="w-full bg-orange-500 hover:bg-orange-655 text-white font-black py-2.5 rounded-xl uppercase">
                  Transmit Question to Director
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
