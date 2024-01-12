---
title: SpringBoot+Mybatis多数据源配置
date: "2024-01-11 13:46:00"
description: SpringBoot+Mybatis多数据源配置
---

# 多数据源配置

开发过程中，很可能会遇到需要同时访问多个数据库，比如主数据存储主要业务数据，回调数据库存储互联网返回的状态报告（可能是网络问题导致数据库分离）。这个时候，就需要用到多数据源配置。本文将会基于`SpringBoot`和`Mybatis`进行多数据源配置。

## 一、拆分包和数据库连接池进行配置

这种方式将不同数据源访问的`Mapper`按照数据库进行分包，并分别让不同的数据源扫描各自的包。

### 1. 编写参数配置类

- 编写`master`数据库的配置类

  ```java
  import lombok.Getter;
  import lombok.Setter;
  import org.springframework.boot.context.properties.ConfigurationProperties;
  
  @Getter
  @Setter
  @ConfigurationProperties(prefix = "datasource.master")
  public class MasterDataSourceProperties {
      private String driverClassName;
      private String url;
      private String username;
      private String password;
  }
  ```

- 编写`callback`数据库的配置类

  ```java
  import lombok.Getter;
  import lombok.Setter;
  import org.springframework.boot.context.properties.ConfigurationProperties;
  
  @Getter
  @Setter
  @ConfigurationProperties(prefix = "datasource.callback")
  public class CallbackDataSourceProperties {
      private String driverClassName;
      private String url;
      private String username;
      private String password;
  }
  ```

### 2. 在`application.yml`或`application.properties`中配置

```yaml
datasource:
  master:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://192.168.0.2:3306/cqyjzx?useUnicode=true&characterEncoding=UTF-8&serverTimezone=Asia/Shanghai
    username: root
    password: root
  callback:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://192.168.0.3:3306/callback?useUnicode=true&characterEncoding=UTF-8&serverTimezone=Asia/Shanghai
    username: root
    password: root
```

### 3. 编写数据源配置类

- 编写`master`数据源配置

  ```java
  import com.zaxxer.hikari.HikariDataSource;
  import org.apache.ibatis.session.SqlSessionFactory;
  import org.mybatis.spring.SqlSessionFactoryBean;
  import org.mybatis.spring.annotation.MapperScan;
  import org.springframework.beans.factory.annotation.Qualifier;
  import org.springframework.boot.context.properties.EnableConfigurationProperties;
  import org.springframework.context.annotation.Bean;
  import org.springframework.context.annotation.Configuration;
  import org.springframework.context.annotation.Primary;
  import org.springframework.jdbc.datasource.DataSourceTransactionManager;
  
  import javax.sql.DataSource;
  
  @MapperScan(basePackages = "com.github.zhangquanli.mapper", sqlSessionFactoryRef = "masterSqlSessionFactory")
  @EnableConfigurationProperties(MasterDataSourceProperties.class)
  @Configuration
  public class MasterDataSourceConfig {
      @Primary
      @Bean(name = "masterDataSource")
      public DataSource dataSource(MasterDataSourceProperties masterDataSourceProperties) {
          HikariDataSource dataSource = new HikariDataSource();
          dataSource.setDriverClassName(masterDataSourceProperties.getDriverClassName());
          dataSource.setJdbcUrl(masterDataSourceProperties.getUrl());
          dataSource.setUsername(masterDataSourceProperties.getUsername());
          dataSource.setPassword(masterDataSourceProperties.getPassword());
          return dataSource;
      }
  
      @Primary
      @Bean(name = "masterTransactionManager")
      public DataSourceTransactionManager transactionManager(@Qualifier("masterDataSource") DataSource dataSource) {
          return new DataSourceTransactionManager(dataSource);
      }
  
      @Primary
      @Bean(name = "masterSqlSessionFactory")
      public SqlSessionFactory sqlSessionFactory(@Qualifier("masterDataSource") DataSource dataSource) throws Exception {
          SqlSessionFactoryBean sqlSessionFactory = new SqlSessionFactoryBean();
          sqlSessionFactory.setDataSource(dataSource);
          return sqlSessionFactory.getObject();
      }
  }
  ```

- 编写`callback`数据源配置

  ```java
  import com.zaxxer.hikari.HikariDataSource;
  import org.apache.ibatis.session.SqlSessionFactory;
  import org.mybatis.spring.SqlSessionFactoryBean;
  import org.mybatis.spring.annotation.MapperScan;
  import org.springframework.beans.factory.annotation.Qualifier;
  import org.springframework.boot.context.properties.EnableConfigurationProperties;
  import org.springframework.context.annotation.Bean;
  import org.springframework.context.annotation.Configuration;
  import org.springframework.context.annotation.Primary;
  import org.springframework.jdbc.datasource.DataSourceTransactionManager;
  
  import javax.sql.DataSource;
  
  @MapperScan(basePackages = "com.github.zhangquanli.callback", sqlSessionFactoryRef = "callbackSqlSessionFactory")
  @EnableConfigurationProperties(CallbackDataSourceProperties.class)
  @Configuration
  public class CallbackDataSourceConfig {
      @Bean(name = "callbackDataSource")
      public DataSource dataSource(CallbackDataSourceProperties callbackDataSourceProperties) {
          HikariDataSource dataSource = new HikariDataSource();
          dataSource.setDriverClassName(callbackDataSourceProperties.getDriverClassName());
          dataSource.setJdbcUrl(callbackDataSourceProperties.getUrl());
          dataSource.setUsername(callbackDataSourceProperties.getUsername());
          dataSource.setPassword(callbackDataSourceProperties.getPassword());
          return dataSource;
      }
  
      @Bean(name = "callbackTransactionManager")
      public DataSourceTransactionManager transactionManager(@Qualifier("callbackDataSource") DataSource dataSource) {
          return new DataSourceTransactionManager(dataSource);
      }
  
      @Bean(name = "callbackSqlSessionFactory")
      public SqlSessionFactory sqlSessionFactory(@Qualifier("callbackDataSource") DataSource dataSource) throws Exception {
          SqlSessionFactoryBean sqlSessionFactory = new SqlSessionFactoryBean();
          sqlSessionFactory.setDataSource(dataSource);
          return sqlSessionFactory.getObject();
      }
  }
  ```

### 4. 分包编写`XXXMapper.java`和`XXXMapper.xml`文件
- 在`com.github.zhangquanli.mapper`目录下编写`master`数据库中的文件
- 在`com.github.zhangquanli.callback`目录下编写`callback`数据库中的文件