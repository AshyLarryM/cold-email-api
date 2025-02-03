import { google } from 'googleapis';
import path from 'path';
import { promises as fs } from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import { sendToQueue } from '@/lib/sqs/sendToQueue';

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
        const range = 'TestSheet1!A1:p10';

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range,
        });

        const rows = response.data.values || [];
        if (rows.length === 0) {
            console.log('No data found.');
            return NextResponse.json({ message: 'No data found' }, { status: 200 });
        }

        // Extract headers and data rows
        const headers = rows[0]; // Assumes first row contains headers
        const dataRows = rows.slice(1);

        const processedData = [];


        // Loop through rows and send valid rows to SQS
        for (const row of dataRows) {
            const data = {
                company: row[headers.indexOf('Company')],
                contact: row[headers.indexOf('Contact')],
                email: row[headers.indexOf('Email')],
            };

            console.log("Data: ", data);

            // Ensure required fields are present
            if (data.company && data.contact && data.email) {
                processedData.push(data);

                try {
                    await sendToQueue(data);
                } catch (error) {
                    console.error(`Failed to send row to queue: ${JSON.stringify(data)}`, error);
                }
            } else {
                console.warn(`Skipping invalid row: ${JSON.stringify(row)}`);
            }
        }
        

        return NextResponse.json({
            message: 'Data processing completed',
            data: processedData,
        }, { status: 200 });


    } catch (error) {
        console.error('Error fetching Google Sheet:', error);
        return NextResponse.json(error, { status: 500 });
    }
}