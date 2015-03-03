/*
** FreshOnePage
** Copyright (c) 2015 Kosmas Papadatos
** License: MIT
*/

function OnePage(window){

  this.window = window;

  // Start the site
  this.initialize(window);
  console.log('FreshOnePage started.');

}

OnePage.prototype.initialize = function(window){

  var OnePage = this;

  // Temporary work image cachers
  window.prevCacher = {};
  window.nextCacher = {};

  // Disable text selection on head
	document.onselectstart = function(e){
	   if($(e.target).hasClass('head') || $(e.target).parents('.head').length)
	    return false;
	}

	// Major brain fart
	$('.container')
	    .bind('DOMSubtreeModified',false,function(){ OnePage.responsive() });

	// Disable selection everywhere, apparently
  window.ondragstart = function(){ return false; }

  // Start listening to popstate events
  this.setPopstateHandler();

  // Start preloading images
  this.startPreloader();

  // Create menu
  this.menuFactory();

  // Get current state amd replace state object because we just came here
  this.getStateFromUrl(1);

  // Bind scroll event handler
  $(window).scroll(function(e){

    // Spawn top-scroller
  	var halfHeight = window.innerHeight/2;
  	var bodyScroll = $('body').scrollTop();
  	var htmlScroll = $('html').scrollTop();

  	OnePage.setElementScale(
  	  '.top-scroller',
  	  bodyScroll > halfHeight || htmlScroll > halfHeight ? 1:0);

  	// Kill share menu on scroll
  	var shareMenu = $('.share-menu');
  	OnePage.setElementScale(shareMenu,0);
  	setTimeout(function(){ shareMenu.remove(); },500);

  });

  // Bind top-scroller click event handler
  $('.top-scroller').click(function(){

    $('body,html').animate(
      {scrollTop:0+'px'},
      1000,
      'swing',
      function(){ OnePage.setElementScale('.top-scroller',0); }
    );

  });

  // Key bind shortcuts
  $(window).keydown(function(e){

    if(!$(':focus').length){
      e.keyCode == 39 && $('.right-arrow').click();
      e.keyCode == 37 && $('.left-arrow') .click();
    }

  });

  // Cancel scroll animation if scroll caused by user
  // NOTE: Will most likely not work with touch. Must add touch event.
  $(window).on("mousewheel",function(){$('html,body').stop()});

  // Global click handler
  $(window).click(function(e){

    var shareMenus = $('.share-menu');

  	OnePage.setElementScale(shareMenus,0);
  	setTimeout(function(){ shareMenus.remove(); },500);

    if( $(e.target).is('.work-page-holder img') ){
      setTimeout(function(){OnePage.startImageViewer.call(e.target);},50);
    }

    var target = $(e.target);

    !target.hasClass('.image-viewer') &&
    !target.parents('.image-viewer').length &&
    $('.image-viewer:not(.unborn)').length &&
    $('.blurry').removeClass('blurry') &&
    $('.image-viewer').css({opacity:0,pointerEvents:'none'}) &&
    setTimeout(function(){ $('.image-viewer').remove(); },700);

  });

}

OnePage.prototype.setElementScale = function(selector,scale){
  $(selector).css({
    '-webkit-transform':'scale(' + scale + ')',
    '-moz-transform':'scale(' + scale + ')',
    '-o-transform':'scale(' + scale + ')',
    '-ms-transform':'scale(' + scale + ')'
  });
}

OnePage.prototype.fixSides = function(){

  // Do this manually to increase compatibility
  $('.side-bg').css('height',$('.container').height() + 'px');

}

// Glue CSS with JavaScript to increase compatibility. Must try a pure CSS
// solution some time soon though because this is ugly.
OnePage.prototype.responsive = function(){

	$('.container').css('min-height',window.innerHeight+'px');
	if( window.innerWidth <= 962 ){

		$('.nav-container').css({
			position: 'absolute',
			margin: '154px 0 0 0',
			left: ( $('.container').width()/2 - $('.nav-container').width()/2 ) + 'px'
		});

	} else {

		$('.nav-container').css({
			position: 'relative',
			margin: '80px 10% 0 0',
			left: '0px'
		});

	}

	$('.work').css({height: $('.work').width()*(336/441) + 'px'});
	this.fixSides();

}

OnePage.prototype.getShareHTML = function(work){

  var URL = 'http://fresh-ideas.eu' + ROOT + 'works/' + work.alias;
  var src = siteData.images.filter(function(i){
            return i.id == work.image_id; })[0].src;

  return '<a href="https://twitter.com/intent/tweet?text=' + URL +
         '" target="_blank"></a>' +
		     '<a href="https://www.facebook.com/sharer/sharer.php?u=' + URL +
		     '" target="_blank"></a>' +
		     '<a href="mailto:?subject=Fresh Ideas Project&X-Mailer=Baluba&body=' +
		     URL + '" target="_blank"></a>' +
		     '<a href="http://www.pinterest.com/pin/create/bookmarklet/?url=' +
		     URL + '&description=Fresh Ideas Project&image_url=' +
		     'http://fresh-ideas.eu/' + src +
		     '" target="_blank"></a>' +
		     '<a href="https://plus.google.com/share?url=' + URL +
		     '&hl=en-US" target="_blank"></a>' +
		     '<a href="http://tumblr.com/share?s=&v=3&t=Fresh%20Ideas%20Project&u='+
		     URL + '" target="_blank"></a>';

}

