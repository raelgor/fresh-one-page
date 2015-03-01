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

  // Disable text selection on head
	document.onselectstart = function(e){
	   if($(e.target).hasClass('head') || $(e.target).parents('.head').length)
	    return false;
	}

	// Disable selection everywhere, apparently
  window.ondragstart = function(){ return false; }

  // Start listening to popstate events
  this.setPopstateHandler();

  // Start preloading images
  this.startPreloader();

  // Create menu
  this.menuFactory();

  // Get current state
  this.getStateFromUrl();

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
      function(){ OnePage.setElementScale(this,0); }
    );

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

function init(){





	$('.menu-item .menu-sub').click(function(){
		window.navSM = $(this).attr('data-id');
		$('.menu-item .menu-sub').removeClass('selected');
		$(this).addClass('selected');
		$(this).attr('data-type') == "2" && showWorks($(this).attr('data-cat-id'));
		$(this).attr('data-type') == "1" && showPage($(this).attr('data-cat-id'));
		$(this).attr('data-type') == "3" && clientsPage($(this).attr('data-cat-id'));
		!vir && window.history.pushState({navM:navM,navSM:navSM},'','?m=' +  window.navM + '&sm=' + window.navSM);
		vir = false;
	});


	console.log(settings,navData)
	temp = 0;
	navData && navData.w && (temp = navData.w);
	navData && navData.c && (temp = navData.c);
	navData && $('.menu-item[data-id="' + navData.m + '"] .title, .menu-item[data-id="' + navData.m + '"] div[data-id="' + navData.sm + '"]').click();

	navData && navData.w && (function(){

		window.w = temp;
		window.history.pushState({navM:navM,navSM:navSM,w:temp},'','?m=' +  window.navM + '&sm=' + window.navSM + '&w=' + temp);
		$('.indexContent').animate({opacity:0},200,'swing',function(){

			$(this).html('<div class="right-arrow"></div><div class="left-arrow"></div>').find('.left-arrow,.right-arrow').click(workNavArr);
			navToWork(temp);
			$(this).animate({opacity:1},200);

		});

	})();

	navData && navData.c && (function(){

		window.c = temp;
		window.history.pushState({navM:navM,navSM:navSM,c:temp},'','?m=' +  window.navM + '&sm=' + window.navSM + '&c=' + temp);
		$('.indexContent').animate({opacity:0},200,'swing',function(){

			window.NavOnClient = temp;
			$(this).html('<div class="right-arrow"></div><div class="left-arrow"></div>').find('.left-arrow,.right-arrow').click(clientNavArr);
			navToClient(temp);
			$(this).animate({opacity:1},200);

		});

	})();
	!navData || !navData.length && $('.menu-item[data-id="' + settings.DefaultMenu + '"] .title, .menu-item[data-id="' + settings.DefaultMenu + '"] div[data-id="' + settings.DefaultSubMenu + '"]').click();


	$('.container').bind('DOMSubtreeModified',false,responsive);
	fixSides();
	responsive();
	window.onresize = responsive;
}

