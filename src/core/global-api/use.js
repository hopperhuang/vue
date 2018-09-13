/* @flow */

import { toArray } from '../util/index'

export function initUse (Vue: GlobalAPI) {
  Vue.use = function (plugin: Function | Object) {
    // 取出已安装的plugin
    const installedPlugins = (this._installedPlugins || (this._installedPlugins = []))
    if (installedPlugins.indexOf(plugin) > -1) { // plugin 存在
      return this
    }

    // additional parameters
    const args = toArray(arguments, 1)
    // 将this --> vue 作为第一个参数传入
    args.unshift(this)
    if (typeof plugin.install === 'function') { // install 方法存在
      // 执行insall
      plugin.install.apply(plugin, args)
    } else if (typeof plugin === 'function') { // plugin is function
      // 执行plugin
      plugin.apply(null, args)
    }
    // 加入已安装plugin
    installedPlugins.push(plugin)
    return this
  }
}
