---
title: Golang八股文
description: Golang八股文整理
#cover: /cover/cover2.png
tag:
 - Go 
 - 八股文
#sticky: 999
---

# Golang八股文
 
## 进程,线程,协程

* 进程: **进程**是**系统资源**(地址空间,文件句柄...)分配的基本单位.
* 线程: **线程**是**CPU调度**的基本单位.
    - 所有线程共享相同的虚拟空间地址,可以访问相同的代码段,数据段和堆栈段.
    - 所有线程可以访问所属进程的全局变量和静态变量.
* 协程: **用户态**的线程,由用户程序创建,删除,协程切换**不需要**切换内核态.

### 线程和协程的区别

* 1.线程是操作系统的概念，而协程是程序级的概念。线程由**操作系统调度**执行，每个线程都有自己的**执行上下文**，包
括程序计数器、寄存器等。而协程由**程序自身控制**。
* 2.多个线程之间通过**切换执行**的方式实现**并发**。线程切换时需要保存和恢复上下文，涉及到上下文切换的开销。而协
程切换时不需要操作系统的介入，只需要保存和恢复自身的上下文，切换开销较小。
* 3.**线程是抢占式的并发**，即操作系统可以随时剥夺一个线程的执行权。而协程是合作式的并发，_协程的执行权由程序
自身决定_，只有当协程主动让出执行权时，其他协程才会得到执行机会。

## GMP调度和CSP模型

### CSP模型
CSP 是 Communicating Sequential Process 的简称，中文可以叫做通信顺序进程，是一种**并发编程模型**，是一个很强大的并发数据模型，是上个世纪七十年代提出的，用于描述两个独立的并发实体通过共享的通讯 channel(管道)进行通信的并发模型。
相对于Actor模型，CSP中channel是第一类对象，它不关注发送消息的实体，而关注与发送消息时使用的channel。

严格来说，CSP 是一门形式语言（类似于 ℷ calculus），用于描述并发系统中的互动模式，也因此成为一众面向并发的编程语言的理论源头，并衍生出了 Occam/Limbo/Golang…

而具体到编程语言，如 Golang，其实只用到了 CSP 的很小一部分，即理论中的 Process/Channel（对应到语言中的 goroutine/channel）：这两个并发原语之间没有从属关系， Process 可以订阅任意个 Channel，Channel 也并不关心是哪个 Process 在利用它进行通信；Process 围绕 Channel 进行读写，形成一套有序阻塞和可预测的并发模型。

### 什么是GMP

* G: goroutine, go的协程,每个`go`关键字都会创建一个协程.
* P: process, 包含运行Go代码所需要的必要资源，用来**调度G和M之间的关联关系**，其数量可以通过`GOMAXPROCS`来设置，默认为核心数
* M: machine, 工作线程, 数量对应真是的CPU数.

线程想运行任务就得获取 P，从 P 的本地队列获取 G，当 P 的本地队列为空时，M 也会尝试从全局队列或其他 P 的本地队列获取 G。M 运行 G，G 执行之后，M 会从 P 获取下一个 G，不断重复下去。

### Goroutine调度策略
* 1.队列轮转：P会周期性的将G调度到M中执行，执行一段时间后，保存上下文，将G放到队列尾部，然后从队列中再取出一个G进行调度，P还会周期性的查看全局队列是否有G等待调度到M中执行
* 2.系统调用：当G0即将进入系统调用时，M0将释放P，进而某个空闲的M1获取P，继续执行P队列中剩下的G。M1的来源有可能是M的缓存池，也可能是新建的。
* 3.当G0系统调用结束后，如果有空闲的P，则获取一个P，继续执行G0。如果没有，则将G0放入全局队列，等待被其他的P调度。然后M0将进入缓存池睡眠。

### Goroutine的切换时机
* 1.select阻塞
* 2.io阻塞
* 3.channel阻塞
* 4.等待锁
* 5.程序调用
* 6.程序员显示编码操作??

## context

### Context结构原理
Context（上下文）是Golang应用开发常用的并发控制技术 ，它可以控制一组呈树状结构的goroutine，每个goroutine拥有相同的上下文。Context 是**并发安全**的，主要是用于控制多个协程之间的协作、取消操作。

```go
type Context interface {
Deadline() (deadline time.Time, ok bool)
Done() <-chan struct{}
Err() error
Value(key interface{}) interface{}
}
```

「Deadline」 方法：可以获取设置的截止时间，返回值 deadline 是截止时间，到了这个时间，Context 会自动发起取消请求，返回值 ok 表示是否设置了截止时间。
「Done」 方法：返回一个只读的 channel ，类型为 struct{}。如果这个 chan 可以读取，说明已经发出了取消信号，可以做清理操作，然后退出协程，释放资源。
「Err」 方法：返回Context 被取消的原因。
「Value」 方法：获取 Context 上绑定的值，是一个键值对，通过 key 来获取对应的值。

几个实现context接口的对象：

context.Background()和context.TODO()相似，返回的context一般作为根对象存在，其不可以退出，也不能携带值。要具体地使用context的功能，需要派生出新的context。
context.WithCancel()函数返回一个子context并且有cancel退出方法。子context在两种情况下会退出，一种情况是调用cancel，另一种情况是当参数中的父context退出时，该context及其关联的context都退出。
context.WithTimeout函数指定超时时间，当超时发生后，子context将退出。因此子context的退出有3种时机，一种是父context退出；一种是超时退出；一种是主动调用cancel函数退出。
context.WithDeadline()与context.WithTimeout()返回的函数类似，不过其参数指定的是最后到期的时间。
context.WithValue()函数返回待key-value的子context

具体context内容请看：context参考

### Context原理
context在很大程度上利用了通道在close时会通知所有监听它的协程这一特性来实现。每一个派生出的子协程都会创建一个新的退出通道，组织好context之间的关系即可实现继承链上退出的传递。

context使用场景：

1.RPC调用
2.PipeLine
3.超时请求
4.HTTP服务器的request互相传递数据
