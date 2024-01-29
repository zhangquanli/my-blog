---
title: Centos7防火墙配置
date: "2024-01-29 10:00:17"
description: "Centos7防火墙配置"
---

## 1、查询`firewall`服务状态

```shell
systemctl status firewalld
```

## 2、查询`firewall`的状态

```shell
firewall-cmd --state
```

## 3、开启、重启、关闭`firewalld.service`服务

```shell
# 开启
service firewalld start
# 重启
service firewalld restart
# 关闭
service firewalld stop
```

## 4、查看防火墙规则

```shell
firewall-cmd --list-all
```

## 5、查询、开放、关闭端口

```shell
# 查询80端口是否开放
firewall-cmd --query-port=80/tcp
# 开放80端口
firewall-cmd --permanent --add-port=80/tcp
# 移除80端口
firewall-cmd --permanent --remove-port=80/tcp
```

## 6、重启防火墙（修改配置后需重启防火墙）

```shell
firewall-cmd --reload
```