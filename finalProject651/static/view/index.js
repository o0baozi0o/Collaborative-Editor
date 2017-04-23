$(document).ready(function () {
	$("#vim").click(function () {
			editor.setOption("keyMap", "vim");
			console.log("clicked");
			$("#editor").collapse('hide');
		}
	);
	$("#emacs").click(function () {
			editor.setOption("keyMap", "emacs");
        	$("#editor").collapse('hide');
		}
	);
	$("#sublime").click(function () {
			editor.setOption("keyMap", "sublime");
        	$("#editor").collapse('hide');
		}
	);
    $("#python").click(function () {
            editor.setOption("mode", "python");
            console.log("clicked");
            $("#language").collapse('hide');
        }
    );
    $("#javascript").click(function () {
            editor.setOption("mode", "javascript");
            console.log("clicked");
            $("#language").collapse('hide');
        }
    );
    $("#go").click(function () {
            editor.setOption("mode", "go");
            console.log("clicked");
            $("#language").collapse('hide');
        }
    );
    $("#dracula").click(function () {
            editor.setOption("theme", "dracula");
            console.log("clicked");
            $("#theme").collapse('hide');
        }
    );
    $("#monokai").click(function () {
            editor.setOption("theme", "monokai");
            console.log("clicked");
            $("#theme").collapse('hide');
        }
    );
    $("#light").click(function () {
            editor.setOption("theme", "twilight");
            console.log("clicked");
            $("#theme").collapse('hide');
        }
    );
	sendAppendEntry();
	myTimer = setInterval(sendAppendEntry, 1000);
});
