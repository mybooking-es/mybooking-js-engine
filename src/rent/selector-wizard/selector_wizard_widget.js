/**
 * This is the initiator of the selector Wizard
 */
require(['jquery', 'commonSettings', './selector_wizard'],
         function($, commonSettings, selectorWizard) {

  /***
   * Model
   */
  var widgetSelectorWizardModel = {
    requestLanguage: null,
    configuration: null,
    
    /**
     * Load settings
     */
    loadSettings: function() {
      commonSettings.loadSettings(function(data){
        widgetSelectorWizardModel.configuration = data;
        widgetSelectorWizardView.init();
      });
    }
   
  };

  /***
   * Controller
   */
  var widgetSelectorWizardController = {

  };

  /***
   * View
   */
  var widgetSelectorWizardView = {

    /**
     * Initialize
     */
    init: function() {
        // Setup request language (for API calls)
        widgetSelectorWizardModel.requestLanguage = commonSettings.language(document.documentElement.lang);
        
        // Configure selector
        selectorWizard.model.requestLanguage = widgetSelectorWizardModel.requestLanguage;
        selectorWizard.model.configuration = widgetSelectorWizardModel.configuration;
        
        // Initialize selector
        selectorWizard.view.init();
    }

  };

  //$(document).ready(function(){
    console.log('selector_wizard_widget');
    widgetSelectorWizardModel.loadSettings();
  //});

});
