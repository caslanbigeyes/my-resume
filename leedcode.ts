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
    if (nums.length === 0) return 0;

    // 使用Set去重
    const numSet = new Set(nums);
    let maxLength = 0;

    for (const num of numSet) {
        // 只从每个连续序列的最小值开始计算
        if (!numSet.has(num - 1)) {
            let currentNum = num;
            let currentLength = 1;

            // 计算当前连续序列的长度
            while (numSet.has(currentNum + 1)) {
                currentNum++;
                currentLength++;
            }

            maxLength = Math.max(maxLength, currentLength);
        }
    }

    return maxLength;
};

console.log(longestConsecutive([0, 3, 7, 2, 5, 8, 4, 6, 0, 1]), 'longestConsecutive')


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
            console.log(this.map.keys(), 22224444)
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
console.log(cache, 'cache')
console.log(cache.get(2), '2222');
cache.put(4, 4);
console.log(cache.get(1), '3333');
console.log(cache.get(3), '4444');
console.log(cache.get(4), '5555');




const map = new Map([
    ['name', '张三'],
    ['age', 18],
    ['sex', '男'],
    ['obj_1', '天空'],
    ['obj_2', '大海']
]);


console.log(map.keys().next().value, 'keys1')
// 如何获取到obj_2的
console.log(map.keys().next().value, 'keys2') // 打印的还是name


// 奇偶频次间的最大差值 II

// 输入：s = "1122211", k = 3

// 输出：1

// 输入：s = "12233", k = 4

// 输出：-1

var maxDistance = function (nums, k) {
    let max = 0;
    let min = Infinity;
    for (let i = 0; i < nums.length; i++) {
        if (nums[i] % 2 === 0) {
            max = Math.max(max, i);
            min = Math.min(min, i);
        }
    }
    return max - min < k ? -1 : max - min;
}

console.log(maxDistance('12233', 4), 'maxDistance')


// //  删除有序数组中的重复项
// 给你一个 非严格递增排列 的数组 nums ，请你 原地 删除重复出现的元素，使每个元素 只出现一次 ，返回删除后数组的新长度。元素的 相对顺序 应该保持 一致 。然后返回 nums 中唯一元素的个数。

// 考虑 nums 的唯一元素的数量为 k ，你需要做以下事情确保你的题解可以被通过：

// 更改数组 nums ，使 nums 的前 k 个元素包含唯一元素，并按照它们最初在 nums 中出现的顺序排列。nums 的其余元素与 nums 的大小不重要。
// 返回 k 。

// 删除 重复出现的元素，返回 新长度。
// 示例 1：
// 输入：nums = [1,1,2]
// 输出：2, nums = [1,2,_]
// 解释：函数应该返回新的长度 2 ，并且原数组 nums 的前两个元素被修改为 1, 2 。不需要考虑数组中超出新长度后面的元素。

// 示例 2：
// 输入：nums = [0,0,1,1,1,2,2,3,3,4]
// 输出：5, nums = [0,1,2,3,4]

// 解释：函数应该返回新的长度 5 ， 并且原数组 nums 的前五个元素被修改为 0, 1, 2, 3, 4 。不需要考虑数组中超出新长度后面的元素。




var removeDuplicates = function (nums) {
    let arr = []
    for (let i = 0; i < nums.length; i++) {
        if (arr.indexOf(nums[i]) !== -1) {
            nums.splice(i, 1)
            i--;
        } else {
            arr.push(nums[i])

        }
    }
    return arr.length
};

console.log(removeDuplicates([0, 0, 1, 1, 1, 2, 2, 3, 3, 4]), 'removeDuplicates')



// 3423. 循环数组中相邻元素的最大差值
// 输入：nums = [1,2,4]

// 输出：3

// 输入：nums = [-5,-10,-5]

// 输出：5

