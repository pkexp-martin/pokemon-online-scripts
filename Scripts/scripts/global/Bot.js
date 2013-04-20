var Bot = (function () {
    function Bot(name) {
        this.name = name;
    }
    Bot.prototype.formatMessage = function (message) {
        return "±" + this.name + ": " + message;
    };
    Bot.prototype.sendAll = function (message, channel) {
        if (typeof channel === "undefined") { channel = undefined; }
        if(channel === undefined) {
            sys.sendAll(this.formatMessage(message), -1);
        } else {
            sys.sendAll(this.formatMessage(message), channel);
        }
    };
    Bot.prototype.sendMessage = function (tar, message, channel) {
        if (typeof channel === "undefined") { channel = undefined; }
        if(channel === undefined) {
            sys.sendMessage(tar, this.formatMessage(message));
        } else {
            sys.sendMessage(tar, this.formatMessage(message), channel);
        }
    };
    return Bot;
})();
exports.Bot = Bot;
