import * as core from '@donaldpipowitch/vscode-extension-core';
import { configureCompletion } from '../src/completion';
import { prettier } from './__fixtures__/search';

const setup = ({ text, offset }: { text: string; offset: number }) => {
  const search = jest.spyOn(core, 'search');
  let resolve: Function;
  const request = new Promise((_resolve) => (resolve = _resolve));
  const cancel = jest.fn(() => resolve());
  search.mockReturnValue({ cancel, request });

  const mockedConnection = { onCompletion: jest.fn() };
  const mockedDocuments = {
    get() {
      return {
        getText() {
          return text;
        },
        offsetAt() {
          return offset;
        }
      };
    }
  };
  configureCompletion(mockedConnection as any, mockedDocuments as any);

  expect(mockedConnection.onCompletion).toHaveBeenCalledTimes(1);
  const completionHandler = mockedConnection.onCompletion.mock.calls[0][0];

  return {
    callCompletionHandler: () =>
      completionHandler({
        textDocument: { uri: '.vscode/extensions.json' }
      }),
    resolveSearch: () => resolve(prettier),
    cancelSearch: cancel
  };
};

test('should provide completion items (search "prettier")', async () => {
  const { callCompletionHandler, resolveSearch } = setup({
    text: `{
  "recommendations": ["prettier"]
}`,
    offset: 24 // the `"`, before `prettier"]`
  });
  const itemsPromise = callCompletionHandler();
  resolveSearch();
  expect(await itemsPromise).toMatchSnapshot();
});

test('should provide no completion items (search term is too short)', async () => {
  const { callCompletionHandler, resolveSearch } = setup({
    text: `{
  "recommendations": ["p"]
}`,
    offset: 24 // the `"`, before `p"]`
  });
  const itemsPromise = callCompletionHandler();
  resolveSearch();
  expect(await itemsPromise).toMatchSnapshot();
});

test('should provide no completion items (triggered on "recommendations" property)', async () => {
  const { callCompletionHandler, resolveSearch } = setup({
    text: `{
  "recommendations": ["prettier"]
}`,
    offset: 4 // the `"`, before `recommendations"`
  });
  const itemsPromise = callCompletionHandler();
  resolveSearch();
  expect(await itemsPromise).toMatchSnapshot();
});

test('should provide no completion items (triggered on root)', async () => {
  const { callCompletionHandler, resolveSearch } = setup({
    text: `{
  "recommendations": ["prettier"]
}`,
    offset: 0 // the initial {
  });
  const itemsPromise = callCompletionHandler();
  resolveSearch();
  expect(await itemsPromise).toMatchSnapshot();
});

test('should cancel, if completion handler is called again, before search was resolved', async () => {
  const { callCompletionHandler, cancelSearch } = setup({
    text: `{
  "recommendations": ["prettier"]
}`,
    offset: 24 // the `"`, before `prettier"]`
  });
  const itemsPromise = callCompletionHandler();
  callCompletionHandler();
  expect(await itemsPromise).toBe(undefined);
  expect(cancelSearch).toHaveBeenCalledTimes(1);
});
