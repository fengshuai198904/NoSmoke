'use strict';

const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');
const detectPort = require('detect-port');
const macacaReporterRender = require('macaca-reporter/lib/render');
const macacaReportTemplate = require('../crawler/reporterTemplate');

let root = require('window-or-global');
root.mockData = require('macaca-reporter/test/mock');

macacaReportTemplate.initialize();

const _ = require('../common/helper');
const server = require('http').createServer();
const io = require('socket.io')(server);

let socketed = false;
let connected = false;

module.exports = function(app) {

  app.use(function *() {

    if (socketed) {
      /** Update content */
      this.body = fs.readFileSync(path.join(__dirname, '..', '..', 'reports', 'index.html'), 'utf8');
      return;
    } else {
      socketed = true;
    }

    var port = yield detectPort(56788);

    /** Listen to port and update change */
    server.listen(port);
    io.on('connection', function(socket) {
      if (connected === false) {
        connected = true;
        console.log('socket connected');
        /** Config interval for server emit event **/
        setInterval(() => {
          root.mockData.stats.duration = Date.now() - root.mockData.stats.start.getTime();
          root.mockData.stats.passPercent = (100 * root.mockData.stats.passes / (root.mockData.stats.tests ? root.mockData.stats.tests : 0)).toFixed(1);
          io.sockets.emit('update reporter', root.mockData);
        }, 2000);

        /** Config interval for update local report file **/
        setInterval(() => {
          macacaReporterRender(root.mockData, {
            socket: {
              server: `http://${_.ipv4}:${port}`
            }
          });
        }, 4000);

        socket.on('disconnect', function() {});
      }
    });

    /** Detect port and render data */
    macacaReporterRender(root.mockData, {
      socket: {
        server: `http://${_.ipv4}:${port}`
      }
    });

    /** Update content */
    this.body = fs.readFileSync(path.join(__dirname, '..', '..', 'reports', 'index.html'), 'utf8');
  });
};

/** Add event emmiter for picking up changes */
if (!root.eventEmmiter) {
  root.eventEmmiter = new EventEmitter();
}

root.eventEmmiter.addListener('screenRefresh', data => {
  let action = null;
  let i = 0;
  for (; i < data.currentNode.actions.length; i++) {
    if (data.currentNode.actions[i].isTriggered === false) {
      action = data.currentNode.actions[i];
      break;
    }
  }

  root.mockData.current.image = `./${data.fileName}` ;
  root.mockData.current.list = [];
  root.mockData.current.list.push({'title': 'digest', 'value': data.currentNode.digest});
  root.mockData.current.list.push({'title': 'actions-done', 'value': i});
  root.mockData.current.list.push({'title': 'actions-total', 'value': data.currentNode.actions.length});
  root.mockData.current.list.push({'title': 'action-path', 'value': action ? action.location : 'all action cleared'});
  root.mockData.current.list.push({'title': 'depth', 'value': data.currentNode.depth});
  root.mockData.current.list.push({'title': 'node-type', 'value': data.currentNode.type});
  root.mockData.current.list.push({'title': 'action-description', 'value': action ? JSON.stringify(action.source) : ''});
});

root.eventEmmiter.addListener('terminateCrawling', data => {
  io.sockets.emit('disconnect', root.mockData);
  io.close();
  process.exit();
});
