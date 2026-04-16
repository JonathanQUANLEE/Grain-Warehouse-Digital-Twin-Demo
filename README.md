# 粮库数字孪生系统
> 基于 BlackHole Engine Web SDK 的粮库数字孪生演示项目，用于展示三维场景可视化、业务数据联动、设备监测、安防预警和接口联调能力。

## 项目简介

`粮库数字孪生系统` 是一个面向粮库场景的数字孪生前端演示项目。它将三维模型、业务数据和管理操作整合到同一个页面中，让使用者可以在一个界面里完成以下任务：

- 查看粮库三维场景
- 浏览粮情、通风、虫害、熏蒸等业务数据
- 查看仓房状态、设备状态和异常预警
- 进行场景交互、巡检演示和接口联调

这个项目适合用作：

- 粮库数字孪生项目原型展示
- 客户汇报或方案演示
- BlackHole Engine Web SDK 集成参考
- 三维场景与业务数据联动的前端示例工程

## 项目预览

你可以在这里放 3 到 5 张项目截图，上传到 GitHub 后首页展示效果会更好。

建议在仓库中新增一个 `docs/images/` 目录，并放入如下截图：

- `docs/images/dashboard.png`：驾驶舱总览
- `docs/images/storage.png`：仓储监测页面
- `docs/images/security.png`：安防联动画面
- `docs/images/api-debug.png`：接口联调页面

README 中可替换为你自己的真实截图：

```markdown
![驾驶舱总览](docs/images/dashboard.png)
![仓储监测](docs/images/storage.png)
![安防联动](docs/images/security.png)
![接口联调](docs/images/api-debug.png)
```

## 核心功能

- 三维场景加载
  支持 `official`、`platform`、`local` 三种数据源模式。

- 驾驶舱总览
  提供 KPI 看板、仓房详情、异常告警、趋势图和设备状态展示。

- 场景交互能力
  支持快速定位、第一人称、自动巡检、天气切换和仓顶穿透。

- 业务数据联动
  集成粮情、通风、虫害、熏蒸四类示例数据，并映射到仓房状态与告警展示。

- 安防与视频演示
  支持 AI 事件模拟、AI 接口轮询和视频流播放联动。

- 接口联调面板
  支持 Token 请求、项目列表拉取、子系统接口调试、台账接口加载和流地址测试。

## 核心价值

- 对演示人员
  可以快速搭建一个可讲解、可交互、可联动的粮库数字孪生演示页面。

- 对前端开发者
  可以直接参考三维 SDK 接入方式、页面组织方式和数据联动逻辑。

- 对项目团队
  可以作为数字孪生原型工程，后续继续接入真实模型、真实接口和真实业务数据。

- 对实施与集成人员
  可以验证平台数据集加载方案、多数据源切换策略和接口调试流程。

## 技术栈

- 前端：HTML、CSS、JavaScript
- 三维引擎：BlackHole Engine Web SDK
- 本地服务：Python `http.server` 扩展静态服务
- 数据格式：CSV、JSON
- 使用模式：`official`、`platform`、`local`

## 快速开始

### 运行环境

- Python 3.9 及以上
- Chrome 或 Edge 等现代浏览器
- 可以访问 BlackHole 官方线上资源的网络环境

### 启动项目

在项目根目录执行：

```bash
python server.py --port 8080
```

浏览器打开：

```text
http://localhost:8080/demo/
```

如果你是第一次运行，建议直接使用下面这个地址：

```text
http://localhost:8080/demo/?dataSource=official
```

## 使用方式

### 1. `official` 模式

适合首次体验项目，也是最适合 GitHub 访客直接运行的模式。

访问地址：

```text
http://localhost:8080/demo/?dataSource=official
```

特点：

- 不依赖本地模型
- 更容易直接运行成功
- 适合验证页面结构和交互逻辑

### 2. `platform` 模式

适合你已经把模型上传到 BlackHole 平台并完成转换后的场景。

使用步骤：

