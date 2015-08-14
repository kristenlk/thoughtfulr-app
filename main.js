var token;
var userID;
var moniker;
var tokenExists;
var logOut;

$(document).ready(function(){

  // Checks for a token, does stuff if it finds one

  tokenExists = function(token){
    if (token) {
      $('.register, .sign-in').addClass('hide');
      $('.my-account, .log-out, .temp-send-text, .open-msg-modal').removeClass('hide');
    } else {
      console.log('no token found!')
      $('.my-account, .log-out, .temp-send-text').addClass('hide');
      $('.register, .sign-in').removeClass('hide');
    }
  };

  tokenExists(token);

  logOut = function(){
    token = null;
  };

  // Click handlers for header

  $('.sign-in').on('click', function() {
    $('#login-alert').addClass('hide');
    $('.form').trigger('reset');
    $('#register-modal').removeClass('show');
    $('#sign-in-modal').addClass('show');
  });

  $('.register').on('click', function() {
    $('#login-alert').addClass('hide');
    $('#sign-in-modal').removeClass('show');
    $('#register-modal').addClass('show');
    $('.form').trigger('reset');
  });

  $('.log-out').on('click', function(){
    logOut();
    tokenExists(token);
    $('.jumbotron, .glyphs').removeClass('hide');
    $('#user-account').removeClass('show').addClass('hide');
  });



  // Click handler to close any open modal

  $('.x').on('click', function() {
    $('.modal').removeClass('show');
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

  var sa = 'http://localhost:3000';

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
      // $('#result').val(JSON.stringify(data));
      console.log(data);
      $('.modal').removeClass('show');
      token = data.user_login.token;
      userID = data.user_login.id;
      tokenExists(token);
    }).fail(function(jqxhr, textStatus, errorThrown){
      // $('#result').val('registration failed');
      $('#register-alert').html(jqxhr.responseText);
      $('#register-alert').removeClass('hide');
      console.log(jqxhr.responseText);
    });
  });

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
      $('.modal').removeClass('show')
      token = data.user_login.token;
      userID = data.user_login.id;
      tokenExists(token);
      // simplestorage
    }).fail(function(jqxhr, textStatus, errorThrown){
      $('#login-alert').removeClass('hide');
    });
  });


///////////

  // Click handler for displaying My Account information

  $('.my-account, #acct-received-messages').on('click', function(){
    $('#user-account, #my-account-nav').removeClass('hide').addClass('show');
    $('.jumbotron, .glyphs').addClass('hide');
    $.ajax({
      url: sa + '/received_messages',
      headers: {
        Authorization: 'Token token=' + token
      }
    }).done(function(data) {
      var html;
      $('#account-info > div').addClass('hide');
      var templatingFunction = Handlebars.compile($('#received-messages-template').html());
      console.log(data);
      // console.log(data.messages[0].num_messages_left_to_receive)
      if (data.messages.length > 0) {
        html = templatingFunction({receivedmessage: data.messages});
      } else {
        html = 'You haven\'t received any messages yet. If you haven\'t sent out a message yet, <a href="#" class="open-msg-modal">get sending</a> and you\'ll receive a message within the next day. If you\'ve already sent a message, you should be receiving your first message within the next 24 hours.'
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
        // $('#account-stuff').html(data)
        console.log(data)
        var html;
        $('#account-info > div').addClass('hide');
        var templatingFunction = Handlebars.compile($('#sent-messages-template').html());
        if (data.messages.length > 0) {
          html = templatingFunction({sentmessage: data.messages});
        } else {
          html = 'You have not yet sent any messages. You won\'t receive a daily messages until you send one, so <a href="#" class="open-msg-modal">get sending!</a>'
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


  // My Account: Click handler for displaying account information / preferences

  $('#acct-my-account').on('click', function(){
    $.ajax({
      url: sa + '/users/' + userID + '/profile',
      headers: {
        Authorization: 'Token token=' + token
      }
    }).done(function(data) {

      // AJAX to get user data.
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

      console.log(data)
      $('#account-info > div').addClass('hide');
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

      // figure out a better way to invoke this
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


  $('#account-info').on('click', '.edit-a-msg', function(e){
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
  $('#account-info').on('keypress', '.sentmessage-body', function(e){
    // e.preventDefault();
    if(e.which == 13){
      console.log('hello');
      $('.save-a-msg').click();
    }
  });


  // Click handler for Cancel button: removes anything a user edits and sets it back to value in db. Clicking outside of the field should also cancel, but it does not right now.
  $('#account-info').on('click', '.cancel-a-msg', function(e){
    console.log('sdfsd');
    e.preventDefault();
    $(this).addClass('hide');
    $('.save-a-msg').addClass('hide');
    $('.edit-a-msg').removeClass('hide');
    $sentmessageBody.html(priorToEditBody);
    // $sentmessageBody = priorToEditBody;
  });

  // Click handler for Save button: saves whatever new message the user entered
  $('#account-info').on('click', '.save-a-msg', function(e){
    console.log('clicked on Save');
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
      console.log("Saved edited message.");
      $('.save-a-msg, .cancel-a-msg').addClass('hide');
      $('.edit-a-msg').removeClass('hide');
    }).fail(function(data) {
      console.error(data);
    });
  });

  // Click handler for Delete button: deletes the current message. There should be some sort of delete confirmation here.
  $('#account-info').on('click', '.delete-a-msg', function(e){
    selectedMsgId = $(this).data('id');
    e.preventDefault();
    $.ajax({
      url: sa + '/messages/' + selectedMsgId,
      method: 'DELETE',
      headers: {
        Authorization: 'Token token=' + token
      },
    }).done(function(data) {
      displaySentMessages();
      console.log("Deleted message");
      // $(this).addClass('hide');
    }).fail(function(data) {
      console.error(data);
    });
  });


// Click handler for allowing users to edit account information
// Add green confirmation saying your account information has been saved
  $('#display-profile-account-settings').on('click', '.save-acct-info', function(e){
    console.log('sdfsd');
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

    // ajax to save user data (just email right now)
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
    }).fail(function(data) {
      console.error(data);
    });

    var profile = {
                  moniker: $('#acct-moniker').val(),
                  location: $('#acct-location').val(),
                  email_or_phone: $("input[name='acct-phone-or-email']:checked").val(),
                  phone_number: $('#acct-phone-field').val(),
                  opted_in: findOptInSelection(),
                  };

    // ajax to save profile data (everything else)
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
      console.log("Saved edited profile.");
      console.log(data);
    }).fail(function(data) {
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
    $('.alert').removeClass('show');
    $('#send-message-modal').addClass('show');
    $('#message-text').val('');

    // if user clicked on one of the "get sending" links in their account, return true
    // reloadSentMessages = function() {
    //   return open-msg-modal-from-account
    // };

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
      if (msgModalOpenedFrom === 'open-msg-modal-from-account') {
        displaySentMessages()
      }
      console.log("Created message!");
      $('#message-confirmation').addClass('show');
      $('#send-msg-btn').addClass('hide');
      $('#send-message-modal').delay(2000).fadeOut('slow');
    }).fail(function(data) {
      console.error(data);
      $('#message-alert').addClass('show');
    });
  });

});
