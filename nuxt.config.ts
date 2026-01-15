export default defineNuxtConfig({
  ssr: true,
  compatibilityDate: '2026-01-14',
  css: ['~/assets/css/main.css'],
  modules: ['@nuxtjs/tailwindcss'],
  nitro: {
    compatibilityDate: '2026-01-14',
  },
  vite: {
    server: {
      watch: {
        ignored: [
          '**/.git/**',
          '**/node_modules/**',
          '**/.nuxt/**',
          '**/.output/**',
          '**/.nitro/**',
          '**/.data/**',
          '**/.cache/**',
          '**/.npm-cache/**',
        ],
        usePolling: true,
        interval: 500,
      },
    },
  },
})
