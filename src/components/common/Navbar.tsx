"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Gem,
  ShoppingBag,
  Heart,
  Shield,
  LogOut,
  Menu,
  X,
  User as UserIcon,
  Package,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useCartStore } from "@/store/useCartStore";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CheckoutModal } from "@/components/checkout/CheckoutModal";
import { NavbarNotificationBell } from "@/components/common/NavbarNotificationBell";
import { useIsMounted } from "@/hooks/useIsMounted";

import { siteConfig } from "@/config/site.config";

export function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout, initialize } = useAuthStore();
  const { cart, wishlist, isCheckoutOpen, openCheckout, closeCheckout } =
    useCartStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const isMounted = useIsMounted();

  useEffect(() => {
    initialize();
  }, [initialize]);

  const activeAuth = isMounted && isAuthenticated;
  const activeUser = isMounted ? user : null;
  const isAdmin = activeAuth && activeUser?.role === "ADMIN";
  const cartCount = isMounted ? cart.length : 0;
  const wishlistCount = isMounted ? wishlist.length : 0;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-200/80 bg-white/80 backdrop-blur-md transition-all">
      <div className="w-full flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Identity: DarkGem */}
        <Link
          href="/"
          className="flex items-center gap-2.5 shrink-0 select-none group"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-900 text-stone-50 border border-stone-800 shadow-xs group-hover:scale-105 transition-transform duration-200">
            <Gem className="h-4.5 w-4.5 text-amber-200" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-serif text-sm sm:text-base lg:text-lg tracking-[0.12em] sm:tracking-[0.14em] font-bold text-stone-900 leading-none truncate">
              {siteConfig.brandName.toUpperCase()}
            </span>
            <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.18em] sm:tracking-[0.22em] text-stone-400 font-mono mt-0.5 truncate">
              Haute Gemology · Geneva
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-xs sm:text-sm font-medium whitespace-nowrap">
          <Link
            href="/diamonds"
            className={`whitespace-nowrap transition-colors hover:text-stone-900 ${
              pathname === "/diamonds"
                ? "text-stone-900 font-semibold"
                : "text-stone-600"
            }`}
          >
            All Diamonds
          </Link>

          <Link
            href="/about"
            className={`whitespace-nowrap transition-colors hover:text-stone-900 ${
              pathname === "/about"
                ? "text-stone-900 font-semibold"
                : "text-stone-600"
            }`}
          >
            About Us
          </Link>
          <Link
            href="/contact"
            className={`whitespace-nowrap transition-colors hover:text-stone-900 ${
              pathname === "/contact"
                ? "text-stone-900 font-semibold"
                : "text-stone-600"
            }`}
          >
            Contact & Help
          </Link>
          {activeAuth && !isAdmin && (
            <Link
              href="/orders"
              className={`whitespace-nowrap inline-flex items-center gap-1.5 transition-colors hover:text-stone-900 ${
                pathname.startsWith("/orders")
                  ? "text-stone-900 font-semibold"
                  : "text-stone-600"
              }`}
            >
              <Package className="h-3.5 w-3.5 text-stone-500" />
              <span>My Orders</span>
            </Link>
          )}
          {isAdmin && (
            <Link
              href="/admin"
              className={`whitespace-nowrap inline-flex items-center gap-1.5 transition-colors hover:text-stone-900 ${
                pathname.startsWith("/admin")
                  ? "text-stone-900 font-semibold"
                  : "text-stone-600"
              }`}
            >
              <Shield className="h-3.5 w-3.5 text-stone-600" />
              <span>Admin Portal</span>
            </Link>
          )}
        </nav>

        {/* Right Utility & Auth Controls */}
        <div className="hidden lg:flex items-center gap-2 xl:gap-3 shrink-0 whitespace-nowrap">
          {/* Wishlist Indicator - Dedicated /wishlist URL */}
          <Link
            href="/wishlist"
            className="relative p-2 text-stone-500 hover:text-stone-900 transition-colors rounded-lg hover:bg-stone-100/80"
            title="Saved Diamonds"
          >
            <Heart className="h-4.5 w-4.5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-100 text-[10px] font-bold text-rose-800 border border-rose-200">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart / Inquiry Indicator */}
          <button
            onClick={openCheckout}
            className="relative p-2 text-stone-500 hover:text-stone-900 transition-colors cursor-pointer rounded-lg hover:bg-stone-100/80"
            title="Private Vault / Cart"
          >
            <ShoppingBag className="h-4.5 w-4.5" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-stone-900 text-[10px] font-bold text-stone-50">
                {cartCount}
              </span>
            )}
          </button>

          {/* Concierge Inquiries Notifications */}
          {activeAuth && <NavbarNotificationBell />}

          {/* User Auth Info */}
          {activeAuth && activeUser ? (
            <div className="flex items-center gap-2.5 pl-2.5 border-l border-stone-200">
              <div className="text-right">
                <div className="text-xs font-semibold text-stone-900 flex items-center gap-1.5 justify-end">
                  <span>{activeUser.name.split(" ")[0]}</span>
                  {isAdmin && (
                    <Badge
                      variant="gold"
                      className="text-[9px] py-0 px-1 font-mono"
                    >
                      ADMIN
                    </Badge>
                  )}
                </div>
                <div className="text-[10px] text-stone-400 truncate max-w-[110px]">
                  {activeUser.email}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                title="Sign Out"
                className="h-8 w-8 text-stone-400 hover:text-rose-600"
              >
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2.5 text-xs whitespace-nowrap"
                >
                  <UserIcon className="h-3.5 w-3.5 mr-1" />
                  <span>Sign In</span>
                </Button>
              </Link>
              {/* <Link href="/register">
                <Button
                  variant="luxury"
                  size="sm"
                  className="h-8 px-3 text-xs whitespace-nowrap"
                >
                  Direct Access
                </Button>
              </Link> */}
            </div>
          )}
        </div>

        {/* Mobile & Tablet Toggle Controls */}
        <div className="flex lg:hidden items-center gap-2">
          {activeAuth && <NavbarNotificationBell />}
          <button
            onClick={openCheckout}
            className="relative p-2 text-stone-600 hover:text-stone-900"
          >
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-stone-900 text-[10px] font-bold text-stone-50">
                {cartCount}
              </span>
            )}
          </button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="h-9 w-9"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-stone-200 bg-white px-4 sm:px-6 py-4 sm:py-5 space-y-4 animate-in slide-in-from-top duration-150 shadow-md pb-safe max-h-[calc(100vh-4rem)] overflow-y-auto">
          <nav className="flex flex-col space-y-2 text-sm">
            <Link
              href="/diamonds"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 text-stone-700 hover:text-stone-900 font-medium"
            >
              All Diamonds
            </Link>

            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 text-stone-700 hover:text-stone-900 font-medium"
            >
              About Us
            </Link>
            <Link
              href="/wishlist"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 text-stone-700 hover:text-stone-900 font-medium flex items-center justify-between"
            >
              <span>Wishlist</span>
              {wishlistCount > 0 && (
                <Badge variant="outline">{wishlistCount}</Badge>
              )}
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 text-stone-700 hover:text-stone-900 font-medium"
            >
              Contact & Help
            </Link>
            {activeAuth && !isAdmin && (
              <Link
                href="/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 text-stone-700 hover:text-stone-900 font-medium flex items-center gap-2"
              >
                <Package className="h-4 w-4 text-stone-600" />
                <span>My Orders & Tracking</span>
              </Link>
            )}
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 text-stone-700 hover:text-stone-900 font-medium flex items-center gap-2"
              >
                <Shield className="h-4 w-4 text-stone-600" />
                <span>Curator Admin Portal</span>
              </Link>
            )}
          </nav>

          <div className="pt-3 border-t border-stone-100">
            {activeAuth && activeUser ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-stone-900 text-xs">
                      {activeUser.name}
                    </div>
                    <div className="text-[11px] text-stone-500">
                      {activeUser.email}
                    </div>
                  </div>
                  <Badge variant={isAdmin ? "gold" : "outline"}>
                    {activeUser.role}
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-center text-xs"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                >
                  <LogOut className="h-3.5 w-3.5 mr-1.5" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="luxury" size="sm" className="w-full">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout & Vault Cart Modal */}
      <CheckoutModal isOpen={isCheckoutOpen} onClose={closeCheckout} />
    </header>
  );
}
