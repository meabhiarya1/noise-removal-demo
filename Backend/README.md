# 1. Start Ubuntu with wsl 
wsl -d Ubuntu 

# 2. Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# 3. Install Python deps
pip install -r requirements.txt
pip install -r DeepFilterNet/requirements.txt

# 4. Install Node deps
npm install

# 5. Run the server
npm start


GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
COOKIE_KEY=

Update these things in .env file.