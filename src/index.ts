/// <reference path="main.d.ts"/>
try { require("source-map-support").install(); } catch (e) { /* empty */ }
const Gitter = require("node-gitter");
import * as log4js from "log4js";
const logger = log4js.getLogger();
import ShitarabaWatcher from "./shitaraba/watcher";
import TwitterWatcher from "./twitter/watcher";
import * as RequestStatic from "request";
const request: typeof RequestStatic = require("request");

async function main(roomPath: string) {
    let gitter = new Gitter(process.env.GITTER_TOKEN);
    let room = await gitter.rooms.join(roomPath);
    if (process.env.SHITARABA_THREAD != null) {
        new ShitarabaWatcher(reses => {
            reses.forEach(x => {
                let body = `${x.number} ：${x.name}：${x.date} ID:${x.id}\n`
                    + `${x.message.split("\n").map(z => `　${z}`).join("\n")}`;
                room.send("```text\n" + body.replace(/```/g, "``‵") + "\n```");
                if (x.number === 1000) {
                    room.send("This thread has exceeded 1000. Since we can not write, please make a new thread.");
                }
            });
        }).watch("http://jbbs.shitaraba.net/bbs/rawmode.cgi/" + process.env.SHITARABA_THREAD);
        logger.info("Shitaraba enabled.");
    }
    if (process.env.TWITTER_CONSUMER_KEY != null
        && process.env.TWITTER_CONSUMER_SECRET
        && process.env.TWITTER_ACCESS_TOKEN_KEY
        && process.env.TWITTER_ACCESS_TOKEN_SECRET) {
        new TwitterWatcher(tweet => {
            room.send(tweet.text);
            getImageURL(tweet.text)
                .then(x => {
                    if (x == null) {
                        return;
                    }
                    room.send(`![](${x})`);
                }).catch(e => {
                    logger.error(e.stack != null ? e.stack : e);
                });
        }).watch({
            consumerKey: process.env.TWITTER_CONSUMER_KEY,
            consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
            accessTokenKey: process.env.TWITTER_ACCESS_TOKEN_KEY,
            accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET
        });
        logger.info("Twitter enabled.");
    }
}

function getImageURL(text: string) {
    return new Promise((resolve, reject) => {
        let url = findURL(text);
        if (url == null) {
            resolve(null);
            return;
        }
        request(url, (error: any, response: any, html: any) => {
            if (error != null) {
                reject(error);
                return;
            }
            resolve(findOGImage(html));
        });
    });
}

function findURL(text: string) {
    let list = text.match(/https?:\/\/.+/g);
    if (list == null) {
        return null;
    }
    return list[0];
}

function findOGImage(html: string) {
    let m = html.match(/<meta +property="og:image" +content="(.+)">/);
    if (m == null) {
        return null;
    }
    return m[1];
}

main(process.argv[2])
    .catch((e: any) => logger.error(e.stack != null ? e.stack : e));
