'use client';

import { useState, useEffect, useRef } from 'react';

// Hexagon tile data structure
interface HexagonTile {
  id: string;
  name: string;
  color: string;
  notes?: string;
  subTiles?: HexagonTile[];
  tesseraeDepth?: number;
}

// Default empty honeycomb pattern (2-3-2)
const DEFAULT_TILES: HexagonTile[] = [
  { id: '0', name: '', color: 'from-gray-400 to-gray-500' },
  { id: '1', name: '', color: 'from-gray-400 to-gray-500' },
  { id: '2', name: '', color: 'from-gray-400 to-gray-500' },
  { id: '3', name: '', color: 'from-gray-400 to-gray-500' },
  { id: '4', name: '', color: 'from-gray-400 to-gray-500' },
  { id: '5', name: '', color: 'from-gray-400 to-gray-500' },
  { id: '6', name: '', color: 'from-gray-400 to-gray-500' },
];

// Color options
const COLOR_OPTIONS = [
  { name: 'Blue', value: 'from-blue-500 to-blue-600' },
  { name: 'Purple', value: 'from-purple-500 to-purple-600' },
  { name: 'Green', value: 'from-green-500 to-green-600' },
  { name: 'Red', value: 'from-red-500 to-red-600' },
  { name: 'Yellow', value: 'from-yellow-500 to-yellow-600' },
  { name: 'Indigo', value: 'from-indigo-500 to-indigo-600' },
  { name: 'Teal', value: 'from-teal-500 to-teal-600' },
  { name: 'Pink', value: 'from-pink-500 to-pink-600' },
  { name: 'Orange', value: 'from-orange-500 to-orange-600' },
  { name: 'Gray', value: 'from-gray-400 to-gray-500' },
];

const GRADIENT_MAP: Record<string, { color: string; from: number; to: number }> = {
  'from-blue-500 to-blue-600': { color: 'blue', from: 500, to: 600 },
  'from-purple-500 to-purple-600': { color: 'purple', from: 500, to: 600 },
  'from-green-500 to-green-600': { color: 'green', from: 500, to: 600 },
  'from-red-500 to-red-600': { color: 'red', from: 500, to: 600 },
  'from-yellow-500 to-yellow-600': { color: 'yellow', from: 500, to: 600 },
  'from-indigo-500 to-indigo-600': { color: 'indigo', from: 500, to: 600 },
  'from-teal-500 to-teal-600': { color: 'teal', from: 500, to: 600 },
  'from-pink-500 to-pink-600': { color: 'pink', from: 500, to: 600 },
  'from-orange-500 to-orange-600': { color: 'orange', from: 500, to: 600 },
  'from-gray-400 to-gray-500': { color: 'gray', from: 400, to: 500 },
};

const clampShade = (shade: number) => Math.min(900, Math.max(100, Math.round(shade / 50) * 50));

const shiftGradient = (gradient: string, step: number = -100) => {
  const parsed = GRADIENT_MAP[gradient];
  if (!parsed) return gradient;
  const nextFrom = clampShade(parsed.from + step);
  const nextTo = clampShade(parsed.to + step);
  return `from-${parsed.color}-${nextFrom} to-${parsed.color}-${nextTo}`;
};

const createChildTiles = (parentId: string, color: string, depth: number) =>
  Array.from({ length: 6 }).map((_, idx) => ({
    id: `${parentId}-${Date.now()}-${idx}`,
    name: '',
    color,
    notes: '',
    subTiles: [],
    tesseraeDepth: depth,
  }));

