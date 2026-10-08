import React from 'react';
import { Database, ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  onOpenSqlSchema: () => void;
  onSelectCategory: (id: number | null) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenSqlSchema, onSelectCategory }) => {
  return (
    <footer className="bg-[#121212] text-neutral-400 text-xs border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand Column */}
          <div className="md:col-span-4 space-y-4">
            <span className="font-serif-display text-2xl font-bold tracking-tight text-white">
              AURA
            </span>
            <p className="text-neutral-400 font-light leading-relaxed max-w-sm">
              Architectural living objects, precision acoustic monitors, and artisanal stonewares.
              Conceived in Stockholm and Copenhagen.
            </p>
            <div className="pt-2 flex items-center gap-2 text-neutral-500">
              <ShieldCheck className="w-4 h-4 text-neutral-400" />
              <span>Full-Stack REST Architecture with MySQL Schema</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-white font-semibold uppercase tracking-wider text-[11px]">Collections</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onSelectCategory(1)}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Architectural Living
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory(2)}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Audio & Acoustics
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory(3)}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Sculptural Ceramics
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory(4)}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Horology & Objects
                </button>
              </li>
            </ul>
          </div>

          {/* Architecture / Database Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-white font-semibold uppercase tracking-wider text-[11px]">System & Stack</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={onOpenSqlSchema}
                  className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer text-left text-neutral-300"
                >
                  <Database className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Inspect MySQL Schema (ecommerce.sql)</span>
                </button>
              </li>
              <li className="text-neutral-500">Node.js Express REST API</li>
              <li className="text-neutral-500">JWT & Role-Based Access Control</li>
              <li className="text-neutral-500">XAMPP / MySQL Relational DDL</li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-white font-semibold uppercase tracking-wider text-[11px]">Client Care</h4>
            <p className="text-neutral-400 font-light leading-relaxed">
              Mon–Fri 09:00–18:00 CET
              <br />
              concierge@auragoods.design
              <br />
              Toll-free: +46 8 123 4567
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between text-neutral-500 gap-4">
          <div>
            © {new Date().getFullYear()} AURA Modern Goods. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span>Privacy Policy</span>
            <span>·</span>
            <span>Terms of Service</span>
            <span>·</span>
            <span>Authenticity Protocol</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
