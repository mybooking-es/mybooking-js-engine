/******
 *
 * Renting Module ProductPlannigWeek
 *
 */
 require(['jquery', 'i18next', 'commonServices', 'commonSettings', 'commonLoader', 'YSDFormatter', 'commonTranslations', 'moment', './productPlanningWeekActionBar', 'ysdtemplate', 'jquery.i18next'],
 function($, i18next, commonServices, commonSettings, commonLoader, YSDFormatter, commonTranslations, moment, productPlanningWeekActionBar, tmpl) {

	/**
	 * Contructor
	*/
	function ProductPlannigWeek ({ planningHTML, target, targetId, category, interval }) {
		/**
		 * ProductPlannigWeek data model
		*/
		this.model = {
			planningHTML,
			target,
			targetId,
			category,
			schedule: [],
			statusSchedule: [],
			planning: [],
			ocupation: [],
			realCalendar: [],
			calendar: [],
			api_date_format: 'YYYY-MM-DD',
			date: {
				actual: undefined,
				server: undefined,
				interval: interval !== null ? window.parseInt(interval) : 30,
			},
			selectedRange: [],
			isDragActive: false,
			isTimeRangeSended: false,
			isReservationSended: false,
			shoppingCartId: null,
			shopping_cart: null,
			product_available: null,
		};
	}

	const model = {
		/**
		 * Get calendar
		*/
		getCalendar: function({ from, to }) {
			let url = commonServices.URL_PREFIX + '/api/booking/frontend/dates';

			const urlParams = [];
			if (this.model.requestLanguage != null) {
        urlParams.push('lang='+this.model.requestLanguage);
      }
      if (commonServices.apiKey && commonServices.apiKey != '') {
        urlParams.push('api_key='+commonServices.apiKey);
      } 

			urlParams.push('from='+from);
			urlParams.push('to='+to);

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
		 * Get  schedule
		*/
		getProductSchedule: function({ from, to }){
			let url = commonServices.URL_PREFIX + '/api/booking/frontend/planning-timetable';
			const urlParams = [];

			if (this.model.requestLanguage != null) {
        urlParams.push('lang='+this.model.requestLanguage);
      }
      if (commonServices.apiKey && commonServices.apiKey != '') {
        urlParams.push('api_key=' + commonServices.apiKey);
      }  
      urlParams.push('from=' + from);
			urlParams.push('to=' + to);
			urlParams.push('product=' + this.model.category);

      if (urlParams.length > 0) {
        url += '?';
        url += urlParams.join('&');
      }

			return new Promise(resolve => {
				$.ajax({
					url: url
				}).done((data) => {
					const global = data.global;
					const status = data.detailed;
					this.model.statusSchedule = status;

					if (global.length>0 && typeof global[0] === 'object') {
						const formatData = [];

						global.forEach((item) => {
							formatData.push(`${item.time_from} - ${item.time_to}`);
						});

						resolve(formatData);
					} else {
						resolve(global);
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

			if (this.model.requestLanguage != null) {
        urlParams.push('lang='+this.model.requestLanguage);
      }
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
     * Store shopping cart free access ID in season
     */
		putShoppingCartFreeAccessId: function(value) {
			sessionStorage.setItem('shopping_cart_free_access_id', value);
		},

		/**
     * Get access id shopping
     */
		getShoppingCartFreeAccessId: function() {
			return sessionStorage.getItem('activities_shopping_cart_free_access_id');
		},

		/**
     * Update shopping card block
     */
		update: function() {
			const data = {
				shopping_cart: this.model.shopping_cart,
				configuration: this.model.configuration,
				product_available: this.model.product_available,
				product_type: this.model.configuration.productType,
				product: this.model.product,
				i18next: i18next
			};

      const html = tmpl('script_mybooking_product_week_planning_reservation_summary')(data);
			var target = this.model.planningHTML.find('#mybooking_product_week_planning_reservation_summary');
			target.html(html);
			
			const submitBtn = this.model.planningHTML.find('.add_to_shopping_cart_btn');
			// Add to shopping cart button
			if (submitBtn.attr('disabled')) {
				submitBtn.attr('disabled', false);
			}

			// Scroll the time ranges container
			if (target && typeof target.offset !== 'undefined' && typeof target.offset() !== 'undefined') {
				$('html, body').animate({
					scrollTop: target.offset().top
				}, 2000); 
			}
    },

    /**
     * Calculate price (build the shopping cart and choose the product)
     */
    doReservation: function() {
			this.model.isTimeRangeSended = false;

      var dataRequest = this.buildDataRequest();
			// console.log(dataRequest);

      var dataRequestJSON =  encodeURIComponent(JSON.stringify(dataRequest));

      // Build the URL
      var url = commonServices.URL_PREFIX + '/api/booking/frontend/shopping-cart';
      if (this.model.shoppingCartId == null) {
        this.model.shoppingCartId = this.getShoppingCartFreeAccessId();
      }
      if ( this.model.shoppingCartId) {
        url+= '/'+ this.model.shoppingCartId;
      }

      var urlParams = [];
      if (this.model.requestLanguage != null) {
        urlParams.push('lang='+this.model.requestLanguage);
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
          this.update();
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
			const selectedRanges = this.getSelectedRanges();
			const day = Object.keys(selectedRanges)[0];
			const daySelectedRanges = Object.values(selectedRanges)[0];

      const data = {
				date_from: YSDFormatter.formatDate(day, this.model.configuration.dateFormat),
				date_to:  YSDFormatter.formatDate(day, this.model.configuration.dateFormat),
				category_code: this.model.category,
				engine_fixed_product: true
			};

      // if (this.model.salesChannelCode != null) { // TODO
      //   data.sales_channel_code = this.model.salesChannelCode;
      // }

      // if (this.model.rentalLocationCode != null) { // TODO
      //   data.rental_location_code = this.model.rentalLocationCode;
      //   data.engine_fixed_rental_location = ($(this.model.planningHTML).find('input[type=hidden][name=rental_location_code]').length == 0);
      // }

      // Agent (from cookies) // TODO
      // var agentId = customCookie.get('__mb_agent_id'); 
      // if (agentId != null) {
      //   data.agent_id = agentId; 
      // }

      if (this.model.configuration.rentTimesSelector === 'hours') { 
        // Hours
				data.time_from = daySelectedRanges[0].time_from;
				const [fromHour, fromMin] = data.time_from.split(':');
				const [toHour, toMin] = daySelectedRanges[0].time_to.split(':');

				if (data.time_from === data.time_to) {
					const hour = window.parseInt(toHour) + 1;
					if (fromMin === '00') {
						data.time_to = `${toHour}:30`;
					} else {
						data.time_to = `${hour}:00`;
					}
				} else {
					const hour = window.parseInt(toHour) + 1;
					if (toMin === '00') {
						data.time_to = `${toHour}:30`;
					} else {
						data.time_to = `${hour}:00`;
					}
				}
      } else if (this.model.configuration.rentTimesSelector === 'time_range') {
				const turn = daySelectedRanges[0].time_from.split(' - ');
				data.time_from = turn[0];
				data.time_to = turn[1];
      }
  
      return data;
    }
	};

	const controller = {
		/**
		 * Send selected ranges
		*/
		getSelectedRanges: function(){
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

			// console.log(formatedData);
			
			return formatedData;
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
		selectMobileHours: function(event, status) {
			if (status === 'end'){
				this.selectHours(event, true);
				const values = [
					this.model.selectedRange[0].time,
					this.model.selectedRange[1].time
				];
				values.sort();
				const ranges = this.getTimeRanges({ from: values[0], to: values[1] });
				
				if (ranges.length > 2) {
					ranges.forEach((range, index) => {
						if (index > 0 && index < ranges.length - 1) {
							const data = {
								date: this.model.selectedRange[0].date,
								time: range
							};
							this.model.target.find('div.mybooking-product-planning-week-td-content[data-date="' + data.date + '"][data-time="' + data.time + '"]').addClass('selected');
							this.model.selectedRange.push(data);
						}
					});
				}
				return;
			} else if (status === 'start') {
				this.selectHours(event, true);
			}
		},

		/**
		 * Select hours
		*/
		selectHours: function(event, isDouble) {
			const target = $(event.currentTarget);

			const data = {
				date: target.attr('data-date'),
				time: target.attr('data-time'),
			};

			if (this.model.selectedRange.length > 0 && data.date !== this.model.selectedRange[0].date) {
				return; // This is because only one day and one range can be selected
			}

			if (isDouble) {
				this.model.selectedRange.push(data);
				target.addClass('selected');
			} else {
				if (target.hasClass('selected')) {
					this.model.selectedRange = this.model.selectedRange.filter((item) => item.date !== data.date || item.time !== data.time );
					target.removeClass('selected');
				} else {
					this.model.selectedRange.push(data);
					target.addClass('selected');
				}
			}
		},

		/**
		 * Paint ocupations
		*/
		paintRanges: function(item) {
			if (item.range) {
				switch (this.model.configuration.rentTimesSelector) {
					case 'time_range':
						const objName = this.model.statusSchedule[item.from.date_from].filter((element) => {
							return element.time_from == item.from.time_from && element.time_to == item.to.time_to;
						})[0];
						const name = objName ? objName.name : '';
						const label = `${YSDFormatter.formatDate(item.from.date_from, this.model.configuration.dateFormat)} - ${item.from.time_from} / ${item.to.time_to} - ${name}`;
						const activeCells = this.model.target.find('div.mybooking-product-planning-week-td-content[data-date="' + item.from.date_from + '"][data-time="' + item.from.time_from + ' - ' + item.to.time_to + '"]');
							activeCells.addClass('full');
							activeCells.attr('title', label);
						break;
					default:
						const label2 = `${YSDFormatter.formatDate(item.from.date_from, this.model.configuration.dateFormat)} - ${item.from.time_from} / ${item.to.time_to}`;
						item.range.forEach((range) => {
							const activeCells = this.model.target.find('div.mybooking-product-planning-week-td-content[data-date="' + item.from.date_from + '"][data-time="' + range + '"]');
							activeCells.addClass('full');
							activeCells.attr('title', label2);
						});
						break;
				}
			} else {
				const label3 = `${YSDFormatter.formatDate(item.from.date_from, this.model.configuration.dateFormat)} ${item.from.time_from} - ${YSDFormatter.formatDate(item.to.date_to, this.model.configuration.dateFormat)} ${item.to.time_to}`;
				item.from.range.forEach((range) => {
					const activeCells = this.model.target.find('div.mybooking-product-planning-week-td-content[data-date="' + item.from.date_from + '"][data-time="' + range + '"]');
					activeCells.addClass('full');
					activeCells.attr('title', label3);
				});
				if (item.between.dateRange.length > 0) {
					item.between.dateRange.forEach((date) => {
						item.between.range.forEach((range) => {
							const activeCells = this.model.target.find('div.mybooking-product-planning-week-td-content[data-date="' + date + '"][data-time="' + range + '"]');
							activeCells.addClass('full');
							activeCells.attr('title', label3);
						});
					});
				}
				item.to.range.forEach((range) => {
					const activeCells = this.model.target.find('div.mybooking-product-planning-week-td-content[data-date="' + item.to.date_to + '"][data-time="' + range + '"]');
					activeCells.addClass('full');
					activeCells.attr('title', label3);
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

						var time_to = item.time_to;
						if (this.model.configuration.rentTimesSelector === 'hours') { // TODO See this
							var [hours, minutes] = time_to.split(':');
							var formatHours = minutes === '00' ? window.parseInt(hours) - 1 : hours; 
							var formatMinutes = minutes === '00' ? '59' : '29';
							time_to = `${formatHours}:${formatMinutes}`;
						}

						if (!from.isSame(to)) {
							newElement = {
								...newElement,
								from: {
									...newElement.from,
									range: this.getTimeRanges({ from: item.time_from, to: this.model.schedule.slice(-1).pop() })
								},
								between: {
									dateRange: this.getDatesBetweenTwoDates({ from, to }),
									range: from.isBefore(to) && from.add(1, 'd').isBefore(to) ? this.getTimeRanges({ from: this.model.schedule[0], to: this.model.schedule.slice(-1).pop() }) : []
								},
								to: {
									...newElement.to,
									range: this.getTimeRanges({ from: this.model.schedule[0], to: time_to })
								}
							};
						} else {
							newElement = {
								...newElement,
								range: this.getTimeRanges({ from: item.time_from, to: time_to })
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
			const month = mydate.toLocaleString(this.model.requestLanguage, { month: 'long' }).toUpperCase();
			this.model.planningHTML.find('.mybooking-product-planning-week-title').html(`${month},  ${year}`);

			let  html = '<div class="mybooking-product-planning-week-container"><table>';
				/**
				 * Head
				 */
				html += '<thead><tr>';
		
				columns.forEach((item) => {
					const mydate = new Date(item);
					const day = mydate.getDate();
					const weekday = mydate.toLocaleString(this.model.requestLanguage, { weekday: 'short' }).toUpperCase();

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
							const isInDaySchedule = this.model.statusSchedule[element].filter((time) => {
								if (typeof time === 'object') {
									const formatData = `${time.time_from} - ${time.time_to}`;
									return formatData === item;
								} else {
									return time === item;
								}
							}).length > 0;
							
							const isClosed = !this.model.calendar.includes(element) || !isInDaySchedule;
							const closedClass = isClosed ? ' closed' : '';
		
							html += '<td>';
								html += '<div data-time="' + item + '" data-date="' + element  + '" class="mybooking-product-planning-week-td-content noselect' + closedClass + '" title="' + YSDFormatter.formatDate(element, this.model.configuration.dateFormat) + ' - ' + item + '">' + item +  '</div>';
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
		getTimeRanges: function({ from, to }) {
			if (!from || !to){
				return [];
			} 

			const interval = this.model.date.interval;

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
				statusSchedule: [],
				planning: [],
				ocupation: [],
				realCalendar: [],
				calendar: [],
			};

			if (commonServices.URL_PREFIX && commonServices.URL_PREFIX !== '' && commonServices.apiKey && commonServices.apiKey !== '') {
				const startDate = this.model.date.actual;
				const calendarEndDate = YSDFormatter.formatDate(moment(startDate).add(14, 'd'), this.model.api_date_format);
				const endDate = YSDFormatter.formatDate(moment(startDate).add(7, 'd'), this.model.api_date_format);

				this.model.calendar = await this.getCalendar({ from: startDate, to: calendarEndDate });
				this.model.realCalendar = this.getDatesBetweenTwoDates({ from:  startDate, to: endDate });

				this.model.schedule = await this.getProductSchedule({ from: startDate, to: YSDFormatter.formatDate(moment(startDate).add(7, 'd'), this.model.api_date_format) });
				this.model.planning = await this.getProductPlanning({ from: startDate, to: endDate });

				if (this.model.realCalendar.length > 0 && this.model.schedule.length > 0) {
					const settings = {
						columns: this.model.realCalendar,
						rows: this.model.schedule,
					};

					const html = this.drawPlanning(settings);
					this.model.target.html(html);

					this.getOcupation();
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
     * Go to the next step when the user clicks on Book Now!
     */
		 gotoNextStep: function() {
      if (commonServices.extrasStep) {
        window.location.href= commonServices.chooseExtrasUrl;
      } else {
        window.location.href= commonServices.completeUrl;
      }
    },

		/**
		 * Set Events
		*/
		setEvents: function(settings) {
			const target = document.getElementById(settings.parent.model.targetId);

			target.addEventListener('refresh', settings.parent.refresh.bind(settings.parent));

			target.dispatchEvent(new CustomEvent('refresh', { detail: { settings, callback: productPlanningWeekActionBar.init.bind(productPlanningWeekActionBar) }}));

			const selectorTarget = '.mybooking-product-planning-week-td-content:not(.full):not(.closed)';

			if (this.model.configuration.rentTimesSelector === 'time_range' || this.isMobile()) {
				this.model.target.off('click');
				this.model.target.on('click', selectorTarget, (event) => {
					// console.log('click', event);
					if (this.model.configuration.rentTimesSelector === 'time_range') {// This is because only one time range can be selected
						this.model.selectedRange = [];
						$(selectorTarget).removeClass('selected');
						this.selectHours(event);
						this.doReservation(); 
					} else if (this.isMobile()) {
						const target = $(event.currentTarget);
						if (this.model.isReservationSended) {
							this.model.selectedRange = [];
							$(selectorTarget).removeClass('selected');
							this.model.isReservationSended = false;
						}
						const exists = this.model.selectedRange.filter((item) => {
							return item.date === target.attr('data-date') && item.time === target.attr('data-time').length > 0;
						});
						if (exists){
							this.selectMobileHours(event, 'end');			
							this.doReservation();
							this.model.isReservationSended = true;
						} else {
							if (this.model.selectedRange.length > 1) {
								this.model.selectedRange = [];
								$(selectorTarget).removeClass('selected');
								this.selectMobileHours(event, 'start');
							} else if (this.model.selectedRange.length > 0) {
								this.selectMobileHours(event, 'end');			
								this.doReservation();
								this.model.isReservationSended = true;
							} else {
								this.selectMobileHours(event, 'start');
							}
						}
					}
				});
			}

			if (this.model.configuration.rentTimesSelector !== 'time_range' && !this.isMobile())  {
				this.model.target.off('mousedown');
				this.model.target.on('mousedown', selectorTarget, (event) => {
					this.model.selectedRange = []; // This is because only one day and one range can be selected
					$(selectorTarget).removeClass('selected'); // This is because only one day and one range can be selected
					this.model.isTimeRangeSended = false;
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
					this.model.isDragActive = false;

					if (this.model.selectedRange.length > 0 && !this.model.isTimeRangeSended) {
						// console.log('mouseup', event);
						this.doReservation(); // This is because only one day and one range can be selected
						this.model.isTimeRangeSended = true;
					}
				});

				this.model.target.off('mouseleave');
				this.model.target.on('mouseleave', 'tbody, .mybooking-product-planning-week-td-content.full, .mybooking-product-planning-week-td-content.closed', (event) => {
					this.model.isDragActive = false;
					if (this.model.selectedRange.length > 0 && !this.model.isTimeRangeSended) {
						// console.log('mouseup', event);
						this.doReservation(); // This is because only one day and one range can be selected
						this.model.isTimeRangeSended = true;
					}
				});
			}

			this.model.planningHTML.find('form[name=mybooking_product_week_planning_reservation]').on('submit', () => {
				this.gotoNextStep();
			});
		},

		/**
		 * Initizialize
		*/
		init: function() {
			const requestLanguage = commonSettings.language(document.documentElement.lang || 'es');
			
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
					interval: planningHTML.attr('data-interval') || null,
				};
				settings.target.attr('id', settings.targetId);

				this.factory(settings).init();
			});
		},
	};

	planningDiary.init();
});