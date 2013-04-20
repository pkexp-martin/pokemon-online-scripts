///<reference path="../../interfaces/Plugin.ts"/>
///<reference path="../../interfaces/ScriptEngine.ts"/>
///<reference path="../../interfaces/Session.ts"/>
///<reference path="../module.ts"/>

declare var SESSION: ISession;
declare var sys: IScriptEngine;

export class Updates implements IPlugin {

    public sourcePath: string;

    public handleCommandUpdateTiers(channel: number, src: number, data: any, tar: number): string {
        /*
        normalsys.sendMessage(src, "Fetching tiers...");
        var updateURL = Config.base_url + "tiers.xml";
        if (commandData !== undefined && (commandData.substring(0,7) == 'http://' || commandData.substring(0,8) == 'https://')) {
            updateURL = commandData;
        }
        normalsys.sendMessage(src, "Fetching tiers from " + updateURL);
        var updateTiers = function(resp) {
            if (resp === "") return;
            try {
                sys.writeToFile("tiers.xml", resp);
                sys.reloadTiers();
            } catch (e) {
                normalsys.sendMessage(src, "ERROR: "+e);
                return;
            }
        };
        sys.webCall(updateURL, updateTiers);
        */
        sys.reloadTiers();
        return "OK";
    }

    public handleCommandUpdateScripts(channel: number, src: number, data: any, tar: number): string {
        /*
        normalsys.sendMessage(src, "Fetching scripts...");
        var updateURL = Config.base_url + "scripts.js";
        if (commandData !== undefined && (commandData.substring(0,7) == 'http://' || commandData.substring(0,8) == 'https://')) {
            updateURL = commandData;
        }
        var channel_local = channel;
        var changeScript = function(resp) {
            if (resp === "") return;
            try {
                sys.changeScript(resp);
                sys.writeToFile('scripts.js', resp);
            } catch (err) {
                sys.changeScript(sys.getFileContent('scripts.js'));
                normalbot.sendAll('Updating failed, loaded old scripts!', staffchannel);
                sys.sendMessage(src, "ERROR: " + err + (err.lineNumber ? " on line: " + err.lineNumber : ""), channel_local);
                print(err);
            }
        };
        normalsys.sendMessage(src, "Fetching scripts from " + updateURL);
        sys.webCall(updateURL, changeScript);
        */
        sys.sendAll("Will update scripts now");
        Module.clearCache();
        sys.changeScript(sys.getFileContent('scripts.js'), false); // Do not trigger startUp
        SESSION.global().initPlugins();
        sys.sendAll("Updated scripts...");
        return "OK";
    }
}

export var instance: IPlugin = new Updates();