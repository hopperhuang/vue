/* @flow */

import config from '../config'
import { initProxy } from './proxy'
import { initState } from './state'
import { initRender } from './render'
import { initEvents } from './events'
import { mark, measure } from '../util/perf'
import { initLifecycle, callHook } from './lifecycle'
import { initProvide, initInjections } from './inject'
import { extend, mergeOptions, formatComponentName } from '../util/index'

let uid = 0

export function initMixin (Vue: Class<Component>) {
  // 初始化组件的方法
  Vue.prototype._init = function (options?: Object) {
    // viewmodal --> vue.prototpype 组件生成的时候会得到继承
    const vm: Component = this
    // a uid uid自增记录
    vm._uid = uid++

    let startTag, endTag
    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) { // 开发时性能调试才走此代码
      startTag = `vue-perf-start:${vm._uid}`
      endTag = `vue-perf-end:${vm._uid}`
      mark(startTag)
    }

    // a flag to avoid this being observed
    vm._isVue = true
    // merge options
    if (options && options._isComponent) {// opitons 存在且opitons._isComponent为true ?? 什么时候会为true呢？
      // optimize internal component instantiation
      // since dynamic options merging is pretty slow, and none of the
      // internal component options needs special treatment.
      // 初始化内建组件
      initInternalComponent(vm, options)
    } else { // 需要实例化的不是component时会触发这个方法
      // 将superopions, modified options注入$opionts对象
      vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor),
        options || {},
        vm
      )
    }
    /* istanbul ignore else */
    if (process.env.NODE_ENV !== 'production') {
      initProxy(vm)
    } else {
      vm._renderProxy = vm
    }
    // expose real self
    vm._self = vm
    // 组件初始化流程从这里开始
    // 初始化生命周期循环
    initLifecycle(vm)
    // init parent attached events
    initEvents(vm)
    // 将createelement 方法注入到vm
    initRender(vm)
    // 调用beforeCreate方法
    callHook(vm, 'beforeCreate')
    // 从上到下注入属性
    initInjections(vm) // resolve injections before data/props
    // init props, init state, init computed, initWatch
    initState(vm)
    // 注入_provide属性
    initProvide(vm) // resolve provide after data/props
    // 调用created方法
    callHook(vm, 'created')

    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      vm._name = formatComponentName(vm, false)
      mark(endTag)
      measure(`vue ${vm._name} init`, startTag, endTag)
    }

    if (vm.$options.el) { // el 存在则调用挂载方法
      vm.$mount(vm.$options.el)
    }
  }
}

// 被初始化的实例isComponent时才触发此方法 将相关信息注入到$opitons
export function initInternalComponent (vm: Component, options: InternalComponentOptions) {
  // vm.constructor -> Vue
  // 将opitons 注入到vm实例$opitons属性 
  const opts = vm.$options = Object.create(vm.constructor.options)
  // doing this because it's faster than dynamic enumeration.
  // 取出_parentVnode
  const parentVnode = options._parentVnode
  // 将parent / _parentVnode信息注入到options
  opts.parent = options.parent
  opts._parentVnode = parentVnode
  // 从parentnode获取componentOptions
  const vnodeComponentOptions = parentVnode.componentOptions
  // 注入propsdata
  opts.propsData = vnodeComponentOptions.propsData
  // 注入listener
  opts._parentListeners = vnodeComponentOptions.listeners
  // 注入chidlren
  opts._renderChildren = vnodeComponentOptions.children
  // 注入tag
  opts._componentTag = vnodeComponentOptions.tag

  if (options.render) { // render方法窜爱
    // 注入render方法
    opts.render = options.render
    // 注入静态render方法
    opts.staticRenderFns = options.staticRenderFns
  }
}

export function resolveConstructorOptions (Ctor: Class<Component>) {
  // 从contstructor取出opitons
  let options = Ctor.options
  if (Ctor.super) { // super存在 --> 通过vue.extends 创建的实例会有super属性
    // 因为vue.extend出来的constructor指向sub,所以需要向sub.super即vue获取options
    // 从super 获取 opitons
    const superOptions = resolveConstructorOptions(Ctor.super)
    // 获取 获取本身的superOptions
    const cachedSuperOptions = Ctor.superOptions
    if (superOptions !== cachedSuperOptions) {
      // super option changed,
      // need to resolve new options.
      // 更新superopitons
      Ctor.superOptions = superOptions
      // check if there are any late-modified/attached options (#4976)
      const modifiedOptions = resolveModifiedOptions(Ctor)
      // update base extend options
      if (modifiedOptions) {
        // 什么时extendOpitons
        extend(Ctor.extendOptions, modifiedOptions)
      }
      // 合并opitons
      options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions)
      if (options.name) {
        // 定义组件名
        options.components[options.name] = Ctor
      }
    }
  }
  // 返回opitons
  return options
}

function resolveModifiedOptions (Ctor: Class<Component>): ?Object {
  let modified
  // 最新opitons
  const latest = Ctor.options
  // 扩展options
  const extended = Ctor.extendOptions
  // sealed opitons
  const sealed = Ctor.sealedOptions
  // 更新opitons
  for (const key in latest) {
    if (latest[key] !== sealed[key]) {
      if (!modified) modified = {}
      modified[key] = dedupe(latest[key], extended[key], sealed[key])
    }
  }
  // 返回被修改的对象
  return modified
}

function dedupe (latest, extended, sealed) {
  // compare latest and sealed to ensure lifecycle hooks won't be duplicated
  // between merges
  if (Array.isArray(latest)) {
    const res = []
    sealed = Array.isArray(sealed) ? sealed : [sealed]
    extended = Array.isArray(extended) ? extended : [extended]
    for (let i = 0; i < latest.length; i++) {
      // push original options and not sealed options to exclude duplicated options
      if (extended.indexOf(latest[i]) >= 0 || sealed.indexOf(latest[i]) < 0) {
        res.push(latest[i])
      }
    }
    return res
  } else {
    return latest
  }
}
