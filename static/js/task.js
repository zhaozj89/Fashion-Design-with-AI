// function GetURLParameter(sParam) {
//   var sPageURL = window.location.search.substring(1);
//   var sURLVariables = sPageURL.split('&');
//   for (var i = 0; i < sURLVariables.length; i++) {
//     var sParameterName = sURLVariables[i].split('=');
//     if (sParameterName[0] === sParam) {
//       return sParameterName[1];
//     }
//   }
//   return null;
// }

// var DEMO = GetURLParameter('demo');
// console.log(DEMO);

// var psiTurk = new PsiTurk(uniqueId, adServerLoc, mode);

// var pages = [
//     "instructions/instruct-1.html",
//     "instructions/instruct-ready.html",
//     "app.html",
//     "postquestionnaire.html"
// ];

// psiTurk.preloadPages(pages);

// var instructionPages = [
//     "instructions/instruct-1.html",
//     "instructions/instruct-ready.html"
// ];

// var postquestionnairePage = "postquestionnaire.html";

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
    // psiTurk.showPage('app.html');

    // var error_message = "<h1>Oops!</h1><p>Something went wrong submitting your HIT. This might happen if you lose your internet connection. Press the button to resubmit.</p><button id='resubmit'>Resubmit</button>";

    // prompt_resubmit = function() {
    //   document.body.innerHTML = error_message;
    //   $("#resubmit").click(resubmit);
    // };

    // resubmit = function() {
    //   document.body.innerHTML = "<h1>Trying to resubmit...</h1>";
    //   reprompt = setTimeout(prompt_resubmit, 10000);

    //   psiTurk.saveData({
    //     success: function() {
    //         currentview = new Questionnaire();
    //     },
    //     error: prompt_resubmit
    //   });
    // };

    // GLOBAL.start = new Date();

    $(function() {

        // if(DEMO!=="true"){
            GLOBAL.intro = introJs();
            GLOBAL.intro.setOption('showProgress', true);
            GLOBAL.intro.start();
        // }

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
                // case 'exit':
                //     psiTurk.recordUnstructuredData('all_data', GetNeededRecordingData());
                //     psiTurk.saveData({
                //       success: function() {
                //           currentview = new PostQuestionnaire();
                //       },
                //       error: prompt_resubmit
                //     });
                //     break;
            }
        });
    });
};

// var PostQuestionnaire = function() {
//   psiTurk.showPage(postquestionnairePage);

//   $(document).ready(function() {
//     // load your iframe with a url specific to your participant
//     $('#iframe').attr('src', 'https://ust.az1.qualtrics.com/jfe/form/SV_3UByw6DWqCghViZ?UID=' + uniqueId);

//     var handler = function(event) {
//       // normally there would be a security check here on event.origin (see the MDN link above), but meh.
//       if (event.data) {
//         if (typeof event.data === 'string') {
//           q_message_array = event.data.split('|');
//           if (q_message_array[0] == 'QualtricsEOS') {
//             psiTurk.recordTrialData({
//               'phase': 'postquestionnaire',
//               'status': 'back_from_qualtrics'
//             });
//             psiTurk.recordUnstructuredData('qualtrics_session_id', q_message_array[2]);

//             window.removeEventListener('message', handler);

//             psiTurk.recordTrialData({
//               'phase': 'finish_all',
//               'status': 'finish_all'
//             });
//             psiTurk.recordUnstructuredData('user_id', uniqueId);

//             var error_message = "<h1>Oops!</h1><p>Something went wrong submitting your HIT. This might happen if you lose your internet connection. Press the button to resubmit.</p><button id='resubmit'>Resubmit</button>";

//             prompt_resubmit = function() {
//               document.body.innerHTML = error_message;
//               $("#resubmit").click(resubmit);
//             };

//             resubmit = function() {
//               document.body.innerHTML = "<h1>Trying to resubmit...</h1>";
//               reprompt = setTimeout(prompt_resubmit, 10000);

//               psiTurk.saveData({
//                 success: function() {
//                   clearInterval(reprompt);
//                   $('#iframe').hide();
//                   var text = 'Finished, your survey code is: ' + uniqueId + '. Please fill it out at AMT website to finished the expriment. Thanks for your work.'
//                   $("#uniquecode").text(text);
//                 },
//                 error: prompt_resubmit
//               });
//             };

//             psiTurk.saveData({
//               success: function() {
//                 $('#iframe').hide();
//                 var text = 'Finished, your survey code is:' + uniqueId + '. Please fill it out at AMT website to finished the expriment. Thanks for your work.'
//                 $("#uniquecode").text(text);
//               },
//               error: prompt_resubmit
//             });
//           }
//         }
//       }
//     }

//     // add the all-important message event listener
//     window.addEventListener('message', handler);

//     // fullscreen
//     function set_full() {
//       $('#iframe').css({
//         position: 'absolute',
//         width: $(window).width(),
//         height: $(window).height()
//       });
//     }

//     $(window).resize(function() {
//       set_full();
//     });

//     set_full();
//   });
// }

// var currentview;

$(window).load(function() {
    // if(DEMO==="true")
    MyExperiment();
    // else {
    //     psiTurk.doInstructions(
    //         instructionPages,
    //         function() {
    //             currentview = new MyExperiment();
    //         }
    //     );
    // }
});
