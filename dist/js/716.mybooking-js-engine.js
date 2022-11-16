(self["webpackChunkmybooking_js_engine"] = self["webpackChunkmybooking_js_engine"] || []).push([[716],{

/***/ 5716:
/***/ ((module, exports, __webpack_require__) => {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(9755), __webpack_require__(2599), __webpack_require__(8041),
       __webpack_require__(967), __webpack_require__(5404), __webpack_require__(5805), __webpack_require__(2663), __webpack_require__(350),
       __webpack_require__(7192), __webpack_require__(9650), __webpack_require__(6218),
       __webpack_require__(5237)], __WEBPACK_AMD_DEFINE_RESULT__ = (function($, YSDEventTarget, commonSettings, moment, YSDFormatter) {

	/**
	 * Contructor
	*/
	function ActionBar({ target, parent, columnsWidth, total  }) {
		/**
		 * PlanningActionBar data model
		*/
		this.model = {
			parent,
			target,
			columns: {
				width: columnsWidth || 150,
				visibles: 0,
				actualMargin: 0,
				total: 0,
			}
		};
	}

	var model = {
	};

	var controller = {
		/**
		 * Set category
		*/
		setCategory: function(event){
			var value = $(event.currentTarget).val();

			this.model.parent.model.category = value;

			var target = document.getElementById(this.model.parent.model.targetId);
			target.dispatchEvent(new CustomEvent('refresh', { detail: { callback: this.refresh.bind(this) }} ));
		},

		/**
		 * Initialize category
		*/
		initializeCategory: function(){
			var categorySelector = this.model.target.find('select[name=category]');

			if (this.model.parent.model.categories.length > 0) {
				this.model.parent.model.categories.forEach(function(item) {
					categorySelector.append('<option value="' + item.code + '">' + item.name + '</option>')
				});
			} else {
				categorySelector.attr('disabled', 'disabled');
			}
		},

		/**
		 * Set new date and refresh planning
		*/
		setDate:  function(paramDate) {
			this.model.parent.model.date.actual = YSDFormatter.formatDate(paramDate, this.model.parent.model.api_date_format);

			var target = document.getElementById(this.model.parent.model.targetId);
			target.dispatchEvent(new CustomEvent('refresh', { detail: { callback: this.refresh.bind(this) }} ));
		},

		/**
		 * Initialize and refresh planning
		*/
		initializeDate: function() {
			$.datepicker.setDefaults( $.datepicker.regional[commonSettings.language(document.documentElement.lang) || 'es'] );
			
			var inputDate = this.model.target.find('input[name=date]');
			var date = new Date (this.model.parent.model.date.actual);
			
			inputDate.datepicker({
				minDate: date,
			});

			inputDate.datepicker('setDate', date);

			var that = this;
			this.model.target.find('input[name=date]').off('change');
			this.model.target.find('input[name=date]').on('change', function() {
				var value = $(this).datepicker('getDate');

				that.setDate(value);
			});
		},

		refresh: function({ total, category }) {
			if (total > 0) {
				this.setColumns(total);
			}

			if (this.model.parent.model.calendar.length > 0) {
				this.setScrollCalendarButtonsState();
			}

			this.setScrollButtonsState();

			this.model.target.find('select[name=category]').val(category);
		},
	};

	var view = {
		/**
		 * Set columns width and fix container to show complete columns
		*/
		setColumns: function(total) {
			this.model.columns.total = total;

			var target = this.model.parent.model.target;
			var container = $(target).find('.mybooking-planning-scrollable');
			var ths = $(target).find('thead th:not(.mybooking-planning-td-fix)');
			var tds = $(target).find('tbody td');
			var containerWidth = this.model.parent.model.target.closest('.mybooking-planning-content').width() - window.parseInt(container.css('margin-left'));

			this.model.columns.visibles = Math.floor(containerWidth / this.model.columns.width);

			if (this.model.columns.visibles > this.model.columns.total) {
				this.model.columns.visibles = this.model.columns.total;
			}

			ths.css('width', this.model.columns.width + 'px' );
			tds.css('width', this.model.columns.width + 'px' );
			container.css('width', (this.model.columns.visibles * this.model.columns.width) + 'px');
			
			if (this.model.columns.total * this.model.columns.width > this.model.columns.actualMargin * -1){
				container.find('table').css('margin-left', this.model.columns.actualMargin);
			}
		},

		/**
		 * Scroll calendar
		*/
		setScrollCalendarButtonsState: function(){
			var dateButtons = this.model.target.find('button[data-action=date]');
			var firstDate = moment(this.model.parent.model.calendar[0]).add(1, 'd');
			var lastDate = moment(this.model.parent.model.calendar.slice(-1).pop()).subtract(1, 'd');

			if(moment(this.model.parent.model.date.actual).isBefore(firstDate)) {
				$(dateButtons[0]).attr('disabled', 'disabled');
			} else {
				$(dateButtons[0]).removeAttr('disabled');
			}
			if(moment(this.model.parent.model.date.actual).isAfter(lastDate)) {
				$(dateButtons[1]).attr('disabled', 'disabled');
			} else {
				$(dateButtons[1]).removeAttr('disabled');
			}
		},

		scrollCalendar: function(event) {
			var target = $(event.currentTarget);
			var direction = target.attr('data-direction');

			if (this.model.parent.model.calendar.length > 0){
				var date = new Date (this.model.parent.model.date.actual);

				var firstDate = this.model.parent.model.calendar[0];
				var lastDate = this.model.parent.model.calendar.slice(-1).pop();

				if (direction === 'next') {
					var newDate = moment(date).add(1, 'd');
					var index1 = 1;

					while (index1 < 60 && newDate.isBefore(lastDate)) {
						var formateDate = YSDFormatter.formatDate(newDate, this.model.parent.model.api_date_format);
						var newInstanceDate = new Date(formateDate);
		
						var isInclude = this.model.parent.model.calendar.includes(formateDate);
						if (isInclude){
							var inputDate = this.model.target.find('input[name=date]');
							inputDate.datepicker('setDate', newInstanceDate);
							this.setDate(newInstanceDate);
							return;
						}
						
						index1 += 1;
						newDate = moment(date).add(index1, 'd');
					}
				} else if (direction === 'back') {
					var newDate = moment(date).subtract(1, 'd');
					var index2 = 1;

					while (index2 < 60 && newDate.isAfter(firstDate)) {
						var formateDate = YSDFormatter.formatDate(newDate, this.model.parent.model.api_date_format);
						var newInstanceDate = new Date(formateDate);
		
						var isInclude = this.model.parent.model.calendar.includes(formateDate);
						if (isInclude){
							var inputDate = this.model.target.find('input[name=date]');
							inputDate.datepicker('setDate', newInstanceDate);
							this.setDate(newInstanceDate);
							return;
						}

						index2 += 1;
						newDate = moment(date).subtract(index2, 'd');
					}
				}
			}
		},

		/**
		 * Horizontal scroll
		*/
		setScrollButtonsState: function(){
			var actualMargin = this.model.columns.actualMargin;

			var scrollButtons = this.model.target.find('button[data-action=scroll]');

			if (actualMargin >= 0) {
				$(scrollButtons[0]).attr('disabled', 'disabled');
			} else {
				$(scrollButtons[0]).removeAttr('disabled');
			}

			if ((actualMargin * -1) >= ((this.model.columns.total - this.model.columns.visibles) * this.model.columns.width)) {
				$(scrollButtons[1]).attr('disabled', 'disabled');
			} else {
				$(scrollButtons[1]).removeAttr('disabled');
			}
		},

		scroll: function(event) {
			var target = $(event.currentTarget);
			var direction = target.attr('data-direction');

			var container = this.model.parent.model.target.find('.mybooking-planning-scrollable table');

			var actualMargin = 0;
			if (direction === 'next') {
				actualMargin = this.model.columns.actualMargin +  (this.model.columns.width * -1);
			} else if (direction === 'back') {
				actualMargin = this.model.columns.actualMargin + this.model.columns.width;
			}

			this.model.columns.actualMargin = actualMargin;
			this.setScrollButtonsState();

			container.animate({
				marginLeft: this.model.columns.actualMargin,
			}, {
				duration: 1000
			});
		},

		/**
		 * Events
		*/
		setEvents: function() {
			/*
			* Button next events
			*/
			var scrollButtons = this.model.target.find('button[data-action=scroll]');

			this.setScrollButtonsState();
			scrollButtons.off('click');
			scrollButtons.on('click', this.scroll.bind(this));

			/*
			* Category selector
			*/
			var categorySelector = this.model.target.find('select[name=category]');
			categorySelector.off('change');
			categorySelector.on('change', this.setCategory.bind(this));

			/*
			* Calendar scroll
			*/
			var dateButtons = this.model.target.find('button[data-action=date]');

			if (this.model.parent.model.calendar.length > 0) {
				dateButtons.off('click');
				dateButtons.on('click', this.scrollCalendar.bind(this));
			} else {
				dateButtons.attr('disabled', 'disabled');
			}
		},

		setValidations: function() {
			this.model.target.validate({
				submitHandler: function(form, event) {
					event.preventDefault();
				},
				rules: {         
				},
				messages: {
				},
				errorPlacement: function (error, element) {
					error.insertAfter(element.parent());
				},
				errorClass : 'form-reservation-error'
		 });
		},

		/**
		 * Initizialize
		*/
		init:  function ({ total, category }) {
			this.refresh({ total, category });
			this.initializeDate();
			this.initializeCategory();
			this.setEvents();
			this.setValidations();
		}
	};

	var planningActionBar = {
		/**
		 * Factory
		*/
		factory: function(obj) {
			ActionBar.prototype = {
				...model,
				...controller,
				...view,
			};

			return new ActionBar(obj); 
		},

		/**
		 * Initizialize
		*/
		init: function({ parent, settings , total, category}) {
			var initSettings = {
				parent,
				...settings,
			};

			var  actionBar = this.factory(initSettings);
			actionBar.init({ total, category });
		},
	};

	return planningActionBar;
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9teWJvb2tpbmctanMtZW5naW5lLy4vc3JjL3JlbnQvcGxhbm5pbmcvcGxhbm5pbmdBY3Rpb25CYXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxpR0FBNEIsQ0FBQyx5QkFBUSxFQUFFLHlCQUFnQixFQUFFLHlCQUFnQjtBQUN6RSxPQUFPLHdCQUFRLEVBQUUseUJBQWMsRUFBRSx5QkFBaUIsRUFBRSx5QkFBVyxFQUFFLHdCQUF5QjtBQUMxRixPQUFPLHlCQUF5QixFQUFFLHlCQUF5QixFQUFFLHlCQUF5QjtBQUN0RixPQUFPLHlCQUFpQyxDQUFDLG1DQUNsQzs7QUFFUDtBQUNBO0FBQ0E7QUFDQSxxQkFBcUIsdUNBQXVDO0FBQzVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQSxvREFBb0QsVUFBVSxxQ0FBcUM7QUFDbkcsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxJQUFJO0FBQ0o7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLG9EQUFvRCxVQUFVLHFDQUFxQztBQUNuRyxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsSUFBSTs7QUFFSjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLElBQUk7QUFDSixHQUFHOztBQUVILHFCQUFxQixrQkFBa0I7QUFDdkM7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBLEdBQUc7QUFDSDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBOztBQUVBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBLElBQUk7QUFDSixHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wsWTtBQUNBLEtBQUs7QUFDTDtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsSUFBSTtBQUNKLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0Esb0JBQW9CLGtCQUFrQjtBQUN0QyxpQkFBaUIsa0JBQWtCO0FBQ25DO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSw2QjtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0Esa0JBQWtCLG9DQUFvQztBQUN0RDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLG1CQUFtQixrQkFBa0I7QUFDckMsR0FBRztBQUNIOztBQUVBO0FBQ0EsQ0FBQztBQUFBLGtHQUFDLEMiLCJmaWxlIjoiNzE2Lm15Ym9va2luZy1qcy1lbmdpbmUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJkZWZpbmUoJ3BsYW5uaW5nQWN0aW9uQmFyJywgWydqcXVlcnknLCAnWVNERXZlbnRUYXJnZXQnLCAnY29tbW9uU2V0dGluZ3MnLFxuICAgICAgICdtb21lbnQnLCAnWVNERm9ybWF0dGVyJywgJ2pxdWVyeS52YWxpZGF0ZScsICdqcXVlcnkudWknLCAnanF1ZXJ5LnVpLmRhdGVwaWNrZXItZXMnLFxuICAgICAgICdqcXVlcnkudWkuZGF0ZXBpY2tlci1lbicsICdqcXVlcnkudWkuZGF0ZXBpY2tlci1jYScsICdqcXVlcnkudWkuZGF0ZXBpY2tlci1pdCcsXG4gICAgICAgJ2pxdWVyeS51aS5kYXRlcGlja2VyLnZhbGlkYXRpb24nXSxcbiAgICAgICBmdW5jdGlvbigkLCBZU0RFdmVudFRhcmdldCwgY29tbW9uU2V0dGluZ3MsIG1vbWVudCwgWVNERm9ybWF0dGVyKSB7XG5cblx0LyoqXG5cdCAqIENvbnRydWN0b3Jcblx0Ki9cblx0ZnVuY3Rpb24gQWN0aW9uQmFyKHsgdGFyZ2V0LCBwYXJlbnQsIGNvbHVtbnNXaWR0aCwgdG90YWwgIH0pIHtcblx0XHQvKipcblx0XHQgKiBQbGFubmluZ0FjdGlvbkJhciBkYXRhIG1vZGVsXG5cdFx0Ki9cblx0XHR0aGlzLm1vZGVsID0ge1xuXHRcdFx0cGFyZW50LFxuXHRcdFx0dGFyZ2V0LFxuXHRcdFx0Y29sdW1uczoge1xuXHRcdFx0XHR3aWR0aDogY29sdW1uc1dpZHRoIHx8wqAxNTAsXG5cdFx0XHRcdHZpc2libGVzOiAwLFxuXHRcdFx0XHRhY3R1YWxNYXJnaW46IDAsXG5cdFx0XHRcdHRvdGFsOiAwLFxuXHRcdFx0fVxuXHRcdH07XG5cdH1cblxuXHR2YXIgbW9kZWwgPSB7XG5cdH07XG5cblx0dmFyIGNvbnRyb2xsZXIgPSB7XG5cdFx0LyoqXG5cdFx0ICogU2V0IGNhdGVnb3J5XG5cdFx0Ki9cblx0XHRzZXRDYXRlZ29yeTogZnVuY3Rpb24oZXZlbnQpe1xuXHRcdFx0dmFyIHZhbHVlID0gJChldmVudC5jdXJyZW50VGFyZ2V0KS52YWwoKTtcblxuXHRcdFx0dGhpcy5tb2RlbC5wYXJlbnQubW9kZWwuY2F0ZWdvcnkgPSB2YWx1ZTtcblxuXHRcdFx0dmFyIHRhcmdldCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMubW9kZWwucGFyZW50Lm1vZGVsLnRhcmdldElkKTtcblx0XHRcdHRhcmdldC5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudCgncmVmcmVzaCcsIHsgZGV0YWlsOiB7IGNhbGxiYWNrOiB0aGlzLnJlZnJlc2guYmluZCh0aGlzKSB9fSApKTtcblx0XHR9LFxuXG5cdFx0LyoqXG5cdFx0ICogSW5pdGlhbGl6ZSBjYXRlZ29yeVxuXHRcdCovXG5cdFx0aW5pdGlhbGl6ZUNhdGVnb3J5OiBmdW5jdGlvbigpe1xuXHRcdFx0dmFyIGNhdGVnb3J5U2VsZWN0b3IgPSB0aGlzLm1vZGVsLnRhcmdldC5maW5kKCdzZWxlY3RbbmFtZT1jYXRlZ29yeV0nKTtcblxuXHRcdFx0aWYgKHRoaXMubW9kZWwucGFyZW50Lm1vZGVsLmNhdGVnb3JpZXMubGVuZ3RoID4gMCkge1xuXHRcdFx0XHR0aGlzLm1vZGVsLnBhcmVudC5tb2RlbC5jYXRlZ29yaWVzLmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xuXHRcdFx0XHRcdGNhdGVnb3J5U2VsZWN0b3IuYXBwZW5kKCc8b3B0aW9uIHZhbHVlPVwiJyArIGl0ZW0uY29kZSArICdcIj4nICsgaXRlbS5uYW1lICsgJzwvb3B0aW9uPicpXG5cdFx0XHRcdH0pO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y2F0ZWdvcnlTZWxlY3Rvci5hdHRyKCdkaXNhYmxlZCcsICdkaXNhYmxlZCcpO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHQvKipcblx0XHQgKiBTZXQgbmV3IGRhdGUgYW5kIHJlZnJlc2ggcGxhbm5pbmdcblx0XHQqL1xuXHRcdHNldERhdGU6ICBmdW5jdGlvbihwYXJhbURhdGUpIHtcblx0XHRcdHRoaXMubW9kZWwucGFyZW50Lm1vZGVsLmRhdGUuYWN0dWFsID0gWVNERm9ybWF0dGVyLmZvcm1hdERhdGUocGFyYW1EYXRlLCB0aGlzLm1vZGVsLnBhcmVudC5tb2RlbC5hcGlfZGF0ZV9mb3JtYXQpO1xuXG5cdFx0XHR2YXIgdGFyZ2V0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpcy5tb2RlbC5wYXJlbnQubW9kZWwudGFyZ2V0SWQpO1xuXHRcdFx0dGFyZ2V0LmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KCdyZWZyZXNoJywgeyBkZXRhaWw6IHsgY2FsbGJhY2s6IHRoaXMucmVmcmVzaC5iaW5kKHRoaXMpIH19ICkpO1xuXHRcdH0sXG5cblx0XHQvKipcblx0XHQgKiBJbml0aWFsaXplIGFuZCByZWZyZXNoIHBsYW5uaW5nXG5cdFx0Ki9cblx0XHRpbml0aWFsaXplRGF0ZTogZnVuY3Rpb24oKSB7XG5cdFx0XHQkLmRhdGVwaWNrZXIuc2V0RGVmYXVsdHMoICQuZGF0ZXBpY2tlci5yZWdpb25hbFtjb21tb25TZXR0aW5ncy5sYW5ndWFnZShkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQubGFuZykgfHzCoCdlcyddICk7XG5cdFx0XHRcblx0XHRcdHZhciBpbnB1dERhdGUgPSB0aGlzLm1vZGVsLnRhcmdldC5maW5kKCdpbnB1dFtuYW1lPWRhdGVdJyk7XG5cdFx0XHR2YXIgZGF0ZSA9IG5ldyBEYXRlICh0aGlzLm1vZGVsLnBhcmVudC5tb2RlbC5kYXRlLmFjdHVhbCk7XG5cdFx0XHRcblx0XHRcdGlucHV0RGF0ZS5kYXRlcGlja2VyKHtcblx0XHRcdFx0bWluRGF0ZTogZGF0ZSxcblx0XHRcdH0pO1xuXG5cdFx0XHRpbnB1dERhdGUuZGF0ZXBpY2tlcignc2V0RGF0ZScsIGRhdGUpO1xuXG5cdFx0XHR2YXIgdGhhdCA9IHRoaXM7XG5cdFx0XHR0aGlzLm1vZGVsLnRhcmdldC5maW5kKCdpbnB1dFtuYW1lPWRhdGVdJykub2ZmKCdjaGFuZ2UnKTtcblx0XHRcdHRoaXMubW9kZWwudGFyZ2V0LmZpbmQoJ2lucHV0W25hbWU9ZGF0ZV0nKS5vbignY2hhbmdlJywgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciB2YWx1ZSA9ICQodGhpcykuZGF0ZXBpY2tlcignZ2V0RGF0ZScpO1xuXG5cdFx0XHRcdHRoYXQuc2V0RGF0ZSh2YWx1ZSk7XG5cdFx0XHR9KTtcblx0XHR9LFxuXG5cdFx0cmVmcmVzaDogZnVuY3Rpb24oeyB0b3RhbCwgY2F0ZWdvcnkgfSkge1xuXHRcdFx0aWYgKHRvdGFsID4gMCkge1xuXHRcdFx0XHR0aGlzLnNldENvbHVtbnModG90YWwpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAodGhpcy5tb2RlbC5wYXJlbnQubW9kZWwuY2FsZW5kYXIubGVuZ3RoID4gMCkge1xuXHRcdFx0XHR0aGlzLnNldFNjcm9sbENhbGVuZGFyQnV0dG9uc1N0YXRlKCk7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuc2V0U2Nyb2xsQnV0dG9uc1N0YXRlKCk7XG5cblx0XHRcdHRoaXMubW9kZWwudGFyZ2V0LmZpbmQoJ3NlbGVjdFtuYW1lPWNhdGVnb3J5XScpLnZhbChjYXRlZ29yeSk7XG5cdFx0fSxcblx0fTtcblxuXHR2YXIgdmlldyA9IHtcblx0XHQvKipcblx0XHQgKiBTZXQgY29sdW1ucyB3aWR0aCBhbmQgZml4IGNvbnRhaW5lciB0byBzaG93IGNvbXBsZXRlIGNvbHVtbnNcblx0XHQqL1xuXHRcdHNldENvbHVtbnM6IGZ1bmN0aW9uKHRvdGFsKSB7XG5cdFx0XHR0aGlzLm1vZGVsLmNvbHVtbnMudG90YWwgPSB0b3RhbDtcblxuXHRcdFx0dmFyIHRhcmdldCA9IHRoaXMubW9kZWwucGFyZW50Lm1vZGVsLnRhcmdldDtcblx0XHRcdHZhciBjb250YWluZXIgPSAkKHRhcmdldCkuZmluZCgnLm15Ym9va2luZy1wbGFubmluZy1zY3JvbGxhYmxlJyk7XG5cdFx0XHR2YXIgdGhzID0gJCh0YXJnZXQpLmZpbmQoJ3RoZWFkIHRoOm5vdCgubXlib29raW5nLXBsYW5uaW5nLXRkLWZpeCknKTtcblx0XHRcdHZhciB0ZHMgPSAkKHRhcmdldCkuZmluZCgndGJvZHkgdGQnKTtcblx0XHRcdHZhciBjb250YWluZXJXaWR0aCA9IHRoaXMubW9kZWwucGFyZW50Lm1vZGVsLnRhcmdldC5jbG9zZXN0KCcubXlib29raW5nLXBsYW5uaW5nLWNvbnRlbnQnKS53aWR0aCgpIC0gd2luZG93LnBhcnNlSW50KGNvbnRhaW5lci5jc3MoJ21hcmdpbi1sZWZ0JykpO1xuXG5cdFx0XHR0aGlzLm1vZGVsLmNvbHVtbnMudmlzaWJsZXMgPSBNYXRoLmZsb29yKGNvbnRhaW5lcldpZHRoIC8gdGhpcy5tb2RlbC5jb2x1bW5zLndpZHRoKTtcblxuXHRcdFx0aWYgKHRoaXMubW9kZWwuY29sdW1ucy52aXNpYmxlcyA+IHRoaXMubW9kZWwuY29sdW1ucy50b3RhbCkge1xuXHRcdFx0XHR0aGlzLm1vZGVsLmNvbHVtbnMudmlzaWJsZXMgPSB0aGlzLm1vZGVsLmNvbHVtbnMudG90YWw7XG5cdFx0XHR9XG5cblx0XHRcdHRocy5jc3MoJ3dpZHRoJywgdGhpcy5tb2RlbC5jb2x1bW5zLndpZHRoICsgJ3B4JyApO1xuXHRcdFx0dGRzLmNzcygnd2lkdGgnLCB0aGlzLm1vZGVsLmNvbHVtbnMud2lkdGggKyAncHgnICk7XG5cdFx0XHRjb250YWluZXIuY3NzKCd3aWR0aCcsICh0aGlzLm1vZGVsLmNvbHVtbnMudmlzaWJsZXMgKiB0aGlzLm1vZGVsLmNvbHVtbnMud2lkdGgpICsgJ3B4Jyk7XG5cdFx0XHRcblx0XHRcdGlmICh0aGlzLm1vZGVsLmNvbHVtbnMudG90YWwgKiB0aGlzLm1vZGVsLmNvbHVtbnMud2lkdGggPiB0aGlzLm1vZGVsLmNvbHVtbnMuYWN0dWFsTWFyZ2luICogLTEpe1xuXHRcdFx0XHRjb250YWluZXIuZmluZCgndGFibGUnKS5jc3MoJ21hcmdpbi1sZWZ0JywgdGhpcy5tb2RlbC5jb2x1bW5zLmFjdHVhbE1hcmdpbik7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdC8qKlxuXHRcdCAqIFNjcm9sbCBjYWxlbmRhclxuXHRcdCovXG5cdFx0c2V0U2Nyb2xsQ2FsZW5kYXJCdXR0b25zU3RhdGU6IGZ1bmN0aW9uKCl7XG5cdFx0XHR2YXIgZGF0ZUJ1dHRvbnMgPSB0aGlzLm1vZGVsLnRhcmdldC5maW5kKCdidXR0b25bZGF0YS1hY3Rpb249ZGF0ZV0nKTtcblx0XHRcdHZhciBmaXJzdERhdGUgPSBtb21lbnQodGhpcy5tb2RlbC5wYXJlbnQubW9kZWwuY2FsZW5kYXJbMF0pLmFkZCgxLCAnZCcpO1xuXHRcdFx0dmFyIGxhc3REYXRlID0gbW9tZW50KHRoaXMubW9kZWwucGFyZW50Lm1vZGVsLmNhbGVuZGFyLnNsaWNlKC0xKS5wb3AoKSkuc3VidHJhY3QoMSwgJ2QnKTtcblxuXHRcdFx0aWYobW9tZW50KHRoaXMubW9kZWwucGFyZW50Lm1vZGVsLmRhdGUuYWN0dWFsKS5pc0JlZm9yZShmaXJzdERhdGUpKSB7XG5cdFx0XHRcdCQoZGF0ZUJ1dHRvbnNbMF0pLmF0dHIoJ2Rpc2FibGVkJywgJ2Rpc2FibGVkJyk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQkKGRhdGVCdXR0b25zWzBdKS5yZW1vdmVBdHRyKCdkaXNhYmxlZCcpO1xuXHRcdFx0fVxuXHRcdFx0aWYobW9tZW50KHRoaXMubW9kZWwucGFyZW50Lm1vZGVsLmRhdGUuYWN0dWFsKS5pc0FmdGVyKGxhc3REYXRlKSkge1xuXHRcdFx0XHQkKGRhdGVCdXR0b25zWzFdKS5hdHRyKCdkaXNhYmxlZCcsICdkaXNhYmxlZCcpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0JChkYXRlQnV0dG9uc1sxXSkucmVtb3ZlQXR0cignZGlzYWJsZWQnKTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0c2Nyb2xsQ2FsZW5kYXI6IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHR2YXIgdGFyZ2V0ID0gJChldmVudC5jdXJyZW50VGFyZ2V0KTtcblx0XHRcdHZhciBkaXJlY3Rpb24gPSB0YXJnZXQuYXR0cignZGF0YS1kaXJlY3Rpb24nKTtcblxuXHRcdFx0aWYgKHRoaXMubW9kZWwucGFyZW50Lm1vZGVsLmNhbGVuZGFyLmxlbmd0aCA+IDApe1xuXHRcdFx0XHR2YXIgZGF0ZSA9IG5ldyBEYXRlICh0aGlzLm1vZGVsLnBhcmVudC5tb2RlbC5kYXRlLmFjdHVhbCk7XG5cblx0XHRcdFx0dmFyIGZpcnN0RGF0ZSA9IHRoaXMubW9kZWwucGFyZW50Lm1vZGVsLmNhbGVuZGFyWzBdO1xuXHRcdFx0XHR2YXIgbGFzdERhdGUgPSB0aGlzLm1vZGVsLnBhcmVudC5tb2RlbC5jYWxlbmRhci5zbGljZSgtMSkucG9wKCk7XG5cblx0XHRcdFx0aWYgKGRpcmVjdGlvbiA9PT0gJ25leHQnKSB7XG5cdFx0XHRcdFx0dmFyIG5ld0RhdGUgPSBtb21lbnQoZGF0ZSkuYWRkKDEsICdkJyk7XG5cdFx0XHRcdFx0dmFyIGluZGV4MSA9IDE7XG5cblx0XHRcdFx0XHR3aGlsZSAoaW5kZXgxIDwgNjAgJiYgbmV3RGF0ZS5pc0JlZm9yZShsYXN0RGF0ZSkpIHtcblx0XHRcdFx0XHRcdHZhciBmb3JtYXRlRGF0ZSA9IFlTREZvcm1hdHRlci5mb3JtYXREYXRlKG5ld0RhdGUsIHRoaXMubW9kZWwucGFyZW50Lm1vZGVsLmFwaV9kYXRlX2Zvcm1hdCk7XG5cdFx0XHRcdFx0XHR2YXIgbmV3SW5zdGFuY2VEYXRlID0gbmV3IERhdGUoZm9ybWF0ZURhdGUpO1xuXHRcdFxuXHRcdFx0XHRcdFx0dmFyIGlzSW5jbHVkZSA9IHRoaXMubW9kZWwucGFyZW50Lm1vZGVsLmNhbGVuZGFyLmluY2x1ZGVzKGZvcm1hdGVEYXRlKTtcblx0XHRcdFx0XHRcdGlmIChpc0luY2x1ZGUpe1xuXHRcdFx0XHRcdFx0XHR2YXIgaW5wdXREYXRlID0gdGhpcy5tb2RlbC50YXJnZXQuZmluZCgnaW5wdXRbbmFtZT1kYXRlXScpO1xuXHRcdFx0XHRcdFx0XHRpbnB1dERhdGUuZGF0ZXBpY2tlcignc2V0RGF0ZScsIG5ld0luc3RhbmNlRGF0ZSk7XG5cdFx0XHRcdFx0XHRcdHRoaXMuc2V0RGF0ZShuZXdJbnN0YW5jZURhdGUpO1xuXHRcdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcblx0XHRcdFx0XHRcdGluZGV4MSArPSAxO1xuXHRcdFx0XHRcdFx0bmV3RGF0ZSA9IG1vbWVudChkYXRlKS5hZGQoaW5kZXgxLCAnZCcpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIGlmIChkaXJlY3Rpb24gPT09ICdiYWNrJykge1xuXHRcdFx0XHRcdHZhciBuZXdEYXRlID0gbW9tZW50KGRhdGUpLnN1YnRyYWN0KDEsICdkJyk7XG5cdFx0XHRcdFx0dmFyIGluZGV4MiA9IDE7XG5cblx0XHRcdFx0XHR3aGlsZSAoaW5kZXgyIDwgNjAgJiYgbmV3RGF0ZS5pc0FmdGVyKGZpcnN0RGF0ZSkpIHtcblx0XHRcdFx0XHRcdHZhciBmb3JtYXRlRGF0ZSA9IFlTREZvcm1hdHRlci5mb3JtYXREYXRlKG5ld0RhdGUsIHRoaXMubW9kZWwucGFyZW50Lm1vZGVsLmFwaV9kYXRlX2Zvcm1hdCk7XG5cdFx0XHRcdFx0XHR2YXIgbmV3SW5zdGFuY2VEYXRlID0gbmV3IERhdGUoZm9ybWF0ZURhdGUpO1xuXHRcdFxuXHRcdFx0XHRcdFx0dmFyIGlzSW5jbHVkZSA9IHRoaXMubW9kZWwucGFyZW50Lm1vZGVsLmNhbGVuZGFyLmluY2x1ZGVzKGZvcm1hdGVEYXRlKTtcblx0XHRcdFx0XHRcdGlmIChpc0luY2x1ZGUpe1xuXHRcdFx0XHRcdFx0XHR2YXIgaW5wdXREYXRlID0gdGhpcy5tb2RlbC50YXJnZXQuZmluZCgnaW5wdXRbbmFtZT1kYXRlXScpO1xuXHRcdFx0XHRcdFx0XHRpbnB1dERhdGUuZGF0ZXBpY2tlcignc2V0RGF0ZScsIG5ld0luc3RhbmNlRGF0ZSk7XG5cdFx0XHRcdFx0XHRcdHRoaXMuc2V0RGF0ZShuZXdJbnN0YW5jZURhdGUpO1xuXHRcdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGluZGV4MiArPSAxO1xuXHRcdFx0XHRcdFx0bmV3RGF0ZSA9IG1vbWVudChkYXRlKS5zdWJ0cmFjdChpbmRleDIsICdkJyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdC8qKlxuXHRcdCAqIEhvcml6b250YWwgc2Nyb2xsXG5cdFx0Ki9cblx0XHRzZXRTY3JvbGxCdXR0b25zU3RhdGU6IGZ1bmN0aW9uKCl7XG5cdFx0XHR2YXIgYWN0dWFsTWFyZ2luID0gdGhpcy5tb2RlbC5jb2x1bW5zLmFjdHVhbE1hcmdpbjtcblxuXHRcdFx0dmFyIHNjcm9sbEJ1dHRvbnMgPSB0aGlzLm1vZGVsLnRhcmdldC5maW5kKCdidXR0b25bZGF0YS1hY3Rpb249c2Nyb2xsXScpO1xuXG5cdFx0XHRpZiAoYWN0dWFsTWFyZ2luID49IDApIHtcblx0XHRcdFx0JChzY3JvbGxCdXR0b25zWzBdKS5hdHRyKCdkaXNhYmxlZCcsICdkaXNhYmxlZCcpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0JChzY3JvbGxCdXR0b25zWzBdKS5yZW1vdmVBdHRyKCdkaXNhYmxlZCcpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoKGFjdHVhbE1hcmdpbiAqIC0xKSA+PSAoKHRoaXMubW9kZWwuY29sdW1ucy50b3RhbCAtIHRoaXMubW9kZWwuY29sdW1ucy52aXNpYmxlcykgKiB0aGlzLm1vZGVsLmNvbHVtbnMud2lkdGgpKSB7XG5cdFx0XHRcdCQoc2Nyb2xsQnV0dG9uc1sxXSkuYXR0cignZGlzYWJsZWQnLCAnZGlzYWJsZWQnKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdCQoc2Nyb2xsQnV0dG9uc1sxXSkucmVtb3ZlQXR0cignZGlzYWJsZWQnKTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0c2Nyb2xsOiBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0dmFyIHRhcmdldCA9ICQoZXZlbnQuY3VycmVudFRhcmdldCk7XG5cdFx0XHR2YXIgZGlyZWN0aW9uID0gdGFyZ2V0LmF0dHIoJ2RhdGEtZGlyZWN0aW9uJyk7XG5cblx0XHRcdHZhciBjb250YWluZXIgPSB0aGlzLm1vZGVsLnBhcmVudC5tb2RlbC50YXJnZXQuZmluZCgnLm15Ym9va2luZy1wbGFubmluZy1zY3JvbGxhYmxlIHRhYmxlJyk7XG5cblx0XHRcdHZhciBhY3R1YWxNYXJnaW4gPSAwO1xuXHRcdFx0aWYgKGRpcmVjdGlvbiA9PT0gJ25leHQnKSB7XG5cdFx0XHRcdGFjdHVhbE1hcmdpbiA9IHRoaXMubW9kZWwuY29sdW1ucy5hY3R1YWxNYXJnaW4gKyAgKHRoaXMubW9kZWwuY29sdW1ucy53aWR0aCAqIC0xKTtcblx0XHRcdH0gZWxzZSBpZiAoZGlyZWN0aW9uID09PSAnYmFjaycpIHtcblx0XHRcdFx0YWN0dWFsTWFyZ2luID0gdGhpcy5tb2RlbC5jb2x1bW5zLmFjdHVhbE1hcmdpbiArIHRoaXMubW9kZWwuY29sdW1ucy53aWR0aDtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5tb2RlbC5jb2x1bW5zLmFjdHVhbE1hcmdpbiA9IGFjdHVhbE1hcmdpbjtcblx0XHRcdHRoaXMuc2V0U2Nyb2xsQnV0dG9uc1N0YXRlKCk7XG5cblx0XHRcdGNvbnRhaW5lci5hbmltYXRlKHtcblx0XHRcdFx0bWFyZ2luTGVmdDogdGhpcy5tb2RlbC5jb2x1bW5zLmFjdHVhbE1hcmdpbixcblx0XHRcdH0sIHtcblx0XHRcdFx0ZHVyYXRpb246IDEwMDBcblx0XHRcdH0pO1xuXHRcdH0sXG5cblx0XHQvKipcblx0XHQgKiBFdmVudHNcblx0XHQqL1xuXHRcdHNldEV2ZW50czogZnVuY3Rpb24oKSB7XG5cdFx0XHQvKlxuXHRcdFx0KiBCdXR0b24gbmV4dCBldmVudHNcblx0XHRcdCovXG5cdFx0XHR2YXIgc2Nyb2xsQnV0dG9ucyA9IHRoaXMubW9kZWwudGFyZ2V0LmZpbmQoJ2J1dHRvbltkYXRhLWFjdGlvbj1zY3JvbGxdJyk7XG5cblx0XHRcdHRoaXMuc2V0U2Nyb2xsQnV0dG9uc1N0YXRlKCk7XG5cdFx0XHRzY3JvbGxCdXR0b25zLm9mZignY2xpY2snKTtcblx0XHRcdHNjcm9sbEJ1dHRvbnMub24oJ2NsaWNrJywgdGhpcy5zY3JvbGwuYmluZCh0aGlzKSk7XG5cblx0XHRcdC8qXG5cdFx0XHQqIENhdGVnb3J5IHNlbGVjdG9yXG5cdFx0XHQqL1xuXHRcdFx0dmFyIGNhdGVnb3J5U2VsZWN0b3IgPSB0aGlzLm1vZGVsLnRhcmdldC5maW5kKCdzZWxlY3RbbmFtZT1jYXRlZ29yeV0nKTtcblx0XHRcdGNhdGVnb3J5U2VsZWN0b3Iub2ZmKCdjaGFuZ2UnKTtcblx0XHRcdGNhdGVnb3J5U2VsZWN0b3Iub24oJ2NoYW5nZScsIHRoaXMuc2V0Q2F0ZWdvcnkuYmluZCh0aGlzKSk7XG5cblx0XHRcdC8qXG5cdFx0XHQqIENhbGVuZGFyIHNjcm9sbFxuXHRcdFx0Ki9cblx0XHRcdHZhciBkYXRlQnV0dG9ucyA9IHRoaXMubW9kZWwudGFyZ2V0LmZpbmQoJ2J1dHRvbltkYXRhLWFjdGlvbj1kYXRlXScpO1xuXG5cdFx0XHRpZiAodGhpcy5tb2RlbC5wYXJlbnQubW9kZWwuY2FsZW5kYXIubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRkYXRlQnV0dG9ucy5vZmYoJ2NsaWNrJyk7XG5cdFx0XHRcdGRhdGVCdXR0b25zLm9uKCdjbGljaycsIHRoaXMuc2Nyb2xsQ2FsZW5kYXIuYmluZCh0aGlzKSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRkYXRlQnV0dG9ucy5hdHRyKCdkaXNhYmxlZCcsICdkaXNhYmxlZCcpO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRzZXRWYWxpZGF0aW9uczogZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGlzLm1vZGVsLnRhcmdldC52YWxpZGF0ZSh7XG5cdFx0XHRcdHN1Ym1pdEhhbmRsZXI6IGZ1bmN0aW9uKGZvcm0sIGV2ZW50KSB7XG5cdFx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0fSxcblx0XHRcdFx0cnVsZXM6IHsgICAgICAgICBcblx0XHRcdFx0fSxcblx0XHRcdFx0bWVzc2FnZXM6IHtcblx0XHRcdFx0fSxcblx0XHRcdFx0ZXJyb3JQbGFjZW1lbnQ6IGZ1bmN0aW9uIChlcnJvciwgZWxlbWVudCkge1xuXHRcdFx0XHRcdGVycm9yLmluc2VydEFmdGVyKGVsZW1lbnQucGFyZW50KCkpO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRlcnJvckNsYXNzIDogJ2Zvcm0tcmVzZXJ2YXRpb24tZXJyb3InXG5cdFx0IH0pO1xuXHRcdH0sXG5cblx0XHQvKipcblx0XHQgKiBJbml0aXppYWxpemVcblx0XHQqL1xuXHRcdGluaXQ6ICBmdW5jdGlvbiAoeyB0b3RhbCwgY2F0ZWdvcnkgfSkge1xuXHRcdFx0dGhpcy5yZWZyZXNoKHsgdG90YWwsIGNhdGVnb3J5IH0pO1xuXHRcdFx0dGhpcy5pbml0aWFsaXplRGF0ZSgpO1xuXHRcdFx0dGhpcy5pbml0aWFsaXplQ2F0ZWdvcnkoKTtcblx0XHRcdHRoaXMuc2V0RXZlbnRzKCk7XG5cdFx0XHR0aGlzLnNldFZhbGlkYXRpb25zKCk7XG5cdFx0fVxuXHR9O1xuXG5cdHZhciBwbGFubmluZ0FjdGlvbkJhciA9IHtcblx0XHQvKipcblx0XHQgKiBGYWN0b3J5XG5cdFx0Ki9cblx0XHRmYWN0b3J5OiBmdW5jdGlvbihvYmopIHtcblx0XHRcdEFjdGlvbkJhci5wcm90b3R5cGUgPSB7XG5cdFx0XHRcdC4uLm1vZGVsLFxuXHRcdFx0XHQuLi5jb250cm9sbGVyLFxuXHRcdFx0XHQuLi52aWV3LFxuXHRcdFx0fTtcblxuXHRcdFx0cmV0dXJuIG5ldyBBY3Rpb25CYXIob2JqKTsgXG5cdFx0fSxcblxuXHRcdC8qKlxuXHRcdCAqIEluaXRpemlhbGl6ZVxuXHRcdCovXG5cdFx0aW5pdDogZnVuY3Rpb24oeyBwYXJlbnQsIHNldHRpbmdzICwgdG90YWwsIGNhdGVnb3J5fSkge1xuXHRcdFx0dmFyIGluaXRTZXR0aW5ncyA9IHtcblx0XHRcdFx0cGFyZW50LFxuXHRcdFx0XHQuLi5zZXR0aW5ncyxcblx0XHRcdH07XG5cblx0XHRcdHZhciAgYWN0aW9uQmFyID0gdGhpcy5mYWN0b3J5KGluaXRTZXR0aW5ncyk7XG5cdFx0XHRhY3Rpb25CYXIuaW5pdCh7IHRvdGFsLCBjYXRlZ29yeSB9KTtcblx0XHR9LFxuXHR9O1xuXG5cdHJldHVybiBwbGFubmluZ0FjdGlvbkJhcjtcbn0pOyJdLCJzb3VyY2VSb290IjoiIn0=