import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import './DictionaryPage.css';
import { wordService } from '../services/wordService';

export default function DictionaryPage() {
  const [words, setWords] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
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
      word.meaning?.toLowerCase().includes(term)
    );
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredWords.length / itemsPerPage);
  const currentWords = filteredWords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
   
  // Reset page when searching
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

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
        <div className="search-bar-wrapper">
          <input
            type="text"
            className="dictionary-search-input"
            placeholder="Nemischa, o'zbekcha yoki inglizcha qidiring..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search size={22} className="search-icon" />
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center mt-12"><div className="loader"></div></div>
      ) : (
        <>
          <div className="table-responsive mt-8">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="w-12 text-center">№</th>
                <th>Word</th>
                <th>Level</th>
                <th>Translation (UZ/EN)</th>
                <th>Example Sentence</th>
              </tr>
            </thead>
            <tbody>
              {currentWords.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center p-12 text-muted">
                    So'z topilmadi.
                  </td>
                </tr>
              ) : (
                currentWords.map((word, index) => (
                  <tr key={word.id}>
                    <td className="text-center text-xs text-muted font-mono">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="font-bold text-primary">
                      {word.article && <span className="text-blue-400">{word.article} </span>}
                      {word.word}
                    </td>
                    <td className="text-center">
                      <span className={`level-badge level-${word.level?.toLowerCase() || 'a1'}`}>
                        {word.level || 'A1'}
                      </span>
                    </td>
                    <td>
                      <div className="flex flex-col gap-1.5 py-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-1 py-0.5 rounded bg-blue-500/10 text-blue-400 min-w-[24px] text-center">UZ</span>
                          <span className="text-sm border-l border-white/10 pl-2">{word.translation_uz || word.meaning}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-1 py-0.5 rounded bg-green-500/10 text-green-400 min-w-[24px] text-center">EN</span>
                          <span className="text-xs text-muted border-l border-white/10 pl-2">{word.translation_en}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="example-text">
                        <p className="text-xs italic font-medium">"{word.example_de || word.example}"</p>
                        <p className="text-[10px] text-muted mt-1">{word.example_en}</p>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="pagination flex justify-center items-center gap-4 mt-8 pb-12">
            <Button 
              variant="secondary" 
              size="sm" 
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Oldingi
            </Button>
            <div className="text-sm font-medium">
              Sahifa {currentPage} / {totalPages}
            </div>
            <Button 
              variant="secondary" 
              size="sm" 
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Keyingi
            </Button>
          </div>
        )}
        </>
      )}
    </div>
  );
}
