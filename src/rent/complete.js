require(['jquery', 
         'commonServices', 'commonSettings', 'commonTranslations', 'commonLoader', 'commonUI',
         'i18next','ysdtemplate','YSDDateControl', 
         './selector/modify_reservation_selector', './selector-wizard/selector_wizard', 'select2', 
         'YSDMemoryDataSource','YSDSelectSelector', './mediator/rentEngineMediator', '../profile/Login',
         '../profile/PasswordForgottenComponent', 'moment',
         'jquery.i18next', 'jquery.formparams', 'jquery.form',
	       'jquery.validate', 'jquery.ui', 'jquery.ui.datepicker-es',
         'jquery.ui.datepicker-en', 'jquery.ui.datepicker-ca', 'jquery.ui.datepicker-it',
	       'jquery.ui.datepicker.validation'],
	     function($, 
                commonServices, commonSettings, commonTranslations, commonLoader, commonUI,
                i18next, tmpl, DateControl, selector, selectorWizard, select2,
                MemoryDataSource, SelectSelector, rentEngineMediator, Login, PasswordForgottenComponent, moment) {

  var model = { // THE MODEL
    reservationFormSubmitted: false,
    //
    requestLanguage: null,
    configuration: null,     
    customerClassifiers: null,
    // The shopping cart    
    shopping_cart: null,
    extras: null,         // Extras
    coverages: null,      // The coverages
    sales_process: null,  // Sales process
    // Extra detail
    extraDetail: null,
    isAirportDataRequired: false,
    isHotelDataRequired: false,

    // -------------- Load settings ----------------------------

    // OPTIMIZATION 2024-01-27 START    
    /**
     * Load settings
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
          $('form[name=reservation_form]').html(i18next.t('common.duplicateTab'));
        }
        else {
          view.init();
        }
      });
    },      
*/
    // OPTIMIZATION 2024-01-27 END

    // ------------ Load customer classifiers -----------------

    /**
     * Load customer classifiers
     */ 
    loadCustomerClassifier: function() { 

      console.log('loadCustomerClassifier');
      var self = this;
      var url = commonServices.URL_PREFIX + '/api/booking/frontend/customer-classifier';
      var urlParams = []
      if (commonServices.apiKey && commonServices.apiKey != '') {
        urlParams.push('api_key='+commonServices.apiKey);
      }  
      if (model.requestLanguage != null) {
        urlParams.push('lang='+model.requestLanguage);
      }
      if (urlParams.length > 0) {
        url += '?';
        url += urlParams.join('&');
      }
      var self = this;
      // Request
      $.ajax({
        type: 'GET',
        url: url,
        dataType: 'json',
        success: function(data, textStatus, jqXHR) {
          self.customerClassifiers = data;
          for (var idx=0;idx<self.customerClassifiers.length;idx++){
            self.customerClassifiers[idx]['text'] = self.customerClassifiers[idx]['description'] = self.customerClassifiers[idx]['name'];
          } 

          view.updateCustomerClassifiers();
        },
        error: function(data, textStatus, jqXHR) {
          alert(i18next.t('common.error'));
        }
      });      
    },


    // ------------ Extras information detail ------------------------

    /**
     * Get an Object with the quantities of each extra in the
     * shopping cart
     */
    getShoppingCartExtrasQuantities: function() { 

      var shoppingCartExtras = {};

      if (this.shopping_cart != null) {
          for (var idx=0;idx<this.shopping_cart.extras.length;idx++) {
            shoppingCartExtras[this.shopping_cart.extras[idx].extra_id] = this.shopping_cart.extras[idx].quantity;
          }
      }

      return shoppingCartExtras;

    },

    /**
     * Check if an extra code is a coverage
     */  
    isCoverage: function(extraCode) {
      var found = false;
      if (this.coverages) {
        for (var idx=0;idx<this.coverages.length;idx++) {
          if (this.coverages[idx].code == extraCode) {
            found = true;
            break;
          }
        }
      }
      return found;
    },

    // ------------------ Shopping cart -------------------------------

    /**
     * Get the shopping cart id from the session storage
     */  
    getShoppingCartFreeAccessId: function() { /* Get the shopping cart id */
      return sessionStorage.getItem('shopping_cart_free_access_id');
    },

    /**
     * Remove the shopping cart id from the session storage
     */  
    deleteShoppingCartFreeAccessId: function() { /* Get the shopping cart id */
      return sessionStorage.removeItem('shopping_cart_free_access_id');
    },

    /**
     * Load the shopping cart
     */ 
    loadShoppingCart: function() { 

       // Build the URL
       var url = commonServices.URL_PREFIX + '/api/booking/frontend/shopping-cart';
       var freeAccessId = this.getShoppingCartFreeAccessId();
       if (freeAccessId) {
         url += '/' + freeAccessId;
       }
       var urlParams = [];
       urlParams.push('include_extras=true');
       urlParams.push('include_coverage=true');
       if (model.requestLanguage != null) {
        urlParams.push('lang='+model.requestLanguage);
       }
       if (commonServices.apiKey && commonServices.apiKey != '') {
         urlParams.push('api_key='+commonServices.apiKey);
       }        
       if (urlParams.length > 0) {
         url += '?';
         url += urlParams.join('&');
       }
       // Action to the URL
       $.ajax({
               type: 'GET',
               url : url,
               dataType : 'json',
               contentType : 'application/json; charset=utf-8',
               crossDomain: true,
               success: function(data, textStatus, jqXHR) {

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
                 // Complements
                 if (model.configuration.engineCustomerAccess) {
                   view.setupLoginForm();
                 }
                 // Check duplicated Tab
                 if (model.configuration.duplicatedTab) {
                   alert(i18next.t('common.duplicateTab'));
                   // Clear the session for this tab so it can start a new process
                   sessionStorage.clear();
                   commonLoader.hide();
                   $('form[name=reservation_form]').html(i18next.t('common.duplicateTab'));
                   return;
                 }
                 // OPTIMIZATION 2024-01-27 END

                 model.shopping_cart = data.shopping_cart;
                 model.extras = data.extras;
                 model.coverages = data.coverages;
                 model.sales_process = data.sales_process;
                 
                 view.updateShoppingCart();

                 // Airport and hotel form required  conditional rules
                 // In the html it must exist a id="airport-form-section" and a atribute data-airport-required="true"
                 // in this case it will only be required when the pick-up site is the airport
                 var airportSection = $('#airport-form-section');
                 if (airportSection.length > 0 )  {
                  if (data.shopping_cart.pickup_place_type === 'airport' && airportSection.attr('data-airport-required') === 'true') {
                    model.isAirportDataRequired = true;
                  }
                 }
                 // In the html it must exist a id="hotel-form-section" and a atribute data-hotel-required="true"
                 var hotelSection = $('#hotel-form-section');
                 if (hotelSection.length > 0 )  {
                   if (hotelSection.attr('data-hotel-required') === 'true') {
                     model.isHotelDataRequired = true;
                   }
                 }

                 // Hide the loader
                 commonLoader.hide();
               },
               error: function(data, textStatus, jqXHR) {
                 commonLoader.hide();
                 alert(i18next.t('complete.loadShoppingCart.error'));

               },
               complete: function(jqXHR, textStatus) {
                 $('#content').show();
                 $('#sidebar').show();
               }
          });

    },

    // -------------- Extras management --------------------------

    /**
     * Add an extra / update its quantity
     */   
    setExtra: function(extraCode, quantity) { 

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
      commonLoader.show();
      $.ajax({
        type: 'POST',
        url : url,
        data: this.buildSetExtraDataParams(extraCode, quantity),
        dataType : 'json',
        contentType : 'application/json; charset=utf-8',
        crossDomain: true,
        success: function(data, textStatus, jqXHR) {
            model.shopping_cart = data.shopping_cart;
            model.sales_process = data.sales_process;
            // Updates the shopping cart
            view.updateShoppingCartExtra(extraCode, quantity);
            // Hide the loader (OK)
            commonLoader.hide();
            // Notify mediator
            rentEngineMediator.onCompleteSetExtra(extraCode, quantity);            
        },
        error: function(data, textStatus, jqXHR) {
            // Hide the loader (Error)
            commonLoader.hide(); 
            alert(i18next.t('complete.selectExtra.error'));
        }
      });


    },

    /**
     * Remove an extra
     */  
    deleteExtra: function(extraCode) { 

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
      commonLoader.show();
      $.ajax({
        type: 'POST',
        url : url,
        data: this.buildDeleteExtraDataParams(extraCode),
        dataType : 'json',
        contentType : 'application/json; charset=utf-8',
        crossDomain: true,
        success: function(data, textStatus, jqXHR) {
            model.shopping_cart = data.shopping_cart;
            model.sales_process = data.sales_process;
            // Updates the shopping cart
            view.updateShoppingCartExtra(extraCode, 0);          
            // Hide the loader (OK)
            commonLoader.hide();
            // Notify mediator
            rentEngineMediator.onCompleteSetExtra(extraCode, 0);              
        },
        error: function(data, textStatus, jqXHR) {
            alert(i18next.t('complete.deleteExtra.error'));
            // Hide the loader (Error)
            commonLoader.hide();
        }
      });

    },

    /**
     * Load the extra detail page
     */  
    loadExtra: function(extraCode) {

       // Build the URL
       var url = commonServices.URL_PREFIX + '/api/booking/frontend/extras/'+extraCode;
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
       // Action to the URL
       $.ajax({
               type: 'GET',
               url : url,
               contentType : 'application/json; charset=utf-8',
               crossDomain: true,
               success: function(data, textStatus, jqXHR) {
                 model.extraDetail = data;
                 view.showExtraDetail();
                 // Hide the loader (OK)
                 commonLoader.hide();
               },
               error: function(data, textStatus, jqXHR) {
                  // Hide the loader (Error)
                  commonLoader.hide();                
                  alert(i18next.t('complete.loadExtra.error'));
               }
          });

    },

    buildSetExtraDataParams: function(extraCode, quantity) {

      var data = {
        extra: extraCode,
        quantity: quantity
      };

      var jsonData = encodeURIComponent(JSON.stringify(data));

      return jsonData;

    },
    
    buildDeleteExtraDataParams: function(extraCode) {

      var data = {
        extra: extraCode
      };

      var jsonData = encodeURIComponent(JSON.stringify(data));

      return jsonData;

    },

    // -------------- Promotion Code --------------------------------------
    
    /**
     *  Apply the promotion code
     */ 
    applyPromotionCode: function(promotionCode) {

      var requestData = {promotion_code: promotionCode};
      var requestDataJSON = encodeURIComponent(JSON.stringify(requestData));
      var url = commonServices.URL_PREFIX + '/api/booking/frontend/shopping-cart';
      var freeAccessId = this.getShoppingCartFreeAccessId();
      if (freeAccessId) {
        url += '/' + freeAccessId;
      }
      url += '/apply-promotion-code';
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
            url  : url,
            data : requestDataJSON,
            dataType : 'json',
            contentType : 'application/json; charset=utf-8',
            crossDomain: true,
            success: function(data, textStatus, jqXHR) {
                // Update the shopping cart
                model.shopping_cart = data.shopping_cart;
                model.sales_process = data.sales_process;
                view.updateShoppingCartPromotionCode();
                // Hide the loader
                commonLoader.hide();
            },
            error: function(data, textStatus, jqXHR) {
                // Hide Loader (ERROR)
                commonLoader.hide();
                if (typeof data.responseJSON !== 'undefined' && 
                    typeof data.responseJSON.error !== 'undefined') {
                  alert(data.responseJSON.error);
                }
                else {
                  alert(i18next.t('complete.promotionCode.error'));
                }
            }
        });


    },

    // -------------- Checkout : Confirm reservation ----------------------

    getBookingFreeAccessId: function() { /* Get the shopping cart id */
      return sessionStorage.getItem('booking_free_access_id');
    },


    putBookingFreeAccessId: function(value) {
      sessionStorage.setItem('booking_free_access_id', value);
    },

    /**
     * Checkout => Create a reservation
     */  
    sendBookingRequest: function() { 

      var paymentAmountOverride = null;

      // Prepare the request data
      var reservation = $('form[name=reservation_form]').formParams(false);
      if (typeof reservation.complete_action != 'undefined') {
        if (reservation.complete_action != 'pay_now') {
          reservation.payment = 'none';
        }
      }
      // Allows to setup the payment amount using an input type hidden with 
      // name payment_amount_override (deposit or total)
      if (typeof reservation.payment_amount_override !== 'undefined') {
        if (reservation.payment_amount_override === 'deposit') {
          paymentAmountOverride = 'deposit';
        } else if (reservation.payment_amount_override === 'total') {
          paymentAmountOverride = 'total';
        }
      }
      // Prepare phone prefix
      if ($('#customer_phone').length) {
        var countryData = $('#customer_phone').intlTelInput('getSelectedCountryData');
        if (countryData != null) {
          reservation.customer_phone_prefix = countryData.dialCode;
        }
      }
      if ($('#customer_mobile_phone').length) {
        var countryData = $('#customer_mobile_phone').intlTelInput('getSelectedCountryData');
        if (countryData != null) {
          reservation.customer_mobile_phone_prefix = countryData.dialCode;
        }
      }      
      if (!$('.js-mb-delivery-slot').is(':visible')) {
        delete reservation.slot_time_from;
      }
      if (!$('.js-mb-optional-external-driver').is(':visible')) {
        delete reservation.with_optional_external_driver;
      }
      // Control the web hostname to manage the reservation origin
      reservation.web_hostname = window.location.hostname;
      
      // Convert to JSON
      var reservationJSON = JSON.stringify(reservation);
      // Prepare the URL
      var url = commonServices.URL_PREFIX + '/api/booking/frontend/shopping-cart';
      var freeAccessId = this.getShoppingCartFreeAccessId();
      if (freeAccessId) {
        url += '/' + freeAccessId;
      }
      url += '/checkout';
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

      // Authorization => Customer
      var headers = {};
      if (view.login && view.login.model && view.login.model.bearer) {
        headers['Authorization'] = view.login.model.bearer;
      }

      // Request
      var self = this;
      commonLoader.show();
      $.ajax({
            type: 'POST',
            url  : url,
            data : reservationJSON,
            dataType : 'json',
            contentType : 'application/json; charset=utf-8',
            crossDomain: true,
            headers: headers,
            success: function(data, textStatus, jqXHR) {
                // Hide Loader (OK)
                commonLoader.hide();
                // Prepare the connection to the payment page or to the summary
                var payNow = data.pay_now;
                var bookingId = data.free_access_id;
                var payment_method_id = data.payment_method_id;
                // remove the shopping cart id from the session
                model.deleteShoppingCartFreeAccessId();
                model.putBookingFreeAccessId(bookingId);
                if (payNow && payment_method_id != null && payment_method_id != '') {
                    // Notify the event
                    var event = {type: 'newReservationWithPaymentRequested',
                                 data: data};
                    rentEngineMediator.notifyEvent(event);
                    // Go to payment
                    var paymentData = {
                        id: bookingId,
                        payment: model.sales_process.can_pay_deposit ? 'deposit' : 'total', 
                        payment_method_id: payment_method_id
                    }
                    // Allows to override the amount depending
                    if (paymentAmountOverride !== null) {
                      paymentData.payment = paymentAmountOverride;
                    }
                    view.payment(commonServices.URL_PREFIX + '/reserva/pagar',
                                 bookingId, 
                                 paymentData);
                }
                else {
                    // Notify the event
                    var event = {type: 'newReservationRequested',
                                 data: data};
                    rentEngineMediator.notifyEvent(event);
                    // Go to summary          
                    view.gotoSummary(bookingId);
                }
            },
            error: function(data, textStatus, jqXHR) {
                // Allow to send the form again
                $('form[name=reservation_form] button[type=submit]').removeAttr('disabled');
                model.reservationFormSubmitted = false;
                // Hide Loader (ERROR)
                commonLoader.hide();
                // Check the error
                if (data && typeof data.responseJSON !== 'undefined' && typeof data.responseJSON.code !== 'undefined') {
                  if (data.responseJSON.code === 'CRBOOK002' && data.responseJSON.error !== 'undefined') {
                    // Not available
                    alert(data.responseJSON.error);
                  }
                  else {
                    alert(i18next.t('complete.createReservation.error'));
                  }
                }
                else {
                  alert(i18next.t('complete.createReservation.error'));
                }
            }
        });

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
    }
  };

  var controller = { // THE CONTROLLER

      customerTypeChanged: function(customerType) {

        if (customerType == 'individual') {
          $('.mybooking_customer_legal_entity').hide();
          $('.mybooking_customer_individual').show();
        }
        else {
          $('.mybooking_customer_individual').hide();
          $('.mybooking_customer_legal_entity').show();
        }

      },

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

      extraDetailIconClick: function(extraCode) {
          model.loadExtra(extraCode);
      },

      applyPromotionCodeBtnClick: function(promotionCode) {
          model.applyPromotionCode(promotionCode);
      },

      sendReservationButtonClick: function() {

          // Form data
          const reservationForm = $('form[name=reservation_form]').formParams(false);

          rentEngineMediator.onCheckout( model.coverages, 
                                         model.extras,
                                         model.shopping_cart,
                                         reservationForm);
      
      },

      completeActionChange: function() {
          
          if ($('input[name=complete_action]:checked').val() === 'pay_now') {
            $('#request_reservation_container').hide();
            $('#payment_on_delivery_container').hide();
            $('#payment_now_container').show();
          }
          else if ($('input[name=complete_action]:checked').val() === 'pay_on_delivery') {
            $('#request_reservation_container').hide();
            $('#payment_on_delivery_container').show();
            $('#payment_now_container').hide();
          }
          else if ($('input[name=complete_action]:checked').val() === 'request_reservation') {
            $('#payment_method_select').val('');
            $('#request_reservation_container').show();
            $('#payment_on_delivery_container').hide();
            $('#payment_now_container').hide();
          }

      },

      paymentMethodSelectChange: function(value) {
        $('input[name=payment]').val(value);
      },

      /**
     * Modal video toogle TODO refactor (is similar to product video method)
     */
    extraVideoonClick: function(type) {
      const extraGallery = $('.mybooking-modal_extra-gallery');
      const extraImage = extraGallery.find('.mybooking-carousel-inner');
      const extraImageBtn = extraGallery.find('[data-target="image"]');
      const extraVideoBtn = extraGallery.find('[data-target="video"]');

      const result = tmpl('script_transfer_extra_detail_video')({
        extra: model.extraDetail
      });

      switch (type) {
        case 'image':
          extraVideoBtn.show();

          $('#mybooking_transfer_extra_detail_video').html('');

          extraImage.show();
          extraImageBtn.hide();
          break;
      
        default:
          extraImage.hide();
          extraImageBtn.show();

          $('#mybooking_transfer_extra_detail_video').html(result);

          extraVideoBtn.hide();
          break;
      }
    }

  };

  var view = { // THE VIEW

    selectorLoaded: false,
    login: null,

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

      // Complements
      if (model.configuration.engineCustomerAccess) {
        this.setupLoginForm();
      }
*/
      // OPTIMIZATION 2024-01-27 END

      // Load shopping cart
      model.loadShoppingCart();
  	},

    /**
     * Setup the login form
     */
    setupLoginForm: function() {
      var self = this;
      // Complete hide
      $('#form-reservation').hide();
      $('#extras_listing').hide();
      $('.reservation_form_container').hide();
      if (document.getElementById('script_complete_complement') && 
          document.getElementById('script_create_account')) {
        // Login form
        var html = tmpl('script_complete_complement')({});
        $('#extras_listing').before(html);
        // Setup password forgotten
        $('.mybooking_login_password_forgotten').on('click', function(){
          var htmlPasswordForgotten = tmpl('script_password_forgotten')({});
          if ($('div.mybooking_password_forgotten_container').length > 0) { // Show in div
            $('div.mybooking_password_forgotten_container').html(htmlPasswordForgotten);
            var passwordForgottenComponent = new PasswordForgottenComponent();
            passwordForgottenComponent.model.addListener('PasswordForgotten', function(event){
              if (event.type === 'PasswordForgotten' && (typeof event.data != 'undefined') && event.data.success === true) {
                $('div.mybooking_password_forgotten_container').empty();
              }
            });
            passwordForgottenComponent.view.init();            
          }
          else { // Show in a modal
            
            // Compatibility with bootstrap modal replacement (from 1.0.0)
            if ($('#modalExtraDetail_MBM').length) {
              $('#modalExtraDetail_MBM .mybooking-modal_title').html('');
              $('#modalExtraDetail_MBM .mybooking-modal_body').html(htmlPasswordForgotten);     
            }
            else {
              $('#modalExtraDetail .modal-title').html('');
              $('#modalExtraDetail .modal-body').html(htmlPasswordForgotten);
            }
            var passwordForgottenComponent = new PasswordForgottenComponent();
            passwordForgottenComponent.model.addListener('PasswordForgotten', function(event){
              if (event.type === 'PasswordForgotten' && (typeof event.data != 'undefined') && event.data.success === true) {
                commonUI.hideModal('#modalExtraDetail');
              }
            });
            passwordForgottenComponent.view.init();
            // Show the modal
            commonUI.showModal('#modalExtraDetail',
                               function(event, modal){ // on Show
                                 setTimeout(function(){  
                                   // Call to the mediator
                                   rentEngineMediator.onShowModal(event, modal);
                                 },50);
                               });
          }
        });
        // Prepare login
        this.login = new Login();
        // Setup event listener
        this.login.model.addListener('login', function(event) {
          if (event.type == 'login' && event.data) {
            if (event.data.success) {
              // Disable login/create account form
              $('form[name=mybooking_select_user_form] input').prop('disabled', true);
              $('form[name=mybooking_login_form] input, form[name=mybooking_login_form] button').prop('disabled', true);
              // Show login message
              if (document.getElementById('script_welcome_customer')) {
                var htmlMessage = tmpl('script_welcome_customer')({i18next: i18next, user: event.data.user});
                $('#reservation_complement_container').append(htmlMessage);
              }
              // Empty password forgotten components
              $('.mybooking_login_password_forgotten').remove();
              if ( $('.mybooking_password_forgotten_container').length > 0) {
                $('.mybooking_password_forgotten_container').empty();        
              }     
              // Remove create account components
              $('.mybooking_rent_create_account_selector_container').remove();
              $('.mybooking_rent_create_account_fields_container').remove();
              // Show the reservation form
              $('#form-reservation').show();
              $('#extras_listing').show();
              $('.customer_component').hide();
              $('.reservation_form_container').show();   
            }         
            else {
              alert(i18next.t('common.invalid_user_password'));
            }
          }
        });
        this.login.view.init();
        $('form[name=mybooking_select_user_form] input[name=registered_customer]').on('change', function(){
          if ($(this).val() === 'true') {
            $('.mybooking_login_form_element').show();
            // Empty password forgotten container
            if ( $('.mybooking_password_forgotten_container').length > 0) {            
              $('.mybooking_password_forgotten_container').empty();
            }            
            $('#form-reservation').hide();
            $('#extras_listing').hide();
            $('.reservation_form_container').hide();
          }
          else {
            $('.mybooking_login_form_element').hide();
            // Empty password forgotten container
            if ( $('.mybooking_password_forgotten_container').length > 0) {            
              $('.mybooking_password_forgotten_container').empty();
            }
            $('#form-reservation').show();
            $('#extras_listing').show();
            $('.reservation_form_container').show();            
          }
        });    
      }

    },

    /**
     * Setup signup form
     */ 
    setupSignupForm: function() {

      var self = this;
      if (document.getElementById('script_create_account')) {
        // Signup form
        var htmlSignup = tmpl('script_create_account');
        $('#payment_detail').before(htmlSignup);
        // Setup create account components
        $('input[name=create_customer_account]').on('change', function(){
          if ($(this).val() === 'true') {
            $('.mybooking_rent_create_account_fields_container').show();
          }
          else {
            $('.mybooking_rent_create_account_fields_container').hide();
          }
        });      
      }

    },

    /**
     * Prepare reservation form
     */ 
    prepareReservationForm: function() {
        // Setup UI
        this.setupReservationForm();
        $('.complete-section-title.customer_component').show();
        $('#form-reservation').show();
        this.setupReservationFormValidation();
        // Setup signup form
        if (model.configuration.engineCustomerAccess) {
          this.setupSignupForm();
        }
    },

    /**
     * Setup the reservation form
     */
    setupReservationForm: function() {

      var connectedUser = false;
      if ( this.login && this.login.model.connectedUser ) {
        connectedUser = true;
      }

      // The reservation form fields are defined in a micro-template
      var locale = model.requestLanguage;
      var localeReservationFormScript = 'script_renting_complete_form_tmpl_'+locale;
      if (locale != null && document.getElementById(localeReservationFormScript)) {
        var reservationForm = tmpl(localeReservationFormScript)({configuration: model.configuration,
                                                                 shopping_cart: model.shopping_cart});
        $('form[name=reservation_form]').html(reservationForm);           
      }
      else if (document.getElementById('script_renting_complete_form_tmpl')) {
        var reservationForm = tmpl('script_renting_complete_form_tmpl')({configuration: model.configuration,
                                                                         shopping_cart: model.shopping_cart});
        $('form[name=reservation_form]').html(reservationForm);                                                                    
      }

      // Load customer classifier
      if (model.configuration.useCustomerClassifier && 
          $('form[name=reservation_form]').find('select[name=customer_classifier_id]').length) {
        model.loadCustomerClassifier();
      }

      // Configure customer type
      $('#customer_type').on('change', function(){
        controller.customerTypeChanged($(this).val());
      });

      // Configure address country

      // Load countries
      var countries = i18next.t('common.countries', {returnObjects: true });
      if (countries instanceof Object) {
        var countryCodes = Object.keys(countries);
        var countriesArray = countryCodes.map(function(value){ 
                                return {id: value, text: countries[value], description: countries[value]};
                             });
      } 
      else {
        var countriesArray = [];
      }

      var values = ['','','','','','','','','']; 
      if (commonServices.jsUseSelect2) {
        // Setup country selector
        var selectors = ['select[name=country]',
                         'select[name=customer_origin_country]',
                         'select[name=driver_address\\[country\\]]',
                         'select[name=driver_origin_country]',
                         'select[name=driver_driving_license_country]',
                         'select[name=additional_driver_1_origin_country]',
                         'select[name=additional_driver_1_driving_license_country]',
                         'select[name=additional_driver_2_origin_country]',
                         'select[name=additional_driver_2_driving_license_country]'];
        console.log(selectors);
        var $countrySelector = null;
        for (var idx=0; idx<selectors.length; idx++) {
          if ($(selectors[idx]).length > 0) { 
            $countrySelector = $(selectors[idx]);    
            if ($countrySelector.length > 0 && $countrySelector.prop('tagName') === 'SELECT' && typeof values[idx] !== 'undefined') {
              $countrySelector.select2({
                width: '100%',
                theme: 'bootstrap4',                  
                data: countriesArray
              });
              // Assign value
              var value = (values[idx] !== null && values[idx] !== '' ? values[idx] : '');
              $countrySelector.val(values[idx]);
              $countrySelector.trigger('change');
            }
          }
        }
      }
      else {
        // Setup country selector
        var selectors = ['country',
                         'customer_origin_country', 
                         'driver_address_country',
                         'driver_origin_country',
                         'driver_driving_license_country',
                         'additional_driver_1_origin_country',
                         'additional_driver_1_driving_license_country',
                         'additional_driver_2_origin_country',
                         'additional_driver_2_driving_license_country'
                        ];
        for (var idx=0; idx<selectors.length; idx++) { 
          var countryElement = document.getElementById(selectors[idx]);
          if (countryElement && countryElement.tagName === 'SELECT') {
            var countriesDataSource = new MemoryDataSource(countriesArray);
            var countryModel = (values[idx] == null ? '' : values[idx])
            var selectorModel = new SelectSelector(selectors[idx],
                countriesDataSource, countryModel, true, i18next.t('complete.reservationForm.select_country'));
          }
        }
      }

      // Configure Telephone with prefix
      //var countryCode = commonUI.intlTelInputCountryCode();
      var countryCode = model.configuration.countryCode;
      if (typeof countryCode === 'undefined' || countryCode == null) {
        countryCode = commonUI.intlTelInputCountryCode(); 
      }

      if ($('#customer_phone').length) {
        $("#customer_phone").intlTelInput({
          initialCountry: countryCode,
          separateDialCode: true,        
          utilsScript: commonServices.phoneUtilsPath,
          preferredCountries: [countryCode]
        });
      }

      if ($("#customer_mobile_phone").length) {
        $("#customer_mobile_phone").intlTelInput({
          initialCountry: countryCode,
          separateDialCode: true,
          utilsScript: commonServices.phoneUtilsPath,
          preferredCountries: [countryCode]
        });
      }

      // Configure driver document id date
      if (document.getElementById('driver_document_id_date_day')) {
        new DateControl(document.getElementById('driver_document_id_date_day'),
                        document.getElementById('driver_document_id_date_month'),
                        document.getElementById('driver_document_id_date_year'),
                        document.getElementById('driver_document_id_date'),
                        commonSettings.language(model.requestLanguage));
      }
      if (document.getElementById('driver_document_id_expiration_date_day')) {
        new DateControl(document.getElementById('driver_document_id_expiration_date_day'),
                        document.getElementById('driver_document_id_expiration_date_month'),
                        document.getElementById('driver_document_id_expiration_date_year'),
                        document.getElementById('driver_document_id_expiration_date'),
                        commonSettings.language(model.requestLanguage),
                        undefined, 'future');
      }
      // Configure driver date of birth and driver license date
      if (document.getElementById('driver_date_of_birth_day')) {
        new DateControl(document.getElementById('driver_date_of_birth_day'),
                        document.getElementById('driver_date_of_birth_month'),
                        document.getElementById('driver_date_of_birth_year'),
                        document.getElementById('driver_date_of_birth'),
                        commonSettings.language(model.requestLanguage));
      }
      // Configure driver driving license date 
      if (document.getElementById('driver_driving_license_date_day')) {
        new DateControl(document.getElementById('driver_driving_license_date_day'),
                        document.getElementById('driver_driving_license_date_month'),
                        document.getElementById('driver_driving_license_date_year'),
                        document.getElementById('driver_driving_license_date'),
                        commonSettings.language(model.requestLanguage));
      }
      // Configure driver driving license expiration date 
      if (document.getElementById('driver_driving_license_expiration_date_day')) {
        new DateControl(document.getElementById('driver_driving_license_expiration_date_day'),
                        document.getElementById('driver_driving_license_expiration_date_month'),
                        document.getElementById('driver_driving_license_expiration_date_year'),
                        document.getElementById('driver_driving_license_expiration_date'),
                        commonSettings.language(model.requestLanguage),
                        undefined, 'future');
      }

      // Configure additional driver driving license date 
      if (document.getElementById('additional_driver_1_driving_license_date_day')) {
        new DateControl(document.getElementById('additional_driver_1_driving_license_date_day'),
                        document.getElementById('additional_driver_1_driving_license_date_month'),
                        document.getElementById('additional_driver_1_driving_license_date_year'),
                        document.getElementById('additional_driver_1_driving_license_date'),
                        commonSettings.language(model.requestLanguage));
      }
      if (document.getElementById('additional_driver_2_driving_license_date_day')) {
        new DateControl(document.getElementById('additional_driver_2_driving_license_date_day'),
                        document.getElementById('additional_driver_2_driving_license_date_month'),
                        document.getElementById('additional_driver_2_driving_license_date_year'),
                        document.getElementById('additional_driver_2_driving_license_date'),
                        commonSettings.language(model.requestLanguage));
      }

      // Reservation Form is complete
      rentEngineMediator.onCompleteSetupReservationForm();

    },

    /**
     * Setup the reservation form validation
     */ 
    setupReservationFormValidation: function() {

        commonSettings.appendValidators();
        jQuery.extend(jQuery.validator.messages, {
            required: i18next.t('complete.reservationForm.validations.fieldRequired')
        });
        
        $('form[name=reservation_form]').validate(
            {
                ignore: '', // To be able to validate driver date of birth
                
                submitHandler: function(form) {
                    console.log('COMPLETE - submit');
                    if (!model.reservationFormSubmitted) {
                      model.reservationFormSubmitted = true;
                      // Disable submit to avoid double click
                      $('form[name=reservation_form] button[type=submit]').attr('disabled', 'disabled');
                      // Hide errors
                      $('#reservation_error').hide();
                      $('#reservation_error').html('');
                      controller.sendReservationButtonClick();
                    }
                    return false;
                },

                invalidHandler : function (form, validator) {
                    console.log('COMPLETE - invalidHandler');
                    // Enable submit again
                    $('form[name=reservation_form] button[type=submit]').removeAttr('disabled');
                    model.reservationFormSubmitted = false; 
                    // Show errors
                    $('#reservation_error').html(i18next.t('complete.reservationForm.errors'));
                    $('#reservation_error').show();
                },

                rules : {
                    'customer_classifier_id': {
                      required: '#customer_classifier_id:visible'
                    },
                    'customer_type': {
                      required: '#customer_type:visible'
                    },
                    'customer_company_name': {
                      required: '#customer_company_name:visible',
                    },
                    'customer_company_contact_name': {
                      required: '#customer_company_contact_name:visible',
                    },
                    'customer_name': {
                      required: '#customer_name:visible',
                    },
                    'customer_surname' : {
                      required: '#customer_surname:visible',
                    },
                    'customer_email' : {
                        required: '#customer_email:visible',
                        email: '#customer_email:visible'
                    },
                    'confirm_customer_email': {
                        required: '#confirm_customer_email:visible',
                        email: '#confirm_customer_email:visible',
                        equalTo : '#customer_email'
                    },
                    'customer_phone': {
                        required: '#customer_phone:visible',
                        minlength: 9
                    },
                    'customer_document_id': {
                      required: '#customer_document_id[required]:visible'
                    },
                    'street': {
                        required: '#street[required]:visible'
                    },
                    'city': {
                        required: '#city[required]:visible'
                    },    
                    'state': {
                        required: '#state[required]:visible'
                    }, 
                    'zip': {
                        required: '#zip[required]:visible'
                    }, 
                    'country': {
                        required: '#country[required]:visible'
                    },
                    'driver_document_id_date_day': {
                      required: "#driver_document_id_date_day[required]:visible"
                    },
                    'driver_document_id_date_month': {
                      required: "#driver_document_id_date_month[required]:visible"
                    },
                    'driver_document_id_date_year': {
                      required: "#driver_document_id_date_year[required]:visible"
                    },
                    'driver_document_id_date': {
                      required: "#driver_document_id_date[required]:visible"
                    },
                    'driver_document_id_expiration_date_day': {
                      required: "#driver_document_id_expiration_date_day[required]:visible"
                    },
                    'driver_document_id_expiration_date_month': {
                      required: "#driver_document_id_expiration_date_month[required]:visible"
                    },
                    'driver_document_id_expiration_date_year': {
                      required: "#driver_document_id_expiration_date_year[required]:visible"
                    },
                    'driver_document_id_expiration_date': {
                      required: "#driver_document_id_expiration_date[required]:visible"
                    },
                    'driver_date_of_birth_day': {
                      required: "#driver_date_of_birth_day[required]:visible"
                    },
                    'driver_date_of_birth_month': {
                      required: "#driver_date_of_birth_month[required]:visible"
                    },
                    'driver_date_of_birth_year': {
                      required: "#driver_date_of_birth_year[required]:visible"
                    },
                    'driver_date_of_birth': {
                        required: "#driver_date_of_birth[required]:visible"
                    },
                    'driver_driving_license_date_day': {
                      required: "#driver_driving_license_date_day[required]:visible"                       
                    },
                    'driver_driving_license_date_month': {
                      required: "#driver_driving_license_date_month[required]:visible"                         
                    },
                    'driver_driving_license_date_year': {
                      required: "#driver_driving_license_date_year[required]:visible"                     
                    },
                    'driver_driving_license_date': {
                      required: "#driver_driving_license_date[required]:visible"                        
                    },
                    'additional_driver_1_driving_license_date_day': {
                      //required: "#additional_driver_1_driving_license_date_day:visible"
                      required: function() {
                        if ($('#additional_driver_1_driving_license_date_day').length) {
                          if ($('#additional_driver_1_driving_license_date_day').attr('required')) {
                            return true;
                          }
                        }
                        return false;
                      }  
                    },
                    'additional_driver_1_driving_license_date_month': {
                      //required: "#additional_driver_1_driving_license_date_month:visible"
                      required: function() {
                        if ($('#additional_driver_1_driving_license_date_month').length) {
                          if ($('#additional_driver_1_driving_license_date_month').attr('required')) {
                            return true;
                          }
                        }
                        return false;
                      }                       
                    },
                    'additional_driver_1_driving_license_date_year': {
                      //required: "#additional_driver_1_driving_license_date_year:visible"
                      required: function() {
                        if ($('#additional_driver_1_driving_license_date_year').length) {
                          if ($('#additional_driver_1_driving_license_date_year').attr('required')) {
                            return true;
                          }
                        }
                        return false;
                      }                        
                    },
                    'additional_driver_1_driving_license_date': {
                        //required: "#additional_driver_1_driving_license_date:visible"
                        required: function() {
                          if ($('#additional_driver_1_driving_license_date').length) {
                            if ($('#additional_driver_1_driving_license_date').attr('required')) {
                              return true;
                            }
                          }
                          return false;
                        }                             
                    },
                    'additional_driver_2_driving_license_date_day': {
                      //required: "#additional_driver_2_driving_license_date_day:visible"
                      required: function() {
                        if ($('#additional_driver_2_driving_license_date_day').length) {
                          if ($('#additional_driver_2_driving_license_date_day').attr('required')) {
                            return true;
                          }
                        }
                        return false;
                      }  
                    },
                    'additional_driver_2_driving_license_date_month': {
                      //required: "#additional_driver_2_driving_license_date_month:visible"
                      required: function() {
                        if ($('#additional_driver_2_driving_license_date_month').length) {
                          if ($('#additional_driver_2_driving_license_date_month').attr('required')) {
                            return true;
                          }
                        }
                        return false;
                      }                       
                    },
                    'additional_driver_2_driving_license_date_year': {
                      //required: "#additional_driver_2_driving_license_date_year:visible"
                      required: function() {
                        if ($('#additional_driver_2_driving_license_date_year').length) {
                          if ($('#additional_driver_2_driving_license_date_year').attr('required')) {
                            return true;
                          }
                        }
                        return false;
                      }                        
                    },
                    'additional_driver_2_driving_license_date': {
                        //required: "#additional_driver_2_driving_license_date:visible"
                        required: function() {
                          if ($('#additional_driver_2_driving_license_date').length) {
                            if ($('#additional_driver_2_driving_license_date').attr('required')) {
                              return true;
                            }
                          }
                          return false;
                        }                             
                    },                    
                    'number_of_adults': {
                        required: '#number_of_adults:visible'               
                    },
                    'conditions_read_request_reservation' :  {
                        required: '#conditions_read_request_reservation:visible'
                    },
                    'conditions_read_payment_on_delivery' :  {
                        required: '#conditions_read_payment_on_delivery:visible'
                    },
                    'conditions_read_pay_now' :  {
                        required: '#conditions_read_pay_now:visible'
                    },
                    'privacy_read_request_reservation' :  {
                      required: '#privacy_read_request_reservation:visible'
                    },
                    'privacy_read_payment_on_delivery' :  {
                        required: '#privacy_read_payment_on_delivery:visible'
                    }, 
                    'privacy_read_pay_now' :  {
                        required: '#privacy_read_pay_now:visible'
                    },                                            
                    'payment_method_select': {
                        required: 'input[name=payment_method_select]:visible'
                    },
                    'account_password': {
                        required: '#account_password:visible',
                        pwcheck: '#account_password:visible',
                        minlength: 8
                    },
                    'slot_time_from': {
                        required: '#slot_time_from:visible'
                    },
                    'with_optional_external_driver': {
                        required: '#with_optional_external_driver:visible'
                    },
                    'flight_company': {
                      required: function(){
                        return $('#flight_company').attr('required') === 'required' && model.isAirportDataRequired;
                      }
                    },
                    'flight_number': {
                      required: function() {
                        return $('#flight_number').attr('required') === 'required' && model.isAirportDataRequired;
                      }
                    },
                    'flight_time': {
                      required: function() {
                        return $('#flight_time').attr('required') === 'required' && model.isAirportDataRequired;
                      }
                    },
                    'destination_accommodation': {
                      required: function() {
                        return $('#destination_accommodation').attr('required') === 'required' || model.isHotelDataRequired;
                      }
                    }
                },

                messages : {
                    'customer_classifier_id': {
                      required: i18next.t('complete.reservationForm.validations.fieldRequired')
                    },
                    'customer_type': {
                      required: i18next.t('complete.reservationForm.validations.fieldRequired')
                    },
                    'customer_company_name': {
                      required: i18next.t('complete.reservationForm.validations.fieldRequired')
                    },
                    'customer_company_contact_name': {
                      required: i18next.t('complete.reservationForm.validations.fieldRequired')
                    },
                    'customer_name': {
                      required: i18next.t('complete.reservationForm.validations.customerNameRequired')
                    },
                    'customer_surname' : {
                      required: i18next.t('complete.reservationForm.validations.customerSurnameRequired')
                    },
                    'customer_email' : {
                        required: i18next.t('complete.reservationForm.validations.customerEmailRequired'),
                        email: i18next.t('complete.reservationForm.validations.customerEmailInvalidFormat'),
                    },
                    'confirm_customer_email': {
                        'required': i18next.t('complete.reservationForm.validations.customerEmailConfirmationRequired'),
                        'email': i18next.t('complete.reservationForm.validations.customerEmailInvalidFormat'),
                        'equalTo': i18next.t('complete.reservationForm.validations.customerEmailConfirmationEqualsEmail')
                    },
                    'customer_phone': {
                        'required': i18next.t('complete.reservationForm.validations.customerPhoneNumberRequired'),
                        'minlength': i18next.t('complete.reservationForm.validations.customerPhoneNumberMinLength')
                    },
                    'customer_document_id': {
                        'required': i18next.t('complete.reservationForm.validations.fieldRequired')
                    },
                    'street': {
                        'required': i18next.t('complete.reservationForm.validations.fieldRequired')
                    },
                    'city': {
                        'required': i18next.t('complete.reservationForm.validations.fieldRequired')
                    },    
                    'state': {
                        'required': i18next.t('complete.reservationForm.validations.fieldRequired')
                    }, 
                    'zip': {
                        'required': i18next.t('complete.reservationForm.validations.fieldRequired')
                    }, 
                    'country': {
                        'required': i18next.t('complete.reservationForm.validations.fieldRequired')
                    },
                    'number_of_adults': {
                        'required': i18next.t('complete.reservationForm.validations.numberOfAdultsRequired')
                    },
                    'conditions_read_request_reservation': {
                        'required': i18next.t('complete.reservationForm.validations.conditionsReadRequired')
                    },                       
                    'conditions_read_payment_on_delivery': {
                        'required': i18next.t('complete.reservationForm.validations.conditionsReadRequired')
                    },   
                    'conditions_read_pay_now': {
                        'required': i18next.t('complete.reservationForm.validations.conditionsReadRequired')
                    },
                    'privacy_read_request_reservation' :  {
                      'required': i18next.t('complete.reservationForm.validations.privacyPolicyRequired')
                    },
                    'privacy_read_payment_on_delivery' :  {
                        'required': i18next.t('complete.reservationForm.validations.privacyPolicyRequired')
                    }, 
                    'privacy_read_pay_now' :  {
                        'required': i18next.t('complete.reservationForm.validations.privacyPolicyRequired')
                    },                                      
                    'payment_method_select': {
                        'required': i18next.t('complete.reservationForm.validations.selectPaymentMethod')
                    },
                    'account_password': {
                        'required': i18next.t('complete.reservationForm.validations.fieldRequired'),
                        'pwcheck': i18next.t('complete.reservationForm.validations.passwordCheck'),
                        'minlength': i18next.t('complete.reservationForm.validations.minLength', {minlength: 8}),
                    },
                    'slot_time_from': {
                        required: i18next.t('complete.reservationForm.validations.fieldRequired')
                    },
                    'with_optional_external_driver': {
                        required: i18next.t('complete.reservationForm.validations.fieldRequired')
                    },             
                    'flight_company': {
                      required: i18next.t('complete.reservationForm.validations.fieldRequired')
                    },
                    'flight_number': {
                      required: i18next.t('complete.reservationForm.validations.fieldRequired')
                    },
                    'flight_time': {
                      required: i18next.t('complete.reservationForm.validations.fieldRequired')
                    },
                    'destination_accommodation': {
                      required: i18next.t('complete.reservationForm.validations.fieldRequired')
                    }
                },

                errorPlacement: function (error, element) {
                    if (element.attr('type') == 'radio') {
                      if (element.parent() && element.parent().parent()) {
                        error.insertAfter(element.parent().parent());
                      }
                      else {
                        error.insertAfter(element.parent());
                      }                    
                    }
                    else if (element.attr('name') == 'conditions_read_request_reservation' || 
                      element.attr('name') == 'conditions_read_payment_on_delivery' || 
                      element.attr('name') == 'conditions_read_pay_now' ||
                      element.attr('name') == 'privacy_read_request_reservation'  || 
                      element.attr('name') == 'privacy_read_payment_on_delivery'  || 
                      element.attr('name') == 'privacy_read_pay_now')
                    { 
                        error.insertAfter(element.parent());
                        element.parent().css('display', 'block');
                    }
                    else if (element.attr('name') == 'payment_method_select') {
                        error.insertAfter(document.getElementById('payment_method_select_error'));
                    }
                    else if (element.attr('name') == 'customer_classifier_id' && 
                             $('#customer_classifier_id + span.select2-container').length) {
                        error.insertAfter('#customer_classifier_id + span.select2-container');
                    }
                    else if (element.attr('name') == 'slot_time_from' && 
                             $('#slot_time_from + span.select2-container').length) {
                        error.insertAfter('#slot_time_from + span.select2-container');
                    }
                    else if (element.attr('name') == 'with_optional_external_driver' && 
                             $('#with_optional_external_driver + span.select2-container').length) {
                        error.insertAfter('#with_optional_external_driver + span.select2-container');
                    }
                    else if (element.attr('name') == 'driver_driving_license_country' && 
                             $('#driver_driving_license_country + span.select2-container').length) {
                        error.insertAfter('#driver_driving_license_country + span.select2-container');
                    }    
                    else if (element.attr('name') == 'country' && 
                             $('#country + span.select2-container').length) {
                        error.insertAfter('#country + span.select2-container');
                    }
                    else
                    {
                      error.insertAfter(element);
                    }

                },

                errorClass : 'form-reservation-error'

            }
        );

    },

    /**
     * Configuration promotion code
     */
    setupPromotionCode: function() {

      if ( $('#apply_promotion_code_btn').length > 0) {
        $('#apply_promotion_code_btn').off('click');
        $('#apply_promotion_code_btn').on('click', function() {
           controller.applyPromotionCodeBtnClick($('#promotion_code').val());
        });
      }

    },

    /**
     * Setup optional external driver
     */ 
    setupOptionalExternalDriver: function(doesApplyExternalDriver) {
      if (doesApplyExternalDriver) {
        if (!$('.js-mb-delivery-slot-skipper-container').is(':visible')) {
          $('.js-mb-delivery-slot-skipper-container').show();
        }
        $('.js-mb-optional-external-driver').show();
        if (!$('form[name=reservation_form] select[name=with_optional_external_driver]').data('select2')) {
          $('form[name=reservation_form] select[name=with_optional_external_driver]').select2({
            placeholder: i18next.t('common.selectOption'),
            allowClear: true,
            width: '100%',
            theme: 'bootstrap4'
          });
        }
      }
      else {
        $('.js-mb-optional-external-driver').hide();        
      }

    },

    /**
     * Delivery slots
     */ 
    setupDeliverySlots: function() {

      if (!$('.js-mb-delivery-slot-skipper-container').is(':visible')) {
        $('.js-mb-delivery-slot-skipper-container').show();
      }
      $('.js-mb-delivery-slot').show();

      // Prepare hours available End Point call
      var url = commonServices.URL_PREFIX + '/api/booking/frontend/delivery-slots/hours-available';
      var urlParams = []
      if (commonServices.apiKey && commonServices.apiKey != '') {
        urlParams.push('api_key='+commonServices.apiKey);
      }  
      if (model.requestLanguage != null) {
        urlParams.push('lang='+model.requestLanguage);
      }
      if (model.shopping_cart) {
        urlParams.push('date='+moment(model.shopping_cart.date_from).format('YYYY-MM-DD'));
        urlParams.push('time='+model.shopping_cart.time_from); 
        if (model.shopping_cart.date_from === model.shopping_cart.date_to) {
          urlParams.push('minutes_duration='+model.shopping_cart.total_minutes);
        }
        if (model.shopping_cart.items && model.shopping_cart.items.length === 1) {
          var product = model.shopping_cart.items[0].item_id;
          urlParams.push('product='+product);
        }
        else {
          if (model.configuration.pickupReturnPlace) {
            if (model.shopping_cart.pickup_place && model.shopping_cart.pickup_place !== '') {
              urlParams.push('place='+model.shopping_cart.pickup_place);
            }
          }
          else if (model.shopping_cart.rental_location_code && model.shopping_cart.rental_location_code !== '') {
            urlParams.push('rental_location_code='+model.shopping_cart.rental_location_code);
          }
        }
      }
      if (urlParams.length > 0) {
        url += '?';
        url += urlParams.join('&');
      }
      // Setup select2 component
      $('form[name=reservation_form] select[name=slot_time_from]').select2({ width: '100%',
              ajax: {
                placeholder: i18next.t('common.selectOption'),
                allowClear: true,
                url: url,
                theme: 'bootstrap4',
                processResults: function(data) {
                  var transformedData = [];
                  for (var idx=0; idx<data.length; idx++) {
                    var element = {
                      'text': data[idx].text,
                      'id': data[idx].value
                    }
                    transformedData.push(element);
                  }
                  return {results: transformedData};
                },

              }
            });

    },

    // -------------------- View Updates

    /**
     * Update customer classifier
     */ 
    updateCustomerClassifiers: function() {
      var $customerClassifierSelector = null;
      if (commonServices.jsUseSelect2) {
        $customerClassifierSelector = $('#customer_classifier_id');
        if ($customerClassifierSelector.length > 0) {
          $customerClassifierSelector.select2({
            placeholder: i18next.t('common.selectOption'),
            allowClear: true,
            width: '100%',
            theme: 'bootstrap4',                  
            data: model.customerClassifiers
          });
          $customerClassifierSelector.val('');
          $customerClassifierSelector.trigger('change');
        }
      }
      else {
        // Setup customer classifier
        if (document.getElementById('customer_classifier_id')) {
          var customerClassifierDataSource = new MemoryDataSource(model.customerClassifiers);
          var customerClassifierModel = null;
          var selectorModel = new SelectSelector('customer_classifier_id',
                                                 customerClassifierDataSource, 
                                                 customerClassifierModel, 
                                                 true, 
                                                 i18next.t('common.selectOption'));
        }
      }

    },

    /**
     * Updates the shopping card when the shopping cart is loaded
     */
    updateShoppingCart: function() { // Updates the shopping cart

      this.prepareReservationForm();

    	// Show the product information   
      this.updateProducts();
      // Update the summary
      this.updateShoppingCartSummary();
      // Update the extras
      this.updateExtras();
      // Update the payment
      this.updatePayment();
      // Setup Promotion Code         
      if (model.configuration.promotionCode) {
        this.setupPromotionCode();
      }
      // Setup slot
      if (model.configuration.deliverySlots) {
        this.setupDeliverySlots();
      }
      // External driver (skipper)
      this.setupOptionalExternalDriver(model.shopping_cart.apply_optional_external_driver);

    },

    /**
     * Updates the shopping cart when the user changes an Extra
     */
    updateShoppingCartExtra: function(extraCode, quantity) {

      // Updates the summary
      this.updateShoppingCartSummary();

      // External driver (skipper)
      this.setupOptionalExternalDriver(model.shopping_cart.apply_optional_external_driver);

      // Update the extra
      if (model.isCoverage(extraCode)) {
        this.updateExtras();
      }
      else {
        this.updateExtra(extraCode, quantity);
      }
      // Update the payment
      this.updatePayment();

      // Setup Promotion Code         
      if (model.configuration.promotionCode) {
        this.setupPromotionCode();
      }

    },


    /**
     * Updates the shopping card when the customer applies a promotion code
     */
    updateShoppingCartPromotionCode: function() { 

      // Show the product information   
      this.updateProducts();
      // Update the summary
      this.updateShoppingCartSummary();
      // Update the payument
      this.updatePayment();

      $('#promotion_code').attr('disabled', 'true');
      $('#apply_promotion_code_btn').attr('disabled', 'true');

    },

    /**
     * Updates the shopping cart summary
     */
    updateShoppingCartSummary: function() { // Updates the shopping cart summary (total)
      // Summary sticky
      if (document.getElementById('script_reservation_summary_sticky')) {
        var reservationDetailSticky = tmpl('script_reservation_summary_sticky')({
          shopping_cart: model.shopping_cart,
          configuration: model.configuration
        });
        $('#reservation_detail_sticky').html(reservationDetailSticky);
      }

      // Summary
      if (document.getElementById('script_reservation_summary')) {
        var reservationDetail = tmpl('script_reservation_summary')({
          shopping_cart: model.shopping_cart, // Retrocompatibility in override complete views
          booking: model.shopping_cart,
          configuration: model.configuration
        });
        $('#reservation_detail').html(reservationDetail);
      }

      if ( model.configuration.multipleProductsSelection && document.getElementById('script_mybooking_summary_product_detail_table')) {
        var reservationTableDetail = tmpl('script_mybooking_summary_product_detail_table')({
          bookings: model.shopping_cart.items,
          booking: model.shopping_cart,
          configuration: model.configuration
        });
        $('#mybooking_summary_product_detail_table').html(reservationTableDetail);
      }
      
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
              // Show the wizard
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

    },

    // -------------------- View Updates Support    

    /**
     * Update the products
     */
    updateProducts: function() {

      if (document.getElementById('script_product_detail')) {  
        if (!$('#script_product_detail').is(':empty')) {
          var productInfo = tmpl('script_product_detail')(
                        {configuration: model.configuration, 
                         shopping_cart: model.shopping_cart});
          $('#selected_product').html(productInfo);
        }
      }

    },

    /**
     * Update and extra
     */
    updateExtra: function(extraCode, quantity) {

      // Button add / remove extra quantity
      $('.extra-input[data-extra-code='+extraCode+']').val(quantity);

      // Button extra toggle
      if (quantity == 0) {
        $('.extra-check-button[data-extra-code='+extraCode+']').removeClass('extra-selected');
      }
      else {
        $('.extra-check-button[data-extra-code='+extraCode+']').addClass('extra-selected');
      }

    },

    /**
     * Updates all extras
     */
    updateExtras: function() { 

        if (document.getElementById('script_detailed_extra')) {
          // Show the extras
          var result = tmpl('script_detailed_extra')({extras:model.extras,
                                                      coverages: model.coverages,
                                                      configuration: model.configuration,   
                                                      extrasInShoppingCart: model.getShoppingCartExtrasQuantities(),
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
              console.log(extraQuantity);
              console.log(maxQuantity);
              if (extraQuantity < maxQuantity) {
                extraQuantity++;     
                controller.btnPlusExtraClicked(extraCode, extraQuantity);
              }
          });  

          // Bind the event to show detailed extra
          $('.js-extra-info-btn').bind('click', function(){
            controller.extraDetailIconClick($(this).attr('data-extra'));
          });
          // Bind the event to show video
          $('.mybooking-detail_modal').on('click', '.js-extra-toogle-video', function(event) {
            const target = $(event.target).attr('data-target');

            controller.extraVideoonClick(target);
          });
        }

    },

    /**
     * Updates the payment
     */
    updatePayment: function() {
      var paymentInfo = tmpl('script_payment_detail')(
                    {sales_process: model.sales_process,
                     shopping_cart: model.shopping_cart,
                     configuration: model.configuration,
                     i18next: i18next });
      $('#payment_detail').html(paymentInfo);

      // Choose complete action between different options:
      //  - request reservation
      //  - pay on delivery
      //  - pay now
      if ($('input[name=complete_action]').length > 0) {
        $('input[name=complete_action]').bind('change', function() {
           controller.completeActionChange();
        });
      }
      // Choose between different payment methods
      if ($('.payment_method_select').length) {
          $('.payment_method_select').unbind('change');
          $('.payment_method_select').bind('change', function(){
            controller.paymentMethodSelectChange($(this).val());
          });
      }
    },

    // -------------------- Show extra detail    

    showExtraDetail: function() {
      if (document.getElementById('script_extra_modal')) {
        var result = tmpl('script_extra_modal')({
                        extra: model.extraDetail
                      });
        // Compatibility with bootstrap modal replacement (from 1.0.0)
        if ($('#modalExtraDetail_MBM').length) {
          $('#modalExtraDetail_MBM .modal-extra-detail-title').html(model.extraDetail.name);
          $('#modalExtraDetail_MBM .modal-extra-detail-content').html(result);       
        }
        else {
          $('#modalExtraDetail .modal-extra-detail-title').html(model.extraDetail.name);
          $('#modalExtraDetail .modal-extra-detail-content').html(result);                 
        }

        // Show the product in a modal
        commonUI.showModal('#modalExtraDetail', function(event, modal){ // On Show
                                                  setTimeout(function(){ 
                                                    if ($('.mybooking-carousel-inner').length) {  
                                                      commonUI.showSlider('.mybooking-carousel-inner');
                                                    }
                                                    // Call to the mediator
                                                    rentEngineMediator.onShowModal(event, modal);
                                                  }, 50);
                                                },
                                                function(event, modal) { // On hide
                                                  commonUI.pauseSlider('.mybooking-carousel-inner');
                                                  commonUI.destroySlider('.mybooking-carousel-inner');
                                                }  
                                                );
      }      
    },

    // -------------------- Go to payment
    
    /**
     * payment
     */
    payment: function(url, bookingId, paymentData) {

      var summaryUrl = commonServices.summaryUrl;

      // Append the id querystring
      if (summaryUrl.indexOf('?') > 0) {
        summaryUrl += '&';
      }
      else {
        summaryUrl += '?';
      }
      summaryUrl += 'id=';
      summaryUrl += bookingId;      

      // Add the summary_url to the paymentData
      if (commonServices.company && commonServices.company !== '') {
        paymentData.summary_url = summaryUrl;
      }

      rentEngineMediator.onNewReservationPayment(url, summaryUrl, paymentData);

    },


    /**
     * Go to payment
     */
    gotoPayment: function(url, paymentData) {

      $.form(url, paymentData, 'POST').submit();

    },


    // -------------------- Go to summary
    
    /**
     * Go to Summary page
     */
    gotoSummary: function(bookingId) {

      var theUrl = commonServices.summaryUrl;

      if (theUrl && theUrl !== '') {
        // Append the id querystring
        if (theUrl.indexOf('?') > 0) {
          theUrl += '&';
        }
        else {
          theUrl += '?';
        }
        theUrl += 'id=';
        theUrl += bookingId;
        var parameters = {id: bookingId};
        // Append the company (single site for multiple companies)
        if (commonServices.company && commonServices.company !== '') {
          parameters.company = commonServices.company;
        }
        $.form(commonServices.summaryUrl, parameters, 'GET').submit();
        //window.location.href = theUrl;
      }

    },

    // -------------------- Mediator interaction

    /**
     * Activate the checkout
     * 
     * This is a connection point with extensions using the mediator. In case of a custom
     * validation, the extension can call this method to activate the checkout and allow the
     * user to submit the reservation form again. This necessary because when the user submits
     * the form, the submit button is disabled to avoid double click.
     * 
     * It is not used directly in the standard flow. Just for extensions with the mediator
     */
    activateCheckout: function() {
      // Enable submit => remove disabled
      $('form[name=reservation_form] button[type=submit]').removeAttr('disabled');
      model.reservationFormSubmitted = false;
    }

  };

  // Check if it is a booking recorded in order to load summary page
  var shoppingCartId = model.getShoppingCartFreeAccessId();
  if (shoppingCartId == null) {
    // Not shoppingcart in session => Try if it was a booking
    var bookingId = model.getBookingFreeAccessId();
    if (bookingId != null) {
      window.location.href = commonServices.summaryUrl + '?id=' + bookingId;
    }
  }

  // Prepare the mediator
  var rentComplete = {
    model: model,
    controller: controller,
    view: view
  }
  rentEngineMediator.setComplete( rentComplete );

  // The loader is show on start and hidden after the result of
  // the search has been rendered (in model.loadShoppingCart)
  commonLoader.show();
  
  // OPTIMIZATION 2024-01-27 START  
  // Load the settings
  // model.loadSettings();
  view.init();
  // OPTIMIZATION 2024-01-27 END

});
