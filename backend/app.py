from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    review = data.get('review', '')
    # TODO: Add your fake review detection logic here
    # For now, return a dummy result
    result = {'is_fake': False, 'confidence': 0.5}
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)