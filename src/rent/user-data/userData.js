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
  'YSDDateControl',
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
      model.configuration.sesHospedajes = true; // TODO remove

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
      // Load countries
      let countries = i18next.t('common.countries', { returnObjects: true });

      let countriesArray = [];
      if (countries instanceof Object) {
        const countryCodes = Object.keys(countries);
        countriesArray = countryCodes.map(function (value) {
          return { id: value, text: countries[value], description: countries[value] };
        });
        countriesArray.unshift({ id: '', text: '' });
      }

      if (commonServices.jsUseSelect2) {
        // Configure address country
        const selectors = [
          'select[name=address\\[country\\]]',
          'select[name=origin_country]',
          'select[name=driving_license_country]',
        ];
        let $countrySelector = null;
        for (let idx = 0; idx < selectors.length; idx++) {
          console.log('countries', selectors[idx]);
          $countrySelector = $(selectors[idx]);
          if ($countrySelector.length > 0) {
            $countrySelector.select2({
              width: '100%',
              theme: 'bootstrap4',
              data: countriesArray,
              placeholder: i18next.t('common.selectOption'),
            });
          }
        }
      } else {
        // Setup country selector
        const selectors = [
          'address[country]',
          'origin_country',
          'driving_license_country',
        ];
        for (let idx = 0; idx < selectors.length; idx++) {
          // Load the contries
          const elements = document.getElementsByName(selectors[idx]);
          if (elements.length > 0) {
            const countriesDataSource = new MemoryDataSource(countriesArray);
            const countryModel = '';
            for (let j = 0; j < elements.length; j++) {
              new SelectSelector(
                selectors[idx],
                countriesDataSource,
                countryModel,
                true,
                i18next.t('myUserData.select_country'),
              );
            }
          }
        }
      }
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
      const controls = $('.js-date-select-control');

      controls.each((index, element) => {
        const day = $(element).find('[name$="_day"]');
        const month = $(element).find('[name$="_month"]');
        const year = $(element).find('[name$="_year"]');
        const hiddenControl = $(element).find('[type="hidden"]');

        const direction = $(element).attr('data-date-select-control-direction');
        // If date is in the past revert
        const dateControl = new DateControl(
          day[0],
          month[0],
          year[0],
          hiddenControl[0],
          commonSettings.language(model.requestLanguage),
          undefined,
          direction,
        );
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
      if (model.configuration.sesHospedajes) {
        // Setup state code and city code controls
        const $driverAddressStateCode = $('select[name=address\\[state_code\\]]');
        const $driverAddressCityCode = $('select[name=address\\[city_code\\]]');
        this.setupAddressStateCodeControl($driverAddressStateCode);
        $driverAddressStateCode.next('.select2-container').hide();
        this.setupAddressCityCodeControl($driverAddressCityCode, $driverAddressStateCode);
        $driverAddressCityCode.next('.select2-container').hide();
        this.setupAddressStateControlEvents($driverAddressStateCode, $driverAddressCityCode);
        // Setup the customer/driver address country events
        this.setupAddressCountryEvents($('select[name=address\\[country\\]]'));
      }

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
     * Setup customer/driver address country events
     */
    setupAddressCountryEvents: function ($countrySelector) {
      if (commonServices.jsUseSelect2) {
        $countrySelector.off('select2:select');
        $countrySelector.on('select2:select', function (e) {
          const country = $(this).val();
          const stateSelectorName = $(this).attr('data-state-selector-name');
          const stateInputName = $(this).attr('data-state-input-name');
          const citySelectorName = $(this).attr('data-city-selector-name');
          const cityInputName = $(this).attr('data-city-input-name');
          controller.onChangeCountry(country, stateSelectorName, stateInputName, citySelectorName, cityInputName);
        });
      } else {
        $countrySelector.off('change');
        $countrySelector.on('change', function (e) {
          const country = $(this).val(); //e.params.data.id;
          const stateSelectorName = $(this).attr('data-state-selector-name');
          const stateInputName = $(this).attr('data-state-input-name');
          const citySelectorName = $(this).attr('data-city-selector-name');
          const cityInputName = $(this).attr('data-city-input-name');
          controller.onChangeCountry(country, stateSelectorName, stateInputName, citySelectorName, cityInputName);
        });
      }
    },

    /**
     * Setup address state code events
     */
    setupAddressStateControlEvents: function ($selector, $citiesSelector) {
      $($selector).off('select2:select');
      $($selector).on('select2:select', function (e) {
        const stateCode = e.params.data.id;
        // Clear city value
        $($citiesSelector).val(undefined).trigger('change');

        if (stateCode && stateCode !== '') {
          $($citiesSelector).removeAttr('disabled');
        } else {
          $($citiesSelector).attr('disabled', 'disabled');
        }
      });
    },

    /**
     * Setup address state code
     */
    setupAddressStateCodeControl: function ($selector) {
      console.log('setupAddressStateCodeControl', $selector);

      // Build the URL to retrieve the states
      let url = commonServices.URL_PREFIX + '/api/booking/frontend/states';
      const urlParams = [];
      if (this.requestLanguage != null) {
        urlParams.push('lang=' + model.requestLanguage);
      }
      if (commonServices.apiKey && commonServices.apiKey != '') {
        urlParams.push('api_key=' + commonServices.apiKey);
      }
      if (urlParams.length > 0) {
        url += '?';
        url += urlParams.join('&');
      }

      // Create the select2 control
      $selector.select2({
        width: '100%',
        allowClear: true,
        placeholder: i18next.t('common.selectOption'),
        ajax: {
          url: url,
          processResults: function (data) {
            var transformedData = [];
            for (var idx = 0; idx < data.length; idx++) {
              var element = {
                text: data[idx].literal,
                id: data[idx].code,
              };
              transformedData.push(element);
            }
            return { results: transformedData };
          },
        },
      });
    },

    /**
     * Setup address city code
     */
    setupAddressCityCodeControl: function ($selector, $stateSelector) {
      console.log('setupAddressCityCodeControl', $selector);

      // Build the URL to retrieve the states
      let url = commonServices.URL_PREFIX + '/api/booking/frontend/cities';
      const urlParams = [];
      if (this.requestLanguage != null) {
        urlParams.push('lang=' + model.requestLanguage);
      }
      if (commonServices.apiKey && commonServices.apiKey != '') {
        urlParams.push('api_key=' + commonServices.apiKey);
      }
      if (urlParams.length > 0) {
        url += '?';
        url += urlParams.join('&');
      }

      // Create the select2 control
      $selector.select2({
        width: '100%',
        allowClear: true,
        placeholder: i18next.t('common.selectOption'),
        ajax: {
          url: () => {
            let theUrl;
            const state_code = $stateSelector.val();
            if (urlParams.length > 0) {
              theUrl = `${url}&state_code=${state_code}`;
            } else {
              theUrl = `${url}?state_code=${state_code}`;
            }
            console.log('theUrl', theUrl);
            return theUrl;
          },
          processResults: function (data) {
            var transformedData = [];
            for (var idx = 0; idx < data.length; idx++) {
              var element = {
                text: data[idx].name,
                id: data[idx].cmun5d,
              };
              transformedData.push(element);
            }
            return { results: transformedData };
          },
        },
      });
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

      // Date patter
      $.validator.addMethod(
        'date_pattern',
        function (value, element) {
          // Check the regular expression only if it is not empty
          if (value === '') {
            return true;
          }
          const regex = new RegExp('^\\d{4}-\\d{2}-\\d{2}$');
          return regex.test(value);
        },
        'Date format is YYYY-MM-DD.',
      );

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
              'date_of_birth': {
                required: (element) => view.validateDateIsRequired(element),
                date_pattern: true,
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
                required: () => $('[name="origin_country"]').is(':visible') && $('[name="origin_country"]').prop('required'),
              },
              'document_id_date': {
                required: (element) => view.validateDateIsRequired(element),
                date_pattern: true,
              },
              'document_id_expiration_date': {
                required: (element) => view.validateDateIsRequired(element),
                date_pattern: true,
              },
              'driving_license_type_id': {
                required: () => $('[name="driving_license_type_id"]').is(':visible') && $('[name="driving_license_type_id"]').prop('required'),
              },
              'driving_license_number': {
                required: () => $('[name="driving_license_number"]').is(':visible') && $('[name="driving_license_number"]').prop('required'),
              },
              'driving_license_country': {
                required: () => $('[name="driving_license_country"]').is(':visible') && $('[name="driving_license_country"]').prop('required'),
              },
              'driving_license_date': {
                required: (element) => view.validateDateIsRequired(element),
                date_pattern: true,
              },
              'driving_license_expiration_date': {
                required: (element) => view.validateDateIsRequired(element),
                date_pattern: true,
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
                required: () => $('[name="address\\[city_code\\]"]').is(':visible') && model.required_fields.includes('address[city]'),
              },
              'address[state]': {
                required: () => $('[name="address\\[state\\]"]').is(':visible') && model.required_fields.includes('address[state]'),
              },
              'address[state_code]': {
                required: () => $('[name="address\\[state_code\\]"]').is(':visible') && model.required_fields.includes('address[state]'),
              },
              'address[country]': {
                required: () => $('[name="address\\[country\\]"]').is(':visible') && $('[name="address\\[country\\]"]').prop('required'),
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
              'date_of_birth': {
                required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                date_pattern: i18next.t('complete.reservationForm.validations.datePatternInvalid'),
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
              'document_id_date': {
                required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                date_pattern: i18next.t('complete.reservationForm.validations.datePatternInvalid'),
              },
              'document_id_expiration_date': {
                rrequired: i18next.t('complete.reservationForm.validations.fieldRequired'),
                date_pattern: i18next.t('complete.reservationForm.validations.datePatternInvalid'),
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
              'driving_license_date': {
                required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                date_pattern: i18next.t('complete.reservationForm.validations.datePatternInvalid'),
              },
              'driving_license_expiration_date': {
                required: i18next.t('complete.reservationForm.validations.fieldRequired'),
                date_pattern: i18next.t('complete.reservationForm.validations.datePatternInvalid'),
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
              if (element.attr('name') === 'document_id_type_id')  {
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
     * Validate that a date is required
     * @param {*} element
     * @returns
     */
    validateDateIsRequired: function (element) {
      // Get the field name
      const fieldName = $(element).attr('name');

      // Check if the date is required, if not return true because do not need validate the value
      if (!$(element).prop('required')) {
        return false;
      }

      // Get the others fields
      const dayField = $('[name="' + fieldName + '_day"]');
      const monthField = $('[name="' + fieldName + '_month"]');
      const yearField = $('[name="' + fieldName + '_year"]');

      // Check if any field is visible
      const anyFieldsIsVisible = dayField.is(':visible') || monthField.is(':visible') || yearField.is(':visible');
      // If no field is visible, return true because do not need validate the value
      if (!anyFieldsIsVisible) {
        return false;
      }

      return true;
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
