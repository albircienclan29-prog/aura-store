import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface HeroProps {
  onExplore: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExplore }) => {
  return (
    <section className="relative overflow-hidden bg-[#F4F4F0] border-b border-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Editorial Headline & Actions */}
          <div className="lg:col-span-6 space-y-6">
            <div className="text-xs font-semibold tracking-wider uppercase text-neutral-500">
              Curated Edition · Spring 2026
            </div>

            <h1 className="font-serif-display text-4xl sm:text-5xl lg:text-6xl font-normal text-neutral-900 tracking-tight leading-[1.12] [text-wrap:balance]">
              Sculpted objects for architectural spaces
            </h1>

            <p className="text-base sm:text-lg text-neutral-600 font-light leading-relaxed max-w-xl">
              An uncompromised collection of precision acoustics, handcrafted solid oak furniture,
              and tactile stonewares designed to endure across generations.
            </p>

            {/* Proof Metric Adjacency */}
            <div className="pt-2 pb-1 flex items-center gap-6 text-xs text-neutral-500">
              <span className="font-medium text-neutral-800">Nordic Studio Craft</span>
              <span aria-hidden="true">·</span>
              <span>100% Solid FSC Hardwoods</span>
              <span aria-hidden="true">·</span>
              <span>Complimentary Delivery over $300</span>
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <button
                onClick={onExplore}
                className="px-6 py-3.5 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-all flex items-center gap-2 cursor-pointer shadow-xs active:scale-[0.99]"
              >
                <span>Explore Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="#catalog"
                className="px-5 py-3.5 text-neutral-700 hover:text-neutral-950 text-sm font-medium transition-colors cursor-pointer"
              >
                View Category Highlights
              </a>
            </div>
          </div>

          {/* Right Column: Hero Visual Showcase */}
          <div className="lg:col-span-6">
            <div className="relative aspect-[16/10] sm:aspect-[16/10] rounded-xl overflow-hidden bg-neutral-200 border border-black/5 shadow-xs">
              <img
                src="/src/assets/images/hero_curated_collection_1791425516611.jpg"
                alt="Architectural living space featuring minimalist oak lounge furniture"
                className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-[1.02]"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  // Fallback styling if image fails
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  if (target.parentElement) {
                    target.parentElement.classList.add('bg-gradient-to-tr', 'from-stone-300', 'to-stone-100');
                  }
                }}
              />
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-md text-xs text-neutral-800 border border-black/5 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>The Stockholm Collection</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
