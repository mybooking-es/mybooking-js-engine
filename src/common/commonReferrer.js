require(['jquery', 'commonSettings'],
         function($, commonSettings) {
   
  if (typeof sessionStorage !== 'undefined') {

    // Store the referrer        
    if (sessionStorage.getItem('mybookingReferrer') === null) {
      const mybookingReferrer = document.referrer;
      sessionStorage.setItem('mybookingReferrer', mybookingReferrer || '');
    } 

    // Store the search query
    if (sessionStorage.getItem('mybookingSearch') === null) {
      const mybookingSearch = window.location.search;
      sessionStorage.setItem('mybookingSearch', mybookingSearch || '');
    }

    // Store the landing page
    if (sessionStorage.getItem('mybookingLandingPage') === null) {
      const mybookingLandingPage = window.location.href;
      sessionStorage.setItem('mybookingLandingPage', mybookingLandingPage || '');
    }

  }
  
});