function showWorks(catID){
		window.NavOnClient = false;
		function aniCallback(){
			var holder = $('.indexContent').html('<div class="work-holder"></div>').find('.work-holder');
			var category = workCategories.filter(function(a){ return a.id == catID || catID == "0" })[0];

			if( !category ) throw "Invalid category ID. Failed to display works.";

			category.works.forEach(function(wid){

				var work = worksData.filter(function(a){ return a.id == wid })[0];

				src = "http://fresh-ideas.eu/";

				category_title = '';
				workCategories.forEach(function(cw){

					if(["Archive","All"].indexOf(cw.title) != -1) return;
					cw.works.indexOf(work.id) != -1 && (category_title = cw.title);

				});

				try{ src += images.filter(function(i){ return i.id == work.image_id })[0].src }catch(x){}

				var element = document.createElement('div');
				$(element).attr('data-id',work.id).addClass('work').html('<div class="mainImage"></div><div class="shadow"></div>').find('.mainImage')
				.html(
					'<div class="infobar ani02"><a class="share"></a><a class="like"></a>' + work.title + '<span>' + category_title + '</span></div>' +
					'<img class="ani02" src="' + src + '" style="width:100%; height:100%;" />'
				)
				.find('img').load(function(){ $(this).parents('.work').animate({opacity:'1'},250,'swing'); })
				;

				$(element).find('.like').mouseover(function(){

					if($(this).hasClass('liked')) return;
					var coords = $(this).offset();
					$('body').append('<div class="hover-thumbs">Like</div>').find('.hover-thumbs').css({top:coords.top,left:coords.left});

				}).mouseout(function(){ $('.hover-thumbs').remove(); }).click(function(){

					$(this).addClass('liked');
					$('.hover-thumbs').remove();
					$.post('http://www.fresh-ideas.eu/cms/api.php',{
						action_like_works:1,
						wid:$(this).parents('.work').attr('data-id')
					});

				});

				$(element).find('.share').mouseover(function(){

					var tar = $('.share-menu').css({
						'-webkit-transform':'scale(0)',
						'-moz-transform':'scale(0)',
						'-ms-transform':'scale(0)',
						'-o-transform':'scale(0)'
					});
					setTimeout(function(){ tar.remove(); },500);
					var shareHTML =
					'<a class="dlfix" href="https://twitter.com/intent/tweet?text=http://www.fresh-ideas.eu/'+_prefix+'?w=' + $(this).parents('.work').attr('data-id') + '" target="_blank"></a>'+
					'<a class="dlfix" href="https://www.facebook.com/sharer/sharer.php?u=http://www.fresh-ideas.eu/' + _prefix + '?w=' + $(this).parents('.work').attr('data-id') + '" target="_blank"></a>' +
					'<a class="dlfix" href="mailto:?subject=Fresh Ideas Project&X-Mailer=Baluba&body=http://www.fresh-ideas.eu/' + _prefix + '?w=' + $(this).parents('.work').attr('data-id') + '" target="_blank"></a>' +
					'<a class="dlfix" href="http://www.pinterest.com/pin/create/bookmarklet/?url=http://www.fresh-ideas.eu/' + _prefix + '?w=' + $(this).parents('.work').attr('data-id') + '&description=Fresh Ideas Project&image_url=' + $(this).parents('.work').find('img')[0].src + '" target="_blank"></a>' +
					'<a class="dlfix" href="https://plus.google.com/share?url=http://www.fresh-ideas.eu/' + _prefix + '?w=' + $(this).parents('.work').attr('data-id') + '&hl=en-US" target="_blank"></a>' +
					'<a class="dlfix" href="http://tumblr.com/share?s=&v=3&t=Fresh%20Ideas%20Project&u=http%3A%2F%2Fwww.fresh-ideas.eu%2F' + _prefix + '%3Fw%3D' + $(this).parents('.work').attr('data-id') + '" target="_blank"></a>';
					var coords = $(this).offset();
					$('body').append('<div class="share-menu ani05">' + shareHTML + '</div>').find('.share-menu:last-of-type').css({ top: coords.top - 5, left: coords.left }).find('a');$('.share-menu').bind("mouseout click",function(e){
					    console.log(e);
					    if (($(e.relatedTarget).is('.share-menu a') || $(e.relatedTarget).is('.share-menu')) && e.type != "click") return;
					var tar = $('.share-menu').css({
						'-webkit-transform':'scale(0)',
						'-moz-transform':'scale(0)',
						'-ms-transform':'scale(0)',
						'-o-transform':'scale(0)'
					});
					setTimeout(function(){ tar.remove(); },500); });
					setTimeout(function(){ $('.share-menu:last-of-type').css({
						'-webkit-transform':'scale(1)',
						'-moz-transform':'scale(1)',
						'-ms-transform':'scale(1)',
						'-o-transform':'scale(1)'
					}); },100);

				});

				$(element).click(function(e){

					if($(e.target).is(':not(.like,.share)')){
						window.history.pushState({navM:navM,navSM:navSM,w:$(this).attr('data-id')},'','?m=' +  window.navM + '&sm=' + window.navSM + '&w=' + $(this).attr('data-id'));
						$('.indexContent').animate({opacity:0},200,'swing',function(){

							$(this).html('<div class="right-arrow"></div><div class="left-arrow"></div>').find('.left-arrow,.right-arrow').click(workNavArr);
							navToWork(wid);
							$(this).animate({opacity:1},200);

						});
					}

				});

				holder.append(element);
				$(element).css({height: $(element).width()*(336/441) + 'px'});

			});
			$(holder).animate({opacity:1},250,'swing');
		}
		$('.indexContent>*').animate({opacity:0},150,'swing');
		setTimeout(aniCallback,150);
}



