/* @flow */

import config from '../config'
import { initUse } from './use'
import { initMixin } from './mixin'
import { initExtend } from './extend'
import { initAssetRegisters } from './assets'
import { set, del } from '../observer/index'
import { ASSET_TYPES } from 'shared/constants'
import builtInComponents from '../components/index'

import {
  warn,
  extend,
  nextTick,
  mergeOptions,
  defineReactive
} from '../util/index'

export function initGlobalAPI(Vue: GlobalAPI) {
  // config
  const configDef = {}
  configDef.get = () => config
  if (process.env.NODE_ENV !== 'production') {
    configDef.set = () => {
      warn(
        'Do not replace the Vue.config object, set individual fields instead.'
      )
    }
  }
  // 定义vue.config方法
  Object.defineProperty(Vue, 'config', configDef)

  // exposed util methods.
  // NOTE: these are not considered part of the public API - avoid relying on
  // them unless you are aware of the risk.
  // 定义工具方法
  Vue.util = {
    warn,
    /**
 * Mix properties into target object.
 */
    extend,
    /**
      * Merge two option objects into a new one.
      * Core utility used in both instantiation and inheritance.
      */
    mergeOptions,
    /**
 * Define a reactive property on an Object.
 */
    defineReactive
  }
/**
 * Set a property on an object. Adds the new property and
 * triggers change notification if the property doesn't
 * already exist.
 */
  Vue.set = set
  /**
 * Delete a property and trigger change if necessary.
 */
  Vue.delete = del

  //在下次 DOM 更新循环结束之后执行延迟回调。在修改数据之后立即使用这个方法，获取更新后的 DOM。
  Vue.nextTick = nextTick

  // 创建options对象，原型指向null
  Vue.options = Object.create(null)
  ASSET_TYPES.forEach(type => {
    // components directives filters 创建控对象
    Vue.options[type + 's'] = Object.create(null)
  })

  // this is used to identify the "base" constructor to extend all plain-object
  // components with in Weex's multi-instance scenarios.
  Vue.options._base = Vue

  // 将buildincomponents 的属性复制到components
  extend(Vue.options.components, builtInComponents)

  // 初始化use方法
  initUse(Vue)
  // 初始化init方法
  initMixin(Vue)
  // 初始化extend方法
  initExtend(Vue)
  // 初始化assetregister方法
  initAssetRegisters(Vue)
}
