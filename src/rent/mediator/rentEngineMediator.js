define('rentEngineMediator', ['jquery', 'YSDEventTarget'],
                         function($, YSDEventTarget) {
 
  /**
   * Rent Engine Mediator
   */
  var rentEngineMediator = {

    events: new YSDEventTarget(),

    // -- Delegates

    chooseSingleProductDelegate: null,
    chooseMultipleProductsDelegate: null,
    chooseExtrasDelegate: null,
    checkoutDelegate: null,
    checkoutSetExtraDelegate: null,
    checkoutSetupReservationFormDelegate: null,
    newReservationPaymentDelegate: null,
    existingReservationPaymentDelegate: null,
    summaryUpdateBookingDelegate: null,
    myReservationSetupReservationFormDelegate: null,

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

    /**
     * Set product Calendar
     */ 
    setProductCalendar( productCalendar ) {
       this.productCalendar = productCalendar;
    },       

    // -----------------------------------

    /**
     * Setup
     */
    setupDelegate: function( delegate ) {

      if (typeof delegate.showModal === 'function') {
        this.showModalDelegate = delegate.showModal;
      }

      // Choose single product
      if (typeof delegate.chooseSingleProduct === 'function') {
        this.chooseSingleProductDelegate = delegate.chooseSingleProduct;
      }

      // Choose multiple products
      if (typeof delegate.chooseMultipleProducts === 'function') {
        this.chooseMultipleProductsDelegate = delegate.chooseMultipleProducts;
      }

      // Choose extras
      if (typeof delegate.chooseExtras === 'function') {
        this.chooseExtrasDelegate = delegate.chooseExtras;
      }

      // Checkout -> SetupReservationForm
      if (typeof delegate.checkoutSetupReservationForm === 'function') {
        this.checkoutSetupReservationFormDelegate = delegate.checkoutSetupReservationForm;
      }   

      // Checkout -> SetExtras
      if (typeof delegate.checkoutSetExtra === 'function') {
        this.checkoutSetExtraDelegate = delegate.checkoutSetExtra;
      }

      // Checkout -> Checkout
      if (typeof delegate.checkout === 'function') {
        this.checkoutDelegate = delegate.checkout;
      }            

      // Checkout -> Go to Payment
      if (typeof delegate.newReservationPayment === 'function') {
        this.newReservationPaymentDelegate = delegate.newReservationPayment;
      }

      // Summary => SetupReservationForm
      if (typeof delegate.summaryUpdateBooking === 'function') {
        this.summaryUpdateBookingDelegate = delegate.summaryUpdateBooking;
      }

      // My reservation -> Go to Payment
      if (typeof delegate.existingReservationPayment === 'function') {
        this.existingReservationPaymentDelegate = delegate.existingReservationPayment;
      }

      // My reservation => SetupReservationForm
      if (typeof delegate.myReservationSetupReservationForm === 'function') {
        this.myReservationSetupReservationFormDelegate = delegate.myReservationSetupReservationForm;
      }

    },

    // ========= Interaction

    // --------- Show Modal
    onShowModal: function(event, modal) {
      console.log('rentEngineMediator_showModal', this.showModalDelegate);
      if (typeof this.showModalDelegate === 'function') {
        this.showModalDelegate(event, modal);
      }
    },

    // --------- Choose Single Products

    /**
     * Before choose single product => Act to avoid the selection
     *
     * == Parameters::
     *
     * @productCode:: The selected product code
     * @hasCoverage:: If it has a coverage
     * @coverageCode:: The current coverage code
     * @products:: The products detail
     * @shoppingCart:: The current shopping cart
     * @rateType:: The rate type (in case there are multiple rate types)
     * @extraCode:: The extra code
     *
     */
    onChooseSingleProduct: function ( productCode, 
                                      hasCoverage, 
                                      coverageCode, 
                                      products, 
                                      shoppingCart,
                                      rateType,
                                      extraCode ) {

      console.log('rentEngineMediator_chooseSingleProduct');

      if (typeof this.chooseSingleProductDelegate === 'function') {
        // Prepare data
        var selectedProduct = products.find(function(element) { return element.code === productCode });
        var data = { 
                      productCode: productCode,
                      rateType: rateType,
                      extraCode: extraCode,
                      product: selectedProduct,
                      products: products,
                      shoppingCart: shoppingCart,
                      hasCoverage: hasCoverage
                   };
        // Information about coverage
        if ( hasCoverage ) {
          var coverageInfo = this.coverageDetail(selectedProduct.coverage, coverageCode);
          data.availableCoverage = coverageInfo.availableCoverage;
          data.selectedCoverage = coverageInfo.selectedCoverage;
          data.fullCoverage = coverageInfo.fullCoverage;
          data.coverageCode = coverageCode;
        }
        // Invoke delegate
        this.chooseSingleProductDelegate( data, this );
      }
      else {
        this.continueSelectSingleProduct( productCode, coverageCode, rateType, extraCode );
      }

    },
    
    /**
     * Select the product
     */
    continueSelectSingleProduct: function( productCode, coverageCode, rateType, extraCode ) {

      if (this.chooseProduct != null) {
        this.chooseProduct.model.selectProduct( productCode, 1, coverageCode, rateType, extraCode );
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

      console.log('rentEngineMediator_chooseMultipleProducts');

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

      console.log('rentEngineMediator_chooseExtras');

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
     * When the user sets an extra
     * 
     * == Parameters::
     * 
     * @param extraCode [String] The extra
     * @param quantity [Number] The quantity
     * 
     */ 
    onCompleteSetExtra: function(extraCode, quantity) {

      console.log('rentEngineMediator_completeSetExtra');
      if (typeof this.checkoutSetExtraDelegate === 'function') {
        this.checkoutSetExtraDelegate(extraCode, quantity);
      }

    },

    /**
     * When the reservation form is ready
     * 
     */ 
    onCompleteSetupReservationForm: function() {

      console.log('rentEngineMediator_completeSetupReservationForm');
      if (typeof this.checkoutSetupReservationFormDelegate === 'function') {
        this.checkoutSetupReservationFormDelegate();
      }

    },

    /**
     * Before checkout => Act to avoid checkout
     *
     * == Parameters::
     *
     * @coverages:: The coverage options
     * @extras:: The extra options
     * @shoppingCart:: The shopping cart
     *
     */
    onCheckout: function( coverages, 
                          extras, 
                          shoppingCart ) {

      console.log('rentEngineMediator_checkout');
      if (typeof this.checkoutDelegate === 'function') {
        var data = {  
                      coverages: coverages,
                      extras: extras,  
                      shoppingCart: shoppingCart
                   }
        // Find current selected coverage
        if (shoppingCart.extras != null && shoppingCart.extras instanceof Array) {
          var coverageCode = null;
          var selectedCoverage = shoppingCart.extras.find(function(element){
                                    var found = coverages.find(function(coverageElement){
                                      return element.extra_id === coverageElement.code;
                                    });
                                    return found;
                                 });
          if (selectedCoverage != null) {
            coverageCode = selectedCoverage.extra_id;
          }
          var coverageInfo = this.coverageDetail(coverages, coverageCode);
          data.availableCoverage = coverageInfo.availableCoverage;
          data.selectedCoverage = coverageInfo.selectedCoverage;
          data.fullCoverage = coverageInfo.fullCoverage;
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

      console.log('rentEngineMediator_checkout');
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

      console.log('rentEngineMediator_checkout');
      if (typeof this.existingReservationPaymentDelegate === 'function') {
        var data = { url: url,
                     paymentData: paymentData};
        this.existingReservationPaymentDelegate(data, this);
      } else  {
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

    // ----------- Summary

    /**
     * When the reservation form is ready
     * 
     */ 
    onSummaryUpdateBooking: function(booking) {

      console.log('rentEngineMediator_summarySetupReservationForm');
      if (typeof this.summaryUpdateBookingDelegate === 'function') {
        this.summaryUpdateBookingDelegate(booking);
      }

    },

    // ----------- My reservation

    /**
     * When the reservation form is ready
     * 
     */ 
    onMyReservationSetupReservationForm: function() {

      console.log('rentEngineMediator_myReservationSetupReservationForm');
      if (typeof this.myReservationSetupReservationFormDelegate === 'function') {
        this.myReservationSetupReservationFormDelegate();
      }

    },


    // ----------- Utilities

    /**
     * Get coverage detailed information
     */
    coverageDetail : function(coverage, coverageCode) {

      var result = {availableCoverage: null,
                    selectedCoverage: null,
                    fullCoverage: null};

      if (coverage != null && coverage instanceof Array) {
        var availableCoverage = coverage.sort(function(x,y){
                                                  if (x.price < y.price) {
                                                    return -1;
                                                  }
                                                  if (x.price > y.price) {
                                                    return 1;
                                                  }
                                                  return 0;
                                                }).reverse();
        result.availableCoverage = availableCoverage;
        if (availableCoverage.length > 0) {
          if (coverageCode != null) {
            result.selectedCoverage = availableCoverage.find(function(element) { return element.code == coverageCode });
          }
          result.fullCoverage = availableCoverage[0];
        }
      }

      return result;

    },

    // ----------- Notifications

    /**
     * NotifyEvent
     */
    notifyEvent: function( event ) {

      console.log('rentEngineMediator_notify');

      this.events.fireEvent( event );

    }


  };

  return rentEngineMediator;
});