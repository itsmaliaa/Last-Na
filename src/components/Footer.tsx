import React from 'react';
import { RedNexusLogo } from './RedNexusLogo';
import { ShieldCheck } from 'lucide-react';

interface FooterProps {
  variant?: 'cafa' | 'buyer';
}

export const Footer: React.FC<FooterProps> = ({ variant = 'cafa' }) => {
  return (
    <footer className="w-full bg-[#8E141A] text-white pt-14 pb-8 border-t border-red-900/40 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12">
          {/* Brand Info */}
          <div className="space-y-4">
            <RedNexusLogo whiteText={true} size="md" />
            <p className="text-xs text-white/80 leading-relaxed max-w-sm">
              An e-commerce marketplace powered by the Central Academy of Fine Arts (CAFA) student community. Curating true creative expressions straight from the studio.
            </p>
            {variant === 'buyer' && (
              <div className="flex items-center gap-2 text-xs text-white/90 pt-2 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                <span>Secure checkout · Verified artists · Buyer support</span>
              </div>
            )}
          </div>

          {/* Acquire Art */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white tracking-wider uppercase">Acquire Art</h4>
            <ul className="space-y-2 text-xs text-white/80">
              <li><a href="#paintings" className="hover:text-white transition-colors">Paintings</a></li>
              <li><a href="#sculptures" className="hover:text-white transition-colors">Sculptures</a></li>
              <li><a href="#photography" className="hover:text-white transition-colors">Photography</a></li>
              <li><a href="#digital" className="hover:text-white transition-colors">Digital works</a></li>
            </ul>
          </div>

          {/* Programs or Buyer Care */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white tracking-wider uppercase">
              {variant === 'buyer' ? 'Buyer Care' : 'Programs'}
            </h4>
            <ul className="space-y-2 text-xs text-white/80">
              {variant === 'buyer' ? (
                <>
                  <li><a href="#track" className="hover:text-white transition-colors">Track Order</a></li>
                  <li><a href="#returns" className="hover:text-white transition-colors">Returns</a></li>
                  <li><a href="#manage-address" className="hover:text-white transition-colors">Manage Address</a></li>
                  <li><a href="#safety" className="hover:text-white transition-colors">Safety Center</a></li>
                </>
              ) : (
                <>
                  <li><a href="#architecture" className="hover:text-white transition-colors">Architecture</a></li>
                  <li><a href="#interior" className="hover:text-white transition-colors">Interior Design</a></li>
                  <li><a href="#fine-arts" className="hover:text-white transition-colors">Fine Arts</a></li>
                  <li><a href="#painting" className="hover:text-white transition-colors">Painting</a></li>
                  <li><a href="#visual-communication" className="hover:text-white transition-colors">Visual Communication</a></li>
                </>
              )}
            </ul>
          </div>

          {/* Academy or Red Nexus */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white tracking-wider uppercase">
              {variant === 'buyer' ? 'Red Nexus' : 'Academy'}
            </h4>
            <ul className="space-y-2 text-xs text-white/80">
              <li><a href="#about" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#exhibitions" className="hover:text-white transition-colors">Exhibitions Calendar</a></li>
              <li><a href="#inquiries" className="hover:text-white transition-colors">Vocation & Inquiries</a></li>
              <li><a href="#support" className="hover:text-white transition-colors">Support Desk</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="pt-8 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/70">
          <p>
            {variant === 'buyer'
              ? '© 2026 Red Nexus ArtMart. Buyer-first and privacy-conscious.'
              : '© 2026 CAFA ArtMart. Powered safely by Central Academy of Fine Arts.'}
          </p>

          {/* Social Icons */}
          <div className="flex items-center gap-3">
            {/* Facebook */}
            <a href="#facebook" className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white" aria-label="Facebook">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            {/* Google / Web */}
            <a href="#web" className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white" aria-label="Google">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.067 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
              </svg>
            </a>
            {/* Instagram */}
            <a href="#instagram" className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white" aria-label="Instagram">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
