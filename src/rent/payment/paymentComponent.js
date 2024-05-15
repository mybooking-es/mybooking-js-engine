// eslint-disable-next-line no-undef
define('paymentComponent', [
  'jquery',
  'commonServices',
  'commonSettings',
  'commonTranslations',
  'commonLoader',
  'ysdtemplate',
  'YSDEventTarget',
  'i18next',
], function($, commonServices, commonSettings, commonTranslations, commonLoader, tmpl, YSDEventTarget, i18next) {
  const model = {

    salesProcess: null,
    booking: null,
    configuration: null,

    events: new YSDEventTarget(),
      
    addListener: function(type, listener) { /* addListener */
       this.events.addEventListener(type, listener);  
    },
      
    removeListener: function(type, listener) { /* removeListener */
       this.events.removeEventListener(type, listener);     
    },

    removeListeners: function(type) { /* remove listeners*/
       this.events.removeEventListeners(type);
    },

    requestLanguage: null,

    /**
     * Send the payment request
     */
    sendPayRequest: function(paymentAmount, paymentMethod) {

      // Prepare data
      var data = {id: model.bookingFreeAccessId,
                  payment: paymentAmount, payment_method_id: paymentMethod};
      // Fire the event
      this.events.fireEvent({type: 'payment', 
                             data: {
                                url: commonServices.URL_PREFIX + '/reserva/pagar',
                                paymentData: data
                             }});
    },
  };

  const controller = {};

  const view = {
    /**
     * Initialize
     */
    init: function(bookingFreeAccessId, salesProcess, booking, configuration) {

      model.bookingFreeAccessId = bookingFreeAccessId;
      model.salesProcess = salesProcess;
      model.booking = booking;
      model.configuration = configuration;

      // Initialize i18next for translations
      model.requestLanguage = commonSettings.language(document.documentElement.lang);
      i18next.init(
        {
          lng: model.requestLanguage,
          resources: commonTranslations,
        },
        function() {},
      );

      this.addTemplates();

    },

    addTemplates: function() {
      // Micro-template payment
      if (document.getElementById('script_payment_detail')) {
        // If the booking is pending show the payment controls
        if (model.salesProcess.can_pay) {
          var amount = 0;
          if (model.salesProcess.can_pay_pending) {
            amount = model.booking.total_pending;
          } else if (model.salesProcess.can_pay_deposit) {
            amount = model.booking.booking_amount;
          } else if (model.salesProcess.can_pay_total) {
            amount = model.booking.total_cost;
          }
          var paymentInfo = tmpl('script_payment_detail')({
            sales_process: model.salesProcess,
            amount: amount,
            booking: model.booking,
            configuration: model.configuration,
            i18next: i18next,
          });
          $('#payment_detail').html(paymentInfo);
          this.setupValidate();
          $('#payment_detail').show();
        }
      }
    },

    /**
     * Pay
     */
    payment: function(url, paymentData) {
      model.rentEngineMediator.onExistingReservationPayment(url, paymentData);
    },

    /*
     * Go to payment gateway
     */
    gotoPayment: function(url, paymentData) {
      // Submit the form to make the payment
      $.form(url, paymentData, 'POST').submit();
    },

    /**
     * Setup UI Controls
     */
    setupControls: function() {},

    /**
     * Setup UI Events
     */
    setupEvents: function() {},

    /**
     * Setup validation
     */
    setupValidate: function() {
      $('form[name=payment_form]').validate({
        submitHandler: function(form, event) {
          // event.preventDefault();

          $('#payment_error').hide();
          $('#payment_error').html('');

          // Payment amount
          var paymentAmount = $('input[name=payment]').val();

          // Payment method
          var paymentMethod = null;
          if ($('input[name=payment_method_id]').length == 1) {
            // Just 1 payment method
            paymentMethod = $('input[name=payment_method_id]').val();
          } else {
            // Multiple payment methods
            paymentMethod = $('input[name=payment_method_select]:checked').val();
          }
          // Do pay
          if (paymentMethod && paymentAmount) {
            model.sendPayRequest(paymentAmount, paymentMethod);
          }
          return false;
        },
        errorClass: 'text-danger',
        rules: {
          payment_method_id: {
            required: 'input[name=payment_method_id]:visible',
          },
          payment_method_select: {
            required: 'input[name=payment_method_select]:visible',
          },
        },
        messages: {
          payment_method_id: i18next.t('myReservation.pay.paymentMethodRequired'),
          payment_method_select: i18next.t('myReservation.pay.paymentMethodRequired'),
        },
        errorPlacement: function(error, element) {
          if (element.attr('name') == 'payment_method_id') {
            error.insertBefore('#btn_pay');
          } else if (element.attr('name') == 'payment_method_select') {
            error.insertAfter(document.getElementById('payment_method_select_error'));
          } else {
            error.insertAfter(element);
          }
        },
      });
    },
  };

  const paymentComponent = {
    model,
    controller,
    view,
  };

  return paymentComponent;
});
