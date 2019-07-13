const debug = require('debug')('packet-cache');

class PacketCache {

    constructor() {
        this.cache = [];
        this.startPointer = -1;
        this.endPointer = -1;
        this.cacheSize = 64;
    }

    incrementPointers() {
        this.cache[this.startPointer] = null;
        this.startPointer = (this.startPointer + 1) % 65535;
        this.endPointer = (this.endPointer + 1) % 65535;
    }

    seqInRange(sn) {
        if (this.startPointer < this.endPointer) {  // this is normal range finding
            if ((sn >= this.startPointer) && (sn <= this.endPointer)) {
                return true;
            }
        }
        else {
            if ((sn >= this.startPointer) && (sn <= 65535)) {
                return true;
            }
            else {
                if ((sn >= 0) && (sn <= this.endPointer)) {
                    return true;
                }
            }            
        }

        return false;
    }

    addPacket(pkt)
    {
        this.cache[pkt.seq] = pkt;
        if (this.startPointer < 0) {
            this.startPointer = pkt.seq;
            this.endPointer = (this.startPointer + this.cacheSize) % 65535;
        }
        else {
            this.incrementPointers();
        }
    }

    getPacket(sn) {
        var packet = null;

        if (!this.seqInRange(sn)) {
            debug("sequenceNumber " + sn + "not in cache range");
        }
        else {
            if (this.cache[sn] != null) {
                debug("packet " + sn + " taken from cache");
                packet = this.cache[sn];
                this.cache[sn] = null;                    
            }
            else {
                debug (sn + " is not in cache");
            }
        }

        return packet;
    }
}

module.exports = PacketCache;