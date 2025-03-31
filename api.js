async function generateHorrorContent(prompt, apiKey) {
    try {
        const fullPrompt = `
            ${HORROR_PROMPTS.persona}
            
            ${HORROR_PROMPTS.guidelines}
            
            ${HORROR_PROMPTS.outline}
            
            ${HORROR_PROMPTS.premise(prompt.question)}
        `;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    role: "user",
                    parts: [{ text: fullPrompt }]
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.candidates || !data.candidates[0]) {
            throw new Error('Invalid API response');
        }

        const text = data.candidates[0].content.parts[0].text;
        
        // Podziel tekst na części i wyczyść
        const entries = text
            .split(/\d+\./)
            .filter(entry => entry.trim())
            .map(entry => entry.trim())
            .filter(entry => !entry.toLowerCase().includes('here are'));

        if (entries.length < 6) {
            throw new Error('Not enough entries generated');
        }

        return entries.slice(0, 6);
    } catch (error) {
        console.error('Gemini API Error:', error);
        throw error;
    }
} 