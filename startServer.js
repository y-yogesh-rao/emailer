const server = new Hapi.server({
  port: process.env.PORT || 5000,
  routes: {
    cors: {
      origin: ['*'],
      headers: ['accept', 'authorization', 'Content-Type', 'If-None-Match', "language", "utcoffset"],
      additionalHeaders: ["Access-Control-Allow-Origin", "Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type"]
    }
  }
});

init = async () => {
  const swaggerOptions = {
    info: {
      title: process.env.SITE_NAME,
      version: process.env.API_VERSION
    },
    securityDefinitions: {
      Bearer: {
        type: "apiKey",
        name: "Authorization",
        in: "header"
      }
    },
    schemes:["http","https"],
    grouping: "tags",
    sortEndpoints: "ordered",
    consumes: ["application/json"],
    produces: ["application/json"]
  };
  await server.register([ auth_jwt ]);
  server.auth.strategy("jwt", "jwt", {
    complete: true,
    key: process.env.PRIVATE_KEY,                         // secret key
    validate: Common.validateToken,                 // validate function defined in common function for timestamp check
    verifyOptions: { algorithms: ["HS256"] }        // algorithm
  });

  await server.register(
    [
      Inert,
      Vision,
      { plugin: HapiSwagger, options: swaggerOptions },
      { plugin: i18n, options: { locales: process.env.VALID_LANGUANGE_CODES.split(','), directory: __dirname + "/locales", languageHeaderField: "language", defaultLocale: process.env.DEFAULT_LANGUANGE_CODE } },
      { plugin: Routes, options: { routes_dir: Path.join(__dirname, 'routes') } },
      { plugin: Cron,options: { jobs: Constants.CRON } }
    ]
  );
  await Models.sequelize.authenticate();
  Models.sequelize.sync().then(() => {
    server.start(() => {
      console.log("Server initialized at :", server.info.uri)
    });
  });
}