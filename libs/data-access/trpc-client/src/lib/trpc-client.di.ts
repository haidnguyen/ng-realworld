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
    const internalClient = createTRPCProxyClient<AppRouter>({
      links: [
        httpBatchLink({
          url: config.url,
          async fetch(url, options) {
            return await fetch(url, { ...options, credentials: 'include' });
          },
          headers() {
            const token = localStorage.getItem('__TOKEN__');
            return token
              ? {
                  Authorization: localStorage.getItem('__TOKEN__') ?? '',
                }
              : {};
          },
        }),
      ],
    });
    const client = createTRPCProxyClient<AppRouter>({
      links: [
        httpBatchLink({
          url: config.url,
          async fetch(url, options) {
            const response = await fetch(url, { ...options, credentials: 'include' });
            if (!response.ok) {
              const json = await response.json();
              const message = json[0].error.message;
              if (message === 'TOKEN_EXPIRED') {
                const result = await internalClient.user.accessToken.query();
                localStorage.setItem('__TOKEN__', result.token);
                return await fetch(url, {
                  ...options,
                  credentials: 'include',
                  headers: {
                    ...options?.headers,
                    Authorization: localStorage.getItem('__TOKEN__') ?? '',
                  },
                });
              }
            }
            return response;
          },
          headers() {
            const token = localStorage.getItem('__TOKEN__');
            return token
              ? {
                  Authorization: localStorage.getItem('__TOKEN__') ?? '',
                }
              : {};
          },
        }),
      ],
    });
    return client;
  },
});

export const injectTRPC = () => inject(TRPC_CLIENT);
