import React from 'react';
import { motion } from 'motion/react';

interface ManaLogoProps {
  className?: string;
  size?: number;
  glow?: boolean;
}

/**
 * Clean, modern, and minimal botanical single-leaf & dual-sprout logo
 * with soft mint-green glow/pulse effect and subtle sparkle particles.
 * Fully geometric without any human facial/profile features.
 */
export const ManaFaceLogo: React.FC<ManaLogoProps> = ({
  className = '',
  size = 76,
  glow = true,
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Soft mint-green radial aura and pulsating background glow */}
      {glow && (
        <>
          <motion.div
            animate={{
              scale: [1, 1.25, 1],
              opacity: [0.35, 0.65, 0.35],
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-500/40 via-teal-400/30 to-emerald-300/20 blur-xl pointer-events-none transform scale-150"
          />
          <div
            className="absolute inset-2 rounded-full bg-emerald-400/20 blur-md pointer-events-none"
            style={{ filter: 'drop-shadow(0 0 20px rgba(52, 211, 153, 0.5))' }}
          />
        </>
      )}

      {/* SVG Container */}
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 overflow-visible"
      >
        <defs>
          {/* Main Leaf Gradient */}
          <linearGradient id="manaLeafGrad" x1="15%" y1="10%" x2="85%" y2="90%">
            <stop offset="0%" stopColor="#a7f3d0" />
            <stop offset="35%" stopColor="#34d399" />
            <stop offset="70%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>

          {/* Secondary Sprout Gradient */}
          <linearGradient id="manaSproutGrad" x1="10%" y1="20%" x2="90%" y2="90%">
            <stop offset="0%" stopColor="#d1fae5" />
            <stop offset="50%" stopColor="#6ee7b7" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>

          {/* Leaf Glow Filter */}
          <filter id="manaMintGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Delicate Orbit / Halo Rings */}
        <circle
          cx="50"
          cy="50"
          r="44"
          stroke="url(#manaLeafGrad)"
          strokeWidth="0.85"
          strokeOpacity="0.25"
          strokeDasharray="4 6"
        />
        <circle
          cx="50"
          cy="50"
          r="39"
          stroke="#6ee7b7"
          strokeWidth="0.5"
          strokeOpacity="0.2"
        />

        {/* Small Companion Sprout Leaf (Left side) */}
        <path
          d="M 46 64
             C 34 60, 24 48, 26 36
             C 38 34, 48 44, 48 58
             Z"
          fill="url(#manaSproutGrad)"
          opacity="0.85"
        />
        {/* Companion Sprout Vein */}
        <path
          d="M 46 62 Q 36 49 28 39"
          stroke="#ecfdf5"
          strokeWidth="0.8"
          strokeOpacity="0.75"
          strokeLinecap="round"
        />

        {/* Primary Elegant Center Leaf */}
        {/* Curved stem base rising smoothly up to an organic curved apex */}
        <path
          d="M 48 80
             C 46 72, 46 60, 48 50
             C 50 34, 62 20, 74 14
             C 74 28, 64 48, 54 65
             C 51 70, 49 76, 48 80 Z"
          fill="url(#manaLeafGrad)"
          filter="url(#manaMintGlowFilter)"
        />

        {/* Left Flange of Main Leaf */}
        <path
          d="M 48 50
             C 42 36, 54 22, 74 14
             C 68 28, 58 42, 48 50 Z"
          fill="url(#manaSproutGrad)"
          opacity="0.9"
        />

        {/* Main Central Leaf Midrib Vein */}
        <path
          d="M 48 78
             C 48 62, 53 44, 73 15"
          stroke="#f0fdf4"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeOpacity="0.9"
        />

        {/* Delicate Lateral Veins */}
        <path
          d="M 52 58 Q 60 52 64 50"
          stroke="#ecfdf5"
          strokeWidth="0.75"
          strokeLinecap="round"
          strokeOpacity="0.8"
        />
        <path
          d="M 56 46 Q 63 39 68 36"
          stroke="#ecfdf5"
          strokeWidth="0.75"
          strokeLinecap="round"
          strokeOpacity="0.8"
        />
        <path
          d="M 61 34 Q 68 28 71 25"
          stroke="#ecfdf5"
          strokeWidth="0.75"
          strokeLinecap="round"
          strokeOpacity="0.8"
        />
        <path
          d="M 50 48 Q 45 42 42 40"
          stroke="#ecfdf5"
          strokeWidth="0.75"
          strokeLinecap="round"
          strokeOpacity="0.7"
        />

        {/* Organic Stem Base Curve */}
        <path
          d="M 48 80 C 47 84, 44 87, 40 89"
          stroke="#10b981"
          strokeWidth="1.4"
          strokeLinecap="round"
        />

        {/* Sparkle Particles (Mint & Starlight) */}
        {/* Main Diamond Sparkle (Top Right) */}
        <g transform="translate(76, 16) scale(0.9)">
          <path
            d="M 0 -5 Q 0 0 5 0 Q 0 0 0 5 Q 0 0 -5 0 Q 0 0 0 -5 Z"
            fill="#ffffff"
            filter="url(#manaMintGlowFilter)"
          />
          <circle cx="0" cy="0" r="1.2" fill="#d1fae5" />
        </g>

        {/* Sparkle 2 (Upper Left) */}
        <g transform="translate(24, 28) scale(0.7)">
          <path
            d="M 0 -4 Q 0 0 4 0 Q 0 0 0 4 Q 0 0 -4 0 Q 0 0 0 -4 Z"
            fill="#ecfdf5"
          />
        </g>

        {/* Sparkle 3 (Bottom Right) */}
        <g transform="translate(72, 54) scale(0.6)">
          <path
            d="M 0 -4 Q 0 0 4 0 Q 0 0 0 4 Q 0 0 -4 0 Q 0 0 0 -4 Z"
            fill="#6ee7b7"
          />
        </g>

        {/* Sparkle 4 (Far Right Accent) */}
        <g transform="translate(84, 38) scale(0.5)">
          <path
            d="M 0 -4 Q 0 0 4 0 Q 0 0 0 4 Q 0 0 -4 0 Q 0 0 0 -4 Z"
            fill="#a7f3d0"
          />
        </g>

        {/* Soft Micro Glitter Dots */}
        <circle cx="34" cy="22" r="1" fill="#ffffff" opacity="0.9" />
        <circle cx="68" cy="30" r="0.8" fill="#d1fae5" opacity="0.85" />
        <circle cx="20" cy="46" r="0.75" fill="#a7f3d0" opacity="0.8" />
        <circle cx="60" cy="70" r="0.8" fill="#6ee7b7" opacity="0.75" />
        <circle cx="38" cy="74" r="0.65" fill="#ecfdf5" opacity="0.7" />
        <circle cx="78" cy="68" r="0.75" fill="#ffffff" opacity="0.8" />
      </svg>
    </div>
  );
};

/**
 * Simplified clean minimal single-leaf vector silhouette for compact header / title icons.
 */
export const ManaSilhouetteIcon: React.FC<{ className?: string; size?: number }> = ({
  className = 'w-4 h-4',
  size = 16,
}) => {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block ${className}`}
    >
      {/* Clean elegant leaf body */}
      <path
        d="M11 20A7 7 0 0 1 4 13C4 7 11 3 20 3C20 12 16 19 11 20Z"
        fill="currentColor"
        fillOpacity="0.25"
      />
      {/* Leaf stem and spine */}
      <path d="M4 21C6 17 9 14 14 10" />
      <path d="M14 10L20 3" />
      {/* Small subtle sparkle mark */}
      <path d="M19 8L21 6" strokeWidth="1.5" />
    </svg>
  );
};
