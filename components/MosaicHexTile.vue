<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';

interface HexagonTile {
  id: string;
  name: string;
  color: string;
  notes?: string;
  subTiles?: HexagonTile[];
  tesseraeDepth?: number;
}

const props = defineProps<{
  tile: HexagonTile;
  index: number;
  hoveredTile: string | null;
  editingTile: string | null;
  editingName: string;
  editingColor: string;
  setHoveredTile: (id: string | null) => void;
  onDoubleClick: (tileId: string, parentId?: string, subIndex?: number) => void;
  setEditingName: (name: string) => void;
  setEditingColor: (color: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onKeyDown: (e: KeyboardEvent) => void;
  addSubTile: (parentId: string) => void;
  applyTesserae: (tileId: string, parentId?: string) => void;
  openNotes: (tileId: string, parentId?: string) => void;
}>();

const isHovered = computed(() => props.hoveredTile === props.tile.id);
const isEditing = computed(() => props.editingTile === props.tile.id);
const hasSubTiles = computed(() => (props.tile.subTiles?.length ?? 0) > 0);
const hasHoveredTile = computed(() => props.hoveredTile !== null && props.hoveredTile !== props.tile.id);
const hasName = computed(() => props.tile.name.trim() !== '');
const isCenterTile = computed(() => props.index === 3);
const canShowSubTiles = computed(() => hasName.value && hasSubTiles.value && !isCenterTile.value);
const canHover = computed(() => hasName.value && !isCenterTile.value);

const hexSize = 160;

const localInputRef = ref<HTMLInputElement | null>(null);

watch(isEditing, (val) => {
  if (val) {
    nextTick(() => {
      localInputRef.value?.focus();
      localInputRef.value?.select();
    });
  }
});

const calculateHoneycombPositions = (
  centerX: number,
  centerY: number,
  size: number,
  items: HexagonTile[],
  spacing = 5,
) => {
  const hexHeight = size * 1.1547;
  const rowOverlap = hexHeight * 0.2886;

  const horizontalDistance = size + spacing;
  const verticalDistance = hexHeight + spacing;

  const topLeft = { x: centerX - horizontalDistance / 2, y: centerY - verticalDistance + rowOverlap - spacing, tile: items[0], index: 0 };
  const topRight = { x: centerX + horizontalDistance / 2, y: centerY - verticalDistance + rowOverlap - spacing, tile: items[1], index: 1 };
  const middleLeft = { x: centerX - horizontalDistance, y: centerY, tile: items[2], index: 2 };
  const middleRight = { x: centerX + horizontalDistance, y: centerY, tile: items[3], index: 3 };
  const bottomLeft = { x: centerX - horizontalDistance / 2, y: centerY + verticalDistance - rowOverlap + spacing, tile: items[4], index: 4 };
  const bottomRight = { x: centerX + horizontalDistance / 2, y: centerY + verticalDistance - rowOverlap + spacing, tile: items[5], index: 5 };

  return [topLeft, topRight, middleLeft, middleRight, bottomLeft, bottomRight].filter(item => item.tile);
};

const subHexPositions = computed(() => {
  if (!hasSubTiles.value || !props.tile.subTiles) return [];
  return calculateHoneycombPositions(0, 0, hexSize, props.tile.subTiles, 5);
});

const handleMouseLeave = (e: MouseEvent) => {
  const relatedTarget = e.relatedTarget as HTMLElement | null;
  if (
    !relatedTarget ||
    (!relatedTarget.closest(`[data-sub-tile-container="${props.tile.id}"]`) &&
      !relatedTarget.closest(`[data-tile-id="${props.tile.id}"]`) &&
      !relatedTarget.closest(`[data-add-sub-tile="${props.tile.id}"]`))
  ) {
    props.setHoveredTile(null);
  }
};

const handleSubMouseLeave = (e: MouseEvent) => {
  const relatedTarget = e.relatedTarget as HTMLElement | null;
  if (
    !relatedTarget ||
    (!relatedTarget.closest(`[data-sub-tile-container="${props.tile.id}"]`) &&
      !relatedTarget.closest(`[data-tile-id="${props.tile.id}"]`) &&
      !relatedTarget.closest(`[data-add-sub-tile="${props.tile.id}"]`))
  ) {
    props.setHoveredTile(null);
  }
};

const handleClusterMouseLeave = (e: MouseEvent) => {
  const relatedTarget = e.relatedTarget as HTMLElement | null;
  if (!relatedTarget || !relatedTarget.closest(`[data-sub-tile-container="${props.tile.id}"]`)) {
    props.setHoveredTile(null);
  }
};

const pushScale = computed(() => (hasHoveredTile.value && !isHovered.value ? 0.6 : 1));
const pushOpacity = computed(() => (hasHoveredTile.value && !isHovered.value ? 0.3 : 1));
</script>

<template>
  <div
    class="relative"
    :data-tile-id="tile.id"
    :style="{
      transform: isHovered && canHover ? (canShowSubTiles ? 'scale(1.2)' : 'scale(1.05)') : `scale(${pushScale})`,
      zIndex: isHovered ? 50 : 10,
      opacity: isHovered ? 1 : pushOpacity,
    }"
    @mouseenter="canHover ? setHoveredTile(tile.id) : null"
    @mouseleave="handleMouseLeave"
  >
    <div
      class="hexagon-item transition-all duration-700 ease-out flex flex-col items-center justify-center cursor-pointer"
      @dblclick="onDoubleClick(tile.id)"
    >
      <div
        :class="`w-full h-full flex flex-col items-center justify-center p-4 md:p-6 transition-all duration-700 bg-gradient-to-br ${tile.color} dark:${tile.color} text-white shadow-lg ${isHovered ? 'shadow-2xl' : ''}`"
      >
        <div v-if="isEditing" class="w-full space-y-2" @click.stop>
          <input
            ref="localInputRef"
            type="text"
            :value="editingName"
            class="w-full px-2 py-1 text-base font-bold text-center bg-white/20 text-white placeholder-white/50 rounded border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
            placeholder="Enter name..."
            @input="setEditingName(($event.target as HTMLInputElement).value)"
            @keydown="onKeyDown"
          />
          <select
            :value="editingColor"
            class="w-full px-2 py-1 text-sm text-center bg-white/20 text-white rounded border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
            @click.stop
            @change="setEditingColor(($event.target as HTMLSelectElement).value)"
          >
            <option v-for="color in [
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
            ]" :key="color.value" :value="color.value" class="bg-gray-800 text-white">
              {{ color.name }}
            </option>
          </select>
          <div class="flex gap-2 justify-center mt-2">
            <button class="px-3 py-1 text-xs bg-white/30 hover:bg-white/40 rounded transition-colors" @click.stop="onSave">
              Save
            </button>
            <button class="px-3 py-1 text-xs bg-white/30 hover:bg-white/40 rounded transition-colors" @click.stop="onCancel">
              Cancel
            </button>
          </div>
        </div>
        <template v-else>
          <h3 :class="`text-base md:text-lg font-bold mb-1 md:mb-2 text-center transition-all duration-700 ${isHovered ? 'scale-110' : ''}`">
            {{ tile.name || 'Double-click to edit' }}
          </h3>
          <p v-if="canShowSubTiles" class="text-xs text-center opacity-75 mt-1">
            {{ tile.subTiles?.length }} nested tiles
          </p>
          <div v-if="hasName" class="mt-2 flex flex-wrap gap-2 justify-center text-xs">
            <button
              class="px-2 py-1 bg-white/20 hover:bg-white/30 rounded border border-white/30 transition-colors"
              @click.stop="openNotes(tile.id)"
            >
              Notes
            </button>
          </div>
        </template>
      </div>
    </div>

    <div
      v-if="isHovered && canHover"
      class="absolute"
      :data-sub-tile-container="tile.id"
      :style="{
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: 0,
        height: 0,
        zIndex: 40,
        pointerEvents: 'none',
      }"
      @mouseenter="setHoveredTile(tile.id)"
      @mouseleave="handleSubMouseLeave"
    >
      <div
        v-for="subHex in subHexPositions"
        :key="subHex.tile.id"
        class="absolute transition-all duration-500 ease-out cursor-pointer pointer-events-auto"
        :style="{
          left: `${subHex.x}px`,
          top: `${subHex.y}px`,
          transform: 'translate(-50%, -50%)',
          width: `${hexSize}px`,
          height: `${Math.round(hexSize * 1.1547)}px`,
          clipPath: 'polygon(0% 25%, 0% 75%, 50% 100%, 100% 75%, 100% 25%, 50% 0%)',
          WebkitClipPath: 'polygon(0% 25%, 0% 75%, 50% 100%, 100% 75%, 100% 25%, 50% 0%)',
          opacity: 0,
          animation: `fadeIn 0.4s ease-out ${subHex.index * 80}ms forwards`,
          zIndex: 45,
        }"
        @dblclick.stop="onDoubleClick(subHex.tile.id, tile.id, subHex.index)"
        @mouseenter="setHoveredTile(tile.id)"
        @mouseleave="handleClusterMouseLeave"
      >
        <div
          :class="`w-full h-full flex flex-col items-center justify-center p-4 md:p-6 bg-gradient-to-br ${subHex.tile.color} dark:${subHex.tile.color} text-white border border-white/40 dark:border-white/30 shadow-lg hover:scale-110`"
          :style="{
            filter: subHex.tile.tesseraeDepth ? `brightness(${Math.max(0.6, 1 - 0.08 * subHex.tile.tesseraeDepth)})` : undefined,
          }"
        >
          <div v-if="editingTile === subHex.tile.id" class="w-full space-y-2" @click.stop>
            <input
              type="text"
              :value="editingName"
              class="w-full px-2 py-1 text-sm font-bold text-center bg-white/20 text-white placeholder-white/50 rounded border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
              placeholder="Enter name..."
              autofocus
              @input="setEditingName(($event.target as HTMLInputElement).value)"
              @keydown="onKeyDown"
            />
            <div class="flex gap-2 justify-center mt-2">
              <button class="px-2 py-1 text-xs bg-white/30 hover:bg-white/40 rounded transition-colors" @click.stop="onSave">
                Save
              </button>
              <button class="px-2 py-1 text-xs bg-white/30 hover:bg-white/40 rounded transition-colors" @click.stop="onCancel">
                Cancel
              </button>
            </div>
          </div>
          <div v-else class="flex flex-col items-center gap-2">
            <span class="text-sm md:text-base font-semibold">
              {{ subHex.tile.name || 'Double-click to edit' }}
            </span>
            <div v-if="subHex.tile.name.trim() !== ''" class="flex gap-2 text-xs">
              <button
                class="px-2 py-1 bg-white/20 hover:bg-white/30 rounded border border-white/30 transition-colors"
                @click.stop="openNotes(subHex.tile.id, tile.id)"
              >
                Notes
              </button>
              <button
                class="px-2 py-1 bg-white/20 hover:bg-white/30 rounded border border-white/30 transition-colors"
                @click.stop="applyTesserae(subHex.tile.id, tile.id)"
              >
                Tesserae
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="subHexPositions.length < 6">
        <div
          class="absolute cursor-pointer transition-all duration-500 ease-out pointer-events-auto"
          :data-add-sub-tile="tile.id"
          :style="(() => {
            const hexHeight = hexSize * 1.1547;
            const rowOverlap = hexHeight * 0.2886;
            const spacing = 5;
            const horizontalDistance = hexSize + spacing;
            const verticalDistance = hexHeight + spacing;
            let nextPos = { x: 0, y: 0 };
            if (subHexPositions.length === 0) {
              nextPos = { x: -horizontalDistance / 2, y: -verticalDistance + rowOverlap - spacing };
            } else if (subHexPositions.length === 1) {
              nextPos = { x: horizontalDistance / 2, y: -verticalDistance + rowOverlap - spacing };
            } else if (subHexPositions.length === 2) {
              nextPos = { x: -horizontalDistance, y: 0 };
            } else if (subHexPositions.length === 3) {
              nextPos = { x: horizontalDistance, y: 0 };
            } else if (subHexPositions.length === 4) {
              nextPos = { x: -horizontalDistance / 2, y: verticalDistance - rowOverlap + spacing };
            } else {
              nextPos = { x: horizontalDistance / 2, y: verticalDistance - rowOverlap + spacing };
            }
            return {
              left: `${nextPos.x}px`,
              top: `${nextPos.y}px`,
              transform: 'translate(-50%, -50%)',
              width: `${hexSize}px`,
              height: `${Math.round(hexSize * 1.1547)}px`,
              clipPath: 'polygon(0% 25%, 0% 75%, 50% 100%, 100% 75%, 100% 25%, 50% 0%)',
              WebkitClipPath: 'polygon(0% 25%, 0% 75%, 50% 100%, 100% 75%, 100% 25%, 50% 0%)',
              opacity: 0.5,
              animation: `fadeIn 0.4s ease-out ${subHexPositions.length * 80}ms forwards`,
              zIndex: 45,
            };
          })()"
          @click.stop="addSubTile(tile.id)"
          @mouseenter="setHoveredTile(tile.id)"
          @mouseleave="handleSubMouseLeave"
        >
          <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/10 to-white/5 border-2 border-dashed border-white/30 text-white text-2xl hover:scale-110 transition-transform">
            +
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
