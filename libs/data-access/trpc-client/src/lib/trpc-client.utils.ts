import type { AppRouter } from '@ng-realworld/data-access/trpc';
import { TRPCClientError } from '@trpc/client';
import { Observable } from 'rxjs';
import { z } from 'zod';

const procedureSchema = z.function().args(z.any(), z.any()).returns(z.promise(z.any()));

export function fromProcedure<T extends z.infer<typeof procedureSchema>>(executeFn: T) {
  return (...params: Parameters<T>) => {
    return new Observable<ReturnType<T> extends Promise<infer U> ? U : never>(subscriber => {
      const ac = new AbortController();
      const [input, opts] = params;
      Reflect.apply(executeFn, undefined, [input, { signal: ac.signal, ...opts }])
        .then(data => {
          subscriber.next(data);
        })
        .catch((err: Error) => {
          if (err.message === 'This operation was aborted.') {
            subscriber.complete();
            return;
          }

          subscriber.error(err);
          throw err;
        });

      return () => {
        ac.abort();
      };
    });
  };
}

export function isTRPCClientError(error: unknown): error is TRPCClientError<AppRouter> {
  return error instanceof TRPCClientError;
}
