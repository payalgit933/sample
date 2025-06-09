import React, { useState } from 'react';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState("");

  const handleLogin = () => {
    if (username.trim()) {
      localStorage.setItem("user", username);
      onLogin(username);
    }
  };

  return (
    <div className="chat-container">
      <h2>🔐 Login</h2>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Enter username"
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default Login;
