// Image preloader
OnePage.prototype.startPreloader = function(){

  window.imageCache = [];
  siteData.images.forEach(function(i){

    return;

    var img = new Image();
    img.src = '/' + i.src;
    imageCache.push(img);

  });

}