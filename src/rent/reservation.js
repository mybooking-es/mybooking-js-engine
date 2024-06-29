/* eslint-disable camelcase */
/* eslint-disable max-len */
require(['jquery', 'YSDRemoteDataSource','YSDMemoryDataSource','YSDSelectSelector', 'select2',
         'commonServices', 'commonSettings', 'commonTranslations', 'commonLoader', 'commonUI',  
         './mediator/rentEngineMediator',
         'i18next','ysdtemplate', 'YSDDateControl',
         './passengers/passengersComponent',
         './payment/paymentComponent',
         './documents/documentsComponent',
         './signature/signatureComponent',
         'jquery.i18next',   
         'jquery.validate', 'jquery.ui', 'jquery.form'],
    function($, RemoteDataSource, MemoryDataSource, SelectSelector, select2,
             commonServices, commonSettings, commonTranslations, commonLoader, commonUI,
             rentEngineMediator, i18next, tmpl, DateControl, 
             passengersComponent,  paymentComponent, documentsComponent, signatureComponent
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

        // Remove all empty fields
        for (let prop in reservation) {
          if (reservation[prop] === undefined || reservation[prop] === '') {  
              delete reservation[prop];
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
        model.holdedBookingDriver.customer_address_state = booking.address_state;
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
          model.holdedBookingDriver.customer_address_state = $('input[name=customer_address\\[state\\]]').val();
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
            model.booking.driver_address_state = model.booking.address_state;
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
            model.booking.driver_address_state = model.holdedBookingDriver.customer_address_state;
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
        if (model.configuration.rentingFormFillDataDriverDetail && !model.booking.has_optional_external_driver && (model.booking.driver_type == 'driver' || model.booking.driver_type == 'skipper') && model.booking.driver_is_customer) {
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
        if (model.configuration.rentingFormFillDataDriverDetail && !model.booking.has_optional_external_driver && !model.booking.driver_is_customer && document.getElementById('script_reservation_form_driver')) {
          const reservationFormDriver = tmpl('script_reservation_form_driver')(
                {booking: model.booking,
                  required_fields: model.required_fields,
                  configuration: model.configuration});
          $('#driver_panel_container').html(reservationFormDriver);
        }
      }

      // Initialize payment component
      paymentComponent.view.init(model.bookingFreeAccessId, model.sales_process, 
                                 model.booking, model.configuration);
      paymentComponent.model.addListener('payment', function(event){
        if (event.type === 'payment') {
          const url = event.data.url;
          const paymentData = event.data.paymentData;
          view.payment(url, paymentData);
        }
      });

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
      // Load countries
      let countries = i18next.t('common.countries', {returnObjects: true});
    
      let countriesArray = [];
      if (countries instanceof Object) {
        const countryCodes = Object.keys(countries);
        countriesArray = countryCodes.map(function(value){ 
                                return {id: value, text: countries[value], description: countries[value]};
                             });
      }
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

      if (commonServices.jsUseSelect2) {
        // Configure address country
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
        let $countrySelector = null;
        for (let idx=0; idx<selectors.length; idx++) { 
          $countrySelector = $(selectors[idx]);    
          if ($countrySelector.length > 0 && typeof values[idx] !== 'undefined') {
            $countrySelector.select2({
              width: '100%',
              theme: 'bootstrap4',                  
              data: countriesArray
            });
            // Assign value
            $countrySelector.val(values[idx]);
            $countrySelector.trigger('change');
          }
        }
      } else {
        // Setup country selector
        const selectors = [
          'customer_address[country]',
          'driver_address[country]',
          'driver_origin_country',
          'driver_driving_license_country',
          'additional_driver_1_origin_country',
          'additional_driver_1_driving_license_country',
          'additional_driver_2_origin_country',
          'additional_driver_2_driving_license_country',
        ];
        for (let idx=0; idx<selectors.length; idx++) {
          const elements = document.getElementsByName(selectors[idx]);
          if (elements.length > 0) {
            const countriesDataSource = new MemoryDataSource(countriesArray);
            const countryModel = (values[idx] == null ? '': values[idx]);
            for (let j=0; j<elements.length; j++) {
              new SelectSelector(selectors[idx],
                  countriesDataSource, countryModel, true, i18next.t('myReservation.select_country'));
            }
          }
        }
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
    * Setup old date controls
    * Retrocompatibility nedded code
    */
    setupOldDateControls: function() {
      // Configure driver document id date
      if (document.getElementById('driver_document_id_date_day')) {
        const dateControl = new DateControl(document.getElementById('driver_document_id_date_day'),
                        document.getElementById('driver_document_id_date_month'),
                        document.getElementById('driver_document_id_date_year'),
                        document.getElementById('driver_document_id_date'),
                        commonSettings.language(model.requestLanguage));
        if (model.booking.driver_document_id_date) {
          dateControl.setDate(model.booking.driver_document_id_date);
        }        
      }
      if (document.getElementById('driver_document_id_expiration_date_day')) {
        const dateControl = new DateControl(document.getElementById('driver_document_id_expiration_date_day'),
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
        const dateControl = new DateControl(document.getElementById('driver_date_of_birth_day'),
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
        const dateControl = new DateControl(document.getElementById('driver_driving_license_date_day'),
                        document.getElementById('driver_driving_license_date_month'),
                        document.getElementById('driver_driving_license_date_year'),
                        document.getElementById('driver_driving_license_date'),
                        commonSettings.language(model.requestLanguage));
        if (model.booking.driver_driving_license_date) {
          dateControl.setDate(model.booking.driver_driving_license_date);
        }
      }
      if (document.getElementById('driver_driving_license_expiration_date_day')) {
        const dateControl = new DateControl(document.getElementById('driver_driving_license_expiration_date_day'),
                        document.getElementById('driver_driving_license_expiration_date_month'),
                        document.getElementById('driver_driving_license_expiration_date_year'),
                        document.getElementById('driver_driving_license_expiration_date'),
                        commonSettings.language(model.requestLanguage),
                        undefined, 'future');
        if (model.booking.driver_driving_license_expiration_date) {
          dateControl.setDate(model.booking.driver_driving_license_expiration_date);
        }
      }
      // Configure additional driver 1 driving license date 
      if (document.getElementById('additional_driver_1_driving_license_date_day')) {
        const dateControl = new DateControl(document.getElementById('additional_driver_1_driving_license_date_day'),
                        document.getElementById('additional_driver_1_driving_license_date_month'),
                        document.getElementById('additional_driver_1_driving_license_date_year'),
                        document.getElementById('additional_driver_1_driving_license_date'),
                        commonSettings.language(model.requestLanguage));
        if (model.booking.additional_driver_1_driving_license_date) {
          dateControl.setDate(model.booking.additional_driver_1_driving_license_date);
        }
      }
      if (document.getElementById('additional_driver_1_driving_license_expiration_date_day')) {
        const dateControl = new DateControl(document.getElementById('additional_driver_1_driving_license_expiration_date_day'),
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
        const dateControl = new DateControl(document.getElementById('additional_driver_2_driving_license_date_day'),
                        document.getElementById('additional_driver_2_driving_license_date_month'),
                        document.getElementById('additional_driver_2_driving_license_date_year'),
                        document.getElementById('additional_driver_2_driving_license_date'),
                        commonSettings.language(model.requestLanguage));
        if (model.booking.additional_driver_2_driving_license_date) {
          dateControl.setDate(model.booking.additional_driver_2_driving_license_date);
        }        
      }
      if (document.getElementById('additional_driver_2_driving_license_expiration_date_day')) {
        const dateControl = new DateControl(document.getElementById('additional_driver_2_driving_license_expiration_date_day'),
                        document.getElementById('additional_driver_2_driving_license_expiration_date_month'),
                        document.getElementById('additional_driver_2_driving_license_expiration_date_year'),
                        document.getElementById('additional_driver_2_driving_license_expiration_date'),
                        commonSettings.language(model.requestLanguage),
                        undefined, 'future');
        if (model.booking.additional_driver_2_driving_license_expiration_date) {
          dateControl.setDate(model.booking.additional_driver_2_driving_license_expiration_date);
        }        
      }
    },

    /*
    * Setup date controls in form
    */
    setupDateControls: function() {
      const controls = $('.js-date-select-control');

      // setupOldDateControls
      if (controls.length == 0) {
        this.setupOldDateControls();
        return;
      }

      controls.each((index, element) => {
        const day = $(element).find('[name$="_day"]');
        const month = $(element).find('[name$="_month"]');
        const year = $(element).find('[name$="_year"]');
        const hiddenControl = $(element).find('[type="hidden"]');
    
        const direction = $(element).attr('data-date-select-control-direction');
        // If date is in the past revert
        const dateControl = new DateControl(day[0], month[0], year[0], hiddenControl[0], commonSettings.language(model.requestLanguage), undefined, direction);
        // Set date
        const value = model.booking[hiddenControl.attr('name')];
        if (value) {
          dateControl.setDate(value);
        }
      });
    },

    /**
    * Setup phone controls in form
    */
    setupPhoneControls: function() {
      // Configure Telephone with prefix
      let countryCode = model.configuration.countryCode;
      const input = $('[name="customer_phone"]');
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
      }
    },

    /*
    * Setup selects controls in form
    */
    setupSelectControls: function() {
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

      // Setup date old date controls 
      // Retrocompatibility nedded code
      this.setupOldDateControls();

      // Setup date controls
      this.setupDateControls();

      // Setup phone controls
      this.setupPhoneControls();

      $.extend($.validator.messages, {
        required: i18next.t('complete.reservationForm.validations.fieldRequired')
      });

      // Date is required function
      
      // Date patter
      $.validator.addMethod('date_pattern', function(value, element) {
        // Check the regular expression only if it is not empty
        if (value === '') {
          return true;
        }
        const regex = new RegExp('^\\d{4}-\\d{2}-\\d{2}$');
        return regex.test(value);
      }, 'Date format is YYYY-MM-DD.');

      $('form[name=booking_information_form]').validate(
          {   
            ignore: '',
            invalidHandler : function(form, validator) {
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
              'driver_date_of_birth': {
                required: (element) => view.validateDateIsRequired(element),
                date_pattern: true,
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
              'customer_document_id': {
                required: () => $('[name="customer_document_id"]').is(':visible') && $('[name="customer_document_id"]').prop('required'),
              },
              'driver_document_id': {
                required: () => $('[name="driver_document_id"]').is(':visible') && $('[name="driver_document_id"]').prop('required'),
              },
              'driver_origin_country': {
                required: () => $('[name="driver_origin_country"]').is(':visible') && $('[name="driver_origin_country"]').prop('required'),
              },
              'driver_document_id_date': {
                required: (element) => view.validateDateIsRequired(element),
                date_pattern: true,
              },
              'driver_document_id_expiration_date': {
                required: (element) => view.validateDateIsRequired(element),
                date_pattern: true,
              },
              'driver_driving_license_type_id': {
                required: () => $('[name="driver_driving_license_type_id"]').is(':visible') && $('[name="driver_driving_license_type_id"]').prop('required'),
              },
              'driver_driving_license_number': {
                required: () => $('[name="driver_driving_license_number"]').is(':visible') && $('[name="driver_driving_license_number"]').prop('required'),
              },
              'driver_driving_license_country': {
                required: () => $('[name="driver_driving_license_country"]').is(':visible') && $('[name="driver_driving_license_country"]').prop('required'),
              },
              'driver_driving_license_date': {
                required: (element) => view.validateDateIsRequired(element),
                date_pattern: true,
              },
              'driver_driving_license_expiration_date': {
                required: (element) => view.validateDateIsRequired(element),
                date_pattern: true,
              },
              'customer_address\\[street\\]': {
                required: () => $('[name="customer_address\\[street\\]"]').is(':visible') && $('[name="customer_address\\[street\\]"]').prop('required'),
              },
              'customer_address\\[number\\]': {
                required: () => $('[name="customer_address\\[number\\]"]').is(':visible') && $('[name="customer_address\\[number\\]"]').prop('required'),
              },
              'customer_address\\[complement\\]': {
                required: () => $('[name="customer_address\\[complement\\]"]').is(':visible') && $('[name="customer_address\\[complement\\]"]').prop('required'),
              },
              'customer_address\\[city\\]': {
                required: () => $('[name="customer_address\\[city\\]"]').is(':visible') && $('[name="customer_address\\[city\\]"]').prop('required'),
              },
              'customer_address\\[state\\]': {
                required: () => $('[name="customer_address\\[state\\]"]').is(':visible') && $('[name="customer_address\\[state\\]"]').prop('required'),
              },
              'customer_address\\[country\\]': {
                required: () => $('[name="customer_address\\[country\\]"]').is(':visible') && $('[name="customer_address\\[country\\]"]').prop('required'),
              },
              'customer_address\\[zip\\]': {
                required: () => $('[name="customer_address\\[zip\\]"]').is(':visible') && $('[name="customer_address\\[zip\\]"]').prop('required'),
              },
              'driver_address\\[street\\]': {
                required: () => $('[name="driver_address\\[street\\]"]').is(':visible') && $('[name="driver_address\\[street\\]"]').prop('required'),
              },
              'driver_address\\[number\\]': {
                required: () => $('[name="driver_address\\[number\\]"]').is(':visible') && $('[name="driver_address\\[number\\]"]').prop('required'),
              },
              'driver_address\\[complement\\]': {
                required: () => $('[name="driver_address\\[complement\\]"]').is(':visible') && $('[name="driver_address\\[complement\\]"]').prop('required'),
              },
              'driver_address\\[city\\]': {
                required: () => $('[name="driver_address\\[city\\]"]').is(':visible') && $('[name="driver_address\\[city\\]"]').prop('required'),
              },
              'driver_address\\[state\\]': {
                required: () => $('[name="driver_address\\[state\\]"]').is(':visible') && $('[name="driver_address\\[state\\]"]').prop('required'),
              },
              'driver_address\\[country\\]': {
                required: () => $('[name="driver_address\\[country\\]"]').is(':visible') && $('[name="driver_address\\[country\\]"]').prop('required'),
              },
              'driver_address\\[zip\\]': {
                required: () => $('[name="driver_address\\[zip\\]"]').is(':visible') && $('[name="driver_address\\[zip\\]"]').prop('required'),
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
              'driver_date_of_birth': {
                required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                date_pattern: i18next.t('complete.reservationForm.validations.datePatternInvalid'),
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
                required: i18next.t('complete.reservationForm.validations.fieldRequired')
              },
              'customer_document_id': {
                required: i18next.t('complete.reservationForm.validations.fieldRequired'),
              },
              'driver_document_id': {
                required: i18next.t('complete.reservationForm.validations.fieldRequired'),
              },
              'driver_origin_country': {
                required: i18next.t('complete.reservationForm.validations.fieldRequired')
              },
              'driver_document_id_date': {
                required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                date_pattern: i18next.t('complete.reservationForm.validations.datePatternInvalid'),
              },
              'driver_document_id_expiration_date': {
                rrequired: i18next.t('complete.reservationForm.validations.fieldRequired'),
                date_pattern: i18next.t('complete.reservationForm.validations.datePatternInvalid'),
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
              'driver_driving_license_date': {
                required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                date_pattern: i18next.t('complete.reservationForm.validations.datePatternInvalid'),
              },
              'driver_driving_license_expiration_date': {
                required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                date_pattern: i18next.t('complete.reservationForm.validations.datePatternInvalid'),
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
              'driver_address\\[state\\]': {
                required: i18next.t('complete.reservationForm.validations.fieldRequired')
              },
              'driver_address\\[country\\]': {
                required: i18next.t('complete.reservationForm.validations.fieldRequired')
              },
              'driver_address\\[zip\\]': {
                required: i18next.t('complete.reservationForm.validations.fieldRequired')
              },
            },
          }
      );

      rentEngineMediator.onMyReservationSetupReservationForm();
    },

    /**
     * Validate that a date is required
     * @param {*} element 
     * @returns 
     */
    validateDateIsRequired: function(element) {
      // Get the field name
      const fieldName = $(element).attr('name');

      // Check if the date is required, if not return true because do not need validate the value
      if (!$(element).prop('required')) {
        return false;
      }

      // Get the others fields
      const dayField = $('[name="'+fieldName+'_day"]');
      const monthField = $('[name="'+fieldName+'_month"]');
      const yearField = $('[name="'+fieldName+'_year"]');

      // Check if any field is visible
      const anyFieldsIsVisible =  dayField.is(':visible') || monthField.is(':visible') || yearField.is(':visible');
      // If no field is visible, return true because do not need validate the value
      if (!anyFieldsIsVisible) {
        return false;
      }

      return true;
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
