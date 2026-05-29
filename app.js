// Web Audio API Synthesizer for Kids Sound Effects
const SoundEffects = {
  ctx: null,
  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  },
  playClick() {
    this.init();
    if (!state.soundEnabled) return;
    let osc = this.ctx.createOscillator();
    let gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  },
  playCorrect() {
    this.init();
    if (!state.soundEnabled) return;
    let now = this.ctx.currentTime;
    let notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      let osc = this.ctx.createOscillator();
      let gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0.12, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.2);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.25);
    });
  },
  playWrong() {
    this.init();
    if (!state.soundEnabled) return;
    let osc = this.ctx.createOscillator();
    let gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(80, this.ctx.currentTime + 0.25);
    
    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.28);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.28);
  },
  playWin() {
    this.init();
    if (!state.soundEnabled) return;
    let now = this.ctx.currentTime;
    let notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
    let startTimes = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6];
    notes.forEach((freq, idx) => {
      let osc = this.ctx.createOscillator();
      let gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + startTimes[idx]);
      gain.gain.setValueAtTime(0.15, now + startTimes[idx]);
      gain.gain.exponentialRampToValueAtTime(0.01, now + startTimes[idx] + 0.4);
      osc.start(now + startTimes[idx]);
      osc.stop(now + startTimes[idx] + 0.45);
    });
  }
};

// Canvas-based particles Confetti system
const Confetti = {
  canvas: null,
  ctx: null,
  particles: [],
  active: false,
  colors: ['#FFC107', '#FF5722', '#E91E63', '#9C27B0', '#3F51B5', '#00BCD4', '#4CAF50', '#8BC34A', '#F472B6', '#38BDF8'],
  
  init() {
    this.canvas = document.getElementById('confetti-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    window.addEventListener('resize', () => this.resize());
    this.resize();
  },
  
  resize() {
    if (this.canvas) {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }
  },
  
  start() {
    this.init();
    if (!this.canvas) return;
    this.particles = [];
    for (let i = 0; i < 120; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height - this.canvas.height,
        r: Math.random() * 6 + 5,
        d: Math.random() * this.canvas.height,
        color: this.colors[Math.floor(Math.random() * this.colors.length)],
        tilt: Math.random() * 10 - 5,
        tiltAngleIncremental: Math.random() * 0.08 + 0.02,
        tiltAngle: 0,
        speedY: Math.random() * 3 + 3,
        speedX: Math.random() * 3 - 1.5
      });
    }
    if (!this.active) {
      this.active = true;
      this.loop();
    }
  },
  
  loop() {
    if (!this.active) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    let finished = true;
    
    this.particles.forEach((p) => {
      p.tiltAngle += p.tiltAngleIncremental;
      p.y += p.speedY;
      p.x += p.speedX + Math.sin(p.tiltAngle) * 0.5;
      p.tilt = Math.sin(p.tiltAngle) * 6;
      
      if (p.y < this.canvas.height + 20) {
        finished = false;
      }
      
      this.ctx.beginPath();
      this.ctx.lineWidth = p.r / 2;
      this.ctx.strokeStyle = p.color;
      this.ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
      this.ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
      this.ctx.stroke();
    });
    
    if (finished) {
      this.active = false;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    } else {
      requestAnimationFrame(() => this.loop());
    }
  }
};

// Web Speech Recognition API Wrapper for Speaking Practice
const SpeechHelper = {
  recognition: null,
  isSupported: false,
  isListening: false,
  
  init(onResult, onError, onEnd) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      this.isSupported = false;
      return false;
    }
    this.isSupported = true;
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.lang = 'en-US';
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 1;
    
    this.recognition.onresult = (event) => {
      if (event.results && event.results[0]) {
        const text = event.results[0][0].transcript;
        onResult(text);
      }
    };
    
    this.recognition.onerror = (e) => {
      onError(e);
    };
    
    this.recognition.onend = () => {
      this.isListening = false;
      onEnd();
    };
    
    return true;
  },
  
  start() {
    if (this.recognition && !this.isListening) {
      try {
        this.isListening = true;
        this.recognition.start();
        return true;
      } catch (err) {
        console.error("Lỗi bắt đầu ghi âm: ", err);
        this.isListening = false;
        return false;
      }
    }
    return false;
  },
  
  stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }
};

// ==========================================
// VOCABULARY & SENTENCES DATABASE
// ==========================================

