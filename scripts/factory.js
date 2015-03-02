// Create the main navigation menu based on siteData.menu
OnePage.prototype.menuFactory = function(){

  var OnePage = this;

  // Create elements
	siteData.menu.forEach(function(button){

		var element = document.createElement('div');
		$(element).html('<div class="title ani02">' + button.title + '</div>')
		  .addClass('menu-item')
		  .attr({
		    'data-id': button.id,
		    'data-cat-id': button.category_id,
		    'data-type': button.type
		  });

		button.isContactButton && $(element).addClass('contactButton');

		button.submenu &&
		button.submenu.forEach && button.submenu.forEach(function(subItem){

			var sub = document.createElement('div');
			$(sub).html(subItem.title).addClass("menu-sub ani02").attr({
			  'data-id': subItem.id,
			  'data-cat-id': subItem.category_id,
			  'data-type': subItem.type
			});

			$(element).append(sub);

		});

		$('.nav-container').append(element);

	});

	// Handle clicks with navigation
	$('.menu-item .title').click(function(e){

	  // Create state object
	  var menu    = $(this).parents('.menu-item');
		var menuID  = menu.attr('data-id');
	  var mData   = siteData.menu.filter(function(m){ return m.id == menuID })[0];
	  var stateObject = {};

	  mData.type == 3 && ( stateObject = {
	    title: 'Clients',
	    url:   'clients',
	    type:  mData.type
	  } );

	  if(mData.type == 1){
	    var page = siteData.pages.filter(function(p){
	        return p.id == mData.page_id; })[0];
	    stateObject = {
	      title: page.title,
	      url:   page.alias,
	      type:  mData.type,
	      alias: page.alias
	    }
	  }

    stateObject.menuState = { menu: mData.id }

    if( mData.type == 0 ){

      var category = siteData.categories.filter(function(c){
          return c.id == mData.submenu[0].category_id; })[0];

      stateObject = {
  	    title: 'Fresh Ideas | Advertising Interior Company',
  	    url:   'category/' + category.alias,
  	    type:  2,
  	    alias: category.alias,
  	    menuState: {
  	      menu:     mData.id,
  	      submenu:  mData.submenu[0].id
  	    }
  	  }

    }

	  // Set state
	  OnePage.setState(stateObject);

	  // Get state
	  OnePage.getStateFromUrl();

	});

  // Handle clicks of sub menus
  $('.menu-item .menu-sub').click(function(){

    var category_id = $(this).attr('data-cat-id');
		var category    = siteData.categories.filter(function(c){
        return c.id == category_id; })[0];
    var stateObject = {
	    title: category.title + ' | Advertising Interior Company',
	    url:   'category/' + category.alias,
	    type:  2,
	    alias: category.alias,
	    menuState: {
	      menu:     $(this).parents('.menu-item').attr('data-id'),
	      submenu:  $(this).attr('data-id')
	    }
	  }

	  // Set state
	  OnePage.setState(stateObject);

	  // Get state
	  OnePage.getStateFromUrl();

	});


}

OnePage.prototype.setPage = function(alias){

  var OnePage = this;

  function showPage(){

		var page = siteData.pages.filter(function(p){ return p.alias == alias })[0];

		$('.indexContent').html('<div class="site-page">' + page.html + '</div>');

		// Images always fade in
		$('.site-page img').load(function(){
		  $(this).animate({opacity:1},200,'swing'); OnePage.fixSides(); });

    // If contact page make the send button function
		$('.send-button').click(function(){

      var errorDiv = $('.error-div');

			$('[name="name"]').val() &&
			$('[name="email"]').val() &&
			$('textarea').val() ?
			errorDiv.html(settings.ContactFailureMessage) :
			$.post(
		    '/cms/api.php',{
  				action:'email',
  				name: $('[name="name"]').val(),
  				email: $('[name="email"]').val(),
  				message: $('textarea').val()
			}).always(function(){

				errorDiv.html(siteData.settings.ContactSuccessMessage)
				        .css('color','green');

				$('.yellow-input,.send-button').css({
					'opacity':.3,
					'pointer-events':'none'
				});

			});

		});

		$('.indexContent').animate({opacity:1},200,'swing');

  }

  $('.indexContent').animate({opacity:0},200,'swing',showPage);

}

