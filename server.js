
//test git 2
var public_dir = "./front",
    port=30000,
    total_usr_cnt=0,
    total_room_cnt=0,
    Rooms_list=[];

var swig  = require('swig'),
    MongoClient = require('mongodb').MongoClient,
    ObjectId = require('mongodb').ObjectID,
    express = require('express'),
    app = express(),
    io = require('socket.io').listen(app.listen(port));

    io.set('log level', 1); //decrease debug log.


    app.use('/js',express.static(public_dir+'/js'));
    app.use('/css',express.static(public_dir+'/css')); 
    app.use('/img',express.static(public_dir+'/img')); 
    /* less test */
    app.use('/less',express.static(public_dir+'/less')); 
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
      var d=new Date();
      console.log("someone comes! - "+d);
      res.send('<script>location.href="/less";</script>');
    });



// mongodb connect
MongoClient.connect('mongodb://localhost:27017/ChatData', function(err, db) {
    if(err){
      console.log("DB Error. Please Check mongodb server connection. ");
      console.log(err);
    }

   
     var Room_collection = db.collection('Rooms');
     var Chat_collection = db.collection('Chats');

      /*collection.remove(function(err, result) { 
      });*/
/*
    Room_collection.insert({"id":"1","name":"testRoom"}, function(docs) {   
        //Room_collection.count(function(err, count) {
        //}); 
    });  
    Room_collection.insert({"id":"1","name":"testRoom2"}, function(docs) { }); 
*/


    // open login page
    app.get('/login', function (req, res) {
      res.render('login', { 
      });
    });

    // open RoomList
        /*
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
        */

    // open Chat page
    app.post('/Chat', function (req, res) {
        res.render('Chat', { 
            this_room:req.body.this_room
      });
    });


// clients and sockets. cls id and clsScoket's first val are keys.
var clsSocket={};
 


    io.sockets.on('connection', function (socket) { 
        var current_room="";


        //console.log(socket.namespace.manager.rooms);
        //console.log(io.sockets.in('roomf').manager.rooms);

        var myid = socket.id;

        console.log(socket);


        // report stat
        socket.emit('con', { stat: 'connected' });
        
        //alarm 
        var data={};
        data['nick'] = "system";
        data['msg'] = "joined someone!";
        data['MyRoom'] = '';
        //socket.emit('stc', data);
        //io.sockets.in('roomf').emit('stc', data);

        fnc_room_list();


        // create Room
        socket.on('CreateRoom', function (CreateRoom_Data) {  
/*
            Room_collection.find(Data).toArray(function(err, rows) { 
                //res.send('<script>location.href="/Chat";</script>');  
                console.log(rows);
            });
*/
            Room_collection.insert(CreateRoom_Data, function(err,rec) {  
                console.log(rec._id);
                //get Room list from mongoDB
                Room_collection.find().toArray(function(err, rows) { 
                    io.sockets.emit('send_room_list', { 
                        room_list: rows
                    }); 
                }); 
            }); 
        });


        // change Room
        socket.on('ChangeRoom', function (ChangeRoom_Data) { 
            current_room = ChangeRoom_Data.room;
            //join room
            socket.leave(null);
            socket.join(current_room); 
            //get room's clients
            fnc_user_list();

        });


        // change Room
        socket.on('ctl', function (Loc_Data) { 
            socket.emit('stlm', Loc_Data);
            socket.broadcast.to(current_room).emit('stl', Loc_Data);
        });


        //push nick
        socket.on('ctsSetNick', function (nameData) {
            //clients nicknames
            socket.nickname = nameData.nick;
            console.log('asdf'+socket.nickname);
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
            //io.sockets.in(data['MyRoom']).emit('usrs', cls); //emit close
            console.log(cls);

            console.log('---------------------------');
            console.log(socket.namespace.manager.rooms);
        }); 
 

        // client to server data
        socket.on('cts', function (client_data) {
            console.log(current_room+" only ");
            //send msg
            //only room
            //io.sockets.in(data['MyRoom']).emit('stc', client_data);
            //to others
            socket.broadcast.to(current_room).emit('stc', client_data);
            //only me 
            socket.emit('stm', client_data);
        });


        // client to server data
        socket.on('ctp', function (client_pdata) {
            //send msg 
            socket.emit('stm', client_pdata);
            io.sockets.sockets[client_pdata.private].emit('stc', client_pdata);
        });

        // leave room
        socket.on('leaveRoom', function () {
            disonnect();

        });

        socket.on('disconnect', function () {
            disonnect();
        });



        function fnc_room_list(){  
        //get Room list from mongoDB
            Room_collection.find().toArray(function(err, rows) { 
                io.sockets.emit('send_room_list', { 
                    room_list: rows
                }); 
            }); 
        };

        function fnc_user_list(uid){
            if(uid != "")
            delete clsSocket[uid]; 

            //get room's clients
            var cls = [];
            var roster = io.sockets.clients(current_room);

            roster.forEach(function (client) {
                //cls.push("{'nick':'"+client.nickname+"'}");
                cls.push({ 'id': client.id, 'nick': client.nickname });
            });
            // send clients Array 
            //io.sockets.sockets[""].emit('usrs', cls); //emit close
            io.sockets.in(current_room).emit('usrs', cls); //emit close
            console.log(cls);

            console.log('---------------------------');
            console.log(socket.namespace.manager.rooms); 
            return cls;
        };

        function disonnect(){
            socket.leave(current_room);
            console.log("leave : "+current_room);
            /*
            delete clsSocket[socket.id];
            //get room's clients
            var cls = [];
            var roster = io.sockets.clients(current_room);
            roster.forEach(function (client) { 
                cls.push({ 'id': client.id, 'nick': client.nickname });
            }); */
            var cls = fnc_user_list(socket.id);
            if(!current_room){
                console.log("Not joined user out.");
            }else{
                // if room of no user
                if(cls.length<1){ 

                    //then remove room where mongodb
                    //Room_collection.remove({"_id":{ '$in': [ ObjectId("current_room") ] }}, function(docs) {   
                    Room_collection.remove({'_id': { '$in': [ObjectId(current_room)] }}, function(err,docs) {   
                        console.log("remove err : " + err);
                        console.log("remove : " + docs);
                        //Room_collection.count(function(err, count) {
                        //});  
                        fnc_room_list();
                    }); 
                }else{
                // send clients Array
                io.sockets.in(current_room).emit('usrs', cls); //emit close
               }
            }
        };

    }) //io.sockets.on('connection', function (socket) {
}); // mongodb connection close


