$(function(){
    ResetConfiguration();

    async function main(){
        GLOBAL.canvas = MakeCanvas('DrawCanvas');
        GLOBAL.camera = MakeCamera('VideoCanvas');
        GLOBAL.svg = MakeClothingLandmark('SVGCanvas');


        let landmark_image = GLOBAL.MakeLandmarkImage();
        let stage1_image = await GLOBAL.RunStage_1_Model(landmark_image);
        console.log(stage1_image);
        GLOBAL.ShowImageCanvas(stage1_image);

        $(window).trigger('resize');
    }

    // layers
    setTimeout(main(), 100);

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
