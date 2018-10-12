function ImageURI2DOM(uri) {
  var image = document.createElement("img");

  image.onload = function () {
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");

    // set size proportional to image
    canvas.width = 500;
    canvas.height = 500;

    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    image.src = canvas.toDataURL();
  }

  image.src = uri;
  $(image).css('opacity', 1.0);
  return image;
}

var GetNeededRecordingData = function(){
    let landmark_positions = [];
    for(el of GLOBAL.landmarks) {
        landmark_positions.push(GetLandMarkPosition(el));
    }
    let sketch_image = GLOBAL.canvas.toDataURL('image/png');
    let recorded_data = {
        landmark: landmark_positions,
        sketch: sketch_image
    };
    return recorded_data;
}

var APP = function() {
    $(function() {
        GLOBAL.intro = introJs();
        GLOBAL.intro.setOption('showProgress', true);
        GLOBAL.intro.start();

        // layers
        setTimeout(async function() {
            GLOBAL.canvas = MakeCanvas('DrawCanvas');
            GLOBAL.svg = MakeClothingLandmark('SVGCanvas');

            // load image
            // let idx = Math.floor(Math.random()*59);
            // if(idx<10) GLOBAL.filename='000'+idx+'.png';
            // else GLOBAL.filename='00'+idx+'.png';
            // $('#ImageCanvas').attr('src', '/static/assets/images/show/'+GLOBAL.filename);
            // $('#ImageCanvas').attr('src', '/static/assets/images/2.jpg');

            GLOBAL.camera = MakeCamera('VideoCanvas');
            $(window).trigger('resize');
        }, 100);

        // Handling events

        // resize
        $(window).on('resize', function() {
            ResizeCanvas(GLOBAL.canvas);
        });

        // buttons
        $('.div_button').click(async function() {
            $('.div_button').each(function() {
                $(this).css('background-color', '#889288');
            });
            $(this).css('background-color', '#FF0000');

            // deal with events
            switch (this.id) {
                case 'landmark':
                    $('#Status').text('Adjust landmarks');
                    SwitchCanvas(GLOBAL.canvas, GLOBAL.svg, 'svg');
                    break;
                case 'draw':
                case 'eraser':
                    $('#Status').text('Sketch');
                    SwitchCanvas(GLOBAL.canvas, GLOBAL.svg, 'draw');
                    break;
                case 'clean':
                    $('#Status').text('Status');
                    GLOBAL.svg = MakeClothingLandmark('SVGCanvas');
                    CleanCanvas(GLOBAL.canvas);
                    $('#ResultCanvas').children().remove();
                    $(window).trigger('resize');
                    break;
                case 'run':
                    $('#Status').text('Start generating a clothing image ...');
                    $.ajax({
                      url: "/talk_to_AI_draw",
                      type: "POST",
                      data: JSON.stringify(GetNeededRecordingData()),
                      contentType: "application/json",
                      success: function(res_data){
                          $('#ResultCanvas').children().remove();
                          image_uri = res_data['image'];
                          if(image_uri!=='') {
                              $("#ResultCanvas").append(ImageURI2DOM(image_uri));
                              $('#Status').text('Generating finished');
                          }
                          else {
                              $('#Status').text('Generating error');
                          }
                      },
                      error: function(){$('#Status').text('Network error');}
                    });
                    break;
                case 'help':
                    GLOBAL.intro.start();
                    break;
            }
        });
    });
};

$(window).load(function() {
    APP();
    $('#Opacity').on('change', function(){
        let strval = $('#Opacity').find('input')[0].value;
        let floatval = parseFloat(strval)/100.0;
        $('#Opacity').find('span').text(floatval);
        $('#ResultCanvas').css('opacity', floatval);
    });
});
