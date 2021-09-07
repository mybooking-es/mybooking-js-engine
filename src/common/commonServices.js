define('commonServices',[],function(){

  var siteURL = mybookingEngine && mybookingEngine.siteURL ? mybookingEngine.siteURL() : '';
  if (siteURL != '') {
    siteURL += '/';
  }

  var formatURL = function(theUrl, siteURL) {

      try {
        var url = new URL(theUrl);
        if (url.protocol == '') {
          return siteURL + theUrl;
        }
        return theUrl;
      }
      catch (exception) {
        return siteURL + theUrl;
      }

    }


  var commonServices = {

    // Site url
    siteURL: siteURL,
    // Engine Connection
    URL_PREFIX: mybookingEngine && mybookingEngine.baseURL ? mybookingEngine.baseURL() : '',
    apiKey: mybookingEngine && mybookingEngine.apiKey ? mybookingEngine.apiKey() : '',
    // Loader
    customLoader: mybookingEngine && mybookingEngine.customLoader ? mybookingEngine.customLoader() : false,
    // Use select2
    jsUseSelect2: mybookingEngine && mybookingEngine.jsUseSelect2 ? mybookingEngine.jsUseSelect2() : false,
    // Bootstrap Modal compatibility (create $.fn.bootstrapModal to hold noConflict version)
    jsBsModalNoConflict: mybookingEngine && mybookingEngine.jsBsModalNoConflict ? mybookingEngine.jsBsModalNoConflict() : false,
    jsBsModalBackdropCompatibility: mybookingEngine && mybookingEngine.jsBsModalBackdropCompatibility ? mybookingEngine.jsBsModalBackdropCompatibility() : false,
    jsBSModalShowOptions: function() {
      var opts = {show: true};
      if (this.jsBsModalBackdropCompatibility) {
        opts.backdrop = false;
      }
      return opts;
    },
    // Google Maps
    useGoogleMaps: mybookingEngine && mybookingEngine.useGoogleMaps ? mybookingEngine.useGoogleMaps() : false,
    googleMapsSettings: mybookingEngine && mybookingEngine.googleMapsSettings ? mybookingEngine.googleMapsSettings() : null,
    // Renting
    chooseProductType: mybookingEngine && mybookingEngine.chooseProductType ? mybookingEngine.chooseProductType : 'grid',
    chooseProductUrl: mybookingEngine && mybookingEngine.chooseProductUrl ? formatURL(mybookingEngine.chooseProductUrl(), siteURL) : '',
    extrasStep: mybookingEngine && mybookingEngine.extrasStep ? mybookingEngine.extrasStep() : false,
    chooseExtrasUrl: mybookingEngine && mybookingEngine.chooseExtrasUrl ? formatURL(mybookingEngine.chooseExtrasUrl(), siteURL) : '',
    completeUrl: mybookingEngine && mybookingEngine.completeUrl ? formatURL(mybookingEngine.completeUrl(), siteURL) : '', 
    summaryUrl: mybookingEngine && mybookingEngine.summaryUrl ? formatURL(mybookingEngine.summaryUrl(), siteURL) : '',
    termsUrl: mybookingEngine && mybookingEngine.termsUrl ? formatURL(mybookingEngine.termsUrl(), siteURL) : '',
    selectorInProcess: mybookingEngine && mybookingEngine.selectorInProcess ? mybookingEngine.selectorInProcess() : 'form',
    // Activities
    shoppingCartUrl: mybookingEngine && mybookingEngine.shoppingCartUrl ? formatURL(mybookingEngine.shoppingCartUrl(), siteURL) : '',
    orderUrl: mybookingEngine && mybookingEngine.orderUrl ? formatURL(mybookingEngine.orderUrl(), siteURL) : '',
    activitiesTermsUrl: mybookingEngine && mybookingEngine.activitiesTermsUrl ? formatURL(mybookingEngine.activitiesTermsUrl(), siteURL) : ''

  };


  return commonServices;

});
