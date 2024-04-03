require(['jquery', 'commonSettings'],
         function($, commonSettings) {
   
  if (typeof sessionStorage !== 'undefined') {
    // Store the referrer        
    var mybookingReferrer = sessionStorage.getItem('mybookingReferrer');
    if (mybookingReferrer === null || mybookingReferrer === '') {
      sessionStorage.setItem('mybookingReferrer', document.referrer);
    }

    // Store the search query
    var mybookingSearch = sessionStorage.getItem('mybookingSearch');
    if (mybookingSearch === null || mybookingSearch === '') {
      sessionStorage.setItem('mybookingSearch', window.location.search);
    }
  }
  
});