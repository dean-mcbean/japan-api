const express = require('express')
const https = require('https');
const cors = require("cors");
const fs = require('fs');
const path = require('path');
const app = express()
const port = 3000
const allowedOrigins = ["joypea.app", "localhost"];
app.use(cors({ origin: "*" }));
app.use(express.json());

// Middleware to log a summary of each request
app.use((req, res, next) => {
  const { method, url } = req;
  console.log(`[${new Date().toISOString()}]`);
  console.log(`[${method}] ${url}`);

  // Override res.send() to log the response
  const originalSend = res.send;
  res.send = function (body) {
    console.log(`[Response] ${JSON.stringify(body)}`);
    originalSend.apply(res, arguments);
  };
  next(); // Pass control to the next middleware in the stack
});

const storage = require('node-persist');

const schedule = require('./data/schedule.json')





async function start() {
    console.log(" ")
    console.log(">> Starting server...")
    await storage.init({dir: 'cache'});
    
    app.get('/geolocate', (req, res) => {
      res.send(JSON.stringify(Object.values(req.query)))
    })

    app.get('/set', (req, res) => {
        for (key in req.query) {
            storage.setItem(key, req.query[key])
        }
    })
    app.get('/get', async (req, res) => {
        var out = "";
        for (key in req.query) {
            let val = await storage.getItem(key);
            out += key + '=' + val + '<br>'
        }
        res.send(out)
    })
    app.get('/schedule', async (req, res) => {
        res.send(schedule)
    })
    app.get('/places', async (req, res) => {
        const query = req.query.query
        const cached_place = await storage.getItem('place|' + query)
        if (cached_place) {
            res.send(cached_place)
        } else {
            res.sendStatus(404)
        }
    })
    app.put('/places', async (req, res) => {
        const query = req.query.query
        storage.setItem('place|' + query, req.body)
        res.send("Set!")
    })
    app.get('/img/:name', (req, res) => {
        var options = {
          root: path.join(__dirname, 'img'),
          dotfiles: 'deny',
          headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
          }
        }
      
        var fileName = req.params.name
        res.sendFile(fileName, options, function (err) {
          if (err) {
            next(err)
          } else {
            console.log('Sent:', fileName)
          }
        })
    })

    
    const privateKey = fs.readFileSync('/etc/letsencrypt/live/joypea.app/privkey.pem', 'utf8');
    const certificate = fs.readFileSync('/etc/letsencrypt/live/joypea.app/fullchain.pem', 'utf8');
    const credentials = {
        key: privateKey,
        cert: certificate,
      };
    
    // Create an HTTPS server with the Express app
    const httpsServer = https.createServer(credentials, app);
    httpsServer.listen(port, () => {
        console.log(`Server running on port ${port}`);
      });
}

start()

