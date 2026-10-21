import { v4 as uuidv4 } from 'uuid';
import https from 'https';

export class Utils {
  static generateUUID(): string {
    return uuidv4();
  }

  static delay(time: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, time));
  }

  static async convertToBase64(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      https.get(url, (response) => {
        const chunks: Buffer[] = [];

        response.on('data', (chunk: Buffer) => {
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
