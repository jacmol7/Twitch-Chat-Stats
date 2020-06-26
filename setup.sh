echo "clone git repository"
git clone https://github.com/jacmol7/Twitch-Chat-Stats

echo "make start script executable"
chmod +x Twitch-Chat-Stats/backend/start.sh

echo "run start script"
(cd Twitch-Chat-Stats/backend && sh ./Twitch-Chat-Stats/backend/start.sh)