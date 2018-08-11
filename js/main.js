$(function(){
    GLOBAL.WIDTH = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;;
    GLOBAL.HEIGHT = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

    GLOBAL.canvas= MakeCanvas("DrawCanvas");

    resizeCanvas(GLOBAL.canvas);
    clearScreen(GLOBAL.canvas);

    MakeCamera();
    $(window).trigger('resize');

    $(window).on('resize', function(){
        GLOBAL.WIDTH = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;;
        GLOBAL.HEIGHT = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
        resizeCanvas(GLOBAL.canvas);
    });

    // deal with buttons
    $('.div_button').click(function(){
        $('.div_button').each(function(){
            $(this).css('background-color', '#889288');
        });
        $(this).css('background-color', '#FF0000');

        // deal with events
        switch (this.id) {
            // case 'camera':
            //     MakeCamera();
            //     $(window).trigger('resize');
            //     break;
            case 'new':
                MakeClothingLandmark();
                break;
            default:

        }

    });
});

function resizeCanvas(canvas) {
    canvas.width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    canvas.height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
}

function clearScreen(canvas) {
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = '#F0F0F0';
    ctx.fillRect(0, 0, GLOBAL.WIDTH, GLOBAL.HEIGHT);
}
var MakeCanvas = function(id){
    var canvas = document.getElementById(id);
    var ctx=canvas.getContext("2d");
    var lastX;
    var lastY;
    var strokeColor="red";
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
        if(mode=="pen"){
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

    var mode="pen";
    $("#pen").click(function(){ mode="pen"; });
    $("#eraser").click(function(){ mode="eraser"; });

    return canvas;
}

var MakeCamera = function(){
    var video = document.getElementById('VideoCanvas');
    if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) {
            try {
                video.src = window.URL.createObjectURL(stream);
            } catch (error) {
                video.src = stream;
            }
            // video.src = window.URL.createObjectURL(stream);
            video.play();
        });
    }
}

var MakeClothingLandmark = function(){
    let svg = document.createElementNS( 'http://www.w3.org/2000/svg', 'svg' );
    svg.setAttribute( 'position', 'absolute' );
    svg.setAttribute( 'z-index', 60 );
    svg.setAttribute( 'width', '100%' );
    svg.setAttribute( 'height', '100%' );
    svg.ns = svg.namespaceURI;

    var circle= MakeSVG('circle', {cx: 100, cy: 50, r:40, stroke: 'black', 'stroke-width': 2, fill: 'red'});
    $(svg).append(circle);

    $('#SVGCanvas').append(svg);
}

var MakeSVG = function(tag, attrs) {
    var el= document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (var k in attrs)
        el.setAttribute(k, attrs[k]);
    return el;
}