// 相邻元素 nums[0] 和 nums[1] 之间的绝对差值为最大值 |-5 - (-10)| = 5 。
var minSubArrayLen = function (nums) {
    let maxDistance = 0;
    for (let i = 0; i < nums.length; i++) {
        let difference = Math.abs(nums[(i + 1) % nums.length] - nums[i]);
        maxDistance = Math.max(maxDistance, difference);
    }
    return maxDistance;
}



console.log(minSubArrayLen([1, 2, 4]), 'minSubArrayLen')


// 2616. 最小化数对的最大差值
// 输入：nums = [10,1,2,7,1,3], p = 2
// 输出：1
// 解释：第一个下标对选择 1 和 4 ，第二个下标对选择 2 和 5 。
// 最大差值为 max(|nums[1] - nums[4]|, |nums[2] - nums[5]|) = max(0, 1) = 1 。所以我们返回 1 。
var minPairSum = function (nums, p) {
    nums.sort((a, b) => a - b);
    let max = 0;
    for (let i = 0; i < nums.length / 2; i++) {
        max = Math.max(max, nums[i] + nums[nums.length - 1 - i])
    }
    return max;
}
console.log(minPairSum([10, 1, 2, 7, 1, 3], 2), 'minPairSum')


// 1,1,2,3,7,10,


// 2016. 增量元素之间的最大差值
// 输入：nums = [7,1,5,4]
// 输出：4
var longestConsecutive = function (nums) {
    let max = -1;
    if (nums.length < 2) return -1;
    for (let i = 0; i < nums.length - 1; i++) {
        for (let j = i + 1; j < nums.length; j++) {
            let sub = nums[j] - nums[i];
            max = Math.max(max, sub);
        }
    }
    return max
}

// console.log(longestConsecutive([5, 2, 3, 4]), 22222)
// 预期结果 是-1


// 最长连续序列
var longestConsecutive = function (nums) {
    nums.sort((a, b) => a - b);
    let count = 0, max = 0;

    for (let i = 0; i < nums.length; i++) {
        if (i > 0 && nums[i] === nums[i - 1]) continue;
        if (i === 0 || nums[i] === nums[i - 1] + 1) {
            console.log(nums[i], 'i')
            count++;
        } else {
            max = Math.max(max, count);
            count = 1;
        }
    }

    max = Math.max(max, count);

    return max;
};
console.log(longestConsecutive([0, 3, 7, 2, 5, 8, 4, 6, 0, 1]), 'longestConsecutive')


// 283. 移动零
var moveZeroes = function (nums) {
    let slow = 0
    for (let fast = 0; fast < nums.length; fast++) {
        if (nums[fast] !== 0) {
            nums[slow] = nums[fast]
            slow++
        }
    }
    console.log(slow, '111')
    nums.fill(0, slow)
    return nums
};
console.log(moveZeroes([0, 1, 0, 3, 12]), 'moveZeroes')


// 输入：[1,8,6,2,5,4,8,3,7]
// 输出：49 
// 给定一个长度为 n 的整数数组 height 。有 n 条垂线，第 i 条线的两个端点是 (i, 0) 和 (i, height[i]) 。

// 找出其中的两条线，使得它们与 x 轴共同构成的容器可以容纳最多的水。

// 返回容器可以储存的最大水量。

var largestPerimeter = function (nums) {

}


// 3. 无重复字符的最长子串

// 输入: s = "abcabcbb"
// 输出: 3 
// 解释: 因为无重复字符的最长子串是 "abc"，所以其长度为 3。
var lengthOfLongestSubstring = function (s) {
    let arr = []; let max = 0;
    for (let i = 0; i < s.length; i++) {
        let index = arr.indexOf(s[i]);
        if (index !== -1) {
            arr.splice(0, index + 1);

        }
        arr.push(s[i])
        console.log(arr, 'arr')
        max = Math.max(max, arr.length)

    }
    return max;
}

console.log(lengthOfLongestSubstring('abcabcbb'), 3333333)