// Grade 1 & 2 Data
const VOCABULARY_DATA_G12 = {
  animals: [
    { word: 'Lion', translation: 'Sư tử', emoji: '🦁', phonetic: '/ˈlaɪ.ən/', sentence: 'The lion is the king of the jungle.', vietnameseSentence: 'Sư tử là chúa tể rừng xanh.' },
    { word: 'Tiger', translation: 'Con hổ', emoji: '🐯', phonetic: '/ˈtaɪ.ɡər/', sentence: 'The tiger has orange and black stripes.', vietnameseSentence: 'Con hổ có sọc màu cam và đen.' },
    { word: 'Rabbit', translation: 'Con thỏ', emoji: '🐰', phonetic: '/ˈræb.ɪt/', sentence: 'The rabbit loves eating carrots.', vietnameseSentence: 'Con thỏ thích ăn cà rốt.' },
    { word: 'Elephant', translation: 'Con voi', emoji: '🐘', phonetic: '/ˈel.ɪ.fənt/', sentence: 'The elephant is very big.', vietnameseSentence: 'Con voi rất to lớn.' },
    { word: 'Monkey', translation: 'Con khỉ', emoji: '🐒', phonetic: '/ˈmʌŋ.ki/', sentence: 'The monkey likes to swing on trees.', vietnameseSentence: 'Con khỉ thích đu đưa trên cây.' },
    { word: 'Panda', translation: 'Gấu trúc', emoji: '🐼', phonetic: '/ˈpæn.də/', sentence: 'The panda eats green bamboo.', vietnameseSentence: 'Gấu trúc ăn tre xanh.' },
    { word: 'Turtle', translation: 'Con rùa', emoji: '🐢', phonetic: '/ˈtɜː.tl̩/', sentence: 'The turtle walks very slowly.', vietnameseSentence: 'Con rùa đi bộ rất chậm chạp.' }
  ],
  fruits: [
    { word: 'Apple', translation: 'Quả táo', emoji: '🍎', phonetic: '/ˈæp.l̩/', sentence: 'An apple a day keeps the doctor away.', vietnameseSentence: 'Ăn một quả táo mỗi ngày giúp bé khỏe mạnh.' },
    { word: 'Banana', translation: 'Quả chuối', emoji: '🍌', phonetic: '/bəˈnɑː.nə/', sentence: 'Monkeys love to eat bananas.', vietnameseSentence: 'Khỉ rất thích ăn chuối.' },
    { word: 'Orange', translation: 'Quả cam', emoji: '🍊', phonetic: '/ˈɒr.ɪndʒ/', sentence: 'Orange juice is sweet and delicious.', vietnameseSentence: 'Nước cam ngọt và rất ngon.' },
    { word: 'Mango', translation: 'Quả xoài', emoji: '🥭', phonetic: '/ˈmæŋ.ɡəʊ/', sentence: 'Yellow mangoes are very sweet.', vietnameseSentence: 'Xoài vàng rất là ngọt.' },
    { word: 'Grape', translation: 'Quả nho', emoji: '🍇', phonetic: '/ɡreɪp/', sentence: 'I have a bowl of purple grapes.', vietnameseSentence: 'Tớ có một bát nho tím.' },
    { word: 'Watermelon', translation: 'Quả dưa hấu', emoji: '🍉', phonetic: '/ˈwɔː.təˌmel.ən/', sentence: 'Watermelon is green outside and red inside.', vietnameseSentence: 'Dưa hấu vỏ xanh và ruột đỏ.' }
  ],
  colors: [
    { word: 'Red', translation: 'Màu đỏ', emoji: '🔴', colorHex: '#EF4444', phonetic: '/red/', sentence: 'The fire truck is bright red.', vietnameseSentence: 'Xe cứu hỏa có màu đỏ tươi.' },
    { word: 'Blue', translation: 'Màu xanh dương', emoji: '🔵', colorHex: '#3B82F6', phonetic: '/bluː/', sentence: 'The sky is blue today.', vietnameseSentence: 'Bầu trời hôm nay có màu xanh dương.' },
    { word: 'Green', translation: 'Màu xanh lá', emoji: '🟢', colorHex: '#10B981', phonetic: '/ɡriːn/', sentence: 'Grass is green and soft.', vietnameseSentence: 'Cỏ xanh lá và mềm mại.' },
    { word: 'Yellow', translation: 'Màu vàng', emoji: '🟡', colorHex: '#F59E0B', phonetic: '/ˈjel.əʊ/', sentence: 'The bright sun is yellow.', vietnameseSentence: 'Mặt trời tỏa sáng có màu vàng.' },
    { word: 'Pink', translation: 'Màu hồng', emoji: '🌸', colorHex: '#EC4899', phonetic: '/pɪŋk/', sentence: 'The beautiful flower is pink.', vietnameseSentence: 'Bông hoa xinh đẹp có màu hồng.' },
    { word: 'Orange', translation: 'Màu cam', emoji: '🔸', colorHex: '#F97316', phonetic: '/ˈɒr.ɪndʒ/', sentence: 'Pumpkins are orange.', vietnameseSentence: 'Quả bí ngô có màu cam.' }
  ],
  numbers: [
    { word: 'One', translation: 'Số một', emoji: '1️⃣', val: 1, phonetic: '/wʌn/', sentence: 'I have one nose.', vietnameseSentence: 'Tớ có một chiếc mũi.' },
    { word: 'Five', translation: 'Số năm', emoji: '5️⃣', val: 5, phonetic: '/faɪv/', sentence: 'A hand has five fingers.', vietnameseSentence: 'Một bàn tay có năm ngón tay.' },
    { word: 'Ten', translation: 'Số mười', emoji: '🔟', val: 10, phonetic: '/ten/', sentence: 'I have ten cute toes.', vietnameseSentence: 'Tớ có mười ngón chân đáng yêu.' },
    { word: 'Plus', translation: 'Phép cộng', emoji: '➕', val: '+', phonetic: '/plʌs/', sentence: 'Two plus three is five.', vietnameseSentence: 'Hai cộng ba bằng năm.' },
    { word: 'Minus', translation: 'Phép trừ', emoji: '➖', val: '-', phonetic: '/ˈmaɪ.nəs/', sentence: 'Five minus two is three.', vietnameseSentence: 'Năm trừ hai bằng ba.' }
  ],
  greetings: [
    { word: 'Hello', translation: 'Xin chào', emoji: '👋', phonetic: '/heˈləʊ/', sentence: 'Hello, nice to meet you!', vietnameseSentence: 'Xin chào, rất vui được gặp bạn!' },
    { word: 'Goodbye', translation: 'Tạm biệt', emoji: '🙋', phonetic: '/ˌɡʊdˈbaɪ/', sentence: 'Goodbye, see you tomorrow!', vietnameseSentence: 'Tạm biệt, hẹn gặp lại ngày mai!' },
    { word: 'Stand up', translation: 'Đứng lên', emoji: '🧍', phonetic: '/stænd ʌp/', sentence: 'Please stand up quietly.', vietnameseSentence: 'Các em hãy đứng lên một cách trật tự nhé.' },
    { word: 'Sit down', translation: 'Ngồi xuống', emoji: '🧎', phonetic: '/sɪt daʊn/', sentence: 'Please sit down on your chair.', vietnameseSentence: 'Mời em ngồi xuống ghế.' },
    { word: 'Open book', translation: 'Mở sách', emoji: '📖', phonetic: '/ˈəʊ.pən bʊk/', sentence: 'Open your English book, please.', vietnameseSentence: 'Vui lòng mở sách Tiếng Anh ra nhé.' }
  ]
};

// Grade 3 Data (Focus on speaking, sentence structures)
const VOCABULARY_DATA_G3 = {
  family: [
    { word: 'Father', translation: 'Bố', emoji: '👨', phonetic: '/ˈfɑː.ðər/', sentence: 'My father is a kind doctor.', vietnameseSentence: 'Bố của tớ là một bác sĩ nhân hậu.' },
    { word: 'Mother', translation: 'Mẹ', emoji: '👩', phonetic: '/ˈmʌð.ər/', sentence: 'My mother cooks delicious food.', vietnameseSentence: 'Mẹ của tớ nấu đồ ăn rất ngon.' },
    { word: 'Brother', translation: 'Anh/Em trai', emoji: '👦', phonetic: '/ˈbrʌð.ər/', sentence: 'My brother likes playing football.', vietnameseSentence: 'Anh trai tớ thích đá bóng.' },
    { word: 'Sister', translation: 'Chị/Em gái', emoji: '👧', phonetic: '/ˈsɪs.tər/', sentence: 'My sister has beautiful long hair.', vietnameseSentence: 'Chị gái tớ có mái tóc dài xinh đẹp.' },
    { word: 'Grandfather', translation: 'Ông', emoji: '👴', phonetic: '/ˈɡræn.fɑː.ðər/', sentence: 'My grandfather tells funny stories.', vietnameseSentence: 'Ông của tớ kể những câu chuyện rất vui.' },
    { word: 'Grandmother', translation: 'Bà', emoji: '👵', phonetic: '/ˈræn.mʌð.ər/', sentence: 'My grandmother gives me sweet candies.', vietnameseSentence: 'Bà của tớ cho tớ những viên kẹo ngọt.' }
  ],
  school: [
    { word: 'Pencil', translation: 'Bút chì', emoji: '✏️', phonetic: '/ˈpen.səl/', sentence: 'I draw a cat with my pencil.', vietnameseSentence: 'Tớ vẽ một con mèo bằng bút chì của mình.' },
    { word: 'Book', translation: 'Sách', emoji: '📚', phonetic: '/bʊk/', sentence: 'I like reading this comic book.', vietnameseSentence: 'Tớ thích đọc cuốn sách truyện tranh này.' },
    { word: 'Ruler', translation: 'Thước kẻ', emoji: '📏', phonetic: '/ˈruː.lər/', sentence: 'Use a ruler to draw straight lines.', vietnameseSentence: 'Hãy dùng thước kẻ để vẽ những đường thẳng.' },
    { word: 'Bag', translation: 'Cặp sách', emoji: '🎒', phonetic: '/bæɡ/', sentence: 'My school bag is blue and heavy.', vietnameseSentence: 'Chiếc cặp sách của tớ màu xanh dương và khá nặng.' },
    { word: 'Pen', translation: 'Bút mực', emoji: '✒️', phonetic: '/pen/', sentence: 'Write your name with a blue pen.', vietnameseSentence: 'Hãy viết tên của bạn bằng bút mực màu xanh.' }
  ],
  hobbies: [
    { word: 'Football', translation: 'Bóng đá', emoji: '⚽', phonetic: '/ˈfʊt.bɔːl/', sentence: 'The boys play football after school.', vietnameseSentence: 'Các bạn nam đá bóng sau giờ học.' },
    { word: 'Bicycle', translation: 'Xe đạp', emoji: '🚲', phonetic: '/ˈbaɪ.sɪ.kl̩/', sentence: 'I ride my bicycle in the park.', vietnameseSentence: 'Tớ đi xe đạp trong công viên.' },
    { word: 'Drawing', translation: 'Vẽ tranh', emoji: '🎨', phonetic: '/ˈdrɔː.ɪŋ/', sentence: 'Drawing makes me feel very happy.', vietnameseSentence: 'Vẽ tranh làm tớ cảm thấy rất hạnh phúc.' },
    { word: 'Singing', translation: 'Ca hát', emoji: '🎤', phonetic: '/ˈsɪŋ.ɪŋ/', sentence: 'She loves singing sweet songs.', vietnameseSentence: 'Cô ấy yêu ca hát những bài hát ngọt ngào.' },
    { word: 'Chess', translation: 'Chơi cờ', emoji: '♟️', phonetic: '/tʃes/', sentence: 'I play chess with my father.', vietnameseSentence: 'Tớ chơi cờ cùng với bố.' }
  ],
  weather: [
    { word: 'Sunny', translation: 'Nắng', emoji: '☀️', phonetic: '/ˈsʌn.i/', sentence: 'It is a beautiful sunny day.', vietnameseSentence: 'Hôm nay là một ngày nắng đẹp trời.' },
    { word: 'Rainy', translation: 'Mưa', emoji: '🌧️', phonetic: '/ˈreɪ.ni/', sentence: 'We need umbrellas on a rainy day.', vietnameseSentence: 'Chúng ta cần ô vào ngày mưa.' },
    { word: 'Windy', translation: 'Gió', emoji: '💨', phonetic: '/ˈwɪn.di/', sentence: 'It is very windy outside.', vietnameseSentence: 'Ngoài trời đang rất nhiều gió.' },
    { word: 'Cloudy', translation: 'Mây mù', emoji: '☁️', phonetic: '/ˈklaʊ.di/', sentence: 'The sky is cloudy and dark.', vietnameseSentence: 'Bầu trời nhiều mây và tối tăm.' },
    { word: 'Coat', translation: 'Áo khoác', emoji: '🧥', phonetic: '/kəʊt/', sentence: 'Wear a warm coat in winter.', vietnameseSentence: 'Hãy mặc áo khoác ấm vào mùa đông.' }
  ]
};

