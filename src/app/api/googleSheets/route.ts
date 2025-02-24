import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import { sendToQueue } from '@/lib/sqs/sendToQueue';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        if (!process.env.GOOGLE_SERVICE_ACCOUNT) {
            throw new Error('Missing GOOGLE_SERVICE_ACCOUNT environment variable');
        }

        // Parse the service account credentials from environment variable
        const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);

        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        });

        const sheets = google.sheets({ version: 'v4', auth });

        const spreadsheetId = '1jJZoNQQPyJjnja84uyPrGcXmNzjWHJ9PghMnJ96ZkGQ';
        const range = 'TestSheet1!A1:P10';

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

            console.log('Data: ', data);

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

        return NextResponse.json(
            {
                message: 'Data processing completed',
                data: processedData,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error fetching Google Sheet:', error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
