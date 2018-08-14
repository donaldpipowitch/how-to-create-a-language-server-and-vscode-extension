# Background

- in this article you will learn how to create a language server and vscode extension which uses this language server
- a language server adds features like _autocomplete_, _go to definition_, _documentation on hover_ and so on to a programming language, domain specific languages, but also frameworks and configurations if it can't be covered by the language alone
- vscode is a nice and extensible open source editor (https://code.visualstudio.com/); we'll create an extension for vscode which will use our extension
- in this special case we'll create a language server for a vscode specific feature: the `extensions.json`
- normally you would create a language server so it can be re-used across multiple editors and IDEs, but for the scope of our tutorial this will work just fine as we only plan to create one extension for vs code anyway
- there are multiple tutorials which cover this topic, the best one from the microsoft team itself which is responsible for vscode and the language server protocol (https://microsoft.github.io/language-server-protocol/)
- you can find it here: https://code.visualstudio.com/docs/extensions/example-language-server
- I write this tutorial mostly to learn myself and because it sometimes helps other to have just _one_ more example, a slightly different perspective or a different writing style to learn a concept a little bit better
- I expect you to have some intermediate JavaScript knowledge
- project will be written in TypeScript (https://www.typescriptlang.org), we use Jest (https://jestjs.io/) for testing and yarn (https://yarnpkg.com/) as our package manager

# Goal of this language server

- tested with `1.26.0-insider` of VS Code
- say you create a `.vscode/extensions.json`
- we already get code completion and validation for `{ recommendations: string[], unwantedRecommendations: string[] }`
- code completion on `recommendations[]` even shows you currently installed extensions
- we see on hover documentation for on the `recommendations` and `unwantedRecommendations` fields
- what we don't have: on hover documentation on a specific extension, no go to definition for the extensions, no code completion for non-locally installed extensions

# Initial setup

- If you want to work on this project make sure to have the following things installed:
- VS Code (https://nodejs.org/en/) installed (I used `1.26.0-insider`) installed
- Node (https://nodejs.org/en/) installed (I used `8.11.3`) installed
- yarn (https://yarnpkg.com/en/docs/install) installed (I used `1.9.4`)
- Git (https://git-scm.com/) installed (I used `2.18.0`)

- git clone ...
- yarb install

# Basic project structure

- `README.md` - the very file you're currently reading, used for the whole project documentation
- `LICENSE` - our license information, MIT for everything (https://opensource.org/licenses/MIT)
- `.vscode/extensions.json` which recommends the extensions I used to develop this project; also helps us to validate our on language server easily
- `.vscode/extensions.json` which holds our recommend project settings
- `.gitignore` to not include dependencies and meta data/generated files via Git
- `prettier.config.js` which holds our formatting options used by Prettier (https://prettier.io/)
- `package.json` our workspace configuration (https://yarnpkg.com/lang/en/docs/workspaces/), because our projects makes use of multiple packages in one repository as you'll see soon

These are our packages we create:

- `packages/core`: this package provides all the functionality we want to expose in our extension - but without any of the language server specific functionality
- `packages/server`: our language server
- `packages/client`: our client for the language server which is our VS Code extension

Why do we have a `core` package in the first place? Many frameworks and tools add language server on top of their original functionality. Think of ESLint (https://eslint.org/) which works standalone from the ESLint language server (https://github.com/Microsoft/vscode-eslint/blob/master/server). We do the same. It makes it also easier to learn what is actually language server specific and what not in my experience.

Note: Our `client` package needs to run `"postinstall": "vscode-install"` to generate the correct `vscode` typings needed at build time. If you get `''vscode'' has no exported member 'X'.` errors in some of your libs (like `vscode-languageclient`) these libs and your package probably require a different VS Code version. In our case we defined `"vscode": "^1.25.0"` in the `"engines"` section of `packages/client/package.json` which is the same used by `vscode-languageclient` at the time I'm writing this.

- `"publisher": "vscode",` important
- TODO: `launch.json`, debug test
- `"window.openFoldersInNewWindow": "off",`; `--reuse-window` doesn't work