import { search, Canceler } from '@donaldpipowitch/vscode-extension-core';
import {
  TextDocuments,
  CompletionItemKind,
  Connection
} from 'vscode-languageserver';
import { parseTree, findNodeAtOffset, Node } from 'jsonc-parser';

let lastCancel: Canceler | null = null;

export function configureCompletion(
  connection: Connection,
  documents: TextDocuments
) {
  // The onCompletion handler provides the initial list of the completion items.
  // This is an example of the params passed to the handler:
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

    const completionItems = extensions.map(
      ({
        publisher: { publisherName },
        extensionName,
        displayName,
        shortDescription
      }) => ({
        // `"` hack, because JSON treats `"` as part of the completion here
        // see https://github.com/Microsoft/vscode-extension-samples/issues/93#issuecomment-429849514
        label: `"${publisherName}.${extensionName}`,
        kind: CompletionItemKind.Text,
        detail: displayName,
        documentation: shortDescription
      })
    );

    return completionItems;
  });
}

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
