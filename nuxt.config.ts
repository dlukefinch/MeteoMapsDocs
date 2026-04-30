export default defineNuxtConfig({
  extends: ['docus'],
  modules: ['nuxt-studio'],
  ssr: true,
  nitro: {
    prerender: {
      crawlLinks: true
    }
  }
})

export default defineNuxtConfig({
  extends: ['docus'],
  modules: ['nuxt-studio'],
  studio: {
    github: {
      owner: 'dlukefinch',
      repo: 'MeteoMapsDocs'
    }
  },
  ssr: true,
  nitro: {
    prerender: {
      crawlLinks: true
    }
  }
})