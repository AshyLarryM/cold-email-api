import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';
import OpenAI from 'openai';
import sgMail from '@sendgrid/mail';

const sqs = new SQSClient({ region: 'us-east-1' });

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const handler = async () => {
    const queueUrl = process.env.QUEUE_URL || 'https://sqs.us-east-1.amazonaws.com/567557438867/email-processing-queue.fifo';

    try {
        const params = {
            QueueUrl: queueUrl,
            MaxNumberOfMessages: 2,
            WaitTimeSeconds: 10,
        };

        const command = new ReceiveMessageCommand(params);
        const data = await sqs.send(command);

        if (!data.Messages || data.Messages.length === 0) {
            console.log('No messages in the queue.');
            return;
        }

        for (const message of data.Messages) {
            console.log('Raw message body:', message.Body);
        
            try {
                const emailData = JSON.parse(message.Body); // Parse the message body
                console.log('Parsed email data:', emailData);
        
                // Check if the email field is present (case-sensitive)
                if (!emailData.email) {
                    console.error('Email field is missing in the parsed data:', emailData);
                    continue;
                }
        
                console.log('Extracted email:', emailData.email);
        
                // Proceed with the rest of the processing
                const { subject, body } = await generateEmailContent(emailData);
                await sendEmail(emailData.email, subject, body);
        
                const deleteCommand = new DeleteMessageCommand({
                    QueueUrl: queueUrl,
                    ReceiptHandle: message.ReceiptHandle,
                });
                await sqs.send(deleteCommand);
                console.log('Message processed and deleted:', message.MessageId);
            } catch (err) {
                console.error('Error parsing or processing message:', message.MessageId, err);
            }
        }
        
        
    } catch (err) {
        console.error('Error fetching messages from SQS:', err);
    }
};

const generateEmailContent = async (emailData) => {
    const Company = emailData.company || emailData.Company;
    const Contact = emailData.contact || emailData.Contact;

    // Validate input
    if (!Company || !Contact) {
        throw new Error('Company and Contact fields are required to generate email content.');
    }

    const prompt = `
        Write a concise, professional email for a company. 
        The recipient's name is ${Contact}, and the company is ${Company}.
        The email should:
        1. Introduce the services of L.A. Publishing and Printing, emphasizing specialties such as brochures, postcards, booklets, large-scale printing, die cutting, and mailing.
        2. Highlight how our services can benefit ${Company} with quality, affordability, and quick turnaround times.
        3. Invite ${Contact} to schedule a call to discuss their specific printing or mailing needs.
        4. Limit the email body to concise text, avoiding long blocks or spam-like formatting.
        
        Provide the email in the following format:
        Subject: [A compelling subject line]
        [The email body as clean text with no prefixes like "Body:"]
    `;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: 'You are an expert email writer specializing in professional and concise communication.' },
                { role: 'user', content: prompt },
            ],
            max_tokens: 350,
        });

        // Extract response content
        const text = response.choices[0].message.content.trim();

        // Extract subject and body
        const subjectLine = text.match(/^Subject:\s*(.+)/i)?.[1] || 'Professional Printing Services for Your Business';
        let bodyMatch = text.replace(/^Subject:\s*.+\n/i, '').trim(); // Removes "Subject" line to get only the body
        
        // Replace placeholder name with "Al Ribisi"
        bodyMatch = bodyMatch.replace(/\[Your Name\]/g, 'Al Ribisi');

        const body = bodyMatch.split('\n\n').map((p) => p.trim()).join('\n\n');

        return { subject: subjectLine, body };
    } catch (error) {
        console.error('Error generating email content with OpenAI:', error);
        throw new Error('Failed to generate email content. Please try again later.');
    }
};




// Function to send email using SendGrid
const sendEmail = async (to, subject, body) => {
    if (!to) {
        throw new Error('Recipient email address is missing.');
    }

    const msg = {
        to, // The "to" field
        from: 'Al@lapubs.com',
        subject,
        text: body,
    };

    try {
        await sgMail.send(msg);
        console.log(`Email sent to ${to}`);
    } catch (error) {
        console.error(`Error sending email to ${to}:`, error);
        throw error;
    }
};

