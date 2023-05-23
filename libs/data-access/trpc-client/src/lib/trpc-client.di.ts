import { InjectionToken, Provider, inject } from '@angular/core';
import { AppRouter } from '@ng-realworld/data-access/trpc';
import { TRPCClientError, createTRPCProxyClient, httpLink } from '@trpc/client';
import { concatMap, from, lastValueFrom, of, switchMap, throwError } from 'rxjs';
import { fromFetch } from 'rxjs/fetch';

interface TRPCClientConfig {
  url: string;
}

const TRPC_CLIENT = new InjectionToken<ReturnType<typeof createTRPCProxyClient<AppRouter>>>('__TRPC_CLIENT__');

export const provideTRPCClient = (config: TRPCClientConfig): Provider => ({
  provide: TRPC_CLIENT,
  useFactory: () => {
    const internalClient = createTRPCProxyClient<AppRouter>({
      links: [
        httpLink({
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
        httpLink({
          url: config.url,
          fetch(url, options) {
            return lastValueFrom(
              fromFetch(url.toString(), { ...options, credentials: 'include' }).pipe(
                concatMap(response => {
                  if (!response.ok) {
                    return from(response.json()).pipe(
                      switchMap(json => {
                        const message = json.error.message;
                        if (message === 'TOKEN_EXPIRED') {
                          return from(internalClient.user.accessToken.query()).pipe(
                            switchMap(result => {
                              localStorage.setItem('__TOKEN__', result.token);
                              return fetch(url, {
                                ...options,
                                credentials: 'include',
                                headers: { ...options?.headers, Authorization: result.token },
                              });
                            })
                          );
                        }

                        return throwError(() => new TRPCClientError(message, { result: json }));
                      })
                    );
                  }
                  return of(response);
                })
              )
            );
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
