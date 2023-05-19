import { InjectionToken, Provider, inject } from '@angular/core';
import { AppRouter } from '@ng-realworld/data-access/trpc';
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';

interface TRPCClientConfig {
  url: string;
}

const TRPC_CLIENT = new InjectionToken<ReturnType<typeof createTRPCProxyClient<AppRouter>>>('__TRPC_CLIENT__');

export const provideTRPCClient = (config: TRPCClientConfig): Provider => ({
  provide: TRPC_CLIENT,
  useFactory: () => {
    const client = createTRPCProxyClient<AppRouter>({
      links: [
        httpBatchLink({
          url: config.url,
        }),
      ],
    });
    return client;
  },
});

export const injectTRPC = () => inject(TRPC_CLIENT);
