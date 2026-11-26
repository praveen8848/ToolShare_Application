import { act, renderHook, waitFor } from '@testing-library/react';
import toolService from '../services/toolService';
import { useTools } from './useTools';

jest.mock('../services/toolService');
jest.mock('react-toastify', () => ({ toast: { error: jest.fn() } }));

const deferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
};

test('keeps results from the latest filter request when responses finish out of order', async () => {
  const initialRequest = deferred();
  const firstSearch = deferred();
  const secondSearch = deferred();
  toolService.getAllTools
    .mockReturnValueOnce(initialRequest.promise)
    .mockReturnValueOnce(firstSearch.promise)
    .mockReturnValueOnce(secondSearch.promise);

  const { result } = renderHook(() => useTools());
  act(() => result.current.updateFilters({ search: 'first' }));
  act(() => result.current.updateFilters({ search: 'second' }));

  await act(async () => {
    secondSearch.resolve([{ id: 2, name: 'second result' }]);
    await secondSearch.promise;
  });
  await waitFor(() => expect(result.current.tools).toEqual([{ id: 2, name: 'second result' }]));

  await act(async () => {
    firstSearch.resolve([{ id: 1, name: 'stale result' }]);
    initialRequest.resolve([{ id: 0, name: 'initial result' }]);
    await Promise.all([firstSearch.promise, initialRequest.promise]);
  });

  expect(result.current.tools).toEqual([{ id: 2, name: 'second result' }]);
});
