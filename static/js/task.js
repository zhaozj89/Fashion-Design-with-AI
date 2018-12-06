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
  $(image).css('opacity', 0.6);
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

            // GLOBAL.camera = MakeCamera('VideoCanvas');
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
            $(this).css('background-color', '#007bff');

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

function loadImage(file) {
    var filename = file.name;
    var extension = filename.split( '.' ).pop().toLowerCase();

    switch ( extension ) {
        case 'png':
        case 'jpg':
            let image_name = './static/show/' + filename;
            $('#ImageCanvas').attr('src', image_name);
            break;
        default:
            alert('Only png and jpg are supported!');
    }
}

$(window).load(function() {
    APP();

    let form = document.createElement( 'form' );
	form.style.display = 'none';
	document.body.appendChild( form );

	let fileInput = document.createElement( 'input' );
	fileInput.type = 'file';
	fileInput.addEventListener( 'change', function ( event ) {
		loadImage( fileInput.files[ 0 ] );
		form.reset();
	} );
	form.appendChild( fileInput );

    $('#Image').click(function(){
        $('#ImageCanvas').css('display', 'block');
        $('#VideoCanvas').css('display', 'none');
        $('.ButtonMode').each(function(){
            $(this).css('background-color', '#6C757D');
        });
        $(this).css('background-color', '#007bff');
        fileInput.click();
    });

    $('#Camera').click(function(){
        $('#ImageCanvas').css('display', 'none');
        $('#VideoCanvas').css('display', 'block');
        $('.ButtonMode').each(function(){
            $(this).css('background-color', '#6C757D');
        });
        $(this).css('background-color', '#007bff');
    });

    $('#Opacity').on('change', function(){
        let strval = $('#Opacity').find('input')[0].value;
        let floatval = parseFloat(strval)/100.0;
        $('#Opacity').find('span').text(floatval);
        $('#ResultCanvas').children().css('opacity', floatval);
    });

    $('#StylizationOpacity').on('change', function(){
        let strval = $('#StylizationOpacity').find('input')[0].value;
        let floatval = parseFloat(strval)/100.0;
        $('#StylizationOpacity').find('span').text(floatval);
        $('#StylizedCanvas').children().css('opacity', floatval);
    });

    $('.Stylization').on('click', function(){
        $('.Stylization').each(function(){$(this).css('box-shadow', 'None');});
        $(this).css('box-shadow', '0px 0px 20px #007bff');

        if($("#ResultCanvas").children()[0]===undefined) {
            $('#Status').text('Stylization error. No content image.');
            return;
        }

        let content_uri = $("#ResultCanvas").children()[0].src;
        let style_name = $(this).attr('src');
        let split_name = style_name.split('/');
        style_name = split_name[split_name.length-1];

        if(content_uri===null) {
            $('#Status').text('Stylization error. No content image.');
            return;
        }
        else {
            $('#Status').text('Start stylization ...');
            let recorded_data = {
                content_data: content_uri,
                style_filename: style_name
            };
            $.ajax({
              url: "/stylize",
              type: "POST",
              data: JSON.stringify(recorded_data),
              contentType: "application/json",
              success: function(res_data){
                  $('#StylizedCanvas').children().remove();
                  image_uri = res_data['image'];
                  if(image_uri!=='') {
                      $("#StylizedCanvas").append(ImageURI2DOM(image_uri));
                      $('#Status').text('Stylization finished');
                  }
                  else {
                      $('#Status').text('Stylization error');
                  }
              },
              error: function(){$('#Status').text('Stylization Network error');}
            });
        }
    });
});
