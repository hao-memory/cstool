# cstool
基于 webpack3 的构建封装，目前支持vue.

# npm服务器设置
npm set registry http://101.132.137.218:4873

# npm安装
npm i cstool --save-dev

# 用法
 --cdn (是否加入CDN) 

 --extract (是否抽出公共js)

 --hash (是否生成md5编码文件名)

 --autoOpenBrowser (是否自动打开浏览器)
 
 --local（是否秒开）
  
 --useRem（是否Rem布局） 
  
 --no-sourceMap(是否不需要SourceMap)
 
 css 预处理 支持 less scss sass stylus styl

 支持static静态资源拷贝


# change list

### 0.0.1
init

### 0.1.0
基本版完成

### 0.1.1
修改readme

### 0.1.2
修改readme

### 0.1.3
修复图片路径问题

### 0.1.4
修复图片路径问题

### 0.1.5
修复px转rem不生效问题

### 0.1.6
默认执行autoprefixer

### 0.1.7
rem rootValue修正为75

### 0.1.8
指定版本依赖

### 0.1.9
修复模块依赖找不到问题

### 0.1.10
zip包增加hash值

### 0.2.0
zip包命名增加随机值

### 0.2.1
开发环境默认不打包config.dev.js

### 0.2.2
修复index.html,index-local.html不生效问题

### 0.2.3
新增historyApiFallback配置

### 0.2.4
修复historyApiFallback静态资源404问题

### 0.2.5
修复sourceMap问题

### 0.2.6
默认支持sourceMap

### 0.2.7
增加静态资源拷贝至打包后目录功能

### 0.2.8
修复copy插件配置不正确问题

### 0.2.9
修复copy插件配置不正确问题

### 0.2.10
修复css3 动画错乱问题

### 0.2.11
修复image打包路径错误问题

### 0.2.12
修复cdn正则匹配冲突问题

### 0.2.13
移除postcss.config.js中cssnano配置,改为optimize-css-assets-webpack-plugin集成

### 0.2.14
判断static静态目录是否存在,防止copy-webpack-plugin报错

### 0.2.15
增加babel-polyfill

### 0.2.16
控制chunk被2个以上chunks/入口chunk 所使用，才打包进vendor
