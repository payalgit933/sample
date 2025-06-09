from flask import Flask, jsonify, request
from flask_cors import CORS
from faker import Faker
import random
import os
import re
from models import db, Product, ChatMessage
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///ecommerce.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

# Seed some products
def seed_data():
    fake = Faker()
    categories = ['Electronics', 'Books', 'Clothing', 'Shoes', 'Home']

    for _ in range(100):
        product = Product(
            name=fake.word().capitalize() + " " + fake.word().capitalize(),
            category=random.choice(categories),
            price=random.randint(200, 5000),
            description=fake.sentence()
        )
        db.session.add(product)
    db.session.commit()

# Products API with filters
@app.route('/api/products', methods=['GET'])
def get_products():
    category = request.args.get('category')
    max_price = request.args.get('max_price')
    min_price = request.args.get('min_price')

    query = Product.query

    if category:
        query = query.filter(Product.category.ilike(f'%{category}%'))
    if max_price:
        query = query.filter(Product.price <= int(max_price))
    if min_price:
        query = query.filter(Product.price >= int(min_price))

    products = query.all()

    # Log user query
    user_msg = ChatMessage(sender='user', text=request.query_string.decode())
    db.session.add(user_msg)

    # Bot response
    bot_msg = ChatMessage(
        sender='bot',
        text=f"{len(products)} products matched." if products else "No products found."
    )
    db.session.add(bot_msg)
    db.session.commit()

    return jsonify([
        {
            'id': p.id,
            'name': p.name,
            'category': p.category,
            'price': p.price,
            'description': p.description
        } for p in products
    ])
@app.route('/api/products/<int:product_id>', methods=['GET'])
def get_product_detail(product_id):
    product = Product.query.get(product_id)
    if product:
        return jsonify({
            'id': product.id,
            'name': product.name,
            'category': product.category,
            'price': product.price,
            'description': product.description
        })
    return jsonify({'error': 'Product not found'}), 404

# Get all chat messages
@app.route('/api/chats', methods=['GET'])
def get_chats():
    messages = ChatMessage.query.order_by(ChatMessage.timestamp).all()
    return jsonify([
        {
            'sender': m.sender,
            'text': m.text,
            'timestamp': m.timestamp.strftime('%Y-%m-%d %H:%M:%S')
        }
        for m in messages
    ])

# Chat message POST endpoint with product query
@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    user_text = data.get('text', '').lower()

    # Save user message
    user_msg = ChatMessage(sender='user', text=user_text)
    db.session.add(user_msg)
    db.session.commit()

    # NLP-style parsing
    category = None
    min_price = None
    max_price = None
    categories = ['electronics', 'books', 'clothing', 'shoes', 'home']

    for cat in categories:
        if cat in user_text:
            category = cat
            break

    under_match = re.search(r'(under|below|less than) (\d+)', user_text)
    over_match = re.search(r'(over|above|more than) (\d+)', user_text)

    if under_match:
        max_price = int(under_match.group(2))
    if over_match:
        min_price = int(over_match.group(2))

    query = Product.query
    if category:
        query = query.filter(Product.category.ilike(f'%{category}%'))
    if max_price is not None:
        query = query.filter(Product.price <= max_price)
    if min_price is not None:
        query = query.filter(Product.price >= min_price)

    products = query.limit(5).all()

    if products:
        product_names = ", ".join([p.name for p in products])
        bot_reply = f"I found {len(products)} products matching your request: {product_names}."
    else:
        model = genai.GenerativeModel('gemini-pro')
        gemini_response = model.generate_content(user_text)
        bot_reply = gemini_response.text

    bot_msg = ChatMessage(sender='bot', text=bot_reply)
    db.session.add(bot_msg)
    db.session.commit()

    return jsonify({
        'user': {'sender': 'user', 'text': user_text},
        'bot': {
            'sender': 'bot',
            'text': bot_reply,
            'products': [
                {
                    'id': p.id,
                    'name': p.name,
                    'category': p.category,
                    'price': p.price,
                    'description': p.description
                } for p in products
            ]
        }
    })

# Reset chat messages
@app.route('/api/reset', methods=['POST'])
def reset_chat():
    ChatMessage.query.delete()
    db.session.commit()
    return jsonify({'status': '✅ Chat reset successful'})

# Initialize and run
if __name__ == '__main__':
    with app.app_context():
        if not os.path.exists('ecommerce.db'):
            db.create_all()
            seed_data()
            print("✅ Database created and seeded.")
        else:
            print("🗂️ Database already exists.")
    app.run(debug=True)
