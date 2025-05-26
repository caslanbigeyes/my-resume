// 输入：target = 7, nums = [2,3,1,2,4,3]
// 输出：2
// 解释：子数组 [4,3] 是该条件下的长度最小的子数组。
/**
 * @param {number} target
 * @param {number[]} nums
 * @return {number}
 */
var minSubArrayLen = function(target, nums) {
    let sum = 0;
    let subL = 0;
    let i = 0;
    let result = Infinity;
    for(let j = 0; j<nums.length;j++){
        sum+=nums[j];
        while(sum>=target){
            subL = j - i +1;
            result = Math.min(result,subL);
            sum = sum - nums[i]
            i++
        }
    }
    return result === Infinity ? 0 : result; // 处理没有找到的情况
};

let target=7; let nums=[2,3,1,2,4,3]

console.log(minSubArrayLen(target,nums))