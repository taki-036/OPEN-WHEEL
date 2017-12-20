"use strict";
const path = require("path");

let express = require('express');

const {userAccount} = require('../db/db')

module.exports = function(io){
  let sio=io.of('/admin');
  let doAndEmit = function(func, msg){
    func(msg).then(()=>{
      sio.emit('accountList', userAccount.getAll());
    });
  }
  sio.on('connect', (socket) => {
    socket.on('getAccountList', ()=>{
      userAccount.getAll()
        .then((results)=>{
          socket.emit('accountList', results);
        });
    });
    socket.on('addAccount',    doAndEmit.bind(null, userAccount.add.bind(userAccount)));
    socket.on('removeAccount', doAndEmit.bind(null, userAccount.remove.bind(userAccount)));
    socket.on('updateAccount', doAndEmit.bind(null, userAccount.update.bind(userAccount)));
  });
  const router = express.Router();
  router.get('/', function (req, res, next) {
    res.sendFile(path.resolve(__dirname,'../views/admin.html'));
  });
  return router;
}

