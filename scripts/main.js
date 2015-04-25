/*
** FreshOnePage
** Copyright (c) 2015 Kosmas Papadatos
** License: MIT
*/

window.TOUCH_SENSITIVITY = 250; // miliseconds
window.DIST_TOLERANCE    = 4;   // pixels

function OnePage(window){

  this.window = window;
  
  // The image element projected last in the image viewer
  this.currentImageViewer = null;

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
	};

	// Major brain fart
	$('.container')
	    .bind('DOMSubtreeModified',false,function(){ OnePage.responsive(); });

	// Disable selection everywhere, apparently
  window.ondragstart = function(){ return false; };

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
    
    var scrollTop = $('body').scrollTop() || $('html').scrollTop();
    
    if(scrollTop>128){
      $('.nav-container:not(.nav-ani)').addClass('nav-ani'); 
    } else $('.nav-ani').removeClass('nav-ani');
    
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
      if(e.keyCode == 39) $('.viewer-arrow-right').click();
      if(e.keyCode == 37) $('.viewer-arrow-left') .click();
    }

    if(!$(':focus').length && !$('.image-viewer').length){
      if(e.keyCode == 39) $('.right-arrow').click();
      if(e.keyCode == 37) $('.left-arrow') .click();
    }

    if(e.keyCode == 27) killImageViewer();

  });

  // Cancel scroll animation if scroll caused by user
  // NOTE: Will most likely not work with touch. Must add touch event.
  $(window).on("mousewheel",function(){$('html,body').stop();});

  function killImageViewer(){
    if($('.blurry').removeClass('blurry') &&
       $('.image-viewer').css({opacity:0,pointerEvents:'none'})){ 
         
         setTimeout(function(){
            if($('.blurry').removeClass('blurry')) $('.image-viewer').remove(); 
            },450);
            
    }
  }

  // Trace tap
  $(window).bind("touchstart",function(e){
    
    window.tapTracker = new Date().getTime();
    window.tX = e.originalEvent.touches[0].screenX;
    window.tY = e.originalEvent.touches[0].screenY;

  });
  
  // Global click handler 
  $(window).bind("click touchend",function(e){
    
    if(OnePage.isNotTap(e)) return false;
    
    // Share icons fix
    if($(e.target).is('a[href]') && e.type == "touchend"){
      
      if($(e.target).is('.share-menu a')) window.open($(e.target).attr('href'));
      else window.location.href = $(e.target).attr('href');
      return false;
      
    }

    if($(e.target).is(':not(.share,.share-menu,.share-menu *)')){
      var shareMenus = $('.share-menu');

    	OnePage.setElementScale(shareMenus,0);
    	setTimeout(function(){ shareMenus.remove(); },500);
    }

    if( $(e.target).is('.work-page-holder img') ){
      setTimeout(function(){OnePage.startImageViewer.call(e.target,e);},50);
    }

    var target = $(e.target);

    if(
      !target.hasClass('.image-viewer') &&
      !target.parents('.image-viewer').length &&
      $('.image-viewer:not(.unborn)').length &&
      !$('html.iron').length
    )
    killImageViewer();

    // Double click bug fix
    if($(e.target).is('html') || $(e.target).parents('html').length){
      setTimeout(function(){ $('html').addClass('iron'); },0);
      setTimeout(function(){ $('html').removeClass('iron'); },600);
    }

    e.stopPropagation();

  });

  // Jesus
  setInterval(function(){ OnePage.responsive(); },1500);
  
  $(window).resize(function(){ 
    
    if($('.image-viewer').length){
      OnePage.spawnImage(window.OnePage.prototype.currentImageViewer,true);
    }
    
  });

};

OnePage.prototype.setElementScale = function(selector,scale){
  $(selector).css({
    '-webkit-transform':'scale(' + scale + ')',
    '-moz-transform':'scale(' + scale + ')',
    '-o-transform':'scale(' + scale + ')',
    '-ms-transform':'scale(' + scale + ')'
  });
};

OnePage.prototype.fixSides = function(){

  // Do this manually to increase compatibility
  $('.side-bg').css('height',$('.container').height() + 'px');

};

// Glue CSS with JavaScript to increase compatibility. Must try a pure CSS
// solution some time soon though because this is ugly.
OnePage.prototype.responsive = function(){

	$('.container').css('min-height',window.innerHeight+'px');
	if( window.innerWidth <= 962 ){

		$('.nav-container').css({
			//position: 'absolute',
			//margin: '234px 0 0 0',
			//left: ( $('.container').width()/2 - $('.nav-container').width()/2 ) + 'px'
		});

	} else {

		$('.nav-container').css({
			//position: 'relative',
			//margin: '0 15% 0 10%',
			//left: '0px'
		});

	}

	$('.work').css({height: $('.work').width()*(336/441) + 'px'});
	this.fixSides();

};

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

};

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
	  OnePage.setElementScale('.share-menu:last-of-type',1);},100);

};

