var $ = require('jquery');

window.$ = $;
window.jQuery = $;

// If you want to pick and choose which modules to include, comment out the above and uncomment
// the line below
require('./lib/require.js');

// Jquery plugins
require('./lib/jquery.migrate.js');
require('./lib/jquery.validate.js');
require('./lib/jquery.ui.js');
require('./lib/jquery.ui.datepicker-es.js');
require('./lib/jquery.ui.datepicker-ca.js');
require('./lib/jquery.ui.datepicker-en.js');
require('./lib/jquery.ui.datepicker-it.js');
require('./lib/jquery.ui.datepicker-fr.js');
require('./lib/jquery.ui.datepicker-de.js');
require('./lib/jquery.ui.datepicker.validation.js');
require('./lib/jquery.form.js');
require('./lib/jquery.formparams.js');
require('./lib/jquery.i18next.js');
require('./lib/jquery.modal.js');
require('./lib/intlTelInput-jquery.js');

// SUPPORT
require('./lib/moment.js');
require('./lib/moment-timezone.js');
require('./lib/i18next.js');
require('./lib/loaderSpinner.js');
require('./lib/select2.js');
require('./lib/customCookie.js');

// Yurak Sisa Dream Libraries
require('./lib/YSDEventTarget.js');
require('./lib/YSDDataAdapter.js');
require('./lib/YSDAbstractDataSource.js');
require('./lib/YSDListSelectorModel.js');
require('./lib/YSDSelectSelectorController.js');
require('./lib/YSDSelectSelectorView.js');
require('./lib/ysdtemplate.js');
require('./lib/YSDMemoryDataSource.js');
require('./lib/YSDRemoteDataSource.js');
require('./lib/YSDSelectSelector.js');
require('./lib/YSDFormatter.js');
require('./lib/YSDDateControl.js');

// Project common library
require('./common/commonServices.js');
require('./common/commonSettings.js');
require('./common/commonTranslations.js');
require('./common/commonLoader');
require('./common/commonUI.js');

// == Contact module

$(document).ready(function() {
    if ($('body').hasClass('mybooking-contact-widget') &&
        $('form[name=widget_contact_form]').length) {
        require('./contact/contact.js');
    }
});

// == Page password forgotten

$(document).ready(function() {
  if ($('body').hasClass('mybooking_password_forgotten')) {
    require('./profile/PasswordForgottenComponent.js');
    require('./profile/password_forgotten.js');
  }  
});

$(document).ready(function() {
  if ($('body').hasClass('mybooking_change_password')) {
    require('./profile/ChangePasswordComponent.js');
    require('./profile/change_password.js');
  }  
});

// == Renting module

$(document).ready(function() {
    if ( $('body').hasClass('mybooking-custom-selector') &&
         $('form[name=custom_search_form]').length) {
        require('./rent/selector/custom_selector.js');        
    }
});

// Page with selector widget JS
$(document).ready(function () {
    if ($('body').hasClass('mybooking-selector-widget') &&
        $('form[name=widget_search_form]').length) {
        require('./rent/selector/widget.js');
    }
});

// Page with selector wizard JS
$(document).ready(function () {
    if ($('body').hasClass('mybooking-selector-wizard') &&
        $('form[name=wizard_search_form]').length) {
        require('./rent/selector-wizard/selector_wizard_select_place.js');
        require('./rent/selector-wizard/selector_wizard_select_date.js');   
        require('./rent/selector-wizard/selector_wizard_select_time.js');             
        require('./rent/selector-wizard/selector_wizard.js');
        require('./rent/selector-wizard/selector_wizard_widget.js');
    }
});

// Page choose_product JS
$(document).ready(function () {
    if ($('body').hasClass('choose_product')) {
        require('./rent/selector/modify_reservation_selector.js');  
        require('./rent/mediator/rentEngineMediator.js');        
        require('./rent/choose_product.js');
    }
});

// Page choose_extras JS
$(document).ready(function () {
    if ($('body').hasClass('choose_extras')) {
        require('./rent/selector/modify_reservation_selector.js');      
        require('./rent/mediator/rentEngineMediator.js');           
        require('./profile/Login.js');   
        require('./rent/complete.js');
    }
});

