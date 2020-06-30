echo "stop existing containers"
docker-compose -p twitchstats down

echo "start"
docker-compose -p twitchstats up --build -d

