import { type JSX } from "react";

export default function PublicFooter(): JSX.Element {
  return (
    <footer className="border-t border-white/10 bg-[#081a1f]">
      <div className="mx-auto max-w-6xl px-4 py-4">
        <nav className="flex flex-wrap items-center justify-center gap-6 text-xs text-white/60">
          <span className="hover:text-white transition">Home</span>
          <span className="hover:text-white transition">Shop</span>
          <span className="hover:text-white transition">About Us</span>
          <span className="hover:text-white transition">Offer</span>
          <span className="hover:text-white transition">Testimonials</span>
          <span className="hover:text-white transition">Contact Us</span>
        </nav>
        <div className="mt-3 border-t border-white/10 pt-3 text-center text-xs text-white/50">
          Copyright © 2026 | Powered by TechNest
        </div>
      </div>
    </footer>
  );
}
