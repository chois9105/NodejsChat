//test git 2
var public_dir = "./front",
    port=3000,
    total_usr_cnt=0,
    total_room_cnt=0,
    Rooms_list=[];

var swig  = require('swig'),
    MongoClient = require('mongodb').MongoClient,
    express = require('express'),
    app = express(),
    io = require('socket.io').listen(app.listen(port));

    io.set('log level', 1); //decrease debug log.


    app.use('/js',express.static(public_dir+'/js'));
    app.use('/css',express.static(public_dir+'/css')); 
    app.use(express.bodyParser());

    app.engine('html', swig.renderFile);
    app.set('view engine', 'html');
    app.set('views', public_dir);

    // Swig will cache templates for you, but you can disable
    // that and use Express's caching instead, if you like:
    app.set('view cache', false);
    // To disable Swig's cache, do the following:
    swig.setDefaults({ cache: false });
    // NOTE: You should always cache templates in a production environment.
    // Don't leave both of these to `false` in production!

    app.get('/', function (req, res) {
      res.send('<script>location.href="/login";</script>');
    });


// mongodb connect
MongoClient.connect('mongodb://localhost:27017/ChatData', function(err, db) {
      if(err) throw err;

      db.dropDatabase(function() { //remove collection when starting server
      }); 

     var Room_collection = db.collection('Rooms');
     var Chat_collection = db.collection('Chats');

      /*collection.remove(function(err, result) { 
      });*/

    Room_collection.insert({"id":"1","name":"testRoom"}, function(docs) {   
        //Room_collection.count(function(err, count) {
        //}); 
    });  
    Room_collection.insert({"id":"1","name":"testRoom2"}, function(docs) { }); 



    // open login page
    app.get('/login', function (req, res) {
      res.render('login', { 
      });
    });

    // open RoomList
    app.post('/RoomList', function (req, res) {
        //console.log(req.body); // get post prarams 
        var RoomsArr=[];
        //get Room list from mongoDB
        Room_collection.find().toArray(function(err, rows) { 
            //res.send('<script>location.href="/Chat";</script>');
            res.render('RoomList', { 
                rooms: rows
            });
        });
      //console.log(io.rooms);
    });

    // open Chat page
    app.post('/Chat', function (req, res) { 

        res.render('Chat', { 
            this_room:req.body.this_room
      });
    });


// clients and sockets. cls id and clsScoket's first val are keys.
var clsSocket={};
 


    io.sockets.on('connection', function (socket) { 


        //console.log(socket.namespace.manager.rooms);
        //console.log(io.sockets.in('roomf').manager.rooms);

        var myid = socket.id;
        // report stat
        socket.emit('con', { stat: 'connected' });
        
        //alarm 
        var data={};
        data['nick'] = "system";
        data['msg'] = "joined someone!";
        data['MyRoom'] = '';
        //socket.emit('stc', data);
        //io.sockets.in('roomf').emit('stc', data);

        socket.on('ChangeRoom', function (Data) {
            data['MyRoom'] = Data.room;
            //join room
            socket.leave(null);
            socket.join(data['MyRoom']);
        });


        //push nick
        socket.on('ctsSetNick', function (nameData) {
            //clients nicknames
            socket.nickname = nameData.nick;
            clsSocket[myid] = socket; 

            console.log("join : " + clsSocket[myid].nickname);

            //get room's clients
            var cls = [];
            var roster = io.sockets.clients(data['MyRoom']);

            roster.forEach(function (client) {
                //cls.push("{'nick':'"+client.nickname+"'}");
                cls.push({ 'id': client.id, 'nick': client.nickname });
            });
            // send clients Array 
            //io.sockets.sockets[""].emit('usrs', cls); //emit close
            io.sockets.in(data['MyRoom']).emit('usrs', cls); //emit close
            console.log(cls);

            console.log('---------------------------');
            console.log(socket.namespace.manager.rooms);
        });

        // client to server data
        socket.on('cts', function (client_data) {
            console.log(data['MyRoom']+"____");
            //send msg
            //socket.broadcast.to('room').emit('stc',data);
            io.sockets.in(data['MyRoom']).emit('stc', client_data);
            //to broadcast information to a certain room (excluding the client):
            //socket.broadcast.to('room1').emit('function', 'data1', 'data2');
            //to broadcast information globally:
            //io.sockets.in('room1').emit('function', 'data1', 'data2');
        });


        // client to server data
        socket.on('ctp', function (client_pdata) {
            //send msg 
            socket.emit('stc', client_pdata);
            io.sockets.sockets[client_pdata.private].emit('stc', client_pdata);
     
        });

        socket.on('disconnect', function () {
            socket.leave(data['MyRoom']);
            delete clsSocket[socket.id];
            //get room's clients
            var cls = [];
            var roster = io.sockets.clients(data['MyRoom']);
            roster.forEach(function (client) {
                cls.push({ 'id': client.id, 'nick': client.nickname });
            });
            console.log(cls);
            // send clients Array
            io.sockets.in(data['MyRoom']).emit('usrs', cls); //emit close
        });

    }) //io.sockets.on('connection', function (socket) {
}); // mongodb connection close
