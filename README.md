# 配置档案 · DSH Configuration Profiles

[![ci](https://github.com/agentsgater/dsh-config-profiles/actions/workflows/ci.yml/badge.svg)](https://github.com/agentsgater/dsh-config-profiles/actions/workflows/ci.yml)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![DSH](https://img.shields.io/badge/DSH-%3E%3D0.2.2--rc.1-1f6feb)](https://github.com/deepseek-ai/deepseek-harness)

DeepSeek Harness 的侧栏面板：把当前**启用的插件组合**存成一份命名档案（如「开发代码」「开发插件」「其它」），
需要时一键切回；也支持导入/导出 JSON，以及一键恢复官方默认配置。

- 仓库：<https://github.com/agentsgater/dsh-config-profiles>
- 宿主要求：DSH `>=0.2.2-rc.1 <0.3.0-0`

## 能力

| 操作 | 说明 |
| --- | --- |
| 保存当前为档案 | 记录当前每个 bundle 的启用状态，可自行命名 |
| 应用 | 只对差异项调用 `pluginManager.setBundleEnabled`，逐项执行并汇总结果 |
| 自动备份 | 每次应用/恢复之前，自动把当前状态存成一份「自动备份」档案 |
| 导出 / 导入 | 单文件 JSON（`{ kind: "dsh-config-profiles", version: 1, profiles: [...] }`），可整份或单份导出 |
| 恢复官方默认 | 启用随 DSH 提供且默认列出的 bundle，停用其余（本插件自身永不停止，否则界面会消失） |
| 重命名 / 删除 | 档案名可随时修改；删除有二次确认 |

## 安装

这是一个通过本地路径挂载的 DSH bundle（`private: true`，暂未发布到 npm）：

```text
plugin_manager install_bundle target=D:\path\to\config-profiles
```

安装后侧栏面板图标区出现「配置档案」图标；**客户端插件需要刷新页面**。

## 兼容性

- `engines.dsh`：`>=0.2.2-rc.1 <0.3.0-0`
  （面板用到的 `sidebar.panellist` 槽位是 0.2.x 中后段才有的，0.2.0 / 0.2.1 上挂不上。）
- 客户端半边需要 Web GUI。
- `peerDependencies` 里声明了 `@deepseek-ai/dsh-client-ui-sidebar`、`@deepseek-ai/dsh-client-ui-layout`，
  并标为 `optional`：它们是**宿主内置的虚拟模块**，不是 npm 包，不能也不该让 pnpm 再装一份副本，
  只作为版本契约留档。

## 开发与升级

面板底部有「开发诊断」一行：

| 控件 | 作用 |
| --- | --- |
| 版本 | 显示 `PLUGIN_VERSION`（在 `client.js` 顶部，**改代码时同步改**） |
| 检查更新 | 读 `UPDATE_FEED` 指向的 JSON 与本地版本比对；未配置时明确提示「未配置更新源」，不静默失败 |
| 重新加载界面 | `window.location.reload()`；本地 `link:` 挂载时改完代码刷新即生效，无需重装 |
| 复制诊断 | 插件名 / 版本 / 启用数 / 档案数 / locale 绑定状态 / 最后一条错误 → 剪贴板 |

### 更新源

仓库根目录的 `version.json` 就是更新源：

```json
{ "version": "0.1.0", "notes": "…", "source": "https://github.com/agentsgater/dsh-config-profiles" }
```

`client.js` 里的 `UPDATE_FEED` 指向它的 raw 地址：

```js
const UPDATE_FEED = 'https://raw.githubusercontent.com/agentsgater/dsh-config-profiles/main/version.json'
```

### 发版流程

1. 三处版本号同步：`package.json` 的 `version`、`client.js` 的 `PLUGIN_VERSION`、`version.json` 的 `version`；
2. 提交并打 tag：`git tag v0.1.0 && git push --tags`；
3. 在 GitHub 上发布对应的 Release（CI 会校验三处版本一致）。

### 本地开发

```powershell
node --check client.js
node --check index.js
# 改完 client.js 刷新页面即可；改 index.js / package.json 建议重启 DSH
```

## 目录结构

```text
client.js           客户端半边（React 面板、槽位注册、i18n）
index.js            宿主半边（空 apply()，配置变更全部走 pluginManager）
cordis.patch.yml    bundle 层：insert 一行 id=dsh-config-profiles
package.json        清单：dsh.bundle.patch / dsh.client.inject / engines / peerDependencies
version.json        更新源（版本号 + 说明 + 仓库地址）
locale/{zh,en}.json 界面文案
.github/workflows/  CI：语法、JSON、版本一致性、清单契约
```

## 许可

[MIT](LICENSE)
