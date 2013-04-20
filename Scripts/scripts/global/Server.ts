///<reference path="../../scripts.ts"/>
///<reference path="../../interfaces/ChannelManager.ts"/>
///<reference path="../../interfaces/Plugin.ts"/>
///<reference path="../../interfaces/ScriptEngine.ts"/>
///<reference path="../../interfaces/Server.ts"/>
///<reference path="../includes/string.ts"/>
///<reference path="../includes/file.ts"/>

import Files = module("scripts/includes/file");

declare function print(message: any): void;
declare var sys: IScriptEngine;

function debug(message: string): void {
    print("|- " + message);
}

export class Server implements IServer {
    public staffChannel = 0;

    private plugins = {};
    private pluginMethods = {};

    private channelManager: IChannelManager;

    public init() {
        this.initPlugins();

        this.channelManager = Module.require("scripts/global/ChannelManager.js").instance;
        sys.channelIds().forEach((id) => {
            this.channelManager.restoreSettings(id);
        });
    }

    public initPlugins() {
        this.plugins = {};

        var names = Files.readLines("scripts/conf/plugins.txt");
        names.forEach((pluginName) => {
            if (pluginName.length > 0 && pluginName[0] != '#') {
                var path = "scripts/plugins/" + pluginName + ".js";
                var mod = Module.require(path);
                var plugin = mod.instance; // || mod.createInstance();
                plugin.sourcePath = path;
                this.plugins[pluginName] = plugin;

                var prototype = Object.getPrototypeOf(plugin);
                var methods = Object.keys(prototype);
                debug(pluginName + " = " + methods.sort().join(", "))
                methods.forEach((methodName) => {
                    var key = methodName.toLowerCase();
                    if (this.pluginMethods[key] === undefined) {
                        this.pluginMethods[key] = new Array()
                    }
                    this.pluginMethods[key].push({ plugin: pluginName, method: methodName });
                });
            }
        });
    }

    public callPlugins(event: string): string {

        var goodReturnValues = [
            "OK",       // Handled with success
            "STOP",     // Handled with success, stop event intentionally
            "WARNING",  // Known command, but missing arguments or similar
            "UNKNOWN"   // Unknown command - only relevant for handleCommand(...)
        ];

        event = event.toLowerCase();
        var args = Array.prototype.slice.call(arguments, 1);
        var stop = false;

        debug("Call plugins for event " + event);
        
        if (event in this.pluginMethods) {
            this.pluginMethods[event].forEach((plugin) => {
                try {
                    var pluginName = plugin.plugin;
                    var methodName = plugin.method;
                    debug("   Invoke " + pluginName + "." + methodName + "(...)");
                    var ret = this.plugins[pluginName][methodName].apply(this.plugins[pluginName], args);
                    if (ret == "STOP") {
                        stop = true;
                    }
                    if (goodReturnValues.indexOf(ret) == -1) {
                        debug("BAD RESULT " + ret);
                    }
                    debug("   Result " + ret);
                }
                catch (e) {
                    print('Plugin Error on {0}: {1}'.format(this.plugins[pluginName].sourcePath, e));
                }
            });
            return stop ? "STOP" : "OK";
        }
        else {
            return "UNKNOWN";
        }
    }
}