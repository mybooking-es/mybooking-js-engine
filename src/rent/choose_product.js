/* eslint-disable no-unused-vars */
require(['jquery', 'YSDRemoteDataSource','YSDSelectSelector',
         'commonServices', 'commonSettings', 'commonTranslations', 'commonLoader', 'commonUI',
         'i18next', 'ysdtemplate', 
         './selector/modify_reservation_selector', './selector-wizard/selector_wizard',
         './mediator/rentEngineMediator',
         './choose_product_filter/choose_product_filter',
         'YSDEventTarget',
         'jquery.i18next',         
         'jquery.validate', 'jquery.ui', 'jquery.ui.datepicker-es',
         'jquery.ui.datepicker-en', 'jquery.ui.datepicker-ca', 'jquery.ui.datepicker-it',
         'jquery.ui.datepicker.validation'],
       function($, RemoteDataSource, SelectSelector, 
                commonServices, commonSettings, commonTranslations, commonLoader, commonUI,
                i18next, tmpl, selector, selectorWizard, rentEngineMediator, filterComponent, YSDEventTarget) {

  var model = {

    requestLanguage: null, // Request language
    configuration: null,   // Settings
    // Search result
    shopping_cart: null,   // Shopping cart
    products: null,        // Search products
    sales_process: null,   // Sales process information
    half_day_turns: null,  // Half day turns
    // Product detail
    productDetail: null,   // product detail instance
    // Selected coverage
    hasCoverage: false,
    // Query parameters
    date_from : null,
    time_from : null,
    date_to : null,
    time_to : null,
    renting_duration: null,
    engine_fixed_rental_location: false,
    rental_location_code: null,
    simple_location_id: null,
    pickup_place: null,
    pickup_place_other: null,
    custom_pickup_place: null,
    return_place: null,
    return_place_other: null,
    custom_return_place: null,
    promotion_code: null,
    sales_channel_code: null,
    engine_fixed_family: false,
    family_id: null,
    engine_fixed_product: false,
    category_code: null,
    driver_age_rule_id: null,
    number_of_adults: null,
    number_of_children: null,
    number_of_products: null,
    agent_id: null,
    optional_external_driver: null, 
    driving_license_type_id: null,
    characteristic_length: null,
    characteristic_width: null,
    characteristic_height: null,
    characteristic_weight: null,
    characteristic_total_surface: null,
    characteristic_living_space: null,
    key_characteristic_1: null,
    key_characteristic_2: null,
    key_characteristic_3: null,
    key_characteristic_4: null,
    key_characteristic_5: null,
    key_characteristic_6: null,
    key_characteristic_7: null,
    key_characteristic_8: null,
    key_characteristic_9: null,

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

    // -------------- Filter get settings ----------------------------
    getFilterSettings: function() {
      // Only filter necessary data
      const {
        family_id,
        characteristic_length,
        characteristic_width,
        characteristic_height,
        characteristic_weight,
        key_characteristic_1,
        key_characteristic_2,
        key_characteristic_3,
        key_characteristic_4,
        key_characteristic_5,
        key_characteristic_6,
        key_characteristic_7,
        key_characteristic_8,
        key_characteristic_9,
      } = model;

      return {
        family_id,
        characteristic_length,
        characteristic_width,
        characteristic_height,
        characteristic_weight,
        key_characteristic_1,
        key_characteristic_2,
        key_characteristic_3,
        key_characteristic_4,
        key_characteristic_5,
        key_characteristic_6,
        key_characteristic_7,
        key_characteristic_8,
        key_characteristic_9,
      };
    },

    // -------------- Load settings ----------------------------

    // OPTIMIZATION 2024-01-27 START
    /**
     * Load the settings
     */
/*
    loadSettings: function() {
      commonSettings.loadSettings(function(data){
        model.configuration = data;
        // Check duplicated Tab
        if (model.configuration.duplicatedTab) {
          // Initialize i18next for translations
          i18next.init({  
                          lng: document.documentElement.lang,
                          resources: commonTranslations
                       }, 
                       function (error, t) {
                       });
          alert(i18next.t('common.duplicateTab'));
          // Clear the session for this tab so it can start a new process
          sessionStorage.clear();
          commonLoader.hide();
          $('#product_listing').html(i18next.t('common.duplicateTab'));
        }
        else {
          view.init();
        }
      });     
    },   
*/
    // OPTIMIZATION 2024-01-27 END

    // ------------ Products information detail ------------------------

    /**
     * Get an Object with the quantities of each product in the
     * shopping cart
     */
    getShoppingCartProductQuantities: function() {

      var shoppingCartExtras = {};

      if (this.shopping_cart != null) {
          for (var idx=0;idx<this.shopping_cart.items.length;idx++) {
            shoppingCartExtras[this.shopping_cart.items[idx].item_id] = this.shopping_cart.items[idx].quantity;
          }
      }

      return shoppingCartExtras;

    },

    // -------------- Extract data -----------------------------

    getUrlVars : function() {
      var vars = [], hash;
      var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
      for(var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
      }
      return vars;
    },

    /**
     * Extract variables from Query String
     * -----------------------------------
     * The choose product page receives the information to query for
     * products and availability from the followin query string parameters:
     *
     * - date_from
     * - time_from
     * - date_to
     * - time_to
     * - renting_duration
     * - simple_selector_id
     * - pickup_place
     * - return_place
     * - promotion_code
     * - sales_channel_code
     * - family_id
     * - category_code
     * - agent_id
     * - driver_age_rule_id
     * - number_of_adults
     * - number_of_children
     * - number_of_products
     * - optional_external_driver, 
     * - driving_license_type_id,
     * - simple_location_id, 
     * - characteristic_length,
     * - characteristic_width,
     * - characteristic_height,
     * - characteristic_weight,
     * - characteristic_total_surface,
     * - characteristic_living_space,
     * - key_characteristic_1,
     * - key_characteristic_2,
     * - key_characteristic_3,
     * - key_characteristic_4,
     * - key_characteristic_5,
     * - key_characteristic_6,
     * - key_characteristic_7,
     * - key_characteristic_8,
     * - key_characteristic_9,
     */
    extractVariables: function() { // Load variables from the request

      var urlVars = this.getUrlVars();

      this.date_from = decodeURIComponent(urlVars['date_from']);
      this.time_from = decodeURIComponent(urlVars['time_from']);
      this.date_to = decodeURIComponent(urlVars['date_to']);
      this.time_to = decodeURIComponent(urlVars['time_to']);
      this.renting_duration = decodeURIComponent(urlVars['renting_duration']);
      // OPTIMIZATION 2024-01-27 START
      this.rental_location_code = decodeURIComponent(urlVars['rental_location_code']);
      if (typeof urlVars['engine_fixed_rental_location'] !== 'undefined' && 
          urlVars['engine_fixed_rental_location'] === 'true') {
        this.engine_fixed_rental_location = true;
      }      
      this.simple_selector_id = decodeURIComponent(urlVars['simple_location_id']);
      // OPTIMIZATION 2024-01-27 END
/*
      if (this.configuration.selectorRentalLocation) {
        this.rental_location_code = decodeURIComponent(urlVars['rental_location_code']);
        if (typeof urlVars['engine_fixed_rental_location'] !== 'undefined' && 
            urlVars['engine_fixed_rental_location'] === 'true') {
          this.engine_fixed_rental_location = true;
        }
      }
      if (this.configuration.simpleLocation) {
        this.simple_selector_id = decodeURIComponent(urlVars['simple_location_id']);
      }
*/      
      this.pickup_place = decodeURIComponent(urlVars['pickup_place']).replace(/\+/g, " ");
      this.pickup_place_other = decodeURIComponent(urlVars['pickup_place_other']).replace(/\+/g, " ");
      this.custom_pickup_place = decodeURIComponent(urlVars['custom_pickup_place']);
      this.return_place = decodeURIComponent(urlVars['return_place']).replace(/\+/g, " ");
      this.return_place_other = decodeURIComponent(urlVars['return_place_other']).replace(/\+/g, " ");
      this.custom_return_place = decodeURIComponent(urlVars['custom_return_place']);      
      this.promotion_code = decodeURIComponent(urlVars['promotion_code']);
      this.sales_channel_code = decodeURIComponent(urlVars['sales_channel_code']);
      this.family_id = decodeURIComponent(urlVars['family_id']);
      if (typeof urlVars['engine_fixed_family'] !== 'undefined' && 
          urlVars['engine_fixed_family'] === 'true') {
        this.engine_fixed_family = true;
      }
      this.category_code = decodeURIComponent(urlVars['category_code']);
      if (typeof urlVars['engine_fixed_product'] !== 'undefined' && 
          urlVars['engine_fixed_product'] === 'true') {
        this.engine_fixed_product = true;
      }
      this.driver_age_rule_id = decodeURIComponent(urlVars['driver_age_rule_id']);
      this.number_of_adults = decodeURIComponent(urlVars['number_of_adults']);
      this.number_of_children = decodeURIComponent(urlVars['number_of_children']);
      this.number_of_products = decodeURIComponent(urlVars['number_of_products']);
      this.agent_id = decodeURIComponent(urlVars['agent_id']);
      this.category_code = decodeURIComponent(urlVars['category_code']);

      this.optional_external_driver = decodeURIComponent(urlVars['optional_external_driver']);
      this.driving_license_type_id = decodeURIComponent(urlVars['driving_license_type_id']);
      this.simple_location_id = decodeURIComponent(urlVars['simple_location_id']); 
      this.characteristic_length = decodeURIComponent(urlVars['characteristic_length']);
      this.characteristic_width = decodeURIComponent(urlVars['characteristic_width']);
      this.characteristic_height = decodeURIComponent(urlVars['characteristic_height']);
      this.characteristic_weight = decodeURIComponent(urlVars['characteristic_weight']);
      this.characteristic_total_surface = decodeURIComponent(urlVars['characteristic_total_surface']);
      this.characteristic_living_space = decodeURIComponent(urlVars['characteristic_living_space']);
      this.key_characteristic_1 = decodeURIComponent(urlVars['key_characteristic_1']);
      this.key_characteristic_2 = decodeURIComponent(urlVars['key_characteristic_2']);
      this.key_characteristic_3 = decodeURIComponent(urlVars['key_characteristic_3']);
      this.key_characteristic_4 = decodeURIComponent(urlVars['key_characteristic_4']);
      this.key_characteristic_5 = decodeURIComponent(urlVars['key_characteristic_5']);
      this.key_characteristic_6 = decodeURIComponent(urlVars['key_characteristic_6']);
      this.key_characteristic_7 = decodeURIComponent(urlVars['key_characteristic_7']);
      this.key_characteristic_8 = decodeURIComponent(urlVars['key_characteristic_8']);
      this.key_characteristic_9 = decodeURIComponent(urlVars['key_characteristic_9']);
    },

    // -------------- Shopping cart ----------------------------

    putShoppingCartFreeAccessId: function(value) {
      sessionStorage.setItem('shopping_cart_free_access_id', value);
    },

    getShoppingCartFreeAccessId: function() {
      return sessionStorage.getItem('shopping_cart_free_access_id');
    },

    isShoppingCartData: function() {

      // OPTIMIZATION 2024-01-27 START
      var dateFromdateTo = (this.date_from != 'undefined' && this.date_from != '' &&
                            this.date_to != 'undefined' && this.date_to != '');
      var dateFromDuration = (this.date_from != 'undefined' && this.date_from != '' &&
                              this.renting_duration != 'undefined' && this.renting_duration != '');  
      
      return (dateFromdateTo || dateFromDuration);
      // OPTIMIZATION 2024-01-27 END

/*      
      if (this.configuration.rentDateSelector === 'date_from_date_to') {
        // Dates => check Start and End date
        return (this.date_from != 'undefined' && this.date_from != '' &&
                this.date_to != 'undefined' && this.date_to != '');
      }
      else if (this.configuration.rentDateSelector === 'date_from_duration') {
        // Date and duration
        return (this.date_from != 'undefined' && this.date_from != '' &&
                this.renting_duration != 'undefined' && this.renting_duration != '');
      }
*/
    },

    buildLoadShoppingCartDataParams: function() { /* Build create/update shopping cart data */

      var data = {
        date_from : this.date_from,
        include_products: true
      };

      if (this.date_to != 'undefined' && this.date_to != '') {
        data.date_to = this.date_to;
      }

      if (this.time_from != 'undefined' && this.time_to != '') {
        data.time_from = this.time_from;
      }
       
      if (this.time_to != 'undefined' && this.time_to != '') {
        data.time_to = this.time_to;
      }

      if (this.renting_duration != 'undefined' && this.renting_duration != '') {
        data.renting_duration = this.renting_duration;
      }

      if (this.rental_location_code != 'undefined' && this.rental_location_code != null && this.rental_location_code != '') {
        data.rental_location_code = this.rental_location_code;
        data.engine_fixed_rental_location = this.engine_fixed_rental_location;
      }

      if (this.simple_location_id !== 'undefined' && this.simple_location_id !== null && this.simple_location_id !== '') {
        data.simple_location_id = this.simple_location_id;
      }

      if (this.pickup_place != 'undefined' && this.pickup_place != '') {
        data.pickup_place = this.pickup_place;
      }

      if (this.pickup_place_other != 'undefined' && this.pickup_place_other != '') {
        data.pickup_place_other = this.pickup_place_other;
      }

      if (this.custom_pickup_place != 'undefined' && this.custom_pickup_place != '') {
        data.custom_pickup_place = this.custom_pickup_place;
      }
      
      if (this.return_place != 'undefined' && this.return_place != '') {
        data.return_place = this.return_place;
      }

      if (this.return_place_other != 'undefined' && this.return_place_other != '') {
        data.return_place_other = this.return_place_other;
      }

      if (this.custom_return_place != 'undefined' && this.custom_return_place != '') {
        data.custom_return_place = this.custom_return_place;
      }

      if (this.promotion_code != 'undefined' && this.promotion_code != '') {
        data.promotion_code = this.promotion_code;
      }
       
      if (this.sales_channel_code != 'undefined' && this.sales_channel_code != '') {
        data.sales_channel_code = this.sales_channel_code;
      }

      if (this.family_id != 'undefined' && this.family_id != '') {
        data.family_id = this.family_id;
        data.engine_fixed_family = this.engine_fixed_family;
      }
      
      if (this.driver_age_rule_id != 'undefined' && this.driver_age_rule_id != '') {
        data.driver_age_rule = this.driver_age_rule_id;
      }

      if (this.number_of_products != 'undefined' && this.number_of_products != '') {
        data.number_of_products = this.number_of_products;
      }   
      
      if (this.number_of_adults != 'undefined' && this.number_of_adults != '') {
        data.number_of_adults = this.number_of_adults;
      }
       
      if (this.number_of_children != 'undefined' && this.number_of_children != '') {
        data.number_of_children = this.number_of_children;
      }

      if (this.agent_id != 'undefined' && this.agent_id != '') {
        data.agent_id = this.agent_id;
      }

      if (this.category_code != 'undefined' && this.category_code != '') {
        data.category_code = this.category_code;
      }

      if (this.optional_external_driver != 'undefined' && this.optional_external_driver != '') {
        data.optional_external_driver = this.optional_external_driver;
      }
      if (this.driving_license_type_id != 'undefined' && this.driving_license_type_id != '') {
        data.driving_license_type_id = this.driving_license_type_id;
      }
      if (this.simple_location_id != 'undefined' && this.simple_location_id != '') {
        data.simple_location_id = this.simple_location_id;
      }
      if (this.characteristic_length != 'undefined' && this.characteristic_length != '') {
        data.characteristic_length = this.characteristic_length;
      }
      if (this.characteristic_width != 'undefined' && this.characteristic_width != '') {
        data.characteristic_width = this.characteristic_width;
      }
      if (this.characteristic_height != 'undefined' && this.characteristic_height != '') {
        data.characteristic_height = this.characteristic_height;
      }
      if (this.characteristic_weight != 'undefined' && this.characteristic_weight != '') {
        data.characteristic_weight = this.characteristic_weight;
      }
      if (this.characteristic_total_surface != 'undefined' && this.characteristic_total_surface != '') {
        data.characteristic_total_surface = this.characteristic_total_surface;
      }
      if (this.characteristic_living_space != 'undefined' && this.characteristic_living_space != '') {
        data.characteristic_living_space = this.characteristic_living_space;
      }
      if (this.key_characteristic_1 != 'undefined' && this.key_characteristic_1 != '') {
        data.key_characteristic_1 = this.key_characteristic_1;
      }
      if (this.key_characteristic_2 != 'undefined' && this.key_characteristic_2 != '') {
        data.key_characteristic_2 = this.key_characteristic_2;
      }
      if (this.key_characteristic_3 != 'undefined' && this.key_characteristic_3 != '') {
        data.key_characteristic_3 = this.key_characteristic_3;
      }
      if (this.key_characteristic_4 != 'undefined' && this.key_characteristic_4 != '') {
        data.key_characteristic_4 = this.key_characteristic_4;
      }
      if (this.key_characteristic_5 != 'undefined' && this.key_characteristic_5 != '') {
        data.key_characteristic_5 = this.key_characteristic_5;
      }                                    
      if (this.key_characteristic_6 != 'undefined' && this.key_characteristic_6 != '') {
        data.key_characteristic_6 = this.key_characteristic_6;
      }
      if (this.key_characteristic_7 != 'undefined' && this.key_characteristic_7 != '') {
        data.key_characteristic_7 = this.key_characteristic_7;
      }
      if (this.key_characteristic_8 != 'undefined' && this.key_characteristic_8 != '') {
        data.key_characteristic_8 = this.key_characteristic_8;
      }
      if (this.key_characteristic_9 != 'undefined' && this.key_characteristic_9 != '') {
        data.key_characteristic_9 = this.key_characteristic_9;
      }
      
      // Append the referrer and the search (to manage conversions)
      if (typeof sessionStorage !== 'undefined') {
        if (sessionStorage.getItem('mybookingReferrer') !== null) {
          data.web_referrer = sessionStorage.getItem('mybookingReferrer');
        }
        if (sessionStorage.getItem('mybookingSearch') !== null) {
          data.web_search = sessionStorage.getItem('mybookingSearch');
        }
      }

      var jsonData = encodeURIComponent(JSON.stringify(data));

      return jsonData;

    },

    loadShoppingCart: function() {
      commonLoader.show(); 
      
       // Build the URL
       var url = commonServices.URL_PREFIX + '/api/booking/frontend/shopping-cart';
       var freeAccessId = this.getShoppingCartFreeAccessId();
       if (freeAccessId) {
         url += '/' + freeAccessId;
       }
       url += '?include_products=true';
       if (model.requestLanguage != null) {
         url += '&lang=' + model.requestLanguage;
       }
       if (commonServices.apiKey && commonServices.apiKey != '') {
         url += '&api_key=' + commonServices.apiKey;
       }  
       // Request
       if (this.isShoppingCartData()) { // create or update shopping cart
         $.ajax({
               type: 'POST',
               url : url,
               data: model.buildLoadShoppingCartDataParams(),
               dataType : 'json',
               contentType : 'application/json; charset=utf-8',
               crossDomain: true,
               success: function(data, textStatus, jqXHR) {
                 model.shoppingCartResultProcess(data, textStatus, jqXHR);
                 // Hide the loader (OK)
                 commonLoader.hide();
               },
               error: function(data, textStatus, jqXHR) {
                 // Hide the loader (Error)
                 commonLoader.hide();
                 alert(i18next.t('chooseProduct.loadShoppingCart.error'));
               },
               complete: function(jqXHR, textStatus) {
                 $('#sidebar').show();
               }
          });
       }
       else { // retrieve the shopping cart
         $.ajax({
               type: 'GET',
               url : url,
               dataType : 'json',
               contentType : 'application/json; charset=utf-8',
               crossDomain: true,
               success: function(data, textStatus, jqXHR) {
                 model.shoppingCartResultProcess(data, textStatus, jqXHR);
                 // Hide the loader (OK)
                 commonLoader.hide();                 
               },
               error: function(data, textStatus, jqXHR) {
                 commonLoader.hide();
                 alert(i18next.t('chooseProduct.loadShoppingCart.error'));
               },
               complete: function(jqXHR, textStatus) {
                 $('#sidebar').show();
               }
          });
       }

    },

    shoppingCartResultProcess: function(data, textStatus, jqXHR) {

       // OPTIMIZATION 2024-01-27 START - Load configuration within shopping cart and setup selector
       // Setup the configuration data
       commonSettings.setupConfigurationData(data.settings);
       model.configuration = commonSettings.data; 
       // Configure selector
       if (commonServices.selectorInProcess == 'wizard') {
         selectorWizard.model.requestLanguage = model.requestLanguage;
         selectorWizard.model.configuration = model.configuration;
       }
       else {
         selector.model.requestLanguage = model.requestLanguage;
         selector.model.configuration = model.configuration;
         selector.view.init();
       }

       // Check duplicated Tab
       if (model.configuration.duplicatedTab) {
         alert(i18next.t('common.duplicateTab'));
         // Clear the session for this tab so it can start a new process
         sessionStorage.clear();
         commonLoader.hide();
         $('#product_listing').html(i18next.t('common.duplicateTab'));
         return;
       }
       // OPTIMIZATION 2024-01-27 END

       model.shopping_cart = data.shopping_cart;
       model.products = data.products;
       model.sales_process = data.sales_process;
       // Half day turns
       if (typeof data.half_day_turns !== 'undefined') {
         model.half_day_turns = data.half_day_turns;
       }
       // Store the shopping cart free access id in the session
       var freeAccessId = model.getShoppingCartFreeAccessId();
       if (freeAccessId == null || freeAccessId != model.shopping_cart.free_access_id) {
         model.putShoppingCartFreeAccessId(model.shopping_cart.free_access_id);
       }
       view.showShoppingCart();
    },

    // -------------- Select product ----------------------------

    /**
     * Build select product data
     *
     * @productCode:: The product code
     * @quantity:: The quantity
     * @coverageCode:: The coverageCode (if it uses coverage)
     * @rateType:: The rate type (if it uses multiple rate type)
     * @extraCode:: The extra code (to include an extra automatically)
     */
    buildSelectProductDataParams: function(productCode, quantity, coverageCode, rateType, extraCode) {

      var data = {
        product: productCode
      };

      // The quantity
      if (typeof quantity != 'undefined') {
        data.quantity = quantity;
      }

      // The rate type
      if (this.configuration.chooseProductMultipleRateTypes && 
          typeof rateType !== 'undefined') {
        data.rate_type = rateType;
      }

      // The extra code
      if (typeof extraCode !== 'undefined') {
        data.extra_code = extraCode;
      }

      // Apply coverage
      if (this.hasCoverage) {
        if (coverageCode != null) {
          data.coverage = coverageCode;
        }
        else {
          if (typeof $('input[type=radio][name=coverage]:checked').attr('data-value') !== 'undefined') {
            data.coverage = $('input[type=radio][name=coverage]:checked').attr('data-value');
          }
        }
      }

      var jsonData = encodeURIComponent(JSON.stringify(data));

      return jsonData;

    },

    /**
     * Set the product
     */
    selectProduct: function(productCode, quantity, coverageCode, rateType, extraCode) {

       // Build the URL
       var url = commonServices.URL_PREFIX + '/api/booking/frontend/shopping-cart';
       var freeAccessId = this.getShoppingCartFreeAccessId();
       if (freeAccessId) {
         url += '/' + freeAccessId;
       }
       url += '/set-product';
       var urlParams = [];
       if (this.requestLanguage != null) {
         urlParams.push('lang=' + this.requestLanguage);
       }
       if (commonServices.apiKey && commonServices.apiKey != '') {
         urlParams.push('api_key='+commonServices.apiKey);
       }           
       if (urlParams.length > 0) {
         url += '?';
         url += urlParams.join('&');
       }
       // Request
       commonLoader.show();
       $.ajax({
               type: 'POST',
               url : url,
               data: this.buildSelectProductDataParams(productCode, quantity, coverageCode, rateType, extraCode),
               dataType : 'json',
               contentType : 'application/json; charset=utf-8',
               crossDomain: true,
               success: function(data, textStatus, jqXHR) {
                 model.shopping_cart = data.shopping_cart;
                 commonLoader.hide();
                 if (!model.sales_process.multiple_products) {
                    view.gotoNextStep(productCode);
                 }
               },
               error: function(data, textStatus, jqXHR) {
                 commonLoader.hide();
                 alert(i18next.t('chooseProduct.selectProduct.error'));
               }
          });

    },

    /**
     * Build select product variant data
     *
     * @productCode:: The product code
     * @quantity:: The quantity
     * @coverageCode:: The coverageCode (if it uses coverage)
     */
    buildSelectProductVariantDataParams: function(productCode, params) {
      var data = {
        product: model.configuration.multipleProductsSelection ? productCode : Object.keys(params)[0],
        quantity: model.configuration.multipleProductsSelection ? params[productCode] : 1,
      };
      
      var jsonData = encodeURIComponent(JSON.stringify(data));

      return jsonData;
    },

    getTotal: function (productCode) {
      var items = model.shopping_cart.items.filter((item) => {
        return productCode === item.parent_variant_item_id;
      });

      var total = 0;

      if (items && items.length > 0) {
        for (var idxV=0; idxV<items.length; idxV++) {
          var element = items[idxV];
          total += window.parseFloat(element.item_unit_cost) * element.quantity;
        }
      }

      return total;
    },

    /**
     * Set the product variant
     */
    selectProductVariants: function(productCode, variantCode, params) {
      // Build the URL
      var url = commonServices.URL_PREFIX + '/api/booking/frontend/shopping-cart';
      var freeAccessId = this.getShoppingCartFreeAccessId();
      if (freeAccessId) {
        url += '/' + freeAccessId;
      }
      url += '/set-product';
      var urlParams = [];
      if (this.requestLanguage != null) {
        urlParams.push('lang=' + this.requestLanguage);
      }
      if (commonServices.apiKey && commonServices.apiKey != '') {
        urlParams.push('api_key='+commonServices.apiKey);
      }           
      if (urlParams.length > 0) {
        url += '?';
        url += urlParams.join('&');
      }
      // Request
      commonLoader.show();

      $.ajax({
              type: 'POST',
              url : url,
              data:  this.buildSelectProductVariantDataParams(variantCode, params),
              dataType : 'json',
              contentType : 'application/json; charset=utf-8',
              crossDomain: true,
              success: function(data, textStatus, jqXHR) {
                model.shopping_cart = data.shopping_cart;

                commonLoader.hide();

                var total = model.getTotal(productCode);
                $('#variant_product_total_quantity').html(model.configuration.formatCurrency(total));
              },
              error: function(data, textStatus, jqXHR) {
                commonLoader.hide();
                alert(i18next.t('chooseProduct.selectProduct.error'));
              }
         });

   },

    /** 
     * Load product (product detail Page)
     */
    loadProduct: function(productCode) {

       // Build the URL
       var url = commonServices.URL_PREFIX + '/api/booking/frontend/products/'+productCode;
       var urlParams = [];
       if (this.requestLanguage != null) {
         urlParams.push('lang=' + this.requestLanguage);
       }
       if (commonServices.apiKey && commonServices.apiKey != '') {
         urlParams.push('api_key='+commonServices.apiKey);
       }           
       if (urlParams.length > 0) {
         url += '?';
         url += urlParams.join('&');
       }
       // Request
       commonLoader.show();
       $.ajax({
               type: 'GET',
               url : url,
               contentType : 'application/json; charset=utf-8',
               crossDomain: true,
               success: function(data, textStatus, jqXHR) {
                 model.productDetail = data;
                 view.showProductDetail();
                 commonLoader.hide();
               },
               error: function(data, textStatus, jqXHR) {
                  commonLoader.hide();
                  alert(i18next.t('chooseProduct.loadProduct.error'));
               }
          });

    }


  };

  var controller = {

    /**
     * Load product detail
     */
    productDetailIconClick: function(productCode) {

      var externalLink = false;

      // Check if open the product in a tab
      if (model.products) {
        var product = model.products.find(element => element.code === productCode);
        // Use external link if not use detail page as an extra step in the 
        // reservation process
        var useDetailPage = ($('#product_listing').attr('data-use-renting-detail-page') === 'true');
        if (!useDetailPage && product && product.external_detail_url && product.external_detail_url !== '') {
          externalLink = true;
          window.open(product.external_detail_url);
        }
      }

      if (!externalLink) {
        // Show a modal with the product
        model.loadProduct(productCode);
      }
      
    },

    /**
     * Select producto button click
     */
    selectProductBtnClick: function(productCode, rateType, extraCode) {

      rentEngineMediator.onChooseSingleProduct( productCode, 
                                                model.hasCoverage,
                                                view.getCurrentSelectedCoverage(), 
                                                model.products, 
                                                model.shopping_cart,
                                                rateType,
                                                extraCode
                                              );
        
    },

    /**
     * Select variant button click
     */
    selectVariantBtnClick: function(productCode) {
      var myProduct = model.products.find(product =>  productCode === product.code);

      if (myProduct.variants_enabled) {
        var variants = myProduct.variants;

        var variantsSelected = {};
        var items = model.shopping_cart.items.filter((item) => {
          return productCode === item.parent_variant_item_id;
        });
        if (items && items.length > 0) {
          for (var idxV=0; idxV<items.length; idxV++) {
            variantsSelected[items[idxV].item_id] = items[idxV].quantity;
          }
        }

        var variantHtml = tmpl('script_variant_product')({ 
          product: myProduct,
          variants, 
          variantsSelected, 
          total: model.getTotal(productCode), 
          productCode,
          configuration: model.configuration,
        });

        $('#variant-product-title').html(myProduct.name);
        $('#variant-product-content').html(variantHtml);
        commonUI.showModal('#modalVariantSelector', 
                            function(event, modal){ // on Show modal
                              setTimeout(function(){  
                                // Call to the mediator
                                rentEngineMediator.onShowModal(event, modal);
                              },50);
                            },
                            function(){
                              // On Hide modal => Refresh variants summary
                              view.refreshVariantsResume(productCode);
                            });

        $('.variant_product_selector').unbind('change');
        $('.variant_product_selector').bind('change', function() {
          var form = $(this).closest('form');
          var variantProductCode = $(this).attr('name');
          var params = form.formParams();

          // Add the variant
          if (model.configuration.multipleProductsSelection) {
            model.selectProductVariants(productCode, variantProductCode, params);
          } else {
            var myObj = {};
            myObj[params[variantProductCode]] = 1;
            model.selectProductVariants(productCode, variantProductCode, myObj);
          }
        });
      
      }
    },

    /**
     * Product quantity changed
     */
    productQuantityChanged: function(productCode, newQuantity) {

      model.selectProduct(productCode, newQuantity);

    },

    /**
     * Multiple products next button click
     */
    multipleProductsNextButtonClick: function() {

      if (model.shopping_cart.items.length == 0) {
        alert(i18next.t('chooseProduct.selectProduct.productNotSelected'));
      }
      else {
        rentEngineMediator.onChooseMultipleProducts( model.shopping_cart );
      }

    },

    coverageSelectorClick: function(selector) {
      var thisRadio = $(selector);
      // remove the class imChecked from other radios
      $('input[type=radio][name=coverage]').not(thisRadio).removeClass("imChecked");
      // Check the class imChecked
      if (thisRadio.hasClass("imChecked")) {
          thisRadio.removeClass("imChecked");
          thisRadio.prop('checked', false);
      } else { 
          thisRadio.prop('checked', true);
          thisRadio.addClass("imChecked");
      }
    },

    /**
     * Modal video toogle
     */
    productVideoonClick: function(type) {
      const productGallery = $('.mybooking-modal_product-gallery');
      const productImage = productGallery.find('.mybooking-carousel-inner');
      const productImageBtn = productGallery.find('[data-target="image"]');
      const productVideoBtn = productGallery.find('[data-target="video"]');

      const result = tmpl('script_transfer_product_detail_video')({
        product: model.productDetail
      });

      switch (type) {
        case 'image':
          productVideoBtn.show();

          $('#mybooking_transfer_product_detail_video').html('');

          productImage.show();
          productImageBtn.hide();
          break;
      
        default:
          productImage.hide();
          productImageBtn.show();

          $('#mybooking_transfer_product_detail_video').html(result);

          productVideoBtn.hide();
          break;
      }
    },

   /**
     * Set up filter values
     */
    formatFilterValues: function(data) {
      data.forEach((item, index) => {
        if (item.key === 'family_id') {
          model.family_id = item.value;
        } else {
          // Set the key characteristic; Expect array order is the same in form order
          model[`key_characteristic_${item.key}`] = item.value;
        }
      });
    },

  };

  var view = {

    selectorLoaded: false,

    init: function() {
      model.requestLanguage = commonSettings.language(document.documentElement.lang);
      // Initialize i18next for translations
      i18next.init({  
                      lng: model.requestLanguage,
                      resources: commonTranslations
                   }, 
                   function (error, t) {
                      // https://github.com/i18next/jquery-i18next#initialize-the-plugin
                      //jqueryI18next.init(i18next, $);
                      // Localize UI
                      //$('.nav').localize();
                   });

      // OPTIMIZATION 2024-01-27 START
/*                   
      // Configure selector
      if (commonServices.selectorInProcess == 'wizard') {
        selectorWizard.model.requestLanguage = model.requestLanguage;
        selectorWizard.model.configuration = model.configuration;
      }
      else {
        selector.model.requestLanguage = model.requestLanguage;
        selector.model.configuration = model.configuration;
        selector.view.init();
      }
*/
      // OPTIMIZATION 2024-01-27 END

      // Extract the query parameters from the query string
      model.extractVariables();

      // Load shopping cart
      model.loadShoppingCart();

      // Load filter if exists
      if ($('#mybooking_choose_product_filter').length) {
        this.initializeFilter();
      }
    },

    refreshVariantsResume: function(productCode) {
      var myProduct = model.products.find(product =>  productCode === product.code);

      if (myProduct.variants_enabled) {
        var variantsSelected = [];
        var items = model.shopping_cart.items.filter((item) => productCode === item.parent_variant_item_id);
        if (items && items.length > 0) {
          for (var idxV=0; idxV<items.length; idxV++) {
            variantsSelected.push(
              {
                id: items[idxV].item_id,
                quantity: items[idxV].quantity,
                name: myProduct.variants.find((variant) => variant.code === items[idxV].item_id).variant_name,
              }
            );
          }
        }

        var resumeHtml = tmpl('script_variant_product_resume')({
          variantsSelected,
          configuration: model.configuration,
          total: model.getTotal(productCode),
        });
        $(`.product-variant-resume[data-product-code=${ productCode }]`).html(resumeHtml);
      }
    },

    showShoppingCart: function() {

        // Show the reservation summary 
        if (document.getElementById('script_reservation_summary')) {
          var reservationDetail = tmpl('script_reservation_summary')({
                shopping_cart: model.shopping_cart,
                configuration: model.configuration,
                halfDayTurns: model.half_day_turns});
          $('#reservation_detail').html(reservationDetail);

          // Half day turns
          if ($('form[name=mybooking-choose-product_duration-form] input[name=turn]').length) {
            $('form[name=mybooking-choose-product_duration-form] input[name=turn]').on('change', function(){
              var value = $(this).val();
              if (typeof value !== 'undefined' && value != '') {
                var period = value.split('-');
                if (period && period.length == 2) {
                  // Change the shopping cart time_from and time_to and force reload to
                  // get availability and prices
                  model.time_from = period[0];
                  model.date_to = model.date_from;
                  model.time_to = period[1];
                  commonLoader.show();
                  model.loadShoppingCart();
                }
              }
            });
          }

          // Modify reservation button
          if ($('#modify_reservation_button').length) {
            // The user clicks on the modify reservation button
            $('#modify_reservation_button').on('click', function() {
              // Setup the wizard
              if (!view.selectorLoaded) {
                if (commonServices.selectorInProcess == 'wizard') {
                  selectorWizard.view.startFromShoppingCart(model.shopping_cart);
                }
                else {
                  selector.view.startFromShoppingCart(model.shopping_cart);
                }
                view.selectorLoaded = true;
              }
              // Show the reservation wizard
              if (commonServices.selectorInProcess == 'wizard') {
                selectorWizard.view.showWizard();
              }
              else { // Show the reservation form
                // Compatibility with old version of the theme
                var modifyReservationModalSelector = '#choose_productModal';
                if ($('#modify_reservation_modal').length || $('#modify_reservation_modal_MBM').length > 0) {
                  modifyReservationModalSelector = '#modify_reservation_modal'
                }
                // Show the modal to change dates
                commonUI.showModal(modifyReservationModalSelector,
                  function(event, modal){ // on Show
                    setTimeout(function(){  
                      // Call to the mediator
                      rentEngineMediator.onShowModal(event, modal);
                    },50);
                  });
              }
            });
          }
        
        }

        // Show the products
        var available = 0;
        for (var idx=0;idx<model.products.length;idx++) {
          if (model.products[idx].availability) {
            available += 1;
          }
        }
        
        if (model.configuration.chooseProductMultipleRateTypes) {

          if (document.getElementById('script_detailed_product_multiple_rates')) {

            var result = tmpl('script_detailed_product_multiple_rates')({
              shoppingCartProductQuantities: model.getShoppingCartProductQuantities(),
              shoppingCart: model.shopping_cart, 
              products: model.products,
              configuration: model.configuration,
              available: available,
              i18next: i18next});
            $('#product_listing').html(result);

            // Bind the event to choose the product
            $('.btn-choose-product').bind('click', function(e) {
              e.preventDefault();
              controller.selectProductBtnClick($(this).attr('data-product'),
                                               $(this).attr('data-rate-type-id'),
                                               $(this).attr('data-extra-code'));
            });
            // Bind the event to show detailed product
            $('.js-product-info-btn').bind('click', function(){
              controller.productDetailIconClick($(this).attr('data-product'));
            });  
            // Bind the event to show video
            $('.mybooking-detail_modal').on('click', '.js-product-toogle-video', function(event) {
              const target = $(event.target).attr('data-target');

              controller.productVideoonClick(target);
            });
          }

        }
        else {

          if (document.getElementById('script_detailed_product')) {
  
            var result = tmpl('script_detailed_product')({
                                shoppingCartProductQuantities: model.getShoppingCartProductQuantities(),
                                shoppingCart: model.shopping_cart, 
                                products: model.products,
                                configuration: model.configuration,
                                available: available,
                                i18next: i18next});
            $('#product_listing').html(result);
  
            // Add variants resume
            model.shopping_cart.items.forEach((item) => {
              if (item.parent_variant_item_id) {
                this.refreshVariantsResume(item.parent_variant_item_id);
              }
            });
  
            // Bind the event to change to list
  
            // Bind the event to choose the product
            $('.btn-choose-product').bind('click', function(e) {
              e.preventDefault();
              controller.selectProductBtnClick($(this).attr('data-product'),
                                               $(this).attr('data-rate-type-id'),
                                               $(this).attr('data-extra-code'));
            });
            // Bind the events to manage multiple products
            $('.select-choose-product').bind('change', function() {
                var productCode = $(this).attr('data-value');
                var productQuantity = $(this).val();
                controller.productQuantityChanged(productCode, productQuantity);
            }); 
            // Bind the event to choose variant
            $('.btn-choose-variant').bind('click', function() {
              controller.selectVariantBtnClick($(this).attr('data-product'));
            });       
            $('#go_to_complete').bind('click', function() {
              controller.multipleProductsNextButtonClick();
            });
            // Bind the event to show detailed product
            $('.js-product-info-btn').bind('click', function(){
              controller.productDetailIconClick($(this).attr('data-product'));
            });  
            // Bind the event to show video
            $('.mybooking-detail_modal').on('click', '.js-product-toogle-video', function(event) {
              const target = $(event.target).attr('data-target');
              
              controller.productVideoonClick(target);
            });
            // Setup coverage
            this.setupCoverage();        
          }  
        }

    },

    /***
     * Prepare the product selector to manage coverage
     */
    setupCoverage: function() {

      model.hasCoverage = false;
      for (var idx=0;idx<model.products.length;idx++) {
        if (model.products[idx].coverage && model.products[idx].coverage instanceof Array &&
            model.products[idx].coverage.length > 0) {
          model.hasCoverage = true;
          break;
        }
      }
      if (model.hasCoverage) {
        $('input[type=radio][name=coverage]').click(function(e){
            controller.coverageSelectorClick(this);
        });        
      }

    },

    showProductDetail: function() {

      if (document.getElementById('script_product_modal')) {
        var result = tmpl('script_product_modal')({
                        product: model.productDetail
                      });

        // Compatibility with bootstrap modal replacement (from 1.0.0)
        if ($('#modalProductDetail_MBM').length) {
          $('#modalProductDetail_MBM .modal-product-detail-title').html(model.productDetail.name);
          $('#modalProductDetail_MBM .modal-product-detail-content').html(result);      
        }
        else {
          $('#modalProductDetail .modal-product-detail-title').html(model.productDetail.name);
          $('#modalProductDetail .modal-product-detail-content').html(result);                 
        }

        // Show the product in a modal
        commonUI.showModal('#modalProductDetail', function(event, modal){ // on Show
                                                    setTimeout(function(){  
                                                      if ($('.mybooking-carousel-inner').length) {  
                                                        commonUI.showSlider('.mybooking-carousel-inner');
                                                      }
                                                      // Call to the mediator
                                                      rentEngineMediator.onShowModal(event, modal);
                                                    },50);
                                                  },
                                                  function(event, modal) { // on Hide
                                                    commonUI.pauseSlider('.mybooking-carousel-inner');
                                                    commonUI.destroySlider('.mybooking-carousel-inner');
                                                  } 
                                                );
                      
      }

    },

    getCurrentSelectedCoverage: function() {
      var coverage = null;
      if (model.hasCoverage) {
        if (typeof $('input[type=radio][name=coverage]:checked').attr('data-value') !== 'undefined') {
          coverage = $('input[type=radio][name=coverage]:checked').attr('data-value');
        }        
      }
      return coverage;
    },

    /**
     * Go to the next step
     */
    gotoNextStep: function(productCode) {

      // Notify the event
      var event = {type: 'productChoosen',
                   data: model.shopping_cart};
      rentEngineMediator.notifyEvent(event);

      // Go to product detail page
      if (!model.sales_process.multiple_products) { 
        // Single product detail page
        if (typeof productCode !== 'undefined' && 
            $('#product_listing').length && 
            $('#product_listing').attr('data-use-renting-detail-page') === 'true') {
          var product = model.products.find(product => product.code === productCode);
          if (product) {
            if (typeof product.external_detail_url !== 'undefined' && product.external_detail_url &&
                product.external_detail_url !== '') {
              // Detail page defined in external detail URL
              window.location.href = product.external_detail_url;
              return;
            }
            else if ( commonServices.rentingDetailPages && commonServices.rentingDetailPageUrlPrefix !== '' ) {
              // Virtual detail page
              var url = commonServices.siteURL;
              url += '/';
              url += commonServices.rentingDetailPageUrlPrefix;
              url += '/';
              url += productCode;
              window.location.href = url;
              return;
            }
          }
        }
      }

      // Go to next step

      if (commonServices.extrasStep) {
        // Go to extras page
        window.location.href= commonServices.chooseExtrasUrl;
      }
      else {
        // Go to complete page
        window.location.href= commonServices.completeUrl;
      }

    },

    /**
     * Initialize the filter
     */
    initializeFilter: function() {
      filterComponent.view.init({getFilterSettings: model.getFilterSettings, events: model.events});

      // Setup event listener for filter
      this.setupFilterEventListeners();
    },

     /**
     * Initialize the filter
     */
     refreshFilter: function() {
      filterComponent.view.refresh();

      // Setup event listener for filter
      this.setupFilterEventListeners();
    },

    /**
     * Setup filter event listeners
     */
    setupFilterEventListeners: function() {
      // Product filter update
      model.removeListeners('choose_product_filter_update');
      model.addListener('choose_product_filter_update', (formData) => controller.formatFilterValues(formData.data));

      // Product filter and send to the shopping cart
      model.removeListeners('choose_product_filter_update_send');
      model.addListener('choose_product_filter_update_send', (formData) => {
        // Fomat the filter values
        controller.formatFilterValues(formData.data);
        // Load the shopping cart
        model.loadShoppingCart();
        // Refresh the filter if it is a modal event send
        if (formData.target === 'modal') {
          this.refreshFilter();
        }
      });
    },
  };

  // Configure the delegate
  var rentChooseProduct = {
    model: model,
    controller: controller,
    view: view
  };
  rentEngineMediator.setChooseProduct(rentChooseProduct);

  // The loader is show on start and hidden after the result of
  // the search has been rendered (in model.loadShoppingCart)
  commonLoader.show();
  // OPTIMIZATION 2024-01-27 START
  //model.loadSettings();
  view.init();
  // OPTIMIZATION 2024-01-27 END

});