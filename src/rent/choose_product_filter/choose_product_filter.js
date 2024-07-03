define('filterComponent', [
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
    settings: null,
    filters: {
      families: null,
    },

    /**
     * Get Families
     *  */
    getFamilies: function() {
      // IF families is not loaded, load it
      if (!model.families) {
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
            // Set the families
            model.filters = {
              ...model.filters,
              families: data
            };

            // Refresh the view
            view.refresh();
          },
          error: function() {
            console.log('Error');
          },
        });
      }
    }
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

      // Load data
      model.getFamilies();
		},

		/**
    * Refresh
    */ 
		refresh:  function() {
      // Render the template when data is refreshed
      var filter = tmpl('script_choose_product_filter')({
        filters: model.filters,
        i18next: i18next
      });

      $('#mybooking_choose_product_filter').html(filter);
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
    },
	};

  const filterComponent = {
    model,
    controller,
    view,
  };

  return filterComponent;
});
