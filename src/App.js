import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchMessages = async () => {
    const res = await axios.get('http://localhost:5000/api/chats');
    setMessages(res.data);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const sendMessage = async () => {
    if (!userInput.trim()) return;

    const res = await axios.post('http://localhost:5000/api/chat', {
      text: userInput,
    });

    setMessages([...messages, res.data.user, res.data.bot]);
    setUserInput('');
    setSelectedProduct(null);
  };

  const handleProductClick = async (product) => {
  const res = await axios.get(`http://localhost:5000/api/products/${product.id}`);
  setSelectedProduct(res.data);
};


  const handleReset = async () => {
    const confirmReset = window.confirm("Are you sure you want to reset the chat?");
    if (!confirmReset) return;

    try {
      await axios.post('http://localhost:5000/api/reset');
      setMessages([]);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error resetting chat:', error);
    }
  };

  return (
    <div className="chat-container">
      <h2>E-Commerce Chatbot</h2>

      <div className="chat-box" style={{ minHeight: '300px' }}>
        {messages.map((msg, i) => (
          <div key={i} className={`msg ${msg.sender}`}>
            <b>{msg.sender === 'user' ? 'You' : 'Bot'}:</b>{' '}
            {msg.sender === 'bot' && msg.products ? (
              <ul>
                {msg.products.map((p) => (
                  <li
                    key={p.id}
                    style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}
                    onClick={() => handleProductClick(p)}
                  >
                    {p.name}
                  </li>
                ))}
              </ul>
            ) : (
              msg.text
            )}
          </div>
        ))}
      </div>

      {selectedProduct && (
        <div className="product-details" style={{ border: '1px solid #ddd', padding: '10px', marginTop: '10px' }}>
          <h3>{selectedProduct.name}</h3>
          <p><b>Category:</b> {selectedProduct.category}</p>
          <p><b>Price:</b> ₹{selectedProduct.price}</p>
          <p><b>Description:</b> {selectedProduct.description}</p>
          <button onClick={() => setSelectedProduct(null)}>Close</button>
        </div>
      )}

      <div className="input-area" style={{ marginTop: '10px' }}>
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask about products..."
        />
        <button onClick={sendMessage}>Send</button>
        <button className="reset-btn" onClick={async () => {
          await axios.post('http://localhost:5000/api/reset');
          setMessages([]);
          setSelectedProduct(null);
        }}>
          Reset Chat
        </button>
      </div>
    </div>
  );
}

export default App;
