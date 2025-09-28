import string
from nltk.corpus import stopwords

def text_process(review):
    nopunc = [char for char in review if char not in string.punctuation]
    nopunc = ''.join(nopunc)
    return [word for word in nopunc.split() if word.lower() not in stopwords.words('english')]
import string
from nltk.corpus import stopwords

def text_process(review):
    nopunc = [char for char in review if char not in string.punctuation]
    nopunc = ''.join(nopunc)
    return [word for word in nopunc.split() if word.lower() not in stopwords.words('english')]
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib

app = Flask(__name__)
CORS(app)

# Load the trained pipeline (model + vectorizer)
try:
    model_pipeline = joblib.load('svc_model_pipeline.pkl')
except FileNotFoundError:
    print("Error: 'svc_model_pipeline.pkl' not found. Make sure to train and save the model first.")
    exit()

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    review = data.get('review', '')
    if not review:
        return jsonify({'error': 'No review provided'}), 400
    try:
        # Predict using the pipeline
        pred = model_pipeline.predict([review])[0]
        result = {
            'is_fake': pred == 'CG',  # Map the prediction to a boolean for 'is_fake'
            'predicted_label': pred  # Optionally include the predicted label
        }
    except Exception as e:
        result = {'error': str(e)}
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)