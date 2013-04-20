///<reference path="../../interfaces/ChannelManager.ts"/>
///<reference path="../../interfaces/ScriptEngine.ts"/>
///<reference path="../../interfaces/Session.ts"/>

import Files = module("scripts/includes/file");

declare function print(message: any): void;

declare var SESSION: ISession;
declare var sys: IScriptEngine;

export class ChannelManager implements IChannelManager {
    static private copyAttributes = [
        "topic",
        "topicSetter",

        "perm",
        "official",
        "inviteonly",
        
        "masters",
        "admins",
        "operators",
        "members",
        
        
        "muteall",
        "meoff",
        "muted",
        "banned",

        "ignorecaps",
        "ignoreflood"        
    ];

    private channelMap: any = {};

    constructor(public channelDataFile: string) {
        try {
            this.channelMap = Files.readObjectOrCreateDefault(this.channelDataFile, {});
        }
        catch (err) {
            print('Could not read channel data: ' + err);
        }
    }

    public createPermanentChannel(name: string, defaultTopic: string): number {
        var channelID;
        if (sys.existChannel(name)) {
            channelID = sys.channelId(name);
        } else {
            channelID = sys.createChannel(name);
        }
        this.restoreSettings(channelID);
        if (!SESSION.channels(channelID).topic) {
            SESSION.channels(channelID).topic = defaultTopic;
        }
        SESSION.channels(channelID).perm = true;
        return channelID;
    };

    private update(channelID: number): void {
        var channel = SESSION.channels(channelID);
        var channelData = {};
        ChannelManager.copyAttributes.forEach(function (attr) {
            channelData[attr] = channel[attr];
        });
        this.saveChannel(channelID, channelData);
    }

    public restoreSettings(channelID: number): void {
        var channel = SESSION.channels(channelID);
        var channelData = this.loadChannel(channelID);
        ChannelManager.copyAttributes.forEach(function (attr) {
            if (channelData !== null && channelData.hasOwnProperty(attr))
                channel[attr] = channelData[attr];
        });
    }

    private loadChannel(channelID: number): any {
        return Files.readObjectOrCreateDefault(this.dataFileFor(channelID), {});
    }

    private dataFileFor(channelID: number): string {
        var channelName = sys.channel(channelID);
        if (!this.channelMap.hasOwnProperty(channelName)) {
            // TODO: Maybe prefix with safe escaped channel name for easier maintenance
            var filePath = "scripts/data/channels/" +
                           Date.now() + Math.random().toString().substr(2) + ".json";
            this.channelMap[channelName] = filePath;
            this.save();
        }
        return this.channelMap[channelName];
    }

    private saveChannel(channelID: number, channelData: any): void {
        Files.writeObject(this.dataFileFor(channelID), channelData);
    }

    private save(): void {
        Files.writeObject(this.channelDataFile, this.channelMap);
    }

    public toString(): string {
        return "[object POChannelManager " + this.channelDataFile + "]";
    }
}

export var instance = new ChannelManager("scripts/data/channels.json");