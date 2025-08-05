---
title: MCloud云平台
description: 杭州宏杉学习笔记-MCloud云平台相关功能和知识
#cover: /cover/cover2.png
tag:
- 杭州宏杉
- MCloud
  #sticky: 999
date: 2025-08-04 9:35
---

* 1.性能优化工具包括：

  * windows:内部监控Agent(用于获取云主机的CPU，内存和磁盘容量的监控数据)、QGA（云主机与宿主机交互的应用程序，不依赖网络）、Virtio驱动（优化云主机与宿主机的I/O性能，包括硬盘驱动,网卡驱动，内存驱动，pci设备驱动等）、Cloudbase-Init（win的初始化工具，实现导入UserData等定制功能）

  * linux：内部监控Agent，QGA

* 2.Linux云主机依赖性能优化工具的功能：

  * 内部监控：内部监控agent获取CPU，内存，磁盘等数据
  * 在线修改配置：QGA实现的云主机与物理机之间的数据交互，不需要依赖网络
      * 修改主机名
      * 在线修改IP地址
      * 在线修改MAC地址
      * 修改云主机密码
      * 同步配置（网卡IP地址，子网掩码，网关，DNS，MTU等）

  * 故障检测：要求云主机内部有`pvpanic`模块（`lsmod | grep pvpanic`)

* 3.系统镜像格式：
  * iso：光盘映像，通常通过光盘或USB引导启动，如操作系统安装盘。iso只读，无法直接修改
  * raw：原始的磁盘镜像，未经加工的裸磁盘格式（相应的性能也就比较高），接近物理磁盘，占用的空间与实际使用的空间一致
  * qcow2（qemu copy-on-write)：一种虚拟化镜像格式，支持快照和加密

* 4.关于云主机系统镜像（iso,raw,qcow2）格式和主存储类型(mdbs,sharesan,sharedblock，local)与云主机根盘格式(raw,qcow2)有什么关系？
 
 | 主存储类型                 | 镜像格式          |根云盘格式|
  |-----------------------|---------------|---|
  | Local,NFS,SharedBlock | iso,qcow2,raw |qcow2|
  | MStor,ShareSan| iso,raw       |raw|
  | MStor,ShareSan| qcow2         |qcow2|
  * `local`，`nfs`(网络文件系统，文件共享)，`shareblock`类型的主存储，镜像**不论格式**，根云盘都为**qcow2**类型（对于local主存储，若用raw格式的镜像去创建云主机，根云盘会先为raw，最后转为qcow2。因为raw不支持快照等虚拟机的功能）
  * `mdbs`和`sharesan`类型的主存储，则根系统镜像格式有关，若系统镜像为iso或raw格式，根云盘格式为raw；若系统镜像格式为qcow2，则根云盘格式为qcow2

* 5.创建镜像中，本地上传和URL上传有什么区别？为什么URL上传会比本地上传快？
  * 本地上传：镜像文件会先上传到当前管理节点的临时路径下，随后再通过这个临时路径上传到镜像服务器
  * URL上传：直接通过URL上传到镜像服务器。因此比本地上传快。

* 6.云盘的停用功能：已挂载云主机的云盘停用后对云主机的使用没有影响，停用的云盘无法在加载云盘中选中，也无法创建云盘镜像

