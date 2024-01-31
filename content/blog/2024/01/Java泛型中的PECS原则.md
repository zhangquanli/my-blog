---
title: "Java泛型中的PECS原则"
date: "2024-01-30 17:07:08"
description: "Java泛型中的PECS原则"
---


首先，我们创建一个泛型类，类中的泛型代表堆栈中的元素。代码如下：

```java
import java.util.Collection;
import java.util.LinkedList;
import java.util.List;
import java.util.Queue;

public class Stack<E> {
    private final Queue<E> queue;

    public Stack() {
        this.queue = new LinkedList<>();
    }

    public void push(E e) {
        queue.add(e);
    }

    public E pop() {
        return queue.remove();
    }

    public boolean isEmpty() {
        return queue.isEmpty();
    }
}
```

假设我们想要增加一个方法，让它将一系列的元素全部放入堆栈中。这是第一次尝试，如下：

```java
public void pushAll(Iterable<E> src) {
    for (E e : src) {
        push(e);
    }
}
```

这个方法编译时正确无误，但是并非尽如人意。如果 `Iterable<E> src` 的元素类型与堆栈完全匹配，就没有问题。但是假如有一个 `Stack<Number>`，并且调用了 `push(intVal)`，这里的 `intVal` 就是 `Integer` 类型。这是可以的，因为 `Integer` 是 `Number` 的一个子类型。因此从逻辑上来说，下面这个方法应该也可以：

```java
public class Test {
    public static void main(String[] args) {
        Stack<Number> numberStack = new Stack<>();
        List<Integer> integers = new ArrayList<>();
        integers.add(1);
        integers.add(2);
        numberStack.pushAll(integers);
    }
}
```

但是，如果尝试这么做，就会得到下面的错误消息，因为参数化类型是不可变：

```text
incompatible types: java.util.List<java.lang.Integer> cannot be converted to java.util.List<java.lang.Number>
```

幸运的是，有一种解决办法。`Java` 提供了一种特殊的参数化类型，称作有限制的通配符类型（`bounded wildcard type`），来处理类似的情况。`pushAll` 的输入参数类型不应该为“`E` 的 `Iterable` 接口”，而应该为“`E` 的某个子类型的 `Iterable` 接口”，有一个通配符类型符合此意：`Iterable<? Extends E>`。（使用关键字 `extends` 有些误导：确定子类型（`subtype`）后，每个类型便都是自身的子类型，即便它没有将自身扩展。）我们修改以下 `pushAll` 来使用这个类型：

```java
public void pushAll(Iterable<? extends E> src) {
    for (E e : src) {
        push(e);
    }
}
```

这么修改了之后，不仅 `Stack` 可以正确无误地编译，没有通过初始化的 `pushAll` 声明进行编译的客户端代码也一样可以。因为 `Stack` 及其客户端正确无误地进行了编译，你就知道一切都是类型安全的了。

现在假设想要编写一个 popAll 方法，使之与 pushAll 方法相呼应。popAll 方法从堆栈中弹出每个元素，并将这些元素添加到指定的集合中。初次尝试编写的 popAll 方法可能像下面这样：

```java
public void popAll(Collection<E> target) {
    while (!isEmpty()) {
        target.add(pop());
    }
}
```

如果目标集合的元素类型与堆栈的完全匹配，这段代码编译时还是会正确无误，运行得很好。但是，也并不意味着尽如人意。假设你有一个 `Stack<Number>` 和 `Collection<Object>` 的变量。如果从堆栈中弹出一个元素，并将它保存在该变量中，它的编译和运行都不会出错，那你为何不能也这么做呢？

```java
public class Test {
    public static void main(String[] args) {
        Stack<Number> numberStack = new Stack<Number>();
        Collection<Object> objects = new ArrayList<>();
        numberStack.popAll(objects);
    }
}
```

如果试着用上述的 `popAll` 版本编译这段客户端代码，就会得到一个非常类似于第一次用 `pushAll` 时所得到的错误：`Collection<Object>` 不是 `Collection<Number>` 的子类型。这次，通配符类型同样提供了一种解决办法。`popAll` 的输入参数类型不应该为“`E` 的集合”，而应该为“`E` 的某种超类的集合”（这里的超类是确定的，因此 `E` 是它自身的一个超类型）。仍然有一个通配符类型证实符合此意：`Collection<? super E>`。让我们修改 `popAll` 来使用它：

```java
public void popAll(Collection<? super E> target) {
    while (!isEmpty()) {
        target.add(pop());
    }
}
```

做了这个变动之后，`Stack` 和客户端代码就都可以正确无误地编译了。

结论很明显。**为了获得最大限度的灵活性，要在表示生产者或者消费者的输入参数上使用通配符类型**。如果某个输入参数既是生产者，又是消费者，那么通配符类型对你就没有什么好处了：因为你需要的是严格的类型匹配，这是不用任何通配符得到的。

下面的助记符便于让你记住要使用哪种通配符类型：

> PECS 表示 producer-extends, consumer-super

换句话说，如果参数化类型表示一个 `T` 生产者，就使用 `<? extends T>`；如果它表示一个 `T` 消费者，就使用 `<? super T>`。在我们的 `Stack` 示例中，`pushAll` 的 `src` 参数产生 `E` 实例供 `Stack` 使用，因此 `src` 相应的类型为 `Iterable<? extends E>`；`popAll` 的 `target` 参数通过 `Stack` 消费 `E` 实例，因此 `target` 相应的类型为 `Collection<? super E>`。`PECS` 这个助记符突出了使用通配符类型的基本原则。

