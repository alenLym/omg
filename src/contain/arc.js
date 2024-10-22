/* @flow */

// 判断点是否在弧形内
export default (x: number, y: number, r: number, sa: number, ea: number) => {
  const pi = Math.PI;
  let dis, isIn;
  // 扇形
  if(!isNaN(sa) && !isNaN(ea)) {
    let angle = 0;
    // 第四象限
    if(x >= 0 && y >= 0) {
      if(x === 0) {
        angle = pi/2;
      } else {
        angle = Math.atan( (y / x) );
      }
    }
    // 第三象限
    else if(x <= 0 && y >= 0) {
      if(x === 0) {
        angle = pi;
      } else {
        angle = pi - Math.atan(y / Math.abs(x));
      }
    }
    // 第二象限
    else if(x <= 0 && y <= 0) {
      if(x === 0) {
        angle = pi;
      } else {
        angle = Math.atan(Math.abs(y) / Math.abs(x)) + pi;
      }
    }
    // 第一象限
    else if(x >= 0 && y<= 0) {
      if(x === 0) {
        angle = pi*3/2;
      } else {
        angle = 2*pi - Math.atan(Math.abs(y) / x);
      }
    }
    dis = Math.sqrt( x * x + y * y );
    if(sa < ea) {
      isIn = !!(angle >= sa && angle <= ea && dis <= r);
    } else {
      isIn = !!( ( (angle >= 0 && angle <= ea) || (angle >= sa && angle <= 2*pi) ) && dis <= r);
    }
  }
  // 普通弧形
  else {
    isIn = !!(Math.sqrt(x * x + y * y) <= r);
  }
  return isIn;
};
