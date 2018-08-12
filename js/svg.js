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
    // var border_w = 500;
    // var border_h = 500;
    var center_x = GLOBAL.width/2;
    var center_y = GLOBAL.height/2;

    var circle_config = {
        'cx': 250 - circle_w/2,
        'cy': 250 - circle_h/2,
        'r': 10,
        'fill': '#99d8c9'
    };

    // var border_config = {
    //     'x': center_x - border_w/2,
    //     'y': center_y - border_h/2,
    //     'width': border_w,
    //     'height': border_h,
    //     'fill-opacity': 0.0,
    //     'stroke': '#E6E9FF',
    //     'stroke-width': 2,
    //     'stroke-opacity': 0.4
    // };

    var circles = [];
    for(var i=0; i<6; ++i) {
        circles.push(MakeSVG('circle', circle_config));
    }
    // var border = MakeSVG('rect', border_config);

    // $(svg).append(border);
    $('#'+id).append(svg);

    // var draggable_border = new PlainDraggable(border);

    var draggable_circles = []
    for(var i=0; i<6; ++i) {
        $(svg).append(circles[i]);
        draggable_circles.push(new PlainDraggable(circles[i]));
    }

    return document.getElementById(id);
}
