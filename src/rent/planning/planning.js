/******
 *
 * Renting Module Planning
 *
 */
 require(['jquery', 'i18next', 'commonServices', 'commonSettings', 'commonLoader', 'YSDFormatter', 'commonTranslations', 'moment', './planningActionBar', 'ysdtemplate', 'commonUI', 'jquery.i18next'],
 function($, i18next, commonServices, commonSettings, commonLoader, YSDFormatter, commonTranslations, moment, planningActionBar, tmpl, commonUI) {

	/**
	 * Contructor
	 */
	function Planning ({ planningHTML, target, targetId, type, family, category, 
											 items, direction, rentalLocation, cells, interval }) {
		/**
		 * Planning data model
		*/
		this.model = {
			planningHTML, // Planning HTML
			target, 
			targetId,
			type: type || 'diary', // Type
			// Rental locations
			isRentalLocationSelectorAvailable: false,
			rentalLocations: [],
			// Rental location code (multiple rental locations)
			rentalLocation,
			// Families
			isFamilySelectorAvailable: false, // Shows family selector
			family, // Selected family
			families: [], // All families
			// Categories
			isCategorySelectorAvailable: false, // Shows category selector
			category,
			categories: [],
			// Items
			items: items || 15, // Number of items
			direction: direction || 'columns',
			// 
			schedule: [],
			originalSchedule: [],
			resources: [],
			ocupation: [],
			realCalendar: [],
			calendar: [],
			// Api Format
			api_date_format: 'YYYY-MM-DD',
			date: {
				actual: undefined,
				server: undefined,
				interval: interval !== null ? window.parseInt(interval) : 30,
			},
			cells: cells || {
				width: 150,
				height: 40,
			},
			productDetail: {}
		};
	}

	/**
	 * ========== The model (extended with API methods)
	 */ 
	var model = {

		/**
		 * Get rental locations
		 */
		getRentalLocations: function() {
			var url = commonServices.URL_PREFIX + '/api/booking/frontend/rental-locations?api_key=' + commonServices.apiKey;

			// Returns a Promise with the response
			return new Promise(resolve => {
				$.ajax({
					url: url
				}).done(function(data) {
					resolve(data);
				}).fail(function(error) {
					console.log('Error', error);
					alert(i18next.t('planning.generic_error'));

					resolve([]);
				});
			});
		},

		/**
		 * Get families
		 */
		getFamilies: function() {
			var url = commonServices.URL_PREFIX + '/api/booking/frontend/families?api_key=' + commonServices.apiKey;

			// Returns a Promise with the response
			return new Promise(resolve => {
				$.ajax({
					url: url
				}).done(function(data) {
					resolve(data);
				}).fail(function(error) {
					console.log('Error', error);
					alert(i18next.t('planning.generic_error'));

					resolve([]);
				});
			});
		},

		/**
		 * Get categories
		 */
		getCategories: function(family_id) {
			var url = commonServices.URL_PREFIX + '/api/booking/frontend/products';
			var urlParams = [];

			// APi Key
      if (commonServices.apiKey && commonServices.apiKey != '') {
        urlParams.push('api_key='+commonServices.apiKey);
      }  

			// Family ID
			if (family_id) {
				urlParams.push('family_id='+family_id);
			}

			if (urlParams.length > 0) {
        url += '?';
        url += urlParams.join('&');
      }

			// Returns a Promise with the response
			return new Promise(resolve => {
				$.ajax({
					url: url
				}).done(function(result) {
					resolve(result.data);
				}).fail(function(error) {
					console.log('Error', error);
					alert(i18next.t('planning.generic_error'));

					resolve([]);
				});
			});
		},

		/**
		 * Get calendar of dates
		*/
		getCalendar: function({from, to}) {
			
			var url = commonServices.URL_PREFIX + '/api/booking/frontend/dates?api_key=' + 
								commonServices.apiKey + '&from=' + from + '&to=' + to;

			// Returns a Promise with the response
			return new Promise(resolve => {
				$.ajax({
					url: url
				}).done(function(data) {
					resolve(data);
				}).fail(function(error) {
					console.log('Error', error);
					alert(i18next.t('planning.generic_error'));

					resolve([]);
				});
			});
		},

		/**
		 * Get day schedule => Hours to show
		*/
		getSchedule: function({ date }){
			var self = this;
			var url = commonServices.URL_PREFIX;
			var urlParams = [];

			// APi Key
      if (commonServices.apiKey && commonServices.apiKey != '') {
        urlParams.push('api_key='+commonServices.apiKey);
      }  
      
      // Date
      urlParams.push('date='+date);

      // Family
			if (this.model.family !== null && this.model.family !== 'all') {
				urlParams.push('family='+this.model.family);
			}

			// Category
			if (this.model.category !== null && this.model.category !== 'all') {
				urlParams.push('product='+this.model.category);
			}

			// End-pint
			switch (this.model.configuration.rentTimesSelector) {
				case 'hours':
					url += '/api/booking/frontend/times';
				break;
				
				case 'time_range':
					url += '/api/booking/frontend/turns';
				break;
				default:
					break;
			}

      if (urlParams.length > 0) {
        url += '?';
        url += urlParams.join('&');
      }

      // Returns a Promise with the response
			return new Promise(resolve => {
				$.ajax({
					url: url
				}).done(function(data) {
					if (data.length>0 && typeof data[0] === 'object') {
						var formatData = [];

						data.forEach(function(item) {
							formatData.push(`${item.time_from} - ${item.time_to}`);
						});

						self.model.originalSchedule = data;
						resolve(formatData);
					} else {
						resolve(data);
					}
				}).fail(function(error) {
					console.log('Error', error);
					alert(i18next.t('planning.generic_error'));

					resolve([]);
				});
			});
		},

		/**
		 * Get day planning => Resource urges
		*/
		getPlanning: function({ from, to }){
			var url = commonServices.URL_PREFIX + '/api/booking/frontend/planning';
			var urlParams = [];

			// Api Key
      if (commonServices.apiKey && commonServices.apiKey != '') {
        urlParams.push('api_key='+commonServices.apiKey);
      }  

      // Starting date
      urlParams.push('from='+from);
			
      // Ending date
			urlParams.push('to='+to);
			
			// Rental location code
			if (this.model.rentalLocation) {
				urlParams.push('rental_location_code='+ this.model.rentalLocation);
			}

			// Family
			if (this.model.family !== null && this.model.family !== 'all') {
				urlParams.push('family_id='+this.model.family);
			}

			// Category
			if (this.model.category !== null && this.model.category !== 'all') {
				urlParams.push('category='+this.model.category);
			}

			if (urlParams.length > 0) {
        url += '?';
        url += urlParams.join('&');
      }

      // Returns a Promise with the response
			return new Promise(resolve => {
				$.ajax({
					url: url
				}).done(function(data) {
					resolve(data);
				}).fail(function(error) {
					console.log('Error', error);
					alert(i18next.t('planning.generic_error'));

					resolve([]);
				});
			});
		},

		/** 
     * Load product (product detail Page)
     */
    loadProduct: function (productCode) {
			// Build the URL
			var url = commonServices.URL_PREFIX + '/api/booking/frontend/products/'+productCode;
			var urlParams = [];
			if (this.model.requestLanguage != null) {
				urlParams.push('lang=' + this.model.requestLanguage);
			}
			if (commonServices.apiKey && commonServices.apiKey != '') {
				urlParams.push('api_key='+commonServices.apiKey);
			}           
			if (urlParams.length > 0) {
				url += '?';
				url += urlParams.join('&');
			}

			// Request
			commonLoader.show();
			$.ajax({
				type: 'GET',
				url : url,
				contentType : 'application/json; charset=utf-8',
				crossDomain: true,
				success: (data, textStatus, jqXHR) => {
					this.model.productDetail = data;
					this.showProductDetail();
					commonLoader.hide();
				},
				error: (data, textStatus, jqXHR) => {
					commonLoader.hide();
					alert(i18next.t('chooseProduct.loadProduct.error'));
				}
			});
		},
	};

	/***
	 * =============== The controller
	 */ 
	var controller = {
		/**
		 * Get ocupation range and put in list data 
		 */
		getOcupation15Range: function({from, to}) {
			if(!from || !to) {
				return [];
			}

			var serverDate = moment(this.model.date.server);
			if (moment(to).isBefore(serverDate)) {
				return [];
			}

			var range = [];
			if (from === to) {
				range.push(from);
				return range;
			}

			var init = false;
			var finish = false;
			this.model.calendar.forEach(function(item) {
				if (moment(from).isBefore(serverDate) || moment(from).isSame(serverDate) || item === from) {
					init = true;
				}

				if (init && !finish) {
					range.push(item);

					if (item === to) {
						finish = true;
					}
				}
			});

			return range;
		},

		/**
		 * Get ranges between from and to time
		*/
		getTimeRanges: function({ from, to }) {
			const interval = this.model.date.interval; 

			function getMinutes(time) {
				var arrayTime = time.split(':').map(Number);
				return arrayTime[0] * 60 + arrayTime[1];
			}
		
			function getTime(minutes) {
				var hours = minutes / 60 | 0;
				if (hours.toString().length < 2) {
					hours = '0' + hours;
				}
				minutes %= 60;
				return hours + ':' + (minutes < 10 ? '0' + minutes : minutes);
			}

			var range = [],
				fromMinutes = getMinutes(from),
				toMinutes = getMinutes(to);
			
			while (fromMinutes + interval <= toMinutes) {
				range.push(getTime(fromMinutes));
				fromMinutes += interval;
			}
			
			range.push(getTime(fromMinutes));

			return range;
		},

		/**
		 * Get ocupation range and put in list data
		*/
		getOcupationDiaryRange: function({from, to, actualDay}) {
			if(!from || !to) {
				return [];
			}

			if (actualDay) {
				if (actualDay == 'from' || actualDay == 'both') {
					to = this.model.schedule.slice(-1).pop();
				}
	
				if (actualDay != 'from' || moment(from, 'hh:mm').isBefore(moment(this.model.schedule[0], 'hh:mm'))) {
					from = this.model.schedule[0];
				}
			}

			return this.getTimeRanges({ from, to });
		},

		/**
		 * Paint the ranges
		 */ 
		paintRanges: function(item) {
			var self = this;

			if (this.model.items == 1 && this.model.configuration.rentTimesSelector == 'time_range') {
					// Time range only 1 day
					var objName = self.model.originalSchedule.filter((element) => {
						return element.time_from == item.time_from && element.time_to == item.time_to;
					})[0];
					var name = objName ? objName.name : '';
					var activeCells = self.model.target.find('div.mybooking-planning-td-content[data-id="' + item.id + '"][data-time="' + item.range[0] + ' - ' + item.range.slice(-1).pop() + '"]');
					activeCells.addClass('full').addClass('from to');
					activeCells.attr('title', item.label + ' - ' + name);
			}
			else {
					// Hours or diary
					item.range.forEach(function(range, index) {
						var classes = '';
		
						if (item.actualDay) {
							if (index === 0 && item.actualDay === 'from') {
								classes += 'from';
							} 
			
							if (index === item.range.length - 1 && item.actualDay === 'to') {
								classes += ' to';
							}
						} else {
							if (index === 0 && (moment(item.date_from).isSame(moment(range)) || item.date_from === undefined && item.time_from === range )) {
								classes += 'from';
							} 
			
							if (index === item.range.length - 1) {
								classes += ' to';
							}
						}
		
						var activeCells = self.model.target.find('div.mybooking-planning-td-content[data-id="' + item.id + '"][data-time="' + range + '"]');
						activeCells.addClass('full').addClass(classes);
						activeCells.attr('title', item.label);
					});
			}
/*
			switch (this.model.configuration.rentTimesSelector) {
				case 'time_range':
					// Time range
					var objName = self.model.originalSchedule.filter((element) => {
						return element.time_from == item.time_from && element.time_to == item.time_to;
					})[0];
					var name = objName ? objName.name : '';
					var activeCells = self.model.target.find('div.mybooking-planning-td-content[data-id="' + item.id + '"][data-time="' + item.range[0] + ' - ' + item.range.slice(-1).pop() + '"]');
					activeCells.addClass('full').addClass('from to');
					activeCells.attr('title', item.label + ' - ' + name);
					break;
				case 'hours':
					// Hours
					item.range.forEach(function(range, index) {
						var classes = '';
		
						if (item.actualDay) {
							if (index === 0 && item.actualDay === 'from') {
								classes += 'from';
							} 
			
							if (index === item.range.length - 1 && item.actualDay === 'to') {
								classes += ' to';
							}
						} else {
							if (index === 0 && (moment(item.date_from).isSame(moment(range)) || item.date_from === undefined && item.time_from === range )) {
								classes += 'from';
							} 
			
							if (index === item.range.length - 1) {
								classes += ' to';
							}
						}
		
						var activeCells = self.model.target.find('div.mybooking-planning-td-content[data-id="' + item.id + '"][data-time="' + range + '"]');
						activeCells.addClass('full').addClass(classes);
						activeCells.attr('title', item.label);
					});

					break;
			}
*/			
		},

		/**
		 * Draw ocupation status 
		*/
		showOcupation: function() {
			var self = this;

			for (var idx=0;idx<this.model.ocupation.length; idx++) {
				self.paintRanges(this.model.ocupation[idx]);
			}
			//this.model.ocupation.forEach(function(item) {
			//	self.paintRanges(item);
			//});

			/*
			* Format 
			*/
			this.model.target.find('table tbody th').css('height', this.model.cells.height + 'px');
			this.model.target.find('table tbody td').css('height', this.model.cells.height + 'px');

			this.model.target.find('table').addClass('mybooking-planning-table-direction-' + this.model.direction);
			this.model.target.find('table.mybooking-planning-table-direction-columns tbody td .mybooking-planning-range-text.even').css('margin-top', (this.model.cells.height * -1) + 'px');

			this.model.target.find('table.mybooking-planning-table-direction-rows tbody td .mybooking-planning-range-text.even').css('margin-left', (this.model.cells.width * -1) + 'px');
			this.model.target.find('table.mybooking-planning-table-direction-rows tbody td .mybooking-planning-range-text.even').css('margin-right', this.model.cells.width + 'px');
		},

		/**
		 * Get ocupation data
		*/
		getOcupation: function(paramDate) {
			var self = this;

			this.model.resources.forEach(function(element) {
				if (element.urges.length > 0) {
					element.urges.forEach(function(item) {
						var formatDate = moment(paramDate);
						var from = moment(item.date_from);
						var to = moment(item.date_to);
						var dateFromString = self.model.configuration.formatDate(item.date_from);
						var dateToString = self.model.configuration.formatDate(item.date_to);
						var label = '';
						//if (formatDate.isSame(from) ||  formatDate.isSame(to) ||
						//	  (formatDate.isAfter(from) && formatDate.isBefore(to)) ) {

							if (!from.isSame(to)) {
								var actualDay;
								if (formatDate.isSame(from)){
									actualDay = 'from';
								} else if (formatDate.isSame(to)){
									actualDay = 'to';
								} else {
									actualDay = 'both';
								}

								label = dateFromString + ' - ' + dateToString;
							}

							var newElement = {
								id: element.id, 
								label
							};

							if (self.model.type === 'diary') {
								var time_to = item.time_to;
								if (self.model.configuration.rentTimesSelector === 'hours') { // TODO See this
									var [hours, minutes] = time_to.split(':');
									var formatHours = minutes === '00' ? window.parseInt(hours) - 1 : hours; 
									var formatMinutes = minutes === '00' ? '59' : '29';
									time_to = `${formatHours}:${formatMinutes}`;
								}
								newElement = {
									...newElement,
									actualDay,
									time_from: item.time_from, 
									time_to: item.time_to,
									range: self.getOcupationDiaryRange({ from: item.time_from, to: time_to, actualDay }),
									label: label !== '' ? dateFromString + ' / ' + item.time_from + ' - ' + dateToString + ' / ' + item.time_to :  dateFromString + ' - ' + item.time_from + ' / ' + item.time_to,
								};
							} else if (self.model.type === 'calendar') {
								newElement = {
									...newElement,
									date_from: item.date_from,
									date_to: item.date_to,
									range: self.getOcupation15Range({ from: item.date_from, to: item.date_to }),
									label: dateFromString + ' - ' + dateToString,
								};
							}
							self.model.ocupation.push(newElement);
						//}
					});
				}
			});

			this.showOcupation();
		},

		/**
		 * Draw planning
		*/
		drawPlanning ({ rows, columns }) {
			var self = this;
			var  html = '<div class="mybooking-planning-scrollable"><table >';
				/**
				 * Head
				 */
				html += '<thead><tr>';
				html += '<th class="mybooking-planning-td-fix"></th>';

				columns.forEach(function(item) {
					var description = item.id ? item.description : item;

					if (!item.id && !description.includes(':')) {
						var mydate = new Date(description);
						var year = mydate.getFullYear();
						var month = mydate.toLocaleString(self.model.requestLanguage, { month: 'short' }).toUpperCase();
						var day = mydate.getDate();
						var weekday = mydate.toLocaleString(self.model.requestLanguage, { weekday: 'short' }).toUpperCase();

						description = '<span class="mybooking-planning-td-product__month">' + month + '</span> <span class="mybooking-planning-td-product__year">' + year + '</span><br>' + '<b class="mybooking-planning-td-product__day">' + day + '</b><br><span class="mybooking-planning-td-product__weekday">' + weekday + '</span>';
					} else if (item.id) {
						description = '<span class="mybooking-planning-td-product js-product-info-btn" data-product="' + 
													item.category_code + '" title="+ info">' + description + 
													' <span class="dashicons dashicons-info" data-product="' + 
													item.category_code + '"></span></span>';
					}

					html += '<th>';
						html += description;
					html += '</th>';
				});
				html += '</tr></thead>';

				/**
				 * Body
				 */
				html += '<tbody>';
					rows.forEach(function(item) {
						var fixHead = item.description ? item.description : item;
						if (!item.id && !fixHead.includes(':')) {
							var mydate = new Date(fixHead);
							var day = mydate.getDate();
							var weekday = mydate.toLocaleString(self.model.requestLanguage, { weekday: 'short' }).toUpperCase();

							fixHead = '<b class="mybooking-planning-td-product__day">' + day + '</b>&nbsp;&nbsp;&nbsp;<span class="mybooking-planning-td-product__weekday">' + weekday + '</span>';
						} else if (item.id) {
							fixHead = '<span class="mybooking-planning-td-product js-product-info-btn" data-product="' + 
												item.category_code + '" title="+ info">' + item.description + 
												' <span class="dashicons dashicons-info" data-product="' + 
													item.category_code + '"></span></span>';
						}

						html += '<tr>';
						html += '<th class="mybooking-planning-td-fix">' + fixHead + '</th>';
						columns.forEach(function(element) {
							var time = element.id ? item : element;
							var id = element.id ? element.id : item.id;
							var isClosed = !time.includes(':') && !self.model.calendar.includes(time);
							var closedClass = isClosed ? ' closed' : '';

							html += '<td>';
								html += '<div data-id="'+ id +'" data-time="' + time  + '" class="mybooking-planning-td-content'+ closedClass +'"></div>';
							html += '</td>';
						});
						html += '</tr>';
					});
				html += '</tbody>';
			html += '</table></div>';
			
			return html;
		},

		getDatesBetweenTwoDates: function({ from, to}) {
			let dates = [];

			for (let m = moment(from); m.isBefore(to); m.add(1, 'd')) {
					dates.push(m.format(this.model.api_date_format));
			}

			return dates;
		},

		/**
		 * Refresh table
		*/
		refresh: async function(event) {
			commonLoader.show();

			this.model = {
				...this.model,
				schedule: [],
				resources: [],
				ocupation: [],
				realCalendar: [],
				calendar: [],
			};

			if (commonServices.URL_PREFIX && commonServices.URL_PREFIX !== '' && 
					commonServices.apiKey && commonServices.apiKey !== '') {
				if (!this.model.date.actual) {
					this.model.calendar = await this.getCalendar({ from: this.model.date.server, to: YSDFormatter.formatDate(moment(this.model.date.server).add(this.model.items * 2, 'd'), this.model.api_date_format)});
					this.model.date.server = this.model.calendar[0];
					this.model.date.actual = this.model.date.server;

					this.model.realCalendar = this.getDatesBetweenTwoDates({ from: this.model.calendar[0], to: YSDFormatter.formatDate(moment(this.model.calendar[0]).add(this.model.items, 'd'), this.model.api_date_format)});
				} else {
					this.model.calendar = await this.getCalendar({ from: this.model.date.actual, to: YSDFormatter.formatDate(moment(this.model.date.actual).add(this.model.items * 2, 'd'), this.model.api_date_format)});
					this.model.realCalendar = this.getDatesBetweenTwoDates({ from:  this.model.date.actual, to: YSDFormatter.formatDate(moment(this.model.date.actual).add(this.model.items, 'd'), this.model.api_date_format)});
				}

				var date = this.model.date.actual;
				// Append the number of days
				var dateTo = moment(date).add( this.model.items, 'days').format(this.model.api_date_format);

				if (this.model.type === 'diary') {
					this.model.schedule = await this.getSchedule({ date });
				} else if (this.model.type === 'calendar') {
					this.model.schedule = this.model.realCalendar;
				}

				if (this.model.isRentalLocationSelectorAvailable) {
					this.model.rentalLocations = await this.getRentalLocations();
				}

				if (this.model.isFamilySelectorAvailable) {
					this.model.families = await this.getFamilies();
				}
				
				if (this.model.isCategorySelectorAvailable) {
					if (this.model.family !== null) {
						if (this.model.family === 'all') {
							// Get all categories
							this.model.categories = await this.getCategories();
						} else {
							// Get family categories
							this.model.categories = await this.getCategories(this.model.family);
						} 
					} else {
						// Get all categories
						this.model.categories = await this.getCategories();
					}
				}

				this.model.resources = await this.getPlanning({ from: date, to: dateTo });

				var html;
				if (this.model.resources.length > 0 && this.model.schedule.length > 0) {
					var settings;
					switch (this.model.direction) {
						case 'rows':
							settings = { 
								rows: this.model.resources, 
								columns: this.model.schedule
							};
							break;
					
						default:
							settings = { 
								rows: this.model.schedule, 
								columns: this.model.resources
							};
							break;
					}

					html = this.drawPlanning(settings);
					this.model.target.html(html);
					this.getOcupation(date);
				} else {
					html = i18next.t('planning.no_data_found');

					this.model.target.html(html);
				}	

				if (event && event.detail && event.detail.callback) {
					var total = this.model.direction === 'columns' ? this.model.resources.length : this.model.schedule.length;

					const rentalLocation = this.model.isRentalLocationSelectorAvailable ? this.model.rentalLocation || 'all' : undefined;
					const family = this.model.isFamilySelectorAvailable ? this.model.family || 'all' : undefined;
					const category = this.model.isCategorySelectorAvailable ? this.model.category || 'all' : undefined;

					event.detail.callback({ settings: event.detail.settings, total: total, rentalLocation, family, category });
				}

			} else {
				html = i18next.t('planning.api_conexion_error');

				this.model.target.html(html);
			}	

			console.log('Model: ', this.model);
			
			commonLoader.hide();
		},

		/**
	  * Load product detail
	  */
		productDetailIconClick: function (productCode)  {
			this.loadProduct(productCode);
		},
	};

	/***
	 * ========= The view
	 */ 
	var view = {

		/**
		 * Initizialize
 		 */
		init: function() {
			var self = this;

			// Get request language
			var requestLanguage = commonSettings.language(document.documentElement.lang || 'es');
			
			// Initialize i18next for translations
			i18next.init({  
				lng: requestLanguage,
				resources: commonTranslations
			}, 
			function () {
					// https://github.com/i18next/jquery-i18next#initialize-the-plugin
					//jqueryI18next.init(i18next, $);
					// Localize UI
					//$('.nav').localize();
			});

			// Load settings
			commonLoader.show();
			commonSettings.loadSettings(function(data){
				commonLoader.hide();

				debugger;
				// Extend the model
				self.model = {
					...self.model,
					// Rental location availabily control
					isRentalLocationSelectorAvailable: !self.model.rentalLocation && data.selectRentalLocation, // selectRentalLocation?
					// Family availabily control
					isFamilySelectorAvailable: !self.model.category && !self.model.family && data.useRentingFamilies, // selectFamily?
					// Category availabily control
					isCategorySelectorAvailable: !self.model.category && data.productType === 'category_of_resources',
					configuration: data,
					requestLanguage,
					date: {
						...self.model.date,
						server: data.serverDate,
					}
				};

				// Configure events
				self.setEvents({ parent: self, 
												 target: self.model.planningHTML.find('.mybooking-planning-head'), 
												 columnsWidth: self.model.cells.width });
			});
		},

		/**
		 * Set Events
		*/
		setEvents: function(settings) {
			var target = document.getElementById(settings.parent.model.targetId);
			target.addEventListener('refresh', settings.parent.refresh.bind(settings.parent));
			target.dispatchEvent(new CustomEvent('refresh', { detail: { settings, 
																																	callback: planningActionBar.init.bind(planningActionBar) }}));
			
			// Bind the event to show detailed product
			$('.mybooking-planning-table').on('click', '.js-product-info-btn', (event) => {
				const target = event.target;
				console.log('click');
				console.log(target);
				console.log($(this));
				console.log($(this).attr('data-product'));
				this.productDetailIconClick($(target).attr('data-product'));
			});  
		},

		/**
		* Show product detail
 		*/
		showProductDetail: function() {
      if (document.getElementById('script_product_modal')) {
        var result = tmpl('script_product_modal')({
                        product: this.model.productDetail
                      });

        // Compatibility with bootstrap modal replacement (from 1.0.0)
        if ($('#modalProductDetail_MBM').length) {
					$('#modalProductDetail_MBM .modal-product-detail-title').html(this.model.productDetail.name);
					$('#modalProductDetail_MBM .modal-product-detail-content').html(result);
				} else {
					$('#modalProductDetail .modal-product-detail-title').html(this.model.productDetail.name);
					$('#modalProductDetail .modal-product-detail-content').html(result);
				}   

        // Show the product in a modal
        commonUI.showModal('#modalProductDetail', function(event, modal){ // on Show
                                                    setTimeout(function(){  
                                                      if ( $('.mybooking-carousel-inner').length ) {  
                                                        commonUI.showSlider('.mybooking-carousel-inner');
                                                      }
                                                      $('#modal_product_photos').on('click', function(){
                                                        $('.mybooking-modal_product-description').hide();
                                                        $('.mybooking-modal_product-container').show();
                                                        commonUI.playSlider('.mybooking-carousel-inner');
                                                      });
                                                      $('#modal_product_info').on('click', function(){
                                                        $('.mybooking-modal_product-container').hide();
                                                        $('.mybooking-modal_product-description').show();
                                                        commonUI.pauseSlider('.mybooking-carousel-inner');
                                                      });
                                                    }, 150);
                                                  },
                                                  function(event, modal) { // on Hide
                                                    commonUI.pauseSlider('.mybooking-carousel-inner');
                                                    commonUI.destroySlider('.mybooking-carousel-inner');
                                                  } 
                                                );
      }

    },

	};

	// -----------------------------------------

	/**
	 * Planning diary
	 */ 
	var planningDiary = {

		/**
		 * Initizialize
 		 */
		init: function() {

			//console.log('show');

			//commonLoader.show();
			
			var self = this;

			$('.mybooking-rent-planning .mybooking-planning-content').each(function(index, item) {
				
				// Unique id for instance
				var id = $(item).attr('id');
				var planningHTML = $('#' + id);

				// Information about cells
				var cells;
				if (planningHTML.attr('data-direction') === 'columns') {
					// Columns direction
					cells = {
						width: 150,
						height: 40,
					};
				} else {
					// Rows direction
					cells = {
						width: 60,
						height: 60,
					};
				}

				// Settings
				var settings = {
					planningHTML,
					target: planningHTML.find('.mybooking-planning-table'),
					targetId:  id + '-table',
					family: planningHTML.attr('data-family-code') || null,
					category: planningHTML.attr('data-category-code') || null,
					items: planningHTML.attr('data-items'),
					rentalLocation: planningHTML.attr('data-rental-location-code') || null,
					direction: planningHTML.attr('data-direction'),
					type: planningHTML.attr('data-type'),
					cells,
					interval: planningHTML.attr('data-interval') || null,
				};
				settings.target.attr('id', settings.targetId);

				// Create a Planning instance
				self.factory(settings).init();
			});
		},

		/**
		 * Factory to create Planning instances
		*/
		factory: function(obj) {
			// The proptotype => Clones the model, controller and view
			Planning.prototype = {
				...model, // Appends the model (cloning)
				...controller, // Appends the controller (cloning)
				...view, // Appends the view (cloning)
			};
			// Creates a new instance of the planning
			return new Planning(obj); 
		},

	};

	planningDiary.init();
});