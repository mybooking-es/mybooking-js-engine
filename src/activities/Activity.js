require(['jquery','i18next',
				 'commonServices', 'commonSettings', 'commonTranslations',
				 './support/ActivityOneTime','./support/ActivityMultipleDates','./support/ActivityCyclic',
				 'moment'],
	      function($, i18next, commonServices, commonSettings, commonTranslations,
	      				 ActivityOneTime, ActivityMultipleDates, ActivityCyclic,
	      				 moment) {

  activityModel = {

    requestLanguage: null,
    id: null,
    activity: null,
    configuration: null,

    // -------------- Load settings ----------------------------

    loadSettings: function() {
      console.log('Load Settings');
      commonSettings.loadSettings(function(data){
        activityModel.configuration = data;
        activityView.init();
      });
    },  

    loadActivity: function (id) { /* Load the activity */
        console.log('loadActivity:'+id);
        this.id = id;
        // Build URL
        var url = commonServices.URL_PREFIX + '/api/booking-activities/frontend/activities/' + this.id;
        var urlParams = [];
        if (this.requestLanguage != null) {
          urlParams.push('lang='+this.requestLanguage);
        }
        if (commonServices.apiKey && commonServices.apiKey != '') {
          urlParams.push('api_key='+commonServices.apiKey);
        } 
        if (urlParams.length > 0) {
          url += '?';
          url += urlParams.join('&');
        }
        // Request
        $.ajax({
            type: 'GET',
            url: url,
            contentType: 'application/json; charset=utf-8',
            crossDomain: true,
            success: function (data, textStatus, jqXHR) {
                activityModel.activity = data;
                activityView.updateActivity();
            },
            error: function (data, textStatus, jqXHR) {
                alert('Error obteniendo la información');
            },
            complete: function (jqXHR, textStatus) {
            }

        });
    },

  };

  activityController = {

  };

  activityView = {

  	init: function() {

      activityModel.requestLanguage = commonSettings.language(document.documentElement.lang);
      activityModel.loadActivity($('#buy_selector').attr('data-id'));

  	},

  	updateActivity: function() {

  		switch (activityModel.activity.occurence) {

  			case 'one_time':
  			  var c = new ActivityOneTime(activityModel.activity, activityModel.configuration);
  			  c.view.init();		
  				break;

  			case 'multiple_dates':
  			  var c = new ActivityMultipleDates(activityModel.activity, activityModel.configuration);
  			  c.view.init();			
  			  break;

  			case 'cyclic':
  			  var c = new ActivityCyclic(activityModel.activity, 
                                     activityModel.configuration,   
  			  													 moment().month() + 1, 
  			  													 moment().year());
  			  c.view.init();			
  			  break;

  		}


  	}

  };

  // Check the buy selector and its data-id attribute
  if ($('#buy_selector').length && $('#buy_selector').attr('data-id') != 'undefined') {
    console.log('Init Activity')
    activityModel.loadSettings();
  }

});