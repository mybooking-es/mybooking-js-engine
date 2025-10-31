/* eslint-disable quotes */
/* eslint-disable camelcase */
/* eslint-disable max-len */
define([
  'jquery',
  'YSDRemoteDataSource',
  'YSDMemoryDataSource',
  'YSDSelectSelector',
  'select2',
  'commonServices',
  'commonSettings',
  'commonTranslations',
  'commonLoader',
  'commonUI',
  'i18next',
  'ysdtemplate',
  'YSDDateControl',
  './../mediator/rentEngineMediator',
  'jquery.i18next',
  'jquery.validate',
  'jquery.ui',
  'jquery.form',
], function(
  $,
  RemoteDataSource,
  MemoryDataSource,
  SelectSelector,
  select2,
  commonServices,
  commonSettings,
  commonTranslations,
  commonLoader,
  commonUI,
  i18next,
  tmpl,
  DateControl,
  rentEngineMediator,
) {
  const model = {
    // == MODEL ==
    requestLanguage: null,
    configuration: null,
    shopping_cart: null,

    /* Form Data */
    nationalities: null,
    documentTypes: null,
    licenseTypes: null,
    required_fields: [],
    isAirportDataRequired: false,
    isHotelDataRequired: false,
    formSelector: 'form[name=reservation_form]',
  
    /**
     * Load Nationalities from API.
     */
    loadNationalities: function() {
      let url = commonServices.URL_PREFIX + '/api/booking/frontend/nacionalities';
      const urlParams = [];
      if (model.requestLanguage != null) urlParams.push('lang=' + model.requestLanguage); // Use model property
      if (commonServices.apiKey) urlParams.push('api_key=' + commonServices.apiKey);
      if (urlParams.length > 0) url += '?' + urlParams.join('&');

      $.ajax({
        type: 'GET',
        url: url,
        dataType: 'json',
        success: function(data) {
          view.populateNationalities(data);
        },
        error: function(jqXHR, status, error) {},
      });
    },

    /**
     * Load Document Types from API.
     */
    loadDocumentTypes: function() {
      let url = commonServices.URL_PREFIX + '/api/booking/frontend/document-types';
      const urlParams = [];
      if (model.requestLanguage != null) urlParams.push('lang=' + model.requestLanguage); // Use model property
      if (commonServices.apiKey) urlParams.push('api_key=' + commonServices.apiKey);
      if (urlParams.length > 0) url += '?' + urlParams.join('&');

      $.ajax({
        type: 'GET',
        url: url,
        dataType: 'json',
        success: function(data) {
          view.populateDocumentTypes(data);
        },
        error: function(jqXHR, status, error) {},
      });
    },

    /**
     * Load License Types from API.
     */
    loadLicenseTypes: function() {
      let url = commonServices.URL_PREFIX + '/api/booking/frontend/license-types';
      const urlParams = [];
      if (model.requestLanguage != null) urlParams.push('lang=' + model.requestLanguage); // Use model property
      if (commonServices.apiKey) urlParams.push('api_key=' + commonServices.apiKey);
      if (urlParams.length > 0) url += '?' + urlParams.join('&');

      $.ajax({
        type: 'GET',
        url: url,
        dataType: 'json',
        success: function(data) {
          view.populateLicenseTypes(data);
        },
        error: function(jqXHR, status, error) {},
      });
    },

    /**
     * Load Spanish states (states/provinces).
     */
    loadSpanishStates: function(stateSelectorName) {
      let url = commonServices.URL_PREFIX + '/api/booking/frontend/states';
      const urlParams = [];
      if (model.requestLanguage != null) urlParams.push('lang=' + model.requestLanguage);
      if (commonServices.apiKey) urlParams.push('api_key=' + commonServices.apiKey);
      if (urlParams.length > 0) url += '?' + urlParams.join('&');

      $.ajax({
        type: 'GET',
        url: url,
        dataType: 'json',
        success: function(data) {
          view.populateStates(stateSelectorName, data);
        },
        error: function(jqXHR, status, error) {
          alert('Error loading Spanish states');
          view.populateStates(stateSelectorName, []); // Populate with empty data on error
        },
      });
    },

    /**
     * Load cities for a specific Spanish region.
     * @param {string} stateCode - The code of the selected state/province.
     * @param {string} citySelectName - The ID of the city select element to populate.
     */
    loadSpanishCities: function(citySelectName, stateCode) {
      if (!stateCode) {
        // Do not load if state code is empty or invalid
        view.populateCities(citySelectName, []); // Clear cities
        return;
      }
      let url = commonServices.URL_PREFIX + '/api/booking/frontend/cities';
      const urlParams = [];
      urlParams.push('state_code=' + stateCode); // Pass state_code as parameter
      if (model.requestLanguage != null) urlParams.push('lang=' + model.requestLanguage);
      if (commonServices.apiKey) urlParams.push('api_key=' + commonServices.apiKey);
      if (urlParams.length > 0) url += '?' + urlParams.join('&');

      $.ajax({
        type: 'GET',
        url: url,
        dataType: 'json',
        success: function(data) {
          view.populateCities(citySelectName, data);
        },
        error: function(jqXHR, status, error) {
          // Handle error
          view.populateCities(citySelectName, []); // Populate with empty data on error
        },
      });
    },
  };

  const controller = {
  };

  const view = {
    // == VIEW ==
    init: function({
      configuration,
      shoppingCartData,
      updatePayment,
      sendReservationButtonClick,
    }) {
      // Expects shopping cart data from caller (e.g., complete.js)
      // Store external data potentially needed by template or logic
      model.shopping_cart = shoppingCartData;
      model.configuration = configuration; // Get configuration
      // Get language - needs to happen before i18next init
      model.requestLanguage = commonSettings.language(document.documentElement.lang);
      // Store callback functions
      controller.updatePayment = updatePayment;
      controller.sendReservationButtonClick = sendReservationButtonClick;

      // Initialize i18next for translations
      i18next.init(
        {
          lng: model.requestLanguage,
          resources: commonTranslations,
          fallbackLng: 'en',
        },
        function(error, t) {
          if (error) {
            // Handle i18next init error
          }
        },
      );

      // model.loadRequiredFields();
      // Setup the reservation form and pass the update payment function to it
      view.setupReservationForm();
      // Setup the reservation form validation
      view.setupReservationFormValidation();
    },

    /**
     * Setup the reservation form: Render template (if found) and initialize controls.
     */
    setupReservationForm: function() {
			// --- Render template ---

      // Define variables needed
      const locale = model.requestLanguage;
      const localeReservationFormScript = 'script_renting_complete_form_tmpl_' + locale;
      const $form = $(model.formSelector);

      if ($form.length === 0) {
        return; // Form not found, cannot proceed
      }

      let templateHtml = null;
      let templateIdUsed = null;

      // Try locale-specific template first
      const localeTemplateElement = document.getElementById(localeReservationFormScript);
      if (locale != null && localeTemplateElement) {
        templateHtml = $(localeTemplateElement).html();
        templateIdUsed = localeReservationFormScript;
      }  else {
        // Fallback to default template
        const defaultTemplateElement = document.getElementById('script_renting_complete_form_tmpl');
        if (defaultTemplateElement) {
          templateHtml = $(defaultTemplateElement).html();
          templateIdUsed = 'script_renting_complete_form_tmpl';
        }
      }

      // Render if template found
      if (templateHtml && templateIdUsed) {
        try {
          const context = {
            configuration: model.configuration,
            shopping_cart: model.shopping_cart,
            required_fields: model.required_fields,
            i18next: i18next,
          };

          // Get the template
          const reservationFormHtml = tmpl(templateIdUsed)(context);
          // Render the template
          $form.html(reservationFormHtml).show();
          // Update payment
          controller.updatePayment();
        } catch (e) {
          // Log error but continue to initialize controls on potentially existing default markup
          console.error('Error rendering template:', e);
        }
      }  else {
        // Template script not found, assume default markup from PHP is present.
        console.warn('Template script not found, assume default markup from PHP is present.');
        // Update payment 
        controller.updatePayment();
      }

      // --- Controls Initialization  ---

      // Configure country controls
      this.configureCountryControls($form);

      // Configure telephone inputs
      this.configureTelephoneInputs($form);

      // Configure date controls
      this.configureDateControls($form);

      // --- Load dynamic select data (Nationalities, Doc Types, License Types) ---
      model.loadNationalities();
      model.loadDocumentTypes();
      model.loadLicenseTypes();

      // --- Notify mediator AFTER controls are set up ---
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
      
      $(model.formSelector).validate(
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

                  // Launch form  event
                  controller.sendReservationButtonClick();
                }

                return false;
              },

              invalidHandler : function(form, validator) {
                console.log('COMPLETE - invalidHandler');

                // Enable submit again
                $('form[name=reservation_form] button[type=submit]').removeAttr('disabled');
                model.reservationFormSubmitted = false; 
                // Show errors
                $('#reservation_error').html(i18next.t('complete.reservationForm.errors'));
                $('#reservation_error').show();
              },

              rules: {
                customer_classifier_id: {
                  required: '#customer_classifier_id:visible',
                },
                customer_type: {
                  required: '#customer_type:visible',
                },
                customer_company_name: {
                  required: '#customer_company_name:visible',
                },
                customer_company_contact_name: {
                  required: '#customer_company_contact_name:visible',
                },
                customer_name: {
                  required: 'input[name=customer_name]:visible',
                },
                customer_surname: {
                  required: 'input[name=customer_surname]:visible',
                },
                customer_email: {
                  required: 'input[name=customer_email]:visible',
                  email: 'input[name=customer_email]:visible',
                },
                confirm_customer_email: {
                  required: 'input[name=confirm_customer_email]:visible',
                  email: 'input[name=confirm_customer_email]:visible',
                  equalTo: 'input[name=customer_email]:visible',
                },
                customer_phone: {
                  required: 'input[name=customer_phone]:visible',
                  minlength: 9,
                },
                customer_mobile_phone: {
                  required: 'input[name=customer_mobile_phone][required]:visible',
                  minlength: 9,
                },
                customer_document_id_type_id: {
                  required: 'select[name=customer_document_id_type_id][required]:visible',
                },
                customer_document_id: {
                  required: 'input[name=customer_document_id][required]:visible',
                },
                customer_date_of_birth_day: {
                  required: 'select[name=customer_date_of_birth_day][required]:visible',
                },
                customer_date_of_birth_month: {
                  required: 'select[name=customer_date_of_birth_month][required]:visible',
                },
                customer_date_of_birth_year: {
                  required: 'select[name=customer_date_of_birth_year][required]:visible',
                },
                customer_nacionality: {
                  required: 'select[name=customer_nacionality][required]:visible',
                },
                street: {
                  required: '#street[required]:visible',
                },
                city: {
                  required: '#city[required]:visible',
                },
                state: {
                  required: '#state[required]:visible',
                },
                zip: {
                  required: '#zip[required]:visible',
                },
                country: {
                  required: '#country[required]:visible',
                },
                'customer_address[country]': {
                  required: 'select[name=customer_address\\[country\\]][required]:visible',
                },
                'customer_address[state_code]': {
                  required: '[name=customer_address\\[state_code\\]][required]:visible',
                },
                'customer_address[city_code]': {
                  required: '[name=customer_address\\[city_code\\]][required]:visible',
                },
                'customer_address[zip]': {
                  required: 'input[name=customer_address\\[zip\\]][required]:visible',
                },
                'customer_address[street]': {
                  required: 'input[name=customer_address\\[street\\]][required]:visible',
                },
                'customer_address[number]': {
                  required: 'input[name=customer_address\\[number\\]][required]:visible',
                },
                'customer_address[complement]': {
                  required: 'input[name=customer_address\\[complement\\]][required]:visible',
                },
                driver_name: {
                  required: 'input[name=driver_name][required]:visible',
                },
                driver_surname: {
                  required: 'input[name=driver_surname][required]:visible',
                },
                driver_email: {
                  required: 'input[name=driver_email][required]:visible',
                  email: 'input[name=driver_email][required]:visible',
                },
                driver_phone: {
                  required: 'input[name=driver_phone][required]:visible',
                  minlength: 9,
                },
                driver_nacionality: {
                  required: 'select[name=driver_nacionality][required]:visible',
                },
                driver_document_id_type_id: {
                  required: 'select[name=driver_document_id_type_id][required]:visible',
                },
                driver_document_id: {
                  required: 'input[name=driver_document_id][required]:visible',
                },
                driver_origin_country: {
                  required: 'select[name=driver_origin_country][required]:visible',
                },
                driver_document_id_date_day: {
                  required: 'select[name=driver_document_id_date_day][required]:visible',
                },
                driver_document_id_date_month: {
                  required: 'select[name=driver_document_id_date_month][required]:visible',
                },
                driver_document_id_date_year: {
                  required: 'select[name=driver_document_id_date_year][required]:visible',
                },
                driver_document_id_expiration_date_day: {
                  required: 'select[name=driver_document_id_expiration_date_day][required]:visible',
                },
                driver_document_id_expiration_date_month: {
                  required: 'select[name=driver_document_id_expiration_date_month][required]:visible',
                },
                driver_document_id_expiration_date_year: {
                  required: 'select[name=driver_document_id_expiration_date_year][required]:visible',
                },
                driver_date_of_birth_day: {
                  required: 'select[name=driver_date_of_birth_day][required]:visible',
                },
                driver_date_of_birth_month: {
                  required: 'select[name=driver_date_of_birth_month][required]:visible',
                },
                driver_date_of_birth_year: {
                  required: 'select[name=driver_date_of_birth_year][required]:visible',
                },
                driver_driving_license_type_id: {
                  required: 'select[name=driver_driving_license_type_id][required]:visible',
                },
                driver_driving_license_number: {
                  required: 'input[name=driver_driving_license_number][required]:visible',
                },
                driver_driving_license_country: {
                  required: 'select[name=driver_driving_license_country][required]:visible',
                },
                driver_driving_license_date_day: {
                  required: 'select[name=driver_driving_license_date_day][required]:visible',
                },
                driver_driving_license_date_month: {
                  required: 'select[name=driver_driving_license_date_month][required]:visible',
                },
                driver_driving_license_date_year: {
                  required: 'select[name=driver_driving_license_date_year][required]:visible',
                },
                driver_driving_license_expiration_date_day: {
                  required: 'select[name=driver_driving_license_expiration_date_day][required]:visible',
                },
                driver_driving_license_expiration_date_month: {
                  required: 'select[name=driver_driving_license_expiration_date_month][required]:visible',
                },	
                driver_driving_license_expiration_date_year: {
                  required: 'select[name=driver_driving_license_expiration_date_year][required]:visible',
                },
                'driver_address[country]': {
                  required: 'select[name=driver_address\\[country\\]][required]:visible',
                },
                'driver_address[state_code]': {
                  required: '[name=driver_address\\[state_code\\]][required]:visible',
                },
                'driver_address[city_code]': {
                  required: '[name=driver_address\\[city_code\\]][required]:visible',
                },
                'driver_address[zip]': {
                  required: 'input[name=driver_address\\[zip\\]][required]:visible',
                },
                'driver_address[street]': {
                  required: 'input[name=driver_address\\[street\\]][required]:visible',
                },
                'driver_address[number]': {
                  required: 'input[name=driver_address\\[number\\]][required]:visible',
                },
                'driver_address[complement]': {
                  required: 'input[name=driver_address\\[complement\\]][required]:visible',
                },
                additional_driver_1_driving_license_date_day: {
                  required: 'select[name=additional_driver_1_driving_license_date_day][required]:visible'
                },
                additional_driver_1_driving_license_date_month: {
                  required: 'select[name=additional_driver_1_driving_license_date_month][required]:visible'
                },
                additional_driver_1_driving_license_date_year: {
                  required: 'select[name=additional_driver_1_driving_license_date_year][required]:visible'
                },
                additional_driver_2_driving_license_date_day: {
                  required: 'select[name=additional_driver_2_driving_license_date_day][required]:visible'
                },
                additional_driver_2_driving_license_date_month: {
                  required: 'select[name=additional_driver_2_driving_license_date_month][required]:visible'
                  
                },
                additional_driver_2_driving_license_date_year: {
                  required: 'select[name=additional_driver_2_driving_license_date_year][required]:visible'
                },
                number_of_adults: {
                  required: '#number_of_adults:visible',
                },
                conditions_read_request_reservation: {
                  required: '#conditions_read_request_reservation:visible',
                },
                conditions_read_payment_on_delivery: {
                  required: '#conditions_read_payment_on_delivery:visible',
                },
                conditions_read_pay_now: {
                  required: '#conditions_read_pay_now:visible',
                },
                privacy_read_request_reservation: {
                  required: '#privacy_read_request_reservation:visible',
                },
                privacy_read_payment_on_delivery: {
                  required: '#privacy_read_payment_on_delivery:visible',
                },
                privacy_read_pay_now: {
                  required: '#privacy_read_pay_now:visible',
                },
                payment_method_select: {
                  required: 'input[name=payment_method_select]:visible',
                },
                account_password: {
                  required: '#account_password:visible',
                  pwcheck: '#account_password:visible',
                  minlength: 8,
                },
                slot_time_from: {
                  required: '#slot_time_from:visible',
                },
                with_optional_external_driver: {
                  required: '#with_optional_external_driver:visible',
                },
                flight_company: {
                  required: function() {
                    return (
                      $('#flight_company').attr('required') === 'required' &&
                      model.isAirportDataRequired
                    );
                  },
                },
                flight_number: {
                  required: function() {
                    return (
                      $('#flight_number').attr('required') === 'required' &&
                      model.isAirportDataRequired
                    );
                  },
                },
                flight_time: {
                  required: function() {
                    return (
                      $('#flight_time').attr('required') === 'required' &&
                      model.isAirportDataRequired
                    );
                  },
                },
                destination_accommodation: {
                  required: function() {
                    return (
                      $('#destination_accommodation').attr('required') === 'required' ||
                      model.isHotelDataRequired
                    );
                  },
                },
              },

              messages: {
                customer_classifier_id: {
                  required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                },
                customer_type: {
                  required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                },
                customer_company_name: {
                  required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                },
                customer_company_contact_name: {
                  required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                },
                customer_name: {
                  required: i18next.t(
                    'complete.reservationForm.validations.customerNameRequired'
                  ),
                },
                customer_surname: {
                  required: i18next.t(
                    'complete.reservationForm.validations.customerSurnameRequired'
                  ),
                },
                customer_email: {
                  required: i18next.t(
                    'complete.reservationForm.validations.customerEmailRequired'
                  ),
                  email: i18next.t(
                    'complete.reservationForm.validations.customerEmailInvalidFormat'
                  ),
                },
                confirm_customer_email: {
                  required: i18next.t(
                    'complete.reservationForm.validations.customerEmailConfirmationRequired'
                  ),
                  email: i18next.t(
                    'complete.reservationForm.validations.customerEmailInvalidFormat'
                  ),
                  equalTo: i18next.t(
                    'complete.reservationForm.validations.customerEmailConfirmationEqualsEmail'
                  ),
                },
                customer_phone: {
                  required: i18next.t(
                    'complete.reservationForm.validations.customerPhoneNumberRequired'
                  ),
                  minlength: i18next.t(
                    'complete.reservationForm.validations.customerPhoneNumberMinLength'
                  ),
                },
                customer_mobile_phone: {
                  required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                  minlength: i18next.t('complete.reservationForm.validations.customerPhoneNumberMinLength'),
                },
                customer_document_id_type_id: {
                  required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                },
                customer_document_id: {
                  required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                },
                customer_date_of_birth_day: {
                  required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                },
                customer_date_of_birth_month: {
                  required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                },	
                customer_date_of_birth_year: {
                  required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                },	
                customer_nacionality: {
                  required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                },
                street: {
                  required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                },
                city: {
                  required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                },
                state: {
                  required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                },
                zip: {
                  required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                },
                country: {
                  required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                },
                'customer_address[country]': {
                  required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                },
                'customer_address[state_code]': {
                  required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                },
                'customer_address[city_code]': {
                  required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                },
                'customer_address[zip]': {
                  required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                },
                'customer_address[street]': {
                  required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                },
                'customer_address[number]': {
                  required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                },
                'customer_address[complement]': {
                  required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                },
                driver_name: {
                  required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                },
                driver_surname: {
                  required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                },
                driver_email: {
                  required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                  email: i18next.t('complete.reservationForm.validations.customerEmailInvalidFormat'),
                },
                driver_phone: {
                  required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                },
                driver_nacionality: {
                  required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                },
                driver_document_id_type_id: {
                  required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                },
                driver_document_id: {
                  required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                },
                driver_origin_country: {
                  required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                },
                driver_document_id_date_day: {
                  required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                },
                driver_document_id_date_month: {
                  required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                },
                driver_document_id_date_year: {
                  required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                },
                driver_document_id_expiration_date_day: {
                  required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                },
                driver_document_id_expiration_date_month: {
                  required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                },
                driver_document_id_expiration_date_year: {
                  required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                },
                driver_date_of_birth_day: {
                  required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                },
                driver_date_of_birth_month: {
                  required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                },
                driver_date_of_birth_year: {
                  required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                },
                driver_driving_license_type_id: {
                  required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                },
                driver_driving_license_number: {
                  required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                },
                driver_driving_license_country: {
                  required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                },
                driver_driving_license_date_day: {
                  required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                },
                driver_driving_license_date_month: {
                  required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                },
                driver_driving_license_date_year: {
                  required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                },
                driver_driving_license_expiration_date_day: {
                  required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                },
                driver_driving_license_expiration_date_month: {
                  required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                },	
                driver_driving_license_expiration_date_year: {
                  required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                },
                'driver_address[country]': {
                  required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                },
                'driver_address[state_code]': {
                  required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                },
                'driver_address[city_code]': {
                  required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                },
                'driver_address[zip]': {
                  required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                },
                'driver_address[street]': {
                  required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                },
                'driver_address[number]': {
                  required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                },
                'driver_address[complement]': {
                  required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                },
                additional_driver_1_driving_license_date_day: {
                  required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                },
                additional_driver_1_driving_license_date_month: {
                  required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                },
                additional_driver_1_driving_license_date_year: {
                  required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                },
                additional_driver_2_driving_license_date_day: {
                  required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                },
                additional_driver_2_driving_license_date_month: {
                  required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                },
                additional_driver_2_driving_license_date_year: {
                  required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                },
                number_of_adults: {
                  required: i18next.t(
                    'complete.reservationForm.validations.numberOfAdultsRequired'
                  ),
                },
                conditions_read_request_reservation: {
                  required: i18next.t(
                    'complete.reservationForm.validations.conditionsReadRequired'
                  ),
                },
                conditions_read_payment_on_delivery: {
                  required: i18next.t(
                    'complete.reservationForm.validations.conditionsReadRequired'
                  ),
                },
                conditions_read_pay_now: {
                  required: i18next.t(
                    'complete.reservationForm.validations.conditionsReadRequired'
                  ),
                },
                privacy_read_request_reservation: {
                  required: i18next.t(
                    'complete.reservationForm.validations.privacyPolicyRequired'
                  ),
                },
                privacy_read_payment_on_delivery: {
                  required: i18next.t(
                    'complete.reservationForm.validations.privacyPolicyRequired'
                  ),
                },
                privacy_read_pay_now: {
                  required: i18next.t(
                    'complete.reservationForm.validations.privacyPolicyRequired'
                  ),
                },
                payment_method_select: {
                  required: i18next.t(
                    'complete.reservationForm.validations.selectPaymentMethod'
                  ),
                },
                account_password: {
                  required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                  pwcheck: i18next.t('complete.reservationForm.validations.passwordCheck'),
                  minlength: i18next.t('complete.reservationForm.validations.minLength', {
                    minlength: 8,
                  }),
                },
                slot_time_from: {
                  required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                },
                with_optional_external_driver: {
                  required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                },
                flight_company: {
                  required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                },
                flight_number: {
                  required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                },
                flight_time: {
                  required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                },
                destination_accommodation: {
                  required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                },
              },

              errorPlacement: function(error, element) {
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
                  else if (element[0].tagName === 'SELECT' && element.next().hasClass('select2-container')) {
                    const name = element.attr('name');
                    error.insertAfter(`[name="${name}"] + span.select2-container`);
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
		 * Configures country controls.
		 * @param {jQuery} $form - The form element.
		 */
		configureCountryControls: function($form) {
			// Configure address country selectors
      const countries = i18next.t('common.countries', {returnObjects: true}); // Load country list from translations
      let countriesArray = [];
      if (countries instanceof Object && Object.keys(countries).length > 0) {
        const countryCodes = Object.keys(countries);
        countriesArray = countryCodes.map(function(value) {
          return {id: value, text: countries[value], description: countries[value]};
        });
      } else {
				// Fallback if countries not loaded
				console.error('Countries not loaded');
			}

      const countrySelectors = [
        'select[name=country]',
        'select[name=customer_origin_country]',
        'select[name="driver_address[country]"]',
        'select[name=driver_origin_country]', 
        'select[name=driver_driving_license_country]',
        'select[name=additional_driver_1_origin_country]', 
        'select[name=additional_driver_1_driving_license_country]', 
        'select[name=additional_driver_2_origin_country]',
        'select[name=additional_driver_2_driving_license_country]', 
      ];

      // Initialize Country Selectors and attach cascading handlers if applicable
      for (let idx = 0; idx < countrySelectors.length; idx++) {
        let countrySelectorQuery = countrySelectors[idx];
        let $countrySelector = $form.find(countrySelectorQuery);
        let selectorName = '';

        if ($countrySelector.length > 0 && $countrySelector.prop('tagName') === 'SELECT') {
          const nameStart = countrySelectorQuery.indexOf('name=');

          if (nameStart !== -1) {
            let valueStart = nameStart + 5;
            let quote = countrySelectorQuery[valueStart];

            if (quote === '"' || quote === "'") {
              valueStart += 1;
              const valueEnd = countrySelectorQuery.indexOf(quote, valueStart);
              selectorName = countrySelectorQuery.slice(valueStart, valueEnd);
            } else {
              let valueEnd = countrySelectorQuery.indexOf(']', valueStart);
              if (valueEnd === -1) valueEnd = countrySelectorQuery.length;
              selectorName = countrySelectorQuery.slice(valueStart, valueEnd);
            }
          }

          let countrySelectorId = '';

          // Ensure the country selector has an ID (needed by YSDSelectSelector and for consistent handling)
          if (!$countrySelector.attr('id')) {
            let generatedId = selectorName.replace(/\[|\]/g, '_') + '_id';
            $countrySelector.attr('id', generatedId);
            countrySelectorId = generatedId;
          } else {
            countrySelectorId = $countrySelector.attr('id');
          }

          // Initialize Select2 or YSDSelectSelector
          if (commonServices.jsUseSelect2) {
            if (!$countrySelector.data('select2')) {
              // Add placeholder to the beginning of the array
              countriesArray.unshift({
                id: '',
                text: i18next.t('common.selectOption', 'Select...'),
                description: i18next.t('common.selectOption', 'Select...')
              });

              // Initialize if not already
              $countrySelector
                .select2({
                  width: '100%',
                  theme: 'bootstrap4',
                  data: countriesArray,
                  placeholder: i18next.t('common.selectOption', 'Select...'),
                  allowClear: true,
                  dropdownParent: $countrySelector.parent(),
                }); 
            }
          } else {
            // Initialize YSDSelectSelector
            const countriesDataSource = new MemoryDataSource(countriesArray);
            new SelectSelector(
              countrySelectorId, // Target element ID
              countriesDataSource, // Data source
              undefined, // Initial value
              true, // Allow empty selection
              i18next.t('common.selectOption', 'Select...'), // Placeholder text
            );
          }

          if (selectorName === 'country' || selectorName === 'driver_address[country]') {
            const typeEvent = commonServices.jsUseSelect2 ? 'select2:select' : 'change';
            // Add event listener to the country selector
            $countrySelector.off(typeEvent);
            $countrySelector.on(typeEvent, (e) => {
              const type = $countrySelector.attr('name') === 'customer_address[country]' ? 'customer_address' : 'driver_address';
              const value = commonServices.jsUseSelect2 ? e.params.data.id : $countrySelector.val();

              const stateCodeSelector = $(`select[name="${type}\\[state_code\\]"]`);
              const stateInput = $(`input[name="${type}\\[state\\]"]`);
              const cityCodeSelector = $(`select[name="${type}\\[city_code\\]"]`);
              const cityInput = $(`input[name="${type}\\[city\\]"]`);

              if (value && value === 'ES') {
                // Para España
                stateInput.val('').attr('disabled', true).hide();
                stateCodeSelector.attr('disabled', false).show();
                stateCodeSelector.next('.select2-container').show();
                cityInput.val('').attr('disabled', true).hide();
                cityCodeSelector.attr('disabled', false).show();
                cityCodeSelector.next('.select2-container').show();

                const stateName = $(`select[name="${type}[state_code]"]`).attr('name');
                if (stateName) {
                    model.loadSpanishStates(stateName);
                }

                // Add event listener to the city selectors
                view.addEventListenersToCitySelectors($form);
              } else {
                // Para otros países
                stateCodeSelector.attr('disabled', true).hide();
                stateCodeSelector.next('.select2-container').hide();
                stateInput.attr('disabled', false).show();
                cityCodeSelector.attr('disabled', true).hide();
                cityCodeSelector.next('.select2-container').hide();
                cityInput.attr('disabled', false).show();
              }

              if (commonServices.jsUseSelect2) {
                // Refresh the select2 visible value
                $countrySelector.val(value).trigger('change');
              }

            });
          }
        }
      }
		},

    /**
     * Adds event listeners to state and city selectors.
     * @param {jQuery} $form - The form element.
     */
    addEventListenersToCitySelectors: function($form) {
      // Add event listener to city selectors
      const $stateSelectors = $form.find('select[name=state_code], select[name="driver_address[state_code]"]');
      $stateSelectors.off('change');
      $stateSelectors.on('change', function() {
        const name = $(this).attr('name');
        const targetName = name.replace('state_code', 'city_code');
        const value = $(`select[name="${name}"]`).val();
        if (targetName && value) {
          model.loadSpanishCities(targetName, value);
        }
      });
    },

		/**
		 * Configures date controls using YSDDateControl.
		 * @param {jQuery} $form - The form element.
		 */	
		configureDateControls: function($form) {
			// Configure Date Controls using YSDDateControl
      if (typeof DateControl === 'undefined') {
        // Show translated alert if DateControl is missing
        alert(
          i18next.t(
            'customerDriverData.dateControlError',
            'Critical Error: Date controls could not be initialized. Please contact support.',
          ),
        );
        // Optionally, you might want to return here to stop further execution in this function
        // return;
      } else {
        // Configuration for each date control group (day/month/year selects + hidden input)
        const dateControlConfigs = [
          {prefix: 'customer_date_of_birth', direction: undefined},
          {prefix: 'driver_document_id_date', direction: undefined},
          {prefix: 'driver_document_id_expiration_date', direction: 'future'},
          {prefix: 'driver_date_of_birth', direction: undefined},
          {prefix: 'driver_driving_license_date', direction: undefined},
          {prefix: 'driver_driving_license_expiration_date', direction: 'future'},
          {prefix: 'additional_driver_1_driving_license_date', direction: undefined},
          {prefix: 'additional_driver_1_driving_license_expiration_date', direction: 'future'}, 
          {prefix: 'additional_driver_2_driving_license_date', direction: undefined},
          {prefix: 'additional_driver_2_driving_license_expiration_date', direction: 'future'},
        ];

        dateControlConfigs.forEach((config) => {
          // Find elements using name attributes
          const dayEl = $form.find('select[name="' + config.prefix + '_day"]').get(0);
          const monthEl = $form.find('select[name="' + config.prefix + '_month"]').get(0);
          const yearEl = $form.find('select[name="' + config.prefix + '_year"]').get(0);
          const hiddenEl = $form.find('input[type=hidden][name="' + config.prefix + '"]').get(0);

          if (dayEl && monthEl && yearEl && hiddenEl) {
            // Initialize only if not already done (using a data flag)
            if (!$(hiddenEl).data('datecontrol_initialized')) {
              new DateControl(
                dayEl,
                monthEl,
                yearEl,
                hiddenEl,
                commonSettings.language(model.requestLanguage), // Language for months
                undefined, // Optional initial date
                config.direction, // Optional 'future' or 'past' restriction
              );
              $(hiddenEl).data('datecontrol_initialized', true); // Set flag
            }
          }
        });
      }
		},

		/**
		 * Configures telephone inputs using intl-tel-input.
		 * @param {jQuery} $form - The form element.
		 */	
		configureTelephoneInputs: function($form) {
			// Configure Telephone inputs using intl-tel-input
      let phoneCountryCode = model.configuration.countryCode;
      if (typeof phoneCountryCode === 'undefined' || phoneCountryCode == null) {
        phoneCountryCode = commonUI.intlTelInputCountryCode(); // Fallback country
      }
      const telInputs = [
        'input[name="customer_phone"]',
        'input[name="customer_mobile_phone"]', 
        'input[name="driver_phone"]',
        'input[name="additional_driver_1_phone"]', 
        'input[name="additional_driver_2_phone"]',
      ];
      telInputs.forEach((selector) => {
        const $input = $form.find(selector); // Assumes IDs
        if ($input.length) {
          if (!$input.data('plugin_intlTelInput')) {
            // Initialize if not already
            $input.intlTelInput({
              initialCountry: phoneCountryCode,
              separateDialCode: true,
              utilsScript: commonServices.phoneUtilsPath,
              preferredCountries: [phoneCountryCode],
            });
          }
        }
      });
		},

    /**
     * Populates nationality selects with data from API.
     */
    populateNationalities: function(data) {
      const options = data.map((item) => ({id: item.code, text: item.name}));
      options.unshift({id: '', text: i18next.t('myUserData.select_nationality', 'Select nationality...')}); // Add placeholder

      const selectors = [
        'select[name=customer_nacionality]',
        'select[name=driver_nacionality]',
        // Add other nationality selectors here if they exist in the template
      ];

      view.populateSelects(selectors, options);
    },

    /**
     * Populates document type selects with data from API.
     */
    populateDocumentTypes: function(data) {
      const options = data.map((item) => ({id: item.id, text: item.label}));
      options.unshift({id: '', text: i18next.t('myUserData.select_type_document', 'Select document type...')}); // Add placeholder

      const selectors = [
        'select[name=customer_document_id_type_id]',
        'select[name=driver_document_id_type_id]',
        // Add other document type selectors here if they exist
      ];

      view.populateSelects(selectors, options);
    },

    /**
     * Populates license type selects with data from API.
     */
    populateLicenseTypes: function(data) {
      const options = data.map((item) => ({id: item.id, text: item.label}));
      options.unshift({id: '', text: i18next.t('myUserData.select_driving_license', 'Select license type...')}); // Add placeholder (Adjust translation key if needed)

      const selectors = [
        'select[name=driver_driving_license_type_id]',
        // Add other license type selectors here if they exist (e.g., for additional drivers)
      ];

      view.populateSelects(selectors, options);
    },

    /**
     * Helper function to populate select elements (handles Select2 or standard select).
     */
    populateSelects: function(selectors, options) {
      const $form = $(model.formSelector);
      
      selectors.forEach((selector) => {
        const $select = $form.find(selector);
        if ($select.length) {
          if (commonServices.jsUseSelect2) {
            // Update Select2 options
            if ($select.data('select2')) {
              // If already initialized, update data
              $select.empty().select2({data: options}).val('').trigger('change');
            } else {
              // Initialize Select2 if not already done
              $select
                .select2({
                  width: '100%',
                  theme: 'bootstrap4',
                  data: options,
                  placeholder: options[0] ? options[0].text : 'Select...',
                  allowClear: true,
                  dropdownParent: $select.parent(),
                })
                .val('')
                .trigger('change');              
            }
          } else {
            // Populate standard select element
            $select.empty();
            options.forEach((opt) => {
              $select.append($('<option>', {value: opt.id, text: opt.text}));
            });
            $select.val(''); // Reset selection
            // If using YSDSelectSelector elsewhere, specific update logic might be needed here too
          }

          // Remove disabled attribute
          $select.removeAttr('disabled');
        } else {
          // Selector not found in the form, ignore. (Expected if the field is not used in the current template)
        }
      });
    },

    /**
     * Populates state/province selects with data and attaches city loading handler.
     * @param {string} stateSelectName - Name of the state select element.
     * @param {Array} data - Array of state data (expected { code: 'XX', name: 'State Name' }).
     */
    populateStates: function(stateSelectName, data) {
      const $stateSelect = $(`select[name="${stateSelectName}"]`);
      if (!$stateSelect.length) return; // Exit if select not found

      // Map data to {id, text} format for selects
      const options = data.map((item) => ({id: item.code, text: item.literal}));
      options.unshift({id: '', text: i18next.t('address.select_state', 'Select state...')}); // Add placeholder

      // Use helper to populate the select (handles Select2/standard)
      view.populateSelects([`select[name="${stateSelectName}"]`], options);
    },

    /**
     * Populates city selects with data.
     * @param {string} citySelectName - Name of the city select element.
     * @param {Array} data - Array of city data (expected { code: '12345', name: 'City Name' }).
     */
    populateCities: function(citySelectName, data) {
      const $citySelect = $(`select[name="${citySelectName}"]`);
      if (!$citySelect.length) return; // Exit if select not found

      // Map data to {id, text} format for selects
      const options = data.map((item) => ({id: item.cmun5d, text: item.name}));
      options.unshift({id: '', text: i18next.t('address.select_city', 'Select city...')}); // Add placeholder

      // Use helper to populate the select (handles Select2/standard)
      view.populateSelects([`select[name="${citySelectName}"]`], options);
    },
  };

  // Return the public interface
  return {
    init: view.init,
  };
});
