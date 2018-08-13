function imageURI2DOM(uri, classname) {
  var p = document.createElement("p");
  p.className = classname;

  var span = document.createElement("span");
  p.appendChild(span);

  var image = document.createElement("img");

  // resize image
  image.onload = function () {

    var max_width = 320;
    if(image.width<max_width)
      return;

    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");

    // set size proportional to image
    canvas.width = max_width;
    canvas.height = canvas.width * (image.height / image.width);

    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    image.src = canvas.toDataURL();
  }

  image.src = uri;
  span.appendChild(image);

  return p;
  // var imgUrl = '<p class="userImg"><span><img src=\"' + imgURI + '\"></span></p>';
}

function getBotResponse() {
  var rawInput = quill.getContents(0);
  var size = rawInput["ops"].length;

  var rawText = '';
  var imgURI = '';
  var i;
  for(i=0; i<size; ++i) {
    if(typeof(rawInput["ops"][i]["insert"])==="string") {
      if(rawInput["ops"][i]["insert"].length===1)
        rawText = '';
      else
        rawText = rawInput["ops"][i]["insert"];

      var userHtml = '<p class="userText"><span>' + rawText + '</span></p>';
      if(rawText!=='') {
        $("#chatbox").append(userHtml);
      }
    }
    else if(typeof(rawInput["ops"][i]["insert"])==="object") {
      imgURI = rawInput["ops"][i]["insert"]["image"];
      if(imgURI!=='') {
        $("#chatbox").append(imageURI2DOM(imgURI, 'userImg'));
      }
    }
  }

  quill.deleteText(0, quill.getLength());

  document.getElementById('userInput').scrollIntoView({
    block: 'start',
    behavior: 'smooth'
  });

  // prepare data
  var data = {
    text: rawText,
    number: i,
    image: imgURI
  };

  $.ajax({
    url: "/get_art_tutor_response",
    type: "POST",
    data: JSON.stringify(data),
    contentType: "application/json",
    success: function(res_data){
      text = res_data['text']
      image_uri = res_data['image']

      // render text
      if(text!=='') {
        var botHtml = '<p class="botText"><span>' + text + '</span></p>';
        $("#chatbox").append(botHtml);
      }

      // render image
      if(image_uri!=='') {
        $("#chatbox").append(imageURI2DOM(image_uri, 'botImg'));
      }

      document.getElementById('userInput').scrollIntoView({
        block: 'start',
        behavior: 'smooth'
      });
    },
    error: function(){alert('error');}
  });
}

$("#buttonInput").click(function() {
  getBotResponse();
});

var quill = new Quill('#textInput', {
  modules: {
    toolbar: [
      ['image']
    ]
  },
  placeholder: 'Message',
  theme: 'snow'  // or 'bubble'
});
