import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'

// vue 实例方法
function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  // 调用_init方法 _init方法会在initMixin执行时得到注入
  this._init(options)
}

// 修改vue方法，给vue类注入方法
// 将_init方法注入到vue.prototype
initMixin(Vue)
// 将set/delete/watch方法 $data和$props注入到vue.prototype
stateMixin(Vue)
// 定义了$on $once $off $emmit方法
eventsMixin(Vue)
// 生命周期方法 定义了$update $forceupdate $destroy方法
lifecycleMixin(Vue)
// render方法 定义了一些方便使用的方法renderHelpers $nexttick _render
renderMixin(Vue)

export default Vue
