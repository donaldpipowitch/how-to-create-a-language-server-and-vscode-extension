import { search, Canceler } from '@donaldpipowitch/vscode-extension-core';
import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  CompletionItemKind
} from 'vscode-languageserver';
import { parseTree, findNodeAtOffset, Node } from 'jsonc-parser';

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

  if (!textDocument.uri.endsWith('.vscode/extensions.json')) return;

  const document = documents.get(textDocument.uri);
  if (!document) return;

  const tree = parseTree(document.getText());
  const node = findNodeAtOffset(tree, document.offsetAt(position));

  if (!isExtensionValue(node)) return;

  // only search for queries with at least three characters
  if (node.value && node.value.length <= 2) return;

  const query = node.value;
  // connection.console.log(`You searched for ${query}.`);

  const { cancel, request } = search(query);
  lastCancel = cancel;

  const extensions = await request;
  lastCancel = null;

  if (!extensions) return;

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

function isExtensionValue(node: Node | undefined): node is Node {
  // no node
  if (!node) return false;
  // not a string node
  if (node.type !== 'string') return false;
  // not within an array
  if (!node.parent) return false;
  if (node.parent.type !== 'array') return false;
  // not on a "recommendations" or "unwantedRecommendations" property
  if (!node.parent.parent) return false;
  if (node.parent.parent.type !== 'property') return false;
  if (
    node.parent.parent.children![0].value !== 'recommendations' &&
    node.parent.parent.children![0].value !== 'unwantedRecommendations'
  )
    return false;
  // not on an object
  if (!node.parent.parent.parent) return false;
  if (node.parent.parent.parent.type !== 'object') return false;
  // not the root
  if (node.parent.parent.parent.parent) return false;
  // whoohoo
  return true;
}

// It looks like we need this or we get the following error:
// "Request completionItem/resolve failed. Message: Unhandled method completionItem/resolve"
// *Update*: I think this is need because of our "resolveProvider" config?
connection.onCompletionResolve((item) => item);

// Listen for events
documents.listen(connection);
connection.listen();