function navToWork(wid){

	try{
		work = worksData.filter(function(w){ return w.id == wid })[0];
	} catch(x){
		throw 'Display 404 page.';
	}
	$('.work-page-holder').remove();
	$('.indexContent').append('<div class="work-page-holder" data-id="'+work.id+'">' + work.html + '<div class="social"><a class="like" data-id="' + work.id + '"></a><a class="share" data-id="' + work.id + '"></a></div></div>');
	$('.like').mouseover(function(){

		if($(this).hasClass('liked')) return;
		var coords = $(this).offset();
		$('body').append('<div class="hover-thumbs">Like</div>').find('.hover-thumbs').css({top:coords.top+10,left:coords.left});

	}).mouseout(function(){ $('.hover-thumbs').remove(); }).click(function(){

		$(this).addClass('liked');
		$('.hover-thumbs').remove();
		$.post('http://www.fresh-ideas.eu/cms/api.php',{
			action_like_works:1,
			wid:$(this).attr('data-id')
		});

	});
	$('.work-page-holder img').load(function(){ $(this).animate({opacity:1},200,'swing'); fixSides(); });

	$('.share').mouseover(function(){

					var tar = $('.share-menu').css({
						'-webkit-transform':'scale(0)',
						'-moz-transform':'scale(0)',
						'-ms-transform':'scale(0)',
						'-o-transform':'scale(0)'
					});
					setTimeout(function(){ tar.remove(); },500);
					var shareHTML =
					'<a href="https://twitter.com/intent/tweet?text=http://www.fresh-ideas.eu/'+_prefix+'?w=' + $(this).attr('data-id') + '" target="_blank"></a>'+
					'<a href="https://www.facebook.com/sharer/sharer.php?u=http://www.fresh-ideas.eu/'+_prefix+'?w=' + $(this).attr('data-id') + '" target="_blank"></a>'+
					'<a href="mailto:?subject=Fresh Ideas Project&X-Mailer=Baluba&body=http://www.fresh-ideas.eu/'+_prefix+'?w=' + $(this).attr('data-id') + '" target="_blank"></a>'+
					'<a href="http://www.pinterest.com/pin/create/bookmarklet/?url=http://www.fresh-ideas.eu/'+_prefix+'?w=' + $(this).attr('data-id') + '&description=Fresh Ideas Project&image_url=" target="_blank"></a>'+
					'<a href="https://plus.google.com/share?url=http://www.fresh-ideas.eu/'+_prefix+'?w=' + $(this).attr('data-id') + '&hl=en-US" target="_blank"></a>'+
					'<a href="http://tumblr.com/share?s=&v=3&t=Fresh%20Ideas%20Project&u=http%3A%2F%2Fwww.fresh-ideas.eu%2F'+_prefix+'%3Fw%3D' + $(this).attr('data-id') + '" target="_blank"></a>';
					var coords = $(this).offset();
					$('body').append('<div class="share-menu ani05">'+shareHTML+'</div>').find('.share-menu:last-of-type').css({top:coords.top,left:coords.left}).find('a').bind("mouseout click",function(e){
					if($(e.toElement).is('.share-menu a') && e.type != "click") return;
					var tar = $('.share-menu').css({
						'-webkit-transform':'scale(0)',
						'-moz-transform':'scale(0)',
						'-ms-transform':'scale(0)',
						'-o-transform':'scale(0)'
					});
					setTimeout(function(){ tar.remove(); },500); });
					setTimeout(function(){ $('.share-menu:last-of-type').css({
						'-webkit-transform':'scale(1)',
						'-moz-transform':'scale(1)',
						'-ms-transform':'scale(1)',
						'-o-transform':'scale(1)'
					}); },100);

					$('.share-menu:last-of-type').css({
						margin: '-100px -60px'
					});

				});

}

function workNavArr(){

	var arrow = $(this).hasClass('left-arrow') ? 'left':'right' ;
	$('.work-page-holder').animate({left:'-20px',opacity:0},'120','swing',function(){
		wid = $('.work-page-holder').attr('data-id');
		tar = '';
		flag = false;
		var cflag = $('.menu-sub[data-id="13"][data-cat-id="1"][data-type="2"]').hasClass('selected');
		if(!window.NavOnClient){
			if(arrow == 'right'){
				workCategories.forEach(function(c){
					if(cflag && ["All","Archive"].indexOf(c.title)==-1) return;
					if(["All","Archive"].indexOf(c.title)==-1 || cflag){
						if(c.works.indexOf(wid) != -1){
							c.works[c.works.indexOf(wid)+1] ? (tar = c.works[c.works.indexOf(wid)+1]):(tar=c.works[0]) ;
						}
					}
				});
			} else {
				workCategories.forEach(function(c){
					if(cflag && ["All","Archive"].indexOf(c.title)==-1) return;
					if(["All","Archive"].indexOf(c.title)==-1 || cflag){
						if(c.works.indexOf(wid) != -1){
							c.works[c.works.indexOf(wid)-1] ? (tar=c.works[c.works.indexOf(wid)-1]):(tar=c.works[c.works.length-1]) ;
						}
					}
				});
			}
		} else {

			if(arrow == 'right'){
				first = 0;
				worksData.forEach(function(c){
					c.client_id == NavOnClient && !first && (first = c.id);
					flag && c.client_id == NavOnClient && (tar = c.id) && (flag = 0);
					c.id == wid && (flag = true);
				});
				flag && (tar = first);
			} else {
				index = 0;
				last = 0;
				worksData.forEach(function(c){
					c.id == wid && index>=1 && (tar = last) && (flag = true);
					c.client_id == NavOnClient && (last = c.id);
					index++;
				});
				!flag && (tar = last);
			}

		}
		window.history.pushState({navM:navM,navSM:navSM,w:tar},'','?m=' +  window.navM + '&sm=' + window.navSM + '&w=' + tar);
		navToWork(tar);
		$('.work-page-holder').animate({left:'0px',opacity:1},150,'swing');
		(($('body').scrollTop() !=0) || ($('html').scrollTop() !=0)) && $('body,html').animate({scrollTop:0+'px'},1000,'swing');
	})

}

