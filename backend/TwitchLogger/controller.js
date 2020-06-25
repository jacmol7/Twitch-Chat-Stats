const {fork} = require('child_process');
const {Pool} = require('pg');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

// the number of streamers for each process to handle
const streamerLimit = 250;

// settings for the DB connection
const dbOptions = JSON.parse(fs.readFileSync('sqlSettings.json'));

// connect to database
const sqlPool = new Pool({
    user: dbOptions.user,
    host: dbOptions.host,
    database: dbOptions.database,
    password: dbOptions.password,
    port: dbOptions.port
});
sqlPool.connect();

// all loggers and their id
var loggers = new Map();
// all streams being recorded and the id of the logger responsible
var streamers = new Map();
// the loggers that aren't at the limit and how far below they are
var waitingLoggers = new Map();

getStreamersFromDB();
// update the streams being logged every 2 minutes
setInterval(getStreamersFromDB,120000);

// get all streamers from the DB and start logging them
function getStreamersFromDB() {
    const query = 'SELECT name FROM streamer';
    sqlPool.query(query, [], (err, res) => {
        if(err) {
            console.error(err);
            return;
        }
        updateStreamers(res.rows.map((streamer) => {return streamer.name}));
    });
}

// update the list of streamers being logged
function updateStreamers(streams) {
    // streams that aren't being logged yet
    let newStreams = [];

    // find streams that aren't being logged yet
    for(let streamer of streams) {
        if(!streamers.has(streamer)) {
            newStreams.push(streamer);
        }
    }
    console.log(newStreams);

    // leave streams that don't need to be logged anymore
    for(let streamer of streamers.keys()) {
        if(!streams.includes(streamer)) {
            const loggerID = streamers.get(streamer);
            loggers.get(loggerID).send({leave:[streamer]});
            
            // add this logger to the loggers waiting for more streams
            if(waitingLoggers.has(loggerID)) {
                waitingLoggers.set(loggerID, waitingLoggers.get(loggerID)+1);
            } else {
                waitingLoggers.set(loggerID, 1);
            }
        }
    }

    // fill up loggers that aren't at the limit
    for(let loggerID of waitingLoggers.keys()) {
        console.log(`attempting to fill ${loggerID}`);
        const requestedNum = waitingLoggers.get(loggerID);
        if(newStreams.length > requestedNum) {
            // get enough streams to join
            const toJoin = newStreams.slice(0,requestedNum);
            newStreams = newStreams.slice(requestedNum, newStreams.length);
            console.log(`Joining: ${toJoin}`);
            console.log(`Next up: ${newStreams}`);
            try {
                // send join message
                loggers.get(loggerID).send({join:toJoin});
                // remove from wait list
                loggers.delete(loggerID);
                // record the logger responsible for these streams
                for(let streamer of toJoin) {
                    streamers.set(streamer, loggerID);
                }
            } catch (error) {
                // something went wrong, replace the logger
                const replacementID = replaceLogger(loggerID, toJoin);
                console.log(`Joining streams on ${loggerID} failed and was replaced by ${replacementID}`);
            }
        } else {
            // join the last few streams
            if(newStreams.length != 0) {
                try {
                    loggers.get(loggerID).send({join:newStreams});
                    // update count that the logger is waiting for or remove it from wait list
                    let newCount = requestedNum - newStreams.length;
                    console.log(`new remaining count is: ${newCount}`);
                    if(newCount === 0) {
                        waitingLoggers.delete(loggerID);
                    } else {
                        waitingLoggers.set(loggerID, newCount);
                    }
                    // record the logger responsible for these streams
                    for(let streamer of newStreams) {
                        streamers.set(streamer, loggerID);
                    }
                } catch (error) {
                    // something went wrong, replace the logger
                    const replacementID = replaceLogger(loggerID, toJoin);
                    console.log(`Joining streams on ${loggerID} failed and was replaced by ${replacementID}`);
                }
                
            }
            // stop because all streams have been joined
            return;
        }
    }

    // create new loggers if all are filled up
    let group = [];
    let count = 0;
    for(let streamer of newStreams) {
        if(count == streamerLimit) {
            spawnLogger(group);
            group = [streamer];
            count = 1;
        } else {
            group.push(streamer);
            count++;
        }
    }
    if(group.length != 0) {
        const id = spawnLogger(group);
        // record that this logger isn't full
        waitingLoggers.set(id, streamerLimit - group.length);
    }

    removeEmptyLoggers();
}

// replaces a failed logger, can be given new streams to join at the same time
function replaceLogger(loggerID, newStreams) {
    // get streams the old logger is monitoring
    for(let streamer of streamers) {
        if(streamers.get(streamer) === loggerID) {
            newStreams.push(streamer);
        }
    }
    // remove references to the old logger
    waitingLoggers.delete(loggerID);
    loggers.delete(loggerID);
    // returns the id of the replacement logger;
    return spawnLogger(newStreams);
}

function removeEmptyLoggers() {
    for(let loggerID of waitingLoggers) {
        if(waitingLoggers.get(loggerID) === streamerLimit) {
            console.log(`${loggerID} is unused, deleting`);
            waitingLoggers.delete(loggerID);
            loggers.get(loggerID).kill();
            loggers.delete(loggerID);
        }
    }
}

// start a new logger for a given list of streamers
function spawnLogger(streams) {
    const id = uuidv4();
    
    let p = fork('main.js',null,{
        env: {
            id: id
        }
    })
    
    loggers.set(id, p);

    // store which streams this logger is responsible for
    for(let streamer of streams) {
        streamers.set(streamer, id);
    }

    p.on('message', (msg) => {
        // send the streams to join once the logger is ready
        if(msg === 'connected') {
            p.send({join:streams});
        }
    });

    // replace the logger if it stops
    p.on('exit', () => {
        let newID = spawnLogger(streams);
        // remove references to the old logger
        waitingLoggers.delete(id);
        loggers.delete(id);
        for(let streamer of streamers.keys()) {
            if(streamers.get(streamer) === id) {
                streamers.set(streamer, newID);
            }
        }
    });

    return id;
}