/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'motion/react';
import { Phone, Lock, User, Mail, MapPin, Sparkles, Building2, Globe } from 'lucide-react';
import { Address } from '../types';
import NuvvoLogo from './NuvvoLogo';
import { translations } from '../utils/translations';

export default function Auth() {
  const { loginWithPhone, verifyOtpAndLogin, completeUserProfile, user, setCurrentPage, language, setLanguage } = useApp();

  const t = translations[language] || translations.en;

  const [phoneNumber, setPhoneNumber] = useState('');
  const [roleOption, setRoleOption] = useState('Customer');
  const [step, setStep] = useState<'phone' | 'otp' | 'profile'>('phone');
  const [otpValue, setOtpValue] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const [smsDetected, setSmsDetected] = useState(false);

  // Profile data
  const [fullName, setFullName] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [flatNo, setFlatNo] = useState('');
  const [area, setArea] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('Chirala');

  // Timer countdown
  useEffect(() => {
    if (step !== 'otp' || resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  // Simulate auto-detecting SMS OTP
  useEffect(() => {
    if (step === 'otp') {
      const detectTimer = setTimeout(() => {
        setOtpValue('5555');
        setSmsDetected(true);
      }, 2000);
      return () => clearTimeout(detectTimer);
    } else {
      setSmsDetected(false);
    }
  }, [step]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    // Simple validation
    if (!phoneNumber || phoneNumber.length < 10) {
      setErrorMsg('Please supply a valid 10-digit mobile number.');
      return;
    }

    const success = await loginWithPhone(phoneNumber, roleOption);
    if (success) {
      setStep('otp');
      setResendTimer(30);
    } else {
      setErrorMsg('Failed to transmit OTP. Please try again.');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (otpValue.length !== 4) {
      setErrorMsg('The authentication verification pin code must contain exactly 4 digits.');
      return;
    }

    const correct = await verifyOtpAndLogin(phoneNumber, otpValue, roleOption);
    if (correct) {
      // Re-read user to check if profile is complete
      const stored = localStorage.getItem(`nuvvo_registered_${phoneNumber}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.isProfileComplete) {
          setCurrentPage('home');
          return;
        }
      }
      setStep('profile');
    } else {
      setErrorMsg('The verification OTP code is incorrect. Use "5555" for testing.');
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim() || !emailAddress.trim() || !flatNo.trim() || !area.trim()) {
      setErrorMsg('Complete all requested demographics and address markers to locate packages.');
      return;
    }

    const homeAddress: Address = {
      id: `addr_${Date.now()}`,
      type: 'Home',
      flatNo,
      area,
      landmark,
      city,
      gpsCoordinates: { lat: 17.4483 + (Math.random() - 0.5) * 0.01, lng: 78.3741 + (Math.random() - 0.5) * 0.01 }
    };

    completeUserProfile(fullName, emailAddress, homeAddress, language);
    setCurrentPage('home');
  };

  // Helper pre-fills for review tests
  const prefillTestNumber = (phone: string, role: string) => {
    setPhoneNumber(phone);
    setRoleOption(role);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-zinc-950 p-4 transition-colors duration-300">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden">
        
        {/* Banner with Logo branding */}
        <div className="bg-gradient-to-b from-[#FAF8F5] to-white dark:from-zinc-900 dark:to-zinc-950 p-6 text-center relative border-b dark:border-zinc-800">
          <div className="absolute top-4 right-4 text-zinc-300 dark:text-zinc-700 text-3xl opacity-30 select-none">✨</div>
          <NuvvoLogo size="md" showText={true} animate={false} />
          <p className="text-[9px] font-bold font-mono tracking-widest text-zinc-400 uppercase mt-2">{t.secureGateway}</p>
        </div>

        {/* Global Language Selector Bar at Registration & Login */}
        <div className="flex items-center justify-between px-5 py-2.5 bg-slate-50 dark:bg-zinc-850/80 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
            <Globe className="w-3.5 h-3.5 text-orange-500" />
            <span className="text-[10px] font-black uppercase tracking-wider font-mono">Language / భాష:</span>
          </div>
          <div className="flex items-center gap-1">
            {[
              { id: 'en', label: 'English', flag: '🇬🇧' },
              { id: 'te', label: 'తెలుగు', flag: '🇮🇳' },
              { id: 'hi', label: 'हिंदी', flag: '🇮🇳' }
            ].map(l => (
              <button
                key={l.id}
                type="button"
                onClick={() => setLanguage(l.id as any)}
                className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  language === l.id
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'bg-white dark:bg-zinc-800 text-zinc-650 dark:text-zinc-350 hover:bg-slate-200 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700'
                }`}
              >
                {l.flag} {l.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 text-rose-500 dark:text-rose-400 text-sm p-3 rounded-xl font-medium">
              ⚠️ {errorMsg}
            </div>
          )}

          {step === 'phone' && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Welcome to Nuvvo</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Enter your mobile number to instantly sign up or login with high secure OTP validation.</p>
              </div>

              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Mobile Number</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-bold font-mono text-sm">+91</span>
                    <input 
                      type="tel"
                      maxLength={10}
                      pattern="[0-9]{10}"
                      placeholder="Enter 10 digit number"
                      value={phoneNumber}
                      onChange={e => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full bg-slate-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 pl-14 pr-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 focus:outline-none focus:border-orange-500 text-base font-bold tracking-widest font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Testing Role Profile</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['Customer', 'Delivery Partner', 'Franchise', 'Admin'].map(role => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setRoleOption(role)}
                        className={`py-2 text-center text-xs font-bold rounded-xl border transition-all ${
                          roleOption === role 
                            ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/15'
                            : 'bg-slate-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700 hover:bg-slate-100'
                        }`}
                      >
                        {role.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-orange-500/10 flex items-center justify-center gap-2 mt-6 active:scale-98 cursor-pointer"
                >
                  <Phone className="w-5 h-5" />
                  Generate Security OTP
                </button>
              </form>

              {/* DEMO SHORTCUT HELPERS */}
              <div className="mt-8 border-t border-slate-100 dark:border-zinc-800 pt-5">
                <p className="text-[10px] font-bold font-mono tracking-widest text-zinc-400 dark:text-zinc-500 uppercase text-center mb-3">Instant Demo Credentials</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button 
                    type="button" 
                    onClick={() => prefillTestNumber('9999911111', 'Customer')}
                    className="p-2.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-zinc-700 dark:text-zinc-300 rounded-xl font-semibold text-left flex items-center justify-between"
                  >
                    <span>Regular Customer</span>
                    <span className="text-[10px] bg-slate-200 dark:bg-zinc-700 px-1.5 py-0.5 rounded text-zinc-500">Auto</span>
                  </button>
                  <button 
                    type="button" 
                    onClick={() => prefillTestNumber('9063692135', 'Super Admin')}
                    className="p-2.5 bg-orange-50 dark:bg-zinc-800 hover:bg-orange-100 border border-orange-100 dark:border-zinc-700 text-orange-600 dark:text-amber-400 rounded-xl font-semibold text-left flex items-center justify-between"
                  >
                    <div>
                      <span className="block font-bold">Admin Cell</span>
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">9063692135</span>
                    </div>
                    <span className="text-[10px] bg-orange-100 dark:bg-zinc-700 px-1.5 py-0.5 rounded text-orange-500 font-bold">Admin</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'otp' && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Enter Verification Code</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">We have piped a secure SMS message to phone register cell <span className="font-bold text-zinc-800 dark:text-zinc-200 font-mono">+91 {phoneNumber}</span>.</p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">SMS Pass Code</label>
                    {smsDetected && (
                      <span className="text-emerald-500 text-[10px] font-bold flex items-center gap-1">
                        <Sparkles className="w-3 h-3 animate-spin" /> SMS Auto-Detected
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
                    <input 
                      type="text"
                      maxLength={4}
                      pattern="[0-9]{4}"
                      placeholder="Enter 4 digit OTP"
                      value={otpValue}
                      onChange={e => setOtpValue(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full bg-slate-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 focus:outline-none focus:border-orange-500 text-center text-xl font-extrabold tracking-widest font-mono"
                    />
                  </div>
                  <p className="text-zinc-400 text-[10px] text-right mt-1">Simulated fallback test OTP is <span className="font-mono font-bold text-orange-500">5555</span></p>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  Verify One-Time Passcode
                </button>
              </form>

              <div className="flex items-center justify-between mt-6 text-xs text-zinc-500 dark:text-zinc-400">
                <button 
                  type="button" 
                  onClick={() => setStep('phone')}
                  className="text-orange-500 hover:underline font-bold"
                >
                  Edit phone cell
                </button>
                <span>
                  {resendTimer > 0 ? (
                    `Request new OTP in ${resendTimer}s`
                  ) : (
                    <button 
                      type="button" 
                      onClick={() => { loginWithPhone(phoneNumber, roleOption); setResendTimer(30); }}
                      className="text-orange-500 hover:underline font-bold"
                    >
                      Resend SMS OTP
                    </button>
                  )}
                </span>
              </div>
            </motion.div>
          )}

          {step === 'profile' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{t.createProfile}</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{t.profileSubtitle}</p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                {/* Language Choice Tile in Profile Registration */}
                <div className="bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200/80 dark:border-orange-900/40 p-3 rounded-2xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-orange-800 dark:text-orange-300 uppercase tracking-wider flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-orange-500" /> {t.selectLanguage}
                    </label>
                    <span className="text-[9px] bg-orange-200 dark:bg-orange-900/60 text-orange-900 dark:text-orange-200 px-1.5 py-0.2 rounded font-bold">
                      {language === 'te' ? 'తెలుగు' : language === 'hi' ? 'हिंदी' : 'English'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    {[
                      { id: 'te', label: 'తెలుగు', sub: 'Telugu', badge: 'ఆంధ్రప్రదేశ్' },
                      { id: 'en', label: 'English', sub: 'Global', badge: 'Standard' },
                      { id: 'hi', label: 'हिंदी', sub: 'Hindi', badge: 'भारतीय' }
                    ].map(l => (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => setLanguage(l.id as any)}
                        className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                          language === l.id
                            ? 'bg-white dark:bg-zinc-800 border-orange-500 text-orange-600 dark:text-orange-400 shadow-sm ring-2 ring-orange-500/20 font-black'
                            : 'bg-white/60 dark:bg-zinc-900/60 border-slate-200 dark:border-zinc-800 text-zinc-650 dark:text-zinc-400 font-bold hover:border-slate-300'
                        }`}
                      >
                        <span className="block text-xs font-black">{l.label}</span>
                        <span className="block text-[8.5px] opacity-75">{l.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">{t.fullName}</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
                    <input 
                      type="text"
                      placeholder={t.fullNamePlaceholder}
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 focus:outline-none focus:border-orange-500 text-sm font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">{t.emailAddress}</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
                    <input 
                      type="email"
                      placeholder={t.emailPlaceholder}
                      value={emailAddress}
                      onChange={e => setEmailAddress(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 focus:outline-none focus:border-orange-500 text-sm font-semibold"
                    />
                  </div>
                </div>

                {/* Address Group */}
                <div className="border-t border-slate-100 dark:border-zinc-800 pt-4 mt-2">
                  <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-orange-500" /> {t.primaryDeliverySetup}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-0.5">{t.flatNo}</label>
                      <input 
                        type="text" 
                        placeholder="Penthouse 4B" 
                        value={flatNo}
                        onChange={e => setFlatNo(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 focus:outline-none focus:border-orange-500 text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-0.5">{t.landmark}</label>
                      <input 
                        type="text" 
                        placeholder="Near Clock Tower" 
                        value={landmark}
                        onChange={e => setLandmark(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 focus:outline-none focus:border-orange-500 text-xs font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-0.5">{t.areaStreet}</label>
                    <input 
                      type="text" 
                      placeholder="Chirala Main Road" 
                      value={area}
                      onChange={e => setArea(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 focus:outline-none focus:border-orange-500 text-xs font-semibold"
                    />
                  </div>

                  <div className="mt-2 text-xs">
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-0.5">{t.city}</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                      <select 
                        value={city}
                        onChange={e => setCity(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 pl-10 pr-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 focus:outline-none focus:border-orange-500 font-bold"
                      >
                        <option value="Chirala">Chirala</option>
                        <option value="Bapatla">Bapatla</option>
                        <option value="Ongole">Ongole</option>
                        <option value="Guntur">Guntur</option>
                        <option value="Vijayawada">Vijayawada</option>
                        <option value="Hyderabad">Hyderabad</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white py-3 rounded-xl font-bold transition-all shadow-lg cursor-pointer active:scale-98 mt-4"
                >
                  {t.saveAndStart}
                </button>
              </form>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
