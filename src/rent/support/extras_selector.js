define('extrasSelector', ['jquery', 
         'commonServices', 'commonSettings', 'commonTranslations', 'commonLoader',
         'i18next', 'ysdtemplate', 'YSDEventTarget',
         'jquery.i18next',         
         'jquery.formparams', 'jquery.form',
         'jquery.validate', 'jquery.ui', 'jquery.ui.datepicker-es',
         'jquery.ui.datepicker-en', 'jquery.ui.datepicker-ca', 'jquery.ui.datepicker-it',
         'jquery.ui.datepicker.validation'],
       function($, 
                commonServices, commonSettings, commonTranslations, commonLoader,
                i18next, tmpl, YSDEventTarget) {

  var extrasSelectorModel = { // THE MODEL

    events: new YSDEventTarget(),
    requestLanguage: null,
    shopping_cart: null,
    shoppingCartFreeAccessId: null,
    
    addListener: function(type, listener) { /* addListener */
      this.events.addEventListener(type, listener);  
    },
    
    removeListener: function(type, listener) { /* removeListener */
      this.events.removeEventListener(type, listener);     
    },

    removeListeners: function(type) { /* remove listeners*/
     this.events.removeEventListeners(type);
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

    // -------------- Extras management --------------------------

    setExtra: function(extraCode, quantity) { /** Add an extra **/

      // Build the URL
      var url = commonServices.URL_PREFIX + '/api/booking/frontend/shopping-cart';
      url += '/' + this.shoppingCartFreeAccessId;
      url += '/set-extra';
      var urlParams = [];
      if (this.requestLanguage != null) {
        urlParams.push('lang='+this.requestLanguage);
      }
      if (commonServices.apiKey && commonServices.apiKey != '') {
        urlParams.push('api_key='+commonServices.apiKey);
      } 
      if (urlParams.length > 0) {
        url += '?';
        url += urlParams.join('&');
      }
      // Build the data
      var data = {
        extra: extraCode,
        quantity: quantity
      };
      var jsonData = encodeURIComponent(JSON.stringify(data));
      // Request
      $.ajax({
        type: 'POST',
        url : url,
        data: jsonData,
        dataType : 'json',
        contentType : 'application/json; charset=utf-8',
        crossDomain: true,
        success: function(data, textStatus, jqXHR) {
            extrasSelectorModel.shopping_cart = data.shopping_cart;
            extrasSelectorModel.events.fireEvent({type: 'setExtra', data: {code: extraCode, 
                                                                           quantity: quantity,
                                                                           shopping_cart: extrasSelectorModel.shopping_cart}});
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

    deleteExtra: function(extraCode) { /** Remove an extra **/

      // Build the URL
      var url = commonServices.URL_PREFIX + '/api/booking/frontend/shopping-cart';
      url += '/' + this.shoppingCartFreeAccessId;
      url += '/remove-extra';
      var urlParams = [];
      // Language
      if (this.requestLanguage != null) {
        urlParams.push('lang='+this.requestLanguage);
      }
      // Api Key
      if (commonServices.apiKey && commonServices.apiKey != '') {
        urlParams.push('api_key='+commonServices.apiKey);
      } 
      if (urlParams.length > 0) {
        url += '?';
        url += urlParams.join('&');
      }

      // Build the data
      var data = {
        extra: extraCode
      };
      var jsonData = encodeURIComponent(JSON.stringify(data));

      // Action to the URL
      $.ajax({
        type: 'POST',
        url : url,
        data: jsonData,
        dataType : 'json',
        contentType : 'application/json; charset=utf-8',
        crossDomain: true,
        success: function(data, textStatus, jqXHR) {
            extrasSelectorModel.shopping_cart = data.shopping_cart;
            extrasSelectorModel.events.fireEvent({type: 'deletedExtra', data: {code: extraCode,
                                                                               shopping_cart: extrasSelectorModel.shopping_cart}});
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

  var extrasSelectorController = { // THE CONTROLLER

      extraChecked: function(extraCode) {
          extrasSelectorModel.setExtra(extraCode, 1);
      },

      extraUnchecked: function(extraCode) {
          extrasSelectorModel.deleteExtra(extraCode);
      },

      extraQuantityChanged: function(extraCode, newQuantity) {
          extrasSelectorModel.setExtra(extraCode, newQuantity);
      },

      btnMinusExtraClicked: function(extraCode, newQuantity) {
          extrasSelectorModel.setExtra(extraCode, newQuantity);
      },

      btnPlusExtraClicked: function(extraCode, newQuantity) {
          extrasSelectorModel.setExtra(extraCode, newQuantity);
      }

  };

  var extrasSelectorView = { // THE VIEW

    init: function() {
      extrasSelectorModel.requestLanguage = commonSettings.language(document.documentElement.lang);
      // Initialize i18next for translations
      i18next.init({  
                      lng: extrasSelectorModel.requestLanguage,
                      resources: commonTranslations
                   }, 
                   function (error, t) {
                     console.log('i18next error');
                   });    
      // Setup extras events  
      this.setupExtrasEvents();
    },

    setupExtrasEvents: function() { // Updates the extras (included the selected by the transaction)

        // Extra check button [1 unit]
        $('.extra-check-button').bind('click', function() {
            var extraCode = $(this).attr('data-extra-code');
            if ($(this).hasClass('extra-selected')) {
              extrasSelectorController.extraUnchecked(extraCode);
            }
            else {
              extrasSelectorController.extraChecked(extraCode);
            }
        });

        // Extra checkbox [1 unit]
        $('.extra-checkbox').bind('change', function() {
            var extraCode = $(this).attr('data-value');
            var checked = $(this).is(':checked');
            if (checked) {
                extrasSelectorController.extraChecked(extraCode);
            }
            else {
                extrasSelectorController.extraUnchecked(extraCode);
            }
        });

        // Extra select [N units]
        $('.extra-select').bind('change', function() {
            var extraCode = $(this).attr('data-extra-code');
            var extraQuantity = $(this).val();
            extrasSelectorController.extraQuantityChanged(extraCode, extraQuantity);
        });

        // Extra minus button extra clicked [N units]
        $('.btn-minus-extra').bind('click', function() {
            var extraCode = $(this).attr('data-value');
            var extraQuantity = parseInt($('#extra-'+extraCode+'-quantity').val() || '0');
            console.log(extraQuantity);
            if (extraQuantity > 0) {
              extraQuantity--;     
              extrasSelectorController.btnMinusExtraClicked(extraCode, extraQuantity);
            }
        });

        // Extra plus button extra clicked [N units]
        $('.btn-plus-extra').bind('click', function() {
            var extraCode = $(this).attr('data-value');
            var extraQuantity = parseInt($('#extra-'+extraCode+'-quantity').val() || '0');
            var maxQuantity = $(this).attr('data-max-quantity');
            if (extraQuantity < maxQuantity) {
              extraQuantity++;     
              extrasSelectorController.btnPlusExtraClicked(extraCode, extraQuantity);
            }
        });        

    }
    
  };

  var extrasSelector = {
    model: extrasSelectorModel,
    controller: extrasSelectorController,
    view: extrasSelectorView
  }

  return extrasSelector;


});