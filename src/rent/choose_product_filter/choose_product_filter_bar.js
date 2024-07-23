/* eslint-disable camelcase */
define('filterComponent', [
  'jquery',
  'ysdtemplate',
  'i18next',
  './choose_product_filter_section',
], function(
  $,
  tmpl,
  i18next,
  FilterSection,
) {
  const model = {
    // Model ------------------------------------------------------------------
    // Filters model
    filters: {
      families: null,
      otherFilters: null,
    },

     // Function that get settings from choose_product.js
     getFilterSettings: null,

     // Container to render the template
     target: null,

    // DOM ids ------------------------------------------------------------------
    // UI Zones
    filterBarContainer: '#mybooking_choose_product_filter_bar', // All filter container (component)
    templateFilterBarContent: 'script_choose_product_filter_bar_content', // Microtemplate
    formFilterBarContainer: 'form[name=mybooking_choose_product_filter_bar_form]', // Form container
    eraserFilterBarBtn: '#mybooking_choose_product_filter_bar__eraser', // Eraser button
    
    // SectionUI Zones for filter bar
    sectionContainer: '.mybooking-chose-product-filter-item_section_toogle', // Section container
    sectionToggleBtn: '.mybooking-chose-product-filter-item_section-btn', // Section toggle button

    // Events ------------------------------------------------------------------
    filterEvents: null, // Events from choose_product.js
	};

  const controller = {
    /**
     * From buttons button click (close all sections)
     */
    btnClick: function() {
      if ($(this).find('.dashicons-arrow-up').length > 0) {
        // Trigger click to close the section
        $(`${model.sectionToggleBtn}.active`).trigger('click');
      }
    },

    /**
     * Eraser button click
     */
    eraserFilterBarBtnClick: function(event) {
      // Prevent form submission
      event.preventDefault();

      // Reset the form (input checkbox, radio and select fields)
      const form = $(this).closest('form');
      form.find('input[type="checkbox"], input[type="radio"]').prop('checked', false);
      form.find('select').prop('selectedIndex', 0);

      // Fire event
      model.filterEvents.fireEvent({type: 'choose_product_filter_bar_update', target: model.formFilterBarContainer});
    },
	};

  const view = {
    /**
     * Initialize
     */ 
		init: function({filters, getFilterSettings, events, target}) {
      // Set the configuration
			model.filters = filters;
      model.getFilterSettings = getFilterSettings;
      model.filterEvents = events;
      model.target = target;

      // Load data and refresh
      this.refresh();
		},

		/**
    * Refresh
    */ 
		refresh:  function() {
      // Render the template when data is refreshed
      const filter = tmpl(model.templateFilterBarContent)({
        model: model.getFilterSettings(),
        filters: model.filters,
        i18next: i18next
      });

      // Render the template
      $(model.target).html(filter);

      // Initialize the sections panels in filter base
      const filterSection = new FilterSection(model.formFilterBarContainer);
      filterSection.view.init(model.filterEvents);

      // Setup Events
      this.setupEvents();

      // Setup Validate
      this.setupValidate();
		},

    /**
     * Setup UI Events
     */ 
		setupEvents: function() {
      // eslint-disable-next-line max-len
      // If sections exists when button click event is called close all sections
      const form = $(model.filterBarContainer).find(model.formFilterBarContainer);
      const sections = $(model.sectionContainer);
      if (sections.length > 0) {
        // Remove old button event
        form.find('button').off('click');
        form.find('button').on('click', controller.btnClick.bind(sections));
      }

       // Eraser button event
       $(model.filterBarContainer).find(model.eraserFilterBarBtn).on('click', controller.eraserFilterBarBtnClick);
		},

    /**
     * Setup Validate
     */ 
    setupValidate: function() {
      const form = $(model.filterBarContainer).find(model.formFilterBarContainer);

      form.validate({
        submitHandler: function(form, event) {
          // Event prevent default from form
          event.preventDefault();

          // Get data and fire event in choose_product.js
          // eslint-disable-next-line max-len
          model.filterEvents.fireEvent({type: 'choose_product_filter_bar_update_send', target: model.formFilterBarContainer});

          return false;
        },
        errorClass: 'text-danger',
        rules: {
        },
        messages: {
        },
        errorPlacement: function(error, element) {
          error.insertAfter(element);
        },
      });
    },
	};

  const filterComponent = {
    model,
    controller,
    view,
  };

  return filterComponent;
});
