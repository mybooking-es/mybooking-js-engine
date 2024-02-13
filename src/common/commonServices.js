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

  var getUrlVars = function() {
      var vars = [], hash;
      var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
      for(var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
      }
      return vars;
  }

  var commonServices = {

    // Site url
    siteURL: siteURL,
    // Engine Connection
    URL_PREFIX: mybookingEngine && mybookingEngine.baseURL ? mybookingEngine.baseURL() : '',
    apiKey: mybookingEngine && mybookingEngine.apiKey ? mybookingEngine.apiKey() : '',
    widget: false,
    company: null,
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

  // Extract the company for the widget
  var urlVars = getUrlVars();
  if (typeof urlVars['company'] != 'undefined') {
    commonServices.URL_PREFIX = `https://${urlVars['company']}.mybooking.es`;
    commonServices.apiKey = 'widget';
    commonServices.widget = true;
    commonServices.company = urlVars['company'];
    // Append the company to the complete URL
    if (commonServices.completeUrl && commonServices.completeUrl.indexOf('?') > -1) {
      commonServices.completeUrl = commonServices.completeUrl + '&company=' + commonServices.company;
    }
    else {
      commonServices.completeUrl = commonServices.completeUrl + '?company=' + commonServices.company;
    }
    // Append the company to the summary URL
    if (commonServices.summaryUrl && commonServices.summaryUrl.indexOf('?') > -1) {
      commonServices.summaryUrl = commonServices.summaryUrl + '&company=' + commonServices.company;
    } else {
      commonServices.summaryUrl = commonServices.summaryUrl + '?company=' + commonServices.company;
    }
    
  }

  console.log('commonServices', commonServices);

  return commonServices;

});
