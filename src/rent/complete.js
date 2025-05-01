/* eslint-disable camelcase */
/* eslint-disable max-len */
require(['jquery', 
         'commonServices', 'commonSettings', 'commonTranslations', 'commonLoader', 'commonUI',
         'i18next','ysdtemplate','YSDDateControl', 
         './selector/modify_reservation_selector', './selector-wizard/selector_wizard', 'select2', 
         'YSDMemoryDataSource','YSDSelectSelector', './mediator/rentEngineMediator', '../profile/Login',
         '../profile/PasswordForgottenComponent', 'moment',
         './customer-driver-data/CustomerDriverDataComponent',
         'jquery.i18next', 'jquery.formparams', 'jquery.form',
          'jquery.validate', 'jquery.ui', 'jquery.ui.datepicker-es',
         'jquery.ui.datepicker-en', 'jquery.ui.datepicker-ca', 'jquery.ui.datepicker-it',
         'jquery.ui.datepicker.validation'],
       function($, 
                commonServices, commonSettings, commonTranslations, commonLoader, commonUI,
                i18next, tmpl, DateControl, selector, selectorWizard, select2,
                MemoryDataSource, SelectSelector, rentEngineMediator, Login, PasswordForgottenComponent, moment,
                CustomerDriverDataComponent) {

  const model = { // THE MODEL
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
      const self = this;
      let url = commonServices.URL_PREFIX + '/api/booking/frontend/customer-classifier';
      const urlParams = [];
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

      // Request
      $.ajax({
        type: 'GET',
        url: url,
        dataType: 'json',
        success: function(data, textStatus, jqXHR) {
          self.customerClassifiers = data;
          for (let idx=0;idx<self.customerClassifiers.length;idx++){
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

      const shoppingCartExtras = {};

      if (this.shopping_cart != null) {
          for (let idx=0;idx<this.shopping_cart.extras.length;idx++) {
            shoppingCartExtras[this.shopping_cart.extras[idx].extra_id] = this.shopping_cart.extras[idx].quantity;
          }
      }

      return shoppingCartExtras;

    },

    /**
     * Check if an extra code is a coverage
     */  
    isCoverage: function(extraCode) {
      let found = false;
      if (this.coverages) {
        for (let idx=0;idx<this.coverages.length;idx++) {
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
       let url = commonServices.URL_PREFIX + '/api/booking/frontend/shopping-cart';
       const freeAccessId = this.getShoppingCartFreeAccessId();
       if (freeAccessId) {
         url += '/' + freeAccessId;
       }
       const urlParams = [];
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
                 const airportSection = $('#airport-form-section');
                 if (airportSection.length > 0)  {
                  if (data.shopping_cart.pickup_place_type === 'airport' && airportSection.attr('data-airport-required') === 'true') {
                    model.isAirportDataRequired = true;
                  }
                 }
                 // In the html it must exist a id="hotel-form-section" and a atribute data-hotel-required="true"
                 const hotelSection = $('#hotel-form-section');
                 if (hotelSection.length > 0)  {
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
      let url = commonServices.URL_PREFIX + '/api/booking/frontend/shopping-cart';
      const freeAccessId = this.getShoppingCartFreeAccessId();
      if (freeAccessId) {
        url += '/' + freeAccessId;
      }
      url += '/set-extra';
      const urlParams = [];
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
      let url = commonServices.URL_PREFIX + '/api/booking/frontend/shopping-cart';
      const freeAccessId = this.getShoppingCartFreeAccessId();
      if (freeAccessId) {
        url += '/' + freeAccessId;
      }
      url += '/remove-extra';
      const urlParams = [];
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
       let url = commonServices.URL_PREFIX + '/api/booking/frontend/extras/'+extraCode;
       const urlParams = [];
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

      const data = {
        extra: extraCode,
        quantity: quantity
      };

      const jsonData = encodeURIComponent(JSON.stringify(data));

      return jsonData;

    },
    
    buildDeleteExtraDataParams: function(extraCode) {

      const data = {
        extra: extraCode
      };

      const jsonData = encodeURIComponent(JSON.stringify(data));

      return jsonData;

    },

    // -------------- Promotion Code --------------------------------------
    
    /**
     *  Apply the promotion code
     */ 
    applyPromotionCode: function(promotionCode) {

      const requestData = {promotion_code: promotionCode};
      const requestDataJSON = encodeURIComponent(JSON.stringify(requestData));
      let url = commonServices.URL_PREFIX + '/api/booking/frontend/shopping-cart';
      const freeAccessId = this.getShoppingCartFreeAccessId();
      if (freeAccessId) {
        url += '/' + freeAccessId;
      }
      url += '/apply-promotion-code';
      const urlParams = [];
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

      // Prepare the request data
      const reservation = $('form[name=reservation_form]').formParams(false);
      if (typeof reservation.complete_action != 'undefined') {
        if (reservation.complete_action != 'pay_now') {
          reservation.payment = 'none';
        }
      }
      // Allows to setup the payment amount using an input type hidden with 
      // name payment_amount_override (deposit or total)
      let paymentAmountOverride = null;
      if (typeof reservation.payment_amount_override !== 'undefined') {
        if (reservation.payment_amount_override === 'deposit') {
          paymentAmountOverride = 'deposit';
        } else if (reservation.payment_amount_override === 'total') {
          paymentAmountOverride = 'total';
        }
      }
      // Prepare phone prefix
      if ($('#customer_phone').length) {
        const countryData = $('#customer_phone').intlTelInput('getSelectedCountryData');
        if (countryData != null) {
          reservation.customer_phone_prefix = countryData.dialCode;
        }
      }
      if ($('#customer_mobile_phone').length) {
        const countryData = $('#customer_mobile_phone').intlTelInput('getSelectedCountryData');
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

      // Clean empty values from the reservation object because the API does not accept them for shopping cart
      for (const key in reservation) {
        const value = reservation[key];
      
        if (
          value === null ||
          value === undefined ||
          value === '' ||
          (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0)
        ) {
          delete reservation[key];
        }
      }
      
      // Convert to JSON
      const reservationJSON = JSON.stringify(reservation);
      // Prepare the URL
      let url = commonServices.URL_PREFIX + '/api/booking/frontend/shopping-cart';
      const freeAccessId = this.getShoppingCartFreeAccessId();
      if (freeAccessId) {
        url += '/' + freeAccessId;
      }
      url += '/checkout';
      const urlParams = [];
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
      const headers = {};
      if (view.login && view.login.model && view.login.model.bearer) {
        headers['Authorization'] = view.login.model.bearer;
      }

      // Request
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
                const payNow = data.pay_now;
                const bookingId = data.free_access_id;
                const payment_method_id = data.payment_method_id;
                // remove the shopping cart id from the session
                model.deleteShoppingCartFreeAccessId();
                model.putBookingFreeAccessId(bookingId);
                if (payNow && payment_method_id != null && payment_method_id != '') {
                    // Notify the event
                    const event = {type: 'newReservationWithPaymentRequested',
                                 data: data};
                    rentEngineMediator.notifyEvent(event);
                    // Go to payment
                    const paymentData = {
                        id: bookingId,
                        payment: model.sales_process.can_pay_deposit ? 'deposit' : 'total', 
                        payment_method_id: payment_method_id
                    };
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
                    const event = {type: 'newReservationRequested',
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

  const controller = { // THE CONTROLLER

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

          rentEngineMediator.onCheckout(model.coverages, 
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

  const view = { // THE VIEW

    selectorLoaded: false,
    login: null,

    init: function() {
      model.requestLanguage = commonSettings.language(document.documentElement.lang);
      // Initialize i18next for translations
      i18next.init({  
                      lng: model.requestLanguage,
                      resources: commonTranslations
                   }, 
                   function(error, t) {
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
      // Complete hide
      $('#form-reservation').hide();
      $('#extras_listing').hide();
      $('.reservation_form_container').hide();
      if (document.getElementById('script_complete_complement') && 
          document.getElementById('script_create_account')) {
        // Login form
        const html = tmpl('script_complete_complement')({});
        $('#extras_listing').before(html);
        // Setup password forgotten
        $('.mybooking_login_password_forgotten').on('click', function(){
          const htmlPasswordForgotten = tmpl('script_password_forgotten')({});
          if ($('div.mybooking_password_forgotten_container').length > 0) { // Show in div
            $('div.mybooking_password_forgotten_container').html(htmlPasswordForgotten);
            const passwordForgottenComponent = new PasswordForgottenComponent();
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
            const passwordForgottenComponent = new PasswordForgottenComponent();
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
                const htmlMessage = tmpl('script_welcome_customer')({i18next: i18next, user: event.data.user});
                $('#reservation_complement_container').append(htmlMessage);
              }
              // Empty password forgotten components
              $('.mybooking_login_password_forgotten').remove();
              if ($('.mybooking_password_forgotten_container').length > 0) {
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
            if ($('.mybooking_password_forgotten_container').length > 0) {            
              $('.mybooking_password_forgotten_container').empty();
            }            
            $('#form-reservation').hide();
            $('#extras_listing').hide();
            $('.reservation_form_container').hide();
          }
          else {
            $('.mybooking_login_form_element').hide();
            // Empty password forgotten container
            if ($('.mybooking_password_forgotten_container').length > 0) {            
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

      if (document.getElementById('script_create_account')) {
        // Signup form
        const htmlSignup = tmpl('script_create_account');
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
      let connectedUser = false;
      if (this.login && this.login.model.connectedUser) {
        connectedUser = true; // TODO remove this?
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

      // Initialize the customer/driver data component
      // NOTE: Ensure a container element 
      // exists within the form[name=reservation_form] in the corresponding HTML template.
      // The CustomerDriverDataComponent will inject its form fields there.
      // We assume the component handles finding its specific target container internally for now.
      if (CustomerDriverDataComponent) {
        // Pass shopping cart data if available and needed by init
        CustomerDriverDataComponent.init({
          configuration: model.configuration,
          shoppingCartData: model.shopping_cart,
          updatePayment: this.updatePayment,
          sendReservationButtonClick: controller.sendReservationButtonClick,
        }); // Pass updatePayment and sendReservationButtonClick like callback functions
      } else {
        // Update the payment
        this.updatePayment();
      }

      // Setup signup form
      if (model.configuration.engineCustomerAccess) {
        this.setupSignupForm();
      }
    },

    /**
     * Configuration promotion code
     */
    setupPromotionCode: function() {

      if ($('#apply_promotion_code_btn').length > 0) {
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
      let url = commonServices.URL_PREFIX + '/api/booking/frontend/delivery-slots/hours-available';
      const urlParams = [];
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
          const product = model.shopping_cart.items[0].item_id;
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
      $('form[name=reservation_form] select[name=slot_time_from]').select2({width: '100%',
              ajax: {
                placeholder: i18next.t('common.selectOption'),
                allowClear: true,
                url: url,
                theme: 'bootstrap4',
                processResults: function(data) {
                  const transformedData = [];
                  for (let idx=0; idx<data.length; idx++) {
                    const element = {
                      'text': data[idx].text,
                      'id': data[idx].value
                    };
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
      let $customerClassifierSelector = null;
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
          const customerClassifierDataSource = new MemoryDataSource(model.customerClassifiers);
          const customerClassifierModel = null;
          new SelectSelector('customer_classifier_id',
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
        const reservationDetailSticky = tmpl('script_reservation_summary_sticky')({
          shopping_cart: model.shopping_cart,
          configuration: model.configuration
        });
        $('#reservation_detail_sticky').html(reservationDetailSticky);
      }

      // Summary
      if (document.getElementById('script_reservation_summary')) {
        const reservationDetail = tmpl('script_reservation_summary')({
          shopping_cart: model.shopping_cart, // Retrocompatibility in override complete views
          booking: model.shopping_cart,
          configuration: model.configuration
        });
        $('#reservation_detail').html(reservationDetail);
      }

      if (model.configuration.multipleProductsSelection && document.getElementById('script_mybooking_summary_product_detail_table')) {
        const reservationTableDetail = tmpl('script_mybooking_summary_product_detail_table')({
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
                let modifyReservationModalSelector = '#choose_productModal';
                if ($('#modify_reservation_modal').length || $('#modify_reservation_modal_MBM').length) {
                  modifyReservationModalSelector = '#modify_reservation_modal';
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
          const productInfo = tmpl('script_product_detail')(
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
          const result = tmpl('script_detailed_extra')({extras:model.extras,
                                                      coverages: model.coverages,
                                                      configuration: model.configuration,   
                                                      extrasInShoppingCart: model.getShoppingCartExtrasQuantities(),
                                                      i18next: i18next,
                                                      shopping_cart: model.shopping_cart});
          $('#extras_listing').html(result);

          // == Setup events

          // Extra check button [1 unit]
          $('.extra-check-button').bind('click', function() {
              const extraCode = $(this).attr('data-extra-code');
              if ($(this).hasClass('extra-selected')) {
                controller.extraUnchecked(extraCode);
              }
              else {
                controller.extraChecked(extraCode);
              }
          });

          // Extra checkbox [1 unit]
          $('.extra-checkbox').bind('change', function() {
              const extraCode = $(this).attr('data-value');
              const checked = $(this).is(':checked');
              if (checked) {
                  controller.extraChecked(extraCode);
              }
              else {
                  controller.extraUnchecked(extraCode);
              }
          });

          // Extra select [N units]
          $('.extra-select').bind('change', function() {
              const extraCode = $(this).attr('data-extra-code');
              const extraQuantity = $(this).val();
              controller.extraQuantityChanged(extraCode, extraQuantity);
          });

          // Extra minus button extra clicked [N units]
          $('.btn-minus-extra').bind('click', function() {
              const extraCode = $(this).attr('data-value');
              let extraQuantity = parseInt($('#extra-'+extraCode+'-quantity').val() || '0');
              if (extraQuantity > 0) {
                extraQuantity--;     
                controller.btnMinusExtraClicked(extraCode, extraQuantity);
              }
          });

          // Extra plus button extra clicked [N units]
          $('.btn-plus-extra').bind('click', function() {
              const extraCode = $(this).attr('data-value');
              let extraQuantity = parseInt($('#extra-'+extraCode+'-quantity').val() || '0');
              const maxQuantity = $(this).attr('data-max-quantity');
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
      const paymentInfo = tmpl('script_payment_detail')(
                    {sales_process: model.sales_process,
                     shopping_cart: model.shopping_cart,
                     configuration: model.configuration,
                     i18next: i18next});
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
        const result = tmpl('script_extra_modal')({
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

      let summaryUrl = commonServices.summaryUrl;

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

      let theUrl = commonServices.summaryUrl;

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
        const parameters = {id: bookingId};
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
  const shoppingCartId = model.getShoppingCartFreeAccessId();
  if (shoppingCartId == null) {
    // Not shoppingcart in session => Try if it was a booking
    const bookingId = model.getBookingFreeAccessId();
    if (bookingId != null) {
      window.location.href = commonServices.summaryUrl + '?id=' + bookingId;
    }
  }

  // Prepare the mediator
  const rentComplete = {
    model: model,
    controller: controller,
    view: view
  };
  rentEngineMediator.setComplete(rentComplete);

  // The loader is show on start and hidden after the result of
  // the search has been rendered (in model.loadShoppingCart)
  commonLoader.show();
  
  // OPTIMIZATION 2024-01-27 START  
  // Load the settings
  // model.loadSettings();
  view.init();
  // OPTIMIZATION 2024-01-27 END

});
