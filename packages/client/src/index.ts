import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions
} from 'vscode-languageclient';

let client: LanguageClient;

export function activate() {
  const serverModule = require.resolve(
    '@donaldpipowitch/vscode-extension-server'
  );

  // Debug options for server are used when we launch the extension in debug mode
  const serverOptions: ServerOptions = {
    run: { module: serverModule },
    debug: {
      module: serverModule,
      options: { execArgv: ['--inspect=6009'] }
    }
  };

  const clientOptions: LanguageClientOptions = {
    documentSelector: [
      {
        pattern: '**/.vscode/extensions.json',
        scheme: 'file'
      }
    ]
  };

  client = new LanguageClient(
    'vscode-extensions-files',
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
