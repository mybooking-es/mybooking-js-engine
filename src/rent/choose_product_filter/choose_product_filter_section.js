/* eslint-disable max-len */
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
      const arrows = $(model.sectionToggleBtn).find('i.dashicons');
      const currentArrow = $(this).find('i.dashicons');
      // Hide all panels except the current one and change arrow directions
      $(model.sectionContainer).find(model.sectionPanelContainer).not(currentTarget).hide();
      arrows.removeClass('dashicons-arrow-up').addClass('dashicons-arrow-down');
      // Toggle the visibility of current panel and change arrow direction
      if (currentTarget.is(':visible')) {
        currentTarget.hide();
        currentArrow.removeClass('dashicons-arrow-up').addClass('dashicons-arrow-down');
      } else {
        currentTarget.show();
        currentArrow.removeClass('dashicons-arrow-down').addClass('dashicons-arrow-up');
      }
    },

    /**
     * Select family childrens
     */
    toogleFamilyChildrenClick: function() {
      const familyChecked = $(this).is(':checked');
        
      // If the family checkbox is checked, check all children
      const children = $(this).closest('li').find('input[name="family_id"]');
      if (familyChecked) {
        children.prop('checked', true);
      } else {
        children.prop('checked', false);
      }
    },

    /**
     * Toogle item (on/off)
     */ 
    toogleItemClick: function(event) {
      const input = $(this).find('input');
      
      // Family id is a especial filter with two levels and it's not necessary to check the input with this handler. It have its own handler
      if (input.attr('name') === 'family_id') {
        return;
      }

      // When click in same item, toggle the check
      input.prop('checked', !input.is(':checked'));
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
      * Initialize other controls with the URL query parameters
      */
       // Get all fields
      const fields = $(model.sectionContainer).find('input');

      fields.each(function(index, field) {
        // Get this url value
        const urlValue = queryParams.get($(field).attr('name'));

        if (urlValue) {
          const urlArray = urlValue.split(',');
          urlArray.forEach((urlValue) => {
            // If the URL query parameter value is the same as the field value, check the field
            if (typeof urlValue === 'string' && urlValue === $(field).val()) {
              $(field).attr('checked', true);
            } else {
              $(field).attr('checked', false);
            }
          });
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
      $(model.sectionContainer).on('change', '[data-filter="family_id"] > label > input[name="family_id"]', controller.toogleFamilyChildrenClick);

      // Item toogle event: The event mouse down is called before click event and check or radio change events
      $(model.sectionContainer).on('mousedown touchstart', 'li[data-filter] label', controller.toogleItemClick);
      
      // Checkbox and radio event click is prevented default because the action is in label event and it's not necessary to check the input
      $(model.sectionContainer).on('click', 'input[type="checkbox"], input[type="radio"]', (event) => { 
        const target = $(event.currentTarget);
        
        // Family id is a especial filter with two levels and it's not necessary to check the input with this handler. It have its own handler
        if (target.attr('name') === 'family_id') {
          return;
        }
        event.preventDefault();
      });
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
