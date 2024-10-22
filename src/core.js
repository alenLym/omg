/* @flow */

import "./utils/polyfill";
import { version } from "../package.json";
import event from "./event/index";
import { Color } from "./utils/color";
import { ImageLoader } from "./utils/imageLoader";
import { Tween } from "./tween/index";
import autoscale from "./utils/autoscale";
import * as utils from "./utils/helpers";
import shapes from "./shapes/index";
import group from "./group/index";
import clip from "./clip/index";
import * as ext from "./extend/export";

// 配置参数类型
export type configSettings = {
  // 缩放率
  deviceScale: ?number,
  // 最小缩放率
  minDeviceScale: ?number,
  // 最大缩放率
  maxDeviceScale: ?number,
  // 在渲染之前，会先加载图片。如果 prepareImage 是一个函数，会在图片加载完成后触发。
  prepareImage: boolean | Function | void,
  // 画布元素
  element: HTMLCanvasElement,
  // 画布宽度
  width: number,
  // 画布高度
  height: number,
  // 位置
  position: ?string,
  // 是否启用全局平移
  enableGlobalTranslate: ?boolean,
  // 是否启用全局缩放
  enableGlobalScale: ?boolean,
  // 图片列表
  images: ?Array<string>,
};

// 图形类
export class OMG {
  // 版本
  version: string; // OMG's current version
  // 是否是移动端
  isMobile: boolean; // Current device is mobile phone
  // 所有图形列表
  objects: Array<GraghShape>; // All shapes list
  // 所有图形列表的反转列表
  _objects: Array<GraghShape>; // All shapes list's reverse list
  // 用于生成和记录组中的图形 zindex
  groupRecords: number; // For generating and recording the graphs' zindex in a group
  // 全局平移 x
  transX: number; // The number of global translate x
  // 全局平移 y
  transY: number; // The number of global translate y
  // 默认缩放率
  deviceScale: number; // Default scale rate
  // 最小缩放率
  minDeviceScale: number; // Minimum scale rate
  // 最大缩放率
  maxDeviceScale: number; // Maximum scale rate
  // 当前缩放率
  scale: number; // Current scale rate
  // 图片加载器实例
  loader: Object; // Instance of imageLoader
  // 在渲染之前，会先加载图片。如果 prepareImage 是一个函数，会在图片加载完成后触发。
  prepareImage: boolean | Function | void;
  // 全局鼠标按下事件
  globalMousedown: Function | void; // Global mousedown function.
  // 全局鼠标移动事件
  globalMousemove: Function | void; // Global mousemove function.
  // 动画类
  Tween: any; // Class Tween
  // 动画列表
  animationList: Array<any>; // The List contains page's all animation instance.
  // 是否正在动画
  animating: boolean | void; // Whether the page is animating
  // 动画 id
  animationId: number | void; // Animation's id.
  // 缓存动画 id 池
  cacheIdPool: Object; // An object contains animationId
  // 获取 fps 回调
  fpsFunc: Function | void; // If define fpsFunc, can get real-time fps.
  // 实时 fps
  fps: number; // Real-time fps.
  // 用于缓存时间戳，用于计算 fps
  fpsCacheTime: number; // Used to cache timestamps which used to calculate fps.
  // 所有支持的事件类型列表
  eventTypes: Array<string>; // All supported event types list.
  // 所有支持的移动端事件类型列表
  mobileEventTypes: Array<string>; // All supported mobile event types list.
  // 事件类实例
  _event: Object; // Instance of class event.
  // 颜色类实例
  color: Color; // Class color.
  // 画布元素
  element: HTMLCanvasElement; // Element canvas.
  // canvas 上下文
  canvas: CanvasRenderingContext2D; // canvas.getContext2D()
  // 画布宽度
  width: number; // canvas's with
  // 画布高度
  height: number; // canvas's height
  // 扩展形状函数
  ext: Object; // Export functions for extends custom graphs.
  // 裁剪函数
  clip: Function; // Export clip function.
  // 是否启用全局缩放
  enableGlobalScale: boolean | void; // Enable global translate?
  // 是否启用全局平移
  enableGlobalTranslate: boolean | void; // Enable global scale?
  // 图片列表
  images: Array<string>; // The image list for preload.
  // 一些辅助函数
  utils: Object; // Some helper functions
  // 所有形状函数
  shapes: Object; // All shapes function.
  // 组实例
  group: Function; // Group instance
  // 图形实例
  graphs: { [graph_name: string]: Object }; // graphs contains all graphs' instance.

