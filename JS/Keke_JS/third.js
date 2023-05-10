/**
 * 代码中的类名、方法名、参数名已经指定，请勿修改，直接返回方法规定的值即可
 *
 *
 * @param n int整型
 * @return int整型一维数组
 */
function fn( n ) {
    let res = [];
    for (let i = 0; i < n; i++) {
        res.push(i)
    }
    return res;
}
module.exports = {
    fn : fn
};