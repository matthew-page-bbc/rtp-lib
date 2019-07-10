"use strict";

const Buffer = require('buffer').Buffer;

Number.prototype.toUnsigned = function () {
    return ((this >>> 1) * 2 + (this & 1));
};

class RtpPacket {

    constructor(payloadbuff) {
        this._rtp = null;

        if (!Buffer.isBuffer(payloadbuff)) {
            throw "payload must be a Buffer";
        }

        if (payloadbuff.length > 512) {
            // this is probably a complete incoming RTP packet
            this._rtp = payloadbuff;
        }
        else {
            this._init_new_packet(payloadbuff);
        }
    }

    _init_new_packet(payloadbuff) {
        this._rtp = Buffer.alloc(12 + payloadbuff.length); // V..SSRC + payload
		/*bufpkt[0] = (V << 6 | P << 5 | X << 4 | CC);
		bufpkt[1] = (M << 7 | PT);
		bufpkt[2] = (SN >>> 8)
		bufpkt[3] = (SN & 0xFF);
		bufpkt[4] = (TS >>> 24);
		bufpkt[5] = (TS >>> 16 & 0xFF);
		bufpkt[6] = (TS >>> 8 & 0xFF);
		bufpkt[7] = (TS & 0xFF);
		bufpkt[8] = (SSRC >>> 24);
		bufpkt[9] = (SSRC >>> 16 & 0xFF);
		bufpkt[10] = (SSRC >>> 8 & 0xFF);
		bufpkt[11] = (SSRC & 0xFF);*/
        this._rtp[0] = 0x80;
        this._rtp[1] = 0;
        var SN = Math.floor(1000 * Math.random());  // sequence number starts from a random value, then incremented by 1
        this._rtp.writeUInt16BE(SN, 2); // sequence number
        // this._rtp[2] = (SN >>> 8)
        // this._rtp[3] = (SN & 0xFF);
        this._rtp.writeUInt32BE(1, 4); // timestamp
        // this._rtp[4] = 0;
        // this._rtp[5] = 0;
        // this._rtp[6] = 0;
        // this._rtp[7] = 1;
        this._rtp.writeUInt32BE(1, 8); // ssrc
        // this._rtp[8] = 0;
        // this._rtp[9] = 0;
        // this._rtp[10] = 0;
        // this._rtp[11] = 1;
        payloadbuff.copy(this._rtp, 12, 0); // append payload data
    }

    get type() {
        return (this._rtp[1] & 0x7F);
    }

    set type(val) {
        val = val.toUnsigned();
        if (val <= 127) {
            this._rtp[1] -= (this._rtp[1] & 0x7F);
            this._rtp[1] |= val;
        }
    }

    get seq() {
        // return (this._rtp[2] << 8 | this._rtp[3]);
        return this._rtp.readUInt16BE(2);
    }

    set seq(val) {
        // val = val.toUnsigned();
        // if (val <= 65535) {
        //     this._rtp[2] = (val >>> 8);
        //     this._rtp[3] = (val & 0xFF);
        // }
        this._rtp.writeUInt16BE(val, 2);
    }

    get time() {
        return this._rtp.readUInt32BE(4);
    }

    set time(val) {
        this._rtp.writeUInt32BE(val, 4);
    }

    get source() {
        return this._rtp.readUInt32BE(8);
    }

    set source(val) {
        this._rtp.writeUInt32BE(val, 8);
    }

    get payload() {
        return (this._rtp.slice(12, this._rtp.length));
    }

    set payload(val) {
        if (Buffer.isBuffer(val) && val.length <= 512) {
            var newSize = 12 + val.length;
            if (this._rtp.length == newSize) {
                val.copy(this._rtp, 12, 0);
            }
            else {
                var newRtp = Buffer.alloc(newSize);
                this._rtp.copy(newRtp, 0, 0, 12);
                val.copy(newRtp, 12, 0);
                this._rtp = newRtp;
            }
        }
    }

    get packet() {
        return this._rtp;
    }
}

module.exports = RtpPacket;