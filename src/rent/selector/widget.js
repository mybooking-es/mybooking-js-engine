/******
 *
 * Renting Module selector Widget
 *
 */
require(['jquery', 'commonSettings', 'commonLoader', './SelectorRent'],
         function($, commonSettings, commonLoader, SelectorRent) {

  /***
   * Model
   */
  var widgetSelectorModel = {
    requestLanguage: null,
    configuration: null,
    
    /**
     * Load settings
     */
    loadSettings: function() {
      commonSettings.loadSettings(function(data){
        commonLoader.hide();
        widgetSelectorModel.configuration = data;
        widgetSelectorView.init();
      });
    }
   
  };

  /***
   * Controller
   */
  var widgetSelectorController = {

  };

  /***
   * View
   */
  var widgetSelectorView = {

    /**
     * Initialize
     */
    init: function() {
        // Setup request language (for API calls)
        widgetSelectorModel.requestLanguage = commonSettings.language(document.documentElement.lang);
        
        // Create selector
        this.selector = new SelectorRent();

        // Setup request language and settings
        this.selector.model.requestLanguage = widgetSelectorModel.requestLanguage;
        this.selector.model.configuration = widgetSelectorModel.configuration;

        // == Selectors

        // Search form
        this.selector.model.form_selector = 'form[name=widget_search_form]';
        // Search form template
        this.selector.model.form_selector_tmpl = 'widget_form_selector_tmpl';
        
        // Simple location
        this.selector.model.simple_location_id = 'widget_simple_location_id';
        this.selector.model.simple_location_selector = '#widget_simple_location_id';

        // Pickup place
        this.selector.model.pickup_place_id = 'widget_pickup_place';
        this.selector.model.pickup_place_selector = '#widget_pickup_place';
        this.selector.model.pickup_place_other_id = 'widget_pickup_place_other';
        this.selector.model.pickup_place_other_selector = '#widget_pickup_place_other';
        this.selector.model.another_pickup_place_group_selector = '#widget_another_pickup_place_group';
        this.selector.model.custom_pickup_place_selector = '#widget_another_pickup_place_group input[name=custom_pickup_place]';        
        this.selector.model.pickup_place_group_selector = '.widget_pickup_place_group',
        this.selector.model.another_pickup_place_group_close = '.widget_another_pickup_place_group_close',

        // Return place
        this.selector.model.return_place_id = 'widget_return_place';
        this.selector.model.return_place_selector = '#widget_return_place';
        this.selector.model.return_place_other_id = 'widget_return_place_other';
        this.selector.model.return_place_other_selector = '#widget_return_place_other';
        this.selector.model.another_return_place_group_selector = '#widget_another_return_place_group';  
        this.selector.model.custom_return_place_selector = '#widget_another_return_place_group input[name=custom_return_place]';             
        this.selector.model.return_place_group_selector = '.widget_return_place_group',
        this.selector.model.another_return_place_group_close = '.widget_another_return_place_group_close',
    
        // Date From
        this.selector.model.date_from_selector = '#widget_date_from';
        // Time From
        this.selector.model.time_from_id = 'widget_time_from';
        this.selector.model.time_from_selector = '#widget_time_from';
        // Date To
        this.selector.model.date_to_selector = '#widget_date_to';
        // Time To
        this.selector.model.time_to_id = 'widget_time_to';      
        this.selector.model.time_to_selector = '#widget_time_to';  
        // Duration
        this.selector.model.duration_id = 'widget_renting_duration';
        this.selector.model.duration_selector = '#widget_renting_duration';
        // Driver age
        this.selector.model.driver_age_rule_selector = '#widget_driver_age_rule';
        // Number of products
        this.selector.model.number_of_products_selector = '#widget_number_of_products';
        // Family
        this.selector.model.family_id = 'widget_family_id',
        this.selector.model.family_id_selector = '#widget_family_id',   
        this.selector.model.family_selector = '.widget_family', 
        // Rental Location Code
        this.selector.model.rental_location_code = 'widget_rental_location_code',
        this.selector.model.rental_location_code_selector = '#widget_rental_location_code',   
        this.selector.model.rental_location_selector = '.widget_rental_location', 
        // Accept age
        this.selector.model.accept_age_selector = '#widget_accept_age';
        // Promotion code
        this.selector.model.promotion_code_selector = '#widget_promotion_code';
        
        // Initialize selector
        this.selector.view.init();
        this.selector.view.startEmpty();
    }

  };

  //$(document).ready(function(){
      console.log('widget');
      commonLoader.show();
      widgetSelectorModel.loadSettings();
  //});


});
