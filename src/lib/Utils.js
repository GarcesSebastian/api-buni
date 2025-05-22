import { v4 as uuidv4 } from 'uuid';
import https from 'https';

export class Utils {
    static generateUUID() {
        return uuidv4();
    }

    static delay(time) {
        return new Promise(resolve => setTimeout(resolve, time));
    }

    static async convertToBase64(url) {
        return new Promise((resolve, reject) => {
            https.get(url, (response) => {
                const chunks = [];

                response.on('data', (chunk) => {
                    chunks.push(chunk);
                });

                response.on('end', () => {
                    const buffer = Buffer.concat(chunks);
                    const base64Image = buffer.toString('base64');
                    resolve(`data:image/png;base64,${base64Image}`);
                });

                response.on('error', (error) => {
                    reject(error);
                });
            });
        });
    }
}