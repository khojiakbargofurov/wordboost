import { useState, useEffect, useCallback } from 'react';
import { Trophy, ArrowRight, XCircle, CheckCircle2 } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import ProgressBar from '../components/ProgressBar';
import { useAuth } from '../context/AuthContext';
import { wordService } from '../services/wordService';
import './QuizPage.css';

// Fisher-Yates shuffle for true randomness
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function buildQuestions(fetchedWords) {
  if (fetchedWords.length < 4) return [];

  // Deduplicate by definition so options are always distinct
  const seen = new Set();
  const uniqueWords = fetchedWords.filter(w => {
    const def = w.definition || w.translation || w.meaning || '';
    if (!def || seen.has(def)) return false;
    seen.add(def);
    return true;
  });

  if (uniqueWords.length < 4) return [];

  // Pick up to 10 random words for this quiz session
  const pool = shuffle(uniqueWords).slice(0, Math.min(10, uniqueWords.length));

  return pool.map(word => {
    const correctDef = word.definition || word.translation || word.meaning || 'No translation';

    // Get 3 distractors that are different from the correct answer
    const distractors = shuffle(
      uniqueWords.filter(w => {
        const d = w.definition || w.translation || w.meaning || '';
        return w.id !== word.id && d !== correctDef && d !== '';
      })
    )
      .slice(0, 3)
      .map(w => w.definition || w.translation || w.meaning);

    // If we couldn't get 3 unique distractors, skip this word
    if (distractors.length < 3) return null;

    const options = shuffle([...distractors, correctDef]);
    const correctIndex = options.indexOf(correctDef);

    return { id: word.id, word: word.word, options, correctIndex };
  }).filter(Boolean); // remove null entries
}

function QuizPage() {
  const { currentUser } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);

  useEffect(() => {
    if (currentUser?.uid) {
      wordService.getDailyWords(currentUser.uid, currentUser.level || 'A1')
        .then(fetchedWords => {
          const qs = buildQuestions(fetchedWords);
          setQuestions(qs);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error loading quiz words', err);
          setLoading(false);
        });
    }
  }, [currentUser]);

  const handleOptionSelect = useCallback((index) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);
    if (index === questions[currentQuestionIndex].correctIndex) {
      setScore(s => s + 1);
    }
  }, [isAnswered, currentQuestionIndex, questions]);

  const handleNext = async () => {
    setIsAnswered(false);
    setSelectedOption(null);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(i => i + 1);
    } else {
      if (currentUser?.uid) {
        const result = await wordService.saveQuizResult(currentUser.uid, {
          correctCount: score,
          totalCount: questions.length,
        });
        setXpEarned(result.xpEarned || 0);
      }
      setQuizComplete(true);
    }
  };

  if (loading) {
    return (
      <div className="quiz-page flex justify-center items-center h-full">
        <h2>Savollar tayyorlanmoqda...</h2>
      </div>
    );
  }

  if (questions.length < 4) {
    return (
      <div className="quiz-page flex flex-col justify-center items-center h-full gap-4 text-center">
        <h2>Yetarli so'z yo'q!</h2>
        <p className="text-muted">Quiz uchun kamida 4 ta har xil so'z kerak.</p>
        <Button variant="primary" onClick={() => window.history.back()}>Orqaga</Button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = (currentQuestionIndex / questions.length) * 100;

  if (quizComplete) {
    return (
      <div className="quiz-page">
        <Card className="quiz-completion-card text-center" glow={true}>
          <div className="completion-icon">
            <Trophy size={64} className="text-warning" />
          </div>
          <h2>Quiz yakunlandi!</h2>
          <p className="text-muted mt-3 mb-6">
            {questions.length} savoldan <strong>{score}</strong> tasiga to'g'ri javob berdingiz.
          </p>
          {xpEarned > 0 && (
            <div className="xp-earned-badge">
              <span>+{xpEarned} XP qo'shildi! 🎉</span>
            </div>
          )}

          <div className="score-ring">
            <svg viewBox="0 0 36 36" className="circular-chart orange">
              <path className="circle-bg"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path className="circle"
                strokeDasharray={`${(score / questions.length) * 100}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <text x="18" y="20.35" className="percentage">
                {Math.round((score / questions.length) * 100)}%
              </text>
            </svg>
          </div>

          <div className="quiz-actions mt-8">
            <Button variant="primary" onClick={() => window.history.back()} fullWidth>
              Dashboardga qaytish
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="quiz-page">
      <div className="quiz-header">
        <div className="quiz-progress-text">
          <span>Savol {currentQuestionIndex + 1} / {questions.length}</span>
          <span>Ball: {score}</span>
        </div>
        <ProgressBar progress={progress} className="mb-4" />
      </div>

      <Card className="quiz-card" glow={true}>
        <div className="question-section">
          <p className="question-prompt text-muted font-medium mb-2">Bu so'zning ma'nosi nima?</p>
          <h2 className="question-word">{currentQuestion.word}</h2>
        </div>

        <div className="options-grid">
          {currentQuestion.options.map((option, index) => {
            let optionClass = 'quiz-option';
            let Icon = null;

            if (isAnswered) {
              if (index === currentQuestion.correctIndex) {
                optionClass += ' correct';
                Icon = CheckCircle2;
              } else if (index === selectedOption) {
                optionClass += ' incorrect';
                Icon = XCircle;
              } else {
                optionClass += ' disabled';
              }
            } else if (selectedOption === index) {
              optionClass += ' selected';
            }

            return (
              <button
                key={`${currentQuestion.id}-${index}`}
                className={optionClass}
                onClick={() => handleOptionSelect(index)}
                disabled={isAnswered}
              >
                <span className="option-text">{option}</span>
                {Icon && <Icon size={20} className="option-icon" />}
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div className="next-button-wrapper fade-in">
            <Button
              variant="primary"
              onClick={handleNext}
              icon={ArrowRight}
              size="lg"
              fullWidth
            >
              {currentQuestionIndex === questions.length - 1 ? "Yakunlash" : "Keyingi savol"}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}

export default QuizPage;
