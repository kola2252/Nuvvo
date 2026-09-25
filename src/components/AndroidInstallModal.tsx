/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Smartphone, Download, ExternalLink, CheckCircle, Copy, 
  Sparkles, Layers, ShieldCheck, ArrowRight, Laptop, HelpCircle
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface AndroidInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AndroidInstallModal({ isOpen, onClose }: AndroidInstallModalProps) {
  const { isInstallable, isInstalled, isAndroid, isIOS, install } = usePWAInstall();
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState<'instant' | 'github' | 'apk' | 'capacitor'>('instant');
  const [installStatus, setInstallStatus] = useState<'idle' | 'success' | 'dismissed'>('idle');

  if (!isOpen) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://nuvvo.app';
  const pwaBuilderUrl = `https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(currentOrigin)}`;
  const githubActionsUrl = 'https://github.com/kola2252/Nuvvo/actions';

  const capacitorCommands = `# Run build & sync code into Android project
npm run cap:build

# Open project directly in Android Studio
npm run cap:open

# Inside Android Studio:
# Click: Build -> Build Bundle(s) / APK(s) -> Build APK(s)
# Your APK will be at: android/app/build/outputs/apk/debug/app-debug.apk`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      setInstallStatus('success');
      setTimeout(() => {
        onClose();
      }, 2000);
    } else {
      setInstallStatus('dismissed');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-120 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fadeIn">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-5 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-2xl shadow-inner">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight leading-tight">Android App & APK Center</h3>
                <p className="text-xs text-orange-100 font-medium">Install Nuvvo natively on Android or generate APK</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              aria-label="Close Android Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/60 p-1.5 gap-1.5 overflow-x-auto">
            <button
              onClick={() => setActiveTab('instant')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0 ${
                activeTab === 'instant' 
                  ? 'bg-white dark:bg-zinc-800 text-orange-600 dark:text-orange-400 shadow-sm' 
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Instant WebAPK</span>
            </button>
            <button
              onClick={() => setActiveTab('github')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0 ${
                activeTab === 'github' 
                  ? 'bg-white dark:bg-zinc-800 text-orange-600 dark:text-orange-400 shadow-sm' 
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <Download className="w-3.5 h-3.5 text-purple-500" />
              <span>GitHub Actions (.apk)</span>
            </button>
            <button
              onClick={() => setActiveTab('apk')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0 ${
                activeTab === 'apk' 
                  ? 'bg-white dark:bg-zinc-800 text-orange-600 dark:text-orange-400 shadow-sm' 
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>PWABuilder</span>
            </button>
            <button
              onClick={() => setActiveTab('capacitor')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0 ${
                activeTab === 'capacitor' 
                  ? 'bg-white dark:bg-zinc-800 text-orange-600 dark:text-orange-400 shadow-sm' 
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>Android Studio CLI</span>
            </button>
          </div>

          {/* Body Content */}
          <div className="p-5 overflow-y-auto space-y-5 text-zinc-700 dark:text-zinc-200 text-xs">
            
            {activeTab === 'instant' && (
              <div className="space-y-4">
                <div className="p-4 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/50 rounded-2xl flex gap-3.5 items-start">
                  <div className="p-2 bg-orange-500 text-white rounded-xl shrink-0 mt-0.5">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">Native Android WebAPK Installation</h4>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                      Android automatically generates and signs an official <strong>WebAPK</strong> package directly on your device. Once installed, Nuvvo launches in full-screen standalone mode from your Android App Drawer, operates offline, and supports fast push notifications.
                    </p>
                  </div>
                </div>

                {isInstalled ? (
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <div>
                      <p className="font-bold text-emerald-800 dark:text-emerald-200 text-xs">Nuvvo is already installed on this device!</p>
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">Running in native standalone application mode.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {isInstallable ? (
                      <button
                        onClick={handleInstallClick}
                        className="w-full py-3.5 px-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer transition active:scale-98"
                      >
                        <Smartphone className="w-4.5 h-4.5" />
                        <span>Install Nuvvo on Android Device Now</span>
                      </button>
                    ) : (
                      <div className="p-4 bg-slate-50 dark:bg-zinc-800/60 rounded-2xl border border-slate-200 dark:border-zinc-700/60 space-y-2">
                        <div className="flex items-center gap-2 font-bold text-zinc-800 dark:text-zinc-200">
                          <HelpCircle className="w-4 h-4 text-orange-500" />
                          <span>How to install on Android Chrome:</span>
                        </div>
                        <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-zinc-600 dark:text-zinc-400 pl-1">
                          <li>Open this page on your Android device in <strong>Chrome</strong> or <strong>Samsung Internet</strong>.</li>
                          <li>Tap the browser menu icon (<strong>⋮</strong> three dots top-right).</li>
                          <li>Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
                          <li>Android will compile and install the <strong>Nuvvo WebAPK</strong> to your home screen!</li>
                        </ol>
                      </div>
                    )}

                    {installStatus === 'success' && (
                      <p className="text-emerald-600 dark:text-emerald-400 font-bold text-center">
                        ✔ App installed successfully! Check your home screen.
                      </p>
                    )}
                  </div>
                )}

                {/* Features List */}
                <div className="grid grid-cols-2 gap-2.5 pt-2">
                  <div className="p-3 bg-slate-50 dark:bg-zinc-800/40 rounded-xl border border-slate-100 dark:border-zinc-800 flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">✔</span>
                    <span className="text-[11px] font-semibold">Zero Storage Bloat (&lt; 2MB)</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-zinc-800/40 rounded-xl border border-slate-100 dark:border-zinc-800 flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">✔</span>
                    <span className="text-[11px] font-semibold">Offline Caching & Menu</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-zinc-800/40 rounded-xl border border-slate-100 dark:border-zinc-800 flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">✔</span>
                    <span className="text-[11px] font-semibold">Live GPS & Real-time Orders</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-zinc-800/40 rounded-xl border border-slate-100 dark:border-zinc-800 flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">✔</span>
                    <span className="text-[11px] font-semibold">Auto-updates seamlessly</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'github' && (
              <div className="space-y-4">
                <div className="p-4 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50 rounded-2xl flex gap-3.5 items-start">
                  <div className="p-2 bg-purple-600 text-white rounded-xl shrink-0 mt-0.5">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">Automated GitHub Actions APK Builder</h4>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                      We have pre-configured an automated Android build workflow (<code className="font-mono text-purple-600 dark:text-purple-400">.github/workflows/build-apk.yml</code>) inside your repository. GitHub's cloud runners will compile Gradle and generate your ready-to-install <strong>Nuvvo-Android-Debug.apk</strong> with 0 local setup!
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">GitHub Repository:</span>
                    <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 rounded font-mono text-[10px] font-bold">kola2252/Nuvvo</span>
                  </div>
                  <a
                    href={githubActionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-purple-500/20 cursor-pointer transition active:scale-98"
                  >
                    <span>Open GitHub Actions to Build & Download APK</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-zinc-800/60 rounded-2xl border border-slate-200 dark:border-zinc-700/60 space-y-2">
                  <p className="font-bold text-zinc-800 dark:text-zinc-200">How to get your APK in 3 clicks:</p>
                  <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-zinc-600 dark:text-zinc-400 pl-1">
                    <li>Click the purple button above to go to <strong>GitHub Actions</strong>.</li>
                    <li>Select <strong>"Build Android APK"</strong> from the left sidebar and click <strong>"Run workflow"</strong>.</li>
                    <li>When the checkmark turns green, click into the run and download the <strong>Nuvvo-Android-Debug-APK</strong> zip file containing your ready-to-install Android APK!</li>
                  </ol>
                </div>
              </div>
            )}

            {activeTab === 'apk' && (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-2xl flex gap-3.5 items-start">
                  <div className="p-2 bg-blue-500 text-white rounded-xl shrink-0 mt-0.5">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">1-Click APK Generator (PWABuilder)</h4>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                      Google and Microsoft partner tool <strong>PWABuilder</strong> packages this live PWA with its registered manifest, 512px maskable icons, and service worker into a signed <strong>.APK</strong> file and <strong>.AAB</strong> bundle ready for direct side-loading or Google Play Store distribution.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">Production Web Manifest:</span>
                    <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded font-mono text-[10px] font-bold">100% PWA Compliant</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Target URL: <code className="bg-slate-200 dark:bg-zinc-700 px-1.5 py-0.5 rounded text-[10px] font-mono text-zinc-800 dark:text-zinc-200">{currentOrigin}</code>
                  </p>
                  <a
                    href={pwaBuilderUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 cursor-pointer transition active:scale-98"
                  >
                    <span>Generate Android APK on PWABuilder</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 space-y-1">
                  <p className="font-bold text-zinc-700 dark:text-zinc-300">How to generate APK in 3 steps:</p>
                  <p>1. Click the button above to load Nuvvo in PWABuilder.</p>
                  <p>2. Click <strong>"Package for Stores"</strong> &rarr; Choose <strong>"Android"</strong>.</p>
                  <p>3. Download the generated <strong>.apk</strong> and install on any Android phone!</p>
                </div>
              </div>
            )}

            {activeTab === 'capacitor' && (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl flex gap-3.5 items-start">
                  <div className="p-2 bg-emerald-500 text-white rounded-xl shrink-0 mt-0.5">
                    <Laptop className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">Build Standalone APK using Capacitor</h4>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                      If you have cloned the repository locally (<code className="font-mono text-orange-600">kola2252/Nuvvo</code>), you can compile a full release or debug APK in Android Studio with these 4 commands:
                    </p>
                  </div>
                </div>

                <div className="relative rounded-2xl bg-zinc-950 text-zinc-100 p-4 font-mono text-[11px] overflow-x-auto shadow-inner border border-zinc-800">
                  <button
                    onClick={() => copyToClipboard(capacitorCommands)}
                    className="absolute top-3 right-3 p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-sans font-bold flex items-center gap-1 transition cursor-pointer"
                  >
                    {copiedCode ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                  </button>
                  <pre className="pr-16 leading-relaxed whitespace-pre-wrap">{capacitorCommands}</pre>
                </div>

                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Tip: In Android Studio, go to <strong>Build &rarr; Build Bundle(s) / APK(s) &rarr; Build APK(s)</strong> to export <code className="text-orange-500">app-debug.apk</code> or <code className="text-orange-500">app-release.apk</code>.
                </p>
              </div>
            )}

          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 dark:bg-zinc-950/80 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
              Compatible with Android 8.0 through Android 15+
            </span>
            <button
              onClick={onClose}
              className="py-2 px-4 rounded-xl bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-bold text-xs cursor-pointer transition"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
