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

  // Set page title
  window.document.title = stateObject.title ?
    stateObject.title + ' | Fresh Ideas' :
    'Fresh Ideas | Advertising Interior Company';

  // Restore menu state or get default
  this.setMenuState(stateObject.menuState);

  // Route to factory
  stateObject.type == 1 && this.setPage(stateObject.alias);
  stateObject.type == 2 && this.setWork(stateObject.alias);

  // Works carousel should start with instructed content or default to
  // the work's category.
  stateObject.type == 2 && this.setCarousel(stateObject.worksCarousel);

  // Show clients
  stateObject.type == 3 && this.listClients();

  // Show client page
  stateObject.type == 4 && this.showClient();

}

// Register a new state
OnePage.prototype.setState = function(stateObject){

  window.history.pushState(stateObject,stateObject.title,stateObject.url);

}

// Get state from current URL
OnePage.prototype.getStateFromUrl = function(){

  var index = 0;
  var type,id;
  var pageAliases = [];
  var stateObject = {};
  var title = '';

  siteData.pages.forEach(function(page){ pageAliases.push(page.alias); });

  window.location.pathname.split('/').forEach(function(anchor){
    type && ( id = anchor );
    anchor == "clients"               && ( type =  3 );
    anchor == "works"                 && ( type =  2 );
    pageAliases.indexOf(anchor) != -1 && ( type =  1 ) && ( id = anchor );
    index++;
  });

  type == 3 && id && ( type = 4 );

  !type && ( type = 0 );

  stateObject.type  = type;
  stateObject.alias = id;

  function searchByAlias(p){ return p.alias == id }

  if(type == 1) title = siteData.pages  .filter(searchByAlias)[0].title;
  if(type == 2) title = siteData.works  .filter(searchByAlias)[0].title;
  if(type == 3) title = 'Clients';
  if(type == 4) title = siteData.clients.filter(searchByAlias)[0].title;

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

  this.getState(stateObject);

}