export default function Home() {
  const [tiles, setTiles] = useState<HexagonTile[]>(DEFAULT_TILES);
  const [hoveredTile, setHoveredTile] = useState<string | null>(null);
  const [editingTile, setEditingTile] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingColor, setEditingColor] = useState('');
  const [editingParentId, setEditingParentId] = useState<string | null>(null);
  const [editingSubIndex, setEditingSubIndex] = useState<number | null>(null);
  const [notesTile, setNotesTile] = useState<{ id: string; parentId?: string | null } | null>(null);
  const [notesDraft, setNotesDraft] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('mosaic-tiles');
    if (saved) {
      try {
        setTiles(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load saved tiles:', e);
      }
    }
  }, []);

  // Save to localStorage whenever tiles change
  useEffect(() => {
    localStorage.setItem('mosaic-tiles', JSON.stringify(tiles));
  }, [tiles]);

  // Focus input when editing starts
  useEffect(() => {
    if (editingTile && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [editingTile]);

  const handleDoubleClick = (tileId: string, parentId?: string, subIndex?: number) => {
    if (parentId && subIndex !== null && subIndex !== undefined) {
      // Editing a sub-tile
      const parentTile = tiles.find(t => t.id === parentId);
      const subTile = parentTile?.subTiles?.[subIndex];
      if (subTile) {
        setEditingTile(subTile.id);
        setEditingName(subTile.name);
        setEditingColor(subTile.color);
        setEditingParentId(parentId);
        setEditingSubIndex(subIndex);
      }
    } else {
      // Editing a main tile
      const tile = tiles.find(t => t.id === tileId);
      if (tile) {
        setEditingTile(tileId);
        setEditingName(tile.name);
        setEditingColor(tile.color);
        setEditingParentId(null);
        setEditingSubIndex(null);
      }
    }
  };

  const handleSaveEdit = () => {
    if (!editingTile) return;

    setTiles(prevTiles => {
      if (editingParentId !== null && editingSubIndex !== null) {
        // Editing a sub-tile
        return prevTiles.map(tile => {
          if (tile.id === editingParentId && tile.subTiles) {
            return {
              ...tile,
              subTiles: tile.subTiles.map((subTile, idx) =>
                idx === editingSubIndex && subTile.id === editingTile
                  ? { ...subTile, name: editingName.trim() || '', color: editingColor }
                  : subTile
              ),
            };
          }
          return tile;
        });
      } else {
        // Editing a main tile
        return prevTiles.map(tile =>
          tile.id === editingTile
            ? {
                ...tile,
                name: editingName.trim() || '',
                color: editingColor,
                subTiles:
                  (tile.subTiles && tile.subTiles.length > 0)
                    ? tile.subTiles
                    : (editingName.trim() ? createChildTiles(tile.id, editingColor, (tile.tesseraeDepth ?? 0) + 1) : tile.subTiles),
              }
            : tile
        );
      }
    });

    setEditingTile(null);
    setEditingName('');
    setEditingColor('');
    setEditingParentId(null);
    setEditingSubIndex(null);
  };

  const handleCancelEdit = () => {
    setEditingTile(null);
    setEditingName('');
    setEditingColor('');
    setEditingParentId(null);
    setEditingSubIndex(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const addSubTile = (parentId: string) => {
    const parentTile = tiles.find(t => t.id === parentId);
    if (!parentTile) return;

    const newSubTile: HexagonTile = {
      id: `${parentId}-${Date.now()}`,
      name: '',
      color: parentTile.color, // Inherit parent color
      notes: '',
      subTiles: [],
      tesseraeDepth: (parentTile.tesseraeDepth ?? 0) + 1,
    };

    setTiles(prevTiles =>
      prevTiles.map(tile =>
        tile.id === parentId
          ? {
              ...tile,
              subTiles: [...(tile.subTiles || []), newSubTile],
            }
          : tile
      )
    );

    // Start editing the new sub-tile
    setTimeout(() => {
      handleDoubleClick(newSubTile.id, parentId, (parentTile.subTiles?.length || 0));
    }, 100);
  };

  const applyTesserae = (tileId: string, parentId?: string) => {
    let nextHovered: string | null = null;
    setTiles(prevTiles =>
      prevTiles.map(tile => {
        if (parentId && tile.id === parentId && tile.subTiles) {
          const updatedSubs = tile.subTiles.map(child => {
            if (child.id !== tileId) return child;
            const nextDepth = (child.tesseraeDepth ?? 0) + 1;
            nextHovered = child.id;
            return {
              ...child,
              tesseraeDepth: nextDepth,
              subTiles: child.subTiles && child.subTiles.length > 0
                ? child.subTiles
                : createChildTiles(child.id, child.color, nextDepth),
            };
          });
          return { ...tile, subTiles: updatedSubs };
        }

        if (!parentId && tile.id === tileId) {
          const nextDepth = (tile.tesseraeDepth ?? 0) + 1;
          nextHovered = tile.id;
          return {
            ...tile,
            tesseraeDepth: nextDepth,
            subTiles: tile.subTiles && tile.subTiles.length > 0
              ? tile.subTiles
              : createChildTiles(tile.id, tile.color, nextDepth),
          };
        }

        return tile;
      })
    );
    if (nextHovered) {
      setHoveredTile(nextHovered);
    }
  };

  const openNotes = (tileId: string, parentId?: string) => {
    if (parentId) {
      const parentTile = tiles.find(t => t.id === parentId);
      const subTile = parentTile?.subTiles?.find(st => st.id === tileId);
      setNotesDraft(subTile?.notes || '');
    } else {
      const tile = tiles.find(t => t.id === tileId);
      setNotesDraft(tile?.notes || '');
    }
    setNotesTile({ id: tileId, parentId: parentId ?? null });
  };

  const saveNotes = () => {
    if (!notesTile) return;
    const { id, parentId } = notesTile;
    setTiles(prevTiles =>
      prevTiles.map(tile => {
        if (parentId && tile.id === parentId && tile.subTiles) {
          return {
            ...tile,
            subTiles: tile.subTiles.map(st =>
              st.id === id ? { ...st, notes: notesDraft } : st
            ),
          };
        }
        if (!parentId && tile.id === id) {
          return { ...tile, notes: notesDraft };
        }
        return tile;
      })
    );
    setNotesTile(null);
    setNotesDraft('');
  };

  const cancelNotes = () => {
    setNotesTile(null);
    setNotesDraft('');
  };

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
                onDoubleClick={handleDoubleClick}
                editingTile={editingTile}
                editingName={editingName}
                editingColor={editingColor}
                setEditingName={setEditingName}
                setEditingColor={setEditingColor}
                onSave={handleSaveEdit}
                onCancel={handleCancelEdit}
                onKeyDown={handleKeyDown}
                nameInputRef={nameInputRef}
                addSubTile={addSubTile}
                tiles={tiles}
                setTiles={setTiles}
                applyTesserae={applyTesserae}
                openNotes={openNotes}
              />
              <HexagonTile
                tile={tiles[1]}
                index={1}
                hoveredTile={hoveredTile}
                setHoveredTile={setHoveredTile}
                onDoubleClick={handleDoubleClick}
                editingTile={editingTile}
                editingName={editingName}
                editingColor={editingColor}
                setEditingName={setEditingName}
                setEditingColor={setEditingColor}
                onSave={handleSaveEdit}
                onCancel={handleCancelEdit}
                onKeyDown={handleKeyDown}
                nameInputRef={nameInputRef}
                addSubTile={addSubTile}
                tiles={tiles}
                setTiles={setTiles}
                applyTesserae={applyTesserae}
                openNotes={openNotes}
              />
            </div>
            
            {/* Row 2: 3 hexagons (center row, no offset) */}
            <div className="hex-row">
              <HexagonTile
                tile={tiles[2]}
                index={2}
                hoveredTile={hoveredTile}
                setHoveredTile={setHoveredTile}
                onDoubleClick={handleDoubleClick}
                editingTile={editingTile}
                editingName={editingName}
                editingColor={editingColor}
                setEditingName={setEditingName}
                setEditingColor={setEditingColor}
                onSave={handleSaveEdit}
                onCancel={handleCancelEdit}
                onKeyDown={handleKeyDown}
                nameInputRef={nameInputRef}
                addSubTile={addSubTile}
                tiles={tiles}
                setTiles={setTiles}
                applyTesserae={applyTesserae}
                openNotes={openNotes}
              />
              <HexagonTile
                tile={tiles[3]}
                index={3}
                hoveredTile={hoveredTile}
                setHoveredTile={setHoveredTile}
                onDoubleClick={handleDoubleClick}
                editingTile={editingTile}
                editingName={editingName}
                editingColor={editingColor}
                setEditingName={setEditingName}
                setEditingColor={setEditingColor}
                onSave={handleSaveEdit}
                onCancel={handleCancelEdit}
                onKeyDown={handleKeyDown}
                nameInputRef={nameInputRef}
                addSubTile={addSubTile}
                tiles={tiles}
                setTiles={setTiles}
                applyTesserae={applyTesserae}
                openNotes={openNotes}
              />
              <HexagonTile
                tile={tiles[4]}
                index={4}
                hoveredTile={hoveredTile}
                setHoveredTile={setHoveredTile}
                onDoubleClick={handleDoubleClick}
                editingTile={editingTile}
                editingName={editingName}
                editingColor={editingColor}
                setEditingName={setEditingName}
                setEditingColor={setEditingColor}
                onSave={handleSaveEdit}
                onCancel={handleCancelEdit}
                onKeyDown={handleKeyDown}
                nameInputRef={nameInputRef}
                addSubTile={addSubTile}
                tiles={tiles}
                setTiles={setTiles}
                applyTesserae={applyTesserae}
                openNotes={openNotes}
              />
            </div>
            
            {/* Row 3: 2 hexagons (offset) */}
            <div className="hex-row offset">
              <HexagonTile
                tile={tiles[5]}
                index={5}
                hoveredTile={hoveredTile}
                setHoveredTile={setHoveredTile}
                onDoubleClick={handleDoubleClick}
                editingTile={editingTile}
                editingName={editingName}
                editingColor={editingColor}
                setEditingName={setEditingName}
                setEditingColor={setEditingColor}
                onSave={handleSaveEdit}
                onCancel={handleCancelEdit}
                onKeyDown={handleKeyDown}
                nameInputRef={nameInputRef}
                addSubTile={addSubTile}
                tiles={tiles}
                setTiles={setTiles}
                applyTesserae={applyTesserae}
                openNotes={openNotes}
              />
              <HexagonTile
                tile={tiles[6]}
                index={6}
                hoveredTile={hoveredTile}
                setHoveredTile={setHoveredTile}
                onDoubleClick={handleDoubleClick}
                editingTile={editingTile}
                editingName={editingName}
                editingColor={editingColor}
                setEditingName={setEditingName}
                setEditingColor={setEditingColor}
                onSave={handleSaveEdit}
                onCancel={handleCancelEdit}
                onKeyDown={handleKeyDown}
                nameInputRef={nameInputRef}
                addSubTile={addSubTile}
                tiles={tiles}
                setTiles={setTiles}
                applyTesserae={applyTesserae}
                openNotes={openNotes}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Notes Modal */}
      {notesTile && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={cancelNotes}>
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-full max-w-lg p-6 relative" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Notes</h2>
            <textarea
              className="w-full h-40 p-3 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={notesDraft}
              onChange={(e) => setNotesDraft(e.target.value)}
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
                onClick={cancelNotes}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={saveNotes}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function HexagonTile({
  tile,
  index,
  hoveredTile,
  setHoveredTile,
  onDoubleClick,
  editingTile,
  editingName,
  editingColor,
  setEditingName,
  setEditingColor,
  onSave,
  onCancel,
  onKeyDown,
  nameInputRef,
  addSubTile,
  tiles,
  setTiles,
  applyTesserae,
  openNotes,
}: {
  tile: HexagonTile;
  index: number;
  hoveredTile: string | null;
  setHoveredTile: (id: string | null) => void;
  onDoubleClick: (tileId: string, parentId?: string, subIndex?: number) => void;
  editingTile: string | null;
  editingName: string;
  editingColor: string;
  setEditingName: (name: string) => void;
  setEditingColor: (color: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  nameInputRef: React.RefObject<HTMLInputElement>;
  addSubTile: (parentId: string) => void;
  tiles: HexagonTile[];
  setTiles: React.Dispatch<React.SetStateAction<HexagonTile[]>>;
  applyTesserae: (tileId: string, parentId?: string) => void;
  openNotes: (tileId: string, parentId?: string) => void;
}) {
  const isHovered = hoveredTile === tile.id;
  const isEditing = editingTile === tile.id;
  const hasSubTiles = tile.subTiles && tile.subTiles.length > 0;
  const hasHoveredTile = hoveredTile !== null && hoveredTile !== tile.id;
  const hasName = tile.name.trim() !== '';
  const isCenterTile = index === 3; // Center tile is at index 3 (middle of middle row)
  const canShowSubTiles = hasName && hasSubTiles && !isCenterTile;
  const canHover = hasName && !isCenterTile; // Allow hover if tile has a name, but not for center tile
  
  const hexSize = 160;
  
  // Calculate push-away effect for non-hovered tiles
  // Center tile should fade out like others, but won't be hoverable
  let pushScale = 1;
  let pushOpacity = 1;
  
  if (hasHoveredTile && !isHovered) {
    pushScale = 0.6;
    pushOpacity = 0.3;
  }

  // Generate sub-hexagon positions in honeycomb pattern
  const calculateHoneycombPositions = (centerX: number, centerY: number, hexSize: number, items: HexagonTile[], spacing: number = 5) => {
    const hexHeight = hexSize * 1.1547;
    const rowOverlap = hexHeight * 0.2886;
    
    const horizontalDistance = hexSize + spacing;
    const verticalDistance = hexHeight + spacing;
    
    const topLeft = { x: centerX - horizontalDistance / 2, y: centerY - verticalDistance + rowOverlap - spacing, tile: items[0], index: 0 };
    const topRight = { x: centerX + horizontalDistance / 2, y: centerY - verticalDistance + rowOverlap - spacing, tile: items[1], index: 1 };
    const middleLeft = { x: centerX - horizontalDistance, y: centerY, tile: items[2], index: 2 };
    const middleRight = { x: centerX + horizontalDistance, y: centerY, tile: items[3], index: 3 };
    const bottomLeft = { x: centerX - horizontalDistance / 2, y: centerY + verticalDistance - rowOverlap + spacing, tile: items[4], index: 4 };
    const bottomRight = { x: centerX + horizontalDistance / 2, y: centerY + verticalDistance - rowOverlap + spacing, tile: items[5], index: 5 };
    
    return [topLeft, topRight, middleLeft, middleRight, bottomLeft, bottomRight].filter(item => item.tile);
  };

  const subHexPositions = hasSubTiles && tile.subTiles
    ? calculateHoneycombPositions(0, 0, hexSize, tile.subTiles, 5)
    : [];


  const content = (
    <div 
      className="relative"
      data-tile-id={tile.id}
      style={{ 
        transform: isHovered && canHover ? (canShowSubTiles ? 'scale(1.2)' : 'scale(1.05)') : `scale(${pushScale})`, 
        zIndex: isHovered ? 50 : 10, 
        opacity: isHovered ? 1 : pushOpacity 
      }}
      onMouseEnter={() => {
        if (canHover) {
          setHoveredTile(tile.id);
        }
      }}
      onMouseLeave={(e) => {
        // Only clear hover if we're not moving to a sub-tile, the "+" button, or back to the main tile
        const relatedTarget = e.relatedTarget as HTMLElement;
        if (!relatedTarget || 
            (!relatedTarget.closest(`[data-sub-tile-container="${tile.id}"]`) &&
             !relatedTarget.closest(`[data-tile-id="${tile.id}"]`) &&
             !relatedTarget.closest(`[data-add-sub-tile="${tile.id}"]`))) {
          setHoveredTile(null);
        }
      }}
    >
      <div
        className={`
          hexagon-item
          transition-all duration-700 ease-out
          flex flex-col items-center justify-center
          cursor-pointer
        `}
        onDoubleClick={() => onDoubleClick(tile.id)}
      >
        <div className={`
          w-full h-full
          flex flex-col items-center justify-center
          p-4 md:p-6
          transition-all duration-700
          bg-gradient-to-br ${tile.color} dark:${tile.color} text-white shadow-lg ${isHovered ? 'shadow-2xl' : ''}
        `}>
          {isEditing ? (
            <div className="w-full space-y-2" onClick={(e) => e.stopPropagation()}>
              <input
                ref={nameInputRef}
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onKeyDown={onKeyDown}
                className="w-full px-2 py-1 text-base font-bold text-center bg-white/20 text-white placeholder-white/50 rounded border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                placeholder="Enter name..."
              />
              <select
                value={editingColor}
                onChange={(e) => setEditingColor(e.target.value)}
                className="w-full px-2 py-1 text-sm text-center bg-white/20 text-white rounded border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                onClick={(e) => e.stopPropagation()}
              >
                {COLOR_OPTIONS.map(color => (
                  <option key={color.value} value={color.value} className="bg-gray-800 text-white">
                    {color.name}
                  </option>
                ))}
              </select>
              <div className="flex gap-2 justify-center mt-2">
                <button
                  onClick={(e) => { e.stopPropagation(); onSave(); }}
                  className="px-3 py-1 text-xs bg-white/30 hover:bg-white/40 rounded transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onCancel(); }}
                  className="px-3 py-1 text-xs bg-white/30 hover:bg-white/40 rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <h3 className={`text-base md:text-lg font-bold mb-1 md:mb-2 text-center transition-all duration-700 ${isHovered ? 'scale-110' : ''}`}>
                {tile.name || 'Double-click to edit'}
              </h3>
              {canShowSubTiles && (
                <p className="text-xs text-center opacity-75 mt-1">
                  {tile.subTiles?.length} nested tiles
                </p>
              )}
              {hasName && (
                <div className="mt-2 flex flex-wrap gap-2 justify-center text-xs">
                  <button
                    className="px-2 py-1 bg-white/20 hover:bg-white/30 rounded border border-white/30 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      openNotes(tile.id);
                    }}
                  >
                    Notes
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Sub-hexagons that appear on hover */}
      {isHovered && canHover && (
        <div 
          className="absolute"
          data-sub-tile-container={tile.id}
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: 0,
            height: 0,
            zIndex: 40,
            pointerEvents: 'none',
          }}
          onMouseEnter={() => setHoveredTile(tile.id)}
          onMouseLeave={(e) => {
            const relatedTarget = e.relatedTarget as HTMLElement;
            // Don't clear hover if moving to a sub-tile or the main tile
            if (!relatedTarget || 
                (!relatedTarget.closest(`[data-sub-tile-container="${tile.id}"]`) &&
                 !relatedTarget.closest(`[data-tile-id="${tile.id}"]`) &&
                 !relatedTarget.closest(`[data-add-sub-tile="${tile.id}"]`))) {
              setHoveredTile(null);
            }
          }}
        >
          {subHexPositions.length > 0 && subHexPositions.map((subHex) => {
            const subHexH = Math.round(hexSize * 1.1547);
            const subHexClip = "polygon(0% 25%, 0% 75%, 50% 100%, 100% 75%, 100% 25%, 50% 0%)";
            const isSubEditing = editingTile === subHex.tile.id;

            return (
              <div
                key={subHex.tile.id}
                className="absolute transition-all duration-500 ease-out cursor-pointer pointer-events-auto"
                style={{
                  left: `${subHex.x}px`,
                  top: `${subHex.y}px`,
                  transform: 'translate(-50%, -50%)',
                  width: `${hexSize}px`,
                  height: `${subHexH}px`,
                  clipPath: subHexClip,
                  WebkitClipPath: subHexClip,
                  opacity: 0,
                  animation: `fadeIn 0.4s ease-out ${subHex.index * 80}ms forwards`,
                  zIndex: 45,
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  onDoubleClick(subHex.tile.id, tile.id, subHex.index);
                }}
                onMouseEnter={() => setHoveredTile(tile.id)}
                onMouseLeave={(e) => {
                  const relatedTarget = e.relatedTarget as HTMLElement;
                  if (!relatedTarget || !relatedTarget.closest(`[data-sub-tile-container="${tile.id}"]`)) {
                    setHoveredTile(null);
                  }
                }}
              >
                <div
                  className={`
                    w-full h-full
                    flex flex-col items-center justify-center
                    p-4 md:p-6
                    bg-gradient-to-br ${subHex.tile.color} dark:${subHex.tile.color} text-white
                    border border-white/40 dark:border-white/30
                    shadow-lg
                    hover:scale-110
                  `}
                  style={{
                    filter: subHex.tile.tesseraeDepth
                      ? `brightness(${Math.max(0.6, 1 - 0.08 * subHex.tile.tesseraeDepth)})`
                      : undefined,
                  }}
                >
                  {isSubEditing ? (
                    <div className="w-full space-y-2" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={onKeyDown}
                        className="w-full px-2 py-1 text-sm font-bold text-center bg-white/20 text-white placeholder-white/50 rounded border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                        placeholder="Enter name..."
                        autoFocus
                      />
                      <div className="flex gap-2 justify-center mt-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); onSave(); }}
                          className="px-2 py-1 text-xs bg-white/30 hover:bg-white/40 rounded transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); onCancel(); }}
                          className="px-2 py-1 text-xs bg-white/30 hover:bg-white/40 rounded transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-sm md:text-base font-semibold">
                        {subHex.tile.name || 'Double-click to edit'}
                      </span>
                      {subHex.tile.name.trim() !== '' && (
                        <div className="flex gap-2 text-xs">
                          <button
                            className="px-2 py-1 bg-white/20 hover:bg-white/30 rounded border border-white/30 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              openNotes(subHex.tile.id, tile.id);
                            }}
                          >
                            Notes
                          </button>
                          <button
                            className="px-2 py-1 bg-white/20 hover:bg-white/30 rounded border border-white/30 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              applyTesserae(subHex.tile.id, tile.id);
                            }}
                          >
                            Tesserae
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          
          {/* Add sub-tile button - positioned in next available slot */}
          {subHexPositions.length < 6 && (
            (() => {
              // Calculate position for next sub-tile based on pattern
              const hexHeight = hexSize * 1.1547;
              const rowOverlap = hexHeight * 0.2886;
              const spacing = 5;
              const horizontalDistance = hexSize + spacing;
              const verticalDistance = hexHeight + spacing;
              
              let nextPos = { x: 0, y: 0 };
              if (subHexPositions.length === 0) {
                // First sub-tile: top-left
                nextPos = { x: -horizontalDistance / 2, y: -verticalDistance + rowOverlap - spacing };
              } else if (subHexPositions.length === 1) {
                // Second: top-right
                nextPos = { x: horizontalDistance / 2, y: -verticalDistance + rowOverlap - spacing };
              } else if (subHexPositions.length === 2) {
                // Third: middle-left
                nextPos = { x: -horizontalDistance, y: 0 };
              } else if (subHexPositions.length === 3) {
                // Fourth: middle-right
                nextPos = { x: horizontalDistance, y: 0 };
              } else if (subHexPositions.length === 4) {
                // Fifth: bottom-left
                nextPos = { x: -horizontalDistance / 2, y: verticalDistance - rowOverlap + spacing };
              } else {
                // Sixth: bottom-right
                nextPos = { x: horizontalDistance / 2, y: verticalDistance - rowOverlap + spacing };
              }
              
              return (
                <div
                  className="absolute cursor-pointer transition-all duration-500 ease-out pointer-events-auto"
                  data-add-sub-tile={tile.id}
                  style={{
                    left: `${nextPos.x}px`,
                    top: `${nextPos.y}px`,
                    transform: 'translate(-50%, -50%)',
                    width: `${hexSize}px`,
                    height: `${Math.round(hexSize * 1.1547)}px`,
                    clipPath: "polygon(0% 25%, 0% 75%, 50% 100%, 100% 75%, 100% 25%, 50% 0%)",
                    WebkitClipPath: "polygon(0% 25%, 0% 75%, 50% 100%, 100% 75%, 100% 25%, 50% 0%)",
                    opacity: 0.5,
                    animation: `fadeIn 0.4s ease-out ${subHexPositions.length * 80}ms forwards`,
                    zIndex: 45,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    addSubTile(tile.id);
                  }}
                  onMouseEnter={() => {
                    setHoveredTile(tile.id);
                  }}
                  onMouseLeave={(e) => {
                    const relatedTarget = e.relatedTarget as HTMLElement;
                    // Don't clear hover if moving to another part of the same tile cluster
                    if (!relatedTarget || 
                        (!relatedTarget.closest(`[data-sub-tile-container="${tile.id}"]`) &&
                         !relatedTarget.closest(`[data-tile-id="${tile.id}"]`) &&
                         !relatedTarget.closest(`[data-add-sub-tile="${tile.id}"]`))) {
                      setHoveredTile(null);
                    }
                  }}
                >
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/10 to-white/5 border-2 border-dashed border-white/30 text-white text-2xl hover:scale-110 transition-transform">
                    +
                  </div>
                </div>
              );
            })()
          )}
        </div>
      )}
    </div>
  );

  return content;
}
