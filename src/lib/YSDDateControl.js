define(['jquery','moment'], function($, moment){
	
  /******************************************************************
   * Constructor for DateControl
   *
   * @param comboDay The combo where days are represented
   * @param comboMonth The combo where months are represented
   * @param comboYear The combo where years are represented
   * @param hiddenDate The input hidden where full date is stored
   * @param locale The locale
   * @param dateFormat the Date Format
   */
  YSDDateControl = function(comboDay, comboMonth, comboYear, hiddenDate, locale, dateFormat) {
  	
    // Creates the model
    var theModel = new YSDDateControlModel(locale, dateFormat);
  
    // Creates the controller
    var theController = new YSDDateControlController(theModel);
  
    // Creates the view
    var theView = new YSDDateControlView(theController, theModel, comboDay, comboMonth, comboYear, hiddenDate);

    // Associates the view with the model and the controller
    theModel.setView(theView);
    theController.setView(theView);
  
    this.setDate = function(dateStr) {
      var momentDate = moment(dateStr, theModel.dateFormat);
      theModel.setYear(momentDate.year());     
      theModel.setMonth(momentDate.month());
      theModel.setDay(momentDate.date());
      theView.data_changed('full_date');
    }
  			
  };

  // ----------------------------------------------------------------------------------------
  // ------- Support classes for implement the DateControl using MVC ------------------------
  // ----------------------------------------------------------------------------------------
	
  YSDDateControlModelData = { /* Common data for all instances of YsdDateControl */
	
	years : 90,  // Number of years
	     
    en : {	
      months   : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      literals : { 'day' : 'Day', 'month' : 'Month', 'year' : 'Year' }		
    },

    es : {
      months : ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],    
      literals : { 'day': 'Dia', 'month': 'Mes', 'year': 'Año' }
	  },

    ca : {	
      months : ['Gener','Febrer','Març','Abril','Maig','Juny','Juliol','Agost','Setembre','Octobre','Novembre','Desembre'],
      literals : { 'day':'Dia','month':'Mes','year':'Any'} 	
    },

    fr : {
      months : ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],    
      literals : { 'day': 'Jour', 'month': 'Mois', 'year': 'Année' }
    },

    it : {
      months : ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'],    
      literals : { 'day': 'Giorno', 'month': 'Mese', 'year': 'Anno' }

    },

    de: {
      months : ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],    
      literals : { 'day': 'Tag', 'month': 'Monat', 'year': 'Jahr' }

    }

  }

  /* ------------- The Model -------------------- */

  YSDDateControlModel = function (locale, dateFormat) {
	 
    this.locale = locale || 'es'; // Spanish is the default language		
    this.dateFormat = dateFormat || 'YYYY-MM-DD';
    this.day = null;
    this.month = null;
    this.year = null;	
    this.days_of_month = null;
    this.current_year = new Date().getFullYear();
       
    this.setView = function(view) {
   	  this.view = view;
    };
   
    this.setDay = function(day) { /* Assign the day */
   	  this.day = day;
      this.view.data_changed('day');
    }
   
    this.setMonth = function(month) { /* Assign the month */
   	  this.month = month;
   	  this.checkDaysOfMonth();
   	  this.view.data_changed('month');
     }
   
    this.setYear = function(year) { /* Assign the year */
      this.year = year;
   
      if (this.month == 1) {
        this.checkDaysOfMonth();    	
      }
      this.view.data_changed('year');
       
    }
   
    this.setDate = function(date) { /* Assign the date */

   	  this.setYear(date.getFullYear());
   	  this.setMonth(date.getMonth());
   	  this.setDay(date.getDate());

      this.view.data_changed('full_date');
           
    };
      
    this.checkDaysOfMonth = function() {

      if (this.year && this.month) {
        var old_days_of_month = this.days_of_month;
     	
        this.days_of_month = moment({year: this.year, month: this.month}).daysInMonth();

        if (this.days_of_month != old_days_of_month && this.view) 
        {
      	  this.view.data_changed('days_of_month');
     	  }
      }
   	
    };   
         
    this.getMonths = function() { /* Get the months */
   	  return YSDDateControlModelData[this.locale].months;
    };
      
    this.getYears = function() { /* Get the years */
   	  return YSDDateControlModelData.years;
    };
	
  }

  /* ------------ The controller ---------------- */

  YSDDateControlController = function(model) {
	
	this.model = model;
	
	this.setView = function(view) {
   	  this.view = view;
    };
	
	this.day_changed = function(day) { /* The user changes the day */
			 		 			 		
	  this.model.setDay(day);		
			
	};
	
	this.month_changed = function(month) { /* The user changes the month */   

      this.model.setMonth(month);
		
	};
	
	this.year_changed = function(year) { /* The user changes the year */
		
	  this.model.setYear(year);	
		
	};
			
  }

  /* ------------------ The view --------------------- */
  
  YSDDateControlView = function(controller, model, comboDay, comboMonth, comboYear, hiddenDate)
  {
    this.controller = controller;
    this.model = model;
  
    this.comboDay = comboDay;     
    this.comboMonth = comboMonth; 
    this.comboYear = comboYear;    	
    this.hiddenDate = hiddenDate; 
		
    /* The view is notified of changes in the model */
  	
    this.data_changed = function (information) { 

  	  switch (information) {
  	 	
  	    case 'days_of_month' : /* days of month */
  	   
  	      var model_days_of_month = (model.days_of_month || 31 ) + 1; // Add 1 for the literal element or assign 31 if no month
  	   
  	      if (model_days_of_month < comboDay.length)
  	      {
  	      	while (model_days_of_month < comboDay.length)
  	     	{
  	     	  comboDay.remove(comboDay.length - 1);	
  	     	}
  	     	
  	      }
  	      else
  	      {
  	       	for (idxDay = comboDay.length; idxDay < model_days_of_month; idxDay++) {
  	          var optionDay = document.createElement('option');
  	          optionDay.setAttribute('value', idxDay);	
  	          optionDay.text = optionDay.innerText = optionDay.text = idxDay;
  	          comboDay.appendChild(optionDay);  	       		
  	       	} 
  	      }
  	    	   
  	      break;
  	     
  	    case 'full_date' : /* full date */
  	     
  	      comboDay.selectedIndex = model.day;       // Elements begin by 0, but the first is the literal "Day"
  	      comboMonth.selectedIndex = model.month+1; // Add 1 for the literal "Month"
  	      comboYear.selectedIndex = (model.current_year - model.year) + 1; // Add 1 for the literal "Year"  
  	 	
  	    case 'day' : /* day */
  	    case 'month': /* month */
  	    case 'year': /* day */
  	   
  	      if ( typeof model.year == 'number' && typeof model.month == 'number' && typeof model.day == 'number')
  	      {
            hiddenDate.value = moment([model.year, model.month, model.day]).format(this.model.dateFormat);
  	        //hiddenDate.value = new Date(model.year, model.month, model.day).toUTCString();
  	      }
  	      else
  	      {
  	        if (hiddenDate.value != '') { // Make sure the date is reset when year, month day are not complete
  	          hiddenDate.value = '';
  	        }	
  	      }
  	     
  	      break; 	
  	 	
  	   }
  	 
  	
    };
		
    /* Builds the control */	
	
    this.render = function() { 
  	
       // days 
       var comboDayLiteral = document.createElement('option');
       comboDayLiteral.text = comboDayLiteral.innerText = YSDDateControlModelData[model.locale].literals['day'];
       comboDay.appendChild(comboDayLiteral);
  	  
  	   var days = model.days_of_month || 31;
  	   for (var idxDay = 1; idxDay <= days; idxDay++)
  	   {
  	     var optionDay = document.createElement('option');
  	     optionDay.setAttribute('value', idxDay);	
  	     optionDay.text = optionDay.innerText = idxDay;
  	     comboDay.appendChild(optionDay);
  	   }  	
  	
  	   // months
       var comboMonthLiteral = document.createElement('option');
       comboMonthLiteral.text = comboMonthLiteral.innerText = YSDDateControlModelData[model.locale].literals['month'];
       comboMonth.appendChild(comboMonthLiteral);
  	 
  	   var months = model.getMonths(); 
  	   var months_length = months.length;
  	 
  	   for (var idxMonth = 0; idxMonth < months_length; idxMonth++)
  	   {
  	     var optionMonth = document.createElement('option');
  	     optionMonth.setAttribute('value', months[idxMonth]);
  	     optionMonth.text = optionMonth.innerText = months[idxMonth];
  	     comboMonth.appendChild(optionMonth);	
  	   } 
  	 
  	   // years  	 
       var comboYearLiteral = document.createElement('option');
       comboYearLiteral.text = comboYearLiteral.innerText = YSDDateControlModelData[model.locale].literals['year'];
       comboYear.appendChild(comboYearLiteral);

       var start_year = new Date().getFullYear();
  	   var end_year = start_year - model.getYears();
  	
  	   for (var idxYear = start_year; idxYear > end_year; idxYear--)
  	   {
  	     var optionYear = document.createElement('option');
  	     optionYear.setAttribute('value', idxYear);	
  	     optionYear.text = optionYear.innerText = idxYear;
  	     comboYear.appendChild(optionYear);
  	   }
  	   	 
  	   // Configure the events
  	 
  	   $(comboDay).bind('change',
  	     function(event) {	
  	       controller.day_changed(this.selectedIndex==0?null:new Number(this.value).valueOf());	
  	     });
  	 
  	   $(comboMonth).bind('change', 
  	     function(event) {
  	       controller.month_changed(this.selectedIndex==0?null:this.selectedIndex-1);
  	     });
  	    
  	   $(comboYear).bind('change',
  	     function(event) {
  	       controller.year_changed(this.selectedIndex==0?null:new Number(this.value).valueOf());
  	     });
  	    
    }
	
    this.render();	
	
  }

  return YSDDateControl;

});


