
// function promiseAll(promises) {
//   return new Promise((resolve, reject) => {
//     let count = 0;
//     let res = [];
//     for (let i = 0; i < promises.length; i++) {
//       Promise.resolve(promises[i]).then((data) => {
//         count++;
//         res[i] = data;
//         if (count === promises.length) {
//           resolve(res);
//         }
//       }).catch(err => { })
//     }
//   })
// }

// function promiseRace(promises) {
//   return new Promise((resolve, reject) => {
//     for (let i = 0; i < promises.length; i++) {
//       Promise.resolve(promises[i]).then((data) => {
//         resolve(data)
//       }).catch(err => {
//         reject(err)
//       })
//     }
//   })
// }

// const p1 = new Promise((resolve, reject) => {
//   setTimeout(() => {
//     resolve(1);
//   }, 4000);
// });

// const p3 = new Promise((resolve, reject) => {
//   setTimeout(() => {
//     reject(3);
//   }, 3000);
// });


// const p2 = new Promise((resolve, reject) => {
//   setTimeout(() => {
//     resolve(2);
//   }, 3000);
// });

// promiseRace([p1, p2, p3]).then((res) => {
//   console.log(res);
// });



// function mydeepClone(obj) {
//   // 判断是基本类型
//   if (typeof obj !== 'object' || obj === null) {
//     return obj
//   }
//   // 判断是数组
//   if (Array.isArray(obj)) {
//     let arr = [];
//     for (let i = 0; i < obj.length; i++) {
//       arr[i] = mydeepClone(obj[i]);
//     }
//     return arr;
//   }

//   // 判断是对象
//   let newObj = {};
//   for (let key in obj) {
//     newObj[key] = mydeepClone(obj[key]);
//   }
//   return newObj;
// }

// console.log(mydeepClone({ a: 1, b: { c: 2 } })); 



// 给你一个整数数组 nums ，判断是否存在三元组 [nums[i], nums[j], nums[k]] 满足 i != j、i != k 且 j != k ，同时还满足 nums[i] + nums[j] + nums[k] == 0 。请你返回所有和为 0 且不重复的三元组。


// 暴力解法 答案中不可以包含重复的三元组。

var threeSum = function (nums) {
  let arr = [];
  for (let i = 0; i < nums.length - 1; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      for (let z = j + 1; z < nums.length; z++) {
        if (nums[i] + nums[j] + nums[z] === 0) {
          let trimArr = [nums[i], nums[j], nums[z]].sort((a, b) => a - b);
          arr.push(trimArr)
        }
      }
    }
  }

  const seen = new Set();
  const result = [];

  for (let i of arr) {
    console.log(i, 'i', i.join(','))
    let key = i.join(',')
    if (!seen.has(key)) {
      seen.add(key);
      result.push(i);
    }
  }
  return result
};
console.log(threeSum([0, 1, 1]), '222222')

var threeSums = (nums) => {
  let res = [];
  let has = {};
  for (let i = 0; i < nums.length - 2; i++) {
    for (let j = i + 1; j < nums.length - 1; j++) {
      if (has[nums[i]] !== undefined) {
        res.push([nums[j]].concat(has[nums[j]]))
        has[nums[j]] = undefined;
      } else {
        has[nums[j]] = [nums[i], nums[j]];
      }
    }
  }

  return res;

}

console.log(threeSums([0, 1, 1]), '222222')