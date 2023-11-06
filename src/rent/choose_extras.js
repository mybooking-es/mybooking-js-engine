require(['jquery', 
         'commonServices', 'commonSettings', 'commonTranslations', 'commonLoader', 'commonUI',
         'i18next', 'ysdtemplate', './selector/modify_reservation_selector',
         './mediator/rentEngineMediator',
         'jquery.i18next',         
         'jquery.formparams', 'jquery.form',
         'jquery.validate', 'jquery.ui', 'jquery.ui.datepicker-es',
         'jquery.ui.datepicker-en', 'jquery.ui.datepicker-ca', 'jquery.ui.datepicker-it',
         'jquery.ui.datepicker.validation'],
       function($, 
                commonServices, commonSettings, commonTranslations, commonLoader, commonUI,
                i18next, tmpl, selector, rentEngineMediator) {

  var model = { // THE MODEL
    requestLanguage: null,
    configuration: null,    
    shopping_cart: null,
    products: null,
    extras: null,
    coverages: null,
    sales_process: null,
    
    // -------------- Load settings ----------------------------

    loadSettings: function() {
      commonSettings.loadSettings(function(data){
        model.configuration = data;
        view.init();
      });
    },  

    // ------------ Extras information detail ------------------------

    getShoppingCartExtras: function() { /** Get an object representation of extras **/

      var shoppingCartExtras = {};

      if (this.shopping_cart != null) {
          for (var idx=0;idx<this.shopping_cart.extras.length;idx++) {
            shoppingCartExtras[this.shopping_cart.extras[idx].extra_id] = this.shopping_cart.extras[idx].quantity;
          }
      }

      return shoppingCartExtras;

    },

    // ------------------ Shopping cart -------------------------------

    getShoppingCartFreeAccessId: function() { /* Get the shopping cart id */
      return sessionStorage.getItem('shopping_cart_free_access_id');
    },

    deleteShoppingCartFreeAccessId: function() { /* Get the shopping cart id */
      return sessionStorage.removeItem('shopping_cart_free_access_id');
    },

    loadShoppingCart: function() { /** Load the shopping cart **/

       // Build the URL
       var url = commonServices.URL_PREFIX + '/api/booking/frontend/shopping-cart';
       var freeAccessId = this.getShoppingCartFreeAccessId();
       if (freeAccessId) {
         url += '/' + freeAccessId;
       }
       var urlParams = [];
       urlParams.push('include_extras=true');
       urlParams.push('include_coverage=true');
       if (model.requestLanguage != null) {
        urlParams.push('lang='+model.requestLanguage);
       }
       if (commonServices.apiKey && commonServices.apiKey != '') {
         urlParams.push('api_key='+commonServices.apiKey);
       } 
       if (urlParams.length > 0) {
         url += '?';
         url += urlParams.join('&');
       }
       // Request
       $.ajax({
               type: 'GET',
               url : url,
               dataType : 'json',
               contentType : 'application/json; charset=utf-8',
               crossDomain: true,
               success: function(data, textStatus, jqXHR) {

                 model.shopping_cart = data.shopping_cart;
                 model.products = data.products;
                 model.extras = data.extras;
                 model.coverages = data.coverages;
                 model.sales_process = data.sales_process;

                 view.updateShoppingCart();

               },
               error: function(data, textStatus, jqXHR) {

                 alert(i18next.t('chooseExtras.loadShoppingCart.error'));

               },
               complete: function(jqXHR, textStatus) {
                 commonLoader.hide();
                 $('#content').show();
                 $('#sidebar').show();
               }
          });

    },

    // -------------- Extras management --------------------------

    buildSetExtraDataParams: function(extraCode, quantity) {

      var data = {
        extra: extraCode,
        quantity: quantity
      };

      var jsonData = encodeURIComponent(JSON.stringify(data));

      return jsonData;

    },

    setExtra: function(extraCode, quantity) { /** Add an extra **/

      // Build the URL
      var url = commonServices.URL_PREFIX + '/api/booking/frontend/shopping-cart';
      var freeAccessId = this.getShoppingCartFreeAccessId();
      if (freeAccessId) {
        url += '/' + freeAccessId;
      }
      url += '/set-extra';
      var urlParams = [];
      if (model.requestLanguage != null) {
       urlParams.push('lang='+model.requestLanguage);
      }
      if (commonServices.apiKey && commonServices.apiKey != '') {
        urlParams.push('api_key='+commonServices.apiKey);
      } 
      if (urlParams.length > 0) {
        url += '?';
        url += urlParams.join('&');
      }
      // Request
      $.ajax({
        type: 'POST',
        url : url,
        data: this.buildSetExtraDataParams(extraCode, quantity),
        dataType : 'json',
        contentType : 'application/json; charset=utf-8',
        crossDomain: true,
        success: function(data, textStatus, jqXHR) {
            model.shopping_cart = data.shopping_cart;
            view.updateShoppingCartSummary();
            view.updateExtra(extraCode, quantity);
        },
        error: function(data, textStatus, jqXHR) {

          alert(i18next.t('chooseExtras.selectExtra.error'));

        },
        beforeSend: function(jqXHR) {
            commonLoader.show();
        },
        complete: function(jqXHR, textStatus) {
            commonLoader.hide();
        }
      });


    },

    buildDeleteExtraDataParams: function(extraCode) {
      var data = {
        extra: extraCode
      };
      var jsonData = encodeURIComponent(JSON.stringify(data));
      return jsonData;
    },

    deleteExtra: function(extraCode) { /** Remove an extra **/
      // Build the URL
      var url = commonServices.URL_PREFIX + '/api/booking/frontend/shopping-cart';
      var freeAccessId = this.getShoppingCartFreeAccessId();
      if (freeAccessId) {
        url += '/' + freeAccessId;
      }
      url += '/remove-extra';
      var urlParams = [];
      if (model.requestLanguage != null) {
       urlParams.push('lang='+model.requestLanguage);
      }
      if (commonServices.apiKey && commonServices.apiKey != '') {
        urlParams.push('api_key='+commonServices.apiKey);
      } 
      if (urlParams.length > 0) {
        url += '?';
        url += urlParams.join('&');
      }
      // Request
      $.ajax({
        type: 'POST',
        url : url,
        data: this.buildDeleteExtraDataParams(extraCode),
        dataType : 'json',
        contentType : 'application/json; charset=utf-8',
        crossDomain: true,
        success: function(data, textStatus, jqXHR) {
            model.shopping_cart = data.shopping_cart;
            view.updateShoppingCartSummary();
            view.updateExtra(extraCode, 0);
        },
        error: function(data, textStatus, jqXHR) {

            alert(i18next.t('chooseExtras.deleteExtra.error'));

        },
        beforeSend: function(jqXHR) {
            commonLoader.show();
        },
        complete: function(jqXHR, textStatus) {
            commonLoader.hide();
        }
      });

    }

  };

  var controller = { // THE CONTROLLER

      extraChecked: function(extraCode) {
          model.setExtra(extraCode, 1);
      },

      extraUnchecked: function(extraCode) {
          model.deleteExtra(extraCode);
      },

      extraQuantityChanged: function(extraCode, newQuantity) {
          model.setExtra(extraCode, newQuantity);
      },

      btnMinusExtraClicked: function(extraCode, newQuantity) {
          model.setExtra(extraCode, newQuantity);
      },

      btnPlusExtraClicked: function(extraCode, newQuantity) {
          model.setExtra(extraCode, newQuantity);
      },

      goToCompleteButtonClick: function() {

        rentEngineMediator.onChooseExtras( model.shopping_cart );

      }

  };

  var view = { // THE VIEW

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

      // Load shopping cart
      commonLoader.show();
      model.loadShoppingCart();
    },

    updateShoppingCart: function() { // Updates the shopping cart

      selector.view.startFromShoppingCart(model.shopping_cart);
      this.updateShoppingCartSummary();
      this.updateExtras();

    },

    updateShoppingCartSummary: function() { // Updates the shopping cart summary (total)

       // Show the reservation summary
       if (document.getElementById('script_reservation_summary')) {
         var reservationDetail = tmpl('script_reservation_summary')({
              shopping_cart: model.shopping_cart,
              configuration: model.configuration});
         $('#reservation_detail').html(reservationDetail);
         
         // Setup the events
         
         if ($('#modify_reservation_button').length) {
           // The user clicks on the modify reservation button
           $('#modify_reservation_button').bind('click', function() { 
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
                  if ($('#modify_reservation_modal').length || $('#modify_reservation_modal_MBM').length) {
                    modifyReservationModalSelector = '#modify_reservation_modal'
                  }
                  // Show the modal to change dates
                  commonUI.showModal(modifyReservationModalSelector);
                }
           });
         }

       }
       $('#btn_go_to_complete').bind('click', function() {
           controller.goToCompleteButtonClick();
       });

    },

    updateExtra: function(extraCode, quantity) {

      // Button for add and remove
      $('.extra-input[data-extra-code='+extraCode+']').val(quantity);

      // Button extra toggle
      if (quantity == 0) {
        $('.extra-check-button[data-extra-code='+extraCode+']').removeClass('extra-selected');
      }
      else {
        $('.extra-check-button[data-extra-code='+extraCode+']').addClass('extra-selected');
      }

    },

    updateExtras: function() { // Updates the extras (included the selected by the transaction)

        // == Show the extras
        var result = tmpl('script_detailed_extra')({extras: model.extras,
                                                    coverages: model.coverages,  
                                                    extrasInShoppingCart: model.getShoppingCartExtras(),
                                                    configuration: model.configuration,
                                                    i18next: i18next,
                                                    shopping_cart: model.shopping_cart});
        $('#extras_listing').html(result);

        // == Setup events

        // Extra check button [1 unit]
        $('.extra-check-button').bind('click', function() {
            var extraCode = $(this).attr('data-extra-code');
            if ($(this).hasClass('extra-selected')) {
              controller.extraUnchecked(extraCode);
            }
            else {
              controller.extraChecked(extraCode);
            }
        });

        // Extra checkbox [1 unit]
        $('.extra-checkbox').bind('change', function() {
            var extraCode = $(this).attr('data-value');
            var checked = $(this).is(':checked');
            if (checked) {
                controller.extraChecked(extraCode);
            }
            else {
                controller.extraUnchecked(extraCode);
            }
        });

        // Extra select [N units]
        $('.extra-select').bind('change', function() {
            var extraCode = $(this).attr('data-extra-code');
            var extraQuantity = $(this).val();
            controller.extraQuantityChanged(extraCode, extraQuantity);
        });

        // Extra minus button extra clicked [N units]
        $('.btn-minus-extra').bind('click', function() {
            var extraCode = $(this).attr('data-value');
            var extraQuantity = parseInt($('#extra-'+extraCode+'-quantity').val() || '0');
            console.log(extraQuantity);
            if (extraQuantity > 0) {
              extraQuantity--;     
              controller.btnMinusExtraClicked(extraCode, extraQuantity);
            }
        });

        // Extra plus button extra clicked [N units]
        $('.btn-plus-extra').bind('click', function() {
            var extraCode = $(this).attr('data-value');
            var extraQuantity = parseInt($('#extra-'+extraCode+'-quantity').val() || '0');
            var maxQuantity = $(this).attr('data-max-quantity');
            if (extraQuantity < maxQuantity) {
              extraQuantity++;     
              controller.btnPlusExtraClicked(extraCode, extraQuantity);
            }
        });        

    },

    gotoNextStep: function() {
      // Notify the event
      var event = {type: 'extrasChoosen',
                   data: model.shopping_cart};
      rentEngineMediator.notifyEvent(event);
      // Go to Next Step
      window.location.href = commonServices.completeUrl;      
    }
    
  };

  var rentChooseExtras = {
    model: model,
    controller: controller,
    view: view
  }
  rentEngineMediator.setChooseExtras( rentChooseExtras );


  model.loadSettings();

});