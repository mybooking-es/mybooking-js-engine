/******
 *
 * Renting Module modify reservation selector form
 *
 */
define('modify_reservation_selector', ['jquery', 'commonSettings', 'commonLoader', './SelectorTransfer'],
         function($, commonSettings, commonLoader, SelectorTransfer) {

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
  var selectorController = {};

  /***
   * View
   */
  var selectorView = {

    SelectorTransfer: null,

    /**
     * Initialize
     */
    init: function() {

        // Create selector    
        this.SelectorTransfer = new SelectorTransfer();
        // Setup request language and configuration
        this.SelectorTransfer.model.requestLanguage = selectorModel.requestLanguage;
        this.SelectorTransfer.model.configuration = selectorModel.configuration;

    },

    startFromShoppingCart(shopping_cart) {
      if (this.SelectorTransfer != null) {
        this.SelectorTransfer.view.startFromShoppingCart(shopping_cart);
      } 
    }

  };

  var selector = { model: selectorModel,
                   controller: selectorController,
                   view: selectorView};

  return selector;

});
