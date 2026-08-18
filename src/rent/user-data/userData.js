/* eslint-disable camelcase */
/* eslint-disable max-len */
require([
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
  'commonDateControls',
  'jquery.i18next',
  'jquery.validate',
  'jquery.ui',
  'jquery.form',
  'commonAddressControls',
  'commonFormValidation',
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
  commonDateControls,
  commonAddressControls,
  commonFormValidation,
) {
  const model = {
    // THE MODEL
    requestLanguage: null,
    configuration: null,

    /* Form */
    nationalities: null,
    documentTypes: null,
    licenseTypes: null,
    required_fields: [], //null,

    // ------------ Product information detail ------------------------

    /**
     * Get the URL variables
     */
    getUrlVars: function () {
      let vars = [],
        hash;
      const hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
      for (let i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
      }
      return vars;
    },

    // ----------------- UserData ------------------------------

    /**
     * Update the userData
     */
    create: function () {      // Load document types

      // Build request
      const customer = $('form[name=new_customer_form]').formParams(false);
      if ($('input[name=phone_number]').length && $('input[name=phone_number]').is(':enabled')){
        var countryData = $('input[name=phone_number]').intlTelInput('getSelectedCountryData');
        if (countryData != null) {
          customer.phone_prefix = countryData.dialCode;
        }
      }
      const customerJSON = JSON.stringify(customer);

      // Build the URL
      let url = commonServices.URL_PREFIX + '/api/v1/customers/frontend/customers';
      const urlParams = [];
      if (this.requestLanguage != null) {
        urlParams.push('lang=' + this.requestLanguage);
      }
      if (commonServices.apiKey && commonServices.apiKey != '') {
        urlParams.push('api_key=' + commonServices.apiKey);
      }
      if (urlParams.length > 0) {
        url += '?';
        url += urlParams.join('&');
      }
      // Request
      $.ajax({
        type: 'POST',
        url: url,
        data: customerJSON,
        dataType : 'json',
        contentType: 'application/json; charset=utf-8',
        crossDomain: true,
        success: function (data, textStatus, jqXHR) {
          alert(i18next.t('common.processSuccess'));
          $('form[name=new_customer_form]').trigger('reset');
        },
        error: function (jqXHR, textStatus, errorThrown) {
          if (jqXHR.status === 400) {
            if (jqXHR.responseJSON && jqXHR.responseJSON.message) {
              alert(i18next.t(jqXHR.responseJSON.message));
            }
          } 
          else {
            alert(i18next.t('common.processError'));
          }
        }
      });
    },

    // ----------------- Load forms data ------------------------------

    /*
     * Load required_fields
     */
    loadRequiredFields: function () {
      // Load required fields
      // Build the URL
      let url = commonServices.URL_PREFIX + '/api/v1/customers/frontend/required-fields';
      const urlParams = [];
      if (this.requestLanguage != null) {
        urlParams.push('lang=' + this.requestLanguage);
      }
      if (commonServices.apiKey && commonServices.apiKey != '') {
        urlParams.push('api_key=' + commonServices.apiKey);
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
        contentType: 'application/json; charset=utf-8',
        crossDomain: true,
        success: function (data, textStatus, jqXHR) {
          model.required_fields = data;
          view.init();
        },
      });
    },

    /*
     * Load nationalities
     */
    loadNationalities: function () {
      // Load nationalities
      // Build the URL
      let url = commonServices.URL_PREFIX + '/api/booking/frontend/nacionalities';
      const urlParams = [];
      if (this.requestLanguage != null) {
        urlParams.push('lang=' + this.requestLanguage);
      }
      if (commonServices.apiKey && commonServices.apiKey != '') {
        urlParams.push('api_key=' + commonServices.apiKey);
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
        contentType: 'application/json; charset=utf-8',
        crossDomain: true,
        success: function (data, textStatus, jqXHR) {
          model.nationalities = data;
          view.formatNationalities(data);
        },
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
        urlParams.push('api_key=' + commonServices.apiKey);
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
        contentType: 'application/json; charset=utf-8',
        crossDomain: true,
        success: function (data, textStatus, jqXHR) {
          model.documentTypes = data;
          view.formatDocumentTypes(data);
        },
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
        urlParams.push('api_key=' + commonServices.apiKey);
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
        contentType: 'application/json; charset=utf-8',
        crossDomain: true,
        success: function (data, textStatus, jqXHR) {
          model.licenseTypes = data;
          view.formatLicenseTypes(data);
        },
      });
    },
  };

  const controller = {
    // THE CONTROLLER

    /**
     * Create the customer
     */
    btnCreateClick: function () {
      model.create();
    },

    // ----------------- Form ------------------------------

    /**
     * On Change the country
     * @param {*} country
     * @param {*} stateName
     * @param {*} cityName
     */
    onChangeCountry: function (country, stateCodeSelector, stateNameSelector, cityCodeSelector, cityNameSelector) {
      console.log('Country changed', country, stateCodeSelector, stateNameSelector, cityCodeSelector, cityNameSelector);

      if (country === 'ES') {
        // Hide inputs
        $(stateNameSelector).hide();
        $(cityNameSelector).hide();
        // Show selectors
        $(stateCodeSelector).next('.select2-container').show();
        $(cityCodeSelector).next('.select2-container').show();
      } else {
        // Hide selectors
        $(stateCodeSelector).next('.select2-container').hide();
        $(cityCodeSelector).next('.select2-container').hide();
        // Show inputs
        $(stateNameSelector).show();
        $(cityNameSelector).show();
      }
    },
  };

  const view = {
    // THE VIEW
    init: function () {
      // Append validators
      commonSettings.appendValidators();

      // Initialize i18next for translations
      model.requestLanguage = commonSettings.language(document.documentElement.lang);
      i18next.init(
        {
          lng: model.requestLanguage,
          resources: commonTranslations,
        },
        function (error, t) {
          // https://github.com/i18next/jquery-i18next#initialize-the-plugin
          //jqueryI18next.init(i18next, $);
          // Localize UI
          //$('.nav').localize();
        },
      );

      model.configuration = commonSettings.data;

      this.setupForm();
      this.setupEvents();
    },

    // ----------------- Form ------------------------------

    setupForm: function() {

        // Customer panel
        // Include customer driver form
        if (document.getElementById('script_mybooking_new_customer')) {
          const formCustomer = tmpl('script_mybooking_new_customer')(
            {required_fields: model.required_fields,
             configuration: model.configuration});
          $('#mybooking_new_customer_container').html(formCustomer);
        }

    },

    /**
     * Load selects options
     */
    formatCountries: function () {
      commonAddressControls.initCountrySelector($('select[name=address\\[country\\]]'), null, {});
      commonAddressControls.initCountrySelector($('select[name=origin_country]'), null, {});
      commonAddressControls.initCountrySelector($('select[name=driving_license_country]'), null, {});
    },

    /*
     * Format nationalities for select
     */
    formatNationalities: function (data) {
      const formatData = [];
      for (let idx = 0; idx < data.length; idx++) {
        formatData[idx] = {
          id: data[idx].code,
          text: data[idx].name,
          description: data[idx].name,
        };
      }
      formatData.unshift({ id: '', text: '', description: '' });

      if (commonServices.jsUseSelect2) {
        // Configure address country
        const selectors = [
          'select[name=nacionality]',
        ];
        let $nationalitySelector = null;
        for (let idx = 0; idx < selectors.length; idx++) {
          $nationalitySelector = $(selectors[idx]);
          if ($nationalitySelector.length > 0) {
            $nationalitySelector.select2({
              width: '100%',
              theme: 'bootstrap4',
              data: formatData,
              placeholder: i18next.t('common.selectOption'),
            });
          }
        }
      } else {
        // Setup country selector
        const selectors = [
          'nacionality',
        ];
        for (let idx = 0; idx < selectors.length; idx++) {
          const elements = document.getElementsByName(selectors[idx]);
          if (elements.length > 0) {
            const nationalitiesDataSource = new MemoryDataSource(formatData);
            const nationalityModel = '';
            for (let j = 0; j < elements.length; j++) {
              new SelectSelector(
                selectors[idx],
                nationalitiesDataSource,
                nationalityModel,
                true,
                i18next.t('myUserData.select_nationality'),
              );
            }
          }
        }
      }
    },

    /*
     * Format document types for select
     */
    formatDocumentTypes: function (data) {
      const formatData = [];
      for (let idx = 0; idx < data.length; idx++) {
        formatData[idx] = {
          id: data[idx].id,
          text: data[idx].label,
          description: data[idx].label,
        };
      }
      formatData.unshift({ id: '', text: '', description: '' });

      if (commonServices.jsUseSelect2) {
        // Configure address country
        const selectors = [
          'select[name=document_id_type_id]',
        ];
        let $nationalitySelector = null;
        for (let idx = 0; idx < selectors.length; idx++) {
          $nationalitySelector = $(selectors[idx]);
          if ($nationalitySelector.length > 0) {
            $nationalitySelector.select2({
              width: '100%',
              theme: 'bootstrap4',
              data: formatData,
              placeholder: i18next.t('common.selectOption'),
            });
          }
        }
      } else {
        // Setup country selector
        const selectors = [
          'document_id_type_id',
        ];
        for (let idx = 0; idx < selectors.length; idx++) {
          const elements = document.getElementsByName(selectors[idx]);
          if (elements.length > 0) {
            const countriesDataSource = new MemoryDataSource(formatData);
            const countryModel = '';
            for (let j = 0; j < elements.length; j++) {
              new SelectSelector(
                selectors[idx],
                countriesDataSource,
                countryModel,
                true,
                i18next.t('myUserData.select_type_document'),
              );
            }
          }
        }
      }
    },

    /*
     * Format license types for select
     */
    formatLicenseTypes: function (data) {
      const formatData = [];
      for (let idx = 0; idx < data.length; idx++) {
        formatData[idx] = {
          id: data[idx].id,
          text: data[idx].label,
          description: data[idx].label,
        };
      }
      formatData.unshift({ id: '', text: '', description: '' });

      if (commonServices.jsUseSelect2) {
        // Configure address country
        const selectors = [
          'select[name=driving_license_type_id]',
        ];
        let $nationalitySelector = null;
        for (let idx = 0; idx < selectors.length; idx++) {
          $nationalitySelector = $(selectors[idx]);
          if ($nationalitySelector.length > 0) {
            $nationalitySelector.select2({
              width: '100%',
              theme: 'bootstrap4',
              data: formatData,
              placeholder: i18next.t('common.selectOption'),
            });
          }
        }
      } else {
        // Setup country selector
        const selectors = [
          'driving_license_type_id',
        ];
        for (let idx = 0; idx < selectors.length; idx++) {
          const elements = document.getElementsByName(selectors[idx]);
          if (elements.length > 0) {
            const countriesDataSource = new MemoryDataSource(formatData);
            const countryModel = '';
            for (let j = 0; j < elements.length; j++) {
              new SelectSelector(
                selectors[idx],
                countriesDataSource,
                countryModel,
                true,
                i18next.t('myUserData.select_type_document'),
              );
            }
          }
        }
      }
    },

    /*
     * Setup date controls in form
     */
    setupDateControls: function () {
      commonDateControls.setup({
        root: $('form[name=new_customer_form]'),
        locale: commonSettings.language(model.requestLanguage),
        legacyDirections: {
          document_id_expiration_date: 'future',
          driving_license_expiration_date: 'future'
        }
      });
    },

    /**
     * Setup phone controls in form
     */
    setupPhoneControls: function () {
      // Configure Telephone with prefix
      let countryCode = model.configuration.countryCode;
      let input = $('[name="phone_number"]');
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
    setupSelectControls: function () {

      // Address SES descriptor
      commonAddressControls.initAddressDescriptor({
        enabled: !!model.configuration.sesHospedajes,
        requestLanguage: model.requestLanguage,
        countrySelector: 'select[name=address\\[country\\]]',
        countryValue: null,
        stateTextSelector: '[name="address[state]"]',
        stateCodeSelector: 'select[name=address\\[state_code\\]]',
        cityTextSelector: '[name="address[city]"]',
        cityCodeSelector: 'select[name=address\\[city_code\\]]',
        stateRequired: model.required_fields.includes('address[state]'),
        cityRequired: model.required_fields.includes('address[city]'),
        locked: false
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
     * Setup userData form
     */
    setupUserDataForm: function () {
      // Setup select controls
      this.setupSelectControls();

      // Setup date controls
      this.setupDateControls();

      // Setup phone controls
      this.setupPhoneControls();

      $.extend($.validator.messages, {
        required: i18next.t('complete.reservationForm.validations.fieldRequired'),
      });

      $('form[name=new_customer_form]').unbind('validate');
      $('form[name=new_customer_form]').validate(
          {   
            ignore: '',
            invalidHandler : function(form, validator) {
              alert(i18next.t('myReservation.passenger.validations.invalid'));
            },
            submitHandler: function(form) {
              controller.btnCreateClick();
              return false;
            },
            rules : {
              'name': {
                required: () => $('[name="name"]').is(':visible') && $('[name="name"]').prop('required')
              },
              'surname': {
                required: () => $('[name="surname"]').is(':visible') && $('[name="surname"]').prop('required')
              },
              'customer_email': {
                required: () => $('[name="customer_email"]').is(':visible') && $('[name="customer_email"]').prop('required'),
                email: () => $('[name="customer_email"]').is(':visible') && $('[name="customer_email"]').prop('required'),
              },
              'customer_phone': {
                required: () => $('[name="customer_phone"]').is(':visible') && $('[name="customer_phone"]').prop('required'),
                minlength: 9
              },
              'nacionality': {
                required: () => $('[name="nacionality"]').is(':visible') && $('[name="nacionality"]').prop('required'),
              },
              'document_id_type_id': {
                required: () => $('[name="document_id_type_id"]').is(':visible') && $('[name="document_id_type_id"]').prop('required'),
              },
              'email': {
                required: () => $('[name="email"]').is(':visible') && $('[name="email"]').prop('required'),
                email: () => $('[name="email"]').is(':visible') && $('[name="email"]').prop('required'),
              },
              'phone_number': {
                required: () => $('[name="phone_number"]').is(':visible') && $('[name="phone_number"]').prop('required'),
                minlength: 9
              },
              'document_id': {
                required: () => $('[name="document_id"]').is(':visible') && $('[name="document_id"]').prop('required'),             
              },
              'origin_country': {
                required: commonFormValidation.buildSelectorRequiredFn('select[name=origin_country]'),
              },
              'driving_license_type_id': {
                required: () => $('[name="driving_license_type_id"]').is(':visible') && $('[name="driving_license_type_id"]').prop('required'),
              },
              'driving_license_number': {
                required: () => $('[name="driving_license_number"]').is(':visible') && $('[name="driving_license_number"]').prop('required'),
              },
              'driving_license_country': {
                required: commonFormValidation.buildSelectorRequiredFn('select[name=driving_license_country]'),
              },
              'address[street]': {
                required: () => $('[name="address\\[street\\]"]').is(':visible') && $('[name="address\\[street\\]"]').prop('required'),
              },
              'address[number]': {
                required: () => $('[name="address\\[number\\]"]').is(':visible') && $('[name="address\\[number\\]"]').prop('required'),
              },
              'address[complement]': {
                required: () => $('[name="address\\[complement\\]"]').is(':visible') && $('[name="address\\[complement\\]"]').prop('required'),
              },
              'address[city]': {
                required: () => $('[name="address\\[city\\]"]').is(':visible') && model.required_fields.includes('address[city]'),
              },
              'address[city_code]': {
                required: commonFormValidation.buildSelectorRequiredFn('select[name=address\\[city_code\\]]'),
              },
              'address[state]': {
                required: () => $('[name="address\\[state\\]"]').is(':visible') && model.required_fields.includes('address[state]'),
              },
              'address[state_code]': {
                required: commonFormValidation.buildSelectorRequiredFn('select[name=address\\[state_code\\]]'),
              },
              'address[country]': {
                required: commonFormValidation.buildSelectorRequiredFn('select[name=address\\[country\\]]'),
              },
              'address[zip]': {
                required: () => $('[name="address\\[zip\\]"]').is(':visible') && $('[name="address\\[zip\\]"]').prop('required'),
              },                            
            },

            messages: {
              'name': {
                required: i18next.t('complete.reservationForm.validations.fieldRequired')
              },
              'surname': {
                required: i18next.t('complete.reservationForm.validations.fieldRequired')
              },
              'email': {
                required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                email: i18next.t('complete.reservationForm.validations.customerEmailInvalidFormat'),
              },
              'phone_number': {
                required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                minlength: i18next.t('complete.reservationForm.validations.customerPhoneNumberMinLength')
              },
              'nacionality': {
                required: i18next.t('complete.reservationForm.validations.fieldRequired')
              },
              'document_id_type_id': {
                required: i18next.t('complete.reservationForm.validations.fieldRequired'),
              },
              'document_id': {
                required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                documentValidator: i18next.t('complete.reservationForm.validations.invalidValue')
              },
              'origin_country': {
                required: i18next.t('complete.reservationForm.validations.fieldRequired')
              },
              'driving_license_type_id': {
                required: i18next.t('complete.reservationForm.validations.fieldRequired')
              },
              'driving_license_number': {
                required: i18next.t('complete.reservationForm.validations.fieldRequired'),
              },
              'driving_license_country': {
                required: i18next.t('complete.reservationForm.validations.fieldRequired')
              },
              'address\\[street\\]': {
                required: i18next.t('complete.reservationForm.validations.fieldRequired')
              },
              'address\\[number\\]': {
                required: i18next.t('complete.reservationForm.validations.fieldRequired')
              },
              'address\\[complement\\]': {
                required: i18next.t('complete.reservationForm.validations.fieldRequired')
              },
              'address\\[city\\]': {
                required: i18next.t('complete.reservationForm.validations.fieldRequired')
              },
              'address\\[city_code\\]': {
                required: i18next.t('complete.reservationForm.validations.fieldRequired')
              },
              'address\\[state\\]': {
                required: i18next.t('complete.reservationForm.validations.fieldRequired')
              },
              'address\\[state_code\\]': {
                required: i18next.t('complete.reservationForm.validations.fieldRequired')
              },
              'address\\[country\\]': {
                required: i18next.t('complete.reservationForm.validations.fieldRequired')
              },
              'address\\[zip\\]': {
                required: i18next.t('complete.reservationForm.validations.fieldRequired')
              },                           
            },

            errorPlacement: function(error, element) {
              if (commonDateControls.placeError(error, element)) {
                // handled: canonical date error after visible date composite
              } else if (element.attr('name') === 'document_id_type_id')  {
                if (commonServices.jsUseSelect2) {
                  error.insertAfter('form[name=new_customer_form] select[name=document_id_type_id] + span.select2-container');
                }
                else {
                  error.insertAfter(element);
                }
              } 
              else if (element.attr('name') === 'driving_license_type_id')  {
                if (commonServices.jsUseSelect2) {
                  error.insertAfter('form[name=new_customer_form] select[name=driving_license_type_id] + span.select2-container');
                }
                else {
                  error.insertAfter(element);
                }
              } 
              else if (element.attr('name') === 'address[state_code]' && element.is('select')) {
                error.insertAfter('form[name=new_customer_form] select[name=address\\[state_code\\]] + span.select2-container'); 
              } else if (element.attr('name') === 'address[city_code]' && element.is('select')) {
                  error.insertAfter('form[name=new_customer_form] select[name=address\\[city_code\\]] + span.select2-container');    
              } else if (element.attr('name') === 'address[country]' && element.is('select')) {
                  error.insertAfter('form[name=new_customer_form] select[name=address\\[country\\]] + span.select2-container');                              
              } else {
                error.insertAfter(element);
              } 
            }    
          }
      );

      commonDateControls.applyValidationRules(
        $('form[name=new_customer_form]'),
        i18next.t('complete.reservationForm.validations.datePatternInvalid')
      );

      if (model.configuration.sesHospedajes) {
        // Apply the validation rules for the document
        $('input[name=document_id]').rules('add', {
          documentValidator: {
            documentTypeControlId: 'select[name=document_id_type_id]',
          },
        });
      }

      commonLoader.hide();
    },

    /**
     * Setup events
     */
    setupEvents: function () {
      this.setupUserDataForm();
    },
  };

  // The loader is show on start and hidden after the userData
  // has been rendered
  commonLoader.show();

  // Load required fields
  model.loadRequiredFields();

  //view.init();
});
