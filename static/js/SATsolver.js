$(function() {
  $('#submitSAT').on('click', function() {
    $.getJSON($SCRIPT_ROOT + '/SATsolver_script', {
      formula: $('input[name="SATformulabox"]').val(),
    }, function(data) {
      $("#result").text(data.result);
    });
    return false;
  });
});
