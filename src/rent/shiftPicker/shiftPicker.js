/******
 *
 * Renting Module ShiftPicker (applied only for turns not flexible calendar)
 * id: Id unique (REQUIRED)
 * data-category-code: Category code (REQUIRED)
 * data-rental-location-code: Rental location code (OPTIONAL)
 */
require([
  'jquery',
  'i18next',
  'commonSettings',
	'commonServices',
  'commonLoader',
	'commonTranslations',
	'moment',
	'YSDFormatter',
	'ysdtemplate',
	'customCookie',
	'jquery.i18next',
], function (
  $,
  i18next,
  commonSettings,
	commonServices,
  commonLoader,
  commonTranslations,
	moment,
	YSDFormatter,
	tmpl,
	customCookie
) {
  /**
   * Contructor
   */
  function ShiftPicker({
		containerHTML,
		category_code,
		rental_location_code,
		units,
  }) {

    /**
     * ShiftPicker data model
     */
    this.model = {
			containerHTML, // All html container instance
			requestLanguage: 'es', // Request language
			category_code, // Product code
			rental_location_code, // Rental location code
			api_date_format: 'YYYY-MM-DD', // Api date format for requests
			maxUnits: 1, // Max units in selector
			units, // Selected units
			dates: [], // All dates
			date: undefined, // Selected date (default date is server date in commons model data)
			datesTo: 30, // Dates array to time in days
			turns: [], // All turns
			turn: undefined, // Selected turn
			shopping_cart: undefined, // Shopping cart
			shoppingCartId: undefined, // Shopping cart ID
			product: undefined, // Product
			product_available: undefined, // Product available
    };
  }

  /**
   * ========== The model (extended with API methods)
   */
  const model = {
		/**
	 	* Get category max units
	 	*/
		getMaxUnits: function() {
			commonLoader.show();

			const {
        category_code,
      } = this.model;

      let url = `${commonServices.URL_PREFIX}api/booking/frontend/products/${category_code}/inventory`;
      const urlParams = [];

      // APi Key
      if (commonServices.apiKey && commonServices.apiKey !== '') {
        urlParams.push('api_key=' + commonServices.apiKey);
      }

      if (urlParams.length > 0) {
        url += '?';
        url += urlParams.join('&');
      }

      // Returns a Promise with the response
      return new Promise((resolve) => {
        $.ajax({
          url: url,
        })
          .done(function (result) {
            resolve(result.units);
          })
          .fail(function (error) {
            console.error('Error', error);
            
						alert(i18next.t('shiftPicker.generic_error'));

            resolve(1);
          })
					.then(function() {
						commonLoader.hide();
					});
      });
		},

		/**
	 	* Get dates
	 	*/
		getDates: function(from, to) {
			commonLoader.show();

			const {
        category_code,
				rental_location_code,
      } = this.model;

      let url = `${commonServices.URL_PREFIX}api/booking/frontend/dates`;
      const urlParams = [];

      // APi Key
      if (commonServices.apiKey && commonServices.apiKey !== '') {
        urlParams.push('api_key=' + commonServices.apiKey);
      }

			// Rental location code
			if (rental_location_code) {
        urlParams.push('rental_location_code=' + rental_location_code);
      }

			// Category code
			urlParams.push('product=' + category_code);

			// Dates
			urlParams.push('from=' + from);
			urlParams.push('to=' + to);

      if (urlParams.length > 0) {
        url += '?';
        url += urlParams.join('&');
      }

      // Returns a Promise with the response
      return new Promise((resolve) => {
        $.ajax({
          url: url,
        })
          .done(function (result) {
            resolve(result);
          })
          .fail(function (error) {
            console.error('Error', error);
            
						alert(i18next.t('shiftPicker.generic_error'));

            resolve(1);
          })
					.then(function() {
						commonLoader.hide();
					});
      });
		},

		/**
	 	* Get turns
	 	*/
		getTurns: function() {
			commonLoader.show();

			const {
        category_code,
				rental_location_code,
				units,
				date,
      } = this.model;

      let url = `${commonServices.URL_PREFIX}api/booking/frontend/products/${category_code}/turns`;
      const urlParams = [];

      // APi Key
      if (commonServices.apiKey && commonServices.apiKey !== '') {
        urlParams.push('api_key=' + commonServices.apiKey);
      }

			// Rental location code
			if (rental_location_code) {
        urlParams.push('rental_location_code=' + rental_location_code);
      }

			// Category code
			urlParams.push('product=' + category_code);

			// Units
			urlParams.push('units=' + units);

			// Dates
			urlParams.push('date=' + date);

      if (urlParams.length > 0) {
        url += '?';
        url += urlParams.join('&');
      }

      // Returns a Promise with the response
      return new Promise((resolve) => {
        $.ajax({
          url: url,
        })
          .done(function (result) {
            resolve(result);
          })
          .fail(function (error) {
            console.error('Error', error);
            
						alert(i18next.t('shiftPicker.generic_error'));

            resolve([]);
          })
					.then(function() {
						commonLoader.hide();
					});
      });
		},

    /**
     * Calculate price (build the shopping cart and choose the product)
     */
    calculatePriceAvailability: function() {

      var dataRequest = this.buildDataRequest();
      debugger;
      var dataRequestJSON =  encodeURIComponent(JSON.stringify(dataRequest));
      // Build the URL
      var url = commonServices.URL_PREFIX + '/api/booking/frontend/shopping-cart';
      // Shopping cart ID
      if (this.model.shoppingCartId == null) {
        this.model.shoppingCartId = this.getShoppingCartFreeAccessId();
      }
      if (this.model.shoppingCartId) {
        url+= '/'+this.model.shoppingCartId;
      }
      var urlParams = [];
      // Language
      if (this.model.requestLanguage != null) {
        urlParams.push('lang='+this.requestLanguage);
      }
      // API Key
      if (commonServices.apiKey && commonServices.apiKey != '') {
        urlParams.push('api_key='+commonServices.apiKey);
      } 
      // Build URL
      if (urlParams.length > 0) {
        url += '?';
        url += urlParams.join('&');
      }


      // Request  
      var self = this;
      commonLoader.show();
      $.ajax({
        type: 'POST',
        url: url,
        data: dataRequestJSON,
        dataType : 'json',
        contentType : 'application/json; charset=utf-8',
        crossDomain: true,
        success: function(data, textStatus, jqXHR) {
          if (self.model.shoppingCartId == null || 
          		self.model.shoppingCartId != data.shopping_cart.free_access_id) {
            self.model.shoppingCartId = data.shopping_cart.free_access_id;
            self.putShoppingCartFreeAccessId(self.shoppingCartId);
          }
          self.model.shopping_cart = data.shopping_cart;
          self.model.product_available = data.product_available;
          if (data.products && Array.isArray(data.products) && data.products.length > 0) {
            self.model.product = data.products[0];
          }
          else {
            self.model.product = null;
          }
          self.refreshInfoPanel();
        },
        error: function(data, textStatus, jqXHR) {
          alert(i18next.t('selector.error_loading_data'));
        },
        beforeSend: function(jqXHR) {
          commonLoader.show();
        },        
        complete: function(jqXHR, textStatus) {
          commonLoader.hide();
        }
      });

    },

    /**
     * Get the shopping cart from the session storage
     */ 
    getShoppingCartFreeAccessId: function() {
      return sessionStorage.getItem('shopping_cart_free_access_id');
    },

    /**
     * Store shopping cart free access ID in season
     */
    putShoppingCartFreeAccessId: function(value) {
      sessionStorage.setItem('shopping_cart_free_access_id', value);
    },


    /**
     * Build data request
     * (TODO Custom pickup/return place)
     */
    buildDataRequest: function() {

    	debugger;
    	// TODO Refactor use time_from and time_to in model
    	var turnSplit = this.model.turn.split(' - ');

      var data = {date_from: moment(this.model.date).format('DD/MM/YYYY'),
                  time_from: turnSplit[0],
                  date_to: moment(this.model.date).format('DD/MM/YYYY'),
                  time_to: turnSplit[1],
                  category_code: this.model.category_code,
                  engine_fixed_product: true
                  };

      if (this.salesChannelCode != null) {
        data.sales_channel_code = this.salesChannelCode;
      }

      if (this.rentalLocationCode != null) {
        data.rental_location_code = this.rentalLocationCode;
        data.engine_fixed_rental_location = ($(this.form_selector).find('input[type=hidden][name=rental_location_code]').length == 0);
      }

      // Agent (from cookies)
      var agentId = customCookie.get('__mb_agent_id'); 
      if (agentId != null) {
        data.agent_id = agentId; 
      }

      return data;

    }  
   
  };

  /***
   * =============== The controller
   */
  const controller = {
		/**
		 * Set new units value and refresh
		*/
		onUnitsChanged:  function(value) {
			this.model.units = value;
			
			// Refresh
			this.refresh();
		},

		/**
     * Initialize units selector
     */
    initializeUnitsSelector: async function() {
			const {
				containerHTML,
			} = this.model;

			// Get max units for select field
			this.model.maxUnits =  await this.getMaxUnits();
			// Add options in select field
			const field = containerHTML.find('select[name=shiftpicker-units]');
			field.html('');
			for (let index = 1; index <= this.model.maxUnits; index++) {
				// Refresh template html 
				const HTML = tmpl('script_shiftpicker_units_option')({
					model: {
						units: index,
					}
				});
				field.append(HTML);
			}

			// Setup field events
			field.on('change',  (event) => {
				event.preventDefault();

				const value = $(event.currentTarget).val();

				this.onUnitsChanged(value);
			});
    },

		/**
		 * Set new date and refresh
		*/
		onDateChanged:  function(value) {
			this.model.date = value;
			
			// Refresh
			this.refresh();
		},

		/**
		 * Set date
		*/
		refreshDate: function() {
			const {
				containerHTML,
				date,
			} = this.model;

			containerHTML.find('input[name=shiftpicker-date]').datepicker('setDate', new Date(date));
		},

		/**
		 * Initialize date
		*/
		initializeDate: function() {
			const {
				requestLanguage,
				containerHTML,
				date,
			} = this.model;

			$.datepicker.setDefaults( $.datepicker.regional[requestLanguage] );
			
			const inputDate = containerHTML.find('input[name=shiftpicker-date]');
			const instanceDate = new Date(date);
			inputDate.datepicker({
				minDate: instanceDate,
			});
			inputDate.datepicker('setDate', instanceDate);

			// Setup events
			inputDate.off('change');
			inputDate.on('change', (event) => {
				event.preventDefault();

				const {
					api_date_format,
				} = this.model;

				const newDate = inputDate.datepicker('getDate');
				if (!newDate || newDate === '') {
					return; // TODO validate format date
				}
				const value =  YSDFormatter.formatDate(newDate, api_date_format);

				// If field value is the first dates element
				const buttonBack = containerHTML.find('.shiftpicker-arrow[data-direction=back]');
				if (value === this.model.dates[0]) {
					// Add left arrow disabled atribute
					buttonBack.attr('disabled', 'disabled');
				} else {
					// Remove left arrow disabled atribute
					buttonBack.removeAttr('disabled');
				}

				// If field value is last element
				const index = this.model.dates.indexOf(value);

				if (index === -1 || index >= this.model.dates.length - 1) {
					// Get next dates
					const initialDate = this.model.dates.pop();

					// Get next dates function with next date callback function
					this.addScrollDates(initialDate, YSDFormatter.formatDate(moment(value).add(this.model.datesTo, 'days'), api_date_format), () => {
						// Set date
						this.onDateChanged(value);
					});
				} else {
					// Set date
					this.onDateChanged(value);
				}
			});
		},

		/**
		 * Initialize text date
		*/
		refreshTextDate: function() {
			const {
				containerHTML,
				date,
			} = this.model;

			const formatDate = moment(date).format('dddd, D MMMM YYYY');
			containerHTML.find('.shiftpicker-text-date').html(formatDate);
		},

		/**
		 *Gest next moth in calendar
		*/
		addScrollDates: async function(from, to, callback) {
			const newDates = await this.getDates(from, to);

			this.model.dates =  [
				...this.model.dates,
				...newDates,
			];

			// Go next date callback function
			if (callback && typeof callback === 'function') {
				callback();
			}
		},

		/**
		 * Set new turn
		*/
		onTurnsSelectorChange: function(value) {
			this.model.turn = value;
			this.calculatePriceAvailability();
		},

		refreshTurnsSelector: async function() {
			const {
				containerHTML,
			} = this.model;

			const turnsSelector = containerHTML.find('.shiftpicker-turns');

			// Get turns
			const turns = await this.getTurns();
			turnsSelector.html('');
			if (turns.length > 0)  {
				turns.forEach((turn)=> {
					const HTML = tmpl('script_shiftpicker_turns_item')({
						model: turn,
					});
					
					turnsSelector.append(HTML);
				});
				// Setup events
				turnsSelector.find('input[type=radio]').on('change', (event) => {
					// Set turn value
					const value = $(event.currentTarget).val();
					this.onTurnsSelectorChange(value);

					// Refresh info panel
					//this.refreshInfoPanel();
				});

			} else {
				turnsSelector.append(`<li>${i18next.t('shiftPicker.no_data_found')}</li>`);
			}
		},

		refreshInfoPanel: function() {
			const {
				containerHTML,
				units,
				date,
				turn,
				common,
			} = this.model;

			// Refresh template html 
			const HTML = tmpl('script_shiftpicker_info')({
				model: {
					days: this.model.shopping_cart.days,
					hours: this.model.shopping_cart.hours,
					minutes: this.model.shopping_cart.minutes,
					units,
					date: moment(this.model.shopping_cart.date_from).format(common.dateFormat),
					time_from: this.model.shopping_cart.time_from,
					time_to: this.model.shopping_cart.time_to,
					shopping_cart: this.model.shopping_cart
				}
			});
			containerHTML.find('.shiftpicker-info').html(HTML);

			// Set submit button enabled
			containerHTML.find('button[type=submit]').removeAttr('disabled');
		},

		/**
		 * Initialize scroll buttons
		*/
		initializeScrollButtons: async function() {
			const {
				containerHTML,
			} = this.model;

			const buttons = containerHTML.find('.shiftpicker-arrow');
			const buttonBack = containerHTML.find('.shiftpicker-arrow[data-direction=back]');

			// Set disabled atribute in left arrow when date is the first dates value
			if (this.model.date === this.model.dates[0]) {
				buttonBack.attr('disabled', 'disabled');
			}

			//  Setup events
			buttons.on('click', (event) => {
				event.preventDefault();

				const {
					api_date_format,
				} = this.model;

				const target = $(event.currentTarget);
				let index = this.model.dates.indexOf(this.model.date);
				const direction = target.attr('data-direction');

				switch (direction) {
					case 'next':
						if (index === 0) {
							// Remove left arrow disabled atribute
							buttonBack.removeAttr('disabled');
						}

						// Get next dates one day first the last element
						if (index >= this.model.dates.length - 1) {
							// Rimove last dates item with is initial date from new request
							const initialDate = this.model.dates.pop();

							// Get next dates function with next date callback function
							this.addScrollDates(initialDate, YSDFormatter.formatDate(moment(initialDate).add(this.model.datesTo, 'days'), api_date_format), () => {
								// Move one position in next
								this.model.date = this.model.dates[index + 1];
								
								// Refresh
								this.refresh();
							});
						} else {
							// Move one position in next
							this.model.date = this.model.dates[index + 1];

							// Refresh
							this.refresh();
						}
						break;
				
					case 'back':
						// Move one position in back
						this.model.date = this.model.dates[index - 1];
						if (index === 1) {
							// Add left arrow disabled atribute
							buttonBack.attr('disabled', 'disabled');
						}
						
						// Refresh
						this.refresh();
						break;

					default:
						break;
				}
			});
		},

		/**
		 * Initialize scroll calendar
		*/
		initializeScrollCalendar: async function() {
			const {
				api_date_format,
				date,
			} = this.model;

			// Get dates
			this.model.dates =  await this.getDates(date, YSDFormatter.formatDate(moment(date).add(this.model.datesTo, 'days'), api_date_format));
			if (this.model.dates.length > 0) {
				this.model.date =  this.model.dates[0];
			}
			
			// Initialize date field
			this.initializeDate();
			// Initialize title text date
			this.refreshTextDate();
			// Initialize scroll buttons
			this.initializeScrollButtons();
			// Initialize turns selector
			this.refreshTurnsSelector();
		},

		/*
		* Refresh 
		*/
		refresh: function() {
			// Refresh date field
			this.refreshDate();
			// Refersh date text
			this.refreshTextDate();
			// Refresh turns selector
			this.refreshTurnsSelector();
			// Empty the information container
			this.model.containerHTML.find('.shiftpicker-info').html('');
			// Set submit button to disabled
			this.model.containerHTML.find('button[type=submit]').attr('disabled', 'disabled');
		}
  };

  /***
   * ========= The view
   */
  const view = {
    /**
     * Initizialize
     */
    init: function () {
			// Get request language
			const requestLanguage = commonSettings.language(
				document.documentElement.lang || 'es'
			);
		
			// Initialize i18next for translations
			i18next.init(
				{
					lng: requestLanguage,
					resources: commonTranslations,
				},
				function () {
					// https://github.com/i18next/jquery-i18next#initialize-the-plugin
					//jqueryI18next.init(i18next, $);
					// Localize UI
					//$('.nav').localize();
				}
			);

			// Moment config
			moment.locale(requestLanguage);
		
			// Load settings
			commonLoader.show();
			commonSettings.loadSettings((data) => {
				commonLoader.hide();
		
				// Extend the model
				this.model = {
					...this.model,
					requestLanguage,
					date: data.serverDate,
					common: data,
				};

				this.setupControls();
			});
		},

		/**
     * Set Controls
     */
    setupControls: function () {
			this.initializeUnitsSelector();
			this.initializeScrollCalendar();
    },

		/**
     * Set Validations // TODO
     */
		setupValidations: function() {
			var self = this;
			$('form[name=mybooking-shiftpicker-form]').validate({
				submitHandler: function (form, event) {
          event.preventDefault();
          self.gotoNextStep();
					return;
        },
        rules: {},
        messages: {},
        errorPlacement: function (error, element) {
          error.insertAfter(element.parent());
        },
        errorClass: 'form-reservation-error',
     });
		},

    /**
     * Go to the next step (select extras or complete URL)
     */
    gotoNextStep: function() {

      if (commonServices.extrasStep) {
        window.location.href= commonServices.chooseExtrasUrl;
      }
      else {
        window.location.href= commonServices.completeUrl;
      }

    },   

  };

  // -----------------------------------------

  /**
   * ShiftPicker factory
   */
  const shiftPicker = {
    /**
     * Initizialize
     */
    init: function () {
			$('.mybooking-shiftpicker .mybooking-shiftpicker-content').each(
        (index, item) => {
          // Unique id for instance
          const id = $(item).attr('id');
          const containerHTML = $('#' + id);
					const categoryCode = containerHTML.attr('data-category-code');
					const rentalLocationCode = containerHTML.attr('data-rental-location-code');

          // Default settings for instance
					const settings = {
						containerHTML,
						category_code: categoryCode,
						rental_location_code: rentalLocationCode || undefined,
						units: 1,
					};

          // Create a ShiftPicker instance
					this.factory(settings).init();
        }
      );
    },

    /**
     * Factory to create ShiftPicker instances
     */
    factory: function (settings) {
      // The proptotype => Clones the model, controller and view
      ShiftPicker.prototype = {
        ...model, // Appends the model (cloning)
        ...controller, // Appends the controller (cloning)
        ...view, // Appends the view (cloning)
      };

      // Creates a new instance of the ShiftPicker
      return new ShiftPicker(settings);
    },
  };

  shiftPicker.init();
});
