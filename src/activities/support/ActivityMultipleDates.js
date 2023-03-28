define('ActivityMultipleDates',['jquery','ysdtemplate', 'YSDRemoteDataSource','YSDSelectSelector',
                                'commonServices', 'commonSettings', 'commonTranslations', 'i18next',                       
                                'jquery.ui', 'jquery.validate', 'jquery.i18next'],
    function($,  tmpl, RemoteDataSource, SelectSelector, commonServices, commonSettings, commonTranslations, i18next) {

        var activityMultipleDatesModel = { // THE activityMultipleDatesModel

            requestLanguage: null,
            configuration: null,
            activity: null,
            activity_dates: null,
            tickets: null,
            buyTickets: null,
            multipleDatesActivityDateId: null,


            loadActivityDates: function() { /** Load the activity dates **/

                var url = commonServices.URL_PREFIX + '/api/booking-activities/frontend/activities/'+activityMultipleDatesModel.activity.id+'/dates';
                // == Url params
                var urlParams = [];
                // Language
                if (activityMultipleDatesModel.requestLanguage != null) {
                    urlParams.push('lang='+activityMultipleDatesModel.requestLanguage);
                }
                // Api Key
                if (commonServices.apiKey && commonServices.apiKey != '') {
                  urlParams.push('api_key='+commonServices.apiKey);
                }  
                // Parameters
                if (urlParams.length > 0) {
                  url += '?';
                  url += urlParams.join('&');
                }

                $.ajax({
                    type: 'GET',
                    url: url,
                    contentType: 'application/json; charset=utf-8',
                    crossDomain: true,
                    success: function (data, textStatus, jqXHR) {
                        activityMultipleDatesModel.activity_dates = data;
                        activityMultipleDatesView.updateActivityDates();
                    },
                    error: function (data, textStatus, jqXHR) {
                        alert(i18next.t('activities.common.errorLoadingData'));
                    },
                    complete: function (jqXHR, textStatus) {
                    }

                });

            },

            loadTickets: function() { /* Load the available tickets */

                var url = commonServices.URL_PREFIX + '/api/booking-activities/frontend/activities/' + this.activity.id + '/tickets';
                url += '?activity_date_id='+this.multipleDatesActivityDateId;
                // Language
                if (activityMultipleDatesModel.requestLanguage != null) {
                    url += '&lang='+activityMultipleDatesModel.requestLanguage;
                }
                // Api Key
                if (commonServices.apiKey && commonServices.apiKey != '') {
                  url += '&api_key='+commonServices.apiKey;
                }    

                $.ajax({
                    type: 'GET',
                    url: url,
                    contentType: 'application/json; charset=utf-8',
                    crossDomain: true,
                    success: function (data, textStatus, jqXHR) {
                        activityMultipleDatesModel.tickets = data;
                        activityMultipleDatesView.updateTickets();
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

                var request = {
                        id: this.activity.id,
                        activity_date_id: this.multipleDatesActivityDateId,
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
                if (activityMultipleDatesModel.requestLanguage != null) {
                   urlParams = '?lang='+activityMultipleDatesModel.requestLanguage;
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
                         var free_access_id = activityMultipleDatesModel.getShoppingCartFreeAccessId();
                         if (free_access_id == null || free_access_id != data.free_access_id) {
                           activityMultipleDatesModel.putShoppingCartFreeAccessId(data.free_access_id);
                         }

                         window.location.href = commonServices.shoppingCartUrl; 
                    },
                    error: function(data, textStatus, jqXHR) {
                        alert(i18next.t('activities.common.errorUpdatingData'));
                    },
                    complete: function(jqXHR, textStatus) {

                    }

                });

            }
        };

        var activityMultipleDatesController = { // THE activityMultipleDatesController

            onMultipleDatesDateSelected: function() { /* Multiple dates select date */
              activityMultipleDatesModel.multipleDatesActivityDateId = $('#activity_date_id').val();
              activityMultipleDatesModel.loadTickets();
            },

            onBtnReservationClick: function() { /* Button reservation click */

              var selectedTickets = false;
              activityMultipleDatesModel.buyTickets = {};

              if ( $('select[name=selected_tickets_full_mode]').length > 0 ) {
                var rate = $('select[name=selected_tickets_full_mode]').val();;
                var value = (rate == '' ? 0 : 1);
                if (value > 0) {
                  selectedTickets = true;
                  activityMultipleDatesModel.buyTickets[rate] = value;
                }
              }
              else {
                var quantityRate = $('select.quantity_rate, input[type=hidden].quantity_rate');
                for (var idx=0; idx<quantityRate.length; idx++) {
                   var rate = parseInt($(quantityRate[idx]).attr('name').replace('quantity_rate_',''));
                   var value = parseInt($(quantityRate[idx]).val());
                   if (value > 0) {
                       selectedTickets = true;
                       activityMultipleDatesModel.buyTickets[rate] = value;
                   }
                }
              }

              if (!selectedTickets) {
                  alert(i18next.t('activities.calendarWidget.selectTickets'));
              }
              else {
                  activityMultipleDatesModel.addToShoppingCart();
              }

            }


        };


        var activityMultipleDatesView = { // THE activityMultipleDatesView

            init: function() {

                activityMultipleDatesModel.requestLanguage = commonSettings.language(document.documentElement.lang);
                // Initialize i18next for translations
                i18next.init({  
                                lng: activityMultipleDatesModel.requestLanguage,
                                resources: commonTranslations
                             }, 
                             function (error, t) {
                                // https://github.com/i18next/jquery-i18next#initialize-the-plugin
                                //jqueryI18next.init(i18next, $);
                                // Localize UI
                                //$('.nav').localize();
                             });
                activityMultipleDatesView.updateActivity();

            },

            updateActivity: function() { // Update the activity (shows it)

                // Builds the list
                var result = tmpl('script_multiple_dates_selector')({activity: activityMultipleDatesModel.activity});
                $('#buy_selector').html(result);
                // Load the activity dates
                activityMultipleDatesModel.loadActivityDates();

            },

            updateActivityDates: function() { /** Update activity dates **/ 

                console.log('updateActivityDates');

                $('select[name=activity_date_id]').append($('<option>', {
                    value: '',
                    text : i18next.t('activities.multipleDates.selectDate'),
                    class: 'form-control'
                }));

                if (activityMultipleDatesModel.activity_dates != null) {
                  var classOption = null, text = null, optionData = null;
                  for (var date in activityMultipleDatesModel.activity_dates) {  
                    classOption = 'form-control';
                    text = activityMultipleDatesModel.activity_dates[date].description
                    optionData = { value: activityMultipleDatesModel.activity_dates[date].id
                                 };
                    if (activityMultipleDatesModel.activity_dates[date].available == 0) {
                        classOption += ' bg-danger';
                        optionData.disabled = 'disabled';
                        text += ' ( ';
                        text += i18next.t('activities.calendarWidget.fullPlaces'); 
                        text += ' )';
                    } 
                    else if (activityMultipleDatesModel.activity_dates[date].available == 2) {
                        classOption += ' bg-warning';
                        if (activityMultipleDatesModel.activity.allow_select_places_for_reservation) {
                            text += ' ( ';
                            text += i18next.t('activities.calendarWidget.fewPlacesWarning');
                            text += ' )';
                        }
                        else {
                            text += ' ( ';
                            text += i18next.t('activities.calendarWidget.fewNoPlacesWarning');
                            text += ' )';            
                        }
                    }
                    optionData.class = classOption;     
                    optionData.text = text;
                    $('select[name=activity_date_id]').append($('<option>', optionData));                    
                  }
                  $('#activity_date_id').val('');
                }

                $('#activity_date_id').bind('change', function() {
                    if ($(this).val() != '') {
                        activityMultipleDatesController.onMultipleDatesDateSelected();
                    }
                    else {
                        $('#tickets').empty();
                    }
                });

            },

            updateTickets: function() { /* Setup the tickets */

                // Builds the tickets
                if (activityMultipleDatesModel.activity &&
                    activityMultipleDatesModel.activity.allow_select_places_for_reservation) {
                  var result = tmpl('script_tickets')({tickets: activityMultipleDatesModel.tickets});
                }
                else {
                  var result = tmpl('script_fixed_ticket')({tickets: activityMultipleDatesModel.tickets});
                }

                $('#tickets').html(result);
                $('#btn_reservation').bind('click', function(){
                   activityMultipleDatesController.onBtnReservationClick();
                });
            }



        };

        var ActivityMultipleDates = function(activity, configuration) {

          this.model = activityMultipleDatesModel;
          this.controller = activityMultipleDatesController;
          this.view = activityMultipleDatesView;

          this.model.activity = activity;
          this.model.configuration = configuration;
        };

        return ActivityMultipleDates;


    });
