define(['moment', 'moment-timezone'], function(moment){

  var formatter = {

    formatDateTime: function(the_date, format, timeZone) {
        if (the_date instanceof Date) {
            return moment(the_date).tz(timeZone).format(format);
        }
        else
        if (!isNaN(new Date(the_date))) {
            return moment(the_date).tz(timeZone).format(format);
        }

        return '';
    },

    /**
     * Format a date 
     */
    formatDate: function(the_date, format) {
        
      if (typeof format == 'undefined') {
        format = 'DD/MM/YYYY';
      }
      else {
        format = format.toUpperCase();
      }
      
      if (the_date instanceof Date) {
        return moment(the_date).format(format);
      }
      else  
        if (!isNaN(new Date(the_date))) { 
          return moment(the_date).format(format);
        }
      return '';

    },
  
  
    /**
     * Format a currency
     */
    formatCurrency: function(amount, currencySymbol, decimalCount, thousandSeparator, decimalSeparator, symbolPosition) {
      var result = '';
      var roundedAmount = new Number(amount).toFixed(decimalCount);
      var parts = roundedAmount.split('.');
      if (decimalCount == 0 && parts.length == 1) {
        var integerPart = parts[0];
        result = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator);
      }
      else if (decimalCount > 0 && parts.length == 2) {
          var integerPart = parts[0];
          var decimalPart = parts[1];
          result = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator);
          result += decimalSeparator;
          result += decimalPart;
      }
      if (symbolPosition == 'first') {
        result = currencySymbol + result;
      }
      else if (symbolPosition == 'last') {
        result += ' ';
        result += currencySymbol;
      }
      return result;
    },

    /**
     * Format a pad number
     */
    formatPadNumber: function(num, length) {
      var r = "" + num;
      while (r.length < length) {
        r = "0" + r;
      }
      return r;
    }
  
  };

  return formatter;

});