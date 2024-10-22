/* @flow */

// 颜色类
export class Color {

  // 将十六进制颜色转换为 RGB
  hexToRGB(hex: string): Object {
    const rgb = [];

    hex = hex.substr(1);

    // converts #abc to #aabbcc
    if (hex.length === 3) {
      hex = hex.replace(/(.)/g, '$1$1');
    }

    hex.replace(/../g, color => {
      rgb.push(parseInt(color, 0x10));
      return color;
    });

    return {
      r: rgb[0],
      g: rgb[1],
      b: rgb[2],
      rgb: `rgb(${rgb.join(',')})`
    };
  }

  // 将 RGB 转换为 HSL
  rgbToHSL(r: number, g: number, b: number): Object {
    r /= 255, g /= 255, b /= 255;
    const max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    let h: number = 0, s, l = (max + min) / 2;

    if(max == min){
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch(max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    return {
      h,
      s,
      l,
      hsl: `hsl(${h * 360}, ${s * 100}%, ${l * 100}%)`
    };
  }

  // converts hsl to RGB
  // hslToRGB() {
  // }

  // 颜色变亮
  lighten(color: string, percent: string): string | void {
    let hsl, h, s, l, rgba, a;
    if(!color || !percent || !/^[0-9]{1,2}%$/.test(percent)) {
      return;
    }
    if(this.isRgba(color)) {
      rgba = this.getRgba(color);
      a = +rgba.a - Number(percent.slice(0, -1)) / 100;
      return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${a})`;
    } else {
      hsl = this.getHsl(color);
      h = +hsl.h;
      s = +hsl.s;
      l = +hsl.l * 100 + +percent.slice(0, -1);

      return `hsl(${h * 360}, ${s * 100}%, ${l}%)`;
    }
  }

  // 颜色变暗
  darken(color: string, percent: string): string | void {
    let hsl, h, s, l, rgba, a;
    if(!color || !percent || !/^[0-9]{1,2}%$/.test(percent)) {
      return;
    }
    if(this.isRgba(color)) {
      rgba = this.getRgba(color);
      a = +rgba.a + Number(percent.slice(0, -1)) / 100;
      return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${a})`;
    } else {
      hsl = this.getHsl(color);
      h = +hsl.h;
      s = +hsl.s;
      l = +hsl.l * 100 - +percent.slice(0, -1);

      return `hsl(${h * 360}, ${s * 100}%, ${l}%)`;
    }
  }

  // 判断是否为十六进制颜色
  isHex(color: string): boolean {
    return !!(/^#[a-fA-F0-9]{3}$|#[a-fA-F0-9]{6}$/.test(color));
  }

  // 判断是否为 RGB 颜色
  isRgb(color: string): boolean {
    return !!(/^rgb\((\s*[0-5]{0,3}\s*,?){3}\)$/.test(color));
  }

  // 判断是否为 RGBA 颜色
  isRgba(color: string): boolean {
    return !!(/^rgba\((\s*[0-5]{0,3}\s*,?){3}[0-9.\s]*\)$/.test(color));
  }

  // 获取 RGB 颜色
  getRgb(color: string): Object {
    let rgb, r, g, b;
    if(this.isHex(color)) {
      rgb = this.hexToRGB(color);
      [ r, g, b ] = [ rgb.r, rgb.g, rgb.b ];
    } else if(this.isRgb(color)) {
      rgb = color.slice(4, -1).split(',');
      [ r, g, b ] = [ rgb[0], rgb[1], rgb[2] ];
    }
    return { r, g, b };
  }

  // 获取 RGBA 颜色
  getRgba(color: string): Object {
    let rgba, r, g, b, a;
    rgba = color.slice(5, -1).split(',');
    [ r, g, b, a ] = [ rgba[0], rgba[1], rgba[2], rgba[3] ];

    return { r, g, b, a };
  }

  // 获取 HSL 颜色
  getHsl(color: string): Object {
    let hsl, rgb, r, g, b, h, s, l;
    rgb = this.getRgb(color);
    [ r, g, b ] = [ rgb.r, rgb.g, rgb.b ];

    hsl = this.rgbToHSL(r, g, b);
    [ h, s, l ] = [ hsl.h, hsl.s, hsl.l ];

    return { h, s, l };
  }

}
