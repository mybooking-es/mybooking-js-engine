define('transferEngineMediator', ['jquery', 'YSDEventTarget'],
                         function($, YSDEventTarget) {
 
  /**
   * Rent Engine Mediator
   */
  transferEngineMediator = {

    events: new YSDEventTarget(),

    // -- Delegates

    chooseSingleProductDelegate: null,
    chooseMultipleProductsDelegate: null,
    chooseExtrasDelegate: null,
    checkoutDelegate: null,
    newReservationPaymentDelegate: null,
    existingReservationPaymentDelegate: null,

    // -- Rent engine components

    chooseProduct: null,
    chooseExtras: null,
    complete: null,
    summary: null,
    myReservation: null,
    productCalendar: null,

    
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
    setChooseProduct( chooseProduct ) {
       this.chooseProduct = chooseProduct;
    },

    /**
     * Set choose extras 
     */
    setChooseExtras( chooseExtras ) {
       this.chooseExtras = chooseExtras;
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

    setProductCalendar( productCalendar ) {
       this.productCalendar = productCalendar;
    },       

    // -----------------------------------

    /**
     * Setup
     */
    setupDelegate: function( delegate ) {

      if (typeof delegate.chooseSingleProduct === 'function') {
        this.chooseSingleProductDelegate = delegate.chooseSingleProduct;
      }

      if (typeof delegate.chooseMultipleProducts === 'function') {
        this.chooseMultipleProductsDelegate = delegate.chooseMultipleProducts;
      }

      if (typeof delegate.chooseExtras === 'function') {
        this.chooseExtrasDelegate = delegate.chooseExtras;
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
     * Before choose single product => Act to avoid the selection
     *
     * == Parameters::
     *
     * @productCode:: The selected product code
     * @products:: The products detail
     * @shoppingCart:: The current shopping cart
     *
     */
    onChooseSingleProduct: function ( productCode, 
                                      products, 
                                      shoppingCart ) {

      console.log('transferEngineMediator_chooseSingleProduct');

      if (typeof this.chooseSingleProductDelegate === 'function') {
        // Prepare data
        var selectedProduct = products.find(function(element) { return element.code === productCode });
        var data = { 
                      productCode: productCode,
                      product: selectedProduct,
                      products: products,
                      shoppingCart: shoppingCart,
                   };
        // Invoke delegate
        this.chooseSingleProductDelegate( data, this );
      }
      else {
        this.continueSelectSingleProduct( productCode );
      }

    },
    
    /**
     * Select the product
     */
    continueSelectSingleProduct: function( productCode ) {

      if (this.chooseProduct != null) {
        this.chooseProduct.model.selectProduct( productCode, 1 );
      }

    },

    // --------- Choose Multiple Products

    /**
     * Choose multiple products => Act to avoid pass to the next step
     * 
     * == Parameters::
     *
     * @shoppingCart:: The shopping cart
     *
     */
    onChooseMultipleProducts: function( shoppingCart ) {

      console.log('transferEngineMediator_chooseMultipleProducts');

      if (typeof this.chooseMultipleProductsDelegate === 'function') {
        var data = { 
                      shoppingCart: shoppingCart
                   }
        this.chooseMultipleProductsDelegate( data, this );
      } 
      else {
        this.continueSelectMultipleProducts( );
      }

    },

    /**
     * Continue Select Multiple Products
     */
    continueSelectMultipleProducts: function() {

      if ( this.chooseProduct != null ) {
        this.chooseProduct.view.gotoNextStep();
      }

    },

    // --------- Choose Extras

    /**
     * Choose Extras
     *
     * == Parameters::
     *
     * @shoppingCart:: The shopping cart
     *
     */
    onChooseExtras: function( shoppingCart ) {

      console.log('transferEngineMediator_chooseExtras');

      if (typeof this.chooseExtrasDelegate === 'function') {
        var data = { 
                      shoppingCart: shoppingCart
                   }
        this.chooseExtrasDelegate( data, this );
      }
      else {
        this.continueSelectExtras();
      }

    },

    /**
     * Continue select extras
     */
    continueSelectExtras: function() {

      if (this.chooseExtras != null) {
        this.chooseExtras.view.gotoNextStep();
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

      if (this.complete != null) {
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