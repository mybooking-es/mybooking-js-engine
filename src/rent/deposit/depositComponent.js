// eslint-disable-next-line no-undef
define('depositComponent', [
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
    booking: null,
    configuration: null,
    depositProcess: null,
    requestLanguage: 'es',
    bookingFreeAccessId: null,
    rentEngineMediator: null,

    events: new YSDEventTarget(),
    addListener: function(type, listener) {
       this.events.addEventListener(type, listener);  
    },
    removeListener: function(type, listener) {
       this.events.removeEventListener(type, listener);     
    },
    removeListeners: function(type) {
       this.events.removeEventListeners(type);
    },

    /**
     * Send the deposit payment request
     */
    sendPayDepositRequest: function(paymentMethod) {
      // TODO: parece que el backend no calcula bien el amount
      //var depositAmount = model.booking.total_deposit || model.booking.booking_deposit;
      var data = {
        id: model.bookingFreeAccessId,
        //amount: depositAmount,
        payment_method_id: paymentMethod
      };
      // Fire the event
      this.events.fireEvent({
        type: 'deposit_payment', 
        data: {
          url: commonServices.URL_PREFIX + '/reserva/deposito/pagar',
          paymentData: data
        }
      });
    },
  };

  const controller = {};

  const view = {
    /**
     * Initialize
     */
    init: function(bookingFreeAccessId, depositProcess, booking, configuration, rentEngineMediator) {
      model.bookingFreeAccessId = bookingFreeAccessId;
      model.depositProcess = depositProcess;
      model.booking = booking;
      model.configuration = configuration;
      model.rentEngineMediator = rentEngineMediator;

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
      // Micro-template deposit payment
      if (document.getElementById('script_deposit_detail')) {
        // Only show if deposit can be received and not already received
        if (model.depositProcess && 
            model.depositProcess.can_receive_deposit && 
            !model.booking.deposit_received) {
          var depositInfo = tmpl('script_deposit_detail')({
            deposit_process: model.depositProcess,
            amount: model.booking.total_deposit,
            booking: model.booking,
            configuration: model.configuration,
            i18next: i18next,
          });
          $('#deposit_detail').html(depositInfo);
          // Process translations after inserting HTML
          this.processTranslations();
          this.setupValidate();
          
          // Hide the deposit container initially if it's inside a step container
          // The tabs/steps system will show it when the tab is clicked
          var $depositContainer = $('#deposit_detail').closest('.mb--step-container');
          if ($depositContainer.length > 0) {
            $depositContainer.hide();
          } else {
            // If not in a step container, hide the deposit_detail itself
            $('#deposit_detail').hide();
          }
        }
      }
    },

    /**
     * Process translations in the inserted HTML
     */
    processTranslations: function() {
      var $container = $('#deposit_detail');
      
      // Process all elements that contain only text (no children)
      $container.find('*').addBack().each(function() {
        var $elem = $(this);
        
        // Skip if element has child elements (to avoid double processing)
        if ($elem.children().length > 0) {
          return;
        }
        
        // Process text content - look for translation keys pattern
        var text = $elem.text();
        if (text && text.trim()) {
          // Pattern: text that looks like a translation key (e.g., "myReservation.deposit.total_deposit")
          var translationKeyPattern = /^([a-zA-Z_]+(?:\.[a-zA-Z_]+)+)$/;
          var textTrimmed = text.trim();
          if (translationKeyPattern.test(textTrimmed)) {
            var translated = i18next.t(textTrimmed);
            // Only replace if translation exists and is different
            if (translated && translated !== textTrimmed) {
              $elem.text(translated);
            }
          }
        }
      });
    },

    /**
     * Payment deposit
     */
    depositPayment: function(url, paymentData) {
      if (model.rentEngineMediator) {
        model.rentEngineMediator.onExistingDepositPayment(url, paymentData);
      }
    },

    /**
     * Go to payment gateway
     */
    gotoPayment: function(url, paymentData) {
      // Submit the form to make the payment
      $.form(url, paymentData, 'POST').submit();
    },

    /**
     * Setup validation
     */
    setupValidate: function() {
      $('form[name=deposit_form]').validate({
        submitHandler: function(form, event) {
          $('#deposit_error').hide();
          $('#deposit_error').html('');

          // Payment method
          var paymentMethod = null;
          if ($('input[name=deposit_payment_method_id]').length == 1) {
            // Just 1 payment method
            paymentMethod = $('input[name=deposit_payment_method_id]').val();
          } else {
            // Multiple payment methods
            paymentMethod = $('input[name=deposit_payment_method_select]:checked').val();
          }
          
          // Do pay deposit
          if (paymentMethod) {
            model.sendPayDepositRequest(paymentMethod);
          }
          return false;
        },
        errorClass: 'text-danger',
        rules: {
          deposit_payment_method_id: {
            required: 'input[name=deposit_payment_method_id]:visible',
          },
          deposit_payment_method_select: {
            required: 'input[name=deposit_payment_method_select]:visible',
          },
        },
        messages: {
          deposit_payment_method_id: i18next.t('myReservation.pay.depositPaymentMethodRequired'),
          deposit_payment_method_select: i18next.t('myReservation.pay.depositPaymentMethodRequired'),
        },
        errorPlacement: function(error, element) {
          if (element.attr('name') == 'deposit_payment_method_id') {
            error.insertBefore('#btn_pay_deposit');
          } else if (element.attr('name') == 'deposit_payment_method_select') {
            error.insertAfter(document.getElementById('deposit_payment_method_select_error'));
          } else {
            error.insertAfter(element);
          }
        },
      });
    },
  };

  const depositComponent = {
    model,
    controller,
    view,
  };

  return depositComponent;
});


