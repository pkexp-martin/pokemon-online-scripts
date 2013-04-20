interface IUser {
    name: string;
    namehistory: any[];
    talk: number;
    lastline: any;
    contributions: any;
    megauser: bool;
    impersonation: string;
    sametier: bool;
    lastpm: number;
    pmcount: number;
    pmwarned: bool;
    caps: number;
    capsmutes: number;
    logintime: number;
    // hostname: string;
    callcount: number;
    endcalls: bool;

    mute: IPunishment;
    smute: IPunishment;

    timecount: number;
    floodcount: number;

    activate(thingy, by, expires, reason, persistent);
    expired(thingy: string);
    un(thingy: string);
}

interface IPunishment {
    active: bool;
    by: any;
    expires: number; 
    time: number;
    reason: string;
}