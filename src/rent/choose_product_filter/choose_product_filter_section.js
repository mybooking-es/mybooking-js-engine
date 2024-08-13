/* eslint-disable max-len */
define('filterSection', [
  'jquery',
  'commonSettings',
  'commonTranslations',
  'i18next',
], function(
  $,
  commonSettings,
  commonTranslations,
  i18next,
) {
  class FilterSection {
    constructor(target) {
      this.target = target;
    }

    model = {
      // DOM ids ------------------------------------------------------------------
      // UI Zones
      sectionContainer: '.mybooking-chose-product-filter-item_section', // Section container
      sectionToggleBtn: '.mybooking-chose-product-filter-item_section-btn', // Section toggle button
      sectionPanelContainer: '.mybooking-chose-product-filter-item_panel', // Section panel container
  
      // Events ------------------------------------------------------------------
      parentEvents: null,
    };

    controller = {
      /**
       * Toogle section visibility
       */ 
      toogleSectionVisibilityClick: (event) => {
        const target = $(event.currentTarget);
        const currentTarget = target.parent().find(this.model.sectionPanelContainer);
        const arrows = $(`${this.target} ${this.model.sectionToggleBtn}`).find('i.dashicons');
        const currentArrow = target.find('i.dashicons');
        // Hide all panels except the current one and change arrow directions
        $(`${this.target} ${this.model.sectionContainer}`).find(this.model.sectionPanelContainer).not(currentTarget).hide();
        arrows.removeClass('dashicons-arrow-up').addClass('dashicons-arrow-down');
        // Toggle the visibility of current panel and change arrow direction
        if (currentTarget.is(':visible')) {
          target.removeClass('active');
          currentTarget.hide();
          currentArrow.removeClass('dashicons-arrow-up').addClass('dashicons-arrow-down');
        } else {
          target.addClass('active');
          currentTarget.show();
          currentArrow.removeClass('dashicons-arrow-down').addClass('dashicons-arrow-up');
        }
      },
  
      /**
       * Select family childrens
       */
      toogleFamilyChildrenClick: (target) => {
        const familyChecked = target.is(':checked');
          
        // If the family checkbox is checked, check all children
        const children = target.closest('li').find('input[name="family_id"]');
        if (familyChecked) {
          children.prop('checked', true);
        } else {
          children.prop('checked', false);
        }

        // Fire event
        this.model.parentEvents.fireEvent({type: 'choose_product_filter_section_update', target: this.target});
      },
  
      /**
       * Toogle item (on/off)
       */ 
      toogleItemClick: (event) => {
        const target = $(event.currentTarget);

        // Get first level input
        const input = target.find('> input');
      
        // When click in same item, toggle the check
        input.prop('checked', !input.is(':checked'));
  
        // If the item is a family, check or uncheck all children
        if (input.attr('name') === 'family_id' &&  target.attr('data-tree-parent') === 'true'){
          this.controller.toogleFamilyChildrenClick(input);
        } else {
          if (input.attr('name') === 'family_id' && input.prop('checked') === false) {
            // Uncheck parent
            const parent = target.closest('li[data-label]').find('input[name="family_id"]').first();
            parent.prop('checked', false);
          }

          // Fire event
          this.model.parentEvents.fireEvent({type: 'choose_product_filter_section_update', target: this.target});
        }
      },
  
      /**
       * Input click
       */ 
      inputClick: (event) => {
        // Prevent default action from input click
        event.preventDefault();
      }
    };

    view = {
      /**
       * Initialize
       */ 
      init: (events) =>{
        // Set events
        this.model.parentEvents = events;
  
        // Setup events
        this.view.setupEvents();
      },
  
      /**
       * Setup UI Events
       */ 
      setupEvents: () =>{
        // Remove old events
        $(`${this.target} ${this.model.sectionContainer}`).off('click');
        $(`${this.target} ${this.model.sectionContainer}`).off('change');
        $(`${this.target} ${this.model.sectionContainer}`).off('mousedown');
  
        // Section toggle event
        $(`${this.target} ${this.model.sectionContainer}`).on('click', this.model.sectionToggleBtn, this.controller.toogleSectionVisibilityClick);
  
        // Item toogle event: The event mouse down is called before click event and check or radio change events
        $(`${this.target} ${this.model.sectionContainer}`).on('mousedown', '.mybooking-chose-product-filter-item_label', this.controller.toogleItemClick);
  
        // Checkbox and radio event click is prevented default because the action is in label event and it's not necessary to check the input
        $(`${this.target} ${this.model.sectionContainer}`).on('click', 'input[type="checkbox"], input[type="radio"]', this.controller.inputClick);
      },
    };
  }

  // Return class to be instantiated
  return FilterSection;
});
