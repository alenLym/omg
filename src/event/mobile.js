/* @flow */

import * as utils from '../utils/helpers';
import type {OMG} from '../core';

// 移动端事件类
export class MobileEvent {

  _: OMG;
  triggeredTouchStart: boolean;
  cacheX: number;
  cacheY: number;

  constructor(_this: OMG) {
    // global this
    this._ = _this;
  }

  // 获取位置
  getPos(e: MouseEvent & TouchEvent, touchend: boolean | void): {x: number, y: number} {
    return utils.getPos(e, this._.element, touchend);
  }

  // 触发事件
  triggerEvents() {
    const hasEvents = this._.objects.filter(item => !item.hide).some(item => {
      return item.events && utils.isArr(item.events) || item.enableDrag;
    });
    if(!hasEvents && !this._.enableGlobalTranslate && !this._.enableGlobalScale) {
      return;
    }

    // 绑定触摸开始事件
    if(!this.triggeredTouchStart) {
      utils.bind(this._.element, 'touchstart', this.touchStart.bind(this));
      this.triggeredTouchStart = true;
    }

  }

  // 触摸开始
  touchStart(e_start: MouseEvent & TouchEvent) {
    e_start.preventDefault();
    // 两指操控
    // if(e_start.touches.length > 1) {
    //   alert(e_start.touches);
    //   return;
    // }
    let that = this, whichIn, hasEventDrag, dragCb;

    // 获取触摸位置
    const pos = this.getPos(e_start);
    const [ pX, pY ] = [ pos.x, pos.y ];
    that.cacheX = pX;
    that.cacheY = pY;

    // 触摸图形
    const whichDown = this._._objects.filter(item => {
      return item.isPointInner(pX, pY) && !item.hide;
    });
    // 触摸图形
    if(whichDown && whichDown.length > 0) {
      if(whichDown[0].enableChangeIndex) {
        that.changeOrder(whichDown[0]);
      }
      whichDown[0].events && whichDown[0].events.some(i => {
        return i.eventType === 'touchstart' && i.callback && i.callback(whichDown[0]);
      });
    }

    // 拖拽图形
    const hasDrags = this._.objects.filter(item => !item.hide).some(item => {
      return item.enableDrag && !item.fixed;
    });

    // 拖拽图形
    if(hasDrags) {
      whichIn = that._._objects.filter(item => !item.hide).filter(item => {
        return item.isPointInner(pX, pY) && !item.fixed;
      });

      hasEventDrag = whichIn.length > 0 && whichIn[0].events && whichIn[0].events.some(item => {
        if(item.eventType === 'drag') {
          dragCb = item.callback;
        }
        return item.eventType === 'drag';
      });
      // 触摸移动
      const move_Event = e_move => {
        const pos = that.getPos(e_move);
        const [ mx, my ] = [ pos.x, pos.y ];

        whichIn[0].moveX = whichIn[0].moveX + mx - that.cacheX;
        whichIn[0].moveY = whichIn[0].moveY + my - that.cacheY;

        // event drag
        hasEventDrag && dragCb(whichDown[0]);

        that._.redraw();
        that.cacheX = mx;
        that.cacheY = my;
        whichIn[0].isDragging = true;
      };
      // 触摸结束
      const up_Event = (/* e_up */) => {
        // const pos = that.getPos(e_up, true);
        // const [ uX, uY ] = [ pos.x, pos.y ];

        // touchend
        whichIn[0].events && whichIn[0].events.some(i => {
          return i.eventType === 'touchend' && i.callback && i.callback(whichIn[0]);
        });

        // 解除触摸移动事件
        utils.unbind(document, 'touchmove', move_Event);
        // 解除触摸结束事件
        utils.unbind(document, 'touchend', up_Event);
        // 设置触摸结束
        whichIn[0].isDragging = false;
      };
      if(whichIn && whichIn.length > 0 && whichIn[0].enableDrag) {
        utils.bind(document, 'touchmove', move_Event);
        utils.bind(document, 'touchend', up_Event);
      }
    }
  }

  // 改变顺序
  changeOrder(item: mixed) {
    const i = this._.objects.indexOf(item);
    const cacheData = this._.objects[i];
    this._.objects.splice(i, 1);
    this._.objects.push(cacheData);
    this._._objects = utils.reverse(this._.objects);
    this._.redraw();
  }
}
