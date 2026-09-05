import { useTheme } from '../context/ThemeContext';

/**
 * Animated friendship characters - theme-aware SVG illustrations
 * Shows two characters with friendship gestures (waving, hearts, etc.)
 */
export default function FriendshipCharacters({ variant = 'default', size = 200 }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Theme-aware colors
  const colors = {
    skin1: isDark ? '#fbbf24' : '#f59e0b',
    skin2: isDark ? '#fb923c' : '#ea580c',
    shirt1: isDark ? '#f87171' : '#dc2626',
    shirt2: isDark ? '#facc15' : '#eab308',
    hair1: isDark ? '#fde68a' : '#92400e',
    hair2: isDark ? '#1c1917' : '#1c1917',
    heart: isDark ? '#4ade80' : '#22c55e',
    bg: 'transparent',
    outline: isDark ? '#fafafa' : '#1a1612',
  };

  if (variant === 'wave') {
    return (
      <div className="friendship-chars" style={{ width: size, height: size }}>
        <svg viewBox="0 0 200 200" width={size} height={size}>
          {/* Character 1 - Waving */}
          <g className="char-bounce">
            {/* Body */}
            <circle cx="70" cy="60" r="20" fill={colors.skin1} stroke={colors.outline} strokeWidth="2" />
            {/* Hair */}
            <ellipse cx="70" cy="48" rx="22" ry="12" fill={colors.hair1} />
            {/* Eyes */}
            <circle cx="63" cy="58" r="2.5" fill={colors.outline} />
            <circle cx="77" cy="58" r="2.5" fill={colors.outline} />
            {/* Smile */}
            <path d="M63 67 Q70 74 77 67" fill="none" stroke={colors.outline} strokeWidth="2" strokeLinecap="round" />
            {/* Shirt */}
            <rect x="55" y="80" width="30" height="35" rx="8" fill={colors.shirt1} stroke={colors.outline} strokeWidth="2" />
            {/* Legs */}
            <rect x="58" y="115" width="10" height="25" rx="5" fill={colors.skin1} stroke={colors.outline} strokeWidth="1.5" />
            <rect x="72" y="115" width="10" height="25" rx="5" fill={colors.skin1} stroke={colors.outline} strokeWidth="1.5" />
            {/* Waving arm */}
            <g className="char-wave">
              <rect x="85" y="78" width="8" height="30" rx="4" fill={colors.skin1} stroke={colors.outline} strokeWidth="1.5" transform="rotate(-30, 85, 78)" />
              <circle cx="108" cy="58" r="6" fill={colors.skin1} stroke={colors.outline} strokeWidth="1.5" />
            </g>
          </g>

          {/* Character 2 - Waving back */}
          <g className="char-bounce" style={{ animationDelay: '0.3s' }}>
            <circle cx="140" cy="60" r="20" fill={colors.skin2} stroke={colors.outline} strokeWidth="2" />
            <ellipse cx="140" cy="48" rx="22" ry="12" fill={colors.hair2} />
            <circle cx="133" cy="58" r="2.5" fill={colors.outline} />
            <circle cx="147" cy="58" r="2.5" fill={colors.outline} />
            <path d="M133 67 Q140 74 147 67" fill="none" stroke={colors.outline} strokeWidth="2" strokeLinecap="round" />
            <rect x="125" y="80" width="30" height="35" rx="8" fill={colors.shirt2} stroke={colors.outline} strokeWidth="2" />
            <rect x="128" y="115" width="10" height="25" rx="5" fill={colors.skin2} stroke={colors.outline} strokeWidth="1.5" />
            <rect x="142" y="115" width="10" height="25" rx="5" fill={colors.skin2} stroke={colors.outline} strokeWidth="1.5" />
            <g className="char-wave" style={{ animationDelay: '0.5s' }}>
              <rect x="107" y="78" width="8" height="30" rx="4" fill={colors.skin2} stroke={colors.outline} strokeWidth="1.5" transform="rotate(30, 107, 78)" />
              <circle cx="92" cy="58" r="6" fill={colors.skin2} stroke={colors.outline} strokeWidth="1.5" />
            </g>
          </g>

          {/* Floating hearts */}
          <g className="float-heart" style={{ animationDelay: '0s' }}>
            <path d="M95 30 C95 25 88 20 88 28 C88 35 95 40 95 40 C95 40 102 35 102 28 C102 20 95 25 95 30Z" fill={colors.heart} />
          </g>
          <g className="float-heart" style={{ animationDelay: '0.7s' }}>
            <path d="M110 20 C110 16 105 12 105 18 C105 23 110 27 110 27 C110 27 115 23 115 18 C115 12 110 16 110 20Z" fill={colors.heart} opacity="0.7" />
          </g>
          <g className="float-heart" style={{ animationDelay: '1.4s' }}>
            <path d="M85 18 C85 14 80 10 80 16 C80 21 85 25 85 25 C85 25 90 21 90 16 C90 10 85 14 85 18Z" fill={colors.heart} opacity="0.5" />
          </g>
        </svg>
      </div>
    );
  }

  if (variant === 'highfive') {
    return (
      <div className="friendship-chars" style={{ width: size, height: size }}>
        <svg viewBox="0 0 200 200" width={size} height={size}>
          {/* Character 1 */}
          <g className="char-bounce">
            <circle cx="65" cy="65" r="22" fill={colors.skin1} stroke={colors.outline} strokeWidth="2" />
            <ellipse cx="65" cy="52" rx="24" ry="13" fill={colors.hair1} />
            <circle cx="57" cy="63" r="2.5" fill={colors.outline} />
            <circle cx="73" cy="63" r="2.5" fill={colors.outline} />
            <path d="M57 73 Q65 80 73 73" fill="none" stroke={colors.outline} strokeWidth="2" strokeLinecap="round" />
            <rect x="48" y="87" width="34" height="38" rx="8" fill={colors.shirt1} stroke={colors.outline} strokeWidth="2" />
            <rect x="52" y="125" width="11" height="28" rx="5" fill={colors.skin1} stroke={colors.outline} strokeWidth="1.5" />
            <rect x="67" y="125" width="11" height="28" rx="5" fill={colors.skin1} stroke={colors.outline} strokeWidth="1.5" />
            {/* High five arm */}
            <g className="highfive-left">
              <rect x="82" y="75" width="9" height="32" rx="4" fill={colors.skin1} stroke={colors.outline} strokeWidth="1.5" transform="rotate(-45, 82, 75)" />
              <circle cx="110" cy="50" r="7" fill={colors.skin1} stroke={colors.outline} strokeWidth="1.5" />
            </g>
          </g>

          {/* Character 2 */}
          <g className="char-bounce" style={{ animationDelay: '0.2s' }}>
            <circle cx="145" cy="65" r="22" fill={colors.skin2} stroke={colors.outline} strokeWidth="2" />
            <ellipse cx="145" cy="52" rx="24" ry="13" fill={colors.hair2} />
            <circle cx="137" cy="63" r="2.5" fill={colors.outline} />
            <circle cx="153" cy="63" r="2.5" fill={colors.outline} />
            <path d="M137 73 Q145 80 153 73" fill="none" stroke={colors.outline} strokeWidth="2" strokeLinecap="round" />
            <rect x="128" y="87" width="34" height="38" rx="8" fill={colors.shirt2} stroke={colors.outline} strokeWidth="2" />
            <rect x="132" y="125" width="11" height="28" rx="5" fill={colors.skin2} stroke={colors.outline} strokeWidth="1.5" />
            <rect x="147" y="125" width="11" height="28" rx="5" fill={colors.skin2} stroke={colors.outline} strokeWidth="1.5" />
            {/* High five arm */}
            <g className="highfive-right">
              <rect x="109" y="75" width="9" height="32" rx="4" fill={colors.skin2} stroke={colors.outline} strokeWidth="1.5" transform="rotate(45, 109, 75)" />
              <circle cx="90" cy="50" r="7" fill={colors.skin2} stroke={colors.outline} strokeWidth="1.5" />
            </g>
          </g>

          {/* Impact lines */}
          <g className="highfive-impact">
            <line x1="95" y1="35" x2="95" y2="20" stroke={colors.heart} strokeWidth="2" strokeLinecap="round" />
            <line x1="105" y1="35" x2="105" y2="20" stroke={colors.heart} strokeWidth="2" strokeLinecap="round" />
            <line x1="100" y1="38" x2="100" y2="18" stroke={colors.heart} strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="100" cy="42" r="3" fill={colors.heart} />
          </g>
        </svg>
      </div>
    );
  }

  // Default: Hugging characters
  return (
    <div className="friendship-chars" style={{ width: size, height: size }}>
      <svg viewBox="0 0 200 200" width={size} height={size}>
        {/* Character 1 */}
        <g className="char-hug-left">
          <circle cx="75" cy="60" r="22" fill={colors.skin1} stroke={colors.outline} strokeWidth="2" />
          <ellipse cx="75" cy="47" rx="24" ry="13" fill={colors.hair1} />
          <circle cx="67" cy="58" r="2.5" fill={colors.outline} />
          <circle cx="83" cy="58" r="2.5" fill={colors.outline} />
          <path d="M67 68 Q75 76 83 68" fill="none" stroke={colors.outline} strokeWidth="2" strokeLinecap="round" />
          <rect x="58" y="82" width="34" height="38" rx="8" fill={colors.shirt1} stroke={colors.outline} strokeWidth="2" />
          <rect x="62" y="120" width="11" height="28" rx="5" fill={colors.skin1} stroke={colors.outline} strokeWidth="1.5" />
          <rect x="77" y="120" width="11" height="28" rx="5" fill={colors.skin1} stroke={colors.outline} strokeWidth="1.5" />
          {/* Hugging arm */}
          <rect x="92" y="85" width="30" height="9" rx="4" fill={colors.skin1} stroke={colors.outline} strokeWidth="1.5" />
        </g>

        {/* Character 2 */}
        <g className="char-hug-right">
          <circle cx="130" cy="60" r="22" fill={colors.skin2} stroke={colors.outline} strokeWidth="2" />
          <ellipse cx="130" cy="47" rx="24" ry="13" fill={colors.hair2} />
          <circle cx="122" cy="58" r="2.5" fill={colors.outline} />
          <circle cx="138" cy="58" r="2.5" fill={colors.outline} />
          <path d="M122 68 Q130 76 138 68" fill="none" stroke={colors.outline} strokeWidth="2" strokeLinecap="round" />
          <rect x="113" y="82" width="34" height="38" rx="8" fill={colors.shirt2} stroke={colors.outline} strokeWidth="2" />
          <rect x="117" y="120" width="11" height="28" rx="5" fill={colors.skin2} stroke={colors.outline} strokeWidth="1.5" />
          <rect x="132" y="120" width="11" height="28" rx="5" fill={colors.skin2} stroke={colors.outline} strokeWidth="1.5" />
          {/* Hugging arm */}
          <rect x="78" y="85" width="30" height="9" rx="4" fill={colors.skin2} stroke={colors.outline} strokeWidth="1.5" />
        </g>

        {/* Hearts floating */}
        <g className="float-heart" style={{ animationDelay: '0s' }}>
          <path d="M100 25 C100 18 90 12 90 22 C90 32 100 38 100 38 C100 38 110 32 110 22 C110 12 100 18 100 25Z" fill={colors.heart} />
        </g>
        <g className="float-heart" style={{ animationDelay: '0.8s' }}>
          <path d="M118 15 C118 10 112 6 112 13 C112 19 118 23 118 23 C118 23 124 19 124 13 C124 6 118 10 118 15Z" fill={colors.heart} opacity="0.6" />
        </g>
        <g className="float-heart" style={{ animationDelay: '1.5s' }}>
          <path d="M82 12 C82 8 77 5 77 10 C77 15 82 18 82 18 C82 18 87 15 87 10 C87 5 82 8 82 12Z" fill={colors.heart} opacity="0.4" />
        </g>

        {/* Friendship text */}
        <text x="100" y="175" textAnchor="middle" fill={colors.outline} fontSize="14" fontWeight="800" fontFamily="Inter, sans-serif">
          Friends! 🤝
        </text>
      </svg>
    </div>
  );
}
