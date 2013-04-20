///<reference path="Channel.ts"/>
///<reference path="User.ts"/>
///<reference path="Server.ts"/>

interface ISession {
    identifyScriptAs(name: string): void;

    registerUserFactory(factory: IUser): void;
    registerChannelFactory(factory: IChannel): void;
    registerGlobalFactory(factory: IServer): void;

    global(): IServer;
    users(id: number): IUser;
    channels(id: number): IChannel;
}