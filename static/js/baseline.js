var createSection = function (n) {
  var section = new UI.Div();
  section.setClass("section");
  section.setAttribute('id', 'section' + n);
  section.setAttribute('data-anchor', 'page' + n);

  return section.dom;
}

var createSlide = function () {
  var slide = new UI.Div();
  slide.setClass('slide');

  return slide.dom;
}

var createSlides = function () {
  var slides = new UI.Div();
  slides.setClass('container');

  return slides.dom;
}

var createPlain = function(head, body) {
  var plain = new UI.Div();
  plain.setClass('container');

  var h = new UI.Head();
  h.setTextContent(head);

  var p = new UI.P();
  p.setTextContent(body);

  plain.add(h);
  plain.add(p);

  return plain.dom;
}

var createPlainWithImage = function (head, body, image) {
  var plain = new UI.Div();
  plain.setClass('container');

  var row = new UI.Div();
  row.setClass('row');

  var col0 = new UI.Div();
  col0.setClass('col-sm-8');

  var h = new UI.Head();
  h.setTextContent(head);

  var p = new UI.P();
  p.setTextContent(body);

  col0.add(h);
  col0.add(p);

  var col1 = new UI.Div();
  col1.setClass('col-sm-4');

  var a = new UI.A();
  if($.isEmptyObject(image)===false) {
    a.setAttribute('href', image.href);
    a.setAttribute('data-toggle', 'lightbox');
    a.setAttribute('data-max-width', '800');
    a.setAttribute('data-title', image.title);
    a.setAttribute('data-footer', image.footer);
  }

  var img = new UI.Img();
  if($.isEmptyObject(image)===false) {
    img.setAttribute('src', image.href);
    img.setAttribute('style', 'width: 100%; height: auto');
  }

  a.add(img);
  col1.add(a);

  row.add(col0);
  row.add(col1);

  plain.add(row);

  return plain.dom;
}

var createPlainWithImages = function (head, body, images) {
  var plain = new UI.Div();
  plain.setClass('container');

  var row = new UI.Div();
  row.setClass('row');

  var col0 = new UI.Div();
  col0.setClass('col-sm-8');

  var h = new UI.Head();
  h.setTextContent(head);

  var p = new UI.P();
  p.setTextContent(body);

  col0.add(h);
  col0.add(p);

  var col1 = new UI.Div();
  col1.setClass('col-sm-4');

  var a = new UI.A();
  if(images.length>0) {
    a.setAttribute('href', images[0].href);
    a.setAttribute('data-toggle', 'lightbox');
    a.setAttribute('data-gallery', 'hidden-images');
    a.setAttribute('data-max-width', '800');
    a.setAttribute('data-title', images[0].title);
    a.setAttribute('data-footer', images[0].footer);
  }

  col1.add(a);

  var img = new UI.Img();
  if(images.length>0) {
    img.setAttribute('src', images[0].href);
    img.setAttribute('style', 'width: 100%; height: auto');
  }

  a.add(img);

  for(var i=1; i<images.length; ++i){
    var tmpdiv = new UI.Div();
    tmpdiv.setAttribute('data-remote', images[i].href);
    tmpdiv.setAttribute('data-toggle', 'lightbox');
    tmpdiv.setAttribute('data-gallery', 'hidden-images');
    tmpdiv.setAttribute('data-max-width', '800');
    tmpdiv.setAttribute('data-title', images[i].title);
    tmpdiv.setAttribute('data-footer', images[i].footer);

    col1.add(tmpdiv);
  }

  row.add(col0);
  row.add(col1);

  plain.add(row);

  return plain.dom;
}

var createJumbotron = function() {
  var jumbotron = new UI.Div();
  jumbotron.appendClass('jumbotron');
  jumbotron.appendClass('text-center');

  jumbotron.addHTML('<h1><big>中国青铜器</big> 在线展览</h1>');

  return jumbotron.dom;
}
