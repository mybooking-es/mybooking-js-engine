require(['jquery', 
         'commonServices', 'commonTranslations', 'i18next', 
         'jquery.validate', 'jquery.formparams'],
       function($, commonServices, commonTranslations, i18next) {

  var contactModel = {

    requestLanguage: null,

  	sendMessage: function() {
      var formdata = $('form[name="widget_contact_form"]').formParams(true);
      var json_request = JSON.stringify(formdata);
      // Build URL
      var url = commonServices.URL_PREFIX + '/api/booking/frontend/contact';
      if (commonServices.apiKey && commonServices.apiKey != '') {
        url += '?api_key='+commonServices.apiKey;
      }    
      // Request
      $.ajax({
         type: 'POST',
         data : json_request,
         url : url,
         success: function(data, textStatus, jqXHR) {      
           alert(i18next.t('contact.message_sent_successfully'));
           $('form[name=widget_contact_form]').trigger('reset');
           // Reset the Google Recaptcha
           if ( $('form[name=widget_contact_form').find('.g-recaptcha').length > 0 && 
                typeof grecaptcha !== 'undefined') {
             if (typeof grecaptcha.reset !== 'undefined') {
               grecaptcha.reset();
             }
           }
         },
         error: function(data, textStatus, jqXHR) {
           alert(i18next.t('contact.error_sending_message'));
         },
         complete: function(jqXHT, textStatus) {
         }
      });     		
  	}

  };

  var contactView = {

  	init: function() {

      contactModel.requestLanguage = document.documentElement.lang;
      // Initialize i18next for translations
      i18next.init({  
                      lng: contactModel.requestLanguage,
                      resources: commonTranslations
                   }, 
                   function (error, t) {
                      // https://github.com/i18next/jquery-i18next#initialize-the-plugin
                      //jqueryI18next.init(i18next, $);
                      // Localize UI
                      //$('.nav').localize();
                   });

  		this.setupValidation();

  	},

  	setupValidation: function() {

        $('form[name=widget_contact_form]').validate({

              submitHandler: function(form)
              {
                  $('#contact_form_errors').html('');
                  $('#contact_form_errors').hide();
                  if ( $('form[name=widget_contact_form').find('.g-recaptcha').length > 0 && 
                       typeof grecaptcha !== 'undefined') {
                    if (grecaptcha.getResponse() === '') {
                      alert(i18next.t('contact.validate_captcha'));
                      return false;
                    }
                    else {
                      contactModel.sendMessage();
                    }
                  }
                  else {
                    contactModel.sendMessage();
                  }
                  return false;
              },

              invalidHandler : function (form, validator) {
                  $('#contact_form_errors').html(i18next.t('contact.form_errors'));
                  $('#contact_form_errors').show();
              },

              rules : {
                 'customer_name': {
                      required: true
                  },
                  'customer_surname': {
                      required: true
                  },
                  'customer_phone': {
                      required: '#customer_phone:visible'
                  },
                  'customer_email': {
                      required: '#customer_email:visible'
                  },
                  'comments': {
                  	  required: true
                  },
                  'privacy_read' :  {
                    required: '#privacy_read:visible'
                  },                            
              },

              messages : {
                  'customer_name': {
                      required: i18next.t('contact.validations.nameRequired')
                  },
                  'customer_surname': {
                      required: i18next.t('contact.validations.surnameRequired')
                  },
                  'customer_phone': {
                      required: i18next.t('contact.validations.phoneNumberRequired')
                  },
                  'customer_email': {
                      required: i18next.t('contact.validations.emailRequired')
                  },
                  'comments': {
                      required: i18next.t('contact.validations.commentsRequired')
                  },
                  'privacy_read': {
                      required: i18next.t('contact.validations.privacyPolicyRequired')
                  }                     
              },

              errorPlacement: function (error, element) {
                if (element.attr('name') == 'privacy_read')
                {
                  error.insertAfter(element.parent());
                  element.parent().css('display', 'block');
                }
                else
                {
                    error.insertAfter(element);
                }                
              },

              errorClass : 'form-reservation-error',
        });

  	}


  };

  contactView.init();

});