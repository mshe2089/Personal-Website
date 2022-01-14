$(function() {
  $("#loading").hide();
  $('#submitCredentials').on('click', function() {
    $("#usernamebox").attr('disabled', true)
    $("#passwordbox").attr('disabled', true)
    $("#loading").show();
    $.getJSON($SCRIPT_ROOT + '/USYDmarks_script', {
      username: $('input[name="usernamebox"]').val(),
      password: $('input[name="passwordbox"]').val(),
    }, function(data) {
      $("#usernamebox").prop('disabled', false)
      $("#passwordbox").prop('disabled', false)
      $("#loading").hide();
      $("#units").text(data.units);
      $("#wam").text(data.WAM);
    });
    return false;
  });
});
