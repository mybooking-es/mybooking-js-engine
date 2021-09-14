/******
 *
 * Renting Module selector Widget
 *
 */
require(['jquery', 'commonSettings', 'commonLoader', './SelectorTransfer'],
 function($, commonSettings, commonLoader, SelectorTransfer) {

    var selector = new SelectorTransfer();
    selector.view.loadSettings(true);

});