// Global App State
const state = {
  soundEnabled: true,
  stars: 0,
  currentGrade: 'g12', // 'g12' for Grade 1-2, 'g3' for Grade 3
  currentCategory: 'animals',
  
  // Flashcard State
  flashcardIndex: 0,
  
  // Quiz State
  quizQuestions: [],
  quizIndex: 0,
  quizScore: 0,
  quizAnswersSelected: false,
  
  // Match Game State
  matchCards: [],
  matchSelected: [],
  matchMatches: 0,
  
  // Word Builder State
  builderWords: [],
  builderIndex: 0,
  builderTargetWord: '',
  builderCurrentSpelling: [],
  builderScrambled: [],

  // Sentence Builder State (Grade 3 writing)
  sentenceList: [],
  sentenceIndex: 0,
  sentenceTargetString: '',
  sentenceTargetWords: [], // split array
  sentenceSelectedIndices: [], // indexes of sentenceScrambled selected
  sentenceScrambled: [], // shuffled words + punctuation

  // Speaking Practice State (Grade 3 speaking)
  speakingList: [],
  speakingIndex: 0,
  speakingTargetSentence: '',
  speakingTargetTranslation: '',
  speakingSpeechResult: '',
  speakingCorrect: false
};

// Helper: Get vocabulary dataset based on active grade
function getVocabularyDataset() {
  return state.currentGrade === 'g3' ? VOCABULARY_DATA_G3 : VOCABULARY_DATA_G12;
}

// Main Entry Point
document.addEventListener('DOMContentLoaded', () => {
  // Init state from LocalStorage
  if (localStorage.getItem('stars')) {
    state.stars = parseInt(localStorage.getItem('stars'));
  }
  if (localStorage.getItem('soundEnabled') !== null) {
    state.soundEnabled = localStorage.getItem('soundEnabled') === 'true';
  }
  if (localStorage.getItem('currentGrade')) {
    state.currentGrade = localStorage.getItem('currentGrade');
  }
  
  updateHeaderUI();
  generateBubblesBackground();
  
  // Bind Header Controls
  document.getElementById('sound-toggle').addEventListener('click', toggleSound);
  document.getElementById('reset-progress').addEventListener('click', resetProgress);
  
  // Bind Grade Selection Tabs
  const tabG12 = document.getElementById('tab-grade-12');
  const tabG3 = document.getElementById('tab-grade-3');
  
  if (tabG12 && tabG3) {
    tabG12.addEventListener('click', () => switchGrade('g12'));
    tabG3.addEventListener('click', () => switchGrade('g3'));
  }
  
  // Apply visual switch
  applyGradeUIElements();
  
  // Bind Dashboard Buttons (Using event delegation because topics grids are hidden/shown)
  document.addEventListener('click', (e) => {
    const cardBtn = e.target.closest('.topic-card');
    if (cardBtn) {
      const topic = cardBtn.dataset.topic;
      const mode = cardBtn.dataset.mode;
      state.currentCategory = topic;
      SoundEffects.playClick();
      startLearningMode(mode);
    }
  });
  
  // Bind Back to Dashboard Buttons
  document.querySelectorAll('.back-to-dashboard').forEach(btn => {
    btn.addEventListener('click', () => {
      SoundEffects.playClick();
      // Make sure speech is cancelled if they leave during speaking test
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      SpeechHelper.stop();
      showScreen('dashboard-screen');
    });
  });

  // Init Speech Recognition API
  initSpeechRecognitionEngine();
});

// Manage Screen Switches (SPA styling)
function showScreen(screenId) {
  const screens = ['dashboard-screen', 'flashcard-screen', 'quiz-screen', 'match-screen', 'builder-screen', 'sentence-screen', 'speaking-screen', 'certificate-screen'];
  screens.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      if (id === screenId) {
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }
    }
  });
}

function updateHeaderUI() {
  document.getElementById('star-count').innerText = state.stars;
  
  const soundIcon = document.getElementById('sound-icon');
  if (state.soundEnabled) {
    soundIcon.innerHTML = '🔊';
  } else {
    soundIcon.innerHTML = '🔇';
  }
}

function toggleSound() {
  state.soundEnabled = !state.soundEnabled;
  localStorage.setItem('soundEnabled', state.soundEnabled);
  updateHeaderUI();
  SoundEffects.playClick();
}

function resetProgress() {
  if (confirm('Bé có muốn làm lại từ đầu không? Số sao sẽ về 0.')) {
    state.stars = 0;
    localStorage.setItem('stars', 0);
    updateHeaderUI();
    SoundEffects.playClick();
  }
}

function addStars(count) {
  state.stars += count;
  localStorage.setItem('stars', state.stars);
  updateHeaderUI();
  
  // Star particle pop effect
  const starDisplay = document.getElementById('star-display');
  starDisplay.classList.add('star-pulse');
  setTimeout(() => {
    starDisplay.classList.remove('star-pulse');
  }, 1000);
}

// Generate Float Bubbles background for rich aesthetics
function generateBubblesBackground() {
  const container = document.getElementById('bubbles');
  if (!container) return;
  container.innerHTML = '';
  
  for (let i = 0; i < 20; i++) {
    const bubble = document.createElement('div');
    bubble.classList.add('bubble');
    const size = Math.random() * 60 + 20;
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.left = `${Math.random() * 100}vw`;
    bubble.style.animationDelay = `${Math.random() * 8}s`;
    bubble.style.animationDuration = `${Math.random() * 10 + 8}s`;
    container.appendChild(bubble);
  }
}

// Text to Speech Voice Pronounce
function speakWord(text) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    
    // Check if speaking a long sentence (G3) or a short word (G12) to calibrate rate
    const isSentence = text.trim().split(' ').length > 1;
    utterance.rate = isSentence ? 0.75 : 0.8; 
    utterance.pitch = 1.2; // Cheerful high pitch
    
    // Choose clean English voice if available
    const voices = window.speechSynthesis.getVoices();
    const googleVoice = voices.find(v => v.name.includes('Google US English') || v.lang === 'en-US');
    if (googleVoice) {
      utterance.voice = googleVoice;
    }
    
    window.speechSynthesis.speak(utterance);
  }
}

