const Buffer = require('buffer').Buffer;
const RtpPacket = require('./rtp-packet');

var payload = Buffer.from("this is my payload", 'utf8');
var rtp = new RtpPacket(payload);

rtp.time = 1234;

console.log(rtp.packet);

rtp.payload = Buffer.from("this is my new payload", 'utf8');

console.log(rtp.packet);
