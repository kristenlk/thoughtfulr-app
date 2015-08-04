var token;
var userID;

$(document).ready(function(){

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

  $('[name="phone-or-email"]').on('click', function(){
    if ($('#phone-radio-btn').is(':checked')) {
      $('#phone-selected').show();
    } else {
      $('#phone-selected').hide();
    };
  });

// Click handlers for sign in functionality

  var sa = 'http://localhost:3000';
  var moniker;

  $('#register-btn').on('click', function(){

    moniker = function(){
      if ($('#anon-btn').is(':checked')) {
        return 'anonymous';}
      else {
        return $('#register-moniker').val();
      }
    }

    var profile = {
                  moniker: moniker,
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
      $('#result').val(JSON.stringify(data));
    }).fail(function(jqxhr, textStatus, errorThrown){
      $('#result').val('registration failed');
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
      // simplestorage
      console.log(userID);
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
    debugger;
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


});


