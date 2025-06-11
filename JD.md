// 京东面试
1. 实现垂直居中的方法 
 - 1. flex 布局 vertical-align: middle;
 - 2. position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
 - 3. position: absolute; top: 0; left: 0; bottom: 0; right: 0; margin: auto;

2. 如何理解事件循环
 - 事件循环是js执行机制的核心，js是单线程的，但是浏览器提供了异步编程的能力，通过事件循环机制实现异步编程。
 - 事件循环分为宏任务和微任务，宏任务包括script、setTimeout、setInterval、setImmediate、I/O、UI渲染等，微任务包括Promise、process.nextTick、MutationObserver等。
 - 事件循环的执行过程是先执行宏任务，然后执行微任务，再执行下一个宏任务，如此循环。

3. 手写Promise.all
```js
function promiseAll(promises) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(promises)) {
      return reject(new TypeError('arguments must be an array'));
    }
    const len = promises.length;
    let count = 0;
    let values = [];
    for (let i = 0; i < len; i++) {
      Promise.resolve(promises[i]).then((res) => {
        values[i] = res;
        count++;
        if (count === len) {
          resolve(values);
        }
      }).catch((err) => {});
    }
  });
}
```
  - 3.1  测试下promise.all
```js
const p1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(1);
  }, 1000);
});
const p2 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(2);
  }, 2000);
});
const p3 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(3);
  }, 3000);
});
promiseAll([p1, p2, p3]).then((res) => {
  console.log(res); // [1, 2, 3]
});

``` 

4. 手写Promise.race
```js
function promiseRace(promises) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(promises)) {
      return reject(new TypeError('arguments must be an array'));
    }
    const len = promises.length;
    for (let i = 0; i < len; i++) {
      Promise.resolve(promises[i]).then((res) => {
        resolve(res);
      }).catch((err) => {
        reject(err);
      });
    }
  });
}
```

const p1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(1);
  }, 1000);
});
const p2 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(2);
  }, 2000);
});
const p3 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(3);
  }, 3000);
});
promiseRace([p1, p2, p3]).then((res) => {
  console.log(res); // 1
    })  ;
