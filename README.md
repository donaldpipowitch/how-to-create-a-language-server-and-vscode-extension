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
- [`tsconfig.base.json`](tsconfig.base.json): This file contains our shared TypeScript configs. I just want to point out, that I always try to use [`strict: true`](https://blog.mariusschulz.com/2017/06/09/typescript-2-3-the-strict-compiler-option) for better type safety and `"types": []` to not load _every_ `@types/*` package by default (to avoid having `@types/jest` interfaces available in my non-test files for example).
- [`yarn.lock`](yarn.lock): This file contains the last known working versions of our dependencies. Read [here](https://yarnpkg.com/lang/en/docs/yarn-lock/) to learn more.

Our configurations and meta files out of the way we'll have a look into the [`packages/`](packages) directory. This directory contains all the packages which we briefly explained above:

- [`packages/core`](packages/core): This directory contains `@donaldpipowitch/vscode-extension-core`.
- [`packages/server`](packages/server): Here we can find `@donaldpipowitch/vscode-extension-server`.
- [`packages/client`](packages/client): Last, but not least - `@donaldpipowitch/vscode-extension-client`.

Maybe you are wondering why we have a `core` package and not just the server and the client (which is our extension)? Many frameworks and tools add language server on top of their original functionality. Think of ESLint (https://eslint.org/) which works standalone from the ESLint language server (https://github.com/Microsoft/vscode-eslint/blob/master/server). We do the same. This is useful so others can build on top of our logic - but without the need to load language server specific dependencies. This could be useful for small libs and CLIs. Besides that it makes it easier to show you which part of code is actually language server specific and which not.

Let's start with our `core` package.

## Creating `@donaldpipowitch/vscode-extension-core`

The core package exports a function called `search` which takes a search value to look for VS Code extensions. We actually use the _Visual Studio MarketPlace API_ here, which is **not public** and **could break at any time** ([not just my words](https://twitter.com/ErichGamma/status/1029758007272505350)). You normally probably wouldn't want to rely on this, but for the sake of a tutorial it should be fine.

We'll use [`axios`](https://github.com/axios/axios) and we want the caller of our `search` function to be able to _cancel_ our request, so we'll return not just an awaitable `request` object (which fulfills to an array of extensions on success), but also a `cancel` method. If the caller calls `cancel` the `request` will be fulfilled as `undefined`. All in all the request should be relatively straightforward if you used `axios` before.

This is our [`src/search.ts`](packages/core/src/search.ts):

```ts
import axios, { Canceler } from 'axios';

export { Canceler };

/**
 * In the `.vscode/extensions.json` we'll need to use `${publisher.publisherName}.${extensionName}`.
 *
 * @example
 * {
 *   "publisher": {
 *     "publisherId": "d16f4e39-2ffb-44e3-9c0d-79d873570e3a",
 *     "publisherName": "esbenp",
 *     "displayName": "Esben Petersen",
 *     "flags": "none"
 *   },
 *   "extensionId": "96fa4707-6983-4489-b7c5-d5ffdfdcce90",
 *   "extensionName": "prettier-vscode",
 *   "displayName": "Prettier - Code formatter",
 *   "flags": "validated, public",
 *   "lastUpdated": "2018-08-09T12:05:04.413Z",
 *   "publishedDate": "2017-01-10T19:52:02.703Z",
 *   "releaseDate": "2017-01-10T19:52:02.703Z",
 *   "shortDescription": "VS Code plugin for prettier/prettier",
 *   "deploymentType": 0
 * }
 */
export type Extension = {
  publisher: {
    publisherId: string;
    publisherName: string;
    displayName: string;
    flags: string;
  };
  extensionId: string;
  extensionName: string;
  displayName: string;
  flags: string;
  lastUpdated: string;
  publishedDate: string;
  releaseDate: string;
  shortDescription: string;
  deploymentType: number;
};

export type SearchRequest = {
  cancel: Canceler;
  request: Promise<Extension[] | void>;
};

export function search(value: string): SearchRequest {
  const { token, cancel } = axios.CancelToken.source();
  const options = {
    cancelToken: token,
    url:
      'https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery',
    method: 'post',
    headers: {
      accept: 'application/json;api-version=5.0-preview.1;excludeUrls=true'
    },
    data: {
      filters: [
        {
          criteria: [
            // which visual studio app? code
            { filterType: 8, value: 'Microsoft.VisualStudio.Code' },
            // our search value
            { filterType: 10, value }
          ],
          pageSize: 10,
          pageNumber: 1
        }
      ]
    }
  };
  const request = axios(options)
    .then(({ data }) => data.results[0].extensions as Extension[])
    .catch((error) => {
      if (!axios.isCancel(error)) {
        throw error;
      }
    });
  return { request, cancel };
}
```

Our [`src/index.ts`](packages/core/src/index.ts) just takes care of re-exporting this:

```ts
export * from './search';
```

For the sake of completeness we also have [`src/tsconfig.json`](packages/core/src/tsconfig.json) which extends from our [`tsconfig.base.json`](tsconfig.base.json) in our project root and takes care of setting our output directory.

Our [`package.json`](packages/core/package.json) is also quite straightforward as it doesn't contain any language server specific metadata. The package can be build by calling `$ yarn build` or `$ yarn watch`.

I'll also add some small unit tests. We'll use [Jest](https://jestjs.io/) as our testing framework. Together with the [`ts-jest`](https://github.com/kulshekhar/ts-jest) our Jest config in [`tests/jest.config.js`](packages/core/tests/jest.config.js) is quite small. We just configured `testMatch` to treat every `.ts` file inside `tests/` as a test file and we configured `testPathIgnorePatterns` to exclude the `__fixture__` directory. (I use fixtures in a similar way as explained in [this article](https://dev.to/davidimoore/using-fixtures-for-testing-a-reactredux-app-with-jest--enzyme-3hd0). For me a fixture is just some static data, so I haven't put it into the typicals `__mocks__` directory, because I don't mock the implementation of some module here, which is how mocks are [usually defined in Jest](https://jestjs.io/docs/en/manual-mocks).) Note that we also have a [`tests/tsconfig.json`](packages/core/tests/tsconfig.json) so we can add Jest type declarations to our tests.

[This](packages/core/tests/search.ts) is our test for the search API:

```ts
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { search } from '../src/search';
import { prettier } from './__fixtures__/search-response';

const mock = new MockAdapter(axios);

test('should search extensions', async () => {
  mock.onAny().replyOnce(200, prettier);
  expect(await search('prettier').request).toMatchSnapshot();
});

test('should cancel search', async () => {
  mock.onAny().replyOnce(200, prettier);
  const { request, cancel } = search('prettier');
  cancel();
  expect(await request).toBe(undefined);
});
```

This will test a search and the cancelation of a search. The imported [`prettier` object](packages/core/tests/__fixtures__/search-response.ts) is actually the saved response of a real search request against the API with the search query `'prettier'`.

---

Note: Our `client` package needs to run `"postinstall": "vscode-install"` to generate the correct `vscode` typings needed at build time. If you get `''vscode'' has no exported member 'X'.` errors in some of your libs (like `vscode-languageclient`) these libs and your package probably require a different VS Code version. In our case we defined `"vscode": "^1.25.0"` in the `"engines"` section of `packages/client/package.json` which is the same used by `vscode-languageclient` at the time I'm writing this.

- `"publisher": "vscode",` important
- TODO: `launch.json`, debug test
- `"window.openFoldersInNewWindow": "off",`; `--reuse-window` doesn't work
