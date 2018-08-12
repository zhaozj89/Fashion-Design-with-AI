function ResizeCanvas(canvas) {
    canvas.width = GLOBAL.width;
    canvas.height = GLOBAL.height;
}

function CleanCanvas(canvas) {
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = '#F0F0F0';
    ctx.fillRect(0, 0, GLOBAL.width, GLOBAL.height);
}

var MakeCanvas = function(id){
    var canvas = document.getElementById(id);
    var ctx=canvas.getContext("2d");
    var lastX;
    var lastY;
    var strokeColor="black";
    var strokeWidth=5;
    var mouseX;
    var mouseY;
    var canvasOffset=$("#"+id).offset();
    var offsetX=canvasOffset.left;
    var offsetY=canvasOffset.top;
    var isMouseDown=false;

    function handleMouseDown(e){
      mouseX=parseInt(e.clientX-offsetX);
      mouseY=parseInt(e.clientY-offsetY);

      // Put your mousedown stuff here
      lastX=mouseX;
      lastY=mouseY;
      isMouseDown=true;
    }

    function handleMouseUp(e){
      mouseX=parseInt(e.clientX-offsetX);
      mouseY=parseInt(e.clientY-offsetY);

      // Put your mouseup stuff here
      isMouseDown=false;
    }

    function handleMouseOut(e){
      mouseX=parseInt(e.clientX-offsetX);
      mouseY=parseInt(e.clientY-offsetY);

      // Put your mouseOut stuff here
      isMouseDown=false;
    }

    function handleMouseMove(e){
      mouseX=parseInt(e.clientX-offsetX);
      mouseY=parseInt(e.clientY-offsetY);

      // Put your mousemove stuff here
      if(isMouseDown){
        ctx.beginPath();
        if(mode=="draw"){
          ctx.globalCompositeOperation="source-over";
          ctx.moveTo(lastX,lastY);
          ctx.lineTo(mouseX,mouseY);
          ctx.stroke();
        }else{
          ctx.globalCompositeOperation="destination-out";
          ctx.arc(lastX,lastY,8,0,Math.PI*2,false);
          ctx.fill();
        }
        lastX=mouseX;
        lastY=mouseY;
      }
    }

    $("#DrawCanvas").mousedown(function(e){handleMouseDown(e);});
    $("#DrawCanvas").mousemove(function(e){handleMouseMove(e);});
    $("#DrawCanvas").mouseup(function(e){handleMouseUp(e);});
    $("#DrawCanvas").mouseout(function(e){handleMouseOut(e);});

    var mode="draw";
    $("#draw").click(function(){ mode="draw"; });
    $("#eraser").click(function(){ mode="eraser"; });

    return canvas;
}
