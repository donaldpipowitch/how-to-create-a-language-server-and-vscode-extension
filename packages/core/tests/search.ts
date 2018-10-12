import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { search } from '../src/search';
import prettierResponse from './__mocks__/prettier-response.json';

const mock = new MockAdapter(axios);

test('should search extensions', async () => {
  mock.onAny().replyOnce(200, prettierResponse);
  expect(await search('prettier').request).toMatchSnapshot();
});

test('should cancel search', async () => {
  mock.onAny().replyOnce(200, prettierResponse);
  const { request, cancel } = search('prettier');
  cancel();
  expect(await request).toBe(undefined);
});
