define(['YSDListSelectorModel','YSDSelectSelectorController', 'YSDSelectSelectorView'], function(ListSelectorModel, SelectSelectorController, SelectSelectorView) {

  /* ---------------------------
     SelectSelector
     ---------------------------
     A component to select a element or elements from a list using a html SELECT control

     It uses the ListSelectorModel as a model
  
     == Parameters::

     @params [String] selectorControlId: The selector element id
     @params [YSDAbstractDataSource] dataSource: The datasource 
     @params [Object] value: The current value
     @params [Boolean] nullOption: Accepts null 
     @params [String] nullOptionText: The text to show
     @params [function] callback 

   */
  var YSDSelectSelector = function(selectControlId, dataSource, value, nullOption, nullOptionText, callback) {

    this.model = new ListSelectorModel(dataSource, value);
    this.controller = new SelectSelectorController();
    this.view = new SelectSelectorView(this.model, this.controller, selectControlId, nullOption, nullOptionText, callback);

    this.setValue = function(newValue) {
      this.model.setValue(newValue);
    }

    this.stop = function() {
      this.model.removeEventListener();
    }
    

    this.controller.setView(this.view);
    this.model.setView(this.view);

    this.model.retrieveData(); /* Retrieve model data */

  }

  return YSDSelectSelector;

});