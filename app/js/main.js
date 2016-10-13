var token;
var userID;
var moniker;
var tokenExists;
var logOut;

var sendEvent = function(){
  $('#register-modal').trigger('next.m.2');
}

$(document).ready(function(){

  var sa = 'https://powerful-waters-3612.herokuapp.com/';
  // var sa = 'http://localhost:3000/'


  // Checks for a token, does stuff if it finds one
  tokenExists = function(token){
    if (token) {
      $('.register, .sign-in').addClass('hide');
      $('.my-account, .log-out, .temp-send-text, .open-msg-modal').removeClass('hide');
    } else {
      $('.my-account, .log-out, .temp-send-text').addClass('hide');
      $('.register, .sign-in').removeClass('hide');
    }
  };

  tokenExists(token);

  logOut = function(){
    token = null;
  };


  // Click handlers for header
  $('.sign-in, .register').on('click', function() {
    $('.alert').addClass('hide');
    $('.form').trigger('reset');
  });

  $('.log-out').on('click', function(){
    logOut();
    tokenExists(token);
    $('.intro, .glyphs').removeClass('hide');
    $('.user-account, .open-msg-modal').addClass('hide');
  });


  // Click handlers for register modal
  $('[name="phone-or-email"]').on('click', function() {
    if ($('#phone-radio-btn').is(':checked')) {
      $('#phone-selected').show();
    } else {
      $('#phone-selected').hide();
    };
  });

  $('#anon-btn').on('click', function() {
    $('#register-moniker').val('');
  });

  $('#register-moniker').on('click', function() {
    $('#anon-btn').prop('checked', false);
  });


// Click handlers for sign in functionality
  $('#register-btn').on('click', function() {

    moniker = function(){
      var msg;
      if ($('#anon-btn').is(':checked')) {
        msg = 'anonymous';
        console.log(msg);
      } else {
        msg = $('#register-moniker').val();
      }
      return msg;
    }

    var profile = {
                  moniker: moniker(),
                  location: $('#register-location').val(),
                  email_or_phone: $("input[name='phone-or-email']:checked").val(),
                  phone_number: $('#phone-number').val(),
                  selected_time: $("input[name='time-of-day']:checked").val()
                  };
    console.log("profile data is", profile)

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
      console.log(data);
      $('.modal').modal('hide');
      token = data.user_login.token;
      userID = data.user_login.id;
      tokenExists(token);
    }).fail(function(jqxhr, textStatus, errorThrown){
      $('#register-alert').html(jqxhr.responseText);
      $('#register-alert').removeClass('hide');
      console.log(jqxhr.responseText);
    });
  });

  $('#continue-button').on('next.m.2');

  $('#sign-in-btn').on('click', function(){
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
      console.log(data);
      $('.modal').modal('hide');
      token = data.user_login.token;
      userID = data.user_login.id;
      tokenExists(token);
    }).fail(function(jqxhr, textStatus, errorThrown){
      $('#login-alert').removeClass('hide');
    });
  });


  // Click handler for displaying My Account information
  $('.my-account, #acct-received-messages').on('click', function(){
    $('.user-account, #my-account-nav').removeClass('hide');
    $('.intro, .glyphs').addClass('hide');

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
        html = 'You haven\'t received any messages yet. If you haven\'t sent out a message yet, <a href="#" class="open-msg-modal" data-toggle="modal" data-target="#send-message-modal">get sending</a> and you\'ll receive a message within the next day. If you\'ve already sent a message, you should be receiving your first message within the next 24 hours.'
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
        html = 'You have not yet sent any messages. You won\'t receive a daily messages until you send one, so <a href="#" class="open-msg-modal" data-toggle="modal" data-target="#send-message-modal">get sending!</a>'
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
        console.log(data);
        var templatingFunction = Handlebars.compile($('#account-settings-template-user').html());
        var html = templatingFunction(data);
        currentUserData = data;
        $('#display-user-account-settings').removeClass('hide').html(html);
      }).fail(function(data) {
        console.error(data);
      });

      $('.account-info > div').addClass('hide');
      $('.jumbotron').addClass('hide');
      $('.glyphs').addClass('hide');

      var templatingFunction = Handlebars.compile($('#account-settings-template-profile').html());
      var html = templatingFunction(data);
      // currentUserProfileData = JSON.parse(data);
      $('#display-profile-account-settings').removeClass('hide').html(html);

      // shows phone number field, only if the phone radio button is checked
      var displayPhoneNumberField = function() {
        if ($('#acct-phone-option').is(':checked')) {
          $('#acct-phone').show();
        } else {
          $('#acct-phone').hide();
        };
      };

      if (data.email_or_phone == "phone") {
        $('#acct-phone-option').prop('checked', true);
      } else {
        $('#acct-email-option').prop('checked', true);
      }

      displayPhoneNumberField();

      // Toggle phone number field when user changes daily message send method from phone to email (and vice versa)
      $('[name="acct-phone-or-email"]').on('click', function() {
        displayPhoneNumberField();
        console.log('selected phone or email');
      });

      if (data.opted_in) {
        $('#acct-opt-in').prop('checked', true);
      } else {
        $('#acct-opt-out').prop('checked', true);
      }
    }).fail(function(data) {
      console.error(data);
    });

  });


  // My Account: click handlers for editing sent messages

  // holds the id of the message you're currently editing
  var selectedMsgId;

  // holds the body of the message you're currently editing
  var priorToEditBody;
  var $sentmessageBody;

  $('.account-info').on('click', '.edit-a-msg', function(e){
    // when you click on Edit next to a specific message, it should create an input field and the body of the message should be in the input field.
    e.preventDefault();
    var $editLink = $(this)
    $sentmessageBody = $(this).siblings().filter('.sentmessage-body');
    selectedMsgId = $(this).data('id');
    priorToEditBody = $sentmessageBody.html();
    console.log('currentMsgBody is: ' + priorToEditBody);
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
      console.log('hello');
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
      console.log("Deleted message");
    }).fail(function(data) {
      console.error(data);
      $('#msg-delete-alert').removeClass('hide');
    });
  });


