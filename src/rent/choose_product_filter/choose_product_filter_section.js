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
    // UI Zones
    sectionContainer: '.mybooking-chose-product-filter-item_section',
    sectionToggleBtn: '.mybooking-chose-product-filter-item_section-btn',
    sectionPanelContainer: '.mybooking-chose-product-filter-item_panel',
	};

  const controller = {
    /**
     * Toogle section visibility
     */ 
    toogleSectionVisibilityClick: function() {
      const currentTarget = $(this).parent().find(model.sectionPanelContainer);
      const arrows = $(model.sectionToggleBtn).find('i.fa');
      const currentArrow = $(this).find('i.fa');
      // Hide all panels except the current one and change arrow directions
      $(model.sectionContainer).find(model.sectionPanelContainer).not(currentTarget).hide();
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

    /**
     * Select family childrens
     */
    toogleFamilyChildrenClick: function() {
      const familyChecked = $(this).is(':checked');
      
      // If the family checkbox is checked, check all children
      if (familyChecked) {
        $(this).parent().find('input[name="family"]').prop('checked', true);
      } else {
        $(this).parent().find('input[name="family"]').prop('checked', false);
      }
    },
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
      // Reset controls
      this.setupControls();
		},

    /**
     * Setup UI Controls
     */ 
		setupControls: function() {
      // Get the URL query parameters value
      const queryParams = new URLSearchParams(window.location.search);

      /*
      * Initialize range sliders
      */
      const rangeSliders = $(model.sectionContainer).find('.js-rangeslider');
    
      // Check if the slider is already initialized
      if (rangeSliders.data('ionRangeSlider')) {
        // Destroy the current instance
        rangeSliders.ionRangeSlider('destroy');
      }
    
      // Optionally reset UI elements or data here
      // For example, resetting input values to defaults
      rangeSliders.each(function() {
        // Get this url value
        const urlValue = queryParams.get($(this).attr('name'));

        // Is not a range
        let urlMin = urlValue;
        let urlMax = urlValue;
        // Is a range
        if (urlValue && urlValue.includes('-')) {
          // Get the min and max values
          [urlMin, urlMax] = urlValue.split('-');
        } 

        // eslint-disable-next-line max-len
        // Set the min and max values from the URL query parameters or the default values
        const min =  $(this).attr('data-min') || 0;
        const max = $(this).attr('data-max') || 100;

        // Initialize ionRangeSlider with default or specific settings
        $(this).ionRangeSlider({
          min,
          max,
          from: urlMin || min, // Set the starting point
          to: urlMax || max // Set the ending point
        });
      });
    
      // Re-initialize ionRangeSlider
      if ($.fn.ionRangeSlider) {
        rangeSliders.ionRangeSlider();
      }

      /*
      * Initialize other controls with the URL query parameters
      */
       // Get all fields
      const fields = $(model.sectionContainer).find('input');
      fields.each(function(index, field) {
        // Get this url value
        const urlValue = queryParams.get($(field).attr('name'));
        // eslint-disable-next-line max-len
        // If the URL query parameter value is the same as the field value, check the field
        if (typeof urlValue === 'string' && urlValue === $(field).val()) {
          $(field).attr('checked', true);
        } else {
          $(field).attr('checked', false);
        }
      });
    },

    /**
     * Setup UI Events
     */ 
		setupEvents: function() {
      // Remove old events
      $(model.sectionContainer).off('click');

      // Section toggle event
      $(model.sectionContainer).on('click', model.sectionToggleBtn, controller.toogleSectionVisibilityClick);

      // Families toogle event
      // eslint-disable-next-line max-len
      $(model.sectionContainer).on('click', '[data-filter="family_id"] > input[name="family_id"]', controller.toogleFamilyChildrenClick);
		},

    /**
     * Setup validate
     */
    setupValidate: function() {
    },
	};

  const filterSection = {
    model,
    controller,
    view,
  };

  return filterSection;
});
