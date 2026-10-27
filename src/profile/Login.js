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
    this.secondFactor = null;

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
     * Login (step 1)
     *
     * With the second factor active the server answers 202 (second_factor_required) and the JWT
     * comes in step 2 (verify). The 'login' event is only fired with the final result, so the
     * pages that listen to it do not change.
     */
    this.login = function(username, password) {

      console.log('login');
      var self = this;
      var url = commonServices.URL_PREFIX + '/api/v1/login';

      // Request: credentials in the body, never in the URL (URLs end up in server and proxy logs)
      $.ajax({
        type: 'POST',
        url: url,
        contentType: 'application/x-www-form-urlencoded',
        data: {username: username, password: password},
        success: function(data, textStatus, jqXHR) {
          if (data && data.connected) {
            self.connected(data, jqXHR);
          }
          else if (data && data.second_factor_required) {
            // Kept in memory only to send a new code (repeat step 1); cleared when finished
            self.secondFactor = {username: username, password: password,
                                 challengeId: data.challenge_id,
                                 method: data.second_factor_method || 'email',
                                 maskedEmail: data.masked_email};
            if (self.view) {
              self.view.showSecondFactor(self.secondFactor);
            }
          }
          else if (data && data.error) {
            // second_factor_no_email or second_factor_delivery_failed
            self.secondFactor = null;
            if (self.view) {
              self.view.showLoginError(self.errorMessage(data.error));
            }
          }
          else {
            self.events.fireEvent( {type:'login', data: {success: false}} );
          }
        },
        error: function(jqXHR, textStatus, errorThrown) {
          var error = self.responseError(jqXHR);
          if (jqXHR.status == 403 && error && self.view) { // second_factor_enrolment_required
            self.view.showLoginError(self.errorMessage(error));
          }
          else {
            alert(i18next.t('common.error'));
          }
        }
      });

    }

    /**
     * Second factor (step 2): exchange the code for the JWT
     */
    this.verify = function(code) {

      var self = this;
      if (this.secondFactor == null) {
        return;
      }
      var url = commonServices.URL_PREFIX + '/api/v1/login/verify';

      $.ajax({
        type: 'POST',
        url: url,
        contentType: 'application/x-www-form-urlencoded',
        data: {username: this.secondFactor.username, challenge_id: this.secondFactor.challengeId, code: code},
        success: function(data, textStatus, jqXHR) {
          if (data && data.connected) {
            self.secondFactor = null;
            if (self.view) {
              self.view.hideSecondFactor();
            }
            self.connected(data, jqXHR);
          }
          else if (self.view) {
            self.view.showSecondFactorError(i18next.t('common.second_factor.invalid_code'));
          }
        },
        error: function(jqXHR, textStatus, errorThrown) {
          var error = self.responseError(jqXHR);
          if (error === 'too_many_attempts' || error === 'account_locked') {
            // The challenge is no longer valid: back to step 1
            self.secondFactor = null;
            if (self.view) {
              self.view.hideSecondFactor();
              self.view.showLoginError(self.errorMessage(error));
            }
          }
          else if (jqXHR.status == 401 && self.view) {
            self.view.showSecondFactorError(i18next.t('common.second_factor.invalid_code'));
          }
          else {
            alert(i18next.t('common.error'));
          }
        }
      });

    }

    /**
     * Send a new code: repeat step 1 (the previous code is no longer valid)
     */
    this.resend = function() {
      if (this.secondFactor != null) {
        this.login(this.secondFactor.username, this.secondFactor.password);
      }
    }

    /**
     * Back to the username and password
     */
    this.cancelSecondFactor = function() {
      this.secondFactor = null;
      if (this.view) {
        this.view.hideSecondFactor();
      }
    }

    /**
     * Connected: keep the JWT and notify
     */
    this.connected = function(data, jqXHR) {
      var authorization = jqXHR.getResponseHeader('Authorization');
      if (authorization) {
        this.bearer = authorization;
        sessionStorage.setItem('mybooking_authorization', authorization);
        this.connectedUser = true;
        this.user = data.user;
      }
      this.events.fireEvent( {type:'login', data: {success: true, user: this.user}} );
    }

    /**
     * Error code in the JSON body of an error response
     */
    this.responseError = function(jqXHR) {
      var body = jqXHR.responseJSON;
      if (typeof body === 'undefined' && jqXHR.responseText) {
        try {
          body = JSON.parse(jqXHR.responseText);
        }
        catch (e) {
          body = null;
        }
      }
      return (body && body.error) ? body.error : null;
    }

    /**
     * Message for an error code of the API
     */
    this.errorMessage = function(error) {
      var messages = {
        'second_factor_no_email': 'common.second_factor.no_email',
        'second_factor_delivery_failed': 'common.second_factor.delivery_failed',
        'second_factor_enrolment_required': 'common.second_factor.enrolment_required',
        'too_many_attempts': 'common.second_factor.too_many_attempts',
        'account_locked': 'common.second_factor.account_locked'
      };
      return i18next.t(messages[error] || 'common.error');
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

    /**
     * Second factor: show the code form instead of the username and password.
     *
     * A theme can define the template script_login_second_factor (same names and classes);
     * if not, the default one is used.
     */
    this.showSecondFactor = function(secondFactor) {
      var self = this;
      var loginForm = $('form[name=mybooking_login_form]');
      $('.mybooking_login_second_factor').remove();
      this.hideLoginError();

      var message = (secondFactor.method === 'authenticator') ?
                      i18next.t('common.second_factor.authenticator') :
                      i18next.t('common.second_factor.email_sent', {email: secondFactor.maskedEmail || ''});
      var html;
      if (document.getElementById('script_login_second_factor')) {
        html = tmpl('script_login_second_factor')({i18next: i18next, method: secondFactor.method});
      }
      else {
        html = this.secondFactorHtml(secondFactor.method);
      }
      var container = $(html);
      // Text (not HTML): the masked email comes from the server
      container.find('.mybooking_login_second_factor_message').text(message);
      loginForm.hide();
      loginForm.after(container);

      var codeForm = container.find('form[name=mybooking_login_second_factor_form]');
      codeForm.on('submit', function(event) {
        event.preventDefault();
        var code = $.trim(codeForm.find('input[name=code]').val());
        if (code === '') {
          self.showSecondFactorError(i18next.t('common.second_factor.code_required'));
          return false;
        }
        self.hideSecondFactorError();
        self.model.verify(code);
        return false;
      });
      container.find('.mybooking_login_second_factor_resend').on('click', function() {
        codeForm.find('input[name=code]').val('');
        self.model.resend();
      });
      container.find('.mybooking_login_second_factor_back').on('click', function() {
        self.model.cancelSecondFactor();
      });
      codeForm.find('input[name=code]').focus();
    }

    this.hideSecondFactor = function() {
      $('.mybooking_login_second_factor').remove();
      $('form[name=mybooking_login_form] input[name=password]').val('');
      $('form[name=mybooking_login_form]').show();
    }

    this.showSecondFactorError = function(message) {
      $('.mybooking_login_second_factor_error').text(message).show();
    }

    this.hideSecondFactorError = function() {
      $('.mybooking_login_second_factor_error').text('').hide();
    }

    /**
     * Error of the login step that is not "invalid user or password"
     */
    this.showLoginError = function(message) {
      var loginForm = $('form[name=mybooking_login_form]');
      var error = $('.mybooking_login_error');
      if (error.length === 0) {
        error = $('<div class="mb-alert danger mybooking_login_error"></div>');
        loginForm.before(error);
      }
      error.text(message).show();
    }

    this.hideLoginError = function() {
      $('.mybooking_login_error').text('').hide();
    }

    this.secondFactorHtml = function(method) {
      var inputMode = (method === 'authenticator') ? 'text' : 'numeric';
      return '<div class="mybooking_login_second_factor">' +
             '  <div class="mb-alert light"><p class="mybooking_login_second_factor_message"></p></div>' +
             '  <form class="mybooking-form" name="mybooking_login_second_factor_form" autocomplete="off">' +
             '    <div class="mb-form-group">' +
             '      <label for="mybooking_login_second_factor_code">' + i18next.t('common.second_factor.code') + '</label>' +
             '      <input type="text" name="code" class="form-control" id="mybooking_login_second_factor_code"' +
             '             inputmode="' + inputMode + '" autocomplete="one-time-code" maxlength="20">' +
             '    </div>' +
             '    <div class="mb-alert danger mybooking_login_second_factor_error" style="display:none"></div>' +
             '    <div class="mybooking-selector_footer">' +
             '      <button type="submit" class="mb-button">' + i18next.t('common.second_factor.verify') + '</button>' +
             (method === 'authenticator' ? '' :
             '      <span class="mb-button link mybooking_login_second_factor_resend">' + i18next.t('common.second_factor.resend') + '</span>') +
             '      <span class="mb-button link mybooking_login_second_factor_back">' + i18next.t('common.second_factor.back') + '</span>' +
             '    </div>' +
             '  </form>' +
             '</div>';
    }

    this.setupValidation = function() {
      var self = this;
      $('form[name=mybooking_login_form]').validate({
        submitHandler: function(form) {
            $('#mybooking_login_form_error').hide();
            $('#mybooking_login_form_error').html('');
            self.hideLoginError();
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