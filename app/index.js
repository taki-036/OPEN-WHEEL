"use strict";

//this line must be placed before require express, socket.io and any other depending library
if (process.env.WHEEL_DEBUG_VERBOSE) {
  const debugLib = require("debug");
  const orgNamespaces = debugLib.load();
  const newNamespaces = "socket.io:*,express:*,abc4*,arssh2*,sbs*";
  const namespaces = orgNamespaces ? `${orgNamespaces},${newNamespaces}` : newNamespaces;
  debugLib.enable(namespaces);
}

const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const cors = require("cors");
const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const session = require("express-session");
const siofu = require("socketio-file-upload");
const passport = require("passport");
const { port, jupyter, jupyterPort, setJupyterToken, getJupyterToken, setJupyterPort, keyFilename, certFilename } = require("./db/db");
const { getLogger } = require("./logSettings");

/*
 * set up express, http and socket.io
 */
const app = express();
const opt = {
  key: fs.readFileSync(keyFilename),
  cert: fs.readFileSync(certFilename)
};
const server = require("https").createServer(opt, app);
const sio = require("socket.io")(server);

//setup logger
const logger = getLogger();


process.on("unhandledRejection", logger.debug.bind(logger));
process.on("uncaughtException", logger.debug.bind(logger));

//template engine
app.set("views", path.resolve(__dirname, "views"));

//middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: "wheel",
  resave: true,
  saveUninitialized: false,
  cookie: {
    secure: "auto"
  }
}));
app.use(express.static(path.resolve(__dirname, "viewer"), { index: false }));
app.use(express.static(path.resolve(__dirname, "public"), { index: false }));
app.use(siofu.router);
app.use(passport.initialize());
app.use(passport.session());

//routing
const routes = {
  home: require(path.resolve(__dirname, "routes/home"))(sio),
  workflow: require(path.resolve(__dirname, "routes/workflow"))(sio),
  remotehost: require(path.resolve(__dirname, "routes/remotehost"))(sio)
};

app.use("/", routes.home);
app.use("/home", routes.home);
app.use("/workflow", routes.workflow);
app.use("/remotehost", routes.remotehost);

//port number
const defaultPort = 443;
let portNumber = parseInt(process.env.WHEEL_PORT, 10) || port || defaultPort;

if (portNumber < 0) {
  portNumber = defaultPort;
}

//error handler
app.use((err, req, res, next)=>{
  //render the error page
  res.status(err.status || 500);
  res.send("something broken!");
});
//handle 404 not found
app.use((req, res, next)=>{
  res.status(404).send("reqested page is not found");
});

//Listen on provided port, on all network interfaces.
server.listen(portNumber);
server.on("error", onError);
server.on("listening", onListening);

//boot jupyter
if (jupyter) {
  const cmd = typeof jupyter === "string" ? jupyter : "jupyter-notebook";
  const jupyterPortNumber = typeof jupyterPort === "number" && jupyterPort > 1024 && jupyterPort < 65535 ? jupyterPort : port + 1;
  const notebookRoot = process.env.WHEEL_NOTEBOOK_ROOT || "/";
  const opts = [
    "--no-browser",
    "--allow-root",
    `--port ${jupyterPortNumber}`,
    "--port-retries=0",
    "--ip=*",
    `--notebook-dir=${notebookRoot}`
  ];
  setJupyterPort(jupyterPortNumber);

  logger.info("booting jupyter");
  const cp = spawn(cmd, opts, { shell: true });
  cp.stdout.on("data", (data)=>{
    logger.debug(data.toString());
  });
  cp.stderr.on("data", (data)=>{
    const output = data.toString();
    const currentToken = getJupyterToken();
    if (typeof currentToken === "undefined") {
      const rt = /http.*\?token=(.*)/.exec(output);
      if (rt !== null && typeof rt[1] === "string") {
        setJupyterToken(rt[1]);
      }
    }
    logger.debug(output);
  });
  cp.on("close", (code)=>{
    logger.debug(`jupyter is closed with ${code}`);
  });
  cp.on("error", (err)=>{
    logger.debug(`get error from jupyter process: ${err}`);
  });
  process.on("exit", ()=>{
    if (logger) {
      logger.debug(`kill jupyter process(${cp.pid}) before exit`);
    } else {
      //eslint-disable-next-line no-console
      console.log(`kill jupyter process(${cp.pid}) before exit`);
    }
    cp.kill();
  });
  process.on("SIGINT", ()=>{
    if (logger) {
      logger.info("WHEEL will shut down because Control-C pressed");
    } else {
      //eslint-disable-next-line no-console
      console.log("WHEEL will shut down because Control-C pressed");
    }
    process.exit(); //eslint-disable-line no-process-exit
  });
}

/**
 * Event listener for HTTP server "error" event.
 * @param error
 */
function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }
  const bind = typeof port === "string"
    ? `Pipe ${port}`
    : `Port ${port}`;


  //handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      logger.error(`${bind} requires elevated privileges`);
      //eslint-disable-next-line no-process-exit
      process.exit(1);
    case "EADDRINUSE":
      logger.error(`${bind} is already in use`);
      //eslint-disable-next-line no-process-exit
      process.exit(1);
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
  const addr = server.address();
  const bind = typeof addr === "string"
    ? `pipe ${addr}`
    : `port ${addr.port}`;
  logger.info(`Listening on ${bind}`);
}
