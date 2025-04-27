from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from googletrans import Translator
from gtts import gTTS
import pytesseract
from PIL import Image
from transformers import pipeline
import time
import os

app = Flask(__name__)
CORS(app)

# Load summarization model
summarizer = pipeline("summarization", model="sshleifer/distilbart-cnn-12-6")

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/translator')
def translator():
    return render_template('translator.html')

@app.route('/how-it-works')
def how_it_works():
    return render_template('how-it-works.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/summarize_translate', methods=['POST'])
def summarize_translate():
    data = request.get_json()
    text = data.get('text')
    target_lang = data.get('targetLang', 'en')

    if not text:
        return jsonify({'error': 'No text provided'}), 400

    start_time = time.time()

    try:
        # Break large input into smaller chunks for better summarization
        chunk_size = 1500  # Reduced chunk size for better relevance
        chunks = [text[i:i + chunk_size] for i in range(0, len(text), chunk_size)]
        summaries = []

        for chunk in chunks:
            # Summarize each chunk with appropriate length
            result = summarizer(chunk, max_length=100, min_length=30, do_sample=False)
            summaries.append(result[0]['summary_text'])

        # Combine summaries into one string
        summary = ' '.join(summaries)

        # Clean up the summary to remove redundancy and irrelevant sentences
        summary = clean_summary(summary)

        # Translate the summary to the desired language
        translator = Translator()
        translated_summary = translator.translate(summary, dest=target_lang).text

        print(f"Summarize + Translate Time: {time.time() - start_time:.2f}s")

        return jsonify({
            'summary': summary,
            'translatedSummary': translated_summary
        })

    except Exception as e:
        return jsonify({'error': f'Processing failed: {str(e)}'}), 500

def clean_summary(summary):
    """
    Function to clean the summary text, removing redundant or irrelevant sentences.
    """
    sentences = summary.split('.')
    unique_sentences = set(sentences)  # Remove duplicate sentences
    cleaned_summary = '. '.join(sorted(unique_sentences)).strip() + '.'  # Sort and join
    return cleaned_summary

@app.route('/speak', methods=['POST'])
def speak():
    data = request.get_json()
    text = data.get('text')
    lang = data.get('lang', 'en')

    if not text:
        return jsonify({'error': 'No text provided'}), 400

    try:
        # Generate speech from the provided text
        tts = gTTS(text=text, lang=lang)
        audio_path = 'static/output.mp3'

        # Remove previous audio file if it exists
        if os.path.exists(audio_path):
            os.remove(audio_path)

        tts.save(audio_path)
        return jsonify({'audio_url': '/' + audio_path})

    except Exception as e:
        return jsonify({'error': f'TTS failed: {str(e)}'}), 500

@app.route('/ocr', methods=['POST'])
def ocr():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400

    try:
        # Perform OCR on the uploaded image
        image = request.files['image']
        img = Image.open(image)
        extracted_text = pytesseract.image_to_string(img)
        return jsonify({'text': extracted_text})

    except Exception as e:
        return jsonify({'error': f'OCR failed: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, threaded=True)
