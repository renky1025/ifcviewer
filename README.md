# IFC Viewer

一个基于 **React + Three.js + web-ifc + Tauri** 的轻量级 IFC 模型查看器。

定位：工程可用的本地 IFC 浏览工具，而不是简单 Demo，可作为后续嵌入 BIM 平台 / 桌面软件的核心 Viewer 模块。
![](/assets/image.png)
---

## 功能特性

- **本地 IFC 文件打开**  
  通过工具栏按钮选择本地 `.ifc` 文件，使用 `web-ifc` 在浏览器 / 桌面环境中解析。

- **Three.js 3D 场景浏览**  
  使用 `OrbitControls` 支持旋转、缩放、平移等基础导航操作。

- **构件选择与高亮**  
  - 在 3D 视图中点击构件，`IfcSelection` 通过射线拾取 + `web-ifc` 计算 ExpressID。
  - 选中构件后以高亮材质展示，并在左侧属性面板中展示详细信息。

- **空间结构树（构件浏览器）**  
  - 基于 `IfcProperties.getSpatialStructure` 返回的结构构建树形视图。  
  - 支持展开 / 折叠节点、点击节点联动 3D 选中构件。

- **属性浏览器**  
  - 显示选中构件的：
    - 基本信息（IfcID、IFC 类型、名称、GlobalId 等）
    - 属性集（Pset，完整 JSON）
    - 类型信息
    - 材质信息
  - Tab 形式切换（基本信息 / 属性集 / 类型 / 材质）。

- **剖切平面**  
  - 工具栏支持「开启 / 关闭剖切」。
  - 滑块可调整剖切平面偏移量。
  - 基于 Three.js 局部裁剪平面实现。

- **加载进度反馈**  
  - 底层 `IfcLoaderWrapper` 监听 `web-ifc` 加载进度，换算为 0–100%。
  - 工具栏右侧显示 `加载中 xx%` / `就绪` 状态。

---

## 技术栈

- **前端框架**：React 19 + TypeScript
- **构建工具**：Vite
- **3D 渲染**：Three.js + OrbitControls
- **IFC 解析**：web-ifc、web-ifc-three
- **几何加速**：three-mesh-bvh（BVH 加速拾取等）
- **桌面封装**：Tauri 2（`src-tauri`）

---

## 快速开始

### 环境要求

- Node.js（建议 ≥ 18）
- 推荐：pnpm / npm 二选一
- 若需要桌面版：
  - 已安装 Rust 开发环境
  - 满足 Tauri 官方要求的系统依赖

### 安装依赖

仓库同时包含 `package-lock.json` 与 `pnpm-lock.yaml`，请选择 **一种** 包管理器使用。

#### 使用 pnpm（推荐）

```bash
pnpm install
```

#### 或使用 npm

```bash
npm install
```

### 启动开发环境（Web）

```bash
# pnpm
pnpm dev

# 或 npm
npm run dev
```

默认开发地址：`http://localhost:5173`

### 构建 Web 版本

```bash
# pnpm
pnpm build

# 或 npm
pnpm run build
```

构建产物输出到 `dist/` 目录，可用于部署为纯 Web 应用。

### 预览生产构建

```bash
pnpm preview
# 或
npm run preview
```

### 启动 Tauri 桌面版（可选）

确保已安装 Rust 与 Tauri 所需依赖后：

```bash
pnpm tauri:dev
# 或
npm run tauri:dev
```

### 构建 Tauri 桌面安装包（可选）

```bash
pnpm tauri:build
# 或
npm run tauri:build
```

---

## 使用说明

1. 启动应用（Web 或 Tauri 桌面版）。
2. 在顶部工具栏点击 **「打开 IFC 文件」**。
3. 选择本地 `.ifc` 文件，等待右上角进度显示从 `加载中 xx%` 变为 `就绪`。
4. 使用鼠标在 3D 视图中进行：
   - 左键拖动：旋转视角
   - 右键拖动：平移
   - 滚轮：缩放
5. 点击模型中的构件：
   - 3D 视图中高亮选中构件
   - 左侧 **构件浏览器** 同步选中对应节点
   - 下方 **属性浏览器** 展示该构件的详细属性
6. 使用左上角 **构件浏览器**：
   - 展开 / 折叠空间结构树（建筑 / 楼层 / 构件）
   - 点击任意节点可在 3D 视图中定位并高亮对应构件
7. 使用工具栏中的 **剖切** 功能：
   - 点击按钮开启 / 关闭剖切
   - 拖动滑块调整剖切平面位置

---

## 目录结构概览

