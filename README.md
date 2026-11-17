# 配置档案（Configuration profiles）

DSH 侧栏面板：把当前**启用的插件组合**存成一份命名档案（如「开发代码」「开发插件」「其它」），
需要时一键切回；也支持导入/导出 JSON，以及一键恢复官方默认配置。

## 能力

| 操作 | 说明 |
| --- | --- |
| 保存当前为档案 | 记录当前每个 bundle 的启用状态，可自行命名 |
| 应用 | 只对差异项调用 `pluginManager.setBundleEnabled`，逐项执行并汇总结果 |
| 自动备份 | 每次应用/恢复之前，自动把当前状态存成一份「自动备份」档案 |
| 导出 / 导入 | 单文件 JSON（`{ kind: "dsh-config-profiles", version: 1, profiles: [...] }`），可整份或单份导出 |
| 恢复官方默认 | 启用随 DSH 提供且默认列出的 bundle，停用其余（本插件自身永不停止，否则界面会消失） |
| 重命名 / 删除 | 档案名可随时修改；删除有二次确认 |

## 数据与安全

- 档案存在浏览器 `localStorage` 的 `dsh-config-profiles/v1` 键下，导出文件可跨机器迁移。
- 配置变更是通过 DSH 内置的 `pluginManager` 服务完成的（与插件管理面板同一套路径），
  不直接改写 profile 的 `package.json` / `cordis.patch.yml`。
- 部分改动返回 `restart-required`：面板会提示「部分改动需要重启 DSH 才能完全生效」。

## Requirements

- DSH（`engines.dsh`）：`>=0.2.2-rc.1 <0.3.0-0`
  （面板用到的 `sidebar.panellist` 槽位是 0.2.x 中后段才有的，0.2.0/0.2.1 上别指望能挂上。）
- 客户端半边（侧栏面板）需要 Web GUI；安装后刷新页面才会出现图标。
- `peerDependencies` 里声明了 `@deepseek-ai/dsh-client-ui-sidebar`、`@deepseek-ai/dsh-client-ui-layout`，
  并标为 `optional`：它们是**宿主内置的虚拟模块**，不是 npm 包，所以不能让 pnpm 自动装一份副本，
  只作为版本契约留档。

## 开发与升级

面板底部有「开发诊断」一行：

| 控件 | 作用 |
| --- | --- |
| 版本 | 显示 `PLUGIN_VERSION`（在 `client.js` 顶部，**改代码时同步改**） |
| 检查更新 | 读 `UPDATE_FEED` 指向的 JSON，与本地版本比对；未配置时明确提示「未配置更新源」而不是静默失败 |
| 重新加载界面 | `window.location.reload()`；因为本插件用 `link:` 挂载，改完代码刷新即生效，不用重装 |
| 复制诊断 | 把插件名/版本/启用数/档案数/locale 绑定状态/最后一条错误复制到剪贴板，排障时直接贴 |

### 更新源怎么配

仓库根目录的 `version.json` 就是更新源格式：

```json
{ "version": "0.1.0", "notes": "…", "source": "https://github.com/<owner>/<repo>" }
```

发版流程：

1. 改 `package.json` 的 `version`、`client.js` 里的 `PLUGIN_VERSION`、`version.json` 的 `version` —— **三处必须一致**；
2. 把 `client.js` 里的 `UPDATE_FEED` 设成该文件的 raw 地址，例如
   `https://raw.githubusercontent.com/<owner>/<repo>/main/version.json`；
3. 提交并推 tag（`git tag v0.1.0 && git push --tags`）。

`UPDATE_FEED` 为空 = 不检查，面板上会明说「未配置更新源」。

升级注意：

- 本包 `private: true` + profile 用 `link:` 指向本目录，**目录不能删、不能改名**，否则 bundle 解析不到。
- 改完 `client.js` 只需刷新页面；改 `index.js` 或 `package.json`（含 `engines`/`peerDependencies`）建议重启 DSH。


## 安装

在本机 DSH 里用 `plugin_manager` 的 `install_bundle`，target 指向本目录绝对路径：

```
D:\Documents\deepseek-harness\default-workspace\plugins\config-profiles
```

安装后侧栏面板图标区出现「配置档案」图标；客户端插件需要刷新页面。
