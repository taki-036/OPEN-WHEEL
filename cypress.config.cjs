const { defineConfig } = require("cypress")
const SSH = require('simple-ssh')
const webpackPreprocessor = require('@cypress/webpack-preprocessor')
const { removeDirectory } = require('cypress-delete-downloads-folder');

module.exports = defineConfig({
  // pluginsFile: false,
  // modifyObstructiveCode: false,
  // experimentalStudio: true,
  reporter: 'cypress-mochawesome-reporter',
  // reporter: "mochawesome",
  // reporterOptions: {
  //   reportDir: "cypress",
  //   overwrite: false,
  //   html: false,
  //   json: true
  },
  // "screenshotsFolder": "cypress/screenshots",
  // "videosFolder": "cypress/videos",
  requestTimeout: 10000,
  defaultCommandTimeout: 10000,
  component: {
    devServer: {
      framework: "vue",
      bundler: "vite",
    },
  },

  e2e: {
    numTestsKeptInMemory: 50,
    baseUrl: `http://localhost:8089`,
    setupNodeEvents(on, config) {
      on('before:run', async (details) => {
        console.log('override before:run');
        await beforeRunHook(details);
      });

      on('after:run', async () => {
        console.log('override after:run');
        await afterRunHook();
      });
      require('cypress-mochawesome-reporter/plugin')(on);
      on('task', {
        removeDirectory,
        log(message) {
          console.log(message)
    
          return null
        },
        sshExecuteCmd({sshconn, command}) {
          return new Promise((resolve, reject) => {
            let ssh = new SSH(sshconn)
    
            ssh.exec(command, {
              out: function (stdout) {
                console.log("stdout: " + stdout)
                resolve(stdout)
              },
              err: function (stderr) {
                console.log("stderr: " + stderr)
                resolve(stderr)
              },
            }).on('ready', () => {console.log('READY')})
            .on('error', (err) => {
              console.log('ERROR')
              console.log(err)
            })
            .start()
          })
        }
      })
    },
  },
})
