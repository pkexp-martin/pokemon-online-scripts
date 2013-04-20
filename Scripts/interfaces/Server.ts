///<reference path="ChannelManager.ts"/>

interface IServer {
    channelManager: IChannelManager;

    staffChannel: number;

    init(): void;
    initPlugins(): void;
    callPlugins(...args: any[]): string;
}