export interface SampleImage {
  id: string;
  name: string;
  category: string;
  thumbnailUrl: string;
}

// Crisp procedural SVG samples converted to data URIs for instantaneous, 100% reliable local loading
export const SAMPLE_IMAGES: SampleImage[] = [
  {
    id: 'mona_lisa',
    name: 'Mona Lisa',
    category: 'Art Masterpiece',
    thumbnailUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
        <defs>
          <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#2d3b2d"/>
            <stop offset="60%" stop-color="#4a422d"/>
            <stop offset="100%" stop-color="#1c1914"/>
          </linearGradient>
          <radialGradient id="face" cx="50%" cy="40%" r="35%">
            <stop offset="0%" stop-color="#f5d6af"/>
            <stop offset="60%" stop-color="#d8ab7f"/>
            <stop offset="100%" stop-color="#9d6d48"/>
          </radialGradient>
          <linearGradient id="hair" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#241b14"/>
            <stop offset="100%" stop-color="#140f0b"/>
          </linearGradient>
          <linearGradient id="dress" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#3d493a"/>
            <stop offset="100%" stop-color="#1a2118"/>
          </linearGradient>
        </defs>
        <rect width="300" height="300" fill="url(#bg)"/>
        <!-- Distant hills -->
        <path d="M0,170 Q60,140 120,165 T240,150 T300,170 L300,300 L0,300 Z" fill="#384534" opacity="0.6"/>
        <!-- River bridge landscape -->
        <path d="M190,175 Q210,185 240,180 T300,195 L300,220 L210,220 Z" fill="#695b3d" opacity="0.4"/>
        <!-- Veil & Hair -->
        <path d="M90,70 C90,40 210,40 210,70 C220,110 230,170 220,230 L80,230 C70,170 80,110 90,70 Z" fill="url(#hair)"/>
        <!-- Head & Face -->
        <ellipse cx="150" cy="115" rx="42" ry="52" fill="url(#face)"/>
        <!-- Eyes -->
        <ellipse cx="134" cy="110" rx="6" ry="3.5" fill="#3a2a1a"/>
        <circle cx="134" cy="109" r="1.5" fill="#140f0b"/>
        <ellipse cx="166" cy="110" rx="6" ry="3.5" fill="#3a2a1a"/>
        <circle cx="166" cy="109" r="1.5" fill="#140f0b"/>
        <!-- Eyebrow soft shading -->
        <path d="M125,102 Q135,99 143,103" stroke="#876241" stroke-width="2.5" fill="none" opacity="0.6"/>
        <path d="M157,103 Q165,99 175,102" stroke="#876241" stroke-width="2.5" fill="none" opacity="0.6"/>
        <!-- Nose -->
        <path d="M150,110 L150,126 Q146,128 143,129" stroke="#9d6d48" stroke-width="2" fill="none"/>
        <ellipse cx="150" cy="128" rx="7" ry="2" fill="#ba895e"/>
        <!-- The famous smile -->
        <path d="M138,140 Q150,146 162,140" stroke="#7a3e2e" stroke-width="2.8" stroke-linecap="round" fill="none"/>
        <path d="M141,139 Q150,143 159,139" stroke="#ad5c47" stroke-width="1.5" fill="none"/>
        <!-- Neck & Decollete -->
        <path d="M132,160 Q150,185 168,160 L180,210 L120,210 Z" fill="#d8ab7f"/>
        <!-- Dress and Shawl -->
        <path d="M70,210 Q150,180 230,210 L260,300 L40,300 Z" fill="url(#dress)"/>
        <path d="M110,210 Q150,225 190,210 L200,260 L100,260 Z" fill="#2d3628"/>
        <!-- Hands folded -->
        <ellipse cx="150" cy="275" rx="55" ry="25" fill="#d8ab7f"/>
        <ellipse cx="155" cy="272" rx="45" ry="18" fill="#e8be92"/>
      </svg>
    `)}`,
  },
  {
    id: 'retro_astronaut',
    name: 'Cosmic Explorer',
    category: 'Sci-Fi & Space',
    thumbnailUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
        <defs>
          <linearGradient id="space" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#0a0a23"/>
            <stop offset="50%" stop-color="#1b1244"/>
            <stop offset="100%" stop-color="#062238"/>
          </linearGradient>
          <linearGradient id="visor" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#ffb300"/>
            <stop offset="35%" stop-color="#ff5722"/>
            <stop offset="70%" stop-color="#e91e63"/>
            <stop offset="100%" stop-color="#673ab7"/>
          </linearGradient>
          <linearGradient id="suit" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="100%" stop-color="#b0bec5"/>
          </linearGradient>
        </defs>
        <rect width="300" height="300" fill="url(#space)"/>
        <!-- Stars -->
        <circle cx="35" cy="45" r="2" fill="#fff" opacity="0.8"/>
        <circle cx="95" cy="30" r="1.5" fill="#fff" opacity="0.9"/>
        <circle cx="260" cy="65" r="2.5" fill="#ffeb3b" opacity="0.9"/>
        <circle cx="220" cy="25" r="1.5" fill="#fff" opacity="0.7"/>
        <circle cx="40" cy="180" r="1.5" fill="#fff" opacity="0.6"/>
        <circle cx="270" cy="210" r="2" fill="#80d8ff" opacity="0.8"/>
        <!-- Distant Planet -->
        <circle cx="230" cy="80" r="28" fill="#e91e63"/>
        <path d="M195,80 A35,10 0 1,0 265,80 A35,10 0 1,0 195,80" stroke="#ffeb3b" stroke-width="4" fill="none" transform="rotate(-20 230 80)"/>
        <!-- Astronaut Helmet -->
        <ellipse cx="150" cy="135" rx="72" ry="75" fill="url(#suit)" stroke="#37474f" stroke-width="3"/>
        <rect x="135" y="60" width="30" height="8" rx="3" fill="#cfd8dc"/>
        <!-- Golden Visor -->
        <path d="M100,125 C100,85 200,85 200,125 C200,165 100,165 100,125 Z" fill="url(#visor)" stroke="#263238" stroke-width="4"/>
        <path d="M110,110 Q150,95 190,110 Q150,118 110,110 Z" fill="#ffffff" opacity="0.45"/>
        <!-- Neck seal -->
        <rect x="110" y="200" width="80" height="18" rx="6" fill="#37474f"/>
        <!-- Suit shoulders & chest -->
        <path d="M70,225 C80,215 110,210 150,210 C190,210 220,215 230,225 L270,300 L30,300 Z" fill="url(#suit)"/>
        <!-- Mission patch & controls -->
        <rect x="125" y="235" width="50" height="40" rx="5" fill="#37474f"/>
        <circle cx="140" cy="250" r="5" fill="#4caf50"/>
        <circle cx="160" cy="250" r="5" fill="#f44336"/>
        <rect x="135" y="263" width="30" height="5" rx="2" fill="#00e5ff"/>
        <!-- Red/Blue shoulder stripes -->
        <path d="M55,270 L90,240 L98,248 L65,280 Z" fill="#d32f2f"/>
        <path d="M245,270 L210,240 L202,248 L235,280 Z" fill="#1976d2"/>
      </svg>
    `)}`,
  },
  {
    id: 'golden_retriever',
    name: 'Puppy Portrait',
    category: 'Animals',
    thumbnailUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
        <defs>
          <linearGradient id="dogbg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#4caf50"/>
            <stop offset="100%" stop-color="#2e7d32"/>
          </linearGradient>
          <radialGradient id="fur" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stop-color="#ffe082"/>
            <stop offset="50%" stop-color="#ffb74d"/>
            <stop offset="100%" stop-color="#b26a00"/>
          </radialGradient>
        </defs>
        <rect width="300" height="300" fill="url(#dogbg)"/>
        <!-- Ears -->
        <path d="M60,90 C40,140 65,200 95,190 C110,180 115,130 95,95 Z" fill="#b26a00"/>
        <path d="M240,90 C260,140 235,200 205,190 C190,180 185,130 205,95 Z" fill="#b26a00"/>
        <!-- Head -->
        <ellipse cx="150" cy="140" rx="70" ry="65" fill="url(#fur)"/>
        <!-- Muzzle -->
        <ellipse cx="150" cy="175" rx="42" ry="32" fill="#fff8e1"/>
        <!-- Nose -->
        <path d="M135,160 Q150,157 165,160 Q170,175 150,178 Q130,175 135,160 Z" fill="#212121"/>
        <ellipse cx="145" cy="163" rx="3" ry="1.5" fill="#757575"/>
        <!-- Mouth & Tongue -->
        <path d="M150,178 L150,195 Q140,198 132,192 M150,195 Q160,198 168,192" stroke="#212121" stroke-width="3" fill="none"/>
        <path d="M142,195 C142,215 158,215 158,195 Z" fill="#ff5252"/>
        <!-- Eyes -->
        <circle cx="120" cy="130" r="10" fill="#3e2723"/>
        <circle cx="118" cy="127" r="3.5" fill="#ffffff"/>
        <circle cx="180" cy="130" r="10" fill="#3e2723"/>
        <circle cx="178" cy="127" r="3.5" fill="#ffffff"/>
        <!-- Eye brows / highlights -->
        <path d="M110,116 Q122,112 132,117" stroke="#ffa726" stroke-width="3.5" fill="none"/>
        <path d="M168,117 Q178,112 190,116" stroke="#ffa726" stroke-width="3.5" fill="none"/>
        <!-- Chest -->
        <path d="M95,200 C80,240 70,300 70,300 L230,300 C230,300 220,240 205,200 Z" fill="#ffcc80"/>
        <path d="M125,210 C120,260 150,290 150,290 C150,290 180,260 175,210 Z" fill="#fff8e1"/>
      </svg>
    `)}`,
  },
  {
    id: 'sunset_landscape',
    name: 'Tropical Sunset',
    category: 'Nature & Landscape',
    thumbnailUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#4a148c"/>
            <stop offset="30%" stop-color="#d81b60"/>
            <stop offset="60%" stop-color="#fb8c00"/>
            <stop offset="85%" stop-color="#fdd835"/>
            <stop offset="100%" stop-color="#fff59d"/>
          </linearGradient>
          <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#e65100"/>
            <stop offset="40%" stop-color="#ad1457"/>
            <stop offset="100%" stop-color="#1a237e"/>
          </linearGradient>
        </defs>
        <rect width="300" height="190" fill="url(#sky)"/>
        <!-- Glowing Sun -->
        <circle cx="150" cy="165" r="45" fill="#fff9c4"/>
        <circle cx="150" cy="165" r="55" fill="#fff59d" opacity="0.4"/>
        <!-- Ocean -->
        <rect y="190" width="300" height="110" fill="url(#sea)"/>
        <!-- Sun Reflection -->
        <path d="M130,190 L170,190 L185,300 L115,300 Z" fill="#ffe082" opacity="0.3"/>
        <ellipse cx="150" cy="205" rx="25" ry="3" fill="#fff59d"/>
        <ellipse cx="150" cy="225" rx="35" ry="3" fill="#ffe082"/>
        <ellipse cx="150" cy="250" rx="45" ry="3" fill="#ffb74d"/>
        <!-- Palm Trees Silhouette -->
        <path d="M240,300 Q225,230 190,140 Q192,138 196,140 Q230,230 246,300 Z" fill="#0d1b2a"/>
        <path d="M190,140 Q150,130 130,150 Q160,140 190,140" stroke="#0d1b2a" stroke-width="4" fill="none"/>
        <path d="M190,140 Q170,110 155,115 Q180,125 190,140" stroke="#0d1b2a" stroke-width="4" fill="none"/>
        <path d="M190,140 Q210,105 230,120 Q205,125 190,140" stroke="#0d1b2a" stroke-width="4" fill="none"/>
        <path d="M190,140 Q235,130 250,155 Q220,145 190,140" stroke="#0d1b2a" stroke-width="4" fill="none"/>
        <!-- Birds -->
        <path d="M70,80 Q78,74 86,80 Q94,74 102,80" stroke="#311b92" stroke-width="2.5" fill="none"/>
        <path d="M98,65 Q104,60 110,65 Q116,60 122,65" stroke="#311b92" stroke-width="2" fill="none"/>
      </svg>
    `)}`,
  },
  {
    id: 'cyber_geometric',
    name: 'Cyberpunk Neon',
    category: 'Vibrant & Modern',
    thumbnailUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
        <rect width="300" height="300" fill="#0b0b1a"/>
        <!-- Neon Grid floor -->
        <line x1="0" y1="220" x2="300" y2="220" stroke="#00ffff" stroke-width="2"/>
        <line x1="0" y1="240" x2="300" y2="240" stroke="#00ffff" stroke-width="2" opacity="0.8"/>
        <line x1="0" y1="265" x2="300" y2="265" stroke="#00ffff" stroke-width="2" opacity="0.6"/>
        <line x1="0" y1="295" x2="300" y2="295" stroke="#00ffff" stroke-width="2" opacity="0.4"/>
        <line x1="150" y1="200" x2="150" y2="300" stroke="#00ffff" stroke-width="2"/>
        <line x1="150" y1="200" x2="50" y2="300" stroke="#00ffff" stroke-width="2"/>
        <line x1="150" y1="200" x2="250" y2="300" stroke="#00ffff" stroke-width="2"/>
        <!-- Retro Synth Sun -->
        <defs>
          <linearGradient id="neonsun" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#ff007f"/>
            <stop offset="100%" stop-color="#ffeb3b"/>
          </linearGradient>
        </defs>
        <circle cx="150" cy="140" r="70" fill="url(#neonsun)"/>
        <!-- Sun horizontal slice cuts -->
        <rect x="75" y="145" width="150" height="3" fill="#0b0b1a"/>
        <rect x="75" y="155" width="150" height="5" fill="#0b0b1a"/>
        <rect x="75" y="168" width="150" height="7" fill="#0b0b1a"/>
        <rect x="75" y="183" width="150" height="9" fill="#0b0b1a"/>
        <rect x="75" y="200" width="150" height="12" fill="#0b0b1a"/>
        <!-- Mountain Wireframe Silhouettes -->
        <polygon points="0,220 50,160 110,220" fill="#1b1035" stroke="#ff007f" stroke-width="2"/>
        <polygon points="90,220 160,150 230,220" fill="#160c2b" stroke="#00e5ff" stroke-width="2"/>
        <polygon points="200,220 260,170 300,220" fill="#1b1035" stroke="#ff007f" stroke-width="2"/>
      </svg>
    `)}`,
  },
];