// Click handler for allowing users to edit account information
  $('#display-profile-account-settings').on('click', '.save-acct-info', function(e){
    $('.alert').addClass('hide');
    e.preventDefault();

    var findOptInSelection = function() {
      var bool;
      if ($("input[name='acct-opt-in-out']:checked").val()) {
        bool = true;
      } else {
        bool = false;
      }
      return bool;
    };

    var profile = {
                  moniker: $('#acct-moniker').val(),
                  location: $('#acct-location').val(),
                  email_or_phone: $("input[name='acct-phone-or-email']:checked").val(),
                  phone_number: $('#acct-phone-field').val(),
                  opted_in: findOptInSelection(),
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
      console.log("Saved edited user.");
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
        console.log("Saved edited profile.");
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

// Click handlers for send a message modal (opens from the pencil button in the navbar and in various places in My Account)

// gets id of the specific "open message modal" element that was clicked
var msgModalOpenedFrom;

  $(document).on('click', '.open-msg-modal', function(e){
    msgModalOpenedFrom = $(this).attr('id')
    e.preventDefault();
    $('#send-msg-btn').removeClass('hide');
    $('.alert').addClass('hide');
    // $('#send-message-modal').addClass('show');
    $('#message-text').val('');

  });

// Click handlers for creating a message

  $("#send-msg-btn").on('click', function() {
    $.ajax({
      url: sa + '/messages',
      method: 'POST',
      headers: {
        Authorization: 'Token token=' + token
      },
      data: {
        message: {
          body: $("#message-text").val()
        }
      }
    }).done(function(data) {
      // if the user opened the Send a Message modal from the Sent Messages page, the Sent Messages page will be reloaded after the user sends the message.
      if (msgModalOpenedFrom === 'open-msg-modal-from-account') {
        displaySentMessages();
        console.log('bah')
      }
      $('#message-alert').addClass('hide');
      $('#message-confirmation').removeClass('hide');
      $('#send-msg-btn').addClass('hide');
      window.setTimeout(function(){
        $('#send-message-modal').modal('hide');
      }, 2000);
    }).fail(function(data) {
      console.error(data);
      $('#message-alert').removeClass('hide');
    });
  });

});
