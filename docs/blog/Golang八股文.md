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

### Context原理
context在很大程度上利用了通道在close时会通知所有监听它的协程这一特性来实现。每一个派生出的子协程都会创建一个新的退出通道，组织好context之间的关系即可实现继承链上退出的传递。

context使用场景：

1.RPC调用
2.PipeLine
3.超时请求
4.HTTP服务器的request互相传递数据

## 竞态、内存逃逸

1.资源竞争，就是在程序中，同一块内存同时被多个 goroutine 访问。我们使用 go build、go run、go test 命令时，添加 -race 标识可以检查代码中是否存在资源竞争。

解决这个问题，我们可以给资源进行加锁，让其在同一时刻只能被一个协程来操作。

```go
sync.Mutex
sync.RWMutex
```

2.一般来说，局部变量会在函数返回后被销毁，因此被返回的引用就成为了"无所指"的引用，程序会进入未知状态。

但这在Go中是安全的，Go编译器将会对每个局部变量进行逃逸分析。如果发现局部变量的作用域超出该函数，则不会将内存分配在栈上，而是分配在**堆**上，因为他们不在栈区，即使释放函数，其内容也不会受影响。

```go
func add(x, y int) *int {
  res := x + y
  return &res
}
```

这个例子中，函数`add`局部变量`res`发生了逃逸。`res`作为返回值，在`main`函数中继续使用，因此`res`指向的内存不能够分配在栈上，随着函数结束而回收，只能分配在堆上。

编译时可以借助选项 `-gcflags=-m`，查看变量逃逸的情况

## new和make的区别

`var`声明值类型的变量时，系统会默认为他分配内存空间，并赋该类型的**零值**
如果是**指针类型**或者**引用类型**的变量，系统不会为它分配内存，默认是`nil`。

1.`make` 仅用来分配及初始化类型为 `slice`、`map`、`chan` 的数据。
2.`new` 可分配任意类型的数据，根据传入的类型申请一块内存，返回指向这块内存的指针，即类型 `*Type`。
3.`make` 返回**引用**，即 `Type`，`new` 分配的空间被清零， `make` 分配空间后，会进行**初始化**。
4.`make`函数返回的是`slice`、`map`、`chan`类型本身
5.`new`函数返回一个指向该类型内存地址的指针

## slice的实现原理

_`slice`不是线程安全的_
切片是基于**数组**实现的，底层是数组，可以理解为对底层数组的抽象

```go
type slice struct{
  array unsafe.Pointer
  len int
  cap int
}
```

`slice`占24个字节
`array`：指向底层数组的指针，占用8个字节
`len`:切片的长度，占用8个字节
`cap`：切片的容量，cap总是大于等于len，占用8个字节

初始化`slice`调用的是`runtime.makeslice`，`makeslice`函数的工作主要就是计算`slice`所需内存大小，然后调用`mallocgc`进行内存的分配

_所需内存的大小=切片中元素大小*切片的容量_

## slice和array的区别

* 1.长度不同
  * 数组的初始化必须指定长度且长度是固定的
  * 切片的长度是不固定的,可以追加元素且追加元素时可能触发扩容

* 2.函数传参不同
  * 数组是值类型,在作为函数参数时会将该数组的值**拷贝**给另一个数组,传递的是一份深拷贝,在函数中对数组进行操作不会影响原数组
  * 切片是引用类型,在作为函数参数时(或一个切片赋值给另一个切片)会只会将切片的`len`,`cap`拷贝出去,底层共用一个数组,不会占用额外空间,所以函数对数组的操作会影响到原数组

* 3.计算长度的方式不同
  * 数组计算长度需要遍历,时间复杂度为`O(n)`
  * 切片包含字段`len`,可直接获得切片长度,时间复杂度为`O(1)`

## map的实现原理

Go中的`map`是一个指针，占用8个字节，指向`hmap`结构体，`map`底层是基于 **哈希表+链地址法(链表结构作为桶)** 存储的。

### map的特点

* 1.键不能重复
* 2.键必须可哈希,如`int/bool/string/float/array`
* 3.无序

