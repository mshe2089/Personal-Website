$(function() {
  $("#loading").hide();

  $('#submitCredentials').on('click', function() {
    $("#loading").show();
    $.getJSON($SCRIPT_ROOT + '/USYDmarks_script', {
      username: $('input[name="usernamebox"]').val(),
      password: $('input[name="passwordbox"]').val(),
    }, function(data) {
      $("#loading").hide();
      $("#units").text(data.units);
      $("#wam").text(data.WAM);
    });
    return false;
  });
});
