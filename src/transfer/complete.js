require(['jquery', 
         'commonServices', 'commonSettings', 'commonTranslations', 'commonLoader', 'commonUI',
         'i18next','ysdtemplate','YSDDateControl', 
         './selector/modify_reservation_selector', 'select2', 
         'YSDMemoryDataSource','YSDSelectSelector', './mediator/transferEngineMediator', '../profile/Login',
         '../profile/PasswordForgottenComponent',
         'jquery.i18next', 'jquery.formparams', 'jquery.form',
	       'jquery.validate', 'jquery.ui', 'jquery.ui.datepicker-es',
         'jquery.ui.datepicker-en', 'jquery.ui.datepicker-ca', 'jquery.ui.datepicker-it',
	       'jquery.ui.datepicker.validation'],
	     function($, 
                commonServices, commonSettings, commonTranslations, commonLoader, commonUI,
                i18next, tmpl, DateControl, selector, select2,
                MemoryDataSource, SelectSelector, transferEngineMediator, Login, PasswordForgottenComponent) {

  var model = { // THE MODEL
    reservationFormSubmitted: false,
    requestLanguage: null,
    configuration: null,     
    // The shopping cart    
    shopping_cart: null,
    extras: null,         // Extras
    sales_process: null,  // Sales process
    // Extra detail
    extraDetail: null,

    // -------------- Load settings ----------------------------

    loadSettings: function() {
      commonSettings.loadSettings(function(data){
        model.configuration = data;
        view.init();
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

    // ------------------ Shopping cart -------------------------------

    getShoppingCartFreeAccessId: function() { /* Get the shopping cart id */
      return sessionStorage.getItem('transfer_shopping_cart_free_access_id');
    },

    deleteShoppingCartFreeAccessId: function() { /* Get the shopping cart id */
      return sessionStorage.removeItem('transfer_shopping_cart_free_access_id');
    },

    loadShoppingCart: function() { /** Load the shopping cart **/

       // Build the URL
       var url = commonServices.URL_PREFIX + '/api/booking-transfer/frontend/shopping-cart';
       var freeAccessId = this.getShoppingCartFreeAccessId();
       if (freeAccessId) {
         url += '/' + freeAccessId;
       }
       var urlParams = [];
       urlParams.push('include_extras=true');
       urlParams.push('include_sales_process=true');
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
                 model.shopping_cart = data.shopping_cart;
                 model.extras = data.extras;
                 model.sales_process = data.sales_process;
                 view.prepareReservationForm();
                 view.updateShoppingCart();
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
      var url = commonServices.URL_PREFIX + '/api/booking-transfer/frontend/shopping-cart';
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
            // Updates the shopping cart
            view.updateShoppingCartExtra(extraCode, quantity);
            // Hide the loader (OK)
            commonLoader.hide();
        },
        error: function(data, textStatus, jqXHR) {
            // Hide the loader (Error)
            commonLoader.hide(); 
            alert(i18next.t('complete.selectExtra.error'));
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
      var url = commonServices.URL_PREFIX + '/api/booking-transfer/frontend/shopping-cart';
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
            // Updates the shopping cart
            view.updateShoppingCartExtra(extraCode, 0);          
            // Hide the loader (OK)
            commonLoader.hide();
        },
        error: function(data, textStatus, jqXHR) {
            alert(i18next.t('complete.deleteExtra.error'));
            // Hide the loader (Error)
            commonLoader.hide();
        }
      });

    },

    // Load extra (extra detail Page)

    loadExtra: function(extraCode) {

       // Build the URL
       var url = commonServices.URL_PREFIX + '/api/booking-transfer/frontend/extras/'+extraCode;
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

    // -------------- Checkout : Confirm reservation ----------------------

    getBookingFreeAccessId: function() { /* Get the shopping cart id */
      return sessionStorage.getItem('transfer_booking_free_access_id');
    },


    putBookingFreeAccessId: function(value) {
      sessionStorage.setItem('transfer_booking_free_access_id', value);
    },

    sendBookingRequest: function() { /** Send a booking request **/

      // Prepare the request data
      var reservation = $('form[name=mybooking_transfer_reservation_form]').formParams(false);
      if (typeof reservation.complete_action != 'undefined') {
        if (reservation.complete_action != 'pay_now') {
          reservation.payment = 'none';
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
      //
      var reservationJSON = JSON.stringify(reservation);
      // Prepare the URL
      var url = commonServices.URL_PREFIX + '/api/booking-transfer/frontend/shopping-cart';
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
                    transferEngineMediator.notifyEvent(event);
                    // Go to payment
                    var paymentData = {
                        id: bookingId,
                        payment: model.sales_process.can_pay_deposit ? 'deposit' : 'total', 
                        payment_method_id: payment_method_id
                    }
                    view.payment(commonServices.URL_PREFIX + '/reserva-transfer/pagar',
                                 bookingId, 
                                 paymentData);
                }
                else {
                    // Notify the event
                    var event = {type: 'newReservationRequested',
                                 data: data};
                    transferEngineMediator.notifyEvent(event);
                    // Go to summary          
                    view.gotoSummary(bookingId);
                }
            },
            error: function(data, textStatus, jqXHR) {
                // Allow to send the form again
                $('form[name=mybooking_transfer_reservation_form] button[type=submit]').removeAttr('disabled'); 
                model.reservationFormSubmitted = false;             
                // Hide Loader (ERROR)
                commonLoader.hide();
                alert(i18next.t('complete.createReservation.error'));
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

      extraDetailIconClick: function(extraCode) {
          model.loadExtra(extraCode);
      },

      sendReservationButtonClick: function() {

          transferEngineMediator.onCheckout(
                                         model.extras,
                                         model.shopping_cart );
      
      },

      completeActionChange: function() {
          debugger;
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

      // Configure selector
      selector.model.requestLanguage = model.requestLanguage;
      selector.model.configuration = model.configuration;
      selector.view.init();

      // Complements
      if (model.configuration.engineCustomerAccess) {
        this.setupLoginForm();
      }
      //else {
      //  this.prepareReservationForm();
      //}
      // Load shopping cart
      model.loadShoppingCart();
  	},

    /**
     * Setup the login form
     */
    setupLoginForm: function() {
      //this.prepareReservationForm();
      var self = this;
      // Complete hide
      $('#mybooking_transfer_form-reservation').hide();
      $('#mybooking_transfer_extras_listing').hide();
      $('.reservation_form_container').hide();
      if (document.getElementById('script_complete_complement') && 
          document.getElementById('script_create_account')) {
        // Login form
        var html = tmpl('script_complete_complement')({});
        $('#extras_listing').before(html);
        // Setup password forgotten
        $('.mybooking_login_password_forgotten').on('click', function(){
          var htmlPasswordForgotten = tmpl('script_password_forgotten')({});
          if ($('div.mybooking_password_forgotten_container').length > 0) {
            // Show in div
            $('div.mybooking_password_forgotten_container').html(htmlPasswordForgotten);
            var passwordForgottenComponent = new PasswordForgottenComponent();
            passwordForgottenComponent.model.addListener('PasswordForgotten', function(event){
              if (event.type === 'PasswordForgotten' && (typeof event.data != 'undefined') && event.data.success === true) {
                $('div.mybooking_password_forgotten_container').empty();
              }
            });
            passwordForgottenComponent.view.init();            
          }
          else {
            // Show in a modal
            $('#modalExtraDetail .modal-title').html('');
            $('#modalExtraDetail .modal-body').html(htmlPasswordForgotten);
            var passwordForgottenComponent = new PasswordForgottenComponent();
            passwordForgottenComponent.model.addListener('PasswordForgotten', function(event){
              if (event.type === 'PasswordForgotten' && (typeof event.data != 'undefined') && event.data.success === true) {
                $('#modalExtraDetail').modal('hide');
              }
            });
            passwordForgottenComponent.view.init();
            $('#modalExtraDetail').modal('show');
          }
        });
        // Signup form
        var htmlSignup = tmpl('script_create_account');
        $('#payment_detail').before(htmlSignup);
        //
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
        // Setup create account components
        this.setupCreateAccountComponents();        
      }

    },
    /**
     * Setup create account components
     */
    setupCreateAccountComponents: function() {
      $('input[name=create_customer_account]').on('change', function(){
        if ($(this).val() === 'true') {
          $('.mybooking_rent_create_account_fields_container').show();
        }
        else {
          $('.mybooking_rent_create_account_fields_container').hide();
        }
      });
    },


    prepareReservationForm: function() {
        // Setup UI
        this.setupReservationForm();
        $('.complete-section-title.customer_component').show();
        $('#form-reservation').show();
        this.setupReservationFormValidation();
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
      var localeReservationFormScript = 'script_transfer_complete_form_tmpl_'+locale;
      if (locale != null && document.getElementById(localeReservationFormScript)) {
        var reservationForm = tmpl(localeReservationFormScript)({configuration: model.configuration,
                                                                 shopping_cart: model.shopping_cart});
        $('form[name=mybooking_transfer_reservation_form]').html(reservationForm);           
      }
      else if (document.getElementById('script_transfer_complete_form_tmpl')) {
        var reservationForm = tmpl('script_transfer_complete_form_tmpl')({configuration: model.configuration,
                                                                          shopping_cart: model.shopping_cart});
        $('form[name=mybooking_transfer_reservation_form]').html(reservationForm);                                                                    
      }

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
      var values = ['']; 

      if (commonServices.jsUseSelect2) {
        // Setup country selector
        var selectors = ['customer_address_country'];
        for (var idx=0; idx<selectors.length; idx++) { 
          var $countrySelector = $(selectors[idx]);    
          if ($countrySelector.length > 0 && typeof values[idx] !== 'undefined') {
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
      else {
        // Setup country selector
        var selectors = ['customer_address_country'];
        for (var idx=0; idx<selectors.length; idx++) { 
          if (document.getElementById(selectors[idx])) {
            var countriesDataSource = new MemoryDataSource(countriesArray);
            var countryModel = (values[idx] == null ? '' : values[idx])
            var selectorModel = new SelectSelector(selectors[idx],
                countriesDataSource, countryModel, true, i18next.t('complete.reservationForm.select_country'));
          }
        }
      }

      // Configure Telephone with prefix
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

      if ($('#customer_mobile_phone').length) {
        $("#customer_mobile_phone").intlTelInput({
          initialCountry: countryCode,
          separateDialCode: true,
          utilsScript: commonServices.phoneUtilsPath,
          preferredCountries: [countryCode]
        });
      }

    },

    /**
     * Setup the reservation form validation
     */ 
    setupReservationFormValidation: function() {

        commonSettings.appendValidators();

        $('form[name=mybooking_transfer_reservation_form]').validate(
            {
                errorClass: 'text-danger',
                submitHandler: function(form) {
                    console.log('COMPLETE - submit');
                    if (!model.reservationFormSubmitted) {
                      model.reservationFormSubmitted = true; 
                      // Disable submit to avoid double click
                      $('form[name=mybooking_transfer_reservation_form] button[type=submit]').attr('disabled', 'disabled');
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
                    $('form[name=mybooking_transfer_reservation_form] button[type=submit]').removeAttr('disabled');
                    model.reservationFormSubmitted = false; 
                    // Show errors                  
                    $('#reservation_error').html(i18next.t('complete.reservationForm.errors'));
                    $('#reservation_error').show();
                },

                rules : {

                    'customer_name': {
                      required: '#customer_name:visible'
                    },
                    'customer_surname' : {
                      required: '#customer_surname:visible'
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
                    'payment_method_select': {
                        required: 'input[name=payment_method_select]:visible'
                    },
                    'account_password': {
                        required: '#account_password:visible',
                        pwcheck: '#account_password:visible',
                        minlength: 8
                    },
                    'detailed_origin_address': {
                        required: '#detailed_origin_address:visible'
                    },
                    'detailed_origin_flight_number': {
                        required: '#detailed_origin_flight_number:visible'
                    },
                    'detailed_origin_flight_estimated_time': {
                        required: '#detailed_origin_flight_estimated_time:visible'
                    },
                    'detailed_destination_address': {
                        required: '#detailed_destination_address:visible'
                    },
                    'detailed_destination_flight_number': {
                        required: '#detailed_destination_flight_number:visible'
                    },
                    'detailed_destination_flight_estimated_time': {
                        required: '#detailed_destination_flight_estimated_time:visible'
                    },
                    'detailed_return_origin_address': {
                        required: '#detailed_return_origin_address:visible'
                    },
                    'detailed_return_origin_flight_number': {
                        required: '#detailed_return_origin_flight_number:visible'
                    },
                    'detailed_return_origin_flight_estimated_time': {
                        required: '#detailed_return_origin_flight_estimated_time:visible'
                    },
                    'detailed_return_destination_address': {
                        required: '#detailed_return_destination_address:visible'
                    },
                    'detailed_return_destination_flight_number': {
                        required: '#detailed_return_destination_flight_number:visible'
                    },
                    'detailed_return_destination_flight_estimated_time': {
                        required: '#detailed_return_destination_flight_estimated_time:visible'
                    },                                                                                                    
                },

                messages : {

                    'customer_name': i18next.t('complete.reservationForm.validations.customerNameRequired'),
                    'customer_surname' : i18next.t('complete.reservationForm.validations.customerSurnameRequired'),
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
                    'customer_address_street': {
                        'required': i18next.t('complete.reservationForm.validations.fieldRequired')
                    },
                    'customer_address_city': {
                        'required': i18next.t('complete.reservationForm.validations.fieldRequired')
                    },    
                    'customer_address_state': {
                        'required': i18next.t('complete.reservationForm.validations.fieldRequired')
                    }, 
                    'customer_address_zip': {
                        'required': i18next.t('complete.reservationForm.validations.fieldRequired')
                    }, 
                    'customer_address_country': {
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
                    'payment_method_select': {
                        'required': i18next.t('complete.reservationForm.validations.selectPaymentMethod')
                    },
                    'account_password': {
                        'required': i18next.t('complete.reservationForm.validations.fieldRequired'),
                        'pwcheck': i18next.t('complete.reservationForm.validations.passwordCheck'),
                        'minlength': i18next.t('complete.reservationForm.validations.minLength', {minlength: 8}),
                    },                     
                    'detailed_origin_address': {
                        required: i18next.t('complete.reservationForm.validations.fieldRequired')
                    },
                    'detailed_origin_flight_number': {
                        required: i18next.t('complete.reservationForm.validations.fieldRequired')
                    },
                    'detailed_origin_flight_estimated_time': {
                        required: i18next.t('complete.reservationForm.validations.fieldRequired')
                    },
                    'detailed_destination_address': {
                        required: i18next.t('complete.reservationForm.validations.fieldRequired')
                    },
                    'detailed_destination_flight_number': {
                        required: i18next.t('complete.reservationForm.validations.fieldRequired')
                    },
                    'detailed_destination_flight_estimated_time': {
                        required: i18next.t('complete.reservationForm.validations.fieldRequired')
                    },
                    'detailed_return_origin_address': {
                        required: i18next.t('complete.reservationForm.validations.fieldRequired')
                    },
                    'detailed_return_origin_flight_number': {
                        required: i18next.t('complete.reservationForm.validations.fieldRequired')
                    },
                    'detailed_return_origin_flight_estimated_time': {
                        required: i18next.t('complete.reservationForm.validations.fieldRequired')
                    },
                    'detailed_return_destination_address': {
                        required: i18next.t('complete.reservationForm.validations.fieldRequired')
                    },
                    'detailed_return_destination_flight_number': {
                        required: i18next.t('complete.reservationForm.validations.fieldRequired')
                    },
                    'detailed_return_destination_flight_estimated_time': {
                        required: i18next.t('complete.reservationForm.validations.fieldRequired')
                    },
                },

                errorPlacement: function (error, element) {

                    if (element.attr('name') == 'conditions_read_request_reservation' || 
                        element.attr('name') == 'conditions_read_payment_on_delivery' ||
                        element.attr('name') == 'conditions_read_pay_now')
                    {
                        error.insertAfter(element.parent().parent());
                    }
                    else if (element.attr('name') == 'payment_method_select') {
                        error.insertAfter(document.getElementById('payment_method_select_error'));
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

    // -------------------- View Updates

    /**
     * Updates the shopping card when the shopping cart is loaded
     */
    updateShoppingCart: function() { // Updates the shopping cart

    	// Show the product information   
      this.updateProducts();
      // Update the summary
      this.updateShoppingCartSummary();
      // Update the extras
      this.updateExtras();
      // Update the payment
      this.updatePayment();

    },

    /**
     * Updates the shopping cart when the user changes an Extra
     */
    updateShoppingCartExtra: function(extraCode, quantity) {

      // Updates the summary
      this.updateShoppingCartSummary();
      // Update the extra
      this.updateExtra(extraCode, quantity);
      // Update the payment
      this.updatePayment();

    },

    /**
     * Updates the shopping cart summary
     */
    updateShoppingCartSummary: function() { // Updates the shopping cart summary (total)

       // Summary
       if (document.getElementById('script_transfer_reservation_summary')) {
         var reservationDetail = tmpl('script_transfer_reservation_summary')({shopping_cart: model.shopping_cart,
                                                                     configuration: model.configuration});

         $('#mybooking_transfer_reservation_detail').html(reservationDetail);
       }
      
       // Setup the events
       
       if ($('#mybooking_transfer_modify_reservation_button').length) {
         // The user clicks on the modify reservation button
         $('#mybooking_transfer_modify_reservation_button').bind('click', function() { 
              // Setup the selector
              if (!view.selectorLoaded) {
                selector.view.startFromShoppingCart(model.shopping_cart);
                view.selectorLoaded = true;
              }
              // Show the selector
              // Compatibility with old version of the theme
              var modifyReservationModalSelector = '#mybooking_transfer_modify_reservation_modal';
              commonUI.showModal(modifyReservationModalSelector);
         });
       }

    },

    // -------------------- View Updates Support    

    /**
     * Update the products
     */
    updateProducts: function() {
      if (document.getElementById('script_transfer_product_detail')) {  
        if (!$('#script_transfer_product_detail').is(':empty')) {
          var productInfo = tmpl('script_transfer_product_detail')(
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
        if (document.getElementById('script_transfer_detailed_extra')) {
          // Show the extras
          var result = tmpl('script_transfer_detailed_extra')({extras:model.extras,
                                                      configuration: model.configuration,   
                                                      extrasInShoppingCart: model.getShoppingCartExtrasQuantities(),
                                                      i18next: i18next,
                                                      shopping_cart: model.shopping_cart});
          $('#mybooking_transfer_extras_listing').html(result);

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
        }

    },

    /**
     * Updates the payment
     */
    updatePayment: function() {
      var paymentInfo = tmpl('script_transfer_payment_detail')(
                    {sales_process: model.sales_process,
                     shopping_cart: model.shopping_cart,
                     configuration: model.configuration,
                     i18next: i18next });
      $('#mybooking_transfer_payment_detail').html(paymentInfo);

      $('#btn_reservation').bind('click', function() {
         $('form[name=mybooking_transfer_reservation_form]').submit();
      });

      // Choose complete action between different options:
      //  - request reservation
      //  - pay on delivery
      //  - pay now
      if ($('input[name=complete_action]').length > 0) {
        $('input[name=complete_action]').unbind('change');
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
      if (document.getElementById('script_transfer_extra_modal')) {
        var result = tmpl('script_transfer_extra_modal')({
                        extra: model.extraDetail
                      });
        // Compatibility with bootstrap modal replacement (from 1.0.0)
        if ($('#mybooking_transfer_modalExtraDetail_MBM').length) {
          $('#mybooking_transfer_modalExtraDetail_MBM .modal-extra-detail-title').html(model.extraDetail.name);
          $('#mybooking_transfer_modalExtraDetail_MBM .modal-extra-detail-content').html(result);
        }
        else {
          $('#mybooking_transfer_modalExtraDetail .modal-extra-detail-title').html(model.extraDetail.name);
          $('#mybooking_transfer_modalExtraDetail .modal-extra-detail-content').html(result);
        }
        // Show the modal
        commonUI.showModal('#mybooking_transfer_modalExtraDetail');
      }      
    },

    // -------------------- Go to payment
    
    /**
     * payment
     */
    payment: function(url, bookingId, paymentData) {

      var summaryUrl = commonServices.summaryUrl + '?id=' + bookingId;
      transferEngineMediator.onNewReservationPayment(url, summaryUrl, paymentData);

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

      window.location.href = commonServices.transferSummaryUrl + '?id=' + bookingId;

    },

  };

  // Check if it is a booking recorded in order to load summary page
  var shoppingCartId = model.getShoppingCartFreeAccessId();
  if (shoppingCartId == null) {
    // Not shoppingcart in session => Try if it was a booking
    var bookingId = model.getBookingFreeAccessId();
    if (bookingId != null) {
      window.location.href = commonServices.transferSummaryUrl + '?id=' + bookingId;
    }
  }

  // Prepare the mediator
  var rentComplete = {
    model: model,
    controller: controller,
    view: view
  }
  transferEngineMediator.setComplete( rentComplete );

  // The loader is show on start and hidden after the result of
  // the search has been rendered (in model.loadShoppingCart)
  commonLoader.show();
  
  // Load the settings
  model.loadSettings();

});
