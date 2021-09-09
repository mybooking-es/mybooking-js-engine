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
  	showModal: function(selector) {

      console.log('show modal');

      var selectorMBM = selector + '_MBM';

      console.log(selectorMBM);
      console.log($(selectorMBM).length);

      if ($(selectorMBM).length > 0) {
        $(selectorMBM).mbModal({ modalClass: "mybooking-modal",
                                 blockerClass: "mybooking-jquery-modal",});
      }
      else {
        // Compatibility mode with jquery.modal plugin
        if (commonServices.jsBsModalNoConflict && typeof $.fn.bootstrapModal !== 'undefined') {
          $(selector).bootstrapModal(commonServices.jsBSModalShowOptions());
        }
        else {
          if ($.fn.modal) {
            $(selector).modal(commonServices.jsBSModalShowOptions());
          }
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
    hideModal: function(selector) {

      console.log('hide modal');

      var selectorMBM = selector + '_MBM';

      if ($(selectorMBM).length > 0) {
        $.mbModal.close();
      }
      else {
        // Compatibility mode with jquery.modal plugin
        if (commonServices.jsBsModalNoConflict && typeof $.fn.bootstrapModal !== 'undefined') {
          $(selector).bootstrapModal('hide');
        }
        else {
          if ($.fn.modal) {
            $(selector).modal('hide');
          }
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