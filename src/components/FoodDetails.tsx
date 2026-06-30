/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'motion/react';
import { Star, Clock, X, Flame, ShieldAlert, BadgeInfo, CheckCircle, Sparkles, ChevronLeft } from 'lucide-react';
import { VegIndicator } from '../types';

export default function FoodDetails() {
  const { selectedFoodItem, setSelectedFoodItem, addToCart, cart, updateCartQuantity } = useApp();
  const [spice, setSpice] = useState<'None' | 'Medium' | 'High'>('Medium');
  const [extraCheese, setExtraCheese] = useState(false);
  const [addedNotice, setAddedNotice] = useState(false);

  // AI Story and visual preparation state
  const [aiStory, setAiStory] = useState<string | null>(null);
  const [aiPrep, setAiPrep] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (!selectedFoodItem) return;

    setAiStory(null);
    setAiPrep(null);
    setAiLoading(true);

    let active = true;

    fetch('/api/food-story', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ foodItem: selectedFoodItem })
    })
      .then(res => res.json())
      .then(data => {
        if (!active) return;
        if (data.story && data.visualPrep) {
          setAiStory(data.story);
          setAiPrep(data.visualPrep);
        }
      })
      .catch(err => {
        console.error("Failed to load AI Food Story:", err);
      })
      .finally(() => {
        if (active) setAiLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedFoodItem]);

  if (!selectedFoodItem) return null;

  const itemInCart = cart.find(c => c.foodItem.id === selectedFoodItem.id);
  const qty = itemInCart ? itemInCart.quantity : 0;

  const handleAddToCartWithCustomizations = () => {
    const customOptionsSelected: any = {
      'Spice Level': { name: `${spice} Spice`, price: 0 }
    };
    if (extraCheese) {
      customOptionsSelected['Extra Cheese / Topping'] = { name: 'Double Mozzarella crust', price: 50 };
    }
    
    // Add additional base price if cheese selected
    const modifiedPriceItem = {
      ...selectedFoodItem,
      price: selectedFoodItem.price + (extraCheese ? 50 : 0),
      discountPrice: selectedFoodItem.discountPrice ? selectedFoodItem.discountPrice + (extraCheese ? 50 : 0) : undefined
    };

    addToCart(modifiedPriceItem, customOptionsSelected);
    setAddedNotice(true);
    setTimeout(() => {
      setAddedNotice(false);
    }, 2000);
  };

  return (
    <div 
      onClick={() => setSelectedFoodItem(null)}
      className="fixed inset-0 bg-zinc-950/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-t-3xl sm:rounded-3xl border border-slate-100 dark:border-zinc-805 overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
      >
        
        {/* Header Block with Image */}
        <div className="relative h-48 sm:h-56 bg-zinc-100 dark:bg-zinc-800">
          <img 
            src={selectedFoodItem.image} 
            alt={selectedFoodItem.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <button 
            onClick={() => setSelectedFoodItem(null)}
            className="absolute top-4 left-4 p-2 bg-zinc-900/80 hover:bg-zinc-900 text-white rounded-full transition shadow-md cursor-pointer z-10"
            title="Back to Catalog"
            id="food-details-back-btn"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setSelectedFoodItem(null)}
            className="absolute top-4 right-4 p-2 bg-zinc-900/80 hover:bg-zinc-900 text-white rounded-full transition shadow-md cursor-pointer z-10"
            title="Close"
            id="food-details-close-btn"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Veg tag */}
          <span className="absolute bottom-3 left-4 shadow-md bg-white p-1 rounded-lg flex items-center justify-center">
            {selectedFoodItem.vegIndicator === VegIndicator.VEG ? (
              <span className="veg-icon"><span className="veg-dot" /></span>
            ) : (
              <span className="nonveg-icon"><span className="nonveg-dot" /></span>
            )}
          </span>
        </div>

        {/* Content body (Scrollable) */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight leading-snug">
                {selectedFoodItem.name}
              </h2>
              <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-lg text-xs font-bold text-amber-700 dark:text-amber-400">
                <Star className="w-3.5 h-3.5 fill-amber-500" /> {selectedFoodItem.rating}
              </div>
            </div>
            
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 pb-3 border-b border-slate-50 dark:border-zinc-800">
              {selectedFoodItem.description}
            </p>
          </div>

          {/* Prep time block */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-zinc-800/50 p-3 rounded-2xl border border-slate-100 dark:border-zinc-800">
            <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
              <Clock className="w-4 h-4 text-orange-500" />
              <span>Prep duration: <strong className="text-zinc-900 dark:text-white">{selectedFoodItem.prepTime} mins</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
              <Flame className="w-4 h-4 text-orange-500" />
              <span>Spice parameter: <strong className="text-zinc-900 dark:text-white">{selectedFoodItem.spiceLevel}</strong></span>
            </div>
          </div>

          {/* AI FOOD STORY SECTION */}
          <div className="bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 border border-purple-500/20 rounded-2xl p-4.5 space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 animate-pulse" />
                <span className="text-[10px] font-mono tracking-widest text-purple-600 dark:text-purple-400 uppercase font-black">AI Culinary Storyteller</span>
              </div>
              <span className="text-[8px] bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">Gemini 3.5</span>
            </div>

            {aiLoading ? (
              <div className="py-6 flex flex-col items-center justify-center gap-2">
                <div className="flex space-x-1.5">
                  <div className="w-2.5 h-2.5 bg-purple-500 dark:bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2.5 h-2.5 bg-purple-500 dark:bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2.5 h-2.5 bg-purple-500 dark:bg-purple-400 rounded-full animate-bounce"></div>
                </div>
                <span className="text-[10px] text-zinc-400 font-mono animate-pulse">Whispering recipes with Gemini...</span>
              </div>
            ) : aiStory ? (
              <div className="space-y-3">
                <div className="space-y-1">
                  <span className="text-[9px] text-zinc-400 font-mono tracking-wider uppercase font-bold block">Culinary Story</span>
                  <p className="text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed font-serif italic pl-2.5 border-l-2 border-purple-500/40">
                    "{aiStory}"
                  </p>
                </div>
                
                {aiPrep && (
                  <div className="space-y-1.5 pt-2 border-t border-purple-500/10">
                    <span className="text-[9px] text-zinc-400 font-mono tracking-wider uppercase font-bold block">Chef's Prep Secret</span>
                    <div className="text-[11px] text-zinc-700 dark:text-zinc-300 space-y-1 font-mono leading-snug">
                      {aiPrep.split('\n').filter(line => line.trim()).map((line, idx) => (
                        <div key={idx} className="flex items-start gap-1.5">
                          <span className="text-purple-500 flex-shrink-0 mt-0.5 text-xs">✦</span>
                          <span>{line.replace(/^•\s*/, '')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-[10px] text-zinc-400 text-center py-2 font-mono">Unable to retrieve flavor profile.</p>
            )}
          </div>

          {/* CUSTOMIZATIONS */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold font-mono tracking-widest text-zinc-400 dark:text-zinc-500 uppercase">Customization Preferences</h3>
            
            {/* Spice levels toggler */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">Set Kitchen Spice Level</label>
              <div className="grid grid-cols-3 gap-2">
                {(['None', 'Medium', 'High'] as const).map(lev => (
                  <button
                    key={lev}
                    type="button"
                    onClick={() => setSpice(lev)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      spice === lev 
                        ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                        : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700 hover:bg-slate-50'
                    }`}
                  >
                    {lev} Spice
                  </button>
                ))}
              </div>
            </div>

            {/* Extra Cheese add-on check */}
            <div className="flex items-center justify-between p-3 bg-white dark:bg-zinc-800 border rounded-2xl">
              <div>
                <p className="text-xs font-extrabold text-zinc-900 dark:text-zinc-150">Load Double Mozzarella Cheese Add-on</p>
                <p className="text-[10px] text-zinc-400 mt-0.5">Extra high-melt Italian mozzarella shreds</p>
              </div>
              <button
                type="button"
                onClick={() => setExtraCheese(!extraCheese)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-all ${
                  extraCheese ? 'bg-orange-500 justify-end' : 'bg-slate-200 dark:bg-zinc-700 justify-start'
                }`}
              >
                <motion.div layout className="bg-white w-4.5 h-4.5 rounded-full shadow-md" />
              </button>
            </div>
          </div>

          {/* INGREDIENTS LIST */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold font-mono tracking-widest text-zinc-400 dark:text-zinc-500 uppercase">Ecosystem Core Ingredients</h3>
            <div className="flex flex-wrap gap-1.5">
              {selectedFoodItem.ingredients.map((ing, idx) => (
                <span 
                  key={idx}
                  className="bg-slate-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[10px] px-2.5 py-1 rounded-lg font-mono font-bold"
                >
                  ✓ {ing}
                </span>
              ))}
            </div>
          </div>

          {/* CUSTOMER SATISFACTION VERIFICATION */}
          <div className="bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20 text-[11px] text-emerald-600 dark:text-emerald-400 flex items-start gap-2">
            <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block text-xs font-black">Nuvvo Certified Standards</strong>
              We use 100% natural, unbleached, and non-frozen ingredients to handspin high artisan culinary masterpieces.
            </div>
          </div>
        </div>

        {/* Footer controls */}
        <div className="bg-slate-50 dark:bg-zinc-950 p-4 border-t border-slate-100 dark:border-zinc-850 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-zinc-400">Total payable</span>
            <span className="text-lg font-black text-zinc-900 dark:text-zinc-100 font-mono">
              ₹{(selectedFoodItem.discountPrice || selectedFoodItem.price) + (extraCheese ? 50 : 0)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {qty > 0 && (
              <div className="flex items-center bg-zinc-900 dark:bg-zinc-850 text-white px-2.5 py-1.5 rounded-xl gap-3 text-sm">
                <button onClick={() => updateCartQuantity(selectedFoodItem.id, -1)} className="p-1 hover:bg-zinc-800 rounded">
                  -
                </button>
                <span className="font-bold">{qty}</span>
                <button onClick={() => updateCartQuantity(selectedFoodItem.id, 1)} className="p-1 hover:bg-zinc-800 rounded">
                  +
                </button>
              </div>
            )}
            
            <button
              onClick={handleAddToCartWithCustomizations}
              className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs px-6 py-3.5 rounded-xl shadow-lg shadow-orange-500/15 flex items-center gap-1.5 cursor-pointer active:scale-98"
            >
              {addedNotice ? (
                <>
                  <CheckCircle className="w-4 h-4" /> Added to basket!
                </>
              ) : (
                'Add Customs to Cart'
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
