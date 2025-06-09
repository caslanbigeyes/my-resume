// 输入：target = 7, nums = [2,3,1,2,4,3]
// 输出：2
// 解释：子数组 [4,3] 是该条件下的长度最小的子数组。
/**
 * @param {number} target
 * @param {number[]} nums
 * @return {number}
 */
var minSubArrayLen = function (target, nums) {
    let sum = 0;
    let subL = 0;
    let i = 0;
    let result = Infinity;
    for (let j = 0; j < nums.length; j++) {
        sum += nums[j];
        while (sum >= target) {
            subL = j - i + 1;
            result = Math.min(result, subL);
            sum = sum - nums[i]
            i++
        }
    }
    return result === Infinity ? 0 : result; // 处理没有找到的情况
};

let target = 7; let nums = [2, 3, 1, 2, 4, 3]

console.log(minSubArrayLen(target, nums))



// 输入: strs = ["eat", "tea", "tan", "ate", "nat", "bat"]
// 输出: [["bat"],["nat","tan"],["ate","eat","tea"]]
var groupAnagrams = function (strs) {
    let map = new Map();
    for (let i = 0; i < strs.length; i++) {
        let str = strs[i];
        let key = str.split('').join('');
        if (map.has(key)) {
            map.get(key).push(str)
        } else {
            map.set(key, [str])
        }


    }
    return Array.from(map.values())
}
console.log(groupAnagrams(["eat", "tea", "tan", "ate", "nat", "bat"]), 2222)



// 输入：nums = [100,4,200,1,3,2]
// 输出：4
// 解释：最长数字连续序列是 [1, 2, 3, 4]。它的长度为 4。
var longestConsecutive = function (nums) {
    let set = new Set(nums);
    let max = 0;
    for (let i = 0; i < nums.length; i++) {
        let cur = nums[i];
        console.log(cur, 'rr')
        console.log(set, cur, set.has(cur), '22')
        if (!set.has(cur - 1)) {
            let count = 1
            while (set.has(cur + 1)) {
                console.log(22333)
                count++;
                cur++;
            }
            max = Math.max(max, count);
        }
    }
    return max
}

longestConsecutive([3, 4, 2, 0])


// LRU 缓存
class LRUCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.map = new Map();
    }

    get(key) {
        if (this.map.has(key)) {
            let value = this.map.get(key);
            this.map.delete(key);
            this.map.set(key, value);
            return value;
        } else {
            return -1;
        }
    }

    put(key, value) {
        if (this.map.has(key)) {
            this.map.delete(key);
        } else if (this.map.size >= this.capacity) {
            console.log(this.map.keys(),22224444)
            this.map.delete(this.map.keys().next().value);
        }
        this.map.set(key, value);
    }

}

// 测试下
let cache = new LRUCache(2);
cache.put(1, 1);
cache.put(2, 2);
console.log(cache.get(1), '1111');
cache.put(3, 3);
console.log(cache,'cache')
console.log(cache.get(2), '2222');
cache.put(4, 4);
console.log(cache.get(1), '3333');
console.log(cache.get(3), '4444');
console.log(cache.get(4), '5555');




const map =new Map([
    ['name','张三'],
    ['age',18],
    ['sex','男'],
    ['obj_1','天空'],
    ['obj_2','大海']
]);


console.log(map.keys().next().value, 'keys1')
// 如何获取到obj_2的
console.log(map.keys().next().value, 'keys2') // 打印的还是name
