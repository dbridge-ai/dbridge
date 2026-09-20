# DBridge Community 多平台构建/打包/发布脚本

## 前置要求

| 工具 | 用途 | 安装 |
|------|------|------|
| Go | 编译后端 | https://go.dev/dl/ |
| Node.js | 编译前端 | https://nodejs.org/ |
| zig | CGO 交叉编译器 | https://ziglang.org/download/ |
| gh | 发布到 GitHub Release | https://cli.github.com/ |

安装后验证：

```bash
zig version
gh auth status
```

### macOS SDK（交叉编译 darwin 平台时可选）

Zig 0.14+ 内置了 macOS 系统头文件，**大多数情况下不需要额外安装 SDK**。

如果编译 darwin 目标时报错（如 `undefined symbol` 等链接错误），可以安装 macOS SDK：

```bash
scripts/setup-darwin-sdk.sh           # 下载到 .sdk/MacOSX15.5.sdk
export SDKROOT="$(pwd)/.sdk/MacOSX15.5.sdk"
```

建议将 `export SDKROOT=...` 添加到 `~/.bashrc` 或 `~/.zshrc`。

如果只编译 Linux/Windows 目标，完全不需要此 SDK。

## 支持的平台

| 平台标识 | 目标系统 | 归档格式 |
|----------|---------|---------|
| `linux-amd64` | Linux x86_64 | tar.gz |
| `linux-arm64` | Linux ARM64 | tar.gz |
| `darwin-amd64` | macOS Intel | tar.gz |
| `darwin-arm64` | macOS Apple Silicon | tar.gz |
| `windows-amd64` | Windows x86_64 | zip |

特殊值：
- `native` — 当前主机平台（默认）
- `all` — 全部 5 个平台

## 脚本说明

### 1. build.sh — 交叉编译

```bash
scripts/build.sh [平台] [版本号]
```

- 通过 `zig cc` 实现 CGO_ENABLED=1 交叉编译
- 前端只编译一次（所有平台共享 `web/dist/`）
- 输出：`dist/release/{平台}/dbridge`

```bash
scripts/build.sh linux-arm64 0.0.6    # 编译单个平台
scripts/build.sh all 0.0.6            # 编译全部平台
scripts/build.sh                       # 编译当前平台，版本从 git tag 获取
```

### 2. package.sh — 打包

```bash
scripts/package.sh [平台] [版本号]
```

- 读取 `dist/release/{平台}/` 下的二进制文件
- 打包结构与 CI 一致：
  - **tar.gz**（Linux/macOS）：含顶层目录，包含 `dbridge`、`web/dist/`、`configs/`、shell 脚本
  - **zip**（Windows）：扁平结构
- 输出：`dist/release/dbridge_{版本}_{平台}.{tar.gz|zip}`

```bash
scripts/package.sh linux-arm64 0.0.6
scripts/package.sh all 0.0.6
```

### 3. publish.sh — 发布

```bash
scripts/publish.sh [平台] [版本号]
```

- 通过 `gh release upload` 上传到 GitHub Release
- Release 不存在时自动创建
- 内置重试机制：3 次尝试，指数退避（5s → 15s → 45s）
- 支持重复上传（`--clobber`），不会因文件已存在而报错

```bash
scripts/publish.sh linux-arm64 0.0.6    # 发布单个平台
scripts/publish.sh all 0.0.6            # 发布全部平台
```

### 4. release.sh — 一键发布（编排脚本）

```bash
scripts/release.sh [平台] [版本号] [--publish-only]
```

默认流程：`build → package → publish`

```bash
scripts/release.sh all 0.0.6                # 完整流程
scripts/release.sh all 0.0.6 --publish-only # 跳过编译打包，仅发布
```

## 常见场景

### 全量发布

```bash
scripts/release.sh all 0.0.6
```

### 单平台补发

某个平台构建或发布失败时，单独重试：

```bash
scripts/build.sh linux-arm64 0.0.6
scripts/package.sh linux-arm64 0.0.6
scripts/publish.sh linux-arm64 0.0.6
```

### 网络不稳定，仅重新发布

已打包好的制品无需重新编译，直接重新上传：

```bash
scripts/publish.sh all 0.0.6
# 或
scripts/release.sh all 0.0.6 --publish-only
```

### 只编译不发布

```bash
scripts/build.sh all 0.0.6
scripts/package.sh all 0.0.6
# 检查产物后手动发布
scripts/publish.sh all 0.0.6
```

## 目录结构

```
dist/release/
├── linux-amd64/
│   └── dbridge                        # 编译产物
├── linux-arm64/
│   └── dbridge
├── darwin-amd64/
│   └── dbridge
├── darwin-arm64/
│   └── dbridge
├── windows-amd64/
│   └── dbridge.exe
├── dbridge_0.0.6_linux-amd64.tar.gz    # 打包产物
├── dbridge_0.0.6_linux-arm64.tar.gz
├── dbridge_0.0.6_darwin-amd64.tar.gz
├── dbridge_0.0.6_darwin-arm64.tar.gz
└── dbridge_0.0.6_windows-amd64.zip
```
