"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  X,
  Trash2,
  ArrowRight,
  ShieldCheck,
  BookOpen,
  Lock,
  Plus,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/lib/cart/CartContext";
import CheckoutModal from "@/components/CheckoutModal";
import { COURSES, type Course } from "@/data/courses";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function CartDrawer() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    addToCart,
    clearCart,
    totalAmount,
    checkoutCourse,
    setCheckoutCourse,
    openCheckout,
  } = useCart();

  const [checkoutToast, setCheckoutToast] = useState<string | null>(null);

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleStartCheckout = () => {
    if (cart.length === 0) return;
    openCheckout(cart[0]);
  };

  return (
    <>
      {/* Floating Toast Notification */}
      {checkoutToast && (
        <div className="fixed bottom-6 right-6 z-[60] px-5 py-3.5 rounded-2xl bg-[#14231E] border border-emerald-500/40 text-emerald-200 text-xs font-semibold shadow-2xl flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{checkoutToast}</span>
        </div>
      )}

      {/* Cart Drawer Backing & Panel */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
            />

            {/* Slide-out Drawer */}
            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 260 }}
                className="w-screen max-w-md bg-[#12151B] border-l border-white/10 text-white shadow-2xl flex flex-col justify-between"
              >
                {/* Drawer Header */}
                <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-white shadow-inner">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-white flex items-center gap-2">
                        <span>{t.cart.title}</span>
                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/10 text-emerald-400 border border-emerald-500/20">
                          {cart.length} {t.cart.coursesCount}
                        </span>
                      </h2>
                      <p className="text-xs text-gray-400">
                        {t.cart.readyToCheckout}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    aria-label="Tutup Keranjang"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Drawer Content */}
                <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
                  {cart.length === 0 ? (
                    <div className="py-12 text-center space-y-5">
                      <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-zinc-500">
                        <ShoppingBag className="w-8 h-8" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-base font-bold text-white">{t.cart.emptyTitle}</h3>
                        <p className="text-xs text-gray-400 max-w-xs mx-auto">
                          {t.cart.emptySubtitle}
                        </p>
                      </div>

                      {/* Recommended Courses to Add */}
                      {COURSES.filter((rec) => !cart.some((item) => item.id === rec.id || item.slug === rec.slug)).length > 0 && (
                        <div className="pt-4 text-left border-t border-white/10 space-y-3">
                          <span className="text-xs font-bold text-gray-300 block">
                            {t.cart.recommendedTitle}
                          </span>
                          <div className="space-y-2.5">
                            {COURSES.filter((rec) => !cart.some((item) => item.id === rec.id || item.slug === rec.slug))
                              .slice(0, 2)
                              .map((rec) => (
                                <div
                                  key={rec.id}
                                  className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-3 hover:border-white/20 transition-all"
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <img
                                      src={rec.thumbnail}
                                      alt={rec.title}
                                      className="w-12 h-9 rounded-lg object-cover ring-1 ring-white/10 shrink-0"
                                    />
                                    <div className="min-w-0">
                                      <h4 className="text-xs font-bold text-white truncate">{rec.title}</h4>
                                      <p className="text-[11px] font-mono text-emerald-400">
                                        {rec.price === 0 ? "FREE" : formatPrice(rec.price)}
                                      </p>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => addToCart(rec)}
                                    className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white text-white hover:text-black text-xs font-semibold flex items-center gap-1 transition-all shrink-0 cursor-pointer active:scale-95"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>{t.cart.select}</span>
                                  </button>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {cart.map((item) => (
                        <div
                          key={item.id}
                          className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all flex items-start justify-between gap-3"
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <img
                              src={item.thumbnail}
                              alt={item.title}
                              className="w-16 h-12 rounded-xl object-cover ring-1 ring-white/10 shrink-0"
                            />
                            <div className="space-y-1 min-w-0">
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 text-gray-300">
                                {item.level} • {item.software?.[0] || "BIM"}
                              </span>
                              <h3 className="text-xs font-bold text-white leading-snug line-clamp-2">
                                {item.title}
                              </h3>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-black text-white font-mono">
                                  {item.price === 0 ? "FREE" : formatPrice(item.price)}
                                </span>
                                {item.originalPrice && item.originalPrice > item.price && (
                                  <span className="text-[10px] text-gray-500 line-through font-mono">
                                    {formatPrice(item.originalPrice)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Remove button */}
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-1.5 rounded-xl text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0 cursor-pointer"
                            title={t.cart.removeTooltip}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Drawer Footer & Checkout Action */}
                {cart.length > 0 && (
                  <div className="p-5 sm:p-6 border-t border-white/10 bg-[#0F1115] space-y-4">
                    {/* Price Breakdown */}
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between text-gray-400">
                        <span>{t.cart.totalCourses} ({cart.length} item)</span>
                        <span className="font-mono text-gray-200">{formatPrice(totalAmount)}</span>
                      </div>
                      <div className="flex items-center justify-between text-gray-400">
                        <span>{t.cart.adminFee}</span>
                        <span className="font-mono text-emerald-400 font-bold">Rp 0 ({t.cart.free})</span>
                      </div>
                      <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                        <span className="text-sm font-bold text-white">{t.cart.totalPayment}</span>
                        <span className="text-lg font-black text-white font-mono">
                          {formatPrice(totalAmount)}
                        </span>
                      </div>
                    </div>

                    {/* Trust badges */}
                    <div className="flex items-center justify-center gap-4 text-[11px] text-gray-400 pt-1">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{t.cart.trustVerification}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-gray-400" />
                        <span>{t.cart.trustAccess}</span>
                      </div>
                    </div>

                    {/* Checkout CTA */}
                    <button
                      onClick={handleStartCheckout}
                      className="w-full py-3.5 px-6 rounded-2xl bg-white hover:bg-zinc-200 text-black text-sm font-bold flex items-center justify-center gap-2 shadow-xl transition-all active:scale-98 cursor-pointer"
                    >
                      <span>{t.cart.checkoutBtn}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Checkout Modal */}
      <CheckoutModal
        course={checkoutCourse}
        isOpen={!!checkoutCourse}
        onClose={() => setCheckoutCourse(null)}
        onSuccess={() => {
          clearCart();
          setCheckoutToast(
            language === "en"
              ? `Payment submitted for "${checkoutCourse?.title}". Waiting for admin approval!`
              : `Bukti transfer pembayaran berhasil dikirim! Menunggu verifikasi admin.`
          );
          setTimeout(() => {
            setCheckoutToast(null);
            router.push("/profile?tab=transactions");
          }, 1500);
        }}
      />
    </>
  );
}
