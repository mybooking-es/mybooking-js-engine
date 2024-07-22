/* eslint-disable max-len */
define('filterModal', [
  'jquery',
  'commonServices',
  'commonSettings',
  'commonTranslations',
  'commonLoader',
  'commonUI',
  'ysdtemplate',
  'i18next',
], function(
  $,
  commonServices,
  commonSettings,
  commonTranslations,
  commonLoader,
  commonUI,
  tmpl,
  i18next,
) {
  const model = {
    // DOM ids ------------------------------------------------------------------
    // UI Zones
    filterModalContainer: '#mybooking_choose_product_filter_modal', // Modal container
    formFilterModalContainer: 'form[name=mybooking_choose_product_filter_modal_form]', // Form container
    submitFilterModalBtn: '#mybooking_choose_product_filter_modal__send', // Submit button
    eraserFilterModalBtn: '#mybooking_choose_product_filter_modal__eraser', // Eraser button

    // Events ------------------------------------------------------------------
    parentEvents: null,
	};

  const controller = {
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
      const data = view.getFormData();
      model.parentEvents.fireEvent({type: 'choose_product_filter_update', data});
    },
	};

  const view = {
    /**
     * Initialize
     */ 
		init: function(events) {
      // Set events
      model.parentEvents = events;

      // Setup events
      this.setupEvents();

      // Setup validate
      this.setupValidate();
		},

    /**
     * Setup UI Events
     */ 
		setupEvents: function() {
      // Eraser button event
      $(model.filterModalContainer).find(model.eraserFilterModalBtn).on('click', controller.eraserFilterModalBtnClick);
		},

		/**
     * Get form data
     */ 
    getFormData: function() {
      const form = $(model.filterModalContainer).find(model.formFilterModalContainer);

      // Get values incluide unchecked checkboxes
      const formValues = [];

      // Get all fields from the one , not zero because is the send field that is not a filter
      for (var i = 1; i < form[0].elements.length; i++) {
        let element = form[0].elements[i];
        
        if (element.name) {
          let object = {
            key: element.name,
            value: 'undefined',
          };

          switch (element.type) {
            case 'checkbox':
              if (element.checked) {
                const fieldGroup = formValues.find(item => item.key === element.name);

                // If the field is already in the array, append the value in existed field
                if (fieldGroup && fieldGroup.value !== 'undefined') {
                  fieldGroup.value += ',' + element.value;
                } else {
                  object.value = element.value;
                }
              }
              break;
            case 'radio':
              if (element.checked) {
                object.value = element.value;
              }
              break;
          
            default:
              if (element.value !== '') {
                object.value = element.value;
              }
              break;
          }

          const elementExists =formValues.find(item => item.key === element.name);
          
          if (!elementExists) {
            formValues.push(object);
          } else {
            if (object.value !== 'undefined') {
              elementExists.value = object.value;
            }
          }
        }
      }

      return formValues;
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
          const data = view.getFormData(form);
          model.parentEvents.fireEvent({type: 'choose_product_filter_update_send', data, target: 'modal'});

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
