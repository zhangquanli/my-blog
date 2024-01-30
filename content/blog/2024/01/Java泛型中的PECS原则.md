---
title: "Java泛型中的PECS原则"
date: "2024-01-30 09:26:09"
description: "Java泛型中的PECS原则"
---

 
> Java编程中有时我们要用到不确定的元素，通常用通配符 `?` 表示。其中 `? extends T` 叫上界通配符，`? super T` 叫下界通配符。

### PECS原则

`PECS` 原则的全拼是 `Producer Extends Consumer Super`。
当需要频繁取值，而不需要写值则使用 `? extends T` 作为数据结构泛型。相反，当需要频繁写值，而不需要取值则使用 `? super T` 作为数据结构泛型。

### 使用示例

创建 `Apple` 和 `Fruit` 两个类，其中 `Apple` 是 `Fruit` 的子类。
```java
public class Fruit {
}
```

```java
public class Apple extends Fruit {
}
```

编写如下测试代码：

```java
public class PecsTest {
   public static void main(String[] args) {
      List<? extends Fruit> extendsFruits = new ArrayList<>();
      List<? super Fruit> superFruits = new ArrayList<>();
      Apple apple = new Apple();

      // incompatible types: Apple cannot be converted to capture#1 of ? extends Fruit
      // extendsFruits.add(apple); //Error1
      superFruits.add(apple);

      Fruit fruit = extendsFruits.get(0);
      // incompatible types: capture#1 of ? super Fruit cannot be converted to Fruit
      // Fruit fruit = superFruits.get(0); //Error2
   }
}
```

其中 `Error1` 和 `Error2` 行处报错，因为这些操作并不符合PECS原则，逐一分析：

- **Error1**：对于使用 `? extends T` 规定泛型的数据结构，我们只知道其存储的值是 `T` 的子类。`T` 可以有多个子类（多态），因此当我们进行写值时，我们并不知道其中存储的到底是哪个子类。不同子类是不同的类型，因此写值操作必然会出现问题，所以编译器接禁止在使用 `? extends T` 泛型的数据结构中进行写，只能进行取值，正是开头所说的 `PE` 原则。
- **Error2**：对于使用 `? super T` 规定泛型的数据结构，我们只知道其存储的值是 `T` 的父类。若以 `T` 为数据类型取值时 `T t = ?`，等于将父类(`?`)当做子类(`T`)使用，这显然是不合理的。父类缺少子类中的一些信息，因此编译器直接禁止在使用 `? super T` 泛型的数据结构中进行取值，只能进行写值，正是开头所说的 `CS` 原则。

### 总结

`PECS` 原则，就是当使用**extends**做泛型时，该数据结构作为**Producer**对外提供值，只能进行取值而不能写值；当使用**super**做泛型时，该数据结构作为**Producer**对外提供值，只能进行取值而不能写值。