OnePage.prototype.onSwipe = function(element,direction,callback){
  
  // Temporarily retire swipes
  return;
  
  /*
  var swipe = new Hammer.Manager( $(element)[0] );

	swipe.add(new Hammer
	              .Swipe({velocity:0.001,direction: Hammer.DIRECTION_HORIZONTAL}));

	swipe.on('swipe' + direction, function(e){
	                    callback.call( $(element)[0] , e ); });
  */
  
};

OnePage.prototype.startImageViewer = function(event){

  if($('.image-viewer,.work-page-holder:animated,.work-page-holder.client').length || window.isPhone) return;

  var viewer = $('<div>');

  viewer.addClass('image-viewer ani05 unborn')
        .html('<div class="viewer-arrow-left  ani05"></div>' +
              '<div class="viewer-arrow-right ani05"></div>') 
        .find('*')
        .bind("click touchend",navigateImages);

  if(event){
    
    var padding = $(this).css('padding-top').split('px'),
        scrollTop = $('body').scrollTop() || $('html').scrollTop();
        
    // Scroll to clicked image if out of viewport
    if((scrollTop > $(this).offset().top) || (scrollTop + window.innerHeight < $(this).offset().top + $(this).height()))
      $('body,html').animate({scrollTop:(+$(this).offset().top-20)+'px'},1000,'swing');
    
    padding = padding.length ? parseInt(padding[0]) : 0;
    
    viewer.css({
      top:  ((event.screenY - event.offsetY - padding)/window.innerHeight)*100 + '%',
      left: ($(this).offset().left/window.innerWidth)*100 + '%',
      width: ($(this).width()/window.innerWidth)*100 + '%',
      height: ($(this).height()/window.innerHeight)*100 + '%' 
    });
    
  }

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

      if($(e).attr('src') == current.attr('src'))
        (next = $($('.work-page-holder img')[index+d]));

      index++;

    });

    if(!next.length && d < 0) next = $('.work-page-holder img:last' );
    if(!next.length && d > 0) next = $('.work-page-holder img:first');

    spawnImage(next);

  }

  // Brain super fart
  OnePage.prototype.onSwipe(viewer,'right',
                              function(){ $('.viewer-arrow-left') .click(); });
  OnePage.prototype.onSwipe(viewer,'left' ,
                              function(){ $('.viewer-arrow-right').click(); });

  function spawnImage(image,isResize){

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
        
    
    if(!isResize){ 
      
      newImgCss.opacity = 0;
      
    } else {
      
      newImage          = currentImage;
      
    }
        
    // Export in case resize is fired
    OnePage.prototype.currentImageViewer = image;

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

    if(!isResize) currentImage.animate({opacity:0},500,'swing',
                          function(){ $(this).remove(); });

    newImgCss.height = newImgCss.width = '100%';

    newImage.css(newImgCss);

    if(currentImage.length) setTimeout(function(){
      if(isResize) return; 
      viewer.append(newImage);
      newImage.animate({opacity:1},500,'swing');
    },510);

    if(!currentImage.length && !isResize){
    
      viewer.append(newImage.css('opacity',1));
    
      setTimeout(function(){ viewer.css({opacity:1}); },0);
    
    }
    
    setTimeout(function(){ viewer.removeClass('unborn'); },500);

  }
  
  // Export (mess)
  OnePage.prototype.spawnImage = spawnImage;
  
  $('body').append(viewer);

  spawnImage($(this),false);
  $('body>*:not(.image-viewer)').addClass('blurry');

};

// Determine if touch event was a tap that should equal a click
OnePage.prototype.isNotTap = function(event){
  
  var screenX = event.originalEvent.changedTouches && event.originalEvent.changedTouches[0].screenX,
      screenY = event.originalEvent.changedTouches && event.originalEvent.changedTouches[0].screenY;
  
  return event.type == "touchend" && 
    (new Date().getTime() - tapTracker > window.TOUCH_SENSITIVITY ||
    (
      (Math.abs(tX - screenX) > window.DIST_TOLERANCE) || 
      (Math.abs(tY - screenY) > window.DIST_TOLERANCE)
    )
    );
    
};