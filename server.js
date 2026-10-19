const WebSocket = require('ws');

// Port set kar rahe hain (Environment port ya default 8080)
const PORT = process.env.PORT || 8080;
const wss = new WebSocket.Server({ port: PORT });

console.log(`🚀 NetLink Advance Signaling Server is running on port ${PORT}`);

// Connected clients ki list track karne ke liye
let clients = new Map();

wss.on('connection', (ws) => {
    let clientId = null;

    ws.on('message', (message) => {
        let data;
        try {
            data = JSON.parse(message);
        } catch (e) {
            console.error("Invalid JSON received");
            return;
        }

        switch (data.type) {
            case 'register':
                clientId = data.id;
                clients.set(clientId, ws);
                console.log(`✅ Client registered with ID: ${clientId}`);
                break;

            case 'offer':
            case 'answer':
            case 'candidate':
                // Target client ko message forward karna
                const targetClient = clients.get(data.target);
                if (targetClient && targetClient.readyState === WebSocket.OPEN) {
                    targetClient.send(JSON.stringify({
                        type: data.type,
                        from: clientId,
                        payload: data.payload
                    }));
                }
                break;

            default:
                console.log("Unknown message type:", data.type);
        }
    });

    ws.on('close', () => {
        if (clientId) {
            clients.delete(clientId);
            console.log(`❌ Client disconnected: ${clientId}`);
        }
    });
});
