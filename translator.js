const languages = {
    "af": "Afrikaans", "sq": "Albanian", "am": "Amharic", "ar": "Arabic", "hy": "Armenian",
    "az": "Azerbaijani", "eu": "Basque", "be": "Belarusian", "bn": "Bengali", "bs": "Bosnian",
    "bg": "Bulgarian", "ca": "Catalan", "ceb": "Cebuano", "zh": "Chinese", "hr": "Croatian",
    "cs": "Czech", "da": "Danish", "nl": "Dutch", "en": "English", "eo": "Esperanto",
    "et": "Estonian", "fi": "Finnish", "fr": "French", "gl": "Galician", "ka": "Georgian",
    "de": "German", "el": "Greek", "gu": "Gujarati", "ht": "Haitian Creole", "ha": "Hausa",
    "haw": "Hawaiian", "iw": "Hebrew", "hi": "Hindi", "hmn": "Hmong", "hu": "Hungarian",
    "is": "Icelandic", "ig": "Igbo", "id": "Indonesian", "ga": "Irish", "it": "Italian",
    "ja": "Japanese", "jv": "Javanese", "kn": "Kannada", "kk": "Kazakh", "km": "Khmer",
    "rw": "Kinyarwanda", "ko": "Korean", "ku": "Kurdish", "ky": "Kyrgyz", "lo": "Lao",
    "la": "Latin", "lv": "Latvian", "lt": "Lithuanian", "lb": "Luxembourgish", "mk": "Macedonian",
    "mg": "Malagasy", "ms": "Malay", "ml": "Malayalam", "mt": "Maltese", "mi": "Maori",
    "mr": "Marathi", "mn": "Mongolian", "my": "Myanmar", "ne": "Nepali", "no": "Norwegian",
    "ny": "Nyanja", "or": "Odia", "ps": "Pashto", "fa": "Persian", "pl": "Polish",
    "pt": "Portuguese", "pa": "Punjabi", "ro": "Romanian", "ru": "Russian", "sm": "Samoan",
    "gd": "Scots Gaelic", "sr": "Serbian", "st": "Sesotho", "sn": "Shona", "sd": "Sindhi",
    "si": "Sinhala", "sk": "Slovak", "sl": "Slovenian", "so": "Somali", "es": "Spanish",
    "su": "Sundanese", "sw": "Swahili", "sv": "Swedish", "tl": "Tagalog", "tg": "Tajik",
    "ta": "Tamil", "tt": "Tatar", "te": "Telugu", "th": "Thai", "tr": "Turkish",
    "tk": "Turkmen", "uk": "Ukrainian", "ur": "Urdu", "ug": "Uyghur", "uz": "Uzbek",
    "vi": "Vietnamese", "cy": "Welsh", "xh": "Xhosa", "yi": "Yiddish", "yo": "Yoruba",
    "zu": "Zulu", "sa": "Sanskrit", "as": "Assamese", "mai": "Maithili", "bh": "Bihari"
  };
  
  const fromLang = document.getElementById("from-language");
  const toLang = document.getElementById("to-language");
  const inputText = document.getElementById("inputText");
  const outputText = document.getElementById("outputText");
  
  // Populate language options
  Object.entries(languages).forEach(([code, name]) => {
    fromLang.innerHTML += `<option value="${code}">${name}</option>`;
    toLang.innerHTML += `<option value="${code}">${name}</option>`;
  });
  fromLang.value = "en";
  toLang.value = "hi";
  
  // Translate (mock)
  document.querySelector(".translate-btn").addEventListener("click", () => {
    const text = inputText.value.trim();
    if (!text) return alert("Enter text to translate.");
    outputText.value = `(${languages[toLang.value]}): Mock translation of "${text}"`;
  });
  
  // Voice input
  document.getElementById("voiceInput").addEventListener("click", () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = fromLang.value;
    recognition.start();
  
    recognition.onresult = (event) => {
      inputText.value = event.results[0][0].transcript;
    };
  });
  
  // Voice output
  document.getElementById("voiceOutput").addEventListener("click", () => {
    const utterance = new SpeechSynthesisUtterance(outputText.value);
    utterance.lang = toLang.value;
    window.speechSynthesis.speak(utterance);
  });
  
  // OCR with Tesseract.js
  const imageInput = document.getElementById("imageInput");
  const scanStatus = document.getElementById("scanStatus");
  
  imageInput.addEventListener("change", async () => {
    const file = imageInput.files[0];
    if (!file) return;
  
    scanStatus.textContent = "🔍 Scanning image for text...";
    try {
      const result = await Tesseract.recognize(file, 'eng', {
        logger: m => console.log(m)
      });
      inputText.value = result.data.text;
      scanStatus.textContent = "✅ Text extracted!";
    } catch (err) {
      console.error(err);
      scanStatus.textContent = "❌ Failed to extract text.";
    }
  });
  