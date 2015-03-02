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
  $(window).scroll(function(){

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

  $(window).click(function(){ var shareMenus = $('.share-menu');
  	OnePage.setElementScale(shareMenus,0);
  	setTimeout(function(){ shareMenus.remove(); },500); });

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