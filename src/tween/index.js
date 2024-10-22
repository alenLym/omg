/* @flow */

import * as easing from './easing';
// 动画设置
type TweenSettings = {
  from: Object,
  to: Object,
  duration: number,
  delay: number,
  easing: string,
  onStart: Function,
  onUpdate: Function,
  onFinish: Function
}
// 动画类
export class Tween {

  from: Object;
  to: Object;
  duration: number;
  elapsed: number;
  delay: number;
  easing: string;
  onStart: Function;
  onUpdate: Function;
  onFinish: Function;
  startTime: number;
  started: boolean;
  finished: boolean;
  keys: Object;
  time: number;

  constructor(settings: TweenSettings) {
    const {
      from,
      to,
      duration,
      delay,
      easing,
      onStart,
      onUpdate,
      onFinish
    } = settings;

    for(let key in from) {
      if(to[key] === undefined) {
        to[key] = from[key];
      }
    }
    for(let key in to) {
      if(from[key] === undefined) {
        from[key] = to[key];
      }
    }

    this.from = from;
    this.to = to;
    this.duration = duration || 500;
    this.delay = delay || 0;
    this.easing = easing || 'linear';
    this.onStart = onStart;
    this.onUpdate = onUpdate;
    this.onFinish = onFinish;
    this.startTime = Date.now() + this.delay;
    this.started = false;
    this.finished = false;
    this.keys = {};
  }
  // 更新
  update() {
    this.time = Date.now();
    // 延迟一些时间
    if(this.time < this.startTime) {
      return;
    }
    // 完成动画
    if(this.elapsed === this.duration) {
      if(!this.finished) {
        this.finished = true;
        this.onFinish && this.onFinish(this.keys);
      }
      return;
    }
    this.elapsed = this.time - this.startTime;
    this.elapsed = this.elapsed > this.duration ? this.duration : this.elapsed;
    for(let key in this.to) {
      this.keys[key] = this.from[key] + ( this.to[key] - this.from[key] ) * easing[this.easing](this.elapsed / this.duration);
    }
    if(!this.started) {
      this.onStart && this.onStart(this.keys);
      this.started = true;
    }
    this.onUpdate(this.keys);
  }
}
