import * as Http from 'http';
import * as SocketIo from 'socket.io';
import * as express from "express";
import * as Path from 'path';
import { MainServer } from './main';

const serverPort = process.env['SERVER_PORT'] || '3000';

const start = async () => {
    const app = express.default();
    const http = Http.createServer(app);

    const io = new SocketIo.Server(http, {
        /*cors: {
            origin: "http://localhost:3000", // TODO
            methods: ["GET", "POST"]
        },*/
    });

    const server = new MainServer(io);

    await server.start();

    if (process.env.NODE_ENV === 'production') {
        app.use(express.static(Path.join(__dirname, '../build')));

        app.get('*', function(req, res) {
          res.sendFile(Path.join(__dirname, '../build', 'index.html'));
        });
    }

    http.listen(parseInt(serverPort), () => {
        console.log(`Server listening at port ${serverPort}`);
    });
};

start()
    .then(() => {})
    .catch(err => console.error(err));
