/// <reference path="main.d.ts"/>
const Gitter = require("node-gitter");
import Watcher from "./shitaraba/watcher";

async function main() {
    let gitter = new Gitter(process.env.npm_package_config_gitterToken);
    let room = await gitter.rooms.join("peca-dev/public");
    new Watcher(reses => {
        reses.forEach(x => {
            room.send(
                `${x.number} ：${x.name}：${x.date} ID:${x.id}\n`
                + `${x.message.split("\n").map(z => `　${z}`).join("\n")}`);
        });
    }).watch(process.env.npm_package_config_threadURL);
}

main()
    .catch((e: any) => console.error(e.stack));
