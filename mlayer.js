;(function(){
  var layer={},
    zIndex=999;  // 默认层级
  layer.items=[];  // 所有弹层
  layer.effects=['fadeIn','zoomIn','fromTop','fromBottom'];  // 动画管理

  function createShadow(){
    var shadow=document.createElement('div');
    shadow.className='mlayer-shadow';
    shadow.style.zIndex=zIndex;
    document.body.appendChild(shadow);
    return shadow;
  }

  function createContainer(){
    var container=document.createElement('div');
    container.className='mlayer-container';
    document.body.appendChild(container);
    return container;
  }

  function getStyle(obj,attr){
    if(obj.currentStyle){
      return obj.currentStyle[attr];
    }else{
      return document.defaultView.getComputedStyle(obj,null)[attr];
    }
  }

  function extend(a,b){
    for(var x in b){
      a[x]=b[x];
    }
    return a;
  }

  function getOffset(obj,dir){
    var rect=obj.getBoundingClientRect();
    if(dir=='top'){
      return rect.top+(window.pageYOffset || document.documentElement.scrollTop)-(document.documentElement.clientTop || 0);
    }else if(dir=='left'){
      return rect.left+(window.pageXOffset || document.documentElement.scrollLeft)-(document.documentElement.clientLeft || 0);
    }
  }

  // 新版定位
  function position(opts){
    var o=opts.o,
      rel=opts.rel || null,
      posArr=opts.posArr || ['center','center'],
      offset=opts.offset || [0,0];
    if(rel){
      // 相对元素
      o.style.position='absolute';
      var _ow=getStyle(o,'width'),
        _oh=getStyle(o,'height'),
        _rw=getStyle(rel,'width'),
        _rh=getStyle(rel,'height'),
        ow=_ow && _ow !='auto' ? parseInt(_ow) : parseInt(o.offsetWidth),
        oh=_oh && _oh !='auto' ? parseInt(_oh) : parseInt(o.offsetHeight),
        rw=_rw && _rw !='auto' ? parseInt(_rw) : parseInt(rel.offsetWidth),
        rh=_rh && _rh !='auto' ? parseInt(_rh) : parseInt(rel.offsetHeight),
        rl=parseInt(getOffset(rel,'left')),
        rt=parseInt(getOffset(rel,'top')),
        posL=posArr[0],
        posV=posArr[1],
        offL=offset[0],
        offV=offset[1];
      if(posL=='leftIn'){
        o.style.left=rl+offL+'px';
      }else if(posL=='leftOut'){
        o.style.left=rl-ow-offL+'px';
      }else if(posL=='rightIn'){
        o.style.left=rl+rw-ow-offL+'px';
      }else if(posL=='rightOut'){
        o.style.left=rl+rw+offL+'px';
      }else if(posL=='center'){
        o.style.left=rl+(rw-ow)/2+'px';
      }
      if(posV=='topIn'){
        o.style.top=rt+offV+'px';
      }else if(posV=='topOut'){
        o.style.top=rt-oh-offV+'px';
      }else if(posV=='bottomIn'){
        o.style.top=rt+rh-oh-offV+'px';
      }else if(posV=='bottomOut'){
        o.style.top=rt+rh+offV+'px';
      }else if(posV=='center'){
        o.style.top=rt+(rh-oh)/2+'px';
      }
    }else{
      o.style.position='fixed';
      var _ow=getStyle(o,'width'),
        _oh=getStyle(o,'height'),
        ow=_ow && _ow !='auto' ? parseInt(_ow) : parseInt(o.offsetWidth),
        oh=_oh && _oh !='auto' ? parseInt(_oh) : parseInt(o.offsetHeight);
        posL=posArr[0],
        posV=posArr[1],
        offL=offset[0],
        offV=offset[1];
      if(posL=='center'){
        o.style.left='50%';
        o.style.marginLeft=-parseInt(ow)/2+'px';
      }else if(posL=='left'){
        o.style.left=offL+'px';
      }else if(posL=='right'){
        o.style.right=offL+'px';
      }
      if(posV=='center'){
        o.style.top='50%';
        o.style.marginTop=-parseInt(oh)/2+'px';
      }else if(posV=='top'){
        o.style.top=offV+'px';
      }else if(posV=='bottom'){
        o.style.bottom=offV+'px';
      }
    }
  }

  function addEvent(o,type,cb){
    if(o.addEventListener){
      o.addEventListener(type,cb,false);
    }else if(o.attachEvent){
      o.attachEvent('on'+type,cb);
    }
  }

  function Mlayer(opts){
    var opts=this._opts=opts || {};
    this.content=opts.content || '';
    this.position=opts.position || {};
    this.shadow=opts.shadow ? opts.shadow : 0;  // -1没有 0有无关闭 1有可关闭
    this.closeBtns=opts.closeBtns || [];
    this.submit=opts.submit || [];  // [按钮id,回调函数]
    this.effect=opts.effect || 0; // 0:fade 1:zoom 2:fromTop 3.fromBottom
    this.init.apply(this,arguments);
  }
  Mlayer.prototype.init=function(){
    var items=layer.items, 
      shadow=this.shadow,
      container,
      shadower,
      btns=this.closeBtns,
      submit=this.submit,
      p=this.position,
      effect=this.effect,
      self=this;
    if(shadow==0 || shadow==1){
      shadower=this.shadower=createShadow();
    }
    container=this.container=createContainer();
    container.parent=shadower || null;
    container.innerHTML=this.content;
    if(typeof effect=='number'){
      container.setAttribute('data-effect',layer.effects[effect]);
    }else if(typeof effect=='string'){
      container.setAttribute('data-effect',effect);
    }
    items.push(self);
    if(btns.length>0){
      for(var i=0,len=btns.length;i<len;i++){
        var cbtn=document.getElementById(btns[i]),
          _len=layer.items.length;
        addEvent(cbtn,'click',function(){
          layer.close(_len-1);
        })
      }
    }
    // 添加提交事件
    if(submit.length==2){
      var sBtn=document.getElementById(submit[0]);
      addEvent(sBtn,'click',function(){
        submit[1](sBtn);
      })
    }
    position(extend(p,{o:container}));

    if(shadow==1){
      var _len=items.length;
      addEvent(shadower,'click',function(e){
        var e=e || window.event,
          target=e.target || e.srcElement;
        if(target==shadower){
          layer.close(_len-1);
        }
      })
    }

  }

  layer.open=function(opts){
    var index,
      items=layer.items,
      effect;
    new Mlayer(opts);
    index=layer.items.length-1;
    zIndex++;
    items[index].container.style.zIndex=zIndex;
    effect=items[index].container.getAttribute('data-effect');
    if('classList' in items[index].container){
      items[index].container.classList.add(effect);
    }
    return index;
  }

  layer.close=function(i){
    var items=layer.items,
      container=items[i].container,
      shadower=container.parent;
    document.body.removeChild(container)
    items.splice(i,1);
    if(shadower) document.body.removeChild(shadower)
  }

  layer.closeAll=function(){
    var items=layer.items;
    for(var i=0,len=items.length;i<len;i++){
      var container=items[i].container,
        shadower=container.parent;
      document.body.removeChild(container);
      if(shadower) document.body.removeChild(shadower)
      items.splice(i,1);
    }
  }

  window.layer=layer;
})();