/*
** FreshOnePage
** Copyright (c) 2015 Kosmas Papadatos
** License: MIT
*/

window.TOUCH_SENSITIVITY = 250;

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

  // Get current state and replace state object because we just came here
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
  $('.top-scroller').bind("click touchend",function(){

    $('body,html').animate(
      {scrollTop:0+'px'},
      1000,
      'swing',
      function(){ OnePage.setElementScale('.top-scroller',0); }
    );

  });

  // Key bind shortcuts
  $(window).keydown(function(e){

    if($('.image-viewer').length){
      e.keyCode == 39 && $('.viewer-arrow-right').click();
      e.keyCode == 37 && $('.viewer-arrow-left') .click();
    }

    if(!$(':focus').length && !$('.image-viewer').length){
      e.keyCode == 39 && $('.right-arrow').click();
      e.keyCode == 37 && $('.left-arrow') .click();
    }

    e.keyCode == 27 && killImageViewer();

  });

  // Cancel scroll animation if scroll caused by user
  // NOTE: Will most likely not work with touch. Must add touch event.
  $(window).on("mousewheel",function(){$('html,body').stop()});

  function killImageViewer(){
    $('.blurry').removeClass('blurry') &&
    $('.image-viewer').css({opacity:0,pointerEvents:'none'}) &&
    setTimeout(function(){
      $('.blurry').removeClass('blurry') &&
      $('.image-viewer').remove(); },450);
  }

  // Trace tap
  $(window).bind("touchstart",function(){

    window.tapTracker = new Date().getTime();
    window.htmlPos = $('html').scrollTop();
    window.bodyPos = $('body').scrollTop();

  });

  // Global click handler
  $(window).bind("click touchend",function(e){
    
    var isNotTouch = e.type == "touchend" && 
    (new Date().getTime() - tapTracker > window.TOUCH_SENSITIVITY ||
    (htmlPos != $('html').scrollTop() || bodyPos != $('body').scrollTop()));
    
    if(isNotTouch) return false;

    if($(e.target).is(':not(.share,.share-menu,.share-menu *)')){
      var shareMenus = $('.share-menu');

    	OnePage.setElementScale(shareMenus,0);
    	setTimeout(function(){ shareMenus.remove(); },500);
    }

    if( $(e.target).is('.work-page-holder img') ){
      setTimeout(function(){OnePage.startImageViewer.call(e.target);},50);
    }

    var target = $(e.target);

    !target.hasClass('.image-viewer') &&
    !target.parents('.image-viewer').length &&
    $('.image-viewer:not(.unborn)').length &&
    !$('html.iron').length &&
    killImageViewer();

    // Double click bug fix
    $(e.target).is('html') || $(e.target).parents('html').length &&
    setTimeout(function(){ $('html').addClass('iron')},0) &&
    setTimeout(function(){ $('html').removeClass('iron'); },600);

    e.stopPropagation();

  });

  // Jesus
  setInterval(function(){ OnePage.responsive() },1500);

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

OnePage.prototype.shareMouseOver = function(work,share){

  // Brain fart
  var OnePage = window.OnePage.prototype,
      coords  = {};

  share = $(share).parents('.mainImage');
  coords.left = share.offset().left + share.width() /2 - 153/2;
  coords.top  = share.offset().top  + share.height()/2 - 100/2 + 20;

	var shareMenus = $('.share-menu');
	OnePage.setElementScale(shareMenus,0);
	setTimeout(function(){ shareMenus.remove(); },500);

	var shareHTML = OnePage.getShareHTML(work);

	$('body')
	  .append('<div class="share-menu ani05">'+shareHTML+'</div>')
	  .find('.share-menu:last-of-type')
	  .css({top:coords.top+'px',left:coords.left+'px'})
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
  
  // Temporarily retire swipes
  return;
  
  var swipe = new Hammer.Manager( $(element)[0] );

	swipe.add(new Hammer
	              .Swipe({velocity:.001,direction: Hammer.DIRECTION_HORIZONTAL}));

	swipe.on('swipe' + direction, function(e){
	                    callback.call( $(element)[0] , e ); });

}

OnePage.prototype.startImageViewer = function(){

  if($('.image-viewer,.work-page-holder:animated,.work-page-holder.client').length || window.isPhone) return;

  var viewer = $('<div>');

  viewer.addClass('image-viewer ani05 unborn')
       // .html('<div class="viewer-arrow-left  ani05"></div>' +
      //        '<div class="viewer-arrow-right ani05"></div>')
        .find('*')
        .bind("click touchend",navigateImages);

  function navigateImages(){

    // Exit if animating
    if($('.image-viewer:animated, .image-viewer *:animated').length) return;

    // Find next one
    var current = $('.work-page-holder img[src="' +
                                $('.image-viewer img').attr('src') + '"]'),
        next    = 0,
        d       = $(this).hasClass('viewer-arrow-right') ? 1 : -1,
        index   = 0;

    $('.work-page-holder img').each(function(i,e){

      $(e).attr('src') == current.attr('src') &&
      (next = $($('.work-page-holder img')[index+d]));

      index++;

    });

    !next.length && d < 0 && (next = $('.work-page-holder img:last' ));
    !next.length && d > 0 && (next = $('.work-page-holder img:first'));

    spawnImage(next);

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
            // Jesus... The scrollbar was messing with the view's width...
            windowWidth     : $('body').width(),
            windowHeight    : window.innerHeight
        },
        css             = {},
        newImgCss       = {},
        currentImage    = viewer.find('img'),
        newImage        = image.clone().css('padding','0px'),
        r               = 0;

    function ratio(r){ return r ? imageRatio < 1 : imageRatio > 1; }

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

    newImgCss.opacity = 0;
    newImgCss.height = newImgCss.width = '100%';

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