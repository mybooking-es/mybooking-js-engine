define('commonUI',['jquery', 'commonServices'],function($, commonServices){

  var commonUI = {

    /**
     * Show a modal
     * 
     *  It allows to use different modal components without affect the engine steps code
     * 
     * == Parameters::
     * 
     * @selector [String] The selector 
     */ 
  	showModal: function(selector) {

      console.log('show modal');

      // Compatibility mode with jquery.modal plugin
      if (commonServices.jsBsModalNoConflict && typeof $.fn.bootstrapModal !== 'undefined') {
        $(selector).bootstrapModal(commonServices.jsBSModalShowOptions());
      }
      else {
        if ($.fn.modal) {
          $(selector).modal(commonServices.jsBSModalShowOptions());
        }
      }

  	},

    /**
     *  Hide a modal
     * 
     *  It allows to use different modal components without affect the engine steps code
     * 
     * == Parameters::
     * 
     * @selector [String] The selector 
     * 
     * 
     */ 
    hideModal: function(selector) {

      console.log('hide modal');

      // Compatibility mode with jquery.modal plugin
      if (commonServices.jsBsModalNoConflict && typeof $.fn.bootstrapModal !== 'undefined') {
        $(selector).bootstrapModal('hide');
      }
      else {
        if ($.fn.modal) {
          $(selector).modal('hide');
        }
      }

    },

    /**
     * Show a slider
     */ 
    showSlider: function(selector) {

      console.log('show slideshow');

    }

  }

  return commonUI;

});