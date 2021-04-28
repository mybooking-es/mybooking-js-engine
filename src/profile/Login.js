define('Login',['jquery', 
         'commonServices', 'commonSettings', 'commonTranslations', 'commonLoader',
         'i18next','ysdtemplate', 'YSDEventTarget',
         'jquery.i18next', 'jquery.formparams',
	       'jquery.validate'],
	     function($, 
                commonServices, commonSettings, commonTranslations, commonLoader, 
                i18next, tmpl, YSDEventTarget) {

  /**
   * The model
   */      
  var LoginModel = function() {

    this.events = new YSDEventTarget();
    this.view = null;
    this.bearer = null;
    this.connectedUser = false;
    this.user = null;

    this.setView = function(_view) {
      this.view = _view;
    }
    
    /**
     * Add listener
     */
    this.addListener = function(type, listener) { /* addListener */
       this.events.addEventListener(type, listener);  
    }
      
    /**
     * Remove listener
     */   
    this.removeListener = function(type, listener) { /* removeListener */
       this.events.removeEventListener(type, listener);     
    }

    /**
     * Remove listener
     */
    this.removeListeners = function(type) { /* remove listeners*/
       this.events.removeEventListeners(type);
    }
    
    /**
     * Login
     */
    this.login = function(username, password) {

      console.log('login');
      var self = this;
      var url = commonServices.URL_PREFIX + '/api/v1/login';
      var urlParams = [];
      urlParams.push('username='+username);
      urlParams.push('password='+password);
      if (urlParams.length > 0) {
        url += '?';
        url += urlParams.join('&');
      }
  
      // Request
      $.ajax({
        type: 'POST',
        url: url,
        contentType: 'application/x-www-form-urlencoded',
        success: function(data, textStatus, jqXHR) {
          if (data && data.connected) {
            var authorization = jqXHR.getResponseHeader('Authorization');
            if (authorization) {
              self.bearer = authorization;
              sessionStorage.setItem('mybooking_authorization', authorization);
              self.connectedUser = true;
              self.user = data.user;
            }
            self.events.fireEvent( {type:'login', data: {success: true, user: self.user}} );
          }
          else {
            self.events.fireEvent( {type:'login', data: {success: false}} );
          }
        },
        error: function(data, textStatus, jqXHR) {
          alert(i18next.t('common.error'));
        }
      });  

    }

  }

  /**
   * The controller
   */
  var LoginController = function() {

    this.model = null;
    this.view = null;

    this.setView = function(_view) {
      this.view = _view;
    }

    this.setModel = function(_model) {
      this.model = _model;
    }

    /**
     * Login Submit Form
     */
    this.loginFormSubmit = function() {
      if ( $('form[name=mybooking_login_form]').valid() ) {
        this.model.login($('form[name=mybooking_login_form] input[name=username]').val(),
                         $('form[name=mybooking_login_form] input[name=password]').val() );
      }
    }

  }

  /**
   * The view
   */
  var LoginView = function(_model, _controller) {
    this.model = _model;
    this.controller = _controller;

    this.init = function() {
      this.setupValidation();
    }

    this.setupValidation = function() {
      var self = this;
      $('form[name=mybooking_login_form]').validate({
        submitHandler: function(form) {
            $('#mybooking_login_form_error').hide();
            $('#mybooking_login_form_error').html('');
            self.controller.loginFormSubmit();
            return false;
        },

        invalidHandler : function (form, validator) {
          $('#mybooking_login_form_error').html(i18next.t('complete.reservationForm.errors'));
          $('#mybooking_login_form_error').show();
        },

        rules: {
          'username' : {
            required: true
          },
          'password' : {
            required: true
          }
        },
        messages: {
          'username': {
            required: i18next.t('complete.reservationForm.validations.fieldRequired')
          },
          'password': {
            required: i18next.t('complete.reservationForm.validations.fieldRequired')
          }
        }

      });

    }

  }

  /**
   * Login component
   */
  var Login = function() {
    this.model = new LoginModel();
    this.controller = new LoginController();
    this.view = new LoginView(this.model, this.controller);

    this.controller.setView(this.view);
    this.controller.setModel(this.model);
    this.model.setView(this.view);

  }

  return Login;

  

});