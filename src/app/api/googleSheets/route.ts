import { google } from 'googleapis';
import path from 'path';
import { promises as fs } from 'fs';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const keyFilePath = path.join(process.cwd(), 'cold-email-generator-447123-6a2d2439fccf.json');
        const keyFile = JSON.parse(await fs.readFile(keyFilePath, 'utf8'));

        const auth = new google.auth.GoogleAuth({
            credentials: keyFile,
            scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        });
        const sheets = google.sheets({ version: 'v4', auth });

        const spreadsheetId = '1jJZoNQQPyJjnja84uyPrGcXmNzjWHJ9PghMnJ96ZkGQ';
        const range = 'Sheet1!A1:D10';

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range,
        });

        return new Response(JSON.stringify(response.data), { status: 200 })
    } catch (error) {
        console.error('Error fetching Google Sheet:', error);
        return new Response(JSON.stringify({ error: error }), { status: 500 });
    }
}