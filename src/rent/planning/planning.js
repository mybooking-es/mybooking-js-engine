/******
 *
 * Renting Module Planning
 *
 */
 require(['jquery', 'i18next', 'commonServices', 'commonSettings', 'commonLoader', 'YSDFormatter', 'commonTranslations', 'moment', './planningActionBar', 'jquery.i18next'],
 function($, i18next, commonServices, commonSettings, commonLoader, YSDFormatter, commonTranslations, moment,planningActionBar) {

	/**
	 * Contructor
	*/
	function Planning ({ planningHTML, target, targetId, type, category, direction, rentalLocationCode, cells }) {
		/**
		 * Planning data model
		*/
		this.model = {
			planningHTML,
			target,
			targetId,
			type: type || 'diary',
			category: category || 'all',
			direction: direction || 'columns',
			schedule: [],
			resources: [],
			ocupation: [],
			calendar: [],
			categories: [],
			rentalLocationCode,
			api_date_format: 'YYYY-MM-DD',
			date: {
				actual: undefined,
				range: [],
			},
			cells: cells || {
				width: 150,
				height: 40,
			},
		};
	}

	var model = {
		/**
		 * Get categories
		 */
		 getCategories: function() {
			var url = commonServices.URL_PREFIX + '/api/booking/frontend/categories?api_key=' + commonServices.apiKey;

			return new Promise(resolve => {
				$.ajax({
					url: url
				}).done(function(data) {
					resolve(data);
				});
			});
		},
		/**
		 * Get calendar
		*/
		getCalendar: function({from, to}) {
			var url = commonServices.URL_PREFIX + '/api/booking/frontend/dates?api_key=' + commonServices.apiKey + '&from=' + from + '&to=' + to;

			return new Promise(resolve => {
				$.ajax({
					url: url
				}).done(function(data) {
					resolve(data);
				});
			});
		},

		/**
		 * Get day schedule
		*/
		getSchedule: function({ date }){
			var that = this;
			var url = commonServices.URL_PREFIX;
			var urlParams = [];

      if (commonServices.apiKey && commonServices.apiKey != '') {
        urlParams.push('api_key='+commonServices.apiKey);
      }  
      urlParams.push('date='+date);

			switch (this.model.configuration.rentTimesSelector) {
				case 'hours':
					if (this.model.category === 'all') {
						url += '/api/booking/frontend/times';
					} else {
						url += '/api/booking/frontend/' + this.model.category + '/times';
					}
				break;
				
				case 'time_range':
						if (this.model.category === 'all') {
							url += commonServices.URL_PREFIX + '/api/booking/frontend/turns';
						} else {
							url += commonServices.URL_PREFIX + '/api/booking/frontend/products/' + this.model.category + '/turns';
						}
				break;
				default:
					break;
			}

      if (urlParams.length > 0) {
        url += '?';
        url += urlParams.join('&');
      }

			return new Promise(resolve => {
				$.ajax({
					url: url
				}).done(function(data) {
					if (data.length>0 && typeof data[0] === 'object') {
						var formatData = [];

						data.forEach(function(item) {
							formatData.push(...that.getTimeRanges({ from: item.time_from, to: item.time_to, interval: 30 }));
						});

						resolve(formatData);
					} else {
						resolve(data);
					}
				});
			});
		},

		/**
		 * Get day planning
		*/
		getPlanning: function({ from, to }){
			var url = commonServices.URL_PREFIX + '/api/booking/frontend/planning';
			var urlParams = [];

      if (commonServices.apiKey && commonServices.apiKey != '') {
        urlParams.push('api_key='+commonServices.apiKey);
      }  
      urlParams.push('from='+from);
			urlParams.push('to='+to);
			urlParams.push('rental_location_code='+1); // TODO

			if (this.model.category !== 'all') {
				urlParams.push('category='+this.model.category);
			}

			if (urlParams.length > 0) {
        url += '?';
        url += urlParams.join('&');
      }

			return new Promise(resolve => {
				$.ajax({
					url: url
				}).done(function(data) {
					resolve(data);
				});
			});
		},
	};

	var controller = {
		/**
		 * Get ocupation range and put in list data 
		*/
		getOcupation15Range: function({from, to}) {
			var that = this;
			var serverDate = moment(this.model.configuration.serverDate);
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
				if (moment(from).isBefore(serverDate) || item === from) {
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
		getTimeRanges: function({ from, to, interval }) {
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
		getOcupationDiaryRange: function({from, to, interval, actualDay}) {
			if(!from || !to || !interval) {
				return [];
			}

			if (actualDay == 'from') {
				var to = this.model.schedule.slice(-1).pop();
			} else if(actualDay == 'to') {
				var from = this.model.schedule[0];
			} else if(actualDay == 'both') {
				var to = this.model.schedule.slice(-1).pop();
				var from = this.model.schedule[0];
			}

			return this.getTimeRanges({ from, to, interval });
		},
		paintRanges: function({ length, item }) {
			var that = this;
			
			var centralItem = Math.floor( length / 2);
			var isEven = length % 2 == 0 ? 'even' : 'odd';

			item.range.forEach(function(range, index) {
				var classes = '';
				if (index === 0) {
					classes += 'from';
				} 
				if (index === length - 1) {
					classes += ' to';
				}

				var label = item.label !== undefined ? item.label : '';
				var time_from = item.time_from !== undefined ? item.time_from : '';
				var time_to = item.time_to !== undefined ? item.time_to : '';
				var time = time_from !== '' && time_to !== '' ? time_from + ' - ' + time_to + '<br>' : '';

				that.model.target.find('div.mybooking-planning-td-content[data-id="' + item.id + '"][data-time="' + range + '"]').addClass('full').addClass(classes);

				if (index === centralItem) {
					that.model.target.find('div.mybooking-planning-td-content[data-id="' + item.id + '"][data-time="' + range + '"]').parent().append('<div class="mybooking-planning-range-text ' + isEven  + '">' + time + '<small>' + label + '</small></div>');
				}
			});
		},

		/**
		 * Draw ocupation status 
		*/
		showOcupation15: function(paramDate) {
			var that = this;

			this.model.ocupation.forEach(function(item) {
				that.paintRanges({ length: item.range.length, item});
			});
		},
		showOcupationDiary: function(paramDate) {
			var that = this;

			this.model.ocupation.forEach(function(item) {
				var length = item.range.length;
				var range = [...item.range];

				var [scheduleHour, scheduleMinutes] = that.model.schedule[0].split(':');
				var [itemFromHour, itemFromMinutes] = item.range[0].split(':');
				var [itemToHour, itemToMinutes] = item.range.slice(-1).pop().split(':');

				var hourIsMinor = false;
				var minutesAreMinor = false;

				if (window.parseInt(scheduleHour) < window.parseInt(itemToHour) || (window.parseInt(scheduleHour) == window.parseInt(itemToHour) && window.parseInt(scheduleMinutes) <= window.parseInt(itemToMinutes))){
					hourIsMinor = window.parseInt(scheduleHour) > window.parseInt(itemFromHour);
					if (!hourIsMinor) {
						minutesAreMinor = window.parseInt(scheduleMinutes) > window.parseInt(itemFromMinutes);
					}
				}

				if (hourIsMinor || minutesAreMinor) {
					range = that.getOcupationDiaryRange({from: that.model.schedule[0], to: item.range.slice(-1).pop(), interval: 30, actualDay: paramDate});
					length = range.length;
				}

				that.paintRanges({ length: length, item});
			});
		},
		showOcupation: function(paramDate) {
			if (this.model.type === 'diary') {
				this.showOcupationDiary(paramDate);
			} else {
				this.showOcupation15(paramDate);
			}

			/*
			* Format 
			*/
			this.model.target.find('table tbody th').css('height', this.model.cells.height + 'px');
			this.model.target.find('table tbody td').css('height', this.model.cells.height + 'px');

			this.model.target.find('table').addClass('mybooking-planning-table-direction-' + this.model.direction);
			this.model.target.find('table.mybooking-planning-table-direction-columns tbody td .mybooking-planning-range-text.even').css('margin-top', (this.model.cells.height * -1) + 'px');

			this.model.target.find('table.mybooking-planning-table-direction-rows tbody td .mybooking-planning-range-text.even').css('margin-left', (this.model.cells.width * -1) + 'px');
		},

		/**
		 * Get ocupation data
		*/
		getOcupation: function(paramDate) {
			var that = this;

			this.model.resources.forEach(function(element) {
				if (element.urges.length > 0) {
					element.urges.forEach(function(item) {
						var formatDate = moment(YSDFormatter.formatDate(paramDate, that.model.api_date_format) );
						var from = moment(item.date_from);
						var to = moment(item.date_to);
						var label = '';

						if (formatDate.isSame(from) ||  formatDate.isSame(to) || (formatDate.isAfter(from) && formatDate.isBefore(to))) {
							if (!from.isSame(to)) {
								var actualDay;
								if (formatDate.isSame(from)){
									actualDay = 'from';
								} else if(formatDate.isSame(to)){
									actualDay = 'to';
								} else {
									actualDay = 'both';
								}

								/** Text in box */
								var dateFromString = that.model.configuration.formatDate(item.date_from);
								var dateToString = that.model.configuration.formatDate(item.date_to);
								var label = dateFromString + ' - ' + dateToString;
							}

							var newElement = {
								 id: element.id, 
								 label
							};
							if (that.model.type === 'diary') {
								newElement = {
									...newElement,
									time_from: item.time_from, 
									time_to: item.time_to,
									 range: that.getOcupationDiaryRange({ from: item.time_from, to: item.time_to, interval: 30, actualDay })
								};
							} else {
								newElement = {
									...newElement,
									date_from: item.date_from,
									date_to: item.date_to,
									range: that.getOcupation15Range({ from: item.date_from, to: item.date_to }),
								};
							}

							that.model.ocupation.push(newElement);
						}
					});
				}
			});

			this.showOcupation(paramDate);
		},

		/**
		 * Draw planning
		*/
		drawPlanning ({ rows, columns }) {
			var  html = '<div class="mybooking-planning-scrollable"><table >';
				/**
				 * Head
				 */
				html += '<thead><tr>';
				html += '<th class="mybooking-planning-td-fix"></th>';

				columns.forEach(function(item) {
					var description = item.id ? item.description : item;
					if (!item.id && !description.includes(':')) {
						description = YSDFormatter.formatDate(description);
					}

					html += '<th>';
						html += description;
					html += '</th>';
				});
				html += '</tr></thead>';

				/**
				 * Body
				 */
				var that = this;

				html += '<tbody>';
					rows.forEach(function(item) {
						var fixHead = item.description ? item.description : item;
						if (!item.id && !fixHead.includes(':')) {
							fixHead = YSDFormatter.formatDate(fixHead);
						}

						html += '<tr>';
						html += '<th class="mybooking-planning-td-fix">' + fixHead + '</th>';
						columns.forEach(function(element) {
							var time = element.id ? item : element;
							var id = element.id ? element.id : item.id;

							html += '<td>';
								html += '<div data-id="'+ id +'" data-time="' + time  + '" class="mybooking-planning-td-content"></div>';
							html += '</td>';
						});
						html += '</tr>';
					});
				html += '</tbody>';
			html += '</table></div>';
			
			return html;
		},

		/**
		 * Refresh table
		*/
		refresh: async function(event) {
			this.model = {
				...this.model,
				schedule: [],
				resources: [],
				ocupation: [],
				calendar: [],
			};

			var date = this.model.date.actual;

			if (commonServices.URL_PREFIX && commonServices.URL_PREFIX !== '' && commonServices.apiKey && commonServices.apiKey !== '') {
				if (this.model.type === 'diary') {
					this.model.schedule = await this.getSchedule({ date: YSDFormatter.formatDate(date, this.model.api_date_format) });
				} else {
					this.model.schedule = await this.getCalendar({ from: YSDFormatter.formatDate(this.model.date.actual, this.model.api_date_format), to: YSDFormatter.formatDate(moment(this.model.date.actual).add(15, 'd'), this.model.api_date_format)});
				}

				this.model.resources = await this.getPlanning({ from: YSDFormatter.formatDate(date, this.model.api_date_format), to: YSDFormatter.formatDate(date, this.model.api_date_format)});

				var calendarDate = new Date(this.model.configuration.serverDate);
				this.model.calendar = await this.getCalendar({ from: YSDFormatter.formatDate(calendarDate, this.model.api_date_format), to: YSDFormatter.formatDate(moment(calendarDate).add(1, 'M'), this.model.api_date_format)});

				this.model.categories = await this.getCategories();

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

					var html = this.drawPlanning(settings);
					this.model.target.html(html);
					this.getOcupation(date);
				} else {
					var html = i18next.t('planning.no_data_found');

					this.model.target.html(html);
				}	

				if (event && event.detail && event.detail.callback) {
					var total = this.model.direction === 'columns' ? this.model.resources.length : this.model.schedule.length;

					event.detail.callback({ settings: event.detail.settings, total: total, category: this.model.category });
				}

			} else {
				var html = i18next.t('planning.api_conexion_error');

				this.model.target.html(html);
			}	

			console.log('Model: ', this.model);
		},
	};

	var view = {
		/**
		 * Set Events
		*/
		setEvents: function(settings) {
			var target = document.getElementById(settings.parent.model.targetId);

			target.addEventListener('refresh', settings.parent.refresh.bind(settings.parent));

			target.dispatchEvent(new CustomEvent('refresh', { detail: { settings, callback: planningActionBar.init.bind(planningActionBar) }}));
		},

		/**
		 * Initizialize
		*/
		init: function() {
			commonLoader.show();

			var that = this;

			var requestLanguage = commonSettings.language(document.documentElement.lang);
			// Initialize i18next for translations
			i18next.init({  
				lng: requestLanguage,
				resources: commonTranslations
			}, 
			function (error, t) {
					// https://github.com/i18next/jquery-i18next#initialize-the-plugin
					//jqueryI18next.init(i18next, $);
					// Localize UI
					//$('.nav').localize();
			});

			commonSettings.loadSettings(function(data){
				that.model = {
					...that.model,
					configuration: data,
					requestLanguage,
					date: {
						...that.model.date,
						actual: new Date(data.serverDate),
					}
				};

				that.setEvents({ parent: that, target: that.model.planningHTML.find('.mybooking-planning-head'), columnsWidth: that.model.cells.width });

				commonLoader.hide();
			});
		}
	};

	var planningDiary = {
		/**
		 * Factory
		*/
		factory: function(obj) {
			Planning.prototype = {
				...model,
				...controller,
				...view,
			};

			return new Planning(obj); 
		},

		/**
		 * Initizialize
		*/
		init: function() {
			var id = 'planning-1'; /** Unique id for instance */
			var targetId =  id + '-table';
			var planningHTML = $('#' + id);

			var settings = {
				planningHTML,
				target: planningHTML.find('.mybooking-planning-table'),
				targetId,
				category: planningHTML.attr('data-category-code'),
				rentalLocationCode: planningHTML.attr('data-rental-location-code'),
				direction: planningHTML.attr('data-direction'),
				type: planningHTML.attr('data-type'),
			};
			settings.target.attr('id', targetId);

			var diary = this.factory(settings);
			diary.init();
		},
	};

	planningDiary.init();
});