import {EventEmitter} from "events";
import * as RequestStatic from "request";
const request: typeof RequestStatic = require("request");
const iconv = require("iconv-lite");
import * as log4js from "log4js";
const logger = log4js.getLogger();
import parse from "./parse";
import {Res} from "./parse";

export default class Watcher extends EventEmitter {
    constructor(addListener?: (reses: Res[]) => void) {
        super();
        if (addListener != null) {
            super.addListener("add", addListener);
        }
    }

    watch(url: string) {
        this.request(url, 1)
            .then(x => {
                let readed = x[x.length - 1].number;
                setInterval(
                    () => this.request(url, readed + 1)
                        .then(y => {
                            if (y.length > 0) {
                                readed = y[y.length - 1].number;
                                super.emit("add", y);
                            }
                        })
                        .catch((e: any) => logger.error(e.stack != null ? e.stack : e)),
                    7 * 1000);
            })
            .catch((e: any) => logger.error(e.stack != null ? e.stack : e));
    }

    private request(baseURL: string, res: number) {
        return new Promise<Res[]>((resolve, reject) => {
            request(
                `${baseURL}${res}-`,
                { encoding: null },
                (err, response, body) => {
                    if (err != null) {
                        reject(err);
                        return;
                    }
                    resolve(parse(iconv.decode(body, "euc-jp")));
                });
        });
    }
}
