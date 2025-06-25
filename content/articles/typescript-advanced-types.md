---
title: "TypeScript 高级类型实战指南"
excerpt: "深入探索 TypeScript 的高级类型系统，包括条件类型、映射类型、模板字面量类型等，通过实际案例学习如何构建类型安全的应用。"
publishedAt: "2024-01-28"
author: "li-lingfeng"
category: "frontend"
tags: ["typescript", "javascript"]
featured: false
published: true
image: "/images/articles/typescript-advanced.jpg"
seoTitle: "TypeScript 高级类型实战指南 - 掌握类型编程"
seoDescription: "学习 TypeScript 高级类型系统，包括条件类型、映射类型、模板字面量类型等，提升代码质量和开发效率"
seoKeywords: ["TypeScript", "高级类型", "条件类型", "映射类型", "类型编程"]
---

# TypeScript 高级类型实战指南

TypeScript 的类型系统非常强大，掌握高级类型技巧可以让我们写出更安全、更优雅的代码。本文将深入探讨 TypeScript 的高级类型特性。

## 条件类型 (Conditional Types)

条件类型允许我们根据条件选择类型，语法类似于三元运算符。

### 基础语法

```typescript
type ConditionalType<T> = T extends string ? string : number;

type Test1 = ConditionalType<string>; // string
type Test2 = ConditionalType<number>; // number
```

### 实际应用：类型守卫

```typescript
type NonNullable<T> = T extends null | undefined ? never : T;

type Example1 = NonNullable<string | null>; // string
type Example2 = NonNullable<number | undefined>; // number
```

### 分布式条件类型

当条件类型作用于联合类型时，会分布到每个成员：

```typescript
type ToArray<T> = T extends any ? T[] : never;

type StrArrOrNumArr = ToArray<string | number>; // string[] | number[]
```

## 映射类型 (Mapped Types)

映射类型可以基于现有类型创建新类型。

### 内置映射类型

```typescript
// Partial - 所有属性变为可选
type Partial<T> = {
  [P in keyof T]?: T[P];
};

// Required - 所有属性变为必需
type Required<T> = {
  [P in keyof T]-?: T[P];
};

// Readonly - 所有属性变为只读
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};
```

### 自定义映射类型

```typescript
// 为所有属性添加前缀
type Prefixed<T, P extends string> = {
  [K in keyof T as `${P}${string & K}`]: T[K];
};

interface User {
  name: string;
  age: number;
}

type PrefixedUser = Prefixed<User, 'user_'>;
// { user_name: string; user_age: number; }
```

## 模板字面量类型 (Template Literal Types)

TypeScript 4.1 引入了模板字面量类型，允许我们在类型层面操作字符串。

### 基础用法

```typescript
type World = "world";
type Greeting = `hello ${World}`; // "hello world"
```

### 实际应用：事件系统

```typescript
type EventName<T extends string> = `on${Capitalize<T>}`;

type ButtonEvents = EventName<'click' | 'hover' | 'focus'>;
// 'onClick' | 'onHover' | 'onFocus'

// 事件处理器类型
type EventHandlers<T extends Record<string, any>> = {
  [K in keyof T as EventName<string & K>]?: (event: T[K]) => void;
};

interface Events {
  click: MouseEvent;
  hover: MouseEvent;
  focus: FocusEvent;
}

type Handlers = EventHandlers<Events>;
// {
//   onClick?: (event: MouseEvent) => void;
//   onHover?: (event: MouseEvent) => void;
//   onFocus?: (event: FocusEvent) => void;
// }
```

## 工具类型组合

### 深度只读类型

```typescript
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

interface NestedObject {
  user: {
    profile: {
      name: string;
      settings: {
        theme: string;
      };
    };
  };
}

type ReadonlyNested = DeepReadonly<NestedObject>;
// 所有嵌套属性都变为只读
```

### 类型安全的路径访问

```typescript
type PathKeys<T> = {
  [K in keyof T]: T[K] extends object
    ? K | `${string & K}.${PathKeys<T[K]>}`
    : K;
}[keyof T];

type GetByPath<T, P extends string> = P extends `${infer K}.${infer Rest}`
  ? K extends keyof T
    ? GetByPath<T[K], Rest>
    : never
  : P extends keyof T
  ? T[P]
  : never;

interface Data {
  user: {
    profile: {
      name: string;
      age: number;
    };
    settings: {
      theme: 'light' | 'dark';
    };
  };
}

type ValidPaths = PathKeys<Data>;
// 'user' | 'user.profile' | 'user.profile.name' | 'user.profile.age' | 'user.settings' | 'user.settings.theme'

function getValue<T, P extends PathKeys<T>>(obj: T, path: P): GetByPath<T, P> {
  // 实现省略
  return null as any;
}

const data: Data = { /* ... */ };
const name = getValue(data, 'user.profile.name'); // string
const theme = getValue(data, 'user.settings.theme'); // 'light' | 'dark'
```

## 实际应用案例

### 类型安全的 API 客户端

