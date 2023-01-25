/* eslint-disable no-unused-vars */
require(['jquery', 'YSDRemoteDataSource','YSDSelectSelector',
         'commonServices', 'commonSettings', 'commonTranslations', 'commonLoader', 'commonUI',
         'i18next', 'ysdtemplate', 
         './selector/modify_reservation_selector', './selector-wizard/selector_wizard',
         './mediator/rentEngineMediator', 
         'jquery.i18next',         
         'jquery.validate', 'jquery.ui', 'jquery.ui.datepicker-es',
         'jquery.ui.datepicker-en', 'jquery.ui.datepicker-ca', 'jquery.ui.datepicker-it',
         'jquery.ui.datepicker.validation'],
       function($, RemoteDataSource, SelectSelector, 
                commonServices, commonSettings, commonTranslations, commonLoader, commonUI,
                i18next, tmpl, selector, selectorWizard, rentEngineMediator) {

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

    // -------------- Load settings ----------------------------

    /**
     * Load the settings
     */
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
     * 
     */
    extractVariables: function() { // Load variables from the request

      var url_vars = this.getUrlVars();

      this.date_from = decodeURIComponent(url_vars['date_from']);
      this.time_from = decodeURIComponent(url_vars['time_from']);
      this.date_to = decodeURIComponent(url_vars['date_to']);
      this.time_to = decodeURIComponent(url_vars['time_to']);
      this.renting_duration = decodeURIComponent(url_vars['renting_duration']);
      if (this.configuration.selectRentalLocation) {
        this.rental_location_code = decodeURIComponent(url_vars['rental_location_code']);
        if (typeof url_vars['engine_fixed_rental_location'] !== 'undefined' && 
            url_vars['engine_fixed_rental_location'] === 'true') {
          this.engine_fixed_rental_location = true;
        }
      }
      this.pickup_place = decodeURIComponent(url_vars['pickup_place']).replace(/\+/g, " ");
      this.pickup_place_other = decodeURIComponent(url_vars['pickup_place_other']).replace(/\+/g, " ");
      this.custom_pickup_place = decodeURIComponent(url_vars['custom_pickup_place']);
      this.return_place = decodeURIComponent(url_vars['return_place']).replace(/\+/g, " ");
      this.return_place_other = decodeURIComponent(url_vars['return_place_other']).replace(/\+/g, " ");
      this.custom_return_place = decodeURIComponent(url_vars['custom_return_place']);      
      this.promotion_code = decodeURIComponent(url_vars['promotion_code']);
      this.sales_channel_code = decodeURIComponent(url_vars['sales_channel_code']);
      this.family_id = decodeURIComponent(url_vars['family_id']);
      if (typeof url_vars['engine_fixed_family'] !== 'undefined' && 
          url_vars['engine_fixed_family'] === 'true') {
        this.engine_fixed_family = true;
      }
      this.category_code = decodeURIComponent(url_vars['category_code']);
      if (typeof url_vars['engine_fixed_product'] !== 'undefined' && 
          url_vars['engine_fixed_product'] === 'true') {
        this.engine_fixed_product = true;
      }
      this.driver_age_rule_id = decodeURIComponent(url_vars['driver_age_rule_id']);
      this.number_of_adults = decodeURIComponent(url_vars['number_of_adults']);
      this.number_of_children = decodeURIComponent(url_vars['number_of_children']);
      this.number_of_products = decodeURIComponent(url_vars['number_of_products']);
      this.agent_id = decodeURIComponent(url_vars['agent_id']);
      this.category_code = decodeURIComponent(url_vars['category_code']);

    },

    // -------------- Shopping cart ----------------------------

    putShoppingCartFreeAccessId: function(value) {
      sessionStorage.setItem('shopping_cart_free_access_id', value);
    },

    getShoppingCartFreeAccessId: function() {
      return sessionStorage.getItem('shopping_cart_free_access_id');
    },

    isShoppingCartData: function() {

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
        data.driver_age_rule_id = this.driver_age_rule_id;
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

      var jsonData = encodeURIComponent(JSON.stringify(data));

      return jsonData;

    },

    loadShoppingCart: function() {

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
       model.shopping_cart = data.shopping_cart;
       model.products = data.products;
       model.sales_process = data.sales_process;
       // Half day turns
       if (typeof data.half_day_turns !== 'undefined') {
         model.half_day_turns = data.half_day_turns;
       }
       // Store the shopping cart free access id in the session
       var free_access_id = model.getShoppingCartFreeAccessId();
       if (free_access_id == null || free_access_id != model.shopping_cart.free_access_id) {
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
     */
    buildSelectProductDataParams: function(productCode, quantity, coverageCode) {

      var data = {
        product: productCode
      };

      if (typeof quantity != 'undefined') {
        data.quantity = quantity;
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
    selectProduct: function(productCode, quantity, coverageCode) {

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
               data: this.buildSelectProductDataParams(productCode, quantity, coverageCode),
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
        product: productCode,
        variants: params,
      };

      var jsonData = encodeURIComponent(JSON.stringify(data));

      return jsonData;
    },

    /**
     * Set the product variant
     */
    selectProductVariants: function(productCode, params) {
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
              data:  this.buildSelectProductVariantDataParams(productCode, params),
              dataType : 'json',
              contentType : 'application/json; charset=utf-8',
              crossDomain: true,
              success: function(data, textStatus, jqXHR) {
                commonLoader.hide();

                var resumeBox = $('#product-variant-resume');
                resumeBox.html('');

                var item = data.shopping_cart.items.find((item) => productCode === item.item_id);
                var variants = item.variants || {'B-1': 1}; // TODO

                for (const variant in variants) {
                  if (Object.hasOwnProperty.call(variants, variant)) {
                    const element = variants[variant];
                    
                    resumeBox.append(
                      `<div style="display: inline-block; margin-right: 0.5rem; border-radius: 2px; border: 1px solid lightgray; font-size: 12px;"><span style="display: inline-block;  padding: 5px;">${element}</span> <span style="display: inline-block;  padding: 5px; background-color: lightgray;">${variant}</span></div>`
                    );
                  }
                }

                if (item) { // TODO
                  var total = window.parseFloat(item.item_unit_cost) *  window.parseFloat(item.quantity);
                  resumeBox.append(`<span class="float-right"><h4>${total} €</h4></span>`);
                }

                commonUI.hideModal('#modalVariantSelector');
                $('#modalVariantSelector').hide();
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
        if (product && product.external_detail_url && product.external_detail_url !== '') {
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
     * Show products in Grid
     */ 
    showProductsInGridButtonClick: function() {

      $('.mybooking-product_container').removeClass('mybooking-product_list');
      $('.mybooking-product_container').addClass('mybooking-product_grid');

    },

    /**
     * Show products in List
     */ 
    showProductsInListButtonClick: function() {

      $('.mybooking-product_container').removeClass('mybooking-product_grid');
      $('.mybooking-product_container').addClass('mybooking-product_list');

    },

    /**
     * Select producto button click
     */
    selectProductBtnClick: function(productCode) {

      rentEngineMediator.onChooseSingleProduct( productCode, 
                                                model.hasCoverage,
                                                view.getCurrentSelectedCoverage(), 
                                                model.products, 
                                                model.shopping_cart
                                              );
        
    },

    /**
     * Select variant button click
     */
    selectVariantBtnClick: function(productCode) {
      var myProduct = model.products.find(product =>  productCode === product.code);

      if (myProduct.is_variant) {
        var variants = myProduct.variants;
        var variantHtml = tmpl('script_variant_product')({ variants, productCode });

        $('#variant-product-title').html(myProduct.name);
        $('#variant-product-content').html(variantHtml);
        commonUI.showModal('#modalVariantSelector');
        $('#modalVariantSelector').show();

        $('.variant_product_selector').unbind('change');
        $('.variant_product_selector').bind('change', function() {
          var block = $('#variant_product_selectors');
          var selectors = block.find('.variant_product_selector');
          var price = $(this).closest('select').attr('data-variant-unit-price');
          var sum = 0;

          selectors.each(
            function(index, selector) {
              sum += window.parseFloat($(selector).val()) * window.parseFloat(price);
            }
          );

          $('#variant_product_total_quantity').html(sum);
        });

        $('#variant_product_form_button').one('click', function (event) {
          event.preventDefault();

          var form = $(this).closest('form');
          model.selectProductVariants(form.attr('data-product-code'), form.formParams());
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
    }

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

      // Extract the query parameters from the query string
      model.extractVariables();

      // Load shopping cart
      model.loadShoppingCart();

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
                commonUI.showModal(modifyReservationModalSelector);
              }
            });
          }
        
        }

        // Show the products
        if (document.getElementById('script_detailed_product')) {
          var available = 0;
          for (var idx=0;idx<model.products.length;idx++) {
            if (model.products[idx].availability) {
              available += 1;
            }
          }          
          var result = tmpl('script_detailed_product')({
                              shoppingCartProductQuantities: model.getShoppingCartProductQuantities(),
                              shoppingCart: model.shopping_cart, 
                              products: model.products,
                              configuration: model.configuration,
                              available: available,
                              i18next: i18next});
          $('#product_listing').html(result);

          // Bind the event to change to grid
          $('.js-mb-grid').on('click', function(){
            controller.showProductsInGridButtonClick();
          });

          $('.js-mb-list').on('click', function(){
            controller.showProductsInListButtonClick();
          });

          // Bind the event to change to list

          // Bind the event to choose the product
          $('.btn-choose-product').bind('click', function() {
            controller.selectProductBtnClick($(this).attr('data-product'));
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
          // Setup coverage
          this.setupCoverage();        
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
                                                      if ( $('.mybooking-carousel-inner').length ) {  
                                                        commonUI.showSlider('.mybooking-carousel-inner');
                                                      }
                                                      $('#modal_product_photos').on('click', function(){
                                                        $('.mybooking-modal_product-description').hide();
                                                        $('.mybooking-modal_product-container').show();
                                                        commonUI.playSlider('.mybooking-carousel-inner');
                                                      });
                                                      $('#modal_product_info').on('click', function(){
                                                        $('.mybooking-modal_product-container').hide();
                                                        $('.mybooking-modal_product-description').show();
                                                        commonUI.pauseSlider('.mybooking-carousel-inner');
                                                      });
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
            else if (commonServices.rentingDetailPageUrlPrefix !== '') {
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

    }

  };

  // Configure the delegate
  var rentChooseProduct = {
    model: model,
    controller: controller,
    view: view
  }
  rentEngineMediator.setChooseProduct( rentChooseProduct );

  // The loader is show on start and hidden after the result of
  // the search has been rendered (in model.loadShoppingCart)
  commonLoader.show();
  model.loadSettings();

});
