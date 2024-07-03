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
    configuration: null,
	};

  const controller = {
		/**
		* Refresh
		*/
    refresh: function(viewType) {
    }
	};

  const view = {
    /**
     * Initialize
     */ 
		init: function({configuration}) {
      // Initialize i18next for translations
      model.requestLanguage = commonSettings.language(document.documentElement.lang);
      i18next.init({  
        lng: model.requestLanguage,
        resources: commonTranslations
      }, 
      function() {
      });

      // Set the configuration
      model.configuration = configuration;
		},

		/**
	 * Refresh
	 */ 
		refresh: function() {
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

  const filterSection = {
    model,
    controller,
    view,
  };

  return filterSection;
});
