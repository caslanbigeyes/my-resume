
function promiseAll(promises) {
  return new Promise((resolve, reject) => {
    let count = 0;
    let res = [];
    for (let i = 0; i < promises.length; i++) {
      Promise.resolve(promises[i]).then((data) => {
        count++;
        res[i] = data;
        if (count === promises.length) {
          resolve(res);
        }
      }).catch(err => { })
    }
  })
}

function promiseRace(promises) {
  return new Promise((resolve, reject) => {
    for (let i = 0; i < promises.length; i++) {
      Promise.resolve(promises[i]).then((data) => {
        resolve(data)
      }).catch(err => {
        reject(err)
      })
    }
  })
}

const p1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(1);
  }, 4000);
});

const p3 = new Promise((resolve, reject) => {
  setTimeout(() => {
    reject(3);
  }, 3000);
});


const p2 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(2);
  }, 3000);
});

promiseRace([p1, p2, p3]).then((res) => {
  console.log(res);
});



function mydeepClone(obj) {
  // 判断是基本类型
  if (typeof obj !== 'object' || obj === null) {
    return obj
  }
  // 判断是数组
  if (Array.isArray(obj)) {
    let arr = [];
    for (let i = 0; i < obj.length; i++) {
      arr[i] = mydeepClone(obj[i]);
    }
    return arr;
  }

  // 判断是对象
  let newObj = {};
  for (let key in obj) {
    newObj[key] = mydeepClone(obj[key]);
  }
  return newObj;
}

console.log(mydeepClone({ a: 1, b: { c: 2 } })); 