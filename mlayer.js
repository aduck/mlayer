var layer={},
	zIndex=999,  // 默认层级
	count=0, 	// 弹层计数
	attached=false; // shadow是否绑定事件
layer.items=[];  // 所有弹层
layer.effect=['fadeIn','zoomIn','fromTop','fromBottom'];  // 动画管理

function createShadow(){
	if(!layer.shadow){
		var shadow=layer.shadow=document.createElement('div');
		shadow.className='mlayer-shadow';
		shadow.style.zIndex=zIndex;
		document.body.appendChild(shadow);
		return shadow;
	}
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

function isEqual(a,b){
	if(typeof a!='object' && typeof b!='object' ){
		return a==b;
	}else if(a instanceof Array && b instanceof Array){
		if(a.length!=b.length) return false;
		for(var i=0,len=a.length;i<len;i++){
			return isEqual(a[i],b[i]);
		}
	}else if(typeof a=='object' && typeof b=='object'){
		if(Object.getOwnPropertyNames){
			if(Object.getOwnPropertyNames(a).length!=Object.getOwnPropertyNames(b).length) return false;
		}else{
			var al=0,bl=0;
			for(var x in a){
				al++;
			}
			for(var x in b){
				bl++;
			}
			if(al!=bl) return false;
		}
		for(var x in a){
			return b[x] && isEqual(a[x],b[x]);
		}
	}
	return false;
}

function position(o,p){
	var pl,
		pv,
		_ow=getStyle(o,'width'),
		_oh=getStyle(o,'height'),
		ow=_ow && _ow !='auto' ? _ow : o.offsetWidth,
		oh=_oh && _oh !='auto' ? _oh : o.offsetHeight;
	if(p instanceof Array){
		pl=p[0];
		pv=p[1];
	}else if(typeof p=='string'){
		pl=pv=p;
	}
	function _pos(a,b,c,d){
		if(a=='center'){
			o['style'][b]='50%';
			o['style'][c]=-parseInt(d)/2+'px';
		}else if(typeof a=='number'){
			o['style'][b]=[d]+'px';
		}
	}
	_pos(pl,'left','marginLeft',ow);
	_pos(pv,'top','marginTop',oh);
}

function addEvent(o,type,cb){
	if(o.addEventListener){
		o.addEventListener(type,cb,false);
	}else if(o.attachEvent){
		o.attachEvent('on'+type,cb);
	}
}

function mClass(o,m,cname){
	function _hasClass(o,cname){
		var _classArr=o.className.split(' ');
		for(var i=0,len=_classArr.length;i<len;i++){
			if(_classArr[i]==cname) return i;
		}
		return -1;
	}
	var resArr=o.className.split(' ');
	if(m=='add'){
		if(_hasClass(o,cname)==-1){
			resArr.push(cname)
			o.className=resArr.join(' ');
		}
	}else if(m=='remove'){
		if(_hasClass(o,cname)>-1){
			var _index=_hasClass(o,cname);
			resArr.splice(_index,1)
			o.className=resArr.join(' ');
		}
	}
}

function Mlayer(opts){
	var opts=this._opts=opts || {};
	this.content=opts.content || '';
	this.position=opts.position || 'center';
	this.shadow=opts.shadow ? opts.shadow : 0;  // -1没有 0有无关闭 1有可关闭
	this.closeBtns=opts.closeBtns || [];
	this.effect=opts.effect || 1; // 1:fade 2:zoom 3:fromTop 4.formBottom
	this.open=1;
	this.init.apply(this,arguments);
}
Mlayer.prototype.init=function(){
	var shadow=this.shadow,
		container,
		shadower,
		btns=this.closeBtns,
		self=this,
		p=this.position,
		effect=this.effect;
	if(shadow==0){
		shadower=this.shadower=createShadow();
	}else if(shadow==1){
		shadower=this.shadower=createShadow();
		if(!attached){
			addEvent(shadower,'click',function(e){
				var e=e || window.event,
					target=e.target || e.srcElement;
				if(target==shadower){
					layer.closeAll();
				}
			})
			attached=true;
		}
	}
	container=this.container=createContainer();
	container.innerHTML=this.content;
	container.setAttribute('data-effect',layer.effect[effect]);
	layer.items.push(self);
	if(btns.length>0){
		for(var i=0,len=btns.length;i<len;i++){
			var cbtn=document.getElementById(btns[i]),
				_len=layer.items.length;
			addEvent(cbtn,'click',function(){
				layer.close(_len-1);
			})
		}
	}
	position(container,p);
}

// 判断是否已存在
function exists(opts,arr){
	for(var i=0,len=arr.length;i<len;i++){
		if(isEqual(arr[i]['_opts'],opts)){
			return i;
		}
	}
	return -1;
}

layer.open=function(opts){
	var index,
		items=layer.items,
		effect;
	if(exists(opts,items)>-1){
		index=exists(opts,layer.items);
	}else{
		new Mlayer(opts);
		index=layer.items.length-1;
	}
	zIndex++;
	if(layer.shadow){
		layer.shadow.style.display='block';
	}
	items[index].open=1;
	items[index].container.style.display='block';
	items[index].container.style.zIndex=zIndex;
	effect=items[index].container.getAttribute('data-effect');
	if('classList' in items[index].container){
		items[index].container.classList.add(effect);
	}else{
		mClass(items[index].container,'add',effect);
	}
	return index;
}

layer.close=function(i){
	var items=layer.items,
		container=items[i].container,
		effect=container.getAttribute('data-effect');
	items[i].open=0;
	container.style.display='none';
	if('classList' in container){
		container.classList.remove(effect);
	}else{
		mClass(container,'remove',effect);
	}
	for(var j=0,len=items.length;j<len;j++){
		if(items[j].open) return;
	}
	if(layer.shadow) layer.shadow.style.display='none';
}

layer.closeAll=function(){
	var items=layer.items;
	if(layer.shadow){
		layer.shadow.style.display='none';
	}
	for(var i=0,len=items.length;i<len;i++){
		var container=items[i].container,
			effect=container.getAttribute('data-effect');
		container.style.display='none';
		if('classList' in container){
			container.classList.remove(effect);
		}else{
			mClass(container,'remove',effect);
		}
	}
}

window.layer=layer;