OnePage.prototype.setWork = function(alias){

  var OnePage = this;

  // Brain fart
  this.setCarousel(this.carousel,alias);

  try{
		var work = siteData.works.filter(function(w){ return w.alias == alias })[0];
	} catch(x){
		throw 'Display 404 page.';
	}

	$('.work-page-holder').remove();
	$('.indexContent').append('<div class="work-page-holder" data-id="' +
	                          work.id+'">' + work.html +
	                          '<div class="social"><a class="like" data-id="' +
	                          work.id + '"></a><a class="share" data-id="' +
	                          work.id + '"></a></div></div>');

	$('.like').mouseover(function(){

		if($(this).hasClass('liked')) return;
		var coords = $(this).offset();
		$('body').append('<div class="hover-thumbs">Like</div>')
		         .find('.hover-thumbs')
		         .css({top:coords.top+10,left:coords.left});

	}).mouseout(function(){ $('.hover-thumbs').remove(); }).click(function(){

		$(this).addClass('liked');
		$('.hover-thumbs').remove();
		$.post('/cms/api.php',{
			action_like_works:1,
			wid:$(this).attr('data-id')
		});

	});

	$('.work-page-holder img').load(function(){
	      $(this).animate({opacity:1},200,'swing'); OnePage.fixSides(); });

	$('.share').bind("mouseover click",function(){

					var shareMenu = $('.share-menu');

					// Will not spawn one if another is already closing
					if(shareMenu.length) return;

					OnePage.setElementScale(shareMenu,0);
					setTimeout(function(){ shareMenu.remove(); },500);

					var shareHTML = OnePage.getShareHTML(work);
					var coords = $(this).offset();

					$('body').append('<div class="share-menu ani05">'+shareHTML+'</div>')
					         .find('.share-menu:last-of-type')
					         .css({top:coords.top,left:coords.left})
					         .find('a')
					         .bind("mouseout click",function(e){

					            if($(e.toElement).is('.share-menu a') &&
					               e.type != "click") return;

					            var shareMenu = $('.share-menu');
				            	OnePage.setElementScale(shareMenu,0);
				            	setTimeout(function(){ shareMenu.remove(); },500);

					         });

					setTimeout(function(){
					  OnePage.setElementScale('.share-menu:last-of-type',1); },100);

					$('.share-menu:last-of-type').css({
						margin: '-100px -60px'
					});

	});

}

OnePage.prototype.setCarousel = function(ids,workAlias){

  var OnePage = this,
      work = siteData.works.filter(function(w){
              return w.alias == workAlias; })[0],
      index,next,prev;

  // Always
  $('.indexContent').html('');

  if(!ids) ids = siteData.categories
                         .filter(function(c){ return c.alias == "all"; })[0]
                         .works;

  index = ids.indexOf(work.id);

  next = index + 1 == ids.length ? 0              : index + 1;
  prev = index - 1 < 0           ? ids.length - 1 : index - 1;

  function getWorkHtml(id){
    return siteData.works.filter(function(w){ return w.id == id; })[0].html;
  }

  prevCacher = $( getWorkHtml( ids[prev] ) );
  nextCacher = $( getWorkHtml( ids[next] ) );

  ids.length > 1 && this.spawnArrows(function(e){

    var id       = $('.work-page-holder').attr('data-id'),
        index    = ids.indexOf(id),
        arrow    = $(this),
        di       = 30,
        time     = 300,
        d        = arrow.is('.right-arrow') ? '-' : '',
        r        = arrow.is('.right-arrow') ? ''  : '-';

    arrow.is('.right-arrow') && ++index > ( ids.length - 1 ) && ( index = 0 );
    arrow.is('.left-arrow')  && --index < 0     && ( index = ids.length - 1 );

    $('body,html').animate({scrollTop:'0'},800,'swing');
    $('.work-page-holder')
        .animate({left:d+di+'px',opacity:0},time,'swing',function(){

            var work = siteData.works.filter(function(w){
              return w.id == ids[index]; })[0];

            OnePage.setWork(work.alias);
            stateObject = {
              menuState: {
                menu:    $('.menu-item:has(.selected)').attr('data-id'),
                submenu: $('.menu-sub.selected').attr('data-id')
              },
              alias: work.alias,
              title: work.title,
              url:   'works/' + work.alias,
              type:  5
            }

            OnePage.setState(stateObject);

            $('.work-page-holder')
                .css({left:r+di+'px',opacity:0})
                .delay(10)
                .animate({left:'0px',opacity:1},time,'swing'); });

  });

}

