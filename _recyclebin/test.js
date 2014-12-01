var Connection = require('ssh2');

var conn = new Connection();
conn.on('ready', function() {

    console.log('Connection :: ready');

    conn.sftp(function(err, sftp) {
        if (err) throw err;

        // Testing out fast sftp put
        sftp.fastPut(process.cwd() + '/_recyclebin/helloworld.txt', 'helloworld.txt', {
            step: function (bytesLoaded, chunk, totalBytes) {
                console.log('Percent uploaded: ' + (bytesLoaded / totalBytes * 100) + "%");
            }
        },

        // Callback
        function (err) {
            if (err) throw err;
            sftp.end();
            conn.end();
            console.log('fastPut operation complete');
        });
    });

}).on('close', function (hadError) {

    console.log('Connection :: close');

    if (hadError) {
        console.log('Connection :: closed due to an unknown error.');
    }

}).connect({
    host: 'someserver.com',
    port: 22,
    username: 'someuser',
    password: 'someuserpassword'
});