```

5. 解释CSS盒模型及box-sizing的作用
CSS盒模型分为标准盒模型和IE盒模型，标准盒模型中width和height只包含content，IE盒模型中width和height包含content、padding、border。
box-sizing属性可以改变盒模型的计算方式，默认值为content-box，即标准盒模型，设置为border-box时，width和height包含content、padding、border。

6. 解释BFC
BFC（Block Formatting Context）是CSS布局的一个概念，它是一个独立的渲染区域，内部元素的布局不会影响到外部元素。
BFC的触发条件包括：
1. float的值不为none
2. overflow的值不为visible、clip、hidden
3. display的值为table、table-cell、table-caption、inline-block、flex、inline-flex
4. position的值为absolute、fixed

7. 如何优化首屏加载速度
1. 压缩图片和代码，减少文件大小
2. 使用CDN加速，将静态资源放在不同的服务器上，提高访问速度
3. 使用懒加载，将图片、视频等资源延迟加载，提高首屏加载速度
4. 使用缓存，将静态资源缓存到本地，减少重复请求
5. 使用HTTP/2，提高页面加载速度


8. 如何实现一个简单的路由
1. 使用hash模式，通过监听hashchange事件，根据hash值来切换页面
2. 使用history模式，通过监听popstate事件，根据state值来切换页面
3. 使用第三方库，如react-router、vue-router等，它们提供了更丰富的功能和更好的兼容性

9.如何实现一个拷贝函数
1. 使用递归，将对象或数组中的每一项都拷贝一份，包括嵌套的对象或数组
2. 使用JSON.stringify和JSON.parse，将对象或数组转换为字符串，然后再解析为新的对象或数组
3. 使用第三方库，如lodash的cloneDeep函数，它们提供了更丰富的功能和更好的兼容性

9. vue和react diff算法的差异
vue和react的diff算法都是基于虚拟DOM的，它们的主要区别在于实现方式和优化策略。
1. vue的diff算法是基于双端比较的，它会同时从新旧虚拟DOM的两端开始比较，直到找到相同的节点为止，然后根据节点的类型和属性进行相应的更新。
2. react的diff算法是基于单端比较的，它会从旧虚拟DOM的头部开始比较，直到找到相同的节点为止，然后根据节点的类型和属性进行相应的更新。
3. vue的diff算法在处理列表时，会根据列表的key值来进行优化，而react的diff算法在处理列表时，会根据列表的索引来进行优化。
4. vue的diff算法在处理组件时，会根据组件的props和state来进行更新，而react的diff算法在处理组件时，会根据组件的props和state的变化来进行更新。

10. LRU算法
LRU（Least Recently Used）算法是一种常用的缓存淘汰策略，它的核心思想是淘汰最久未使用的数据。
LRU算法的实现可以使用哈希表和双向链表来实现，哈希表用于快速查找节点，双向链表用于维护节点的顺序。
当有新的数据需要加入缓存时，首先判断缓存是否已满，如果已满，则删除最久未使用的数据，然后将新的数据插入到链表的头部。当有数据被访问时，将数据移动到链表的头部，表示最近被使用。


11. Webpack的tree shaking原理 
Webpack的tree shaking是一种优化手段，它可以在打包过程中删除未使用的代码，从而减小打包后的文件大小。
Webpack的tree shaking原理是基于ES6的模块化语法，它会在打包过程中分析代码的依赖关系，找出未使用的代码，然后将其删除。
Webpack的tree shaking需要在配置文件中开启，具体配置如下：
```js
module.exports = {
  optimization: {
    usedExports: true
  }
}
```
Webpack的tree shaking还可以结合babel-loader一起使用，具体配置如下：
```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: ['@babel/plugin-transform-runtime']
          }
        }
      }
    ]
  },
  optimization: {
    usedExports: true
  }
}
```
Webpack的tree shaking还可以结合sideEffects属性一起使用，具体配置如下：
```js
module.exports = {
  optimization: {
    usedExports: true
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: ['@babel/plugin-transform-runtime']
          }
        }
      }
    ]
  },
  sideEffects: false
}
```
Webpack的tree shaking还可以结合externals属性一起使用，具体配置如下：
```js
module.exports = {
  optimization: {
    usedExports: true
  },
  externals: {
    lodash: '_'
  }
}
```

12. 如何实现react组件按需加载
React组件按需加载是指在需要的时候才加载组件，而不是一次性加载所有组件，这样可以提高页面加载速度。
React组件按需加载可以使用React.lazy和React.Suspense来实现，具体步骤如下：
1. 使用React.lazy函数来定义一个异步组件，具体代码如下：
```js
import React, { Suspense } from 'react';

const AsyncComponent = React.lazy(() => import('./AsyncComponent'));
```
2. 使用React.Suspense组件来包裹异步组件，具体代码如下：
```js
import React, { Suspense } from 'react';

function App() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <AsyncComponent />
      </Suspense>
    </div>
  );
}
```
3. 在需要使用异步组件的地方，直接使用即可，具体代码如下：
```js
import React, { Suspense } from 'react';
import AsyncComponent from './AsyncComponent';

function App() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <AsyncComponent />
      </Suspense>
    </div>
  );
}
```
4. 如果需要在服务端渲染时使用异步组件，可以使用loadable-components库来实现，具体代码如下：
```js
import loadable from '@loadable/component';

const AsyncComponent = loadable(() => import('./AsyncComponent'));

