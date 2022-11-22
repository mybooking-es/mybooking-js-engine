(self["webpackChunkmybooking_js_engine"] = self["webpackChunkmybooking_js_engine"] || []).push([[82],{

/***/ 7082:
/***/ ((module, exports, __webpack_require__) => {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(9755), __webpack_require__(2599), __webpack_require__(8041),
       __webpack_require__(967), __webpack_require__(5404), __webpack_require__(5805), __webpack_require__(2663), __webpack_require__(350),
       __webpack_require__(7192), __webpack_require__(9650), __webpack_require__(6218),
       __webpack_require__(5237)], __WEBPACK_AMD_DEFINE_RESULT__ = (function($, YSDEventTarget, commonSettings, moment, YSDFormatter) {

	/**
	 * Contructor
	*/
	function WeekActionBar({ parent, target }) {
		/**
		 * ProductPlanningWeekActionBar data model
		*/
		this.model = {
			parent,
			target
		};
	}

	const model = {
	};

	const controller = {
		/**
		 * Set new date and refresh planning
		*/
		setDate:  function(paramDate) {
			this.model.parent.model.date.actual = YSDFormatter.formatDate(paramDate, this.model.parent.model.api_date_format);

			const target = document.getElementById(this.model.parent.model.targetId);
			target.dispatchEvent(new CustomEvent('refresh', { detail: { callback: this.refresh.bind(this) }} ));
		},

		/**
		 * Initialize and refresh planning
		*/
		initializeDate: function() {
			$.datepicker.setDefaults( $.datepicker.regional[commonSettings.language(document.documentElement.lang) || 'es'] );
			
			const inputDate = this.model.target.find('input[name=date]');
			const date = new Date (this.model.parent.model.date.actual);
			
			inputDate.datepicker({
				minDate: date,
			});

			inputDate.datepicker('setDate', date);

			this.model.target.find('input[name=date]').off('change');
			this.model.target.find('input[name=date]').on('change', () => {
				const value = $(this).datepicker('getDate');

				this.setDate(value);
			});
		},

		/**
		 *Refresh
		 */
		refresh: function() {
			if (this.model.parent.model.realCalendar.length > 0) {
				this.setScrollCalendarButtonsState();
			}
		},
	};

	const view = {
		/**
		 * Scroll calendar
		*/
		setScrollCalendarButtonsState: function(){
			const dateButtons = this.model.target.find('button[data-action=date]');
			const firstDate = moment(new Date(this.model.parent.model.configuration.serverDate));

			if(moment(this.model.parent.model.date.actual).isSame(firstDate) || moment(this.model.parent.model.date.actual).isBefore(firstDate)) {
				$(dateButtons[0]).attr('disabled', 'disabled');
			} else {
				$(dateButtons[0]).removeAttr('disabled');
			}
		},
		scrollCalendar: function(event) {
			const target = $(event.currentTarget);
			const direction = target.attr('data-direction');

			if (this.model.parent.model.realCalendar.length > 0){
				const date = new Date (this.model.parent.model.date.actual);

				const newDate = direction === 'next' ? moment(date).add(1, 'd') : moment(date).subtract(1, 'd');
				const formateDate = YSDFormatter.formatDate(newDate, this.model.parent.model.api_date_format);
				const newInstanceDate = new Date(formateDate);

				const inputDate = this.model.target.find('input[name=date]');
				inputDate.datepicker('setDate', newInstanceDate);
				this.setDate(newInstanceDate);
			}
		},
		
		/**
		 * Events
		*/
		setEvents: function() {
			/*
			* Calendar scroll
			*/
			const dateButtons = this.model.target.find('button[data-action=date]');

			if (this.model.parent.model.realCalendar.length > 0) {
				dateButtons.off('click');
				dateButtons.on('click', this.scrollCalendar.bind(this));
			} else {
				dateButtons.attr('disabled', 'disabled');
			}
		},

		/**
		 * Validations
		*/
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
		init:  function () {
			this.refresh();
			this.initializeDate();
			this.setEvents();
			this.setValidations();
		}
	};

	const ProductPlanningWeekActionBar = {
		/**
		 * Factory
		*/
		factory: function(obj) {
			WeekActionBar.prototype = {
				...model,
				...controller,
				...view,
			};

			return new WeekActionBar(obj); 
		},

		/**
		 * Initizialize
		*/
		init: function({ parent, settings }) {
			const initSettings = {
				parent,
				...settings,
			};

			const  WeekActionBar = this.factory(initSettings);
			WeekActionBar.init();
		},
	};

	return ProductPlanningWeekActionBar;
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9teWJvb2tpbmctanMtZW5naW5lLy4vc3JjL3JlbnQvcGxhbm5pbmcvcHJvZHVjdFBsYW5uaW5nV2Vla0FjdGlvbkJhci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLGlHQUF1QyxDQUFDLHlCQUFRLEVBQUUseUJBQWdCLEVBQUUseUJBQWdCO0FBQ3BGLE9BQU8sd0JBQVEsRUFBRSx5QkFBYyxFQUFFLHlCQUFpQixFQUFFLHlCQUFXLEVBQUUsd0JBQXlCO0FBQzFGLE9BQU8seUJBQXlCLEVBQUUseUJBQXlCLEVBQUUseUJBQXlCO0FBQ3RGLE9BQU8seUJBQWlDLENBQUMsbUNBQ2xDOztBQUVQO0FBQ0E7QUFDQTtBQUNBLHlCQUF5QixpQkFBaUI7QUFDMUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLG9EQUFvRCxVQUFVLHFDQUFxQztBQUNuRyxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsSUFBSTs7QUFFSjs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxJQUFJO0FBQ0osR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxZO0FBQ0EsS0FBSztBQUNMO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSxJQUFJO0FBQ0osR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxpQztBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0Esa0JBQWtCLG1CQUFtQjtBQUNyQztBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsR0FBRztBQUNIOztBQUVBO0FBQ0EsQ0FBQztBQUFBLGtHQUFDLEMiLCJmaWxlIjoiODIubXlib29raW5nLWpzLWVuZ2luZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImRlZmluZSgncHJvZHVjdFBsYW5uaW5nV2Vla0FjdGlvbkJhcicsIFsnanF1ZXJ5JywgJ1lTREV2ZW50VGFyZ2V0JywgJ2NvbW1vblNldHRpbmdzJyxcbiAgICAgICAnbW9tZW50JywgJ1lTREZvcm1hdHRlcicsICdqcXVlcnkudmFsaWRhdGUnLCAnanF1ZXJ5LnVpJywgJ2pxdWVyeS51aS5kYXRlcGlja2VyLWVzJyxcbiAgICAgICAnanF1ZXJ5LnVpLmRhdGVwaWNrZXItZW4nLCAnanF1ZXJ5LnVpLmRhdGVwaWNrZXItY2EnLCAnanF1ZXJ5LnVpLmRhdGVwaWNrZXItaXQnLFxuICAgICAgICdqcXVlcnkudWkuZGF0ZXBpY2tlci52YWxpZGF0aW9uJ10sXG4gICAgICAgZnVuY3Rpb24oJCwgWVNERXZlbnRUYXJnZXQsIGNvbW1vblNldHRpbmdzLCBtb21lbnQsIFlTREZvcm1hdHRlcikge1xuXG5cdC8qKlxuXHQgKiBDb250cnVjdG9yXG5cdCovXG5cdGZ1bmN0aW9uIFdlZWtBY3Rpb25CYXIoeyBwYXJlbnQsIHRhcmdldCB9KSB7XG5cdFx0LyoqXG5cdFx0ICogUHJvZHVjdFBsYW5uaW5nV2Vla0FjdGlvbkJhciBkYXRhIG1vZGVsXG5cdFx0Ki9cblx0XHR0aGlzLm1vZGVsID0ge1xuXHRcdFx0cGFyZW50LFxuXHRcdFx0dGFyZ2V0XG5cdFx0fTtcblx0fVxuXG5cdGNvbnN0IG1vZGVsID0ge1xuXHR9O1xuXG5cdGNvbnN0IGNvbnRyb2xsZXIgPSB7XG5cdFx0LyoqXG5cdFx0ICogU2V0IG5ldyBkYXRlIGFuZCByZWZyZXNoIHBsYW5uaW5nXG5cdFx0Ki9cblx0XHRzZXREYXRlOiAgZnVuY3Rpb24ocGFyYW1EYXRlKSB7XG5cdFx0XHR0aGlzLm1vZGVsLnBhcmVudC5tb2RlbC5kYXRlLmFjdHVhbCA9IFlTREZvcm1hdHRlci5mb3JtYXREYXRlKHBhcmFtRGF0ZSwgdGhpcy5tb2RlbC5wYXJlbnQubW9kZWwuYXBpX2RhdGVfZm9ybWF0KTtcblxuXHRcdFx0Y29uc3QgdGFyZ2V0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpcy5tb2RlbC5wYXJlbnQubW9kZWwudGFyZ2V0SWQpO1xuXHRcdFx0dGFyZ2V0LmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KCdyZWZyZXNoJywgeyBkZXRhaWw6IHsgY2FsbGJhY2s6IHRoaXMucmVmcmVzaC5iaW5kKHRoaXMpIH19ICkpO1xuXHRcdH0sXG5cblx0XHQvKipcblx0XHQgKiBJbml0aWFsaXplIGFuZCByZWZyZXNoIHBsYW5uaW5nXG5cdFx0Ki9cblx0XHRpbml0aWFsaXplRGF0ZTogZnVuY3Rpb24oKSB7XG5cdFx0XHQkLmRhdGVwaWNrZXIuc2V0RGVmYXVsdHMoICQuZGF0ZXBpY2tlci5yZWdpb25hbFtjb21tb25TZXR0aW5ncy5sYW5ndWFnZShkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQubGFuZykgfHzCoCdlcyddICk7XG5cdFx0XHRcblx0XHRcdGNvbnN0IGlucHV0RGF0ZSA9IHRoaXMubW9kZWwudGFyZ2V0LmZpbmQoJ2lucHV0W25hbWU9ZGF0ZV0nKTtcblx0XHRcdGNvbnN0IGRhdGUgPSBuZXcgRGF0ZSAodGhpcy5tb2RlbC5wYXJlbnQubW9kZWwuZGF0ZS5hY3R1YWwpO1xuXHRcdFx0XG5cdFx0XHRpbnB1dERhdGUuZGF0ZXBpY2tlcih7XG5cdFx0XHRcdG1pbkRhdGU6IGRhdGUsXG5cdFx0XHR9KTtcblxuXHRcdFx0aW5wdXREYXRlLmRhdGVwaWNrZXIoJ3NldERhdGUnLCBkYXRlKTtcblxuXHRcdFx0dGhpcy5tb2RlbC50YXJnZXQuZmluZCgnaW5wdXRbbmFtZT1kYXRlXScpLm9mZignY2hhbmdlJyk7XG5cdFx0XHR0aGlzLm1vZGVsLnRhcmdldC5maW5kKCdpbnB1dFtuYW1lPWRhdGVdJykub24oJ2NoYW5nZScsICgpID0+IHtcblx0XHRcdFx0Y29uc3QgdmFsdWUgPSAkKHRoaXMpLmRhdGVwaWNrZXIoJ2dldERhdGUnKTtcblxuXHRcdFx0XHR0aGlzLnNldERhdGUodmFsdWUpO1xuXHRcdFx0fSk7XG5cdFx0fSxcblxuXHRcdC8qKlxuXHRcdCAqUmVmcmVzaFxuXHRcdCAqL1xuXHRcdHJlZnJlc2g6IGZ1bmN0aW9uKCkge1xuXHRcdFx0aWYgKHRoaXMubW9kZWwucGFyZW50Lm1vZGVsLnJlYWxDYWxlbmRhci5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdHRoaXMuc2V0U2Nyb2xsQ2FsZW5kYXJCdXR0b25zU3RhdGUoKTtcblx0XHRcdH1cblx0XHR9LFxuXHR9O1xuXG5cdGNvbnN0IHZpZXcgPSB7XG5cdFx0LyoqXG5cdFx0ICogU2Nyb2xsIGNhbGVuZGFyXG5cdFx0Ki9cblx0XHRzZXRTY3JvbGxDYWxlbmRhckJ1dHRvbnNTdGF0ZTogZnVuY3Rpb24oKXtcblx0XHRcdGNvbnN0IGRhdGVCdXR0b25zID0gdGhpcy5tb2RlbC50YXJnZXQuZmluZCgnYnV0dG9uW2RhdGEtYWN0aW9uPWRhdGVdJyk7XG5cdFx0XHRjb25zdCBmaXJzdERhdGUgPSBtb21lbnQobmV3IERhdGUodGhpcy5tb2RlbC5wYXJlbnQubW9kZWwuY29uZmlndXJhdGlvbi5zZXJ2ZXJEYXRlKSk7XG5cblx0XHRcdGlmKG1vbWVudCh0aGlzLm1vZGVsLnBhcmVudC5tb2RlbC5kYXRlLmFjdHVhbCkuaXNTYW1lKGZpcnN0RGF0ZSkgfHzCoG1vbWVudCh0aGlzLm1vZGVsLnBhcmVudC5tb2RlbC5kYXRlLmFjdHVhbCkuaXNCZWZvcmUoZmlyc3REYXRlKSkge1xuXHRcdFx0XHQkKGRhdGVCdXR0b25zWzBdKS5hdHRyKCdkaXNhYmxlZCcsICdkaXNhYmxlZCcpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0JChkYXRlQnV0dG9uc1swXSkucmVtb3ZlQXR0cignZGlzYWJsZWQnKTtcblx0XHRcdH1cblx0XHR9LFxuXHRcdHNjcm9sbENhbGVuZGFyOiBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0Y29uc3QgdGFyZ2V0ID0gJChldmVudC5jdXJyZW50VGFyZ2V0KTtcblx0XHRcdGNvbnN0IGRpcmVjdGlvbiA9IHRhcmdldC5hdHRyKCdkYXRhLWRpcmVjdGlvbicpO1xuXG5cdFx0XHRpZiAodGhpcy5tb2RlbC5wYXJlbnQubW9kZWwucmVhbENhbGVuZGFyLmxlbmd0aCA+IDApe1xuXHRcdFx0XHRjb25zdCBkYXRlID0gbmV3IERhdGUgKHRoaXMubW9kZWwucGFyZW50Lm1vZGVsLmRhdGUuYWN0dWFsKTtcblxuXHRcdFx0XHRjb25zdCBuZXdEYXRlID0gZGlyZWN0aW9uID09PSAnbmV4dCcgPyBtb21lbnQoZGF0ZSkuYWRkKDEsICdkJykgOiBtb21lbnQoZGF0ZSkuc3VidHJhY3QoMSwgJ2QnKTtcblx0XHRcdFx0Y29uc3QgZm9ybWF0ZURhdGUgPSBZU0RGb3JtYXR0ZXIuZm9ybWF0RGF0ZShuZXdEYXRlLCB0aGlzLm1vZGVsLnBhcmVudC5tb2RlbC5hcGlfZGF0ZV9mb3JtYXQpO1xuXHRcdFx0XHRjb25zdCBuZXdJbnN0YW5jZURhdGUgPSBuZXcgRGF0ZShmb3JtYXRlRGF0ZSk7XG5cblx0XHRcdFx0Y29uc3QgaW5wdXREYXRlID0gdGhpcy5tb2RlbC50YXJnZXQuZmluZCgnaW5wdXRbbmFtZT1kYXRlXScpO1xuXHRcdFx0XHRpbnB1dERhdGUuZGF0ZXBpY2tlcignc2V0RGF0ZScsIG5ld0luc3RhbmNlRGF0ZSk7XG5cdFx0XHRcdHRoaXMuc2V0RGF0ZShuZXdJbnN0YW5jZURhdGUpO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0XG5cdFx0LyoqXG5cdFx0ICogRXZlbnRzXG5cdFx0Ki9cblx0XHRzZXRFdmVudHM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0Lypcblx0XHRcdCogQ2FsZW5kYXIgc2Nyb2xsXG5cdFx0XHQqL1xuXHRcdFx0Y29uc3QgZGF0ZUJ1dHRvbnMgPSB0aGlzLm1vZGVsLnRhcmdldC5maW5kKCdidXR0b25bZGF0YS1hY3Rpb249ZGF0ZV0nKTtcblxuXHRcdFx0aWYgKHRoaXMubW9kZWwucGFyZW50Lm1vZGVsLnJlYWxDYWxlbmRhci5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdGRhdGVCdXR0b25zLm9mZignY2xpY2snKTtcblx0XHRcdFx0ZGF0ZUJ1dHRvbnMub24oJ2NsaWNrJywgdGhpcy5zY3JvbGxDYWxlbmRhci5iaW5kKHRoaXMpKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGRhdGVCdXR0b25zLmF0dHIoJ2Rpc2FibGVkJywgJ2Rpc2FibGVkJyk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdC8qKlxuXHRcdCAqIFZhbGlkYXRpb25zXG5cdFx0Ki9cblx0XHRzZXRWYWxpZGF0aW9uczogZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGlzLm1vZGVsLnRhcmdldC52YWxpZGF0ZSh7XG5cdFx0XHRcdHN1Ym1pdEhhbmRsZXI6IGZ1bmN0aW9uKGZvcm0sIGV2ZW50KSB7XG5cdFx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0fSxcblx0XHRcdFx0cnVsZXM6IHsgICAgICAgICBcblx0XHRcdFx0fSxcblx0XHRcdFx0bWVzc2FnZXM6IHtcblx0XHRcdFx0fSxcblx0XHRcdFx0ZXJyb3JQbGFjZW1lbnQ6IGZ1bmN0aW9uIChlcnJvciwgZWxlbWVudCkge1xuXHRcdFx0XHRcdGVycm9yLmluc2VydEFmdGVyKGVsZW1lbnQucGFyZW50KCkpO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRlcnJvckNsYXNzIDogJ2Zvcm0tcmVzZXJ2YXRpb24tZXJyb3InXG5cdFx0IH0pO1xuXHRcdH0sXG5cblx0XHQvKipcblx0XHQgKiBJbml0aXppYWxpemVcblx0XHQqL1xuXHRcdGluaXQ6ICBmdW5jdGlvbiAoKSB7XG5cdFx0XHR0aGlzLnJlZnJlc2goKTtcblx0XHRcdHRoaXMuaW5pdGlhbGl6ZURhdGUoKTtcblx0XHRcdHRoaXMuc2V0RXZlbnRzKCk7XG5cdFx0XHR0aGlzLnNldFZhbGlkYXRpb25zKCk7XG5cdFx0fVxuXHR9O1xuXG5cdGNvbnN0IFByb2R1Y3RQbGFubmluZ1dlZWtBY3Rpb25CYXIgPSB7XG5cdFx0LyoqXG5cdFx0ICogRmFjdG9yeVxuXHRcdCovXG5cdFx0ZmFjdG9yeTogZnVuY3Rpb24ob2JqKSB7XG5cdFx0XHRXZWVrQWN0aW9uQmFyLnByb3RvdHlwZSA9IHtcblx0XHRcdFx0Li4ubW9kZWwsXG5cdFx0XHRcdC4uLmNvbnRyb2xsZXIsXG5cdFx0XHRcdC4uLnZpZXcsXG5cdFx0XHR9O1xuXG5cdFx0XHRyZXR1cm4gbmV3IFdlZWtBY3Rpb25CYXIob2JqKTsgXG5cdFx0fSxcblxuXHRcdC8qKlxuXHRcdCAqIEluaXRpemlhbGl6ZVxuXHRcdCovXG5cdFx0aW5pdDogZnVuY3Rpb24oeyBwYXJlbnQsIHNldHRpbmdzIH0pIHtcblx0XHRcdGNvbnN0IGluaXRTZXR0aW5ncyA9IHtcblx0XHRcdFx0cGFyZW50LFxuXHRcdFx0XHQuLi5zZXR0aW5ncyxcblx0XHRcdH07XG5cblx0XHRcdGNvbnN0ICBXZWVrQWN0aW9uQmFyID0gdGhpcy5mYWN0b3J5KGluaXRTZXR0aW5ncyk7XG5cdFx0XHRXZWVrQWN0aW9uQmFyLmluaXQoKTtcblx0XHR9LFxuXHR9O1xuXG5cdHJldHVybiBQcm9kdWN0UGxhbm5pbmdXZWVrQWN0aW9uQmFyO1xufSk7Il0sInNvdXJjZVJvb3QiOiIifQ==