function clientsPage(cid){

	$('.indexContent').animate({opacity:0},200,'swing',function(){

		var p = clients.filter(function(a){ return a.id == cid })[0];

		$('.indexContent').html('<h1>Clients</h1><div class="c-pool"></div>');

		clients.forEach(function(c){

			var el = document.createElement('img');
			var img = '';
			try{ img = images.filter(function(r){ return r.id == c.thumbnail_baw_id })[0].src } catch (x) {}

			$(el).addClass('listed-client ani02 hidden').attr('src','http://www.fresh-ideas.eu/'+img).attr('data-id',c.id);
			$(el).click(function(){
				window.history.pushState({navM:navM,navSM:navSM,c:c.id},'','?m=' +  window.navM + '&sm=' + window.navSM + '&c=' + c.id);
				$('.indexContent').animate({opacity:0},200,'swing',function(){

					$(this).html('<div class="right-arrow"></div><div class="left-arrow"></div>').find('.left-arrow,.right-arrow').click(clientNavArr);

					window.NavOnClient = c.id;
					navToClient(c.id);
					$(this).animate({opacity:1},200);

				});
			});

			$('.c-pool').append(el);

		});


		$('img.listed-client').load(function(){ $(this).removeClass('hidden'); fixSides(); });

		$('.indexContent').animate({opacity:1},200,'swing');

	});

}

