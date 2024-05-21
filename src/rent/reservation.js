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

  var model = { // THE MODEL
    requestLanguage: null,
    configuration: null,        
    bookingFreeAccessId : null,
    booking: null,
    sales_process: null,

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
                
                 // OPTIMIZATION 2024-01-27 START - Load configuration within shopping cart and setup selector
                 // Setup the configuration data
                 commonSettings.setupConfigurationData(data.settings);
                 model.configuration = commonSettings.data; 
                 // OPTIMIZATION 2024-01-27 END

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

    /**
    * Update the reservation
    */ 
    update: function() {
        // Build request
        var reservation = $('form[name=booking_information_form]').formParams(false);
        var booking_line_resources = reservation['booking_line_resources'];
        delete reservation['booking_line_resources'];
        reservation['booking_line_resources'] = [];
        for (var item in booking_line_resources) {
            reservation['booking_line_resources'].push(booking_line_resources[item]);
        }

        // Remove all empty fields
        for (var prop in reservation) {
          if (!reservation[prop]) {
              delete reservation[prop];
          }
          // Remove all empty fields in objects
          if (typeof reservation[prop] === 'object') {
            for (var subprop in reservation[prop]) {
              if (!reservation[prop][subprop]) {
                delete reservation[prop][subprop];
              }
            }
            // Delete objtect if empty
            if (Object.keys(reservation[prop]).length === 0) {
              delete reservation[prop];
            }
          }
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

    },
  };

  var controller = { // THE CONTROLLER
    // ----------------- Reservation ------------------------------

    /**
    * Update the reservation
    */ 
    btnUpdateClick: function() {
       model.update();
    },
    
    // ----------------- Form ------------------------------

    /**
     * Toogle driver panel click
     */ 
    toogleDriverPanelClick: function(event) {
      const target = $(event.target);
      let value = target.is(':checked');
      const panel = $('#' + target.attr('data-panel'));
      if (panel.length > 0 && value === true) {
        panel.hide();
        panel.find('input, select').val(undefined);
        $('.js-driver-is-customer-off').hide();
        $('.js-driver-is-customer-off').find('input, select').val(undefined);
        $('.js-driver-is-customer-on').show();
      } else {
        panel.show();
        $('.js-driver-is-customer-on').hide();
        $('.js-driver-is-customer-on').find('input, select').val(undefined);
        $('.js-driver-is-customer-off').show();
      }
    },
    toogleAdditionalDriversPanelClick: function(event) {
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

  var view = { // THE VIEW
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
      model.loadBooking();
    },

    // ----------------- Reservation ------------------------------

    /**
    * Update the reservation
    */ 
    updateBooking: function() { // Updates the reservation
      this.updateStatusTitle();
      this.updateBookingSummary();
      this.setupReservationForm();
      this.setupPassengersForm();
      this.setupEvents();
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
      var showReservationForm = model.booking.manager_complete_authorized;

      // Include reservation steps
      var reservationSteps = tmpl('script_reservation_steps')(
        {
          booking: model.booking,
          sales_process: model.sales_process,
        });
      $('#mybooking_reservation_steps').html(reservationSteps);

      // Include reservation summary
      var reservationDetail = tmpl('script_reservation_summary')(
          {
            booking: model.booking,
            sales_process: model.sales_process,
            configuration: model.configuration,
            showReservationForm: showReservationForm
          });
      $('#reservation_detail').html(reservationDetail);

      if (model.configuration.multipleProductsSelection && document.getElementById('script_mybooking_summary_product_detail_table')) {
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
          let reservationForm = tmpl('script_reservation_form')(
              {booking: model.booking,
                configuration: model.configuration});
          $('#reservation_form_container').html(reservationForm);
          $('#reservation_form_container').show();
        }

        // Add documentation upload view
        if ($('#documents_upload_container').length) {
          let documentsUpload = tmpl('script_documents_upload')(
              {booking: model.booking,
                configuration: model.configuration});
          $('#documents_upload_container').html(documentsUpload);
        }

        // Add signature view
        if ($('#contract_signature_container').length) {
          let contractSignature = tmpl('script_contract_signature')(
              {booking: model.booking,
                configuration: model.configuration});
          $('#contract_signature_container').html(contractSignature);
        }
      }

      // Initialize payment component
      paymentComponent.view.init(model.bookingFreeAccessId, model.sales_process, model.booking, model.configuration);
      paymentComponent.model.addListener('payment', function(event){
        if (event.type === 'payment') {
          const url = event.data.url;
          const paymentData = event.data.paymentData;
          view.payment(url, paymentData);
        }
      });

      // Initialize documents component
      documentsComponent.view.init(model.booking);

      // Initialize signature component
      signatureComponent.view.init(model.booking);
    },

    // ----------------- Form ------------------------------

    /**
    * Load selects options
    */ 
    loadCountries: function() {
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
            const countryModel = (values[idx] == null ? '' : values[idx]);
            for (let j=0; j<elements.length; j++) {
              new SelectSelector(selectors[idx],
                  countriesDataSource, countryModel, true, i18next.t('myReservation.select_country'));
            }
          }
        }
      }
    },
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
            const formatData = [];
            for (var idx=0; idx<data.length; idx++) {
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
                  const nationalityModel = (values[idx] == null ? '' : values[idx]);
                  for (let j=0; j<elements.length; j++) {
                    new SelectSelector(selectors[idx],
                      nationalitiesDataSource, nationalityModel, true, i18next.t('myReservation.select_nationality'));
                  }
                }
              }
            }
          }
      });
    },
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
            const formatData = [];
            for (var idx=0; idx<data.length; idx++) {
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
                  const countryModel = (values[idx] == null ? '' : values[idx]);
                  for (let j=0; j<elements.length; j++) {
                    new SelectSelector(selectors[idx],
                      countriesDataSource, countryModel, true, i18next.t('myReservation.select_type_document'));
                  }
                }
              }
            }
          }
      });
    },
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
            const formatData = [];
            for (var idx=0; idx<data.length; idx++) {
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
                  const countryModel = (values[idx] == null ? '' : values[idx]);
                  for (let j=0; j<elements.length; j++) {
                    new SelectSelector(selectors[idx],
                      countriesDataSource, countryModel, true, i18next.t('myReservation.select_type_document'));
                  }
                }
              }
            }
          }
      });
    },

    setupDateControls: function() {
      const controls = $('.js-date-select-control');

      controls.each((index, element) => {
        const day = $(element).find('[name$="_day"]');
        const month = $(element).find('[name$="_month"]');
        const year = $(element).find('[name$="_year"]');
        const hiddenControl = $(element).find('[type="hidden"]');
        const direction = $(element).attr('data-date-select-control-direction');
        // If date is in the past
        const dateControl = new DateControl(day[0], month[0], year[0], hiddenControl, commonSettings.language(model.requestLanguage), undefined, direction);
        if (model.booking[hiddenControl.attr('name')]) {
          dateControl.setDate(model.booking[hiddenControl.attr('name')]);
        }
      });
    },

    /**
    * Setup reservation form
    */
    setupReservationForm: function() {
      // Load countries and set value if exists
      this.loadCountries();
      // Load nationalities and set value if exists
      this.loadNationalities();
      // Load document types and set value if exists
      this.loadDocumentTypes();
      // Load license types and set value if exists
      this.loadLicenseTypes();

      // Seupt date controls
      this.setupDateControls();

      // Configure Telephone with prefix
      var countryCode = model.configuration.countryCode;
      if (typeof countryCode === 'undefined' || countryCode == null) {
        countryCode = commonUI.intlTelInputCountryCode(); 
      }
      if ($('[name="customer_phone"]').length) {
        $('[name="customer_phone"]').intlTelInput({
          initialCountry: countryCode,
          separateDialCode: true,        
          utilsScript: commonServices.phoneUtilsPath,
          preferredCountries: [countryCode]
        });
      }

      // Configure driving license country
      if ($('select[name=driver_driving_license_country]').length) {
        $('select[name=driver_driving_license_country]').val(model.booking.driver_driving_license_country);
      }

      $.extend($.validator.messages, {
        required: i18next.t('complete.reservationForm.validations.fieldRequired')
      });

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
                'customer_name': {
                  required: () => $('[name="customer_name"]').is(':visible'),
                },
                'customer_surname' : {
                  required: () => $('[name="customer_surname"]').is(':visible'),
                },
                'customer_document_id': {
                  required: () => $('[name="customer_document_id"]').is(':visible')
                },
                'customer_company_name': {
                  required: () => $('[name="customer_company_name"]').is(':visible'),
                },
                'customer_company_document_id': {
                  required: () => $('[name="customer_company_document_id"]').is(':visible'),
                },
                'customer_email' : {
                  required: () => $('[name="customer_email"]').is(':visible'),
                  email: () => $('[name="customer_email"]').is(':visible')
                },
                'customer_phone': {
                  required: () => $('[name="customer_phone"]').is(':visible'),
                  minlength: 9
                },
            },
            messages: {
                'customer_name': {
                  required: i18next.t('complete.reservationForm.validations.customerNameRequired')
                },
                'customer_surname' : {
                  required: i18next.t('complete.reservationForm.validations.customerSurnameRequired')
                },
                'customer_document_id': {
                  'required': i18next.t('complete.reservationForm.validations.fieldRequired')
                },
                'customer_company_name': {
                  required: i18next.t('complete.reservationForm.validations.customerCompanyNameRequired')
                },
                'customer_company_document_id': {
                  required: i18next.t('complete.reservationForm.validations.customerCompanyDocumentIdRequired')
                },
                'customer_email' : {
                  required: i18next.t('complete.reservationForm.validations.customerEmailRequired'),
                  email: i18next.t('complete.reservationForm.validations.customerEmailInvalidFormat'),
                },
                'customer_phone': {
                  'required': i18next.t('complete.reservationForm.validations.customerPhoneNumberRequired'),
                  'minlength': i18next.t('complete.reservationForm.validations.customerPhoneNumberMinLength')
                },
            },
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
        passengersComponent.view.init({booking: model.booking, configuration: model.configuration});
      }
    },

    /**
    * Setup events
    */ 
    setupEvents: function() {
      // ----------------- Form ------------------------------
      // Driver is customer toogle
      if ($('#driver_is_customer').length) {
        $('#driver_is_customer').off('click');
        $('#driver_is_customer').on('click', controller.toogleDriverPanelClick);
      }
      // Additional drivers toogle
      if ($('#additional_drivers_toogle_btn').length) {
        $('#additional_drivers_toogle_btn').off('click');
        $('#additional_drivers_toogle_btn').on('click', controller.toogleAdditionalDriversPanelClick);
      }

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

      // Button pay event
      $('#btn_payment_detail').off('click');
      $('#btn_payment_detail').on('click', function(event) {
        event.preventDefault();
        // Hide all steps
        $('.mb--steps-container-wrapper .mb--step-container').hide();
        // Show the payment view
        $('#payment_view').show();
      });
    },

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

    }

  };

  var rentMyReservation = {
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
