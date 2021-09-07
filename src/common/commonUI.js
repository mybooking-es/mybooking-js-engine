define('commonUI',['jquery', 'commonServices'],function($, commonServices){

  var commonUI = {

    /**
     * Show a modal
     */ 
  	showModal: function(selector) {

      console.log('show modal');

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
     */ 
    hideModal: function(selector) {

      console.log('hide modal');

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