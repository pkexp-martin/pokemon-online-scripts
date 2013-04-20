///<reference path="../../interfaces/ScriptEngine.ts"/>
///<reference path="../../interfaces/User.ts"/>

import Utilities = module("scripts/includes/utilities");

declare function callPlugins(...args: any[]): string;
declare var sys: IScriptEngine;
declare var mutes, smutes: any;

export class User implements IUser {

    public name: string;
    /* whether user is megauser or not */
    public megauser = false;
    /* whether user is muted or not */
    public mute = {active: false, by: null, expires: 0, time: null, reason: null};
    /* whether user is secrectly muted */
    public smute = {active: false, by: null, expires: 0, time: null, reason: null};
    /* caps counter for user */
    public caps = 0;
    public capsmutes = 0;
    /* whether user is impersonating someone */
    public impersonation = "";
    /* last time user said something */
    // TODO replace with the other one
    public timecount = parseInt(sys.time(), 10);
    /* last time user said something */
    public talk = (new Date()).getTime();
    /* counter on how many lines user has said recently */
    public floodcount = 0;
    /* counts coins */
    public coins = 0;
    /* whether user has enabled battling only in same tier */
    public sametier = false;
    /* name history */
    public namehistory = [];
    /* last line */
    public lastline = {message: null, time: 0};
    /* login time */
    public logintime = parseInt(sys.time(), 10);
    /* tier alerts */
    public tiers = [];
    /* last time a user PM'd */
    public lastpm = parseInt(sys.time(), 10);
    /* amount of PM's a user has sent */
    public pmcount = 0;
    /* stopping spam */
    public pmwarned = false;

    public callcount = 0;
    public endcalls = false;

    public contributions = [];

    constructor(public id: number) {
        this.name = sys.name(id);
    }

    public toString() {
        return "[object POUser " + name + "]";
    }

    public expired(thingy) {
        return this[thingy].expires !== 0 && this[thingy].expires < sys.time();
    }

    public activate(thingy, by, expires, reason, persistent) {
        this[thingy].active = true;
        this[thingy].by = by;
        this[thingy].expires = expires;
        this[thingy].time = parseInt(sys.time(), 10);
        this[thingy].reason = reason;
        if (persistent) {
            var table = {"mute": mutes, "smute": smutes};
            table[thingy].add(sys.ip(this.id), sys.time() + ":" + by + ":" + expires + ":" + sys.name(this.id) + ":" + reason);
        }
        callPlugins("on"+ Utilities.capitalize(thingy), this.id);
    }

    public un(thingy) {
        this[thingy].active = false;
        this[thingy].expires = 0;
        var table = {"mute": mutes, "smute": smutes};
        table[thingy].remove(sys.ip(this.id));
        callPlugins("onUn"+ Utilities.capitalize(thingy), this.id);
    }
}