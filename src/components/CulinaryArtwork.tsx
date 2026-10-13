import React from 'react';

interface ArtworkProps {
  type: string;
  className?: string;
  dishName?: string;
}

/**
 * High-fidelity, appetizing Hyderabadi culinary artworks.
 * Employs rich textures, layered saffron basmati grains, caramelized birista,
 * mint leaves, traditional brass degs, clay pots, and Nizami serving salvers.
 */
export const CulinaryArtwork: React.FC<ArtworkProps> = ({ type, className = "w-full h-full", dishName }) => {
  switch (type) {
    case 'hero':
      return (
        <svg
          viewBox="0 0 800 450"
          className={className}
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="Hyderabadi Dum Biryani in traditional brass handi"
        >
          <defs>
            {/* Table & Ambient Background */}
            <radialGradient id="tableGlow" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="#4A342B" />
              <stop offset="60%" stopColor="#2A1C16" />
              <stop offset="100%" stopColor="#18110D" />
            </radialGradient>
            
            {/* Brass Handi Metallic Gradient */}
            <linearGradient id="brassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FAD782" />
              <stop offset="25%" stopColor="#D99A35" />
              <stop offset="55%" stopColor="#8C5815" />
              <stop offset="80%" stopColor="#D99A35" />
              <stop offset="100%" stopColor="#57370D" />
            </linearGradient>

            {/* Saffron & Spiced Rice Gradients */}
            <linearGradient id="saffronRice" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F8B83A" />
              <stop offset="35%" stopColor="#FFF8EB" />
              <stop offset="70%" stopColor="#EA6B1E" />
              <stop offset="100%" stopColor="#F4AA28" />
            </linearGradient>

            {/* Caramelized Birista Fried Onions */}
            <linearGradient id="biristaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#592015" />
              <stop offset="100%" stopColor="#2C0F0A" />
            </linearGradient>

            {/* Mirchi Ka Salan Gravy */}
            <linearGradient id="salanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#B3651B" />
              <stop offset="50%" stopColor="#7A241C" />
              <stop offset="100%" stopColor="#4A130F" />
            </linearGradient>

            {/* Dahi Ki Chutney (Raita) */}
            <linearGradient id="raitaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="70%" stopColor="#FFF8EB" />
              <stop offset="100%" stopColor="#E0D5C3" />
            </linearGradient>

            {/* Steam Glow Filter */}
            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Table Canvas */}
          <rect width="800" height="450" fill="url(#tableGlow)" />

          {/* Subtle Spice Ring Shadow on Table */}
          <ellipse cx="400" cy="335" rx="270" ry="65" fill="#0D0907" opacity="0.8" />
          <ellipse cx="640" cy="355" rx="85" ry="32" fill="#0D0907" opacity="0.6" />
          <ellipse cx="160" cy="355" rx="85" ry="32" fill="#0D0907" opacity="0.6" />

          {/* Left Bowl: Mirchi Ka Salan */}
          <g transform="translate(160, 310)">
            {/* Clay Bowl Base */}
            <ellipse cx="0" cy="35" rx="75" ry="25" fill="#5A3423" />
            <path d="M -75,35 Q 0,85 75,35 Q 80,0 75,-10 Q 0,-25 -75,-10 Z" fill="#75432E" />
            <ellipse cx="0" cy="-10" rx="75" ry="28" fill="#5A3423" />
            {/* Salan Gravy Surface */}
            <ellipse cx="0" cy="-8" rx="68" ry="24" fill="url(#salanGrad)" />
            {/* Roasted Bhavnagri Mirchi (Green Chilli) */}
            <path d="M -30,-5 Q -10,-15 25,-8 Q 45,-2 35,5 Q 10,-2 -25,2 Z" fill="#486447" />
            <path d="M 25,-8 Q 38,-15 48,-14" stroke="#2B3C2A" strokeWidth="3" fill="none" strokeLinecap="round" />
            {/* Sesame & Peanut Gravy Highlights */}
            <circle cx="-15" cy="-12" r="2.5" fill="#FAD782" opacity="0.8" />
            <circle cx="10" cy="-3" r="2" fill="#FAD782" opacity="0.8" />
            <circle cx="5" cy="5" r="3" fill="#D99A35" opacity="0.9" />
            <circle cx="-35" cy="-2" r="2" fill="#FAD782" opacity="0.7" />
          </g>

          {/* Right Bowl: Dahi Ki Chutney / Raita */}
          <g transform="translate(640, 310)">
            <ellipse cx="0" cy="35" rx="75" ry="25" fill="#5A3423" />
            <path d="M -75,35 Q 0,85 75,35 Q 80,0 75,-10 Q 0,-25 -75,-10 Z" fill="#75432E" />
            <ellipse cx="0" cy="-10" rx="75" ry="28" fill="#5A3423" />
            {/* Creamy Yoghurt Surface */}
            <ellipse cx="0" cy="-8" rx="68" ry="24" fill="url(#raitaGrad)" />
            {/* Finely Diced Red Onions & Mint Flecks */}
            <rect x="-20" y="-12" width="6" height="5" rx="1" fill="#8C3530" opacity="0.8" />
            <rect x="5" y="-15" width="5" height="6" rx="1" fill="#8C3530" opacity="0.8" />
            <rect x="15" y="-4" width="7" height="5" rx="1" fill="#8C3530" opacity="0.7" />
            <circle cx="-5" cy="-5" r="2" fill="#486447" />
            <circle cx="28" cy="-8" r="2" fill="#486447" />
            <circle cx="-35" cy="-6" r="2.5" fill="#486447" />
            <circle cx="0" cy="4" r="1.5" fill="#486447" />
          </g>

          {/* Central Royal Brass Handi / Deg */}
          <g transform="translate(400, 240)">
            {/* Handi Outer Belly */}
            <path
              d="M -210,30 
                 C -230,100 -180,160 0,165 
                 C 180,160 230,100 210,30 
                 C 215,10 200,-5 180,-10 
                 C 100,-25 -100,-25 -180,-10 
                 C -200,-5 -215,10 -210,30 Z"
              fill="url(#brassGrad)"
            />

            {/* Handi Rim Lip & Rivets */}
            <ellipse cx="0" cy="-10" rx="190" ry="38" fill="#D99A35" />
            <ellipse cx="0" cy="-10" rx="180" ry="34" fill="#8C5815" />
            
            {/* Traditional Handi Handles */}
            <path d="M -200,25 C -240,25 -245,65 -205,75" stroke="#FAD782" strokeWidth="8" fill="none" strokeLinecap="round" />
            <path d="M 200,25 C 240,25 245,65 205,75" stroke="#FAD782" strokeWidth="8" fill="none" strokeLinecap="round" />

            {/* Basmati Rice Mound (Layered Saffron & Golden Grains) */}
            <ellipse cx="0" cy="-12" rx="175" ry="50" fill="url(#saffronRice)" />
            <path
              d="M -170,-15 
                 C -120,-65 -40,-85 0,-85 
                 C 40,-85 120,-65 170,-15 
                 C 120,15 40,30 0,30 
                 C -40,30 -120,15 -170,-15 Z"
              fill="url(#saffronRice)"
            />

            {/* Individual Long Basmati Rice Grain Textures */}
            <g stroke="#FFF8EB" strokeWidth="2.2" strokeLinecap="round" opacity="0.95">
              <line x1="-110" y1="-30" x2="-98" y2="-32" />
              <line x1="-85" y1="-45" x2="-72" y2="-43" />
              <line x1="-50" y1="-60" x2="-38" y2="-55" />
              <line x1="-20" y1="-72" x2="-8" y2="-70" />
              <line x1="15" y1="-75" x2="28" y2="-72" />
              <line x1="60" y1="-58" x2="72" y2="-62" />
              <line x1="95" y1="-40" x2="108" y2="-38" />
              <line x1="125" y1="-22" x2="138" y2="-25" />
              {/* Secondary grain layer */}
              <line x1="-135" y1="-15" x2="-122" y2="-18" />
              <line x1="-70" y1="-25" x2="-58" y2="-22" />
              <line x1="-15" y1="-45" x2="-2" y2="-48" />
              <line x1="35" y1="-42" x2="48" y2="-40" />
              <line x1="80" y1="-28" x2="92" y2="-30" />
            </g>

            {/* Deep Orange Masala Infused Grains */}
            <g stroke="#D9531E" strokeWidth="2.5" strokeLinecap="round" opacity="0.9">
              <line x1="-95" y1="-35" x2="-82" y2="-38" />
              <line x1="-40" y1="-50" x2="-28" y2="-48" />
              <line x1="5" y1="-65" x2="18" y2="-62" />
              <line x1="45" y1="-55" x2="58" y2="-52" />
              <line x1="110" y1="-32" x2="122" y2="-35" />
              <line x1="-25" y1="-28" x2="-12" y2="-25" />
              <line x1="20" y1="-30" x2="32" y2="-32" />
            </g>

            {/* Tender Spiced Mutton Dum Pieces Rising from Rice */}
            <path
              d="M -60,-45 
                 C -75,-65 -50,-85 -20,-80 
                 C 5,-75 0,-50 -25,-42 
                 C -40,-38 -55,-40 -60,-45 Z"
              fill="#522019"
            />
            <path
              d="M 25,-55 
                 C 15,-75 45,-90 75,-78 
                 C 95,-70 85,-45 60,-42 
                 C 40,-40 30,-48 25,-55 Z"
              fill="#63251E"
            />

            {/* Whole Spices: Star Anise & Black Cardamom */}
            <g transform="translate(-10, -55) rotate(22)">
              {/* Star Anise Petals */}
              <circle cx="0" cy="0" r="4" fill="#301A14" />
              <ellipse cx="0" cy="-10" rx="3.5" ry="7" fill="#4A281E" />
              <ellipse cx="9" cy="-5" rx="3.5" ry="7" transform="rotate(72 9 -5)" fill="#4A281E" />
              <ellipse cx="6" cy="8" rx="3.5" ry="7" transform="rotate(144 6 8)" fill="#4A281E" />
              <ellipse cx="-6" cy="8" rx="3.5" ry="7" transform="rotate(216 -6 8)" fill="#4A281E" />
              <ellipse cx="-9" cy="-5" rx="3.5" ry="7" transform="rotate(288 -9 -5)" fill="#4A281E" />
            </g>

            {/* Boiled Egg Half */}
            <g transform="translate(85, -25) rotate(-15)">
              <ellipse cx="0" cy="0" rx="16" ry="22" fill="#FFF8EB" />
              <ellipse cx="0" cy="3" rx="10" ry="13" fill="#D99A35" />
              <ellipse cx="-2" cy="1" rx="8" ry="10" fill="#FAD782" />
            </g>

            {/* Caramelized Crispy Fried Onions (Birista) Clusters */}
            <g stroke="#3A1711" strokeWidth="2.8" strokeLinecap="round" opacity="0.95">
              <path d="M -80,-55 Q -65,-70 -45,-58" fill="none" />
              <path d="M -70,-45 Q -55,-60 -35,-48" fill="none" />
              <path d="M -40,-70 Q -25,-85 -10,-68" fill="none" />
              <path d="M 0,-78 Q 15,-92 35,-75" fill="none" />
              <path d="M 30,-65 Q 48,-80 65,-62" fill="none" />
              <path d="M 50,-50 Q 68,-65 85,-48" fill="none" />
              <path d="M -20,-35 Q -5,-50 15,-38" fill="none" />
              <path d="M 10,-42 Q 28,-58 45,-40" fill="none" />
            </g>

            {/* Fresh Mint Sprigs (Pudina) */}
            <g transform="translate(-15, -78)">
              {/* Stem */}
              <path d="M 0,0 Q 8,-18 15,-25" stroke="#2D402C" strokeWidth="2.5" fill="none" />
              {/* Mint Leaves */}
              <path d="M 5,-12 Q 18,-15 15,-5 Q 8,-2 5,-12 Z" fill="#486447" />
              <path d="M 8,-18 Q -4,-25 0,-12 Q 5,-10 8,-18 Z" fill="#587A56" />
              <path d="M 15,-25 Q 26,-32 20,-20 Q 15,-18 15,-25 Z" fill="#486447" />
              <path d="M 12,-22 Q 4,-30 8,-20 Q 10,-18 12,-22 Z" fill="#587A56" />
            </g>

            {/* Dough Dum Seal (Pardah) Rim Residue */}
            <path
              d="M -180,-12 
                 C -160,-22 -140,-18 -120,-20 
                 C -80,-15 80,-15 120,-20 
                 C 140,-18 160,-22 180,-12"
              stroke="#D4BA94"
              strokeWidth="5"
              fill="none"
              strokeDasharray="12,6"
              opacity="0.85"
            />
          </g>

          {/* Steaming Dum Vapor Tendrils (Aromatic Dum Smoke) */}
          <g filter="url(#softGlow)" opacity="0.3" stroke="#FFF8EB" strokeWidth="8" strokeLinecap="round" fill="none">
            <path d="M 360,160 Q 340,110 370,60 Q 390,20 370,-20" />
            <path d="M 400,150 Q 430,95 405,45 Q 380,5 410,-30" />
            <path d="M 440,165 Q 470,115 445,65 Q 430,25 450,-15" />
          </g>
        </svg>
      );

    case 'shadab':
      return (
        <svg viewBox="0 0 400 300" className={className} xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="300" fill="#2E1C17" />
          <radialGradient id="shadabGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8C3524" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#1E120E" stopOpacity="0" />
          </radialGradient>
          <rect width="400" height="300" fill="url(#shadabGlow)" />
          {/* Copper Deg Platter */}
          <ellipse cx="200" cy="180" rx="160" ry="85" fill="#8C5815" />
          <ellipse cx="200" cy="176" rx="150" ry="78" fill="#D99A35" />
          <ellipse cx="200" cy="170" rx="142" ry="72" fill="#592015" />
          {/* Mutton Dum Mound */}
          <ellipse cx="200" cy="155" rx="130" ry="60" fill="#F4AA28" />
          <path d="M 80,160 Q 200,70 320,160 Q 200,210 80,160 Z" fill="#EA6B1E" opacity="0.85" />
          {/* Saffron and white rice grains */}
          <g stroke="#FFF8EB" strokeWidth="2" strokeLinecap="round">
            <line x1="140" y1="140" x2="152" y2="138" />
            <line x1="170" y1="125" x2="182" y2="128" />
            <line x1="210" y1="120" x2="222" y2="118" />
            <line x1="250" y1="135" x2="262" y2="137" />
            <line x1="185" y1="148" x2="198" y2="145" />
          </g>
          {/* Double Masala Mutton Cuts */}
          <ellipse cx="180" cy="140" rx="28" ry="18" fill="#522019" />
          <ellipse cx="225" cy="145" rx="32" ry="20" fill="#63251E" />
          {/* Fried Birista & Mint */}
          <g stroke="#2C0F0A" strokeWidth="2.5">
            <path d="M 160,130 Q 175,115 195,125" fill="none" />
            <path d="M 210,130 Q 225,118 245,128" fill="none" />
            <path d="M 175,150 Q 190,140 215,148" fill="none" />
          </g>
          <path d="M 200,115 Q 215,100 210,110 Q 205,120 200,115 Z" fill="#486447" />
          <path d="M 195,118 Q 185,108 190,115 Z" fill="#587A56" />
        </svg>
      );

    case 'bawarchi':
      return (
        <svg viewBox="0 0 400 300" className={className} xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="300" fill="#251713" />
          <radialGradient id="bawarchiGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#B34B19" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#140C0A" stopOpacity="0" />
          </radialGradient>
          <rect width="400" height="300" fill="url(#bawarchiGlow)" />
          {/* Ceramic Serving Dish */}
          <ellipse cx="200" cy="180" rx="160" ry="85" fill="#D4BA94" />
          <ellipse cx="200" cy="174" rx="148" ry="75" fill="#FFF8EB" />
          {/* Chicken Dum Layers */}
          <ellipse cx="200" cy="165" rx="135" ry="65" fill="#F8B83A" />
          <path d="M 75,165 Q 200,85 325,165 Q 200,215 75,165 Z" fill="#EA6B1E" />
          {/* Roasted Chicken Piece */}
          <path d="M 165,155 C 150,130 180,110 215,125 C 240,135 235,165 205,165 Z" fill="#8C3518" />
          {/* Boiled Egg Half */}
          <ellipse cx="255" cy="155" rx="15" ry="20" fill="#FFF8EB" />
          <circle cx="255" cy="155" r="9" fill="#D99A35" />
          {/* Lemon Wedge */}
          <path d="M 140,170 A 18 18 0 0 1 165,185 Z" fill="#FAD782" />
          {/* Garnish */}
          <g stroke="#3A1711" strokeWidth="2.2">
            <line x1="180" y1="130" x2="200" y2="128" />
            <line x1="190" y1="140" x2="210" y2="135" />
            <line x1="150" y1="150" x2="170" y2="148" />
          </g>
          <circle cx="185" cy="135" r="3.5" fill="#486447" />
          <circle cx="225" cy="145" r="3" fill="#486447" />
        </svg>
      );

    case 'paradise':
      return (
        <svg viewBox="0 0 400 300" className={className} xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="300" fill="#241916" />
          <radialGradient id="paradiseGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#D99A35" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#140D0B" stopOpacity="0" />
          </radialGradient>
          <rect width="400" height="300" fill="url(#paradiseGlow)" />
          {/* Vintage Silver Salver Platter */}
          <ellipse cx="200" cy="180" rx="165" ry="88" fill="#A8A39D" />
          <ellipse cx="200" cy="176" rx="155" ry="80" fill="#E8E5DF" />
          <ellipse cx="200" cy="172" rx="145" ry="72" fill="#D1CCC5" />
          {/* Royal Saffron Basmati Rice */}
          <ellipse cx="200" cy="160" rx="130" ry="60" fill="#FFF8EB" />
          <path d="M 85,160 Q 200,80 315,160 Q 200,210 85,160 Z" fill="#FAD782" opacity="0.9" />
          {/* Silver Vark Foil Accents */}
          <polygon points="175,135 185,130 190,140 180,145" fill="#FFFFFF" opacity="0.9" />
          <polygon points="215,142 225,138 230,148 220,152" fill="#FFFFFF" opacity="0.9" />
          {/* Toasted Cashews and Raisins */}
          <ellipse cx="160" cy="150" rx="8" ry="4" transform="rotate(-25 160 150)" fill="#E0C295" />
          <ellipse cx="240" cy="148" rx="8" ry="4" transform="rotate(30 240 148)" fill="#E0C295" />
          <circle cx="195" cy="130" r="3.5" fill="#3D1D16" />
          {/* Saffron strands */}
          <g stroke="#D9531E" strokeWidth="1.6">
            <line x1="185" y1="125" x2="195" y2="128" />
            <line x1="205" y1="130" x2="215" y2="126" />
            <line x1="170" y1="140" x2="178" y2="143" />
          </g>
        </svg>
      );

    case 'handi':
    case 'kunda':
      return (
        <svg viewBox="0 0 400 300" className={className} xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="300" fill="#201511" />
          <radialGradient id="kundaGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#7A241C" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#120B08" stopOpacity="0" />
          </radialGradient>
          <rect width="400" height="300" fill="url(#kundaGlow)" />
          {/* Earthen Terracotta Handi / Kunda Clay Pot */}
          <path d="M 90,150 C 70,220 120,270 200,270 C 280,270 330,220 310,150 Z" fill="#8C442A" />
          <ellipse cx="200" cy="150" rx="110" ry="32" fill="#6A321E" />
          <ellipse cx="200" cy="148" rx="100" ry="28" fill="#4D2213" />
          {/* Dough (Aata) Dum Seal around Rim */}
          <ellipse cx="200" cy="146" rx="105" ry="30" fill="none" stroke="#D4BA94" strokeWidth="10" strokeDasharray="18,8" />
          {/* Aromatic Biryani in the Pot */}
          <ellipse cx="200" cy="144" rx="90" ry="24" fill="#F4AA28" />
          <ellipse cx="200" cy="140" rx="80" ry="20" fill="#EA6B1E" />
          {/* Curry Leaves & Green Chillies */}
          <path d="M 180,135 Q 195,128 200,138 Q 190,145 180,135 Z" fill="#486447" />
          <path d="M 210,138 Q 225,130 230,140 Q 220,147 210,138 Z" fill="#486447" />
          <path d="M 195,132 Q 210,122 225,125" stroke="#3D553C" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* Steam Wisp */}
          <path d="M 190,120 Q 180,90 200,60 Q 215,35 205,15" stroke="#FFF8EB" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.4" />
          <path d="M 215,115 Q 230,85 210,55 Q 200,30 220,10" stroke="#FFF8EB" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.4" />
        </svg>
      );

    case 'rumaan':
      return (
        <svg viewBox="0 0 400 300" className={className} xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="300" fill="#261612" />
          <radialGradient id="rumaanGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#7A241C" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#120A08" stopOpacity="0" />
          </radialGradient>
          <rect width="400" height="300" fill="url(#rumaanGlow)" />
          {/* Traditional Steel Platter */}
          <ellipse cx="200" cy="180" rx="160" ry="85" fill="#75706B" />
          <ellipse cx="200" cy="175" rx="148" ry="76" fill="#C2BEB8" />
          <ellipse cx="200" cy="168" rx="138" ry="68" fill="#4A1813" />
          {/* Spicy Red Dum Rice */}
          <ellipse cx="200" cy="160" rx="125" ry="58" fill="#D9531E" />
          <path d="M 85,160 Q 200,75 315,160 Q 200,210 85,160 Z" fill="#7A241C" opacity="0.85" />
          {/* Crisp Fried Talawa Gosht Meat Nuggets */}
          <circle cx="160" cy="140" r="14" fill="#3D120E" />
          <circle cx="190" cy="135" r="16" fill="#4D1510" />
          <circle cx="225" cy="142" r="15" fill="#380F0C" />
          <circle cx="245" cy="155" r="12" fill="#4D1510" />
          {/* Onion Rings Garnish */}
          <ellipse cx="140" cy="160" rx="14" ry="7" fill="none" stroke="#FFF8EB" strokeWidth="2.5" />
          <ellipse cx="260" cy="165" rx="14" ry="7" fill="none" stroke="#FFF8EB" strokeWidth="2.5" />
          {/* Red Chilli Flakes & Mint */}
          <circle cx="175" cy="130" r="2.5" fill="#EA6B1E" />
          <circle cx="210" cy="132" r="2" fill="#486447" />
          <circle cx="200" cy="150" r="2" fill="#486447" />
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 400 300" className={className} xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="300" fill="#281A16" />
          <radialGradient id="defaultGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#D99A35" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#140C0A" stopOpacity="0" />
          </radialGradient>
          <rect width="400" height="300" fill="url(#defaultGlow)" />
          <ellipse cx="200" cy="180" rx="155" ry="80" fill="#8C5815" />
          <ellipse cx="200" cy="174" rx="145" ry="72" fill="#D99A35" />
          <ellipse cx="200" cy="162" rx="130" ry="60" fill="#F8B83A" />
          <path d="M 85,162 Q 200,85 315,162 Q 200,210 85,162 Z" fill="#EA6B1E" />
          {/* Meat and Fried Onions */}
          <ellipse cx="190" cy="145" rx="26" ry="16" fill="#522019" />
          <ellipse cx="225" cy="148" rx="28" ry="17" fill="#63251E" />
          <g stroke="#FFF8EB" strokeWidth="1.8" strokeLinecap="round">
            <line x1="150" y1="140" x2="162" y2="138" />
            <line x1="180" y1="128" x2="192" y2="130" />
            <line x1="220" y1="130" x2="232" y2="128" />
          </g>
          <circle cx="205" cy="125" r="3" fill="#486447" />
        </svg>
      );
  }
};
