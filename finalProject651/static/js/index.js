var code = $("#input")[0];
var editor = CodeMirror.fromTextArea(code, {
    lineNumbers: true
});
var output = document.getElementById("output");

$(document).ready(function () {
    sendString();
});

function sendString() {
    $(document).ready(function () {
        $.ajax({
           type:"POST",
            url: "http://155.41.100.200:8000/add_string/",
            data:{string: editor.getValue()},
            success: function (data) {
                console.log(data.content);
                output.value += data.content;
            }
        });
    });
    setTimeout('sendString()', 3000);
}
