// eslint-disable-next-line no-undef
define('documentsComponent', [
  'jquery',
  'commonServices',
  'commonSettings',
  'commonTranslations',
  'commonLoader',
  'ysdtemplate',
  'i18next',
], function($, commonServices, commonSettings, commonTranslations, commonLoader, tmpl, i18next) {
  const model = {
    booking: null,
    requestLanguage: 'es',
  };

  const controller = {
    /**
    * Electronic documents controller
    */ 
    documentsUploadLinkClick: function(){
      // eslint-disable-next-line max-len
      if (model.booking && typeof model.booking.documentation_url && model.booking.documentation_url !== '') {
        window.open(model.booking.documentation_url, '_blank');
      }
    },
  };

  const view = {
    /**
     * Initialize
     */
    init: function(booking) {
      // Initialize i18next for translations
      model.requestLanguage = commonSettings.language(document.documentElement.lang);
      i18next.init(
        {
          lng: model.requestLanguage,
          resources: commonTranslations,
        },
        function() {},
      );

      // Set the booking
      model.booking = booking;

      debugger;

      // Setup the controls
      this.setupControls();

      // Setup the events
      this.setupEvents();
    },

    /**
     * Setup UI Controls
     */
    setupControls: function() {},

    /**
     * Setup UI Events
     */
    setupEvents: function() {
      // Electronic documents button
      if ($('#js_mb_upload_documentation_link').length) {
        $('#js_mb_upload_documentation_link').on('click', function(){
          controller.documentsUploadLinkClick();
        });
      }
    },

    /**
     * Setup validation
     */
    setupValidate: function() {},
  };

  const documentsComponent = {
    model,
    controller,
    view,
  };

  return documentsComponent;
});
