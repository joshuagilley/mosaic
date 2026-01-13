'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Home() {
  const [hoveredTile, setHoveredTile] = useState<number | null>(null);

  // Top-level CS topics arranged in circular pattern
  // Using polar coordinates: (radius, angle) where angle is in degrees
  const tiles = [
    // Center
    { id: 0, name: 'Computer Science', path: '#', description: 'Explore CS Topics', radius: 0, angle: 0, color: 'from-purple-500 to-purple-600' },
    
    // Outer ring (8 hexagons for main CS topics)
    { id: 1, name: 'Data Science', path: '/data-science', description: 'Data analysis & visualization', radius: 1, angle: 0, color: 'from-blue-500 to-blue-600', subTopics: ['Vektor', 'Coming Soon', 'Coming Soon', 'Coming Soon', 'Coming Soon', 'Coming Soon'] }, // Top
    { id: 2, name: 'AI/ML', path: '#', description: 'Artificial Intelligence', radius: 1, angle: 45, color: 'from-green-500 to-green-600', subTopics: ['Coming Soon', 'Coming Soon', 'Coming Soon', 'Coming Soon', 'Coming Soon', 'Coming Soon'] }, // Top-right
    { id: 3, name: 'Software Engineering', path: '#', description: 'Development practices', radius: 1, angle: 90, color: 'from-yellow-500 to-yellow-600', subTopics: ['Coming Soon', 'Coming Soon', 'Coming Soon', 'Coming Soon', 'Coming Soon', 'Coming Soon'] }, // Right
    { id: 4, name: 'Cybersecurity', path: '#', description: 'Security & privacy', radius: 1, angle: 135, color: 'from-red-500 to-red-600', subTopics: ['Coming Soon', 'Coming Soon', 'Coming Soon', 'Coming Soon', 'Coming Soon', 'Coming Soon'] }, // Bottom-right
    { id: 5, name: 'Algorithms & Theory', path: '#', description: 'Computational theory', radius: 1, angle: 180, color: 'from-indigo-500 to-indigo-600', subTopics: ['Coming Soon', 'Coming Soon', 'Coming Soon', 'Coming Soon', 'Coming Soon', 'Coming Soon'] }, // Bottom
    { id: 6, name: 'Computer Systems', path: '#', description: 'Systems & architecture', radius: 1, angle: 225, color: 'from-teal-500 to-teal-600', subTopics: ['Coming Soon', 'Coming Soon', 'Coming Soon', 'Coming Soon', 'Coming Soon', 'Coming Soon'] }, // Bottom-left
    { id: 7, name: 'HCI', path: '#', description: 'Human-Computer Interaction', radius: 1, angle: 270, color: 'from-pink-500 to-pink-600', subTopics: ['Coming Soon', 'Coming Soon', 'Coming Soon', 'Coming Soon', 'Coming Soon', 'Coming Soon'] }, // Left
    { id: 8, name: 'Graphics', path: '#', description: 'Computer graphics', radius: 1, angle: 315, color: 'from-orange-500 to-orange-600', subTopics: ['Coming Soon', 'Coming Soon', 'Coming Soon', 'Coming Soon', 'Coming Soon', 'Coming Soon'] }, // Top-left
  ];

  // Hexagon size and spacing
  const hexSize = 100; // Size of hexagon (distance from center to vertex)
  const hexSpacing = 2.2; // Multiplier for spacing between hexagons

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 md:p-24 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-7xl relative">
        <h1 className="text-5xl md:text-6xl font-black mb-4 text-left text-gray-900 dark:text-white tracking-tight absolute top-0 left-0 z-10" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '-0.02em' }}>
          MOSAIC
        </h1>

        {/* Hexagonal Mosaic Layout */}
        <div className="flex justify-center items-center min-h-[600px] md:min-h-[700px]">
          <div className="relative" style={{ width: `${hexSize * hexSpacing * 4}px`, height: `${hexSize * hexSpacing * 4}px` }}>
            {tiles.map((tile) => {
              // Convert polar to cartesian coordinates
              const angleRad = (tile.angle * Math.PI) / 180;
              const x = tile.radius * hexSize * hexSpacing * Math.cos(angleRad);
              const y = tile.radius * hexSize * hexSpacing * Math.sin(angleRad);
              
              return (
                <HexagonTile
                  key={tile.id}
                  tile={tile}
                  x={x}
                  y={y}
                  size={hexSize}
                  hoveredTile={hoveredTile}
                  setHoveredTile={setHoveredTile}
                  allTiles={tiles}
                />
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}

function HexagonTile({ 
  tile, 
  x, 
  y, 
  size,
  hoveredTile,
  setHoveredTile,
  allTiles
}: { 
  tile: { id: number; name: string; path: string; description: string; radius: number; angle: number; color: string; subTopics?: string[] }; 
  x: number; 
  y: number; 
  size: number;
  hoveredTile: number | null;
  setHoveredTile: (id: number | null) => void;
  allTiles: Array<{ id: number; name: string; path: string; description: string; radius: number; angle: number; color: string; subTopics?: string[] }>;
}) {
  const isClickable = tile.path !== '#';
  const isCenter = tile.radius === 0;
  const isHovered = hoveredTile === tile.id;
  const hasHoveredTile = hoveredTile !== null && hoveredTile !== tile.id;
  const subHexSize = size * 0.4; // Smaller sub-hexagons
  const subHexSpacing = 1.3; // Spacing for sub-hexagons
  
  // Calculate push-away effect for non-hovered tiles
  let pushX = 0;
  let pushY = 0;
  let pushScale = 1;
  let pushOpacity = 1;
  
  if (hasHoveredTile && !isHovered && !isCenter) {
    const hoveredTileData = allTiles.find(t => t.id === hoveredTile);
    if (hoveredTileData) {
      const hoveredAngleRad = (hoveredTileData.angle * Math.PI) / 180;
      const hoveredX = hoveredTileData.radius * size * 2.2 * Math.cos(hoveredAngleRad);
      const hoveredY = hoveredTileData.radius * size * 2.2 * Math.sin(hoveredAngleRad);
      
      // Calculate direction away from hovered tile
      const dx = x - hoveredX;
      const dy = y - hoveredY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const pushDistance = size * 1.5; // How far to push
      
      if (distance > 0) {
        pushX = (dx / distance) * pushDistance;
        pushY = (dy / distance) * pushDistance;
      }
      
      pushScale = 0.6; // Scale down non-hovered tiles
      pushOpacity = 0.3; // Fade out non-hovered tiles
    }
  }
  
  // Create hexagon points for clip-path
  const hexPoints = Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i;
    const px = 50 + 50 * Math.cos(angle);
    const py = 50 + 50 * Math.sin(angle);
    return `${px}% ${py}%`;
  }).join(', ');

  // Generate sub-hexagon positions (6 around the main hexagon)
  const subHexPositions = isClickable && tile.subTopics ? tile.subTopics.map((_, index) => {
    const subAngle = (index * 60 - 90) * (Math.PI / 180); // Start at top, 60 degrees apart
    const subX = Math.cos(subAngle) * (size * subHexSpacing);
    const subY = Math.sin(subAngle) * (size * subHexSpacing);
    return { x: subX, y: subY, name: tile.subTopics?.[index] || 'Coming Soon' };
  }) : [];

  const content = (
    <div
      className={`
        absolute
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
        left: `calc(50% + ${x + pushX}px)`,
        top: `calc(50% + ${y + pushY}px)`,
        transform: `translate(-50%, -50%) ${isHovered && isClickable ? 'scale(1.5)' : `scale(${pushScale})`}`,
        width: `${size * 2}px`,
        height: `${size * 2}px`,
        clipPath: `polygon(${hexPoints})`,
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
          ? `bg-gradient-to-br ${tile.color} dark:${tile.color} text-white border-2 border-opacity-50 shadow-lg ${isHovered ? 'shadow-2xl' : ''}` 
          : isCenter
            ? 'bg-gradient-to-br from-gray-400 to-gray-500 dark:from-gray-600 dark:to-gray-700 text-white border-2 border-gray-500 dark:border-gray-600'
            : 'bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-400 dark:border-gray-600'
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
          {subHexPositions.map((subHex, index) => {
            const subHexPoints = Array.from({ length: 6 }, (_, i) => {
              const angle = (Math.PI / 3) * i;
              const px = 50 + 50 * Math.cos(angle);
              const py = 50 + 50 * Math.sin(angle);
              return `${px}% ${py}%`;
            }).join(', ');

            return (
              <div
                key={index}
                className="absolute transition-all duration-500 ease-out"
                style={{
                  left: `calc(50% + ${subHex.x}px)`,
                  top: `calc(50% + ${subHex.y}px)`,
                  transform: 'translate(-50%, -50%)',
                  width: `${subHexSize * 2}px`,
                  height: `${subHexSize * 2}px`,
                  clipPath: `polygon(${subHexPoints})`,
                  opacity: 0,
                  animation: `fadeIn 0.4s ease-out ${index * 80}ms forwards`,
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
      <Link href={tile.path} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
