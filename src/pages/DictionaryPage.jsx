import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import Card from '../components/Card';
import './DictionaryPage.css';
import { wordService } from '../services/wordService';

export default function DictionaryPage() {
  const [words, setWords] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWords = async () => {
      try {
        const allWords = await wordService.getAllWords();
        setWords(allWords);
      } catch (error) {
        console.error("Failed to load dictionary", error);
      } finally {
        setLoading(false);
      }
    };
    fetchWords();
  }, []);

  const filteredWords = words.filter(word => {
    const term = searchQuery.toLowerCase();
    return (
      word.word?.toLowerCase().includes(term) ||
      word.translation_uz?.toLowerCase().includes(term) ||
      word.translation_en?.toLowerCase().includes(term) ||
      word.meaning?.toLowerCase().includes(term) // fallback
    );
  });

  return (
    <div className="dictionary-container fade-in">
      <header className="dictionary-header">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Search size={28} className="text-primary" />
            Dictionary
          </h1>
          <p className="text-muted mt-2">Search through {words.length} German vocabulary words.</p>
        </div>
        <div className="search-bar-wrapper mt-6 relative w-full max-w-2xl">
          <Search size={20} className="search-icon absolute left-4 top-1/2 transform translate-y-[-50%] text-muted" />
          <input
            type="text"
            className="dictionary-search-input pl-12 pr-4 py-4 w-full bg-card border border-primary/20 rounded-xl focus:border-primary focus:outline-none transition-colors"
            placeholder="Search by German, Uzbek, or English..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center mt-12"><div className="loader"></div></div>
      ) : (
        <div className="dictionary-grid mt-8">
          {filteredWords.length === 0 ? (
            <div className="col-span-full text-center p-12 text-muted">
              No words found for "{searchQuery}".
            </div>
          ) : (
            filteredWords.slice(0, 100).map(word => ( // Limit to 100 to prevent lagging UI
              <Card key={word.id} className="dictionary-card p-6 border-l-4 border-l-primary hover:border-l-secondary transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                      {word.article && <span className="text-primary text-sm font-normal">{word.article}</span>}
                      {word.word}
                    </h2>
                    {word.plural && <p className="text-sm text-muted">Plural: {word.plural}</p>}
                  </div>
                  <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    {word.level}
                  </span>
                </div>
                
                <div className="translations mb-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400">UZ</span>
                    <p className="text-gray-200">{word.translation_uz || word.meaning}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-green-500/10 text-green-400">EN</span>
                    <p className="text-gray-400">{word.translation_en}</p>
                  </div>
                </div>

                {(word.example_de || word.example) && (
                  <div className="example-box bg-background/30 p-4 rounded-xl mt-4 border border-white/5">
                    <p className="text-sm italic text-gray-300 font-medium">"{word.example_de || word.example}"</p>
                    {(word.example_en) && <p className="text-xs text-muted mt-2 border-t border-white/5 pt-2">{word.example_en}</p>}
                  </div>
                )}

                {word.verb_conjugation && (
                   <div className="conjugations mt-4 pt-4 border-t border-card-border">
                     <p className="text-xs font-bold text-primary mb-2 uppercase tracking-wide">Präsens Conjugation</p>
                     <div className="grid grid-cols-2 gap-2 text-sm text-gray-400">
                        <div><span className="text-white">ich</span> {word.verb_conjugation.ich}</div>
                        <div><span className="text-white">wir</span> {word.verb_conjugation.wir}</div>
                        <div><span className="text-white">du</span> {word.verb_conjugation.du}</div>
                        <div><span className="text-white">ihr</span> {word.verb_conjugation.ihr}</div>
                        <div><span className="text-white">er/sie/es</span> {word.verb_conjugation.er_sie_es}</div>
                        <div><span className="text-white">sie/Sie</span> {word.verb_conjugation.sie_Sie}</div>
                     </div>
                   </div>
                )}
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
