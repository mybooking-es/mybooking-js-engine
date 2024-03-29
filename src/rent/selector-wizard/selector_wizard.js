define('selector_wizard', ['jquery', 'YSDMemoryDataSource', 'YSDRemoteDataSource','YSDSelectSelector',
         'commonServices','commonSettings',
         'commonTranslations', 'i18next', 'moment', 
         './selector_wizard_select_place', './selector_wizard_select_date', './selector_wizard_select_time', './selector_wizard_select_age',
         'ysdtemplate', 'customCookie',
         'jquery.i18next',
         'jquery.validate', 'jquery.ui', 'jquery.ui.datepicker-es',
         'jquery.ui.datepicker-en', 'jquery.ui.datepicker-ca', 'jquery.ui.datepicker-it',
         'jquery.ui.datepicker.validation'],
         function($, MemoryDataSource, RemoteDataSource, SelectSelector,commonServices, commonSettings, 
                  commonTranslations, i18next, moment, 
                  selectorWizardSelectPlace, selectorWizardSelectDate, selectorWizardSelectTime, SelectorWizardSelectAge,
                  tmpl, customCookie) {

  var selectorWizardModel = {

    // RequestLanguage
    requestLanguage: null,
    // Configuration
  	configuration: null, 

    minDateFrom: null,
    minDateTo: null,
    maxDateFrom: null,
    maxDateTo: null,
    minTimeTo: null,

    selectionData: {
    	pickupPlace: null,
      pickupPlaceDescription: null,
    	dateFrom: null,
    	timeFrom: null,
    	returnPlace: null,
      returnPlaceDescription: null,
    	dateTo: null,
    	timeTo: null,
      ageId: null,
      agentId: null,
      salesChannelCode: null,
      familyId: null,
      engineFixedFamily: false,
      rentalLocationCode: null,
      engineFixedRentaLocation: false
    },

    bodyOverflowY: null,

    // The shopping cart
    shoppingCart: null,

  }

  var selectorWizardController = {

  	placeHolderClick: function() {

  		selectorWizardView.update('show_wizard');

  	},

  	fromHolderClick: function() {

  		selectorWizardView.update('show_wizard');

  	},

  	toHolderClick: function() {

  		selectorWizardView.update('show_wizard');

  	},

  	reservationBtnClick: function() {

  		selectorWizardView.update('show_wizard');

  	},

  	closeWizardBtnClick: function() {

  		selectorWizardView.update('hide_wizard');

  	},

   /***
    *
    * The user selects the pickup place 
    *
    */
   	pickupPlaceSelected: function(data) { 
  		selectorWizardModel.selectionData.pickupPlace = data.value;
      selectorWizardModel.selectionData.pickupPlaceDescription = data.description;
      selectorWizardModel.selectionData.returnPlace = data.value;
      selectorWizardModel.selectionData.returnPlaceDescription = data.description;
  		selectorWizardView.update('pickup_place_selected');
  	},

   /***
    *
    * The user selects the date from 
    *
    */
    dateFromSelected: function(value) {
      selectorWizardModel.selectionData.dateFrom = value;
      selectorWizardView.update('date_from_selected');
    },

    /**
     *
     * Time from selected
     *
     */
    timeFromSelected: function(value) {
      selectorWizardModel.selectionData.timeFrom = value;
      selectorWizardView.update('time_from_selected');     
    },


    /***
     *
     * The user selects the return place 
     *
     */
    returnPlaceSelected: function(data) { 
      selectorWizardModel.selectionData.returnPlace = data.value;
      selectorWizardModel.selectionData.returnPlaceDescription = data.description;
      selectorWizardView.update('return_place_selected');
    },

    /**
     *
     * Date to selected
     *
     */
    dateToSelected: function(value) {
      selectorWizardModel.selectionData.dateTo = value;
      selectorWizardView.update('date_to_selected');
    },

    /**
     *
     * Time to selected
     *
     */
    timeToSelected: function(value) {
      selectorWizardModel.selectionData.timeTo = value;
      selectorWizardView.update('time_to_selected');
    },

    /**
     *
     * Age selected
     *
     */
    ageSelected: function(value) {
      selectorWizardModel.selectionData.ageId = value;

      selectorWizardView.update('age_selected');
    }

  }

  var selectorWizardView = {

  	init: function() {

      // Setup request language (for API calls)
      selectorWizardModel.requestLanguage = commonSettings.language(document.documentElement.lang);
      // Initialize i18next for translations
      i18next.init({  
                      lng: selectorWizardModel.requestLanguage,
                      resources: commonTranslations
                   }, 
                   function (error, t) {
                      // https://github.com/i18next/jquery-i18next#initialize-the-plugin
                      //jqueryI18next.init(i18next, $);
                      // Localize UI
                      //$('.nav').localize();
                   });
      // Extract the AgentId from the query parameters => Affiliates
      this.extractAgentId();
      // Extract rental_location_code from the form
      this.extractRentalLocationCode();
      // Extract sales_channel_code from the form
      this.extractSalesChannelCode();
      // Extra family_id from the from
      this.extractFamilyId();
      // Setup the events
  		this.setupEvents();

  	},

    // ------------------------ Extract Agent Id ------------------------------

    /**
     * Extract Agent ID (Affiliates)
     */
    extractAgentId: function() {

      console.log('extract_agent_id');

      var urlVars = commonSettings.getUrlVars();
      var agentId = null;  
      if (typeof urlVars['agentId'] !== 'undefined') {
        agentId = decodeURIComponent(urlVars['agentId']);
        customCookie.set('__mb_agent_id', agentId, {expires: 14});      
      }
      if (typeof urlVars['agentID'] !== 'undefined') {
        agentId = decodeURIComponent(urlVars['agentID']);
        customCookie.set('__mb_agent_id', agentId, {expires: 14});      
      }      
      else {
        agentId = customCookie.get('__mb_agent_id');  
      }

      selectorWizardModel.selectionData.agentId = agentId;
      console.log(selectorWizardModel.selectionData.agentId);

    },

    /**
     * Extract the rental location code
     */ 
    extractRentalLocationCode: function() {

      console.log('extract rental-location-code');

      if ($('form[name=wizard_search_form]').length > 0) {
        if ($('form[name=wizard_search_form] input[name=rental_location_code]').length > 0) {
          var rentalLocationCode = $('form[name=wizard_search_form] input[name=rental_location_code]').val();
          if (rentalLocationCode != '') {
            console.log('rental-location-code: '+rentalLocationCode);
            selectorWizardModel.selectionData.rentalLocationCode = rentalLocationCode;
            selectorWizardModel.selectionData.engineFixedRentaLocation = true;
          }
        }
      }

    },

    /**
     * Extract the sales channel code 
     */
    extractSalesChannelCode: function() {

      console.log('extract sales-channel-code');

      if ($('form[name=wizard_search_form]').length > 0) {
        if ($('form[name=wizard_search_form] input[name=sales_channel_code]').length > 0) {
          var salesChannelCode = $('form[name=wizard_search_form] input[name=sales_channel_code]').val();
          if (salesChannelCode != '') {
            console.log('sales-channel-code: '+salesChannelCode);
            selectorWizardModel.selectionData.salesChannelCode = salesChannelCode;
          }
        }
      }

    },

    /**
     * Extract the family Id
     */
    extractFamilyId: function() {

      if ($('form[name=wizard_search_form]').length > 0) {
        if ($('form[name=wizard_search_form] input[name=family_id]').length > 0) {
          var familyId = $('form[name=widget_search_form] input[name=family_id]').val();
          if (familyId != '') {
            selectorWizardModel.selectionData.familyId = familyId;
            selectorWizardModel.selectionData.engineFixedFamily = true;
          }
        }
      }

    },

  	setupEvents: function() {

  		$('#place_holder').bind('click', function(){
  			selectorWizardController.placeHolderClick();
  		});

  		$('#from_holder').bind('click', function(){
  			selectorWizardController.fromHolderClick();
  		});

  		$('#to_holder').bind('click', function(){
  			selectorWizardController.toHolderClick();
  		});

  		$('#btn_reservation').bind('click', function(){
  			selectorWizardController.reservationBtnClick();
  		});

  	},

  	update: function(action) {

  		switch (action) {
  			case 'show_wizard':
  			  this.showWizard();
  			  break;
  			case 'hide_wizard':
          $('#wizard_container_step_header').empty();
  			  $('#wizard_container_step_body').empty();
  			  this.hideWizard();
  			  break;
  			case 'pickup_place_selected': // Wizard place selected
          selectorWizardSelectPlace.model.removeListeners('place_selected');
  			  this.stepSelectDateFrom();
  			  break;
        case 'date_from_selected': // Wizard date from selected
          selectorWizardSelectDate.model.removeListeners('date_selected');
          this.stepSelectTimeFrom();
          break;
        case 'time_from_selected': // Wizard time from selected
          selectorWizardSelectTime.model.removeListeners('time_selected');
          this.stepSelectReturnPlace();
          break;
        case 'return_place_selected': // Wizard place selected
          selectorWizardSelectPlace.model.removeListeners('place_selected');
          this.stepSelectDateTo();
          break;
        case 'date_to_selected': // Wizard date to selected
          selectorWizardSelectDate.model.removeListeners('date_selected');
          this.stepTimeTo();
          break;
        case 'time_to_selected': // Wizard time to selected
          selectorWizardSelectTime.model.removeListeners('time_selected');
          if (selectorWizardModel.configuration.useDriverAgeRules) {
            this.stepAge();
          }
          else {
            this.stepFinishWizard();
          }
          break;
        case 'age_selected': // Wizard age selected
          selectorWizardSelectTime.model.removeListeners('age_selected');
          
          this.stepFinishWizard();
          break;
      }

    },

    startFromShoppingCart: function(shopping_cart) {
      selectorWizardModel.shoppingCart = shopping_cart;
    },

    showWizard: function() {

      // Hide the body overflow-y on the wizard
      selectorWizardModel.bodyOverflowY = $('body').css('overflow-y');
      $('body').css('overflow-y', 'hidden');

  		// Close wizard button event
  		$('#close_wizard_btn').unbind('click');
  		$('#close_wizard_btn').bind('click', function(){
  			selectorWizardController.closeWizardBtnClick();
  		});

  		// Show the wizard
  		$('#wizard_container').show();

  		// Show the first step
  		this.stepSelectPickupPlace();

  	},

  	hideWizard: function() {

      // Restore the body overflow-y
      $('body').css('overflow-y', selectorWizardModel.bodyOverflowY);

  		$('#wizard_container').hide();
      // Force remove listeners
      selectorWizardSelectPlace.model.removeListeners('place_selected');
      selectorWizardSelectDate.model.removeListeners('date_selected');
      selectorWizardSelectTime.model.removeListeners('time_selected');

      // Show selected information
      if (selectorWizardModel.selectionData.pickupPlace != null) {
        $('#place_holder').val(selectorWizardModel.selectionData.pickupPlace);
      }
      if (selectorWizardModel.selectionData.dateFrom != null) {
        var from = selectorWizardModel.selectionData.dateFrom;
        if (selectorWizardModel.selectionData.timeFrom != null) {
          from += ' ';
          from += selectorWizardModel.selectionData.timeFrom;
        } 
        $('#from_holder').val(from);
      }
      if (selectorWizardModel.selectionData.dateTo != null) {
        var to = selectorWizardModel.selectionData.dateTo;
        if (selectorWizardModel.selectionData.timeTo != null) {
          to += ' ';
          to += selectorWizardModel.selectionData.timeTo;
        } 
        $('#to_holder').val(to);
      }
  	},

    /**
     * Step 1 : Pickup place
     */
  	stepSelectPickupPlace: function() {

  		// Setup the event pickup place selected
  		selectorWizardSelectPlace.model.addListener('place_selected', function(event){
  			 if (event.type === 'place_selected') {
  			   selectorWizardController.pickupPlaceSelected(event.data);
  			 }
  		});

  		// Show the select place step
  		$('#step_title').html(i18next.t('selectorWizard.pickupPlace'));
  		selectorWizardSelectPlace.model.configuration = selectorWizardModel.configuration;
      selectorWizardSelectPlace.model.mode = 'pickup';      
			selectorWizardSelectPlace.view.init();

  	},

    /**
     * Step 2 : Date From
     */
  	stepSelectDateFrom: function() {

  		// Setup the event date from selected
  		selectorWizardSelectDate.model.addListener('date_selected', function(event){
  			 if (event.type === 'date_selected') {
  			   selectorWizardController.dateFromSelected(event.data);
  			 }
  		});

  		// Show the select date from step
  		$('#step_title').html(i18next.t('selectorWizard.dateFrom'));
      this.showWizardHeader();
      
      // Calculat min/max dates
      this.calculateMinMaxDateFrom();

      // Show the step
			selectorWizardSelectDate.model.configuration = selectorWizardModel.configuration;  
      selectorWizardSelectDate.model.place = selectorWizardModel.selectionData.pickupPlace; 
      selectorWizardSelectDate.model.minDate = selectorWizardModel.minDateFrom.format(selectorWizardModel.configuration.dateFormat);
      selectorWizardSelectDate.model.maxDate = selectorWizardModel.maxDateFrom.format(selectorWizardModel.configuration.dateFormat);
      selectorWizardSelectDate.model.action = 'deliveries';
  		selectorWizardSelectDate.view.init();


  	},

    /**
     * Step 3 : Time From
     */
    stepSelectTimeFrom: function() {

      // Setup the event date from selected
      selectorWizardSelectTime.model.addListener('time_selected', function(event){
         if (event.type === 'time_selected') {
           selectorWizardController.timeFromSelected(event.data);
         }
      });

      // Show the select date from step
      $('#step_title').html(i18next.t('selectorWizard.timeFrom'));
      this.showWizardHeader();

      // Show the step
      selectorWizardSelectTime.model.configuration = selectorWizardModel.configuration; 
      selectorWizardSelectTime.model.place = selectorWizardModel.selectionData.pickupPlace;
      selectorWizardSelectTime.model.date = selectorWizardModel.selectionData.dateFrom;
      selectorWizardSelectTime.model.minTime = null;  
      selectorWizardSelectTime.model.action = 'deliveries';  
      selectorWizardSelectTime.view.init();

    },

    /**
     * Step 4 : Return place
     */
    stepSelectReturnPlace: function() {

      // Setup the event pickup place selected
      selectorWizardSelectPlace.model.addListener('place_selected', function(event){
         if (event.type === 'place_selected') {
           selectorWizardController.returnPlaceSelected(event.data);
         }
      });

      // Show the select place step
      $('#step_title').html(i18next.t('selectorWizard.returnPlace'));
      this.showWizardHeader();
      
      selectorWizardSelectPlace.model.configuration = selectorWizardModel.configuration;
      selectorWizardSelectPlace.model.mode = 'return';
      selectorWizardSelectPlace.model.pickup_place = selectorWizardModel.selectionData.pickupPlace;
      selectorWizardSelectPlace.view.init();

    },

    /**
     * Step 5 : Date To
     */
    stepSelectDateTo: function() {

      // Setup the event date from selected
      selectorWizardSelectDate.model.addListener('date_selected', function(event){
         if (event.type === 'date_selected') {
           selectorWizardController.dateToSelected(event.data);
         }
      });

      // Show the select date from step
      $('#step_title').html(i18next.t('selectorWizard.dateTo'));
      this.showWizardHeader();

      // Calculat min/max dates
      this.calculateMinMaxDateTo();

      // Show the step
      selectorWizardSelectDate.model.configuration = selectorWizardModel.configuration;  
      selectorWizardSelectDate.model.minDate = selectorWizardModel.minDateTo.format(selectorWizardModel.configuration.dateFormat);
      selectorWizardSelectDate.model.maxDate = selectorWizardModel.maxDateTo.format(selectorWizardModel.configuration.dateFormat);      
      selectorWizardSelectDate.model.place = selectorWizardModel.selectionData.returnPlace; 
      selectorWizardSelectDate.model.action = 'collections';        
      selectorWizardSelectDate.view.init();


    },

    /**
     * Step 6 : Time to
     */
    stepTimeTo: function() {

      // Setup the event date from selected
      selectorWizardSelectTime.model.addListener('time_selected', function(event){
         if (event.type === 'time_selected') {
           selectorWizardController.timeToSelected(event.data);
         }
      });

      // Show the select date from step
      $('#step_title').html(i18next.t('selectorWizard.timeTo'));
      this.showWizardHeader();

      // Calculate min time
      this.calculateMinTimeTo();

      // Show the step
      selectorWizardSelectTime.model.configuration = selectorWizardModel.configuration;     
      selectorWizardSelectTime.model.place = selectorWizardModel.selectionData.returnPlace;
      selectorWizardSelectTime.model.date = selectorWizardModel.selectionData.dateTo;
      selectorWizardSelectTime.model.minTime = selectorWizardModel.minTime;  
      selectorWizardSelectTime.model.action = 'collections';        
      selectorWizardSelectTime.view.init();

    },

    /**
    * Step 7 :  Age
    */
    stepAge: function() {
      // Setup the event date from selected
      SelectorWizardSelectAge.model.addListener('age_selected', function(event){
        if (event.type === 'age_selected') {
          selectorWizardController.ageSelected(event.data);
        }
     });

      // Show the select date from step
      $('#step_title').html(i18next.t('selectorWizard.age'));
      this.showWizardHeader();

      // Show the step
      SelectorWizardSelectAge.view.init();
    },

    /**
     * Step 8 : Finish wizard
     */
    stepFinishWizard: function() {

      var url = commonServices.chooseProductUrl;

      var params = [];

      params.push('pickup_place='+commonSettings.data.encodeData(selectorWizardModel.selectionData.pickupPlace));
      params.push('date_from='+commonSettings.data.encodeData(selectorWizardModel.selectionData.dateFrom));
      params.push('time_from='+commonSettings.data.encodeData(selectorWizardModel.selectionData.timeFrom));
      params.push('return_place='+commonSettings.data.encodeData(selectorWizardModel.selectionData.returnPlace));
      params.push('date_to='+commonSettings.data.encodeData(selectorWizardModel.selectionData.dateTo));
      params.push('time_to='+commonSettings.data.encodeData(selectorWizardModel.selectionData.timeTo));
      if (selectorWizardModel.selectionData.ageId !== null) {
        params.push('driver_age_rule_id='+commonSettings.data.encodeData(selectorWizardModel.selectionData.ageId));
      }
      // Appends the agent id
      if (selectorWizardModel.selectionData.agentId != null) {
        params.push('agent_id='+commonSettings.data.encodeData(selectorWizardModel.selectionData.agentId));
      }
      // Appends the family id
      if (selectorWizardModel.selectionData.familyId != null) {
        params.push('family_id='+commonSettings.data.encodeData(selectorWizardModel.selectionData.familyId));
        params.push('engine_fixed_family='+commonSettings.data.encodeData(selectorWizardModel.selectionData.engineFixedFamily));
      }
      else if (selectorWizardModel.shoppingCart) {
        if (selectorWizardModel.shoppingCart.engine_fixed_family && 
            selectorWizardModel.shoppingCart.family_id != null) {
          params.push('family_id='+selectorWizardModel.shoppingCart.family_id);
          params.push('engine_fixed_family='+selectorWizardModel.shoppingCart.engine_fixed_family);          
        }
      }
      console.log('sales_channel_code:'+selectorWizardModel.selectionData.salesChannelCode);
      // Append the sales channel code
      if (selectorWizardModel.selectionData.salesChannelCode != null) {
        params.push('sales_channel_code='+commonSettings.data.encodeData(selectorWizardModel.selectionData.salesChannelCode));
      }
      else if (selectorWizardModel.shoppingCart) {
        console.log('sales_channel_code_sc:'+selectorWizardModel.shoppingCart.sales_channel_code);
        if (typeof selectorWizardModel.shoppingCart.sales_channel_code != 'undefined' &&  
            selectorWizardModel.shoppingCart.sales_channel_code != null && selectorWizardModel.shoppingCart.sales_channel_code != '') {
          params.push('sales_channel_code='+selectorWizardModel.shoppingCart.sales_channel_code);
        }
      }
      // Append the erntal location code
      if (selectorWizardModel.selectionData.rentalLocationCode != null) {
        params.push('rental_location_code='+commonSettings.data.encodeData(selectorWizardModel.selectionData.rentalLocationCode));
        params.push('engine_fixed_rental_location='+commonSettings.data.encodeData(selectorWizardModel.selectionData.engineFixedRentaLocation));
      }
      else if (selectorWizardModel.shoppingCart) {
        if (selectorWizardModel.shoppingCart.engine_fixed_rental_location && 
            selectorWizardModel.shoppingCart.rental_location_code != null) {
          params.push('rental_location_code='+selectorWizardModel.shoppingCart.rental_location_code);
          params.push('engine_fixed_rental_location='+selectorWizardModel.shoppingCart.engine_fixed_rental_location);          
        }
      }

      if (params.length > 0){
        url += '?';
        url += params.join('&');
      }

      window.location.href = url;

    },

    showWizardHeader: function() {
     // Show the header
      var html = tmpl('wizard_steps_summary')({summary: selectorWizardModel.selectionData});
      $('#wizard_container_step_header').html(html);
      $('#wizard_container_step_header').show();

    },

    /**
     * Calculate min and max values for date from 
     * 
     * min date from : Today
     * max date from : min date from + 365 days
     *
     */
    calculateMinMaxDateFrom: function() {

        // Setup First and last date
        selectorWizardModel.minDateFrom = moment().tz(selectorWizardModel.configuration.timezone);       
        selectorWizardModel.maxDateFrom = moment(selectorWizardModel.minDateFrom).
                                                  add(365, 'days').
                                                  tz(selectorWizardModel.configuration.timezone);

    },

    /**
     * Calculate min and max values for date to
     *
     * min date to: date from + min days
     * max date to: min date to + 365 days
     */
    calculateMinMaxDateTo: function() {

        if (selectorWizardModel.configuration.cycleOf24Hours) {
          selectorWizardModel.minDateTo = moment(selectorWizardModel.selectionData.dateFrom, selectorWizardModel.configuration.dateFormat).
                                            add(selectorWizardModel.configuration.minDays, 'days').
                                            tz(selectorWizardModel.configuration.timezone);
        }
        else {
          selectorWizardModel.minDateTo = moment(selectorWizardModel.selectionData.dateFrom, selectorWizardModel.configuration.dateFormat).
                                            add(selectorWizardModel.configuration.minDays - 1, 'days').
                                            tz(selectorWizardModel.configuration.timezone);
        } 
       
        selectorWizardModel.maxDateTo = moment(selectorWizardModel.minDateTo).
                                          add(365, 'days').
                                          tz(selectorWizardModel.configuration.timezone);
    },

    /**
     *
     */ 
    calculateMinTimeTo: function() {

      if (selectorWizardModel.selectionData.dateFrom === selectorWizardModel.selectionData.dateTo) {
        selectorWizardModel.minTime = selectorWizardModel.selectionData.timeFrom;
      }
      else {
        selectorWizardModel.minTime = null;
      }

    }

  }

  var selectorWizard = {
    model: selectorWizardModel,
    controller: selectorWizardController,
    view: selectorWizardView
  }

  return selectorWizard;

});