import { type JSX } from "react";

export default function PublicFooter(): JSX.Element {
  return (
    <footer className="border-t border-white/10 bg-[#081a1f]">
        <div className="mt-3 border-t border-white/10 pt-3 text-center text-xs text-white/50">
          Copyright � 2026 | Powered by TechNest
        </div>
    </footer>
  );
}
