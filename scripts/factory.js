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
	    title: 'Fresh Ideas | Advertising Interior Company',
	    url:   './'
	  });

	  // Set state
	  OnePage.setState(stateObject);

	  // Get state
	  OnePage.getStateFromUrl();

	});

  // Handle clicks of sub menus
  // ...

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
		    'http://www.fresh-ideas.eu/cms/api.php',{
  				action:'email',
  				name: $('[name="name"]').val(),
  				email: $('[name="email"]').val(),
  				message: $('textarea').val()
			}).always(function(){

				errorDiv.html(settings.ContactSuccessMessage).css('color','green');
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

OnePage.prototype.setWork = function(){

}

OnePage.prototype.setCarousel = function(){

}

OnePage.prototype.listClients = function(){

}