OnePage.prototype.shareMouseOver = function(work,coords){

  // Brain fart
  var OnePage = window.OnePage.prototype;

	var shareMenus = $('.share-menu');
	OnePage.setElementScale(shareMenus,0);
	setTimeout(function(){ shareMenus.remove(); },500);

	var shareHTML = OnePage.getShareHTML(work);

	$('body')
	  .append('<div class="share-menu ani05">'+shareHTML+'</div>')
	  .find('.share-menu:last-of-type')
	  .css({top:coords.top,left:coords.left})
	  .bind("mouseout click",function(e){

	if($(e.relatedTarget)
	    .is('.share-menu a,:has(.share-menu),.share-menu')
	    && e.type != "click") return;

	var shareMenus = $('.share-menu');
	OnePage.setElementScale(shareMenus,0);
	setTimeout(function(){ shareMenus.remove(); },500); });
	setTimeout(function(){
	  OnePage.setElementScale('.share-menu:last-of-type',1)},100);

}

OnePage.prototype.onSwipe = function(element,direction,callback){

  var swipe = new Hammer.Manager( $(element)[0] );

	swipe.add(new Hammer
	              .Swipe({velocity:.001,direction: Hammer.DIRECTION_HORIZONTAL}));

	swipe.on('swipe' + direction, function(e){
	                    callback.call( $(element)[0] , e ); });

}

OnePage.prototype.startImageViewer = function(){

  if($('.image-viewer,.work-page-holder:animated,.work-page-holder.client').length) return;

  var viewer = $('<div>');

  viewer.addClass('image-viewer ani05 unborn')
        .html('<div class="viewer-arrow-left"></div>' +
              '<div class="viewer-arrow-right"></div>')
        .find('*')
        .click(navigateImages);

  function navigateImages(){

    // Find next one
    console.log('navigate images called'+this.className);

  }

  // Brain super fart
  OnePage.prototype.onSwipe(viewer,'right',
                              function(){ $('.viewer-arrow-left') .click(); });
  OnePage.prototype.onSwipe(viewer,'left' ,
                              function(){ $('.viewer-arrow-right').click(); });

  function spawnImage(image){

    // Calculate dimensions
    var imageWidth      = image.width(),
        imageHeight     = image.height(),
        imageRatio      = imageWidth / imageHeight,
        props           = {
            viewerMaxWidth  : 90,
            viewerMaxHeight : 97,
            ratioHeight     : imageHeight / imageWidth,
            ratioWidth      : imageWidth / imageHeight,
            windowWidth     : window.innerWidth,
            windowHeight    : window.innerHeight
        },
        css             = {},
        newImgCss       = {},
        currentImage    = viewer.find('img'),
        newImage        = image.clone(),
        r               = 0

    function ratio(r){ return r ? imageRatio < 1 : imageRatio > 1 }

    // Dimensions
    css[ratio()?'width':'height'] =
            props["viewerMax"+(ratio()?'Width':'Height')] + '%';
    css[ratio()?'height':'width'] =
            props["viewerMax"+(ratio()?'Width':'Height')]*
            props["window"+(ratio()?'Width':'Height')]*
            props["ratio"+(ratio()?'Height':'Width')]/
            props["window"+(!ratio()?'Width':'Height')] + '%';

    if(+css[ratio()?'height':'width'].split('%')[0]>
        props["viewerMax"+(!ratio()?'Width':'Height')]){
          css[ratio(1)?'width':'height'] =
            props["viewerMax"+(ratio(1)?'Width':'Height')] + '%';
          css[ratio(1)?'height':'width'] =
            props["viewerMax"+(ratio(1)?'Width':'Height')]*
            props["window"+(ratio(1)?'Width':'Height')]*
            props["ratio"+(ratio(1)?'Height':'Width')]/
            props["window"+(!ratio(1)?'Width':'Height')] + '%';
          r = 1;
    }

    // Positioning
    css[ratio(r)?'left':'top'] =
            (100 - props["viewerMax"+(ratio(r)?'Width':'Height')])/2 + '%';
    css[ratio(r)?'top':'left'] =
            (100-(+(css[ratio(r)?'height':'width']).split('%')[0]))/2 + '%';

    // Apply
    viewer.css(css);

    currentImage.animate({opacity:0},500,'swing',
                          function(){ $(this).remove(); });

    newImgCss[ratio()?'width':'height'] = '100%';
    newImgCss.opacity = 0;

    newImage.css(newImgCss);

    setTimeout(function(){
      viewer.append(newImage);
      newImage.animate({opacity:1},500,'swing');
    },510);

    !currentImage.length &&
    viewer.css({opacity:0})
          .delay(10)
          .animate({opacity:1},500,'swing');

    setTimeout(function(){ viewer.removeClass('unborn'); },500)

  }


  $('body').append(viewer);

  spawnImage($(this));
  $('body>*:not(.image-viewer)').addClass('blurry');

}