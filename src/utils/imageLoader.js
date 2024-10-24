/* @flow */

// 图片加载器
export class ImageLoader {

  imageList: Array<HTMLImageElement>;
  loadNum: number;

  constructor() {
    this.imageList = [];
    this.loadNum = 0;
  }

  // 准备
  ready(callback: Function) {
    this.imageList.forEach(img => {
      this.loadImg(img);
    });
    const timer = setInterval(() => {
      if(this.loadNum === this.imageList.length){
        clearInterval(timer);
        callback && callback();
      }
    }, 50);
  }

  // 加载图片
  loadImg(img: HTMLImageElement) {
    const timer = setInterval(() => {
      if(img.complete === true) {
        this.loadNum++;
        clearInterval(timer);
      }
    }, 50);
  }

  // 添加图片
  addImg(imageArray: Array<string>) {
    imageArray.forEach((src) => {
      let img = new Image();
      img.src = src;
      img.id = src;
      this.imageList.push(img);
    });
  }

  // 获取图片
  getImg(name: string) {
    let target;
    this.imageList.forEach((img) => {
      if(img.id == name) {
        target = img;
      }
    });
    return target;
  }

}
