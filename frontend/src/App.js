import React, { useState, useEffect } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import './App.css';

function App() {
  const [category, setCategory] = useState('Home_and_Kitchen_5');
  const [rating, setRating] = useState('5.0');
  const [review, setReview] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recentReviews, setRecentReviews] = useState([]);
  const [activeTab, setActiveTab] = useState('analyzer');
  const [isTyping, setIsTyping] = useState(false);

  // Dashboard summary
  const totalAnalyzed = recentReviews.length;
  const fakeCount = recentReviews.filter(r => r.result?.is_fake).length;
  const genuineCount = totalAnalyzed - fakeCount;

  // Netflix-style hero banner texts
  const heroTexts = [
    "Detect Fake Reviews Like a Pro",
    "AI-Powered Review Analysis",
    "Protect Your Business from Fraud",
    "Real-time Review Verification"
  ];
  const [currentHeroText, setCurrentHeroText] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroText((prev) => (prev + 1) % heroTexts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

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
          timestamp: new Date().toLocaleString(),
          id: Date.now()
        },
        ...prev.slice(0, 9)
      ]);
    } catch (error) {
      setResult({ error: 'API error - Make sure backend is running on port 5000' });
    }
    setLoading(false);
  };

  // Netflix-style confidence bar
  const ConfidenceBar = ({ confidence }) => {
    const percent = Math.round(confidence * 100);
    return (
      <div className="confidence-container">
        <div className="confidence-label">
          AI Confidence: <span className="confidence-percent">{percent}%</span>
        </div>
        <div className="confidence-bar">
          <div 
            className="confidence-fill"
            style={{ 
              width: `${percent}%`,
              background: percent > 70 ? '#e50914' : percent > 40 ? '#e87c03' : '#46d369'
            }}
          />
        </div>
      </div>
    );
  };

  // Netflix card component for reviews
  const ReviewCard = ({ item, index }) => (
    <div className="netflix-card" style={{ animationDelay: `${index * 0.1}s` }}>
      <div className="card-header">
        <div className="card-badge" style={{ 
          background: item.result.is_fake ? '#e50914' : '#46d369' 
        }}>
          {item.result.is_fake ? 'FAKE' : 'GENUINE'}
        </div>
        <div className="card-meta">
          <span className="card-category">{item.category.replace('_5', '')}</span>
          <span className="card-rating">⭐ {item.rating}</span>
        </div>
      </div>
      
      <div className="card-content">
        <p className="review-text">{item.review}</p>
      </div>

      <div className="card-footer">
        <div className="card-timestamp">{item.timestamp}</div>
        {item.result.predicted_label && (
          <div className="card-prediction">
            Label: <strong>{item.result.predicted_label}</strong>
          </div>
        )}
        {item.result.confidence && item.result.confidence !== 'N/A' && (
          <ConfidenceBar confidence={item.result.confidence} />
        )}
      </div>
    </div>
  );

  return (
    <div className="netflix-app">
      {/* Netflix-style Header */}
      <header className="netflix-header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">🔍</span>
            <span className="logo-text">ReviewDetect</span>
          </div>
          <nav className="nav-tabs">
            <button 
              className={`nav-tab ${activeTab === 'analyzer' ? 'active' : ''}`}
              onClick={() => setActiveTab('analyzer')}
            >
              Analyzer
            </button>
            <button 
              className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              Dashboard
            </button>
            <button 
              className={`nav-tab ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              History
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="hero-banner">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="hero-text-slide">
              {heroTexts[currentHeroText]}
            </span>
          </h1>
          <p className="hero-subtitle">
            Advanced AI technology to identify suspicious product reviews and protect consumers
          </p>
        </div>
        <div className="hero-gradient"></div>
      </section>

      {/* Main Content */}
      <main className="main-content">
        {/* Stats Overview */}
        <section className="stats-section">
          <div className="stats-grid">
            <div className="stat-card stat-total">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <div className="stat-value">{totalAnalyzed}</div>
                <div className="stat-label">Total Analyzed</div>
              </div>
            </div>
            <div className="stat-card stat-fake">
              <div className="stat-icon">🚨</div>
              <div className="stat-content">
                <div className="stat-value">{fakeCount}</div>
                <div className="stat-label">Fake Reviews</div>
              </div>
            </div>
            <div className="stat-card stat-genuine">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <div className="stat-value">{genuineCount}</div>
                <div className="stat-label">Genuine Reviews</div>
              </div>
            </div>
          </div>
        </section>

        {/* Analyzer Section */}
        <section className="analyzer-section">
          <div className="section-header">
            <h2>Review Analyzer</h2>
            <p>Paste or type a product review to check its authenticity</p>
          </div>

          <form onSubmit={handleSubmit} className="analyzer-form">
            <div className="form-row">
              <div className="form-group category-select">
                <label>Product Category</label>
                <select 
                  value={category} 
                  onChange={e => setCategory(e.target.value)}
                  className="netflix-select"
                >
                  <option value="Home_and_Kitchen_5">🏠 Home & Kitchen</option>
                  <option value="Sports_5">⚽ Sports</option>
                  <option value="Office_5">💼 Office</option>
                  <option value="Electronics_5">📱 Electronics</option>
                  <option value="Other_5">📦 Other</option>
                </select>
              </div>
              
              <div className="form-group rating-input">
                <label>Rating</label>
                <input 
                  type="number" 
                  min="1" 
                  max="5" 
                  step="0.1" 
                  value={rating} 
                  onChange={e => setRating(e.target.value)}
                  className="netflix-input"
                  placeholder="5.0"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Review Text</label>
              <textarea
                value={review}
                onChange={(e) => {
                  setReview(e.target.value);
                  setIsTyping(true);
                  setTimeout(() => setIsTyping(false), 1000);
                }}
                rows={6}
                className={`netflix-textarea ${isTyping ? 'typing' : ''}`}
                placeholder="Type or paste the product review here for analysis..."
              />
            </div>

            <button
              type="submit"
              disabled={loading || !review}
              className={`analyze-btn ${loading ? 'loading' : ''} ${!review ? 'disabled' : ''}`}
            >
              <span className="btn-content">
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    🕵️‍♂️ Analyze Review
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Results */}
          <TransitionGroup>
            {result && (
              <CSSTransition timeout={500} classNames="result-transition">
                <div className={`result-card ${result.is_fake ? 'fake' : 'genuine'}`}>
                  <div className="result-header">
                    <div className="result-icon">
                      {result.is_fake ? '🚨' : '✅'}
                    </div>
                    <div className="result-title">
                      {result.is_fake ? 'Fake Review Detected' : 'Genuine Review'}
                    </div>
                  </div>
                  
                  {!result.error && (
                    <div className="result-details">
                      {result.predicted_label && (
                        <div className="result-meta">
                          <strong>AI Prediction:</strong> {result.predicted_label}
                        </div>
                      )}
                      {result.confidence && result.confidence !== 'N/A' && (
                        <ConfidenceBar confidence={result.confidence} />
                      )}
                    </div>
                  )}
                  
                  {result.error && (
                    <div className="result-error">
                      {result.error}
                    </div>
                  )}
                </div>
              </CSSTransition>
            )}
          </TransitionGroup>
        </section>

        {/* Recent Reviews Section */}
        <section className="recent-section">
          <div className="section-header">
            <h2>Recent Analysis</h2>
            <p>Last {recentReviews.length} reviews analyzed</p>
          </div>

          {recentReviews.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h3>No Reviews Analyzed Yet</h3>
              <p>Submit your first review to see the analysis results here</p>
            </div>
          ) : (
            <div className="cards-grid">
              <TransitionGroup component={null}>
                {recentReviews.map((item, index) => (
                  <CSSTransition key={item.id} timeout={500} classNames="card-transition">
                    <ReviewCard item={item} index={index} />
                  </CSSTransition>
                ))}
              </TransitionGroup>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="netflix-footer">
        <div className="footer-content">
          <div className="footer-logo">ReviewDetect</div>
          <div className="footer-copyright">
            &copy; {new Date().getFullYear()} Fake Product Review Detection System
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;