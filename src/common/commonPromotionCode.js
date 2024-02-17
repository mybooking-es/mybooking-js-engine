define('commonPromotionCode', ['jquery', 'commonSettings'],
         function($, commonSettings) {
        
  var data = {
    promotionCode: null,
  }

  // Extract the promotion code from the URL
  var urlVars = commonSettings.getUrlVars(); 
  if (typeof urlVars['promotion_code'] != 'undefined') {
    data.promotionCode = decodeURIComponent(urlVars['promotion_code']);
  }

  return data;

});