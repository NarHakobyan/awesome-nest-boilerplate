# Contributing to Go Level Up

First off, thanks for taking the time to contribute! We strongly believe in the power of Open Source and working together :muscle: :+1: :tada:

The recommended workflow for making a contribution to the project is documented below.

## Commitizen

This project enforces good Git Tree management through awesome open source tools like [Commitizen](https://github.com/commitizen/cz-cli) and [CommitLint](https://github.com/conventional-changelog/commitlint).

Don't worry, you don't have to go figure out how these tools work under the hood if you don't want to. As a contributor they're actually incredibly easy to work with! Just understand that this unlocks some cool super powers for the community.

- [x] Super clean git tree history so that it's easy to pinpoint why and where changes happened :evergreen_tree:
- [x] [Automatic Changelog generation](CHANGELOG.md) :rocket:

# Instructions

## 1. Fork the Repository to your own Github Account

Optionally add this repository as an additional remote in case you want to incorporate upstream changes into your version of the code

## 2. Reference an Issue

Code and changelogs work better when work references an actual tracking item that helps to understand why it happened. For this reason changes should only be made if they're referencing a documented issue.

Feel free to reference an existing open issue or create a new one with a brief title and/or description

## 3. Check out a new branch that references the issue

Pick a good branch name. Try something that summarizes what you're doing in a descriptive way. Optionally include the issue number:

- `feature/{number}-my-new-thing`
- `docs/improve-readme`
- `fix/{number}some-bug`

## 4. Install Dependencies with Yarn

Make sure that before you start writing code you run `yarn` at the root of the repo in order to make sure that all githooks are registered and packages are installed. This will help to ensure that when it's time to commit your changes that everything is in order.

## 5. Make your change

Write some awesome code that makes Go Level Up better! :muscle:

## 6. Generate your commit

This part is easy, just use the included scripts to guide you through a prompt to generate your commit message.

```
yarn commit
```

Be sure to include a reference to the issue number when prompted using `#{number}` syntax eg:

- `closes #{number}`
- `re #{number}`

## 7. Open a Pull Request against the Upstream Master Branch

Your contribution will be reviewed and if accepted will be incorporated into the next logical release cycle for the tool.
