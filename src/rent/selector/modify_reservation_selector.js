/******
 *
 * Renting Module modify reservation selector form
 *
 */
define('modify_reservation_selector', ['jquery', 'commonSettings', 'commonLoader', './SelectorRent'],
         function($, commonSettings, commonLoader, SelectorRent) {

  /***
   * Model
   */
  var selectorModel = {
    requestLanguage: null,
    configuration: null   
  };

  /***
   * Controller
   */
  var selectorController = {

  };

  /***
   * View
   */
  var selectorView = {

    selectorRent: null,

    /**
     * Initialize
     */
    init: function() {

        // Create selector    
        this.selectorRent = new SelectorRent();
        // Setup request language and configuration
        this.selectorRent.model.requestLanguage = selectorModel.requestLanguage;
        this.selectorRent.model.configuration = selectorModel.configuration;

        // Initialize selector
        this.selectorRent.view.init();

    },

    startFromShoppingCart(shopping_cart) {
      if (this.selectorRent != null) {
        this.selectorRent.view.startFromShoppingCart(shopping_cart);
      } 
    }

  };

  var selector = { model: selectorModel,
                   controller: selectorController,
                   view: selectorView};

  return selector;

});
