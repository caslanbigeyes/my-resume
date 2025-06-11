1. 自我介绍，重点突出近期的项目经验和技术亮点
2. 聊聊你在最近一个项目中遇到的最复杂的技术挑战是什么？如何解决的？
3. 深拷贝和浅拷贝区别是什么？ 如何实现一个深拷贝，考虑哪些边界情况？
    区别：浅拷贝只复制对象的第一层属性，深拷贝复制对象的所有层属性
    实现：递归拷贝，考虑数组、对象、循环引用、Symbol、函数、Date等类型

```js
function deepClone(obj, map = new WeakMap()) {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  if (map.has(obj)) {
    return map.get(obj);
  }
  let cloneObj = Array.isArray(obj) ? [] : {};
  map.set(obj, cloneObj);
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloneObj[key] = deepClone(obj[key], map);
    }
  }
  return cloneObj;
}
```

4. useEffect 的依赖项数组是如何工作的?如果依赖项是对象或数组，会有什么问题?如何解决?
    useEffect 的依赖项数组是 useEffect 的第二个参数，它是一个数组，数组中的每一项都是 useEffect 依赖的变量。当依赖的变量发生变化时，useEffect 会重新执行。
    如果依赖项是对象或数组，会有什么问题?如何解决?
    问题：对象或数组是引用类型，每次渲染时都会创建一个新的对象或数组，导致 useEffect 一直在执行。解决：可以使用 useMemo 或 useCallback 来缓存对象或数组，避免每次渲染都创建新的对象或数组。

5. 浏览器事件循环机制解释一下，宏任务和微任务的执行顺序是怎样的?
    浏览器事件循环机制是浏览器实现异步编程的一种机制，它包括宏任务和微任务两种类型的任务。
    宏任务包括：setTimeout、setInterval、I/O、UI渲染等。
    微任务包括：Promise.then、MutationObserver等。
    浏览器事件循环机制是先执行一个宏任务，然后执行所有的微任务，然后再执行下一个宏任务，如此循环。

6. 浏览器事件循环机制解释一下，宏任务和微任务的执行顺序是怎样的?

从输入URL到页面展示，中间发生了什么?(尽量详细，包括DNS、TCP、HTTP、渲染等)
1. DNS解析：浏览器会先通过DNS解析将URL中的域名解析为IP地址。
2. TCP连接：浏览器会与服务器建立TCP连接，进行三次握手。
3. HTTP请求：浏览器会向服务器发送HTTP请求，请求服务器返回网页内容。
4. 服务器响应：服务器接收到请求后，会返回HTTP响应，包括网页内容、状态码、响应头等。
5. 渲染：浏览器接收到服务器返回的网页内容后，会进行渲染，将网页内容展示在页面上。

7. React Fiber架构了解多少?它解决了什么问题?
    React Fiber架构是React 16引入的一种新的架构，它解决了React在处理复杂组件树时性能问题。
    React Fiber架构通过将组件树分为多个小单元，然后通过调度器来控制这些小单元的执行顺序，从而实现组件树的异步渲染。
    React Fiber架构解决了React在处理复杂组件树时性能问题，同时也可以实现组件的暂停、中止和恢复等功能。

8. 虚拟DOM (Virtual DOM)的工作原理是什么?Diff算法的复杂度?Key的作用是什么?
虚拟DOM (Virtual DOM) 是一种用于描述DOM树的数据结构，它通过JavaScript对象来表示DOM树的结构和属性。
虚拟DOM的工作原理是：当组件的状态发生变化时，React会重新构建虚拟DOM树，然后通过Diff算法比较新旧虚拟DOM树的差异，最后将差异应用到实际的DOM树上，从而实现页面的更新。
Diff算法的复杂度是O(n^3)，其中n是DOM树的节点数。React通过一些优化手段，将Diff算法的复杂度降低到O(n)。Key的作用是帮助React识别哪些节点发生了变化，从而减少不必要的DOM操作，提高性能。