OnePage.prototype.setCategory = function(alias){

  var OnePage = this;
  var category = siteData.categories.filter(function(c){
      return c.alias == alias; })[0];

	var holder = $('.indexContent').html('<div class="work-holder"></div>')
	                               .find('.work-holder');

	category.works.forEach(function(wid){

		var work = siteData.works.filter(function(w){
		    return w.id == wid })[0];

		var category_title = '';
		var src = 'http://fresh-ideas.eu/';

		siteData.categories.forEach(function(cw){
			if(["Archive","All"].indexOf(cw.title) != -1) return;
			cw.works.indexOf(work.id) != -1 && (category_title = cw.title);	});

		try{
		  src += siteData
		          .images
		          .filter(function(i){ return i.id == work.image_id })[0].src
		}catch(x){}

		var element = $('<div>');

		element.attr('data-id',work.id)
		       .addClass('work')
		       .html('<div class="mainImage"></div><div class="shadow"></div>')
		       .find('.mainImage')
				   .html(
					    '<div class="infobar ani02"><a class="share"></a>' +
					    '<a class="like"></a>' + work.title + '<span>' +
					    category_title + '</span></div>' +
					    '<img class="ani02" src="' + src +
					    '" style="width:100%; height:100%;" />')
				   .find('img')
				   .load(function(){
				     $(this).parents('.work').animate({opacity:'1'},250,'swing'); });

	  element.find('.like')
	         .mouseover(function(){
					    if($(this).hasClass('liked')) return;
					    var coords = $(this).offset();
					    $('body').append('<div class="hover-thumbs">Like</div>')
					         .find('.hover-thumbs')
					         .css({top:coords.top,left:coords.left});})
		       .mouseout(function(){ $('.hover-thumbs').remove(); })
		       .click(function(){
					    $(this).addClass('liked');
					    $('.hover-thumbs').remove();
					    $.post('http://www.fresh-ideas.eu/cms/api.php',{
						    action_like_works:1,
						    wid:$(this).parents('.work').attr('data-id')});	});

	  element.find('.share').mouseover(function(){
	    OnePage.shareMouseOver(work,$(this).offset()); });

		element.click(function(e){

			if($(e.target).is(':not(.like,.share)')){

		    $('.indexContent').animate({opacity:0},200,'swing',function(){

          var carousel = [];
          $('[data-id].work').each(function(i,e){
              carousel.push( $(e).attr('data-id') ); });

          OnePage.setState({
            url: 'works/' + work.alias,
            title: work.title,
            type: 5,
            alias: work.alias,
            worksCarousel: carousel
          });

          OnePage.getStateFromUrl();

				});

			}

		});

		holder.append(element);
		element.css({height: element.width()*(336/441) + 'px'});

	});

}

