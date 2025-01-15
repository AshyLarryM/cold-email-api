import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';

const sqsClient = new SQSClient({ region: process.env.AWS_REGION });

export async function fetchMessagesFromQueue(queueUrl: string, maxMessages: number = 10) {
    const command = new ReceiveMessageCommand({
        QueueUrl: queueUrl,
        MaxNumberOfMessages: maxMessages,
        WaitTimeSeconds: 10,
    });

    const response = await sqsClient.send(command);
    return response.Messages || [];
}