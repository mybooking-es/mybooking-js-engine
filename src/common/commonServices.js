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
    //
    phoneUtilsPath: mybookingEngine && mybookingEngine.phoneUtilsPath ? mybookingEngine.phoneUtilsPath() : null,
    // Google Maps
    useGoogleMaps: mybookingEngine && mybookingEngine.useGoogleMaps ? mybookingEngine.useGoogleMaps() : false,
    googleMapsSettings: mybookingEngine && mybookingEngine.googleMapsSettings ? mybookingEngine.googleMapsSettings() : null,
    // Renting
    chooseProductUrl: mybookingEngine && mybookingEngine.chooseProductUrl ? formatURL(mybookingEngine.chooseProductUrl(), siteURL) : '',
    extrasStep: mybookingEngine && mybookingEngine.extrasStep ? mybookingEngine.extrasStep() : false,
    chooseExtrasUrl: mybookingEngine && mybookingEngine.chooseExtrasUrl ? formatURL(mybookingEngine.chooseExtrasUrl(), siteURL) : '',
    completeUrl: mybookingEngine && mybookingEngine.completeUrl ? formatURL(mybookingEngine.completeUrl(), siteURL) : '', 
    summaryUrl: mybookingEngine && mybookingEngine.summaryUrl ? formatURL(mybookingEngine.summaryUrl(), siteURL) : '',
    termsUrl: mybookingEngine && mybookingEngine.termsUrl ? formatURL(mybookingEngine.termsUrl(), siteURL) : '',
    selectorInProcess: mybookingEngine && mybookingEngine.selectorInProcess ? mybookingEngine.selectorInProcess() : 'form',
    rentingDetailPages: mybookingEngine && mybookingEngine.rentingDetailPages ? mybookingEngine.rentingDetailPages() : false,
    rentingDetailPageUrlPrefix: mybookingEngine && mybookingEngine.rentingDetailPageUrlPrefix ? mybookingEngine.rentingDetailPageUrlPrefix() : '',
    // Activities
    shoppingCartUrl: mybookingEngine && mybookingEngine.shoppingCartUrl ? formatURL(mybookingEngine.shoppingCartUrl(), siteURL) : '',
    orderUrl: mybookingEngine && mybookingEngine.orderUrl ? formatURL(mybookingEngine.orderUrl(), siteURL) : '',
    activitiesTermsUrl: mybookingEngine && mybookingEngine.activitiesTermsUrl ? formatURL(mybookingEngine.activitiesTermsUrl(), siteURL) : '',
    // Transfers
    transferChooseProductUrl: mybookingEngine && mybookingEngine.transferChooseProductUrl ? formatURL(mybookingEngine.transferChooseProductUrl(), siteURL) : '',
    transferExtrasStep: mybookingEngine && mybookingEngine.transferExtrasStep ? mybookingEngine.transferExtrasStep() : false,
    transferChooseExtrasUrl: mybookingEngine && mybookingEngine.transferChooseExtrasUrl ? formatURL(mybookingEngine.transferChooseExtrasUrl(), siteURL) : '',
    transferCompleteUrl: mybookingEngine && mybookingEngine.transferCompleteUrl ? formatURL(mybookingEngine.transferCompleteUrl(), siteURL) : '', 
    transferSummaryUrl: mybookingEngine && mybookingEngine.transferSummaryUrl ? formatURL(mybookingEngine.transferSummaryUrl(), siteURL) : ''

  };


  return commonServices;

});
