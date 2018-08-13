var psiTurk = new PsiTurk(uniqueId, adServerLoc, mode);

var pages = [
    "instructions/instruct-1.html",
    "instructions/instruct-ready.html",
    "app.html",
    "postquestionnaire.html"
];

psiTurk.preloadPages(pages);

var instructionPages = [
    "instructions/instruct-1.html",
    "instructions/instruct-ready.html"
];

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
    GLOBAL.end = new Date();
    let recorded_data = {
        time: (GLOBAL.end-GLOBAL.start)/1000,
        filename: GLOBAL.filename,
        landmark: landmark_positions,
        sketch: sketch_image
    };
    return recorded_data;
}

var MyExperiment = function() {
    psiTurk.showPage('app.html');

    var error_message = "<h1>Oops!</h1><p>Something went wrong submitting your HIT. This might happen if you lose your internet connection. Press the button to resubmit.</p><button id='resubmit'>Resubmit</button>";

    prompt_resubmit = function() {
      document.body.innerHTML = error_message;
      $("#resubmit").click(resubmit);
    };

    resubmit = function() {
      document.body.innerHTML = "<h1>Trying to resubmit...</h1>";
      reprompt = setTimeout(prompt_resubmit, 10000);

      psiTurk.saveData({
        success: function() {
            currentview = new Questionnaire();
        },
        error: prompt_resubmit
      });
    };

    GLOBAL.start = new Date();

    $(function() {
        // layers
        setTimeout(async function() {
            GLOBAL.canvas = MakeCanvas('DrawCanvas');
            GLOBAL.svg = MakeClothingLandmark('SVGCanvas');

            // load image
            let idx = Math.floor(Math.random()*59);
            if(idx<10) GLOBAL.filename='000'+idx+'.png';
            else GLOBAL.filename='00'+idx+'.png';
            $('#ImageCanvas').attr('src', '/static/assets/images/show/'+GLOBAL.filename);

            $(window).trigger('resize');
        }, 100);

        // handle events
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
                    GLOBAL.svg = MakeClothingLandmark('SVGCanvas');
                    SwitchCanvas(GLOBAL.canvas, GLOBAL.svg, 'svg');
                    break;
                case 'draw':
                case 'eraser':
                    SwitchCanvas(GLOBAL.canvas, GLOBAL.svg, 'draw');
                    break;
                case 'run':
                    $.ajax({
                      url: "/talk_to_AI",
                      type: "POST",
                      data: JSON.stringify(GetNeededRecordingData()),
                      contentType: "application/json",
                      success: function(res_data){
                          $('#ResultCanvas').children().remove();
                          image_uri = res_data['image'];
                          if(image_uri!=='') {
                              $("#ResultCanvas").append(ImageURI2DOM(image_uri));
                          }
                      },
                      error: function(){alert('error');}
                    });
                    break;
                case 'exit':
                    psiTurk.recordUnstructuredData('all_data', GetNeededRecordingData());

                    psiTurk.saveData({
                      success: function() {
                          currentview = new Questionnaire();
                      },
                      error: prompt_resubmit
                    });
                    break;
            }
        });
    });
};

var Questionnaire = function() {
};

var currentview;

$(window).load(function() {
    currentview = new MyExperiment();
    // psiTurk.doInstructions(
    //     instructionPages,
    //     function() {
    //         currentview = new MyExperiment();
    //     }
    // );
});
