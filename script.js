// DOM Elements
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const statusEl = document.getElementById('status');
const transcriptEl = document.getElementById('transcript');
const emotionResultsEl = document.getElementById('emotionResults');
const visualizerEl = document.getElementById('visualizer');
const dominantEmotionEl = document.querySelector('.dominant-emotion .emotion-name');

// Speech recognition setup
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;
let isRecording = false;
let finalTranscript = '';

// Emotion colors mapping
const emotionColors = {
    happy: '#FFD166',
    sad: '#6C8DF7',
    angry: '#EF476F',
    neutral: '#06D6A0',
    fearful: '#A882DD',
    disgust: '#A5DD9B',
    surprised: '#FF9A76'
};

// Initialize speech recognition
function initSpeechRecognition() {
    if (!SpeechRecognition) {
        statusEl.textContent = 'Speech recognition not supported in your browser';
        startBtn.disabled = true;
        return;
    }

    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
        isRecording = true;
        statusEl.textContent = 'Listening... Speak now';
        startBtn.classList.add('recording');
        stopBtn.disabled = false;
    };

    recognition.onend = () => {
        if (isRecording) {
            recognition.start(); // Restart if still recording
        } else {
            statusEl.textContent = 'Ready to record';
            startBtn.classList.remove('recording');
        }
    };

    recognition.onresult = (event) => {
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcript + ' ';
            } else {
                interimTranscript += transcript;
            }
        }
        
        transcriptEl.innerHTML = finalTranscript + '<span style="color:#999">' + interimTranscript + '</span>';
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        statusEl.textContent = `Error: ${event.error}`;
        resetRecording();
    };
}

// Start recording
function startRecording() {
    finalTranscript = '';
    transcriptEl.textContent = '';
    emotionResultsEl.innerHTML = '<div class="instruction">Your emotion analysis will appear here after recording</div>';
    dominantEmotionEl.textContent = '-';
    visualizerEl.innerHTML = '';
    
    try {
        recognition.start();
    } catch (error) {
        statusEl.textContent = `Error: ${error.message}`;
    }
}

// Stop recording and analyze emotions
async function stopRecording() {
    isRecording = false;
    recognition.stop();
    statusEl.textContent = 'Processing...';
    stopBtn.disabled = true;
    
    if (finalTranscript.trim()) {
        await analyzeEmotion(finalTranscript);
    } else {
        statusEl.textContent = 'No speech detected. Try again.';
    }
}

// Reset recording state
function resetRecording() {
    isRecording = false;
    startBtn.classList.remove('recording');
    stopBtn.disabled = true;
}

// Analyze emotion from text (using a mock API - in production, use a real NLP API)
async function analyzeEmotion(text) {
    statusEl.textContent = 'Analyzing emotions...';
    
    try {
        // In a real app, you would call an emotion detection API here
        // For this demo, we'll simulate an API response
        const emotions = simulateEmotionAnalysis(text);
        
        displayEmotionResults(emotions);
        statusEl.textContent = 'Analysis complete';
    } catch (error) {
        console.error('Emotion analysis error:', error);
        statusEl.textContent = 'Error analyzing emotions';
    }
}

// Simulate emotion analysis (replace with real API call in production)
function simulateEmotionAnalysis(text) {
    // This is a mock analysis - in reality, you'd use an NLP API like:
    // IBM Watson Tone Analyzer, Google Cloud Natural Language, etc.
    
    // Count positive and negative words as a simple demo
    const positiveWords = ['happy', 'joy', 'love', 'great', 'wonderful', 'excited'];
    const negativeWords = ['sad', 'angry', 'hate', 'bad', 'terrible', 'awful'];
    
    const positiveCount = positiveWords.filter(word => 
        text.toLowerCase().includes(word)).length;
    const negativeCount = negativeWords.filter(word => 
        text.toLowerCase().includes(word)).length;
    
    // Generate mock emotion scores based on word counts
    const baseScores = {
        happy: Math.min(positiveCount * 0.2, 0.95),
        sad: Math.min(negativeCount * 0.15, 0.9),
        angry: Math.min(negativeCount * 0.1, 0.85),
        neutral: 0.3,
        fearful: Math.min(negativeCount * 0.05, 0.7),
        disgust: Math.min(negativeCount * 0.05, 0.7),
        surprised: 0.1
    };
    
    // Normalize scores to sum to 1
    const total = Object.values(baseScores).reduce((sum, score) => sum + score, 0);
    const normalized = {};
    
    for (const [emotion, score] of Object.entries(baseScores)) {
        normalized[emotion] = score / total;
    }
    
    return normalized;
}

// Display emotion results
function displayEmotionResults(emotions) {
    emotionResultsEl.innerHTML = '';
    visualizerEl.innerHTML = '';
    
    // Sort emotions by score (highest first)
    const sortedEmotions = Object.entries(emotions)
        .sort((a, b) => b[1] - a[1]);
    
    // Find dominant emotion
    const dominantEmotion = sortedEmotions[0][0];
    dominantEmotionEl.textContent = dominantEmotion;
    dominantEmotionEl.className = `emotion-name ${dominantEmotion}`;
    
    // Create visualizer bars
    sortedEmotions.forEach(([emotion, score]) => {
        const percentage = Math.round(score * 100);
        
        // Emotion card
        const emotionCard = document.createElement('div');
        emotionCard.className = `emotion-card ${emotion}`;
        emotionCard.innerHTML = `
            <div class="emotion-name">${emotion}</div>
            <div class="emotion-value">${percentage}%</div>
        `;
        emotionResultsEl.appendChild(emotionCard);
        
        // Visualizer bar
        const visualBar = document.createElement('div');
        visualBar.className = 'visual-bar';
        visualBar.style.width = `${percentage}%`;
        visualBar.style.backgroundColor = emotionColors[emotion];
        visualBar.title = `${emotion} (${percentage}%)`;
        visualizerEl.appendChild(visualBar);
    });
}

// Event listeners
startBtn.addEventListener('click', startRecording);
stopBtn.addEventListener('click', stopRecording);

// Initialize the app
initSpeechRecognition();
