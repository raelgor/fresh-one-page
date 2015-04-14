// Image preloader
OnePage.prototype.startPreloader = function(){

  window.imageCache = [];

  // Preload static resources
  [
    /* Potentially useless assets
    
    'images/button_contact.jpg',
    'images/button_contact_active.jpg',
    
    */
    'images/button_contact.png',
    'images/button_contact_active.png',
    'images/contact_send_hover.png',
    'images/arrow_right_normal.png',
    'images/arrow_right_hover.png',
    'images/arrow_left_normal.png',
    'images/arrow_left_hover.png',
    'images/a-right.png',
    'images/a-left.png',
    'images/social.png',

  ].forEach(function(asset){

    var img = new Image();
    img.src = ROOT + asset;
    imageCache.push(img);

  });

};

// Preload on demand
OnePage.prototype.preload = function(urls){

  urls.forEach(function(url){

    var img = new Image();
    img.src = ROOT + url;
    imageCache.push(img);

  });

};