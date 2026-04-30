export default defineNuxtConfig({
  extends: ['docus'],
  modules: ['nuxt-studio'],
})

export default defineNuxtConfig({
  ssr: true,
  nitro: {
    prerender: {
      crawlLinks: true
    }
  }
})