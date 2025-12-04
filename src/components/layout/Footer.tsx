import { Link } from 'react-router-dom';
import { Phone, Info, HelpCircle, Heart, Megaphone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-r from-brand-primary to-brand-hover text-white mt-auto overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col items-center gap-4">
          <p className="text-center font-semibold">
            Sure Success CBT - Practice Makes Perfect
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link
              to="/announcements"
              className="flex items-center gap-2 hover:text-yellow-200 hover:scale-105 transition-all duration-300 group"
            >
              <Megaphone size={16} className="group-hover:rotate-12 transition-transform duration-300" />
              <span>Announcements</span>
            </Link>
            <Link
              to="/contact"
              className="flex items-center gap-2 hover:text-yellow-200 hover:scale-105 transition-all duration-300 group"
            >
              <Phone size={16} className="group-hover:rotate-12 transition-transform duration-300" />
              <span>Contact</span>
            </Link>
            <Link
              to="/about"
              className="flex items-center gap-2 hover:text-yellow-200 hover:scale-105 transition-all duration-300 group"
            >
              <Info size={16} className="group-hover:rotate-12 transition-transform duration-300" />
              <span>About</span>
            </Link>
            <Link
              to="/help"
              className="flex items-center gap-2 hover:text-yellow-200 hover:scale-105 transition-all duration-300 group"
            >
              <HelpCircle size={16} className="group-hover:rotate-12 transition-transform duration-300" />
              <span>Help</span>
            </Link>
          </div>

          <div className="border-t border-white/20 w-full pt-4 mt-2">
            <div className="flex flex-col items-center gap-2 text-sm text-white/80">
              <p>&copy; 2025 The Elders DEV. All rights reserved.</p>
              <div className="flex items-center gap-1">
                <span>Made with</span>
                <Heart size={14} className="fill-red-400 text-red-400" />
                <span>for students</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
