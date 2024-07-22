/* eslint-disable camelcase */
define('filterComponent', [
  'jquery',
  'commonServices',
  'commonSettings',
  'commonTranslations',
  'commonLoader',
  'ysdtemplate',
  'i18next',
  './choose_product_filter_section',
  './choose_product_filter_modal',
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
  filterModal,
  YSDEventTarget,
  commonUI,
) {
  const model = {
    // Model ------------------------------------------------------------------
    // Request language
    requestLanguage: null,

    // Filters model
    filters: {
      families: null,
      otherFilters: null,
    },

     // Function that get settings from choose_product.js
     getFilterSettings: null,

    // DOM ids ------------------------------------------------------------------
    // UI Zones
    targetContainer: '#mybooking_choose_product_filter', // Initial empty container with conditional shortcode
    
    // Filter bar content
    filterBarContainer: '#mybooking_choose_product_filter_bar', // All filter container (component)
    templateFilterBarContent: 'script_choose_product_filter_bar_content', // Microtemplate
    formFilterBarContainer: 'form[name=mybooking_choose_product_filter_bar_form]', // Form container
    submitFilterBarBtn: '#mybooking_choose_product_filter_bar__send', // Submit button
    eraserFilterBarBtn: '#mybooking_choose_product_filter_bar__eraser', // Eraser button
    modalFilterBarBtn: '#mybooking_choose_product_filter_bar__modal', // Modal button

    // Modal content
    filterModalContainer: '#mybooking_choose_product_filter_modal', // Modal container
    templateFilterModalContent: 'script_choose_product_filter_modal_content', // Microtemplate
    
    // SectionUI Zones
    sectionContainer: '.mybooking-chose-product-filter-item_section_toogle', // Section container
    sectionToggleBtn: '.mybooking-chose-product-filter-item_section-btn', // Section toggle button

    // Events ------------------------------------------------------------------
    parentEvents: null, // Events from choose_product.js
    events: new YSDEventTarget(),
    addListener: function(type, listener) { /* addListener */
      this.events.addEventListener(type, listener);  
    },
    removeListener: function(type, listener) { /* removeListener */
        this.events.removeEventListener(type, listener);     
    },
    removeListeners: function(type) { /* remove listeners*/
        this.events.removeEventListeners(type);
    },

    // Methods ------------------------------------------------------------------
    /**
    * Update model in choose_product.js
    **/
    update: function() {
      // Get data from this form
      const data = view.getFormData();

      // Fire parent event
      model.parentEvents.fireEvent({type: 'choose_product_filter_update', data});
    },

    /**
    * Format Families to getFamilies
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
            if (!data || data.length === 0) {
              // Reject promise
              reject('No elements found in families');
              return;
            }

            const processData = that.processFamiliesData(data);
            // Resolve promise
            resolve(processData);
          },
          error: function(xhr, status, error) {
            // Reject promise
            reject(error);
          },
        });
      });
    },

    /**
    * Format key characteristics to getKeyCharacteristics
    **/
    processKeyCharacteristicsData: function(data) {
      const result = Object.values(data);

      result.forEach((item, index) => {
        item.key = index + 1;
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

            if (key_characteristics && Object.keys(key_characteristics).length > 0) {
              // Resolve promise
              resolve({
                key_characteristics: that.processKeyCharacteristicsData(key_characteristics),
              });
            } else {
              // Reject promise
              reject('No elements found in key_characteristics');
            }
          },
          error: function(xhr, status, error) {
            // Reject promise
            reject(error);
          },
        });
      });
    },
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
      const data = view.getFormData();
      model.parentEvents.fireEvent({type: 'choose_product_filter_update', data});
    },

    /**
     * Advanced button click
     */
    modalFilterBarBtnClick: function(event) {
      // Prevent form submission
      event.preventDefault();

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
      commonUI.showModal(model.filterModalContainer);

      // Initialize the filter modal
      filterModal.view.init(model.parentEvents);

      // Initialize the sections panels in advanced modal (TODO - Refactor)
      filterSection.view.init(model.events);
    },
	};

  const view = {
    /**
     * Initialize
     */ 
		init: function({getFilterSettings, events}) {
      // Initialize i18next for translations
      model.requestLanguage = commonSettings.language(document.documentElement.lang);
      i18next.init({  
        lng: model.requestLanguage,
        resources: commonTranslations
      }, 
      function() {
      });

      // Set the configuration
      model.getFilterSettings = getFilterSettings;
      model.parentEvents = events;

      // Set event listener
      this.setupEventListeners();

      // Load data and refresh
      this.loadDataAndRefresh();
		},

    /**
    * Load data and refresh
    **/
    loadDataAndRefresh: async function() {
      commonLoader.show();
      
      try {
        const [families, otherFilters] = await Promise.allSettled([model.getFamilies(), model.getKeyCharacteristics()]);

        if (families.status === 'fulfilled') {
          // Actualize model
          model.filters = {
            ...model.filters,
            families: families.value,
          };
        } else {
          console.warn('Error loading families:', families.reason);
        }

        if (otherFilters.status === 'fulfilled') {
          // Actualize model
          model.filters = {
            ...model.filters,
            otherFilters: otherFilters.value,
          };
        } else {
          console.warn('Error loading other filters:', otherFilters.reason);
        }

        // Refresh the view
        this.refresh();
      } catch (error) {
        // The messages are already shown in the console
      } finally {
        commonLoader.hide();
      }
    },

		/**
    * Refresh
    */ 
		refresh:  function() {
      // Render the template when data is refreshed
      var filter = tmpl(model.templateFilterBarContent)({
        model: model.getFilterSettings(),
        filters: model.filters,
        i18next: i18next
      });

      // Render the template
      $(model.targetContainer).html(filter);

      // Initialize the sections panels in filter base
      filterSection.view.init(model.events);

      // Setup Events
      this.setupEvents();

      // Setup Validate
      this.setupValidate();
		},

    /**
     * Setup event listeners
     */
    setupEventListeners: function() {
      // Product filter update
      model.removeListeners('choose_product_filter_section_update');
      model.addListener('choose_product_filter_section_update', model.update);
    },

    /**
     * Setup UI Events
     */ 
		setupEvents: function() {
      // eslint-disable-next-line max-len
      // If sections exists when button click event is called close all sections before submit or reset or open modal
      const form = $(model.filterBarContainer).find(model.formFilterBarContainer);
      const sections = $(model.sectionContainer);
      if (sections.length > 0) {
        // Remove old button event
        form.find('button').off('click');
        form.find('button').on('click', controller.btnClick.bind(sections));
      }

       // Eraser button event
       $(model.filterBarContainer).find(model.eraserFilterBarBtn).on('click', controller.eraserFilterBarBtnClick);

       // Advanced button event
       $(model.filterBarContainer).find(model.modalFilterBarBtn).on('click', controller.modalFilterBarBtnClick);
		},

    /**
     * Get form data
     */ 
    getFormData: function() {
      const form = $(model.filterBarContainer).find(model.formFilterBarContainer);

      // Get values incluide unchecked checkboxes
      const formValues = [];

      // Get all fields
      for (var i = 0; i < form[0].elements.length; i++) {
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

          const elementExists = formValues.find(item => item.key === element.name);
          
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
     * Setup Validate
     */ 
    setupValidate: function() {
      const form = $(model.filterBarContainer).find(model.formFilterBarContainer);

      form.validate({
        submitHandler: function(form, event) {
          // Event prevent default from form
          event.preventDefault();

          // Get data and fire event in choose_product.js
          const data = view.getFormData();
          model.parentEvents.fireEvent({type: 'choose_product_filter_update_send', data, target: 'main'});

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
