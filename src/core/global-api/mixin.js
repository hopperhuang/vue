/* @flow */

import { mergeOptions } from '../util/index'

export function initMixin (Vue: GlobalAPI) {
  Vue.mixin = function (mixin: Object) {
    // Vue opitons属性？？有什么呢？？
    // vue.options --> parent
    // mixin --> children
    // 将默认opitons和mixin合并
    this.options = mergeOptions(this.options, mixin)
    return this
  }
}
