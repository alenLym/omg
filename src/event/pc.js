/* @flow */

import * as utils from '../utils/helpers';
import type {OMG} from '../core';

// 事件类
export class Event {

  _: OMG;
  triggeredMouseDown: boolean;
  triggeredMouseMove: boolean;
  cacheX: number;
  cacheY: number;

  constructor(_this: OMG) {
    // global this
    this._ = _this;
    this.triggeredMouseDown = false;
    this.triggeredMouseMove = false;
  }

  // 获取位置
  getPos(e: MouseEvent & TouchEvent): {x: number, y: number} {
    return utils.getPos(e, this._.element);
  }

  // 触发事件
  triggerEvents() {
    const hasEvents = this._.objects.filter(item => !item.hide).some(item => {
      return item.events && utils.isArr(item.events) || item.enableDrag;
    });
    if(!hasEvents && !this._.enableGlobalTranslate && !this._.enableGlobalScale) {
      return;
    }

    const hasEnterOrMove = this._.objects.some(item => {
      return item.events && item.events.some(i => {
        return ~this._.eventTypes.indexOf(i.eventType);
      });
    }) || this._.globalMousemove;

    // 触发鼠标进入和鼠标移动
    if(hasEnterOrMove && !this.triggeredMouseMove) {
      this.bindMouseMove();
      this.triggeredMouseMove = true;
    }

    if(!hasEnterOrMove && this.triggeredMouseMove) {
      this.unBindMouseMove();
      this.triggeredMouseMove = false;
    }

    if(!this.triggeredMouseDown) {
      utils.bind(this._.element, 'mousedown', this.mouseDown.bind(this));
      this.triggeredMouseDown = true;
    }

    if(this._.enableGlobalScale) {
      this.bindMouseWheel();
    } else {
      this.unBindMouseWheel();
    }

  }

  // 绑定鼠标滚轮
  bindMouseWheel() {
    utils.bind(this._.element, 'wheel', this.mouseWheel);
  }

  // 解除鼠标滚轮绑定
  unBindMouseWheel() {
    utils.unbind(this._.element, 'wheel', this.mouseWheel);
  }

  // 鼠标滚轮
  mouseWheel = (e: WheelEvent) => {
    e.preventDefault();
    if(e.deltaY && e.deltaY > 0) {
      this._.scale = this._.scale - 0.01 >= this._.minDeviceScale ? this._.scale - 0.01 : this._.minDeviceScale;
    } else if(e.deltaY && e.deltaY < 0) {
      this._.scale = this._.scale + 0.01 <= this._.maxDeviceScale ? this._.scale + 0.01 : this._.maxDeviceScale;
    }
    this._.redraw();
  }

  // 绑定鼠标移动
  bindMouseMove() {
    utils.bind(this._.element, 'mousemove', this.mouseEnterOrMove.bind(this));
  }

  // 解除鼠标移动绑定
  unBindMouseMove() {
    utils.unbind(this._.element, 'mousemove', this.mouseEnterOrMove.bind(this));
  }

  // 鼠标进入或移动
    mouseEnterOrMove(e_moveOrEnter: MouseEvent & TouchEvent) {
    const that = this;
    let isDragging;

    const mX = that.getPos(e_moveOrEnter).x;
    const mY = that.getPos(e_moveOrEnter).y;

    that._.globalMousemove && that._.globalMousemove(e_moveOrEnter);

    isDragging = that._.objects.some(item => {
      return item.isDragging;
    });

    // 触发鼠标进入和鼠标移动
    const movedOn = that._._objects.filter(item => {
      return item.isPointInner(mX, mY) && !item.hide;
    });

    if(isDragging) {
      // dragin 处理程序
      if(movedOn && movedOn.length > 1) {
        movedOn[1].events && movedOn[1].events.forEach(i => {
          if(i.eventType === 'dragin' && !movedOn[1].hasDraggedIn) {
            movedOn[1].hasDraggedIn = true;
            i.callback && i.callback(movedOn[1]);
          }
        });
      }

      // dragout 处理程序
      const handleDragOut = item => {
        item.hasDraggedIn && item.events.forEach(i => {
          if(i.eventType === 'dragout') {
            i.callback && i.callback(movedOn[1]);
          }
        });
        item.hasDraggedIn = false;
      };

      // 确定鼠标是否从形状中移出，并触发 dragout 处理程序
      that._._objects.some(item => {
        return item.hasDraggedIn && (!item.isPointInner(mX, mY) || movedOn[1] !== item) && handleDragOut(item);
      });

    } else {
      // 鼠标离开处理程序
      const handleMoveOut = item => {
        item.hasEnter && item.events.forEach(i => {
          if(i.eventType === 'mouseleave') {
            i.callback && i.callback(item);
          }
        });
        item.hasEnter = false;
    };
    // 正常鼠标移动
    // 确定鼠标是否从形状中移出，并触发 mouseleave 处理程序
    that._._objects.some(item => {
        return item.hasEnter && (!item.isPointInner(mX, mY) || movedOn[0] !== item) && handleMoveOut(item);
      });
      if(movedOn && movedOn.length > 0) {
        movedOn[0].events && movedOn[0].events.forEach(i => {
          if(i.eventType === 'mouseenter' && !movedOn[0].hasEnter) {
            movedOn[0].hasEnter = true;
            i.callback && i.callback(movedOn[0]);
          } else if(i.eventType === 'mousemove') {
            i.callback && i.callback(movedOn[0]);
          }
        });
      }
    }

  }

