let ascii_map = '__________\n' +
    '_F13....G_\n' +
    '_..R15a.1_\n' +
    '_...b...0_\n' +
    '_a.A...a._\n' +
    '_....a..._\n' +
    '_B....ggg_\n' +
    '_1.a.ag.a_\n' +
    '_2....g.f_\n' +
    '__________'

let map = ascii_map.split('\n');
let map_array = [];
for (let i = 0; i < map.length; i++) {
    map_array.push([]);
    let array = map[i].split('');
    for (let j = 0; j < array.length; j++) {
        if (array[j] === '.')
            map_array[i].push('');
        else
            map_array[i].push(array[j]);
    }
}
console.log(map_array[0])