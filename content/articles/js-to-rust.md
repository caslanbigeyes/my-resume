---
title: "用 JavaScript 的视角学习 Rust 编程"
excerpt: "从 JavaScript 开发者的角度深入学习 Rust 编程语言，通过对比和实例帮助前端开发者快速掌握 Rust 的核心概念。"
publishedAt: "2024-10-10"
author: "hero"
category: "backend"
tags: ["rust", "javascript", "programming"]
featured: true
published: true
image: "/images/articles/js-to-rust.jpg"
seoTitle: "JavaScript 开发者学习 Rust 编程完全指南"
seoDescription: "从 JavaScript 视角学习 Rust，掌握类型系统、生命周期、所有权等核心概念"
seoKeywords: ["Rust", "JavaScript", "编程语言", "类型系统", "生命周期"]
---

# 用 JavaScript 的视角学习 Rust 编程

## 前言

Rust 是近年来备受关注的系统编程语言，其核心特点包括：

### Rust 的三大特性

- **高性能** - Rust 速度惊人且内存利用率极高。由于没有运行时和垃圾回收，它能够胜任对性能要求特别高的服务，可以在嵌入式设备上运行，还能轻松和其他语言集成。
- **可靠性** - Rust 丰富的类型系统和所有权模型保证了内存安全和线程安全，让您在编译期就能够消除各种各样的错误。
- **生产力** - Rust 拥有出色的文档、友好的编译器和清晰的错误提示信息，还集成了一流的工具——包管理器和构建工具，智能地自动补全和类型检验的多编辑器支持，以及自动格式化代码等等。

### 为什么前端开发者要学习 Rust？

随着前端基建在不断 Rust 化（如 SWC、Turbopack 等工具），以及 Rust 在编译成 WebAssembly 后在浏览器端的广泛应用，现阶段前端开发人员掌握 Rust 知识变得越来越有价值。

本文将基于 JavaScript 知识进行 Rust 对比学习，帮助前端开发者快速上手 Rust。

## 类型系统对比

### 基本类型对比

JavaScript 是一种弱类型的解释型语言，而 Rust 是强类型的编译型语言，在类型系统上更接近于 TypeScript。

#### JavaScript vs Rust 基本类型

| JavaScript | Rust | 说明 |
|------------|------|------|
| `number` | `i32`, `f64`, `u32` 等 | Rust 有多种数字类型 |
| `string` | `String`, `&str` | Rust 区分拥有所有权的字符串和字符串切片 |
| `boolean` | `bool` | 基本相同 |
| `undefined`/`null` | `Option<T>` | Rust 用 Option 处理可能为空的值 |

#### Rust 数字类型详解

Rust 的数字类型根据位数、符号位、浮点数分为：
- **整数类型**: `i8`, `u8`, `i16`, `u16`, `i32`, `u32`, `i64`, `u64`, `i128`, `u128`, `isize`, `usize`
- **浮点类型**: `f32`, `f64`
- **其他**: `char`（单个字符）, `bool`（布尔值）

#### 复合类型

Rust 还包含元组、数组等原始复合类型：
- **元组**: 类似 TypeScript 中的元组概念
- **数组**: 与 JavaScript 的 Array 不同，Rust 中的数组长度固定且类型统一

### 结构体定义对比

#### TypeScript 方式
```typescript
type Person = {
  firstName: string;
  lastName: string;
};

const person: Person = {
  firstName: "John",
  lastName: "Doe",
};
```

#### Rust 方式
```rust
struct Person {
    first_name: String,
    last_name: String,
}

let mut person = Person {
    first_name: String::from("John"),
    last_name: String::from("Doe"),
};
```

## 泛型系统

### 函数泛型对比

#### TypeScript 泛型函数
```typescript
function largest<T>(list: T[]): T {
  let largest = list[0];
  for (let item of list) {
    if (item > largest) {
      largest = item;
    }
  }
  return largest;
}

console.log(largest([1, 2, 3, 4, 5])); // 5
console.log(largest(["a", "b", "c"])); // "c"
```

#### Rust 泛型函数
```rust
fn largest<T: PartialOrd>(list: &[T]) -> &T {
    let mut largest = &list[0];
    for item in list {
        if item > largest {
            largest = item;
        }
    }
    largest
}

fn main() {
    let numbers = vec![34, 50, 25, 100, 65];
    let result = largest(&numbers);
    println!("The largest number is {}", result);
}
```

