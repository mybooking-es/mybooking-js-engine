// eslint-disable-next-line no-undef
define('commonAddressControls',
  ['jquery', 'commonServices', 'i18next', 'YSDMemoryDataSource', 'YSDSelectSelector', 'select2'],
  function($, commonServices, i18next, MemoryDataSource, SelectSelector) {

    // ---- Country helpers ----

    function buildCountriesArray() {
      var countries = i18next.t('common.countries', {returnObjects: true});
      if (!countries || typeof countries !== 'object') return [];
      var codes = Object.keys(countries);
      var arr = [];
      for (var i = 0; i < codes.length; i++) {
        arr.push({id: codes[i], text: countries[codes[i]], description: countries[codes[i]]});
      }
      return arr;
    }

    function ensureBlankOption($el) {
      if (!$el || !$el.length) return;
      if ($el.find('option[value=""]').length === 0) {
        $el.prepend(new Option('', '', false, false));
      }
    }

    function initCountrySelector($el, value, opts) {
      if (!$el || !$el.length) return;
      opts = opts || {};
      var name = $el.attr('name');
      var countriesArray = buildCountriesArray();

      if (commonServices.jsUseSelect2) {
        if ($el.data('select2')) {
          if (value !== undefined && value !== null && value !== '') {
            if ($el.val() !== value) {
              $el.val(value).trigger('change');
            }
          }
          return;
        }
        ensureBlankOption($el);
        $el.select2({
          width: '100%',
          theme: 'bootstrap4',
          data: countriesArray,
          placeholder: i18next.t('common.selectOption'),
          allowClear: true
        });
        if (value !== undefined && value !== null && value !== '') {
          $el.val(value).trigger('change');
        }
      } else {
        if (!name) return;
        var elements = document.getElementsByName(name);
        if (elements.length > 0 && elements[0].tagName === 'SELECT') {
          var ds = new MemoryDataSource(countriesArray);
          new SelectSelector(name, ds, value || '', true, i18next.t('common.selectOption'));
        }
      }
    }

    // ---- SES state code ----

    function buildStateUrl(requestLanguage) {
      var url = commonServices.URL_PREFIX + '/api/booking/frontend/states';
      var params = [];
      if (requestLanguage) params.push('lang=' + requestLanguage);
      if (commonServices.apiKey && commonServices.apiKey !== '') params.push('api_key=' + commonServices.apiKey);
      if (params.length > 0) url += '?' + params.join('&');
      return url;
    }

    function initStateCodeControl($el, opts) {
      if (!$el || !$el.length) return;
      opts = opts || {};
      if ($el.data('select2')) return; // idempotent

      var stateUrl = buildStateUrl(opts.requestLanguage);

      $el.select2({
        width: '100%',
        allowClear: true,
        placeholder: i18next.t('common.selectOption'),
        ajax: {
          url: stateUrl,
          processResults: function(data) {
            var out = [];
            for (var i = 0; i < data.length; i++) {
              out.push({text: data[i].literal, id: data[i].code});
            }
            return {results: out};
          }
        }
      });

      var val = (opts.initialValue != null ? opts.initialValue : $el.attr('data-code-value'));
      var txt = (opts.initialText  != null ? opts.initialText  : $el.attr('data-text-value'));
      if (val && txt && val !== '' && txt !== '') {
        $el.append(new Option(txt, val, true, true)).trigger('change');
      }

      if (opts.locked) {
        $el.prop('disabled', true);
      }
    }

    // ---- SES city code ----

    function buildCityBaseUrl(requestLanguage) {
      var url = commonServices.URL_PREFIX + '/api/booking/frontend/cities';
      var params = [];
      if (requestLanguage) params.push('lang=' + requestLanguage);
      if (commonServices.apiKey && commonServices.apiKey !== '') params.push('api_key=' + commonServices.apiKey);
      if (params.length > 0) url += '?' + params.join('&');
      return url;
    }

    function initCityCodeControl($el, $stateEl, opts) {
      if (!$el || !$el.length) return;
      opts = opts || {};
      if ($el.data('select2')) return; // idempotent

      var cityBaseUrl = buildCityBaseUrl(opts.requestLanguage);
      var citySep = (cityBaseUrl.indexOf('?') >= 0) ? '&' : '?';

      $el.select2({
        width: '100%',
        allowClear: true,
        placeholder: i18next.t('common.selectOption'),
        ajax: {
          url: function() {
            var stateCode = $stateEl.val() || '';
            return cityBaseUrl + citySep + 'state_code=' + stateCode;
          },
          processResults: function(data) {
            var out = [];
            for (var i = 0; i < data.length; i++) {
              out.push({text: data[i].name, id: data[i].cmun5d});
            }
            return {results: out};
          }
        }
      });

      var val = (opts.initialValue != null ? opts.initialValue : $el.attr('data-code-value'));
      var txt = (opts.initialText  != null ? opts.initialText  : $el.attr('data-text-value'));
      if (val && txt && val !== '' && txt !== '') {
        $el.append(new Option(txt, val, true, true)).trigger('change');
      }

      if (opts.locked) {
        $el.prop('disabled', true);
      }
    }

    // ---- State → city dependency ----

    function bindStateEvents($stateEl, $cityEl, descriptor) {
      if (!$stateEl || !$stateEl.length) return;
      $stateEl.off('select2:select.addrCtrl select2:clear.addrCtrl');
      $stateEl.on('select2:select.addrCtrl', function(e) {
        var stateCode = e.params.data.id;
        var stateLabel = e.params.data.text || '';
        // Sync label to canonical text input (used in non-ES display / form payload)
        if (descriptor && descriptor.stateTextSelector) {
          $(descriptor.stateTextSelector).val(stateLabel);
        }
        // Clear city
        $cityEl.val(null).trigger('change');
        if (descriptor && descriptor.cityTextSelector) {
          $(descriptor.cityTextSelector).val('');
        }
        if (stateCode && stateCode !== '') {
          if (!descriptor || !descriptor.locked) {
            $cityEl.removeAttr('disabled');
          }
        } else {
          $cityEl.attr('disabled', 'disabled');
        }
      });
      $stateEl.on('select2:clear.addrCtrl', function() {
        if (descriptor && descriptor.stateTextSelector) {
          $(descriptor.stateTextSelector).val('');
        }
        $cityEl.val(null).trigger('change');
        if (descriptor && descriptor.cityTextSelector) {
          $(descriptor.cityTextSelector).val('');
        }
        $cityEl.attr('disabled', 'disabled');
      });
    }

    function bindCityEvents($cityEl, descriptor) {
      if (!$cityEl || !$cityEl.length) return;
      $cityEl.off('select2:select.addrCtrlCity select2:clear.addrCtrlCity');
      $cityEl.on('select2:select.addrCtrlCity', function(e) {
        var cityLabel;
        if (e && e.params && e.params.data && e.params.data.text) {
          cityLabel = e.params.data.text;
        } else {
          cityLabel = $cityEl.find('option:selected').text() || '';
        }
        if (descriptor && descriptor.cityTextSelector) {
          $(descriptor.cityTextSelector).val(cityLabel);
        }
      });
      $cityEl.on('select2:clear.addrCtrlCity', function() {
        if (descriptor && descriptor.cityTextSelector) {
          $(descriptor.cityTextSelector).val('');
        }
      });
    }

    // ---- Required intent transfer (ES ↔ non-ES) ----

    function transferRequired(descriptor, isES) {
      if (!descriptor) return;
      var stateIntent = descriptor._stateRequiredIntent;
      var cityIntent  = descriptor._cityRequiredIntent;
      if (isES) {
        if (stateIntent) {
          if (descriptor.stateCodeSelector) $(descriptor.stateCodeSelector).attr('required', 'required');
        } else {
          if (descriptor.stateCodeSelector) $(descriptor.stateCodeSelector).removeAttr('required');
        }
        if (descriptor.stateTextSelector) $(descriptor.stateTextSelector).removeAttr('required');
        if (cityIntent) {
          if (descriptor.cityCodeSelector) $(descriptor.cityCodeSelector).attr('required', 'required');
        } else {
          if (descriptor.cityCodeSelector) $(descriptor.cityCodeSelector).removeAttr('required');
        }
        if (descriptor.cityTextSelector) $(descriptor.cityTextSelector).removeAttr('required');
      } else {
        if (stateIntent) {
          if (descriptor.stateTextSelector) $(descriptor.stateTextSelector).attr('required', 'required');
        } else {
          if (descriptor.stateTextSelector) $(descriptor.stateTextSelector).removeAttr('required');
        }
        if (descriptor.stateCodeSelector) $(descriptor.stateCodeSelector).removeAttr('required');
        if (cityIntent) {
          if (descriptor.cityTextSelector) $(descriptor.cityTextSelector).attr('required', 'required');
        } else {
          if (descriptor.cityTextSelector) $(descriptor.cityTextSelector).removeAttr('required');
        }
        if (descriptor.cityCodeSelector) $(descriptor.cityCodeSelector).removeAttr('required');
      }
    }

    // ---- ES/non-ES show/hide ----

    function applyCountryState(country, descriptor) {
      var isES = (country !== '' && country !== null && country !== undefined &&
                  country === (descriptor.codedCountry || 'ES'));
      var locked = !!descriptor.locked;

      // Distinct selectors: stateCodeSelector = actual <select>; stateCodeUiSelector = wrapper
      var $stateCode = descriptor.stateCodeSelector ? $(descriptor.stateCodeSelector) : null;
      var $stateUi   = descriptor.stateCodeUiSelector ? $(descriptor.stateCodeUiSelector) : null;

      if ($stateCode && $stateCode.length) {
        // New-style: separate code select and optional wrapper
        if (isES) {
          if ($stateUi && $stateUi.length) {
            $stateUi.show();
          } else {
            $stateCode.show();
            $stateCode.next('span.select2-container').show();
          }
          if (locked) {
            $stateCode.prop('disabled', true);
          } else {
            $stateCode.prop('disabled', false);
          }
        } else {
          $stateCode.val(null).trigger('change');
          if ($stateUi && $stateUi.length) {
            $stateUi.hide();
          } else {
            $stateCode.hide();
            $stateCode.next('span.select2-container').hide();
          }
        }
      } else if ($stateUi && $stateUi.length) {
        // Legacy / wrapper-only path (stateCodeUiSelector is the element to show/hide)
        var $stateS2 = $stateUi.next('span.select2-container');
        if (isES) {
          $stateUi.show();
          if ($stateS2.length) $stateS2.show();
        } else {
          $stateUi.hide();
          if ($stateS2.length) $stateS2.hide();
        }
      }

      if (descriptor.stateTextSelector) {
        if (isES) {
          $(descriptor.stateTextSelector).hide();
        } else {
          $(descriptor.stateTextSelector).show();
        }
      }

      var $cityCode = descriptor.cityCodeSelector ? $(descriptor.cityCodeSelector) : null;
      var $cityUi   = descriptor.cityCodeUiSelector ? $(descriptor.cityCodeUiSelector) : null;

      if ($cityCode && $cityCode.length) {
        if (isES) {
          if ($cityUi && $cityUi.length) {
            $cityUi.show();
          } else {
            $cityCode.show();
            $cityCode.next('span.select2-container').show();
          }
          var currentStateCode = ($stateCode && $stateCode.length) ? ($stateCode.val() || '') : '';
          if (currentStateCode === '') {
            $cityCode.prop('disabled', true);
            if (descriptor.stateTextSelector) $(descriptor.stateTextSelector).val('');
            $cityCode.val(null).trigger('change');
            if (descriptor.cityTextSelector) $(descriptor.cityTextSelector).val('');
          } else {
            if (locked) {
              $cityCode.prop('disabled', true);
            } else {
              $cityCode.prop('disabled', false);
            }
          }
        } else {
          $cityCode.val(null).trigger('change');
          if ($cityUi && $cityUi.length) {
            $cityUi.hide();
          } else {
            $cityCode.hide();
            $cityCode.next('span.select2-container').hide();
          }
          $cityCode.prop('disabled', true);
        }
      } else if ($cityUi && $cityUi.length) {
        var $cityS2 = $cityUi.next('span.select2-container');
        if (isES) {
          $cityUi.show();
          if ($cityS2.length) $cityS2.show();
        } else {
          $cityUi.hide();
          if ($cityS2.length) $cityS2.hide();
        }
      }

      if (descriptor.cityTextSelector) {
        if (isES) {
          $(descriptor.cityTextSelector).hide();
        } else {
          $(descriptor.cityTextSelector).show();
        }
      }

      transferRequired(descriptor, isES);
    }

    // ---- Address descriptor state machine ----

    function initAddressDescriptor(descriptor) {
      if (!descriptor || !descriptor.enabled) return;

      var rl     = descriptor.requestLanguage || null;
      var locked = !!descriptor.locked;
      var desc   = descriptor;

      // Use stateCodeSelector (actual <select>) for Select2 init — not the UI wrapper
      var $stateCodeEl = descriptor.stateCodeSelector ? $(descriptor.stateCodeSelector) : null;
      var $cityCodeEl  = descriptor.cityCodeSelector  ? $(descriptor.cityCodeSelector)  : null;

      // Gate C: freeze required intent before any DOM mutation
      if (Object.prototype.hasOwnProperty.call(descriptor, 'stateRequired')) {
        descriptor._stateRequiredIntent = !!descriptor.stateRequired;
      } else {
        descriptor._stateRequiredIntent = !!(
          (descriptor.stateTextSelector && $(descriptor.stateTextSelector).attr('required')) ||
          ($stateCodeEl && $stateCodeEl.length && $stateCodeEl.attr('required'))
        );
      }
      if (Object.prototype.hasOwnProperty.call(descriptor, 'cityRequired')) {
        descriptor._cityRequiredIntent = !!descriptor.cityRequired;
      } else {
        descriptor._cityRequiredIntent = !!(
          (descriptor.cityTextSelector && $(descriptor.cityTextSelector).attr('required')) ||
          ($cityCodeEl && $cityCodeEl.length && $cityCodeEl.attr('required'))
        );
      }

      if ($stateCodeEl && $stateCodeEl.length) {
        initStateCodeControl($stateCodeEl, {
          requestLanguage: rl,
          locked: locked,
          initialValue: descriptor.stateCodeValue,
          initialText:  descriptor.stateTextValue
        });
      }

      if ($cityCodeEl && $cityCodeEl.length && $stateCodeEl) {
        initCityCodeControl($cityCodeEl, $stateCodeEl, {
          requestLanguage: rl,
          locked: locked,
          initialValue: descriptor.cityCodeValue,
          initialText:  descriptor.cityTextValue
        });
        bindStateEvents($stateCodeEl, $cityCodeEl, desc);
        bindCityEvents($cityCodeEl, desc);
      }

      // Restore canonical text values (shown in non-ES mode)
      if (Object.prototype.hasOwnProperty.call(descriptor, 'stateTextValue') && descriptor.stateTextSelector) {
        $(descriptor.stateTextSelector).val(descriptor.stateTextValue);
      }
      if (Object.prototype.hasOwnProperty.call(descriptor, 'cityTextValue') && descriptor.cityTextSelector) {
        $(descriptor.cityTextSelector).val(descriptor.cityTextValue);
      }

      if (descriptor.countrySelector) {
        var $countryEl = $(descriptor.countrySelector);
        // Use change (covers select2:select, select2:unselect, native) — namespaced for clean rebind
        $countryEl.off('change.addrCtrl');
        $countryEl.on('change.addrCtrl', function() {
          applyCountryState($(this).val() || '', desc);
        });
      }

      // Apply initial country state
      var initialCountry = descriptor.countryValue;
      if (initialCountry === undefined || initialCountry === null) {
        var $initCEl = $(descriptor.countrySelector);
        initialCountry = ($initCEl && $initCEl.length) ? ($initCEl.val() || '') : '';
      }
      applyCountryState(initialCountry || '', desc);
    }

    return {
      buildCountriesArray:  buildCountriesArray,
      initCountrySelector:  initCountrySelector,
      initStateCodeControl: initStateCodeControl,
      initCityCodeControl:  initCityCodeControl,
      bindStateEvents:      bindStateEvents,
      bindCityEvents:       bindCityEvents,
      applyCountryState:    applyCountryState,
      initAddressDescriptor: initAddressDescriptor
    };

  }
);
