import {EventEmitter} from "events";
const Twitter = require("twitter");

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
        client.get("account/settings", (error: any, settings: any) => {
            if (error != null) {
                console.error(error.stack);
                return;
            }
            let screenName = settings.screen_name;
            client.stream("user", (stream: any) => {
                stream.on("data", (data: any) => {
                    if (!("user" in data && "screen_name" in data.user)) {
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