```typescript
// API 端点定义
interface ApiEndpoints {
  '/users': {
    GET: { response: User[] };
    POST: { body: CreateUserRequest; response: User };
  };
  '/users/:id': {
    GET: { params: { id: string }; response: User };
    PUT: { params: { id: string }; body: UpdateUserRequest; response: User };
    DELETE: { params: { id: string }; response: void };
  };
}

// 提取方法类型
type Methods<T> = T extends Record<string, infer M> ? keyof M : never;

// 提取请求参数类型
type RequestParams<
  T extends Record<string, any>,
  P extends keyof T,
  M extends keyof T[P]
> = T[P][M] extends { params: infer Params } ? Params : {};

// 提取请求体类型
type RequestBody<
  T extends Record<string, any>,
  P extends keyof T,
  M extends keyof T[P]
> = T[P][M] extends { body: infer Body } ? Body : never;

// 提取响应类型
type ResponseType<
  T extends Record<string, any>,
  P extends keyof T,
  M extends keyof T[P]
> = T[P][M] extends { response: infer Response } ? Response : never;

// API 客户端类型
class ApiClient<T extends Record<string, any>> {
  async request<
    P extends keyof T,
    M extends Methods<T[P]>
  >(
    path: P,
    method: M,
    ...args: RequestBody<T, P, M> extends never
      ? [params?: RequestParams<T, P, M>]
      : [params: RequestParams<T, P, M>, body: RequestBody<T, P, M>]
  ): Promise<ResponseType<T, P, M>> {
    // 实现省略
    return null as any;
  }
}

// 使用示例
const api = new ApiClient<ApiEndpoints>();

// 类型安全的 API 调用
const users = await api.request('/users', 'GET'); // User[]
const user = await api.request('/users/:id', 'GET', { id: '123' }); // User
const newUser = await api.request('/users', 'POST', {}, { name: 'John' }); // User
```

### 表单验证类型

```typescript
// 验证规则类型
type ValidationRule<T> = {
  required?: boolean;
  min?: T extends string ? number : T extends number ? number : never;
  max?: T extends string ? number : T extends number ? number : never;
  pattern?: T extends string ? RegExp : never;
  custom?: (value: T) => boolean | string;
};

// 表单模式类型
type FormSchema<T> = {
  [K in keyof T]: ValidationRule<T[K]>;
};

// 验证错误类型
type ValidationErrors<T> = {
  [K in keyof T]?: string[];
};

// 表单验证器
class FormValidator<T extends Record<string, any>> {
  constructor(private schema: FormSchema<T>) {}

  validate(data: T): ValidationErrors<T> {
    const errors: ValidationErrors<T> = {};

    for (const key in this.schema) {
      const rule = this.schema[key];
      const value = data[key];
      const fieldErrors: string[] = [];

      if (rule.required && !value) {
        fieldErrors.push('This field is required');
      }

      if (value && rule.min !== undefined) {
        if (typeof value === 'string' && value.length < rule.min) {
          fieldErrors.push(`Minimum length is ${rule.min}`);
        }
        if (typeof value === 'number' && value < rule.min) {
          fieldErrors.push(`Minimum value is ${rule.min}`);
        }
      }

      // 更多验证逻辑...

      if (fieldErrors.length > 0) {
        errors[key] = fieldErrors;
      }
    }

    return errors;
  }
}

// 使用示例
interface UserForm {
  name: string;
  email: string;
  age: number;
}

const validator = new FormValidator<UserForm>({
  name: { required: true, min: 2 },
  email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  age: { required: true, min: 18, max: 120 }
});

const errors = validator.validate({
  name: 'John',
  email: 'john@example.com',
  age: 25
});
```

## 性能考虑

### 避免过度复杂的类型

```typescript
// ❌ 过度复杂，可能导致编译性能问题
type OverlyComplex<T> = T extends infer U
  ? U extends Record<string, any>
    ? {
        [K in keyof U]: U[K] extends infer V
          ? V extends Record<string, any>
            ? OverlyComplex<V>
            : V
          : never;
      }
    : U
  : never;

// ✅ 简化版本
type Simplified<T> = T extends Record<string, any>
  ? { [K in keyof T]: Simplified<T[K]> }
  : T;
```

### 使用类型断言优化

```typescript
// 在确保类型安全的前提下使用断言
function processData<T>(data: unknown): T {
  // 运行时验证
  if (isValidData(data)) {
    return data as T;
  }
  throw new Error('Invalid data');
}
```

## 最佳实践

1. **渐进式采用**: 从简单类型开始，逐步引入高级特性
2. **文档化复杂类型**: 为复杂的类型添加注释说明
3. **测试类型**: 使用类型测试确保类型行为正确
4. **性能监控**: 关注编译时间，避免过度复杂的类型

```typescript
// 类型测试示例
type Expect<T extends true> = T;
type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false;

// 测试用例
type Test1 = Expect<Equal<ConditionalType<string>, string>>;
type Test2 = Expect<Equal<ConditionalType<number>, number>>;
```

## 总结

TypeScript 的高级类型系统为我们提供了强大的工具来构建类型安全的应用：

- **条件类型**: 根据条件选择类型
- **映射类型**: 转换现有类型
- **模板字面量类型**: 类型层面的字符串操作
- **工具类型组合**: 构建复杂的类型逻辑

掌握这些高级特性，能让我们的 TypeScript 代码更加健壮和可维护。记住，类型系统的目标是帮助我们写出更好的代码，而不是增加复杂性。在实际项目中，要根据需求合理使用这些特性。
