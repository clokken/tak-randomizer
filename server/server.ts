import * as Http from 'http';
import * as SocketIo from 'socket.io';
import { MainServer } from './main';

const serverPort = process.env['SERVER_PORT'] || '3000';

const start = async () => {
    const http = Http.createServer();
    const io = new SocketIo.Server(http);

    const server = new MainServer(io);

    await server.start();
    io.listen(parseInt(serverPort));
    console.log(`Server listening at port ${serverPort}`);
};

start()
    .then(() => {})
    .catch(err => console.error(err));
