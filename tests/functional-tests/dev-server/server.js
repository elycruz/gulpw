/**
 * Created by Ely on 12/21/2014.
 */
var express = require('express'),
    app = express(),
    fs = require('fs'),
    path = require('path'),
    server;

app.use(express.static(path.normalize('./public')));

server = app.listen(3000, function () {
        var host = server.address().address,
            port = server.address().port;
        console.log('Example app listening at http://%s:%s', host, port)
    });
