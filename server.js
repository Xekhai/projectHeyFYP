const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI(process.env.OPENAI_API_KEY);

const app = express();

app.use(cors({
    origin: '*' // This will allow all domains to access your server
}));

app.use(express.json());
const sendChatToOpenAI = async (req, res) => {
    const { chatMessages } = req.body;

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4-turbo-preview",
            messages: chatMessages
        });

        // Extracting the assistant's response
        const assistantResponse = completion.choices[0]?.message?.content;

        // Respond with only the assistant's response
        res.json({ response: assistantResponse });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const analyzeUserSentiment = async (req, res) => {
    const { userMessage } = req.body;
    const jsonString = JSON.stringify(userMessage);

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4-turbo-preview",
            messages: [
                {"role": "system", "content": `
                Your Job is to just respond with either positive, negative or neutral.
                You are to analyze the message looking for phrases or words that hint anviety, depression, or any form of mental issues. 
                `},
                {"role": "user", "content": `Message: ${jsonString}`}
              ]
        });

        // Extracting the assistant's response
        const assistantResponse = completion.choices[0]?.message?.content.toLowerCase();

        // Respond with only the assistant's response
        res.json({ response: assistantResponse });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Define the endpoints
app.post('/send-chat', sendChatToOpenAI);
app.post('/analyze-sentiment', analyzeUserSentiment);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});