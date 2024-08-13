/* eslint-disable camelcase */
define('filterComponent', [
  'jquery',
  'commonServices',
  'commonSettings',
  'commonTranslations',
  'commonLoader',
  'i18next',
  'YSDEventTarget',
  './choose_product_filter_bar',
  './choose_product_filter_modal',
], function(
  $,
  commonServices,
  commonSettings,
  commonTranslations,
  commonLoader,
  i18next,
  YSDEventTarget,
  filterBar,
  filterModal
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
    targetBarContainer: '#mybooking_choose_product_filter', // Initial empty container with conditional shortcode

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

    refresh: function() {
      // Render filter bar
      filterBar.view.init({
        filters: model.filters,
        getFilterSettings: model.getFilterSettings,
        events: model.events,
        target: model.targetBarContainer,
      });

      // Render filter modal
      filterModal.view.init({
        filters: model.filters,
        getFilterSettings: model.getFilterSettings,
        events: model.events,
      });
    },

    /**
     * Setup event listeners
     */
    setupEventListeners: function() {
      // Product filter section update
      model.removeListeners('choose_product_filter_section_update');
      model.addListener('choose_product_filter_section_update', (event) => {
        const data = view.getFormData(event.target);
        model.parentEvents.fireEvent({type: 'choose_product_filter_update', data});
      });

      // Product filter bar update
      model.removeListeners('choose_product_filter_bar_update');
      model.addListener('choose_product_filter_bar_update', (event) => {
        const data = view.getFormData(event.target);
        model.parentEvents.fireEvent({type: 'choose_product_filter_update', data});
      });

      // Product filter bar update and send
      model.removeListeners('choose_product_filter_bar_update_send');
      model.addListener('choose_product_filter_bar_update_send', (event) => {
        const data = view.getFormData(event.target);
        model.parentEvents.fireEvent({type: 'choose_product_filter_update_send', data});
      });

      // Product filter modal update
      model.removeListeners('choose_product_filter_modal_update');
      model.addListener('choose_product_filter_modal_update', (event) => {
        const data = view.getFormData(event.target);
        model.parentEvents.fireEvent({type: 'choose_product_filter_update', data});
      });

      // Product filter modal update and send
      model.removeListeners('choose_product_filter_modal_update_send');
      model.addListener('choose_product_filter_modal_update_send', (event) => {
        const data = view.getFormData(event.target);
        model.parentEvents.fireEvent({type: 'choose_product_filter_update_send', data});
      });

      // Product filter modal close
      model.removeListeners('choose_product_filter_modal_close');
      model.addListener('choose_product_filter_modal_close', (event) => {
        view.refresh();
      });
    },

    /**
     * Get form data
     */ 
    getFormData: function(target) {
      if (!target) {
        console.warn('No form target found');
        return;
      }

      const form = $(target);

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
	};

  const filterComponent = {
    model,
    controller,
    view,
  };

  return filterComponent;
});
