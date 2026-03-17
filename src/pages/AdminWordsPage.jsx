import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Plus, BookOpen, ArrowLeft } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import { wordService } from '../services/wordService';
import { db } from '../services/firebase';
import { collection, writeBatch, doc } from 'firebase/firestore';
import './AdminWordsPage.css';

export default function AdminWordsPage() {
  const { userRole } = useAuth();
  const navigate = useNavigate();
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  // Word form state
  const [formData, setFormData] = useState({
    word: '',
    phonetic: '',
    definition: '',
    example: ''
  });

  useEffect(() => {
    // Only admins and teachers can access
    if (userRole && userRole !== 'admin' && userRole !== 'teacher') {
      navigate('/dashboard');
      return;
    }

    const fetchWords = async () => {
      try {
        const fetchedWords = await wordService.getAllWords();
        setWords(fetchedWords);
      } catch (error) {
        console.error("Failed to load words", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWords();
  }, [userRole, navigate]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddWord = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const newWord = await wordService.addWord(formData);
      setWords([newWord, ...words]);
      setIsAdding(false);
      setFormData({ word: '', phonetic: '', definition: '', example: '', level: 'A1' });
    } catch (error) {
      console.error(error);
      alert("Error adding word");
    } finally {
      setLoading(false);
    }
  };

  const handleSeedDatabase = async () => {
    if (!confirm("This will import A1, A2, B1 json files into Firestore. Continue?")) return;
    setLoading(true);
    
    try {
      const files = ['/data/words.json'];
      let totalAdded = 0;
      let batch = writeBatch(db);
      let operationCount = 0;
      
      for (const fileUrl of files) {
        const response = await fetch(fileUrl);
        if (!response.ok) continue;
        
        const jsonData = await response.json();
        
        for (const item of jsonData) {
          const docRef = doc(collection(db, 'words'));
          batch.set(docRef, {
            word: item.word || '',
            meaning: item.translation_uz || item.translation || '',
            translation_en: item.translation_en || '',
            example: item.example_de || item.example || '',
            example_en: item.example_en || '',
            level: item.level || 'A1',
            phonetic: '',
            article: item.article || null,
            plural: item.plural || null,
            verb_conjugation: item.verb_conjugation || null,
            createdAt: new Date()
          });
          
          totalAdded++;
          operationCount++;
          
          // Firestore limit is 500 per batch. Commit and start new batch if we hit 400.
          if (operationCount >= 400) {
            await batch.commit();
            batch = writeBatch(db);
            operationCount = 0;
          }
        }
      }
      
      // Commit any remaining items in the last batch
      if (operationCount > 0) {
        await batch.commit();
      }
      
      alert(`Successfully added ${totalAdded} words from local JSON files!`);
      
      // Refresh list
      const fetchedWords = await wordService.getAllWords();
      setWords(fetchedWords);
      
    } catch (error) {
      console.error("Error seeding DB:", error);
      alert("Failed to seed database: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && words.length === 0) {
    return <div className="admin-container"><h2>Loading words...</h2></div>;
  }

  if (userRole !== 'admin' && userRole !== 'teacher') return null;

  return (
    <div className="admin-container fade-in">
      <header className="admin-header mb-8 flex justify-between items-start">
        <div>
          <button onClick={() => navigate('/dashboard')} className="icon-button mb-4 bg-card" style={{ padding: '0.5rem', borderRadius: '50%' }}>
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BookOpen size={28} className="text-primary" />
            Manage Vocabulary
          </h1>
          <p className="text-muted mt-2">Add or view vocabulary in the database.</p>
        </div>
        <div className="flex gap-4">
          <Button onClick={handleSeedDatabase} variant="secondary" disabled={loading}>
            📥 Seed from JSON
          </Button>
          <Button onClick={() => setIsAdding(!isAdding)} variant="primary" icon={Plus}>
            {isAdding ? 'Cancel' : 'Add New Word'}
          </Button>
        </div>
      </header>

      {isAdding && (
        <Card className="mb-8 fade-in border-primary">
          <form onSubmit={handleAddWord} className="word-form">
            <h3 className="mb-4">Add a new word</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Word</label>
                <input required type="text" name="word" value={formData.word} onChange={handleInputChange} className="form-input" placeholder="e.g. Ubiquitous" />
              </div>
              <div className="form-group">
                <label>Phonetic</label>
                <input type="text" name="phonetic" value={formData.phonetic} onChange={handleInputChange} className="form-input" placeholder="e.g. /juːˈbɪkwɪtəs/" />
              </div>
              <div className="form-group full-width">
                <label>Definition</label>
                <textarea required name="definition" value={formData.definition} onChange={handleInputChange} className="form-input textarea" placeholder="Present, appearing, or found everywhere." rows="2"></textarea>
              </div>
              <div className="form-group full-width">
                <label>Example Sentence</label>
                <textarea required name="example" value={formData.example} onChange={handleInputChange} className="form-input textarea" placeholder="His ubiquitous influence was felt by all the family." rows="2"></textarea>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button type="submit" disabled={loading} variant="primary">
                {loading ? 'Saving...' : 'Save Word'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Word</th>
              <th>Level</th>
              <th>Translation (UZ/EN)</th>
              <th>Example Sentence</th>
            </tr>
          </thead>
          <tbody>
            {words.map(w => (
              <tr key={w.id}>
                <td className="font-bold text-primary">
                  {w.word}
                  {w.article && <span className="text-xs text-muted ml-1">({w.article})</span>}
                </td>
                <td>
                  <span className={`level-badge level-${w.level?.toLowerCase()}`}>
                    {w.level}
                  </span>
                </td>
                <td>
                  <div className="flex flex-column gap-1">
                    <span className="text-sm">{w.translation_uz || w.meaning}</span>
                    <span className="text-xs text-muted">{w.translation_en}</span>
                  </div>
                </td>
                <td>
                  <p className="text-xs italic line-clamp-2" title={w.example_de || w.example}>
                    {w.example_de || w.example}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {words.length === 0 && !isAdding && (
          <div className="text-center p-8 text-muted">No words in the database yet. Add one!</div>
        )}
      </div>
    </div>
  );
}
