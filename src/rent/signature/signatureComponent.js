// eslint-disable-next-line no-undef
define('signatureComponent', [
  'jquery',
  'commonServices',
  'commonSettings',
  'commonTranslations',
  'commonLoader',
  'ysdtemplate',
  'i18next',
  '../mediator/rentEngineMediator',
], function($, commonServices, commonSettings, commonTranslations, commonLoader, tmpl, i18next, rentEngineMediator) {
  const model = {};

  const controller = {};

  const view = {
    /**
     * Initialize
     */
    init: function(parentModel) {
      // Initialize i18next for translations
      model.requestLanguage = commonSettings.language(document.documentElement.lang);
      i18next.init(
        {
          lng: model.requestLanguage,
          resources: commonTranslations,
        },
        function() {},
      );

      // this.addTemplates(parentModel);
    },

    addTemplates: function(parentModel) {},

    /**
     * Setup UI Controls
     */
    setupControls: function() {},

    /**
     * Setup UI Events
     */
    setupEvents: function() {},

    /**
     * Setup validation
     */
    setupValidate: function() {},
  };

  const signatureComponent = {
    model,
    controller,
    view,
  };

  return signatureComponent;
});
