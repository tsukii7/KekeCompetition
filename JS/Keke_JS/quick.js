// input
// [["a"],[ "b" ], [ "c", [ "d",[ "e" ] ] ], "f"]
// output
// ["a","b","c","d","e","f"]

const rl = require("readline").createInterface({input: process.stdin});
var iter = rl[Symbol.asyncIterator]();
const readline = async () => (await iter.next()).value;

void async function () {
    let res = "["
    // Write your code here
    while (line = await readline()) {
        let tokens = line.split('\"');
        for (let i = 1; i < tokens.length; i += 2) {
            res +=(`"${tokens[i]}"`)
            if (i+2<tokens.length){
                res+=","
            }
        }
    }
    console.log(res+"]");

}()