9. Webpack的构建流程是怎样的?如何优化Webpack的构建速度和产物大小?
    Webpack的构建流程主要包括以下几个步骤：
    1. 读取Webpack配置文件
    2. 从入口文件开始，递归地解析模块依赖关系
    3. 将模块进行编译，生成AST抽象语法树
    4. 将AST抽象语法树进行优化，生成新的AST抽象语法树
    5. 将新的AST抽象语法树进行代码生成，生成可执行的代码
    6. 将生成的代码进行压缩、混淆等处理
    7. 将处理后的代码输出到指定的目录
    优化Webpack的构建速度和产物大小可以从以下几个方面入手：
    1. 使用缓存，避免重复构建
    2. 使用多线程，提高构建速度
    3. 使用Tree Shaking，删除未使用的代码
    4. 使用代码分割，减少产物大小
    5. 使用压缩、混淆等处理，减少产物大小


10. Tree Shaking的原理是什么?需要满足什么条件?
Tree Shaking的原理是通过静态分析代码，识别出未使用的代码，并将其从最终的产物中删除，从而减少产物的大小。
Tree Shaking需要满足以下条件：
1. 使用ES6模块语法，即使用export和import关键字
2. 代码需要被压缩，即使用UglifyJS等工具进行压缩
3. 代码需要被打包，即使用Webpack等工具进行打包

11. HTTPS的握手过程是怎样的?对称加密和非对称加密在其中是如何应用的?
HTTPS的握手过程主要包括以下几个步骤：
1. 客户端发送一个请求，请求服务器的证书
2. 服务器发送证书，包括公钥和证书信息
3. 客户端验证证书，如果证书有效，则生成一个随机数，使用服务器的公钥进行加密，然后发送给服务器
4. 服务器使用私钥解密随机数，然后生成一个会话密钥，使用随机数进行加密，然后发送给客户端
5. 客户端使用会话密钥解密服务器发送的数据，然后使用会话密钥加密自己的数据，然后发送给服务器
6. 服务器使用会话密钥解密客户端发送的数据，然后使用会话密钥加密自己的数据，然后发送给客户端

12. 什么是跨域?有哪些解决方案?CORS的原理是什么?
跨域是指浏览器出于安全考虑，限制从一个域加载的脚本如何与另一个域的内容进行交互。跨域的解决方案包括：
1. JSONP：通过动态创建script标签，利用script标签的src属性不受同源策略的限制，向服务器发送请求，服务器返回一个函数调用，客户端执行该函数。
2. CORS：通过设置服务器端的Access-Control-Allow-Origin响应头，允许特定的域进行跨域请求。
3. 代理：通过设置一个代理服务器，将请求转发到目标服务器，从而绕过同源策略的限制。

13. 手写题:实现一个发布订阅模式(Event Emitter)。
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
```
// 测试
const emitter = new EventEmitter();

const listener1 = (data) => {
  console.log('listener1', data);
};

const listener2 = (data) => {
  console.log('listener2', data);
};

emitter.on('event1', listener1);
emitter.on('event1', listener2);

emitter.emit('event1', 'data');

emitter.off('event1', listener1);

emitter.emit('event1', 'data');
```     

14. 手写题:实现一个发布订阅模式(Event Emitter)。

前端安全问题有哪些?XSS和CSRF的区别及防范措施?
前端安全问题主要包括XSS（跨站脚本攻击）和CSRF（跨站请求伪造）。
XSS攻击是指攻击者通过在网页中插入恶意脚本，从而在用户浏览网页时执行恶意脚本，窃取用户信息或破坏网页。
CSRF攻击是指攻击者通过诱导用户点击恶意链接或访问恶意网站，从而在用户不知情的情况下，以用户的身份发送请求，从而窃取用户信息或破坏网页。
防范措施：
1. XSS攻击：对用户输入的数据进行转义，避免恶意脚本的执行。
2. CSRF攻击：在请求中添加一个随机的token，服务器验证token的合法性，避免CSRF攻击。
