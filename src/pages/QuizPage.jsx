import { useState, useEffect } from 'react';
import { Trophy, ArrowRight, XCircle, CheckCircle2 } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import ProgressBar from '../components/ProgressBar';
import { useAuth } from '../context/AuthContext';
import { wordService } from '../services/wordService';
import './QuizPage.css';

function QuizPage() {
  const { currentUser } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (currentUser?.uid) {
      wordService.getDailyWords(currentUser.uid, currentUser.level || 'A1')
        .then(fetchedWords => {
          if (fetchedWords.length < 4) {
            setQuestions([]);
            setLoading(false);
            return;
          }

          // Pick up to 10 words for the quiz from the daily words
          const shuffledWords = [...fetchedWords].sort(() => 0.5 - Math.random());
          const selectedWords = shuffledWords.slice(0, 10);
          
          const generatedQuestions = selectedWords.map(word => {
            // Get 3 random distinct distractors
            const distractors = fetchedWords
              .filter(w => w.id !== word.id)
              .sort(() => 0.5 - Math.random())
              .slice(0, 3)
              .map(w => w.definition || w.translation || w.meaning || 'No translation');
              
            const correctMeaning = word.definition || word.translation || word.meaning || 'No translation';
            const options = [...distractors, correctMeaning].sort(() => 0.5 - Math.random());
            const correctIndex = options.indexOf(correctMeaning);
            
            return {
              id: word.id,
              word: word.word,
              options,
              correctIndex
            };
          });
          
          setQuestions(generatedQuestions);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error loading quiz words", err);
          setLoading(false);
        });
    }
  }, [currentUser]);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);

  if (loading) {
    return <div className="quiz-page flex justify-center items-center h-full"><h2>Generating quiz...</h2></div>;
  }

  if (questions.length < 4) {
    return (
      <div className="quiz-page flex flex-col justify-center items-center h-full gap-4 text-center">
        <h2>Not enough words!</h2>
        <p className="text-muted">You need at least 4 words in the database to generate a multiple-choice quiz.</p>
        <Button variant="primary" onClick={() => window.history.back()}>Go Back</Button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex) / questions.length) * 100;

  const handleOptionSelect = (index) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);

    if (index === currentQuestion.correctIndex) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    setIsAnswered(false);
    setSelectedOption(null);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setQuizComplete(true);
    }
  };

  if (quizComplete) {
    return (
      <div className="quiz-page">
        <Card className="quiz-completion-card text-center" glow={true}>
          <div className="completion-icon">
            <Trophy size={64} className="text-warning" />
          </div>
          <h2>Quiz Completed!</h2>
          <p className="text-muted mt-3 mb-6">
            You scored {score} out of {questions.length} correct.
          </p>
          
          <div className="score-ring">
            <svg viewBox="0 0 36 36" className="circular-chart orange">
              <path className="circle-bg"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path className="circle"
                strokeDasharray={`${(score / questions.length) * 100}, 100`}
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <text x="18" y="20.35" className="percentage">
                {Math.round((score / questions.length) * 100)}%
              </text>
            </svg>
          </div>

          <div className="quiz-actions mt-8">
            <Button variant="primary" onClick={() => window.history.back()} fullWidth>
              Return to Dashboard
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
          <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
          <span>Score: {score}</span>
        </div>
        <ProgressBar progress={progress} className="mb-4" />
      </div>

      <Card className="quiz-card" glow={true}>
        <div className="question-section">
          <p className="question-prompt text-muted font-medium mb-2">What is the meaning of:</p>
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
                key={index}
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
              {currentQuestionIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}

export default QuizPage;
