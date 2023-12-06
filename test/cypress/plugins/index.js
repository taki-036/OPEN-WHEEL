/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

/**
 * @type {Cypress.PluginConfig}
 */
// eslint-disable-next-line no-unused-vars
// module.exports = (on, config) => {
//   // `on` is used to hook into various events Cypress emits
//   // `config` is the resolved Cypress config
//   on('task', {
//     log(message) {
//       console.log(message)

//       return null
//     },
//   })
// }

// module.exports = (on, config) => {
//   on('task', {
//     saveDataToDatabase(data) {
//       // nodeのコードをここに書きます。
//      // たとえば、nodeで行うdatabaseの書き込みだったり、など実行できます。
//       console.log(data)
//       return null // returnを返さないと怒られます。
//     },
//   })
// }

// install the simple-ssh node package and import it
// const SSH = require('simple-ssh')
// module.exports = (on, config) => {

// // add a task called sshExecuteCmd
//   on("task", {
//     sshExecuteCmd: ({ sshconn, command }) => {
//       return new Promise((resolve, reject) => {
//         let ssh = new SSH(sshconn)

//         ssh
//           .exec(command, {
//             out: function (stdout) {
//               console.log("stdout: " + stdout)
//               resolve(stdout)
//             },
//             err: function (stderr) {
//               console.log("stderr: " + stderr)
//               resolve(stderr)
//             },
//           })
//           .start()
//       })
//     }
//   })
// }

// module.exports = (on, config) => {
//   on('task', {
//     log(message) {
//       console.log(message)

//       return null
//     },
//   })
// }