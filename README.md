# 1. Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# 2. Install Python deps
pip install -r requirements.txt
pip install -r DeepFilterNet/requirements.txt

# 3. Install Node deps
npm install

# 4. Run the server
node server.js or npm start
