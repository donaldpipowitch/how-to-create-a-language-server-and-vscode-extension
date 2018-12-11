# `@donaldpipowitch/vscode-extension-core`

> Exports some useful APIs to get information about VS Code extensions.

⚠️ This package uses non-public _Visual Studio MarketPlace APIs_ which could break at any time. ⚠️

💡 This package was created as a part of the [_"How to create a language server and VS Code extension"_ article](https://github.com/donaldpipowitch/how-to-create-a-language-server-and-vscode-extension). Don't expect a fully featured and supported package, but feel free to use it, if you find it useful. 💡

## Setup

```bash
$ npm install @donaldpipowitch/vscode-extension-core
```

## Usage

### Search

Search for extensions:

```js
import { search } from '@donaldpipowitch/vscode-extension-core';

// search for "prettier"-related extensions
const query = 'prettier';
const { request } = search(query);

request.then(console.log);
// Logs:
// [
//   {
//     "publisher": {
//       "publisherId": "d16f4e39-2ffb-44e3-9c0d-79d873570e3a",
//       "publisherName": "esbenp",
//       "displayName": "Esben Petersen",
//       "flags": "none"
//     },
//     "extensionId": "96fa4707-6983-4489-b7c5-d5ffdfdcce90",
//     "extensionName": "prettier-vscode",
//     "displayName": "Prettier - Code formatter",
//     "flags": "validated, public",
//     "lastUpdated": "2018-08-09T12:05:04.413Z",
//     "publishedDate": "2017-01-10T19:52:02.703Z",
//     "releaseDate": "2017-01-10T19:52:02.703Z",
//     "shortDescription": "VS Code plugin for prettier/prettier",
//     "deploymentType": 0
//   },
//   // ...
// ]
```

Cancel search:

```js
import { search } from '@donaldpipowitch/vscode-extension-core';

// search for "prettier"-related extensions
const query = 'prettier';
const { cancel, request } = search(query);
cancel();

request.then(console.log);
// Logs: undefined
```
