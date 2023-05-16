import { dataAccessTrpc } from './trpc';

describe('dataAccessTrpc', () => {
  it('should work', () => {
    expect(dataAccessTrpc()).toEqual('data-access-trpc');
  });
});
