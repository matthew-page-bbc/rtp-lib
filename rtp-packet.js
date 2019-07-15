"use strict";

const Buffer = require('buffer').Buffer;

Number.prototype.toUnsigned = function () {
    return ((this >>> 1) * 2 + (this & 1));
};

class RtpPacket {

    constructor(payloadbuff) {
        this._rtp = null;
        this._valid = false;
        this._csrc = {};
        this._extension = null;
        this._payloadStartsAt = 12;

        if (!Buffer.isBuffer(payloadbuff)) {
            throw "payload must be a Buffer";
        }

        if (payloadbuff.length > 512) {
            // this is probably a complete incoming RTP packet

            if ((payloadbuff[0] >= 128) && (payloadbuff[0] <= 191)) {   // VERY VERY basic validity check                
                this._rtp = payloadbuff;
                this._doCsrcAndExtension();

                this._valid = true;
            }
            else {
                console.log('not an rtp packet');
            }
        }
        else {
            this._init_new_packet(payloadbuff);
            this._valid = true;
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
        // var SN = Math.floor(1000 * Math.random());  // sequence number starts from a random value, then incremented by 1
        var SN = 0;
        this._rtp.writeUInt16BE(SN, 2); // sequence number
        this._rtp.writeUInt32BE(1, 4); // timestamp
        this._rtp.writeUInt32BE(1, 8); // ssrc
        payloadbuff.copy(this._rtp, 12, 0); // append payload data
    }

    _doCsrcAndExtension() {
        for(let i = 0; i < this.csrcCount; i ++)
        this._csrc.push(this._rtp.readUInt32BE(12 + i * 4));
        const endCsrcIdx = 12 + this.csrcCount * 4;

        this._payloadStartsAt = endCsrcIdx;
        if (this.extensions) {
            const extensionLength = this._rtp.readUInt16BE(endCsrcIdx + 2);
            this._extension = {
                id: this._rtp.readUInt16BE(endCsrcIdx),
                data: this._rtp.slice(endCsrcIdx + 4, endCsrcIdx + 4 + extensionLength)
            }
            this._payloadStartsAt += 4 + extensionLength;
        }
    }

    get version() {
        if (!this._valid) return null;
        return (this._rtp[0] & 0xC0) >>> 6        
    }

    get padding() {
        if (!this._valid) return null;
        return (this._rtp[0] & 0x16) >>> 4;
    }

    get extensions() {
        if (!this._valid) return null;
        return (this._rtp[0] & 0x20) >>> 5;
    }

    get csrcCount() {
        if (!this._valid) return null;
        return (this._rtp[0] & 0xF);
    }

    get marker() {
        if (!this._valid) return null;
        return (this._rtp[1] & 0x80) >>> 7;
    }

    get type() {
        if (!this._valid) return null;
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
        if (!this._valid) return null;
        return this._rtp.readUInt16BE(2);
    }

    set seq(val) {
        this._rtp.writeUInt16BE(val, 2);
    }

    get time() {
        if (!this._valid) return null;
        return this._rtp.readUInt32BE(4);
    }

    set time(val) {
        this._rtp.writeUInt32BE(val, 4);
    }

    get source() {
        if (!this._valid) return null;
        return this._rtp.readUInt32BE(8);
    }

    set source(val) {
        this._rtp.writeUInt32BE(val, 8);
    }

    get payload() {
        if (!this._valid) return null;
        return (this._rtp.slice(this._payloadStartsAt, this._rtp.length));
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
        if (!this._valid) return null;
        return this._rtp;
    }
}

module.exports = RtpPacket;