var Utilities = require("./scripts/includes/utilities")
var User = (function () {
    function User(id) {
        this.id = id;
        this.megauser = false;
        this.mute = {
            active: false,
            by: null,
            expires: 0,
            time: null,
            reason: null
        };
        this.smute = {
            active: false,
            by: null,
            expires: 0,
            time: null,
            reason: null
        };
        this.caps = 0;
        this.capsmutes = 0;
        this.impersonation = "";
        this.timecount = parseInt(sys.time(), 10);
        this.talk = (new Date()).getTime();
        this.floodcount = 0;
        this.coins = 0;
        this.sametier = false;
        this.namehistory = [];
        this.lastline = {
            message: null,
            time: 0
        };
        this.logintime = parseInt(sys.time(), 10);
        this.tiers = [];
        this.lastpm = parseInt(sys.time(), 10);
        this.pmcount = 0;
        this.pmwarned = false;
        this.callcount = 0;
        this.endcalls = false;
        this.contributions = [];
        this.name = sys.name(id);
    }
    User.prototype.toString = function () {
        return "[object POUser " + name + "]";
    };
    User.prototype.expired = function (thingy) {
        return this[thingy].expires !== 0 && this[thingy].expires < sys.time();
    };
    User.prototype.activate = function (thingy, by, expires, reason, persistent) {
        this[thingy].active = true;
        this[thingy].by = by;
        this[thingy].expires = expires;
        this[thingy].time = parseInt(sys.time(), 10);
        this[thingy].reason = reason;
        if(persistent) {
            var table = {
                "mute": mutes,
                "smute": smutes
            };
            table[thingy].add(sys.ip(this.id), sys.time() + ":" + by + ":" + expires + ":" + sys.name(this.id) + ":" + reason);
        }
        callPlugins("on" + Utilities.capitalize(thingy), this.id);
    };
    User.prototype.un = function (thingy) {
        this[thingy].active = false;
        this[thingy].expires = 0;
        var table = {
            "mute": mutes,
            "smute": smutes
        };
        table[thingy].remove(sys.ip(this.id));
        callPlugins("onUn" + Utilities.capitalize(thingy), this.id);
    };
    return User;
})();
exports.User = User;
