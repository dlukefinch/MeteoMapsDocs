export default defineNuxtConfig({
  extends: ['docus'],
  modules: ['nuxt-studio'],
})

export default defineNuxtConfig({
studio: {
  repository: {
    provider: 'github', // 'github' or 'gitlab'
    owner: 'dlukefinch',
    repo: 'MeteoMapsDocs',
    branch: 'main'
  }
}
})

export default defineNuxtConfig({
nitro: {
  prerender: {
    // Pre-render the homepage
    routes: ['/'],
    // Then crawl all the links on the page
    crawlLinks: true
  }
}
})