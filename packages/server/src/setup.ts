import { createConnection, TextDocuments } from 'vscode-languageserver';

const connection = createConnection();

// text document manager (supports full document sync only)
const documents = new TextDocuments();

connection.onInitialize(() => ({
  // tells the client what we support:
  // - full text sync
  // - code completion
  capabilities: {
    textDocumentSync: documents.syncKind,
    completionProvider: {
      triggerCharacters: [
        ...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_"'
      ]
    }
  }
}));

// Listen for events
documents.listen(connection);
connection.listen();

export { connection, documents };
