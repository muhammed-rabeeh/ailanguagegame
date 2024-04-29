from flask import Flask,request,render_template,jsonify
from flask_socketio import SocketIO,send,emit
import google.generativeai as genai
from deep_translator import GoogleTranslator

google_api_key = os.environ.get("API_KEY")
genai.configure(api_key=google_api_key)

model = genai.GenerativeModel('gemini-pro')

chat = model.start_chat()

app = Flask(__name__)

socketio = SocketIO(app,cors_allowed_origins="*")


@socketio.on('message')
def handle_message(message):
    print("Recieved message: " + message)
    if message != "User connected!":
        send(message,broadcast=True)

@socketio.on('get_random_word')
def handle_get_random_word():
    response = chat.send_message("generate a short and simple random english sentence.")
    response_text = response.text.strip()
    response_text = response_text.replace("!", "").replace("*", "").replace(
        "`", "").replace(">", "")
    print("Assistant: ", response_text)
    random_word = response_text
    print(f"Sending random word: {random_word}")
    socketio.emit('get_random_word_response', random_word)

players = []  # List to store player data

@socketio.on('add_player')
def handle_add_player(data):

    if data=="closed":
        return
    name = data['name']
    chosen_language = data['chosenLanguage']

    position = len(players) + 1

    players.append({'name': name, 'language': chosen_language, 'score': 0, 'position': position})

    send_updated_table_data()

@app.route('/get_player_count')
def get_player_count():
  global players
  return jsonify({'playerCount': len(players)})

winner=[]
@socketio.on('update_winner')
def handle_start_timer(data):
    global player_data
    global winner
    winner_name = ""
    if data['winner']!=None:
        winner.append(data['winner'])
    if winner:
        winner_score = max(winner)
        for player_name,player_score in player_data.items():
            player_score=float(player_score)
            if player_score==winner_score:
                winner_name=player_name
    else:
        winner_name="No Winner Selected"
    socketio.emit("winner_updated",{"winner":winner_name})


@socketio.on('start_timer')
def handle_start_timer(data):
    duration = data.get('duration')
    if duration:
        for i in range(duration, -1, -1):
            socketio.sleep(1)
            remaining_time = i
            # Broadcast update to all connected clients
            emit('update_timer', {'timeLeft': remaining_time}, broadcast=True)
    else:
        print('Invalid timer duration received')

@socketio.on('refresh_room')
def handle_refresh_event(data):
  global players
  if data['status']=="refreshed":
    players = []
  send_updated_table_data()

@socketio.on('close_room')
def handle_close_room():
    room_closed = "Room is Closed"
    socketio.emit('room_closed', room_closed)

player_data = {}

@socketio.on('update_score')
def handle_update_score(data):

    player_name=data['name']

    global player_data


    new_score = data['accuracy']

    global players

    player_name = player_name[player_name.index("Hi, ")+4:]

    print(player_name,new_score)

    player_data[player_name]=new_score

    for player in players:
        if player['name'] == player_name:
            player['score'] = new_score
            break
    send_updated_table_data()

def send_updated_table_data():
    socketio.emit('update_table', {'players': players})


@app.route('/', methods=['GET','POST'])
def first_page():
    return render_template("index.html")


@app.route('/maltranslate', methods=['GET','POST'])
def maltranslate():
    random = request.json['message']
    result = request.json['result']
    translation = GoogleTranslator(source='en', target='ml').translate(random)
    response = chat.send_message(f"""I will give you my own translation and original translation of an English sentence in Malayalam, your task is to compare both translation and give m>
                                 
                                 Actual English Sentence :- {random}
                                 My translation :- {result}
                                 Original translation :- {translation}

                                 Only Give me accuracy in percentage after comparing above translations in this format inside square bracket and do not give any suggestions:-
                                 Accuracy - [%]
                                 
                                 Note:- Do not give any other words or sentences or suggestions in your reply. Only give accuracy in above mentioned format""")
    response_text = response.text.strip()
    response_text = response_text.replace("!", "").replace("*", "").replace(
    "`", "").replace(">", "")
    return jsonify({'response':translation,'accuracy':response_text})

@app.route('/hintranslate', methods=['GET','POST'])
def hintranslate():
    random = request.json['message']
    result = request.json['result']
    translation = GoogleTranslator(source='en', target='hi').translate(random)
    response = chat.send_message(f"""I will give you my own translation and original translation of an English sentence in Hindi, your task is to compare both translation and give me ac>
                                 
                                 Actual English Sentence :- {random}
                                 My translation :- {result}
                                 Original translation :- {translation}

                                 Only Give me accuracy in percentage after comparing above translations in this format inside square bracket and do not give any suggestions:-
                                 Accuracy - [%]
                                 
                                 Note:- Do not give any other words or sentences or suggestions in your reply. Only give accuracy in above mentioned format""")
    response_text = response.text.strip()
    response_text = response_text.replace("!", "").replace("*", "").replace(
    "`", "").replace(">", "")
    return jsonify({'response':translation,'accuracy':response_text})


@app.route('/teltranslate', methods=['GET','POST'])
def teltranslate():
    random = request.json['message']
    result = request.json['result']
    translation = GoogleTranslator(source='en', target='te').translate(random)
    response = chat.send_message(f"""I will give you my own translation and original translation of an English sentence in Telugu, your task is to compare both translation and give me a>
                                 
                                 Actual English Sentence :- {random}
                                 My translation :- {result}
                                 Original translation :- {translation}

                                 Only Give me accuracy in percentage after comparing above translations in this format inside square bracket and do not give any suggestions:-
                                 Accuracy - [%]
                                 
                                 Note:- Do not give any other words or sentences or suggesions in your reply. Only give accuracy in above mentioned format.""")
    response_text = response.text.strip()
    response_text = response_text.replace("!", "").replace("*", "").replace(
    "`", "").replace(">", "")

    return jsonify({'response':translation,'accuracy':response_text})

if __name__ == '__main__':
    socketio.run(app)