### map底层结构
```go
// A header for a Go map.
type hmap struct {
  count int //代表哈希表中的元素个数，调用len(map)时，返回的就是该字段值。
  flags uint8 //状态标志是否处于正在写入的状态等
  B uint8 //buckets(桶)的对数 如果B=5，则buckets数组的长度=2^B=32，意味着有32个桶
  noverflow uint16 //溢出桶的数量
  hash0 uint32  //生成hash的随机数种子
  buckets unsafe.Pointer  //指向buckets数组的指针，数组大小为2^B，如果元素个数为0，它为nil.
  oldbuckets unsafe.Pointer //如果发生扩容，oldbuckets是指向老的buckets数组的指针，老的buckets数组大小是新的buckets的1/2;非扩容状态下，它为ni1.
  nevacuate uintptr //表示扩容进度。小于此地址的buckets代表已搬迁完成。
  extra *mapextra //存储溢出桶，这个字段是为了优化GC扫描面设计的
}
```
源码包中`src/runtime/map.go`定义了`hmap`的数据结构
`hmap`包含若干个结构为`bmap`的数组，每个`bmap`底层都采用链表结构，`bmap`通常叫其`bucket`,也就是我们常说的**桶**,一个桶最多装8个**key**
这些`key`之所以会落入同一个桶，是因为它们经过哈希计算后，哈希结果的低`B`位是相同的

### map的初始化过程

* 1.创建一个`hmap`结构体对象
* 2.生成一个哈希因子hash0并赋值到`hmap`对象中（用于后续为key创建哈希值）
* 3.根据`hint=10`，并根据算法规则来创建`B`，此时的`B`为1
* 4.根据`B`去创建桶(`bmap`对象)并存放在`bucket`数组中。当前的`bmap`的数量为2
  * B<4时，根据B创建桶的个数的规则为：`2^B`（标准桶）
  * B>=4时，根据B创建桶的个数的规则为：`2^B+2^(B-4)` （标准桶+溢出桶）

### Go的map为什么是无序的

使用`range`多次遍历map时输出的`key`和`value`的顺序可能不同。这是Go语言的设计者们有意为之，旨在提示开发者们，Go底层实现并不保证map遍历顺序稳定，请大家不要依赖range遍历结果顺序

主要原因有2点:

* 1.`map`在遍历时，并不是从固定的0号`bucket`开始遍历的，每次遍历，都会从一个随机值序号的`bucket`， 再从其中随机的`cell`开始遍历
* 2.`map`遍历时，是按序遍历`bucket`，同时按需遍历`bucket`中和其`overflow bucket`中的cell。但是`map`在扩容后，会发生`key`的搬迁，这造成原来落在一个`bucket`中的`Key`,搬迁后，有可能会落到其他`bucket`中了，从这个角度看，遍历`map`的结果就不可能是按照原来的顺序了

### map是如何查找的

* 1.写保护检测:先检查`map`的`flags`标志位是否为1, 如果是则表明有其他协程正在写入该`map`继而导致`panic`,这也说明`map`**不是线程安全的**
* 2.计算hash值:将`key`经过hash函数得到哈希值,不同类型的`key`有不同的hash函数
* 3.找到hash值对应的`bucket`
  * bucket定位：哈希值的低B个bit位，用来定位`key`所存放的`bucket`
    如果当前正在扩容中，并且定位到的旧`bucket`数据还未完成迁移，则用旧的`bucket`（扩容前的`bucket`）
    ```go
    hash:=t.hasher(key, uintprt(h.hash0))
    m=bucketMask(h.B)
    b:=(*bmap)(add(h.buckets,(hash&m)*uintptr(t.bucketsize))
    if c:=h.oldbucket;c!=nil{
      if !h.sameSizeGrow(){
        m>>=1
      }
      oldb:=(*bmap)(add(c,(hash&m)*uintptr(t.bucketsize)))
      if !evacuated(oldb){
        b=oldb
      }
    }
    ```
* 4.遍历`bucket`查找
* 5.返回`key`对应的指针

### 负载因子

负载因子(load factor)，用于衡量当前哈希表中空间占用率的核心指标，也就是每个bucket桶存储的平均元素个数。
_负载因子=哈希表存储的元素个数/桶个数_

Go官方发现:
装载因子越大，填入的元素越多，空间利用率就越高，但发生哈希冲突的几率就变大。反之，装载因子越小，填入的元素越少，冲突发生的几率减小，但空间浪费也会变得更多，而且还会提高扩容操作的次数
根据这份测试结果和讨论，Go官方取了一个相对适中的值，把Go中的 map的负载因子硬编码为6.5，这就是6.5的选择缘由。
这意味着在Go语言中，当map存储的元素个数大于或等于6.5*桶个数时，就会触发扩容行为。

### map扩容

扩容条件:

