import 'reflect-metadata';

import express from 'express';
import dotenv from 'dotenv';
import errorhandler from 'strong-error-handler';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import methodOverride from 'method-override';
import bodyParser from 'body-parser';
import { createConnection } from 'typeorm';

import swaggerDocument from './public/swagger.json';
import { RegisterRoutes } from './routes';
import './controllers/RootController';
import './controllers/ProductController';
import './controllers/CompanyController';
import './controllers/ContractController';

// Import environment variables
dotenv.config({ path: '.env' });

const PORT = process.env.PORT || 3000;

createConnection().then(async () => {
  const app = express();

  app.use(express.json());
  app.use(bodyParser.urlencoded({ extended: false }));

  RegisterRoutes(app);

  app.use(methodOverride());

  // Give additional error information when in development mode.
  app.use(errorhandler({
    debug: process.env.NODE_ENV === 'development',
    safeFields: ['message'],
  }));

  // If env file specifies development, use swagger UI
  if (process.env.NODE_ENV === 'development') {
    app.use('/api/swagger-ui', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    app.get('/api/swagger.json', (req, res) => {
      res.sendFile(path.join(__dirname, './public/swagger.json'));
    });
  }

  // Announce port that is listened to in the console
  app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
  });
});
