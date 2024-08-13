/* eslint-disable max-len */
define('filterModal', [
  'jquery',
  'commonUI',
  'ysdtemplate',
  'i18next',
  './choose_product_filter_section',
], function(
  $,
  commonUI,
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

    // DOM ids ------------------------------------------------------------------
    // UI Zones
    filterModalBtn: '#mybooking_choose_product_filter__modal', // Modal button

    filterModalContainer: '#mybooking_choose_product_filter_modal', // Modal container
    templateFilterModalContent: 'script_choose_product_filter_modal_content', // Microtemplate
    formFilterModalContainer: 'form[name=mybooking_choose_product_filter_modal_form]', // Form container
    eraserFilterModalBtn: '#mybooking_choose_product_filter_modal__eraser', // Eraser button

    // Events ------------------------------------------------------------------
    filterEvents: null,
	};

  const controller = {
    /**
     * Modal button click
     */
    filterModalBtnClick: function(event) {
      // Prevent form submission
      event.preventDefault();

      // Show the modal
      commonUI.showModal(model.filterModalContainer, view.refresh, view.update);
    },

    /**
     * Eraser button click
     */
    eraserFilterModalBtnClick: function(event) {
      // Prevent form submission
      event.preventDefault();

      // Reset the form (input checkbox, radio and select fields)
      const form = $(this).closest('form');
      form.find('input[type="checkbox"], input[type="radio"]').prop('checked', false);
      form.find('select').prop('selectedIndex', 0);
      // Fire event
      model.filterEvents.fireEvent({type: 'choose_product_filter_modal_update', target: model.formFilterModalContainer});
    },
	};

  const view = {
    /**
     * Initialize
     */ 
    init: function({filters, getFilterSettings, events}) {
      // Set the configuration
			model.filters = filters;
      model.getFilterSettings = getFilterSettings;
      model.filterEvents = events;

      // Initialize Modal button event
      $(model.filterModalBtn).off('click');
      $(model.filterModalBtn).on('click', controller.filterModalBtnClick);
		},

    /**
    * Refresh
    */ 
		refresh:  function() {
      // Render the template when data is refreshed
      // Load the advanced modal content
      const templateFilterModalContent = tmpl(model.templateFilterModalContent)({
        model: model.getFilterSettings(),
        filters: model.filters,
        i18next: i18next
      });

      // Show the advanced modal
      // Compatibility with bootstrap modal replacement (from 1.0.0)
      if ($(`${model.filterModalContainer}_MBM`).length) {
        $(`${model.filterModalContainer}_MBM .modal-product-detail-content`).html(templateFilterModalContent);     
      } else {
        $(`${model.filterModalContainer} .modal-product-detail-content`).html(templateFilterModalContent);
      }

      // Initialize the sections panels in filter base
      const filterSection = new FilterSection(model.formFilterModalContainer);
      filterSection.view.init(model.filterEvents);

      // Setup Events
      view.setupEvents();

      // Setup Validate
      view.setupValidate();
    },

    /**
    * Clear modal content
    */ 
    update: function() {
      // Fire event
      model.filterEvents.fireEvent({type: 'choose_product_filter_modal_close'});
    },

    /**
     * Setup UI Events
     */ 
		setupEvents: function() {
      // Eraser button event
      $(model.filterModalContainer).find(model.eraserFilterModalBtn).off('click');
      $(model.filterModalContainer).find(model.eraserFilterModalBtn).on('click', controller.eraserFilterModalBtnClick);
		},

    /**
     * Setup validate
     */
    setupValidate: function() {
			const form = $(model.filterModalContainer).find(model.formFilterModalContainer);

      form.validate({
        submitHandler: function(form, event) {
          event.preventDefault();

          // Fire event
          model.filterEvents.fireEvent({type: 'choose_product_filter_modal_update_send', target: model.formFilterModalContainer});

          // Close modal
          commonUI.hideModal(model.filterModalContainer);

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

  const filterModal = {
    model,
    controller,
    view,
  };

  return filterModal;
});
