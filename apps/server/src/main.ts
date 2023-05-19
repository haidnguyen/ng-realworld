import { trpcMiddleware } from '@ng-realworld/data-access/trpc';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import * as path from 'path';

const app = express();
app.use(cors({ credentials: true, origin: true }));
app.use(cookieParser());
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/trpc', trpcMiddleware);

const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
