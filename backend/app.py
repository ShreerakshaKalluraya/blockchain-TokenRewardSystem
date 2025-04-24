from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_mysqldb import MySQL
import bcrypt

app = Flask(__name__)
CORS(app)

# ✅ MySQL Config (Using flask-mysqldb)
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = 'Raksha@2004'  # Your MySQL password
app.config['MYSQL_DB'] = 'auth_db'

mysql = MySQL(app)

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data['username']
    password = data['password'].encode('utf-8')
    email = data['email']
    wallet = data['wallet']
    user_type = data['userType']  # 'customer' or 'not_customer'

    hashed = bcrypt.hashpw(password, bcrypt.gensalt())

    cur = mysql.connection.cursor()
    try:
        cur.execute(
            "INSERT INTO users (username, password, email, wallet_address, user_type) VALUES (%s, %s, %s, %s, %s)",
            (username, hashed, email, wallet, user_type)
        )
        mysql.connection.commit()
        return jsonify({'message': 'User registered successfully!'})
    except Exception as e:
        return jsonify({'error': str(e)})
    finally:
        cur.close()


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data['username']
    password = data['password'].encode('utf-8')

    cur = mysql.connection.cursor()
    cur.execute("SELECT password, user_type FROM users WHERE username = %s", (username,))
    result = cur.fetchone()
    cur.close()

    print("DB result:", result)  # Debug print

    if result:
        stored_hashed = result[0]
        user_type = result[1].lower()  # Convert to lowercase for consistency

        # Ensure stored_hashed is bytes
        if isinstance(stored_hashed, str):
            stored_hashed = stored_hashed.encode('utf-8')

        if bcrypt.checkpw(password, stored_hashed):
            print(f"✅ Login successful for {user_type}")
            return jsonify({
                'message': 'Login successful',
                'user_type': user_type
            })

    # If credentials are incorrect or user not found
    return jsonify({'error': 'Invalid credentials'}), 401

if __name__ == '__main__':
    app.run(debug=True,port=3000)
