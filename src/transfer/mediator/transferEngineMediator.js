define('transferEngineMediator', ['jquery', 'YSDEventTarget'],
                         function($, YSDEventTarget) {
 
  /**
   * Rent Engine Mediator
   */
  var transferEngineMediator = {

    events: new YSDEventTarget(),

    // -- Delegates

    chooseVehicleDelegate: null,
    checkoutDelegate: null,
    newReservationPaymentDelegate: null,
    existingReservationPaymentDelegate: null,

    // -- Rent engine components

    chooseVehicle: null,
    complete: null,
    summary: null,
    myReservation: null,
 
    
    addListener: function(type, listener) { /* addListener */
       this.events.addEventListener(type, listener);  
    },
      
    removeListener: function(type, listener) { /* removeListener */
       this.events.removeEventListener(type, listener);     
    },

    removeListeners: function(type) { /* remove listeners*/
       this.events.removeEventListeners(type);
    },

    // --------- Configure reservation engine components

    /**
     * Set choose product
     */
    setChooseVehicle( chooseVehicle ) {
       this.chooseVehicle = chooseVehicle;
    },

    /**
     * Set complete 
     */
    setComplete( complete ) {
       this.complete = complete;
    },

    /**
     * Set summary
     */
    setSummary( summary ) {
       this.summary = summary;
    },

    /**
     * Set myReservation
     */
    setMyReservation( myReservation ) {
       this.myReservation = myReservation;
    },

    // -----------------------------------

    /**
     * Setup
     */
    setupDelegate: function( delegate ) {

      if (typeof delegate.chooseVehicle === 'function') {
        this.chooseVehicleDelegate = delegate.chooseVehicle;
      }

      if (typeof delegate.checkout === 'function') {
        this.checkoutDelegate = delegate.checkout;
      }            

      if (typeof delegate.newReservationPayment === 'function') {
        this.newReservationPaymentDelegate = delegate.newReservationPayment;
      }

      if (typeof delegate.existingReservationPayment === 'function') {
        this.existingReservationPaymentDelegate = delegate.existingReservationPayment;
      }

    },

    // ========= Interaction

    // --------- Choose Single Products

    /**
     * Before choose vehicle => Act to avoid the selection
     *
     * == Parameters::
     *
     * @vehicleId:: The selected vehicle id
     * @vehicles:: The vehicles detail
     * @shoppingCart:: The current shopping cart
     *
     */
    onChooseVehicle: function ( vehicleId, 
                                vehicles, 
                                shoppingCart ) {

      console.log('transferEngineMediator_chooseSingleProduct');

      if (typeof this.chooseVehicleDelegate === 'function') {
        // Prepare data
        var selectedVehicle = vehicles.find(function(element) { return element.id === vehicleId });
        var data = { 
                      vehicleId: vehicleId,
                      product: selectedVehicle,
                      vehicles: vehicles,
                      shoppingCart: shoppingCart,
                   };
        // Invoke delegate
        this.chooseVehicleDelegate( data, this );
      }
      else {
        this.continueSelectVehicle( vehicleId );
      }

    },
    
    /**
     * Select the product
     */
    continueSelectVehicle: function( vehicleId ) {

      if (this.chooseVehicle != null) {
        this.chooseVehicle.model.selectProduct( vehicleId, 1 );
      }

    },

    // --------- Complete

    /**
     * Before checkout => Act to avoid checkout
     *
     * == Parameters::
     *
     * @extras:: The extra options
     * @shoppingCart:: The shopping cart
     *
     */
    onCheckout: function(
                          extras, 
                          shoppingCart ) {

      console.log('transferEngineMediator_checkout');
      if (typeof this.checkoutDelegate === 'function') {
        var data = {  
                      extras: extras,  
                      shoppingCart: shoppingCart
                   }
        this.checkoutDelegate( data, this );
      }
      else {
        this.continueCheckout();
      }

    },

    /**
     * Continue checkout
     */
    continueCheckout: function() {

      if (this.complete != null) {
        this.complete.model.sendBookingRequest();
      }

    },

    // ----------- New reservation payment
    
    /**
     * on new reservation payment
     */
    onNewReservationPayment: function(url, summaryUrl, paymentData) {

      console.log('transferEngineMediator_checkout');
      if (typeof this.newReservationPaymentDelegate === 'function') {
        var data = { url: url,
                     summaryUrl: summaryUrl,
                     paymentData: paymentData};
        console.log(data);             
        this.newReservationPaymentDelegate(data, this);
      }
      else {
        this.continueNewReservationPayment(url, paymentData, this);
      }      

    },

    /**
     * Continue new reservation payment
     */
    continueNewReservationPayment: function(url, paymentData) {

      if (this.complete != null) {
        this.complete.view.gotoPayment(url, paymentData);
      }

    },

    //
    
    /**
     * onExisting reservation payment
     */
    onExistingReservationPayment: function(url, paymentData) {

      console.log('transferEngineMediator_checkout');
      if (typeof this.existingReservationPaymentDelegate === 'function') {
        var data = { url: url,
                     paymentData: paymentData};
        this.existingReservationPaymentDelegate(data, this);
      }
      else {
        this.continueExistingReservationPayment(url, paymentData);
      }  

    },

    /**
     * continue existing reservation payment
     */
    continueExistingReservationPayment: function(url, paymentData) {

      if (this.myReservation != null) {
        this.myReservation.view.gotoPayment(url, paymentData);
      }

    },

    // ----------- Utilities

    // ----------- Notifications

    /**
     * NotifyEvent
     */
    notifyEvent: function( event ) {

      console.log('transferEngineMediator_notify');

      this.events.fireEvent( event );

    }


  };

  return transferEngineMediator;

});