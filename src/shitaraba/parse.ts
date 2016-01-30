export default function parse(body: string) {
    return body.split("\n")
        .filter(x => x.length > 0)
        .map(line => {
            let array = line.split("<>");
            return <Res>{
                number: parseInt(array[0], 10),
                name: array[1],
                email: array[2],
                date: array[3],
                message: array[4].replace(/<br>/g, "\n"),
                id: array[6]
            };
        });
}

export interface Res {
    number: number;
    name: string;
    email: string;
    date: string;
    id: string;
    message: string;
}
