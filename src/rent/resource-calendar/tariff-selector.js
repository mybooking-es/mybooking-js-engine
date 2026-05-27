define('tariff-selector', ['jquery', 'moment', 'commonUI'], function($, moment, commonUI) {

  var _descriptions = [];
  var _prices = {};
  var _activeTariffId = null;
  var _modalSelector = '#mybooking-tariff-details-modal';

  function buildDescriptionHtml(tariff) {
    var lines = tariff.description ? tariff.description.split('\n') : [];
    var descHtml = '';
    for (var i = 0; i < lines.length; i++) {
      if (lines[i].trim()) {
        descHtml += '<p>' + lines[i] + '</p>';
      }
    }
    return descHtml;
  }

  function renderCompactCard(tariff, isActive) {
    return '<div class="mybooking-tariff-card mybooking-tariff-card--compact' +
      (isActive ? ' mybooking-tariff-card--active' : '') +
      '" data-tariff-id="' + tariff.id + '">' +
      '<h4 class="mybooking-tariff-card__name">' + tariff.name + '</h4>' +
      '</div>';
  }

  function renderExtendedCard(tariff, isActive, extraClass) {
    var descHtml = buildDescriptionHtml(tariff);
    return '<div class="mybooking-tariff-card mybooking-tariff-card--extended ' + (extraClass || '') +
      (isActive ? ' mybooking-tariff-card--active' : '') +
      '" data-tariff-id="' + tariff.id + '">' +
      '<h4 class="mybooking-tariff-card__name">' + tariff.name + '</h4>' +
      (descHtml ? '<div class="mybooking-tariff-card__description">' + descHtml + '</div>' : '') +
      '</div>';
  }

  function ensureDetailsModal(available) {
    $(_modalSelector + '_MBM').remove();
    var strings = window.mybookingTariffStrings || {};
    var modalTitle = strings.details_modal_title || 'Rate details';

    var modalHtml = '<div id="mybooking-tariff-details-modal_MBM" style="display:none">' +
      '<div class="mybooking-tariff-details-modal">' +
      '<h3 class="mybooking-tariff-details-modal__title">' + modalTitle + '</h3>' +
      '<div class="mybooking-tariff-details-modal__cards">';

    for (var i = 0; i < available.length; i++) {
      var tariff = available[i];
      var isActive = tariff.id === _activeTariffId;
      modalHtml += renderExtendedCard(tariff, isActive, 'mybooking-tariff-card--modal');
    }

    modalHtml += '</div></div></div>';
    $('body').append(modalHtml);
  }

  // Lee show_rates y show_rates_mode desde data attributes de #product_selector (shortcode).
  // show_rates ausente o != 'true' => no renderizar cards.
  // show_rates_mode ausente => 'compact' (default).
  function readUiConfig() {
    var $selector = $('#product_selector');
    return {
      showRates: $selector.data('show-rates') === true,
      mode: $selector.data('show-rates-mode') || 'compact'
    };
  }

  return {

    setDescriptions: function(categoryRateTypes) {
      if (!readUiConfig().showRates) { return; }
      if (!categoryRateTypes || !categoryRateTypes.length) { return; }
      _descriptions = categoryRateTypes.slice().map(function(t) {
        return { id: t.id, name: t.name, description: t.description || '' };
      });
      if (_activeTariffId === null && _descriptions.length > 0) {
        var defaultId = null;
        for (var j = 0; j < categoryRateTypes.length; j++) {
          if (categoryRateTypes[j].default_web_public === true) {
            defaultId = categoryRateTypes[j].id;
            break;
          }
        }
        _activeTariffId = defaultId !== null ? defaultId : _descriptions[0].id;
      }
    },

    setPrices: function(allPrices) {
      if (!readUiConfig().showRates) { return; }
      _prices = {};
      for (var tariffIdStr in allPrices) {
        _prices[parseInt(tariffIdStr, 10)] = allPrices[tariffIdStr];
      }
    },

    getPriceForDate: function(dateStr, basePrice) {
      if (_activeTariffId === null) { return basePrice; }
      var tariffPrices = _prices[_activeTariffId];
      if (!tariffPrices) { return basePrice; }
      var price = tariffPrices[dateStr];
      return (typeof price !== 'undefined') ? price : basePrice;
    },

    renderCards: function(container) {
      if (!_descriptions.length) { return; }
      var uiConfig = readUiConfig();
      if (!uiConfig.showRates) { return; }
      var uiMode = ['compact', 'extended'].indexOf(uiConfig.mode) !== -1 ? uiConfig.mode : 'compact';
      var self = this;

      // Filtrar solo tarifas con precios en la ocupación actual
      var available = [];
      for (var i = 0; i < _descriptions.length; i++) {
        if (_prices[_descriptions[i].id]) {
          available.push(_descriptions[i]);
        }
      }
      // Si no hay tarifas disponibles, degradar silenciosamente (no mostrar nada)
      if (!available.length) { return; }
      // Si la tarifa activa no tiene precios, seleccionar la primera disponible
      if (!_prices[_activeTariffId] && available.length > 0) {
        _activeTariffId = available[0].id;
      }
      // Limpiar renders previos
      $('.mybooking-tariff-selector').remove();
      $('.mybooking-tariff-details-btn-wrap').remove();
      $(_modalSelector + '_MBM').remove();

      var count = available.length;
      var html = '<div class="mybooking-tariff-selector mybooking-tariff-selector--count-' + count + ' mybooking-tariff-selector--mode-' + uiMode + '">';

      if (uiMode === 'extended') {
        for (var iExtended = 0; iExtended < available.length; iExtended++) {
          html += renderExtendedCard(available[iExtended], available[iExtended].id === _activeTariffId);
        }
      } else {
        for (var iCompact = 0; iCompact < available.length; iCompact++) {
          html += renderCompactCard(available[iCompact], available[iCompact].id === _activeTariffId);
        }
      }

      html += '</div>';
      $(container).after(html);

      if (uiMode === 'compact') {
        ensureDetailsModal(available);
        var strings = window.mybookingTariffStrings || {};
        var detailsBtnLabel = strings.details_button || 'Rate details';
        var detailsBtnHtml = '<div class="mybooking-tariff-details-btn-wrap">' +
          '<button type="button" class="mb-button mybooking-tariff-details-btn">' + detailsBtnLabel + '</button>' +
          '</div>';
        $('.mybooking-tariff-selector').after(detailsBtnHtml);
      }

      $(document).off('click.tariffSelector', '.mybooking-tariff-card');
      $(document).on('click.tariffSelector', '.mybooking-tariff-card', function() {
        var tariffId = parseInt($(this).attr('data-tariff-id'), 10);
        self.selectTariff(tariffId);
        if ($(this).hasClass('mybooking-tariff-card--modal')) {
          commonUI.hideModal(_modalSelector);
        }
      });

      $(document).off('click.tariffSelectorDetails', '.mybooking-tariff-details-btn');
      $(document).on('click.tariffSelectorDetails', '.mybooking-tariff-details-btn', function() {
        commonUI.showModal(_modalSelector);
      });
    },

    selectTariff: function(tariffId) {
      _activeTariffId = tariffId;
      $('.mybooking-tariff-card').removeClass('mybooking-tariff-card--active');
      $('.mybooking-tariff-card[data-tariff-id="' + tariffId + '"]').addClass('mybooking-tariff-card--active');
      var picker = $('#date').data('dateRangePicker');
      if (picker) {
        picker.redraw();
      }
    },

    getActiveTariffId: function() {
      return _activeTariffId;
    }

  };

});
