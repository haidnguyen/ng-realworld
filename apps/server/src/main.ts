import express from 'express';
import { trpcMiddleware } from '@ng-realworld/data-access/trpc';
import * as path from 'path';
import cors from 'cors';

const app = express();
app.use(cors());
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/trpc', trpcMiddleware);

const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
