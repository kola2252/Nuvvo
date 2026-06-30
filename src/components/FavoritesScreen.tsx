/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Heart, Star, ShoppingBag, Trash, HeartCrack, ChevronLeft, X } from 'lucide-react';
import { VegIndicator } from '../types';

export default function FavoritesScreen() {
  const { 
    favoriteFoods, favoriteRestaurants, 
    foodCatalog, restaurants, 
    addToCart, toggleFavoriteFood, toggleFavoriteRestaurant,
    setSelectedFoodItem,
    pageHistory, goBack, closePage
  } = useApp();

  const [activeTab, setActiveTab] = useState<'dishes' | 'restaurants'>('dishes');

  // Query catalog data
  const favDishes = foodCatalog.filter(item => favoriteFoods.includes(item.id));
  const favRests = restaurants.filter(item => favoriteRestaurants.includes(item.id));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 pb-32 duration-300">
      
      {/* Upper header */}
      <div className="sticky top-0 bg-white dark:bg-zinc-900 border-b border-slate-100 dark:border-zinc-800 p-4 z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={pageHistory.length > 1 ? goBack : closePage}
            className="p-1.5 bg-slate-150 dark:bg-zinc-800 hover:bg-slate-250 dark:hover:bg-zinc-700 rounded-full text-zinc-700 dark:text-zinc-300 transition-all cursor-pointer active:scale-95 flex items-center justify-center shrink-0"
            title="Go Back"
            id="favorites-screen-back-btn"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={closePage}
            className="p-1.5 bg-slate-150 dark:bg-zinc-800 hover:bg-slate-250 dark:hover:bg-zinc-700 rounded-full text-zinc-700 dark:text-zinc-300 transition-all cursor-pointer active:scale-95 flex items-center justify-center shrink-0"
            title="Close to Home"
            id="favorites-screen-close-btn"
          >
            <X className="w-4 h-4" />
          </button>
          <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight flex items-center gap-1.5 ml-1">
            <Heart className="w-5.5 h-5.5 text-red-500 fill-red-500" /> Favorites Vault
          </h2>
        </div>
        <span className="text-xs bg-red-50 dark:bg-red-950/20 text-red-500 px-3 py-1 rounded-full font-bold">
          {favDishes.length + favRests.length} Saved
        </span>
      </div>

      <div className="p-4 max-w-lg mx-auto space-y-4">
        
        {/* Tab slider switches */}
        <div className="flex bg-slate-100 dark:bg-zinc-900 p-1 rounded-2xl border">
          <button
            onClick={() => setActiveTab('dishes')}
            className={`flex-1 py-2.5 text-center text-xs font-bold rounded-xl transition ${
              activeTab === 'dishes' 
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-sm'
                : 'text-zinc-500 dark:text-zinc-400'
            }`}
          >
            Dishes ({favDishes.length})
          </button>
          <button
            onClick={() => setActiveTab('restaurants')}
            className={`flex-1 py-2.5 text-center text-xs font-bold rounded-xl transition ${
              activeTab === 'restaurants' 
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-sm'
                : 'text-zinc-500 dark:text-zinc-400'
            }`}
          >
            Restaurants ({favRests.length})
          </button>
        </div>

        {activeTab === 'dishes' ? (
          favDishes.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-zinc-900 border rounded-3xl p-6">
              <HeartCrack className="w-12 h-12 text-zinc-300 mx-auto mb-2" />
              <p className="text-sm font-extrabold text-zinc-800 dark:text-zinc-200">No favorite meals saved.</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Tap the heart button on any of Nuvvo's 200 items to quick-add.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {favDishes.map(food => (
                <div 
                  key={food.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFoodItem(food);
                  }}
                  className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-3 flex gap-3 shadow-sm relative cursor-pointer hover:shadow-md transition"
                >
                  <img 
                    src={food.image} 
                    alt={food.name}
                    className="w-20 h-20 rounded-xl object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 flex flex-col justify-between overflow-hidden">
                    <div>
                      <div className="flex items-center gap-1.5">
                        {food.vegIndicator === VegIndicator.VEG ? (
                          <span className="veg-icon shrink-0"><span className="veg-dot" /></span>
                        ) : (
                          <span className="nonveg-icon shrink-0"><span className="nonveg-dot" /></span>
                        )}
                        <h4 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 truncate">{food.name}</h4>
                      </div>
                      <p className="text-[10px] text-zinc-400 uppercase font-mono font-bold mt-0.5">{food.category}</p>
                    </div>

                    <div className="flex items-center justify-between mt-2.5">
                      <span className="text-sm font-black text-zinc-855 dark:text-zinc-50 font-mono">₹{food.discountPrice || food.price}</span>
                      
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavoriteFood(food.id);
                          }}
                          className="p-1 text-zinc-400 hover:text-red-500"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(food);
                          }}
                          className="bg-orange-500 text-white font-extrabold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-orange-600 uppercase"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" /> ADD
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          favRests.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-zinc-900 border rounded-3xl p-6">
              <HeartCrack className="w-12 h-12 text-zinc-300 mx-auto mb-2" />
              <p className="text-sm font-extrabold text-zinc-800 dark:text-zinc-200">No favorite culinary partners saved.</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Tap the heart icon on standard kitchens shown on the home dashboard.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {favRests.map(rest => (
                <div 
                  key={rest.id}
                  className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-3 flex gap-3 shadow-sm"
                >
                  <img 
                    src={rest.image} 
                    alt={rest.name}
                    className="w-20 h-20 rounded-xl object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 flex flex-col justify-between overflow-hidden">
                    <div>
                      <h4 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 truncate">{rest.name}</h4>
                      <p className="text-[10px] text-zinc-400 truncate">{rest.cuisines.join(', ')}</p>
                    </div>

                    <div className="flex items-center justify-between mt-2 text-xs">
                      <span className="flex items-center gap-0.5 text-emerald-600 font-bold">
                        <Star className="w-3.5 h-3.5 fill-current" /> {rest.rating}
                      </span>
                      <button
                        onClick={() => toggleFavoriteRestaurant(rest.id)}
                        className="text-xs text-red-500 font-bold"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

      </div>
    </div>
  );
}
