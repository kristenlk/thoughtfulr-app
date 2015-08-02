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

// Click handlers for send a message modal
  $('#header-msg').on('click', function(){
    $('#send-message-modal').addClass('show');
  });

});