1. 在 `config/` 目录中创建 `blackhole_complete_params.json`
2. 参考 `config/blackhole_complete_params.sample.json` 填入你的平台参数
3. 启动服务后访问：

```text
http://localhost:8080/demo/?dataSource=platform
```

说明：

- 真实平台参数不会被提交到 GitHub
- `.gitignore` 已忽略 `config/blackhole_complete_params.json`

### 3. `local` 模式

适合本地调试模型资源。

使用步骤：

1. 将本地模型资源放入 `models/`
2. 确保目录中包含可识别的入口文件，例如 `total.xml`
3. 启动服务后访问：

```text
http://localhost:8080/demo/?dataSource=local
```

如果本地资源不完整，建议先切回 `official` 模式确认前端流程是否正常。

## 页面说明

项目启动后，可以重点体验以下区域：

- 顶部导航
  切换驾驶舱总览、仓储监测、设备运维、安防联动和接口联调模块。

- 左侧面板
  查看核心指标、粮情趋势、设备状态和模型列表。

- 右侧面板
  查看仓房详情、异常告警和 AI 安防联动信息。

- 底部控制区
  使用快速定位、天气切换、第一人称、自动巡检和仓顶穿透功能。

- 接口联调页
  输入接口地址、Token、视频流地址，测试项目列表、台账接口和 AI 事件联动。

## 演示数据

仓库当前提供 4 份最小演示数据：

- `data/cj_temp/cj_temperature.csv`
- `data/cj_temp/sg_ck_air.csv`
- `data/cj_temp/sg_ck_pest.csv`
- `data/cj_temp/sg_ck_steam.csv`

这些数据主要用于演示：

- 粮温趋势
- 通风作业状态
- 虫害风险信息
- 熏蒸记录联动

如果你有自己的真实数据，可以替换这些文件，或在 `demo/script.js` 中调整字段映射逻辑。

## 目录结构

```text
Project 3/
├─ demo/                         # 前端演示页面
│  ├─ index.html
│  ├─ script.js
│  └─ styles.css
├─ data/
│  └─ cj_temp/                   # 演示用业务数据
│     ├─ cj_temperature.csv
│     ├─ sg_ck_air.csv
│     ├─ sg_ck_pest.csv
│     └─ sg_ck_steam.csv
├─ config/
│  └─ blackhole_complete_params.sample.json
├─ scripts/
│  ├─ blackhole_generate_config.py
│  └─ get_resids.py
├─ sdk/                          # 本地 SDK 目录，占位用
├─ models/                       # 本地模型目录，占位用
├─ .gitignore
├─ README.md
└─ server.py
```

## 开发说明

如果你准备继续扩展这个项目，建议优先查看以下文件：

- `demo/index.html`
- `demo/script.js`
- `server.py`
- `config/blackhole_complete_params.sample.json`

作用说明：

- `demo/index.html` 负责页面结构和 SDK 启动参数注入
- `demo/script.js` 负责数据解析、场景逻辑、交互逻辑和接口联调
- `server.py` 负责本地静态服务和代理转发

## 常见问题

### 页面打开了，但模型没有显示

优先检查以下内容：

- 是否通过 `python server.py` 启动，而不是直接双击 HTML
- 当前网络是否可以访问 BlackHole 官方资源
- 是否误用了 `platform` 或 `local` 模式，但对应资源没有准备好

建议先访问：

```text
http://localhost:8080/demo/?dataSource=official
```

### `platform` 模式加载失败

请检查：

- `config/blackhole_complete_params.json` 是否存在
- 数据集参数是否完整
- `resId`、`resourcesAddress`、`context` 等字段是否正确

### `local` 模式加载失败

请检查：

- `models/` 目录内是否有完整资源
- 是否存在当前项目可识别的模型入口文件
- 路径结构是否与当前代码逻辑匹配

## 开源说明

为了保证仓库适合公开发布，当前版本没有直接提交以下内容：

- 私有 Token
- 私有平台参数
- 大体积 SDK 二进制资源
- 本地模型资源
- 聊天记录和临时过程文件

