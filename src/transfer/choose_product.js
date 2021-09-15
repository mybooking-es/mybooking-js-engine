require(['jquery', 'YSDRemoteDataSource','YSDSelectSelector',
         'commonServices', 'commonSettings', 'commonTranslations', 'commonLoader',
         'i18next', 'ysdtemplate', 
         './selector/modify_reservation_selector',
         './mediator/transferEngineMediator',
         'jquery.i18next',         
         'jquery.validate', 'jquery.ui', 'jquery.ui.datepicker-es',
         'jquery.ui.datepicker-en', 'jquery.ui.datepicker-ca', 'jquery.ui.datepicker-it',
         'jquery.ui.datepicker.validation'],
       function($, RemoteDataSource, SelectSelector, 
                commonServices, commonSettings, commonTranslations, commonLoader,
                i18next, tmpl, selector, transferEngineMediator) {

  var model = {

    requestLanguage: null, // Request language
    configuration: null,   // Settings
    // Search result
    shopping_cart: null,   // Shopping cart
    products: null,        // Search products
    sales_process: null,   // Sales process information
    // Product detail
    productDetail: null,   // product detail instance
    // Query parameters
    date : null,
    time : null,
    origin_point_id: null,
    destination_point_id: null,
    return_date : null,
    return_time : null,
    return_origin_point_id: null,
    return_destination_point_id: null,
    rountrip: null,
    number_of_adults: null,
    number_of_children: null,
    number_of_infants: null,
    agent_id: null,
    item_id: null,

    // -------------- Load settings ----------------------------

    /**
     * Load the settings
     */
    loadSettings: function() {
      commonSettings.loadSettings(function(data){
        model.configuration = data;
        view.init();
      });
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
     * products and available from the followin query string parameters:
     *
     * - date
     * - time
     * - origin_point_id
     * - destination_point_id
     * - return_date
     * - return_time
     * - return_origin_point_id
     * - return_destination_point_id
     * - rountrip
     * - number_of_adults
     * - number_of_children
     * - number_of_infants
     * - agent_id
     * - item_id
     */
    extractVariables: function() { // Load variables from the request

      var url_vars = this.getUrlVars();

      this.date = decodeURIComponent(url_vars['date']);
      this.time = decodeURIComponent(url_vars['time']);
      this.origin_point_id = decodeURIComponent(url_vars['origin_point_id']).replace(/\+/g, " ");
      this.destination_point_id = decodeURIComponent(url_vars['destination_point_id']).replace(/\+/g, " ");
      this.return_date = decodeURIComponent(url_vars['return_date']);
      this.return_time = decodeURIComponent(url_vars['return_time']);
      this.return_origin_point_id = decodeURIComponent(url_vars['return_origin_point_id']).replace(/\+/g, " ");
      this.return_destination_point_id = decodeURIComponent(url_vars['return_destination_point_id']).replace(/\+/g, " ");
      this.number_of_adults = decodeURIComponent(url_vars['number_of_adults']);
      this.number_of_children = decodeURIComponent(url_vars['number_of_children']);
      this.number_of_infants = decodeURIComponent(url_vars['number_of_infants']);
      this.rountrip = decodeURIComponent(url_vars['rountrip']);
      this.agent_id = decodeURIComponent(url_vars['agent_id']);
      this.item_id = decodeURIComponent(url_vars['item_id']);

    },

    // -------------- Shopping cart ----------------------------

    putShoppingCartFreeAccessId: function(value) {
      sessionStorage.setItem('transfer_shopping_cart_free_access_id', value);
    },

    getShoppingCartFreeAccessId: function() {
      return sessionStorage.getItem('transfer_shopping_cart_free_access_id');
    },

    isShoppingCartData: function() {

      return (this.date != 'undefined' && this.date != '');

    },

    buildLoadShoppingCartDataParams: function() { /* Build create/update shopping cart data */

      var data = {
        date : this.date,
        include_products: true
      };

      if (this.time != 'undefined') {
        data.time = this.time;
      }

      if (this.origin_point_id != 'undefined' && this.origin_point_id != '') {
        data.origin_point_id = this.origin_point_id;
      }
      
      if (this.destination_point_id != 'undefined' && this.destination_point_id != '') {
        data.destination_point_id = this.destination_point_id;
      }

      if (this.return_date != 'undefined') {
        data.return_date = this.return_date;
      }

      if (this.return_time != 'undefined') {
        data.return_time = this.return_time;
      }

      if (this.return_origin_point_id != 'undefined' && this.return_origin_point_id != '') {
        data.return_origin_point_id = this.return_origin_point_id;
      }
      
      if (this.return_destination_point_id != 'undefined' && this.return_destination_point_id != '') {
        data.return_destination_point_id = this.return_destination_point_id;
      }  
      
      if (this.number_of_adults != 'undefined' && this.number_of_adults != '') {
        data.number_of_adults = this.number_of_adults;
      }
       
      if (this.number_of_children != 'undefined' && this.number_of_children != '') {
        data.number_of_children = this.number_of_children;
      }

      if (this.number_of_infants != 'undefined' && this.number_of_infants != '') {
        data.number_of_infants = this.number_of_infants;
      }

      if (this.rountrip != 'undefined' && this.rountrip != '') {
        data.rountrip = this.rountrip;
      }

      if (this.agent_id != 'undefined' && this.agent_id != '') {
        data.agent_id = this.agent_id;
      }

      if (this.item_id != 'undefined' && this.item_id != '') {
        data.item_id = this.item_id;
      }

      var jsonData = encodeURIComponent(JSON.stringify(data));

      return jsonData;

    },

    loadShoppingCart: function() {

       // Build the URL
       var url = commonServices.URL_PREFIX + '/api/booking-transfer/frontend/shopping-cart';
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
     */
    buildSelectProductDataParams: function(productCode) {

      var data = {
        product: productCode
      };

      var jsonData = encodeURIComponent(JSON.stringify(data));

      return jsonData;

    },

    /**
     * Set the product
     */
    selectProduct: function(productCode) {
       // Build the URL
       var url = commonServices.URL_PREFIX + '/api/booking-transfer/frontend/shopping-cart';
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
               data: this.buildSelectProductDataParams(productCode),
               dataType : 'json',
               contentType : 'application/json; charset=utf-8',
               crossDomain: true,
               success: function(data, textStatus, jqXHR) {
                 model.shopping_cart = data.shopping_cart;
                 commonLoader.hide(); 
                 view.gotoNextStep();
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
    /* loadProduct: function(productCode) { // TODO

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

    } */


  };

  var controller = {

    /**
     * Load product detail
     */
    /* productDetailIconClick: function(productCode) { // TODO

      model.loadProduct(productCode);

    }, */

    /**
     * Select producto button click
     */
    selectProductBtnClick: function(productCode) {
      transferEngineMediator.onChooseSingleProduct( productCode, 
                                                model.products, 
                                                model.shopping_cart
                                              );
        
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
        transferEngineMediator.onChooseMultipleProducts( model.shopping_cart );
      }

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

      // Configure selector
      selector.model.requestLanguage = model.requestLanguage;
      selector.model.configuration = model.configuration;
      selector.view.init();

      // Extract the query parameters from the query string
      model.extractVariables();

      // Load shopping cart
      model.loadShoppingCart();

    },

    showShoppingCart: function() {

        // Show the reservation summary 
        if (document.getElementById('script_transfer_reservation_summary')) {
          var reservationDetail = tmpl('script_transfer_reservation_summary')({
                shopping_cart: model.shopping_cart,
                configuration: model.configuration});
          $('#mybooking_transfer_reservation_detail').html(reservationDetail);

          if ($('#modify_reservation_button').length) {
            // The user clicks on the modify reservation button
            $('#modify_reservation_button').bind('click', function() {
              // Setup the selector
              if (!view.selectorLoaded) {
                selector.view.startFromShoppingCart(model.shopping_cart);
                view.selectorLoaded = true;
              }
              // Show the reservation selector
              modifyReservationModalSelector = '#modify_transfer_reservation_modal'
              // Compatibility with libraries that overrides $.modal
              if (commonServices.jsBsModalNoConflict && typeof $.fn.bootstrapModal !== 'undefined') {
                $(modifyReservationModalSelector).bootstrapModal(commonServices.jsBSModalShowOptions());
              }
              else {
                if ($.fn.modal) {
                  $(modifyReservationModalSelector).modal(commonServices.jsBSModalShowOptions());
                }
              }
              $(modifyReservationModalSelector).show(); // TODO demo show modal (comment in pro!)
            });
          }
        
        }

        // Show the products
        if (document.getElementById('script_transfer_detailed_product')) {
          var available = 0;
          for (var idx=0;idx<model.products.length;idx++) {
            if (model.products[idx].available) {
              available += 1;
            }
          }          
          var result = tmpl('script_transfer_detailed_product')({
                              shoppingCart: model.shopping_cart, 
                              products: model.products,
                              configuration: model.configuration,
                              available: available,
                              i18next: i18next});
          $('#mybooking_transfer_product_listing').html(result);

          // Bind the event to choose the product
          $('.btn-choose-product').bind('click', function() {
            controller.selectProductBtnClick($(this).attr('data-product'));
          });
          // Bind the events to manage multiple products
          $('.select-choose-product').bind('change', function() {
              var productCode = $(this).attr('data-value');
              var productQuantity = $(this).val();
              controller.productQuantityChanged(productCode, productQuantity);
          });        
          $('#go_to_complete').bind('click', function() {
            controller.multipleProductsNextButtonClick();
          });
          // Bind the event to show detailed product
          $('.js-product-info-btn').bind('click', function(){
            controller.productDetailIconClick($(this).attr('data-product'));
          });    
        }  

    },

    showProductDetail: function() {

      if (document.getElementById('script_transfer_product_modal')) {
        var result = tmpl('script_transfer_product_modal')({
                        product: model.productDetail
                      });
        $('#modalTransferProductDetail .modal-product-detail-title').html(model.productDetail.name);
        $('#modalTransferProductDetail .modal-product-detail-content').html(result);
        // Compatibility with libraries that overrides $.modal
        if (commonServices.jsBsModalNoConflict && typeof $.fn.bootstrapModal !== 'undefined') {
          $('#modalTransferProductDetail').bootstrapModal(commonServices.jsBSModalShowOptions());
        }
        else {
          if ($.fn.modal) {
            $('#modalTransferProductDetail').modal(commonServices.jsBSModalShowOptions());
          }
        }                       
      }

    },

    /**
     * Go to the next step
     */
    gotoNextStep: function() {

      // Notify the event
      var event = {type: 'productChoosen',
                   data: model.shopping_cart};
      transferEngineMediator.notifyEvent(event);

      // Go to next step
      if (commonServices.transferExtrasStep) {
        window.location.href= commonServices.transferChooseExtrasUrl;
      }
      else {
        window.location.href= commonServices.transferCompleteUrl;
      }

    }

  };

  // Configure the delegate
  var rentChooseProduct = {
    model: model,
    controller: controller,
    view: view
  }
  transferEngineMediator.setChooseProduct( rentChooseProduct );

  // The loader is show on start and hidden after the result of
  // the search has been rendered (in model.loadShoppingCart)
  commonLoader.show();
  model.loadSettings();

});
