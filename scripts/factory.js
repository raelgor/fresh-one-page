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
	    url:   'clients'
	  } );

	  if(mData.type == 1){
	    var page = siteData.pages.filter(function(p){
	        return p.id == mData.page_id; })[0];
	    stateObject = {
	      title: page.title,
	      url:   page.alias
	    }
	  }

	  mData.type == 0 && ( stateObject = {
	    title: '',
	    url:   ''
	  });

	  // Set state
	  OnePage.setState(stateObject);

	  // Get state
	  OnePage.getStateFromUrl();

	});

  // Handle clicks of sub menus

}

OnePage.prototype.setMenuState = function(menuState){

  var menuState = menuState || {
    menu:    siteData.settings.DefaultMenu,
    submenu: siteData.settings.DefaultSubMenu
  }

  $('.menu-item .title').removeClass('selected');
	$('.menu-item .menu-sub').css({
		'opacity' : 0,
		'top' : "-5px"
	}).removeClass('selected');

	var menu = $('[data-id="' + menuState.menu + '"].menu-item');
	menu.find('.title,.menu-sub:nth-child(2)').addClass('selected');
	menu.find('.menu-sub').css({
		'opacity' : 1,
		'top' : 0
	});

}

OnePage.prototype.setPage = function(){

}

OnePage.prototype.setWork = function(){

}

OnePage.prototype.setCarousel = function(){

}

OnePage.prototype.listClients = function(){

}