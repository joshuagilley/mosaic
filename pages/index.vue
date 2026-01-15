<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue';

interface HexagonTile {
  id: string;
  name: string;
  color: string;
  notes?: string;
  subTiles?: HexagonTile[];
  tesseraeDepth?: number;
}

const DEFAULT_TILES: HexagonTile[] = [
  { id: '0', name: '', color: 'from-gray-400 to-gray-500' },
  { id: '1', name: '', color: 'from-gray-400 to-gray-500' },
  { id: '2', name: '', color: 'from-gray-400 to-gray-500' },
  { id: '3', name: '', color: 'from-gray-400 to-gray-500' },
  { id: '4', name: '', color: 'from-gray-400 to-gray-500' },
  { id: '5', name: '', color: 'from-gray-400 to-gray-500' },
  { id: '6', name: '', color: 'from-gray-400 to-gray-500' },
];

const tiles = ref<HexagonTile[]>(DEFAULT_TILES);
const hoveredTile = ref<string | null>(null);
const editingTile = ref<string | null>(null);
const editingName = ref('');
const editingColor = ref('');
const editingParentId = ref<string | null>(null);
const editingSubIndex = ref<number | null>(null);
const notesTile = ref<{ id: string; parentId?: string | null } | null>(null);
const notesDraft = ref('');
const setHoveredTile = (id: string | null) => {
  hoveredTile.value = id;
};
const setEditingNameValue = (name: string) => {
  editingName.value = name;
};
const setEditingColorValue = (color: string) => {
  editingColor.value = color;
};
const setNotesDraftValue = (value: string) => {
  notesDraft.value = value;
};

onMounted(() => {
  const saved = localStorage.getItem('mosaic-tiles');
  if (saved) {
    try {
      tiles.value = JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load saved tiles:', e);
    }
  }
});

watch(
  tiles,
  () => {
    if (process.client) {
      localStorage.setItem('mosaic-tiles', JSON.stringify(tiles.value));
    }
  },
  { deep: true },
);

watch(editingTile, (val) => {
  if (val) {
    nextTick(() => {
      // Input focus is handled in child component.
    });
  }
});

const createChildTiles = (parentId: string, color: string, depth: number) =>
  Array.from({ length: 6 }).map((_, idx) => ({
    id: `${parentId}-${Date.now()}-${idx}`,
    name: '',
    color,
    notes: '',
    subTiles: [],
    tesseraeDepth: depth,
  }));

const handleDoubleClick = (tileId: string, parentId?: string, subIndex?: number) => {
  if (parentId && subIndex !== null && subIndex !== undefined) {
    const parentTile = tiles.value.find(t => t.id === parentId);
    const subTile = parentTile?.subTiles?.[subIndex];
    if (subTile) {
      editingTile.value = subTile.id;
      editingName.value = subTile.name;
      editingColor.value = subTile.color;
      editingParentId.value = parentId;
      editingSubIndex.value = subIndex;
    }
  } else {
    const tile = tiles.value.find(t => t.id === tileId);
    if (tile) {
      editingTile.value = tileId;
      editingName.value = tile.name;
      editingColor.value = tile.color;
      editingParentId.value = null;
      editingSubIndex.value = null;
    }
  }
};

const handleSaveEdit = () => {
  if (!editingTile.value) return;

  tiles.value = tiles.value.map(tile => {
    if (editingParentId.value !== null && editingSubIndex.value !== null) {
      if (tile.id === editingParentId.value && tile.subTiles) {
        return {
          ...tile,
          subTiles: tile.subTiles.map((subTile, idx) =>
            idx === editingSubIndex.value && subTile.id === editingTile.value
              ? { ...subTile, name: editingName.value.trim() || '', color: editingColor.value }
              : subTile,
          ),
        };
      }
      return tile;
    }

    if (tile.id === editingTile.value) {
      return {
        ...tile,
        name: editingName.value.trim() || '',
        color: editingColor.value,
        subTiles:
          tile.subTiles && tile.subTiles.length > 0
            ? tile.subTiles
            : (editingName.value.trim()
              ? createChildTiles(tile.id, editingColor.value, (tile.tesseraeDepth ?? 0) + 1)
              : tile.subTiles),
      };
    }

    return tile;
  });

  editingTile.value = null;
  editingName.value = '';
  editingColor.value = '';
  editingParentId.value = null;
  editingSubIndex.value = null;
};

