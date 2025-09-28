import React, { useState } from 'react';


function App() {
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
        body: JSON.stringify({ review }),
      });
      const data = await response.json();
      setResult(data);
      setRecentReviews(prev => [
        {
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#f8fafc,#e0e7ff)', padding: 0 }}>
      <div style={{ maxWidth: 700, margin: '40px auto', padding: 24, background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <h2 style={{ textAlign: 'center', color: '#6366f1', marginBottom: 24 }}>Fake Product Review Dashboard</h2>

        {/* Dashboard summary */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ background: '#f3f4f6', borderRadius: 12, padding: 16, flex: 1, marginRight: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 16, color: '#6366f1', fontWeight: 600 }}>Total Analyzed</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{totalAnalyzed}</div>
          </div>
          <div style={{ background: '#f3f4f6', borderRadius: 12, padding: 16, flex: 1, marginRight: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 16, color: '#e74c3c', fontWeight: 600 }}>Fake Reviews</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{fakeCount}</div>
          </div>
          <div style={{ background: '#f3f4f6', borderRadius: 12, padding: 16, flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 16, color: '#2ecc71', fontWeight: 600 }}>Genuine Reviews</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{genuineCount}</div>
          </div>
        </div>

        {/* Review analysis form */}
        <form onSubmit={handleSubmit}>
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
              background: '#6366f1',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '10px 24px',
              fontSize: 16,
              cursor: loading || !review ? 'not-allowed' : 'pointer',
              opacity: loading || !review ? 0.6 : 1,
              marginTop: 4
            }}
          >
            {loading ? 'Checking...' : 'Analyze Review'}
          </button>
        </form>

        {/* Current analysis result */}
        {result && (
          <div style={{ marginTop: 32, padding: 20, borderRadius: 12, background: '#f3f4f6', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            {result.error ? (
              <span style={{ color: '#e74c3c', fontWeight: 500 }}>{result.error}</span>
            ) : (
              <>
                <div style={{ fontSize: 20, fontWeight: 600, color: result.is_fake ? '#e74c3c' : '#2ecc71' }}>
                  {result.is_fake ? 'Fake Review Detected' : 'Review Seems Genuine'}
                </div>
                <ConfidenceBar confidence={result.confidence} />
              </>
            )}
          </div>
        )}

        {/* Recent analyzed reviews */}
        <div style={{ marginTop: 40 }}>
          <h3 style={{ color: '#6366f1', marginBottom: 12 }}>Recent Analyzed Reviews</h3>
          {recentReviews.length === 0 ? (
            <div style={{ color: '#94a3b8', fontSize: 15 }}>No reviews analyzed yet.</div>
          ) : (
            <div style={{ maxHeight: 260, overflowY: 'auto' }}>
              {recentReviews.map((item, idx) => (
                <div key={idx} style={{
                  background: '#fff',
                  borderRadius: 10,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  marginBottom: 12,
                  padding: 16,
                  borderLeft: `6px solid ${item.result.is_fake ? '#e74c3c' : '#2ecc71'}`
                }}>
                  <div style={{ fontSize: 15, color: '#6366f1', fontWeight: 500 }}>{item.timestamp}</div>
                  <div style={{ fontSize: 16, margin: '8px 0' }}><strong>Review:</strong> {item.review}</div>
                  <div style={{ fontWeight: 600, color: item.result.is_fake ? '#e74c3c' : '#2ecc71' }}>
                    {item.result.is_fake ? 'Fake' : 'Genuine'}
                  </div>
                  <ConfidenceBar confidence={item.result.confidence} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13, marginTop: 24 }}>
        &copy; {new Date().getFullYear()} Fake Product Review System
      </div>
    </div>
  );
}

export default App;
