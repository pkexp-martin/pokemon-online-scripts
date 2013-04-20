var Empty = (function () {
    function Empty() { }
    Empty.prototype.handleCommand = function (channel, src, command, commandData, tar) {
        return "UNKNOWN";
    };
    Empty.prototype.handleCommandSample = function (channel, src, commandData, tar) {
        return "OK";
    };
    return Empty;
})();
exports.Empty = Empty;
exports.instance = new Empty();
exports.createInstance = function () {
    return new Empty();
};
