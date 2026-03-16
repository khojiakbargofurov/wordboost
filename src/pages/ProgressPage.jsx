import { useState, useEffect } from 'react';
import { Trophy, Star, Medal, Award, TrendingUp, Book, Crown } from 'lucide-react';
import Card from '../components/Card';
import ProgressBar from '../components/ProgressBar';
import { useAuth } from '../context/AuthContext';
import { wordService } from '../services/wordService';
import './ProgressPage.css';

function ProgressPage() {
  const { currentUser, userData } = useAuth();
  const [totalLevelWords, setTotalLevelWords] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingLB, setLoadingLB] = useState(true);

  useEffect(() => {
    if (currentUser?.level) {
      wordService.getAllWords().then(words => {
        const levelWords = words.filter(w => w.level === currentUser.level);
        setTotalLevelWords(levelWords.length);
      });
    }

    // Load real leaderboard
    wordService.getLeaderboard(15).then(users => {
      setLeaderboard(users);
      setLoadingLB(false);
    }).catch(() => setLoadingLB(false));
  }, [currentUser]);

  const userXp = userData?.xp || 0;
  const userLevel = Math.floor(userXp / 1000) + 1;
  const nextLevelXp = userLevel * 1000;
  const rank =
    userXp > 5000 ? 'Oltin Ustoz' :
    userXp > 2000 ? 'Kumush Olim' :
    userXp > 500  ? 'Bronza Novice' : 'Yangi Boshlagan';

  const progressPercent = (userXp / nextLevelXp) * 100;
  const wordsMastered = userData?.learnedWords?.length || 0;

  // Find current user's position in leaderboard
  const myRank = leaderboard.findIndex(u => u.id === currentUser?.uid);
  const globalRank = myRank !== -1 ? myRank + 1 : null;

  // Fallback entry for current user if not in leaderboard
  const myEntry = currentUser
    ? {
        id: currentUser.uid,
        name: currentUser.displayName || currentUser.email?.split('@')[0] || 'Siz',
        xp: userXp,
        avatar: (currentUser.displayName || currentUser.email || 'S')
          .split(' ').slice(0, 2).map(n => n[0]?.toUpperCase() || '').join(''),
        rank: '—',
        isCurrentUser: true,
      }
    : null;

  // Build display list with proper rank numbers and current-user flag
  const displayList = leaderboard.map((u, i) => ({
    ...u,
    rank: i + 1,
    isCurrentUser: u.id === currentUser?.uid,
  }));

  return (
    <div className="progress-page">
      <header className="progress-header mb-8">
        <h1>Sizning Natijangiz</h1>
        <p className="text-muted text-lg mt-2">O'rganish sayohatingizni kuzating va reytingda ko'tariling.</p>
      </header>

      <div className="progress-grid">
        {/* Left Column – User Stats */}
        <div className="user-stats-col">
          <Card className="level-card mb-6" glow={true}>
            <div className="level-header">
              <div className="level-badge">
                <Star size={32} className="text-warning" fill="currentColor" />
                <span className="level-num">{userLevel}</span>
              </div>
              <div className="level-info">
                <h2 className="m-0">{rank}</h2>
                {globalRank
                  ? <p className="text-muted m-0">Global Reyting: #{globalRank}</p>
                  : <p className="text-muted m-0">Leaderboardda yo'q (hali XP kam)</p>}
              </div>
            </div>

            <div className="xp-section mt-6">
              <div className="xp-header mb-2">
                <span className="font-semibold">{userXp} XP</span>
                <span className="text-muted">{nextLevelXp} XP</span>
              </div>
              <ProgressBar progress={progressPercent} size="lg" />
              <p className="text-center text-sm text-muted mt-3 m-0">
                Keyingi darajaga {nextLevelXp - userXp} XP qoldi
              </p>
            </div>
          </Card>

          <div className="achievements-grid mt-6">
            <Card className="achievement-card">
              <div className="achievement-icon-wrapper purple mb-3">
                <Trophy size={24} />
              </div>
              <h4 className="mb-1">So'z Ustasi</h4>
              <p className="text-muted text-sm">{wordsMastered} so'z o'rganildi</p>
            </Card>

            <Card className="achievement-card">
              <div className="achievement-icon-wrapper orange mb-3">
                <TrendingUp size={24} />
              </div>
              <h4 className="mb-1">Doimiy O'rganuvchi</h4>
              <p className="text-muted text-sm">{userData?.streak || 0} kunlik seria</p>
            </Card>

            <Card className="achievement-card">
              <div className="achievement-icon-wrapper blue mb-3">
                <Book size={24} />
              </div>
              <h4 className="mb-1">{userData?.level || 'A1'} Daraja</h4>
              <p className="text-muted text-sm">{wordsMastered} / {totalLevelWords} so'z</p>
            </Card>

            <Card className="achievement-card">
              <div className="achievement-icon-wrapper amber mb-3">
                <Award size={24} />
              </div>
              <h4 className="mb-1">Umumiy XP</h4>
              <p className="text-muted text-sm">{userXp} XP to'plangan</p>
            </Card>
          </div>
        </div>

        {/* Right Column – Leaderboard */}
        <div className="leaderboard-col">
          <Card className="leaderboard-card">
            <div className="lb-header">
              <h3 className="m-0">Global Reyting</h3>
              {!loadingLB && (
                <span className="lb-count text-muted text-sm">{leaderboard.length} ta foydalanuvchi</span>
              )}
            </div>

            {loadingLB ? (
              <div className="lb-loading">
                <div className="lb-spinner" />
                <p className="text-muted text-sm mt-2">Yuklanmoqda...</p>
              </div>
            ) : displayList.length === 0 ? (
              <div className="lb-empty">
                <Trophy size={40} className="text-muted" />
                <p className="text-muted text-sm mt-3">Hali hech kim yo'q.<br />Birinchi bo'ling!</p>
              </div>
            ) : (
              <div className="leaderboard-list">
                {displayList.map((user) => (
                  <div
                    key={user.id}
                    className={`leaderboard-item${user.isCurrentUser ? ' current-user' : ''}`}
                  >
                    {/* Rank badge */}
                    <div className="leaderboard-rank">
                      {user.rank === 1
                        ? <Crown size={18} className="rank-gold" />
                        : user.rank === 2
                        ? <Medal size={18} className="rank-silver" />
                        : user.rank === 3
                        ? <Medal size={18} className="rank-bronze" />
                        : <span className="rank-num">#{user.rank}</span>}
                    </div>

                    {/* Avatar + name */}
                    <div className="leaderboard-user">
                      <div className={`user-avatar${user.isCurrentUser ? ' avatar-me' : ''}`}>
                        {user.avatar || '?'}
                      </div>
                      <span className="user-name">
                        {user.name}
                        {user.isCurrentUser && <span className="you-badge">Siz</span>}
                      </span>
                    </div>

                    {/* XP */}
                    <div className="leaderboard-xp">
                      <span className="xp-num">{user.xp.toLocaleString()}</span>
                      <span className="xp-label text-muted">XP</span>
                    </div>
                  </div>
                ))}

                {/* If current user is not in the list at all */}
                {myEntry && globalRank === null && (
                  <>
                    <div className="lb-separator">⋯</div>
                    <div className="leaderboard-item current-user">
                      <div className="leaderboard-rank">
                        <span className="rank-num">—</span>
                      </div>
                      <div className="leaderboard-user">
                        <div className="user-avatar avatar-me">{myEntry.avatar}</div>
                        <span className="user-name">
                          {myEntry.name}
                          <span className="you-badge">Siz</span>
                        </span>
                      </div>
                      <div className="leaderboard-xp">
                        <span className="xp-num">{myEntry.xp.toLocaleString()}</span>
                        <span className="xp-label text-muted">XP</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ProgressPage;
