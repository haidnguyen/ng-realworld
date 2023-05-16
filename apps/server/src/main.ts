import express from 'express';
import { initTRPC } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';
import * as path from 'path';

const t = initTRPC.create();
const appRouter = t.router({
  test: t.procedure.query(() => {
    return { msg: 'Hello from server' };
  }),
});
export type AppRouter = typeof appRouter;

const createContext = ({ req, res }: trpcExpress.CreateExpressContextOptions) => ({});

const app = express();

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/api', (req, res) => {
  res.send({ message: 'Welcome to server!' });
});
app.use(
  '/trpc',
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
