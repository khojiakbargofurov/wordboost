import { useState, useEffect } from 'react';
import { Volume2, RefreshCcw, CheckCircle2 } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { wordService } from '../services/wordService';
import './FlashcardsPage.css';

function FlashcardsPage() {
  const { currentUser } = useAuth();
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (currentUser?.uid) {
      wordService.getDailyWords(currentUser.uid, currentUser.level || 'A1')
        .then(fetched => {
          setWords(fetched);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error loading words for flashcards", err);
          setLoading(false);
        });
    }
  }, [currentUser]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [ratings, setRatings] = useState({ easy: 0, medium: 0, hard: 0 });
  const [xpEarned, setXpEarned] = useState(0);
  const [masteredWordIds, setMasteredWordIds] = useState([]);

  const currentWord = words[currentIndex];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  if (loading) {
    return <div className="flashcards-page flex justify-center items-center h-full"><h2>Loading vocabulary...</h2></div>;
  }

  if (words.length === 0) {
    return (
      <div className="flashcards-page flex flex-col justify-center items-center h-full gap-4 text-center">
        <h2>No words found!</h2>
        <p className="text-muted">Admins or teachers need to add some vocabulary words first.</p>
        <Button variant="primary" onClick={() => window.history.back()}>Go Back</Button>
      </div>
    );
  }

  const handleRating = async (rating) => {
    const updatedRatings = { ...ratings, [rating]: ratings[rating] + 1 };
    setRatings(updatedRatings);
    
    let updatedMasteredIds = masteredWordIds;
    if (rating === 'easy') {
      updatedMasteredIds = [...masteredWordIds, words[currentIndex].id];
      setMasteredWordIds(updatedMasteredIds);
    }
    
    setIsFlipped(false);

    const isLast = currentIndex >= words.length - 1;

    setTimeout(async () => {
      if (!isLast) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // Save session to Firestore
        if (currentUser?.uid) {
          const result = await wordService.saveFlashcardSession(currentUser.uid, {
            wordIds: updatedMasteredIds,
            easyCount: updatedRatings.easy,
            mediumCount: updatedRatings.medium,
          });
          setXpEarned(result.xpEarned || 0);
        }
        setSessionComplete(true);
      }
    }, 150);
  };

  if (sessionComplete) {
    return (
      <div className="flashcards-page">
        <Card className="completion-card text-center" glow={true}>
          <div className="completion-icon">
            <CheckCircle2 size={64} className="text-success" />
          </div>
          <h2>Session tugadi!</h2>
          <p className="text-muted mt-3 mb-6">
            Bugun {words.length} ta so'zni ko'rib chiqdingiz.
          </p>
          {xpEarned > 0 && (
            <div className="xp-earned-badge">
              <span>+{xpEarned} XP qo'shildi! 🎉</span>
            </div>
          )}
          <div className="session-stats">
            <div className="stat">
              <span className="stat-num">{words.length}</span>
              <span className="stat-label">Words Reviewed</span>
            </div>
            <div className="stat">
              <span className="stat-num">+45</span>
              <span className="stat-label">XP Earned</span>
            </div>
          </div>
          <Button variant="primary" onClick={() => window.history.back()}>Back to Dashboard</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flashcards-page">
      <div className="flashcards-header">
        <h2>Daily Review</h2>
        <span className="progress-text text-muted">
          {currentIndex + 1} / {words.length}
        </span>
      </div>

      <div className="flashcard-container">
        <div className={`flashcard ${isFlipped ? 'flipped' : ''}`} onClick={!isFlipped ? handleFlip : undefined}>
          
          {/* Front of card */}
          <Card className="flashcard-face flashcard-front">
            <div className="word-content">
              <h1 className="vocab-word">{currentWord.word}</h1>
              <p className="vocab-phonetic text-muted">{currentWord.phonetic}</p>
            </div>
            
            <div className="flashcard-hint">
              <RefreshCcw size={20} className="spin-slow" />
              <span>Tap to reveal</span>
            </div>
          </Card>

          {/* Back of card */}
          <Card className="flashcard-face flashcard-back">
            <div className="card-top-actions">
              <button className="icon-button" aria-label="Listen to pronunciation">
                <Volume2 size={24} />
              </button>
            </div>

            <div className="word-details px-4">
              <h2 className="vocab-word-small">
                {currentWord.article && <span className="text-primary font-normal text-lg mr-2">{currentWord.article}</span>}
                {currentWord.word}
              </h2>
              {currentWord.plural && <p className="text-sm text-muted mt-1">Plural: {currentWord.plural}</p>}
              <div className="divider"></div>
              
              <div className="detail-section">
                <h4 className="detail-label">Translation</h4>
                <p className="vocab-meaning mb-1"><strong>UZ:</strong> {currentWord.definition || currentWord.meaning}</p>
                {currentWord.translation_en && <p className="vocab-meaning text-sm"><strong>EN:</strong> {currentWord.translation_en}</p>}
              </div>

              {currentWord.example && (
                <div className="detail-section">
                  <h4 className="detail-label">Example</h4>
                  <p className="vocab-example italic">"{currentWord.example}"</p>
                  {currentWord.example_en && <p className="text-sm text-muted mt-1">{currentWord.example_en}</p>}
                </div>
              )}

              {currentWord.verb_conjugation && (
                 <div className="detail-section">
                   <h4 className="detail-label">Präsens Conjugation</h4>
                   <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-300">
                      <div><span className="text-white">ich</span> {currentWord.verb_conjugation.ich}</div>
                      <div><span className="text-white">wir</span> {currentWord.verb_conjugation.wir}</div>
                      <div><span className="text-white">du</span> {currentWord.verb_conjugation.du}</div>
                      <div><span className="text-white">ihr</span> {currentWord.verb_conjugation.ihr}</div>
                      <div><span className="text-white">er/sie/es</span> {currentWord.verb_conjugation.er_sie_es}</div>
                      <div><span className="text-white">sie/Sie</span> {currentWord.verb_conjugation.sie_Sie}</div>
                   </div>
                 </div>
              )}
            </div>

            {/* Rating Buttons */}
            <div className="rating-container" onClick={(e) => e.stopPropagation()}>
              <p className="rating-prompt text-muted mb-4">How well did you know this?</p>
              <div className="rating-buttons">
                <Button variant="danger" onClick={() => handleRating('hard')}>Hard</Button>
                <Button variant="secondary" onClick={() => handleRating('medium')}>Medium</Button>
                <Button variant="primary" onClick={() => handleRating('easy')}>Easy</Button>
              </div>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}

export default FlashcardsPage;
