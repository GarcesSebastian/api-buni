import { WebSocketServer, WebSocket } from "ws";

export const setupWebSocket = (server) => {
    const wss = new WebSocketServer({ server });

    wss.on("connection", (ws) => {
        console.log("Cliente conectado");

        wss.clients.forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                const data = { message: "Un nuevo usuario se ha conectado" }
                client.send(JSON.stringify({ type: "USER_CONNECTED", payload: data }));
            }
        });
        
        ws.on("message", (message) => {
            console.log(`Mensaje recibido: ${message}`);

            try {
                const data = JSON.parse(message.toString());

                wss.clients.forEach(client => {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(data));
                    }
                });
            } catch (error) {
                console.error("Error al procesar el mensaje:", error);
            }
        });

        ws.on("close", () => {
            console.log("Cliente desconectado");
        });
    });

    return wss;
};
