import React, { useState } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';


function App() {
  const [category, setCategory] = useState('Home_and_Kitchen_5');
  const [rating, setRating] = useState('5.0');
  const [review, setReview] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recentReviews, setRecentReviews] = useState([]);

  // Dashboard summary
  const totalAnalyzed = recentReviews.length;
  const fakeCount = recentReviews.filter(r => r.result?.is_fake).length;
  const genuineCount = totalAnalyzed - fakeCount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, rating, review }),
      });
      const data = await response.json();
      setResult(data);
      setRecentReviews(prev => [
        {
          category,
          rating,
          review,
          result: data,
          timestamp: new Date().toLocaleString()
        },
        ...prev.slice(0, 9) // keep only last 10
      ]);
    } catch (error) {
      setResult({ error: 'API error' });
    }
    setLoading(false);
  };


  // Helper for confidence bar
  const ConfidenceBar = ({ confidence }) => {
    const percent = Math.round(confidence * 100);
    return (
      <div style={{ marginTop: 8 }}>
        <div style={{ background: '#eee', borderRadius: 8, height: 16, width: '100%' }}>
          <div style={{
            width: `${percent}%`,
            height: '100%',
            background: percent > 70 ? '#e74c3c' : percent > 40 ? '#f1c40f' : '#2ecc71',
            borderRadius: 8,
            transition: 'width 0.5s'
          }} />
        </div>
        <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>{percent}% confidence</div>
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(circle at 20% 40%, #e0e7ff 0%, #f8fafc 100%)', padding: 0 }}>
      <div style={{ maxWidth: 700, margin: '40px auto', padding: 24, background: 'rgba(255,255,255,0.95)', borderRadius: 24, boxShadow: '0 8px 32px rgba(99,102,241,0.12)' }}>
        <h2 style={{ textAlign: 'center', color: '#6366f1', marginBottom: 24, fontWeight: 800, letterSpacing: 1 }}>🕵️‍♂️ Fake Product Review Dashboard</h2>

        {/* Dashboard summary with animation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
          {[{label:'Total Analyzed',value:totalAnalyzed,color:'#6366f1'},{label:'Fake Reviews',value:fakeCount,color:'#e74c3c'},{label:'Genuine Reviews',value:genuineCount,color:'#2ecc71'}].map((stat, i) => (
            <div key={stat.label} style={{ background: '#f3f4f6', borderRadius: 16, padding: 20, flex: 1, marginRight: i<2?12:0, textAlign: 'center', boxShadow: '0 2px 8px rgba(99,102,241,0.06)', transition: 'transform 0.3s', transform: 'scale(1)', animation: `fadeInStat 0.7s ${i*0.2}s both` }}>
              <div style={{ fontSize: 17, color: stat.color, fontWeight: 700 }}>{stat.label}</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: stat.color }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Review analysis form with animated button */}
        <form onSubmit={handleSubmit} style={{ animation: 'fadeInForm 0.8s 0.2s both' }}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
            <select value={category} onChange={e => setCategory(e.target.value)} style={{ flex: 2, borderRadius: 8, border: '1px solid #cbd5e1', padding: 8, fontSize: 15 }}>
              <option value="Home_and_Kitchen_5">Home & Kitchen</option>
              <option value="Sports_5">Sports</option>
              <option value="Office_5">Office</option>
              <option value="Electronics_5">Electronics</option>
              <option value="Other_5">Other</option>
            </select>
            <input type="number" min="1" max="5" step="0.1" value={rating} onChange={e => setRating(e.target.value)} style={{ flex: 1, borderRadius: 8, border: '1px solid #cbd5e1', padding: 8, fontSize: 15 }} placeholder="Rating" />
          </div>
          <textarea
            value={review}
            onChange={e => setReview(e.target.value)}
            rows={5}
            style={{ width: '100%', borderRadius: 8, border: '1px solid #cbd5e1', padding: 12, fontSize: 16, resize: 'vertical', marginBottom: 12 }}
            placeholder="Paste or type a product review here..."
          />
          <button
            type="submit"
            disabled={loading || !review}
            style={{
              background: loading ? 'linear-gradient(90deg,#6366f1,#60a5fa)' : 'linear-gradient(90deg,#6366f1,#2ecc71)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '12px 28px',
              fontSize: 18,
              fontWeight: 700,
              boxShadow: loading ? '0 0 12px #6366f1' : '0 0 8px #2ecc71',
              cursor: loading || !review ? 'not-allowed' : 'pointer',
              opacity: loading || !review ? 0.7 : 1,
              marginTop: 4,
              transition: 'all 0.3s',
              animation: 'pulseBtn 1.2s infinite'
            }}
          >
            {loading ? 'Checking...' : 'Analyze Review'}
          </button>
        </form>

        {/* Current analysis result with animation */}
        <TransitionGroup>
          {result && (
            <CSSTransition timeout={500} classNames="fade">
              <div style={{ marginTop: 32, padding: 24, borderRadius: 16, background: result.is_fake ? 'rgba(231,76,60,0.08)' : 'rgba(46,204,113,0.08)', textAlign: 'center', boxShadow: '0 2px 12px rgba(99,102,241,0.08)', animation: 'fadeInResult 0.7s both' }}>
                {result.error ? (
                  <span style={{ color: '#e74c3c', fontWeight: 500 }}>{result.error}</span>
                ) : (
                  <>
                    <div style={{ fontSize: 22, fontWeight: 700, color: result.is_fake ? '#e74c3c' : '#2ecc71', marginBottom: 8 }}>
                      {result.is_fake ? '🚨 Fake Review Detected' : '✅ Review Seems Genuine'}
                    </div>
                    {result.predicted_label && (
                      <div style={{ fontSize: 15, color: '#6366f1', marginBottom: 8 }}>
                        <strong>Predicted Label:</strong> {result.predicted_label}
                      </div>
                    )}
                    {result.confidence && result.confidence !== 'N/A' && (
                      <ConfidenceBar confidence={result.confidence} />
                    )}
                  </>
                )}
              </div>
            </CSSTransition>
          )}
        </TransitionGroup>

        {/* Recent analyzed reviews with animation */}
        <div style={{ marginTop: 40 }}>
          <h3 style={{ color: '#6366f1', marginBottom: 12, fontWeight: 700, letterSpacing: 1 }}>Recent Analyzed Reviews</h3>
          {recentReviews.length === 0 ? (
            <div style={{ color: '#94a3b8', fontSize: 15 }}>No reviews analyzed yet.</div>
          ) : (
            <div style={{ maxHeight: 260, overflowY: 'auto' }}>
              <TransitionGroup>
                {recentReviews.map((item, idx) => (
                  <CSSTransition key={idx} timeout={500} classNames="fade">
                    <div style={{
                      background: '#fff',
                      borderRadius: 12,
                      boxShadow: '0 2px 8px rgba(99,102,241,0.06)',
                      marginBottom: 14,
                      padding: 18,
                      borderLeft: `6px solid ${item.result.is_fake ? '#e74c3c' : '#2ecc71'}`,
                      animation: 'fadeInReview 0.7s both'
                    }}>
                      <div style={{ fontSize: 15, color: '#6366f1', fontWeight: 500 }}>{item.timestamp}</div>
                      <div style={{ fontSize: 15, margin: '4px 0', color: '#6366f1' }}><strong>Category:</strong> {item.category} <strong>Rating:</strong> {item.rating}</div>
                      <div style={{ fontSize: 16, margin: '8px 0' }}><strong>Review:</strong> {item.review}</div>
                      <div style={{ fontWeight: 600, color: item.result.is_fake ? '#e74c3c' : '#2ecc71' }}>
                        {item.result.is_fake ? 'Fake' : 'Genuine'}
                      </div>
                      {item.result.predicted_label && (
                        <div style={{ fontSize: 14, color: '#6366f1', marginBottom: 4 }}>
                          <strong>Predicted Label:</strong> {item.result.predicted_label}
                        </div>
                      )}
                      {item.result.confidence && item.result.confidence !== 'N/A' && (
                        <ConfidenceBar confidence={item.result.confidence} />
                      )}
                    </div>
                  </CSSTransition>
                ))}
              </TransitionGroup>
            </div>
          )}
        </div>
      </div>
      <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13, marginTop: 24 }}>
        &copy; {new Date().getFullYear()} Fake Product Review System
      </div>
      <style>{`
        @keyframes fadeInStat { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes fadeInForm { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInResult { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes fadeInReview { from { opacity: 0; transform: translateX(-20px) scale(0.95); } to { opacity: 1; transform: translateX(0) scale(1); } }
        @keyframes pulseBtn { 0% { box-shadow: 0 0 8px #6366f1; } 50% { box-shadow: 0 0 16px #60a5fa; } 100% { box-shadow: 0 0 8px #6366f1; } }
        .fade-enter { opacity: 0; }
        .fade-enter-active { opacity: 1; transition: opacity 500ms; }
        .fade-exit { opacity: 1; }
        .fade-exit-active { opacity: 0; transition: opacity 500ms; }
      `}</style>
    </div>
  );
}

export default App;