### 结构体泛型

#### TypeScript
```typescript
type Point<T> = {
  x: T;
  y: T;
};

const intPoint: Point<number> = { x: 5, y: 10 };
const floatPoint: Point<number> = { x: 1.0, y: 4.0 };
```

#### Rust
```rust
struct Point<T> {
    x: T,
    y: T,
}

impl<T> Point<T> {
    fn x(&self) -> &T {
        &self.x
    }
}

fn main() {
    let integer = Point { x: 5, y: 10 };
    let float = Point { x: 1.0, y: 4.0 };
}
```

## Traits（特质）系统

Traits 类似于其他语言中的接口（interface），定义了某些类型支持的行为的共同功能。

### 定义和实现 Trait

```rust
// 定义一个 trait
pub trait Summary {
    fn summarize(&self) -> String;
}

// 为结构体实现 trait
struct NewsArticle {
    headline: String,
    location: String,
    author: String,
    content: String,
}

impl Summary for NewsArticle {
    fn summarize(&self) -> String {
        format!("{}, by {} ({})", self.headline, self.author, self.location)
    }
}
```

### 与 TypeScript Interface 对比

#### TypeScript Interface
```typescript
interface Drawable {
  draw(): void;
}

class Circle implements Drawable {
  draw() {
    console.log("Drawing a circle");
  }
}
```

#### Rust Trait
```rust
trait Drawable {
    fn draw(&self);
}

struct Circle;

impl Drawable for Circle {
    fn draw(&self) {
        println!("Drawing a circle");
    }
}
```

## 所有权系统

这是 Rust 最独特的特性，JavaScript 开发者需要重点理解。

### 所有权规则

1. Rust 中的每一个值都有一个被称为其所有者（owner）的变量
2. 值在任一时刻有且只有一个所有者
3. 当所有者（变量）离开作用域，这个值将被丢弃

### 与 JavaScript 的对比

#### JavaScript（引用传递）
```javascript
function takeOwnership(obj) {
  obj.name = "Modified";
  return obj;
}

let myObj = { name: "Original" };
let newObj = takeOwnership(myObj);
console.log(myObj.name); // "Modified" - 原对象被修改
```

#### Rust（所有权转移）
```rust
fn take_ownership(s: String) -> String {
    println!("{}", s);
    s // 返回所有权
}

fn main() {
    let s1 = String::from("hello");
    let s2 = take_ownership(s1); // s1 的所有权转移给函数
    // println!("{}", s1); // 错误！s1 不再有效
    println!("{}", s2); // 正确，s2 拥有所有权
}
```

### 借用（Borrowing）

```rust
fn calculate_length(s: &String) -> usize { // s 是对 String 的引用
    s.len()
} // 这里，s 离开了作用域。但因为它并不拥有引用值的所有权，所以什么也不会发生

fn main() {
    let s1 = String::from("hello");
    let len = calculate_length(&s1); // 传递引用，不转移所有权
    println!("The length of '{}' is {}.", s1, len); // s1 仍然有效
}
```

## 生命周期

生命周期是 Rust 独有的概念，确保引用在需要的时间内有效。

### 生命周期注解

```rust
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() {
        x
    } else {
        y
    }
}

fn main() {
    let string1 = String::from("abcd");
    let string2 = "xyz";
    
    let result = longest(string1.as_str(), string2);
    println!("The longest string is {}", result);
}
```

### 结构体中的生命周期

```rust
struct ImportantExcerpt<'a> {
    part: &'a str,
}

fn main() {
    let novel = String::from("Call me Ishmael. Some years ago...");
    let first_sentence = novel.split('.').next().expect("Could not find a '.'");
    let i = ImportantExcerpt {
        part: first_sentence,
    };
}
```

## 错误处理

### JavaScript vs Rust 错误处理

#### JavaScript（try-catch）
```javascript
async function fetchData() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}
```

#### Rust（Result 类型）
```rust
use std::fs::File;
use std::io::ErrorKind;

fn open_file() -> Result<File, std::io::Error> {
    match File::open("hello.txt") {
        Ok(file) => Ok(file),
        Err(error) => match error.kind() {
            ErrorKind::NotFound => {
                println!("File not found!");
                Err(error)
            }
            other_error => Err(error),
        },
    }
}
```

