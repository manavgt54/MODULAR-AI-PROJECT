import React, { useEffect, useState } from 'react';
import queryDB from './utils/queryDB.js';
import { questions } from './data/questions.js';

const OfflineComponent = () => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [feedback, setFeedback] = useState(null); // To handle user feedback

  const handleSubmit = async (e) => {
    e.preventDefault();
    const answer = queryDB(input, questions);
    setResponse(answer);
    setFeedback(null); // Reset feedback when a new question is asked
    setInput('');

    try {
      await fetch('http://localhost:3001/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ input, response: answer })
      });
    } catch (err) {
      console.error('Error logging data:', err);
    }
  };

  const handleFeedback = async (type) => {
    setFeedback(type);
    try {
      await fetch('http://localhost:3001/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ input, response, feedback: type })
      });
    } catch (err) {
      console.error('Error sending feedback:', err);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
      <h2>🧠 Local Reasoning Bot</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something..."
          style={{ padding: '0.5rem', width: '80%' }}
        />
        <button type="submit" style={{ padding: '0.5rem' }}>
          Ask
        </button>
      </form>

      {response && (
        <div style={{ marginTop: '1rem', color: '#333' }}>
          <strong>Response:</strong> {response}

          <div style={{ marginTop: '0.5rem' }}>
            <button
              onClick={() => handleFeedback('up')}
              style={{
                marginRight: '0.5rem',
                backgroundColor: feedback === 'up' ? 'lightgreen' : 'white'
              }}
            >
              👍
            </button>

            <button
              onClick={() => handleFeedback('down')}
              style={{
                backgroundColor: feedback === 'down' ? 'lightcoral' : 'white'
              }}
            >
              👎
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfflineComponent;
