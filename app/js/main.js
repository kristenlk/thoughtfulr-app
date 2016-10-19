var token;
var userID;
var moniker;
var tokenExists;
var logOut;

$(document).ready(function(){
  var sa = 'https://powerful-waters-3612.herokuapp.com';
  // var sa = 'http://localhost:3000';

  tokenExists = function(token){
    if (token) {
      // Nav
      $('#register-nav, #sign-in-nav').addClass('hide');
      $('#my-account-nav, #log-out-nav, .temp-send-text').removeClass('hide');

      // Send a message
      $('#send-message-header').html('Send a message');
      $('#send-message-btn').html('Send message');
    } else {
      // Nav
      $('#my-account-nav, #log-out-nav, .temp-send-text').addClass('hide');
      $('#register-nav, #sign-in-nav').removeClass('hide');

      // Send a message
      $('#send-message-header').html('Send your first message');
      $('#send-message-btn').html('Next <i class="fa fa-caret-right" aria-hidden="true"></i>');
    }
  };

  tokenExists(token);

  logOut = function(){
    token = null;
  };

  // Click handlers for header
  $('#sign-in-nav, #register-nav, #how-it-works-nav, #send-message-nav, #get-started-btn').on('click', function() {
    $('.alert, .intro, #user-account').addClass('hide');
    $('.form').trigger('reset');
  });

  $('#sign-in-nav').on('click', function() {
    $('#sign-in-page').removeClass('hide');
    $("#sign-in-email-error, #sign-in-password-error").remove();
    $('#how-it-works-page, #send-message-page, #preferences-page, #complete-acct-page').addClass('hide');
  });

  $('#how-it-works-nav').on('click', function() {
    $('#how-it-works-page').removeClass('hide');
    $('#sign-in-page, #send-message-page, #preferences-page, #complete-acct-page, #user-account').addClass('hide');
  });

  $('#send-message-nav, #get-started-btn').on('click', function() {
    $('#send-message-page').removeClass('hide');
    $("#phone-number-error, #register-location-error, #anonymous-error, #register-email-error, #register-password-error, #register-confirm-password-error").remove();
    $('#sign-in-page, #how-it-works-page, #preferences-page, #complete-acct-page').addClass('hide');
  });

  $('#log-out-nav').on('click', function(){
    logOut();
    tokenExists(token);
    $('.intro').removeClass('hide');
    $('#user-account').addClass('hide');
  });

  $('.navbar-brand').on('click', function() {
    $('.intro').removeClass('hide');
    $('#sign-in-page, #how-it-works-page, #send-message-page, #preferences-page, #user-account').addClass('hide');
  });

  $('.navbar-collapse a').click(function(){
    $(".navbar-collapse").collapse('hide');
  });

  // Click handlers for send a message page
  $("#send-message-btn").on('click', function() {
    var form = $("#send-message-form");

    form.validate({
      rules: {
        sendmessagetext: {
          required: true
        }
      },
      messages: {
        sendmessagetext: {
          required: 'Please enter a message.',
        }
      }
    });

    if (token) {
      if (form.valid() == true) {
        $.ajax({
          url: sa + '/messages',
          method: 'POST',
          headers: {
            Authorization: 'Token token=' + token
          },
          data: {
            message: {
              body: $("#send-message-text").val()
            }
          }
        }).done(function(data) {
          $('#message-alert').addClass('hide');
          $('#message-confirmation').removeClass('hide');
        }).fail(function(data) {
          console.error(data);
          $('#message-alert').removeClass('hide');
        });
      }
    } else {
      if (form.valid() == true) {
        $('#send-message-page').addClass('hide');
        $('#preferences-page').removeClass('hide');
      }
    }
  });

  // Click handlers for preferences page
  $('#preferences-back-btn').on('click', function() {
    $('#send-message-page').removeClass('hide');
    $('#preferences-page').addClass('hide');
  });

  $('#preferences-next-btn').on('click', function() {
    var form = $("#preferences-form");

    form.validate({
      rules: {
        registeranonymous: {
          required: $('#anon-btn').is(':checked') || $('#register-moniker').html().length > 0 ? false : true
        },
        registerphone: {
          required: true
        },
        registerlocation: {
          required: true
        },
        registertimeofday: {
          required: true
        }
      },
      errorPlacement: function (error, el) {
        if (el.attr('name') === 'anonymous') {
          error.appendTo($('#moniker-errors'));
        } else if (el.attr('name') === 'registertimeofday') {
          error.appendTo($('#timeofday-errors'));
        } else {
          error.insertAfter(el);
        }
      },
      messages: {
        registeranonymous: {
          required: 'Please enter a moniker.',
        },
        registerphone: {
          required: 'Please enter your phone number.',
        },
        registerlocation: {
          required: 'Please enter your location.'
        },
        registertimeofday: {
          required: 'Please select a time of day to receive your messages.'
        }
      }
    });

    if (form.valid() == true) {
      $('#complete-acct-page').removeClass('hide');
      $('#preferences-page').addClass('hide')
    };
  });

  $('#anon-btn').on('click', function() {
    $('#register-moniker').val('');
  });

  $('#register-moniker').on('click', function() {
    $('#anon-btn').prop('checked', false);
  });

  // Click handlers for complete account page
  $('#complete-acct-back-btn').on('click', function() {
    $('#preferences-page').removeClass('hide');
    $('#complete-acct-page').addClass('hide');
  });

  $('#complete-acct-register-btn').on('click', function() {
    var form = $("#complete-acct-form");

    form.validate({
      rules: {
        registeremail: {
          required: true,
          email: true
        },
        registerpassword: {
          required: true
        },
        confirmpassword: {
          required: true
        }
      },
      messages: {
        registeremail: {
          required: 'Please enter your email address.',
          email: 'Please enter a valid email address.'
        },
        registerpassword: {
          required: 'Please enter a password.'
        },
        confirmpassword: {
          required: 'Please confirm your password.'
        }
      }
    });

    if (form.valid() == true) {
      var profile = {
        moniker: $('#anon-btn').is(':checked') ? 'anonymous' : $('#register-moniker').val(),
        location: $('#register-location').val(),
        phone_number: $('#phone-number').val(),
        selected_time: $("input[name='registertimeofday']:checked").val()
      };

      $.ajax(sa + '/users', {
        contentType: 'application/json',
        processData: false,
        data: JSON.stringify({
          user: {
            email: $('#register-email').val(),
            password: $('#register-password').val(),
            password_confirmation: $('#register-confirm-password').val()
          },
          profile: profile
        }),
        dataType: 'json',
        method: 'POST'
      }).done(function(data, textStatus, jqxhr){
        token = data.user_login.token;
        userID = data.user_login.id;
        tokenExists(token);

        $.ajax({
          url: sa + '/messages',
          method: 'POST',
          headers: {
            Authorization: 'Token token=' + token
          },
          data: {
            message: {
              body: $("#send-message-text").val()
            }
          }
        }).done(function(data) {
          $('#user-account, #account-navbar').removeClass('hide');
          getReceivedMessages();
          $('#complete-acct-page').addClass('hide');
        }).fail(function(data) {
          console.error(data);
          $('#complete-acct-message-alert').removeClass('hide');
        });
      }).fail(function(jqxhr, textStatus, errorThrown){
        $('#complete-acct-alert').removeClass('hide');
      });
    };
  });

  // Click handlers for sign in page
  $('#sign-in-btn').on('click', function(){
    var form = $("#sign-in-form");

    form.validate({
      rules: {
        signinemail: {
          required: true,
          email: true
        },
        signinpassword: {
          required: true
        }
      },
      messages: {
        signinemail: {
          required: 'Please enter your email address.',
          email: 'Please enter a valid email address.'
        },
        signinpassword: {
          required: 'Please enter your password.'
        }
      }
    });

    if (form.valid() == true) {
      $.ajax(sa + '/login', {
        contentType: 'application/json',
        processData: false,
        data: JSON.stringify({
          credentials: {
            email: $('#sign-in-email').val(),
            password: $('#sign-in-password').val(),
          }
        }),
        dataType: 'json',
        method: 'POST'
      }).done(function(data, textStatus, jqxhr){
        token = data.user_login.token;
        userID = data.user_login.id;
        tokenExists(token);
        $('#user-account, #account-navbar').removeClass('hide');
        $('#sign-in-page').addClass('hide');
        getReceivedMessages();
      }).fail(function(jqxhr, textStatus, errorThrown){
        $('#login-alert').removeClass('hide');
      });
    }
  });

  // Click handler for displaying My Account information
  $('#my-account-nav, #acct-received-messages').on('click', function(){
    $('#user-account, #account-navbar').removeClass('hide');
    $('.intro, #how-it-works-page, #send-message-page, #sign-in-page').addClass('hide');
    getReceivedMessages();
  });

  // AJAX for displaying received messages
  var getReceivedMessages = function() {
    $.ajax({
      url: sa + '/received_messages',
      headers: {
        Authorization: 'Token token=' + token
      }
    }).done(function(data) {
      var html;
      $('.account-info > div').addClass('hide');
      var templatingFunction = Handlebars.compile($('#received-messages-template').html());
      if (data.messages.length > 0) {
        html = templatingFunction({receivedmessage: data.messages});
      } else {
        html = '<h3>You have not yet received any messages.</h3><p>If you haven\'t sent out a message yet, <a href="#" class="open-message-page">send one now</a> and you\'ll receive a message within the next day. If you\'ve already sent a message, you should be receiving your first message within the next 24 hours.</p>'
      }
      $('#display-received-messages').removeClass('hide').html(html);

    }).fail(function(data) {
      console.error(data);
    });

    $.ajax({
      url: sa + '/users/' + userID,
      headers: {
        Authorization: 'Token token=' + token
      }
    }).done(function(data) {
      $('#num_messages_left_to_receive').text(data.user.num_messages_left_to_receive);
    }).fail(function(data) {
      console.error(data);
    });
  }

  Handlebars.registerHelper('pluralize', function(number, single, plural) {
    if (number === 1) { return single; }
    else { return plural; }
  });

  // AJAX for displaying sent messages
  var displaySentMessages = function() {
    $.ajax({
      url: sa + '/sent_messages',
      headers: {
        Authorization: 'Token token=' + token
      }
    }).done(function(data) {
      var html;
      $('.account-info > div').addClass('hide');
      var templatingFunction = Handlebars.compile($('#sent-messages-template').html());
      if (data.messages.length > 0) {
        html = templatingFunction({sentmessage: data.messages});
      } else {
        html = '<h3>You have not yet sent any messages.</h3><p>You won\'t receive a daily message until you send one, so <a href="#" class="open-message-page">send one now!</a>'
      }
      $('#display-sent-messages').removeClass('hide').html(html);

    }).fail(function(data) {
      console.error(data);
    });
  };

  // My Account: Click handler for displaying sent messages
  $('#acct-sent-messages').on('click', function(){
    displaySentMessages();
  });

  // Click handler for closing alerts
  $('.account-info').on('click', '.alert-x', function(e){
    $(this).parent().parent().addClass('hide');
  });

  // My Account: Click handler for displaying account information / preferences
  // AJAX to get profile data
  $('#acct-my-account').on('click', function(){
    $.ajax({
      url: sa + '/users/' + userID + '/profile',
      headers: {
        Authorization: 'Token token=' + token
      }
    }).done(function(data) {
      $('.alert').addClass('hide');

      // AJAX to get user data
      $.ajax({
        url: sa + '/users/' + userID,
        headers: {
          Authorization: 'Token token=' + token
        }
      }).done(function(data) {
        var templatingFunction = Handlebars.compile($('#account-settings-template-user').html());
        var html = templatingFunction(data);
        currentUserData = data;
        $('#display-user-account-settings').removeClass('hide').html(html);
      }).fail(function(data) {
        console.error(data);
      });

      $('.account-info > div').addClass('hide');
      $('.jumbotron').addClass('hide');

      var templatingFunction = Handlebars.compile($('#account-settings-template-profile').html());
      var html = templatingFunction(data);
      $('#display-profile-account-settings').removeClass('hide').html(html);

      $("input[value='" + data.selected_time + "']").prop('checked', true);

      if (data.opted_in) {
        $('#acct-opt-in').prop('checked', true);
      } else {
        $('#acct-opt-out').prop('checked', true);
      }

      if (data.moniker == "anonymous") {
        $('#acct-anon-btn').prop('checked', true);
        $('#acct-moniker').val('');
      }
    }).fail(function(data) {
      console.error(data);
    });
  });

  // My Account: click handlers for editing sent messages
  var selectedMsgId;
  var priorToEditBody;
  var $sentmessageBody;

  $('.account-info').on('click', '.edit-a-msg', function(e){
    // when you click on Edit next to a specific message, it should create an input field and the body of the message should be in the input field.
    e.preventDefault();
    var $editLink = $(this)
    $sentmessageBody = $(this).siblings().filter('.sentmessage-body');
    selectedMsgId = $(this).data('id');
    priorToEditBody = $sentmessageBody.html();
    $editLink.addClass('hide');
    $('#save-' + $(this).data('id')).removeClass('hide');
    $('#cancel-' + $(this).data('id')).removeClass('hide');
    $sentmessageBody.prop('contenteditable', 'true');
    $sentmessageBody.focus();
  });

  // Should save an edited message when a user presses Enter on their keyboard, but isn't working right now
  $('.account-info').on('keypress', '.sentmessage-body', function(e){
    // e.preventDefault();
    if(e.which == 13){
      $('.save-a-msg').click();
    }
  });

  // Click handler for Cancel button: removes anything a user edits and sets it back to value in db. Clicking outside of the field should also cancel, but it does not right now.
  $('.account-info').on('click', '.cancel-a-msg', function(e){
    e.preventDefault();
    $(this).addClass('hide');
    $('.save-a-msg').addClass('hide');
    $('.edit-a-msg').removeClass('hide');
    $sentmessageBody.html(priorToEditBody);
  });

  // Click handler for Save button: saves whatever new message the user entered
  $('.account-info').on('click', '.save-a-msg', function(e){
    e.preventDefault();
    $.ajax({
      url: sa + '/messages/' + selectedMsgId,
      headers: {
        Authorization: 'Token token=' + token
      },
      method: 'PATCH',
      data: {
        message: {
          body: $('.sentmessage-body').html(),
        }
      }
    }).done(function(data) {
      $('.alert').addClass('hide');
      $('#msg-save-confirmation').removeClass('hide');
      $('.save-a-msg, .cancel-a-msg').addClass('hide');
      $('.edit-a-msg').removeClass('hide');
    }).fail(function(data) {
      $('.alert').addClass('hide');
      $('#msg-save-alert').removeClass('hide');
      console.error(data);
    });
  });

  // Click handler for Delete link. Modal is opened via Bootstrap handler in HTML. selectedMsgId is set here.
  $('.account-info').on('click', '.delete-a-msg', function(e){
    selectedMsgId = $(this).data('id');
    $('#confirm-delete, delete-msg-cancel').removeClass('hide');
    $('.alert').addClass('hide');
  });

  // Click handler for Delete button in Confirm Delete modal: deletes the current message.
  $('#confirm-delete').on('click', function(){
    $.ajax({
      url: sa + '/messages/' + selectedMsgId,
      method: 'DELETE',
      headers: {
        Authorization: 'Token token=' + token
      },
    }).done(function(data) {
      displaySentMessages();
      $('#msg-delete-alert').addClass('hide');
      $('#msg-delete-confirmation').removeClass('hide');
      $('#confirm-delete, delete-msg-cancel').addClass('hide');
      window.setTimeout(function(){
        $('#delete-msg-confirm-modal').modal('hide');
      }, 2000);
    }).fail(function(data) {
      console.error(data);
      $('#msg-delete-alert').removeClass('hide');
    });
  });

  $('.account-info').on('click', '#acct-anon-btn', function(e){
    $('#acct-moniker').val('');
  });

  $('.account-info').on('click', '#acct-moniker', function(e){
    $('#acct-anon-btn').prop('checked', false);
  });

  // Click handler for allowing users to edit account information
  $('#display-profile-account-settings').on('click', '#save-acct-info', function(e){
    $('.alert').addClass('hide');
    e.preventDefault();

    var profile = {
      moniker: $('#acct-anon-btn').is(':checked') ? 'anonymous' : $('#acct-moniker').val(),
      location: $('#acct-location').val(),
      phone_number: $('#acct-phone-field').val(),
      selected_time: $("input[name='accttimeofday']:checked").val(),
      opted_in: $("input[name='acct-opt-in-out']:checked").val() == "optin" ? 1 : 0
    };

    // AJAX to save user data (just email right now)
    $.ajax({
      url: sa + '/users/' + userID,
      headers: {
        Authorization: 'Token token=' + token
      },
      method: 'PATCH',
      data: {
        user: {
          email: $('#acct-email').val(),
        }
      },
    }).done(function(data) {
      console.log(data);

      // AJAX to save profile data (everything else)
      $.ajax({
        url: sa + '/profiles/' + userID,
        headers: {
          Authorization: 'Token token=' + token
        },
        method: 'PATCH',
        data: {
          profile: profile
        },
      }).done(function(data) {
        $('#acct-confirmation').removeClass('hide');
        console.log(data);
      }).fail(function(data) {
        $('#acct-alert').removeClass('hide');
        console.error(data);
      });
    }).fail(function(data) {
      $('#acct-alert').removeClass('hide');
      console.error(data);
    });
  });
});
