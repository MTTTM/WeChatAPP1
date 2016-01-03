/**
 * Created by Administrator on 2015/12/23.
 */
$(function(){
   var $main=$("#main");
    var $messageList=$("#messageList");
    var $phone=$("#phone");
    var $phoneBtn=$("#phoneBtn");
    var $phoneTouch=$("#phoneBtnTouch");
    var $phoneKey=$("#phoneKey")
    var $phoneHeadText=$("#phoneHead").find(".phoneHeadText");
    var $phoneKeyTouch=$phoneKey.find(".phoneKeyTouch");
    var $message=$("#message");
    //方块
    var $cube=$("#cube");
    var $cubeBox=$("#cubeBox");
    //分享
    var $cubeShare=$("#cubeShare");
    //设计稿宽高
    var desH=1008;
    var desW=640;
    //获取设备的宽高
    var viewHeight=$(window).height();
    var viewWidth=$(window).width();
    //音乐
    var oBell=$("#bells").get(0);
    var oSay=$("#say").get(0);
    var oMusic=$("#music").get(0);
    function init(){
      $main.css("transform",'scale('+(viewHeight/desH)+')');
        //获取伸缩后的世界宽度
        var changeW=viewWidth/viewHeight*desH;
        if(changeW>desW){ //现在最大宽度
            changeW=desW;
        }
        //给让在小屏幕下被隐藏的元素往显示区挪动,例如IPHONE4
        $messageList.css("padding","0"+" "+((desW-changeW)/2)+"px");
        //宽度缩放
        $messageList.css("transform","scale("+changeW/desW+")");
        //分享按钮，小屏幕隐藏挪动例如iphone4
        $cubeShare.css("marginRight",((desW-changeW)/2)+"px")

    }

  var phone=(function(){
      function init(){
        oBell.play();
          bind();
      }
      function bind(){
       $phoneTouch.on("touchstart",function(){
           oBell.pause();
           $phoneBtn.css("opacity",0);
           $phoneKey.css("transform","translate(0,0)")
           say();
       })
          function say(){
              $phoneHeadText.html("00:00");
              oSay.play();
              var timer=setInterval(function(){
                  $phoneHeadText.html( change(oSay.currentTime));
                  if(oSay.currentTime===oSay.duration){
                    clearInterval(timer);
                      closePhone();
                  }
              },1000);
          }
          //关闭
          function closePhone(){
              oSay.pause();
              $phone.css("transform","translateY("+(desH)+"px)");
              $phone.on("transitionEnd webkitTransitionEnd",function(){
                  $(this).remove();
                  message.init();
              })
          }
          //格式化
          function change(num){
            num=parseInt(num);
              var iM=toZero(Math.floor(num%3600/60));
              var iS=toZero(Math.floor(num%60));
              return iM+':'+iS;
          }
          function toZero(num){
              if(num<10){
                  return '0'+num;
              }
              else{
                  return ""+num;
              }
          }
          $phoneKeyTouch.on("touchstart",function(){
              closePhone();
          });
      }
      return {
          init:init
      }
  })();
    phone.init();
    var message=(function(){
        var $li=$messageList.find("li");
        var iNow=0;
        var IT=0;
        function init(){
          oMusic.play();
            move();
        }
        function move(){
           var timer=setInterval(function(){
             $li.eq(iNow).css("opacity",1).css("transform","translate(0,0)");
               if(iNow>3){
                    IT+=$li.eq(iNow).outerHeight(true)+10;
                   $messageList.css("transform","translate(0,"+(-IT)+"px)");
               }
               if(iNow==$li.length-1){
                   clearInterval(timer);
                   oMusic.pause();
                   closeMessage();
               }
               else{
                   iNow++;
               }
           },1000)
        }
        function closeMessage(){
            $message.css('transform','translate(0,'+(desH)+'px)');
            $message.on('transitionEnd webkitTransitionEnd',function(){
                $(this).remove();
                cube.init();
            });
        }
      return {
          init:init
      }
    })();
//3D方块运动
    var cube=(function(){
        var $li=$cubeBox.find("li");
        var downX=0;
        var downY=0;
        var startX=-45;
        var startY=45;
        var step = 1/2;
        var x = 0;
        var y = 0;
        var bBtn = true;
         function init(){
             $cubeBox.css("transform","scale(0.7) rotateX("+startX+"deg) rotateY("+startY+"deg)");
             $cubeBox.css("transition","1s");
             //运动完毕必须清楚过度
             $cubeBox.on('transitionEnd webkitTransitionEnd',function(){
                 $cubeBox.css('transition','');
             });
             bind();
         };
        //3D合作拖拽
        function bind(){
            $(document).on('touchstart',function(ev){
                var touch = ev.originalEvent.changedTouches[0];
                downX = touch.pageX;
                downY = touch.pageY;
                bBtn = true;
                $(document).on('touchmove.move',function(ev){
                    bBtn = false;
                    var touch = ev.originalEvent.changedTouches[0];

                    x = (downY - touch.pageY)*step;//对应着的是围绕Y轴旋转
                    y = (touch.pageX - downX)*step;
                   console.log( startX+x);
                    if( startX+x > 70 ){
                        x = -startX + 70;
                    }
                    else if( startX+x < -70 ){
                        x = -startX - 70;
                    }

                    $cubeBox.css('transform','scale(0.7) rotateX('+(startX+x)+'deg) rotateY('+(startY+y)+'deg)');

                });
                $(document).on('touchend.move',function(){
                    $(document).off('.move');
                });
            });

            $li.on('touchend',function(){
                if(bBtn){  //点击
                    //alert( $(this).index() );
                }
                else{  //拖拽
                    startX += x;
                    startY += y;
                }
            });
        }
        return {
            init : init
        };
    })();
    init();
   // cube.init();

})