* 条件1：超过负载 map元素个数>6.5*桶个数
```go
func overLoadFactor(count int, B uint8) bool{
  return count > bucketCnt && uintptr(count)>loadFactor*bucketShift(B)
}
```
其中

`bucketCnt=8`，一个桶可以装的最大元素个数
`loadFactor=6.5`，负载因子，平均每个桶的元素个数
`bucketShift(8)`, 桶的个数
  
* 条件2：溢出桶太多(桶中存放的元素超出了最大的存储数量,则需要将超出的元素存放进另一个桶中,则这个桶就叫做溢出桶)
当桶总数<2^15时，如果溢出桶总数>=桶总数，则认为溢出桶过多
当桶总数>=2^15时，直接与2^15比较，当溢出桶总数>=2^15时，即认为溢出桶太多了

扩容机制:
* 1.双倍扩容：针对条件1，新建一个`buckets`数组，新的`buckets`大小是原来的`2`倍，然后旧的`buckets`数据 搬迁到新的`buckets`
* 2.等量扩容：针对条件2，并不扩大容量，`buckets`数量维持不变，重新做一遍类似双倍扩容的搬迁操作， 把松散的键值对重新排列一次，使得同一个`bucket`中的`key`排列地更紧密，节省空间，提高`buckets`利用 率，进而保证更快的存取。该方法我们称之为等量扩容。

## Golang中对nil的Slice和空Slice的处理是一致的吗?
首先Go的JSON 标准库对 nil slice 和 空 slice 的处理是不一致的。
1.`slice := make([]int,0)`：slice不为nil，但是slice没有值(即为`[]`)，slice的底层的空间是空的。
2.`var slice []int` ：slice的值是nil，可用于需要返回slice的函数，当函数出现异常的时候，保证函数依然会有nil的返回值。

## chanel实现原理

Go中的`channel`是一个循环队列，遵循**先进先出**的原则，负责**协程**之间的**通信**(Go语言提倡不要通过共享内存
来通信，而要通过通信来实现内存共享，CSP(CommunicatingSequential Process)并发模型，就是通过
goroutine和channel来实现的)

### 使用场景

* 1.停止信号监听
* 2.定时任务
* 3.生产方和消费方解耦
* 4.控制并发数

### channel是并发安全的

通道的发送和接收操作是原子的，即一个完整的发送或接收操作是一个原子操作，不会被其他`goroutine`中断。

当一个`goroutine`向`channel`发送数据时，如果`channel`已满，则发送操作会被**阻塞**，直到有其他`goroutine`从该`channel`中接收数据后释放
空间，发送操作才能继续执行。在这种情况下，`channel`内部会获取一个锁，保证只有一个`goroutine`能够往其中写入数据。

同样地，当一个`goroutine`从`channel`中接收数据时，如果`channel`为空，则接收操作会被**阻塞**，直到有其他`goroutine`向该`channel`中发送
数据后才能继续执行。在这种情况下，`channel`内部也会获取一个锁，保证只有一个`goroutine`能够从其中读取数据。

因此可以通过`channel`的阻塞实现主线程等待协程的效果
```go
package main

import (
	"fmt"
	"time"
)

func main() {
	result := make(chan int)
	params := make(chan int)
	go inputParams(params)
	go add(params, result)
	fmt.Println(<-result) // 未计算出结果之前主线程将一直阻塞在这
}

func inputParams(params chan int) {
	fmt.Println("等待输入")
	var a, b int
	fmt.Scanln(&a, &b)
	params <- a
	params <- b

}

func add(params chan int, result chan int) {
	a := <-params
	b := <-params
	// 等待计算
	fmt.Println("等待计算")
	time.Sleep(time.Second * 2)
	result <- a + b
}

```

## Channel是同步的还是异步的？
`channel`是异步进行的, `channel`存在3种状态：

1.`nil`，未初始化的状态，只进行了声明，或者手动赋值为`nil`
  * 发送: 阻塞
  * 接收: 阻塞
  * 关闭: panic
2.`active`，正常的`channel`，可读或者可写
  * 发送: 依是否有值以及是否有缓存而发送成功或阻塞
  * 接收: 依是否有值以及是否有缓存而接受成功或阻塞
  * 关闭: 成功
3.`closed`，已关闭，千万不要误认为关闭`channel`后，`channel`的值是`nil`，对已关闭`channel`读写都会`panic`

## Channel死锁场景
* 1.非缓存`channel`只写不读
* 2.非缓存`channel`读在写后面
* 3.缓存`channel`写入超过缓冲区数量
* 4.空读
* 5.多个协程相互等待
