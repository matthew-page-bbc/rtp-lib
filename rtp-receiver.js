"use strict";

const RtpPacket = require('./rtp-packet');
const RtpStream = require('./rtp-stream');
const dgram = require("dgram");
const server = dgram.createSocket("udp4");

var stream = new RtpStream();

server.on('listening', () => {
    var address = server.address();
    console.log('listening on ' + address.address + ': ' + address.port);
});

server.on('message', (msg, remote) => {
    //console.log(msg);
    var pkt = new RtpPacket(msg);
    stream.addRtpPacket(pkt);
});

server.bind(5004, '0.0.0.0');