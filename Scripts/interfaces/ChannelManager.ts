interface IChannelManager {
    createPermanentChannel(name: string, defaultTopic: string): number;
    restoreSettings(channelID: number): void;
    dataFileFor(channelID: number): string;
    update(channelID: number): void;
}