OnePage.prototype.listClients = function(){

  var OnePage = this;

  function showPage(){

    var clients = siteData.clients;
		$('.indexContent').html('<h1>Clients</h1><div class="c-pool"></div>');

		clients.forEach(function(c){

			var el = $('<img>');
			var img = '';

			// Apparently a client with no thumbnail would make it crash
			try{
			  img = siteData.images.filter(function(r){
			    return r.id == c.thumbnail_baw_id })[0].src } catch (x) {}

			el.addClass('listed-client ani02 hidden')
			  .attr({
			    'src': 'http://www.fresh-ideas.eu/'+img,
			    'data-id': c.id})
			  .click(function(){

			    OnePage.setState({
			      type: 4,
			      url: 'clients/' + c.alias,
			      alias: c.alias,
			      menuState: {
			        menu: siteData.menu.filter(function(m){
			         return m.type == 3; })[0].id
			      }
			    });

			    OnePage.getStateFromUrl();

			});

			$('.c-pool').append(el);

		});

    // Fade images in
		$('img.listed-client').load(function(){
		  $(this).removeClass('hidden'); OnePage.fixSides(); });

		$('.indexContent').animate({opacity:1},200,'swing');

	}

  $('.indexContent').animate({opacity:0},200,'swing',showPage);

}

OnePage.prototype.showClient = function(alias){

  var OnePage = this;

  // Must add a 404 page at some point
  try{
		client = siteData.clients.filter(function(c){ return c.alias == alias })[0];
	} catch(x){
		throw 'Display 404 page.';
	}

	$('.work-page-holder').remove();
	$('.indexContent').html(
	  '<div class="work-page-holder" data-id="' + client.id + '">' +
	  ( client.html || '' ) + '<div class="works-pool cl"></div></div>');

	siteData.works
	        .filter(function(a){ return a.client_id == client.id  })
	        .sort(function(a,b){ return b.index - a.index })
	        .forEach(listWork);

	function listWork(work){

    function searchByID(c){
        return c.works.indexOf(work.id) != -1 &&
               ["All","Archive"].indexOf(c.title) == -1; }

  	var category = siteData.categories.filter(searchByID)[0];
    var images   = siteData.images;
  	var holder   = $('.works-pool');
		var src      = '/';

  	if(!category) return;

		try{
		  src += images.filter(function(i){ return i.id == work.image_id })[0].src;
		}catch(x){}

		var element = $('<div>');
		element
		  .attr('data-id',work.id)
		  .addClass('work')
		  .html('<div class="mainImage"></div><div class="shadow"></div>')
		  .find('.mainImage')
			.html(
				'<div class="infobar ani02"><a class="share"></a><a class="like"></a>' +
				work.title + '<span>' + category.title + '</span></div>' +
				'<img class="ani02" src="' + src +
				'" style="width:100%; height:100%;" />')
			.find('img')
			.load(function(){
			  $(this).parents('.work').animate({opacity:'1'},250,'swing'); });

		element.find('.like').mouseover(function(){

				if($(this).hasClass('liked')) return;
				var coords = $(this).offset();
				$('body')
				  .append('<div class="hover-thumbs">Like</div>')
				  .find('.hover-thumbs')
				  .css({top:coords.top,left:coords.left});

		}).mouseout(function(){ $('.hover-thumbs').remove(); }).click(function(){

				$(this).addClass('liked');
				$('.hover-thumbs').remove();
				$.post('http://www.fresh-ideas.eu/cms/api.php',{
					action_like_works:1,
					wid:$(this).parents('.work').attr('data-id')
				});

	  });

		element.find('.share').mouseover(function(){
	    OnePage.shareMouseOver(work,$(this).offset()); });

		element.click(function(e){

		  if($(e.target).is(':not(.like,.share)')){

		    $('.indexContent').animate({opacity:0},200,'swing',function(){

          var carousel = [];
          $('[data-id].work').each(function(i,e){
              carousel.push( $(e).attr('data-id') ); });

          OnePage.setState({
            url: 'works/' + work.alias,
            title: work.title,
            type: 5,
            worksCarousel: carousel,
            alias: work.alias
          });

          OnePage.getStateFromUrl();

				});

			}

		});

		holder.append(element);
		element.css({height: element.width()*(336/441) + 'px'});

	}

	$('.work-page-holder img').load(function(){
	  $(this).animate({opacity:1},200,'swing'); OnePage.fixSides(); });

}

OnePage.prototype.spawnArrows = function(clickCallback){

  $('.indexContent')
        .append('<div class="right-arrow"></div><div class="left-arrow"></div>')
        .find('.left-arrow,.right-arrow')
        .click(clickCallback);

}