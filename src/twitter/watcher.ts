import {EventEmitter} from "events";
const Twitter = require("twitter");
import * as log4js from "log4js";
const logger = log4js.getLogger();

export default class Watcher extends EventEmitter {
    constructor(tweetListener?: (tweet: Tweet) => void) {
        super();
        if (tweetListener != null) {
            super.addListener("tweet", tweetListener);
        }
    }

    watch(tokens: Tokens) {
        let client = new Twitter({
            consumer_key: tokens.consumerKey,
            consumer_secret: tokens.consumerSecret,
            access_token_key: tokens.accessTokenKey,
            access_token_secret: tokens.accessTokenSecret
        });
        client.get("account/settings", (e: any, settings: any) => {
            if (e != null) {
                logger.error(e.stack != null ? e.stack : e);
                return;
            }
            let screenName = settings.screen_name;
            client.stream("user", (stream: any) => {
                stream.on("data", (data: any) => {
                    if (data.user == null || data.user.screen_name == null) {
                        return;
                    }
                    if (data.user.screen_name !== screenName) {
                        return;
                    }
                    this.emit("tweet", data);
                });
            });
        });
    }
}

interface Tokens {
    consumerKey: string;
    consumerSecret: string;
    accessTokenKey: string;
    accessTokenSecret: string;
}

interface Tweet {
    text: string;
}
