///<reference path="../interfaces/ScriptEngine.ts"/>

declare var sys: IScriptEngine;

module Module {
    var cache = {};

    export function clearCache(): void {
        cache = {};
    }

    export function require(moduleName: string): any {
        if (moduleName.indexOf(".js", moduleName.length - 3) == -1) {
            moduleName = moduleName
                         .replace("../", "./")
                         .replace("./global/", "./scripts/global/")
                         .replace("./includes/", "./scripts/includes/")
                         + ".js";
        }

        if (cache[moduleName]) {
            return cache[moduleName];
        }

        var exports = {};

        var content = sys.getFileContent(moduleName);
        if (content) {
            try {
                eval(sys.getFileContent(moduleName));
                cache[moduleName] = exports;
            }
            catch (e) {
                sys.sendAll("Error loading module " + moduleName + ": " + e);
            }
        }

        return exports;
    }
}