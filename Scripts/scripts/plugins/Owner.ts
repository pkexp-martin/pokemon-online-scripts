///<reference path="../../interfaces/Plugin.ts"/>
///<reference path="../../interfaces/ScriptEngine.ts"/>
///<reference path="../../interfaces/Session.ts"/>

import Utilities = module("scripts/includes/utilities");

declare var SESSION: ISession;
declare var sys: IScriptEngine;

export class Owner implements IPlugin {

    public sourcePath: string;

    public handleCommand(channel: number, src: number, command: string, commandData: string, tar: number): string {
        if (command == "changerating") {
            var data = commandData.split(' -- ');
            if (data.length != 3) {
                sys.sendMessage(src, "You need to give 3 parameters.");
                return "WARNING";
            }
            var player = data[0];
            var tier = data[1];
            var rating = parseInt(data[2], 10);

            sys.changeRating(player, tier, rating);
            sys.sendMessage(src, "Rating of " + player + " in tier " + tier + " was changed to " + rating);
            return "OK";
        }

        if (command == "sendall") {
            sys.sendAll(commandData, channel);
            return "OK";
        }

        if (command == "sendmessage") {
            var para = commandData.split(':::');
            if (para.length < 3) {
                sys.sendMessage(src, "You need to give 3 parameters.");
                return "WARNING";
            }
            var tar = sys.id(para[0]);
            var mess = para[1];
            var chan = sys.channelId(para[2]);
            sys.sendMessage(tar, mess, chan);
            sys.sendMessage(src, "Message was sent successfully", chan);
            return "OK";
        }

        if (command == "sendhtmlmessage") {
            var para = commandData.split(':::');
            if (para.length < 3) {
                sys.sendMessage(src, "You need to give 3 parameters.");
                return "WARNING";
            }
            var tar = sys.id(para[0]);
            var mess = para[1];
            var chan = sys.channelId(para[2]);
            sys.sendHtmlMessage(tar, mess, chan);
            sys.sendMessage(src, "Message was sent successfully", chan);
            return "OK";
        }

        if (command == "periodicsay" || command == "periodichtml") {
            var sayer = src;
            var args = commandData.split(":");

            var minutes = parseInt(args[0], 10);
            if (minutes < 3) {
                sys.sendMessage(src, "Minimum of 3 minutes required!");
                return "WARNING";
            }

            var channels = args[1].split(",");
            var cids = channels
                       .map(function (text) { return sys.channelId(text.replace(/(^\s*)|(\s*$)/g, "")); })
                       .filter(function (cid) { return cid !== undefined; });
            if (cids.length === 0) {
                sys.sendMessage(src, "No channels given");
                return "WARNING";
            }

            var what = args.slice(2).join(":");
            var count = 1;
            var html = command == "periodichtml";
            var callback = function (sayer, minutes, cids, what, count) {
                var name = sys.name(sayer);
                if (name === undefined) {
                    return "WARNING";
                }

                SESSION.users(sayer).callcount--;
                if (SESSION.users(sayer).endcalls) {
                    sys.sendMessage(src, "Periodic say of '" + what + "' has ended.");
                    SESSION.users(sayer).endcalls = false;
                    return "OK";
                }

                cids.forEach(function (cid) {
                    if (sys.isInChannel(sayer, cid)) {
                        if (html) {
                            var colour = Utilities.getColor(sayer);
                            sys.sendHtmlAll("<font color='" + colour + "'><timestamp/> <b>" + Utilities.escapeHtml(sys.name(sayer)) + ":</font></b> " + what, cid);
                        } else {
                            sys.sendAll(sys.name(sayer) + ": " + what, cid);
                        }
                    }
                });

                if (++count > 100) {
                    return "OK"; // max repeat is 100
                    SESSION.users(sayer).callcount++;
                    sys.delayedCall(function () { callback(sayer, minutes, cids, what, count); }, 60 * minutes);
                };
            };
            
            sys.sendMessage(src, "Starting a new periodicsay");
            SESSION.users(sayer).callcount = SESSION.users(sayer).callcount || 0;
            SESSION.users(sayer).callcount++;
            callback(sayer, minutes, cids, what, count);
            return "OK";
        }

        if (command == "endcalls") {
            if (SESSION.users(src).callcount === 0 || SESSION.users(src).callcount === undefined) {
                sys.sendMessage(src, "You have no periodic calls I think.");
            } 
            else {
                sys.sendMessage(src, "You have " + SESSION.users(src).callcount + " calls running.");
            }
            if (SESSION.users(src).endcalls !== true) {
                SESSION.users(src).endcalls = true;
                sys.sendMessage(src, "Next periodic call called will end.");
            } 
            else {
                SESSION.users(src).endcalls = false;
                sys.sendMessage(src, "Cancelled the ending of periodic calls.");
            }
            return "OK";
        }

        return "UNKNOWN";
    }
}
export var instance: IPlugin = new Owner();