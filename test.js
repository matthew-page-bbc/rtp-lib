const Buffer = require('buffer').Buffer;
const RtpPacket = require('./rtp-packet');
const RtpStream = require('./rtp-stream');

var payload = Buffer.from("this is my payload", 'utf8');
var rtp = new RtpPacket(payload);

rtp.time = 1234;

console.log(rtp.packet);

rtp.payload = Buffer.from("this is my new payload", 'utf8');

console.log(rtp.packet);

var stream = new RtpStream();

var SN = Math.floor(65535 * Math.random());
for (var i=0; i < 65535; i++) {
    
    var pkt = new RtpPacket(Buffer.from('packet number ' + i.toString()));
    pkt.seq = SN;
    SN = (SN+1) % 65535;

    stream.addRtpPacket(pkt);

}