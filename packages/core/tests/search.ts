import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { search } from '../src/search';
import { prettier } from './__fixtures__/search-response';

const mock = new MockAdapter(axios);

test('should search extensions', async () => {
  mock.onAny().replyOnce(200, prettier);
  expect(await search('prettier').request).toMatchSnapshot();
});

test('should cancel search', async () => {
  mock.onAny().replyOnce(200, prettier);
  const { request, cancel } = search('prettier');
  cancel();
  expect(await request).toBe(undefined);
});
