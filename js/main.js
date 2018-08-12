$(function(){
    ResetConfiguration();

    // layers
    setTimeout(function(){
        GLOBAL.canvas = MakeCanvas('DrawCanvas');
        GLOBAL.camera = MakeCamera('VideoCanvas');
        GLOBAL.svg = MakeClothingLandmark('SVGCanvas');

        $(window).trigger('resize');
    }, 100);

    // handle events
    // resize
    $(window).on('resize', function(){
        ResetConfiguration();
        ResizeCanvas(GLOBAL.canvas);
    });

    // buttons
    $('.div_button').click(function(){
        $('.div_button').each(function(){
            $(this).css('background-color', '#889288');
        });
        $(this).css('background-color', '#FF0000');

        // deal with events
        switch (this.id) {
            case 'landmark':
                SwitchCanvas(GLOBAL.canvas, GLOBAL.svg, 'svg');
                break;
            case 'draw':
                SwitchCanvas(GLOBAL.canvas, GLOBAL.svg, 'draw');
                break;
            default:
        }
    });
});
