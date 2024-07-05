define('filterComponent', [
  'jquery',
  'commonServices',
  'commonSettings',
  'commonTranslations',
  'commonLoader',
  'ysdtemplate',
  'i18next',
  './choose_product_filter_section',
], function(
  $,
  commonServices,
  commonSettings,
  commonTranslations,
  commonLoader,
  tmpl,
  i18next,
  filterSection,
) {
  const model = {
    requestLanguage: null,
    settings: null,
    filters: {
      families: null,
      otherFilters: null,
    },
    numberItemsContainer: 'choose_product_filter_number_items',
    templateContainer: 'script_choose_product_filter',
    targetContainer: '#mybooking_choose_product_filter',
    formContainer: '#mybooking_choose_product_filter #mybooking_choose_product_filter_form',

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
	};

  const view = {
    /**
     * Initialize
     */ 
		init: function(settings) {
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

        console.log('model.filters', model.filters);

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

      // Initialize the section
      filterSection.view.init();
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
		},

    setupValidate: function() {
      $(model.formContainer).validate({
        submitHandler: function(form, event) {
          event.preventDefault();
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
