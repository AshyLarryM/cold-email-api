import AWS from 'aws-sdk';

const sqs = new AWS.SQS({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

interface SQSMessage {
    company: string;
    contact: string;
    email: string;
}

export async function sendToQueue(message: SQSMessage): Promise<string> {
    const queueUrl = process.env.SQS_QUEUE_URL;

    if (!queueUrl) {
        throw new Error('SQS_QUEUE_URL environment variable is not defined');
    }

    const params: AWS.SQS.SendMessageRequest = {
        QueueUrl: queueUrl,
        MessageGroupId: 'email-group',
        MessageDeduplicationId: `${message.email}-${Date.now()}`,
        MessageBody: JSON.stringify(message),
    };

    try {
        const result = await sqs.sendMessage(params).promise();
        console.log(`Message sent to SQS: ${result.MessageId}`);
        return result.MessageId!;
    } catch (error) {
        console.error('Error sending message to SQS:', error);
        throw new Error('Failed to send message to SQS');
    }
}
