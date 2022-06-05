import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Awesome NestJS v8 Boilerplate Documentation 🎉',
  description: 'An ultimate and awesome nodejs boilerplate wrote in typescript',
  lang: 'en-US',
  base: process.env.DEPLOY_ENV === 'gh-pages' ? '/awesome-nest-boilerplate/' : '/',
  themeConfig: {
    sidebar: [
      ['/', 'Introduction'],
      '/docs/development',
      '/docs/architecture',
      '/docs/naming-cheatsheet',
      // '/docs/routing',
      // '/docs/state',
      '/linting',
      // '/docs/editors',
      // '/docs/production',
      // '/docs/troubleshooting',
    ],
  }
})
