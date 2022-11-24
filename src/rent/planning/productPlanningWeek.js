/******
 *
 * Renting Module ProductPlannigWeek
 *
 */
 require(['jquery', 'i18next', 'commonServices', 'commonSettings', 'commonLoader', 'YSDFormatter', 'commonTranslations', 'moment', './productPlanningWeekActionBar', 'jquery.i18next'],
 function($, i18next, commonServices, commonSettings, commonLoader, YSDFormatter, commonTranslations, moment, productPlanningWeekActionBar) {

	/**
	 * Contructor
	*/
	function ProductPlannigWeek ({ planningHTML, target, targetId, category }) {
		/**
		 * ProductPlannigWeek data model
		*/
		this.model = {
			planningHTML,
			target,
			targetId,
			category,
			schedule: [],
			planning: [],
			ocupation: [],
			realCalendar: [],
			calendar: [],
			api_date_format: 'YYYY-MM-DD',
			date: {
				actual: undefined,
				server: undefined,
			},
			selectedRange: [],
			isDragActive: false,
		};
	}

	const model = {
		/**
		 * Get calendar
		*/
		getCalendar: function({ from, to }) {
			const url = commonServices.URL_PREFIX + '/api/booking/frontend/dates?api_key=' + commonServices.apiKey + '&from=' + from + '&to=' + to;

			return new Promise(resolve => {
				$.ajax({
					url: url
				}).done(function(data) {
					resolve(data);
				});
			});
		},

		/**
		 * Get  schedule
		*/
		getProductSchedule: function({ date }){
			let url = commonServices.URL_PREFIX;
			const urlParams = [];

      if (commonServices.apiKey && commonServices.apiKey != '') {
        urlParams.push('api_key=' + commonServices.apiKey);
      }  
      urlParams.push('date=' + date);
			urlParams.push('product=' + this.model.category);

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
				}).done((data) => {
					if (data.length>0 && typeof data[0] === 'object') {
						const formatData = [];

						data.forEach((item) => {
							formatData.push(...this.getTimeRanges({ from: item.time_from, to: item.time_to, interval: 30 }));
						});

						resolve(formatData);
					} else {
						resolve(data);
					}
				});
			});
		},

		/**
		 * Get planning
		*/
		getProductPlanning: function({ from, to }){
			let url = commonServices.URL_PREFIX + '/api/booking/frontend/planning';
			const urlParams = [];

      if (commonServices.apiKey && commonServices.apiKey != '') {
        urlParams.push('api_key=' + commonServices.apiKey);
      }  
      urlParams.push('from=' + from);
			urlParams.push('to=' + to);
			urlParams.push('category=' + this.model.category);

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

    /**
     * Calculate price (build the shopping cart and choose the product)
     */
    doReservation: function() {

      var dataRequest = this.buildDataRequest();
      var dataRequestJSON =  encodeURIComponent(JSON.stringify(dataRequest));
      // Build the URL
      var url = commonServices.URL_PREFIX + '/api/booking/frontend/shopping-cart';
      if (this.shoppingCartId == null) {
        this.shoppingCartId = this.getShoppingCartFreeAccessId();
      }
      if (this.shoppingCartId) {
        url+= '/'+this.shoppingCartId;
      }
      var urlParams = [];
      if (this.requestLanguage != null) {
        urlParams.push('lang='+this.requestLanguage);
      }
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
          if (self.shoppingCartId == null || self.shoppingCartId != data.shopping_cart.free_access_id) {
            self.shoppingCartId = data.shopping_cart.free_access_id;
            self.putShoppingCartFreeAccessId(self.shoppingCartId);
          }
          self.shopping_cart = data.shopping_cart;
          self.product_available = data.product_available;
          if (data.products && Array.isArray(data.products) && data.products.length > 0) {
            self.product = data.products[0];
          }
          else {
            self.product = null;
          }
          productView.update('shopping_cart');
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
     * Build data request
     * (TODO Custom pickup/return place)
     */
    buildDataRequest: function() {

      var data = {date_from: moment(this.selectedDateFrom).format('DD/MM/YYYY'),
                  date_to: moment(this.selectedDateTo).format('DD/MM/YYYY'),
                  category_code: this.code,
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

      if (this.configuration.rentTimesSelector === 'hours') { 
        // Hours
        data.time_from = $(this.time_from_selector).val();
        data.time_to = $(this.time_to_selector).val();
      }
      else if (this.configuration.rentTimesSelector === 'time_range') {
        var timeRange = null;
        if ($(this.turn_selector_hidden).length) {
          // Hidden with one value
          var timeRange = $(this.turn_selector_hidden).val();
        }
        else {
          // Radio with multiple values
          var timeRange = $(this.turn_selector_val).val();
        }
        if (timeRange != null && timeRange != '') {
          var times = timeRange.split('-');
          if (times.length == 2) {
            data.time_from = times[0];
            data.time_to = times[1]; 
          }
        }
      }
  
      return data;

    }  




	};

	const controller = {
		/**
		 * Send selected ranges
		*/
		sendSelectedRanges: function(){
			/**
			 * Format
			 */
			const data = {};
			this.model.selectedRange.forEach(({date, time})=> {
				if (!data[date]){
					data[date] = [];
				}

				data[date].push(time);
			});

			const formatedData = {}
			for (const key in data) {
				data[key] = data[key].sort();
				formatedData[key] = [];

				let nextArray = {};
				let timesArray = {};
				data[key].forEach((time, index) => {
					const prev = index === 0 ? 0 : index - 1;
	
					if (index === 0) {
						timesArray.time_from = data[key][index];
					} else if (nextArray.time_from){
						timesArray.time_from = nextArray.time_from;
						nextArray = {};
					} 

					if (this.getTimeRanges({from: data[key][prev], to:  data[key][index]}).length > 2) {
						timesArray.time_to = data[key][prev];
						formatedData[key].push(timesArray);
						timesArray = {};
						nextArray.time_from = data[key][index];
					}

					if ( index === data[key].length - 1) {
						if (nextArray.time_from) {
							timesArray.time_from = data[key][index];
						} 

						timesArray.time_to = data[key][index];
						formatedData[key].push(timesArray);
						timesArray = {};
					}
				});
			}
			console.log(formatedData);
		},

		/**
		 * Paint selected hours
		*/
		paintHours: function() {
			this.model.selectedRange.forEach(({date, time}) => {
				const activeCells = this.model.target.find('div.mybooking-product-planning-week-td-content[data-date="' + date + '"][data-time="' + time + '"]');
						activeCells.addClass('selected');
			});
		},

		/**
		 * Select hours
		*/
		selectHours: function(event) {
			const target = $(event.currentTarget);
			
			const data = {
				date: target.attr('data-date'),
				time: target.attr('data-time'),
			};

			if (target.hasClass('selected')) {
				this.model.selectedRange = this.model.selectedRange.filter((item) => item.date !== data.date || item.time !== data.time );
				target.removeClass('selected');
			} else {
				this.model.selectedRange.push(data);
				target.addClass('selected');
			}
		},

		/**
		 * Paint ocupations
		*/
		paintRanges: function(item) {
			if (item.range) {
				item.range.forEach((range) => {
					const activeCells = this.model.target.find('div.mybooking-product-planning-week-td-content[data-date="' + item.from.date_from + '"][data-time="' + range + '"]');
					activeCells.addClass('full');
				});
			} else {
				item.from.range.forEach((range) => {
					const activeCells = this.model.target.find('div.mybooking-product-planning-week-td-content[data-date="' + item.from.date_from + '"][data-time="' + range + '"]');
					activeCells.addClass('full');
				});
				if (item.between.dateRange.length > 0) {
					item.between.dateRange.forEach((date) => {
						item.between.range.forEach((range) => {
							const activeCells = this.model.target.find('div.mybooking-product-planning-week-td-content[data-date="' + date + '"][data-time="' + range + '"]');
							activeCells.addClass('full');
						});
					});
				}
				item.to.range.forEach((range) => {
					const activeCells = this.model.target.find('div.mybooking-product-planning-week-td-content[data-date="' + item.to.date_to + '"][data-time="' + range + '"]');
					activeCells.addClass('full');
				});
			}			
		},

		/**
		 * Draw ocupation status 
		*/
		showOcupation: function() {
			this.model.ocupation.forEach((item) => this.paintRanges(item));
		},

		/**
		 * Get ocupation data
		*/
		getOcupation: function() {
			this.model.planning.forEach((element) => {
				if (element.urges.length > 0) {
					element.urges.forEach((item) => {
						let newElement = {
							id: element.id,
							from: {
								date_from: item.date_from, 
								time_from: item.time_from, 
							},
							to: {
								date_to: item.date_to,
								time_to: item.time_to,
							},
						};

						const from = moment(item.date_from);
						const to = moment(item.date_to);
						if (!from.isSame(to)) {
							newElement = {
								...newElement,
								from: {
									...newElement.from,
									range: this.getTimeRanges({ from: item.time_from, to: this.model.schedule.slice(-1).pop(), interval: 30 })
								},
								between: {
									dateRange: this.getDatesBetweenTwoDates({ from, to }),
									range: from.isBefore(to) && from.add(1, 'd').isBefore(to) ? this.getTimeRanges({ from: this.model.schedule[0], to: this.model.schedule.slice(-1).pop(), interval: 30 }) : []
								},
								to: {
									...newElement.to,
									range: this.getTimeRanges({ from: this.model.schedule[0], to: item.time_to, interval: 30 })
								}
							};
						} else {
							newElement = {
								...newElement,
								range: this.getTimeRanges({ from: item.time_from, to: item.time_to, interval: 30 })
							};
						}

						this.model.ocupation.push(newElement);
					});
				}
			});

			this.showOcupation();
		},

		/**
		 * Draw planning
		*/
		drawPlanning ({ rows, columns }) {
			const mydate = new Date(columns[0]);
			const year = mydate.getFullYear();
			const month = mydate.toLocaleString(commonSettings.language(document.documentElement.lang) || 'es', { month: 'long' }).toUpperCase();
			this.model.planningHTML.find('.mybooking-product-planning-week-title').html(`${month},  ${year}`);

			let  html = '<div class="mybooking-product-planning-week-container"><table>';
				/**
				 * Head
				 */
				html += '<thead><tr>';
		
				columns.forEach(function(item) {
					const mydate = new Date(item);
					const day = mydate.getDate();
					const weekday = mydate.toLocaleString(commonSettings.language(document.documentElement.lang) || 'es', { weekday: 'short' }).toUpperCase();

					description = '<b style="font-size: 20px;">' + day + '</b><br>' + weekday;
		
					html += '<th>';
						html += description;
					html += '</th>';
				});
				html += '</tr></thead>';
		
				/**
				 * Body
				 */
				html += '<tbody>';
					rows.forEach((item) => {
						html += '<tr>';
						columns.forEach((element) => {
							const isClosed = !this.model.calendar.includes(element);
							const closedClass = isClosed ? ' closed' : '';
		
							html += '<td>';
								html += '<div data-time="' + item + '" data-date="' + element  + '" class="mybooking-product-planning-week-td-content noselect' + closedClass + '">' + item +  '</div>';
							html += '</td>';
						});
						html += '</tr>';
					});
				html += '</tbody>';
			html += '</table></div>';
			
			return html;
		},

		/**
		 * Get ranges between from and to time
		*/
		getTimeRanges: function({ from, to, interval }) {
			if (!from || !to){
				return [];
			} 

			if (!interval){
				interval = 30;
			}

			function getMinutes(time) {
				const arrayTime = time.split(':').map(Number);
				return arrayTime[0] * 60 + arrayTime[1];
			}
		
			function getTime(minutes) {
				let hours = minutes / 60 | 0;
				if (hours.toString().length < 2) {
					hours = '0' + hours;
				}
				minutes %= 60;
				return hours + ':' + (minutes < 10 ? '0' + minutes : minutes);
			}

			let range = [],
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
		 * Get real dates between two dates
		*/
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
				planning: [],
				ocupation: [],
				realCalendar: [],
				calendar: [],
			};

			if (commonServices.URL_PREFIX && commonServices.URL_PREFIX !== '' && commonServices.apiKey && commonServices.apiKey !== '') {
				const startDate = this.model.date.actual;
				const calendarEndDate = YSDFormatter.formatDate(moment(new Date(startDate)).add(14, 'd'), this.model.api_date_format);
				const endDate = YSDFormatter.formatDate(moment(new Date(startDate)).add(7, 'd'), this.model.api_date_format);

				this.model.calendar = await this.getCalendar({ from: startDate, to: calendarEndDate });
				this.model.realCalendar = this.getDatesBetweenTwoDates({ from:  startDate, to: endDate });

				this.model.schedule = await this.getProductSchedule({ date:  YSDFormatter.formatDate(moment(new Date(startDate)).add(1, 'd'), this.model.api_date_format) }); // TODO (horario estandarizado)
				this.model.planning = await this.getProductPlanning({ from: startDate, to: endDate });

				if (this.model.realCalendar.length > 0 && this.model.schedule.length > 0) {
					const settings = {
						columns: this.model.realCalendar,
						rows: this.model.schedule,
					};

					const html = this.drawPlanning(settings);
					this.model.target.html(html);

					this.getOcupation(startDate);
					this.paintHours();
				} else {
					const html = i18next.t('planning.no_data_found');

					this.model.target.html(`<div class="text-center">${html}</div>`);
				}

				if (event && event.detail && event.detail.callback) {
					event.detail.callback({ settings: event.detail.settings });
				}
			} else {
				const html = i18next.t('planning.api_conexion_error');

				this.model.target.html(`<div class="text-center">${html}</div>`);
			}	

			console.log('Model: ', this.model);
			
			commonLoader.hide();
		},
	};

	const view = {
		isMobile: function(){
			return window.matchMedia('only screen and (hover: none) and (pointer: coarse)').matches;
		},

		/**
		 * Set Events
		*/
		setEvents: function(settings) {
			const target = document.getElementById(settings.parent.model.targetId);

			target.addEventListener('refresh', settings.parent.refresh.bind(settings.parent));

			target.dispatchEvent(new CustomEvent('refresh', { detail: { settings, callback: productPlanningWeekActionBar.init.bind(productPlanningWeekActionBar) }}));

			const selectorTarget = '.mybooking-product-planning-week-td-content:not(.full):not(.closed)';

			if (this.isMobile()) {
				this.model.target.off('touchmove');
				this.model.target.on('touchmove', 'tbody', (event) => {
					// console.log('touchmove', event);
					// TODO
				});
			} else {
				this.model.target.off('mousedown');
				this.model.target.on('mousedown', selectorTarget, (event) => {
					// console.log('mousedown', event);
					this.selectHours(event);
					this.model.isDragActive = true;
				});

				this.model.target.off('mouseover');
				this.model.target.on('mouseover', selectorTarget, (event) => {
					if (this.model.isDragActive) {
						// console.log('mouseover', event);
						this.selectHours(event);
					}
				});

				this.model.target.off('mouseup');
				this.model.target.on('mouseup', selectorTarget, (event) => {
					// console.log('mouseup', event);
					this.model.isDragActive = false;
				});

				this.model.target.off('mouseleave');
				this.model.target.on('mouseleave', 'tbody, .mybooking-product-planning-week-td-content.full, .mybooking-product-planning-week-td-content.closed', (event) => {
					// console.log('mouseleave', event);
					this.model.isDragActive = false;
				});
			}

			this.model.planningHTML.find('.mybooking-send-btn').off('click');
			this.model.planningHTML.find('.mybooking-send-btn').on('click', (event) => {
				this.sendSelectedRanges();
			});

			// TODO submit form[name=mybooking_product_week_planning_reservation] => view.gotoNextStep

		},

		/**
		 * Initizialize
		*/
		init: function() {
			const requestLanguage = commonSettings.language(document.documentElement.lang);
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

			commonSettings.loadSettings((data) => {
				this.model = {
					...this.model,
					configuration: data,
					requestLanguage,
					date: {
						...this.model.date,
						actual: data.serverDate,
						server: data.serverDate,
					}
				};

				this.setEvents({ parent: this, target: this.model.planningHTML.find('.mybooking-product-planning-week-head') });
			});
		},

    /**
     * Go to the next step when the user clicks on Book Now!
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

	const planningDiary = {
		/**
		 * Factory
		*/
		factory: function(obj) {
			ProductPlannigWeek.prototype = {
				...model,
				...controller,
				...view,
			};

			return new ProductPlannigWeek(obj); 
		},

		/**
		 * Initizialize
		*/
		init: function() {
			commonLoader.show();

			$('.mybooking-rent-product-planning-week .mybooking-product-planning-week-content').each((index, item) => {
				const id = $(item).attr('id'); /** Unique id for instance */

				const planningHTML = $(`#${id}`);

				const settings = {
					planningHTML,
					target: planningHTML.find('.mybooking-product-planning-week-table'),
					targetId:  `${id}-table`,
					category: planningHTML.attr('data-category-code'),
				};
				settings.target.attr('id', settings.targetId);

				this.factory(settings).init();
			});
		},
	};

	planningDiary.init();
});