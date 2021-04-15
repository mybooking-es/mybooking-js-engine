/* Inicialización en español para la extensión 'UI date picker' para jQuery. */
/* Traducido por Vester (xvester@gmail.com). */
/* https://github.com/jquery/jquery-ui/tree/master/ui/i18n */
(function($){
    $.datepicker.regional['ca'] = {
        closeText: "Tanca",
        prevText: "Anterior",
        nextText: "Següent",
        currentText: "Avui",
        monthNames: [ "Gener","Febrer","Març","Abril","Maig","Juny",
            "Juliol","Agost","Setembre","Octubre","Novembre","Desembre" ],
        monthNamesShort: [ "Gen","Feb","Març","Abr","Maig","Juny",
            "Jul","Ag","Set","Oct","Nov","Des" ],
        dayNames: [ "Diumenge","Dilluns","Dimarts","Dimecres","Dijous","Divendres","Dissabte" ],
        dayNamesShort: [ "Dg","Dl","Dt","Dc","Dj","Dv","Ds" ],
        dayNamesMin: [ "Dg","Dl","Dt","Dc","Dj","Dv","Ds" ],
        weekHeader: "Set",
        dateFormat: "dd/mm/yy",
        firstDay: 1,
        isRTL: false,
        showMonthAfterYear: false,
        yearSuffix: ""};
    $.datepicker.setDefaults($.datepicker.regional['ca']);
})(jQuery);