function navToClient(wid){

	try{
		work = clients.filter(function(w){ return w.id == wid })[0];
	} catch(x){
		throw 'Display 404 page.';
	}
	$('.work-page-holder').remove();
	$('.indexContent').append('<div class="work-page-holder" data-id="'+work.id+'">' + work.html + '<div class="works-pool cl"></div></div>');

	worksData.filter(function(a){ return a.client_id == wid  }).sort(function(a,b){ return b.index - a.index }).forEach(function(a){

		var category = workCategories.filter(function(n){ return n.works.indexOf(a.id) != -1 && ["All","Archive"].indexOf(n.title)==-1; })[0];

		holder = $('.works-pool');
		category && category.works.forEach(function(wid){
			if(wid != a.id) return;
			var work = worksData.filter(function(a){ return a.id == wid })[0];

			src = "http://fresh-ideas.eu/";

			category_title = '';
			workCategories.forEach(function(cw){

				if(["Archive","All"].indexOf(cw.title) != -1) return;
				cw.works.indexOf(work.id) != -1 && (category_title = cw.title);

			});

			try{ src += images.filter(function(i){ return i.id == work.image_id })[0].src }catch(x){}

			var element = document.createElement('div');
			$(element).attr('data-id',work.id).addClass('work').html('<div class="mainImage"></div><div class="shadow"></div>').find('.mainImage')
			.html(
				'<div class="infobar ani02"><a class="share"></a><a class="like"></a>' + work.title + '<span>' + category_title + '</span></div>' +
				'<img class="ani02" src="' + src + '" style="width:100%; height:100%;" />'
			)
			.find('img').load(function(){ $(this).parents('.work').animate({opacity:'1'},250,'swing'); })
			;

			$(element).find('.like').mouseover(function(){

				if($(this).hasClass('liked')) return;
				var coords = $(this).offset();
				$('body').append('<div class="hover-thumbs">Like</div>').find('.hover-thumbs').css({top:coords.top,left:coords.left});

			}).mouseout(function(){ $('.hover-thumbs').remove(); }).click(function(){

				$(this).addClass('liked');
				$('.hover-thumbs').remove();
				$.post('http://www.fresh-ideas.eu/cms/api.php',{
					action_like_works:1,
					wid:$(this).parents('.work').attr('data-id')
				});

			});

			$(element).find('.share').mouseover(function(){
					var tar = $('.share-menu').css({
						'-webkit-transform':'scale(0)',
						'-moz-transform':'scale(0)',
						'-ms-transform':'scale(0)',
						'-o-transform':'scale(0)'
					});
					setTimeout(function(){ tar.remove(); },500);
					var shareHTML =
					'<a href="https://twitter.com/intent/tweet?text=http://www.fresh-ideas.eu/'+_prefix+'?w=' + $(this).parents('.work').attr('data-id') + '" target="_blank"></a>'+
					'<a href="https://www.facebook.com/sharer/sharer.php?u=http://www.fresh-ideas.eu/'+_prefix+'?w=' + $(this).parents('.work').attr('data-id') + '" target="_blank"></a>'+
					'<a href="mailto:?subject=Fresh Ideas Project&X-Mailer=Baluba&body=http://www.fresh-ideas.eu/'+_prefix+'?w=' + $(this).parents('.work').attr('data-id') + '" target="_blank"></a>'+
					'<a href="http://www.pinterest.com/pin/create/bookmarklet/?url=http://www.fresh-ideas.eu/'+_prefix+'?w=' + $(this).parents('.work').attr('data-id') + '&description=Fresh Ideas Project&image_url='+$(this).parents('.work').find('img')[0].src+'" target="_blank"></a>'+
					'<a href="https://plus.google.com/share?url=http://www.fresh-ideas.eu/'+_prefix+'?w=' + $(this).parents('.work').attr('data-id') + '&hl=en-US" target="_blank"></a>'+
					'<a href="http://tumblr.com/share?s=&v=3&t=Fresh%20Ideas%20Project&u=http%3A%2F%2Fwww.fresh-ideas.eu%2F'+_prefix+'%3Fw%3D' + $(this).parents('.work').attr('data-id') + '" target="_blank"></a>';
					var coords = $(this).offset();
					$('body').append('<div class="share-menu ani05">'+shareHTML+'</div>').find('.share-menu:last-of-type').css({top:coords.top,left:coords.left}).find('a').bind("mouseout click",function(e){
					if($(e.toElement).is('.share-menu a') && e.type != "click") return;
					var tar = $('.share-menu').css({
						'-webkit-transform':'scale(0)',
						'-moz-transform':'scale(0)',
						'-ms-transform':'scale(0)',
						'-o-transform':'scale(0)'
					});
					setTimeout(function(){ tar.remove(); },500); });
					setTimeout(function(){ $('.share-menu:last-of-type').css({
						'-webkit-transform':'scale(1)',
						'-moz-transform':'scale(1)',
						'-ms-transform':'scale(1)',
						'-o-transform':'scale(1)'
					}); },100);

				});

			$(element).click(function(e){

				if($(e.target).is(':not(.like,.share)')){
					window.history.pushState({navM:navM,navSM:navSM,w:$(this).attr('data-id')},'','?m=' +  window.navM + '&sm=' + window.navSM + '&w=' + $(this).attr('data-id'));
					$('.indexContent').animate({opacity:0},200,'swing',function(){

						$(this).html('<div class="right-arrow"></div><div class="left-arrow"></div>').find('.left-arrow,.right-arrow').click(workNavArr);
						navToWork(wid);
						$(this).animate({opacity:1},200);

					});
				}

			});

			holder.append(element);
			$(element).css({height: $(element).width()*(336/441) + 'px'});

		});




	});

	$('.work-page-holder img').load(function(){ $(this).animate({opacity:1},200,'swing'); fixSides(); });
}

function clientNavArr(){

	var arrow = $(this).hasClass('left-arrow') ? 'left':'right' ;
	$('.work-page-holder').animate({left:'-20px',opacity:0},'120','swing',function(){
		wid = $('.work-page-holder').attr('data-id');
		tar = '';
		flag = false;
		if(arrow == 'right'){
			clients.forEach(function(c){
				flag && (tar = c.id) && (flag = 0);
				c.id == wid && (flag = true);
			});
			flag && (tar = clients[0].id);
		} else {
			index = 0;
			clients.forEach(function(c){
				c.id == wid && index>=1 && (tar = clients[index-1].id) && (flag = true);
				index++;
			});
			!flag && (tar = clients[clients.length-1].id);
		}
		window.history.pushState({navM:navM,navSM:navSM,c:tar},'','?m=' +  window.navM + '&sm=' + window.navSM + '&c=' + tar);
		navToClient(tar);
		$('.work-page-holder').animate({left:'0px',opacity:1},150,'swing');
	})

}