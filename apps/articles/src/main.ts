import express from 'express';
import {errorHandler} from '@kidsbe/http-errors';
import {router as articlesRouter} from './articles';
import { checkServicesStatuses } from './utils/exchange.utils';

const host = process.env.HOST ?? '0.0.0.0';
const port = process.env.API_PORT ? Number(process.env.API_PORT) : 3000;

const app = express();



app.use(express.json());

app.get('/', async (req, res) => {
  const servicesStatuses = await checkServicesStatuses();
  res.send({ message: 'Hello ARTICLES API', ...servicesStatuses });
});

app.use(articlesRouter);

app.use(errorHandler);

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});


