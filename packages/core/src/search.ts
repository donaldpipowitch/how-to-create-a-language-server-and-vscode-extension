import axios, { Canceler } from 'axios';

export { Canceler };

/**
 * In the `.vscode/extensions.json` we'll need to use `${publisher.publisherName}.${extensionName}`.
 *
 * @example
 * {
 *   "publisher": {
 *     "publisherId": "d16f4e39-2ffb-44e3-9c0d-79d873570e3a",
 *     "publisherName": "esbenp",
 *     "displayName": "Esben Petersen",
 *     "flags": "none"
 *   },
 *   "extensionId": "96fa4707-6983-4489-b7c5-d5ffdfdcce90",
 *   "extensionName": "prettier-vscode",
 *   "displayName": "Prettier - Code formatter",
 *   "flags": "validated, public",
 *   "lastUpdated": "2018-08-09T12:05:04.413Z",
 *   "publishedDate": "2017-01-10T19:52:02.703Z",
 *   "releaseDate": "2017-01-10T19:52:02.703Z",
 *   "shortDescription": "VS Code plugin for prettier/prettier",
 *   "deploymentType": 0
 * }
 */
export type Extension = {
  publisher: {
    publisherId: string;
    publisherName: string;
    displayName: string;
    flags: string;
  };
  extensionId: string;
  extensionName: string;
  displayName: string;
  flags: string;
  lastUpdated: string;
  publishedDate: string;
  releaseDate: string;
  shortDescription: string;
  deploymentType: number;
};

export type SearchRequest = {
  cancel: Canceler;
  request: Promise<Extension[] | void>;
};

export function search(value: string): SearchRequest {
  const { token, cancel } = axios.CancelToken.source();
  const options = {
    cancelToken: token,
    url:
      'https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery',
    method: 'post',
    headers: {
      accept: 'application/json;api-version=5.0-preview.1;excludeUrls=true'
    },
    data: {
      filters: [
        {
          criteria: [
            // which visual studio app? code
            { filterType: 8, value: 'Microsoft.VisualStudio.Code' },
            // our search value
            { filterType: 10, value }
          ],
          pageSize: 10,
          pageNumber: 1
        }
      ]
    }
  };
  const request = axios(options)
    .then(({ data }) => data.results[0].extensions as Extension[])
    .catch((error) => {
      if (!axios.isCancel(error)) {
        throw error;
      }
    });
  return { request, cancel };
}
