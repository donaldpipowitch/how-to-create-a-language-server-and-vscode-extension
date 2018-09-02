import { search, Canceler } from '@donaldpipowitch/vscode-extension-core';

import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  CompletionItemKind
} from 'vscode-languageserver';

const connection = createConnection(ProposedFeatures.all);

// text document manager (supports full document sync only)
const documents = new TextDocuments();

connection.onInitialize(() => ({
  // tells the client what we support:
  // - full text sync
  // - code completion
  capabilities: {
    textDocumentSync: documents.syncKind,
    completionProvider: {
      resolveProvider: true
    }
  }
}));

// This handler provides the initial list of the completion items.
// {
//   "textDocument": {
//     "uri": "file:///Users/pipo/workspace/test-txt/test.txt"
//   },
//   "position": {
//     "line": 0,
//     "character": 10
//   },
//   "context": {
//     "triggerKind": 1
//   }
// }
let lastCancel: Canceler | null = null;
connection.onCompletion(async ({ position, textDocument }) => {
  if (lastCancel) {
    lastCancel();
    lastCancel = null;
  }

  const document = documents.get(textDocument.uri);
  if (!document) return;

  const text = document.getText();
  const inputEnd = document.offsetAt(position);

  let inputStart = inputEnd - 1;
  while (inputStart > 0 && text[inputStart - 1] !== ' ') {
    inputStart -= 1;
  }
  const query = text.substring(inputStart, inputEnd);

  // only search for queries with at least three characters
  if (query.length <= 2) return;
  connection.console.log(`You searched for ${query}.`);

  const { cancel, request } = search(query);
  lastCancel = cancel;

  const extensions = await request;
  lastCancel = null;

  if (!extensions) return;
  connection.console.log(
    `Search result: ${JSON.stringify(extensions, null, 2)}.`
  );

  return extensions.map(
    ({
      publisher: { publisherName },
      extensionName,
      displayName,
      shortDescription
    }) => ({
      label: `${publisherName}.${extensionName}`,
      kind: CompletionItemKind.Text,
      detail: displayName,
      documentation: shortDescription
    })
  );
});

// It looks like we need this or we get the following error:
// Request completionItem/resolve failed. Message: Unhandled method completionItem/resolve
connection.onCompletionResolve((item) => item);

// Listen for events
documents.listen(connection);
connection.listen();
