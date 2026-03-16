import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Target, Flame, Book, Trophy, Play, TrendingUp } from 'lucide-react';
import Card from '../components/Card';
import ProgressBar from '../components/ProgressBar';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { wordService } from '../services/wordService';
import './Dashboard.css';

function Dashboard() {
  const { currentUser } = useAuth();
  const [totalWords, setTotalWords] = useState(0);
  const [dailyWordsCount, setDailyWordsCount] = useState(0);

  const firstName = currentUser?.displayName ? currentUser.displayName.split(' ')[0] : 'Learner';

  useEffect(() => {
    if (currentUser?.uid) {
      wordService.getDailyWords(currentUser.uid, currentUser.level || 'A1')
        .then(words => setDailyWordsCount(words.length))
        .catch(console.error);
    }
    wordService.getAllWords()
      .then(words => setTotalWords(words.length))
      .catch(console.error);
  }, [currentUser]);

  const stats = {
    streak: currentUser?.streak || 0,
    wordsTotal: totalWords,
    wordsLearned: currentUser?.xp > 0 ? Math.floor(currentUser.xp / 10) : 0,
    wordsToReview: dailyWordsCount,
    dailyGoal: dailyWordsCount || 20,
    dailyProgress: 0,
    xp: currentUser?.xp || 0,
    level: currentUser?.level || 1
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Welcome back, {firstName} 👋</h1>
          <p className="text-muted">You're on a {stats.streak}-day streak. Keep it up!</p>
        </div>
        <Link to="/flashcards">
          <Button variant="primary" icon={Play}>Start Daily Review</Button>
        </Link>
      </header>

      {/* Stats Grid */}
      <div className="stats-grid">
        <Card className="stat-card">
          <div className="stat-icon-wrapper orange">
            <Flame size={24} className="stat-icon" />
          </div>
          <div className="stat-info">
            <p className="stat-label">Day Streak</p>
            <h2 className="stat-value">{stats.streak}</h2>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-icon-wrapper blue">
            <Book size={24} className="stat-icon" />
          </div>
          <div className="stat-info">
            <p className="stat-label">Words Learned</p>
            <h2 className="stat-value">{stats.wordsLearned}</h2>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-icon-wrapper purple">
            <Trophy size={24} className="stat-icon" />
          </div>
          <div className="stat-info">
            <p className="stat-label">Total XP</p>
            <h2 className="stat-value">{stats.xp}</h2>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-icon-wrapper green">
            <Target size={24} className="stat-icon" />
          </div>
          <div className="stat-info">
            <p className="stat-label">Words to Review</p>
            <h2 className="stat-value">{stats.wordsToReview}</h2>
          </div>
        </Card>
      </div>

      <div className="dashboard-content">
        {/* Daily Goal Card */}
        <Card className="goal-card" glow={true}>
          <div className="goal-header">
            <h3>Daily Goal</h3>
            <span className="goal-text">
              {stats.dailyProgress} / {stats.dailyGoal} Words
            </span>
          </div>
          <ProgressBar progress={(stats.dailyProgress / stats.dailyGoal) * 100} size="lg" />
          <p className="goal-message text-muted mt-3">
            {stats.dailyProgress >= stats.dailyGoal 
              ? "Goal reached! You're crushing it."
              : `Just ${stats.dailyGoal - stats.dailyProgress} more words to hit your daily target!`}
          </p>
        </Card>

        {/* Quick Actions / Recommendations */}
        <h3 className="section-subtitle mt-8 mb-4">Recommended for You</h3>
        <div className="quick-actions-grid">
          <Card className="action-card">
            <div className="action-header">
              <div className="action-icon review">
                <TrendingUp size={20} />
              </div>
              <h4 className="m-0">Spaced Repetition</h4>
            </div>
            <p className="text-muted my-3 text-sm">Review words that are about to fade from your memory.</p>
            <Link to="/flashcards">
              <Button variant="secondary" fullWidth>Review {stats.wordsToReview} Words</Button>
            </Link>
          </Card>

          <Card className="action-card">
            <div className="action-header">
              <div className="action-icon quiz">
                <Play size={20} />
              </div>
              <h4 className="m-0">Quick Quiz</h4>
            </div>
            <p className="text-muted my-3 text-sm">Test your memory with a 10-question multiple choice quiz.</p>
            <Link to="/quiz">
              <Button variant="secondary" fullWidth>Take Quiz</Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
