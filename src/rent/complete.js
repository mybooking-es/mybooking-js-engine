require(['jquery', 
         'commonServices', 'commonSettings', 'commonTranslations', 'commonLoader',
         'i18next','ysdtemplate','YSDDateControl', 
         './selector/modify_reservation_selector', './selector-wizard/selector_wizard', 'select2', 
         'YSDMemoryDataSource','YSDSelectSelector', './mediator/rentEngineMediator', '../profile/Login',
         '../profile/PasswordForgottenComponent',
         'jquery.i18next', 'jquery.formparams', 'jquery.form',
	       'jquery.validate', 'jquery.ui', 'jquery.ui.datepicker-es',
         'jquery.ui.datepicker-en', 'jquery.ui.datepicker-ca', 'jquery.ui.datepicker-it',
	       'jquery.ui.datepicker.validation'],
	     function($, 
                commonServices, commonSettings, commonTranslations, commonLoader, 
                i18next, tmpl, DateControl, selector, selectorWizard, select2,
                MemoryDataSource, SelectSelector, rentEngineMediator, Login, PasswordForgottenComponent) {

  var model = { // THE MODEL
    requestLanguage: null,
    configuration: null,     
    // The shopping cart    
    shopping_cart: null,
    extras: null,         // Extras
    coverages: null,      // The coverages
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
                 model.coverages = data.coverages;
                 model.sales_process = data.sales_process;
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

    // -------------- Promotion Code --------------------------------------

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

    sendBookingRequest: function() { /** Send a booking request **/

      // Prepare the request data
      var reservation = $('form[name=reservation_form]').formParams(false);
      if (typeof reservation.complete_action != 'undefined') {
        if (reservation.complete_action != 'pay_now') {
          reservation.payment = 'none';
        }
      }
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

      applyPromotionCodeBtnClick: function(promotionCode) {
          model.applyPromotionCode(promotionCode);
      },

      sendReservationButtonClick: function() {

          rentEngineMediator.onCheckout( model.coverages, 
                                         model.extras,
                                         model.shopping_cart );
      
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
      else {
        this.prepareReservationForm();
      }
      // Load shopping cart
      model.loadShoppingCart();
  	},

    /**
     * Setup the login form
     */
    setupLoginForm: function() {
      this.prepareReservationForm();
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
            $('#form-reservation').hide();
            $('#extras_listing').hide();
            $('.reservation_form_container').hide();
          }
          else {
            $('.mybooking_login_form_element').hide();
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
      var localeReservationFormScript = 'script_renting_complete_form_tmpl_'+locale;
      if (locale != null && document.getElementById(localeReservationFormScript)) {
        var reservationForm = tmpl(localeReservationFormScript)({configuration: model.configuration});
        $('form[name=reservation_form]').html(reservationForm);           
      }
      else if (document.getElementById('script_renting_complete_form_tmpl')) {
        var reservationForm = tmpl('script_renting_complete_form_tmpl')({configuration: model.configuration});
        $('form[name=reservation_form]').html(reservationForm);                                                                    
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
        var selectors = ['select[name=country]'];
        for (var idx=0; idx<selectors.length; idx++) { 
          $countrySelector = $(selectors[idx]);    
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
        var selectors = ['country'];
        for (var idx=0; idx<selectors.length; idx++) { 
          if (document.getElementById(selectors[idx])) {
            var countriesDataSource = new MemoryDataSource(countriesArray);
            var countryModel = (values[idx] == null ? '' : values[idx])
            var selectorModel = new SelectSelector(selectors[idx],
                countriesDataSource, countryModel, true, i18next.t('complete.reservationForm.select_country'));
          }
        }
      }


      // Configure driver document id date
      if (document.getElementById('driver_document_id_date_day')) {
        var dataControlDateOfBirth = new DateControl(document.getElementById('driver_document_id_date_day'),
                        document.getElementById('driver_document_id_date_month'),
                        document.getElementById('driver_document_id_date_year'),
                        document.getElementById('driver_document_id_date'),
                        commonSettings.language(model.requestLanguage));
      }
      // Configure driver date of birth and driver license date
      if (document.getElementById('driver_date_of_birth_day')) {
        var dataControlDateOfBirth = new DateControl(document.getElementById('driver_date_of_birth_day'),
                        document.getElementById('driver_date_of_birth_month'),
                        document.getElementById('driver_date_of_birth_year'),
                        document.getElementById('driver_date_of_birth'),
                        commonSettings.language(model.requestLanguage));
      }
      // Configure driver driving license date 
      if (document.getElementById('driver_driving_license_date_day')) {
        var dataControlDateOfBirth = new DateControl(document.getElementById('driver_driving_license_date_day'),
                        document.getElementById('driver_driving_license_date_month'),
                        document.getElementById('driver_driving_license_date_year'),
                        document.getElementById('driver_driving_license_date'),
                        commonSettings.language(model.requestLanguage));
      }

      // Configure additional driver driving license date 
      if (document.getElementById('additional_driver_1_driving_license_date_day')) {
        var dataControlDateOfBirth = new DateControl(document.getElementById('additional_driver_1_driving_license_date_day'),
                        document.getElementById('additional_driver_1_driving_license_date_month'),
                        document.getElementById('additional_driver_1_driving_license_date_year'),
                        document.getElementById('additional_driver_1_driving_license_date'),
                        commonSettings.language(model.requestLanguage));
      }
      if (document.getElementById('additional_driver_2_driving_license_date_day')) {
        var dataControlDateOfBirth = new DateControl(document.getElementById('additional_driver_2_driving_license_date_day'),
                        document.getElementById('additional_driver_2_driving_license_date_month'),
                        document.getElementById('additional_driver_2_driving_license_date_year'),
                        document.getElementById('additional_driver_2_driving_license_date'),
                        commonSettings.language(model.requestLanguage));
      }

    },

    /**
     * Setup the reservation form validation
     */ 
    setupReservationFormValidation: function() {

        commonSettings.appendValidators();

        $('form[name=reservation_form]').validate(
            {
                ignore: '', // To be able to validate driver date of birth
                errorClass: 'text-danger',
                submitHandler: function(form) {
                    $('#reservation_error').hide();
                    $('#reservation_error').html('');
                    controller.sendReservationButtonClick();
                    return false;
                },

                invalidHandler : function (form, validator) {
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
                    'driver_date_of_birth': {
                        required: "#driver_date_of_birth_day:visible"
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
                    }
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
                    'driver_date_of_birth': {
                        'required': i18next.t('complete.reservationForm.validations.driverDateOfBirthRequired')
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

    /**
     * Configuration promotion code
     */
    setupPromotionCode: function() {

      if ( $('#apply_promotion_code_btn').length > 0) {
        $('#apply_promotion_code_btn').bind('click', function() {
           controller.applyPromotionCodeBtnClick($('#promotion_code').val());
        });
      }

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
      // Setup Promotion Code         
      if (model.configuration.promotionCode) {
        this.setupPromotionCode();
      }


    },

    /**
     * Updates the shopping cart when the user changes an Extra
     */
    updateShoppingCartExtra: function(extraCode, quantity) {

      // Updates the summary
      this.updateShoppingCartSummary();
      // Update the extra
      if (model.isCoverage(extraCode)) {
        this.updateExtras();
      }
      else {
        this.updateExtra(extraCode, quantity);
      }
      // Update the payment
      this.updatePayment();

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
         var reservationDetailSticky = tmpl('script_reservation_summary_sticky')({shopping_cart: model.shopping_cart,
                                                                                  configuration: model.configuration});
         $('#reservation_detail_sticky').html(reservationDetailSticky);
       }

       // Summary
       if (document.getElementById('script_reservation_summary')) {
         var reservationDetail = tmpl('script_reservation_summary')({shopping_cart: model.shopping_cart,
                                                                     configuration: model.configuration});
         $('#reservation_detail').html(reservationDetail);
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
                if ($('#modify_reservation_modal').length) {
                  modifyReservationModalSelector = '#modify_reservation_modal'
                }
                // Compatibility with libraries that overrides $.modal
                if (commonServices.jsBsModalNoConflict && typeof $.fn.bootstrapModal !== 'undefined') {
                  $(modifyReservationModalSelector).bootstrapModal(commonServices.jsBSModalShowOptions());
                }
                else {
                  if ($.fn.modal) {
                    $(modifyReservationModalSelector).modal(commonServices.jsBSModalShowOptions());
                  }
                }
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

      $('#btn_reservation').bind('click', function() {
         $('form[name=reservation_form]').submit();
      });

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
        $('#modalExtraDetail .modal-extra-detail-title').html(model.extraDetail.name);
        $('#modalExtraDetail .modal-extra-detail-content').html(result);
        // Compatibility with libraries that overrides $.modal
        if (commonServices.jsBsModalNoConflict && typeof $.fn.bootstrapModal !== 'undefined') {
          $('#modalExtraDetail').bootstrapModal(commonServices.jsBSModalShowOptions());
        }
        else {
          if ($.fn.modal) {
            $('#modalExtraDetail').modal(commonServices.jsBSModalShowOptions());
          }
        }
      }      
    },

    // -------------------- Go to payment
    
    /**
     * payment
     */
    payment: function(url, bookingId, paymentData) {

      var summaryUrl = commonServices.summaryUrl + '?id=' + bookingId;
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

      window.location.href = commonServices.summaryUrl + '?id=' + bookingId;

    },

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
  
  // Load the settings
  model.loadSettings();

});