// Switch Grade Logic
function switchGrade(grade) {
  state.currentGrade = grade;
  localStorage.setItem('currentGrade', grade);
  SoundEffects.playClick();
  applyGradeUIElements();
}

function applyGradeUIElements() {
  const tabG12 = document.getElementById('tab-grade-12');
  const tabG3 = document.getElementById('tab-grade-3');
  const gridG12 = document.getElementById('topics-grid-g12');
  const gridG3 = document.getElementById('topics-grid-g3');
  
  if (state.currentGrade === 'g12') {
    // Style tabs
    tabG12.className = "px-6 py-3 rounded-full font-bold text-lg transition duration-200 bg-indigo-600 text-white shadow-md active:scale-95";
    tabG3.className = "px-6 py-3 rounded-full font-bold text-lg transition duration-200 bg-white text-indigo-600 hover:bg-indigo-50 shadow-sm border border-indigo-200 active:scale-95";
    // Show grid
    gridG12.classList.remove('hidden');
    gridG3.classList.add('hidden');
  } else {
    // Style tabs
    tabG12.className = "px-6 py-3 rounded-full font-bold text-lg transition duration-200 bg-white text-indigo-600 hover:bg-indigo-50 shadow-sm border border-indigo-200 active:scale-95";
    tabG3.className = "px-6 py-3 rounded-full font-bold text-lg transition duration-200 bg-indigo-600 text-white shadow-md active:scale-95";
    // Show grid
    gridG12.classList.add('hidden');
    gridG3.classList.remove('hidden');
  }
}

// Start Learning Mode
function startLearningMode(mode) {
  if (mode === 'flashcard') {
    state.flashcardIndex = 0;
    loadFlashcard();
    showScreen('flashcard-screen');
  } else if (mode === 'quiz') {
    setupQuiz();
    showScreen('quiz-screen');
  } else if (mode === 'match') {
    setupMatchGame();
    showScreen('match-screen');
  } else if (mode === 'builder') {
    setupWordBuilder();
    showScreen('builder-screen');
  } else if (mode === 'sentence') {
    setupSentenceBuilder();
    showScreen('sentence-screen');
  } else if (mode === 'speaking') {
    setupSpeakingPractice();
    showScreen('speaking-screen');
  }
}

/* ==========================================================================
   FLASHCARD MODE LOGIC
   ========================================================================== */
function loadFlashcard() {
  const dataset = getVocabularyDataset();
  const categoryData = dataset[state.currentCategory];
  const item = categoryData[state.flashcardIndex];
  
  const innerCard = document.getElementById('fc-inner');
  const frontEmoji = document.getElementById('fc-front-emoji');
  const frontWord = document.getElementById('fc-front-word');
  const frontPhonetic = document.getElementById('fc-front-phonetic');
  
  const backWord = document.getElementById('fc-back-word');
  const backMeaning = document.getElementById('fc-back-meaning');
  const backSentence = document.getElementById('fc-back-sentence');
  const backSentenceViet = document.getElementById('fc-back-sentence-viet');
  
  // Set content
  frontEmoji.innerText = item.emoji;
  frontWord.innerText = item.word;
  frontPhonetic.innerText = item.phonetic || '';
  
  backWord.innerText = item.word;
  backMeaning.innerText = item.translation;
  
  // Display English sentence
  backSentence.innerText = item.sentence || '';
  
  // If sentence has a vietnamese translation, display it.
  if (backSentenceViet) {
    backSentenceViet.innerText = item.vietnameseSentence || '';
  }
  
  // Reset flipped status
  innerCard.classList.remove('flipped');
  
  // Set card color styling depending on category
  const cardFront = document.getElementById('fc-front');
  const cardBack = document.getElementById('fc-back');
  
  cardFront.className = "flashcard-front bg-white border-4 border-yellow-300";
  cardBack.className = "flashcard-back bg-yellow-50 border-4 border-yellow-400";
  
  if (state.currentCategory === 'colors') {
    cardFront.style.borderLeftColor = item.colorHex;
    cardFront.style.borderRightColor = item.colorHex;
  } else {
    cardFront.style.borderColor = '';
  }
  
  // Update footer navigation counter
  document.getElementById('fc-progress-text').innerText = `${state.flashcardIndex + 1} / ${categoryData.length}`;
  
  // Speak the word (or speak sentence if Lớp 3)
  if (state.currentGrade === 'g3') {
    speakWord(`${item.word}. ${item.sentence}`);
  } else {
    speakWord(item.word);
  }
  
  // Setup control listeners
  innerCard.onclick = () => {
    innerCard.classList.toggle('flipped');
    SoundEffects.playClick();
  };
  
  document.getElementById('fc-speak-front').onclick = (e) => {
    e.stopPropagation();
    speakWord(item.word);
  };
  
  document.getElementById('fc-speak-back').onclick = (e) => {
    e.stopPropagation();
    if (state.currentGrade === 'g3') {
      speakWord(item.sentence);
    } else {
      speakWord(item.word);
    }
  };
  
  document.getElementById('fc-prev').onclick = () => {
    if (state.flashcardIndex > 0) {
      state.flashcardIndex--;
      SoundEffects.playClick();
      loadFlashcard();
    }
  };
  
  document.getElementById('fc-next').onclick = () => {
    if (state.flashcardIndex < categoryData.length - 1) {
      state.flashcardIndex++;
      SoundEffects.playClick();
      loadFlashcard();
    } else {
      // Finished all cards, award stars!
      addStars(5);
      SoundEffects.playWin();
      Confetti.start();
      alert("Tuyệt vời! Bé đã học xong tất cả thẻ học ở chủ đề này. Tặng bé 5 ⭐ nhé!");
      showScreen('dashboard-screen');
    }
  };
}

/* ==========================================================================
   QUIZ / PRACTICE MODE LOGIC
   ========================================================================== */
function setupQuiz() {
  const dataset = getVocabularyDataset();
  const categoryData = dataset[state.currentCategory];
  state.quizQuestions = [];
  state.quizIndex = 0;
  state.quizScore = 0;
  state.quizAnswersSelected = false;
  
  // Shuffle items and pick 5
  const shuffledItems = [...categoryData].sort(() => Math.random() - 0.5);
  const quizItems = shuffledItems.slice(0, Math.min(5, categoryData.length));
  
  quizItems.forEach((item, index) => {
    // 0: Emoji -> English Word, 1: English Word -> Emoji, 2: Audio -> English Word, 3: True/False image match
    const type = Math.floor(Math.random() * 4);
    
    const distractors = categoryData
      .filter(i => i.word !== item.word)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
      
    const options = [...distractors, item].sort(() => Math.random() - 0.5);
    
    let questionText = '';
    let promptEl = ''; // HTML/Emoji content to display
    let listenButton = false;
    let answerText = item.word;
    
    if (type === 0) {
      questionText = "Bé hãy chọn từ Tiếng Anh đúng với hình này nhé:";
      promptEl = `<span class="text-7xl block select-none mb-2">${item.emoji}</span><span class="text-2xl text-purple-600">(${item.translation})</span>`;
    } else if (type === 1) {
      questionText = "Bé chọn hình ảnh thích hợp cho từ sau:";
      promptEl = `<span class="text-5xl font-bold text-indigo-600 block mb-2">${item.word}</span><span class="text-xl text-gray-500">(${item.phonetic || ''})</span>`;
      answerText = item.emoji;
    } else if (type === 2) {
      questionText = "Bé nghe loa và chọn đáp án chính xác nhé:";
      promptEl = `
        <button id="quiz-listen-prompt" class="w-24 h-24 bg-indigo-100 hover:bg-indigo-200 border-4 border-indigo-300 rounded-full flex justify-center items-center text-4xl shadow-md transition transform active:scale-95">
          🔊
        </button>
      `;
      listenButton = true;
    } else { // Type 3: True/False image match
      const isTrue = Math.random() > 0.5;
      let checkWord = item.word;
      let checkTranslation = item.translation;
      if (!isTrue) {
        const wrong = distractors[0] || item;
        checkWord = wrong.word;
        checkTranslation = wrong.translation;
      }
      questionText = "Đúng hay Sai? Hình này có phải là:";
      promptEl = `
        <span class="text-7xl block select-none mb-2">${item.emoji}</span>
        <span class="text-4xl font-bold text-red-500 block mb-1">${checkWord}</span>
        <span class="text-xl text-gray-600">(${checkTranslation})</span>
      `;
      answerText = isTrue ? 'Đúng' : 'Sai';
    }
    
    state.quizQuestions.push({
      item,
      type,
      questionText,
      promptEl,
      options: type === 3 ? ['Đúng', 'Sai'] : options.map(o => type === 1 ? o.emoji : o.word),
      correctAnswer: answerText,
      listenButton
    });
  });
  
  loadQuizQuestion();
}

