---
title: MCloud对接MDBS开局指导书笔记
description: 杭州宏杉学习笔记-MCloud对接MDBS开局指导书V1.12
#cover: /cover/cover2.png
tag:
- 杭州宏杉
- MCloud
- MDBS
- 开局指导
  #sticky: 999
date: 2025-07-11 8:52
---

## 硬件组网

* MCloud3012G2服务器配置：
  * CPU：双路
  * 内存：至少128G
  * IO插卡：至少配置2张2x25GE或者2张2x10GE或者1张4x10GE
  * 系统盘：2*480GB SSD 组RAID1
  * 缓存盘：NVMe SSD至少1.92TB
  * 数据盘：

* 交换机配置：
  * 管理网络（用于系统管理和维护）：1台千兆交换机且接口数大于2N（N为服务器节点）
  * 存储网络（用于存储节点间数据通信）：2台10GE/25GE交换机
  * 业务网络（用于客户业务通信）：1/2台10GE/25GE交换机
  * BMC网络（用于服务器硬件管理和维护）：1台千兆交换机且接口数大于N

* 硬件组网：
  ![alt text](images/image.png)