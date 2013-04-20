var Files = require("./scripts/includes/file")
function debug(message) {
    print("|- " + message);
}
var Server = (function () {
    function Server() {
        this.staffChannel = 0;
        this.plugins = {
        };
        this.pluginMethods = {
        };
    }
    Server.prototype.init = function () {
        var _this = this;
        this.initPlugins();
        this.channelManager = Module.require("scripts/global/ChannelManager.js").instance;
        sys.channelIds().forEach(function (id) {
            _this.channelManager.restoreSettings(id);
        });
    };
    Server.prototype.initPlugins = function () {
        var _this = this;
        this.plugins = {
        };
        var names = Files.readLines("scripts/conf/plugins.txt");
        names.forEach(function (pluginName) {
            if(pluginName.length > 0 && pluginName[0] != '#') {
                var path = "scripts/plugins/" + pluginName + ".js";
                var mod = Module.require(path);
                var plugin = mod.instance;
                plugin.sourcePath = path;
                _this.plugins[pluginName] = plugin;
                var prototype = Object.getPrototypeOf(plugin);
                var methods = Object.keys(prototype);
                debug(pluginName + " = " + methods.sort().join(", "));
                methods.forEach(function (methodName) {
                    var key = methodName.toLowerCase();
                    if(_this.pluginMethods[key] === undefined) {
                        _this.pluginMethods[key] = new Array();
                    }
                    _this.pluginMethods[key].push({
                        plugin: pluginName,
                        method: methodName
                    });
                });
            }
        });
    };
    Server.prototype.callPlugins = function (event) {
        var _this = this;
        var goodReturnValues = [
            "OK", 
            "STOP", 
            "WARNING", 
            "UNKNOWN"
        ];
        event = event.toLowerCase();
        var args = Array.prototype.slice.call(arguments, 1);
        var stop = false;
        debug("Call plugins for event " + event);
        if(event in this.pluginMethods) {
            this.pluginMethods[event].forEach(function (plugin) {
                try  {
                    var pluginName = plugin.plugin;
                    var methodName = plugin.method;
                    debug("   Invoke " + pluginName + "." + methodName + "(...)");
                    var ret = _this.plugins[pluginName][methodName].apply(_this.plugins[pluginName], args);
                    if(ret == "STOP") {
                        stop = true;
                    }
                    if(goodReturnValues.indexOf(ret) == -1) {
                        debug("BAD RESULT " + ret);
                    }
                    debug("   Result " + ret);
                } catch (e) {
                    print('Plugin Error on {0}: {1}'.format(_this.plugins[pluginName].sourcePath, e));
                }
            });
            return stop ? "STOP" : "OK";
        } else {
            return "UNKNOWN";
        }
    };
    return Server;
})();
exports.Server = Server;
