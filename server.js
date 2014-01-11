var connect = require('connect'),
io = require('socket.io').listen(connect.createServer(connect.static(__dirname+"/front/")).listen(3000));

/*
var express = require("express");
var app = express();
var port = 3700; 
app.use(express.static(__dirname + '/public'));
var io = require('socket.io').listen(   app.listen(port));
*/
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
