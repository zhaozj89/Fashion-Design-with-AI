var MakeSVG = function(tag, attrs) {
    var el= document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (var k in attrs)
        el.setAttribute(k, attrs[k]);
    return el;
}

var MakeClothingLandmark = function(id){
    let svg = document.createElementNS( 'http://www.w3.org/2000/svg', 'svg' );
    svg.setAttribute( 'position', 'absolute' );
    svg.setAttribute( 'z-index', 60 );
    svg.setAttribute( 'width', '100%' );
    svg.setAttribute( 'height', '100%' );
    svg.ns = svg.namespaceURI;

    var circle_w = 10;
    var circle_h = 10;
    var center_x = GLOBAL.width/2;
    var center_y = GLOBAL.height/2;

    var circle_config = {
        'cx': 250 - circle_w/2,
        'cy': 250 - circle_h/2,
        'r': 10,
        'fill': '#99d8c9'
    };

    var circles = [];
    for(var i=0; i<6; ++i) {
        circles.push(MakeSVG('circle', circle_config));
    }

    $('#'+id).append(svg);

    var draggable_circles = []
    for(var i=0; i<6; ++i) {
        $(svg).append(circles[i]);
        draggable_circles.push(new PlainDraggable(circles[i]));
    }

    GLOBAL.landmarks = circles;

    return document.getElementById(id);
}

var GetCirclePosition = function(el) {
    var x = parseInt($(el).attr('cx'));
    var y = parseInt($(el).attr('cy'));
    var transform = $(el).css('transform').split(',');
    x = x + parseInt(transform[4]);
    y = y + parseInt(transform[5]);
    return [x, y];
}
