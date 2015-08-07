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
      $('.my-account, .log-out, .temp-send-text, .send-msg').removeClass('hide');
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

// Click handlers for send a message modal (opens from the pencil button in the navbar and in various places in My Account)

  $(document).on('click', '.send-msg', function(){
    $('#send-msg-btn').removeClass('hide');
    $('.alert').removeClass('show');
    $('#send-message-modal').addClass('show');
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
      console.log("Created message!");
      $('#message-confirmation').addClass('show');
      $('#send-msg-btn').addClass('hide');
      $('#send-message-modal').delay(2000).fadeOut('slow');
    }).fail(function(data) {
      console.error(data);
      $('#message-alert').addClass('show');
    });
  });

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
        html = 'You haven\'t received any messages yet. If you haven\'t sent out a message yet, <a href="#" class="send-msg">get sending</a> and you\'ll receive a message within the next day. If you\'ve already sent a message, you should be receiving your first message within the next 24 hours.'
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

  // My Account: Click handler for displaying sent messages

  $('#acct-sent-messages').on('click', function(){
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
        html = 'You have not yet sent any messages. You won\'t receive a daily messages until you send one, so <a href="#" class="send-msg">get sending!</a>'
      }
      $('#display-sent-messages').removeClass('hide').html(html);

    }).fail(function(data) {
      console.error(data);
    });
  });

  // My Account: Click handler for displaying account information / preferences

  // // Storing current user data in a variable so I can access it (and so a user can edit it) without rendering json all over again.
  // var currentUserData;

  // // Storing current profile data in a variable so I can access it (and so a user can edit it) without rendering json all over again.
  // var currentUserProfileData;

  $('#acct-my-account').on('click', function(){
    $.ajax({
      url: sa + '/users/' + userID + '/profile',
      headers: {
        Authorization: 'Token token=' + token
      }
    }).done(function(data) {
      $('#account-info > div').addClass('hide');
      $('.jumbotron').addClass('hide');
      $('.glyphs').addClass('hide');
      var templatingFunction = Handlebars.compile($('#account-settings-template-profile').html());
      var html = templatingFunction(data);
      // currentUserProfileData = JSON.parse(data);
      $('#display-account-settings').removeClass('hide').html(html);
    }).fail(function(data) {
      console.error(data);
    });

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
      $('#display-account-settings').prepend(html);
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

  $('.sentmessage-body').keypress(function(e){
    if(e.which == 13){ //Enter key pressed
      console.log('hello');
      $('.save-a-msg').click(); //Trigger search button click event
    }
  });

  $('#account-info').on('click', '.cancel-a-msg', function(e){
    e.preventDefault();
    $(this).addClass('hide');
    $('.save-a-msg').addClass('hide');
    $('.edit-a-msg').removeClass('hide');
    $sentmessageBody.html(priorToEditBody);
    // $sentmessageBody = priorToEditBody;
  });

  $('#account-info').on('click', '.save-a-msg', function(e){
    // console.log('clicked on Save');
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
      console.log("Deleted message");
      $(this).addClass('hide');
    }).fail(function(data) {
      console.error(data);
    });
  });



  $('#display-account-settings').on('click', '.edit-acct-info', function(e){
    e.preventDefault();
    $(this).addClass('hide');
    $('.edit-acct-info-fields').removeClass('hide');
  });


});
