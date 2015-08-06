var token;
var userID;
var moniker;
var tokenExists;

$(document).ready(function(){

  // Checks for a token, does stuff if it finds one
  tokenExists = function(token){
    if (token) {
      $('.register, .sign-in').addClass('hide');
      $('.my-account, .log-out, .temp-send-text').removeClass('hide');
    } else {
      console.log('no token yet')
    }
  };

  tokenExists(token);

// Click handlers for register / sign in modals
  $('.sign-in').on('click', function() {
    $('#register-modal').removeClass('show');
    $('#sign-in-modal').addClass('show');
  });

  $('.register').on('click', function() {
    $('#sign-in-modal').removeClass('show');
    $('#register-modal').addClass('show');
  });

  $('.x').on('click', function() {
    $('.modal').removeClass('show');
  });

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
                  selected_time: $("input[name='time-of-day']:checked").val()
                  };

    $.ajax(sa + '/create', {
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
      $('.modal').removeClass('show');
      token = data.user_login.token;
      userID = data.user_login.id;
      tokenExists(token);
      // simplestorage
      // console.log(userID);
    }).fail(function(jqxhr, textStatus, errorThrown){
      $('#login-alert').addClass('show');
      // console.log("We were unable to locate an account with that email address and password combination. Please try again.");
    });
  });

  // $('#list').on('click', function(){
  //   $.ajax(sa + '/users', {
  //     dataType: 'json',
  //     method: 'GET',
  //     headers: {
  //       Authorization: 'Token token=' + $('#token').val()
  //     }
  //   }).done(function(data, textStatus, jqxhr){
  //     $('#result').val(JSON.stringify(data));
  //   }).fail(function(jqxhr, textStatus, errorThrown){
  //     $('#result').val('list failed');
  //   });
  // });

  // $('#create').on('click', function(){
  //   $.ajax(sa + '/games', {
  //     contentType: 'application/json',
  //     processData: false,
  //     data: JSON.stringify({}),
  //     dataType: 'json',
  //     method: 'POST',
  //     headers: {
  //       Authorization: 'Token token=' + $('#token').val()
  //     }
  //   }).done(function(data, textStatus, jqxhr){
  //     $('#result').val(JSON.stringify(data));
  //   }).fail(function(jqxhr, textStatus, errorThrown){
  //     $('#result').val('create failed');
  //   });
  // });

// Click handlers for send a message modal
  $('#header-msg').on('click', function(){
    $('#send-message-modal').addClass('show');
  });

// Click handlers for creating a message

  $("#send-msg-btn").on('click', function() {
    // debugger;
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
      console.log("Created message!");

    }).fail(function(data) {
      console.error(data);
    });
  });

  // Click handler for displaying My Account information

  $('.my-account').on('click', function(){
    $('#my-account-nav').removeClass('hide').addClass('show');
    $.ajax({
      url: sa + '/received_messages',
      headers: {
        Authorization: 'Token token=' + token
      }
    }).done(function(data) {
      // $('#account-stuff').html(data)
      var templatingFunction = Handlebars.compile($('#received-messages-template').html());
      var html = templatingFunction({receivedmessage: data.messages});
      $('#display-received-messages').html(html);
    }).fail(function(data) {
      console.error(data);
    });
  });

  // My Account: Click handler for displaying received messages
  $('#acct-received-messages').on('click', function(){
    $.ajax({
      url: sa + '/received_messages',
      headers: {
        Authorization: 'Token token=' + token
      }
    }).done(function(data) {
      // $('#account-stuff').html(data)
      $('#account-info > div').addClass('hide');
      var templatingFunction = Handlebars.compile($('#received-messages-template').html());
      var html = templatingFunction({receivedmessage: data.messages});
      $('#display-received-messages').removeClass('hide').html(html);
    }).fail(function(data) {
      console.error(data);
    });
  });

  // My Account: Click handler for displaying sent messages
  $('#acct-sent-messages').on('click', function(){
    $.ajax({
      url: sa + '/sent_messages',
      headers: {
        Authorization: 'Token token=' + token
      }
    }).done(function(data) {
      // $('#account-stuff').html(data)
      $('#account-info > div').addClass('hide');

      var templatingFunction = Handlebars.compile($('#sent-messages-template').html());
      var html = templatingFunction({sentmessage: data.messages});
      $('#display-sent-messages').removeClass('hide').html(html);
    }).fail(function(data) {
      console.error(data);
    });
  });

  // My Account: Click handler for displaying account information / preferences
  $('#acct-my-account').on('click', function(){
    $.ajax({
      url: sa + '/users/' + userID + '/profile',
      headers: {
        Authorization: 'Token token=' + token
      }
    }).done(function(data) {
      $('#account-info > div').addClass('hide');
      console.log(data);
      var templatingFunction = Handlebars.compile($('#account-settings-template').html());
      var html = templatingFunction(data);
      $('#display-account-settings').removeClass('hide').html(html);
    }).fail(function(data) {
      console.error(data);
    });
  });


  // Temporary click handler for Send Message button (to generate a text via Twilio API)

  $(".temp-send-text").on('click', function() {
    $.ajax({
      url: sa + '/received_messages',
      method: 'POST',
      headers: {
        Authorization: 'Token token=' + token
      },

      // what needs to be passed in here for now? anything?
      // data: {
      //   message: {
      //     body: $("#message-text").val()
      //   }
      // }
    }).done(function() {
      console.log("Sent message!");

    }).fail(function() {
      console.log('didn\'t work');
    });

  });

});
