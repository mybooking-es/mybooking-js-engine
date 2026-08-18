/* eslint-disable camelcase */
/* eslint-disable max-len */
require(['jquery', 'YSDRemoteDataSource','YSDMemoryDataSource','YSDSelectSelector', 'select2',
         'commonServices', 'commonSettings', 'commonTranslations', 'commonLoader', 'commonUI',
         './mediator/rentEngineMediator',
         'i18next','ysdtemplate', 'commonDateControls',
         './passengers/passengersComponent',
         './payment/paymentComponent',
         './deposit/depositComponent',
         './documents/documentsComponent',
         './signature/signatureComponent',
         'commonAddressControls', 'commonFormValidation',
         'jquery.i18next',
         'jquery.validate', 'jquery.ui', 'jquery.form'],
    function($, RemoteDataSource, MemoryDataSource, SelectSelector, select2,
             commonServices, commonSettings, commonTranslations, commonLoader, commonUI,
             rentEngineMediator, i18next, tmpl, commonDateControls,
             passengersComponent,  paymentComponent, depositComponent, documentsComponent, signatureComponent,
             commonAddressControls, commonFormValidation
          ) {

  const model = { // THE MODEL
    requestLanguage: null,
    configuration: null,        
    bookingFreeAccessId : null,
    /* Booking */
    booking: null,
    /* Driver is customer management and fields */
    firstTimeDriverIsCustomerToggle: false,
    holdedBookingDriver: null,
    /* Sales process */
    sales_process: null,
    /* Deposit process */
    deposit_process: null,
    /* Form */
    nationalities: null,
    documentTypes: null,
    licenseTypes: null,
    required_fields: null,

    // -------------- Load settings ----------------------------

    // OPTIMIZATION 2024-01-27 START 
    /*
    loadSettings: function() {
      commonSettings.loadSettings(function(data){
        model.configuration = data;
        view.init();
      });
    },  
    */
    // OPTIMIZATION 2024-01-27 END

    // ------------ Product information detail ------------------------

    /**
    * Get the URL variables
    */ 
    getUrlVars : function() {
      let vars = [], hash;
      const hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
      for(let i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
      }
      return vars;
    },
    extractVariables: function() { // Load variables from the request
      const url_vars = this.getUrlVars();
      this.bookingFreeAccessId = decodeURIComponent(url_vars['id']);
    },

    // ----------------- Reservation ------------------------------

    /**
    * Get and set booking free access id
    */ 
    getBookingFreeAccessId: function() { /* Get the booking id */
      return sessionStorage.getItem('booking_free_access_id');
    },

    /**
    * Load booking
    */ 
    loadBooking: function() { /** Load the reservation **/
       let bookingId = this.bookingFreeAccessId;
       if (bookingId == '') {
         bookingId = this.getBookingFreeAccessId();
       }

       // Build the URL
       let url = commonServices.URL_PREFIX + '/api/booking/frontend/booking/' +
                 bookingId;
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
                 // OPTIMIZATION 2024-01-27 END

                 model.booking = data.booking;
                 model.storeOriginalDriverCustomer(model.booking);
                 model.required_fields = data.required_fields;
                 model.bookingFreeAccessId = data.booking.free_access_id;
                 model.sales_process = data.sales_process;
                 model.deposit_process = data.deposit_process;

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

    /**
    * Update the reservation
    */ 
    update: function() {
        // Build request
        const reservation = $('form[name=booking_information_form]').formParams(false);

        const booking_line_resources = reservation['booking_line_resources'];
        delete reservation['booking_line_resources'];
        reservation['booking_line_resources'] = [];
        for (let item in booking_line_resources) {
            reservation['booking_line_resources'].push(booking_line_resources[item]);
        }

        // Set driver si customer to boolean
        const driver_is_customer = reservation['driver_is_customer'] === 'on';
        reservation['driver_is_customer'] = driver_is_customer;

        // Prefix
        if ($('input[name=customer_phone]').length && $('input[name=customer_phone]').is(':enabled')){
          var countryData = $('input[name=customer_phone]').intlTelInput('getSelectedCountryData');
          if (countryData != null) {
            reservation.customer_phone_prefix = countryData.dialCode;
          }
        }
        if ($('input[name=driver_phone]').length && $('input[name=driver_phone]').is(':enabled')){
          var driverCountryData = $('input[name=driver_phone]').intlTelInput('getSelectedCountryData');
          if (driverCountryData != null) {
            reservation.driver_phone_prefix = driverCountryData.dialCode;
          }
        }


        // Remove all empty fields
        for (let prop in reservation) {
          
          if (reservation[prop] === undefined || reservation[prop] === '' || reservation[prop] === null) {  
              delete reservation[prop];
              continue;
          }

          // Remove all empty fields in objects
          if (typeof reservation[prop] === 'object') {
            for (let subprop in reservation[prop]) {
              if (reservation[prop][subprop] === undefined || reservation[prop][subprop] === '') {
                delete reservation[prop][subprop];
              }
            }

            // Delete objtect if empty
            if (Object.keys(reservation[prop]).length === 0) {
              delete reservation[prop];
            }
          }
        } 

        const reservationJSON = encodeURIComponent(JSON.stringify(reservation));

        // Build URL
        let url = commonServices.URL_PREFIX + '/api/booking/frontend/booking/' + this.bookingFreeAccessId;
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
                  // Refresh original values
                  model.storeOriginalDriverCustomer(model.booking);              
                  view.updateBooking();
                }

                alert(i18next.t('myReservation.updateReservation.success'));
            },
            error: function(data, textStatus, jqXHR) {
                alert(i18next.t('myReservation.updateReservation.error'));
            }
        });
    },

    /**
     * Store the original driver information
     * @param {*} booking 
     */
    storeOriginalDriverCustomer: function(booking) {

      model.firstTimeDriverIsCustomerToggle = false;
      // Hold the original values from the API
      model.holdedBookingDriver = {};
      // Customer
      model.holdedBookingDriver.customer_name = booking.customer_name;
      model.holdedBookingDriver.customer_surname = booking.customer_surname;
      model.holdedBookingDriver.customer_nacionality = booking.customer_nacionality;
      model.holdedBookingDriver.customer_document_id_type_id = booking.customer_document_id_type_id;
      model.holdedBookingDriver.customer_document_id = booking.customer_document_id;
      if (model.configuration.rentingFormFillDataAddress) {
        model.holdedBookingDriver.customer_address_street = booking.address_street;
        model.holdedBookingDriver.customer_address_number = booking.address_number;
        model.holdedBookingDriver.customer_address_complement = booking.address_complement;
        model.holdedBookingDriver.customer_address_city = booking.address_city;
        model.holdedBookingDriver.customer_address_city_code = booking.address_city_code;
        model.holdedBookingDriver.customer_address_state = booking.address_state;
        model.holdedBookingDriver.customer_address_state_code = booking.address_state_code;
        model.holdedBookingDriver.customer_address_country_code = booking.address_country_code;
        model.holdedBookingDriver.customer_address_zip = booking.address_zip;
      }
      // Driver
      model.holdedBookingDriver.driver_name = booking.driver_name;
      model.holdedBookingDriver.driver_surname = booking.driver_surname;
      model.holdedBookingDriver.driver_nacionality = booking.driver_nacionality;
      model.holdedBookingDriver.driver_document_id_type_id = booking.driver_document_id_type_id;
      model.holdedBookingDriver.driver_document_id = booking.driver_document_id;      
      model.holdedBookingDriver.driver_driving_license_type_id = booking.driver_driving_license_type_id;      
      model.holdedBookingDriver.driver_driving_license_type = booking.driver_driving_license_type;
      model.holdedBookingDriver.driver_driving_license_number = booking.driver_driving_license_number;         
    },

    // ----------------- Load forms data ------------------------------

    /*
    * Load nationalities
    */
    loadNationalities: function() {
      // Load nationalities
      // Build the URL
      let url = commonServices.URL_PREFIX + '/api/booking/frontend/nacionalities';
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
      $.ajax({
          type: 'GET',
          url : url,
          dataType : 'json',
          contentType : 'application/json; charset=utf-8',
          crossDomain: true,
          success: function(data, textStatus, jqXHR) {
            model.nationalities = data;
            view.formatNationalities(data);
          }
      });
    },

    /*
    * Load document types
    */
   loadDocumentTypes: function async() {
      // Load document types
      // Build the URL
      let url = commonServices.URL_PREFIX + '/api/booking/frontend/document-types';
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
      $.ajax({
          type: 'GET',
          url : url,
          dataType : 'json',
          contentType : 'application/json; charset=utf-8',
          crossDomain: true,
          success: function(data, textStatus, jqXHR) {
            model.documentTypes = data;
            view.formatDocumentTypes(data);
          }
      });
    },

    /*
    * Load license types
    */
    loadLicenseTypes: function async() {
      // Load document types
      // Build the URL
      let url = commonServices.URL_PREFIX + '/api/booking/frontend/license-types';
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
      $.ajax({
          type: 'GET',
          url : url,
          dataType : 'json',
          contentType : 'application/json; charset=utf-8',
          crossDomain: true,
          success: function(data, textStatus, jqXHR) {
            model.licenseTypes = data;
            view.formatLicenseTypes(data);
          }
      });
    },


  };

  const controller = { // THE CONTROLLER
    // ----------------- Reservation ------------------------------

    /**
    * Update the reservation
    */ 
    btnUpdateClick: function() {
      model.update();
    },
    
    // ----------------- Form ------------------------------

    /**
     * On Change the country
     * @param {*} country 
     * @param {*} stateName 
     * @param {*} cityName 
     */
    onChangeCountry: function(country, stateCodeSelector, stateNameSelector, cityCodeSelector, cityNameSelector) {

      console.log('Country changed', country, stateCodeSelector, stateNameSelector, cityCodeSelector, cityNameSelector);

      if (country === 'ES') {
        // Hide inputs
        $(stateNameSelector).hide();
        $(cityNameSelector).hide();
        // Show selectors
        $(stateCodeSelector).show();
        $(cityCodeSelector).show();
      } else {
        // Hide selectors
        $(stateCodeSelector).hide();
        $(cityCodeSelector).hide();
        // Show inputs
        $(stateNameSelector).show();  
        $(cityNameSelector).show();        
      }

    },

    /**
    * Load nationalities
    */ 
    loadNationalities: function() {
      if (this.nationalities && this.nationalities.length > 0) {
        view.formatNationalities(this.nationalities);
        return;
      }

      model.loadNationalities();
    },

    /**
    * Load document types
    */ 
    loadDocumentTypes: function() {
      if (this.documentTypes && this.documentTypes.length > 0) {
        view.formatDocumentTypes(this.documentTypes);
        return;
      }

      model.loadDocumentTypes();
    },

    /**
    * Load license types
    */ 
    loadLicenseTypes: function() {
      if (this.licenseTypes && this.licenseTypes.length > 0) {
        view.formatLicenseTypes(this.licenseTypes);
        return;
      }

      model.loadLicenseTypes();
    },

    /**
     * toggle driver panel click
     */
    toggleDriverPanelClick: function() {

      const driverIsCustomer = $('input[name=driver_is_customer]').is(':checked');

      if (driverIsCustomer) {
        
        // => From driver and customer to driver is customer

        // Get the current values from the form (in case of toggle again) to improve user experience
        model.holdedBookingDriver.customer_name = $('input[name=customer_name]').val();
        model.holdedBookingDriver.customer_surname = $('input[name=customer_surname]').val();
        model.holdedBookingDriver.customer_nacionality = $('select[name=customer_nacionality]').val();
        model.holdedBookingDriver.customer_document_id_type_id = $('select[name=customer_document_id_type_id]').val();
        model.holdedBookingDriver.customer_document_id = $('input[name=customer_document_id]').val();
        if (model.configuration.rentingFormFillDataAddress) {
          model.holdedBookingDriver.customer_address_street = $('input[name=customer_address\\[street\\]]').val();
          model.holdedBookingDriver.customer_address_number = $('input[name=customer_address\\[number\\]]').val();
          model.holdedBookingDriver.customer_address_complement = $('input[name=customer_address\\[complement\\]]').val();
          model.holdedBookingDriver.customer_address_city = $('input[name=customer_address\\[city\\]]').val();
          model.holdedBookingDriver.customer_address_city_code = $('select[name=customer_address\\[city_code\\]]').val();
          model.holdedBookingDriver.customer_address_state = $('input[name=customer_address\\[state\\]]').val();
          model.holdedBookingDriver.customer_address_state_code = $('select[name=customer_address\\[state_code\\]]').val();
          model.holdedBookingDriver.customer_address_country_code = $('select[name=customer_address\\[country_code\\]]').val();
          model.holdedBookingDriver.customer_address_zip = $('input[name=customer_address\\[zip\\]]').val();
        }
        model.holdedBookingDriver.driver_name = $('input[name=driver_name]').val();
        model.holdedBookingDriver.driver_surname = $('input[name=driver_surname]').val();
        model.holdedBookingDriver.driver_nacionality = $('select[name=driver_nacionality]').val();
        model.holdedBookingDriver.driver_document_id_type = $('select[name=driver_document_id_type]').val();
        model.holdedBookingDriver.driver_document_id_type_id = $('select[name=driver_document_id_type_id]').val();
        model.holdedBookingDriver.driver_document_id = $('input[name=driver_document_id]').val();
        model.holdedBookingDriver.driver_driving_license_type = $('input[name=driver_driving_license_type]').val();
        model.holdedBookingDriver.driver_driving_license_type_id = $('select[name=driver_driving_license_type_id]').val();
        model.holdedBookingDriver.driver_driving_license_number = $('input[name=driver_driving_license_number]').val();

        // Clear Driver panel
        $('#driver_panel_container').empty();

        // To improve user experience when toggle
        if (!model.firstTimeDriverIsCustomerToggle) {
          // When toggle assign customer details to driver (both are the same person)
          model.booking.driver_name = model.booking.customer_name;
          model.booking.driver_surname = model.booking.customer_surname;
          model.booking.driver_nacionality = model.booking.customer_nacionality;
          model.booking.driver_document_id_type_id = model.booking.customer_document_id_type_id;
          model.booking.driver_document_id = model.booking.customer_document_id;
          if (model.configuration.rentingFormFillDataAddress) {
            model.booking.driver_address_street = model.booking.address_street;
            model.booking.driver_address_number = model.booking.address_number;
            model.booking.driver_address_complement = model.booking.address_complement;
            model.booking.driver_address_city = model.booking.address_city;
            model.booking.driver_address_city_code = model.booking.address_city_code;
            model.booking.driver_address_state = model.booking.address_state;
            model.booking.driver_address_state_code = model.booking.address_state_code;
            model.booking.driver_address_country_code = model.booking.address_country_code;
            model.booking.driver_address_zip = model.booking.address_zip;
          }
          // check to avoid done in each click
          model.firstTimeDriverIsCustomerToggle = true; 
        } else {
          model.booking.driver_name = model.holdedBookingDriver.customer_name;
          model.booking.driver_surname = model.holdedBookingDriver.customer_surname;
          model.booking.driver_nacionality = model.holdedBookingDriver.customer_nacionality;
          model.booking.driver_document_id_type_id = model.holdedBookingDriver.customer_document_id_type_id;
          model.booking.driver_document_id = model.holdedBookingDriver.customer_document_id;
          if (model.configuration.rentingFormFillDataAddress) {
            model.booking.driver_address_street = model.holdedBookingDriver.customer_address_street;
            model.booking.driver_address_number = model.holdedBookingDriver.customer_address_number;
            model.booking.driver_address_complement = model.holdedBookingDriver.customer_address_complement;
            model.booking.driver_address_city = model.holdedBookingDriver.customer_address_city;
            model.booking.driver_address_city_code = model.holdedBookingDriver.customer_address_city_code;
            model.booking.driver_address_state = model.holdedBookingDriver.customer_address_state;
            model.booking.driver_address_state_code = model.holdedBookingDriver.customer_address_state_code;
            model.booking.driver_address_country_code = model.holdedBookingDriver.customer_address_country_code;
            model.booking.driver_address_zip = model.holdedBookingDriver.customer_address_zip;    
          }      
        }

        // Customer panel
        // Include customer driver form
        if (document.getElementById('script_reservation_form_customer_driver')) {
          const reservationFormCustomerDriver = tmpl('script_reservation_form_customer_driver')(
            {booking: model.booking,
             required_fields: model.required_fields,
             configuration: model.configuration});
          $('#customer_panel_container').html(reservationFormCustomerDriver);
        }

      } else {

        // => From driver is customer to customer and driver

        // To improve user experience when toggle
        if (model.holdedBookingDriver !== null) {
          model.booking.customer_name = model.holdedBookingDriver.customer_name;
          model.booking.customer_surname = model.holdedBookingDriver.customer_surname;
          model.booking.customer_nacionality = model.holdedBookingDriver.customer_nacionality;
          model.booking.customer_document_id_type_id = model.holdedBookingDriver.customer_document_id_type_id;
          model.booking.customer_document_id = model.holdedBookingDriver.customer_document_id;
          model.booking.driver_name = model.holdedBookingDriver.driver_name;
          model.booking.driver_surname = model.holdedBookingDriver.driver_surname;
          model.booking.driver_nacionality = model.holdedBookingDriver.driver_nacionality;
          model.booking.driver_document_id_type_id = model.holdedBookingDriver.driver_document_id_type_id;
          model.booking.driver_document_id = model.holdedBookingDriver.driver_document_id; 
          model.booking.driver_driving_license_type = model.holdedBookingDriver.driver_driving_license_type;
          model.booking.driver_driving_license_type_id = model.holdedBookingDriver.driver_driving_license_type_id;
          model.booking.driver_driving_license_number = model.holdedBookingDriver.driver_driving_license_number;            
        }

        // Driver panel
        // Include reservation drivers form
        if (document.getElementById('script_reservation_form_driver')) {
          const reservationFormDriver = tmpl('script_reservation_form_driver')(
            {booking: model.booking,
             required_fields: model.required_fields,
             configuration: model.configuration});
          $('#driver_panel_container').html(reservationFormDriver);
        }

        // Customer panel
        // Include customer form
        if (document.getElementById('script_reservation_form_customer')) {
          const reservationFormCustomer = tmpl('script_reservation_form_customer')(
            {booking: model.booking,
             required_fields: model.required_fields,
             configuration: model.configuration});
          $('#customer_panel_container').html(reservationFormCustomer);
        }
      }

      // Setup select controls
      view.setupSelectControls();

      // Setup phone controls
      view.setupPhoneControls();

      // Setup date controls
      view.setupDateControls();
    },

     /**
     * toggle additional driver panel click
     */ 
    toggleAdditionalDriversPanelClick: function(event) {
      const target = $(event.currentTarget);
      const icon = target.find('.dashicons');
      const isOpened = target.hasClass('mb-open');
      const panel = $('#' + target.attr('data-panel'));

      if (panel.length > 0 && !isOpened) {
        panel.show();
        target.addClass('mb-open');
        icon.removeClass('dashicons-arrow-down-alt2');
        icon.addClass('dashicons-arrow-up-alt2');
      } else {
        panel.hide();
        target.removeClass('mb-open');
        icon.removeClass('dashicons-arrow-up-alt2');
        icon.addClass('dashicons-arrow-down-alt2');
      }
    },
  };

  const view = { // THE VIEW
    init: function() {
      // Append validators
      commonSettings.appendValidators();
      // Initialize i18next for translations
      model.requestLanguage = commonSettings.language(document.documentElement.lang);
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

      // Setup UI          
      model.extractVariables();
      // Load booking
      model.loadBooking();
    },

    // ----------------- Reservation ------------------------------

    /**
    * Update the reservation
    */ 
    updateBooking: function() { // Updates the reservation
      // Update status
      this.updateStatusTitle();

      // Update booking summary
      this.updateBookingSummary();

      // Setup forms
      this.setupReservationForm();
      this.setupPassengersForm();

      // Setup events
      this.setupEvents();

      // Make sure the first step is active (old reservations)
      if ($('#contract_signature_container').length > 0 && model.booking.contract_signed) {
        $('#contract_signature_container').addClass('mb--active');
      }      
      else if ($('.mb--step-container.mb--active').length == 0) {
        $('.mb--step-container').first().addClass('mb--active');
      }

      // Hide loader
      commonLoader.hide();
    },

    /**
    * Update status title
    */ 
    updateStatusTitle: function() {
      $('#reservation_title').html(model.booking.summary_status);
    },

    /**
    * Updates the shopping cart summary (total)
    */ 
    updateBookingSummary: function() {
      // Autorization to complete the reservation
      const showReservationForm = model.booking.manager_complete_authorized;

      // Include reservation steps (only if the reservation form is shown)
      if (showReservationForm) {
        if (document.getElementById('script_reservation_steps')) {
          const reservationSteps = tmpl('script_reservation_steps')(
            {
              booking: model.booking,
              sales_process: model.sales_process,
              deposit_process: model.deposit_process,
            });
          $('#mybooking_reservation_steps').html(reservationSteps);
        }
      }

      // Include reservation summary
      if (document.getElementById('script_reservation_summary')) {
        const reservationDetail = tmpl('script_reservation_summary')(
            {
              booking: model.booking,
              sales_process: model.sales_process,
              deposit_process: model.deposit_process,
              configuration: model.configuration,
              showReservationForm,
            });
        $('#reservation_detail').html(reservationDetail);
      }

      // Include summary table (if multiple items)
      if (model.configuration.multipleProductsSelection && 
          document.getElementById('script_mybooking_summary_product_detail_table')) {
        const reservationTableDetail = tmpl('script_mybooking_summary_product_detail_table')({
          bookings: model.booking.booking_lines,
          configuration: model.configuration
        });
        $('#mybooking_summary_product_detail_table').html(reservationTableDetail);
      }

      // Include reservation form
      if (showReservationForm) {
        // The reservation form fields are defined in a micro-template
        const locale = model.requestLanguage;
        const localeReservationFormScript = 'script_reservation_form_' + locale;

        if (locale != null && document.getElementById(localeReservationFormScript)) {
          const reservationForm = tmpl(localeReservationFormScript)({booking: model.booking,
                                                                    required_fields: model.required_fields,
                                                                    configuration: model.configuration});
          $('form[name=reservation_form]').html(reservationForm);           
        }
        // Micro-template reservation
        else if (document.getElementById('script_reservation_form')) {
          // Include reservation form)
          const reservationForm = tmpl('script_reservation_form')(
              {booking: model.booking,
                required_fields: model.required_fields,
                configuration: model.configuration});
          $('#reservation_form_container').html(reservationForm);
          $('#reservation_form_container').show();
        }

        // Include reservation 'customer' form
        const hasCustomizationDriver = (typeof model.booking.customer_customization !== 'undefined' && 
                                        model.booking.customer_customization !== null &&
                                        typeof model.booking.customer_customization.driver !== 'undefined' &&
                                        model.booking.customer_customization.driver);
        if (hasCustomizationDriver && 
            model.configuration.rentingFormFillDataDriverDetail && 
            !model.booking.has_optional_external_driver && 
            (model.booking.driver_type == 'driver' || model.booking.driver_type == 'skipper') && 
            model.booking.driver_is_customer) {
          if (document.getElementById('script_reservation_form_customer_driver')) {
            const reservationFormCustomerDriver = tmpl('script_reservation_form_customer_driver')(
              {booking: model.booking,
                required_fields: model.required_fields,
                configuration: model.configuration});
            $('#customer_panel_container').html(reservationFormCustomerDriver);
          }
        } 
        else {
          if (document.getElementById('script_reservation_form_customer')) {
            const reservationFormCustomer = tmpl('script_reservation_form_customer')(
                  {booking: model.booking,
                    required_fields: model.required_fields,
                    configuration: model.configuration});
            $('#customer_panel_container').html(reservationFormCustomer);
          }
        }

        // Include reservation 'driver' form
        if (hasCustomizationDriver &&
            model.configuration.rentingFormFillDataDriverDetail && 
            !model.booking.has_optional_external_driver && 
            !model.booking.driver_is_customer && document.getElementById('script_reservation_form_driver')) {
          const reservationFormDriver = tmpl('script_reservation_form_driver')(
                {booking: model.booking,
                  required_fields: model.required_fields,
                  configuration: model.configuration});
          $('#driver_panel_container').html(reservationFormDriver);
        }
      }

      // Initialize payment component
      paymentComponent.view.init(model.bookingFreeAccessId, model.sales_process, 
                                 model.booking, model.configuration, rentEngineMediator);
      paymentComponent.model.addListener('payment', function(event){
        if (event.type === 'payment') {
          const url = event.data.url;
          const paymentData = event.data.paymentData;
          view.payment(url, paymentData);
        }
      });

      // Initialize deposit component
      if (model.deposit_process && model.deposit_process.can_receive_deposit && !model.booking.deposit_received) {
        depositComponent.view.init(model.bookingFreeAccessId, model.deposit_process, 
                                   model.booking, model.configuration, rentEngineMediator);
        depositComponent.model.addListener('deposit_payment', function(event){
          if (event.type === 'deposit_payment') {
            const url = event.data.url;
            const paymentData = event.data.paymentData;
            depositComponent.view.depositPayment(url, paymentData);
          }
        });
      }

      // Include documents upload and contract signature
      if (showReservationForm) {
        if (document.getElementById('script_documents_upload')) {
          const documentsUpload = tmpl('script_documents_upload')(
              {booking: model.booking,
                configuration: model.configuration});
          $('#documents_upload_container').html(documentsUpload);
        }

        // Include signature view
        if (document.getElementById('script_contract_signature')) {
          const contractSignature = tmpl('script_contract_signature')(
              {booking: model.booking,
                configuration: model.configuration});
          $('#contract_signature_container').html(contractSignature);
        }
        // Initialize documents component
        documentsComponent.view.init(model.booking);

        // Initialize signature component
        signatureComponent.view.init(model.booking);
      }

    },

    // ----------------- Form ------------------------------

    /**
    * Load selects options
    */ 
    formatCountries: function() {
      const values = [
        model.booking.address_country,
        model.booking.driver_address_country,
        model.booking.driver_origin_country,
        model.booking.driver_driving_license_country,
        model.booking.additional_driver_1_origin_country,
        model.booking.additional_driver_1_driving_license_country,
        model.booking.additional_driver_2_origin_country,
        model.booking.additional_driver_2_driving_license_country,
      ];
      const selectors = [
        'select[name=customer_address\\[country\\]]',
        'select[name=driver_address\\[country\\]]',
        'select[name=driver_origin_country]',
        'select[name=driver_driving_license_country]',
        'select[name=additional_driver_1_origin_country]',
        'select[name=additional_driver_1_driving_license_country]',
        'select[name=additional_driver_2_origin_country]',
        'select[name=additional_driver_2_driving_license_country]',
      ];
      for (let idx = 0; idx < selectors.length; idx++) {
        commonAddressControls.initCountrySelector(
          $(selectors[idx]),
          (typeof values[idx] !== 'undefined' ? values[idx] : ''),
          {requestLanguage: model.requestLanguage}
        );
      }
    },

    /*
    * Format nationalities for select
    */
    formatNationalities: function(data) {
      const formatData = [];
      for (let idx=0; idx<data.length; idx++) {
        formatData[idx] = {
          id: data[idx].code,
          text: data[idx].name,
          description: data[idx].name
        };
      }

      const values = [
        model.booking.customer_nacionality,
        model.booking.driver_nacionality,
        model.booking.additional_driver_1_nacionality,
        model.booking.additional_driver_2_nacionality,
      ]; 

      if (commonServices.jsUseSelect2) {
        // Configure address country
        const selectors = [
          'select[name=customer_nacionality]',
          'select[name=driver_nacionality]',
          'select[name=additional_driver_1_nacionality]',
          'select[name=additional_driver_2_nacionality]'
        ];
        let $nationalitySelector = null;
        for (let idx=0; idx<selectors.length; idx++) { 
          $nationalitySelector = $(selectors[idx]);    
          if ($nationalitySelector.length > 0 && typeof values[idx] !== 'undefined') {
            $nationalitySelector.select2({
              width: '100%',
              theme: 'bootstrap4',                  
              data: formatData,
              placeholder: i18next.t('common.selectOption'),
            });
            // Assign value
            $nationalitySelector.val(values[idx]);
            $nationalitySelector.trigger('change');
          }
        }
      } else {
        // Setup country selector
        const selectors = [
          'customer_nacionality',
          'driver_nacionality',
          'additional_driver_1_nacionality',
          'additional_driver_2_nacionality'
        ];
        for (let idx=0; idx<selectors.length; idx++) {
          const elements = document.getElementsByName(selectors[idx]);
          if (elements.length > 0) {
            const nationalitiesDataSource = new MemoryDataSource(formatData);
            const nationalityModel = (values[idx] == null ? '': values[idx]);
            for (let j=0; j<elements.length; j++) {
              new SelectSelector(selectors[idx],
                nationalitiesDataSource, nationalityModel, true, i18next.t('myReservation.select_nationality'));
            }
          }
        }
      }
    },

    /*
    * Format document types for select
    */
    formatDocumentTypes: function(data) {
      const formatData = [];
      for (let idx=0; idx<data.length; idx++) {
        formatData[idx] = {
          id: data[idx].id,
          text: data[idx].label,
          description: data[idx].label
        };
      }

      const values = [
        model.booking.customer_document_id_type_id,
        model.booking.driver_document_id_type_id,
        model.booking.additional_driver_1_document_id_type_id,
        model.booking.additional_driver_2_document_id_type_id,
      ]; 

      if (commonServices.jsUseSelect2) {
        // Configure address country
        const selectors = [
          'select[name=customer_document_id_type_id]',
          'select[name=driver_document_id_type_id]',
          'select[name=additional_driver_1_document_id_type_id]',
          'select[name=additional_driver_2_document_id_type_id]',
        ];
        let $nationalitySelector = null;
        for (let idx=0; idx<selectors.length; idx++) { 
          $nationalitySelector = $(selectors[idx]);    
          if ($nationalitySelector.length > 0 && typeof values[idx] !== 'undefined') {
            $nationalitySelector.select2({
              width: '100%',
              theme: 'bootstrap4',                  
              data: formatData,
              placeholder: i18next.t('common.selectOption'),
            });
            // Assign value
            $nationalitySelector.val(values[idx]);
            $nationalitySelector.trigger('change');
          }
        }
      } else {
        // Setup country selector
        const selectors = [
          'customer_document_id_type_id',
          'driver_document_id_type_id',
          'additional_driver_1_document_id_type_id',
          'additional_driver_2_document_id_type_id',
        ];
        for (let idx=0; idx<selectors.length; idx++) {
          const elements = document.getElementsByName(selectors[idx]);
          if (elements.length > 0) {
            const countriesDataSource = new MemoryDataSource(formatData);
            const countryModel = (values[idx] == null ? '': values[idx]);
            for (let j=0; j<elements.length; j++) {
              new SelectSelector(selectors[idx],
                countriesDataSource, countryModel, true, i18next.t('myReservation.select_type_document'));
            }
          }
        }
      }
    },

    /*
    * Format license types for select
    */
    formatLicenseTypes: function(data) {
        const formatData = [];
        for (let idx=0; idx<data.length; idx++) {
          formatData[idx] = {
            id: data[idx].id,
            text: data[idx].label,
            description: data[idx].label
          };
        }

        const values = [
          model.booking.driver_driving_license_type_id,
          model.booking.additional_driver_1_driving_license_type_id,
          model.booking.additional_driver_2_driving_license_type_id,
        ]; 

        if (commonServices.jsUseSelect2) {
          // Configure address country
          const selectors = [
            'select[name=driver_driving_license_type_id]',
            'select[name=additional_driver_1_driving_license_type_id]',
            'select[name=additional_driver_2_driving_license_type_id]',
          ];
          let $nationalitySelector = null;
          for (let idx=0; idx<selectors.length; idx++) { 
            $nationalitySelector = $(selectors[idx]);    
            if ($nationalitySelector.length > 0 && typeof values[idx] !== 'undefined') {
              $nationalitySelector.select2({
                width: '100%',
                theme: 'bootstrap4',                  
                data: formatData,
                placeholder: i18next.t('common.selectOption'),
              });
              // Assign value
              $nationalitySelector.val(values[idx]);
              $nationalitySelector.trigger('change');
            }
          }
        } else {
          // Setup country selector
          const selectors = [
            'driver_driving_license_type_id',
            'additional_driver_1_driving_license_type_id',
            'additional_driver_2_driving_license_type_id',
          ];
          for (let idx=0; idx<selectors.length; idx++) {
            const elements = document.getElementsByName(selectors[idx]);
            if (elements.length > 0) {
              const countriesDataSource = new MemoryDataSource(formatData);
              const countryModel = (values[idx] == null ? '': values[idx]);
              for (let j=0; j<elements.length; j++) {
                new SelectSelector(selectors[idx],
                  countriesDataSource, countryModel, true, i18next.t('myReservation.select_type_document'));
              }
            }
          }
        }
    },

    /*
    * Setup date controls in form
    */
    setupDateControls: function() {
      const $form = $('form[name=booking_information_form]');
      commonDateControls.setup({
        root: $form,
        locale: commonSettings.language(model.requestLanguage),
        getInitialValue: function(name) {
          return model.booking[name];
        },
        legacyDirections: {
          driver_document_id_expiration_date: 'future',
          driver_driving_license_expiration_date: 'future',
          additional_driver_1_document_id_expiration_date: 'future',
          additional_driver_1_driving_license_expiration_date: 'future',
          additional_driver_2_document_id_expiration_date: 'future',
          additional_driver_2_driving_license_expiration_date: 'future'
        }
      });

      // Driver/customer panels can be re-rendered after validation is already active.
      // Apply rules to newly inserted date composites without rebuilding the validator.
      if ($form.data('validator')) {
        commonDateControls.applyValidationRules(
          $form,
          i18next.t('complete.reservationForm.validations.datePatternInvalid')
        );
      }
    },

    /**
    * Setup phone controls in form
    */
    setupPhoneControls: function() {
      // Configure Telephone with prefix
      let countryCode = model.configuration.countryCode;
      let input = $('[name="customer_phone"]');
      if (typeof countryCode === 'undefined' || countryCode == null) {
        countryCode = commonUI.intlTelInputCountryCode(); 
      }
      if (input.length) {
        input.intlTelInput({
          initialCountry: countryCode,
          separateDialCode: true,        
          utilsScript: commonServices.phoneUtilsPath,
          preferredCountries: [countryCode],
        });
        if (model.booking.customer_phone_prefix &&
            model.booking.customer_phone_prefix !== '') {
          let phoneNumber = model.booking.customer_phone;
          if (phoneNumber === null) {
            phoneNumber = '';
          }
          let fullNumber = '+'+model.booking.customer_phone_prefix+phoneNumber;
          input.intlTelInput('setNumber', fullNumber);
        }
      }
      // Configure Driver phone with prefix
      input = $('[name="driver_phone"]');
      if (typeof countryCode === 'undefined' || countryCode == null) {
        countryCode = commonUI.intlTelInputCountryCode(); 
      }
      if (input.length) {
        input.intlTelInput({
          initialCountry: countryCode,
          separateDialCode: true,        
          utilsScript: commonServices.phoneUtilsPath,
          preferredCountries: [countryCode],
        });
        if (model.booking.driver_phone_prefix &&
            model.booking.driver_phone_prefix !== '') {
          let phoneNumber = model.booking.driver_phone;
          if (phoneNumber === null) {
            phoneNumber = '';
          }
          let fullNumber = '+'+model.booking.driver_phone_prefix+phoneNumber;
          input.intlTelInput('setNumber', fullNumber);
        }
      }      
    },

    /*
    * Setup selects controls in form
    */
    setupSelectControls: function() {

      // Customer address SES descriptor
      commonAddressControls.initAddressDescriptor({
        enabled: !!model.configuration.sesHospedajes,
        requestLanguage: model.requestLanguage,
        countrySelector: 'select[name=customer_address\\[country\\]]',
        countryValue: model.booking.address_country,
        stateTextSelector: '[name="customer_address[state]"]',
        stateCodeSelector: 'select[name=customer_address\\[state_code\\]]',
        stateCodeUiSelector: '.customer_address_state_code_container',
        cityTextSelector: '[name="customer_address[city]"]',
        cityCodeSelector: 'select[name=customer_address\\[city_code\\]]',
        cityCodeUiSelector: '.customer_address_city_code_container',
        stateTextValue: model.booking.address_state,
        stateCodeValue: model.booking.address_state_code,
        cityTextValue: model.booking.address_city,
        cityCodeValue: model.booking.address_city_code,
        stateRequired: model.required_fields.includes('customer_address[state]'),
        cityRequired: model.required_fields.includes('customer_address[city]'),
        locked: !model.booking.can_edit_online
      });

      // Driver address SES descriptor
      var driverStateRequired =
        model.required_fields.includes('driver_address[state]') ||
        (model.booking.driver_is_customer &&
         model.required_fields.includes('customer_address[state]'));
      var driverCityRequired =
        model.required_fields.includes('driver_address[city]') ||
        (model.booking.driver_is_customer &&
         model.required_fields.includes('customer_address[city]'));
      commonAddressControls.initAddressDescriptor({
        enabled: !!model.configuration.sesHospedajes,
        requestLanguage: model.requestLanguage,
        countrySelector: 'select[name=driver_address\\[country\\]]',
        countryValue: model.booking.driver_address_country,
        stateTextSelector: '[name="driver_address[state]"]',
        stateCodeSelector: 'select[name=driver_address\\[state_code\\]]',
        stateCodeUiSelector: '.driver_address_state_code_container',
        cityTextSelector: '[name="driver_address[city]"]',
        cityCodeSelector: 'select[name=driver_address\\[city_code\\]]',
        cityCodeUiSelector: '.driver_address_city_code_container',
        stateTextValue: model.booking.driver_address_state,
        stateCodeValue: model.booking.driver_address_state_code,
        cityTextValue: model.booking.driver_address_city,
        cityCodeValue: model.booking.driver_address_city_code,
        stateRequired: driverStateRequired,
        cityRequired: driverCityRequired,
        locked: !model.booking.can_edit_online
      });

      // Load countries and set value if exists
      this.formatCountries();
      // Load nationalities and set value if exists
      model.loadNationalities();
      // Load document types and set value if exists
      model.loadDocumentTypes();
      // Load license types and set value if exists
      model.loadLicenseTypes();
    },

    /**
    * Setup reservation form
    */
    setupReservationForm: function() {
      // Setup select controls
      this.setupSelectControls();

      // Setup date controls (modern wrappers + generic legacy fallback)
      this.setupDateControls();

      // Setup phone controls
      this.setupPhoneControls();

      $.extend($.validator.messages, {
        required: i18next.t('complete.reservationForm.validations.fieldRequired')
      });

      $('form[name=booking_information_form]').data('validator', null);
      $('form[name=booking_information_form]').unbind('validate');
      $('form[name=booking_information_form]').validate(
          {   
            ignore: '',
            invalidHandler : function(form, validator) {
              $('#additional_drivers_toggle_btn').trigger('click');
              alert(i18next.t('myReservation.passenger.validations.invalid'));
            },
            submitHandler: function(form) {
              controller.btnUpdateClick();
              return false;
            },
            rules : {
              'customer_company_name': {
                required: () => $('[name="customer_company_name"]').is(':visible') && $('[name="customer_company_name"]').prop('required'),
              },
              'customer_company_document_id': {
                required: () => $('[name="customer_company_document_id"]').is(':visible') && $('[name="customer_company_document_id"]').prop('required'),
              },
              'customer_name': {
                required: () => $('[name="customer_name"]').is(':visible') && $('[name="customer_name"]').prop('required'),
              },
              'customer_surname': {
                required: () => $('[name="customer_surname"]').is(':visible') && $('[name="customer_surname"]').prop('required'),
              },
              'customer_email': {
                required: () => $('[name="customer_email"]').is(':visible') && $('[name="customer_email"]').prop('required'),
                email: () => $('[name="customer_email"]').is(':visible') && $('[name="customer_email"]').prop('required'),
              },
              'customer_phone': {
                required: () => $('[name="customer_phone"]').is(':visible') && $('[name="customer_phone"]').prop('required'),
                minlength: 9
              },
              'customer_nacionality': {
                required: () => $('[name="customer_nacionality"]').is(':visible') && $('[name="customer_nacionality"]').prop('required'),
              },
              'driver_nacionality': {
                required: () => $('[name="driver_nacionality"]').is(':visible') && $('[name="driver_nacionality"]').prop('required'),
              },
              'customer_document_id_type_id': {
                required: () => $('[name="customer_document_id_type_id"]').is(':visible') && $('[name="customer_document_id_type_id"]').prop('required'),
              },
              'driver_document_id_type_id': {
                required: () => $('[name="driver_document_id_type_id"]').is(':visible') && $('[name="driver_document_id_type_id"]').prop('required'),
              },
              'driver_email': {
                required: () => $('[name="driver_email"]').is(':visible') && $('[name="driver_email"]').prop('required'),
                email: () => $('[name="driver_email"]').is(':visible') && $('[name="driver_email"]').prop('required'),
              },
              'driver_phone': {
                required: () => $('[name="driver_phone"]').is(':visible') && $('[name="driver_phone"]').prop('required'),
                minlength: 9
              },
              'customer_document_id': {
                required: () => $('[name="customer_document_id"]').is(':visible') && $('[name="customer_document_id"]').prop('required'),
                //documentValidator: {
                //  documentTypeControlId: 'select[name=customer_document_id_type_id]',
                //}
              },
              'driver_document_id': {
                required: () => $('[name="driver_document_id"]').is(':visible') && $('[name="driver_document_id"]').prop('required'),
                //documentValidator: {
                //  documentTypeControlId: 'select[name=driver_document_id_type_id]',
                //}                
              },
              'driver_origin_country': {
                required: commonFormValidation.buildSelectorRequiredFn('select[name=driver_origin_country]'),
              },
              'driver_driving_license_type_id': {
                required: () => $('[name="driver_driving_license_type_id"]').is(':visible') && $('[name="driver_driving_license_type_id"]').prop('required'),
              },
              'driver_driving_license_number': {
                required: () => $('[name="driver_driving_license_number"]').is(':visible') && $('[name="driver_driving_license_number"]').prop('required'),
              },
              'driver_driving_license_country': {
                required: commonFormValidation.buildSelectorRequiredFn('select[name=driver_driving_license_country]'),
              },
              'additional_driver_1_origin_country': {
                required: commonFormValidation.buildSelectorRequiredFn('select[name=additional_driver_1_origin_country]'),
              },
              'additional_driver_1_driving_license_country': {
                required: commonFormValidation.buildSelectorRequiredFn('select[name=additional_driver_1_driving_license_country]'),
              },
              'additional_driver_2_origin_country': {
                required: commonFormValidation.buildSelectorRequiredFn('select[name=additional_driver_2_origin_country]'),
              },
              'additional_driver_2_driving_license_country': {
                required: commonFormValidation.buildSelectorRequiredFn('select[name=additional_driver_2_driving_license_country]'),
              },
              'customer_address[street]': {
                required: () => $('[name="customer_address\\[street\\]"]').is(':visible') && $('[name="customer_address\\[street\\]"]').prop('required'),
              },
              'customer_address[number]': {
                required: () => $('[name="customer_address\\[number\\]"]').is(':visible') && $('[name="customer_address\\[number\\]"]').prop('required'),
              },
              'customer_address[complement]': {
                required: () => $('[name="customer_address\\[complement\\]"]').is(':visible') && $('[name="customer_address\\[complement\\]"]').prop('required'),
              },
              'customer_address[state]': {
                required: commonFormValidation.buildSelectorRequiredFn('[name="customer_address[state]"]'),
              },
              'customer_address[state_code]': {
                required: commonFormValidation.buildSelectorRequiredFn('select[name=customer_address\\[state_code\\]]'),
              },
              'customer_address[city]': {
                required: commonFormValidation.buildSelectorRequiredFn('[name="customer_address[city]"]'),
              },
              'customer_address[city_code]': {
                required: commonFormValidation.buildSelectorRequiredFn('select[name=customer_address\\[city_code\\]]'),
              },
              'customer_address[country]': {
                required: commonFormValidation.buildSelectorRequiredFn('select[name=customer_address\\[country\\]]'),
              },
              'customer_address[zip]': {
                required: () => $('[name="customer_address\\[zip\\]"]').is(':visible') && $('[name="customer_address\\[zip\\]"]').prop('required'),
              },
              'driver_address[street]': {
                required: () => $('[name="driver_address\\[street\\]"]').is(':visible') && $('[name="driver_address\\[street\\]"]').prop('required'),
              },
              'driver_address[number]': {
                required: () => $('[name="driver_address\\[number\\]"]').is(':visible') && $('[name="driver_address\\[number\\]"]').prop('required'),
              },
              'driver_address[complement]': {
                required: () => $('[name="driver_address\\[complement\\]"]').is(':visible') && $('[name="driver_address\\[complement\\]"]').prop('required'),
              },
              'driver_address[city]': {
                required: commonFormValidation.buildSelectorRequiredFn('[name="driver_address[city]"]'),
              },
              'driver_address[city_code]': {
                required: commonFormValidation.buildSelectorRequiredFn('select[name=driver_address\\[city_code\\]]'),
              },
              'driver_address[state]': {
                required: commonFormValidation.buildSelectorRequiredFn('[name="driver_address[state]"]'),
              },
              'driver_address[state_code]': {
                required: commonFormValidation.buildSelectorRequiredFn('select[name=driver_address\\[state_code\\]]'),
              },
              'driver_address[country]': {
                required: commonFormValidation.buildSelectorRequiredFn('select[name=driver_address\\[country\\]]'),
              },
              'driver_address[zip]': {
                required: () => $('[name="driver_address\\[zip\\]"]').is(':visible') && $('[name="driver_address\\[zip\\]"]').prop('required'),
              },
              'additional_driver_1_document_id': {
                documentValidator: {
                  documentTypeControlId: 'select[name=additional_driver_1_document_id_type_id]'
                }                
              },
              'additional_driver_2_document_id': {
                documentValidator: {
                  documentTypeControlId: 'select[name=additional_driver_2_document_id_type_id]'
                }                
              },                                
            },
            messages: {
              'customer_company_name': {
                required: i18next.t('complete.reservationForm.validations.customerCompanyNameRequired')
              },
              'customer_company_document_id': {
                required: i18next.t('complete.reservationForm.validations.customerCompanyDocumentIdRequired')
              },
              'customer_name': {
                required: i18next.t('complete.reservationForm.validations.customerNameRequired')
              },
              'customer_surname': {
                required: i18next.t('complete.reservationForm.validations.customerSurnameRequired')
              },
              'customer_email': {
                required: i18next.t('complete.reservationForm.validations.customerEmailRequired'),
                email: i18next.t('complete.reservationForm.validations.customerEmailInvalidFormat'),
              },
              'customer_phone': {
                required: i18next.t('complete.reservationForm.validations.customerPhoneNumberRequired'),
                minlength: i18next.t('complete.reservationForm.validations.customerPhoneNumberMinLength')
              },
              'customer_nacionality': {
                required: i18next.t('complete.reservationForm.validations.fieldRequired')
              },
              'driver_nacionality': {
                required: i18next.t('complete.reservationForm.validations.fieldRequired')
              },
              'customer_document_id_type_id': {
                required: i18next.t('complete.reservationForm.validations.fieldRequired')
              },
              'driver_document_id_type_id': {
                required: i18next.t('complete.reservationForm.validations.fieldRequired'),
              },
              'customer_document_id': {
                required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                documentValidator: i18next.t('complete.reservationForm.validations.invalidValue')
              },
              'driver_email': {
                required: i18next.t('complete.reservationForm.validations.customerEmailRequired'),
                email: i18next.t('complete.reservationForm.validations.customerEmailInvalidFormat'),
              },
              'driver_phone': {
                required: i18next.t('complete.reservationForm.validations.customerPhoneNumberRequired'),
                minlength: i18next.t('complete.reservationForm.validations.customerPhoneNumberMinLength')
              },
              'driver_document_id': {
                required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                documentValidator: i18next.t('complete.reservationForm.validations.invalidValue')
              },
              'driver_origin_country': {
                required: i18next.t('complete.reservationForm.validations.fieldRequired')
              },
              'driver_driving_license_type_id': {
                required: i18next.t('complete.reservationForm.validations.fieldRequired')
              },
              'driver_driving_license_number': {
                required: i18next.t('complete.reservationForm.validations.fieldRequired'),
              },
              'driver_driving_license_country': {
                required: i18next.t('complete.reservationForm.validations.fieldRequired')
              },
              'customer_address\\[street\\]': {
                required: i18next.t('complete.reservationForm.validations.fieldRequired')
              },
              'customer_address\\[number\\]': {
                required: i18next.t('complete.reservationForm.validations.fieldRequired')
              },
              'customer_address\\[complement\\]': {
                required: i18next.t('complete.reservationForm.validations.fieldRequired')
              },
              'customer_address\\[city\\]': {
                required: i18next.t('complete.reservationForm.validations.fieldRequired')
              },
              'customer_address\\[state\\]': {
                required: i18next.t('complete.reservationForm.validations.fieldRequired')
              },
              'customer_address\\[country\\]': {
                required: i18next.t('complete.reservationForm.validations.fieldRequired')
              },
              'customer_address\\[zip\\]': {
                required: i18next.t('complete.reservationForm.validations.fieldRequired')
              },
              'driver_address\\[street\\]': {
                required: i18next.t('complete.reservationForm.validations.fieldRequired')
              },
              'driver_address\\[number\\]': {
                required: i18next.t('complete.reservationForm.validations.fieldRequired')
              },
              'driver_address\\[complement\\]': {
                required: i18next.t('complete.reservationForm.validations.fieldRequired')
              },
              'driver_address\\[city\\]': {
                required: i18next.t('complete.reservationForm.validations.fieldRequired')
              },
              'driver_address\\[city_code\\]': {
                required: i18next.t('complete.reservationForm.validations.fieldRequired')
              },
              'driver_address\\[state\\]': {
                required: i18next.t('complete.reservationForm.validations.fieldRequired')
              },
              'driver_address\\[state_code\\]': {
                required: i18next.t('complete.reservationForm.validations.fieldRequired')
              },
              'driver_address\\[country\\]': {
                required: i18next.t('complete.reservationForm.validations.fieldRequired')
              },
              'driver_address\\[zip\\]': {
                required: i18next.t('complete.reservationForm.validations.fieldRequired')
              },
              'additional_driver_1_document_id': {
                documentValidator: i18next.t('complete.reservationForm.validations.invalidValue')
              },
              'additional_driver_2_document_id': {
                documentValidator: i18next.t('complete.reservationForm.validations.invalidValue')
              },                                
            },
            errorPlacement: function(error, element) {
              if (commonDateControls.placeError(error, element)) {
                // handled: canonical date error after visible date composite
              } else if (element.attr('name') === 'customer_document_id_type_id')  {
                if (commonServices.jsUseSelect2) {
                  error.insertAfter('form[name=booking_information_form] select[name=customer_document_id_type_id] + span.select2-container');
                }
                else {
                  error.insertAfter(element);
                }                
              } else if (element.attr('name') === 'driver_document_id_type_id')  {
                if (commonServices.jsUseSelect2) {
                  error.insertAfter('form[name=booking_information_form] select[name=driver_document_id_type_id] + span.select2-container');
                }
                else {
                  error.insertAfter(element);
                }
              } else if (element.attr('name') === 'customer_address[state_code]' && element.is('select')) {
                error.insertAfter('form[name=booking_information_form] select[name=customer_address\\[state_code\\]] + span.select2-container');
              } else if (element.attr('name') === 'customer_address[city_code]' && element.is('select')) {
                error.insertAfter('form[name=booking_information_form] select[name=customer_address\\[city_code\\]] + span.select2-container');
              } else if (element.attr('name') === 'driver_address[state_code]' && element.is('select')) {
                error.insertAfter('form[name=booking_information_form] select[name=driver_address\\[state_code\\]] + span.select2-container'); 
              } else if (element.attr('name') === 'driver_address[city_code]' && element.is('select')) {
                  error.insertAfter('form[name=booking_information_form] select[name=driver_address\\[city_code\\]] + span.select2-container');                
              } else {
                error.insertAfter(element);
              } 
            }    
          }
      );

      commonDateControls.applyValidationRules(
        $('form[name=booking_information_form]'),
        i18next.t('complete.reservationForm.validations.datePatternInvalid')
      );

      if (model.configuration.sesHospedajes) {
        // Apply the validation rules for the document
        $('input[name=customer_document_id]').rules('add', {
          documentValidator: {
            documentTypeControlId: 'select[name=customer_document_id_type_id]',
          }
        });
        $('input[name=driver_document_id]').rules('add', {
          documentValidator: {
            documentTypeControlId: 'select[name=driver_document_id_type_id]',
          }
        });
        $('input[name=additional_driver_1_document_id]').rules('add', {
          documentValidator: {
            documentTypeControlId: 'select[name=additional_driver_1_document_id_type_id]',
          }
        });
        $('input[name=additional_driver_2_document_id]').rules('add', {
          documentValidator: {
            documentTypeControlId: 'select[name=additional_driver_2_document_id_type_id]',
          }
        });      
      }

      rentEngineMediator.onMyReservationSetupReservationForm();
    },

    /**
    * Setup passengers form
    */ 
    setupPassengersForm: function() {
      if (model.configuration.guests) {
        // Micro-template passengers is inside component
        // Initialize component passengers
        passengersComponent.view.init({booking: model.booking, configuration: model.configuration});
      }
    },

    /**
    * Setup events
    */ 
    setupEvents: function() {
      // Steps events
      $('.mb--steps-wrapper').on('click', '.mb--step a', function(event) {
        event.preventDefault();
        // If the step is disabled, do nothing
        if ($(this).parent().hasClass('mb--disabled')) {
          return false;
        }

        // Hide all steps
        $('.mb--steps-container-wrapper .mb--step-container').hide();

        // Show the step
        const id = $(this).attr('href');
        $(id).show();
      });

      // ----------------- Form ------------------------------
      
      // Driver is customer toggle
      if ($('#driver_is_customer').length) {
        $('#driver_is_customer').off('change');
        $('#driver_is_customer').on('change', function(event) {
          if (confirm(i18next.t('myReservation.confirmDriverIsCustomer'))) {
            controller.toggleDriverPanelClick();
          }
          else {
            // Undo the change
            event.preventDefault();
            $(this).prop('checked', !$(this).prop('checked')); 
          }
        });
      }

      // Additional drivers toggle
      if ($('#additional_drivers_toggle_btn').length) {
        $('#additional_drivers_toggle_btn').off('click');
        $('#additional_drivers_toggle_btn').on('click', function(event){
          controller.toggleAdditionalDriversPanelClick(event);
        });
      }

    },

    // ----------------- Payment mediator ------------------------------

    /**
     * Pay
     */
    payment: function(url, paymentData) {
      // Call to the mediator
      rentEngineMediator.onExistingReservationPayment(url, paymentData);
    },

    /*
     * Go to the payment
     */
    gotoPayment: function(url, paymentData) {
      // Use the payment component to make the payment
      paymentComponent.view.gotoPayment(url, paymentData);
    },

    /*
     * Go to the deposit payment
     */
    gotoDepositPayment: function(url, paymentData) {
      // Use the deposit component to make the payment
      depositComponent.view.gotoPayment(url, paymentData);
    },
  };

  const rentMyReservation = {
    model: model,
    controller: controller,
    view: view
  };

  rentEngineMediator.setMyReservation(rentMyReservation);

  // The loader is show on start and hidden after the reservation
  // has been rendered
  commonLoader.show();

  // OPTIMIZATION 2024-01-27 START 
  // Load settings
  // model.loadSettings();
  view.init();
  // OPTIMIZATION 2024-01-27 END
});
