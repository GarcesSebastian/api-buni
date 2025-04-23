import jwt from 'jsonwebtoken';

export class SocketManager {
    static instance;
    static io;
    static users = new Map();
    constructor(){}

    static getInstance(io){
        if(!SocketManager.instance){
            SocketManager.instance = new SocketManager();
            SocketManager.io = io;
        }
        return SocketManager.instance;
    }
    
    start(){
        console.log('Iniciando SocketManager');
        SocketManager.io.on('connection', (socket) => {
            console.log(`Socket ${socket.id} conectado`);
            if(!SocketManager.users.has(socket.id)){
                SocketManager.users.set(socket.id, {
                    socket,
                    data: {}
                });
            }

            socket.on("client_connected", (data) => {
                const decoded = jwt.verify(data.token, process.env.JWT_SECRET);
                const payload = {
                    token: data.token,
                    ...decoded
                };

                SocketManager.users.get(socket.id).data = payload;
            });

            socket.on('UPDATE_DATA', (data) => {
                SocketManager.users.forEach((user) => {
                    if(socket.id !== user.socket.id && user.data.token){
                        user.socket.emit('UPDATE_DATA', data);
                    }
                });
            });

            socket.on("UPDATE_EVENT_FORMS", (data) => {
                SocketManager.users.forEach((user) => {
                    if(socket.id !== user.socket.id && user.data.token){
                        user.socket.emit('UPDATE_EVENT_FORMS', data);
                    }
                });
            });

            socket.on('disconnect', () => {
                console.log('Un usuario se ha desconectado');
                SocketManager.users.delete(socket.id);
            });

            console.log("Usuarios conectados: ", SocketManager.users.size);
            console.log("Usuarios registrados: ", ([...SocketManager.users].map(user => {
                if(user.data && user.data.token && user.data.token !== null){
                    return user.data;
                }
            }).length));
        });
    }
}