function App() {
  return (
    <div>
      <AsyncComponent />
    </div>
  );
}
```

13. 微前端框架qiankun的实现原理
qiankun是一个微前端框架，它可以将多个独立的应用合并为一个整体，提供统一的用户体验。
qiankun的实现原理主要包括以下几个方面：
1. 主应用（Master App）：主应用是整个微前端架构的核心，它负责管理子应用的生命周期，包括加载、卸载、更新等操作。
2. 子应用（Slave App）：子应用是独立的、可独立部署的应用，它可以在主应用中运行，也可以独立运行。
3. 微前端架构：微前端架构是一种将多个独立的应用合并为一个整体的技术，它可以将多个独立的应用合并为一个整体，提供统一的用户体验。
4. 微前端架构的实现原理主要包括以下几个方面：
   - 子应用注册：子应用需要向主应用注册，以便主应用能够加载和运行子应用。
   - 子应用加载：主应用在加载子应用时，会根据子应用的注册信息，动态加载子应用的代码。
   - 子应用运行：主应用在加载子应用后，会启动子应用的运行环境，包括创建子应用的DOM节点、绑定子应用的事件等。
   - 子应用卸载：当子应用不再需要时，主应用会卸载子应用，包括销毁子应用的DOM节点、解绑子应用的事件等。
   - 子应用更新：当子应用需要更新时，主应用会重新加载子应用的代码，并更新子应用的运行环境。
   - 子应用通信：子应用之间可以通过自定义事件、全局状态管理等方式进行通信。
   - 子应用隔离：子应用之间需要隔离，包括样式隔离、脚本隔离等，以防止子应用之间的相互干扰。
5. 微前端架构的优点：微前端架构可以将多个独立的应用合并为一个整体，提供统一的用户体验，同时也可以提高应用的扩展性和可维护性。

14. 实现一个异步任务调度器（支持并发控制）
实现一个异步任务调度器，可以使用Promise.all和Promise.race来实现并发控制，具体代码如下：
```js
class Scheduler {
  constructor(maxCount) {
    this.maxCount = maxCount;
    this.runningCount = 0;
    this.waitingList = [];
  }

  add(task) {
    return new Promise((resolve, reject) => {
      this.waitingList.push({ task, resolve, reject });
      this.run();
    });
  }

  run() {
    while (this.runningCount < this.maxCount && this.waitingList.length > 0) {
      const { task, resolve, reject } = this.waitingList.shift();
      this.runningCount++;
      task()
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          reject(error);
        })
        .finally(() => {
          this.runningCount--;
          this.run();
        });
    }
  }
}

const scheduler = new Scheduler(2);

const task1 = () =>
  new Promise((resolve) => {
      setTimeout(() => {
        resolve(1);
      }, 1000);
    })
    .then((result) => {
      console.log(result);
    });

const task2 = () =>
  new Promise((resolve) => {
      setTimeout(() => {
        resolve(2);
      }, 2000);
    })
    .then((result) => {
      console.log(result);
    });

const task3 = () =>
  new Promise((resolve) => {
      setTimeout(() => {
        resolve(3);
      }, 3000);
    })
    .then((result) => {
      console.log(result);
    });

const task4 = () =>
  new Promise((resolve) => {
      setTimeout(() => {
        resolve(4);
      }, 4000);
    })
    .then((result) => {
      console.log(result);
    });

scheduler.add(task1);
scheduler.add(task2);
scheduler.add(task3);
scheduler.add(task4);
```

15. 大文件上传的实现方案
大文件上传的实现方案主要包括以下几个方面：
1. 分片上传：将大文件分成多个小文件，然后逐个上传，最后将所有小文件合并为一个完整的大文件。具体步骤如下：
   - 将大文件分成多个小文件，可以使用Blob.slice方法来实现，具体代码如下：
   ```js
   const file = e.target.files[0];
   const chunkSize = 1024 * 1024; // 每个分片的大小为1MB
   const chunks = Math.ceil(file.size / chunkSize); // 计算分片数量
   const fileChunks = [];
   for (let i = 0; i < chunks; i++) {
     const start = i * chunkSize;
     const end = Math.min(start + chunkSize, file.size);
     const chunk = file.slice(start, end);
     fileChunks.push(chunk);
   }
   ```
   - 逐个上传小文件，可以使用FormData和XMLHttpRequest来实现，具体代码如下：
   ```js
   const formData = new FormData();
   formData.append('file', fileChunks[0]);
   const xhr = new XMLHttpRequest();
   xhr.open('POST', '/upload', true);
   xhr.send(formData);
   ```
   - 上传完成后，将所有小文件合并为一个完整的大文件，可以使用Blob.concat方法来实现，具体代码如下：
   ```js
   const fileChunks = [fileChunk1, fileChunk2, fileChunk3];
   const fileBlob = new Blob(fileChunks, { type: 'application/octet-stream' });
   const file = new File([fileBlob], 'filename', { type: 'application/octet-stream' });
   ```
2. 断点续传：在文件上传过程中，如果网络中断或者上传失败，可以使用断点续传的方式继续上传。具体步骤如下：
   - 在上传文件时，记录每个分片的上传进度，如果上传失败，可以从上次上传的位置继续上传，具体代码如下：
   ```js
   const xhr = new XMLHttpRequest();
   xhr.open('POST', '/upload', true);
   xhr.setRequestHeader('Range', `bytes=${start}-${end}`);
   xhr.send(formData);
   ```
   - 在服务器端，根据请求头中的Range字段，判断是否需要从上次上传的位置继续上传，具体代码如下：
   ```js
   const range = req.headers.range;
   if (range) {
     const start = range.replace(/bytes=/, '').split('-')[0];
     const end = range.replace(/bytes=/, '').split('-')[1];
     const file = fs.createReadStream(filePath, { start, end });
     res.writeHead(206, { 'Content-Range': `bytes ${start}-${end}/${fileSize}` });
     file.pipe(res);
     return;

   }
   - 在客户端，根据服务器端的响应，判断是否需要从上次上传的位置继续上传，具体代码如下：
   ```js
   if (xhr.status === 206) {
     const range = xhr.getResponseHeader('Content-Range');
     const start = range.replace(/bytes=/, '').split('-')[0];
     const end = range.replace(/bytes=/, '').split('-')[1];
     const fileChunk = fileChunks.shift();
     const formData = new FormData();
     formData.append('file', fileChunk);
     xhr.open('POST', '/upload', true);
     xhr.setRequestHeader('Range', `bytes=${start}-${end}`);
     xhr.send(formData);
   }
   ```
