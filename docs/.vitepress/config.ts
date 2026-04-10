import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'en-US',
  title: 'Awesome NestJS v11 Boilerplate',
  description: 'An ultimate and awesome nodejs boilerplate written in TypeScript',
  base: '/awesome-nest-boilerplate/',

  themeConfig: {
    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'Home', link: '/' },
          { text: 'Getting Started', link: '/getting-started' },
        ],
      },
      {
        text: 'Development',
        items: [
          { text: 'Development Guide', link: '/development' },
          { text: 'Architecture', link: '/architecture' },
          { text: 'Code Generation', link: '/code-generation' },
        ],
      },
      {
        text: 'Code Quality',
        items: [
          { text: 'Linting', link: '/linting' },
          { text: 'Naming Cheatsheet', link: '/naming-cheatsheet' },
          { text: 'Code Style and Patterns', link: '/code-style-and-patterns' },
          { text: 'NestJS Code Style Guide', link: '/nestjs-code-style-guide' },
        ],
      },
      {
        text: 'Operations',
        items: [
          { text: 'API Documentation', link: '/api-documentation' },
          { text: 'OpenAPI MCP Integration', link: '/openapi-mcp' },
          { text: 'Testing', link: '/testing' },
          { text: 'Deployment', link: '/deployment' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/NarHakobyan/awesome-nest-boilerplate' },
    ],

    search: {
      provider: 'local',
    },
  },
})