//  OpenShift sample Node application
var express = require('express');
var fs      = require('fs');


/**
 *  Define the sample application.
 */
var SampleApp = function() {

    //  Scope.
    var self = this;


    /*  ================================================================  */
    /*  Helper functions.                                                 */
    /*  ================================================================  */

    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupVariables = function() {
        //  Set the environment variables we need.
        self.ipaddress = process.env.OPENSHIFT_NODEJS_IP;
        self.port      = process.env.OPENSHIFT_NODEJS_PORT || 8080;

        if (typeof self.ipaddress === "undefined") {
            //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
            //  allows us to run/test the app locally.
            console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
            self.ipaddress = "127.0.0.1";
        };
    };


    /**
     *  Populate the cache.
     */
    self.populateCache = function() {
        if (typeof self.zcache === "undefined") {
            self.zcache = { 'index.html': '' };
        }

        //  Local cache for static content.
        self.zcache['index.html'] = fs.readFileSync('./index.html');
    };


    /**
     *  Retrieve entry (content) from cache.
     *  @param {string} key  Key identifying content to retrieve from cache.
     */
    self.cache_get = function(key) { return self.zcache[key]; };


    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function(sig){
        if (typeof sig === "string") {
           console.log('%s: Received %s - terminating sample app ...',
                       Date(Date.now()), sig);
           process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()) );
    };


    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function(){
        //  Process on exit and signals.
        process.on('exit', function() { self.terminator(); });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() { self.terminator(element); });
        });
    };


    /*  ================================================================  */
    /*  App server functions (main app logic here).                       */
    /*  ================================================================  */

    /**
     *  Create the routing table entries + handlers for the application.
     */
    self.createRoutes = function() {
        self.routes = { };

        self.routes['/asciimo'] = function(req, res) {
            var link = "http://i.imgur.com/kmbjB.png";
            res.send("<html><body><img src='" + link + "'></body></html>");
        };

        self.routes['/'] = function(req, res) {
            res.setHeader('Content-Type', 'text/html');
            res.send(self.cache_get('index.html') );
        };
    };


    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function() {
        self.createRoutes();
        self.app = express.createServer();

        //  Add handlers for the app (from the routes).
        for (var r in self.routes) {
            self.app.get(r, self.routes[r]);
        }
    };


    /**
     *  Initializes the sample application.
     */
    self.initialize = function() {
        self.setupVariables();
        self.populateCache();
        self.setupTerminationHandlers();

        // Create the express server and routes.
        self.initializeServer();
    };


    /**
     *  Start the server (starts up the sample application).
     */
    self.start = function() {
        //  Start the app on the specific interface (and port).
        self.app.listen(self.port, self.ipaddress, function() {
            console.log('%s: Node server started on %s:%d ...',
                        Date(Date.now() ), self.ipaddress, self.port);
        });
    };

};   /*  Sample Application.  */



/**
 *  main():  Main code.
 */
var zapp = new SampleApp();
zapp.initialize();
zapp.start();

