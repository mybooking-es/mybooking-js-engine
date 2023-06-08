define('customSelector', ['jquery', 'commonSettings', 'commonLoader', 'YSDEventTarget', './SelectorRent'],
         function($, commonSettings, commonLoader, YSDEventTarget, SelectorRent) {

  /***
   * Model
   */
  var customSelectorModel = {

    requestLanguage: null,
    configuration: null,
  
    events: new YSDEventTarget(),
      
    addListener: function(type, listener) { /* addListener */
       this.events.addEventListener(type, listener);  
    },
      
    removeListener: function(type, listener) { /* removeListener */
       this.events.removeEventListener(type, listener);     
    },

    removeListeners: function(type) { /* remove listeners*/
       this.events.removeEventListeners(type);
    },

    /**
     * Load settings
     */
    loadSettings: function( id ) {
      commonSettings.loadSettings(function(data){
        commonLoader.hide();
        customSelectorModel.configuration = data;
        customSelectorView.showForm( id );
      });
    }
   
  };

  /***
   * Controller
   */
  var customSelectorController = {

    bookNowButtonClick: function( id ) {
      commonLoader.show();
      customSelectorModel.loadSettings( id );
    }

  };

  /***
   * View
   */
  var customSelectorView = {

    selector: null,

    /**
     * Initialize
     */
    init: function() {
      $('.mybooking-custom-selector').on('click', function(){
        customSelectorController.bookNowButtonClick( $(this).attr('data-id' ));
      });
    },

    showForm: function( id ) {

        // Setup request language (for API calls)
        customSelectorModel.requestLanguage = commonSettings.language(document.documentElement.lang);

        this.selector = new SelectorRent();

        // Configure selector
        this.selector.model.requestLanguage = customSelectorModel.requestLanguage;
        this.selector.model.configuration = customSelectorModel.configuration;

        // == Selectors

        // Search form
        this.selector.model.form_selector = 'form[name=custom_search_form_'+id+']';
        // Search form template
        this.selector.model.form_selector_tmpl = 'custom_form_selector_tmpl';
        
        // Pickup place
        this.selector.model.pickup_place_id = 'custom_pickup_place';
        this.selector.model.pickup_place_selector = '#custom_pickup_place';
        this.selector.model.pickup_place_other_id = 'custom_pickup_place_other';
        this.selector.model.pickup_place_other_selector = '#custom_pickup_place_other';
        this.selector.model.another_pickup_place_group_selector = '#custom_another_pickup_place_group';
        this.selector.model.custom_pickup_place_selector = 'input[name=custom_custom_pickup_place]';        
        this.selector.model.pickup_place_group_selector = '.custom_pickup_place_group',
        this.selector.model.another_pickup_place_group_close = '.custom_another_pickup_place_group_close',
        
        // Return place
        this.selector.model.return_place_id = 'custom_return_place';
        this.selector.model.return_place_selector = '#custom_return_place';
        this.selector.model.return_place_other_id = 'custom_return_place_other';
        this.selector.model.return_place_other_selector = '#custom_return_place_other';
        this.selector.model.another_return_place_group_selector = '#custom_another_return_place_group';  
        this.selector.model.custom_return_place_selector = 'input[name=custom_custom_return_place]';             
        this.selector.model.return_place_group_selector = '.custom_return_place_group',
        this.selector.model.another_return_place_group_close = '.custom_another_return_place_group_close',
 
        // Date From
        this.selector.model.date_from_selector = '#custom_date_from';
        // Time From
        this.selector.model.time_from_id = 'custom_time_from';
        this.selector.model.time_from_selector = '#custom_time_from';
        // Date To
        this.selector.model.date_to_selector = '#custom_date_to';
        // Time To
        this.selector.model.time_to_id = 'custom_time_to';      
        this.selector.model.time_to_selector = '#custom_time_to';  

        // Number of products
        this.selector.model.number_of_products_selector = '#custom_number_of_products';
        // Family
        this.selector.model.family_id = 'custom_family_id',
        this.selector.model.family_id_selector = '#custom_family_id',   
        this.selector.model.family_selector = '.custom_family',
        // Rental Location Code
        this.selector.model.rental_location_code = 'custom_rental_location_code',
        this.selector.model.rental_location_code_selector = '#custom_rental_location_code',   
        this.selector.model.rental_location_selector = '.custom_rental_location',              
        // Accept Age
        this.selector.model.accept_age_selector = '#custom_accept_age';
        // Promotion code
        this.selector.model.promotion_code_selector = '#custom_promotion_code';
        
        // Initialize selector
        this.selector.view.init();
        this.selector.view.startEmpty();  

        // Notify selector ready   
        customSelectorModel.events.fireEvent({ type: 'selector_ready', data: {id: id} });
    }

  };

  var customSelector = { model: customSelectorModel,
                         controller: customSelectorController,
                         view: customSelectorView};

  return customSelector;

});
