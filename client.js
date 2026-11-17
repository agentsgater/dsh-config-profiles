window.__ModuleLoader__.load({
  id: '@local/dsh-config-profiles',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    const NS = 'dsh-config-profiles'
    const SELF = '@local/dsh-config-profiles'
    const STORAGE_KEY = 'dsh-config-profiles/v1'
    const FILE_KIND = 'dsh-config-profiles'
    /* Keep in sync with package.json version; shown in the dev footer. */
    const PLUGIN_VERSION = '0.1.0'
    /*
     * Update feed: a JSON document shaped { version, notes?, url? } published from
     * this plugin's repository (see README "开发与升级"). Leave empty to disable the
     * check and show "update source not configured" instead of failing silently.
     */
    const UPDATE_FEED = ''

    function cmpVersion(a, b) {
      const split = (v) => String(v || '').replace(/^v/, '').split('-')
      const [aCore, aPre] = split(a)
      const [bCore, bPre] = split(b)
      const an = aCore.split('.').map((n) => parseInt(n, 10) || 0)
      const bn = bCore.split('.').map((n) => parseInt(n, 10) || 0)
      for (let i = 0; i < Math.max(an.length, bn.length); i++) {
        const d = (an[i] || 0) - (bn[i] || 0)
        if (d !== 0) return d > 0 ? 1 : -1
      }
      if (aPre === bPre) return 0
      if (!aPre) return 1
      if (!bPre) return -1
      return aPre > bPre ? 1 : -1
    }

    const zh = {
      open: '配置档案',
      title: '配置档案',
      subtitle: '把当前启用的插件组合存成命名档案，一键切换；也可恢复官方默认。',
      close: '关闭',
      refresh: '刷新',
      save: '保存当前为档案',
      namePlaceholder: '给这套配置起个名，如「开发代码」',
      apply: '应用',
      applying: '应用中…',
      rename: '重命名',
      remove: '删除',
      confirmRemove: '确认删除',
      cancel: '取消',
      exportAll: '导出全部',
      importFile: '导入文件',
      restoreDefault: '恢复官方默认',
      confirmRestore: '确认恢复',
      restoreHint: '将启用随 DSH 提供的默认插件，并停用其余插件（本插件自身除外）。',
      empty: '还没有档案。先起个名字，把当前配置存下来。',
      currentCount: '当前启用',
      bundleUnit: '个插件',
      savedAt: '保存于',
      applied: '已应用',
      failed: '失败',
      restartNeeded: '部分改动需要重启 DSH 才能完全生效。',
      noChange: '当前配置与档案一致，无需改动。',
      remoteUnavailable: '插件管理服务不可用，无法读取或修改配置。',
      loadFailed: '读取插件列表失败',
      unknown: '操作失败，未返回原因',
      nameRequired: '请先填写档案名称。',
      nameDuplicate: '已存在同名档案，请换一个名字。',
      importFailed: '导入失败：文件格式无法识别。',
      imported: '已导入',
      exported: '已导出',
      archiveUnit: '份档案',
      autoBackup: '自动备份',
      included: '启用',
      excluded: '停用',
      details: '详情',
      hideDetails: '收起详情',
      devFooter: '开发诊断',
      versionLabel: '版本',
      reloadUi: '重新加载界面',
      copyDiag: '复制诊断',
      copied: '诊断信息已复制',
      checkUpdate: '检查更新',
      updateNone: '已是最新版本',
      updateAvailable: '发现新版本',
      updateSourceMissing: '未配置更新源（client.js 里的 UPDATE_FEED 为空）',
      updateFailed: '检查更新失败（网络或格式问题）',
    }

    const en = {
      open: 'Configuration profiles',
      title: 'Configuration profiles',
      subtitle: 'Save the enabled plugin set as a named profile, switch in one click, or restore the official defaults.',
      close: 'Close',
      refresh: 'Refresh',
      save: 'Save current as profile',
      namePlaceholder: 'Name this configuration, e.g. "Development"',
      apply: 'Apply',
      applying: 'Applying…',
      rename: 'Rename',
      remove: 'Delete',
      confirmRemove: 'Confirm delete',
      cancel: 'Cancel',
      exportAll: 'Export all',
      importFile: 'Import file',
      restoreDefault: 'Restore official defaults',
      confirmRestore: 'Confirm restore',
      restoreHint: 'Enables the plugins shipped and enabled by default, and disables the rest (this plugin stays).',
      empty: 'No profiles yet. Name one and save the current configuration.',
      currentCount: 'Enabled now',
      bundleUnit: 'plugins',
      savedAt: 'Saved',
      applied: 'applied',
      failed: 'failed',
      restartNeeded: 'Some changes need a DSH restart to take full effect.',
      noChange: 'This configuration already matches the profile.',
      remoteUnavailable: 'The plugin management service is unavailable.',
      loadFailed: 'Failed to read the plugin list',
      unknown: 'The operation failed without a reason',
      nameRequired: 'Enter a profile name first.',
      nameDuplicate: 'A profile with that name already exists.',
      importFailed: 'Import failed: unrecognized file format.',
      imported: 'imported',
      exported: 'exported',
      archiveUnit: 'profiles',
      autoBackup: 'Auto backup',
      included: 'enabled',
      excluded: 'disabled',
      details: 'Details',
      hideDetails: 'Hide details',
      devFooter: 'Dev & diagnostics',
      versionLabel: 'version',
      reloadUi: 'Reload UI',
      copyDiag: 'Copy diagnostics',
      copied: 'Diagnostics copied',
      checkUpdate: 'Check for updates',
      updateNone: 'Already up to date',
      updateAvailable: 'Update available',
      updateSourceMissing: 'No update source configured (UPDATE_FEED is empty in client.js)',
      updateFailed: 'Update check failed (network or format)',
    }

    /* ---------------------------------------------------------------- state */

    let store = {
      open: false,
      loading: true,
      error: '',
      bundles: [],
      archives: [],
      draftName: '',
      busy: '',
      message: '',
      rename: null,
      confirmRemove: null,
      confirmRestore: false,
      details: '',
      updateText: '',
    }
    const listeners = new Set()
    function emit() {
      for (const listener of Array.from(listeners)) {
        try {
          listener()
        } catch (error) {
          /* a broken subscriber must not stop the rest */
        }
      }
    }
    function patch(next) {
      store = Object.assign({}, store, next)
      emit()
    }
    function snapshot(key) {
      return key === undefined ? store : store[key]
    }

    /* -------------------------------------------------------------- storage */

    function readArchives() {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY)
        if (!raw) return []
        const parsed = JSON.parse(raw)
        if (!parsed || !Array.isArray(parsed.profiles)) return []
        return parsed.profiles
          .filter((item) => item && typeof item.name === 'string' && item.bundles && typeof item.bundles === 'object')
          .map((item) => ({
            id: String(item.id || item.name),
            name: item.name,
            createdAt: Number(item.createdAt) || Date.now(),
            bundles: item.bundles,
          }))
      } catch (error) {
        return []
      }
    }

    function writeArchives(list) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, profiles: list }))
      } catch (error) {
        /* storage may be full or blocked; the in-memory list still works this session */
      }
      patch({ archives: list })
    }

    /* ------------------------------------------------------------- remote */

    function endpoint() {
      return ctxRef.get('remote.pluginManager')
    }

    function requireRemote() {
      const remote = endpoint()
      if (!remote) throw new Error(dict().remoteUnavailable)
      return remote
    }

    function errorText(error) {
      if (!error) return ''
      if (typeof error === 'string') return error
      if (typeof error.message === 'string') return error.message
      if (typeof error.reason === 'string') return error.reason
      if (typeof error.code === 'string') return error.code
      return ''
    }

    function unwrap(result) {
      if (result && typeof result === 'object' && typeof result.ok === 'boolean') {
        if (result.ok) return result.value
        throw new Error(errorText(result.error) || dict().unknown)
      }
      return result
    }

    /* --------------------------------------------------------------- i18n */

    let ctxRef = null
    let translate = null

    function activeLocale() {
      const locale = ctxRef && ctxRef.get('locale')
      if (locale) {
        try {
          return locale.getLocale().active || ''
        } catch (error) {
          /* fall through */
        }
      }
      if (typeof document !== 'undefined' && document.documentElement && document.documentElement.lang) {
        return document.documentElement.lang
      }
      return (typeof navigator !== 'undefined' && navigator.language) || ''
    }

    function dict() {
      return String(activeLocale()).toLowerCase().startsWith('zh') ? zh : en
    }

    function t(key) {
      if (translate) {
        try {
          const value = translate(key)
          if (value && value !== key) return value
        } catch (error) {
          /* fall through */
        }
      }
      return dict()[key] || key
    }

    function localized(value) {
      if (typeof value === 'string') return value
      if (!value || typeof value !== 'object') return ''
      const active = String(activeLocale()).toLowerCase()
      if (active.startsWith('zh') && typeof value.zh === 'string') return value.zh
      if (typeof value.en === 'string') return value.en
      for (const key of Object.keys(value)) {
        if (typeof value[key] === 'string') return value[key]
      }
      return ''
    }

    function displayName(bundle) {
      return localized(bundle.meta && bundle.meta.title) || bundle.name
    }

    /* ------------------------------------------------------------ mutations */

    function currentState(bundles) {
      const map = {}
      for (const bundle of bundles) map[bundle.name] = Boolean(bundle.enabled)
      return map
    }

    function enabledNames(bundles) {
      return bundles.filter((bundle) => bundle.enabled).map((bundle) => bundle.name)
    }

    /**
     * The official default set: bundles that ship with the installation and are
     * listed by default. Everything else is off, except this plugin itself,
     * which must stay enabled or the UI would disappear after a restore.
     */
    function officialDefaults(bundles) {
      const target = {}
      for (const bundle of bundles) {
        const officialDefault =
          bundle.official === true &&
          bundle.availability === 'installation' &&
          bundle.listedByDefault !== false
        target[bundle.name] = officialDefault || bundle.name === SELF
      }
      return target
    }

    async function refresh() {
      try {
        const bundles = unwrap(await requireRemote().listBundles()) || []
        patch({ bundles: Array.isArray(bundles) ? bundles : [], loading: false, error: '' })
      } catch (error) {
        patch({ loading: false, error: errorText(error) || t('loadFailed') })
      }
    }

    function archiveById(id) {
      return store.archives.find((item) => item.id === id) || null
    }

    async function saveCurrent(name) {
      const trimmed = String(name || '').trim()
      if (!trimmed) return patch({ message: t('nameRequired') })
      if (store.archives.some((item) => item.name.trim() === trimmed)) {
        return patch({ message: t('nameDuplicate') })
      }
      const archive = {
        id: trimmed + '·' + Date.now(),
        name: trimmed,
        createdAt: Date.now(),
        bundles: currentState(store.bundles),
      }
      writeArchives(store.archives.concat([archive]))
      patch({ draftName: '', message: t('savedAt') + ' ' + trimmed })
    }

    async function applyTargets(target, label) {
      if (store.busy) return
      let remote
      try {
        remote = requireRemote()
      } catch (error) {
        patch({ message: errorText(error) || t('remoteUnavailable') })
        return
      }
      const current = currentState(store.bundles)
      const changes = []
      for (const name of Object.keys(target)) {
        if (Object.prototype.hasOwnProperty.call(current, name) && current[name] === target[name]) continue
        changes.push({ name, enabled: Boolean(target[name]) })
      }

      if (changes.length === 0) {
        patch({ message: t('noChange') })
        return
      }

      // Auto backup before every applied change, so the user can always go back.
      const backup = {
        id: t('autoBackup') + '·' + Date.now(),
        name: t('autoBackup') + ' ' + new Date().toLocaleString(),
        createdAt: Date.now(),
        bundles: currentState(store.bundles),
      }
      writeArchives(store.archives.concat([backup]))

      patch({ busy: label, message: '' })
      let applied = 0
      let failed = 0
      let restart = false
      for (const change of changes) {
        try {
          const result = unwrap(await remote.setBundleEnabled(change.name, change.enabled))
          if (result && result.application === 'failed') failed += 1
          else applied += 1
          if (result && result.application === 'restart-required') restart = true
        } catch (error) {
          failed += 1
        }
      }
      await refresh()
      patch({
        busy: '',
        message: label + '：' + applied + ' ' + t('applied') + (failed ? ' / ' + failed + ' ' + t('failed') : ''),
        restartNeeded: restart,
      })
    }

    async function applyArchive(id) {
      const archive = archiveById(id)
      if (!archive) return
      await applyTargets(archive.bundles, t('apply'))
    }

    async function restoreOfficial() {
      await applyTargets(officialDefaults(store.bundles), t('restoreDefault'))
      patch({ confirmRestore: false })
    }

    function removeArchive(id) {
      writeArchives(store.archives.filter((item) => item.id !== id))
      patch({ confirmRemove: null })
    }

    function renameArchive(id, name) {
      const trimmed = String(name || '').trim()
      if (!trimmed) return patch({ rename: null })
      writeArchives(
        store.archives.map((item) => (item.id === id ? Object.assign({}, item, { name: trimmed }) : item)),
      )
      patch({ rename: null })
    }

    function exportArchive(archive) {
      downloadJson(
        'dsh-config-profile-' + safeFile(archive.name) + '.json',
        { kind: FILE_KIND, version: 1, profiles: [archive] },
      )
    }

    function exportAll() {
      if (!store.archives.length) return
      downloadJson(
        'dsh-config-profiles-' + new Date().toISOString().slice(0, 10) + '.json',
        { kind: FILE_KIND, version: 1, profiles: store.archives },
      )
      patch({ message: store.archives.length + ' ' + t('archiveUnit') + ' ' + t('exported') })
    }

    function safeFile(name) {
      return String(name).replace(/[\\/:*?"<>|\s]+/g, '-').slice(0, 60) || 'profile'
    }

    function downloadJson(fileName, payload) {
      try {
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const anchor = document.createElement('a')
        anchor.href = url
        anchor.download = fileName
        anchor.style.display = 'none'
        document.body.appendChild(anchor)
        anchor.click()
        document.body.removeChild(anchor)
        setTimeout(() => URL.revokeObjectURL(url), 1000)
      } catch (error) {
        patch({ message: errorText(error) || t('unknown') })
      }
    }

    async function importFile(file) {
      try {
        const text = await file.text()
        const parsed = JSON.parse(text)
        const incoming = Array.isArray(parsed)
          ? parsed
          : parsed && Array.isArray(parsed.profiles)
            ? parsed.profiles
            : []
        const valid = incoming.filter(
          (item) => item && typeof item.name === 'string' && item.bundles && typeof item.bundles === 'object',
        )
        if (!valid.length) return patch({ message: t('importFailed') })
        const existing = new Set(store.archives.map((item) => item.name))
        const added = valid.map((item, index) => {
          let name = item.name
          let counter = 2
          while (existing.has(name)) {
            name = item.name + ' (' + counter + ')'
            counter += 1
          }
          existing.add(name)
          return {
            id: name + '·' + Date.now() + '·' + index,
            name,
            createdAt: Number(item.createdAt) || Date.now(),
            bundles: item.bundles,
          }
        })
        writeArchives(store.archives.concat(added))
        patch({ message: added.length + ' ' + t('imported') })
      } catch (error) {
        patch({ message: t('importFailed') })
      }
    }

    /* -------------------------------------------------------------- styles */

    const CSS = `
.cfp-overlay{position:fixed;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.32);padding:24px}
.cfp-dialog{width:min(720px,94vw);max-height:82vh;display:flex;flex-direction:column;background:var(--dsh-surface,var(--surface,#fff));color:var(--dsh-text-primary,#1b1d22);border-radius:14px;border:1px solid var(--dsh-border,var(--border,rgba(0,0,0,.12)));box-shadow:0 18px 50px rgba(0,0,0,.22);overflow:hidden}
.cfp-head{display:flex;align-items:flex-start;gap:12px;padding:18px 20px 12px}
.cfp-titles{flex:1;min-width:0}
.cfp-title{font-size:16px;font-weight:600;margin:0}
.cfp-sub{margin:4px 0 0;font-size:12.5px;line-height:1.6;opacity:.72}
.cfp-icon{width:30px;height:30px;border-radius:9px;display:flex;align-items:center;justify-content:center;background:var(--dsh-accent-weak,rgba(75,107,251,.14));color:var(--dsh-accent,#4b6bfb);flex:none}
.cfp-close{background:transparent;border:0;color:inherit;opacity:.6;cursor:pointer;padding:6px;border-radius:8px;line-height:0}
.cfp-close:hover{opacity:1;background:var(--dsh-hover,rgba(0,0,0,.06))}
.cfp-bar{display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:0 20px 12px}
.cfp-input{flex:1;min-width:200px;padding:8px 10px;border-radius:8px;border:1px solid var(--dsh-border,var(--border,rgba(0,0,0,.16)));background:transparent;color:inherit;font-size:13px}
.cfp-btn{display:inline-flex;align-items:center;gap:6px;padding:7px 12px;border-radius:8px;border:1px solid var(--dsh-border,var(--border,rgba(0,0,0,.16)));background:transparent;color:inherit;font-size:12.5px;cursor:pointer;white-space:nowrap}
.cfp-btn:hover:not(:disabled){background:var(--dsh-hover,rgba(0,0,0,.06))}
.cfp-btn:disabled{opacity:.5;cursor:default}
.cfp-btn.primary{border-color:transparent;background:var(--dsh-accent,#4b6bfb);color:#fff}
.cfp-btn.primary:hover:not(:disabled){filter:brightness(1.06);background:var(--dsh-accent,#4b6bfb)}
.cfp-btn.danger{color:#d64545;border-color:rgba(214,69,69,.4)}
.cfp-note{margin:0 20px 10px;padding:8px 10px;border-radius:8px;font-size:12.5px;background:var(--dsh-accent-weak,rgba(75,107,251,.12));color:inherit}
.cfp-note.warn{background:rgba(240,160,40,.16)}
.cfp-body{flex:1;overflow:auto;padding:4px 20px 20px}
.cfp-row{display:flex;align-items:flex-start;gap:12px;padding:12px;border-radius:10px;border:1px solid var(--dsh-border,var(--border,rgba(0,0,0,.1)));margin-bottom:8px}
.cfp-row-main{flex:1;min-width:0}
.cfp-name{font-size:13.5px;font-weight:600}
.cfp-meta{font-size:12px;opacity:.66;margin-top:3px}
.cfp-actions{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}
.cfp-empty{padding:28px 8px;text-align:center;font-size:13px;opacity:.66}
.cfp-detail{margin-top:8px;font-size:12px;line-height:1.7;max-height:160px;overflow:auto;border-top:1px dashed var(--dsh-border,rgba(0,0,0,.14));padding-top:8px}
.cfp-chip{display:inline-block;margin:0 4px 4px 0;padding:2px 7px;border-radius:999px;font-size:11.5px;background:var(--dsh-hover,rgba(0,0,0,.06))}
.cfp-chip.off{opacity:.55;text-decoration:line-through}
`

    function Styles() {
      return h('style', { 'data-dsh-config-profiles': '1' }, CSS)
    }

    /* --------------------------------------------------------------- icons */

    function LayersGlyph(props) {
      const size = (props && props.size) || 16
      return h(
        'svg',
        {
          width: size,
          height: size,
          viewBox: '0 0 24 24',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.8,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          'aria-hidden': 'true',
        },
        h('path', { d: 'M4 7h16M4 12h16M4 17h16' }),
        h('circle', { cx: 7, cy: 7, r: 1.1, fill: 'currentColor', stroke: 'none' }),
        h('circle', { cx: 7, cy: 12, r: 1.1, fill: 'currentColor', stroke: 'none' }),
        h('circle', { cx: 7, cy: 17, r: 1.1, fill: 'currentColor', stroke: 'none' }),
      )
    }

    function CloseGlyph() {
      return h(
        'svg',
        {
          width: 15,
          height: 15,
          viewBox: '0 0 24 24',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.9,
          strokeLinecap: 'round',
          'aria-hidden': 'true',
        },
        h('path', { d: 'M6 6l12 12M18 6L6 18' }),
      )
    }

    /* ----------------------------------------------------------- components */

    function useStore() {
      const [, force] = React.useState(0)
      React.useEffect(() => {
        const listener = () => force((value) => value + 1)
        listeners.add(listener)
        return () => listeners.delete(listener)
      }, [])
      return snapshot()
    }

    function ArchiveRow(props) {
      const archive = props.archive
      const state = snapshot()
      const renaming = state.rename && state.rename.id === archive.id
      const confirming = state.confirmRemove === archive.id
      const entries = Object.keys(archive.bundles || {})
      const on = entries.filter((name) => archive.bundles[name])
      const expanded = state.details === archive.id

      return h(
        'div',
        { className: 'cfp-row' },
        h(
          'div',
          { className: 'cfp-row-main' },
          renaming
            ? h('input', {
                className: 'cfp-input',
                value: state.rename.value,
                autoFocus: true,
                onChange: (event) => patch({ rename: { id: archive.id, value: event.target.value } }),
                onKeyDown: (event) => {
                  if (event.key === 'Enter') renameArchive(archive.id, state.rename.value)
                  if (event.key === 'Escape') patch({ rename: null })
                },
              })
            : h('div', { className: 'cfp-name' }, archive.name),
          h(
            'div',
            { className: 'cfp-meta' },
            on.length + ' ' + t('bundleUnit') + ' · ' + t('savedAt') + ' ' + new Date(archive.createdAt).toLocaleString(),
          ),
          expanded
            ? h(
                'div',
                { className: 'cfp-detail' },
                entries.map((name) =>
                  h(
                    'span',
                    { key: name, className: 'cfp-chip' + (archive.bundles[name] ? '' : ' off'), title: name },
                    shortName(name),
                  ),
                ),
              )
            : null,
        ),
        h(
          'div',
          { className: 'cfp-actions' },
          renaming
            ? [
                h(
                  'button',
                  { key: 'ok', className: 'cfp-btn primary', onClick: () => renameArchive(archive.id, state.rename.value) },
                  t('apply'),
                ),
                h('button', { key: 'no', className: 'cfp-btn', onClick: () => patch({ rename: null }) }, t('cancel')),
              ]
            : [
                h(
                  'button',
                  {
                    key: 'apply',
                    className: 'cfp-btn primary',
                    disabled: Boolean(state.busy),
                    onClick: () => applyArchive(archive.id),
                  },
                  t('apply'),
                ),
                h(
                  'button',
                  {
                    key: 'toggle',
                    className: 'cfp-btn',
                    onClick: () => patch({ details: expanded ? '' : archive.id }),
                  },
                  expanded ? t('hideDetails') : t('details'),
                ),
                h(
                  'button',
                  {
                    key: 'export',
                    className: 'cfp-btn',
                    onClick: () => exportArchive(archive),
                  },
                  t('exportAll'),
                ),
                h(
                  'button',
                  {
                    key: 'rename',
                    className: 'cfp-btn',
                    onClick: () => patch({ rename: { id: archive.id, value: archive.name } }),
                  },
                  t('rename'),
                ),
                confirming
                  ? h(
                      'button',
                      { key: 'confirm', className: 'cfp-btn danger', onClick: () => removeArchive(archive.id) },
                      t('confirmRemove'),
                    )
                  : h(
                      'button',
                      {
                        key: 'remove',
                        className: 'cfp-btn danger',
                        onClick: () => patch({ confirmRemove: archive.id }),
                      },
                      t('remove'),
                    ),
              ],
        ),
      )
    }

    function shortName(name) {
      return String(name).replace(/^@[^/]+\//, '')
    }

    function ManagerOverlay() {
      const state = useStore()
      const fileRef = React.useRef(null)

      React.useEffect(() => {
        if (!state.open) return undefined
        const onKeyDown = (event) => {
          if (event.key === 'Escape') patch({ open: false, confirmRestore: false })
        }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
      }, [state.open])

      React.useEffect(() => {
        if (!state.open) return
        if (!state.bundles.length && !state.error) refresh()
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [state.open])

      if (!state.open) return null

      const enabled = state.bundles.filter((bundle) => bundle.enabled).length

      return h(
        'div',
        {
          className: 'cfp-overlay',
          onMouseDown: (event) => {
            if (event.target === event.currentTarget) patch({ open: false, confirmRestore: false })
          },
        },
        h(
          'div',
          { className: 'cfp-dialog', role: 'dialog', 'aria-label': t('title') },
          h(Styles),
          h(
            'div',
            { className: 'cfp-head' },
            h('div', { className: 'cfp-icon' }, h(LayersGlyph, { size: 17 })),
            h(
              'div',
              { className: 'cfp-titles' },
              h('h2', { className: 'cfp-title' }, t('title')),
              h('p', { className: 'cfp-sub' }, t('subtitle')),
            ),
            h(
              'button',
              { className: 'cfp-close', onClick: () => patch({ open: false, confirmRestore: false }), title: t('close') },
              h(CloseGlyph),
            ),
          ),
          h(
            'div',
            { className: 'cfp-bar' },
            h('input', {
              className: 'cfp-input',
              placeholder: t('namePlaceholder'),
              value: state.draftName,
              onChange: (event) => patch({ draftName: event.target.value }),
              onKeyDown: (event) => {
                if (event.key === 'Enter') saveCurrent(state.draftName)
              },
            }),
            h(
              'button',
              {
                className: 'cfp-btn primary',
                disabled: state.loading || Boolean(state.busy),
                onClick: () => saveCurrent(state.draftName),
              },
              t('save'),
            ),
            h(
              'button',
              {
                className: 'cfp-btn',
                disabled: state.loading || Boolean(state.busy),
                onClick: () => refresh(),
              },
              t('refresh'),
            ),
            h(
              'button',
              { className: 'cfp-btn', onClick: () => fileRef.current && fileRef.current.click() },
              t('importFile'),
            ),
            h(
              'button',
              { className: 'cfp-btn', disabled: !state.archives.length, onClick: exportAll },
              t('exportAll'),
            ),
            h(
              'button',
              {
                className: 'cfp-btn danger',
                disabled: state.loading || Boolean(state.busy),
                onClick: () => patch({ confirmRestore: true }),
              },
              t('restoreDefault'),
            ),
            h('input', {
              ref: fileRef,
              type: 'file',
              accept: 'application/json,.json',
              style: { display: 'none' },
              onChange: (event) => {
                const file = event.target.files && event.target.files[0]
                if (file) importFile(file)
                event.target.value = ''
              },
            }),
          ),
          state.confirmRestore
            ? h(
                'div',
                { className: 'cfp-note warn' },
                t('restoreHint') + ' ',
                h(
                  'button',
                  {
                    className: 'cfp-btn danger',
                    onClick: () => restoreOfficial(),
                  },
                  t('confirmRestore'),
                ),
                ' ',
                h('button', { className: 'cfp-btn', onClick: () => patch({ confirmRestore: false }) }, t('cancel')),
              )
            : null,
          state.error ? h('div', { className: 'cfp-note warn' }, state.error) : null,
          state.busy ? h('div', { className: 'cfp-note' }, state.busy) : null,
          state.message ? h('div', { className: 'cfp-note' }, state.message) : null,
          state.restartNeeded ? h('div', { className: 'cfp-note warn' }, t('restartNeeded')) : null,
          h(
            'div',
            { className: 'cfp-bar', style: { paddingTop: 0 } },
            h(
              'span',
              { className: 'cfp-meta', style: { marginTop: 0 } },
              t('currentCount') + ' ' + enabled + ' ' + t('bundleUnit') + ' · ' + state.bundles.length + ' ' + t('bundleUnit'),
            ),
          ),
          h(
            'div',
            { className: 'cfp-body' },
            state.loading
              ? h('div', { className: 'cfp-empty' }, '…')
              : state.archives.length === 0
                ? h('div', { className: 'cfp-empty' }, t('empty'))
                : state.archives
                    .slice()
                    .sort((a, b) => b.createdAt - a.createdAt)
                    .map((archive) => h(ArchiveRow, { key: archive.id, archive })),
          ),
          state.updateText ? h('div', { className: 'cfp-note' }, state.updateText) : null,
          h(
            'div',
            { className: 'cfp-bar', style: { paddingTop: 0 } },
            h(
              'span',
              { className: 'cfp-meta', style: { marginTop: 0 } },
              t('devFooter') + ' · ' + t('versionLabel') + ' ' + PLUGIN_VERSION + ' · ' + SELF,
            ),
            h(
              'button',
              {
                className: 'cfp-btn',
                onClick: async () => {
                  if (!UPDATE_FEED) {
                    patch({ updateText: t('updateSourceMissing') })
                    return
                  }
                  patch({ updateText: '…' })
                  try {
                    const response = await fetch(UPDATE_FEED, { cache: 'no-store' })
                    const data = await response.json()
                    const remote = String((data && data.version) || '')
                    if (!remote) {
                      patch({ updateText: t('updateFailed') })
                      return
                    }
                    const verdict = cmpVersion(remote, PLUGIN_VERSION) > 0 ? t('updateAvailable') : t('updateNone')
                    patch({ updateText: verdict + ' · ' + PLUGIN_VERSION + ' → ' + remote })
                  } catch (error) {
                    patch({ updateText: t('updateFailed') })
                  }
                },
              },
              t('checkUpdate'),
            ),
            h(
              'button',
              {
                className: 'cfp-btn',
                onClick: () => {
                  try {
                    window.location.reload()
                  } catch (error) {
                    /* reload is best effort */
                  }
                },
              },
              t('reloadUi'),
            ),
            h(
              'button',
              {
                className: 'cfp-btn',
                onClick: () => {
                  const lines = [
                    'plugin: ' + SELF,
                    'version: ' + PLUGIN_VERSION,
                    'enabled: ' + enabled,
                    'known bundles: ' + state.bundles.length,
                    'archives: ' + state.archives.length,
                    'locale: ' + (translate ? 'bound' : 'unbound'),
                    'error: ' + (state.error || 'none'),
                  ]
                  const done = () => patch({ message: t('copied') })
                  try {
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                      navigator.clipboard.writeText(lines.join('\n')).then(done, done)
                    } else {
                      done()
                    }
                  } catch (error) {
                    done()
                  }
                },
              },
              t('copyDiag'),
            ),
          ),
        ),
      )
    }

    function EmptyPanel() {
      React.useEffect(() => {
        patch({ open: true })
        const layout = ctxRef && ctxRef.get('layout')
        if (layout) {
          try {
            layout.selectPanel('conversation')
          } catch (error) {
            /* not fatal */
          }
        }
        if (!store.bundles.length) refresh()
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [])
      return null
    }

    function PanelIcon(props) {
      const size = (props && props.size) || 18
      const open = () => {
        patch({ open: true })
        if (!store.bundles.length) refresh()
      }
      return h(
        'button',
        {
          type: 'button',
          title: t('open'),
          'aria-label': t('open'),
          onClick: (event) => {
            event.preventDefault()
            event.stopPropagation()
            open()
          },
          onKeyDown: (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              event.stopPropagation()
              open()
            }
          },
          style: {
            width: size + 12,
            height: size + 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 0,
            color: 'inherit',
            cursor: 'pointer',
            borderRadius: 8,
          },
        },
        h(LayersGlyph, { size }),
      )
    }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        ctxRef = ctx
        store = Object.assign({}, store, { archives: readArchives() })

        const locale = ctx.get('locale')
        if (locale) {
          try {
            translate = locale.bind(NS)
          } catch (error) {
            translate = null
          }
          try {
            ctx.effect(() => locale.register(NS, 'zh', zh))
            ctx.effect(() => locale.register(NS, 'en', en))
            ctx.effect(() => locale.subscribe(() => emit()))
          } catch (error) {
            /* locale registration is optional */
          }
        }

        ctx.slots.inject('sidebar.panellist', () =>
          ctx.slots.register(
            {
              name: 'sidebar.panellist',
              id: 'dsh-config-profiles',
              order: 41,
              label: () => t('open'),
            },
            PanelIcon,
          ),
        )

        ctx.slots.inject('main', () =>
          ctx.slots.register(
            {
              name: 'main',
              key: 'dsh-config-profiles',
            },
            EmptyPanel,
          ),
        )

        ctx.slots.inject('shell.overlay', () =>
          ctx.slots.register(
            {
              name: 'shell.overlay',
              id: 'dsh-config-profiles',
            },
            ManagerOverlay,
          ),
        )
      },
    }
  },
})
