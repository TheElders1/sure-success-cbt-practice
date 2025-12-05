import { Link } from 'react-router-dom';
import { Phone, Info, HelpCircle, Heart, Megaphone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-br from-brand-primary via-brand-hover to-brand-primary text-white mt-auto overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>

      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>

      <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>

      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-8 left-1/4 w-20 h-20 border-2 border-white rounded-full animate-pulse"></div>
        <div className="absolute bottom-8 right-1/3 w-16 h-16 border-2 border-white rounded-lg rotate-45 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-1/2 right-1/4 w-12 h-12 border-2 border-white rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center gap-6">
          <div className="text-center">
            <p className="text-xl font-bold tracking-wide mb-1">
              Sure Success CBT
            </p>
            <p className="text-sm text-white/80 font-medium">
              Practice Makes Perfect
            </p>
          </div>

          <div className="w-full max-w-3xl">
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6">
              <Link
                to="/announcements"
                className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 hover:scale-105 transition-all duration-300 border border-white/20 group shadow-lg"
              >
                <Megaphone size={18} className="group-hover:rotate-12 transition-transform duration-300" />
                <span className="font-medium">Announcements</span>
              </Link>
              <Link
                to="/contact"
                className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 hover:scale-105 transition-all duration-300 border border-white/20 group shadow-lg"
              >
                <Phone size={18} className="group-hover:rotate-12 transition-transform duration-300" />
                <span className="font-medium">Contact</span>
              </Link>
              <Link
                to="/about"
                className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 hover:scale-105 transition-all duration-300 border border-white/20 group shadow-lg"
              >
                <Info size={18} className="group-hover:rotate-12 transition-transform duration-300" />
                <span className="font-medium">About</span>
              </Link>
              <Link
                to="/help"
                className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 hover:scale-105 transition-all duration-300 border border-white/20 group shadow-lg"
              >
                <HelpCircle size={18} className="group-hover:rotate-12 transition-transform duration-300" />
                <span className="font-medium">Help</span>
              </Link>
            </div>
          </div>

          <div className="relative w-full max-w-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent h-px"></div>
          </div>

          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-white/90">
              <span className="text-sm font-medium">Made with</span>
              <Heart size={16} className="fill-red-400 text-red-400 animate-pulse" />
              <span className="text-sm font-medium">for students</span>
            </div>
            <p className="text-sm text-white/70">
              &copy; 2025 The Elders DEV. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