3. 进度条显示：在文件上传过程中，需要实时显示上传进度，可以使用HTML5的FileReader和ProgressEvent来实现，具体代码如下：
   ```js
   const xhr = new XMLHttpRequest();
   xhr.open('POST', '/upload', true);
   xhr.upload.addEventListener('progress', (event) => {
     const progress = event.loaded / event.total;
     console.log(progress);
   });
   xhr.send(formData);
   ```
4. 服务器端实现：在服务器端，需要实现文件的合并和断点续传功能，可以使用Node.js的fs模块来实现，具体代码如下：
   ```js
   const fs = require('fs');
   const path = require('path');

   const filePath = path.join(__dirname, 'filename');
   const fileSize = fs.statSync(filePath).size;
   const chunkSize = 1024 * 1024; // 每个分片的大小为1MB
   const chunks = Math.ceil(fileSize / chunkSize); // 计算分片数量

   const req = http.request({
     hostname: 'localhost',
     port: 3000,
     path: '/upload',
     method: 'POST',
     headers: {
       'Content-Type': 'application/octet-stream',
       'Content-Length': fileSize,
     },
   });

   const file = fs.createReadStream(filePath);
   file.pipe(req);
   ```

16. 手写发布-订阅模式
发布-订阅模式是一种设计模式，它允许对象之间进行松耦合的通信。在发布-订阅模式中，发布者不会直接与订阅者进行通信，而是通过一个中间的调度中心来进行通信。具体实现如下：

```js
class EventEmitter {
  constructor() {
    this.events = {};
  }

  on(event, listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
  }

  emit(event, ...args) {
    if (this.events[event]) {
      this.events[event].forEach((listener) => {
        listener(...args);
      });
    }
  }

  off(event, listener) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter((l) => l !== listener);
    }
  }
}

const emitter = new EventEmitter();

emitter.on('event1', (data) => {
  console.log('event1', data);
  emitter.emit('event2', data);
});

emitter.on('event2', (data) => {
  console.log('event2', data);  
  emitter.emit('event3', data);
});

emitter.on('event3', (data) => {
  console.log('event3', data);
  emitter.emit('event4', data);
});

emitter.emit('event1', 'data');
```

17. Webpack热更新（HMR）原理
Webpack热更新（HMR）是一种在开发过程中实时更新代码的技术，它可以在不刷新页面的情况下，将新的代码替换旧的代码。具体实现如下：

```js
// webpack.config.js
module.exports = {
  // ...
  devServer: {
    hot: true,
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
  ],
};

// main.js
if (module.hot) {
  module.hot.accept('./App', () => {
    // 更新App模块
  });
}
```

