'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Home() {
  const [hoveredTile, setHoveredTile] = useState<number | null>(null);

  // Top-level CS topics arranged in honeycomb pattern
  // Arranged for 2-3-2 pattern with Computer Science (id: 0) in center
  const tiles = [
    // Top row (2 hexagons) - Algorithms first, then Data Science to the right
    { id: 5, name: 'Algorithms & Theory', path: '#', description: 'Computational theory', color: 'from-indigo-500 to-indigo-600', subTopics: ['Coming Soon', 'Coming Soon', 'Coming Soon', 'Coming Soon', 'Coming Soon', 'Coming Soon'] },
    { id: 1, name: 'Data Science', path: '/data-science', description: 'Data analysis & visualization', color: 'from-blue-500 to-blue-600', subTopics: ['Vektor', 'Coming Soon', 'Coming Soon', 'Coming Soon', 'Coming Soon', 'Coming Soon'] },
    
    // Middle row (3 hexagons - Computer Science center, Software Engineering swapped to right)
    { id: 6, name: 'Computer Systems', path: '#', description: 'Systems & architecture', color: 'from-teal-500 to-teal-600', subTopics: ['Coming Soon', 'Coming Soon', 'Coming Soon', 'Coming Soon', 'Coming Soon', 'Coming Soon'] },
    { id: 0, name: 'Computer Science', path: '#', description: 'Explore CS Topics', color: 'from-purple-500 to-purple-600' },
    { id: 3, name: 'Software Engineering', path: '#', description: 'Development practices', color: 'from-yellow-500 to-yellow-600', subTopics: ['Coming Soon', 'Coming Soon', 'Coming Soon', 'Coming Soon', 'Coming Soon', 'Coming Soon'] },
    
    // Bottom row (2 hexagons)
    { id: 2, name: 'AI/ML', path: '#', description: 'Artificial Intelligence', color: 'from-green-500 to-green-600', subTopics: ['Coming Soon', 'Coming Soon', 'Coming Soon', 'Coming Soon', 'Coming Soon', 'Coming Soon'] },
    { id: 4, name: 'Cybersecurity', path: '#', description: 'Security & privacy', color: 'from-red-500 to-red-600', subTopics: ['Coming Soon', 'Coming Soon', 'Coming Soon', 'Coming Soon', 'Coming Soon', 'Coming Soon'] },
  ];

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 md:p-24 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-7xl relative">
        <h1 className="text-5xl md:text-6xl font-black mb-4 text-left text-gray-900 dark:text-white tracking-tight absolute top-0 left-0 z-10" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '-0.02em' }}>
          MOSAIC
        </h1>

        {/* Hexagonal Mosaic Layout */}
        <div className="flex justify-center items-center min-h-[600px] md:min-h-[700px]">
          <div className="hexagon-main">
            {/* Row 1: 2 hexagons (offset) */}
            <div className="hex-row offset">
              <HexagonTile
                tile={tiles[0]}
                index={0}
                hoveredTile={hoveredTile}
                setHoveredTile={setHoveredTile}
              />
              <HexagonTile
                tile={tiles[1]}
                index={1}
                hoveredTile={hoveredTile}
                setHoveredTile={setHoveredTile}
              />
            </div>
            
            {/* Row 2: 3 hexagons (center row, no offset) */}
            <div className="hex-row">
              <HexagonTile
                tile={tiles[2]}
                index={2}
                hoveredTile={hoveredTile}
                setHoveredTile={setHoveredTile}
              />
              <HexagonTile
                tile={tiles[3]}
                index={3}
                hoveredTile={hoveredTile}
                setHoveredTile={setHoveredTile}
              />
              <HexagonTile
                tile={tiles[4]}
                index={4}
                hoveredTile={hoveredTile}
                setHoveredTile={setHoveredTile}
              />
            </div>
            
            {/* Row 3: 2 hexagons (offset) */}
            <div className="hex-row offset">
              <HexagonTile
                tile={tiles[5]}
                index={5}
                hoveredTile={hoveredTile}
                setHoveredTile={setHoveredTile}
              />
              <HexagonTile
                tile={tiles[6]}
                index={6}
                hoveredTile={hoveredTile}
                setHoveredTile={setHoveredTile}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function HexagonTile({ 
  tile, 
  index,
  hoveredTile,
  setHoveredTile
}: { 
  tile: { id: number; name: string; path: string; description: string; color: string; subTopics?: string[] }; 
  index: number;
  hoveredTile: number | null;
  setHoveredTile: (id: number | null) => void;
}) {
  const isClickable = tile.path !== '#';
  const isCenter = tile.id === 0; // Center is the one with id 0, not necessarily index 0
  const isHovered = hoveredTile === tile.id;
  const hasHoveredTile = hoveredTile !== null && hoveredTile !== tile.id;
  
  const hexSize = 160;
  const subHexSize = hexSize * 0.5;
  const subHexSpacing = 1.6;
  
  // Calculate push-away effect for non-hovered tiles
  let pushScale = 1;
  let pushOpacity = 1;
  
  if (hasHoveredTile && !isHovered && !isCenter) {
    pushScale = 0.6;
    pushOpacity = 0.3;
  }

  // Generate sub-hexagon positions (6 around the main hexagon)
  const subHexPositions = isClickable && tile.subTopics ? tile.subTopics.map((_, subIndex) => {
    const subAngle = (subIndex * 60 - 90) * (Math.PI / 180);
    const subX = Math.cos(subAngle) * (hexSize * subHexSpacing);
    const subY = Math.sin(subAngle) * (hexSize * subHexSpacing);
    return { x: subX, y: subY, name: tile.subTopics?.[subIndex] || 'Coming Soon' };
  }) : [];

  const content = (
    <div
      className={`
        hexagon-item
        transition-all duration-700 ease-out
        flex flex-col items-center justify-center
        ${isClickable 
          ? 'cursor-pointer' 
          : isCenter 
            ? 'opacity-80' 
            : 'opacity-50'
        }
      `}
      style={{
        transform: isHovered && isClickable ? 'scale(1.2)' : `scale(${pushScale})`,
        zIndex: isHovered ? 100 : (isClickable ? 10 : 1),
        opacity: isHovered ? 1 : pushOpacity,
      }}
      onMouseEnter={() => isClickable && setHoveredTile(tile.id)}
      onMouseLeave={() => setHoveredTile(null)}
    >
      <div className={`
        w-full h-full
        flex flex-col items-center justify-center
        p-4 md:p-6
        transition-all duration-700
        ${isClickable 
          ? `bg-gradient-to-br ${tile.color} dark:${tile.color} text-white shadow-lg ${isHovered ? 'shadow-2xl' : ''}` 
          : isCenter
            ? 'bg-gradient-to-br from-gray-400 to-gray-500 dark:from-gray-600 dark:to-gray-700 text-white'
            : 'bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-800 text-gray-700 dark:text-gray-300'
        }
      `}>
        <h3 className={`${isCenter ? 'text-xl md:text-2xl' : 'text-base md:text-lg'} font-bold mb-1 md:mb-2 text-center transition-all duration-700 ${isHovered ? 'scale-110' : ''}`}>
          {tile.name}
        </h3>
        <p className={`text-xs md:text-sm text-center opacity-90 transition-all duration-700 ${isHovered ? 'opacity-100' : ''}`}>
          {tile.description}
        </p>
      </div>

      {/* Sub-hexagons that appear on hover */}
      {isHovered && isClickable && subHexPositions.length > 0 && (
        <div className="absolute inset-0 pointer-events-none">
          {subHexPositions.map((subHex, subIndex) => {
            const subHexH = Math.round(subHexSize * 1.1547);
            const subHexClip = "polygon(0% 25%, 0% 75%, 50% 100%, 100% 75%, 100% 25%, 50% 0%)";

            return (
              <div
                key={subIndex}
                className="absolute transition-all duration-500 ease-out"
                style={{
                  left: `calc(50% + ${subHex.x}px)`,
                  top: `calc(50% + ${subHex.y}px)`,
                  transform: 'translate(-50%, -50%)',
                  width: `${subHexSize}px`,
                  height: `${subHexH}px`,
                  clipPath: subHexClip,
                  WebkitClipPath: subHexClip,
                  opacity: 0,
                  animation: `fadeIn 0.4s ease-out ${subIndex * 80}ms forwards`,
                }}
              >
                <div className={`
                  w-full h-full
                  flex flex-col items-center justify-center
                  p-2
                  bg-gradient-to-br from-white/25 to-white/15 dark:from-white/15 dark:to-white/8
                  border border-white/40 dark:border-white/30
                  backdrop-blur-md
                  text-white
                  text-xs
                  font-semibold
                  shadow-lg
                `}>
                  {subHex.name}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  if (isClickable) {
    return (
      <Link href={tile.path} className="inline-block align-top">
        {content}
      </Link>
    );
  }

  return content;
}
