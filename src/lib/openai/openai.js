import { Configuration, OpenAIApi } from 'openai';

const openai = new OpenAIApi(
    new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
    })
);

async function generateEmailContent(company, contact) {
    const prompt = `
    Write a professional email for a cold outreach to ${contact} at ${company}, 
    introducing our services and asking for a follow-up meeting.
    `;

    const response = await openai.createCompletion({
        model: 'text-davinci-003',
        prompt,
        max_tokens: 200,
    });

    return response.data.choices[0]?.text?.trim() || '';
}

async function processBatch(messages) {
    for (const message of messages) {
        const { company, contact, email } = JSON.parse(message.Body);

        // Generate email content
        const emailContent = await generateEmailContent(company, contact);

        // Send email
        await sendEmail(email, `Introduction to ${company}`, emailContent);

        // Delete the message from the queue
        await deleteMessage(message.ReceiptHandle);
    }
}