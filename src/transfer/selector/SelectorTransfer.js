define('SelectorTransfer', ['jquery', 'YSDMemoryDataSource', 'YSDRemoteDataSource','YSDSelectSelector',
         'commonServices','commonSettings', 'commonTranslations', 'commonLoader',
         'i18next', 'moment','ysdtemplate', 'cookie', 'jquery.i18next',
         'jquery.validate', 'jquery.ui', 'jquery.ui.datepicker-es',
         'jquery.ui.datepicker-en', 'jquery.ui.datepicker-ca', 'jquery.ui.datepicker-it',
         'jquery.ui.datepicker.validation'],
         function($, MemoryDataSource, RemoteDataSource, SelectSelector,
                  commonServices, commonSettings, commonTranslations, commonLoader, 
                  i18next, moment, tmpl, cookie) {

  /***************************************************************************
   *
   * Selector Transfer Model
   *
   ***************************************************************************/
  var SelectorTransferModel = function() {

    this.selectorView = null;

    // == Selectors

    // Search form
    this.form_selector = 'form[name=search_form]';
    // Search form template
    this.form_selector_tmpl = 'form_selector_tmpl';

    // Date
    this.date_id = 'date';
    this.date_selector = '#date';

    // Time
    this.time_id = 'time';
    this.time_selector = '#time';

    // Origin point
    this.origin_point_id = 'origin_point';
    this.origin_point_selector = '#origin_point';
    
    // Destination point
    this.destination_point_id = 'destination_point';   
    this.destination_point_selector = '#destination_point';

    // One / Two ways trip
    this.rountrip_id = 'rountrip';
    this.rountrip_selector = '#rountrip';

    // Return Date
    this.return_date_id = 'return_date';
    this.return_date_selector = '#return_date';

    // Return Time
    this.return_time_id = 'return_time';
    this.return_time_selector = '#return_time';

    // Return Origin point
    this.return_origin_point_id = 'return_origin_point';
    this.return_origin_point_selector = '#return_origin_point';
    
    // Return Destination point
    this.return_destination_point_id = 'return_destination_point';   
    this.return_destination_point_selector = '#return_destination_point';

    // Number of people
    this.number_of_people_id = 'number_of_people';
    this.number_of_people_selector = '#number_of_people';

    // == State variables
    this.dataSourceOriginPoints = null; // Origin points datasource
    this.dataSourceDestinationPoints = null; // Destination points datasource

    this.requestLanguage = null;
    this.configuration = null;
    this.shopping_cart = null;
    this.loadedShoppingCart = false;

    this.setSelectorView = function(_selectorView) {
        this.selectorView = _selectorView;
    }

  };

  /***************************************************************************
   *
   * Selector Transfer Controller
   *
   ***************************************************************************/
  var SelectorTransferController = function() {

    this.selectorView = null;
    this.selectorModel = null;

    /**
     * Set the selector view
     */
    this.setSelectorView = function( _selectorView ) {
        this.selectorView = _selectorView;
    }
  
    /**
    * Set the selector model
    */
    this.setSelectorModel = function( _selectorModel ) {
        this.selectorModel = _selectorModel;
    }

  };


  /***************************************************************************
   *
   * Selector Transfer View
   *
   ***************************************************************************/
  var SelectorTransferView = function(_selectorModel, _selectorController) {
    this.selectorModel = _selectorModel;
    this.selectorController = _selectorController;

    /**
     * Init
     */
    this.init = function() {
        
        // Setup request language and settings
        this.selectorModel.requestLanguage = commonSettings.language(document.documentElement.lang);
        this.loadOriginPoints();
    }
    
    /**
     * Load settings
     */
    this.loadSettings = function (instance) {
        commonLoader.show();
        return commonSettings.loadSettings(function(data){
            instance.model.configuration = data;
            commonLoader.hide();
            instance.view.init();
        });
    }
    // TODO

  };

  var SelectorTransfer = function() {

    console.log('Selector Transfer');

    this.model = new SelectorTransferModel();
    this.controller = new SelectorTransferController();
    this.view = new SelectorTransferView(this.model, this.controller);

    this.controller.setSelectorView(this.view);
    this.controller.setSelectorModel(this.model);
    this.model.setSelectorView(this.view);

    this.view.loadSettings(this);

  }

  return SelectorTransfer;

});
