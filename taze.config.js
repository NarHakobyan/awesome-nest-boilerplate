import { defineConfig } from 'taze'

export default defineConfig({
  // ignore packages from bumping
  exclude: [
    'typeorm',
  ],
  // fetch the latest package info from registry without cache
  force: true,
  // bumping mode, can be 'latest', 'major', 'minor', 'patch', 'ignore'
  mode: 'latest',
  // write to package.json
  write: true,
  // run `npm install` or `yarn install` right after bumping
  install: true,
  // ignore paths for looking for package.json in monorepo
  ignorePaths: [
    '**/node_modules/**',
    '**/test/**',
  ],
  // ignore package.json that in other workspace (with their own .git,pnpm-workspace.yaml,etc.)
  ignoreOtherWorkspaces: true,
  // override with different bumping mode for each package
  // packageMode: {
  //   'typescript': 'major',
  //   'unocss': 'ignore',
  //   // regex starts and ends with '/'
  //   '/vue/': 'latest'
  // },
  // disable checking for "overrides" package.json field
  depFields: {
    overrides: false
  }
})
