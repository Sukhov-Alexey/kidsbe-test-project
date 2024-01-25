import express from 'express';
import { login, exchange } from '@kidsbe/auth-common';
import { errorHandler } from '@kidsbe/http-errors';

const host = process.env.HOST ?? 'localhost';
console.log(process.env.API_PORT)
const port = process.env.API_PORT ? Number(process.env.API_PORT) : 3000;
const exchangePort = process.env.EXCHANGE_PORT ? Number(process.env.EXCHANGE_PORT) : port + 5;

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send({ message: 'Hello ADMINS API' });
});

app.use(login.router);

app.use(errorHandler);

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});

// INTERNAL EXCHANGE ENDPOINTS

const exchangeApp = express();

exchangeApp.use(exchange.router);

exchangeApp.get('/', (req, res)=> {
  res.send({message: 'Hello ADMINS internal API'});
});

exchangeApp.listen(exchangePort, host, ()=> {
  console.log(`[ internal API ready ] http://${host}:${exchangePort}`);
})
