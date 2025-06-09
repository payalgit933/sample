🛍️ E-Commerce Sales Chatbot
An interactive chatbot web app that helps users discover products from an e-commerce database using natural language. Built with React (frontend), Flask (backend), and Gemini API for intelligent responses.

🔧 Tech Stack
Frontend: React.js, Axios, CSS

Backend: Flask, Flask-CORS, SQLAlchemy

Database: SQLite

AI Integration: Google Gemini API (gemini-pro)

Others: Faker, dotenv

🚀 Features
💬 Chat with an AI bot to discover products

🔍 Filters by category, min/max price using natural queries (e.g. "Show me electronics under 1000")

📦 View product details by clicking product names

🔄 Reset conversation

🧠 Gemini AI fallback for unrelated queries

🖼️ Screenshots
(You can insert screenshots or Loom video here)

📂 Project Structure
bash
Copy
Edit
├── backend/
│   ├── app.py                # Flask backend with APIs
│   ├── models.py             # DB models (Product, ChatMessage)
│   └── ecommerce.db          # SQLite DB (auto-generated)
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.jsx           # Main React component
│   │   └── App.css
├── .env                      # Contains GEMINI_API_KEY
🔑 Environment Variables
Create a .env file in the root with:

ini
Copy
Edit
GEMINI_API_KEY=your_api_key_here
🛠️ Setup Instructions
Backend (Flask)
bash
Copy
Edit
cd backend
pip install -r requirements.txt
python app.py
Frontend (React)
bash
Copy
Edit
cd frontend
npm install
npm start
Make sure the Flask server is running on localhost:5000.

📡 API Endpoints
Endpoint	Method	Description
/api/products	GET	Fetch products with filters
/api/products/<id>	GET	Get product detail
/api/chat	POST	Send message to chatbot
/api/chats	GET	Fetch chat history
/api/reset	POST	Clear chat messages

🧪 Example Queries
“Show me books under 500”

“I want shoes above 1000”

“Clothing between 1000 and 2000”

“Tell me a joke” (Triggers Gemini)