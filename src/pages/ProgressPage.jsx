import { useState, useEffect } from 'react';
import { Trophy, Star, Medal, Award, TrendingUp, Book } from 'lucide-react';
import Card from '../components/Card';
import ProgressBar from '../components/ProgressBar';
import { useAuth } from '../context/AuthContext';
import { wordService } from '../services/wordService';
import './ProgressPage.css';

function ProgressPage() {
  const { currentUser } = useAuth();
  const [totalLevelWords, setTotalLevelWords] = useState(0);

  useEffect(() => {
    if (currentUser?.level) {
      wordService.getAllWords().then(words => {
        const levelWords = words.filter(w => w.level === currentUser.level);
        setTotalLevelWords(levelWords.length);
      });
    }
  }, [currentUser]);

  const userProgress = {
    level: currentUser ? Math.floor(currentUser.xp / 1000) + 1 : 1,
    xp: currentUser?.xp || 0,
    nextLevelXp: currentUser ? (Math.floor(currentUser.xp / 1000) + 1) * 1000 : 1000,
    rank: currentUser?.xp > 5000 ? 'Gold Scholar' : currentUser?.xp > 2000 ? 'Silver Scholar' : 'Bronze Novice',
    globalRank: 1243, // Mock global rank
    wordsMastered: currentUser?.learnedWords?.length || 0,
  };

  const [leaderboard] = useState([
    { id: 1, name: 'Sarah J.', xp: 14500, avatar: 'SJ', rank: 1 },
    { id: 2, name: 'Michael T.', xp: 13200, avatar: 'MT', rank: 2 },
    { id: 3, name: 'Emma W.', xp: 12850, avatar: 'EW', rank: 3 },
    { id: 4, name: 'David L.', xp: 11400, avatar: 'DL', rank: 4 },
    { id: 5, name: 'Alex (You)', xp: 2850, avatar: 'AL', rank: 1243, isCurrentUser: true },
  ]);

  const progressPercent = (userProgress.xp / userProgress.nextLevelXp) * 100;

  return (
    <div className="progress-page">
      <header className="progress-header mb-8">
        <h1>Your Progress</h1>
        <p className="text-muted text-lg mt-2">Track your learning journey and climb the ranks.</p>
      </header>

      <div className="progress-grid">
        {/* Left Column - User Stats */}
        <div className="user-stats-col">
          <Card className="level-card mb-6" glow={true}>
            <div className="level-header">
              <div className="level-badge">
                <Star size={32} className="text-warning" fill="currentColor" />
                <span className="level-num">{userProgress.level}</span>
              </div>
              <div className="level-info">
                <h2 className="m-0">{userProgress.rank}</h2>
                <p className="text-muted m-0">Global Rank: #{userProgress.globalRank}</p>
              </div>
            </div>

            <div className="xp-section mt-6">
              <div className="xp-header mb-2">
                <span className="font-semibold">{userProgress.xp} XP</span>
                <span className="text-muted">{userProgress.nextLevelXp} XP</span>
              </div>
              <ProgressBar progress={progressPercent} size="lg" />
              <p className="text-center text-sm text-muted mt-3 m-0">
                {userProgress.nextLevelXp - userProgress.xp} XP to next level
              </p>
            </div>
          </Card>

          <div className="achievements-grid mt-6">
            <Card className="achievement-card">
              <div className="achievement-icon-wrapper purple mb-3">
                <Trophy size={24} />
              </div>
              <h4 className="mb-1">Vocabulary Master</h4>
              <p className="text-muted text-sm">{userProgress.wordsMastered} Words Learned</p>
            </Card>

            <Card className="achievement-card">
              <div className="achievement-icon-wrapper orange mb-3">
                <TrendingUp size={24} />
              </div>
              <h4 className="mb-1">Consistent Learner</h4>
              <p className="text-muted text-sm">{currentUser?.streak || 0} Day Streak</p>
            </Card>

            <Card className="achievement-card col-span-full">
              <div className="flex items-center gap-4 mb-4">
                 <div className="achievement-icon-wrapper bg-blue-500/20 text-blue-400">
                  <Book size={24} />
                 </div>
                 <div>
                   <h4 className="mb-0">{currentUser?.level || 'A1'} Mastery</h4>
                   <p className="text-muted text-sm m-0">{userProgress.wordsMastered} / {totalLevelWords} words</p>
                 </div>
              </div>
              <ProgressBar progress={totalLevelWords > 0 ? (userProgress.wordsMastered / totalLevelWords) * 100 : 0} size="sm" />
            </Card>
          </div>
        </div>

        {/* Right Column - Leaderboard */}
        <div className="leaderboard-col">
          <Card className="leaderboard-card">
            <h3 className="mb-6">Global Leaderboard</h3>
            
            <div className="leaderboard-list">
              {leaderboard.map((user) => (
                <div 
                  key={user.id} 
                  className={`leaderboard-item ${user.isCurrentUser ? 'current-user' : ''}`}
                >
                  <div className="leaderboard-rank">
                    {user.rank === 1 ? <Medal size={20} className="text-warning" /> : 
                     user.rank === 2 ? <Medal size={20} className="text-gray-400" /> : 
                     user.rank === 3 ? <Medal size={20} className="text-orange-400" /> : 
                     <span className="rank-num">#{user.rank}</span>}
                  </div>
                  
                  <div className="leaderboard-user">
                    <div className="user-avatar">{user.avatar}</div>
                    <span className="user-name">{user.name}</span>
                  </div>
                  
                  <div className="leaderboard-xp">
                    <span className="xp-num">{user.xp}</span>
                    <span className="xp-label text-muted">XP</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ProgressPage;