  // 鼠标按下
  mouseDown(e_down: MouseEvent & TouchEvent) {
    let that = this, whichIn, hasEventDrag, hasEventDragEnd, dragCb, dragEndCb;

    // 全局设置事件 mousedown
    this._.globalMousedown && this._.globalMousedown(e_down);

    const hasDrags = this._.objects.filter(item => !item.hide).some(item => {
      return item.enableDrag && !item.fixed;
    });

    // 获取鼠标位置
    const pX = this.getPos(e_down).x;
    const pY = this.getPos(e_down).y;
    that.cacheX = pX;
    that.cacheY = pY;

    // 鼠标按下
    const whichDown = this._._objects.filter(item => {
      return item.isPointInner(pX, pY) && !item.hide;
    });

    if(whichDown && whichDown.length > 0) {
      if(whichDown[0].enableChangeIndex) {
        that.changeOrder(whichDown[0]);
      }
      whichDown[0].events && whichDown[0].events.some(i => {
        return i.eventType === 'mousedown' && i.callback && i.callback(whichDown[0]);
      });
    }

    // 鼠标拖拽图形
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

      hasEventDragEnd = whichIn.length > 0 && whichIn[0].events && whichIn[0].events.some(item => {
        if(item.eventType === 'dragend') {
          dragEndCb = item.callback;
        }
        return item.eventType === 'dragend';
      });

      const move_Event = e_move => {
        const mx = that.getPos(e_move).x;
        const my = that.getPos(e_move).y;

        whichIn[0].moveX = whichIn[0].moveX + mx - that.cacheX;
        whichIn[0].moveY = whichIn[0].moveY + my - that.cacheY;

        // 事件拖拽
        hasEventDrag && dragCb(whichDown[0]);

        that._.redraw();
        that.cacheX = mx;
        that.cacheY = my;
        whichIn[0].isDragging = true;
      };

      const up_Event = e_up => {
        const uX = that.getPos(e_up).x;
        const uY = that.getPos(e_up).y;

        const upOn = that._._objects.filter(item => {
          return item.isPointInner(uX, uY);
        });

        if(upOn && upOn.length > 1) {
          if(upOn[1].hasDraggedIn) {
            upOn[1].hasDraggedIn = false;
            const dp = upOn[1].events.some(i => {
              return i.eventType === 'drop' && i.callback && i.callback(upOn[1], upOn[0]);
            });
            // 如果没有定义事件 drop，检查是否存在事件 dragout
            // 如果存在，触发回调 dragout。
            !dp && upOn[1].events.some(i => {
              return i.eventType === 'dragout' && i.callback && i.callback(upOn[1]);
            });
          }
        }

        // 事件结束
        hasEventDragEnd && dragEndCb(whichDown[0]);

        utils.unbind(document, 'mousemove', move_Event);
        utils.unbind(document, 'mouseup', up_Event);
        whichIn[0].isDragging = false;
      };
      if(whichIn && whichIn.length > 0 && whichIn[0].enableDrag) {
        utils.bind(document, 'mousemove', move_Event);
        utils.bind(document, 'mouseup', up_Event);
      }
    }

    // 移动画布
    if(this._.enableGlobalTranslate && !(whichIn && whichIn.length > 0)) {
      const move_dragCanvas = e_move => {
        const mx = that.getPos(e_move).x;
        const my = that.getPos(e_move).y;
        // that._.originTransX = that._.originTransX + mx - that.cacheX;
        // that._.originTransY = that._.originTransY  + my - that.cacheY;
        that._.transX = that._.transX + mx - that.cacheX;
        that._.transY = that._.transY + my - that.cacheY;
        that._.redraw();
        that.cacheX = mx;
        that.cacheY = my;
      };

      const up_dragCanvas = () => {
        utils.unbind(document, 'mousemove', move_dragCanvas);
        utils.unbind(document, 'mouseup', up_dragCanvas);
      };

      utils.bind(document, 'mousemove', move_dragCanvas);
      utils.bind(document, 'mouseup', up_dragCanvas);
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