function loadQuizQuestion() {
  state.quizAnswersSelected = false;
  const q = state.quizQuestions[state.quizIndex];
  
  // Progress Bar
  const progressPercent = ((state.quizIndex) / state.quizQuestions.length) * 100;
  document.getElementById('quiz-progress-bar').style.width = `${progressPercent}%`;
  document.getElementById('quiz-progress-text').innerText = `Câu ${state.quizIndex + 1} / ${state.quizQuestions.length}`;
  
  // UI Display
  document.getElementById('quiz-title').innerText = q.questionText;
  
  const promptContainer = document.getElementById('quiz-prompt-container');
  promptContainer.innerHTML = q.promptEl;
  promptContainer.className = "flex flex-col items-center justify-center my-6 py-4 px-8 bg-white rounded-2xl border-4 border-dashed border-indigo-200 shadow-sm relative";
  
  // Reset container animation
  promptContainer.classList.remove('animate-correct-bounce', 'animate-shake');
  
  if (q.listenButton) {
    document.getElementById('quiz-listen-prompt').onclick = () => {
      speakWord(q.item.word);
    };
    // Auto speak
    speakWord(q.item.word);
  }
  
  // Render options
  const optionsGrid = document.getElementById('quiz-options');
  optionsGrid.innerHTML = '';
  
  // Grid layout depending on option counts (True/False vs Multiple Choice)
  if (q.options.length === 2) {
    optionsGrid.className = "grid grid-cols-2 gap-6 max-w-md mx-auto";
  } else {
    optionsGrid.className = "grid grid-cols-2 gap-4 max-w-xl mx-auto";
  }
  
  const optionColors = [
    'border-pink-300 hover:bg-pink-50 text-pink-700 bg-pink-100/50',
    'border-blue-300 hover:bg-blue-50 text-blue-700 bg-blue-100/50',
    'border-green-300 hover:bg-green-50 text-green-700 bg-green-100/50',
    'border-yellow-300 hover:bg-yellow-50 text-yellow-700 bg-yellow-100/50'
  ];
  
  q.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.innerHTML = `<span class="text-3xl select-none font-bold">${opt}</span>`;
    
    // Large font size for Emojis
    if (q.type === 1) {
      btn.innerHTML = `<span class="text-6xl select-none">${opt}</span>`;
    }
    
    const colorStyle = optionColors[idx % optionColors.length];
    btn.className = `py-4 px-6 border-4 rounded-2xl flex flex-col justify-center items-center shadow-md transition transform hover:-translate-y-1 active:translate-y-0 ${colorStyle}`;
    
    btn.onclick = () => {
      if (state.quizAnswersSelected) return;
      checkQuizAnswer(btn, opt, q.correctAnswer);
    };
    
    optionsGrid.appendChild(btn);
  });
}

function checkQuizAnswer(selectedBtn, selectedValue, correctValue) {
  state.quizAnswersSelected = true;
  const isCorrect = selectedValue === correctValue;
  const promptContainer = document.getElementById('quiz-prompt-container');
  const optionsGrid = document.getElementById('quiz-options');
  
  if (isCorrect) {
    state.quizScore++;
    SoundEffects.playCorrect();
    promptContainer.classList.add('animate-correct-bounce');
    selectedBtn.classList.remove('border-pink-300', 'border-blue-300', 'border-green-300', 'border-yellow-300');
    selectedBtn.classList.add('bg-green-500', 'text-white', 'border-green-600');
    
    // Add simple green checkmark icon inside btn
    const checkBadge = document.createElement('div');
    checkBadge.className = "absolute -top-3 -right-3 w-8 h-8 bg-green-600 border-2 border-white rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg animate-bounce";
    checkBadge.innerText = "✓";
    selectedBtn.appendChild(checkBadge);
    
    addStars(2);
  } else {
    SoundEffects.playWrong();
    promptContainer.classList.add('animate-shake');
    selectedBtn.classList.remove('border-pink-300', 'border-blue-300', 'border-green-300', 'border-yellow-300');
    selectedBtn.classList.add('bg-red-500', 'text-white', 'border-red-600', 'animate-shake');
    
    // Find and highlight correct answer
    Array.from(optionsGrid.children).forEach(btn => {
      const text = btn.innerText.trim();
      const isCorrectBtn = (btn.querySelector('span') && btn.querySelector('span').innerText === correctValue) || text === correctValue;
      if (isCorrectBtn) {
        btn.classList.remove('border-pink-300', 'border-blue-300', 'border-green-300', 'border-yellow-300');
        btn.classList.add('bg-green-500', 'text-white', 'border-green-600', 'scale-105');
      }
    });
  }
  
  setTimeout(() => {
    const q = state.quizQuestions[state.quizIndex];
    speakWord(q.item.word);
  }, 350);
  
  // Transition to next question
  setTimeout(() => {
    state.quizIndex++;
    if (state.quizIndex < state.quizQuestions.length) {
      loadQuizQuestion();
    } else {
      finishQuiz();
    }
  }, 2200);
}

function finishQuiz() {
  document.getElementById('quiz-progress-bar').style.width = '100%';
  
  SoundEffects.playWin();
  Confetti.start();
  
  // Award bonus stars based on score
  const bonus = state.quizScore * 3;
  addStars(bonus);
  
  // Show certificate details
  const nameInputSection = document.getElementById('cert-name-input-section');
  nameInputSection.classList.remove('hidden');
  
  const congratsMsg = document.getElementById('cert-congrats-message');
  congratsMsg.innerHTML = `Bé đã hoàn thành xuất sắc bài kiểm tra chủ đề <span class="text-indigo-600 font-bold">${state.currentCategory.toUpperCase()}</span> với số điểm <span class="text-pink-500 font-bold text-2xl">${state.quizScore}/5</span>! Nhận được <span class="text-yellow-500 font-bold">${bonus} ⭐</span>.`;
  
  // Show certificate input screen
  showScreen('certificate-screen');
  
  // Prepare certificate generation action
  document.getElementById('generate-cert-btn').onclick = () => {
    const kidName = document.getElementById('kid-name-input').value.trim() || "Bé Học Giỏi";
    generateCertificate(kidName);
  };
}

/* ==========================================================================
   MATCH GAME (CONCENTRATION MEMORY)
   ========================================================================== */
