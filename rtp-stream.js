"use strict";
const debug = require('debug')('RtpStream');
const PacketCache = require('./packet-cache');

class RtpStream {

    constructor() {
        this.queue = [];
        this.queueSize = 32;

        this.cache = new PacketCache();

        this.expectedSeq = -1; 
    }

    addRtpPacket(pkt) {
        debug("expected: " + this.expectedSeq + ", received: " + pkt.seq + ", timestamp: " + pkt.time + ", type: " + pkt.type + ", source: " + pkt.source);
        debug(pkt.payload);
        
        if (this.expectedSeq == -1) {
            this.queue.push(pkt);
            this.expectedSeq = pkt.seq + 1;
        }
        else {
            if (pkt.seq == this.expectedSeq) {
                this.queue.push(pkt);
                this.expectedSeq = (this.expectedSeq + 1) % 65535;
            }
            else {  
                var fromCache;  
                while (fromCache = this.cache.getPacket(this.expectedSeq) != null) {
                    this.queue.push(fromCache);
                    this.expectedSeq= (this.expectedSeq + 1) % 65535;
                }

                this.cache.addPacket(pkt);
            }            
        }        
    }

    getFromCache(sn) {   
        var packet = null;

        if (this.cache[sn] != null) {
            debug("packet " + sn + " taken from cache");
            packet = this.cache[sn];
            this.cache[sn] = null;                    
        }
        else {
            debug (sn + " is not in cache");
        }

        return packet;
    }
}


module.exports = RtpStream;