import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind
} from 'vscode-languageclient';

let client: LanguageClient;

export function activate() {
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
      },
      {
        scheme: 'file',
        language: 'jsonc'
      }
    ]
  };

  client = new LanguageClient(
    '@donaldpipowitch/vscode-extension-client',
    'VS Code Extension Client',
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
