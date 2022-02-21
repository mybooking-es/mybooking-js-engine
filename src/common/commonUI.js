define('commonUI',['jquery', 'commonServices', 'jquery.modal'],function($, commonServices){

  var commonUI = {


    intlTelInputCountryCode: function() {

      var countryCode = null;

      // Extract the language from the document.documentElement or the navigator.language
      var lang = null;
      if (document && document.documentElement && document.documentElement.lang) {
        lang = document.documentElement.lang;
      }
      else {
        lang = navigator.language;
      }

      // Process the language
      if (typeof lang != 'undefined' && lang != null) {
        if (lang.indexOf('-') > -1) { // Language with country code
          var langParts = lang.split('-');
          if (langParts.length > 0) {
            countryCode = langParts[langParts.length-1];
            if (countryCode != null) {
              countryCode = countryCode.toLowerCase();
            }
          }
        }
        else {
          countryCode = lang;
        }
      }

      // Check if country code exist in CountryData
      if (countryCode && 
          window.intlTelInputGlobals && 
          typeof window.intlTelInputGlobals.getCountryData !== 'undefined') {
        var findCountry = window.intlTelInputGlobals.getCountryData().find(element => element.iso2 === countryCode);
        if (findCountry === undefined) {
          countryCode = null;
        }
      }

      if (countryCode == null) {
        countryCode = "auto";
      }

      // Return the country code

      return countryCode;
    },

    /**
     * Show a modal
     * 
     *  It allows to use different modal components without affect the engine steps code.
     *
     *  It uses bootstrap modal as modal library
     *  
     *  From version 1.0.0 mbModal (fork of jquery.modal) can be used to show modal. In
     *  this case, the selector will have the prefix _MBM
     * 
     * == Parameters::
     * 
     * @selector [String] The selector 
     */ 
  	showModal: function(selector, callbackOnShow, callbackOnHide) {

      var selectorMBM = selector + '_MBM';

      if ($(selectorMBM).length > 0) {
        // Setup the callback on Show
        if (callbackOnShow !== undefined && typeof callbackOnShow === 'function') {
          $(selectorMBM).on($.mbModal.OPEN, callbackOnShow);
        }
        if (callbackOnHide !== undefined && typeof callbackOnHide === 'function') {
          $(selectorMBM).on($.mbModal.AFTER_CLOSE, callbackOnHide);
        }
        // Show the modal
        $(selectorMBM).mbModal({ modalClass: "mybooking-modal",
                                 blockerClass: "mybooking-jquery-modal",});
      }
      else {
        if ($.fn.modal) {
          $(selector).modal({show: true, backdrop: true});
        }
      }

  	},

    /**
     *  Hide a modal
     * 
     *  It allows to use different modal components without affect the engine steps code
     * 
     *  It uses bootstrap modal as modal library
     *  
     *  From version 1.0.0 mbModal (fork of jquery.modal) can be used to show modal. In
     *  this case, the selector will have the prefix _MBM
     *
     * == Parameters::
     * 
     * @selector [String] The selector 
     * 
     */ 
    hideModal: function(selector, callbackOnHide) {

      var selectorMBM = selector + '_MBM';

      if ($(selectorMBM).length > 0) {
        if (callbackOnHide !== 'undefined' && typeof callbackOnHide === 'function') {
          $(selectorMBM).on($.mbModal.AFTER_CLOSE, callbackOnHide);
        }
        $.mbModal.close();
      }
      else {
        if ($.fn.modal) {
          $(selector).modal('hide');
        }
      }

    },

    /**
     * Show a slider
     * 
     * It uses slickjs if defined
     * 
     */ 
    showSlider: function(selector) {

      console.log('show slideshow');

      // If slick library defined
      if ($.fn.slick) {
        $(selector).slick({
                slidesToShow: 1,
                slidesToScroll: 1,
                autoplay: true,
                autoplaySpeed: 4000,
                adaptiveHeight: true,
                arrows: true,
                dots: true,
                prevArrow: '<button type="button" class="slick-prev">&nbsp;</type>',
                nextArrow: '<button type="button" class="slick-next">&nbsp;</type>'
              });
        $(selector).slick("setPosition", 0);
      }
      
    },

    /**
     * Destroy slider
     */ 
    destroySlider: function(selector) {

      $(selector).slick('unslick');

    },

    /**
     *  Play slider
     */ 
    playSlider: function(selector) {
      if ($.fn.slick) {
        $(selector).slick('slickPlay');
      }
    },

    /**
     *  Pauses slider
     */ 
    pauseSlider: function(selector) {
      if ($.fn.slick) {
        $(selector).slick('slickPause');
      }
    }


  }

  return commonUI;

});