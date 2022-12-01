define('ActivityOneTime', ['jquery','ysdtemplate',
                           'commonServices', 'commonSettings', 'commonTranslations', 
                           'moment', 'i18next', 'jquery.ui', 'jquery.validate', 'jquery.i18next'],
    function($,  tmpl, commonServices, commonSettings, commonTranslations, moment, i18next) {

        var activityOneTimeModel = { // THE activityOneTimeModel

            requestLanguage: null,
            configuration: null,
            id: null,
            activity: null,
            tickets: null,
            buyTickets: null,

            loadActivity: function () { /* Load the activity */
                var url = commonServices.URL_PREFIX + '/api/booking-activities/frontend/activities/'+activityOneTimeModel.id;
                // == Url params
                var urlParams = null;
                // Language
                if (activityOneTimeModel.requestLanguage != null) {
                   urlParams = '?lang='+activityOneTimeModel.requestLanguage;
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
                        activityOneTimeModel.activity = data;
                        activityOneTimeView.updateActivity();
                    },
                    error: function (data, textStatus, jqXHR) {
                        alert(i18next.t('activities.common.errorLoadingData'));
                    },
                    complete: function (jqXHR, textStatus) {
                    }

                });
            },

            loadTickets: function() { /* Load the available tickets */

                var url = commonServices.URL_PREFIX + '/api/booking-activities/frontend/activities/'+this.activity.id+'/tickets';
                // == Url params
                var urlParams = null;
                // Language
                if (activityOneTimeModel.requestLanguage != null) {
                   urlParams = '?lang='+activityOneTimeModel.requestLanguage;
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
                        activityOneTimeModel.tickets = data;
                        activityOneTimeView.updateTickets();
                    },
                    error: function (data, textStatus, jqXHR) {
                        alert(i18next.t('activities.common.errorLoadingData'));
                    },
                    complete: function (jqXHR, textStatus) {
                    }
                });


            },

            putShoppingCartFreeAccessId: function(value) {
              sessionStorage.setItem('activities_shopping_cart_free_access_id', value);
            },

            getShoppingCartFreeAccessId: function() {
              return sessionStorage.getItem('activities_shopping_cart_free_access_id');
            },

            addToShoppingCart: function() {

                var request =  {
                                  id: this.activity.id,
                                  tickets: this.buyTickets
                               };
                
                var requestJSON = encodeURIComponent(JSON.stringify(request));

                var url = commonServices.URL_PREFIX + '/api/booking-activities/frontend/add-to-shopping-cart';
                
                var freeAccessId = this.getShoppingCartFreeAccessId();
                if (freeAccessId) {
                  url += '/' + freeAccessId;
                }
                // == Url params
                var urlParams = null;
                // Language
                if (activityOneTimeModel.requestLanguage != null) {
                   urlParams = '?lang='+activityOneTimeModel.requestLanguage;
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
                    type: 'POST',
                    url : url,
                    data: requestJSON,
                    dataType : 'json',
                    contentType : 'application/json; charset=utf-8',
                    crossDomain: true,
                    success: function(data, textStatus, jqXHR) {

                         // Store the shopping cart free access id in the session
                         var free_access_id = activityOneTimeModel.getShoppingCartFreeAccessId();
                         if (free_access_id == null || free_access_id != data.free_access_id) {
                           activityOneTimeModel.putShoppingCartFreeAccessId(data.free_access_id);
                         }

                         window.location.href = commonServices.shoppingCartUrl; 
                    },
                    error: function(data, textStatus, jqXHR) {
                        alert(i18next.t('activities.common.errorUpdatingData'));
                    },
                    complete: function(jqXHR, textStatus) {

                    }

                });

            },

        };

       var  activityOneTimeController = { // THE activityOneTimeController

            onBtnReservationClick: function() { /* Button reservation click */

              var selectedTickets = false;
              activityOneTimeModel.buyTickets = {};

              if ( $('select[name=selected_tickets_full_mode]').length > 0 ) {
                var rate = $('select[name=selected_tickets_full_mode]').val();;
                var value = (rate == '' ? 0 : 1);
                if (value > 0) {
                  selectedTickets = true;
                  activityOneTimeModel.buyTickets[rate] = value;
                }
              }
              else {
                var quantityRate = $('select.quantity_rate, input[type=hidden].quantity_rate');
                for (idx=0; idx<quantityRate.length; idx++) {
                   var rate = parseInt($(quantityRate[idx]).attr('name').replace('quantity_rate_',''));
                   var value = parseInt($(quantityRate[idx]).val());
                   if (value > 0) {
                       selectedTickets = true;
                       activityOneTimeModel.buyTickets[rate] = value;
                   }
                }
              }

              if (!selectedTickets) {
                  alert(i18next.t('activities.calendarWidget.selectTickets'));
              }
              else {
                  activityOneTimeModel.addToShoppingCart();
              }

            }


        };


        var activityOneTimeView = { // THE activityOneTimeView

            init: function() {

                activityOneTimeModel.requestLanguage = commonSettings.language(document.documentElement.lang);
                // Initialize i18next for translations
                i18next.init({  
                                lng: activityOneTimeModel.requestLanguage,
                                resources: commonTranslations
                             }, 
                             function (error, t) {
                                // https://github.com/i18next/jquery-i18next#initialize-the-plugin
                                //jqueryI18next.init(i18next, $);
                                // Localize UI
                                //$('.nav').localize();
                             });
                activityOneTimeView.updateActivity();

            },

            updateActivity: function() { // Update the activity (shows it)

                var result = tmpl('script_one_time_selector')({activity: activityOneTimeModel.activity, i18next: i18next});
                $('#buy_selector').html(result);
                if (activityOneTimeModel.activity && typeof activityOneTimeModel.activity.available !== 'undefined') {
                  if (activityModel.activity.available != 0) {
                    activityOneTimeModel.loadTickets();
                  }
                }

            },

            updateTickets: function() { /* Setup the tickets */

                // Builds the tickets
                if (activityOneTimeModel.activity &&
                    activityOneTimeModel.activity.allow_select_places_for_reservation) {
                  var result = tmpl('script_tickets')({tickets: activityOneTimeModel.tickets});
                }
                else {
                  var result = tmpl('script_fixed_ticket')({tickets: activityOneTimeModel.tickets});
                }
                $('#tickets').html(result);

                $('#btn_reservation').bind('click', function(){
                   activityOneTimeController.onBtnReservationClick();
                });
            }



        };

        var ActivityOneTime = function(activity, configuration) {

          this.model = activityOneTimeModel;
          this.controller = activityOneTimeController;
          this.view = activityOneTimeView;

          this.model.activity = activity;
          this.model.configuration = configuration;
          
        };

        return ActivityOneTime;


    });
