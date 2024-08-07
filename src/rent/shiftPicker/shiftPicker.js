/* eslint-disable camelcase */
/******
 *
 * Renting Module ShiftPicker (applied only for turns not flexible calendar)
 * id: Id unique (REQUIRED)
 * data-category-code: Category code (REQUIRED)
 * data-rental-location-code: Rental location code (OPTIONAL)
 * data-sales-channel-code: Sales channel code (OPTIONAL)
 * data-min-units: Min unit value (OPTIONAL)
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
], function(
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
		form,
		category_code,
		rental_location_code,
		sales_channel_code,
		units,
		min_units,
		errorMessage,
  }) {

    /**
     * ShiftPicker data model
     */
    this.model = {
			containerHTML, // All html container instance
			form, // Form instance
			requestLanguage: 'es', // Request language
			category_code, // Product code
			rental_location_code, // Rental location code
			sales_channel_code, // Sales channel code
			api_date_format: 'YYYY-MM-DD', // Api date format for requests
			max_units: 1, // Max units in selector
			min_units, // Min units in selector
			units, // Selected units
			availableDates: [], // All available dates
			disabledDates: [], // Disabled dates
			fullDates: [], // Dates with not free units of product availables
			datesTo: 365, // Number of days in availabled dates request
			date: undefined, // Selected date (default date is server date in commons model data)
			turns: [], // All turns
			time_from: undefined, // Selected turn
			time_to: undefined, // Selected turn
			shopping_cart: undefined, // Shopping cart
			shoppingCartId: undefined, // Shopping cart ID
			product: undefined, // Product
			product_available: undefined, // Product available
			errorMessage, // Error message container
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
				requestLanguage,
        category_code,
				sales_channel_code,
				rental_location_code,
      } = this.model;

      let url = `${commonServices.URL_PREFIX}/api/booking/frontend/products/${category_code}/inventory`;

      const urlParams = [];

      // APi Key
      if (commonServices.apiKey && commonServices.apiKey !== '') {
        urlParams.push('api_key=' + commonServices.apiKey);
      }

			// Language
      if (requestLanguage != null) {
        urlParams.push('lang=' + requestLanguage);
      }

			// Sales channel code
			if (sales_channel_code != null) {
				urlParams.push('sales_channel_code=' + sales_channel_code);
      }

			// Rental location code
			if (rental_location_code) {
        urlParams.push('rental_location_code=' + rental_location_code);
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
          .done(function(result) {
            resolve(result.units);
          })
          .fail(function(error) {
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
	 	* Filter available days in array format
	 	*/
		filterDates: function(data) {
			// Get entries 
			const entries = Object.entries(data);

			const availableDates = [];
			const disabledDates = [];
			const fullDates = [];

			entries.map((array) => {
				const key = array[0];
				const data = array[1];

				// Filter selectable day with non stop sales and available units
				if (data.selectable_day && data.free) {
					availableDates.push(key);
				} else if (!data.free) {
					fullDates.push(key);
					disabledDates.push(key);
				} else {
					disabledDates.push(key);
				}
			});

			return [availableDates, disabledDates, fullDates];
		},

		/**
	 	* Get available dates
	 	*/
		getDates: function(from, to) {
			commonLoader.show();

			const {
				requestLanguage,
        category_code,
				sales_channel_code,
				rental_location_code,
      } = this.model;

      let url = `${commonServices.URL_PREFIX}/api/booking/frontend/products/${category_code}/occupation`;

      const urlParams = [];

      // APi Key
      if (commonServices.apiKey && commonServices.apiKey !== '') {
        urlParams.push('api_key=' + commonServices.apiKey);
      }

			// Language
      if (requestLanguage != null) {
        urlParams.push('lang=' + requestLanguage);
      }

			// Sales channel code
			if (sales_channel_code != null) {
				urlParams.push('sales_channel_code=' + sales_channel_code);
      }

			// Rental location code
			if (rental_location_code) {
        urlParams.push('rental_location_code=' + rental_location_code);
      }

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
          .done((result) => {
						// Filter available days in request result data
						const dates = this.filterDates(result.occupation);

            resolve(dates);
          })
          .fail(function(error) {
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
	 	* Get turns
	 	*/
		getTurns: function() {
			commonLoader.show();

			const {
				requestLanguage,
        category_code,
				sales_channel_code,
				rental_location_code,
				units,
				date,
      } = this.model;

      let url = `${commonServices.URL_PREFIX}/api/booking/frontend/products/${category_code}/turns`;

      const urlParams = [];

      // APi Key
      if (commonServices.apiKey && commonServices.apiKey !== '') {
        urlParams.push('api_key=' + commonServices.apiKey);
      }

			// Language
      if (requestLanguage != null) {
        urlParams.push('lang=' + requestLanguage);
      }

			// Sales channel code
			if (sales_channel_code != null) {
				urlParams.push('sales_channel_code=' + sales_channel_code);
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
          .done(function(result) {
            resolve(result);
          })
          .fail(function(error) {
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
			const {
				shoppingCartId,
				requestLanguage,
				sales_channel_code,
				rental_location_code,
			} = this.model;

      const dataRequest = this.buildDataRequest();
      const dataRequestJSON =  encodeURIComponent(JSON.stringify(dataRequest));
     
			// Build the URL
      let url = commonServices.URL_PREFIX + '/api/booking/frontend/shopping-cart';
      
			// Shopping cart ID
      if (shoppingCartId == null) {
        this.model.shoppingCartId = this.getShoppingCartFreeAccessId();
      }
      if (shoppingCartId) {
        url+= '/' + shoppingCartId;
      }

      const urlParams = [];

      // API Key
      if (commonServices.apiKey && commonServices.apiKey != '') {
        urlParams.push('api_key=' + commonServices.apiKey);
      }

      // Language
      if (requestLanguage != null) {
        urlParams.push('lang=' + requestLanguage);
      }

			// Sales channel code
			if (sales_channel_code != null) {
				urlParams.push('sales_channel_code=' + sales_channel_code);
      }

			// Rental location code
			if (rental_location_code) {
        urlParams.push('rental_location_code=' + rental_location_code);
      }

      // Build URL
      if (urlParams.length > 0) {
        url += '?';
        url += urlParams.join('&');
      }

      // Request  
      commonLoader.show();
      $.ajax({
        type: 'POST',
        url: url,
        data: dataRequestJSON,
        dataType : 'json',
        contentType : 'application/json; charset=utf-8',
        crossDomain: true,
        success: (data, textStatus, jqXHR) => {
          if (this.model.shoppingCartId == null || this.model.shoppingCartId != data.shopping_cart.free_access_id) {
            this.model.shoppingCartId = data.shopping_cart.free_access_id;
            this.putShoppingCartFreeAccessId(this.model.shoppingCartId);
          }
          this.model.shopping_cart = data.shopping_cart;
          this.model.product_available = data.product_available;
          if (data.products && Array.isArray(data.products) && data.products.length > 0) {
            this.model.product = data.products[0];
          }
          else {
            this.model.product = null;
          }

					// Refresh info panel
          this.refreshInfoPanel();
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
     * (Custom pickup/return place)
     */
    buildDataRequest: function() {
			const {
				configuration,
				category_code,
				rental_location_code,
				sales_channel_code,
				date,
				time_from,
				time_to,
				units
			} = this.model;

      const data = {
				date_from: moment(date).format(configuration.dateFormat),
				time_from,
				date_to: moment(date).format(configuration.dateFormat),
				time_to,
				category_code: category_code,
				engine_fixed_product: true,
				units
			};

      if (sales_channel_code != null) {
        data.sales_channel_code = sales_channel_code;
      }

      if (rental_location_code != null) {
        data.rental_location_code = rental_location_code;
        // eslint-disable-next-line max-len
        data.engine_fixed_rental_location = ($(this.form_selector).find('input[type=hidden][name=rental_location_code]').length == 0);
      }

      // Agent (from cookies)
      const agentId = customCookie.get('__mb_agent_id'); 
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
			this.model.max_units =  await this.getMaxUnits();

			if (this.model.min_units > this.model.max_units) {
				this.model.form.hide();
				this.model.errorMessage.show();
				return false;
			}

			// Add options in select field
			const field = containerHTML.find('select[name=shiftpicker-units]');
			field.html('');
			let index = this.model.min_units;
			for (index; index <= this.model.max_units; index++) {
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

			return true;
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
		 * Disable dates in calendar 
		*/
		disableDates: function(date) {
			const formatDate = YSDFormatter.formatDate(date, this.model.api_date_format);
			const isEnabled = this.model.disabledDates.indexOf(formatDate) === -1;
			const isAvailable = this.model.fullDates.indexOf(formatDate) === -1;
			
			let result =  [true, 'shiftpicker-date-enabled'];
			if (!isEnabled) {
				result = [false, 'shiftpicker-date-disabled'];
			} 
			if (!isAvailable) {
				result = [false, 'shiftpicker-date-full'];
			}

			return result;
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

			$.datepicker.setDefaults($.datepicker.regional[requestLanguage]);
			
			const inputDate = containerHTML.find('input[name=shiftpicker-date]');
			const instanceDate = new Date(date);

			const self = this;
			inputDate.datepicker({
				minDate: instanceDate,
				beforeShowDay: self.disableDates.bind(self),
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
					return;
				}
				const value =  YSDFormatter.formatDate(newDate, api_date_format);

				// If field value is the first dates element
				const buttonBack = containerHTML.find('.shiftpicker-arrow[data-direction=back]');
				if (value === this.model.availableDates[0]) {
					// Add left arrow disabled atribute
					buttonBack.attr('disabled', 'disabled');
				} else {
					// Remove left arrow disabled atribute
					buttonBack.removeAttr('disabled');
				}

				// If field value is last element
				const index = this.model.availableDates.indexOf(value);

				if (index === -1 || index >= this.model.availableDates.length - 1) {
					// Get next dates
					const initialDate = this.model.availableDates.pop();

					// Get next dates function with next date callback function
					// eslint-disable-next-line max-len
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
			const [newAvailableDates, newDisabledDates, newFullDates] = await this.getDates(from, to);

			this.model.availableDates =  [
				...this.model.availableDates,
				...newAvailableDates,
			];

			this.model.fullDates = [
				...this.model.fullDates,
				...newFullDates,
			];

			this.model.disabledDates = [
				...this.model.disabledDates,
				...newDisabledDates,
			];

			// Go next date callback function
			if (callback && typeof callback === 'function') {
				callback();
			}
		},

		/**
		 * Set new turn
		*/
		onTurnsSelectorChange: function(time_from, time_to) {
			// Set turn
			this.model.time_from = time_from;
			this.model.time_to = time_to;

			// Calculate price and availability
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
				turnsSelector.find('.shiftpicker-turn-item').on('click', (event) => {
					const item = $(event.currentTarget);

					if (item.attr('data-status') === 'disabled') {
						alert(i18next.t('shiftPicker.turn_not_available'));

						return;
					}

					const field = item.find('input[type=radio]');
					// Check radio is not disabled
					if (!field.attr('disabled')) {
						const time_from = item.attr('data-time-from');
						const time_to = item.attr('data-time-to');

						// Set turn value
						this.onTurnsSelectorChange(time_from, time_to);

						// Set radio button to checked
						field.attr('checked', 'checked');

						// Remove all selected items and add data selected in item selected
						turnsSelector.find('.shiftpicker-turn-item').removeAttr('data-selected');
						item.attr('data-selected', 'true');
					}
				});

			} else {
				// Info not data found
				turnsSelector.append(`<li>${i18next.t('shiftPicker.no_data_found')}</li>`);
			}
			commonLoader.hide();
		},

		refreshInfoPanel: function() {
			const {
				containerHTML,
				units,
				configuration,
			} = this.model;

			// Refresh template html 
			const HTML = tmpl('script_shiftpicker_info')({
				model: {
					days: this.model.shopping_cart.days,
					hours: this.model.shopping_cart.hours,
					minutes: this.model.shopping_cart.minutes,
					units,
					date: moment(this.model.shopping_cart.date_from).format(configuration.dateFormat),
					time_from: this.model.shopping_cart.time_from,
					time_to: this.model.shopping_cart.time_to,
					shopping_cart: this.model.shopping_cart,
					configuration,
				}
			});
			containerHTML.find('.shiftpicker-info').html(HTML);

			// Set submit button enabled
			containerHTML.find('input[type=submit]').removeAttr('disabled');
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
			if (this.model.date === this.model.availableDates[0]) {
				buttonBack.attr('disabled', 'disabled');
			}

			//  Setup events
			buttons.on('click', (event) => {
				event.preventDefault();

				const {
					api_date_format,
				} = this.model;

				const target = $(event.currentTarget);
				let index = this.model.availableDates.indexOf(this.model.date);
				const direction = target.attr('data-direction');

				switch (direction) {
					case 'next':
						if (index === 0) {
							// Remove left arrow disabled atribute
							buttonBack.removeAttr('disabled');
						}

						// Get next dates one day first the last element
						if (index >= this.model.availableDates.length - 1) {
							// Rimove last dates item with is initial date from new request
							const initialDate = this.model.availableDates.pop();

							// Get next dates function with next date callback function
							// eslint-disable-next-line max-len
							this.addScrollDates(initialDate, YSDFormatter.formatDate(moment(initialDate).add(this.model.datesTo, 'days'), api_date_format), () => {
								// Move one position in next
								this.model.date = this.model.availableDates[index + 1];
								
								// Refresh
								this.refresh();
							});
						} else {
							// Move one position in next
							this.model.date = this.model.availableDates[index + 1];

							// Refresh
							this.refresh();
						}
						break;
				
					case 'back':
						// Move one position in back
						this.model.date = this.model.availableDates[index - 1];
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
			// eslint-disable-next-line max-len
			const [availableDates, disabledDates, fullDates] =  await this.getDates(date, YSDFormatter.formatDate(moment(date).add(this.model.datesTo, 'days'), api_date_format));
			
			if (availableDates.length > 0) {
				this.model.availableDates = availableDates;
				this.model.date = this.model.availableDates[0];
			}

			if (fullDates.length > 0) {
				this.model.fullDates = fullDates;
			}

			if (disabledDates.length > 0) {
				this.model.disabledDates = disabledDates;
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
    init: function() {
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
				function() {
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
				// Extend the model
				this.model = {
					...this.model,
					requestLanguage,
					date: data.serverDate,
					configuration: data,
				};

				this.setupControls();
				this.setupValidations();
			});
		},

		/**
     * Set Controls
     */
    setupControls: async function() {
			const isAvailable = await this.initializeUnitsSelector();
			if (isAvailable) {
				this.initializeScrollCalendar();
			} else {
				commonLoader.hide();
			}
    },

		/**
     * Set Validations // TODO
     */
		setupValidations: function() {
			const self = this;
			this.model.form.validate({
				submitHandler: function(form, event) {
          event.preventDefault();

          self.gotoNextStep();

					return;
        },
        rules: {},
        messages: {},
        errorPlacement: function(error, element) {
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
        window.location.href = commonServices.chooseExtrasUrl;
      }
      else {
        window.location.href = commonServices.completeUrl;
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
    init: function() {
			$('.mybooking-rent-shift-picker .mybooking-rent-shift-picker-content').each(
        (index, item) => {
          // Unique id for instance
          const id = $(item).attr('id');
          const containerHTML = $('#' + id);
					const form = containerHTML.find('form');
					const categoryCode = containerHTML.attr('data-category-code');
					const rentalLocationCode = containerHTML.attr('data-rental-location-code');
					const salesChannelCode = containerHTML.attr('data-sales-channel-code');
					const minUnitsValue = containerHTML.attr('data-min-units');
					const minUnits = minUnitsValue !== '' ? Number(minUnitsValue, 10) : 1;
					const errorMessage = containerHTML.find('.mybooking-rent-shift-picker-error');

          // Default settings for instance
					const settings = {
						containerHTML,
						form,
						category_code: categoryCode,
						rental_location_code: rentalLocationCode || undefined,
						sales_channel_code: salesChannelCode || undefined,
						min_units: minUnits,
						units: minUnits,
						errorMessage,
					};

          // Create a ShiftPicker instance
					this.factory(settings).init();
        }
      );
    },

    /**
     * Factory to create ShiftPicker instances
     */
    factory: function(settings) {
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
