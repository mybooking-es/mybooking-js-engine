// eslint-disable-next-line no-undef
define('commonContactControls',
  ['jquery', 'commonServices', 'commonUI'],
  function($, commonServices, commonUI) {

    function resolveCountryCode(configuration) {
      var countryCode = configuration && configuration.countryCode;
      if (typeof countryCode === 'undefined' || countryCode == null) {
        countryCode = commonUI.intlTelInputCountryCode();
      }
      return countryCode;
    }

    var commonContactControls = {

      /**
       * Initialize intlTelInput on the given jQuery selectors.
       * Skips any input that already has an intlTelInput instance.
       * @param {string[]} selectors
       * @param {Object}   configuration  model.configuration (for countryCode priority)
       */
      initPhones: function(selectors, configuration) {
        var countryCode = resolveCountryCode(configuration);
        for (var i = 0; i < selectors.length; i++) {
          var $el = $(selectors[i]);
          if ($el.length && !$el.data('plugin_intlTelInput')) {
            $el.intlTelInput({
              initialCountry: countryCode,
              separateDialCode: true,
              utilsScript: commonServices.phoneUtilsPath,
              preferredCountries: [countryCode]
            });
          }
        }
      },

      /**
       * Append dial-code prefix properties to an already-serialized payload.
       * Only appends when the source input exists and returns valid country data.
       * @param {Object} payload   serialized form object (modified in-place)
       * @param {Array}  mappings  [{inputSelector: string, prefixKey: string}, ...]
       */
      appendPhonePrefixes: function(payload, mappings) {
        for (var i = 0; i < mappings.length; i++) {
          var m = mappings[i];
          var $input = $(m.inputSelector);
          if ($input.length) {
            var countryData = $input.intlTelInput('getSelectedCountryData');
            if (countryData && countryData.dialCode) {
              payload[m.prefixKey] = countryData.dialCode;
            }
          }
        }
      },

      /**
       * Resolve the Activities confirmation-email field name.
       * Canonical `confirm_customer_email` wins if both are present.
       * Returns the field name string, or null if neither exists.
       * @param {jQuery} $form  optional — defaults to form[name=reservation_form]
       */
      resolveConfirmationEmailField: function($form) {
        if (!$form || !$form.length) {
          $form = $('form[name=reservation_form]');
        }
        if ($form.find('[name="confirm_customer_email"]').length) {
          return 'confirm_customer_email';
        }
        if ($form.find('[name="customer_email_confirmation"]').length) {
          return 'customer_email_confirmation';
        }
        return null;
      }

    };

    return commonContactControls;
  }
);