```text
ifcviewer/
├─ public/
│  ├─ vite.svg
│  └─ web-ifc/
│     └─ web-ifc.wasm         # web-ifc 的 WASM 文件
│
├─ src/
│  ├─ main.tsx                # React 入口
│  ├─ App.tsx                 # 应用布局与状态协调
│  ├─ index.css               # 全局基础样式
│  ├─ App.css                 # 应用整体布局与 UI 风格
│  │
│  ├─ components/             # React UI 组件
│  │  ├─ ViewerCanvas.tsx     # 3D 画布容器，创建 / 销毁 IfcViewer
│  │  ├─ Toolbar.tsx          # 顶部工具栏（打开文件、剖切、进度显示）
│  │  ├─ TreeView.tsx         # 左侧构件树
│  │  └─ PropertyPanel.tsx    # 属性面板
│  │
│  ├─ viewer/                 # Viewer 核心逻辑（与 UI 解耦）
│  │  ├─ SceneManager.ts      # Three.js 场景 / 相机 / 渲染管理
│  │  ├─ IfcLoader.ts         # 封装 web-ifc-three 的 IFCLoader
│  │  ├─ IfcSelection.ts      # 构件拾取与选中逻辑
│  │  ├─ IfcProperties.ts     # 构件属性 & 空间结构查询
│  │  └─ IfcViewer.ts         # 组合上述模块，对外提供统一 Viewer API
│  │
│  ├─ three-fix/              # 针对 Three.js 示例工具的适配
│  │  ├─ BufferGeometryUtils.ts
│  │  └─ three-examples.d.ts
│  │
│  └─ assets/                 # 静态资源（如有）
│
├─ src-tauri/                 # Tauri 桌面封装相关
│  ├─ src/
│  │  ├─ main.rs
│  │  └─ lib.rs
│  ├─ tauri.conf.json
│  └─ ...
│
├─ index.html
├─ vite.config.ts             # Vite 配置（含 three BufferGeometryUtils 别名）
├─ tsconfig*.json
├─ package.json
├─ package-lock.json
└─ pnpm-lock.yaml
```

---

## 核心模块说明

### `src/viewer`

- **SceneManager**
  - 创建 Three.js 场景、相机、渲染器、OrbitControls。
  - 管理渲染循环与窗口尺寸变化（`ResizeObserver` + `window.resize`）。
  - 封装裁剪平面设置，用于剖切功能。

- **IfcLoaderWrapper**（`IfcLoader.ts`）
  - 基于 `web-ifc-three` 的 `IFCLoader`。
  - 设置 WASM 路径：`/web-ifc/web-ifc.wasm`（通过 `setWasmPath('/web-ifc/')`）。
  - 集成 `three-mesh-bvh`（`computeBoundsTree` / `acceleratedRaycast` 等）以提升拾取与几何性能。
  - 负责：
    - 从本地 `File` 对象异步加载 IFC 模型
    - 管理 `modelID` 与 Three.js 场景中的模型对象
    - 清理 / 释放旧模型

- **IfcProperties**
  - 通过 `web-ifc` Manager 获取：
    - 单构件属性 (`getItemProperties`)
    - 属性集 (`getPropertySets`)
    - 类型属性 (`getTypeProperties`)
    - 材质信息 (`getMaterialsProperties`)
  - 提供 `getSpatialStructure` 获取空间结构树，用于构件浏览器。

- **IfcSelection**
  - 监听 3D 画布的 `pointerdown` 事件。
  - 使用 Three.js `Raycaster` 射线检测点击到的 Mesh。
  - 使用 `web-ifc` Manager 的 `getExpressId` 从几何/面索引计算 IFC 构件 ID。
  - 将选中 ID 回调给上层（`IfcViewer`）。

- **IfcViewer**
  - 对外的 Viewer 总入口。
  - 内部组合：`SceneManager` + `IfcLoaderWrapper` + `IfcSelection` + `IfcProperties`。
  - 提供能力：
    - `loadIfcFile(file: File)`：加载 IFC 模型，回调加载进度、完成事件与空间结构树。
    - `selectElementById(expressID: number)`：按 ExpressID 选中构件。
    - `enableSectionPlane(active: boolean)` / `setSectionOffset(offset: number)`：剖切控制。
    - 通过回调向 React 层抛出：选中变化 / 空间树 / 错误信息等。

### `src/components`

- **ViewerCanvas**
  - React 组件，负责创建 / 挂载 / 销毁 `IfcViewer` 实例。
  - 将 `IfcViewerCallbacks` 映射为 React 状态（选中构件、空间树、加载进度等）。

- **Toolbar**
  - 顶部工具栏 UI。
  - 打开本地 IFC 文件（隐藏 `<input type="file" />`）。
  - 剖切开关与剖切偏移滑块。
  - 右侧显示当前加载进度或「就绪」。

- **TreeView**
  - 将空间结构树渲染为可展开 / 折叠的树形列表。
  - 点击节点时触发回调，联动 3D Viewer 选中对应构件。

- **PropertyPanel**
  - Tab 形式的属性浏览器（基本信息 / 属性集 / 类型 / 材质）。
  - 将 `ElementProperties` 以较友好的方式展示，属性集等以 JSON 预格式化展示。

---

## Tauri 桌面封装

`src-tauri` 目录中包含 Tauri 应用配置与 Rust 入口文件，可将当前 React + Vite 应用打包为桌面应用：

- `src-tauri/tauri.conf.json`：Tauri 配置（窗口、打包等）。
- `src-tauri/src/main.rs`、`lib.rs`：Tauri 启动入口。

开发 / 构建命令见上文的 `tauri:dev` / `tauri:build`。

---

## 后续扩展方向

本项目已具备基础的工程级 Viewer 能力，可在此基础上进一步扩展：

- 模型显隐 / 隔离、按类型过滤
- 多模型管理 / 模型对比
- 大模型分块加载 / 几何缓存
- WebView / 桌面插件通信（如 GstarBIM / Revit 插件）
- 登录、云端模型管理等业务功能

更详细的背景与设计思路可参考仓库中的 **`ifc开发文档.md`**。

