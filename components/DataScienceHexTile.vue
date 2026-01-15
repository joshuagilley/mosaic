<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  tile: {
    id: number;
    name: string;
    path: string;
    description: string;
    radius: number;
    angle: number;
    color: string;
  };
  x: number;
  y: number;
  size: number;
}>();

const isClickable = computed(() => props.tile.path !== '#');
const isCenter = computed(() => props.tile.radius === 0);

const hexPoints = computed(() =>
  Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i;
    const px = 50 + 50 * Math.cos(angle);
    const py = 50 + 50 * Math.sin(angle);
    return `${px}% ${py}%`;
  }).join(', '),
);
</script>

<template>
  <NuxtLink v-if="isClickable" :to="tile.path" class="block">
    <div
      class="absolute transition-all duration-300 flex flex-col items-center justify-center hover:scale-110 hover:z-50 cursor-pointer"
      :style="{
        left: `calc(50% + ${x}px)`,
        top: `calc(50% + ${y}px)`,
        transform: 'translate(-50%, -50%)',
        width: `${size * 2}px`,
        height: `${size * 2}px`,
        clipPath: `polygon(${hexPoints})`,
      }"
    >
      <div :class="`w-full h-full flex flex-col items-center justify-center p-4 md:p-6 bg-gradient-to-br ${tile.color} dark:${tile.color} text-white border-2 border-opacity-50 shadow-lg hover:shadow-2xl`">
        <h3 class="text-base md:text-lg font-bold mb-1 md:mb-2 text-center">
          {{ tile.name }}
        </h3>
        <p class="text-xs md:text-sm text-center opacity-90">
          {{ tile.description }}
        </p>
      </div>
    </div>
  </NuxtLink>

  <div
    v-else
    class="absolute transition-all duration-300 flex flex-col items-center justify-center"
    :class="isCenter ? 'opacity-80' : 'opacity-60'"
    :style="{
      left: `calc(50% + ${x}px)`,
      top: `calc(50% + ${y}px)`,
      transform: 'translate(-50%, -50%)',
      width: `${size * 2}px`,
      height: `${size * 2}px`,
      clipPath: `polygon(${hexPoints})`,
    }"
  >
    <div
      :class="isCenter
        ? `w-full h-full flex flex-col items-center justify-center p-4 md:p-6 bg-gradient-to-br ${tile.color} dark:${tile.color} text-white border-2 border-opacity-50`
        : 'w-full h-full flex flex-col items-center justify-center p-4 md:p-6 bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-400 dark:border-gray-600'"
    >
      <h3 :class="`${isCenter ? 'text-xl md:text-2xl' : 'text-base md:text-lg'} font-bold mb-1 md:mb-2 text-center`">
        {{ tile.name }}
      </h3>
      <p class="text-xs md:text-sm text-center opacity-90">
        {{ tile.description }}
      </p>
    </div>
  </div>
</template>