  constructor(config: configSettings) {
    this.version = version;

    this.isMobile = utils.isMobile();

    this.objects = [];

    (this.groupRecords = 0), (this.transX = 0);

    this.transY = 0;

    this.deviceScale = config.deviceScale || 1;

    this.minDeviceScale = config.minDeviceScale || 0.5 * this.deviceScale;

    this.maxDeviceScale = config.maxDeviceScale || 4 * this.deviceScale;

    this.scale = this.deviceScale;

    this.loader = new ImageLoader();

    this.prepareImage = config.prepareImage;

    this.globalMousedown = void 0;

    this.globalMousemove = void 0;

    this.Tween = Tween;

    this.animationList = [];

    this.animationId = 0;

    this.animating = false;

    this.cacheIdPool = {};

    this.fpsFunc = void 0;

    this.fps = 0;

    this.fpsCacheTime = 0;

    this.graphs = {};

    this.eventTypes = [
      "click",
      "mousedown",
      "mouseup",
      "mouseenter",
      "mouseleave",
      "mousemove",
      "drag",
      "dragend",
      "dragin",
      "dragout",
      "drop",
    ];

    this.mobileEventTypes = [
      "touchstart",
      "touchend",
      "touchmove",
      "tap",
      "pinch",
      "spread",
      "drag",
      "dragend",
      "dragin",
      "dragout",
      "drop",
    ];

    this._event = event(this, this.isMobile);

    this.color = new Color();

    this.element = config.element;

    this.canvas = this.element.getContext("2d");

    this.width = config.width;

    this.height = config.height;
    // 自动缩放
    autoscale([this.element], {
      width: this.width,
      height: this.height,
      position: config.position || "relative",
    });

    /**
     * @description: For extend shapes.
     *               Export functions to define scale and drag events...
     */
    this.ext = ext;
    // 裁剪函数
    this.clip = clip;

    // 启用全局拖拽事件
    this.enableGlobalTranslate = config.enableGlobalTranslate || false;

    // 启用全局缩放事件
    this.enableGlobalScale = config.enableGlobalScale || false;

    // 初始化图片列表
    this.images = config.images || [];
    // 一些辅助函数
    this.utils = utils;
    // 所有形状函数
    this.shapes = shapes;
  }
  // 初始化
  init() {
    // 初始化图形实例
    for (let shape in this.shapes) {
      this.graphs[shape] = (settings) => {
        return this.shapes[shape](settings, this);
      };
    }

    // 初始化组实例
    this.group = function (settings) {
      return group(settings, this);
    };
  }
  // 重置
  reset() {
    // 重置全局平移 x
    this.transX = 0;
    // 重置全局平移 y
    this.transY = 0;
    // 重置缩放率
    this.scale = this.deviceScale;
    // 重置所有子图形
    this.objects
      .filter((o) => !o.parent)
      .forEach((o) => {
        o.moveX = 0;
        o.moveY = 0;
      });
    // 更新所有组中的图形位置
    this.objects
      .filter((o) => o.type === "group")
      .forEach((o) => {
        o.updateAllChildsPosition();
      });
    // 反转图形列表
    this._objects = utils.reverse(this.objects);
    // 重新绘制
    this.redraw();
  }
  // 扩展形状
  extend(ext: Object): void {
    // 遍历扩展形状函数
    for (let key in ext) {
      this.shapes[key] = ext[key];
    }
  }

  // 设置全局属性
  setGlobalProps(props: { [prop_name: string]: any }) {
    // 遍历全局属性
    for (let key in props) {
      switch (key) {
        case "enableGlobalTranslate":
          this.enableGlobalTranslate = props[key];
          break;
        case "enableGlobalScale":
          this.enableGlobalScale = props[key];
          break;
        default:
          break;
      }
    }
    // 触发事件
    this._event.triggerEvents();
  }

  // Array<Object> | Object
  addChild(child: any) {
    // 多图形或单图形
    if (utils.isArr(child)) {
      this.objects = this.objects.concat(child);
    } else if (utils.isObj(child)) {
      this.objects.push(child);
    }
    this.objects.sort((a, b) => {
      return a.zindex - b.zindex;
    });
    // 反转图形列表
    this._objects = utils.reverse(this.objects);
  }
  // 移除子图形
  removeChild(child: Array<Object> | Object) {
    // 多图形或单图形
    if (utils.isArr(child)) {
      this.objects = this.objects.filter((o) => !~child.indexOf(o));
    } else {
      this.objects = this.objects.filter((o) => o !== child);
    }
    // 反转图形列表
    this._objects = utils.reverse(this.objects);
  }
  // 移除第一个子图形
  removeFirstChild() {
    // 移除最后一个子图形
    this.objects.pop();
    // 反转图形列表
    this._objects = utils.reverse(this.objects);
  }
  // 移除最后一个子图形
  removeLastChild() {
    this.objects.shift();
    // 反转图形列表
    this._objects = utils.reverse(this.objects);
  }
  // 移除所有子图形
  removeAllChilds() {
    this.objects = [];
    this._objects = [];
  }
  // 图片加载完成
  imgReady() {
    this.loader.addImg(this.images);
  }