## 模块系统

### JavaScript vs Rust 模块

#### JavaScript ES6 模块
```javascript
// math.js
export function add(a, b) {
  return a + b;
}

export default function multiply(a, b) {
  return a * b;
}

// main.js
import multiply, { add } from './math.js';
```

#### Rust 模块
```rust
// lib.rs 或 main.rs
mod math {
    pub fn add(a: i32, b: i32) -> i32 {
        a + b
    }
    
    pub fn multiply(a: i32, b: i32) -> i32 {
        a * b
    }
}

use math::{add, multiply};

fn main() {
    println!("2 + 3 = {}", add(2, 3));
    println!("2 * 3 = {}", multiply(2, 3));
}
```

## 包管理和工具链

### JavaScript vs Rust 工具链对比

#### JavaScript 生态
```bash
# 包管理
npm install lodash
yarn add lodash
pnpm add lodash

# 运行和构建
npm run dev
npm run build
npm test

# 项目初始化
npm init
npx create-react-app my-app
```

#### Rust 生态
```bash
# 包管理
cargo add serde
cargo remove serde

# 运行和构建
cargo run
cargo build --release
cargo test

# 项目初始化
cargo new my-project
cargo init
```

### 依赖管理对比

#### package.json (JavaScript)
```json
{
  "name": "my-app",
  "version": "1.0.0",
  "dependencies": {
    "lodash": "^4.17.21",
    "axios": "^1.0.0"
  },
  "devDependencies": {
    "typescript": "^4.9.0",
    "@types/node": "^18.0.0"
  }
}
```

#### Cargo.toml (Rust)
```toml
[package]
name = "my-app"
version = "0.1.0"
edition = "2021"

[dependencies]
serde = { version = "1.0", features = ["derive"] }
tokio = { version = "1.0", features = ["full"] }

[dev-dependencies]
criterion = "0.4"
```

## 异步编程对比

### JavaScript Promise/async-await
```javascript
async function fetchUserData(userId) {
  try {
    const response = await fetch(`/api/users/${userId}`);
    const userData = await response.json();
    return userData;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw error;
  }
}

// 并发执行
const [user1, user2] = await Promise.all([
  fetchUserData(1),
  fetchUserData(2)
]);
```

### Rust async/await
```rust
use tokio;
use reqwest;

async fn fetch_user_data(user_id: u32) -> Result<User, reqwest::Error> {
    let url = format!("https://api.example.com/users/{}", user_id);
    let response = reqwest::get(&url).await?;
    let user: User = response.json().await?;
    Ok(user)
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // 并发执行
    let (user1, user2) = tokio::try_join!(
        fetch_user_data(1),
        fetch_user_data(2)
    )?;

    println!("User 1: {:?}", user1);
    println!("User 2: {:?}", user2);
    Ok(())
}
```

## 总结

从 JavaScript 到 Rust 的学习路径：

1. **类型系统**: 从动态类型到静态强类型
2. **内存管理**: 从垃圾回收到所有权系统
3. **错误处理**: 从异常到 Result 类型
4. **并发**: 从单线程事件循环到多线程安全
5. **工具链**: 从 npm/yarn 到 Cargo
6. **异步编程**: 从 Promise 到 Future

### 学习建议

1. **循序渐进**: 先掌握基本语法和类型系统
2. **实践为主**: 通过小项目练习所有权和借用
3. **对比学习**: 将 Rust 概念与 JavaScript 对应概念关联
4. **工具熟悉**: 熟练使用 Cargo 和 Rust 开发工具
5. **社区参与**: 积极参与 Rust 社区，阅读优秀的开源项目

Rust 虽然学习曲线陡峭，但其提供的内存安全、性能优势和现代化的工具链，使其成为系统编程和高性能应用的理想选择。对于前端开发者来说，掌握 Rust 不仅能够拓展技术栈，还能更好地理解和使用基于 Rust 构建的前端工具。

## 推荐学习资源

- [Rust 官方教程](https://doc.rust-lang.org/book/)
- [Rust by Example](https://doc.rust-lang.org/rust-by-example/)
- [Rustlings 练习](https://github.com/rust-lang/rustlings)
- [Rust 语言圣经](https://course.rs/)
