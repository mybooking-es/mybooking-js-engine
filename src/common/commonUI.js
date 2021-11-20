define('commonUI',['jquery', 'commonServices', 'jquery.modal'],function($, commonServices){

  var commonUI = {

    /**
     * Show a modal
     * 
     *  It allows to use different modal components without affect the engine steps code.
     *
     *  It uses bootstrap modal as modal library
     *  
     *  From version 0.9.30 mbModal (fork of jquery.modal) can be used to show modal. In
     *  this case, the selector will have the prefix _MBM
     * 
     * == Parameters::
     * 
     * @selector [String] The selector 
     */ 
  	showModal: function(selector, callbackOnShow) {

      var selectorMBM = selector + '_MBM';

      if ($(selectorMBM).length > 0) {
        // Setup the callback on Show
        if (callbackOnShow !== undefined && typeof callbackOnShow === 'function') {
          $(selectorMBM).on($.mbModal.OPEN, callbackOnShow);
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
     *  From version 0.9.30 mbModal (fork of jquery.modal) can be used to show modal. In
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
                arrows: true,
                dots: true,
                //adaptiveHeight: true,
                prevArrow: '<button type="button" class="slick-prev">&nbsp;</type>',
                nextArrow: '<button type="button" class="slick-next">&nbsp;</type>'
              });
      }
      
    }

  }

  return commonUI;

});