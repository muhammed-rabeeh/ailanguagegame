$(function() {
    var socket = io.connect("http://localhost:5000");
    var timerRunning = false;
    socket.on('connect',function(){
        console.log("Connected to server!");
        socket.send("User connected!")
    });

    socket.on('message',function(data){
        console.log("Data Send",data)
        $('#messages').append($('<p>').text(data));
    });

    $('#sendBtn').on('click',function (){
        var message = $('#username').val() + ':' + $('#message').val();
        console.log("Sending message:",message);
        socket.send(message);
        $('#message').val('');
    });

    $('.randomBtn').on('click', function (){
        if (!timerRunning) {
            console.log("function is calling");
            socket.emit('get_random_word');

            socket.emit('start_timer', { duration: 60 });
            timerRunning = true;
          }
      });
    var winner = "";

    socket.on('update_timer', function(data) {
        $('#timer').text(`Time Remaining: ${data.timeLeft}s`);
        if (data.timeLeft <= 0) {
            $(".name").css('display','none');
            $(".winner").css('display','block');
            $(".malbt").css('display','none');
            $(".odibt").css('display','none');
            $(".telbt").css('display','none');
            $(".enword").css('display','none');
            timerRunning = false;
            winner = Math.max(...score);
            socket.emit("update_winner",{winner:winner});
            $('#timer').text(`Time Remaining: ${data.timeLeft}s`);
            $('.randomBtn').prop('disabled', false);
        } else {
            $('.randomBtn').prop('disabled', true);
        }
    });

    socket.on('winner_updated', function(data){
        var winner_name = data['winner']
        console.log("Received Word:",winner_name);
        if (winner_name!="No Winner Selected") {
            consoleText(['The Winner is', winner_name,"Congrats🎉"], 'text',['tomato','rebeccapurple','lightblue']);
            $("#winner").css('display','none');
        } else {
            $('#winner').text(winner_name);
            $("#console").css('display','none');
        }
    });

    socket.on('get_random_word_response', function(data){
        console.log("Received Word:",data);
        $('#random').text(data);
    });

});
// Table Settings
const nameInput = document.getElementById('name');
const submitButton = document.getElementById('submit');
const tbody = document.getElementById('tbody');
var dropdownItems = document.getElementsByClassName('dropdown-item');
var lansel = document.getElementById('selectlan');

function startGame() {
    $(".startBtn").css('display','none');
    $(".name").css('display','block');
    document.getElementById("submit").disabled=false;
    document.getElementById("myname").textContent="";
    $(".enword").css('display','flex');
    $("#timer").css('display','flex');
    $(".table-main").css('display','flex');
    $(".connection").css('display','block');
    document.getElementById("randombutton").disabled=true;    
}

var accuracy_number="";
var speed_number="";
var final_score=0;
var score = [];

var socket = io.connect("http://localhost:5000");

window.onload = () => {
    fetch('/get_player_count') // Fetch current player count from server on load
      .then(response => response.json())
      .then(data => {
        playerCount = data.playerCount; // Update local variable
        console.log(playerCount);
      });
}

socket.on('update_table', function(data) {
    // Clear existing table body
    tbody.innerHTML = "";

    data.players.forEach(player => {

        const newRow = document.createElement('tr');
        const newTh = document.createElement('th');
        const newTdName = document.createElement('td');
        const newTdLang = document.createElement('td');
        const newTdScore = document.createElement('td');

        newTh.textContent = player.position;
        newTh.scope = "row";
        newTdName.textContent = player.name;
        newTdLang.textContent = player.language;
        newTdScore.textContent = player.score;

        newRow.appendChild(newTh);
        newRow.appendChild(newTdName);
        newRow.appendChild(newTdLang);
        newRow.appendChild(newTdScore);

        tbody.appendChild(newRow);
        playerCount+=1
    });
});

submitButton.addEventListener('click', () => {
    submitButton.disabled = true;
    const name = nameInput.value.trim();
    document.getElementById("myname").textContent="Hi, "+name;
    lansel.style.display="flex";

    console.log("player count:"+playerCount)

    if (name) {
        fetch('/get_player_count') // Fetch current player count from server
        .then(response => response.json())
        .then(data => {
            playerCount = data.playerCount; // Update local variable
            if (playerCount<3) {
                console.log(playerCount)
                dropdownItems[0].addEventListener('click', function() {
                    const chosenLanguage = "Malayalam";
                    const data = { name, chosenLanguage };
                    socket.emit('add_player', data);
                });
        
                dropdownItems[1].addEventListener('click', function() {
                    const chosenLanguage = "Telugu";
                    const data = { name, chosenLanguage };
                    socket.emit('add_player', data);
                
                });
        
                dropdownItems[2].addEventListener('click', function() {
                    const chosenLanguage = "Hindi";
                    const data = { name, chosenLanguage };
                    socket.emit('add_player', data);
                
                });
                nameInput.value = "";
            } else if (playerCount>=3) {
                console.log("Room is closed")
                dropdownItems[0].addEventListener('click', function() {
                    alert("Room is closed");
            });
        
                dropdownItems[1].addEventListener('click', function() {
                    alert("Room is closed");     
                });
        
                dropdownItems[2].addEventListener('click', function() {
                    alert("Room is closed");
                });
                nameInput.value = "";
            } 
        });

    } else {
        alert("Please enter your name!");
    }
});


