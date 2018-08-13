var MakeSVG = function(tag, attrs) {
    var el= document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (var k in attrs)
        el.setAttribute(k, attrs[k]);
    return el;
}


var LandmarkConfig = [
    {
        'cx': 200,
        'cy': 100,
        'r': 10,
        'fill': '#99d8c9'
    },
    {
        'cx': 300,
        'cy': 100,
        'r': 10,
        'fill': '#99d8c9'
    },
    {
        'cx': 200,
        'cy': 200,
        'r': 10,
        'fill': '#fdae6b'
    },
    {
        'cx': 300,
        'cy': 200,
        'r': 10,
        'fill': '#fdae6b'
    },
    {
        'cx': 200,
        'cy': 400,
        'r': 10,
        'fill': '#f03b20'
    },
    {
        'cx': 300,
        'cy': 400,
        'r': 10,
        'fill': '#f03b20'
    }
];

var MakeClothingLandmark = function(id){
    $('#'+id).children().remove();

    let svg = document.createElementNS( 'http://www.w3.org/2000/svg', 'svg' );
    svg.setAttribute( 'position', 'absolute' );
    // svg.setAttribute( 'z-index', 60 );
    svg.setAttribute( 'width', '100%' );
    svg.setAttribute( 'height', '100%' );
    svg.ns = svg.namespaceURI;

    var landmarks = [];
    for(var i=0; i<6; ++i) {
        landmarks.push(MakeSVG('circle', LandmarkConfig[i]));
    }

    $('#'+id).append(svg);

    var draggable_landmarks = []
    for(var i=0; i<6; ++i) {
        $(svg).append(landmarks[i]);
        draggable_landmarks.push(new PlainDraggable(landmarks[i]));
    }

    GLOBAL.landmarks = landmarks;

    return document.getElementById(id);
}

var GetLandMarkPosition = function(el) {
    var x = parseInt($(el).attr('cx'));
    var y = parseInt($(el).attr('cy'));
    var transform = $(el).css('transform').split(',');
    x = x + parseInt(transform[4]);
    y = y + parseInt(transform[5]);
    return [x, y];
}
