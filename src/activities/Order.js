require(['jquery', 'i18next', 'ysdtemplate', 'YSDMemoryDataSource','YSDSelectSelector', 'select2',
        'commonServices', 'commonSettings', 'commonTranslations', 'commonLoader',
        'jquery.validate', 'jquery.ui', 'jquery.ui.datepicker-es',
        'jquery.ui.datepicker.validation','jquery.form'],
    function($, i18next, tmpl, MemoryDataSource, SelectSelector, select2,
             commonServices, commonSettings, commonTranslations, commonLoader) {

        model = { // THE MODEL

            requestLanguage: null,
            configuration: null,
            orderFreeAccessId: null,
            order: null,
            sales_process: null,

            /**
             * Load settings
             */
            loadSettings: function() {
                commonSettings.loadSettings(function(data){
                  model.configuration = data;
                  view.init();
                });
            },  

            // ------------ Product information detail ------------------------

            getUrlVars : function() {
              var vars = [], hash;
              var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
              for(var i = 0; i < hashes.length; i++) {
                hash = hashes[i].split('=');
                vars.push(hash[0]);
                vars[hash[0]] = hash[1];
              }
              return vars;
            },

            extractVariables: function() { // Load variables from the request

              var url_vars = this.getUrlVars();
              this.orderFreeAccessId = decodeURIComponent(url_vars['id']);

            },

            // ----------------- Reservation ------------------------------

            getOrderFreeAccessId: function() { /* Get the order id */
              return sessionStorage.getItem('order_free_access_id');
            },

            setOrderFreeAccessId: function(orderFreeAccessId) { /* Set the order id */
              sessionStorage.setItem('order_free_access_id', orderFreeAccessId);
            },

            /**
             * Load the reservation
             */
            loadOrder: function() { 

               var orderId = this.orderFreeAccessId;

               if (orderId == '') {
                 orderId = this.orderFreeAccessId = this.getOrderFreeAccessId();
               }

               // Build the URL
               var url = commonServices.URL_PREFIX + '/api/booking-activities/frontend/order/' + orderId;
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

               // Action to the URL
               $.ajax({
                       type: 'GET',
                       url : url,
                       dataType : 'json',
                       contentType : 'application/json; charset=utf-8',
                       crossDomain: true,
                       success: function(data, textStatus, jqXHR) {

                         if (model.requestLanguage != data.customer_language &&
                             data.customer_language != null &&
                             data.customer_language != '') {
                           window.location.href = data.customer_language + commonServices.orderUrl.startsWith('/') ? '' : '/' +
                                                  commonServices.orderUrl + '?id=' + data.free_access_id;
                         }
                         else {
                           model.order = data;
                           view.updateOrder();
                         }

                       },
                       error: function(data, textStatus, jqXHR) {

                         alert(i18next.t('activities.common.errorLoadingData'));

                       },
                       complete: function(jqXHR, textStatus) {
                         commonLoader.hide();
                         $('#content').show();
                         $('#sidebar').show();
                       }
                  });
            },

            /**
             * Pay order
             */
            pay: function(paymentAmount, paymentMethodId) {
  
                var data = {id: this.orderFreeAccessId,
                            payment: paymentAmount,
                            payment_method_id: paymentMethodId};

                // Commit the form to connect mybooking            
                $.form(commonServices.URL_PREFIX + '/reserva-actividades/pagar', data, 'POST').submit();

            },
            /***
             * Update order
             */
            update: function() {

                var order = $('form[name=order_information_form]').formParams(false);
                var order_item_customers = order['order_item_customers'];
                delete order['order_item_customers'];
                order['order_item_customers'] = [];
                for (item in order_item_customers) {
                    if (typeof order_item_customers[item].customer_allergies != 'undefined') {
                      if (order_item_customers[item].customer_allergies == 'on') {
                        order_item_customers[item].customer_allergies = true;
                      }
                      else {
                        order_item_customers[item].customer_allergies = false;
                      }
                    }
                    if (typeof order_item_customers[item].customer_intolerances != 'undefined') {
                      if (order_item_customers[item].customer_intolerances == 'on') {
                        order_item_customers[item].customer_intolerances = true;
                      }
                      else {
                        order_item_customers[item].customer_intolerances = false;
                      }
                    }
                    if (typeof order_item_customers[item].customer_slight_injuries != 'undefined') {
                      if (order_item_customers[item].customer_slight_injuries == 'on') {
                        order_item_customers[item].customer_slight_injuries = true;
                      }
                      else {
                        order_item_customers[item].customer_slight_injuries = false;
                      }
                    }
                    if (typeof order_item_customers[item].customer_diseases != 'undefined') {
                      if (order_item_customers[item].customer_diseases == 'on') {
                        order_item_customers[item].customer_diseases = true;
                      }
                      else {
                        order_item_customers[item].customer_diseases = false;
                      }
                    }    
                    
                    if (typeof order_item_customers[item].customer_experience_tecnical_course != 'undefined') {
                      if (order_item_customers[item].customer_experience_tecnical_course == 'true') {
                        order_item_customers[item].customer_experience_tecnical_course = true;
                      }
                      else {
                        order_item_customers[item].customer_experience_tecnical_course = false;
                      }
                    }    
                    if (typeof order_item_customers[item].customer_experience_activities != 'undefined') {
                      if (order_item_customers[item].customer_experience_activities == 'true') {
                        order_item_customers[item].customer_experience_activities = true;
                      }
                      else {
                        order_item_customers[item].customer_experience_activities = false;
                      }
                    }                                     
                    order['order_item_customers'].push(order_item_customers[item]);
                }
                var orderJSON = encodeURIComponent(JSON.stringify(order));

                var url = commonServices.URL_PREFIX + '/api/booking-activities/frontend/order/' + this.orderFreeAccessId;
                
                // Language
                if (model.requestLanguage != null) {
                    url += '?lang='+model.requestLanguage;
                }
                // Api Key
                if (commonServices.apiKey && commonServices.apiKey != '') {
                  url += '&api_key='+commonServices.apiKey;
                } 

                $.ajax({
                    type: 'PUT',
                    url : url,
                    data: orderJSON,
                    dataType : 'json',
                    contentType : 'application/json; charset=utf-8',
                    crossDomain: true,
                    success: function(data, textStatus, jqXHR) {
                        model.order = data;
                        view.updateOrder();
                        view.update('order_updated');
                    },
                    error: function(data, textStatus, jqXHR) {
                        alert(i18next.t('activities.common.errorUpdatingData'));
                    }
                });

            },
           /***
            * Cancel reservation
            */
            cancelReservation: function() {

                var url = commonServices.URL_PREFIX + '/api/booking-activities/frontend/order/' + this.orderFreeAccessId+'/cancel';
                var urlParams = [];
                // Language
                if (model.requestLanguage != null) {
                   urlParams.push('lang='+model.requestLanguage);
                }
                // Api Key
                if (commonServices.apiKey && commonServices.apiKey != '') {
                   urlParams.push('api_key='+commonServices.apiKey);
                } 
                if (urlParams.length > 0) {
                  url += '?';
                  url += urlParams.join('&');
                }

                $.ajax({
                    type: 'POST',
                    url : url,
                    contentType : 'application/json; charset=utf-8',
                    crossDomain: true,
                    success: function(data, textStatus, jqXHR) {
                        model.order = data;
                        view.update('order_canceled')
                    },
                    error: function(data, textStatus, jqXHR) {
                        alert(i18next.t('activities.common.errorUpdatingData'));
                    }
                });

            }

        };

        controller = { // THE CONTROLLER

            /**
             * Update order button click
             */
            btnUpdateClick: function() {
                model.update();
            },

            /**
             * Cancel reservation button click
             */  
            btnCancelReservationClick: function(){
                if (confirm(i18next.t('activities.myReservation.cancelReservationConfirm'))) {
                  model.cancelReservation();
                }
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

                // Setup UI          
                model.extractVariables();
                commonLoader.show();
                model.loadOrder();
            },

            updateOrder: function() {

              // Check if the order can be paid
              var canPay = (model.order.can_pay_deposit || model.order.can_pay_pending || model.order.can_pay_total);
              var paymentAmount = 0;
              var payment = null;
              if (canPay) {
                if (model.order.can_pay_deposit) {
                   paymentAmount = model.order.deposit_payment_amount;
                   payment = 'deposit';
                }
                else if (model.order.can_pay_pending) {
                  paymentAmount = model.order.pending_payment_amount;
                  payment = 'pending';
                }
                else {
                   paymentAmount = model.order.total_payment_amount;
                   payment = 'total';
                }           
              }

              // Build the template
              var reservationInfo = tmpl('script_order')(
                  {canPay: canPay,
                   paymentAmount: paymentAmount, 
                   payment: payment,
                   i18next: i18next,
                   order: model.order, 
                   configuration: model.configuration});
              $('#reservation_detail').html(reservationInfo);
              // Load countries
              var countries = i18next.t('common.countries', {returnObjects: true });
              if (countries instanceof Object) {
                var countryCodes = Object.keys(countries);
                var countriesArray = countryCodes.map(function(value){ 
                                        return {id: value, text: countries[value], description: countries[value]};
                                     });
              } else {
                var countriesArray = [];
              }
              // Country selector
              if (commonServices.jsUseSelect2) {
                // Selector
                var $countrySelector = $('form[name=order_information_form] select[name=customer_address\\[country\\]]');
                if ($countrySelector.length > 0 && typeof model.order.address_country !== 'undefined') {
                  $countrySelector.select2({
                    width: '100%',
                    theme: 'bootstrap4',                  
                    data: countriesArray
                  });
                  if (model.order.address_country !== null && model.order.address_country !== '') {
                    $countrySelector.val(model.order.address_country);
                    $countrySelector.trigger('change');
                  }
                }
              } 
              else {
                if (document.getElementById('country')) {
                  var countriesDataSource = new MemoryDataSource(countriesArray);
                  var countryModel = model.order.address_country;
                  var selectorModel = new SelectSelector('country',
                      countriesDataSource, countryModel, true, i18next.t('myReservation.select_country'));
                }
              }

              this.setupEvents();

            },

            setupEvents: function() {
                // Upate order
                $('#btn_update_order').bind('click', function(){
                    controller.btnUpdateClick();
                });
                // Payment validation
                this.setupPaymentFormValidation();
                // Cancel reservation
                $('#btn_cancel_reservation').bind('click', function(){
                    controller.btnCancelReservationClick();
                });
            },

            setupPaymentFormValidation: function() {

                $('form[name=payment_form]').validate(
                  {

                      submitHandler: function(form) {
                          $('#payment_error').hide();
                          $('#payment_error').html('');
                          
                          // Payment amount
                          var paymentAmount = null;
                          if (model.order.can_pay_total) {
                            paymentAmount = 'total';
                          }
                          else if (model.order.can_pay_pending) {
                            paymentAmount = 'pending';
                          }
                          else if (model.order.can_pay_deposit) {
                             paymentAmount = 'deposit';
                          }                               
                          
                          // Payment method
                          var paymentMethod = null;
                          if ($('input[name=payment_method_value]').length == 1) { // Just 1 payment method
                            paymentMethod = $('input[name=payment_method_value]').val();
                          }
                          else { // Multiple payment methods
                            paymentMethod = $('input[name=payment_method_select]:checked').val();
                          }

                          // Do pay
                          if (paymentMethod && paymentAmount) {
                            model.pay(paymentAmount, paymentMethod);
                          }
                          return false;
                      },

                      invalidHandler : function (form, validator) {
                          $('#payment_error').html(i18next.t('activities.payment.errors'));
                          $('#payment_error').show();
                      },

                      rules : {

                          'payment_method_value': {
                              required: 'input[name=payment_method_value]:visible'
                           },
                          'payment_method_select': {
                              required: 'input[name=payment_method_select]:visible'
                           },

                      },

                      messages : {

                          'payment_method_value': i18next.t('activities.payment.paymentMethodNotSelected'),
                          'payment_method_select': i18next.t('activities.payment.paymentMethodNotSelected')

                      },

                      errorPlacement: function (error, element) {
                        if (element.attr('name') == 'payment_method_value')  {
                          error.insertBefore('#btn_pay');
                        }
                        else if (element.attr('name') == 'payment_method_select')  {
                          error.insertAfter(document.getElementById('payment_method_select_error'));
                        }
                        else {
                          error.insertAfter(element);
                        }
                      },

                      errorClass : 'form-reservation-error'

                  }
              );

            },

            update: function(action) {
                switch (action) {
                    case 'order_updated':
                        alert(i18next.t('activities.common.dataUpdateOk'));
                        break;
                    case 'order_canceled':
                        this.updateOrder();
                        alert(i18next.t('activities.common.dataUpdateOk'));
                        break;
                }
            }

        };

        model.loadSettings();

    });