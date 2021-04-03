const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const objectId = require("mongodb").ObjectID;
   
const app = express();
const jsonParser = express.json();
 
const mongoClient = new MongoClient("mongodb://localhost:27017/", { useUnifiedTopology: true });
 
let dbClient;
 
app.use(express.static(__dirname + "/public"));
 
mongoClient.connect(function(err, client){
    if(err) return console.log(err);
    dbClient = client;
    app.locals.collection = client.db("booksdb").collection("books");
    app.listen(3000, function(){
        console.log("Сервер ожидает подключения...");
    });
});
 
app.get("/api/books", function(req, res){
        
    const collection = req.app.locals.collection;
    collection.find({}).toArray(function(err, books){
         
        if(err) return console.log(err);
        res.send(books)
    });
     
});
app.get("/api/books/:id", function(req, res){
        
    const id = new objectId(req.params.id);
    const collection = req.app.locals.collection;
    collection.findOne({_id: id}, function(err, book){
               
        if(err) return console.log(err);
        res.send(book);
    });
});
   
app.post("/api/books", jsonParser, function (req, res) {
       
    if(!req.body) return res.sendStatus(400);
       
    const bookName = req.body.name;
    const bookAuthor = req.body.author;
	const bookYear = req.body.year;
    const book = {name: bookName, author: bookAuthor, year: bookYear};
       
    const collection = req.app.locals.collection;
    collection.insertOne(book, function(err, result){
               
        if(err) return console.log(err);
        res.send(book);
    });
});
    
app.delete("/api/books/:id", function(req, res){
        
    const id = new objectId(req.params.id);
    const collection = req.app.locals.collection;
    collection.findOneAndDelete({_id: id}, function(err, result){
               
        if(err) return console.log(err);    
        let book = result.value;
        res.send(book);
    });
});
   
app.put("/api/books", jsonParser, function(req, res){
        
    if(!req.body) return res.sendStatus(400);
    const id = new objectId(req.body.id);
    const bookName = req.body.name;
    const bookAuthor = req.body.author;
	const bookYear = req.body.year;
       
    const collection = req.app.locals.collection;
    collection.findOneAndUpdate({_id: id}, { $set: {name: bookName, author: bookAuthor, year: bookYear}},
         {returnOriginal: false },function(err, result){
               
        if(err) return console.log(err);     
        const book = result.value;
        res.send(book);
    });
});
 
// прослушиваем прерывание работы программы (ctrl-c)
process.on("SIGINT", () => {
    dbClient.close();
    process.exit();
});
