import * as core from '@donaldpipowitch/vscode-extension-core';
import { configureCompletion } from '../src/completion';
import { prettier } from './__fixtures__/search';

test('should provide completion items', async () => {
  const search = jest.spyOn(core, 'search');
  let resolve: Function;
  const request = new Promise((_resolve) => (resolve = _resolve));
  const cancel = () => resolve();
  search.mockReturnValue({ cancel, request });

  const mockedConnection = { onCompletion: jest.fn() };
  const mockedDocuments = {
    get() {
      return {
        getText() {
          return `{
  "recommendations": ["prettier"]
}`;
        },
        offsetAt() {
          return 24; // the `"`, before `prettier"]`
        }
      };
    }
  };
  configureCompletion(mockedConnection as any, mockedDocuments as any);

  expect(mockedConnection.onCompletion).toHaveBeenCalledTimes(1);
  const completionHandler = mockedConnection.onCompletion.mock.calls[0][0];
  const itemsPromise = completionHandler({
    textDocument: { uri: '.vscode/extensions.json' }
  });
  resolve!(prettier);
  expect(await itemsPromise).toMatchSnapshot();
});
