require(['YSDFormatter', 'jquery', 'ysdtemplate', 'YSDGui', 'moment', 
         'new_reservation_customer_fields',
         'jquery.ui', 'jquery.ui.datepicker-es', 'jquery.validate',
         'jquery.ui.datepicker.validation','jquery.formparams', 'jquery.fixedtable', 'jquery.toast', 'datejs',
         'jquery.bootstrap.wizard', 'spectrum'],
        function(YSDFormatter, $, tmpl, YSDGui, moment, newReservationCustomerFields) {

  /* =============================================================================================== *
   *                                                                                                 *
   *                                                                                                 *
   * Developer notes:                                                                                *
   *                                                                                                 *
   *   There are two tricks :                                                                        *
   *                                                                                                 *
   *   - $(window).scroll() event to control which is the top visible row and its position           *
   *   - jquery ui draggable and its events: start - stop - drag - revert                            *
   *                                                                                                 *
   *                                                                                                 *
   *   How do we control the top scroll while dragging ? (the automatic response does not work well) *
   *                                                                                                 *
   *   - on $(window).scroll event, $(window).scrollTop() position is stored in topVisiblePosition   *
   *     and first visible row and the stock reference are stored in topVisibleRow and               *
   *     topVisibleItem                                                                              *
   *                                                                                                 *
   *   - while dragging the item, if it reach the topVisibleRow, force an scroll to the prior row    *
   *     so the effect is smoother and it feels to respond better                                    *
   *                                                                                                 *
   *   How do the original position is restored if drag is not permitted:                            *
   *                                                                                                 *
   *   - on start drag event, topVisiblePosition is stored in startDragWindowScrollTop to            *
   *     restore the it if the drag is reverted using $(window).scrollTop(startDragWindowScrollTop)  *
   *                                                                                                 *
   * =============================================================================================== */

  bookingPlanningModel = {

    hours: ['00:00','01:00','02:00','03:00','04:00','05:00','06:00','07:00','08:00','09:00','10:00','11:00',
            '12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00','23:00'],

    days: [
            '<%=t.booking_planning.planning_table.days.sunday%>', 
            '<%=t.booking_planning.planning_table.days.monday%>', 
            '<%=t.booking_planning.planning_table.days.tuesday%>', 
            '<%=t.booking_planning.planning_table.days.wednesday%>', 
            '<%=t.booking_planning.planning_table.days.thursday%>', 
            '<%=t.booking_planning.planning_table.days.friday%>', 
            '<%=t.booking_planning.planning_table.days.saturday%>'
          ],
    months: [
              '<%=t.booking_planning.planning_table.months.january%>',
              '<%=t.booking_planning.planning_table.months.fabruary%>',
              '<%=t.booking_planning.planning_table.months.march%>',
              '<%=t.booking_planning.planning_table.months.april%>',
              '<%=t.booking_planning.planning_table.months.may%>',
              '<%=t.booking_planning.planning_table.months.june%>',
              '<%=t.booking_planning.planning_table.months.july%>',
              '<%=t.booking_planning.planning_table.months.august%>',
              '<%=t.booking_planning.planning_table.months.september%>',
              '<%=t.booking_planning.planning_table.months.october%>',
              '<%=t.booking_planning.planning_table.months.november%>',
              '<%=t.booking_planning.planning_table.months.december%>'
            ],

    // Build data        
    startHour: "08",   // Start working hour
    endHour: "21",     // End working hour   
    lastHour: "21",    // Last hour
    numberOfHours: 18, /* Number of hours to be shown */

    dateFrom: null,                      /* Date from to be shown */
    dateTo: null,                        /* Date to to be shown */
    rentalStorageId: null,
    familyId: null,
    categoryCode: null,

    numberOfDays: <%=@planning_style=='compact' ? 16 : 31%>,  /* Number of days to be shown */
    cycle24Hours: <%=@product_family.cycle_of_24_hours && !@planning_full_day%>,
    categories: <%=@product_family.category_of_resources?%>,
    timeBetweenReturnPickup: <%=@planning_time_between_return_pickup%>,

    references: null,                    /* The loaded references (table rows) */
    referencesDetail: null,              /* The loaded references detail */
    planningData : null,                 /* The loaded data - reservation to show */

    selectedReference: null,             /* The current selected reference during DRAGGING*/
    selectedItemId: null,                /* The current selected id (pre-reservation or booking_line_resource) during DRAGGING */
    selectedItemOrigin: null,            /* The origin : booking or prereservation during DRAGGING*/
    selectedItemCategoryCode: null,      /* The selected item category code during DRAGGING*/
    selectedItemPosition: null,          /* The selected item position during DRAGGING */
    newReference: null,                  /* New stock reference to assign or reassign */
    newCategory: null,                   /* New stock reference / category to assign or reassign */

    tablePlanningTrHeight: null,         /* The height of a resource row */
    topVisibleItem: null,                /* The top visible stock item reference */
    topVisibleRow: null,                 /* The top visible row (tr element in planning_table) */
    topVisiblePosition: null,            /* The top visible position $(window).scrollTop() of the top visible row */
    startDragWindowScrollTop: null,      /* Store topVisiblePosition when starting drag and drop to restore if reverted */
    assignationResourceData: null,
    assignationDateFrom: null,
    assignationDateTo: null,
    assignationResourceId: null,
    assignationAutomaticallyPreassigned: false,
    planningStyle: 'daily',
    planningMeasurements: {
        'daily': {
          colReferenceWidth: 195,
          tableHeaderLineHeight: 25,
          tableColumnWidth: 40,
          tableLineHeight: 10,
        },
        'compact': {
           colReferenceWidth: 240,
           tableHeaderLineHeight: 25,
           tableColumnWidth: 40,
           tableLineHeight: 10,
        }
    },

    buildSpace: function() {

      var totalWidth = $('#planning_table').parent().width();

      var colSpace = totalWidth - this.planningMeasurements[this.planningStyle].colReferenceWidth;
      this.planningMeasurements.daily.tableColumnWidth = Math.round(colSpace / (18+2));
      this.planningMeasurements.compact.tableColumnWidth = Math.round(colSpace / (16+2));
      this.planningMeasurements.extended.tableColumnWidth = Math.round(colSpace / (31+2));
    },

    tableWidth: function() {

      if (this.planningStyle == 'daily') {
        return this.planningMeasurements[this.planningStyle].colReferenceWidth + 
               (this.numberOfHours * this.planningMeasurements[this.planningStyle].tableColumnWidth);
      }
      else {
        return this.planningMeasurements[this.planningStyle].colReferenceWidth + 
               (this.numberOfDays * this.planningMeasurements[this.planningStyle].tableColumnWidth);
      }
    },

    loadData: function() { /* Load the planning data */

      if (bookingPlanningModel.planningStyle == 'daily') {
        this.dateTo = bookingPlanningModel.dateFrom;
      }
      else {
        this.dateTo = new Date(bookingPlanningModel.dateFrom).add(bookingPlanningModel.numberOfDays-1).days();
      }

  	  if (this.dateFrom != null && this.dateTo != null) {

        // Parameters
        var from = moment(this.dateFrom).format('YYYY-MM-DD');
        var to = moment(this.dateTo).format('YYYY-MM-DD');
        // URL
        var url = '/api/booking/planning-summary?from='+from+'&to='+to;
        if (this.rentalStorageId != null && this.rentalStorageId != '') {
          url += '&rental_storage_id='+this.rentalStorageId;
        }
        if (this.familyId != null && this.familyId != '') {
          url += '&family_id='+this.familyId;
        }        
        if (this.categoryCode != null && this.categoryCode != '') {
          url += '&category_code='+this.categoryCode;
        }
        //
        YSDGui.lockBackground('#bbb');
        var unlock = false;   
 	      $.ajax({
  	        type: 'GET',
  	   	    url : url,
  	   	    contentType: 'application/json; charset=utf-8',
  		      dataType : 'json',
  		      success: function(data, textStatus, jqXHR) {
               bookingPlanningModel.references = data.references;
               bookingPlanningModel.referencesDetail = data.references_detail;
               bookingPlanningModel.planningData = data.result;
               bookingPlanningView.update('data_available');
               unlock = true;
               YSDGui.unLockBackground();   
            },
            error: function(textStatus, jqXHR) {
              alert('<%=t.booking_planning.planning_table.error_loading_data%>');
            },
            complete: function(jqXHT, textStatus) {
              if (!unlock) {
                  YSDGui.unLockBackground();
              }
            }
          });  	 
 	    }
      else {
    	bookingPlanningView.update('not_enough_information');
      }
    }

  };

  /* ==================================================================================== */
  /* Controller                                                                           */
  /* ==================================================================================== */

  bookingPlanningController = {

    planningDateChanged: function() {
        $('.planning_reservation').popover('hide');
        bookingPlanningModel.dateFrom = $('#planning_date').datepicker('getDate');
        bookingPlanningModel.loadData();
    },

    priorWeekButtonClick: function() {
        $('.planning_reservation').popover('hide');
        bookingPlanningModel.dateFrom.add(-7).days();
        $('#planning_date').datepicker('setDate', bookingPlanningModel.dateFrom);
        bookingPlanningModel.loadData();
    },

    priorDayButtonClick: function() {
        $('.planning_reservation').popover('hide');
        bookingPlanningModel.dateFrom.add(-1).days();
        $('#planning_date').datepicker('setDate', bookingPlanningModel.dateFrom);
        bookingPlanningModel.loadData();
    },

    nextDayButtonClick: function() {
        $('.planning_reservation').popover('hide');
        bookingPlanningModel.dateFrom.add(1).days();
        $('#planning_date').datepicker('setDate', bookingPlanningModel.dateFrom);
        bookingPlanningModel.loadData();
    },

    nextWeekButtonClick: function() {
        $('.planning_reservation').popover('hide');
        bookingPlanningModel.dateFrom.add(7).days();
        $('#planning_date').datepicker('setDate', bookingPlanningModel.dateFrom);
        bookingPlanningModel.loadData();
    },

    windowScroll: function() {

        // Register the information during scroll to be used during drag reservation

        bookingPlanningModel.topVisiblePosition = $(window).scrollTop();
        bookingPlanningModel.topVisibleRow = Math.floor(bookingPlanningModel.topVisiblePosition / bookingPlanningModel.tablePlanningTrHeight);
        bookingPlanningModel.topVisibleItem = $('#planning_table tr:nth('+bookingPlanningModel.topVisibleRow+')').attr('id');

    },

    onStartDragReservation: function(event, ui) { /* Start drag */

        bookingPlanningModel.startDragWindowScrollTop = bookingPlanningModel.topVisiblePosition;

    },

    onDragReservation: function (event, ui) { /* During dragging - check the top visible row*/

        // If the dragging element is over the top visible row, "force" a manual scroll
        var element = event.target;
        var top = $(element).position().top;
        var tableTop = $('#planning_table').position().top;
        top -= tableTop;

        if (top <= bookingPlanningModel.topVisiblePosition && top > 0) {
            var applyScroll = $(window).scrollTop() - bookingPlanningModel.tablePlanningTrHeight;
            $(window).scrollTop(applyScroll);
        }

    },

    onEndDragReservation: function(jQuerySelector) { /* End dragging - adjust the element position and reassign*/

        var dFrom = bookingPlanningModel.dateFrom.toString('yyyy-MM-dd'); 

        if (bookingPlanningModel.planningStyle == 'daily') {
          // Get the current position
          var headerHeight = parseInt($('th.hour_header').css('height').replace('px',''));
          var resourceWidth = parseInt($('td.planning_reference').css('width').replace('px',''));
          var resourceHeight = parseInt($('td.planning_reference').css('height').replace('px',''));
          var oneHourWidth = parseInt($('th.hour_header').css('width').replace('px',''));

          var position = $(jQuerySelector).position();
          var top = position.top;
          var left = position.left;
          var height = parseInt($(jQuerySelector).css('height').replace('px',''));

          top -= $('#planning_table').position().top; // Take into account planning table position
          left += 2;

          var posTop = Math.floor( (top + (height/2)) / resourceHeight);
          var posLeft = Math.floor( (left - resourceWidth) / oneHourWidth);
        }
        else {
          // Get the current position
          var headerHeight = parseInt($('th.date_header').css('height').replace('px',''));
          var resourceWidth = parseInt($('td.planning_reference').css('width').replace('px',''));
          var resourceHeight = parseInt($('td.planning_reference').css('height').replace('px',''));
          var oneDayWidth = parseInt($('th.date_header').css('width').replace('px',''));

          var position = $(jQuerySelector).position();
          var top = position.top;
          var left = position.left;
          var height = parseInt($(jQuerySelector).css('height').replace('px',''));

          top -= $('#planning_table').position().top; // Take into account planning table position
          left += 2;

          var posTop = Math.floor( (top + (height/2)) / resourceHeight);
          var posLeft = Math.floor( (left - resourceWidth) / oneDayWidth);
        }

        // Get the destination reference and category
        bookingPlanningModel.newReference = $($('#planning_table tbody tr')[posTop]).attr('id');
        bookingPlanningModel.newCategory = $($('#planning_table tbody tr')[posTop]).attr('rel');

        // Adjust the top to fit in a cell
        var positionResource = $('tr[id='+bookingPlanningModel.newReference+']').position();
        if (positionResource) {
          $(jQuerySelector).css({top: positionResource.top + $('#planning_table').position().top});
        }

        // Do the process
        if (bookingPlanningModel.newReference != bookingPlanningModel.selectedReference) {
            //TODO It should be done after reassignation
            $(jQuerySelector).attr('data-resource', bookingPlanningModel.newReference);
            $(jQuerySelector).attr('data-category', bookingPlanningModel.newCategory)
            bookingPlanningView.setupDraggable(jQuerySelector);
            bookingPlanningModel.reassignResource();
        }


    },

    colorChanged: function(id, type, color) { /* Change planning color */

      bookingPlanningModel.changeColor(id, type, color);

    },

    /**
     * Table cell click
     */
    tableCellClick: function(theElement, category, reference, date, hour) {

      $('.planning_reservation').popover('hide');

      if (bookingPlanningModel.assignationResourceData && $('#assignation_resource').is(':visible')) {

          var referenceCategory = theElement.parent().attr('rel');

          <% if @assignation_allow_diferent_categories %>
            if (referenceCategory != bookingPlanningModel.assignationResourceData.bookingCategory) {
                // Variable interpolation template so the special quotes
                var confirmation = confirm(`<%=t.booking_planning.planning_table.assignation_resource.different_category%>`);
            }
            else {
                var confirmation = confirm(`<%=t.booking_planning.planning_table.assignation_resource.same_category%>`);
            }
          <% else %>

            if (referenceCategory != bookingPlanningModel.assignationResourceData.bookingCategory) {
                alert("<%=t.booking_planning.planning_table.assignation_resource.different_category_alert%>");
                var confirmation = false;
            }
            else {
                var confirmation = confirm("<%=t.booking_planning.planning_table.assignation_resource.same_category%>");
            }
          <% end %>

          if (confirmation) {
              bookingPlanningModel.selectedItemId = bookingPlanningModel.assignationResourceData.bookingResourceId;
              bookingPlanningModel.newReference = reference;
              bookingPlanningModel.selectedItemOrigin = 'booking';
              bookingPlanningModel.assignResource();
          }
      }
      else {

          var itemResource = bookingPlanningModel.referencesDetail[reference];
          var description = itemResource.item_description;

          var dialog = $("<p><%=t.booking_planning.planning_table.new_booking_or_stock_lock.header%></p>").dialog({
              title: "<%=t.booking_planning.planning_table.new_booking_or_stock_lock.title%>",
              width: '425',
              height: '200',
              buttons: {
                "<%=t.booking_planning.planning_table.new_booking_or_stock_lock.new_reservation_btn%>":  function() {
                      dialog.dialog('close');
                      planningNewReservationView.show('booking', category, reference, description, date, hour, bookingPlanningModel.planningStyle);
                  },
                  "<%=t.booking_planning.planning_table.new_booking_or_stock_lock.stock_lock_btn%>": function() {
                      dialog.dialog('close');
                      planningNewReservationView.show('prereservation', category, reference, description, date, hour, bookingPlanningModel.planningStyle);
                  }
              }
          });

      }

    },

    closeAssignationResourceButtonClick: function() {

      bookingPlanningView.hideAssignationResource();

    },

    lockDragAndDrop: function() {
        $('.planning_locker').attr('checked', true);
        $('.planning_reservation').draggable('disable');
        $('.planning_reservation_draggable').draggable('disable');
    },

    unlockDragAndDrop: function() {
        $('.planning_locker').attr('checked', false);
        $('.planning_reservation').draggable('disable');
        $('.planning_reservation_draggable').draggable('enable');
    },

    rentalStorageIdChanged: function(value) {
      bookingPlanningModel.rentalStorageId = value; 
      $('.planning_rental_storage_id').val(value);
      bookingPlanningModel.loadData();
    },
    
    familyIdChanged: function(value) {
      bookingPlanningModel.familyId = value;
      $('.planning_family_id').val(value);
      bookingPlanningModel.loadData();
    },

    categoryCodeChanged: function(value) {
      bookingPlanningModel.categoryCode = value;
      bookingPlanningModel.loadData();
    },

    planningViewSelectorChanged: function(value) {

      var url = '/admin/booking/planning?view='+value;
      
      if (bookingPlanningModel.familyId != null && bookingPlanningModel.familyId != '') {
        url += ('&family_id='+bookingPlanningModel.familyId);
      }
      
      if (bookingPlanningModel.rentalStorageId != null && bookingPlanningModel.rentalStorageId != '') {
        url += ('&rental_storage_id='+bookingPlanningModel.rentalStorageId);
      }

      if (bookingPlanningModel.categoryCode != null && bookingPlanningModel.categoryCode != '') {
        url += ('&category_code='+bookingPlanningModel.categoryCode);
      }

      window.location.href = url;

    }


  };


  /* ==================================================================================== */
  /* View                                                                                 */
  /* ==================================================================================== */

  bookingPlanningView = {

    init: function() {

      this.setupControls();
      this.setupEvents();
      this.setupFilter();
      bookingPlanningModel.loadData();


    },

    /**
     * Configure controls
     */
    setupControls: function() {

      $.datepicker.setDefaults( $.datepicker.regional["<%=session[:locale] || 'es'%>" ] );
      var locale = $.datepicker.regional["<%=session[:locale] || 'es'%>"];
      $('#planning_date').datepicker({
            numberOfMonths:1,
            onSelect: function(dateText){
                bookingPlanningController.planningDateChanged();
            },
            dateFormat: 'dd/mm/yy'},
            locale);
      $('#planning_date').datepicker('setDate', new Date(bookingPlanningModel.dateFrom));

    },

    /**
     * Configure events
     */
    setupEvents: function() {

        $('#prior_week_button').bind('click', function(){
          bookingPlanningController.priorWeekButtonClick();
        });

        $('#prior_day_button').bind('click', function(){
          bookingPlanningController.priorDayButtonClick();
        });

        $('#next_day_button').bind('click', function(){
          bookingPlanningController.nextDayButtonClick();
        });

        $('#next_week_button').bind('click', function(){
          bookingPlanningController.nextWeekButtonClick();
        });

        $('#close_assignation_resource_button').bind('click', function() {
            bookingPlanningController.closeAssignationResourceButtonClick();
        });

        $('.planning_locker').bind('change', function(){
           if ($(this).is(':checked')) {
             bookingPlanningController.lockDragAndDrop();
           }
           else {
             bookingPlanningController.unlockDragAndDrop();
           }
        });

        $(window).scroll(function() {
            bookingPlanningController.windowScroll();
        });

        $('button[data-action=sidebar_mini_toggle]').bind('click', function(){
            bookingPlanningView.createPlanningTable();
            bookingPlanningView.fillPlanningTable();
        });

        $('.planning_rental_storage_id').bind('change', function(){
            bookingPlanningController.rentalStorageIdChanged($(this).val());
        });

        $('.planning_family_id').bind('change', function() {
            bookingPlanningController.familyIdChanged($(this).val());
        });

        $('#planning_category_code').bind('change', function() {
            bookingPlanningController.categoryCodeChanged($(this).val());
        });

        $('#planning_view_selector').bind('change', function(){
            bookingPlanningController.planningViewSelectorChanged($(this).val());
        });   

    },

    /**
     * Setup Filter
     */
    setupFilter: function() {
      if ($('.planning_rental_storage_id').length) {
        bookingPlanningModel.rentalStorageId = $('.planning_rental_storage_id').val();
      }
      if ($('.planning_family_id').length) {
        bookingPlanningModel.familyId = $('.planning_family_id').val();
      }
      if ($('#planning_category_code').length) {
        bookingPlanningModel.categoryCode = $('#planning_category_code').val();
      }
    },

    /**
     * Setup Popover
     */
    setupPopover: function (jQuerySelector) {

       // Setup the popover
       $(jQuerySelector).popover(
           {title: function() {
                     var origin = $(this).attr('data-origin');
                     if (origin == 'booking') {
                         return "<%=t.booking_planning.planning_table.booking_popover.reservation%>";
                     }
                     else {
                         if (origin = 'prereservation') {
                             return "<%=t.booking_planning.planning_table.booking_popover.stock_block%>";
                         }
                     }
                   },
            html: true,
            content: function(){
               var booking = {};
               booking.origin = $(this).attr('data-origin');
               booking.id = $(this).attr('data-id');
               booking.title = $(this).attr('data-booking-title');
               booking.date_from = $(this).attr('data-date-from');
               booking.time_from = $(this).attr('data-time-from');
               booking.pickup_place = $(this).attr('data-pickup-place');
               booking.date_to = $(this).attr('data-date-to');
               booking.time_to = $(this).attr('data-time-to');
               booking.return_place = $(this).attr('data-return-place');
               booking.planning_color = $(this).attr('data-planning-color');
               booking.detail = $(this).attr('data-detail');
               booking.id2 = $(this).attr('data-id-resource');
               booking.category = $(this).attr('data-category');
               booking.requestedCategory = $(this).attr('data-requested-category');
               booking.notes = $(this).attr('data-notes');
               booking.confirmed = $(this).attr('data-confirmed');
               booking.auto_assigned_item_reference = $(this).attr('data-auto-assigned-item-reference');
               booking.allow_change_planning_color = $(this).attr('data-allow-change-planning-color');
               booking.resource = $(this).attr('data-resource');
               booking.customer_phone = $(this).attr('data-customer-phone');
               booking.customer_email = $(this).attr('data-customer-email');
               var html = tmpl('planning_reservation_detail')({booking: booking});
               return html;
            },
            trigger: 'manual',
            placement: 'bottom'});

       // Setup event when the popover is shown
       $(jQuerySelector).on('shown.bs.popover', function () {
            var container = this;
            setTimeout(function(){
                $(container).removeClass('blinker');
            }, 100);
            if (!bookingPlanningModel.colorSupported()) {
              $('input[type=color]').spectrum();
            }
            $('.color').unbind('change');
            $('.color').bind('change', function () {
                var id = $(this).parent().find('input[name=id]').val();
                var type = $(this).parent().find('input[name=type]').val();
                var color =$(this).val();
                bookingPlanningController.colorChanged(id, type, color);
            });
           // Confirm assignation button click
           $('.confirm_assignation_button').bind('click', function() {
                var id = $(this).attr('rel');
                var origin = $(this).attr('data-origin');
                var reference = $(this).attr('data-resource');
                bookingPlanningModel.selectedItemId = id;
                bookingPlanningModel.newReference = reference;
                bookingPlanningModel.selectedItemOrigin = origin;
                bookingPlanningModel.confirmResourceAssignation();
           });
           // Destroy pre-reservation button click
           $('.destroy_prereservation_button').bind('click', function() {
                destroyStockBlockingController.destroyPrereservationClick($(this).attr('rel'));
           });
           // Add resources to prereservation button click
           $('.modify_prereservation_button').bind('click', function() {
               $('.planning_reservation').popover('hide');
               planningModifyStockBlockingView.show($(this).attr('rel'));
           });

        })

       // Setup event when the planning reservation is clicked
       this.popoverOff();
       this.popoverOn();

    },
    
    /*
     * activate popover to show reservation information 
     */
    popoverOn: function() { 
        $('.planning_reservation').bind('click', function(e){
            // Hide the current selected item
            $('.planning_reservation').not(this).popover('hide');
            // Check if there are overlapped elements
            var origin = $(this).attr('data-origin');
            var reference = $(this).attr('data-resource');
            var idResource= $(this).attr('data-id-resource');
            var dateFrom = $(this).attr('data-date-from');
            var timeFrom = $(this).attr('data-time-from');
            var dateTo = $(this).attr('data-date-to');
            var timeTo = $(this).attr('data-time-to');
            var overlapped = bookingPlanningModel.planningData.filter(function(element){
                // Same reference
                if (element.booking_item_reference != reference) {
                    return false;
                }
                if (bookingPlanningModel.cycle24Hours) {
                    var source_date_from = Date.parseExact(dateFrom + " " + timeFrom, 'yyyy-M-d HH:mm'); 
                    var source_date_to = Date.parseExact(dateTo + " " + timeTo, 'yyyy-M-d HH:mm')
                    var element_date_from = Date.parseExact(element.date_from + " " + element.time_from, 'yyyy-M-d HH:mm');
                    var element_date_to = Date.parseExact(element.date_to + " " + element.time_to, 'yyyy-M-d HH:mm');
                }
                else {
                    var source_date_from = Date.parseExact(dateFrom, 'yyyy-M-d');
                    var source_date_to = Date.parseExact(dateTo, 'yyyy-M-d');
                    var element_date_from = Date.parseExact(element.date_from, 'yyyy-M-d');
                    var element_date_to = Date.parseExact(element.date_to, 'yyyy-M-d');
                }

                var value = (source_date_from >= element_date_from && source_date_from <= element_date_to) ||
                            (source_date_from <= element_date_from && source_date_to >= element_date_to) ||
                            (source_date_to >= element_date_from && source_date_to <= element_date_to);
                return value;
            });

            if (overlapped != null && overlapped.length > 1) {
                var html = tmpl('script_select_reservation')({overlapped: overlapped});
                $('#reservation_container .modal-title').html('<%=t.booking_planning.planning_table.select_reservation_modal.header%>');
                $('#reservation_container .modal-body').html(html);
                $('.reservation_chooser').unbind('change');
                $('.reservation_chooser').bind('change', function(){
                   var selector = overlapped.map(function(element) {
                                                    return '.planning_reservation[data-origin='+element.origin+'][data-id='+element.id+']';
                                                 }).join(',');
                   var maxZindex = Math.max.apply(null, $(selector).toArray().map(function (element) { return parseInt($(element).css('z-index')); }));
                   var id = $(this).val(); // TODO Choose the max z-index from the candidates
                   $('#'+id).css('z-index', maxZindex+1);
                });
                $('.color').unbind('change');
                $('.color').bind('change', function () {
                    var id = $(this).parent().find('input[name=id]').val();
                    var type = $(this).parent().find('input[name=type]').val();
                    var color =$(this).val();
                    bookingPlanningController.colorChanged(id, type, color);
                });
                // Confirm assignation
                $('.confirm_assignation_button').unbind('click');
                $('.confirm_assignation_button').bind('click', function() {
                    var id = $(this).attr('rel');
                    var origin = $(this).attr('data-origin');
                    var reference = $(this).attr('data-resource');
                    bookingPlanningModel.selectedItemId = id;
                    bookingPlanningModel.newReference = reference;
                    bookingPlanningModel.selectedItemOrigin = origin;
                    bookingPlanningModel.confirmResourceAssignation();
                });                
                // Destroy pre-reservation button click
                $('.destroy_prereservation_button').unbind('click');
                $('.destroy_prereservation_button').bind('click', function() {
                    $('#reservation_container').modal('hide');
                    destroyStockBlockingController.destroyPrereservationClick($(this).attr('rel'));
                });
                // Add resources to prereservation button click
                $('.modify_prereservation_button').unbind('click');
                $('.modify_prereservation_button').bind('click', function() {
                    $('#reservation_container').modal('hide');
                    var id = $(this).attr('rel');
                    setTimeout(function(){
                        planningModifyStockBlockingView.show(id);
                    }, 500);
                });
                $('#reservation_container').unbind();
                $('#reservation_container').modal('show');
            }
            else {
                $(this).popover('toggle');
            }
        });
    },

    /* 
     * Deactivate popover 
     */
    popoverOff: function() {
        $('.planning_reservation').unbind('click');
    },

    /* 
     * Setup draggable on the reservations 
     */
    setupDraggable: function(jQuerySelector) { 
        $(jQuerySelector).draggable(
            {
                axis: 'y',
                cursor: "move",
                containment: '#planning_table tbody',
                scroll: true,
                opacity: 0.4,
                handle: '.planning_reservation_draggable',

                start: function (event, ui) {
                    bookingPlanningModel.selectedReference = $(this).attr('data-resource');
                    bookingPlanningModel.selectedItemId = $(this).attr('data-id-resource');
                    bookingPlanningModel.selectedItemOrigin = $(this).attr('data-origin');
                    bookingPlanningModel.selectedItemCategoryCode = $(this).attr('data-category');
                    bookingPlanningModel.selectedItemPosition = $(this).position();
                    bookingPlanningView.popoverOff();
                    bookingPlanningController.onStartDragReservation();
                },
                drag: function(event, ui) {
                      bookingPlanningController.onDragReservation(event, ui, $(this));
                },
                stop: function (event, ui) {
                    if (!event.reverted) {
                        bookingPlanningController.onEndDragReservation($(this));
                    }
                    setTimeout(function() {
                        bookingPlanningView.popoverOn();
                    },100);
                },
                revert: function() {
                    var dFrom = bookingPlanningModel.dateFrom.toISOString().substring(0,10);
                    var resourceHeight = parseInt($('td.planning_reference').css('height').replace('px',''));
                    var position = $(this).position();
                    var top = position.top;
                    top -= $('#planning_table').position().top; // Take into account planning table position
                    var height = parseInt($(this).css('height').replace('px',''));
                    var posTop = Math.floor( (top + (height/2)) / resourceHeight);

                    <% unless @assignation_allow_diferent_categories %>
                      var category = $($('#planning_table tbody tr')[posTop]).attr('rel');
                      if (category != bookingPlanningModel.selectedItemCategoryCode ) {
                          alert("<%=t.booking_planning.planning_table.assignation_resource_different_category_error%>");
                          // Scroll to show the original position
                          $(window).scrollTop(bookingPlanningModel.startDragWindowScrollTop);
                          return true;
                      }
                    <% end %>

                    var reference = $($('#planning_table tbody tr')[posTop]).attr('id');
                    var conflicts = bookingPlanningModel.checkConflicts(reference);

                    <% if @assignation_allow_busy_resource %>
                      if (conflicts.overlap != null) {
                          <% if @product_family.time_to_from %>
                          var msg = `<%=t.booking_planning.planning_table.assignation_busy_resource.message%>`;
                          var msg_overlap = `<%=t.booking_planning.planning_table.assignation_busy_resource.message_overlap%>`;
                          <% else %>
                          var msg = `<%=t.booking_planning.planning_table.assignation_busy_resource.else_message%>`;
                          var msg_overlap = `<%=t.booking_planning.planning_table.assignation_busy_resource.else_message_overlap%>`;
                          <% end %>
                          var result = !confirm(`<%=t.booking_planning.planning_table.assignation_busy_resource.confirm%>`);
                          if (result) {
                              $(window).scrollTop(bookingPlanningModel.startDragWindowScrollTop);
                          }
                          return result;
                      }
                    <% else %>
                      if (conflicts.overlap != null) {
                         alert(`<%=t.booking_planning.planning_table.assignation_busy_resource.alert_not_available%>`);
                         //alert('Lo sentimos. El recurso ' + resource + ' no está disponible');
                         return true;
                      }
                    <% end %>

                    return false;
                }
            }
        );

    },


    // ----------------------- Planning creation

    /* 
     * Creates the planning table 
     */
    createPlanningTable: function() { 

        this.removeItemsInPlanning();
        $('#planning_table_header thead').empty();
        $('#planning_table tbody').empty();

        bookingPlanningModel.buildSpace();
        $('#planning_table_header').width(bookingPlanningModel.tableWidth());
        $('#planning_table').width(bookingPlanningModel.tableWidth());

        // Create the column for the references
        $("#planning_table_header thead").append("<tr></tr>");
        var referenceHeader = "<th style='"+
           "width:" + bookingPlanningModel.planningMeasurements[bookingPlanningModel.planningStyle]['colReferenceWidth'].toString()+ "px;" +
           "line-height:" + bookingPlanningModel.planningMeasurements[bookingPlanningModel.planningStyle]['tableHeaderLineHeight'].toString()+"px; text-align:center; border: 1px solid #cccccc; background:white'>"+''+"</th>"
        $("#planning_table_header thead tr:first").append(referenceHeader);
        var lastCategory = null;
        var categories = 0;
        var rowClass = null;
        var categoryClass = '';
        var referenceClass = '';
        // Sort the references before painting the planning
        var sortedReferences = [];
        for (r in bookingPlanningModel.referencesDetail) {
          sortedReferences.push(bookingPlanningModel.referencesDetail[r]);
        }
        sortedReferences = sortedReferences.sort(
                                function(a,b){
                                  if (typeof a.sort_order === 'undefined' && typeof b.sort_order === 'undefined') {
                                    return 0;
                                  }
                                  else if (typeof a.sort_order === 'undefined') {
                                    return -1;
                                  }
                                  else if (typeof b.sort_order === 'undefined') {
                                    return 1;
                                  }
                                  else if (a.sort_order > b.sort_order) {
                                    return 1;
                                  }
                                  else if (a.sort_order < b.sort_order) {
                                    return -1;
                                  }
                                  return 0;
                              });
        for (var idx=0; idx<sortedReferences.length; idx++) {
            item = sortedReferences[idx].reference;
            // Category color / reference
            if (bookingPlanningModel.categories) {
              if (bookingPlanningModel.references[item] != lastCategory) {
                lastCategory = bookingPlanningModel.references[item];
                categories += 1;
                categoryClass = (categories % 2 == 0) ? 'odd-category' : 'even-category';
                if (categories > 1) {
                  referenceClass = 'first-category-reference';
                }
              }
              else {
                referenceClass = '';
              }
            }
            rowClass = categoryClass;
            if (referenceClass != '') {
              rowClass += ' ';
              rowClass += referenceClass;
            }
            // Build the row
            $("#planning_table tbody").append("<tr id='" + item + "' rel='" + bookingPlanningModel.references[item] + "' class='" + rowClass + "'></tr>");

            var title = null;

            // == Status
            var status = '';
            var collection = '<br style="height: 0px"><small>&nbsp;</small>';
            if (bookingPlanningModel.referencesDetail[item]) {
              if (bookingPlanningModel.referencesDetail[item].currently_blocked) {
               status = '<i class="fa fa-circle text-danger" title="<%=t.booking_item_management.table.currently_blocked%>"></i>&nbsp;';
              } else if (bookingPlanningModel.referencesDetail[item].status == 'free') {
               status = '<i class="fa fa-circle text-success" title="<%=t.booking_item_management.status.free%>"></i>&nbsp;';
               if (bookingPlanningModel.referencesDetail[item].rental_location_name) {
                 collection = '<br style="height: 0px"><small class="text-muted" style="margin-left: 12px; text-transform: uppercase">'+bookingPlanningModel.referencesDetail[item].rental_location_name+'</small>';
               }
              } else if (bookingPlanningModel.referencesDetail[item].status == 'busy') { 
               status = '<i class="fa fa-circle text-info" title="<%=t.booking_item_management.status.busy%>"></i>&nbsp;';
               collection = '<br style="height: 0px"><small class="text-muted" style="margin-left: 12px; text-transform: uppercase">'+
                             (bookingPlanningModel.referencesDetail[item].collection_place ? bookingPlanningModel.referencesDetail[item].collection_place.substring(0,35) : '') + 
                             '&nbsp;<i class="si si-clock text-muted" title="'+ (
                             bookingPlanningModel.referencesDetail[item].collection_date + ' ' + 
                             bookingPlanningModel.referencesDetail[item].collection_time) + '"></i></small>&nbsp;';
              } else if (bookingPlanningModel.referencesDetail[item].status == 'maintenance') {
               status = '<i class="fa fa-circle text-danger" title="<%=t.booking_item_management.status.maintenance%>"></i>&nbsp;';
               if (bookingPlanningModel.referencesDetail[item].rental_location_name) {
                 collection = '<br style="height: 0px"><small class="text-muted" style="margin-left: 12px; text-transform: uppercase">'+bookingPlanningModel.referencesDetail[item].rental_location_name+'</small>';
               }               
              } else if (bookingPlanningModel.referencesDetail[item].status == 'repair') { 
               status = '<i class="fa fa-circle text-danger" title="<%=t.booking_item_management.status.repair%>"></i>&nbsp;';
               if (bookingPlanningModel.referencesDetail[item].rental_location_name) {
                 collection = '<br style="height: 0px"><small class="text-muted" style="margin-left: 12px; text-transform: uppercase">'+bookingPlanningModel.referencesDetail[item].rental_location_name+'</small>';
               }               
              } else if (bookingPlanningModel.referencesDetail[item].status == 'preparation') { 
               status = '<i class="fa fa-circle text-warning" title="<%=t.booking_item_management.status.preparation%>"></i>&nbsp;';
               if (bookingPlanningModel.referencesDetail[item].rental_location_name) {
                 collection = '<br style="height: 0px"><small class="text-muted" style="margin-left: 12px; text-transform: uppercase">'+bookingPlanningModel.referencesDetail[item].rental_location_name+'</small>';
               }               
              }
            }
         
            // == Own property + assignable
            var own_property = '';
            var assignable = '';

            // == Description
            title = status;

            // Categories
            title += (bookingPlanningModel.referencesDetail[item].item_description);
            title += own_property;
            title += collection;
      

            $("#planning_table tbody tr#"+item+"").append(
                "<td class='planning_reference'" + 
                "style='width:" + 
                bookingPlanningModel.planningMeasurements[bookingPlanningModel.planningStyle]['colReferenceWidth'].toString()+"px;" +
                "line-height:" + 
                bookingPlanningModel.planningMeasurements[bookingPlanningModel.planningStyle]['tableLineHeight'].toString()+"px;" +
                "' data-reference='"+item+"'>" + title + "</td>");
        }

        // Create the columns for days
        if ( bookingPlanningModel.planningStyle == 'daily' ) {
          // Hours
          for (var idx=parseInt(bookingPlanningModel.startHour); idx<=parseInt(bookingPlanningModel.lastHour); idx++) {
                var date= new Date(new Date(bookingPlanningModel.dateFrom).setHours(0,0,0,0));
                var datestr = YSDFormatter.formatDate(date, 'yyyy-MM-dd');
                var hourStr = bookingPlanningModel.hours[idx];
                var hStr = hourStr.split(":")[0];
                var title = '<span class="planning_header_hour">' + hourStr + '</span>';

                // Create the header row (with dates)
                var headerClass = 'hour_header';
                if (hStr < bookingPlanningModel.startHour || 
                    hStr > bookingPlanningModel.endHour) {
                  headerClass += ' not_working_hour_header';
                }
                else {
                  headerClass += ' working_hour_header';
                }

                var headerRow = "<th class='" + headerClass + "' style='width:"+bookingPlanningModel.planningMeasurements[bookingPlanningModel.planningStyle]['tableColumnWidth'].toString()+ "px;" +
                                                              "line-height:"+bookingPlanningModel.planningMeasurements[bookingPlanningModel.planningStyle]['tableHeaderLineHeight'].toString()+"px;" +
                                                              "text-align:center' rel='" + hStr + "'>" + title + "</th>";
                $("#planning_table_header thead tr:first").append(headerRow);  
                for (item in bookingPlanningModel.references) {
                    var category = bookingPlanningModel.references[item];
                    var value = '';
                    var cellInformation = "style='width:"+bookingPlanningModel.planningMeasurements[bookingPlanningModel.planningStyle]['tableColumnWidth'].toString()+"px;"+
                                          "line-height:"+bookingPlanningModel.planningMeasurements[bookingPlanningModel.planningStyle]['tableLineHeight'].toString()+"px'";
                    cellInformation += "data-date='"+datestr +"' data-hour='" + hourStr + "' " + "data-resource='" + item + "' data-category='"+category+"'";
                    var cellClasses = 'data';
                    if (hStr < bookingPlanningModel.startHour || 
                        hStr > bookingPlanningModel.endHour) {
                      cellClasses += ' not_working_hour';
                    }
                    else {
                      cellClasses += ' working_hour';
                    }                
                    cellInformation += "class='" + cellClasses + "'";
                    $("#planning_table tbody tr#"+item+"").append("<td " + cellInformation + ">" + value + "</td>");
                }
          }
        }
        else {
          // Monthly / Biweekly
          var date= new Date(new Date(bookingPlanningModel.dateFrom).setHours(0,0,0,0));
          var days = Math.round((new Date(bookingPlanningModel.dateTo).setHours(0,0,0,0) - new Date(bookingPlanningModel.dateFrom).setHours(0,0,0,0))/(1000*60*60*24)) + 1;
          while (date <= bookingPlanningModel.dateTo) {
              var title = '<span class="planning_header_day_of_week">' + bookingPlanningModel.days[date.getDay()] + '</span>'+
                          '<span class="planning_header_day">' + date.getDate() + '</span>' +
                          '<span class="planning_header_month">' + bookingPlanningModel.months[date.getMonth()] + '</span>';
              var datestr = YSDFormatter.formatDate(date, 'yyyy-MM-dd');
              var firstMonthDay = date.getDate() == 1 ? true : false;
              var oddMonth = (date.getMonth() + 1) % 2 == 0;
              var oddMonthHeaderClass = oddMonth ? 'odd-month-header' : '';
              var firstMonthDayColumnClass = firstMonthDay ? 'first-month-day' : '';
              // Create the header row (with dates)
              var headerClass = 'date_header';
              if (oddMonth) {
                  headerClass += ' ';
                  headerClass += oddMonthHeaderClass;
              }
              if (firstMonthDay && date.getTime() != bookingPlanningModel.dateFrom.getTime()) {
                  headerClass += ' ';
                  headerClass += firstMonthDayColumnClass;
              }
              var headerRow = "<th class='" + headerClass + "' style='width:"+bookingPlanningModel.planningMeasurements[bookingPlanningModel.planningStyle]['tableColumnWidth'].toString()+ "px;" +
                                                            "line-height:"+bookingPlanningModel.planningMeasurements[bookingPlanningModel.planningStyle]['tableHeaderLineHeight'].toString()+"px;" +
                                                            "text-align:center' rel='" + datestr + "'>" + title + "</th>";
              $("#planning_table_header thead tr:first").append(headerRow);
              for (item in bookingPlanningModel.references) {
                  var category = bookingPlanningModel.references[item];
                  var value = '';
                  var cellInformation = "style='width:" + bookingPlanningModel.planningMeasurements[bookingPlanningModel.planningStyle]['tableColumnWidth'].toString() + "px;" +
                                        "line-height:"+bookingPlanningModel.planningMeasurements[bookingPlanningModel.planningStyle]['tableLineHeight'].toString()+"px'";
                  cellInformation += " data-date='" + datestr + "' " + "data-resource='" + item + "' data-category='"+category+"'";
                  var cellClasses = 'data';
                  if (firstMonthDay && date.getTime() != bookingPlanningModel.dateFrom.getTime()) {
                      cellClasses += ' ';
                      cellClasses += firstMonthDayColumnClass;
                  }
                  cellInformation += "class='" + cellClasses + "'";
                  $("#planning_table tbody tr#"+item+"").append("<td " + cellInformation + ">" + value + "</td>");
              }
              date.add(1).days();
          }
          $(".odd-month-header").css("background-color", "#dddddd");
          $(".odd-month-header").css("color", "black");
        }

        bookingPlanningModel.tablePlanningTrHeight = $('#planning_table tr').height();
        $(".data").bind('click', function(event) {
            var theElement = $(this);
            bookingPlanningController.tableCellClick(theElement,
                $(this).attr('data-category'),
                $(this).attr('data-resource'),
                $(this).attr('data-date'),
                $(this).attr('data-hour'));
        });

    },

    /* 
     * Fill the planning table 
     */
    fillPlanningTable: function() { 


        for (var idx=0;idx<bookingPlanningModel.planningData.length;idx++) {

            var item = bookingPlanningModel.planningData[idx];
            if (item.booking_item_reference != null) {
                this.showItemInPlanning(item);
            }

        }

        bookingPlanningView.setupDraggable('.planning_reservation');
        bookingPlanningView.setupPopover('.planning_reservation');

    },

    /* 
     * Show an item in the planning 
     */
    showItemInPlanning: function(item) { 

      if ( bookingPlanningModel.planningStyle == 'daily' ) {
        this.showItemInPlanningDaily(item);
      }
      else {
        this.showItemInPlanningMonthly(item);
      }


    },

    /**
     * Show item in planning (daily)
     */
    showItemInPlanningDaily: function(item) { 

        var origin = item.origin; 
        var id = item.id;
        var idResource = item.id2;
        var category = item.item_id;
        var requestedCategory = item.requested_item_id; 
        var resource = item.booking_item_reference;
        var dateFrom = item.date_from;
        var timeFrom = item.time_from; 
        var pickupPlace = item.pickup_place;
        var dateTo = item.date_to;
        var timeTo = item.time_to;
        var returnPlace = item.return_place;
        var title = item.title;
        var backgroundColor = item.planning_color; 
        var detail = item.detail;
        var notes = item.notes;
        var confirmed = item.confirmed;
        var auto_assigned_item_reference = item.auto_assigned_item_reference;
        var allow_change_planning_color = item.allow_change_planning_color;
        var customerEmail = item.customer_email;
        var customerPhone = item.customer_phone;

        var dOriginalFrom = dateFrom;
        var dOriginalTo = dateTo;
        var dFrom = dateFrom;
        var dTo = dateTo;
        var from = bookingPlanningModel.dateFrom.toString('yyyy-MM-dd');
        var to = bookingPlanningModel.dateTo.toString('yyyy-MM-dd'); 

        // Avoid if it is not represented in the planning
        if (dFrom > to || dTo < from) {
            return;
        }

        // hour from / to
        var firstHour = bookingPlanningModel.startHour + ":00";
        var lastHour = bookingPlanningModel.lastHour + ":00"; 
        var hFrom = timeFrom.split(":")[0];
        var mFrom = timeFrom.split(":")[1];
        var hTo = timeTo.split(":")[0];
        var mTo = timeTo.split(":")[1]; 

        // DateFrom different day or hour from is sonner than start hour
        if (dFrom < from || hFrom < bookingPlanningModel.startHour) {
            dFrom = from;
            hFrom = bookingPlanningModel.startHour; 
            mFrom = "00";
        }
        
        if (dTo > to || hTo > bookingPlanningModel.lastHour) {
            dTo = to;
            hTo = bookingPlanningModel.lastHour;
            mTo = "59";
        }
        
        if (hTo < bookingPlanningModel.startHour) {
           hTo = bookingPlanningModel.startHour;
           mTo = "00";
        }
        
        if (hFrom > bookingPlanningModel.lastHour) {
           hFrom = bookingPlanningModel.lastHour;
           hFrom = "00";  
        }
        
        var positionResource = $('tr[id='+resource+']').position();

        if (positionResource != null) {
            var positionDateFrom = $('th.hour_header[rel=' + hFrom + ']').position();
            var positionDateTo = $('th.hour_header[rel=' + hTo + ']').position();
            var height = $('tr[id=' + resource + ']').height();
            var oneHourWidth = parseInt($('th.hour_header').css('width').replace('px','')); 
            var oneMinuteWidth = oneHourWidth / 60;

            var top = positionResource.top;
            var left = positionDateFrom.left;
            var width = positionDateTo.left - left + oneHourWidth;

            // Adjust time from position
            if (parseInt(mFrom) > 0) {
              //var q = oneHourWidth * (parseInt(mFrom) / 60)
              var q = oneMinuteWidth * parseInt(mFrom);
              left += q;
              width -= q;
            }

            // Adjust time to position
            if (parseInt(mTo) < 59 && parseInt(mTo) >= 1) {
              //var q = oneHourWidth * (parseInt(mTo) / 60);
              var q = oneMinuteWidth * parseInt(mTo);
              width -= q;
            }
            else if (parseInt(mTo) == 0) {
              width -= oneHourWidth;
            }

            top += $('#planning_table').position().top;
            left += $('#planning_table').position().left;

            var html = tmpl('planning_reservation')({
                id: id, origin: origin, idResource: idResource,
                dateFrom: dateFrom, timeFrom: timeFrom, pickupPlace: pickupPlace,
                dateTo: dateTo, timeTo: timeTo, returnPlace: returnPlace,
                category: category, resource: resource, requestedCategory: requestedCategory,
                booking_title: title, detail: detail, notes: notes, confirmed: confirmed,
                customer_email: customerEmail, customer_phone: customerPhone,
                auto_assigned_item_reference: auto_assigned_item_reference,
                allow_change_planning_color: allow_change_planning_color,
                backgroundColor: (confirmed == 0 || auto_assigned_item_reference == 1) ? '#FFF' : backgroundColor,
                borderColor: (confirmed == 0 || auto_assigned_item_reference == 1) ? '#BBB' : this.lightenDarkenColor(backgroundColor, -40),
                color: (confirmed == 0 || auto_assigned_item_reference == 1) ? '#000' : this.textColor(backgroundColor),
                borderLeftWidth: (dOriginalFrom == from) ? '5px' : '1px',
                borderRightWidth: (dOriginalTo == from) ? '5px' : '1px',
            });
            $(html).height(height).css({top: top, left: left, width: width}).appendTo('#parent');
        }
        else {
            console.log('Resource: ' + resource + ' not found . Reservation : ' + id);
        }

    },

    /**
     * Show item in planning (monthly) 
     */
    showItemInPlanningMonthly: function(item) { 

        var origin = item.origin; 
        var id = item.id;
        var idResource = item.id2;
        var category = item.item_id;
        var requestedCategory = item.requested_item_id; 
        var resource = item.booking_item_reference;
        var dateFrom = item.date_from;
        var timeFrom = item.time_from; 
        var pickupPlace = item.pickup_place;
        var dateTo = item.date_to;
        var timeTo = item.time_to;
        var returnPlace = item.return_place;
        var title = item.title;
        var backgroundColor = item.planning_color; 
        var detail = item.detail;
        var notes = item.notes;
        var confirmed = item.confirmed;
        var auto_assigned_item_reference = item.auto_assigned_item_reference;
        var allow_change_planning_color = item.allow_change_planning_color;
        var customerEmail = item.customer_email;
        var customerPhone = item.customer_phone;

        var exceedsDateFrom = false;
        var exceedsDateTo = false;
        var dFrom = dateFrom;
        var dTo = dateTo;
        var from = bookingPlanningModel.dateFrom.toString('yyyy-MM-dd'); 
        var to = bookingPlanningModel.dateTo.toString('yyyy-MM-dd');

        // Avoid if it is not represented in the planning
        if (dFrom > to || dTo < from) {
            return;
        }

        if (dFrom < from) {
            dFrom = from;
            exceedsDateFrom = true;
        }
        if (dTo > to) {
            dTo = to;
            exceedsDateTo = true;
        }
        var days = Math.round((new Date(dTo).setHours(0,0,0,0) - new Date(dFrom).setHours(0,0,0,0))/(1000*60*60*24)) + 1;

        var positionResource = $('tr[id='+resource+']').position();

        if (positionResource != null) {
            var positionDateFrom = $('th.date_header[rel=' + dFrom + ']').position();
            var positionDateTo = $('th.date_header[rel=' + dTo + ']').position();
            var height = $('tr[id=' + resource + ']').height();
            var oneDayWidth = parseInt($('th.date_header').css('width').replace('px','')); 

            var top = positionResource.top;
            var left = positionDateFrom.left;
            var width = positionDateTo.left - left + oneDayWidth;

            if (bookingPlanningModel.cycle24Hours && dateFrom != dateTo) { // Start at 50% and ends at 50% of the cell

                if (!exceedsDateFrom) {
                    left += oneDayWidth / 2;
                }
                else {
                    width += (oneDayWidth / 2);
                }

                width -= oneDayWidth;

                // Adjust
                if (exceedsDateTo) {
                    width += (oneDayWidth / 2);
                }
            }

            top += $('#planning_table').position().top;
            left += $('#planning_table').position().left;

            var html = tmpl('planning_reservation')({
                id: id, origin: origin, idResource: idResource,
                dateFrom: dateFrom, timeFrom: timeFrom, pickupPlace: pickupPlace,
                dateTo: dateTo, timeTo: timeTo, returnPlace: returnPlace,
                category: category, resource: resource, requestedCategory: requestedCategory,
                booking_title: title, detail: detail, notes: notes, confirmed: confirmed,
                customer_email: customerEmail, customer_phone: customerPhone,
                auto_assigned_item_reference: auto_assigned_item_reference,
                allow_change_planning_color: allow_change_planning_color,
                backgroundColor: (confirmed == 0 || auto_assigned_item_reference == 1) ? '#ffffff' : backgroundColor,
                borderColor: (confirmed == 0 || auto_assigned_item_reference == 1) ? '#bbbbbb' : this.lightenDarkenColor(backgroundColor, -40),
                color: (confirmed == 0 || auto_assigned_item_reference == 1) ? '#000000' : this.textColor(backgroundColor)
            });
            $(html).height(height).css({top: top, left: left, width: width}).appendTo('#parent');
        }
        else {
            console.log('Resource: ' + resource + ' not found . Reservation : ' + id);
        }
    },

    /* 
     * Remove the items in the planning 
     */
    removeItemsInPlanning: function() { 

      $('.planning_reservation').remove();

    },

    // ------------------------- Update the planning

    /*** 
     * Update the GUI 
     */
    update: function(event, value) { 
  	  switch (event) {

  		case 'data_available':

        console.log('building');
        var t1 = new Date().getTime();
  		  this.createPlanningTable();
        var t2 = new Date().getTime();
        console.log('createdTable:'+ ((t2-t1)/1000));
  		  this.fillPlanningTable();
        var t3 = new Date().getTime();
        console.log('filledTable:'+ ((t3-t2)/1000));

        $('.data').on('mouseover', function() {
            $(this).closest('tr').addClass('highlight');
            $(this).closest('table').find('.data:nth-child(' + ($(this).index() + 1) + ')').addClass('highlight');
        });
        $('.data').on('mouseout', function() {
            $(this).closest('tr').removeClass('highlight');
            $(this).closest('table').find('.data:nth-child(' + ($(this).index() + 1) + ')').removeClass('highlight');
        });
        $('.planning_reservation').on('mouseover', function(){
            var dateFrom = $(this).attr('data-date-from');
            var row = $('tr[id='+$(this).attr('data-resource')+']');
            var column = row.find('td[data-date='+dateFrom+']');
            row.addClass('highlight');
            row.closest('table').find('.data:nth-child(' + (column.index() + 1) + ')').addClass('highlight');
        });
        $('.planning_reservation').on('mouseout', function() {
            var dateFrom = $(this).attr('data-date-from');
            var row = $('tr[id='+$(this).attr('data-resource')+']');
            var column = row.find('td[data-date='+dateFrom+']');
            row.removeClass('highlight');
            row.closest('table').find('.data:nth-child(' + (column.index() + 1) + ')').removeClass('highlight');
        });
        if ($('#planning_locker').is(':checked')) {
            bookingPlanningController.lockDragAndDrop();
        }
        else {
            bookingPlanningController.unlockDragAndDrop();
        }

        // There is an assignation
        if (bookingPlanningModel.assignationDateFrom != null && 
            bookingPlanningModel.assignationDateTo != null) {
          // Highlight selected dates
          var date = moment(bookingPlanningModel.assignationDateFrom);
          var endDate = moment(bookingPlanningModel.assignationDateTo);
          while (date <= endDate) {
            var strDate = date.format('YYYY-MM-DD'); 
            // Avoid following the bucle if date is not found
            if ($('th.date_header[rel='+strDate+']').length == 0) {
              break;
            }
            $('th.date_header[rel='+strDate+']').addClass('selected_date');
            date.add(1,'d');
          }
          // Automatically assigned resource message
          if (bookingPlanningModel.assignationResourceId != null) {
            if ($('.planning_reservation[data-id-resource='+bookingPlanningModel.assignationResourceId+']').length > 0) {
              alert('<%=t.booking_planning.resource_automatically_assigned%>');
              bookingPlanningModel.assignationAutomaticallyPreassigned = true;
              var $element = $('.planning_reservation[data-id-resource='+bookingPlanningModel.assignationResourceId+']');
              $element[0].scrollIntoView({
                behavior: 'smooth', block: "center", inline: "nearest" 
              });
              $element.addClass('blinker');
              // Highlight the reference
              var reference = $('.planning_reservation[data-id-resource='+bookingPlanningModel.assignationResourceId+']').attr('data-resource');
              $('td.planning_reference[data-reference='+reference+']').addClass('selected_date');
            }
          }
        }
        else {
          $('th.date_header').removeClass('selected_date');
          $('td.planning_reference').removeClass('selected_date');
          $('.planning_reservation').removeClass('blinker');
        }

  		  break;

      case 'assigned': // Assigned reservation

        $.toast({
            heading: "<%=t.booking_planning.planning_table.update_assigned.heading%>",
            text: "<%=t.booking_planning.planning_table.update_assigned.text%>",
            position: 'top-right',
            bgColor: 'rgb(56, 154, 56)',
            textColor: 'white',
            loader: false,
            stack: false
        });

        if (!bookingPlanningModel.assignationAutomaticallyPreassigned) {
          // Add the reservation to the model
          var item = {
                origin: 'booking',
                booking_item_reference: bookingPlanningModel.newReference,
                date_from: bookingPlanningModel.assignationResourceData.bookingFrom,
                time_from: bookingPlanningModel.assignationResourceData.bookingTimeFrom,
                pickup_place: bookingPlanningModel.assignationResourceData.bookingPickupPlace,
                date_to: bookingPlanningModel.assignationResourceData.bookingTo,
                time_to: bookingPlanningModel.assignationResourceData.bookingTimeTo,
                return_place: bookingPlanningModel.assignationResourceData.bookingReturnPlace,
                id: bookingPlanningModel.assignationResourceData.bookingId,
                id2: bookingPlanningModel.assignationResourceData.bookingResourceId,
                item_id: bookingPlanningModel.assignationResourceData.bookingCategory,
                requested_item_id: bookingPlanningModel.assignationResourceData.bookingCategory,
                notes: null,
                title: bookingPlanningModel.assignationResourceData.bookingCustomer,
                planning_color: '#66ff66',
                confirmed: bookingPlanningModel.assignationResourceData.bookingConfirmed,
                allow_change_planning_color: bookingPlanningModel.assignationResourceData.bookingAllowChangePlanningColor
            };
          bookingPlanningModel.planningData.push(item);
          bookingPlanningView.showItemInPlanning(item);
          bookingPlanningView.setupDraggable('.planning_reservation[data-id-resource=' + item.id2 + ']');
          bookingPlanningView.setupPopover('.planning_reservation[data-id-resource=' + item.id2 + ']');
        }

        // Update pending assignation
        this.updatePendingAssignation(bookingPlanningModel.assignationResourceData.bookingResourceId);

        // Hide the assignation resource summary
        bookingPlanningView.hideAssignationResource();

        // Blink the assigned resource
        $('.planning_reservation[data-id-resource=' + bookingPlanningModel.assignationResourceData.bookingResourceId + ']').addClass('blinker');
        
        break;

      case 'reassigned': // Reassigned reservation
        $.toast({
              heading: "<%=t.booking_planning.planning_table.update_reassigned.heading%>",
              text: "<%=t.booking_planning.planning_table.update_reassigned.text%>",
              position: 'top-right',
              bgColor: 'rgb(56, 154, 56)',
              textColor: 'white',
              loader: false,
              stack: false
        });
        break;

      case 'confirm_resource_assignation': // Confirm resource "automatic" assignation

        // Update the model with the updated data
        var idx = bookingPlanningModel.planningData.findIndex(function(element){
            return element.id2 == value.id2;
        });
        if (idx > -1) {
            bookingPlanningModel.planningData[idx] = value;
        }
        // Hide the popover
        $('.planning_reservation[data-id-resource='+value.id2+']').popover('hide');
        // Redraw the element
        $('.planning_reservation[data-id-resource='+value.id2+']').remove();
        bookingPlanningView.showItemInPlanning(value);
        // Setup draggable
        bookingPlanningView.setupDraggable('.planning_reservation[data-id-resource='+value.id2+']');
        // Setup popover
        bookingPlanningView.setupPopover('.planning_reservation[data-id-resource='+value.id2+']');
        // Update pending assignation
        this.updatePendingAssignation(value.id2);
        // Hide the assignation resource summary
        if ($('#assignation_resource').css('visibility') == 'visible') {
          bookingPlanningView.hideAssignationResource();
        }
        // Blink the assigned resource
        $('.planning_reservation[data-id-resource=' + value.id2 + ']').addClass('blinker');
        $.toast({
              heading: 'Reasignación de stock',
              text: 'La reasignación se ha realizado correctamente',
              position: 'top-right',
              bgColor: 'rgb(56, 154, 56)',
              textColor: 'white',
              loader: false,
              stack: false
        });
        break;


      case 'changed_color': // After change a color
          $.toast({
              heading: "<%=t.booking_planning.planning_table.update_changed_color.heading%>",
              text: "<%=t.booking_planning.planning_table.update_changed_color.text%>",
              position: 'top-right',
              bgColor: 'rgb(56, 154, 56)',
              textColor: 'white',
              loader: false,
              stack: false
          });
        break;

  		case 'not_enough_information':
  		  alert("<%=t.booking_planning.planning_table.update_not_enough_information.alert%>");
  		  break;
  	  }

    },

    updatePendingAssignation: function(bookingResourceId) {

        // Remove the element from pending assignation table
        var parent = $('#booking-line-resource-'+bookingResourceId).parents('tr');
        $('#booking-line-resource-'+bookingResourceId).remove();
        if (parent.find('.booking-line-resource').length == 0) {
           parent.remove();
        }

        // Remove a position from the pending assignation button
        var reservationCount = parseInt($('.pending_asignation_button span').html())-1;
        if (reservationCount > 0) {
            $('.pending_asignation_button span').html(reservationCount);
            $('#pending_reservations_count').html('('+reservationCount+')');
            $('a[href="/admin/booking/planning"]').find('span.planning_count').html(reservationCount);
        }
        else {
            $('.pending_asignation_button').hide();
            $('a[href="/admin/booking/planning"]').find('span.planning_count').remove();
        }

    },

    // ---------- Manual assignation

    /**
     * Show assignation resource panel
     */
    showAssignationResource: function(data) {

        if ($('#assignation_resource').css('visibility') == 'hidden') {
          $('#assignation_resource').css('visibility', 'visible');
        }

        // Highlight dates
        var startDate = moment(data.bookingDateFrom, 'DD-MM-YYYY HH:mm');
        var endDate = moment(data.bookingDateTo, 'DD-MM-YYYY HH:mm');
        var planningStartDate = moment(data.bookingDateFrom, 'DD-MM-YYYY HH:mm').add(-3,'d');
        var planningEndDate = moment(data.bookingDateFrom, 'DD-MM-YYYY HH:mm').add(bookingPlanningModel.numberOfDays - 3, 'd');
        $('#assignation_resource_booking_id').html(data.bookingId);
        $('#assignation_resource_booking_customer').html(data.bookingCustomer);
        $('#assignation_resource_booking_date_from').html(data.bookingDateFrom);
        $('#assignation_resource_booking_date_to').html(data.bookingDateTo);
        $('#assignation_resource_booking_category').html(data.bookingCategory);
        $('#assignation_resource_booking_line_resource_id').val(data.bookingResourceId);
        $('#assignation_resource_booking_customer_height_weight').html(data.bookingCustomerHeight+'/'+data.bookingCustomerWeight);
        $('#assignation_resource_booking_driver_date_for_birth').html(data.bookingDriverDateOfBirth + ' ('+data.bookingDriverAge+')');

        bookingPlanningModel.assignationDateFrom = startDate.format('YYYY-MM-DD');
        bookingPlanningModel.assignationDateTo = endDate.format('YYYY-MM-DD');
        bookingPlanningModel.assignationResourceId = data.bookingResourceId;
        bookingPlanningModel.assignationAutomaticallyPreassigned = false;
        bookingPlanningModel.assignationResourceData = data;

        $('#planning_date').datepicker('setDate', new Date(data.bookingFrom).add(-3).days());
        bookingPlanningController.planningDateChanged();

    },

    /**
     * Hide assignation resource panel
     */
    hideAssignationResource: function() {
        if ($('#assignation_resource').css('visibility') == 'visible') {
          $('#assignation_resource').css('visibility', 'hidden');
        }
        bookingPlanningModel.assignationDateFrom = null;
        bookingPlanningModel.assignationDateTo = null;
        bookingPlanningModel.assignationResourceId = null;
        bookingPlanningModel.assignationAutomaticallyPreassigned = false;
        bookingPlanningModel.assignationResourceData = null;

        // Remove selected date
        $('th.date_header').removeClass('selected_date');
        $('td.planning_reference').removeClass('selected_date');
        $('.planning_reservation').removeClass('blinker');

    },

    // ----------- Colors utils

    lightenDarkenColor: function(col, amt) {

      if (col == null) {
          return 'rgb(0,0,0)';
      }

      var usePound = false;

      if (col[0] == "#") {
          col = col.slice(1);
          usePound = true;
      }

      var num = parseInt(col,16);

      var r = (num >> 16) + amt;

      if (r > 255) r = 255;
      else if  (r < 0) r = 0;

      var b = ((num >> 8) & 0x00FF) + amt;

      if (b > 255) b = 255;
      else if  (b < 0) b = 0;

      var g = (num & 0x0000FF) + amt;

      if (g > 255) g = 255;
      else if (g < 0) g = 0;

      return (usePound?"#":"") + String("000000" + (g | (b << 8) | (r << 16)).toString(16)).slice(-6);

    },

    textColor: function(color) {

        var text_color = "rgb(0,0,0)";

        var rgb = this.hexToRgb(color);

        if (rgb != null) {
            var brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;

            if (brightness < 123) {
                text_color = "rgb(255,255,255)";
            }
        }

        return text_color;

    },

    hexToRgb: function(hex) {
                var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                return result ? {
                    r: parseInt(result[1], 16),
                    g: parseInt(result[2], 16),
                    b: parseInt(result[3], 16)
                } : null;
    }
  }

});