function setupMatchGame() {
  const dataset = getVocabularyDataset();
  const categoryData = dataset[state.currentCategory];
  state.matchSelected = [];
  state.matchMatches = 0;
  
  // Choose 4 random items
  const items = [...categoryData].sort(() => Math.random() - 0.5).slice(0, 4);
  
  // Create 8 cards
  const cards = [];
  items.forEach(item => {
    cards.push({ id: item.word, type: 'text', val: item.word, display: item.word });
    // Use emoji for colors/fruits/animals, translation for greetings/numbers/family/school
    const isVisualEmoji = ['animals', 'fruits', 'colors', 'hobbies'].includes(state.currentCategory);
    const visual = isVisualEmoji ? item.emoji : item.translation;
    cards.push({ id: item.word, type: 'visual', val: item.word, display: visual });
  });
  
  // Shuffle cards
  state.matchCards = cards.sort(() => Math.random() - 0.5);
  
  // Render match grid
  const grid = document.getElementById('match-grid');
  grid.innerHTML = '';
  
  state.matchCards.forEach((card, index) => {
    const cardEl = document.createElement('div');
    cardEl.className = "h-28 perspective-1000";
    
    cardEl.innerHTML = `
      <div class="card-match-inner w-full h-full border-4 border-yellow-300 rounded-2xl bg-white shadow-md flex justify-center items-center" data-index="${index}">
        <div class="card-match-front absolute inset-0 bg-yellow-100 text-yellow-500 text-5xl font-bold flex justify-center items-center rounded-xl select-none">
          ❓
        </div>
        <div class="card-match-back absolute inset-0 bg-white text-indigo-700 flex flex-col justify-center items-center rounded-xl p-2 select-none">
          <span class="${card.type === 'visual' && card.display.length < 4 ? 'text-5xl' : 'text-xl font-bold text-center'}">${card.display}</span>
        </div>
      </div>
    `;
    
    const inner = cardEl.querySelector('.card-match-inner');
    inner.onclick = () => {
      if (inner.classList.contains('flipped') || state.matchSelected.length >= 2) return;
      
      SoundEffects.playClick();
      inner.classList.add('flipped');
      state.matchSelected.push({ card, inner });
      
      if (state.matchSelected.length === 2) {
        checkMatch();
      }
    };
    
    grid.appendChild(cardEl);
  });
}

function checkMatch() {
  const [first, second] = state.matchSelected;
  const isMatch = first.card.id === second.card.id;
  
  if (isMatch) {
    state.matchMatches++;
    SoundEffects.playCorrect();
    speakWord(first.card.id);
    
    setTimeout(() => {
      first.inner.style.borderColor = '#10B981';
      second.inner.style.borderColor = '#10B981';
      first.inner.querySelector('.card-match-back').classList.add('bg-green-50');
      second.inner.querySelector('.card-match-back').classList.add('bg-green-50');
      
      [first.inner, second.inner].forEach(inner => {
        const check = document.createElement('div');
        check.className = "absolute top-1 right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md";
        check.innerText = "✓";
        inner.appendChild(check);
      });
      
      state.matchSelected = [];
      addStars(3);
      
      if (state.matchMatches === 4) {
        // Complete Game!
        setTimeout(() => {
          SoundEffects.playWin();
          Confetti.start();
          addStars(5);
          alert("Tuyệt vời! Bé đã ghép đúng tất cả các cặp! Tặng bé thêm 5 ⭐ nhé.");
          showScreen('dashboard-screen');
        }, 1200);
      }
    }, 400);
  } else {
    // No match, flip them back
    SoundEffects.playWrong();
    setTimeout(() => {
      first.inner.classList.add('animate-shake');
      second.inner.classList.add('animate-shake');
    }, 150);
    
    setTimeout(() => {
      first.inner.classList.remove('flipped', 'animate-shake');
      second.inner.classList.remove('flipped', 'animate-shake');
      state.matchSelected = [];
    }, 1000);
  }
}

/* ==========================================================================
   WORD BUILDER MODE LOGIC (SPELLING)
   ========================================================================== */
function setupWordBuilder() {
  const dataset = getVocabularyDataset();
  const categoryData = dataset[state.currentCategory];
  state.builderIndex = 0;
  
  state.builderWords = [...categoryData]
    .filter(i => i.word.length >= 3 && i.word.length <= 8)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);
    
  if (state.builderWords.length === 0) {
    state.builderWords = categoryData.slice(0, 3);
  }
  
  loadBuilderWord();
}

function loadBuilderWord() {
  const wordObj = state.builderWords[state.builderIndex];
  state.builderTargetWord = wordObj.word.toUpperCase();
  state.builderCurrentSpelling = [];
  
  document.getElementById('wb-progress-text').innerText = `Từ ${state.builderIndex + 1} / ${state.builderWords.length}`;
  
  document.getElementById('wb-emoji').innerText = wordObj.emoji;
  document.getElementById('wb-translation').innerText = `(${wordObj.translation})`;
  
  speakWord(wordObj.word);
  
  document.getElementById('wb-speak-btn').onclick = () => {
    speakWord(wordObj.word);
  };
  
  const letters = state.builderTargetWord.split('');
  if (letters.length <= 3) {
    const extraOptions = "ABCDEFGHJKLMNOPQRSTUVWXYZ";
    for(let i=0; i<2; i++) {
      letters.push(extraOptions[Math.floor(Math.random() * extraOptions.length)]);
    }
  }
  
  state.builderScrambled = letters.sort(() => Math.random() - 0.5);
  
  renderBuilderSpelling();
  renderBuilderLetters();
}

function renderBuilderSpelling() {
  const container = document.getElementById('wb-spelling-slots');
  container.innerHTML = '';
  
  const targetLetters = state.builderTargetWord.split('');
  
  targetLetters.forEach((letter, index) => {
    const slot = document.createElement('div');
    const spelledVal = state.builderCurrentSpelling[index];
    
    slot.className = "w-14 h-14 border-4 border-dashed border-indigo-300 rounded-xl bg-white/60 flex justify-center items-center text-3xl font-bold shadow-inner select-none";
    
    if (spelledVal) {
      slot.className = "w-14 h-14 border-4 border-indigo-500 rounded-xl bg-indigo-50 text-indigo-700 flex justify-center items-center text-3xl font-bold shadow-md transform scale-105 transition duration-150 select-none";
      slot.innerText = spelledVal.letter;
      
      slot.onclick = () => {
        SoundEffects.playClick();
        state.builderCurrentSpelling.splice(index, 1);
        renderBuilderSpelling();
        renderBuilderLetters();
      };
    } else {
      slot.innerText = '';
    }
    
    container.appendChild(slot);
  });
}

function renderBuilderLetters() {
  const container = document.getElementById('wb-letters-pool');
  container.innerHTML = '';
  
  const usedIndices = state.builderCurrentSpelling.map(s => s.originalIndex);
  
  state.builderScrambled.forEach((letter, index) => {
    const isUsed = usedIndices.includes(index);
    
    const tile = document.createElement('button');
    tile.innerText = letter;
    
    if (isUsed) {
      tile.className = "w-12 h-12 bg-gray-200 border-4 border-gray-300 text-gray-400 rounded-xl font-bold text-2xl shadow-inner cursor-not-allowed select-none opacity-40";
      tile.disabled = true;
    } else {
      tile.className = "w-12 h-12 bg-white hover:bg-yellow-50 border-4 border-yellow-400 text-yellow-600 rounded-xl font-bold text-2xl shadow-md transition transform hover:-translate-y-1 active:translate-y-0 select-none";
      tile.onclick = () => {
        SoundEffects.playClick();
        if (state.builderCurrentSpelling.length < state.builderTargetWord.length) {
          state.builderCurrentSpelling.push({ letter, originalIndex: index });
          renderBuilderSpelling();
          renderBuilderLetters();
          checkBuilderWord();
        }
      };
    }
    
    container.appendChild(tile);
  });
}

