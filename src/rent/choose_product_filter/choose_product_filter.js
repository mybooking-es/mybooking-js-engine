define('filterComponent', [
  'jquery',
  'commonServices',
  'commonSettings',
  'commonTranslations',
  'commonLoader',
  'ysdtemplate',
  'i18next',
  './choose_product_filter_section',
  'YSDEventTarget',
  'commonUI',
], function(
  $,
  commonServices,
  commonSettings,
  commonTranslations,
  commonLoader,
  tmpl,
  i18next,
  filterSection,
  YSDEventTarget,
  commonUI,
) {
  const model = {
    requestLanguage: null,
    settings: null,
    filters: {
      families: null,
      otherFilters: null,
    },
    events: null,

    // UI Zones
    filterContainer: '#mybooking-chose-product-filter',
    templateContainer: 'script_choose_product_filter',
    targetContainer: '#mybooking_choose_product_filter',
    formContainer: 'form[name=mybooking_choose_product_filter_form]',
    eraserBtn: '#mybooking-chose-product-filter-item_eraser',
    advancedBtn: '#mybooking-choose-product-filter-btn_advanced',
    advancedModalContainer: '#choose_product_filter_modal',
    advancedModalContent: 'script_choose_product_filter_modal_content',
    advancedModalContentContainer: '#choose_product_filter_modal_content',
    // SectionUI Zones
    sectionContainer: '.mybooking-chose-product-filter-item_section',
    sectionToggleBtn: '.mybooking-chose-product-filter-item_section-btn',
    /**
    * Format Families
    **/
    processFamiliesData: function(data) {
      const result = [];
      const parents = {};

      data.forEach(item => {
        if (item.parent_id === null) {
          // If the item has no parent_id, it's a root item
          parents[item.id] = {...item, children: []}; // Add it to the parents map and initialize children array
          result.push(parents[item.id]);
        } else {
          // If the item has a parent_id, it's a child
          if (!parents[item.parent_id]) {
            // If the parent isn't in the map yet, initialize it (this shouldn't happen if the data is well-formed)
            parents[item.parent_id] = {id: item.parent_id, children: []};
            result.push(parents[item.parent_id]);
          }

          // Add the current item to its parent's children array
          parents[item.parent_id].children.push(item);
        }
      });

      return result;
    },

    /**
    * Get Families
    **/
    getFamilies: function() {
      const that = this;
      return new Promise((resolve, reject) => {
        let url = commonServices.URL_PREFIX + '/api/booking/frontend/families';
        const urlParams = [];
        if (this.requestLanguage != null) {
          urlParams.push('lang='+this.requestLanguage);
        }
        if (commonServices.apiKey && commonServices.apiKey != '') {
          urlParams.push('api_key='+commonServices.apiKey);
        }
        if (urlParams.length > 0) {
          url += '?';
          url += urlParams.join('&');
        }


        $.ajax({
          type: 'GET',
          url,
          dataType: 'json',
          success: function(data) {
            const processData = that.processFamiliesData(data);
            // Resolve promise
            resolve(processData);
          },
          error: function() {
            console.log('Error');
            reject();
          },
        });
      });
    },

    /**
    * Format Families
    **/
    processKeyCharacteristicsData: function(data) {
      const result = Object.values(data);

      result.forEach(item => {
        item.values = Object.values(item.values);
      });
      return result;
    },

    /**
    * Get Key Characteristics
    **/
    getKeyCharacteristics: function() {
      const that = this;
      return new Promise((resolve, reject) => {
        let url = commonServices.URL_PREFIX + '/api/booking/frontend/products-key-characteristics';
        const urlParams = [];
        if (this.requestLanguage != null) {
          urlParams.push('lang='+this.requestLanguage);
        }
        if (commonServices.apiKey && commonServices.apiKey != '') {
          urlParams.push('api_key='+commonServices.apiKey);
        }
        if (urlParams.length > 0) {
          url += '?';
          url += urlParams.join('&');
        }

        $.ajax({
          type: 'GET',
          url,
          dataType: 'json',
          success: function(data) {
            const {key_characteristics} = data;
            // Resolve promise
            resolve({
              key_characteristics: that.processKeyCharacteristicsData(key_characteristics),
            });
          },
          error: function() {
            console.log('Error');
            reject();
          },
        });
      });
    },
	};

  const controller = {
    /**
     * Eraser button click
     */
    eraserBtnClick: function(event) {
      // Prevent form submission
      event.preventDefault();

      // Reset the form (input checkbox, radio and select fields)
      const form = $(this).closest('form');
      form.find('input[type="checkbox"], input[type="radio"]').prop('checked', false);
      form.find('select').prop('selectedIndex', 0);
      // form.submit();
    },

    /**
     * Advanced button click
     */
    advancedBtnClick: function(event) {
      // Prevent form submission
      event.preventDefault();

      // Load the advanced modal content
      const advancedModalContent = tmpl(model.advancedModalContent)({
        filters: model.filters,
        i18next: i18next
      });

      $(model.advancedModalContentContainer).html(advancedModalContent);

      // Show the advanced modal
      commonUI.showModal(model.advancedModalContainer);
    },
	};

  const view = {
    /**
     * Initialize
     */ 
		init: function({settings, events}) {
      // Initialize i18next for translations
      model.requestLanguage = commonSettings.language(document.documentElement.lang);
      i18next.init({  
        lng: model.requestLanguage,
        resources: commonTranslations
      }, 
      function() {
      });

      // Set the configuration
      model.settings = settings;
      model.events = events;

      // Load data and refresh
      this.loadDataAndRefresh();
		},

    /**
    * Load data and refresh
    **/
    loadDataAndRefresh: async function() {
      commonLoader.show();
      
      try {
        const [families, otherFilters] = await Promise.all([model.getFamilies(), model.getKeyCharacteristics()]);

        // Actualize model
        model.filters = {
          ...model.filters,
          families,
          otherFilters,
        };

        // Refresh the view
        this.refresh();
      } catch (error) {
        console.error('Loading error:', error); // TODO
      }
      
      commonLoader.hide();
    },

		/**
    * Refresh
    */ 
		refresh:  function() {
      // Render the template when data is refreshed
      var filter = tmpl(model.templateContainer)({
        filters: model.filters,
        i18next: i18next
      });

      $(model.targetContainer).html(filter);

      // Initialize the sections panels
      filterSection.view.init();

      // Setup Events
      this.setupEvents();

      // Setup Validate
      this.setupValidate();
		},

    /**
     * Setup UI Controls
     */ 
		setupControls: function() {
		},

    /**
     * Setup UI Events
     */ 
		setupEvents: function() {
       // Remove old button event
       $(model.filterContainer).find(model.eraserBtn).off('click');

       // Eraser button event
       $(model.filterContainer).find(model.eraserBtn).on('click', controller.eraserBtnClick);

       // Remove old button event
       $(model.filterContainer).find(model.advancedBtn).off('click');

       // Advanced button event
       $(model.filterContainer).find(model.advancedBtn).on('click', controller.advancedBtnClick);
		},

    setupValidate: function() {
      const form = $(model.filterContainer).find(model.formContainer);

      // Remove old button event
      form.find('button').off('click');

      // eslint-disable-next-line max-len
      // If sections exists when button click event is called close all sections before submit or reset or open float window
      const sections = $(model.sectionContainer);
      if (sections.length > 0) {
        form.find('button').on('click', function(event) {
          sections.each(function() {
            // If arrow is up the section is open
            if ($(this).find('.fa-angle-up').length > 0) {
              // Trigger click to close the section
              $(this).find(model.sectionToggleBtn).trigger('click');
            }
          });
        });
      }

      form.validate({
        submitHandler: function(form, event) {
          event.preventDefault();

          // Get values incluide unchecked checkboxes
          const formValues = [];
          for (var i = 0; i < form.elements.length; i++) {
            let element = form.elements[i];
            
            if (element.name) {
              let object = {
                key: element.name,
                value: null,
              };

              switch (element.type) {
                case 'checkbox':
                  if (element.checked) {
                    const fieldGroup = formValues.find(item => item.key === element.name);
                    if (fieldGroup) {
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
                  object.value = element.value;
                  break;
              }
  
              if (object.value !== null || !formValues.find(item => item.key === element.name)) {
                formValues.push(object);
              }
            }
          }

          model.events.fireEvent({type: 'choose_product_filter', formValues});

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
