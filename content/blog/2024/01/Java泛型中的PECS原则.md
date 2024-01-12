---
title: Java泛型中的PECS原则
date: "2024-01-11 14:08:00"
description: Java泛型中的PECS原则
---

 
> Java编程中有时我们要用到不确定的元素，通常用通配符 `?` 表示，其中 `? extends T` 叫上界通配符，`? super T` 叫下界通配符。

### PECS原则

PECS原则的全拼是 Producer Extends Consumer Super。
当需要频繁取值，而不需要写值则使用 `? extends T` 作为数据结构泛型。相反，当需要频繁写值，而不需要取值则使用 `? super T` 作为数据结构泛型。

### 使用示例

创建Apple，Fruit两个类，其中Apple是Fruit的子类，写如下测试代码：

```java
public class PECS {

    ArrayList<? extends Fruit> exdentFurit;
    ArrayList<? super Fruit> superFurit;
    Apple apple = new Apple();

    private void test() {
        Fruit a1 = exdentFurit.get(0);
        Fruit a2 = superFurit.get(0); //Err1

        exdentFurit.add(apple); //Err2
        superFurit.add(apple);
    }
}
```

其中Err1和Err2行处报错，因为这些操作并不符合PECS原则，逐一分析：

- **Err1**
   对于使用 `? super T` 规定泛型的数据结构，我们只知道其存储的值是T的父类，若以T为数据类型取值时 `T t = ?`，等于将父类(?)当做子类(T)使用，这显然是不合理的，父类缺少子类中的一些信息，因此编译器直接禁止在使用 `? super T` 泛型的数据结构中进行取值，只能进行写值，正是开头所说的CS原则。
- **Err2**
   使用 `? extends T` 规定泛型的数据结构，我们知道其存储的值是T的子类，T可以有多个不同表现的子类（多态），因此当我们进行写值时，我们并不知道其中存储的到底是哪个子类，不同子类是不同的类型，因此写值操作必然会出现问题，所以编译器接禁止在使用 `? extends T` 泛型的数据结构中进行写，只能进行取值，正是开头所说的PE原则。

### 总结

PECS原则，就是当使用**extends**做泛型时，该数据结构作为Producer对外提供值，只能进行取值而不能写值。 当使用**super**做泛型时，该数据结构作为Producer对外提供值，只能进行取值而不能写值。