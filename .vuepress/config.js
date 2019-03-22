/* tslint:disable */
module.exports = {
  title: 'Awesome nest boilerplate 🎉',
  description: `An ultimate and awesome nodejs boilerplate wrote in typescript`,
  base: process.env.DEPLOY_ENV === 'gh-pages' ? '/awesome-nest-boilerplate/': '/',
  themeConfig: {
    sidebar: [
      ['/', 'Introduction'],
      '/docs/development',
      // '/docs/architecture',
      // '/docs/tech',
      // '/docs/routing',
      // '/docs/state',
      // '/docs/linting',
      // '/docs/editors',
      // '/docs/production',
      // '/docs/troubleshooting',
    ],
  },
};
