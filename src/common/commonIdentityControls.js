// eslint-disable-next-line no-undef
define('commonIdentityControls',
  ['jquery', 'commonServices', 'i18next', 'YSDMemoryDataSource', 'YSDSelectSelector', 'select2'],
  function($, commonServices, i18next, MemoryDataSource, SelectSelector) {

    var NATIONALITY_NAMES = [
      'customer_nacionality',
      'driver_nacionality',
      'additional_driver_1_nacionality',
      'additional_driver_2_nacionality'
    ];

    var DOCUMENT_TYPE_NAMES = [
      'customer_document_id_type_id',
      'driver_document_id_type_id',
      'additional_driver_1_document_id_type_id',
      'additional_driver_2_document_id_type_id'
    ];

    var LICENSE_TYPE_NAMES = [
      'driver_driving_license_type_id',
      'additional_driver_1_driving_license_type_id',
      'additional_driver_2_driving_license_type_id'
    ];

    function buildUrl(path, requestLanguage) {
      var url = commonServices.URL_PREFIX + path;
      var params = [];
      if (requestLanguage) {
        params.push('lang=' + requestLanguage);
      }
      if (commonServices.apiKey && commonServices.apiKey !== '') {
        params.push('api_key=' + commonServices.apiKey);
      }
      if (params.length > 0) {
        url += '?' + params.join('&');
      }
      return url;
    }

    // Returns true if the select element needs to be populated (has no non-blank options).
    function needsPopulation($el) {
      if (!$el.length) return false;
      var hasOptions = false;
      $el.find('option').each(function() {
        if ($(this).val() !== '') {
          hasOptions = true;
        }
      });
      return !hasOptions;
    }

    function populateOne(name, items, placeholderText) {
      var $el = $('select[name="' + name + '"]');
      if (!$el.length) return;
      if (!needsPopulation($el)) return;
      var savedVal = $el.val();
      if (commonServices.jsUseSelect2 && !$el.data('select2')) {
        ensureBlankOption($el);
        $el.select2({
          width: '100%',
          theme: 'bootstrap4',
          placeholder: placeholderText,
          allowClear: true,
          data: items
        });
        if (savedVal) {
          $el.val(savedVal).trigger('change');
        }
      } else if (!commonServices.jsUseSelect2) {
        var el = document.getElementById(name);
        if (el && el.tagName === 'SELECT') {
          var ds = new MemoryDataSource(items);
          new SelectSelector(name, ds, savedVal || null, true, placeholderText);
        }
      }
    }

    // Check if any select in the list needs API population before making the request.
    function anyNeedsPopulation(names) {
      for (var i = 0; i < names.length; i++) {
        var $el = $('select[name="' + names[i] + '"]');
        if ($el.length && needsPopulation($el)) {
          return true;
        }
      }
      return false;
    }

    // Guarantee a blank <option value=""> exists so Select2 placeholder/allowClear works.
    // Does nothing if a blank option is already present.
    function ensureBlankOption($el) {
      var hasBlank = false;
      $el.find('option').each(function() {
        if ($(this).val() === '') {
          hasBlank = true;
        }
      });
      if (!hasBlank) {
        $el.prepend('<option value=""></option>');
      }
    }

    function loadAndPopulate(endpoint, names, mapItem, requestLanguage) {
      if (!anyNeedsPopulation(names)) return;
      var url = buildUrl(endpoint, requestLanguage);
      var placeholder = i18next.t('common.selectOption');
      $.ajax({
        type: 'GET',
        url: url,
        dataType: 'json',
        contentType: 'application/json; charset=utf-8',
        crossDomain: true,
        success: function(data) {
          var items = [];
          for (var idx = 0; idx < data.length; idx++) {
            items.push(mapItem(data[idx]));
          }
          for (var j = 0; j < names.length; j++) {
            populateOne(names[j], items, placeholder);
          }
        },
        error: function() {}
      });
    }

    var commonIdentityControls = {

      nationalityNames: NATIONALITY_NAMES,
      documentTypeNames: DOCUMENT_TYPE_NAMES,
      licenseTypeNames: LICENSE_TYPE_NAMES,

      /**
       * Initialize nationality, document-type, and license-type selects.
       * Only issues API calls for groups that have at least one empty select.
       * options: { requestLanguage: string|null }
       */
      initIdentitySelects: function(options) {
        var lang = (options && options.requestLanguage) || null;

        loadAndPopulate(
          '/api/booking/frontend/nacionalities',
          NATIONALITY_NAMES,
          function(item) {
            return { id: item.code, text: item.name, description: item.name };
          },
          lang
        );

        loadAndPopulate(
          '/api/booking/frontend/document-types',
          DOCUMENT_TYPE_NAMES,
          function(item) {
            return { id: item.id, text: item.label, description: item.label };
          },
          lang
        );

        loadAndPopulate(
          '/api/booking/frontend/license-types',
          LICENSE_TYPE_NAMES,
          function(item) {
            return { id: item.id, text: item.label, description: item.label };
          },
          lang
        );
      },

      /**
       * Initialize customer_classifier_id select from the API.
       * Only called when configuration.useCustomerClassifier is true and the select exists.
       * options: { requestLanguage: string|null }
       * callback: optional function(items) called on success
       */
      initCustomerClassifier: function(options, callback) {
        var lang = (options && options.requestLanguage) || null;
        var $el = $('select[name="customer_classifier_id"]');
        if (!$el.length) return;

        var url = buildUrl('/api/booking/frontend/customer-classifier', lang);
        var placeholder = i18next.t('common.selectOption');
        $.ajax({
          type: 'GET',
          url: url,
          dataType: 'json',
          success: function(data) {
            var items = [];
            for (var idx = 0; idx < data.length; idx++) {
              items.push({
                id: data[idx].id,
                text: data[idx].name,
                description: data[idx].name
              });
            }
            var savedVal = $el.val();
            if (commonServices.jsUseSelect2 && !$el.data('select2')) {
              ensureBlankOption($el);
              $el.select2({
                placeholder: placeholder,
                allowClear: true,
                width: '100%',
                theme: 'bootstrap4',
                data: items
              });
              $el.val(savedVal || '');
              $el.trigger('change');
            } else if (!commonServices.jsUseSelect2) {
              var el = document.getElementById('customer_classifier_id');
              if (el && el.tagName === 'SELECT') {
                var ds = new MemoryDataSource(items);
                new SelectSelector('customer_classifier_id', ds, savedVal || null, true, placeholder);
              }
            }
            if (typeof callback === 'function') {
              callback(items);
            }
          },
          error: function() {
            alert(i18next.t('common.error'));
          }
        });
      },

      /**
       * Initialize customer_type select with static Engine values.
       * Values are exact: 'individual', 'legal_entity'.
       * Labels come from i18next translation keys.
       */
      initCustomerType: function() {
        var $el = $('select[name="customer_type"]');
        if (!$el.length) return;
        if (!needsPopulation($el)) return;

        var items = [
          {
            id: 'individual',
            text: i18next.t('complete.reservationForm.customerType.individual'),
            description: i18next.t('complete.reservationForm.customerType.individual')
          },
          {
            id: 'legal_entity',
            text: i18next.t('complete.reservationForm.customerType.company'),
            description: i18next.t('complete.reservationForm.customerType.company')
          }
        ];

        var placeholder = i18next.t('common.selectOption');
        var savedVal = $el.val();
        if (commonServices.jsUseSelect2 && !$el.data('select2')) {
          ensureBlankOption($el);
          $el.select2({
            width: '100%',
            theme: 'bootstrap4',
            placeholder: placeholder,
            allowClear: true,
            data: items
          });
          if (savedVal) {
            $el.val(savedVal).trigger('change');
          }
        } else if (!commonServices.jsUseSelect2) {
          var el = document.getElementById('customer_type');
          if (el && el.tagName === 'SELECT') {
            var ds = new MemoryDataSource(items);
            new SelectSelector('customer_type', ds, savedVal || null, true, placeholder);
          }
        }
      }
    };

    return commonIdentityControls;
  }
);
