import { ExtensionContext } from 'vscode';
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind
} from 'vscode-languageclient';

let client: LanguageClient;

export function activate(context: ExtensionContext) {
  const serverModule = require.resolve(
    '@donaldpipowitch/vscode-extension-server'
  );

  // Debug options for server are used when we launch the extension in debug mode
  const serverOptions: ServerOptions = {
    run: { module: serverModule, transport: TransportKind.ipc },
    debug: {
      module: serverModule,
      transport: TransportKind.ipc,
      options: { execArgv: ['--nolazy', '--inspect=6009'] }
    }
  };

  const clientOptions: LanguageClientOptions = {
    documentSelector: [
      {
        scheme: 'file',
        language: 'json'
        // pattern: '**∕.vscode/extensions.json'
      },
      {
        scheme: 'file',
        language: 'jsonc'
        // pattern: '**∕.vscode/extensions.json'
      }
    ]
  };

  client = new LanguageClient(
    'languageServerExample',
    'Language Server Example',
    serverOptions,
    clientOptions
  );

  // Starting the client will also launch the server.
  client.start();
}

export function deactivate() {
  if (client) {
    return client.stop();
  }
}
