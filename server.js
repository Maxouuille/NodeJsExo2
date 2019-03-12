var express = require('express');
const fs = require('fs');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

var app = express();
var port = process.env.PORT || 3000;
app.use(express.json());

// Connection URL
const url = 'mongodb://localhost:27017';
// Database Name
const dbName = 'chat-bot';

app.listen(port, () => {
  console.log("Listening on port", port);
})

app.get("/messages/all", async (req, res) => {
  const client = new MongoClient(url);
    try {
      await client.connect();
      const db = client.db(dbName);
      const col = db.collection('messages');
      const docs = await col.find().toArray();
      res.send(docs)
} catch (err) {
  console.log(err.stack);
}
  client.close();
});

app.delete('/messages/last', async (req, res) => {
  const client = new MongoClient(url);
    try {
      await client.connect();
      const db = client.db(dbName);
      const col = db.collection('messages');
      const docs = await col.find().toArray();
      const suppr1 = docs[docs.length - 1]
      const suppr2 = docs[docs.length - 2]
      r = await col.deleteOne(suppr1);
      assert.equal(1, r.deletedCount);
      r = await col.deleteOne(suppr2);
      assert.equal(1, r.deletedCount);
    } catch (err) {
  console.log(err.stack);
}
  client.close();
});

app.get("/hello", (req, res) => {
  res.send("Hello World\n");
})

app.post('/chat', async (req, res) => {
  const client = new MongoClient(url);
  var userMessage = req.body.msg
  try {
    await client.connect();
    const db = client.db(dbName);
    const col = db.collection('messages');
  
  switch(userMessage) {
    case "ville":
    const ville = await col.insertMany([{ from: 'user', msg: req.body.msg }, { from: 'bot', msg: 'Nous sommes à Paris' }]);
      res.send("Nous sommes à Paris\n");
      break;
    case "météo":
    const meteo = await col.insertMany([{ from: 'user', msg: req.body.msg }, { from: 'bot', msg: 'Il fait beau' }]);
      res.send("Il fait beau\n");
      break;
    case "demain":
      let rawdata = fs.readFileSync('réponses.json');
      let json = JSON.parse(rawdata);
      console.log(json.day);
      if(json.day == null) {
        res.send("Je ne connais pas demain…\n");
      }
      else {
        const demain = await col.insertMany([{ from: 'user', msg: req.body.msg }, { from: 'bot', msg: json.day }]);
        res.send(json.day);
      }

      break;
    case "demain = Mercredi":
      let day = { day: 'Mercredi', };
      let data = JSON.stringify(day);
      fs.writeFileSync('réponses.json', data);
      res.send("Mercredi");
      break;
    default:
      res.send("Réponse par défaut\n");
      break;
  }
} catch (err) {
  console.log(err.stack);
}
  client.close();
});