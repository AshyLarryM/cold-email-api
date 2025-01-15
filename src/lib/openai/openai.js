import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export async function generateCustomEmail(template, userData) {
    try {
        const prompt = `Generate a custom email using this template: "${template}". User data: ${JSON.stringify(userData)}`;
        const response = await openai.createCompletion({
            model: 'text-davinci-003',
            prompt,
            max_tokens: 200,
        });
        return response.data.choices[0].text.trim();
    } catch (error) {
        console.error('Error generating email:', error);
        throw new Error('Failed to generate custom email');
    }
};
