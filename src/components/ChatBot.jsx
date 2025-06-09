import React, { useState } from 'react';
import axios from 'axios';
import './ChatBot.css';

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState('');

  const sendMessage = async () => {
    if (!query.trim()) return;

    const userMsg = { sender: 'user', text: query };
    setMessages([...messages, userMsg]);

    try {
      const params = {};

      // Simple query parsing
      if (query.toLowerCase().includes('under')) {
        const words = query.split(' ');
        const price = words.find(w => /^\d+$/.test(w));
        if (price) params.max_price = price;
      }

      if (query.toLowerCase().includes('electronics')) {
        params.category = 'Electronics';
      }

      const res = await axios.get('http://localhost:5000/api/products', { params });

      const botReply = {
        sender: 'bot',
        text: res.data.length
          ? `Here are ${res.data.length} product(s):`
          : 'No products found for your query.',
        products: res.data,
      };

      setMessages(prev => [...prev, botReply]);
    } catch (err) {
      console.error(err);
    }

    setQuery('');
  };

  return (
    <div className="chat-container">
      <div className="chat-box">
        {messages.map((msg, i) => (
          <div key={i} className={`msg ${msg.sender}`}>
            <p>{msg.text}</p>
            {msg.products && (
              <ul>
                {msg.products.map(p => (
                  <li key={p.id}>
                    <strong>{p.name}</strong> – ₹{p.price} <br />
                    <em>{p.description}</em>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      <div className="input-area">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Ask about a product..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatBot;
