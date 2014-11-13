#!/usr/bin/env node
'use strict';

/**
 * a convenience script to `npm test` the app with a node-inspector debugger and the mock-api-server
 * @type {[type]}
 */
var isWindows = /^win/.test(process.platform),
    options   = { cwd: __dirname, stdio: 'inherit', env: { NODE_ENV: 'development' }},
    env       = require('util')._extend(options.env, process.env),
    handles   = [];

/**
 * launches a child process
 * @param  {string} cmd  the command line to invoke
 */
function spawn(cmd) {
  var path = require('path'),
      exec = require('child_process').spawn,
      args = cmd.split(' '),
      handle;

  if (isWindows) {
    args[0] = path.normalize([args[0], '.cmd'].join(''));
    handle = exec(process.env.COMSPEC, ['/D', '/C'].concat(args), options);
  } else {
    // move arg 0 to the cmd name
    cmd = args.shift();
    handle = exec(cmd, args, options);
  }

  handles.push(handle);
}

/**
 * terminates all child processes
 */
function kill() {
  var handle;
  while(handle = handles.pop()) {
    handle.kill();
  }
}

spawn('./node_modules/.bin/istanbul cover node_modules/mocha/bin/_mocha --dir ./.coverage -- --recursive ./tests/**/*.js --reporter spec');

process.on('SIGINT', kill);