function refreshRoom() {
    tbody.innerHTML = "";
    $(".name").css('display','block');
    document.getElementById("submit").disabled=false;
    document.getElementById("myname").textContent="";
    $(".winner").css('display','none');
    $(".enword").css('display','flex');
    $("#random").css('display','none');
    document.getElementById("randombutton").disabled=true;
    refresh_room();
}

function refresh_room() {
    playerCount=0;
    socket.emit('refresh_room', { status: "refreshed" });
}

$('.closeBtn').on('click', function (){
    socket.emit('close_room');
  });

socket.on('room_closed', function(data){
    console.log("Received Word:",data);
    $('#close').text(data);
});


document.getElementById('malbt').style.display = 'none';
document.getElementById('odibt').style.display = 'none';
document.getElementById('telbt').style.display = 'none';

var dropdownItems = document.getElementsByClassName('dropdown-item');



dropdownItems[0].addEventListener('click', function() {
    document.getElementById('malbt').style.display = 'block';
    lansel.style.display="none";
    document.getElementById("randombutton").disabled=false;
});

dropdownItems[1].addEventListener('click', function() {
    document.getElementById('telbt').style.display = 'block';
    lansel.style.display="none";
    document.getElementById("randombutton").disabled=false;
});

dropdownItems[2].addEventListener('click', function() {
    document.getElementById('odibt').style.display = 'block';
    lansel.style.display="none";
    document.getElementById("randombutton").disabled=false;
});

var malrecognition = new webkitSpeechRecognition();
var isRecording = false;

malrecognition.lang = 'ml-IN'

malrecognition.interimResults = false;

malrecognition.onstart = function() {
    console.log("recording")
    isRecording = true
}

var hirecognition = new webkitSpeechRecognition();

hirecognition.lang = 'hi-IN'

hirecognition.interimResults = false;

hirecognition.onstart = function() {
    console.log("recording")
    isRecording = true;
}

var telrecognition = new webkitSpeechRecognition();

telrecognition.lang = 'te-IN'

telrecognition.interimResults = false;

telrecognition.onstart = function() {
    console.log("recording")
    isRecording = true
}

function updateScore(player_name,accuracy_number) {
    score.push(final_score);
    socket.emit('update_score', { name: player_name, accuracy: accuracy_number });
}

document.getElementById('mal').addEventListener('click', function () {

    const player_name = document.getElementById("myname").textContent;
    malayalamControl(player_name);
  });

var isResult=false;

function malayalamControl(player_name) {
    isResult=false;
    if (isRecording) {
        malrecognition.stop();
        $(".boxContainer").css('display','none');
        $(".maldiv").css('display','block');
        isRecording = false;
    } else {
        malrecognition.start();
        $(".boxContainer").css('display','flex');
        $(".maldiv").css('display','none');
        function hideBox() {
            if (!isResult) {
                $(".boxContainer").css('display','none');
                $(".maldiv").css('display','block');
            } else {
                $(".boxContainer").css('display','flex');
                $(".maldiv").css('display','none');
        
            }
        }
        var myTimeout = setTimeout(hideBox, 10000);
        isRecording = true;
    }

    var malmyword = document.getElementById("malmyword");
    malrecognition.onresult = function (event) {
        clearTimeout(myTimeout);
        isResult = true;
        console.log("Called")
        var result = event.results[event.results.length - 1][0].transcript;
        malmyword.innerText=result;
        console.log(result);
        isRecording = false;
        $(".boxContainer").css('display','none');
        $(".maldiv").css('display','block');
        var random = document.getElementById("random").innerText;
        var malword = document.getElementById("malword");
        var malaccuracy = document.getElementById("malaccuracy");
        var speed = document.getElementById("timer");
        speed = speed.textContent;

        fetch('maltranslate', {
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body: JSON.stringify({'message':random,'result':result})
        })
        .then(response => {
            return response.json()})
        .then(data => {
            submit=data.response;
            var accuracy = data.accuracy;
            accuracy_match = accuracy.match(/(\d+)/);
            accuracy_number=accuracy_match[0];
            speed_match = speed.match(/(\d+)/);
            speed_number=speed_match[0];
            console.log("speed: "+speed_number/10+"accuracy: "+accuracy_number)
            final_score = parseInt(accuracy_number) * (parseInt(speed_number)/10);
            final_score = final_score.toFixed(2);
            updateScore(player_name,final_score);
            malword.innerText=submit;
            malaccuracy.innerText=accuracy;
            console.log(submit);
        }
        )
        .catch((error) => {
            console.error('Error:', error);
        });
    }
}
  

