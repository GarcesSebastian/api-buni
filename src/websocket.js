import { WebSocketServer } from 'ws';

export const setupWebSocket = (server) => {
    const wss = new WebSocketServer({ server });

    wss.on('connection', (ws) => {
        console.log('Cliente conectado');

        wss.clients.forEach(client => {
            if (client !== ws && client.readyState === ws.OPEN) {
                client.send(JSON.stringify({ type: "new_connection", message: "Un nuevo usuario se ha conectado" }));
            }
        });

        ws.on('message', (message) => {
            console.log(`Mensaje recibido: ${message}`);

            wss.clients.forEach(client => {
                if (client.readyState === ws.OPEN) {
                    client.send(`Servidor: ${message}`);
                }
            });
        });

        ws.on('close', () => {
            console.log('Cliente desconectado');
        });
    });

    return wss;
};