  // 显示
  show() {
    const _this = this;
    // 脏，准备移除
    if (this.prepareImage) {
      this.imgReady();
      this.loader.ready(() => {
        typeof this.prepareImage === "function" && this.prepareImage();
        _this.draw();
        _this._event.triggerEvents();
      });
    } else {
      this.draw();
      this._event.triggerEvents();
    }
  }

  // 绘制
  draw() {
    // 遍历所有图形
    this.objects.forEach((item) => {
      item.draw();
    });
  }

  // 重新绘制
  redraw() {
    // 清除画布
    this.clear();
    // 保存画布状态
    this.canvas.save();
    // 平移画布
    this.canvas.translate(this.transX, this.transY);
    // 绘制图形
    this.draw();
    // 恢复画布状态
    this.canvas.restore();
  }
  // 清除画布
  clear() {
    this.canvas.clearRect(0, 0, this.width, this.height);
  }

  // 更新
  tick() {
    // 获取 fps 并执行某些操作
    const func = () => {
      if (this.fpsFunc) {
        const now = Date.now();
        if (now - this.fpsCacheTime >= 1000) {
          this.fpsFunc && this.fpsFunc(this.fps);
          this.fps = 0;
          this.fpsCacheTime = now;
        } else {
          this.fps++;
        }
      }
      this.animationList.forEach((t, i) => {
        // 如果完成，移除它
        if (t.finished) {
          this.animationList.splice(i--, 1);
        } else if (t.update) {
          // 更新
          t.update();
        } else {
          t();
        }
      });
      // 重新绘制
      this.redraw();
      // 如果动画列表为空，并且正在动画，则停止动画
      if (this.animationList.length === 0 && this.animating) {
        this.animating = false;
        this.finishAnimation();
        // 取消动画帧
        cancelAnimationFrame(this.cacheIdPool[this.animationId]);
      } else {
        // 请求动画帧
        this.cacheIdPool[this.animationId] = requestAnimationFrame(func);
      }
    };
    if (this.animationList.length > 0 && !this.animating) {
      this.animating = true;
      this.animationId = Date.now();
      func();
    }
    return this.animationId;
  }
  // 完成动画
  finishAnimation() {}

  /**
   * @param {func | Function}
   * 获取 fps 并执行某些操作。
   *
   * eg.
   * stage.fpsOn(function(fps) {
   *   console.log(fps);
   * });
   */
  // 获取 fps 并执行某些操作
  fpsOn(func: Function) {
    this.fpsFunc = func;
    this.fpsCacheTime = Date.now();
  }
  // 关闭 fps
  fpsOff() {
    this.fpsFunc = void 0;
    this.fps = 0;
  }

  // 添加动画到动画列表
  animate(func: Function) {
    this._event.triggerEvents();
    this.animationList.push(func);
    this.tick();
  }

  // 清除所有动画，包括全局动画和形状动画。
  clearAnimation() {
    this.animationList = [];
    this.animating = false;
    cancelAnimationFrame(this.cacheIdPool[this.animationId]);
  }

  // 获取当前版本
  getVersion() {
    return this.version;
  }

  // 全局鼠标按下事件
  mousedown(func: Function) {
    this.globalMousedown = func;
  }

  // 全局鼠标移动事件
  mousemove(func: Function) {
    this.globalMousemove = func;
  }

  /**
   *
   * @param {Object} opt
   *
   * @param {Function} opt.width  - width after resize
   * @param {Function} opt.height - height after resize
   * @param {Function} opt.resize - callback triggered after resize
   */
  resize(opt: { width: () => number, height: () => number, resize: Function }) {
    const update = () => {
      // 更新画布尺寸
      this.width = opt.width();
      this.height = opt.height();
      // 自动缩放
      autoscale([this.element], {
        width: this.width,
        height: this.height,
        position: "absolute",
      });
      // 重新绘制
      this.redraw();
    };
    // 绑定窗口大小变化事件
    if (!window.onresize) {
      utils.bind(window, "resize", () => {
        if (opt.resize) {
          // 执行 resize 回调
          opt.resize(update);
        } else {
          update();
        }
      });
    }
  }
}
