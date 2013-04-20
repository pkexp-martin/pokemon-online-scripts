var Updates = (function () {
    function Updates() { }
    Updates.prototype.handleCommandUpdateTiers = function (channel, src, data, tar) {
        sys.reloadTiers();
        return "OK";
    };
    Updates.prototype.handleCommandUpdateScripts = function (channel, src, data, tar) {
        sys.sendAll("Will update scripts now");
        Module.clearCache();
        sys.changeScript(sys.getFileContent('scripts.js'), false);
        SESSION.global().initPlugins();
        sys.sendAll("Updated scripts...");
        return "OK";
    };
    return Updates;
})();
exports.Updates = Updates;
exports.instance = new Updates();
