// Phones fire a popstate on first load with an empty state object. Ignore
// and only route valid popstates to the getState function.
OnePage.prototype.setPopstateHandler = function(){

  var OnePage = this;

  window.onpopstate = function(event){

    // Check if valid popstate
    if(!event.state) return console.log('Unmapped popstate event. Ignoring.');

    // Get state
    OnePage.getState(event.state);

  }

}

// Get to a page state
OnePage.prototype.getState = function(stateObject){

  var OnePage = this;

  // Check if inital page and animate accordingly
  $('.indexContent *').length ?
  $('.indexContent')
    .animate({opacity:0,left:'-10px'},200,'swing',function(){
      route.call(OnePage);
      $(this).animate({opacity:1,left:'0px'},200,'swing');
    }) : route.call(this);

  function route(){

    // Set page title
    window.document.title = stateObject.title ?
      stateObject.title + ' | Fresh Ideas' :
      'Fresh Ideas | Advertising Interior Company';

    // Restore menu state or get default
    this.setMenuState(stateObject.menuState);

    // Route to factory
    stateObject.type == 1 && this.setPage(stateObject.alias);
    stateObject.type == 2 && this.setCategory(stateObject.alias);
    stateObject.type == 5 && this.setWork(stateObject.alias);

    // Works carousel should start with instructed content or default to
    // the work's category.
    stateObject.type == 5 && this.setCarousel(stateObject.worksCarousel);

    // Show clients
    stateObject.type == 3 && this.listClients();

    // Show client page
    stateObject.type == 4 && this.showClient(stateObject.alias);

    // Apparently necessary
    this.responsive();

  }

}

// Register a new state
OnePage.prototype.setState = function(stateObject){

  window.history.pushState(stateObject,stateObject.title,ROOT+stateObject.url);

}

// Get state from current URL
OnePage.prototype.getStateFromUrl = function(initial){

  var index = 0;
  var type,id;
  var pageAliases = [];
  var stateObject = {};
  var title = '';

  siteData.pages.forEach(function(page){ pageAliases.push(page.alias); });

  window.location.pathname.split('/').forEach(function(anchor){
    if(!anchor) return;
    type && type != 1 && ( id = anchor );
    anchor == "clients"               && ( type =  3 );
    anchor == "works"                 && ( type =  5 );
    anchor == "category"              && ( type =  2 );
    pageAliases.indexOf(anchor) != -1 && ( type =  1 ) && ( id = anchor );
    index++;
  });

  type == 3 && id && ( type = 4 );

  !type && ( type = 0 );

  stateObject.type  = type;
  stateObject.alias = id;

  function searchByAlias(p){ return p.alias == id }

  if(type == 1) title = siteData.pages     .filter(searchByAlias)[0].title;
  if(type == 2){
    var category = siteData.categories.filter(searchByAlias)[0];
    title = category.title;
    stateObject.menuState = {
      menu:    $('.menu-item:has([data-cat-id="' + category.id + '"])')
                .attr('data-id'),
      submenu: $('[data-cat-id="' + category.id + '"].menu-sub')
                .attr('data-id')
    }
  }
  if(type == 3) title = 'Clients';
  if(type == 4){
    var client = siteData.clients.filter(searchByAlias)[0];
    title = client.title;
    stateObject.alias = client.alias;
  }
  if([3,4].indexOf(type) != -1){
    stateObject.menuState = {
      menu: siteData.menu.filter(function(m){ return m.type == 3 })[0].id
    }
  }

  if(type == 1){
    var pID = siteData.pages.filter(searchByAlias)[0].id;
    var mID = siteData.menu.filter(function(m){
      return m.page_id == pID;
      })[0].id;
    stateObject.menuState = {
      menu: mID
    }
  }

  if(type == 0){
    var mID = siteData.menu.filter(function(m){ return m.type == 0; })[0].id;
    stateObject.menuState = {
      menu:    siteData.settings.DefaultMenu,
      submenu: siteData.settings.DefaultSubMenu
    }
    stateObject.type  = 2;
    stateObject.alias = 'all';
  }

  stateObject.title = title;
  this.getState(stateObject);

  initial &&
  window.history
        .replaceState(stateObject,stateObject.title,stateObject.url);

}

// Get the menu where it needs to be
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

  var subSelector = menuState.submenu ?
    '[data-id="' + menuState.submenu + '"].menu-sub' :
    '.menu-sub:nth-child(2)';

	var menu = $('[data-id="' + menuState.menu + '"].menu-item');
	menu.find('.title,' + subSelector).addClass('selected');
	menu.find('.menu-sub').css({
		'opacity' : 1,
		'top' : 0
	});

}