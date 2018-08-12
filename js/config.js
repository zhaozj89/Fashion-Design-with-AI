var GLOBAL = GLOBAL || {};

var ResetConfiguration = function (){
    GLOBAL.width = 500;
    GLOBAL.height = 500;
    // GLOBAL.width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    // GLOBAL.height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
}

var SwitchCanvas = function(draw_canvas, svg_canvas, which) {

    var high_zindex = 30;
    var low_zindex = 20;

    switch (which) {
        case 'draw':
            $(draw_canvas).css('z-index', high_zindex);
            $(svg_canvas).css('z-index', low_zindex);
            break;
        case 'svg':
            $(draw_canvas).css('z-index', low_zindex);
            $(svg_canvas).css('z-index', high_zindex);
            break;
        default:
            alert('Error using SwitchCanvas API.');
            break;
    }
}