function checkBuilderWord() {
  if (state.builderCurrentSpelling.length === state.builderTargetWord.length) {
    const spelledWord = state.builderCurrentSpelling.map(s => s.letter).join('');
    
    if (spelledWord === state.builderTargetWord) {
      SoundEffects.playCorrect();
      Confetti.start();
      addStars(3);
      
      const slots = document.getElementById('wb-spelling-slots').children;
      Array.from(slots).forEach(slot => {
        slot.className = "w-14 h-14 border-4 border-green-500 rounded-xl bg-green-500 text-white flex justify-center items-center text-3xl font-bold shadow-md animate-correct-bounce select-none";
      });
      
      setTimeout(() => {
        state.builderIndex++;
        if (state.builderIndex < state.builderWords.length) {
          loadBuilderWord();
        } else {
          SoundEffects.playWin();
          Confetti.start();
          addStars(5);
          alert("Tuyệt vời! Bé đã đánh vần đúng toàn bộ các từ. Tặng bé 5 ⭐ nữa nhé!");
          showScreen('dashboard-screen');
        }
      }, 1800);
    } else {
      SoundEffects.playWrong();
      const slots = document.getElementById('wb-spelling-slots');
      slots.classList.add('animate-shake');
      setTimeout(() => {
        slots.classList.remove('animate-shake');
      }, 600);
    }
  }
}

document.getElementById('wb-clear-btn').onclick = () => {
  SoundEffects.playClick();
  state.builderCurrentSpelling = [];
  renderBuilderSpelling();
  renderBuilderLetters();
};

/* ==========================================================================
   SENTENCE BUILDER MODE LOGIC (GRADE 3 WRITING)
   ========================================================================== */
function setupSentenceBuilder() {
  const dataset = getVocabularyDataset();
  const categoryData = dataset[state.currentCategory];
  state.sentenceIndex = 0;
  
  // Pick 3 random sentence items
  state.sentenceList = [...categoryData].sort(() => Math.random() - 0.5).slice(0, 3);
  
  loadSentence();
}

function loadSentence() {
  const item = state.sentenceList[state.sentenceIndex];
  
  // Prepare sentences
  // Clean up punctuation spacing but keep them as tokens for assembly (or just clean sentence)
  // Clean up: e.g. "This is my mother." -> ["This", "is", "my", "mother", "."]
  const targetStr = item.sentence;
  state.sentenceTargetString = targetStr;
  
  // Tokenize target sentence (separating words and ending punctuation)
  let tokens = targetStr.trim().split(/\s+/);
  
  // Clean tokens (remove ending dot from words but store it as a separate token if wanted, or just compare pure strings)
  // Let's strip ending dot from the last word for simpler kids spelling, or keep it.
  // Actually, keeping words clean is easier: "This", "is", "my", "mother." (or separate "."). Let's split by space, but strip punctuation for check.
  // To keep it kid-friendly, let's split by space: e.g. "This", "is", "my", "mother."
  state.sentenceTargetWords = tokens;
  state.sentenceSelectedIndices = [];
  
  // Progress tracker
  document.getElementById('sb-progress-text').innerText = `Câu ${state.sentenceIndex + 1} / ${state.sentenceList.length}`;
  
  // UI Clues
  document.getElementById('sb-emoji').innerText = item.emoji;
  document.getElementById('sb-translation-vi').innerText = item.vietnameseSentence || item.translation;
  
  // Play TTS
  speakWord(targetStr);
  
  document.getElementById('sb-speak-btn').onclick = () => {
    speakWord(targetStr);
  };
  
  // Scramble words
  state.sentenceScrambled = [...tokens].sort(() => Math.random() - 0.5);
  
  renderSentenceSpelling();
  renderSentenceWordPool();
}

function renderSentenceSpelling() {
  const container = document.getElementById('sb-spelling-slots');
  container.innerHTML = '';
  
  // Create blank placeholders or filled words
  state.sentenceTargetWords.forEach((_, idx) => {
    const slot = document.createElement('div');
    const selectedIdxInScrambled = state.sentenceSelectedIndices[idx];
    
    if (selectedIdxInScrambled !== undefined) {
      const wordText = state.sentenceScrambled[selectedIdxInScrambled];
      slot.className = "px-4 py-2.5 border-4 border-indigo-500 rounded-2xl bg-indigo-50 text-indigo-800 text-xl font-bold shadow-md transform scale-105 transition cursor-pointer select-none";
      slot.innerText = wordText;
      
      // Click to remove word from spelling
      slot.onclick = () => {
        SoundEffects.playClick();
        state.sentenceSelectedIndices.splice(idx, 1);
        renderSentenceSpelling();
        renderSentenceWordPool();
      };
    } else {
      slot.className = "w-28 h-12 border-4 border-dashed border-indigo-200 rounded-2xl bg-white/40 flex justify-center items-center shadow-inner select-none";
      slot.innerText = '';
    }
    container.appendChild(slot);
  });
}

function renderSentenceWordPool() {
  const container = document.getElementById('sb-words-pool');
  container.innerHTML = '';
  
  state.sentenceScrambled.forEach((word, index) => {
    const isUsed = state.sentenceSelectedIndices.includes(index);
    
    const btn = document.createElement('button');
    btn.innerText = word;
    
    if (isUsed) {
      btn.className = "px-4 py-2 border-4 border-gray-200 bg-gray-100 text-gray-300 rounded-2xl font-bold text-lg cursor-not-allowed select-none opacity-30";
      btn.disabled = true;
    } else {
      btn.className = "word-pill px-4 py-2 border-4 border-yellow-300 bg-white hover:bg-yellow-50 text-yellow-700 rounded-2xl font-bold text-lg shadow-md select-none";
      btn.onclick = () => {
        SoundEffects.playClick();
        if (state.sentenceSelectedIndices.length < state.sentenceTargetWords.length) {
          state.sentenceSelectedIndices.push(index);
          renderSentenceSpelling();
          renderSentenceWordPool();
          checkSentenceSpelling();
        }
      };
    }
    
    container.appendChild(btn);
  });
}

function checkSentenceSpelling() {
  if (state.sentenceSelectedIndices.length === state.sentenceTargetWords.length) {
    const spelledSentence = state.sentenceSelectedIndices.map(idx => state.sentenceScrambled[idx]).join(' ');
    
    if (spelledSentence === state.sentenceTargetString) {
      SoundEffects.playCorrect();
      Confetti.start();
      addStars(4);
      
      // Style green
      const slots = document.getElementById('sb-spelling-slots').children;
      Array.from(slots).forEach(slot => {
        slot.className = "px-4 py-2.5 border-4 border-green-500 rounded-2xl bg-green-500 text-white text-xl font-bold shadow-md animate-correct-bounce select-none";
      });
      
      setTimeout(() => {
        state.sentenceIndex++;
        if (state.sentenceIndex < state.sentenceList.length) {
          loadSentence();
        } else {
          SoundEffects.playWin();
          Confetti.start();
          addStars(5);
          alert("Tuyệt vời! Bé đã xếp đúng tất cả các câu viết. Thưởng thêm cho bé 5 ⭐ nữa nhé!");
          showScreen('dashboard-screen');
        }
      }, 2000);
    } else {
      SoundEffects.playWrong();
      const slots = document.getElementById('sb-spelling-slots');
      slots.classList.add('animate-shake');
      setTimeout(() => {
        slots.classList.remove('animate-shake');
      }, 600);
    }
  }
}

document.getElementById('sb-clear-btn').onclick = () => {
  SoundEffects.playClick();
  state.sentenceSelectedIndices = [];
  renderSentenceSpelling();
  renderSentenceWordPool();
};

/* ==========================================================================
   SPEAKING PRACTICE LOGIC (GRADE 3 SPEAKING - SPEECH RECOGNITION API)
   ========================================================================== */
function initSpeechRecognitionEngine() {
  const supported = SpeechHelper.init(
    // onResult callback
    (spokenText) => {
      handleSpeechSuccess(spokenText);
    },
    // onError callback
    (err) => {
      console.error("SpeechRecognition error: ", err);
      handleSpeechError(err);
    },
    // onEnd callback
    () => {
      updateRecordingUI(false);
    }
  );
  
  if (!supported) {
    console.warn("SpeechRecognition is not supported or was blocked in this browser.");
  }
}

