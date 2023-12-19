const { defineConfig } = require("cypress")
const SSH = require('simple-ssh')
const webpackPreprocessor = require('@cypress/webpack-preprocessor')
const { removeDirectory } = require('cypress-delete-downloads-folder');

module.exports = defineConfig({
  projectId: "4jprfr"
  },
  requestTimeout: 50000,
  defaultCommandTimeout: 50000,
  component: {
    devServer: {
      framework: "vue",
      bundler: "vite",
    },
  },

  e2e: {
    numTestsKeptInMemory: 1,
    baseUrl: `http://localhost:8089`,
    screenshotsFolder: "screenshots",
    env: {
      CYPRESS_RECORD_KEY: "c9eabe66-818d-470f-a4a8-5c33b028f1b3",
      browserPermissions: {
        clipboard: "allow"
      },
    setupNodeEvents(on, config) {
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
