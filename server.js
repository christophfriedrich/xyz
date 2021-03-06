// Catch unhandled errors on the process.
process.on('unhandledRejection', err => console.error(err));

// Function to check whether a required module is available.
const req_res = m => {
  try {
    return require.resolve(m);
  } catch (e) {
    console.log('Cannot resolve ' + m);
    return false;
  }
};

// Set dotenv if the module is available
const dotenv = req_res('dotenv') ? require('dotenv') : null;

// Load environment from dotenv if available.
if (dotenv) dotenv.load();

// Global appRoot for absolute require paths.
global.appRoot = require('path').resolve(__dirname);

// Global dir expands the domain to create the root path for the application.
global.dir = process.env.DIR || '';

// If set the alias will override the host header in notifications.
global.alias = process.env.ALIAS ? process.env.ALIAS : null;

// Application access. Default is public.
global.access = process.env.PRIVATE ? 'private' : 'public';

// Additional logs will be written to console if global.logs is true.
global.logs = (process.env.LOG_LEVEL === 'info');

// Create PG connections.
require('./mod/pg/connections')(startFastify);

function startFastify(){

  // Set fastify
  const fastify = require('fastify')({
    logger: {
      level: process.env.LOG_LEVEL || 'error',
      prettifier: require('pino-pretty'),
      prettyPrint: {
        errorProps: ['hint', 'detail'],
        levelFirst: true,
        crlf: true
      }
    }
  });

  // Register fastify modules and routes.
  fastify
    .register(require('fastify-helmet'), {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ['\'self\''],
          baseURI: ['\'self\''],
          objectSrc: ['\'self\''],
          workerSrc: ['\'self\'', 'blob:'],
          frameSrc: ['\'self\'', 'www.google.com', 'www.gstatic.com'],
          formAction: ['\'self\''],
          styleSrc: ['\'self\'', '\'unsafe-inline\'', 'fonts.googleapis.com'],
          fontSrc: ['\'self\'', 'fonts.gstatic.com'],
          scriptSrc: ['\'self\'', 'www.google.com', 'www.gstatic.com'],
          imgSrc: ['\'self\'', '*.tile.openstreetmap.org', 'api.mapbox.com', 'res.cloudinary.com', 'data:']
        },
        setAllHeaders: true
      },
      noCache: true
    })
    .register(require('fastify-formbody'))
    .register(require('fastify-static'), {
      root: global.appRoot + '/public',
      prefix: (process.env.DIR || '') + '/'
    })
    .register(require('fastify-auth'))
    .register(require('fastify-jwt'), {
      secret: process.env.SECRET || 'Kill process'// should be at least 32 characters long
    })
    .addContentTypeParser('*', (req, done) => done())
    .decorate('authAccess', (req, res, done) => require('./mod/authToken')(req, res, fastify, { lv: global.access, API: false }, done))
    .decorate('authAPI', (req, res, done) => require('./mod/authToken')(req, res, fastify, { lv: global.access, API: true }, done))
    .decorate('authAdmin', (req, res, done) => require('./mod/authToken')(req, res, fastify, { lv: 'admin', API: false }, done))
    .decorate('authAdminAPI', (req, res, done) => require('./mod/authToken')(req, res, fastify, { lv: 'admin', API: true }, done))
    .register((fastify, opts, next) => { require('./routes/_routes')(fastify); next(); }, { prefix: global.dir });

  fastify.listen(process.env.PORT || 3000, '0.0.0.0', err => {
    if (err) {
      Object.keys(err).forEach(key => !err[key] && delete err[key]);
      console.error(err);
      process.exit(1);
    }

    console.log(`Serving ${global.workspace.admin.config.title} workspace.`);
  });
  
}