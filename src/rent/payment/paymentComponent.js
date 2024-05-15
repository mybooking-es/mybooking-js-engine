// eslint-disable-next-line no-undef
define('paymentComponent', [
  'jquery',
  'commonServices',
  'commonSettings',
  'commonTranslations',
  'commonLoader',
  'ysdtemplate',
  'i18next',
], function($, commonServices, commonSettings, commonTranslations, commonLoader, tmpl, i18next) {
  const model = {
    parentModel: null,
    rentEngineMediator: null,
    requestLanguage: null,

    /**
     * Send the payment request
     */
    sendPayRequest: function(paymentAmount, paymentMethod) {
      // Booking free access ID
      var bookingId = model.parentModel.bookingFreeAccessId;
      if (bookingId == '') {
        bookingId = model.parentModel.getBookingFreeAccessId();
      } else {
        model.parentModel.setBookingFreeAccessId(bookingId);
      }

      // Prepare data
      var data = {id: bookingId, payment: paymentAmount, payment_method_id: paymentMethod};

      // Do payment
      view.payment(commonServices.URL_PREFIX + '/reserva/pagar', data);
    },
  };

  const controller = {};

  const view = {
    /**
     * Initialize
     */
    init: function(parentModel, rentEngineMediator) {
      // Initialize i18next for translations
      model.requestLanguage = commonSettings.language(document.documentElement.lang);
      i18next.init(
        {
          lng: model.requestLanguage,
          resources: commonTranslations,
        },
        function() {},
      );

      // Set the parent model
      model.parentModel = parentModel;
      model.rentEngineMediator = rentEngineMediator;
      if (model.parentModel && Object.keys(model.parentModel).length > 0) {
        this.addTemplates();
      } else {
        console.log('Error: parent model not found in payment component');  // TODO
      }
    },

    addTemplates: function() {
      // Micro-template payment
      if (document.getElementById('script_payment_detail')) {
        // If the booking is pending show the payment controls
        if (model.parentModel.sales_process.can_pay) {
          var amount = 0;
          if (model.parentModel.sales_process.can_pay_pending) {
            amount = model.parentModel.booking.total_pending;
          } else if (model.parentModel.sales_process.can_pay_deposit) {
            amount = model.parentModel.booking.booking_amount;
          } else if (model.parentModel.sales_process.can_pay_total) {
            amount = model.parentModel.booking.total_cost;
          }
          var paymentInfo = tmpl('script_payment_detail')({
            sales_process: model.parentModel.sales_process,
            amount: amount,
            booking: model.parentModel.booking,
            configuration: model.parentModel.configuration,
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
      model.rentEngineMediator.onExistingReservationPayment(url, paymentData, view.gotoPayment);
    },

    /*
     * Go to payment gateway
     */
    gotoPayment: function(url, paymentData) {
      // TODO dont work, need to be fixed
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
            model.sendPayRequest(model.parentModel, paymentAmount, paymentMethod);
          }
          return false;
        },
        errorClass: 'text-danger',
        rules: {
          customer_name: {
            required: '#customer_name:visible',
          },
          customer_surname: {
            required: '#customer_surname:visible',
          },
          customer_document_id: {
            required: '#customer_document_id[required]:visible',
          },
          customer_company_name: {
            required: '#customer_company_name:visible',
          },
          customer_company_document_id: {
            required: '#customer_company_document_id:visible',
          },
          customer_email: {
            required: '#customer_email:visible',
            email: '#customer_email:visible',
          },
          customer_phone: {
            required: '#customer_phone:visible',
            minlength: 9,
          },
          payment_method_id: {
            required: 'input[name=payment_method_id]:visible',
          },
          payment_method_select: {
            required: 'input[name=payment_method_select]:visible',
          },
        },
        messages: {
          customer_name: {
            required: i18next.t('complete.reservationForm.validations.customerNameRequired'),
          },
          customer_surname: {
            required: i18next.t('complete.reservationForm.validations.customerSurnameRequired'),
          },
          customer_document_id: {
            required: i18next.t('complete.reservationForm.validations.fieldRequired'),
          },
          customer_company_name: {
            required: i18next.t('complete.reservationForm.validations.customerCompanyNameRequired'),
          },
          customer_company_document_id: {
            // eslint-disable-next-line max-len
            required: i18next.t('complete.reservationForm.validations.customerCompanyDocumentIdRequired'),
          },
          customer_email: {
            required: i18next.t('complete.reservationForm.validations.customerEmailRequired'),
            email: i18next.t('complete.reservationForm.validations.customerEmailInvalidFormat'),
          },
          customer_phone: {
            required: i18next.t('complete.reservationForm.validations.customerPhoneNumberRequired'),
            minlength: i18next.t('complete.reservationForm.validations.customerPhoneNumberMinLength'),
          },
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
