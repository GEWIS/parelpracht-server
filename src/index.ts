import 'reflect-metadata';
import * as fs from 'fs';
import express from 'express';
import dotenv from 'dotenv';
import errorhandler from 'strong-error-handler';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import methodOverride from 'method-override';
import bodyParser from 'body-parser';
import { createConnection, getRepository } from 'typeorm';
import session from 'express-session';
import { TypeormStore } from 'connect-typeorm';
import passport from 'passport';

import swaggerDocument from './public/swagger.json';
import { RegisterRoutes } from './routes';
import './controllers/RootController';
import './controllers/ProductCategoryController';
import './controllers/ProductController';
import './controllers/CompanyController';
import './controllers/ContractController';
import './controllers/InvoiceController';
import './controllers/ContactController';
import './controllers/UserController';
import { Session } from './entity/Session';
import localStrategy, { localLogin } from './auth/LocalStrategy';
import { User } from './entity/User';
import UserService from './services/UserService';

// Import environment variables
dotenv.config({ path: '.env' });

const PORT = process.env.PORT || 3001;

createConnection().then(async (connection) => {
  // Setup of database
  await new UserService().setupRoles();

  const app = express();
  const sessionRepo = connection.getRepository(Session);

  app.use(express.json());
  app.use(bodyParser.urlencoded({ extended: false }));

  const sess = {
    store: new TypeormStore({
      cleanupLimit: 2,
      ttl: 84600,
    }).connect(sessionRepo),
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: { },
  } as session.SessionOptions;

  if (process.env.NODE_ENV === 'production') {
    sess.cookie!.secure = true; // serve secure cookies
  }

  app.use(session(sess));

  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    const userRepo = getRepository(User);
    const user = await userRepo.findOne({ id });
    if (user === undefined) {
      return done(null, false);
    }
    return done(null, user);
  });

  passport.use(localStrategy);

  RegisterRoutes(app);

  app.post('/api/login', localLogin);

  app.use(methodOverride());

  // Create file generation folders
  if (!fs.existsSync(path.join(__dirname, '/../tmp'))) {
    fs.mkdirSync(path.join(__dirname, '/../tmp'));
  }
  if (!fs.existsSync(path.join(__dirname, '/../data/generated'))) {
    fs.mkdirSync(path.join(__dirname, '/../data/generated'));
  }
  if (!fs.existsSync(path.join(__dirname, '/../data/uploads'))) {
    fs.mkdirSync(path.join(__dirname, '/../data/uploads'));
  }

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
