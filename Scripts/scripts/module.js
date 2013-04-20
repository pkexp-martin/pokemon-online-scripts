var Module;
(function (Module) {
    var cache = {
    };
    function clearCache() {
        cache = {
        };
    }
    Module.clearCache = clearCache;
    function require(moduleName) {
        if(moduleName.indexOf(".js", moduleName.length - 3) == -1) {
            moduleName = moduleName.replace("../", "./").replace("./global/", "./scripts/global/").replace("./includes/", "./scripts/includes/") + ".js";
        }
        if(cache[moduleName]) {
            return cache[moduleName];
        }
        var exports = {
        };
        var content = sys.getFileContent(moduleName);
        if(content) {
            try  {
                eval(sys.getFileContent(moduleName));
                cache[moduleName] = exports;
            } catch (e) {
                sys.sendAll("Error loading module " + moduleName + ": " + e);
            }
        }
        return exports;
    }
    Module.require = require;
})(Module || (Module = {}));