function hindiControl() {
    isResult=false;
    if (isRecording) {
        hirecognition.stop();
        $(".boxContainer").css('display','none');
        $(".hidiv").css('display','block');
        isRecording = false;
    } else {
        hirecognition.start();
        $(".boxContainer").css('display','flex');
        $(".hidiv").css('display','none');
        function hideBox() {
            if (!isResult) {
                $(".boxContainer").css('display','none');
                $(".hidiv").css('display','block');
            } else {
                $(".boxContainer").css('display','flex');
                $(".hidiv").css('display','none');
        
            }
        }
        var myTimeout = setTimeout(hideBox, 10000);
        isRecording = true;
    }

    var himyword = document.getElementById("himyword");
    hirecognition.onresult = function (event) {
        clearTimeout(myTimeout);
        isResult=true;
        var result = event.results[event.results.length - 1][0].transcript;
        himyword.innerText=result;
        console.log(result);
        isRecording = false;

        $(".boxContainer").css('display','none');
        $(".hidiv").css('display','block');

        var random = document.getElementById("random").innerText;
        var hindiword = document.getElementById("hindiword");
        var hiaccuracy = document.getElementById("hiaccuracy");
        const player_name = document.getElementById("myname").textContent;
        var speed = document.getElementById("timer");
        speed = speed.textContent;

        fetch('hintranslate', {
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body: JSON.stringify({'message':random,'result':result})
        })
        .then(response => {
            return response.json()})
        .then(data => {
            submit=data.response;
            var accuracy = data.accuracy;
            hindiword.innerText=submit;
            accuracy_match = accuracy.match(/(\d+)/);
            accuracy_number=accuracy_match[0];
            speed_match = speed.match(/(\d+)/);
            speed_number=speed_match[0];
            final_score = parseInt(accuracy_number) * (parseInt(speed_number)/10);
            final_score = final_score.toFixed(2);
            updateScore(player_name,final_score);
            hiaccuracy.innerText=accuracy;
            console.log(submit);
        }
        )
        .catch((error) => {
            console.error('Error:', error);
            });
    }
}


function teluguControl() {
    isResult=false;
    if (isRecording) {
        telrecognition.stop();
        $(".boxContainer").css('display','none');
        $(".teldiv").css('display','block');
        isRecording = false;
    } else {
        telrecognition.start();
        $(".boxContainer").css('display','flex');
        $(".teldiv").css('display','none');
        function hideBox() {
            if (!isResult) {
                $(".boxContainer").css('display','none');
                $(".teldiv").css('display','block');
            } else {
                $(".boxContainer").css('display','flex');
                $(".teldiv").css('display','none');
        
            }
        }
        var myTimeout=setTimeout(hideBox, 10000);
        isRecording = true;
    }

    var telmyword = document.getElementById("telmyword");
    telrecognition.onresult = function (event) {
        clearTimeout(myTimeout);
        isResult=true;
        var result = event.results[event.results.length - 1][0].transcript;
        telmyword.innerText=result;
        console.log(result);
        isRecording = false;

        $(".boxContainer").css('display','none');
        $(".teldiv").css('display','block');

        var random = document.getElementById("random").innerText;
        var telword = document.getElementById("telword");
        var teaccuracy = document.getElementById("teaccuracy");
        const player_name = document.getElementById("myname").textContent;
        var speed = document.getElementById("timer");
        speed = speed.textContent;
        fetch('teltranslate', {
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body: JSON.stringify({'message':random,'result':result})
        })
        .then(response => {
            return response.json()})
        .then(data => {
            submit=data.response;
            var accuracy = data.accuracy;
            telword.innerText=submit;
            accuracy_match = accuracy.match(/(\d+)/);
            accuracy_number=accuracy_match[0];
            speed_match = speed.match(/(\d+)/);
            speed_number=speed_match[0];
            final_score = parseInt(accuracy_number) * (parseInt(speed_number)/10);
            final_score = final_score.toFixed(2);
            updateScore(player_name,final_score);
            teaccuracy.innerText=accuracy;
            console.log(submit);
        }
        )
        .catch((error) => {
            console.error('Error:', error);
            });
    }
}

function consoleText(words, id, colors) {
  if (colors === undefined) colors = ['#fff'];
  var visible = true;
  var con = document.getElementById('console');
  var letterCount = 1;
  var x = 1;
  var waiting = false;
  var target = document.getElementById(id)
  target.setAttribute('style', 'color:' + colors[0])
  window.setInterval(function() {

    if (letterCount === 0 && waiting === false) {
      waiting = true;
      target.innerHTML = words[0].substring(0, letterCount)
      window.setTimeout(function() {
        var usedColor = colors.shift();
        colors.push(usedColor);
        var usedWord = words.shift();
        words.push(usedWord);
        x = 1;
        target.setAttribute('style', 'color:' + colors[0])
        letterCount += x;
        waiting = false;
      }, 1000)
    } else if (letterCount === words[0].length + 1 && waiting === false) {
      waiting = true;
      window.setTimeout(function() {
        x = -1;
        letterCount += x;
        waiting = false;
      }, 1000)
    } else if (waiting === false) {
      target.innerHTML = words[0].substring(0, letterCount)
      letterCount += x;
    }
  }, 120)
  window.setInterval(function() {
    if (visible === true) {
      con.className = 'console-underscore hidden'
      visible = false;

    } else {
      con.className = 'console-underscore'

      visible = true;
    }
  }, 400)
}