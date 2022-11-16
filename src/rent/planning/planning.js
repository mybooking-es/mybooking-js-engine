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
				server: undefined,
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
			var url = commonServices.URL_PREFIX + '/api/booking/frontend/products?api_key=' + commonServices.apiKey;

			return new Promise(resolve => {
				$.ajax({
					url: url
				}).done(function(response) {
					resolve(response.data);
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
			if (this.model.category !== 'all') {
				urlParams.push('product='+this.model.category);
			}

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
			urlParams.push('rental_location_code='+ this.model.rentalLocationCode);

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
				if (moment(from).isBefore(serverDate) || moment(from).isSame(serverDate) || item === from) {
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

			if (actualDay) {
				if (actualDay == 'from' || actualDay == 'both') {
					var to = this.model.schedule.slice(-1).pop();
				}
	
				if (actualDay != 'from' || moment(from, 'hh:mm').isBefore(moment(this.model.schedule[0], 'hh:mm'))) {
					var from = this.model.schedule[0];
				}
			}

			return this.getTimeRanges({ from, to, interval });
		},

		paintRanges: function(item) {
			var that = this;

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
					if (index === 0) {
						classes += 'from';
					} 
	
					if (index === item.range.length - 1) {
						classes += ' to';
					}
				}

				var label = item.label !== undefined ? item.label : '';
				var time_from = item.time_from !== undefined ? item.time_from : '';
				var time_to = item.time_to !== undefined ? item.time_to : '';
				var time = time_from !== '' && time_to !== '' ? time_from + ' - ' + time_to : '';
				label += label !== '' && time !== '' ? ' - ': '';
				label += time;

				var activeCells = that.model.target.find('div.mybooking-planning-td-content[data-id="' + item.id + '"][data-time="' + range + '"]');
				activeCells.addClass('full').addClass(classes);
				activeCells.attr('title', label);
			});
		},

		/**
		 * Draw ocupation status 
		*/
		showOcupation: function(paramDate) {
			var that = this;

			this.model.ocupation.forEach(function(item) {
				that.paintRanges(item);
			});

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
			var that = this;

			this.model.resources.forEach(function(element) {
				if (element.urges.length > 0) {
					element.urges.forEach(function(item) {
						var formatDate = moment(paramDate);
						var from = moment(item.date_from);
						var to = moment(item.date_to);
						var label = '';

						if (formatDate.isSame(from) ||  formatDate.isSame(to) || (formatDate.isAfter(from) && formatDate.isBefore(to))) {
							if (!from.isSame(to)) {
								var actualDay;
								if (formatDate.isSame(from)){
									actualDay = 'from';
								} else if (formatDate.isSame(to)){
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
									actualDay,
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

			

			if (commonServices.URL_PREFIX && commonServices.URL_PREFIX !== '' && commonServices.apiKey && commonServices.apiKey !== '') {
				var calendarDate = this.model.date.server;
				this.model.calendar = await this.getCalendar({ from: calendarDate, to: YSDFormatter.formatDate(moment(new Date(calendarDate)).add(1, 'M'), this.model.api_date_format)});

				this.model.date.server = moment(calendarDate).isSame(moment(this.model.calendar[0])) ? calendarDate : this.model.calendar[0];
				if (moment(this.model.date.server).isAfter(moment(this.model.date.actual))) {
					this.model.date.actual = this.model.date.server;
				}

				var date = this.model.date.actual;

				if (this.model.type === 'diary') {
					this.model.schedule = await this.getSchedule({ date: date });
				} else {
					this.model.schedule = await this.getCalendar({ from: date, to: YSDFormatter.formatDate(moment(new Date(date)).add(15, 'd'), this.model.api_date_format)});
				}

				this.model.resources = await this.getPlanning({ from: date, to: date});

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
						actual: data.serverDate,
						server: data.serverDate,
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
			var that = this;

			$('.mybooking-rent-planning .mybooking-planning-content').each(function(index, item) {
				var id = $(item).attr('id'); /** Unique id for instance */

				var planningHTML = $('#' + id);

				var cells;
				if (planningHTML.attr('data-direction') === 'columns') {
					cells = {
						width: 150,
						height: 40,
					};
				} else {
					cells = {
						width: 100,
						height: 60,
					};
				}

				var settings = {
					planningHTML,
					target: planningHTML.find('.mybooking-planning-table'),
					targetId:  id + '-table',
					category: planningHTML.attr('data-category-code'),
					rentalLocationCode: planningHTML.attr('data-rental-location-code'),
					direction: planningHTML.attr('data-direction'),
					type: planningHTML.attr('data-type'),
					cells,
				};
				settings.target.attr('id', settings.targetId);

				that.factory(settings).init();
			});
		},
	};

	planningDiary.init();
});