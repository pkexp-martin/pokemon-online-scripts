var Files = require("./scripts/includes/file")
var ChannelManager = (function () {
    function ChannelManager(channelDataFile) {
        this.channelDataFile = channelDataFile;
        this.channelMap = {
        };
        try  {
            this.channelMap = Files.readObjectOrCreateDefault(this.channelDataFile, {
            });
        } catch (err) {
            print('Could not read channel data: ' + err);
        }
    }
    ChannelManager.copyAttributes = [
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
    ChannelManager.prototype.createPermanentChannel = function (name, defaultTopic) {
        var channelID;
        if(sys.existChannel(name)) {
            channelID = sys.channelId(name);
        } else {
            channelID = sys.createChannel(name);
        }
        this.restoreSettings(channelID);
        if(!SESSION.channels(channelID).topic) {
            SESSION.channels(channelID).topic = defaultTopic;
        }
        SESSION.channels(channelID).perm = true;
        return channelID;
    };
    ChannelManager.prototype.update = function (channelID) {
        var channel = SESSION.channels(channelID);
        var channelData = {
        };
        ChannelManager.copyAttributes.forEach(function (attr) {
            channelData[attr] = channel[attr];
        });
        this.saveChannel(channelID, channelData);
    };
    ChannelManager.prototype.restoreSettings = function (channelID) {
        var channel = SESSION.channels(channelID);
        var channelData = this.loadChannel(channelID);
        ChannelManager.copyAttributes.forEach(function (attr) {
            if(channelData !== null && channelData.hasOwnProperty(attr)) {
                channel[attr] = channelData[attr];
            }
        });
    };
    ChannelManager.prototype.loadChannel = function (channelID) {
        return Files.readObjectOrCreateDefault(this.dataFileFor(channelID), {
        });
    };
    ChannelManager.prototype.dataFileFor = function (channelID) {
        var channelName = sys.channel(channelID);
        if(!this.channelMap.hasOwnProperty(channelName)) {
            var filePath = "scripts/data/channels/" + Date.now() + Math.random().toString().substr(2) + ".json";
            this.channelMap[channelName] = filePath;
            this.save();
        }
        return this.channelMap[channelName];
    };
    ChannelManager.prototype.saveChannel = function (channelID, channelData) {
        Files.writeObject(this.dataFileFor(channelID), channelData);
    };
    ChannelManager.prototype.save = function () {
        Files.writeObject(this.channelDataFile, this.channelMap);
    };
    ChannelManager.prototype.toString = function () {
        return "[object POChannelManager " + this.channelDataFile + "]";
    };
    return ChannelManager;
})();
exports.ChannelManager = ChannelManager;
exports.instance = new ChannelManager("scripts/data/channels.json");
