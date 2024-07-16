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

    // Events
    parentEvents: null,
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

      model.parentEvents.fireEvent({type: 'choose_product_filter_section_update'});
    },

    /**
     * Toogle item (on/off)
     */ 
    toogleItemClick: function(event) {
      // Get first level input
      const input = $(this).find('> input');
    
      // When click in same item, toggle the check
      input.prop('checked', !input.is(':checked'));

      // If the item is a family, check or uncheck all children
      if (input.attr('name') === 'family_id' &&  $(this).attr('data-tree-parent') === 'true'){
        controller.toogleFamilyChildrenClick.bind(input)();
      }

      model.parentEvents.fireEvent({type: 'choose_product_filter_section_update'});
    },
	};

  const view = {
    /**
     * Initialize
     */ 
		init: function(events) {
      // Initialize i18next for translations
      model.requestLanguage = commonSettings.language(document.documentElement.lang);
      i18next.init({  
        lng: model.requestLanguage,
        resources: commonTranslations
      }, 
      function() {
      });

      // Set events
      model.parentEvents = events;

      // Setup events
      this.setupEvents();
		},

    /**
     * Setup UI Events
     */ 
		setupEvents: function() {
      // Remove old events
      $(model.sectionContainer).off('click');
      $(model.sectionContainer).off('change');
      $(model.sectionContainer).off('mousedown');

      // Section toggle event
      $(model.sectionContainer).on('click', model.sectionToggleBtn, controller.toogleSectionVisibilityClick);

      // Item toogle event: The event mouse down is called before click event and check or radio change events
      $(model.sectionContainer).on('mousedown', '.mybooking-chose-product-filter-item_label', controller.toogleItemClick);

      // Checkbox and radio event click is prevented default because the action is in label event and it's not necessary to check the input
      $(model.sectionContainer).on('click', 'input[type="checkbox"], input[type="radio"]', (event) => { 
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
