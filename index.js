"use strict";
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const http = require('http');
const HttpDispatcher = require('httpdispatcher');
const WebSocketServer = require('websocket').server;
const MediaStreamHandler = require('./media-stream-handler');
const RespondingService = require('./responding-service');
const queue = require('./queue');
const TwilioCall = require('./twilio-call');

const dispatcher = new HttpDispatcher();
const wsserver = http.createServer((request, response) => {
  try {
    dispatcher.dispatch(request, response);
  } catch(err) {
    console.error(err);
  }
});

const HTTP_SERVER_PORT = process.env.PORT;

const mediaws = new WebSocketServer({
  httpServer: wsserver,
  autoAcceptConnections: true,
});

const respondingService = new RespondingService();
queue.listeners.push(respondingService);

dispatcher.onPost('/voice/stream', (req, res) => {
  console.log('POST TwiML');
  const params = new URLSegitarchParams(req.body);
  
  const twilioCall = new TwilioCall(
    params.get("AccountSid"), 
    params.get("CallSid"), 
    process.env['TWILIO_AUTH_TOKEN']
  );

  respondingService.on('update', twilioCall.update.bind(twilioCall));

  const filePath = path.join(__dirname + '/templates', 'streams.xml');
  const stat = fs.statSync(filePath);

  res.writeHead(200, {
    'Content-Type': 'text/xml',
    'Content-Length': stat.size
  });

  const readStream = fs.createReadStream(filePath);
  readStream.pipe(res);
});

mediaws.on('connect', connection => {
  console.log('Media WS: Connection accepted');
  new MediaStreamHandler(connection);
});

wsserver.listen(HTTP_SERVER_PORT, function(){
  console.log("Server listening on: http://localhost:%s", HTTP_SERVER_PORT);
});