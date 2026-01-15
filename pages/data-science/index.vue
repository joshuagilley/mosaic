<script setup lang="ts">
const tiles = [
  { id: 0, name: 'Data Science', path: '#', description: 'Explore Data Science', radius: 0, angle: 0, color: 'from-blue-500 to-blue-600' },
  { id: 1, name: 'Vektor', path: '/data-science/vektor', description: 'Linear Algebra Playground', radius: 1, angle: 210, color: 'from-blue-500 to-blue-600' },
  { id: 2, name: 'Coming Soon', path: '#', description: 'More tools coming...', radius: 1, angle: 270, color: 'from-gray-300 to-gray-400' },
  { id: 3, name: 'Coming Soon', path: '#', description: 'More tools coming...', radius: 1, angle: 330, color: 'from-gray-300 to-gray-400' },
  { id: 4, name: 'Coming Soon', path: '#', description: 'More tools coming...', radius: 1, angle: 30, color: 'from-gray-300 to-gray-400' },
  { id: 5, name: 'Coming Soon', path: '#', description: 'More tools coming...', radius: 1, angle: 90, color: 'from-gray-300 to-gray-400' },
  { id: 6, name: 'Coming Soon', path: '#', description: 'More tools coming...', radius: 1, angle: 150, color: 'from-gray-300 to-gray-400' },
];

const hexSize = 120;
const hexSpacing = 1.8;
</script>

<template>
  <main class="flex min-h-screen flex-col items-center justify-center p-8 md:p-24 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
    <div class="w-full max-w-7xl">
      <div class="mb-8">
        <NuxtLink
          to="/"
          class="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-4 transition-colors"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Mosaic
        </NuxtLink>
        <h1 class="text-4xl md:text-5xl font-bold mb-4 text-center text-gray-900 dark:text-white">
          Data Science
        </h1>
        <p class="text-lg md:text-xl text-center mb-12 text-gray-600 dark:text-gray-400">
          Tools and applications for data analysis and visualization
        </p>
      </div>

      <div class="flex justify-center items-center min-h-[500px] md:min-h-[600px]">
        <div class="relative" :style="{ width: `${hexSize * hexSpacing * 3}px`, height: `${hexSize * hexSpacing * 3}px` }">
          <DataScienceHexTile
            v-for="tile in tiles"
            :key="tile.id"
            :tile="tile"
            :x="tile.radius * hexSize * hexSpacing * Math.cos((tile.angle * Math.PI) / 180)"
            :y="tile.radius * hexSize * hexSpacing * Math.sin((tile.angle * Math.PI) / 180)"
            :size="hexSize"
          />
        </div>
      </div>
    </div>
  </main>
</template>
