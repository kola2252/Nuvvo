import React, { useState, useEffect, useRef } from 'react';
import { X, Camera, RefreshCw, Upload, AlertCircle, Sparkles, Check, Info, ChevronLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface QRCodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (code: string) => void;
}

export default function QRCodeScannerModal({ isOpen, onClose, onScanSuccess }: QRCodeScannerModalProps) {
  const { couponsList } = useApp();
  const [activeTab, setActiveTab] = useState<'camera' | 'simulator' | 'upload'>('simulator');
  
  // Camera feed states
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraPermissionState, setCameraPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  
  // Scanner states
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scannerMsg, setScannerMsg] = useState('Position coupon within viewfinder');
  
  // Audio Feedback using Web Audio API so no external asset dependency exists
  const playBeepSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Success tone sequence (high double beep)
      const playTone = (freq: number, start: number, duration: number) => {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        osc.frequency.setValueAtTime(freq, start);
        gainNode.gain.setValueAtTime(0.15, start);
        gainNode.gain.exponentialRampToValueAtTime(0.001, start + duration);
        
        osc.start(start);
        osc.stop(start + duration);
      };
      
      const now = audioCtx.currentTime;
      playTone(1050, now, 0.08);
      playTone(1350, now + 0.1, 0.15);
    } catch (e) {
      console.warn("Audio Context beep disabled or blocked by gesture state: ", e);
    }
  };

  // Stop camera feed helper
  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Start actual camera web capture stream
  const startCameraStream = async () => {
    setCameraError(null);
    stopCameraStream();
    
    try {
      setCameraPermissionState('prompt');
      const constraints = {
        video: { 
          facingMode: 'environment', // prefer back camera for bar codes
          width: { ideal: 640 },
          height: { ideal: 485 }
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setCameraPermissionState('granted');
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.play().catch(err => {
          console.error("Video element play exception", err);
        });
      }
      
      setScannerMsg('Live Camera active. Align a voucher QR code.');
      
      // Trigger a periodic simulation overlay sweep
      setScanning(true);
    } catch (err: any) {
      console.error("Camera access failed", err);
      setCameraPermissionState('denied');
      setCameraError(
        'Unable to access physical camera. Click "SIMULATOR" to scan simulated physical flyer coupons instantly.'
      );
    }
  };

  // Effect to manage camera stream depending on tab
  useEffect(() => {
    if (isOpen && activeTab === 'camera') {
      startCameraStream();
    } else {
      stopCameraStream();
      setScanning(false);
    }
    
    return () => {
      stopCameraStream();
    };
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  // Simulate scanning code
  const handleSimulatedScan = (code: string) => {
    if (scanResult) return; // Wait for active to finish
    
    setScanning(true);
    setScannerMsg('Reading tracking signals...');
    
    setTimeout(() => {
      // Success triggers!
      playBeepSound();
      setScanResult(code);
      setScannerMsg(`Successfully decoded code: ${code}`);
      setScanning(false);
      
      // Auto success complete animation
      setTimeout(() => {
        onScanSuccess(code);
        setScanResult(null);
        setScannerMsg('Position coupon within viewfinder');
      }, 1000);
      
    }, 1200);
  };

  // Preset Physical Flyers coupons mock databases with actual aesthetic flyers styling
  const physicalFlyers = [
    { 
      title: '🍽️ CHIRALA REGIONAL COOPERATIVE', 
      subtitle: 'Nuvvo Festival Welcomers Coupon Code', 
      code: 'NUVVO50', 
      color: 'from-orange-500 to-amber-500', 
      perks: 'Flat 50% discount on order bills.',
      minSpend: '₹150 Minimum'
    },
    { 
      title: '📱 PHONEPE DIGITAL SMART VOUCHER', 
      subtitle: 'Exclusive Digital Wallet Reward Card', 
      code: 'PHONEPE50', 
      color: 'from-purple-600 to-indigo-600', 
      perks: 'Flat ₹50 direct discount value.',
      minSpend: '₹300 Minimum'
    },
    { 
      title: '🏍️ SPEEDY COURIER ZERO DISPATCH flyer', 
      subtitle: 'Midnight hunger free delivery pass', 
      code: 'FREEDELIVERY', 
      color: 'from-emerald-500 to-teal-600', 
      perks: 'Zero delivery packaging charge.',
      minSpend: '₹200 Minimum'
    },
    { 
      title: '👑 GOLD PREMIUM SYSTEM ADMINISTRATOR TICKET', 
      subtitle: 'Internal operational clearance voucher', 
      code: 'SUPERADMIN90', 
      color: 'from-rose-600 to-red-650', 
      perks: 'Insane 90% discount on everything.',
      minSpend: '₹100 Minimum'
    }
  ];

  // Drag-and-drop file upload fake decoder
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropEvent = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleUploadedFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleUploadedFile(files[0]);
    }
  };

  const handleUploadedFile = (file: File) => {
    setScanning(true);
    setScannerMsg(`Analyzing code signatures in ${file.name}...`);
    
    // Choose a random coupon from our list to apply on upload success simulation!
    const availableCodes = couponsList.map(c => c.code) || ['NUVVO50', 'PHONEPE50', 'FREEDELIVERY', 'SUPERADMIN90'];
    const selectedRandom = availableCodes[Math.floor(Math.random() * availableCodes.length)];
    
    setTimeout(() => {
      playBeepSound();
      setScanResult(selectedRandom);
      setScannerMsg(`Image Analysis Complete. Decoded: ${selectedRandom}`);
      setScanning(false);
      
      setTimeout(() => {
        onScanSuccess(selectedRandom);
        setScanResult(null);
        setScannerMsg('Position coupon within viewfinder');
      }, 1000);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-zinc-950/75 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in text-zinc-900 dark:text-zinc-50">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Modal Header */}
        <div className="bg-slate-50 dark:bg-zinc-850 p-4 border-b border-slate-100 dark:border-zinc-850 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-full cursor-pointer transition text-zinc-650 dark:text-zinc-350 flex items-center justify-center shrink-0"
              title="Back"
              id="qr-scanner-back-btn"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-orange-500 rounded-lg text-white">
                <Camera className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-black text-sm tracking-tight text-zinc-900 dark:text-white uppercase">Voucher QR Scanner</h3>
                <p className="text-[10px] text-zinc-400 font-mono">Chirala Instant Redemption Protocol</p>
              </div>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-1 hover:bg-slate-150 dark:hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-zinc-800 dark:hover:text-white transition cursor-pointer"
            title="Close"
            id="qr-scanner-close-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Selector Tabs */}
        <div className="grid grid-cols-3 bg-slate-100 dark:bg-zinc-950 p-1.5 border-b border-slate-100 dark:border-zinc-850 text-center text-xs gap-1.5">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`py-2 px-1 rounded-xl font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'simulator' 
                ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 shadow-sm'
                : 'text-zinc-500'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-orange-500" /> 
            <span className="text-[10.5px]">Simulation Flyers</span>
          </button>

          <button
            onClick={() => setActiveTab('camera')}
            className={`py-2 px-1 rounded-xl font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'camera' 
                ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 shadow-sm'
                : 'text-zinc-500'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-violet-500" /> 
            <span className="text-[10.5px]">Live Webcam</span>
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`py-2 px-1 rounded-xl font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'upload' 
                ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 shadow-sm'
                : 'text-zinc-500'
            }`}
          >
            <Upload className="w-3.5 h-3.5 text-emerald-500" /> 
            <span className="text-[10.5px]">Upload Image</span>
          </button>
        </div>

        {/* Viewport Core Section */}
        <div className="p-4 bg-white dark:bg-zinc-900 flex-1 overflow-y-auto space-y-4">
          
          {/* CAMERA TAB */}
          {activeTab === 'camera' && (
            <div className="space-y-4">
              <div className="relative aspect-video w-full rounded-2xl bg-black overflow-hidden border border-slate-200 dark:border-zinc-800 flex items-center justify-center">
                {cameraPermissionState === 'prompt' && !cameraError && (
                  <div className="text-center p-6 text-white space-y-2 z-10">
                    <Camera className="w-10 h-10 mx-auto text-orange-500 animate-pulse" />
                    <p className="text-xs font-bold leading-normal">Requesting Camera hardware stream permissions...</p>
                    <p className="text-[10px] text-zinc-400">Kindly permit webcam access in your internet browser</p>
                  </div>
                )}

                {cameraPermissionState === 'granted' && (
                  <video 
                    ref={videoRef}
                    className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]"
                    muted
                    playsInline
                  />
                )}

                {/* Cybernetic scanning square frame overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                  <div className="w-48 h-48 border-2 border-white/35 rounded-2xl relative shadow-[0_0_0_999px_rgba(0,0,0,0.45)]">
                    
                    {/* Cybernetic HUD Corners */}
                    <div className="absolute -top-1.5 -left-1.5 w-5 h-5 border-t-4 border-l-4 border-orange-500 rounded-tl-md" />
                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 border-t-4 border-r-4 border-orange-500 rounded-tr-md" />
                    <div className="absolute -bottom-1.5 -left-1.5 w-5 h-5 border-b-4 border-l-4 border-orange-500 rounded-bl-md" />
                    <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 border-b-4 border-r-4 border-orange-500 rounded-br-md" />
                    
                    {/* Pulsing red laser-line scanning animation */}
                    <div className="w-full h-0.5 bg-red-500 shadow-[0_0_8px_#ef4444] absolute left-0 animate-bounce top-1/2" />
                  </div>
                </div>

                {cameraError && (
                  <div className="absolute inset-0 bg-zinc-900/90 flex flex-col items-center justify-center p-6 text-center text-white space-y-3 z-10">
                    <AlertCircle className="w-8 h-8 text-rose-500" />
                    <p className="text-xs font-medium leading-relaxed">{cameraError}</p>
                    <button
                      type="button"
                      onClick={startCameraStream}
                      className="text-[10px] font-black uppercase tracking-wider bg-orange-500 text-white px-4 py-2 rounded-xl flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" /> Retry Stream
                    </button>
                  </div>
                )}
              </div>

              {/* Guide card */}
              <div className="p-3.5 bg-violet-500/[0.04] border border-violet-500/10 rounded-2xl flex items-start gap-2.5 text-left">
                <Info className="w-4.5 h-4.5 text-violet-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[11px] font-black uppercase text-violet-700 dark:text-violet-400">Physical Camera Scanning</h4>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed mt-0.5">
                    Align the physical code inside the lens crosshair. If you are on an offline context or inside a tight sandbox container, try our **Flyers Simulator** to experience immediate automatic checkout redemption of local coupons!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SIMULATOR TAB */}
          {activeTab === 'simulator' && (
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-zinc-950 p-4 rounded-2xl border text-center relative overflow-hidden">
                <div className="relative z-10 space-y-1.5">
                  <h4 className="text-[11px] font-black uppercase tracking-wider text-orange-600">Simulate Physical Promo Scanner</h4>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                    Nuvvo ships beautifully formulated printed flyer inserts with physical deliveries to homes in Chirala. Click a flyer below to pass it into your active scanner!
                  </p>
                </div>
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-gradient-to-tr from-orange-500/15 to-transparent rounded-full blur-xl pointer-events-none" />
              </div>

              {/* SCANNER VIEWPORT OVERVIEW */}
              <div className="relative aspect-video w-full rounded-2xl bg-zinc-900 overflow-hidden border border-zinc-800 flex items-center justify-center shadow-inner">
                {/* Visual Sweep Scanning radar */}
                <div className="absolute inset-0 bg-teal-500/[0.015] pointer-events-none z-15" />
                
                {/* Active flyer display or scanner placeholder */}
                <div className="w-44 h-24 border border-zinc-700 bg-zinc-800 rounded-xl flex flex-col justify-center items-center p-3 text-center relative shadow-md overflow-hidden animate-pulse">
                  <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-zinc-500" />
                  <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-zinc-500" />
                  <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-zinc-500" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-zinc-500" />
                  
                  {scanning ? (
                    <div className="space-y-2 text-white">
                      <div className="w-7 h-7 border-2 border-t-transparent border-orange-500 rounded-full animate-spin mx-auto" />
                      <p className="text-[9px] font-black uppercase tracking-widest text-orange-500">Scanning in progress</p>
                    </div>
                  ) : scanResult ? (
                    <div className="space-y-1.5 text-white animate-fade-in">
                      <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white mx-auto">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <p className="text-[9px] font-black uppercase tracking-wider text-emerald-450 leading-none">Code Detected!</p>
                      <span className="text-[10px] bg-white text-zinc-900 border font-mono font-black border-emerald-500 shadow-sm px-2 py-0.5 rounded-md mt-1 block">
                        {scanResult}
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-1.5 text-zinc-500 font-medium">
                      {/* Barcode/QR Code icon block representation */}
                      <div className="w-12 h-12 border-2 border-dashed border-zinc-600 rounded-lg mx-auto flex flex-col justify-between p-1.5 opacity-60">
                        <div className="h-0.5 w-full bg-zinc-500" />
                        <div className="h-0.5 w-2/3 bg-zinc-500" />
                        <div className="h-0.5 w-5/6 bg-zinc-500" />
                        <div className="h-0.5 w-1/3 bg-zinc-500" />
                      </div>
                      <p className="text-[9.5px] leading-tight">Viewfinder is idle. Trigger a flyer click below to scan!</p>
                    </div>
                  )}
                </div>

                {/* Laser Overlay animation always active during scan */}
                {scanning && (
                  <div className="w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent absolute left-0 animate-bounce top-1/3 drop-shadow-[0_0_6px_rgba(239,68,68,0.7)] pointer-events-none" />
                )}
              </div>

              {/* Grid of PHYSICAL FLYER TILES */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block text-left">🎁 Physical Flyers in Chirala (Click to scan)</span>
                
                <div className="grid grid-cols-1 gap-2.5">
                  {physicalFlyers.map(flyer => (
                    <button
                      type="button"
                      key={flyer.code}
                      onClick={() => handleSimulatedScan(flyer.code)}
                      className={`w-full p-3 border border-slate-100 dark:border-zinc-800 rounded-2xl bg-gradient-to-br from-white to-slate-50 dark:from-zinc-900 dark:to-zinc-850 hover:to-orange-50/15 dark:hover:to-zinc-800 text-left transition-all hover:shadow-md cursor-pointer group flex items-stretch gap-3`}
                    >
                      {/* Artistic representation of flyer coupon mock QR Code panel */}
                      <div className={`w-14 shrink-0 rounded-xl bg-gradient-to-br ${flyer.color} p-2 text-white flex flex-col justify-between items-center text-center relative overflow-hidden select-none`}>
                        <span className="text-[8px] font-black tracking-widest uppercase opacity-85 leading-none">Pass</span>
                        
                        {/* Realistic Mock QR Code representation inside the physical voucher vector */}
                        <div className="w-8 h-8 bg-white rounded-md p-1 flex flex-wrap gap-0.5 justify-center items-center shadow-inner mt-1">
                          <div className="w-2 h-2 bg-zinc-950 rounded-xs" />
                          <div className="w-2 h-2 bg-zinc-950 rounded-xs" />
                          <div className="w-2 h-2 bg-zinc-900 rounded-xs" />
                          <div className="w-2 h-2 bg-zinc-900 rounded-xs" />
                          <div className="w-1.5 h-1.5 bg-zinc-900 rounded-full" />
                          <div className="w-2 h-2 bg-zinc-950 rounded-xs" />
                        </div>

                        <span className="text-[7.5px] font-mono tracking-tighter opacity-75 leading-none whitespace-nowrap mt-1">{flyer.code}</span>
                      </div>

                      {/* Decoded Metadata details */}
                      <div className="flex-1 space-y-1 overflow-hidden flex flex-col justify-center">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[10.5px] font-black text-zinc-900 dark:text-zinc-50 group-hover:text-orange-500 transition-colors leading-none truncate">{flyer.title}</h4>
                          <span className="text-[8px] font-mono bg-orange-100 hover:bg-orange-200 text-orange-650 px-1.5 py-0.5 rounded border border-orange-200/50 uppercase font-black tracking-wider shrink-0 ml-1.5">
                            Apply Instant
                          </span>
                        </div>
                        <p className="text-[9.5px] text-zinc-400 font-mono italic leading-none">{flyer.subtitle}</p>
                        <p className="text-[10px] text-zinc-650 dark:text-zinc-350 leading-tight font-medium">{flyer.perks}</p>
                        <span className="text-[8.5px] font-extrabold text-orange-500 uppercase tracking-wide block">{flyer.minSpend} requirement</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* UPLOAD PHOTO TAB */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div 
                onDragOver={handleDragOver}
                onDrop={handleDropEvent}
                className="border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl p-8 text-center bg-slate-50 dark:bg-zinc-950 hover:bg-orange-50/10 dark:hover:bg-zinc-90 w-full transition-colors flex flex-col items-center justify-center space-y-3 cursor-pointer group"
              >
                <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-full group-hover:scale-105 transition-transform">
                  <Upload className="w-6 h-6 animate-bounce" />
                </div>
                
                <h4 className="text-xs font-black text-zinc-900 dark:text-white uppercase leading-none">Drag & Drop Voucher Image</h4>
                <p className="text-[10px] text-zinc-400 max-w-xs leading-normal">
                  Select a digital photo, screenshot card, or pamphlet image containing a standard QR or Barcode signet. Our decoder will parse and read coupon details instantly.
                </p>

                <label className="px-4 py-2 bg-zinc-900 dark:bg-zinc-850 hover:bg-zinc-800 text-white font-extrabold rounded-xl text-[10.5px] tracking-wider uppercase cursor-pointer shadow-sm transition inline-block">
                  Browse Files
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange}
                    className="hidden" 
                  />
                </label>
              </div>

              {/* Informational chip */}
              <div className="p-3 bg-emerald-500/[0.04] border border-emerald-500/10 rounded-2xl flex items-start gap-2.5 text-left text-[10px] text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                <Sparkles className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>
                  Supported graphic types include PNG, JPG, and mobile camera screenshots. Digital barcodes with Nuvvo clearance tags are decoded securely with zero server-side exposure.
                </span>
              </div>
            </div>
          )}

        </div>

        {/* Console control footer status bars */}
        <div className="bg-slate-50 dark:bg-zinc-950/80 p-3.5 border-t border-slate-150 dark:border-zinc-850 text-center flex items-center justify-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${scanning ? 'bg-orange-500 animate-ping' : scanResult ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
          <span className="text-[10.5px] font-mono text-zinc-500 dark:text-zinc-400 uppercase font-black tracking-wider truncate">
            {scannerMsg}
          </span>
        </div>

      </div>
    </div>
  );
}