const handleCancelEdit = () => {
  editingTile.value = null;
  editingName.value = '';
  editingColor.value = '';
  editingParentId.value = null;
  editingSubIndex.value = null;
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    handleSaveEdit();
  } else if (e.key === 'Escape') {
    handleCancelEdit();
  }
};

const addSubTile = (parentId: string) => {
  const parentTile = tiles.value.find(t => t.id === parentId);
  if (!parentTile) return;

  const newSubTile: HexagonTile = {
    id: `${parentId}-${Date.now()}`,
    name: '',
    color: parentTile.color,
    notes: '',
    subTiles: [],
    tesseraeDepth: (parentTile.tesseraeDepth ?? 0) + 1,
  };

  tiles.value = tiles.value.map(tile =>
    tile.id === parentId
      ? { ...tile, subTiles: [...(tile.subTiles || []), newSubTile] }
      : tile,
  );

  setTimeout(() => {
    handleDoubleClick(newSubTile.id, parentId, parentTile.subTiles?.length || 0);
  }, 100);
};

const applyTesserae = (tileId: string, parentId?: string) => {
  let nextHovered: string | null = null;
  tiles.value = tiles.value.map(tile => {
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
  });

  if (nextHovered) {
    hoveredTile.value = nextHovered;
  }
};

const openNotes = (tileId: string, parentId?: string) => {
  if (parentId) {
    const parentTile = tiles.value.find(t => t.id === parentId);
    const subTile = parentTile?.subTiles?.find(st => st.id === tileId);
    notesDraft.value = subTile?.notes || '';
  } else {
    const tile = tiles.value.find(t => t.id === tileId);
    notesDraft.value = tile?.notes || '';
  }
  notesTile.value = { id: tileId, parentId: parentId ?? null };
};

const saveNotes = () => {
  if (!notesTile.value) return;
  const { id, parentId } = notesTile.value;
  tiles.value = tiles.value.map(tile => {
    if (parentId && tile.id === parentId && tile.subTiles) {
      return {
        ...tile,
        subTiles: tile.subTiles.map(st => (st.id === id ? { ...st, notes: notesDraft.value } : st)),
      };
    }
    if (!parentId && tile.id === id) {
      return { ...tile, notes: notesDraft.value };
    }
    return tile;
  });
  notesTile.value = null;
  notesDraft.value = '';
};

const cancelNotes = () => {
  notesTile.value = null;
  notesDraft.value = '';
};
</script>