// Page complete JS
$(document).ready(function () {
    if ($('body').hasClass('complete')) {
        require('./rent/selector/modify_reservation_selector.js');  
        require('./rent/mediator/rentEngineMediator.js');                
        require('./profile/Login.js');
        require('./rent/complete.js');
    }
});

// Page complete JS
$(document).ready(function () {
    if ($('body').hasClass('summary')) {
        require('./rent/mediator/rentEngineMediator.js');          
        require('./rent/summary.js');
    }
});

// Page reservation JS
$(document).ready(function () {
    if ($('body').hasClass('reservation')) {
        require('./rent/mediator/rentEngineMediator.js');          
        require('./rent/passengers/passengersComponent.js');
        require('./rent/reservation.js');
    }
});

// == Product renting

// Product Search JS
$(document).ready(function() {
    if ($('body').hasClass('mybooking-product-search')) {
        require('./rent/ProductSearch.js');
    }
});

// Page with product selector widget
$(document).ready(function () {
    if ($('body').hasClass('mybooking-product') &&
        $('form[name=search_form]').length) {
        require('./lib/jquery.daterangepicker.js');    
        require('./rent/mediator/rentEngineMediator.js');              
        require('./rent/resource-calendar/product.js');
    }
});

// Rent planning
$(document).ready(function () {
    if ($('body').hasClass('mybooking-rent-planning')) {
        require('./rent/planning/planningActionBar.js');
        require('./rent/planning/planning.js');
    }
});
// Rent week planning
$(document).ready(function () {
    if ($('body').hasClass('mybooking-rent-product-planning-week')) {
        require('./rent/planning/productPlanningWeekActionBar.js');           
        require('./rent/planning/productPlanningWeek.js');
    }
});

// Rent shift picker
$(document).ready(function () {
    if ($('body').hasClass('mybooking-shiftpicker')) {
        require('./rent/shiftPicker/shiftPicker.js');           
    }
});

// == Activities module

// Activity Search JS
$(document).ready(function() {
    if ($('body').hasClass('mybooking-activity-search')) {
        require('./activities/ActivitySearch.js');
    }
});

// Activity Page  JS
$(document).ready(function () {
    if ($('body').hasClass('mybooking-activity')) {
        require('./activities/support/ActivityOneTime.js');
        require('./activities/support/ActivityMultipleDates.js');
        require('./activities/support/ActivityCyclic.js');
        require('./activities/Activity.js');
    }
});

// Activities Shopping Cart Page  JS
$(document).ready(function () {
    if ($('body').hasClass('mybooking-activity-shopping-cart')) {
        require('./activities/ShoppingCart.js');
    }
});

// Activities Summary Page  JS
$(document).ready(function () {
    if ($('body').hasClass('mybooking-activity-summary')) {
        require('./activities/Order.js');
    }
});

// Activities Order Page  JS
$(document).ready(function () {
    if ($('body').hasClass('mybooking-activity-order')) {
        require('./activities/Order.js');
    }
});

// == Transfer module
$(document).ready(function() {
    if ( $('body').hasClass('mybooking-transfer-selector') &&
         $('form[name=mybooking_transfer_search_form]').length) {
        require('./transfer/selector/widget.js');
    }
});

// Transfer Page choose_product JS
$(document).ready(function () {
    if ($('body').hasClass('mybooking-transfer-choose-product')) {
        require('./transfer/selector/modify_reservation_selector.js');  
        require('./transfer/mediator/transferEngineMediator.js');        
        require('./transfer/choose_product.js');
    }
});

// Transfer Page complete JS
$(document).ready(function () {
    if ($('body').hasClass('mybooking-transfer-complete')) {
        require('./transfer/selector/modify_reservation_selector.js');  
        require('./transfer/mediator/transferEngineMediator.js');                
        require('./profile/Login.js');
        require('./transfer/complete.js');
    }
});

// Transfer Page summary JS
$(document).ready(function () {
    if ($('body').hasClass('mybooking-transfer-summary')) {
        require('./transfer/mediator/transferEngineMediator.js');                
        require('./transfer/summary.js');
    }
});

// Transfer Page Reservation JS
$(document).ready(function () {
    if ($('body').hasClass('mybooking-transfer-reservation')) {
        require('./transfer/mediator/transferEngineMediator.js');                
        require('./transfer/reservation.js');
    }
});