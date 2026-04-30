export default defineNuxtConfig({
  extends: ['docus'],
  modules: ['nuxt-studio'],
  studio: {
    repository: {
      provider: 'github',
      owner: 'dlukefinch',
      repo: 'MeteoMapsDocs',
      branch: 'main'
    }
  },
  ssr: true,
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/sitemap.xml', '/robots.txt']
    }
  }
})