interface IChannel {
    topic: string;
    perm: bool;
    official: bool;
    inviteonly: number;
    ignorecaps: bool;
    ignoreflood: bool;
    muteall: bool;
    meoff: bool;

    masters: string[];
    admins: string[];
    operators: string[];
    members: string[];

    isChannelOperator(id: number): bool;
    isChannelAdmin(id: number): bool;
    isChannelOwner(id: number): bool;

    getReadableList(type: string): string;

    canJoin(id: number): string; // string!
    canTalk(id: number): bool;

    mute(src: any, tar: any, data: any): void; // any!
    unmute(src, tar): void;

    ban(src, tar, data: any): void;
    unban(src, tar): void;

    issueAuth(src, name, group): void;
    takeAuth(src, name, group): void;

    changeParameter(src, parameter, value);

    register(name: string): void;
    setTopic(src: number, topicInfo: any): void;
}