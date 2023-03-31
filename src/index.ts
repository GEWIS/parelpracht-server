/* eslint import/first: off */
import 'reflect-metadata';
import * as fs from 'fs';
import express, { Express } from 'express';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

import errorhandler from 'strong-error-handler';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import methodOverride from 'method-override';
import bodyParser from 'body-parser';
import session from 'express-session';
import { TypeormStore } from 'connect-typeorm';
import passport from 'passport';
import startEvents from './timedevents/cron';
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
import './controllers/RoleController';
import { Session } from './entity/Session';
import localStrategy, { localLogin } from './auth/LocalStrategy';
import { User } from './entity/User';
import UserService from './services/UserService';
import { ldapLogin, LDAPStrategy } from './auth';
import AppDataSource from './database';
import { DataSource } from 'typeorm';

const PORT = process.env.PORT || 3001;

export function setupSessionSupport(dataSource: DataSource, app: Express) {
  const sessionRepo = dataSource.getRepository(Session);

  // Setup session config
  const sess = {
    store: new TypeormStore({
      cleanupLimit: 2,
      limitSubquery: false,
      ttl: 84600,
    }).connect(sessionRepo),
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: true,
    cookie: { },
  } as session.SessionOptions;

  if (process.env.NODE_ENV === 'production' && process.env.USE_HTTPS === 'true') {
    sess.cookie!.secure = true; // serve secure cookies
  }

  app.set('trust proxy', 2);
  app.use(session(sess));

  app.use(passport.initialize());
  app.use(passport.session());

  // Initialize passport config.
  // config();
}

AppDataSource.initialize().then(async (dataSource) => {
  // Setup of database
  await new UserService().setupRoles();

  const app = express();

  app.use(express.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ extended: false, limit: '50mb' }));

  app.set('trust proxy', 2);

  setupSessionSupport(dataSource, app);

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    const userRepo = dataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id }, relations: ['roles'] });
    if (user === undefined) {
      return done(null, false);
    }
    return done(null, user);
  });

  passport.use(LDAPStrategy);
  passport.use(localStrategy);

  app.post('/api/login/ldap', ldapLogin);
  app.post('/api/login/local', localLogin);

  RegisterRoutes(app);

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
  if (!fs.existsSync(path.join(__dirname, '/../data/logos'))) {
    fs.mkdirSync(path.join(__dirname, '/../data/logos'));
  }
  if (!fs.existsSync(path.join(__dirname, '/../data/backgrounds'))) {
    fs.mkdirSync(path.join(__dirname, '/../data/backgrounds'));
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

  app.use('/static/logos', express.static(path.join(__dirname, '../data/logos')));
  app.use('/static/backgrounds', express.static(path.join(__dirname, '../data/backgrounds')));

  // Announce port that is listened to in the console
  app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
  });

  // Enable timed events
  startEvents();
});
