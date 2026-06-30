/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  History, RefreshCw, ChevronDown, CheckCircle, Search, Calendar, 
  MapPin, ShoppingBag, Receipt, ChevronUp, Clock, AlertCircle, Star, Download
} from 'lucide-react';
import { Order } from '../types';
import { downloadOrderInvoice } from '../utils/orderInvoiceGenerator';

export default function OrderHistory() {
  const { 
    user, orders, reorderItems, changeOrderStatus, setCurrentPage, submitOrderRating 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  // Local states for custom interactive user feedback on delivered items
  const [ratingStates, setRatingStates] = useState<{
    [orderId: string]: { rating: number; hoverRating: number; feedback: string }
  }>({});

  const setRatingForOrder = (orderId: string, value: number) => {
    setRatingStates(prev => ({
      ...prev,
      [orderId]: {
        ...(prev[orderId] || { hoverRating: 0, feedback: '' }),
        rating: value
      }
    }));
  };

  const setHoverRatingForOrder = (orderId: string, value: number) => {
    setRatingStates(prev => ({
      ...prev,
      [orderId]: {
        ...(prev[orderId] || { rating: 0, feedback: '' }),
        hoverRating: value
      }
    }));
  };

  const setFeedbackForOrder = (orderId: string, value: string) => {
    setRatingStates(prev => ({
      ...prev,
      [orderId]: {
        ...(prev[orderId] || { rating: 0, hoverRating: 0 }),
        feedback: value
      }
    }));
  };

  // Set up an active ticker for real-time cancellation grace period display
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!user) {
    return (
      <div className="bg-white dark:bg-zinc-900 border rounded-3xl p-6 shadow-sm text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
          <History className="w-6 h-6" />
        </div>
        <h5 className="text-xs font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">Account Required</h5>
        <p className="text-[11px] text-zinc-450 dark:text-zinc-400">Please log in to view your personalized interactive order history and express checkout.</p>
      </div>
    );
  }

  const userOrders = orders
    .filter(o => o.customerPhone === user.phone)
    .slice()
    .reverse();

  // Filter orders by search terms (order id, food item names, category)
  const filteredOrders = userOrders.filter(order => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    if (order.id.toLowerCase().includes(q)) return true;
    if (order.status.toLowerCase().includes(q)) return true;
    return order.items.some(item => 
      item.foodItem.name.toLowerCase().includes(q) || 
      item.foodItem.category.toLowerCase().includes(q)
    );
  });

  const toggleExpandOrder = (id: string) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'cancelled':
        return 'bg-rose-500/10 text-rose-600 border-rose-500/20';
      case 'on_the_way':
      case 'delivery':
      case 'active':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20 animate-pulse';
      case 'preparing':
      case 'ordered':
      default:
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
    }
  };

  return (
    <div id="order-history" className="bg-white dark:bg-zinc-900 border rounded-3xl p-5 shadow-sm space-y-4">
      {/* HEADER ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-orange-500" />
          <h4 className="text-xs font-black text-zinc-950 dark:text-zinc-50 tracking-tight uppercase">
            Order Journey & History
          </h4>
          <span className="text-[10px] bg-slate-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-450 font-mono font-black uppercase px-2 py-0.5 rounded-md border">
            {userOrders.length} Completed
          </span>
        </div>

        {/* COMPACT SEARCH FILTER OVERLAY */}
        {userOrders.length > 0 && (
          <div className="relative max-w-xs w-full sm:w-48">
            <input
              type="text"
              placeholder="Search dishes, bills..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-zinc-850 pl-7 pr-2 py-1 bg-white text-[10px] rounded-xl border border-slate-205 dark:border-zinc-800 font-bold focus:outline-none focus:border-orange-500 transition-all text-zinc-800 dark:text-zinc-100 placeholder-zinc-400"
            />
            <Search className="w-3 h-3 text-zinc-400 absolute left-2.5 top-2.5" />
          </div>
        )}
      </div>

      {userOrders.length === 0 ? (
        <div className="py-8 text-center text-zinc-500 space-y-2 border border-dashed rounded-2xl p-4 bg-slate-50/50 dark:bg-zinc-850/10">
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
            <ShoppingBag className="w-5 h-5 text-zinc-400" />
          </div>
          <div>
            <h5 className="text-[11px] font-black text-zinc-700 dark:text-zinc-300 uppercase">No order history found</h5>
            <p className="text-[9.5px] text-zinc-450 mt-0.5">Explore our local specialties, place dynamic orders, and review detailed invoice breakdowns here.</p>
          </div>
          <button
            onClick={() => setCurrentPage('home')}
            className="text-[10px] bg-orange-500 text-white font-black px-3.5 py-1.5 rounded-xl uppercase tracking-wider hover:bg-orange-600 transition shadow-sm"
          >
            Go Browse Menu
          </button>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-6 text-center text-zinc-405">
          <AlertCircle className="w-5 h-5 text-zinc-400 mx-auto mb-1.5" />
          <p className="text-[10px] font-bold">No previous invoices match "{searchQuery}"</p>
          <button 
            onClick={() => setSearchQuery('')}
            className="text-[9px] text-orange-500 font-bold underline mt-1 block mx-auto cursor-pointer"
          >
            Clear Search Filter
          </button>
        </div>
      ) : (
        <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1 scrollbar-thin">
          {filteredOrders.map(order => {
            const isExpanded = expandedOrderId === order.id;
            const orderTime = new Date(order.date).getTime();
            const elapsed = now - orderTime;
            const canCancelLeftMs = 120000 - elapsed;
            const canCancel = (order.status === 'accepted' || order.status === 'preparing') && canCancelLeftMs > 0;
            const cancelMins = Math.floor(canCancelLeftMs / 60000);
            const cancelSecs = Math.floor((canCancelLeftMs % 60000) / 1000);
            const cancelTimeStr = `${cancelMins}:${cancelSecs.toString().padStart(2, '0')}`;
            
            return (
              <div 
                key={order.id} 
                className={`p-3.5 rounded-2xl border transition-all text-xs text-left relative space-y-3 ${
                  isExpanded
                    ? 'bg-orange-500/[0.015] dark:bg-orange-500/[0.005] border-orange-500/25 shadow-sm'
                    : 'bg-slate-50/60 dark:bg-zinc-850/40 border-slate-100 dark:border-zinc-800/80 hover:border-slate-200 dark:hover:border-zinc-750'
                }`}
              >
                {/* ID AND STATUS HEADER */}
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-[11px] text-zinc-900 dark:text-zinc-100 font-mono tracking-wide uppercase">
                        #{order.id.slice(-6).toUpperCase()}
                      </span>
                      <span className="text-[8px] bg-slate-200 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-400 font-bold px-1.5 py-0.2 rounded font-mono">
                        {order.items.reduce((sum, item) => sum + item.quantity, 0)} Items
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5 mt-1">
                      <div className="flex items-center gap-1.5 text-[9px] text-zinc-400 font-mono">
                        <Calendar className="w-2.5 h-2.5 text-zinc-400 shrink-0" />
                        <span>Placed: {new Date(order.date).toLocaleDateString()} {new Date(order.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      {order.scheduledTime && (
                        <div className="flex items-center gap-1.5 text-[9px] text-orange-600 dark:text-orange-400 font-mono font-bold">
                          <Clock className="w-2.5 h-2.5 text-orange-500 shrink-0" />
                          <span>Scheduled: {order.scheduledTime}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[8.5px] px-2 py-0.5 rounded-lg font-black border uppercase tracking-wider ${getStatusStyle(order.status)}`}>
                      {order.status}
                    </span>
                    <button
                      onClick={() => toggleExpandOrder(order.id)}
                      className="p-1 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded-lg transition cursor-pointer"
                      title={isExpanded ? "Collapse invoice details" : "Expand receipt breakdown"}
                    >
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-zinc-400" /> : <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />}
                    </button>
                  </div>
                </div>

                {/* PURCHASED ITEMS SKELETON WITH EXPANSION DETAIL SUPPORT */}
                <div className="space-y-1.5">
                  {order.items.map((cartItem, idx) => (
                    <div key={idx} className="flex justify-between items-start text-zinc-700 dark:text-zinc-200 text-[11px]">
                      <div className="max-w-[75%]">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${cartItem.foodItem.vegIndicator === 'Veg' ? 'bg-green-500' : 'bg-red-500'}`} />
                          <span className="font-semibold text-zinc-800 dark:text-zinc-250 truncate block">
                            {cartItem.foodItem.name}
                          </span>
                        </div>
                        {cartItem.selectedCustomizations && Object.keys(cartItem.selectedCustomizations).length > 0 && (
                          <p className="text-[9.5px] text-orange-500 italic ml-3">
                            └ {Object.entries(cartItem.selectedCustomizations).map(([k, v]: any) => `${v.name || v}`).join(', ')}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 font-mono text-[10.5px]">
                        <span className="text-zinc-400 font-bold">x{cartItem.quantity}</span>
                        <span className="font-extrabold text-zinc-800 dark:text-zinc-300 w-12 text-right">
                          ₹{(cartItem.foodItem.discountPrice || cartItem.foodItem.price) * cartItem.quantity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* EXPANDED DETAILED BILLING CARD AND PIN GRAPHICS */}
                {isExpanded && (
                  <div className="pt-3 border-t border-dashed border-slate-200 dark:border-zinc-800 space-y-3 text-[10px] animate-fadeIn">
                    {/* ACCURATE ADDRESS PIN RECEIVED */}
                    <div className="bg-slate-100/50 dark:bg-zinc-900 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800 flex items-start gap-2 text-[9.5px] text-zinc-500 dark:text-zinc-400">
                      <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="font-black text-zinc-800 dark:text-zinc-300 uppercase tracking-wide">Delivered Address:</span>
                        <p className="font-semibold">
                          {order.address.flatNo}, {order.address.area}, {order.address.landmark ? `${order.address.landmark}, ` : ''}{order.address.city}
                        </p>
                      </div>
                    </div>

                    {/* DYNAMIC RECEIPT CALCULATION NODES */}
                    <div className="bg-slate-100/30 dark:bg-zinc-900/50 p-3 rounded-xl border border-slate-100 dark:border-zinc-800 space-y-1.5 font-mono text-zinc-500 dark:text-zinc-420">
                      <div className="flex justify-between">
                        <span>Items Subtotal:</span>
                        <span className="font-black text-zinc-800 dark:text-zinc-300">₹{order.subtotal}</span>
                      </div>
                      {order.discount > 0 && (
                        <div className="flex justify-between text-emerald-650 dark:text-emerald-500 font-bold">
                          <span>Coupon Discount Applied:</span>
                          <span>- ₹{order.discount}</span>
                        </div>
                      )}
                      {order.pointsRedeemed !== undefined && order.pointsRedeemed > 0 && (
                        <div className="flex justify-between text-indigo-650 dark:text-indigo-400 font-bold">
                          <span>Loyalty Cashback Redeemed:</span>
                          <span>- ₹{order.pointsRedeemed}</span>
                        </div>
                      )}
                      {order.pointsEarned !== undefined && order.pointsEarned > 0 && (
                        <div className="flex justify-between text-emerald-650 dark:text-emerald-400 font-bold">
                          <span>Loyalty Points Awarded:</span>
                          <span>+ {order.pointsEarned} PTS</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Delivery & Packaging Fees:</span>
                        <span className="font-bold">₹{(order.deliveryFee || 0) + (order.packagingFee || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>LST Taxes & Handling:</span>
                        <span className="font-bold">₹{order.tax || 0}</span>
                      </div>
                      {order.tip > 0 && (
                        <div className="flex justify-between text-amber-500 font-bold">
                          <span>Driver Gratuity (Tip):</span>
                          <span>+ ₹{order.tip}</span>
                        </div>
                      )}
                      <div className="flex justify-between pt-1.5 border-t border-dashed border-slate-200 dark:border-zinc-805 text-zinc-800 dark:text-zinc-200 text-[10.5px] font-black">
                        <span className="uppercase tracking-wider flex items-center gap-1">
                          <Receipt className="w-3 h-3 text-zinc-400" /> Grand Total Paid:
                        </span>
                        <span>₹{order.finalAmount}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* FEEDBACK / RATING COMPONENT FOR DELIVERED/COMPLETED ORDERS */}
                {(order.status === 'delivered' || order.status.toLowerCase() === 'completed') && (
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800/80 space-y-2.5">
                    {order.rating ? (
                      /* Submitted Feedback Display */
                      <div className="bg-orange-50/50 dark:bg-orange-950/10 border border-orange-100/40 dark:border-orange-900/20 rounded-xl p-2.5 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-orange-600 dark:text-orange-400 font-mono tracking-wider flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-emerald-500" /> Feedback Received
                          </span>
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3.5 h-3.5 ${
                                  star <= (order.rating || 0)
                                    ? 'text-amber-500 fill-amber-500'
                                    : 'text-zinc-300 dark:text-zinc-700'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {order.feedback && (
                          <p className="text-[10.5px] text-zinc-650 dark:text-zinc-350 font-medium italic">
                            "{order.feedback}"
                          </p>
                        )}
                      </div>
                    ) : (
                      /* Interactive Rating Form */
                      <div className="bg-slate-50 dark:bg-zinc-900/60 border border-slate-100 dark:border-zinc-800/60 rounded-xl p-3 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <h5 className="text-[11px] font-extrabold text-zinc-800 dark:text-zinc-200 uppercase tracking-wide">
                              How was your food?
                            </h5>
                            <p className="text-[9.5px] text-zinc-405 mt-0.5">
                              Share your experience to help us improve the taste!
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 py-0.5">
                            {[1, 2, 3, 4, 5].map((star) => {
                              const orderState = ratingStates[order.id] || { rating: 0, hoverRating: 0, feedback: '' };
                              const isFilled = star <= (orderState.hoverRating || orderState.rating);
                              return (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setRatingForOrder(order.id, star)}
                                  onMouseEnter={() => setHoverRatingForOrder(order.id, star)}
                                  onMouseLeave={() => setHoverRatingForOrder(order.id, 0)}
                                  className="p-0.5 focus:outline-none transition-transform hover:scale-125 cursor-pointer"
                                >
                                  <Star
                                    className={`w-5 h-5 transition-colors ${
                                      isFilled
                                        ? 'text-amber-500 fill-amber-500'
                                        : 'text-zinc-300 dark:text-zinc-700'
                                    }`}
                                  />
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Expandable feedback comment input once rated */}
                        {(ratingStates[order.id]?.rating || 0) > 0 && (
                          <div className="space-y-2 animate-fadeIn">
                            <textarea
                              placeholder="Write a quick comment about the food quality, taste, or packaging (optional)..."
                              value={ratingStates[order.id]?.feedback || ''}
                              onChange={(e) => setFeedbackForOrder(order.id, e.target.value)}
                              rows={2}
                              className="w-full text-[10.5px] p-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-orange-500 transition-all font-medium placeholder-zinc-400"
                            />
                            <div className="flex justify-end">
                              <button
                                type="button"
                                onClick={() => {
                                  const s = ratingStates[order.id];
                                  if (s && s.rating > 0) {
                                    submitOrderRating(order.id, s.rating, s.feedback);
                                  }
                                }}
                                className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-[9.5px] px-3 py-1.5 rounded-lg uppercase tracking-wider transition-all shadow-xs active:scale-95 cursor-pointer"
                              >
                                Submit Review
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* BOTTOM COMPACT ROADBAR FOR TOTAL AMOUNT AND QUICK REORDER action */}
                <div className="flex justify-between items-center pt-2.5 border-t border-slate-200/50 dark:border-zinc-800/80">
                  <div>
                    <span className="text-[8.5px] text-zinc-400 uppercase font-mono tracking-wider block">Grand Amount</span>
                    <p className="text-xs font-black text-zinc-90 w-max font-mono leading-none mt-0.5 text-zinc-900 dark:text-zinc-100">
                      ₹{order.finalAmount}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {canCancel && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Do you really want to cancel Order #${order.id.slice(-6).toUpperCase()}? This will alert the kitchen to cease cooking and initialize refund processing.`)) {
                            changeOrderStatus(order.id, 'cancelled');
                          }
                        }}
                        className="flex items-center gap-1 bg-rose-500 hover:bg-rose-600 active:scale-[0.98] text-white font-black px-3 py-1.5 rounded-xl uppercase text-[9.5px] tracking-wider cursor-pointer shadow-xs border border-rose-500 transition-all shrink-0"
                      >
                        Cancel ({cancelTimeStr}) 🛑
                      </button>
                    )}
                    {(order.status === 'delivered' || order.status.toLowerCase() === 'completed') && (
                      <button
                        type="button"
                        onClick={() => {
                          downloadOrderInvoice(order);
                        }}
                        className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-800 dark:text-zinc-200 font-extrabold px-3 py-1.5 rounded-xl uppercase text-[9.5px] tracking-wider cursor-pointer shadow-xs border border-slate-200 dark:border-zinc-700 transition-all active:scale-[0.99] group"
                        title="Download official TAX Invoice PDF"
                      >
                        <Download className="w-3.5 h-3.5 text-orange-500 group-hover:translate-y-0.5 duration-200" />
                        <span>Download Invoice</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        reorderItems(order);
                        alert(`Invoice #${order.id.slice(-6).toUpperCase()} items successfully added to your active checkout list! Redirecting to Cart...`);
                      }}
                      className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white font-black px-3.5 py-1.5 rounded-xl uppercase text-[9.5px] tracking-wider cursor-pointer shadow-xs border border-orange-500 transition-all hover:scale-[1.01] active:scale-[0.99] group flex justify-center"
                    >
                      <RefreshCw className="w-3.5 h-3.5 group-hover:rotate-12 duration-200" />
                      <span>Reorder Basket</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