<template>
  <main class="flex min-h-screen flex-col items-center justify-center p-8 md:p-24 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
    <div class="w-full max-w-7xl relative">
      <h1
        class="text-5xl md:text-6xl font-black mb-4 text-left text-gray-900 dark:text-white tracking-tight absolute top-0 left-0 z-10"
        :style="{ fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '-0.02em' }"
      >
        MOSAIC
      </h1>

      <div class="flex justify-center items-center min-h-[600px] md:min-h-[700px]">
        <div class="hexagon-main">
          <div class="hex-row offset">
            <MosaicHexTile
              :tile="tiles[0]"
              :index="0"
              :hovered-tile="hoveredTile"
              :set-hovered-tile="setHoveredTile"
              :on-double-click="handleDoubleClick"
              :editing-tile="editingTile"
              :editing-name="editingName"
              :editing-color="editingColor"
              :set-editing-name="setEditingNameValue"
              :set-editing-color="setEditingColorValue"
              :on-save="handleSaveEdit"
              :on-cancel="handleCancelEdit"
              :on-key-down="handleKeyDown"
              :add-sub-tile="addSubTile"
              :apply-tesserae="applyTesserae"
              :open-notes="openNotes"
            />
            <MosaicHexTile
              :tile="tiles[1]"
              :index="1"
              :hovered-tile="hoveredTile"
              :set-hovered-tile="setHoveredTile"
              :on-double-click="handleDoubleClick"
              :editing-tile="editingTile"
              :editing-name="editingName"
              :editing-color="editingColor"
              :set-editing-name="setEditingNameValue"
              :set-editing-color="setEditingColorValue"
              :on-save="handleSaveEdit"
              :on-cancel="handleCancelEdit"
              :on-key-down="handleKeyDown"
              :add-sub-tile="addSubTile"
              :apply-tesserae="applyTesserae"
              :open-notes="openNotes"
            />
          </div>

          <div class="hex-row">
            <MosaicHexTile
              :tile="tiles[2]"
              :index="2"
              :hovered-tile="hoveredTile"
              :set-hovered-tile="setHoveredTile"
              :on-double-click="handleDoubleClick"
              :editing-tile="editingTile"
              :editing-name="editingName"
              :editing-color="editingColor"
              :set-editing-name="setEditingNameValue"
              :set-editing-color="setEditingColorValue"
              :on-save="handleSaveEdit"
              :on-cancel="handleCancelEdit"
              :on-key-down="handleKeyDown"
              :add-sub-tile="addSubTile"
              :apply-tesserae="applyTesserae"
              :open-notes="openNotes"
            />
            <MosaicHexTile
              :tile="tiles[3]"
              :index="3"
              :hovered-tile="hoveredTile"
              :set-hovered-tile="setHoveredTile"
              :on-double-click="handleDoubleClick"
              :editing-tile="editingTile"
              :editing-name="editingName"
              :editing-color="editingColor"
              :set-editing-name="setEditingNameValue"
              :set-editing-color="setEditingColorValue"
              :on-save="handleSaveEdit"
              :on-cancel="handleCancelEdit"
              :on-key-down="handleKeyDown"
              :add-sub-tile="addSubTile"
              :apply-tesserae="applyTesserae"
              :open-notes="openNotes"
            />
            <MosaicHexTile
              :tile="tiles[4]"
              :index="4"
              :hovered-tile="hoveredTile"
              :set-hovered-tile="setHoveredTile"
              :on-double-click="handleDoubleClick"
              :editing-tile="editingTile"
              :editing-name="editingName"
              :editing-color="editingColor"
              :set-editing-name="setEditingNameValue"
              :set-editing-color="setEditingColorValue"
              :on-save="handleSaveEdit"
              :on-cancel="handleCancelEdit"
              :on-key-down="handleKeyDown"
              :add-sub-tile="addSubTile"
              :apply-tesserae="applyTesserae"
              :open-notes="openNotes"
            />
          </div>

          <div class="hex-row offset">
            <MosaicHexTile
              :tile="tiles[5]"
              :index="5"
              :hovered-tile="hoveredTile"
              :set-hovered-tile="setHoveredTile"
              :on-double-click="handleDoubleClick"
              :editing-tile="editingTile"
              :editing-name="editingName"
              :editing-color="editingColor"
              :set-editing-name="setEditingNameValue"
              :set-editing-color="setEditingColorValue"
              :on-save="handleSaveEdit"
              :on-cancel="handleCancelEdit"
              :on-key-down="handleKeyDown"
              :add-sub-tile="addSubTile"
              :apply-tesserae="applyTesserae"
              :open-notes="openNotes"
            />
            <MosaicHexTile
              :tile="tiles[6]"
              :index="6"
              :hovered-tile="hoveredTile"
              :set-hovered-tile="setHoveredTile"
              :on-double-click="handleDoubleClick"
              :editing-tile="editingTile"
              :editing-name="editingName"
              :editing-color="editingColor"
              :set-editing-name="setEditingNameValue"
              :set-editing-color="setEditingColorValue"
              :on-save="handleSaveEdit"
              :on-cancel="handleCancelEdit"
              :on-key-down="handleKeyDown"
              :add-sub-tile="addSubTile"
              :apply-tesserae="applyTesserae"
              :open-notes="openNotes"
            />
          </div>
        </div>
      </div>
    </div>

    <div v-if="notesTile" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" @click="cancelNotes">
      <div class="bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-full max-w-lg p-6 relative" @click.stop>
        <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Notes</h2>
        <textarea
          class="w-full h-40 p-3 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          :value="notesDraft"
          @input="setNotesDraftValue(($event.target as HTMLTextAreaElement).value)"
        />
        <div class="mt-4 flex justify-end gap-2">
          <button class="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white" @click="cancelNotes">
            Cancel
          </button>
          <button class="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white" @click="saveNotes">
            Save
          </button>
        </div>
      </div>
    </div>
  </main>
</template>
