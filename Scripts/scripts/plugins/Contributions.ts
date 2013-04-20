///<reference path="../../interfaces/MemoryHash.ts"/>
///<reference path="../../interfaces/Plugin.ts"/>
///<reference path="../../interfaces/ScriptEngine.ts"/>
///<reference path="../../interfaces/Session.ts"/>

import File = module("scripts/includes/file");
import Hash = module("scripts/includes/hash");

declare var SESSION: ISession;
declare var sys: IScriptEngine;

export class Contributions implements IPlugin {

    public sourcePath: string;

    private contributors: IMemoryHash;

    public serverStartUp(): string {
        this.contributors = new Hash.MemoryHash("scripts/data/contributors.txt");
        /*
            TODO: iterate SESSION users and set contributions
            TODO: set contriutions on login
        */
        return "OK";
    }

    public handleCommandContributor(channel: number, src: number, commandData: string, tar: number): string {
        var s = commandData.split(":");
        var name = s[0], reason = s[1];
        if (sys.dbIp(name) === undefined) {
            sys.sendMessage(src, name + " couldn't be found.");
            return "WARNING";
        }
        sys.sendMessage(src, name + " is now a contributor!");
        this.contributors.add(name, reason);
        return "OK";

    }

    public handleCommandContributorOff(channel: number, src: number, commandData: string, tar: number): string {
        var contrib = "";
        for (var x in this.contributors.hash) {
            if (x.toLowerCase() == commandData.toLowerCase())
                contrib = x;
        }
        if (contrib === "") {
            sys.sendMessage(src, commandData + " isn't a contributor.", channel);
            return "WARNING";
        }
        this.contributors.remove(contrib);
        sys.sendMessage(src, commandData + " is no longer a contributor!");
        return "OK";
    }

    public handleCommandContributors(channel: number, src: number, commandData: string, tar: number): string {
        sys.sendHtmlMessage(src, "<hr/><b>CONTRIBUTORS</b><br/>", channel);
        for (var x in this.contributors.hash) {
            if (this.contributors.hash.hasOwnProperty(x)) {
                sys.sendHtmlMessage(src, x + "'s contributions: " + this.contributors.get(x), channel);
            }
        }
        sys.sendHtmlMessage(src, "<hr/>", channel);
        return "OK";
    }
}

export var instance: IPlugin = new Contributions();