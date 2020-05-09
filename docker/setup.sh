echo "clone git repository"
git clone https://github.com/jacmol7/Twitch-Chat-Stats

echo "move files from git to setup folders for docker containers"
mv Twitch-Chat-Stats/backend/TwitchDataApi TwitchDataApi
mv Twitch-Chat-Stats/backend/TwitchLogger TwitchLogger

echo "remove unused parts of the cloned git repository"
rm -rf Twitch-Chat-Stats

echo "copy config files to docker setup folders"
cp twitchSettings.json TwitchLogger
cp mongodbSettings.json TwitchLogger
cp mongodbSettings.json TwitchDataApi

echo "start docker compose"
docker-compose -p twitchstats up --build -d

echo "remove cloned files from git"
rm -rf TwitchDataApi/TwitchDataApi
rm -rf TwitchLogger/TwitchLogger