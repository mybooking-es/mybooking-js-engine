define('filterSection', [
  'jquery',
  'commonServices',
  'commonSettings',
  'commonTranslations',
  'commonLoader',
  'ysdtemplate',
  'i18next',
], function(
  $,
  commonServices,
  commonSettings,
  commonTranslations,
  commonLoader,
  tmpl,
  i18next,
) {
  const model = {
    requestLanguage: null,
    configuration: null,
    section: '.mybooking-chose-product-filter-item_section',
    sectionToggleBtn: '.mybooking-chose-product-filter-item_section-btn',
    sectionPanel: '.mybooking-chose-product-filter-item_panel',
	};

  const controller = {
	};

  const view = {
    /**
     * Initialize
     */ 
		init: function() {
      // Initialize i18next for translations
      model.requestLanguage = commonSettings.language(document.documentElement.lang);
      i18next.init({  
        lng: model.requestLanguage,
        resources: commonTranslations
      }, 
      function() {
      });

      // Setup UI Controls
      this.setupControls();

      // Setup events
      this.setupEvents();
		},

		/**
	 * Refresh
	 */ 
		refresh: function() {
		},

    /**
     * Setup UI Controls
     */ 
		setupControls: function() {
      if ($.fn.ionRangeSlider) {
        $('.js-rangeslider').ionRangeSlider();
      }
		},

    /**
     * Setup UI Events
     */ 
		setupEvents: function() {
      $(model.section).on('click', model.sectionToggleBtn, this.toogleSection);
		},

    /**
     * Setup validate
     */
    setupValidate: function() {
    },

    /**
     * Toogle section visibility
     */ 
    toogleSection: function() {
      const currentTarget = $(this).parent().find(model.sectionPanel);
      const arrows = $(model.sectionToggleBtn).find('i.fa');
      const currentArrow = $(this).find('i.fa');
      // Hide all panels except the current one and change arrow directions
      $(model.section).find(model.sectionPanel).not(currentTarget).hide();
      arrows.removeClass('fa-angle-up').addClass('fa-angle-down');
      // Toggle the visibility of current panel and change arrow direction
      if (currentTarget.is(':visible')) {
        currentTarget.hide();
        currentArrow.removeClass('fa-angle-up').addClass('fa-angle-down');
      } else {
        currentTarget.show();
        currentArrow.removeClass('fa-angle-down').addClass('fa-angle-up');
      }
    },
	};

  const filterSection = {
    model,
    controller,
    view,
  };

  return filterSection;
});
