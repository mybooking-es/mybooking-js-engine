// eslint-disable-next-line no-undef
define('signatureComponent', [
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
    * Electronic signature controller
    */ 
    electronicSignatureLinkClick: function(){
      // eslint-disable-next-line max-len
      if (model.booking && typeof model.booking.electronic_signature_url && model.booking.electronic_signature_url !== '') {
        window.open(model.booking.electronic_signature_url, '_blank');
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
      // Electronic Signature button
      if ($('#js_mb_electronic_signature_link').length) {
        $('#js_mb_electronic_signature_link').on('click', function(){
          controller.electronicSignatureLinkClick();
        });
      }
    },

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
