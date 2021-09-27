/******
 *
 * Renting Module selector Widget
 *
 */
require(['jquery', 'commonSettings', 'commonLoader', './SelectorTransfer'],
 function($, commonSettings, commonLoader, SelectorTransfer) {

    var selector = new SelectorTransfer();
    selector.model.form_selector = 'form[name=mybooking_widget_transfer_search_form]';
    selector.model.form_selector_tmpl = 'widget_transfer_form_selector_tmpl';
    selector.view.loadSettings(true);

});