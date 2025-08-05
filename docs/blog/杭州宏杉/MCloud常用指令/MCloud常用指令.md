---
title: MCloud常用指令
description: 杭州宏杉学习笔记-MCloud常用指令
#cover: /cover/cover2.png
tag:
- 杭州宏杉
- MCloud
- Cli
  #sticky: 999
date: 2025-07-30 17:13
---

* 登录：
  ```shell
  login withAccount accountName=admin password=password
  ```
* 集群开启防火墙：
  ```shell
  globalConfig update name=reject.all.ports category=iptables value=true
  ```
* 开启导出镜像端口
  ```shell
  globalConfig update category=iptables name=mcloud.allow.ports value=8080,60
  ```
* 修改numa值（对应计算规格在线修改）
  ```shell
  globalConfig update category=vm name=numa value=[true/false]
  ```