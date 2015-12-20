var app={};
var $main = $('#main');
var $list = $('#list');
var $li = $list.find('>li');
var desW = 640;
var desH = 960;
var viewHeight = $(window).height();
app.init=function(){
    //阻止默认事件
    $(document).on("touchmove",function(ev){
        ev.preventDefault()
    });
    app.layout();//布局....
    app.loading();//加载.....
    app.slideCanvas();//刮开canvase
    app.slideList();//滑屏
    //让所有li都默认为出场动画
    $.each(app.cjAnimate,function(i,obj){
        obj.outAn();
    });
};
app.layout=function(){
    $main.css('height',viewHeight);
};
app.nowWidth=function(){  //设置宽度
    var w = desW/desH * viewHeight;
    return w;
};
app.loading=function(){
    var arr = ['a.png','b.png','c.png','d.png','e.png','ad1.png','ad2.png','ad3.png','ad4.png','c1.png','c2.png','c3.png','c4.png','c5.png','c6.png','d1.png'];
    var iNow=0;
    var $loading = $('#loading');
    for(var i=0;i<arr.length;i++){
        var img=new Image();
        img.src = 'img/'+arr[i];
        img.onload=function(){
            iNow++;
            if(iNow>=arr.length){
                $loading.animate({opacity:0},1000,function(){
                    $(this).remove();
                });
            }
        };
        img.onerror = function(){ //如果出错直接进入.
            $loading.animate({opacity:0},1000,function(){
                 $(this).remove();
            });
        };
    }
};
app.slideCanvas=function(){
    var oC=$("#c1").get(0);
    var oGc=oC.getContext("2d");
    oC.height=viewHeight;
    var objImg=new Image();
    objImg.src="img/a.png";
    var Btn=true;//开关
    objImg.onload=function(){
        oGc.drawImage(objImg,(desW - app.nowWidth())/2 ,0,app.nowWidth(),viewHeight);
        oGc.fillStyle="red";
        oGc.globalCompositeOperation="destination-out";
        oGc.lineWidth=60;//设置笔画大小
        oGc.lineCap="round";//这种尽头是圆角
        $(oC).on("touchstart",function(ev){
            var touch=ev.originalEvent.changedTouches[0];
            var x=touch.pageX-$(this).offset().left;
            var y=touch.pageY-$(this).offset().top;
            if(Btn){
                Btn=false;
                oGc.moveTo(x,y);
                oGc.lineTo(x+1,y+1);
            }
            else{
                oGc.lineTo(x+1,y+1);
            }
            oGc.stroke();//描绘
            $(oC).on("touchmove.move",function(ev){
                var touch=ev.originalEvent.changedTouches[0];
                var x=touch.pageX-$(this).offset().left;
                var y=touch.pageY-$(this).offset().top;
                oGc.lineTo(x,y);//连接到当前坐标
                oGc.stroke();//描绘
                fadeOut();//计算透明区域大小，并且在超过1/2的时候移除
                function fadeOut(){
                    var dataImg=oGc.getImageData(0,0,oC.width,oC.height);
                    var iNum = 0;
                    var allPx=dataImg.width*dataImg.height;//获取所有像素数量,返回的是数字
                    for(var i=0;i<allPx;i++){
                        if(dataImg.data[i*4+3]==0){  //像素空间对应的像素值（r,g,b,a） 获取a
                            iNum++;
                        }
                    }
                    if( iNum > allPx/2 ){
                        $(oC).animate({opacity:0},1000,function(){
                            $(this).remove();
                            app.cjAnimate[0].inAn();
                        });
                    }
                }
            });
            $(oC).on("touchend",function(ev){
                $(oC).off(".move");
            })

        })
    }
};
app.slideList=function(){
        $li.css('backgroundPosition',( (desW - app.nowWidth())/2 )+'px 0');
        var downY=0;
        var step=1/4;//减少移动距离
        var nextorprevIndex=0;//上一个或下一个索引
        var noIndex=0;//当前索引
        var Btn=true;//禁止快速滑动开关
        $li.on("touchstart",function(ev){
            //一开始就判断开关，如果没有完成上一个运动就不允许操作
            if(!Btn){return;} Btn=false;
            var touch = ev.originalEvent.changedTouches[0];
            downY = touch.pageY;
            nowIndex=$(this).index();
            $li.on("touchmove.move",function(ev){
                var touch=ev.originalEvent.changedTouches[0];
                $(this).siblings().hide();//非当前的都隐藏掉
                if(touch.pageY<downY){  //手指向上滑动
                    nextorprevIndex=nowIndex==$li.length-1?0:nowIndex+1;
                    $li.eq(nextorprevIndex).css("transform","translate(0,"+(viewHeight+touch.pageY-downY)+"px");
                }
                else if(touch.pageY>downY){ //向下
                    nextorprevIndex=nowIndex==0?$li.length-1:nowIndex-1;
                    $li.eq(nextorprevIndex).css("transform","translate(0,"+(-viewHeight+touch.pageY-downY)+"px");
                }
                else{ //没有滑屏的时候运行下一步操作
                    Btn=true;
                }
                $li.eq(nextorprevIndex).show().addClass("zIndex");
                //不管是往上还是往下，当前li都是执行缩放和移动
                var scale=1-Math.abs(touch.pageY-downY)/viewHeight*step;//缩小值
                $(this).css("transform","translate(0,"+(touch.pageY-downY)*step+"px) scale("+scale+")");
            });
            $li.on("touchend",function(ev){
                $li.off(".move");
                //鼠标放开的时候执行切换运动
                if(touch.pageY<downY) {  //手指向上滑动
                    $(this).css("transform","translate(0,"+(-viewHeight*step)+"px) scale("+0+")");
                }
                else if(touch.pageY>downY) { //向下
                    $(this).css("transform","translate(0,"+(viewHeight*step)+"px) scale("+0+")");
                }
                $(this).css("transition",'.3s');
                $li.eq(nextorprevIndex).css("transform",'translate(0,0)');
                $li.eq(nextorprevIndex).css('transition','.3s');
            })

        });
        //监听运动结束
        $li.on('transitionEnd webkitTransitionEnd',function(ev){
            if($li.is(ev.target)){
                resetFn();
                //当前出场和下一个入场是同步的
                if(app.cjAnimate[nowIndex]){//当前li执行出场
                    app.cjAnimate[nowIndex].outAn();
                }
                if(app.cjAnimate[nextorprevIndex]){//下一个执行出场
                    app.cjAnimate[nextorprevIndex].inAn();
                }


            }

        });
        function resetFn(){
            $li.css('transition','');//防止快速滑动的时候累计
            $li.eq(nextorprevIndex).removeClass("zIndex").siblings().hide();
            Btn=true;
        }
};
//进场入场队列
app.cjAnimate=[
        {
            inAn : function(){
                var $liChild = $li.eq(0).find('li');
                $liChild.css('opacity',1);
                $liChild.css('transform','translate(0,0)');
                $liChild.css('transition','1s');
            },
            outAn : function(){
                var $liChild = $li.eq(0).find('li');
                $liChild.css('transition','');
                $liChild.css('opacity',0);
                $liChild.filter(':even').css('transform','translate(-200px,0)');
                $liChild.filter(':odd').css('transform','translate(200px,0)');
            }
        },
        {
            inAn : function(){
                var $liChild = $li.eq(1).find('li');
                $liChild.attr("class","");
                $liChild.css('transform','rotate(720deg)');//默认是围绕Z轴旋转
                $liChild.css('transition','.1s');
            },
            outAn : function(){
                var $liChild = $li.eq(1).find('li');
                $liChild.addClass("active");
                $liChild.css('transform','rotate(0)');
            }
        },
        {
            inAn : function(){
                var $liChild = $li.eq(2).find('div');
                $liChild.css('transform','rotateY(360deg)');
                $liChild.css('transition','1s');
            },
            outAn : function(){
                var $liChild = $li.eq(2).find('div');
                $liChild.css('transform','rotateY(0)');
            }
        },
        {
            inAn : function(){
                var $liChild = $li.eq(3).find('li');
                $liChild.attr("class","");
                $liChild.css('transition','.3s');
            },
            outAn : function(){
                var $liChild = $li.eq(3).find('li');
                $liChild.addClass("active");
                $liChild.css('transition','.3s');
            }
        }
        ];

//初始化对象
app.init();