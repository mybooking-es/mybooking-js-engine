require(['jquery', 'YSDRemoteDataSource','YSDMemoryDataSource','YSDSelectSelector', 'select2',
         'commonServices', 'commonSettings', 'commonTranslations', 'commonLoader', 'commonUI',  
         './mediator/rentEngineMediator',
         'i18next','ysdtemplate', 'YSDDateControl',
         './passengers/passengersComponent',
         'jquery.i18next',   
         'jquery.validate', 'jquery.ui', 'jquery.form'],
    function($, RemoteDataSource, MemoryDataSource, SelectSelector, select2,
             commonServices, commonSettings, commonTranslations, commonLoader, commonUI,
             rentEngineMediator, i18next, tmpl, DateControl, 
             passengersComponent
          ) {

  var model = { // THE MODEL
    requestLanguage: null,
    configuration: null,        
    bookingFreeAccessId : null,
    booking: null,
    sales_process: null,

    // -------------- Load settings ----------------------------

    loadSettings: function() {
      commonSettings.loadSettings(function(data){
        model.configuration = data;
        view.init();
      });
    },  

    // ------------ Product information detail ------------------------

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

    extractVariables: function() { // Load variables from the request

      var url_vars = this.getUrlVars();
      this.bookingFreeAccessId = decodeURIComponent(url_vars['id']);

    },

    // ----------------- Reservation ------------------------------

    getBookingFreeAccessId: function() { /* Get the booking id */
      return sessionStorage.getItem('booking_free_access_id');
    },

    setBookingFreeAccessId: function(bookingFreeAccessId) { /* Set the booking id */
      sessionStorage.setItem('booking_free_access_id', bookingFreeAccessId);
    },

    loadBooking: function() { /** Load the reservation **/

       var bookingId = this.bookingFreeAccessId;
       if (bookingId == '') {
         bookingId = this.getBookingFreeAccessId();
       }

       // Build the URL
       var url = commonServices.URL_PREFIX + '/api/booking/frontend/booking/' +
                 bookingId;
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
       $.ajax({
               type: 'GET',
               url : url,
               dataType : 'json',
               contentType : 'application/json; charset=utf-8',
               crossDomain: true,
               success: function(data, textStatus, jqXHR) {
                 model.booking = data.booking;
                 model.bookingFreeAccessId = data.booking.free_access_id;
                 model.sales_process = data.sales_process;
                 view.updateBooking();
               },
               error: function(data, textStatus, jqXHR) {
                 commonLoader.hide(); 
                 alert(i18next.t('myReservation.loadReservation.error'));

               },
               complete: function(jqXHR, textStatus) {
                 $('#content').show();
                 $('#sidebar').show();
               }
          });
    },

    sendPayRequest: function(paymentAmount, paymentMethod) {

      // Booking free access ID
      var bookingId = this.bookingFreeAccessId;
      if (bookingId == '') {
        bookingId = this.getBookingFreeAccessId();
      }
      else {
        this.setBookingFreeAccessId(bookingId);
      }
      
      // Prepare data
      var data = {id: bookingId,
                  payment: paymentAmount,
                  payment_method_id: paymentMethod};

      // Do payment
      view.payment( commonServices.URL_PREFIX + '/reserva/pagar', data );
    },

    update: function() {
        // Build request
        var reservation = $('form[name=booking_information_form]').formParams(false);
        var booking_line_resources = reservation['booking_line_resources']
        delete reservation['booking_line_resources'];
        reservation['booking_line_resources'] = [];
        for (var item in booking_line_resources) {
            reservation['booking_line_resources'].push(booking_line_resources[item]);
        }
        var reservationJSON = encodeURIComponent(JSON.stringify(reservation));
        // Build URL
        var url = commonServices.URL_PREFIX + '/api/booking/frontend/booking/' + this.bookingFreeAccessId;
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
        $.ajax({
            type: 'PUT',
            url : url,
            data: reservationJSON,
            dataType : 'json',
            contentType : 'application/json; charset=utf-8',
            crossDomain: true,
            success: function(data, textStatus, jqXHR) {
                // Update reservation
                if (typeof data.booking !== 'undefined') {
                  model.booking = data.booking;
                  view.updateBooking();
                }
                alert(i18next.t('myReservation.updateReservation.success'));
            },
            error: function(data, textStatus, jqXHR) {
                alert(i18next.t('myReservation.updateReservation.error'));
            }
        });

    }    

  };

  var controller = { // THE CONTROLLER

    /**
     * Update click
     */ 
    btnUpdateClick: function() {
       model.update();
    },
    
    /**
     * Electronic signature link click
     */ 
    electronicSignatureLinkClick: function(){
      if (model.booking && typeof model.booking.required_data_completed !== 'undefined') {

        if (model.booking.required_data_completed) {
          window.open(model.booking.electronic_signature_url, '_blank');
        }
        else {
          var html = tmpl('script_contract_required_data')(
            {contract_errors: model.booking.contract_errors});

          // Compatibility with bootstrap modal replacement (from 1.0.0)
          if ($('#modalSignatureValidation_MBM').length) {
            $('#modalSignatureValidation_MBM .mb-modal_title').html('');
            $('#modalSignatureValidation_MBM .mb-modal_body').html(html);     
          }
          else {
            $('#modalSignatureValidation .modal-title').html('');
            $('#modalSignatureValidation .modal-body').html(html);
          }
          // Show the modal
          commonUI.showModal('#modalSignatureValidation');
        }

      }
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
      // Setup UI          
      model.extractVariables();
      model.loadBooking();
    },

    updateBooking: function() { // Updates the reservation

      this.updateTitle();
      this.updateBookingSummary();
      this.setupReservationForm();
      this.setupPassengersForm();
      this.setupEvents();
      commonLoader.hide();

    },

    updateTitle: function() {
      $('#reservation_title').html(model.booking.summary_status);
    },

    updateBookingSummary: function() { // Updates the shopping cart summary (total)
      var showReservationForm = (model.configuration.rentingFormFillDataAddress || 
                                model.configuration.rentingFormFillDataDriverDetail || 
                                model.configuration.rentingFormFillDataNamedResources) &&
                                model.booking.manager_complete_authorized;
      var reservationDetail = tmpl('script_reservation_summary')(
          {
            booking: model.booking,
            configuration: model.configuration,
            showReservationForm: showReservationForm
          });
      $('#reservation_detail').html(reservationDetail);

      if ( model.configuration.multipleProductsSelection && document.getElementById('script_mybooking_summary_product_detail_table')) {
        var reservationTableDetail = tmpl('script_mybooking_summary_product_detail_table')({
          bookings: model.booking.booking_lines,
          configuration: model.configuration
        });
        $('#mybooking_summary_product_detail_table').html(reservationTableDetail);
      }

      if (model.booking.manager_complete_authorized) {
        // The reservation form fields are defined in a micro-template
        var locale = model.requestLanguage;
        var localeReservationFormScript = 'script_reservation_form_'+locale;
        if (locale != null && document.getElementById(localeReservationFormScript)) {
          var reservationForm = tmpl(localeReservationFormScript)({booking: model.booking,
                                                                    configuration: model.configuration});
          $('form[name=reservation_form]').html(reservationForm);           
        }
        // Micro-template reservation
        else if (document.getElementById('script_reservation_form')) {
          var reservationForm = tmpl('script_reservation_form')(
              {booking: model.booking,
                configuration: model.configuration});
          $('#reservation_form_container').html(reservationForm);
          $('#reservation_form_container').show();
        }
        // Micro-template payment
        if (document.getElementById('script_payment_detail')) {
          // If the booking is pending show the payment controls
          if (model.sales_process.can_pay) {
            var amount = 0;
            if (model.sales_process.can_pay_pending) {
              amount = model.booking.total_pending;
            }
            else if (model.sales_process.can_pay_deposit) {
              amount = model.booking.booking_amount;
            }
            else if (model.sales_process.can_pay_total) {
              amount = model.booking.total_cost;
            }
            var paymentInfo = tmpl('script_payment_detail')(
            {
              sales_process: model.sales_process,
              amount: amount,
              booking: model.booking,
              configuration: model.configuration,
              i18next: i18next            
            });
            $('#payment_detail').html(paymentInfo);
            this.setupPaymentFormValidation();
            $('#payment_detail').show();
          }
        }
      }
    },

    setupReservationForm: function() {

      // Load countries
      var countries = i18next.t('common.countries', {returnObjects: true });
      if (countries instanceof Object) {
        var countryCodes = Object.keys(countries);
        var countriesArray = countryCodes.map(function(value){ 
                                return {id: value, text: countries[value], description: countries[value]};
                             });
      } else {
        var countriesArray = [];
      }
      var values = [model.booking.address_country,
                    model.booking.customer_origin_country,
                    model.booking.driver_address_country,
                    model.booking.driver_origin_country,
                    model.booking.driver_driving_license_country,
                    model.booking.additional_driver_1_origin_country,
                    model.booking.additional_driver_1_driving_license_country,
                    model.booking.additional_driver_2_origin_country,
                    model.booking.additional_driver_2_driving_license_country]; 

      if (commonServices.jsUseSelect2) {
        // Configure address country
        var selectors = ['select[name=customer_address\\[country\\]]',
                         'select[name=customer_origin_country]',
                         'select[name=driver_address\\[country\\]]',
                         'select[name=driver_origin_country]',
                         'select[name=driver_driving_license_country]',
                         'select[name=additional_driver_1_origin_country]',
                         'select[name=additional_driver_1_driving_license_country]',
                         'select[name=additional_driver_2_origin_country]',
                         'select[name=additional_driver_2_driving_license_country]'];
        var $countrySelector = null;
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
        var selectors = ['country', 
                         'customer_origin_country',
                         'driver_address_country',
                         'driver_origin_country',
                         'driver_driving_license_country', 
                         'additional_driver_1_origin_country',
                         'additional_driver_1_driving_license_country',
                         'additional_driver_2_origin_country',
                         'additional_driver_2_driving_license_country'];
        for (var idx=0; idx<selectors.length; idx++) { 
          if (document.getElementById(selectors[idx])) {
            var countriesDataSource = new MemoryDataSource(countriesArray);
            var countryModel = (values[idx] == null ? '' : values[idx]);
            var selectorModel = new SelectSelector(selectors[idx],
                countriesDataSource, countryModel, true, i18next.t('myReservation.select_country'));
          }
        }        
      }

      // Configure driver document id date
      if (document.getElementById('driver_document_id_date_day')) {
        var dateControl = new DateControl(document.getElementById('driver_document_id_date_day'),
                        document.getElementById('driver_document_id_date_month'),
                        document.getElementById('driver_document_id_date_year'),
                        document.getElementById('driver_document_id_date'),
                        commonSettings.language(model.requestLanguage));
        if (model.booking.driver_document_id_date) {
          dateControl.setDate(model.booking.driver_document_id_date);
        }        
      }
      if (document.getElementById('driver_document_id_expiration_date_day')) {
        var dateControl = new DateControl(document.getElementById('driver_document_id_expiration_date_day'),
                        document.getElementById('driver_document_id_expiration_date_month'),
                        document.getElementById('driver_document_id_expiration_date_year'),
                        document.getElementById('driver_document_id_expiration_date'),
                        commonSettings.language(model.requestLanguage),
                        undefined, 'future');
        if (model.booking.driver_document_id_expiration_date) {
          dateControl.setDate(model.booking.driver_document_id_expiration_date);
        }        
      }

      // Configure driver date of birth 
      if (document.getElementById('driver_date_of_birth_day')) {
        var dateControl = new DateControl(document.getElementById('driver_date_of_birth_day'),
                        document.getElementById('driver_date_of_birth_month'),
                        document.getElementById('driver_date_of_birth_year'),
                        document.getElementById('driver_date_of_birth'),
                        commonSettings.language(model.requestLanguage));
        if (model.booking.driver_date_of_birth) {
          dateControl.setDate(model.booking.driver_date_of_birth);
        }
      }
      // Configure driver driving license date 
      if (document.getElementById('driver_driving_license_date_day')) {
        var dateControl = new DateControl(document.getElementById('driver_driving_license_date_day'),
                        document.getElementById('driver_driving_license_date_month'),
                        document.getElementById('driver_driving_license_date_year'),
                        document.getElementById('driver_driving_license_date'),
                        commonSettings.language(model.requestLanguage));
        if (model.booking.driver_driving_license_date) {
          dateControl.setDate(model.booking.driver_driving_license_date);
        }
      }
      if (document.getElementById('driver_driving_license_expiration_date_day')) {
        var dateControl = new DateControl(document.getElementById('driver_driving_license_expiration_date_day'),
                        document.getElementById('driver_driving_license_expiration_date_month'),
                        document.getElementById('driver_driving_license_expiration_date_year'),
                        document.getElementById('driver_driving_license_expiration_date'),
                        commonSettings.language(model.requestLanguage),
                        undefined, 'future');
        if (model.booking.driver_driving_license_expiration_date) {
          dateControl.setDate(model.booking.driver_driving_license_expiration_date);
        }
      }

      // Configure driving license country
      if ($('select[name=driver_driving_license_country]').length) {
        $('select[name=driver_driving_license_country]').val(model.booking.driver_driving_license_country);
      }

      // Configure additional driver 1 driving license date 
      if (document.getElementById('additional_driver_1_driving_license_date_day')) {
        var dateControl = new DateControl(document.getElementById('additional_driver_1_driving_license_date_day'),
                        document.getElementById('additional_driver_1_driving_license_date_month'),
                        document.getElementById('additional_driver_1_driving_license_date_year'),
                        document.getElementById('additional_driver_1_driving_license_date'),
                        commonSettings.language(model.requestLanguage));
        if (model.booking.additional_driver_1_driving_license_date) {
          dateControl.setDate(model.booking.additional_driver_1_driving_license_date);
        }        
      }
      if (document.getElementById('additional_driver_1_driving_license_expiration_date_day')) {
        var dateControl = new DateControl(document.getElementById('additional_driver_1_driving_license_expiration_date_day'),
                        document.getElementById('additional_driver_1_driving_license_expiration_date_month'),
                        document.getElementById('additional_driver_1_driving_license_expiration_date_year'),
                        document.getElementById('additional_driver_1_driving_license_expiration_date'),
                        commonSettings.language(model.requestLanguage),
                        undefined, 'future');
        if (model.booking.additional_driver_1_driving_license_expiration_date) {
          dateControl.setDate(model.booking.additional_driver_1_driving_license_expiration_date);
        }        
      }
      // Configuration additional driver 2 driving license date
      if (document.getElementById('additional_driver_2_driving_license_date_day')) {
        var dateControl = new DateControl(document.getElementById('additional_driver_2_driving_license_date_day'),
                        document.getElementById('additional_driver_2_driving_license_date_month'),
                        document.getElementById('additional_driver_2_driving_license_date_year'),
                        document.getElementById('additional_driver_2_driving_license_date'),
                        commonSettings.language(model.requestLanguage));
        if (model.booking.additional_driver_2_driving_license_date) {
          dateControl.setDate(model.booking.additional_driver_2_driving_license_date);
        }        
      }
      if (document.getElementById('additional_driver_2_driving_license_expiration_date_day')) {
        var dateControl = new DateControl(document.getElementById('additional_driver_2_driving_license_expiration_date_day'),
                        document.getElementById('additional_driver_2_driving_license_expiration_date_month'),
                        document.getElementById('additional_driver_2_driving_license_expiration_date_year'),
                        document.getElementById('additional_driver_2_driving_license_expiration_date'),
                        commonSettings.language(model.requestLanguage),
                        undefined, 'future');
        if (model.booking.additional_driver_2_driving_license_expiration_date) {
          dateControl.setDate(model.booking.additional_driver_2_driving_license_expiration_date);
        }        
      }

      $.extend($.validator.messages, {
        required: i18next.t('complete.reservationForm.validations.fieldRequired')
      });

      $('form[name=booking_information_form]').validate(
          {   
              ignore: "",
              invalidHandler : function (form, validator) {
                alert(i18next.t('myReservation.passenger.validations.invalid'));
              },
              submitHandler: function(form) {
                  controller.btnUpdateClick();
                  return false;
              }
          }
      );

      rentEngineMediator.onMyReservationSetupReservationForm();

    },

    /**
     * Setup passengers form component
     */ 
    setupPassengersForm: function() {
      if (model.configuration.guests) {
        // Micro-template passengers is inside component
        // Initialize component passengers
        passengersComponent.view.init({ booking: model.booking, configuration: model.configuration });
      }
    },

    setupEvents: function() {
      // Electronic signature
      if ($('#js_mb_electronic_signature_link').length) {
        $('#js_mb_electronic_signature_link').on('click', function(){
          controller.electronicSignatureLinkClick();
        });
      }
    },

    setupPaymentFormValidation: function() {

        $('form[name=payment_form]').validate(
            {
                submitHandler: function(form) {

                    $('#payment_error').hide();
                    $('#payment_error').html('');
                    
                    // Payment amount
                    var paymentAmount = $('input[name=payment]').val();                        
                    
                    // Payment method
                    var paymentMethod = null;
                    if ($('input[name=payment_method_id]').length == 1) { // Just 1 payment method
                      paymentMethod = $('input[name=payment_method_id]').val();
                    }
                    else { // Multiple payment methods
                      paymentMethod = $('input[name=payment_method_select]:checked').val();
                    }

                    // Do pay
                    if (paymentMethod && paymentAmount) {
                      model.sendPayRequest(paymentAmount, paymentMethod);
                    }
                    return false;

                },
                errorClass: 'text-danger',
                rules : {
                    'payment_method_id': {
                        required: 'input[name=payment_method_id]:visible'
                    },
                    'payment_method_select': {
                        required: 'input[name=payment_method_select]:visible'
                    }
                },
                messages: {
                    'payment_method_id': i18next.t('myReservation.pay.paymentMethodRequired'),
                    'payment_method_select': i18next.t('myReservation.pay.paymentMethodRequired')
                },
                errorPlacement : function(error, element) {
                  if (element.attr('name') == 'payment_method_id')  {
                     error.insertBefore('#btn_pay');
                  }
                  else if (element.attr('name') == 'payment_method_select')  {
                     error.insertAfter(document.getElementById('payment_method_select_error'));
                  }
                  else {
                     error.insertAfter(element);
                  }
                }
            }
        );

    },

    /**
     * Payment
     */
    payment: function(url, paymentData) {

      rentEngineMediator.onExistingReservationPayment(url, paymentData);

    },
    
    /*
     * Go to the payment
     */
    gotoPayment: function(url, paymentData) {

      $.form(url, paymentData,'POST').submit();

    }


  };


  var rentMyReservation = {
    model: model,
    controller: controller,
    view: view
  }
  rentEngineMediator.setMyReservation( rentMyReservation );

  // The loader is show on start and hidden after the reservation
  // has been rendered
  commonLoader.show();

  // Load settings
  model.loadSettings();

});