function setupSpeakingPractice() {
  const dataset = getVocabularyDataset();
  const categoryData = dataset[state.currentCategory];
  state.speakingIndex = 0;
  
  // Pick 3 random speaking items
  state.speakingList = [...categoryData].sort(() => Math.random() - 0.5).slice(0, 3);
  
  loadSpeakingItem();
}

function loadSpeakingItem() {
  const item = state.speakingList[state.speakingIndex];
  state.speakingTargetSentence = item.sentence;
  state.speakingTargetTranslation = item.vietnameseSentence || item.translation;
  state.speakingCorrect = false;
  
  // Progress tracker
  document.getElementById('sp-progress-text').innerText = `Câu ${state.speakingIndex + 1} / ${state.speakingList.length}`;
  
  // Set UI Clues
  document.getElementById('sp-emoji').innerText = item.emoji;
  document.getElementById('sp-sentence').innerText = item.sentence;
  document.getElementById('sp-translation-vi').innerText = `(${state.speakingTargetTranslation})`;
  
  // Reset outputs
  document.getElementById('sp-result-box').classList.add('hidden');
  document.getElementById('sp-user-voice-output').innerText = '';
  document.getElementById('sp-feedback-msg').innerText = '';
  
  // TTS read sample
  speakWord(item.sentence);
  
  document.getElementById('sp-speak-sample-btn').onclick = () => {
    speakWord(item.sentence);
  };
  
  // Setup microphone button
  const micBtn = document.getElementById('sp-mic-btn');
  micBtn.onclick = () => {
    toggleVoiceRecording();
  };
  
  // Setup Fallback button if SpeechRecognition is not supported or error happens
  const fallbackBtn = document.getElementById('sp-fallback-done-btn');
  if (!SpeechHelper.isSupported) {
    document.getElementById('sp-mic-help-text').innerText = "Thiết bị của bé không có Micro hoặc trình duyệt chưa cấp quyền. Hãy đọc to theo loa rồi bấm nút dưới:";
    fallbackBtn.classList.remove('hidden');
    micBtn.classList.add('opacity-40', 'cursor-not-allowed');
  } else {
    document.getElementById('sp-mic-help-text').innerText = "Bé bấm Micro màu đỏ rồi đọc to câu tiếng Anh lên nhé!";
    fallbackBtn.classList.add('hidden');
    micBtn.classList.remove('opacity-40', 'cursor-not-allowed');
  }
  
  fallbackBtn.onclick = () => {
    SoundEffects.playCorrect();
    addStars(2);
    alert("Khen bé tự giác luyện nói! Tặng bé 2 ⭐ nhé.");
    advanceSpeakingIndex();
  };
}

function toggleVoiceRecording() {
  if (!SpeechHelper.isSupported) {
    alert("Trình duyệt hoặc thiết bị này không hỗ trợ/chưa cấp quyền Micro để thu âm. Bé có thể tự đọc to rồi nhấn nút màu xanh bên dưới nhé!");
    return;
  }
  
  SoundEffects.playClick();
  
  if (SpeechHelper.isListening) {
    SpeechHelper.stop();
  } else {
    updateRecordingUI(true);
    const started = SpeechHelper.start();
    if (!started) {
      updateRecordingUI(false);
      alert("Không thể kết nối Micro. Bé hãy kiểm tra quyền truy cập Micro trên trình duyệt nhé.");
    }
  }
}

function updateRecordingUI(isRecording) {
  const micBtn = document.getElementById('sp-mic-btn');
  const micText = document.getElementById('sp-mic-status-text');
  
  if (isRecording) {
    micBtn.classList.add('animate-pulse-mic');
    micText.innerText = "🎙️ Đang nghe bé nói... Hãy đọc to lên nào!";
    micText.classList.add('text-red-500');
    micText.classList.remove('text-gray-500');
  } else {
    micBtn.classList.remove('animate-pulse-mic');
    micText.innerText = "Chạm vào Micro để bắt đầu nói";
    micText.classList.remove('text-red-500');
    micText.classList.add('text-gray-500');
  }
}

function cleanSentenceText(text) {
  // Remove punctuation, double spaces, and convert to lowercase for easy matching
  return text.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g,"").replace(/\s{2,}/g," ").trim();
}

function handleSpeechResultComparison(spoken) {
  const targetClean = cleanSentenceText(state.speakingTargetSentence);
  const spokenClean = cleanSentenceText(spoken);
  
  const resultBox = document.getElementById('sp-result-box');
  const voiceOutput = document.getElementById('sp-user-voice-output');
  const feedbackMsg = document.getElementById('sp-feedback-msg');
  
  resultBox.classList.remove('hidden');
  voiceOutput.innerText = spoken;
  
  if (spokenClean === targetClean || targetClean.includes(spokenClean) && spokenClean.length > 3) {
    // Correct pronunciation!
    state.speakingCorrect = true;
    SoundEffects.playCorrect();
    Confetti.start();
    addStars(3);
    
    feedbackMsg.innerHTML = '<span class="text-green-600 font-bold text-xl">🌟 Bé nói siêu chuẩn luôn! Tuyệt vời! (+3 ⭐)</span>';
    
    setTimeout(() => {
      advanceSpeakingIndex();
    }, 2200);
  } else {
    // Incorrect pronunciation
    SoundEffects.playWrong();
    feedbackMsg.innerHTML = '<span class="text-red-500 font-bold">Bé phát âm chưa chính xác lắm. Bé bấm còi nghe lại rồi thử lại nhé! ❤️</span>';
    
    // Pulse wrong target
    const sentenceEl = document.getElementById('sp-sentence');
    sentenceEl.classList.add('animate-shake');
    setTimeout(() => sentenceEl.classList.remove('animate-shake'), 600);
  }
}

function handleSpeechSuccess(spokenText) {
  handleSpeechResultComparison(spokenText);
}

function handleSpeechError(event) {
  console.error("Lỗi SpeechRecognition event: ", event);
  // Show error visually but do not crash. Inform kid friendly message
  const micText = document.getElementById('sp-mic-status-text');
  micText.innerText = "Ơ kìa! Mr. Owl chưa nghe rõ, bé bấm lại Micro rồi nói lại nhé!";
  
  // Show fallback button just in case they keep failing due to permission or audio issues
  document.getElementById('sp-fallback-done-btn').classList.remove('hidden');
}

function advanceSpeakingIndex() {
  state.speakingIndex++;
  if (state.speakingIndex < state.speakingList.length) {
    loadSpeakingItem();
  } else {
    // Finished all speaking items
    SoundEffects.playWin();
    Confetti.start();
    addStars(5);
    alert("Tuyệt vời! Bé đã luyện phát âm xong tất cả các câu. Tặng bé 5 ⭐ nữa!");
    showScreen('dashboard-screen');
  }
}

/* ==========================================================================
   CERTIFICATE & REWARDS SYSTEM
   ========================================================================== */
function generateCertificate(name) {
  SoundEffects.playClick();
  
  // Hide input area, show certificate board
  document.getElementById('cert-name-input-section').classList.add('hidden');
  
  const certContainer = document.getElementById('cert-printable-container');
  certContainer.classList.remove('hidden');
  
  // Update certificate content
  document.getElementById('cert-student-name').innerText = name;
  document.getElementById('cert-topic-name').innerText = `Chủ Đề: ${state.currentCategory.toUpperCase()} - Lớp: ${state.currentGrade === 'g3' ? '3' : '1 & 2'}`;
  document.getElementById('cert-stars').innerText = state.stars;
  
  const today = new Date();
  document.getElementById('cert-date').innerText = `Ngày ${today.getDate()} tháng ${today.getMonth() + 1} năm ${today.getFullYear()}`;
  
  // Bind certificate control buttons
  document.getElementById('cert-print-btn').onclick = () => {
    SoundEffects.playClick();
    window.print();
  };
  
  document.getElementById('cert-close-btn').onclick = () => {
    SoundEffects.playClick();
    showScreen('dashboard-screen');
  };
}
