define('commonPromotionCode', ['jquery', 'commonSettings'],
         function($, commonSettings) {
        
  var data = {
    promotionCode: null,
  }

  // Extract the promotion code from the URL
  var urlVars = commonSettings.getUrlVars(); 
  if (typeof urlVars['promotionCode'] != 'undefined') {
    data.promotionCode = decodeURIComponent(urlVars['promotionCode']);
  }

  return data;

});