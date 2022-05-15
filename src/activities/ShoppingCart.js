require(['jquery','i18next', 'ysdtemplate', 
        'commonServices', 'commonSettings', 'commonTranslations', 'commonLoader', 'commonUI',
        'jquery.ui', 'jquery.validate',
        'jquery.form', 'jquery.formparams'],
    function($, i18next, tmpl,
             commonServices, commonSettings, commonTranslations, commonLoader, commonUI) {

      model = { // THE MODEL
          reservationFormSubmitted: false,
          requestLanguage: null,
          configuration: null,
          shoppingCart: null,

          loadSettings: function() {
            commonSettings.loadSettings(function(data){
              model.configuration = data;
              view.init();
            });
          },  

          putShoppingCartFreeAccessId: function(value) {
            sessionStorage.setItem('activities_shopping_cart_free_access_id', value);
          },

          getShoppingCartFreeAccessId: function() {
            return sessionStorage.getItem('activities_shopping_cart_free_access_id');
          },


          loadShoppingCart: function() {
              
              var url = commonServices.URL_PREFIX + '/api/booking-activities/frontend/shopping-cart';             
              var freeAccessId = this.getShoppingCartFreeAccessId();
              if (freeAccessId) {
                url += '/' + freeAccessId;
              }
              // == Url params
              var urlParams = null;
              // Language
              if (this.requestLanguage != null) {
                 urlParams = '?lang='+this.requestLanguage;
              }
              // Api Key
              if (commonServices.apiKey && commonServices.apiKey != '') {
                if (urlParams == null) {
                  urlParams = '?';
                }
                else {
                  urlParams += '&';
                }
                urlParams += 'api_key='+commonServices.apiKey;
              } 
              if (urlParams != null) {
                  url += urlParams;
              }
              // == Ajax
              $.ajax({
                  type: 'GET',
                  url: url,
                  contentType: 'application/json; charset=utf-8',
                  crossDomain: true,
                  success: function (data, textStatus, jqXHR) {
                      model.shoppingCart = data;
                      view.updateShoppingCart();
                  },
                  error: function (data, textStatus, jqXHR) {
                      alert('Error cargando datos');
                  }
              });
          },

          removeShoppingCartItem: function(date, time, itemId) {

              // Request
              var request = {date: date, time: time, item_id: itemId};
              var requestJSON = JSON.stringify(request);

              // URL
              var url = commonServices.URL_PREFIX + '/api/booking-activities/frontend/remove-from-shopping-cart';             
              var freeAccessId = this.getShoppingCartFreeAccessId();
              if (freeAccessId) {
                url += '/' + freeAccessId;
              }
              // == Url params
              var urlParams = [];
              
              // Language
              if (this.requestLanguage != null) {
                 urlParams.push('lang='+this.requestLanguage);
              }
              // Api Key
              if (commonServices.apiKey && commonServices.apiKey != '') {
                urlParams.push('api_key='+commonServices.apiKey);
              } 
              if (urlParams != null) {
                  url += '?';
                  url += urlParams.join('&');
              }
              
              // == Ajax
              $.ajax({
                 type: 'POST',
                 url: url,
                 data: requestJSON,
                 dataType: 'json',
                 crossDomain: true,
                 success: function(data, textStatus, jqXHR) {
                     model.shoppingCart = data;
                     view.updateShoppingCart();
                 },
                 error: function (data, textStatus, jqXHR) {
                     alert('Error actualizando datos');
                 },
                 beforeSend: function(jqXHR) {
                     commonLoader.show();
                 },
                 complete: function(jqXHR, textStatus) {
                     commonLoader.hide();
                 }
              });


          },

          createOrder: function() { // It creates an order from the shopping cart

              // Request object
              var order = $('form[name=reservation_form]').formParams(false);
              // Prepare phone prefix
              if ($('#customer_phone').length) {
                var countryData = $('#customer_phone').intlTelInput('getSelectedCountryData');
                if (countryData != null) {
                  order.customer_phone_prefix = countryData.dialCode;
                }
              }
              if ($('#customer_mobile_phone').length) {
                var countryData = $('#customer_mobile_phone').intlTelInput('getSelectedCountryData');
                if (countryData != null) {
                  order.customer_mobile_phone_prefix = countryData.dialCode;
                }
              }
              var orderJSON = JSON.stringify(order);
              var paymentMethod = order.payment;
              var paymentAmount = null;
              if (model.shoppingCart.can_pay_deposit) {
                paymentAmount = 'deposit';
              }
              else if (model.shoppingCart.can_pay_total) {
                paymentAmount = 'total';
              }

              // URL
              var url = commonServices.URL_PREFIX + '/api/booking-activities/frontend/create-order';             
              var freeAccessId = this.getShoppingCartFreeAccessId();
              if (freeAccessId) {
                url += '/' + freeAccessId;
              }
              // == Url params
              var urlParams = [];

              // Language
              if (this.requestLanguage != null) {
                 urlParams.push('lang='+this.requestLanguage);
              }
              // Api Key
              if (commonServices.apiKey && commonServices.apiKey != '') {
                urlParams.push('api_key='+commonServices.apiKey);
              } 
              if (urlParams.length > 0) {
                  url += '?';
                  url += urlParams.join('&');
              }
              // == Ajax
              $.ajax({
                  type: 'POST',
                  url : url,
                  data: orderJSON,
                  dataType : 'json',
                  contentType : 'application/json; charset=utf-8',
                  crossDomain: true,
                  success: function(data, textStatus, jqXHR) {

                      var orderId = data;
                      if (paymentMethod == 'none') {
                          window.location.href = commonServices.orderUrl + '?id=' + orderId;
                      }
                      else {
                          $.form(commonServices.URL_PREFIX + '/reserva-actividades/pagar', {id: orderId,
                                                                                            payment: paymentAmount,
                                                                                            payment_method_id: paymentMethod},
                                 'POST').submit();
                      }
                  },
                  error: function(data, textStatus, jqXHR) {
                      // Allow to send the form again
                      $('form[name=reservation_form] button[type=submit]').removeAttr('disabled');
                      model.reservationFormSubmitted = false;
                      // Show message
                      alert(i18next.t('complete.createReservation.error'));
                  },
                  beforeSend: function(jqXHR) {
                       commonLoader.show();
                  },
                  complete: function(jqXHR, textStatus) {
                       commonLoader.hide();
                  }
              });

          }

      };

      controller = { // THE CONTROLLER

          /**
           *  Remove shopping cart item button click
           */ 
          removeShoppingCartItemButtonClick: function(date, time, itemId) {

              model.removeShoppingCartItem(date, time, itemId);

          },

          /**
           * Complete action (pay_now or request_reservation) changed
           */ 
          completeActionChange: function() {
              
              if ($('input[name=complete_action]:checked').val() === 'pay_now') {
                $('#request_reservation_container').hide();
                $('#payment_on_delivery_container').hide();
                $('#payment_now_container').show();
                // Only one payment method accepted
                if ($('#payment_method_value').length) {
                  var paymentMethod = $('#payment_method_value').val();
                  view.setPaymentMethod(paymentMethod);
                }
                // More than one payment methods accepted
                if ($('input[name=payment_method_select]').length > 0) {
                  view.setupMultiplePaymentMethods();
                }
              }
              else if ($('input[name=complete_action]:checked').val() === 'request_reservation') {
                view.setPaymentMethod('none');
                // Clear the selected option
                if ($('input[name=payment_method_select]').length > 0) {
                  $('input[name=payment_method_select]').prop('checked', false);
                }
                $('#request_reservation_container').show();
                $('#payment_on_delivery_container').hide();
                $('#payment_now_container').hide();
              }

          },

          /**
           * Change multiple payment methods
           */
          paymentMethodSelectChange: function() {
            var paymentMethod = $('input[name=payment_method_select]:checked').val();
            console.log(paymentMethod);
            view.setPaymentMethod(paymentMethod);
          }


      };

      view = { // THE VIEW

          init: function() {

              model.requestLanguage = commonSettings.language(document.documentElement.lang);

              // Initialize i18next for translations
              i18next.init({  
                              lng: model.requestLanguage,
                              resources: commonTranslations
                           }, 
                           function (error, t) {
                           });

              model.loadShoppingCart();

          },

          setupEvents: function() {

              $('#accept').bind('click', function(){
                  //controller.conditionsReadClick();
              });

              $('.btn-delete-shopping-cart-item').bind('click', function () {
                  controller.removeShoppingCartItemButtonClick($(this).attr('data-date'),
                      $(this).attr('data-time'),
                      $(this).attr('data-item-id'));
              });              

          },

          setupValidation: function() {

              this.setupReservationFormValidation();

          },

          setupReservationFormValidation: function() {

              $('form[name=reservation_form]').validate(
                  {

                      submitHandler: function(form) {
                        console.log('SHOPPING-CART - submit');
                        if (!model.reservationFormSubmitted) {
                          model.reservationFormSubmitted = true;                        
                          // Disable submit to avoid double click
                          $('form[name=reservation_form] button[type=submit]').attr('disabled', 'disabled');
                          // Hide errors
                          $('#reservation_error').hide();
                          $('#reservation_error').html('');
                          // Create order from the shopping cart
                          model.createOrder();
                        }
                        return false;
                      },

                      invalidHandler : function (form, validator) {
                          console.log('SHOPPING-CART - invalidHandler');
                          // Enable submit again
                          $('form[name=reservation_form] button[type=submit]').removeAttr('disabled');
                          model.reservationFormSubmitted = false; 
                          // Show errors                        
                          $('#reservation_error').html(i18next.t('activities.checkout.errors'));
                          $('#reservation_error').show();
                      },

                      rules : {

                          'customer_name': 'required',
                          'customer_surname' : 'required',
                          'customer_email' : {
                              required: true,
                              email: true
                          },
                          'customer_email_confirmation': {
                              required: true,
                              email: true,
                              equalTo : 'customer_email'
                          },
                          'customer_phone': {
                              required: true,
                              minlength: 9
                          },
                          'payment_method_value': {
                              required: 'input[name=payment_method_value]:visible'
                          },
                          'payment_method_select': {
                              required: 'input[name=payment_method_select]:visible'
                          },
                          'conditions_read_request_reservation' :  {
                              required: '#conditions_read_request_reservation:visible'
                          },
                          'conditions_read_payment_on_delivery' :  {
                              required: '#conditions_read_payment_on_delivery:visible'
                          },
                          'conditions_read_pay_now' :  {
                              required: '#conditions_read_pay_now:visible'
                          },    
                      },

                      messages : {

                          'customer_name': i18next.t('activities.checkout.validations.customerNameRequired'),
                          'customer_surname' : i18next.t('activities.checkout.validations.customerSurnameRequired'),
                          'customer_email' : {
                              required: i18next.t('activities.checkout.validations.customerEmailRequired'),
                              email: i18next.t('activities.checkout.validations.customerEmailInvalidFormat')
                          },
                          'customer_email_confirmation': {
                              'required': i18next.t('activities.checkout.validations.customerEmailConfirmationRequired'),
                              email: i18next.t('activities.checkout.validations.customerEmailInvalidFormat'),
                              'equalTo': i18next.t('activities.checkout.validations.customerEmailConfirmationEqualsEmail')
                          },
                          'customer_phone': {
                              'required': i18next.t('activities.checkout.validations.customerPhoneNumberRequired'),
                              'minlength': i18next.t('activities.checkout.validations.customerPhoneNumberMinLength')
                          },
                          'payment_method_value': {
                              required: i18next.t('activities.checkout.validations.selectPaymentMethod')
                          },
                          'payment_method_select': {
                              required: i18next.t('activities.checkout.validations.selectPaymentMethod')
                          },
                          'conditions_read_request_reservation': {
                              'required': i18next.t('activities.checkout.validations.conditionsReadRequired')
                          },                       
                          'conditions_read_payment_on_delivery': {
                              'required': i18next.t('activities.checkout.validations.conditionsReadRequired')
                          },   
                          'conditions_read_pay_now': {
                              'required': i18next.t('activities.checkout.validations.conditionsReadRequired')
                          }   

                      },

                      errorPlacement: function (error, element) {

                          if (element.attr('name') == 'conditions_read_request_reservation' || 
                              element.attr('name') == 'conditions_read_payment_on_delivery' ||
                              element.attr('name') == 'conditions_read_pay_now') {
                              error.insertAfter(element.parent());
                          }
                          else if (element.attr('name') === 'payment_method_value' || 
                                   element.attr('name') === 'payment_method_select') {
                              error.insertAfter(document.getElementById('payment_method_select_error'));
                          }
                          else
                          {
                              error.insertAfter(element);
                          }

                      },

                      errorClass : 'form-reservation-error'

                  }
              );

          },

          updateShoppingCart: function() { /* Update the shopping cart */
              $('#reservation_container').empty();
              $('#payment_detail').empty();
              if (model.shoppingCart && model.shoppingCart.items &&
                  !$.isEmptyObject(model.shoppingCart.items)) {
                  this.updateReservationForm();
                  this.updateShoppingCartProducts();
                  this.updatePayment();
                  this.setupValidation();
                  this.setupEvents();
              }
              else {
                  this.updateShoppingCartEmpty();
              }
          },

          updateShoppingCartEmpty: function() {
              var shoppingCartEmptyHtml = tmpl('script_shopping_cart_empty');
              $('#selected_products').html(shoppingCartEmptyHtml);
          },

          updateShoppingCartProducts: function() { /* Update the shopping cart products */
              var productInfo = tmpl('script_products_detail')(
                  {shopping_cart: model.shoppingCart,
                   configuration: model.configuration});
              $('#selected_products').html(productInfo);
          },

          updateReservationForm: function() { /* Update the reservation form */
              var customerForm = tmpl('script_reservation_form',{language: model.requestLanguage});
              $('#reservation_container').html(customerForm);

              // Configure Telephone with prefix
              var countryCode = commonUI.intlTelInputCountryCode();

              if ($('#customer_phone').length) {
                $("#customer_phone").intlTelInput({
                  initialCountry: countryCode,
                  separateDialCode: true,
                  utilsScript: commonServices.phoneUtilsPath,
                  preferredCountries: [countryCode]
                });
              }

              if ($('#customer_mobile_phone').length) {
                $("#customer_mobile_phone").intlTelInput({
                  initialCountry: countryCode,
                  separateDialCode: true,
                  utilsScript: commonServices.phoneUtilsPath,
                  preferredCountries: [countryCode]
                });
              }

          },

          updatePayment: function() { /* Update the payment */


               // Check :
               //
               // 1 - If the reservation can be paid
               // 2 - The payment amount
               // 3 - If can request and pay
               //

               var canPay = (model.shoppingCart.can_pay_deposit || model.shoppingCart.can_pay_total);
               var paymentAmount = 0;
               var selectionOptions = 0;

               if (model.shoppingCart.can_make_request) {
                 selectionOptions += 1;
               }

               if (canPay) {
                 selectionOptions += 1;
                 if (model.shoppingCart.can_pay_deposit) {
                    paymentAmount = model.shoppingCart.deposit_payment_amount;
                 }
                 else {
                    paymentAmount = model.shoppingCart.total_payment_amount;
                 }           
               }

               var canRequestAndPay = (selectionOptions > 1);

              // Payment template

              var paymentInfo = tmpl('script_payment_detail', {shopping_cart: model.shoppingCart,
                                                               canPay: canPay,
                                                               paymentAmount: paymentAmount,
                                                               canRequestAndPay: canRequestAndPay,
                                                               i18next: i18next,
                                                               configuration: model.configuration});
              $('#payment_detail').html(paymentInfo);

              // == Setup payment events

              // -- Multiple options for complete a request => Make a request and pay
              if ( $('input[name=complete_action]').length > 0 ) {
                $('input[name=complete_action]').on('click', function() {
                   controller.completeActionChange();
                });
              }
              else {
                // -- Only one option => maker a request or pay 
                if ($('input[name=payment_method_select]').length > 0) {
                  this.setupMultiplePaymentMethods();
                }
              }

          },

          setupMultiplePaymentMethods: function() {

            $('input[name=payment_method_select]').off('change');
            $('input[name=payment_method_select]').on('change', function(){
              controller.paymentMethodSelectChange();
            });

          },

          /**
           * Set the payment method
           */
          setPaymentMethod: function(value) {
            $('input[name=payment]').val(value);
          }

      };

      model.loadSettings();


    }
);