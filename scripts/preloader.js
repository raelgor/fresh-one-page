// Image preloader
OnePage.prototype.startPreloader = function(){

  window.imageCache = [];
  siteData.images.forEach(function(i){

    return;

    var img = new Image();
    img.src = '/' + i.src;
    imageCache.push(img);

  });

  // Preload static resources
  [

    'images/button_contact.jpg',
    'images/button_contact_active.jpg',
    'images/contact_send_hover.png',
    'images/arrow_right_normal.png',
    'images/arrow_right_hover.png',
    'images/arrow_left_normal.png',
    'images/arrow_left_hover.png',

  ].forEach(function(asset){

    var img = new Image();
    img.src = ROOT + asset;
    imageCache.push(img);

  });

}

// Preload on demand
OnePage.prototype.preload = function(urls){

  urls.forEach(function(url){

    var img = new Image();
    img.src = ROOT + url;
    imageCache.push(img);

  });

};