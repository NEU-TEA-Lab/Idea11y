from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import json
import os

from grouping.utils.create_json import create_complex_json
from grouping.main import perform_grouping
from create_note.main import perform_best_position

app = Flask(__name__)

CORS(app, resources={
    r"/api/*": {
        "origins": [
            "https://miro.com",
            "http://localhost:3000", 
            "https://idea11y.vercel.app",
            "https://idea11y-1fa44b9e4b76.herokuapp.com"  
        ],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "Origin"],
        "supports_credentials": False, #?
        "expose_headers": ["Access-Control-Allow-Origin"],
        "max_age": 600
    }
})

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response


@app.route("/api", methods=["GET"])
def hello_world():
    print("hello_world")
    return "Hello, Welcome to idea11y flask server!"


@app.route('/api/grouping', methods=['POST'])
def complex_grouping():
    try:
        data = request.get_json()
        print("Received data on the server") #, data)
        group_map = perform_grouping(data)
        #print("group map is", group_map)
        final_json = create_complex_json(group_map)
        #print("JSON to be sent is", final_json)
        return jsonify(final_json)
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/editing_group', methods=['POST'])
def editing_group():
    try:
        data = request.get_json()
        x, y, width = perform_best_position(data)
        result = {
            'status': 'success',
            'x': x,
            'y': y,
            'width': width
        }
        print("editing group: publishing to sse_channel")
        #redis_client.publish('sse_channel', 'sticky_note_created')
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400


port = int(os.environ.get("PORT", 5000))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=port, threaded=True, debug=True) # false for production

# if __name__ == '__main__':
#     app.run(host='127.0.0.1', port=port, threaded=True, debug=True) 