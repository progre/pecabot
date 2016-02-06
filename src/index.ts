/// <reference path="main.d.ts"/>
const Gitter = require("node-gitter");
import Watcher from "./shitaraba/watcher";

async function main(watchURL: string, roomPath: string) {
    let gitter = new Gitter(process.env.GITTER_TOKEN);
    let room = await gitter.rooms.join(roomPath);
    new Watcher(reses => {
        reses.forEach(x => {
            let body = `${x.number} ：${x.name}：${x.date} ID:${x.id}\n`
                + `${x.message.split("\n").map(z => `　${z}`).join("\n")}`;
            room.send("```text\n" + body.replace(/```/g, "``‵") + "\n```");
            if (x.number === 1000) {
                room.send("This thread has exceeded 1000. Since we can not write, please make a new thread.");
            }
        });
    }).watch(watchURL);
}

main(process.argv[2], process.argv[3])
    .catch((e: any) => console.error(e.stack));
