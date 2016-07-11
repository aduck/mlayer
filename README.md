# mlayer

###APIS
`layer.open({

    content:'',  // 弹层内容，默认为空
  
    shadow:1,  // 蒙版类型，-1(无)/0(默认，有不可点击关闭)/1(有且可点击关闭)
  
    closeBtns:[],  // 可以关闭弹层的按钮id组成的数组
  
    submit:[],  // 确认提交，arr[0](提交按钮的id)/arr[1](回调函数)
  
    effect:0,  // 弹层弹出时css3动画，内置4种，0(fadeIn默认)/1(zoomIn)/2(fromTop)/3(fromBottom)
  
    position:{
    
      rel:document.getElementById(''),  // 相对于特定元素定位，没有rel属性时为fixed定位(相对于window)
    
      posArr:['',''],  // 位置属性string类型，rel存在时arr[0] (leftIn,leftOut,rightIn,rightOut,center)/ arr[1] (topIn,topOut,bottomIn,bottomOut,center)，rel不存在时arr[0] (left,right,center)/ arr[1] (top,bottom,center)
    
      offset:[,]  // 间距控制num类型
    }
  })`

