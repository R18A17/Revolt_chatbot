const startBtn = document.getElementById('start');
const stopBtn = document.getElementById('stop');
const transcriptEl = document.getElementById('transcript');
const responseEl = document.getElementById('response');
const langSelect = document.getElementById('lang');

let recognition;
let isRecording = false;
let currentUtterance;  // Store current utterance

startBtn.onclick = () => {
  if (isRecording) return;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    transcriptEl.innerHTML = '<span style="color:red">Speech Recognition not supported.</span>';
    return;
  }

  recognition = new SpeechRecognition();
  const lang = langSelect.value || 'en-US';
  recognition.lang = lang;
  recognition.interimResults = false;
  recognition.continuous = false;

  recognition.start();
  isRecording = true;
  transcriptEl.innerHTML = '<i>Listening...</i>';

  recognition.onresult = async (event) => {
    const userText = event.results[0][0].transcript;
    transcriptEl.innerHTML = `<b>You:</b> ${userText}`;
    await getBotResponse(userText, lang);
  };

  recognition.onerror = (event) => {
    transcriptEl.innerHTML = `<span style="color:red">Error: ${event.error}</span>`;
    isRecording = false;
  };

  recognition.onend = () => {
    isRecording = false;
  };
};

stopBtn.onclick = () => {
  if (recognition && isRecording) {
    recognition.stop();
    transcriptEl.innerHTML = '<i>Mic stopped.</i>';
    isRecording = false;
  }
  // Also stop any bot speech in progress
  if (speechSynthesis.speaking) {
    speechSynthesis.cancel();
  }
  currentUtterance = null;
};

async function getBotResponse(userText, lang) {
  try {
    const res = await fetch('http://localhost:5000/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userText }),
    });

    if (!res.ok) throw new Error('Network response was not ok');

    const data = await res.json();
    
    // Removed displaying bot text; only speak it
    // responseEl.innerHTML = <b>Bot:</b> ${data.reply};

    const utterance = new SpeechSynthesisUtterance(data.reply);
    utterance.lang = lang;
    speechSynthesis.speak(utterance);
  } catch (error) {
    responseEl.innerHTML = '<b>Bot:</b> Error fetching response.';
    console.error('Error:', error);
  }
}
