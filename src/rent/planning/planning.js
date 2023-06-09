/******
 *
 * Renting Module Planning
 *
 */
require([
  'jquery',
  'i18next',
  'commonServices',
  'commonSettings',
  'commonLoader',
  'YSDFormatter',
  'commonTranslations',
  'moment',
  './planningActionBar',
  'ysdtemplate',
  'commonUI',
  'jquery.i18next',
], function (
  $,
  i18next,
  commonServices,
  commonSettings,
  commonLoader,
  YSDFormatter,
  commonTranslations,
  moment,
  planningActionBar,
  tmpl,
  commonUI
) {
  /**
   * Contructor
   */
  function Planning({
    planningHTML,
    target,
    targetId,
    type,
    direction,
    items,
    cells,
    interval,
    rentalLocation,
    family,
    category,
  }) {
    /**
     * Planning data model
     */
    this.model = {
      planningHTML, // All planning (contain head and table)
      target, // Empty div where table is painted
      targetId, // Table id
      type: type || 'diary', // Type
      direction: direction || 'columns', // Products direction
      items: items || 15, // Number of items
			// Table cells
      cells: cells || {
        width: 150,
        height: 40,
      },
      originalSchedule: [], // Initial schedule  (no formated)
      schedule: [], // Schedule painted (formated)
      resources: [], // Resource urges painted
      productDetail: {}, // Product detail
      ocupation: [], // Planning ocupation data (status: available, ocupied, free... )
      // Calendars
      realCalendar: [], // All dates from actual date (or first available date) to numbers of items days (ejem 15 items -> 15 days)
      calendar: [], // Available dates from actual date (or first available date) to numbers of items * 2  days (ejem: 15 items -> 30 days) this because can be less than total days
      // Dates
      api_date_format: 'YYYY-MM-DD', // Api format for ajax calls
      date: {
        actual: undefined, // Selected date
        server: undefined, // Server date (initial date when actual is undefined)
        interval: interval !== null ? window.parseInt(interval) : 30, // Hours interval (default -> 30min) but schedule data must be in the same interval (use to paint full hours in red)
      },
      // Rental locations (with multiple rental locations ->  multipleRentalLocations boolean value)
      isRentalLocationSelectorAvailable: false, // Shows rental location selector
      rentalLocation, // Selected rental location
      rentalLocations: [], // All rental  locations
      // Families (with families -> useRentingFamilies boolean value)
      isFamilySelectorAvailable: false, // Shows family selector
      family, // Selected family
      families: [], // All families
      // Categories (with categories -> productType === 'category_of_resources')
      isCategorySelectorAvailable: false, // Shows category selector
      category, // Selected category
      categories: [], // All categories
    };
  }

  /**
   * ========== The model (extended with API methods)
   */
  const model = {
    /**
     * Get rental locations
     */
    getRentalLocations: function () {
      const url =
        commonServices.URL_PREFIX +
        '/api/booking/frontend/rental-locations?api_key=' +
        commonServices.apiKey;

      // Returns a Promise with the response
      return new Promise((resolve) => {
        $.ajax({
          url: url,
        })
          .done(function (data) {
            resolve(data);
          })
          .fail(function (error) {
            console.log('Error', error);
            alert(i18next.t('planning.generic_error'));

            resolve([]);
          });
      });
    },

    /**
     * Get families
     */
    getFamilies: function () {
      const {
        rentalLocation,
      } = this.model;

      let url =
        commonServices.URL_PREFIX +
        '/api/booking/frontend/families';
      const urlParams = [];

      // APi Key
      if (commonServices.apiKey && commonServices.apiKey !== '') {
        urlParams.push('api_key=' + commonServices.apiKey);
      }

      // Rental location ID
      if (rentalLocation && rentalLocation !== 'all') {
        urlParams.push('rental_location=' + rentalLocation);
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
          .done(function (data) {
            resolve(data);
          })
          .fail(function (error) {
            console.log('Error', error);
            alert(i18next.t('planning.generic_error'));

            resolve([]);
          });
      });
    },

    /**
     * Get categories
     */
    getCategories: function () {
      const {
        family,
      } = this.model;

      let url = commonServices.URL_PREFIX + '/api/booking/frontend/products';
      const urlParams = [];

      // APi Key
      if (commonServices.apiKey && commonServices.apiKey !== '') {
        urlParams.push('api_key=' + commonServices.apiKey);
      }

      // Family ID
      if (family && family !== 'all') {
        urlParams.push('family_id=' + family);
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
            resolve(result.data);
          })
          .fail(function (error) {
            console.log('Error', error);
            alert(i18next.t('planning.generic_error'));

            resolve([]);
          });
      });
    },

    /**
     * Get calendar of dates
     */
    getCalendar: function ({ from, to }) {
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

      if (this.model.category) {
        urlParams.push('product=' + this.model.category);
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
          .done(function (data) {
            resolve(data);
          })
          .fail(function (error) {
            console.log('Error', error);
            alert(i18next.t('planning.generic_error'));

            resolve([]);
          });
      });
    },

    /**
     * Get day schedule => Hours to show
     */
    getSchedule: function ({ date }) {
      if (!date) {
        alert(i18next.t('planning.generic_error'));
        return [];
      }
      
			let url = commonServices.URL_PREFIX;
			const urlParams = [];
		
			// APi Key
			if (commonServices.apiKey && commonServices.apiKey !== '') {
				urlParams.push('api_key=' + commonServices.apiKey);
			}
		
			// Date
			urlParams.push('date=' + date);
		
			// Family
			if (this.model.family !== null && this.model.family !== 'all') {
				urlParams.push('family=' + this.model.family);
			}
		
			// Category
			if (this.model.category !== null && this.model.category !== 'all') {
				urlParams.push('product=' + this.model.category);
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
			return new Promise((resolve) => {
				$.ajax({
					url: url,
				})
					.done((data) => {
						if (data.length > 0 && typeof data[0] === 'object') {
							const formatData = [];
		
							data.forEach(function (item) {
								formatData.push(`${item.time_from} - ${item.time_to}`);
							});
		
							this.model.originalSchedule = data;
							resolve(formatData);
						} else {
							resolve(data);
						}
					})
					.fail(function (error) {
						console.log('Error', error);
						alert(i18next.t('planning.generic_error'));
		
						resolve([]);
					});
			});
		},

    /**
     * Get day planning => Resource urges
     */
    getPlanning: function ({ from, to }) {
      let url = commonServices.URL_PREFIX + '/api/booking/frontend/planning';
      const urlParams = [];

      // Api Key
      if (commonServices.apiKey && commonServices.apiKey !== '') {
        urlParams.push('api_key=' + commonServices.apiKey);
      }

      // Starting date
      urlParams.push('from=' + from);

      // Ending date
      urlParams.push('to=' + to);

      // Rental location code
      if (this.model.rentalLocation && this.model.rentalLocation !== 'all') {
        urlParams.push('rental_location_code=' + this.model.rentalLocation);
      }

      // Family
      if (this.model.family !== null && this.model.family !== 'all') {
        urlParams.push('family_id=' + this.model.family);
      }

      // Category
      if (this.model.category !== null && this.model.category !== 'all') {
        urlParams.push('category=' + this.model.category);
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
          .done(function (data) {
            resolve(data);
          })
          .fail(function (error) {
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
      let url =
        commonServices.URL_PREFIX +
        '/api/booking/frontend/products/' +
        productCode;
      const urlParams = [];
      if (this.model.requestLanguage !== null) {
        urlParams.push('lang=' + this.model.requestLanguage);
      }
      if (commonServices.apiKey && commonServices.apiKey !== '') {
        urlParams.push('api_key=' + commonServices.apiKey);
      }
      if (urlParams.length > 0) {
        url += '?';
        url += urlParams.join('&');
      }

      // Request
      commonLoader.show();
      $.ajax({
        type: 'GET',
        url: url,
        contentType: 'application/json; charset=utf-8',
        crossDomain: true,
        success: (data) => {
          this.model.productDetail = data;
          this.showProductDetail();
        },
        error: (error) => {
          console.log('Error', error);
          alert(i18next.t('chooseProduct.loadProduct.error'));
        },
        complete: () => {
          commonLoader.hide();
        },
      });
    },
  };

  /***
   * =============== The controller
   */
  const controller = {
    /**
     * Get ocupation range in calendar type and put in list data
     */
    getOcupationCalendarRange: function ({ from, to }) {
      if (!from || !to) {
        return [];
      }

      const serverDate = moment(this.model.date.server);
      if (moment(to).isBefore(serverDate)) {
        return [];
      }

      const range = [];
      if (from === to) {
        range.push(from);
        return range;
      }

      let init = false;
      let finish = false;
      this.model.calendar.forEach(function (item) {
        if (
          moment(from).isBefore(serverDate) ||
          moment(from).isSame(serverDate) ||
          item === from
        ) {
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
    getTimeRanges: function ({ from, to }) {
      const interval = this.model.date.interval;

      function getMinutes(time) {
        const arrayTime = time.split(':').map(Number);
        return arrayTime[0] * 60 + arrayTime[1];
      }

      function getTime(minutes) {
        let hours = (minutes / 60) | 0;
        if (hours.toString().length < 2) {
          hours = '0' + hours;
        }
        minutes %= 60;
        return hours + ':' + (minutes < 10 ? '0' + minutes : minutes);
      }

			let  fromMinutes = getMinutes(from);
      const range = [],
				toMinutes = getMinutes(to);

      while (fromMinutes + interval <= toMinutes) {
        range.push(getTime(fromMinutes));
        fromMinutes += interval;
      }

      range.push(getTime(fromMinutes));

      return range;
    },

    /**
     * Get ocupation range in diary type and put in list data
     */
    getOcupationDiaryRange: function ({ from, to, actualDay }) {
      if (!from || !to) {
        return [];
      }

      if (actualDay) {
        if (actualDay === 'from' || actualDay === 'both') {
          to = this.model.schedule.slice(-1).pop();
        }

        if (
          actualDay !== 'from' ||
          moment(from, 'hh:mm').isBefore(
            moment(this.model.schedule[0], 'hh:mm')
          )
        ) {
          from = this.model.schedule[0];
        }
      }

      return this.getTimeRanges({ from, to });
    },

    /**
     * Paint the ranges
     */
    paintRanges: function (item) {
      // TODO see this
			if (
				this.model.items === 1 &&
				this.model.configuration.rentTimesSelector === 'time_range'
			) {
				// Time range only 1 day
				const objName = this.model.originalSchedule.filter((element) => {
					return (
						element.time_from === item.time_from &&
						element.time_to === item.time_to
					);
				})[0];
				const name = objName ? objName.name : '';
				const activeCells = this.model.target.find(
					'div.mybooking-planning-td-content[data-id="' +
						item.id +
						'"][data-time="' +
						item.range[0] +
						' - ' +
						item.range.slice(-1).pop() +
						'"]'
				);
				activeCells.addClass('full').addClass('from to');
				activeCells.attr('title', item.label + ' - ' + name);
			} else {
				// Hours or diary
				item.range.forEach((range, index) => {
					let classes = '';
		
					if (item.actualDay) {
						if (index === 0 && item.actualDay === 'from') {
							classes += 'from';
						}
		
						if (index === item.range.length - 1 && item.actualDay === 'to') {
							classes += ' to';
						}
					} else {
						if (
							index === 0 &&
							(moment(item.date_from).isSame(moment(range)) ||
								(item.date_from === undefined && item.time_from === range))
						) {
							classes += 'from';
						}
		
						if (index === item.range.length - 1) {
							classes += ' to';
						}
					}
		
					const activeCells = this.model.target.find(
						'div.mybooking-planning-td-content[data-id="' +
							item.id +
							'"][data-time="' +
							range +
							'"]'
					);
					activeCells.addClass('full').addClass(classes);
					activeCells.attr('title', item.label);
				});
			}
			/*
			switch (this.model.configuration.rentTimesSelector) {
				case 'time_range':
					// Time range
					const objName = this.model.originalSchedule.filter((element) => {
						return element.time_from === item.time_from && element.time_to === item.time_to;
					})[0];
					const name = objName ? objName.name : '';
					const activeCells = this.model.target.find('div.mybooking-planning-td-content[data-id='' + item.id + ''][data-time='' + item.range[0] + ' - ' + item.range.slice(-1).pop() + '']');
					activeCells.addClass('full').addClass('from to');
					activeCells.attr('title', item.label + ' - ' + name);
					break;
				case 'hours':
					// Hours
					item.range.forEach((range, index) => {
						const classes = '';
		
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
		
						const activeCells = this.model.target.find('div.mybooking-planning-td-content[data-id='' + item.id + ''][data-time='' + range + '']');
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
    showOcupation: function () {
			this.model.ocupation.forEach((item) => {
				this.paintRanges(item);
			});

			/*
			 * Format
			 */
			const { target  } = this.model;
			target
				.find('table tbody th')
				.css('height', this.model.cells.height + 'px');
			target
				.find('table tbody td')
				.css('height', this.model.cells.height + 'px');
			target
				.find('table')
				.addClass('mybooking-planning-table-direction-' + this.model.direction);
			target
				.find(
					'table.mybooking-planning-table-direction-columns tbody td .mybooking-planning-range-text.even'
				)
				.css('margin-top', this.model.cells.height * -1 + 'px');
			target
				.find(
					'table.mybooking-planning-table-direction-rows tbody td .mybooking-planning-range-text.even'
				)
				.css('margin-left', this.model.cells.width * -1 + 'px');
			target
				.find(
					'table.mybooking-planning-table-direction-rows tbody td .mybooking-planning-range-text.even'
				)
				.css('margin-right', this.model.cells.width + 'px');
		},

    /**
     * Get ocupation data
     */
    getOcupation: function (paramDate) {
			this.model.resources.forEach((element) => {
				if (element.urges.length > 0) {
					element.urges.forEach((item) => {
						const formatDate = moment(paramDate);
						const from = moment(item.date_from);
						const to = moment(item.date_to);
						const dateFromString = this.model.configuration.formatDate(
							item.date_from
						);
						const dateToString = this.model.configuration.formatDate(
							item.date_to
						);
						let label = '';
            let actualDay;
            if (!from.isSame(to)) {
              if (formatDate.isSame(from)) {
                actualDay = 'from';
              } else if (formatDate.isSame(to)) {
                actualDay = 'to';
              } else {
                actualDay = 'both';
              }
    
              label = dateFromString + ' - ' + dateToString;
            }
    
            let newElement = {
              id: element.id,
              label,
            };

            const getTimeTo = () => {
              // TODO See this
              const [hours, minutes] = item.time_to.split(':');
              const formatHours =
                minutes === '00' ? window.parseInt(hours) - 1 : hours;
              const formatMinutes = minutes === '00' ? '59' : '29';
              return `${formatHours}:${formatMinutes}`;
            };

            switch (this.model.type) {
              case 'diary':
                newElement = {
                  ...newElement,
                  actualDay,
                  time_from: item.time_from,
                  time_to: item.time_to,
                  range: this.getOcupationDiaryRange({
                    from: item.time_from,
                    to: this.model.configuration.rentTimesSelector === 'hours' ? getTimeTo() : item.time_to,
                    actualDay,
                  }),
                  label:
                    label !== ''
                      ? dateFromString +
                        ' / ' +
                        item.time_from +
                        ' - ' +
                        dateToString +
                        ' / ' +
                        item.time_to
                      : dateFromString +
                        ' - ' +
                        item.time_from +
                        ' / ' +
                        item.time_to,
                };
                break;
            
              case 'calendar':
                newElement = {
                  ...newElement,
                  date_from: item.date_from,
                  date_to: item.date_to,
                  range: this.getOcupationCalendarRange({
                    from: item.date_from,
                    to: item.date_to,
                  }),
                  label: dateFromString + ' - ' + dateToString,
                };
                break;
              default:
                newElement = {};
                break;
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
    drawPlanning({ rows, columns }) {
			let html = '<div class="mybooking-planning-scrollable"><table >';
			/**
			 * Head
			 */
			html += '<thead><tr>';
			html += '<th class="mybooking-planning-td-fix"></th>';
		
			columns.forEach((item) => {
				let description = item.id ? item.description : item;
		
				if (!item.id && !description.includes(':')) {
					const mydate = new Date(description);
					const year = mydate.getFullYear();
					const month = mydate
						.toLocaleString(this.model.requestLanguage, { month: 'short' })
						.toUpperCase();
					const day = mydate.getDate();
					const weekday = mydate
						.toLocaleString(this.model.requestLanguage, { weekday: 'short' })
						.toUpperCase();
		
					description =
						'<span class="mybooking-planning-td-product__month">' +
						month +
						'</span> <span class="mybooking-planning-td-product__year">' +
						year +
						'</span><br>' +
						'<b class="mybooking-planning-td-product__day">' +
						day +
						'</b><br><span class="mybooking-planning-td-product__weekday">' +
						weekday +
						'</span>';
				} else if (item.id) {
					description =
						'<span class="mybooking-planning-td-product js-product-info-btn" data-product="' +
						item.category_code +
						'" title="info">' +
						description +
						' <span class="dashicons dashicons-info" data-product="' +
						item.category_code +
						'" style="display:none"></span></span>';
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
			rows.forEach((item) => {
				let fixHead = item.description ? item.description : item;
				if (!item.id && !fixHead.includes(':')) {
					const mydate = new Date(fixHead);
					const day = mydate.getDate();
					const weekday = mydate
						.toLocaleString(this.model.requestLanguage, { weekday: 'short' })
						.toUpperCase();
		
					fixHead =
						'<b class="mybooking-planning-td-product__day">' +
						day +
						'</b>&nbsp;&nbsp;&nbsp;<span class="mybooking-planning-td-product__weekday">' +
						weekday +
						'</span>';
				} else if (item.id) {
					fixHead =
						'<span class="mybooking-planning-td-product js-product-info-btn" data-product="' +
						item.category_code +
						'" title="info">' +
						item.description +
						' <span class="dashicons dashicons-info" data-product="' +
						item.category_code +
						'" style="display:none"></span></span>';
				}
		
				html += '<tr>';
				html += '<th class="mybooking-planning-td-fix">' + fixHead + '</th>';
				columns.forEach((element) => {
					const time = element.id ? item : element;
					const id = element.id ? element.id : item.id;
					const isClosed =
						!time.includes(':') && !this.model.calendar.includes(time);
					const closedClass = isClosed ? ' closed' : '';
		
					html += '<td>';
					html +=
						'<div data-id="' +
						id +
						'" data-time="' +
						time +
						'" class="mybooking-planning-td-content' +
						closedClass +
						'"></div>';
					html += '</td>';
				});
				html += '</tr>';
			});
			html += '</tbody>';
			html += '</table></div>';
		
			return html;
		},

		/**
     * Get dates between two dates
     */
    getDatesBetweenTwoDates: function ({ from, to }) {
      let dates = [];

      for (let m = moment(from); m.isBefore(to); m.add(1, 'd')) {
        dates.push(m.format(this.model.api_date_format));
      }

      return dates;
    },

    /**
     * Refresh table
     */
    refresh: async function (event) {
      commonLoader.show();

			/*
			* Reset model data
			*/
      this.model = {
        ...this.model,
        schedule: [],
        resources: [],
        ocupation: [],
        realCalendar: [],
        calendar: [],
      };

			/*
			* If apikey exist get data
			*/
      if (
        commonServices.URL_PREFIX &&
        commonServices.URL_PREFIX !== '' &&
        commonServices.apiKey &&
        commonServices.apiKey !== ''
      ) {
				/*
				*  Get calendars
				*/
        if (this.model.date.actual) {
					this.model.calendar = await this.getCalendar({
            from: this.model.date.actual,
            to: YSDFormatter.formatDate(
              moment(this.model.date.actual).add(this.model.items * 2, 'd'),
              this.model.api_date_format
            ),
          });
          this.model.realCalendar = this.getDatesBetweenTwoDates({
            from: this.model.date.actual,
            to: YSDFormatter.formatDate(
              moment(this.model.date.actual).add(this.model.items, 'd'),
              this.model.api_date_format
            ),
          });
        } else {
          this.model.calendar = await this.getCalendar({
            from: this.model.date.server,
            to: YSDFormatter.formatDate(
              moment(this.model.date.server).add(this.model.items * 2, 'd'),
              this.model.api_date_format
            ),
          });

					// Set actual date
          this.model.date.server = this.model.calendar[0];
          this.model.date.actual = this.model.date.server;

          this.model.realCalendar = this.getDatesBetweenTwoDates({
            from: this.model.calendar[0],
            to: YSDFormatter.formatDate(
              moment(this.model.calendar[0]).add(this.model.items, 'd'),
              this.model.api_date_format
            ),
          });
        }
				switch (this.model.type) {
					case 'diary':
						this.model.schedule = await this.getSchedule({ date: this.model.date.actual });
						break;
					case 'calendar':
						this.model.schedule = this.model.realCalendar;
						break;

					default:
						this.model.schedule = [];
						break;
				}

				/*
				*  Get selects lists
				*/
        if (this.model.isRentalLocationSelectorAvailable) {
          this.model.rentalLocations = await this.getRentalLocations();
        }
        if (this.model.isFamilySelectorAvailable) {
          this.model.families = await this.getFamilies();
        }
        if (this.model.isCategorySelectorAvailable) {
          this.model.categories = await this.getCategories();
        }

				/*
				*  Get resources
				*/
				// Append the number of days
        const dateTo = moment(this.model.date.actual)
          .add(this.model.items, 'days')
          .format(this.model.api_date_format);
        this.model.resources = await this.getPlanning({
          from: this.model.date.actual,
          to: dateTo,
        });

				/*
				*  Set data with direction atribute
				*/
        let html;
        if (this.model.resources.length > 0 && this.model.schedule.length > 0) {
          let settings;
          switch (this.model.direction) {
            case 'rows':
              settings = {
                rows: this.model.resources,
                columns: this.model.schedule,
              };
              break;

            default:
              settings = {
                rows: this.model.schedule,
                columns: this.model.resources,
              };
              break;
          }

        /*
				*  Draw planning and append
				*/
          html = this.drawPlanning(settings);
          this.model.target.html(html);

          /*
          *  Show button info
          */
          if (this.model.configuration.productType === 'resource') {
            $('.js-product-info-btn').css('cursor', 'pointer');
            $('.js-product-info-btn .dashicons-info').show();
          }

          /*
          *  Get occupation
          */
          this.getOcupation(this.model.date.actual);
        } else {
          html = i18next.t('planning.no_data_found');

          this.model.target.html(html);
        }

				/* 
				* If event exist execute callback function
				*/
        if (event && event.detail && event.detail.callback) {
          const total =
            this.model.direction === 'columns'
              ? this.model.resources.length
              : this.model.schedule.length;

          const rentalLocation = this.model.isRentalLocationSelectorAvailable
            ? this.model.rentalLocation || 'all'
            : undefined;
          const family = this.model.isFamilySelectorAvailable
            ? this.model.family || 'all'
            : undefined;
          const category = this.model.isCategorySelectorAvailable
            ? this.model.category || 'all'
            : undefined;

          event.detail.callback({
            settings: event.detail.settings,
            total,
            rentalLocation,
            family,
            category,
          });
        }
      } else {
				/*
				* If apikey dont exist show error message
				*/
        this.model.target.html( i18next.t('planning.api_conexion_error') );
      }

      // console.log('Model: ', this.model);

      commonLoader.hide();
    },

    /**
     * Load product detail
     */
    productDetailIconClick: function (productCode) {
      this.loadProduct(productCode);
    },
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
		
			// Load settings
			commonLoader.show();
			commonSettings.loadSettings((data) => {
				commonLoader.hide();
		
				// Extend the model
				this.model = {
					...this.model,
					// Rental location availabily control
					isRentalLocationSelectorAvailable: !this.model.rentalLocation && data.multipleRentalLocations,
					// Family availabily control
					isFamilySelectorAvailable: !this.model.category && !this.model.family && data.useRentingFamilies,
					// Category availabily control
					isCategorySelectorAvailable: !this.model.category && data.productType === 'category_of_resources',
					configuration: data,
					requestLanguage,
					date: {
						...this.model.date,
						server: data.serverDate,
					},
				};
		
				// Configure events
				this.setupEvents({
					parent: this,
					target: this.model.planningHTML.find('.mybooking-planning-head'),
					columnsWidth: this.model.cells.width,
				});
			}, 'rent', this.model.category);
		},

    /**
     * Set Events
     */
    setupEvents: function (settings) {
      const target = document.getElementById(settings.parent.model.targetId);
      target.addEventListener(
        'refresh',
        settings.parent.refresh.bind(settings.parent)
      );
      
      target.dispatchEvent(
        new CustomEvent('refresh', {
          detail: {
            settings,
            callback: planningActionBar.init.bind(planningActionBar), // refresh head action bar too
          },
        })
      );

      // Bind the event to show detailed product
      if (this.model.configuration.productType === 'resource') {
        $('.mybooking-planning-table').off(
          'click');
        $('.mybooking-planning-table').on(
          'click',
          '.js-product-info-btn',
          (event) => {
            const target = event.target;
            // console.log('click');
            // console.log(target);
            // console.log($(this));
            // console.log($(this).attr('data-product'));
            this.productDetailIconClick($(target).attr('data-product'));
          }
        );
      }
      
    },

    /**
     * Show product detail
     */
    showProductDetail: function () {
      if (document.getElementById('script_product_modal')) {
        const result = tmpl('script_product_modal')({
          product: this.model.productDetail,
        });
        // Compatibility with bootstrap modal replacement (from 1.0.0)
        if ($('#modalProductDetail_MBM').length) {
          $('#modalProductDetail_MBM .modal-product-detail-title').html(
            this.model.productDetail.name
          );
          $('#modalProductDetail_MBM .modal-product-detail-content').html(
            result
          );
        } else {
          $('#modalProductDetail .modal-product-detail-title').html(
            this.model.productDetail.name
          );
          $('#modalProductDetail .modal-product-detail-content').html(result);
        }

        // Show the product in a modal
        commonUI.showModal(
          '#modalProductDetail',
          function () {
            // on Show
            setTimeout(function () {
              if ($('.mybooking-carousel-inner').length) {
                commonUI.showSlider('.mybooking-carousel-inner');
              }
              $('#modal_product_photos').on('click', function () {
                $('.mybooking-modal_product-description').hide();
                $('.mybooking-modal_product-container').show();
                commonUI.playSlider('.mybooking-carousel-inner');
              });
              $('#modal_product_info').on('click', function () {
                $('.mybooking-modal_product-container').hide();
                $('.mybooking-modal_product-description').show();
                commonUI.pauseSlider('.mybooking-carousel-inner');
              });
            }, 150);
          },
          function () {
            // on Hide
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
  const planningDiary = {
    /**
     * Initizialize
     */
    init: function () {
      $('.mybooking-rent-planning .mybooking-planning-content').each(
        (index, item) => {
          // Unique id for instance
          const id = $(item).attr('id');
          const planningHTML = $('#' + id);

          // Information about cells
          let cells;
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
          const settings = {
            planningHTML,
            target: planningHTML.find('.mybooking-planning-table'),
            targetId: id + '-table',
            family: planningHTML.attr('data-family-code') || null,
            category: planningHTML.attr('data-category-code') || null,
            items: planningHTML.attr('data-items'),
            rentalLocation:
              planningHTML.attr('data-rental-location-code') || null,
            direction: planningHTML.attr('data-direction'),
            type: planningHTML.attr('data-type'),
            cells,
            interval: planningHTML.attr('data-interval') || null,
          };
          settings.target.attr('id', settings.targetId); // Add a id to table div inside planning which the same id

          // Create a Planning instance
          this.factory(settings).init();
        }
      );
    },

    /**
     * Factory to create Planning instances
     */
    factory: function (obj) {
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
