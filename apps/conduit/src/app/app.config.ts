import { ApplicationConfig } from '@angular/core';
import { provideRouter, withEnabledBlockingInitialNavigation } from '@angular/router';
import { appRoutes } from './app.routes';
import { provideTRPCClient } from '@ng-realworld/data-access/trpc-client';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(appRoutes, withEnabledBlockingInitialNavigation()),
    provideTRPCClient({ url: 'http://localhost:3333/trpc' }),
  ],
};
