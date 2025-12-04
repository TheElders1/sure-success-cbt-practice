import { Link } from 'react-router-dom';
import { Phone, Info, HelpCircle, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-brand-primary to-brand-hover text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col items-center gap-4">
          <p className="text-center font-semibold">
            Sure Success CBT - Practice Makes Perfect
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link
              to="/contact"
              className="flex items-center gap-2 hover:text-white/80 transition-colors"
            >
              <Phone size={16} />
              <span>Contact</span>
            </Link>
            <Link
              to="/about"
              className="flex items-center gap-2 hover:text-white/80 transition-colors"
            >
              <Info size={16} />
              <span>About</span>
            </Link>
            <Link
              to="/help"
              className="flex items-center gap-2 hover:text-white/80 transition-colors"
            >
              <HelpCircle size={16} />
              <span>Help</span>
            </Link>
          </div>

          <div className="border-t border-white/20 w-full pt-4 mt-2">
            <div className="flex flex-col items-center gap-2 text-sm text-white/80">
              <p>&copy; 2025 Sure Success CBT Practice. All rights reserved.</p>
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
