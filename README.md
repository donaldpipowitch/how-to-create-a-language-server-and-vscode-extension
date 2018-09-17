⚠️ WORK IN PROGRESS ⚠️

# `@donaldpipowitch/vscode-extension-*` project

[![Build Status](https://travis-ci.org/donaldpipowitch/how-to-create-a-language-server-and-vscode-extension.svg?branch=master)](https://travis-ci.org/donaldpipowitch/how-to-create-a-language-server-and-vscode-extension)

> This project offers a small language server for `.vscode/extensions.json` files.

This `README.md` is written as a tutorial in which I'll explain how the `@donaldpipowitch/vscode-extension-*` project was created. This should be helpful, if you want to create a similar project or if you want to contribute to this project.

If you're just interested in _using_ the `@donaldpipowitch/vscode-extension-*` packages, you'll find the usage information in their corresponding `README.md`'s.

| Package                                                                 | Description                                                           |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------- |
| [`@donaldpipowitch/vscode-extension-core`](packages/core/README.md)     | Exports some useful APIs to get information about VS Code extensions. |
| [`@donaldpipowitch/vscode-extension-server`](packages/server/README.md) | A .vscode/extensions.json language server.                            |
| [`@donaldpipowitch/vscode-extension-client`](packages/client/README.md) | A client for the .vscode/extensions.json language server.             |

## Background

In this article you will learn how you can create a language server and a VS Code extension which uses this language server. A language server adds features like _autocomplete_, _go to definition_ or _documentation on hover_ to a programming language, to domain specific languages, but also to frameworks and configuration files, if it can't be covered by the language alone.

[VS Code](https://code.visualstudio.com/) is a nice and extensible open source editor. We'll create an extension for VS Code which will use our custom language server. While language servers are editor agnostic we'll create a language server for a VS Code specific feature. So in this case it only makes sense to use it in the context of VS Code.

There are already existing tutorials which cover this topic. The best tutorial probably was created by the MicroSoft team itself which is responsible for VS Code and the [language server protocol](https://microsoft.github.io/language-server-protocol/) which powers all language server. You can find [MicroSofts tutorial here](https://code.visualstudio.com/docs/extensions/example-language-server). Nevertheless I write my own tutorial for two reasons. First I write this tutorial for myself, so I can learn the concepts and the APIs in my own pace. Second I write it for _you_, because sometimes it helps to get a _similar_ tutorial for the same topic from a different perspective. For example my tooling, my project structure and my writing style will be slightly different. And sometimes this already helps learning something new!

What we'll do is creating a language server and the corresponding VS Code extension which uses this server to add more functionality to `.vscode/extensions.json` files. I expect you to have some intermediate JavaScript knowledge. This project will be written in [TypeScript](https://www.typescriptlang.org), we use [Jest](https://jestjs.io/) for testing and [yarn](https://yarnpkg.com/) as our package manager.

## Goal of this language server

The `.vscode/extensions.json` files in the root of project can contain recommendations for extensions as well as unwanted recommendations for this specific project. If a user of VS Code opens the project the editor asks the user if he/she wants to install missing recommended extensions or to disable unwanted, but already installed extensions.

Out of the box VS Code already offers code completion and validation for the interface (`{ recommendations: string[], unwantedRecommendations: string[] }`) of these files. The code completion for `recommendations[]`/`unwantedRecommendations[]` even shows you currently installed extensions. What is _missing_?

- code completion for extensions which aren't installed locally
- on hover documentation for an extension (**TODO**)
- got to definitions for an extension (**TODO**)

We try to add these three features in this tutorial.

## Initial setup

The project was tested and developed with following technologies:

- [VS Code](https://code.visualstudio.com/) (I used `1.28.0-insider`)
- [Node](https://nodejs.org/en/) (I used `8.11.3`)
- [yarn](https://yarnpkg.com/en/docs/install) (I used `1.9.4`)
- [Git](https://git-scm.com/) (I used `2.18.0`)

If you have these requirements installed, you can setup the project with the following steps:

1. `$ git clone https://github.com/donaldpipowitch/how-to-create-a-language-server-and-vscode-extension.git`
2. `$ cd how-to-create-a-language-server-and-vscode-extension`
3. `$ yarn`

## Basic project structure

Before we dive into one of our packages I'll give you a short overview about the whole project structure.

- [`README.md`](README.md): The very file you're currently reading. It serves as a tutorial for the whole project.
- [`LICENSE`](LICENSE): This project uses the [MIT license](https://opensource.org/licenses/MIT).
- [`.vscode/extensions.json`](.vscode/extensions.json): This project has a VS Extension recommendation, too. See the following file:
- [`prettier.config.js`](prettier.config.js): We use [Prettier](https://prettier.io/) for code formatting and this is the corresponding [config file](https://prettier.io/docs/en/configuration.html).
- [`.prettierignore`](.prettierignore): With this file Prettier will not format generated files.
- [`.gitignore`](.gitignore): We ignore dependencies and meta data/generated files in Git. See [here](https://git-scm.com/docs/gitignore) to learn more.
- [`package.json`](package.json): This file contains our [workspace configuration](https://yarnpkg.com/lang/en/docs/workspaces/), because our projects contains _multiple_ packages. It also contains top-level dependencies and commands like `build` and `lint`. (The `lint` command will run Prettier.)
- [`.travis.yml`](.travis.yml): This is the config file for [Travis](https://travis-ci.org/), our [CI system](https://martinfowler.com/articles/continuousIntegration.html). We'll run `build` and `lint` on every commit for example. You can find our CI logs [here](https://travis-ci.org/donaldpipowitch/how-to-create-a-language-server-and-vscode-extension).
- [`.vscode/settings.json`](.vscode/settings.json): This file contains some shared VS Code configs. You'll get these settings automatically, if you open this project with VS Code.
- [`.vscode/launch.json`](.vscode/launch.json): This file contains some script/launch configurations which we'll need later on for debugging purposes. I'll explain this in more detail later in the article.
- [`tsconfig.base.json`](tsconfig.base.json): This file contains our shared TypeScript configs. I just want to point out, that I always try to use [`strict: true`](https://blog.mariusschulz.com/2017/06/09/typescript-2-3-the-strict-compiler-option) for better type safety.
- [`yarn.lock`](yarn.lock): This file contains the last known working versions of our dependencies. Read [here](https://yarnpkg.com/lang/en/docs/yarn-lock/) to learn more.

Our configurations and meta files out of the way we'll have a look into the [`packages/`](packages) directory. This directory contains the packages, we already explained these packages above:

- [`packages/core`](packages/core): This directory contains `@donaldpipowitch/vscode-extension-core`.
- [`packages/server`](packages/server): Here we can find `@donaldpipowitch/vscode-extension-server`.
- [`packages/client`](packages/client): Last, but not least - `@donaldpipowitch/vscode-extension-client`.

Why do we have a `core` package in the first place? Many frameworks and tools add language server on top of their original functionality. Think of ESLint (https://eslint.org/) which works standalone from the ESLint language server (https://github.com/Microsoft/vscode-eslint/blob/master/server). We do the same. It makes it also easier to learn what is actually language server specific and what not in my experience.

Note: Our `client` package needs to run `"postinstall": "vscode-install"` to generate the correct `vscode` typings needed at build time. If you get `''vscode'' has no exported member 'X'.` errors in some of your libs (like `vscode-languageclient`) these libs and your package probably require a different VS Code version. In our case we defined `"vscode": "^1.25.0"` in the `"engines"` section of `packages/client/package.json` which is the same used by `vscode-languageclient` at the time I'm writing this.

- `"publisher": "vscode",` important
- TODO: `launch.json`, debug test
- `"window.openFoldersInNewWindow": "off",`; `--reuse-window` doesn't work

# Core

three APIs to get

- extension data
- extension url
- search for extensions

any ongoing request can be canceled
