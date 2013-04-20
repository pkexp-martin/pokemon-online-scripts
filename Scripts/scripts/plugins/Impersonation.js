var Impersonation = (function () {
    function Impersonation() { }
    Impersonation.prototype.beforeChatMessage = function (src, message, channel) {
        if(SESSION.users(src).impersonation != '') {
            sys.sendAll(SESSION.users(src).impersonation + ": " + message, channel);
            return "STOP";
        }
    };
    Impersonation.prototype.handleCommandImp = function (channel, src, commandData, tar) {
        SESSION.users(src).impersonation = commandData;
        sys.sendMessage(src, "Now you are " + SESSION.users(src).impersonation + "!", channel);
        return "OK";
    };
    Impersonation.prototype.handleCommandImpOff = function (channel, src, commandData, tar) {
        SESSION.users(src).impersonation = "";
        sys.sendMessage(src, "Now you are yourself!", channel);
        return "OK";
    };
    return Impersonation;
})();
exports.Impersonation = Impersonation;
exports.instance = new Impersonation();
