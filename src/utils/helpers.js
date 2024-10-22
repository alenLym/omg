/* @flow */

// 获取位置
export function getPos(e: MouseEvent & TouchEvent, element: HTMLElement, touchend: boolean | void): {x: number, y: number} {
  const ev = e || window.event;
  const ele = element || ev.target;
  const boundingRect = ele.getBoundingClientRect();

  let x, y;
  let touchList = touchend ? ev.changedTouches : ev.touches;
  if(isMobile()) {
    [x, y] = [touchList[0].clientX - boundingRect.left, touchList[0].clientY  - boundingRect.top];
  } else {
    x = ev.offsetX || ev.clientX;
    y = ev.offsetY || ev.clientY;
  }
  return {x, y};
}

// 绑定事件
export function bind(target: HTMLElement | Document, eventType: string, handler: Function): HTMLElement | Document {
  if (window.addEventListener) {
    target.addEventListener(eventType, handler, false);
  } else if (target.attachEvent) {
    target.attachEvent('on' + eventType, handler);
  }
  return target;
}

// 解除绑定事件
export function unbind(target: HTMLElement | Document, eventType: string, handler: Function): void {
  if (window.removeEventListener) {
    target.removeEventListener(eventType, handler, false);
  } else if (window.detachEvent) {
    target.detachEvent && target.detachEvent(eventType, handler);
  }
}

// 反转数组
export function reverse(array: Array<any>): Array<any> {
  const [ length, ret ] = [ array.length, [] ];
  for(let i = 0; i < length; i++) {
    ret[i] = array[length - i -1];
  }
  return ret;
}

// 格式化浮点数
export function formatFloat(f: number): number {
  const m = Math.pow(10, 10);
  return parseInt(f * m, 10) / m;
}

// 获取最大值
export function getMax(arr: Array<number>): number {
  return Math.max.apply(null, arr);
}

// 获取最小值
export function getMin(arr: Array<number>): number {
  return Math.min.apply(null, arr);
}

// 插入数组
export function insertArray(originArray: Array<any>, start: number, number: number, insertArray: Array<any>): void {
  var args = [start, number].concat(insertArray);
  Array.prototype.splice.apply(originArray, args);
}

// 判断是否为数组
export function isArr(obj: any): boolean %checks {
  return !!(Object.prototype.toString.call(obj) === '[object Array]');
}

// 判断是否为对象
export function isObj(obj: any): boolean %checks {
  return !!(Object.prototype.toString.call(obj) === '[object Object]');
}

// 判断是否为移动设备
export function isMobile(): boolean {
  return /(iphone|ipad|ipod|ios|android|mobile|blackberry|iemobile|mqqbrowser|juc|fennec|wosbrowser|browserng|Webos|symbian|windows phone)/i.test(navigator.userAgent);
}
