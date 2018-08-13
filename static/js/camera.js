var MakeCamera = function(id){
    var video = document.getElementById(id);
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
    return video;
}
