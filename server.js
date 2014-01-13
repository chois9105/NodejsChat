//test git 
var public_dir = "./front",
    port=3000,
    total_usr_cnt=0,
    total_room_cnt=0;

var swig  = require('swig'),
    express = require('express'),
    app = express(),
    io = require('socket.io').listen(app.listen(port));

    app.use('/js',express.static(public_dir+'/js'));
    app.use('/css',express.static(public_dir+'/css'));

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

      res.render('index', {  
        pagename: 'awesome people',
        authors: ['Paul', 'Jim', 'Jane']
      });
      
    });


console.log("server is started at port 3000"); 

io.set('log level', 1);

// clients and sockets. cls id and clsScoket's first val are keys.
var clsSocket={};

io.sockets.on('connection', function (socket) {
    //join room
    socket.join('room');
    var myid = socket.id;
    // report stat
    socket.emit('con', { stat: 'connected' });
    
    //alarm 
    var data={};
    data['nick'] = "system";
    data['msg'] = "joined someone!";
    //socket.emit('stc', data);
    io.sockets.in('room').emit('stc', data);

    //push nick
    socket.on('ctsSetNick', function (nameData) {
        //clients nicknames
        socket.nickname = nameData.nick;
        clsSocket[myid] = socket;
        console.log("join : " + clsSocket[myid].nickname);

        //get room's clients
        var cls = [];
        var roster = io.sockets.clients('room');

        roster.forEach(function (client) {
            //cls.push("{'nick':'"+client.nickname+"'}");
            cls.push({ 'id': client.id, 'nick': client.nickname });
        });
        // send clients Array 
        //io.sockets.sockets[""].emit('usrs', cls); //emit close
        io.sockets.in('room').emit('usrs', cls); //emit close
        console.log(cls);

        console.log('---------------------------');
        console.log(socket.namespace.manager.rooms);



    });

    // client to server data
    socket.on('cts', function (data) {
        //send msg
        //socket.broadcast.to('room').emit('stc',data);

        io.sockets.in('room').emit('stc', data);

        //to broadcast information to a certain room (excluding the client):
        //socket.broadcast.to('room1').emit('function', 'data1', 'data2');
        //to broadcast information globally:
        //io.sockets.in('room1').emit('function', 'data1', 'data2');
    });


    // client to server data
    socket.on('ctp', function (data) {
        //send msg 
        socket.emit('stc', data);
        io.sockets.sockets[data.private].emit('stc', data);
 
    });

    socket.on('disconnect', function () {
        socket.leave('room');
        delete clsSocket[socket.id];
        //get room's clients
        var cls = [];
        var roster = io.sockets.clients('room');
        roster.forEach(function (client) {
            cls.push({ 'id': client.id, 'nick': client.nickname });
        });
        console.log(cls);
        // send clients Array
        io.sockets.in('room').emit('usrs', cls); //emit close
    });


});
