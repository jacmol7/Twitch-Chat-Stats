const {fork} = require('child_process');
const {Pool} = require('pg');
const fs = require('fs');

const dbOptions = JSON.parse(fs.readFileSync('sqlSettings.json'));

const p = fork('main.js');

p.on('message', (msg) => {
    if(msg === 'connected') {
        //p.send('stuff to connect to')
        p.send(['pokimane','jacmol7']);
    }
});

// connect to database
const sqlPool = new Pool({
    user: dbOptions.user,
    host: dbOptions.host,
    database: dbOptions.database,
    password: dbOptions.password,
    port: dbOptions.port
});
sqlPool.connect();

const query = 'SELECT name FROM streamer';
sqlPool.query(query, [], (err, res) => {
    if(err) {
        console.error(err);
        return;
    }

    let groups = [];
    let group = [];
    let count = 0;
    for(let streamer of res.rows) {
        if(count == 100) {
            groups.push(group);
            group = [];
            count = 0;
        } else {
            group.push(streamer.name);
            count++;
        }
    }
    if(group.length != 0) {
        groups.push(group);
    }

    for(let i = 0; i < groups.length; i++) {
        let p = fork('main.js');
        p.on('message', (msg) => {
            if(msg === 'connected') {
                p.send(groups[i]);
            }
        })
    }
    
})
