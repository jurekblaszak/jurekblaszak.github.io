document.addEventListener('DOMContentLoaded', async () => {
    const dynamicText = document.querySelector('.dynamic-text');
    const words = ['hell', 'adventure'];
    let charIndex = 0;
    let currentWordIndex = 0;
    let isDeleting = false;

    function typeEffect() {
        const currentWord = words[currentWordIndex];
        
        if (isDeleting) {
            dynamicText.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
        } else {
            dynamicText.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
        }

        dynamicText.style.color = '#B34036';

        let typeSpeed = isDeleting ? 100 : 200;

        if (!isDeleting && charIndex === currentWord.length) {
            if (currentWordIndex === 0) {
                isDeleting = true;
                typeSpeed = 2000;
            } else {
                return;
            }
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            currentWordIndex = 1;
            typeSpeed = 500;
        }

        setTimeout(typeEffect, typeSpeed);
    }

    typeEffect();

    const generateBtn = document.querySelector('.generate-btn');
    const textarea = document.querySelector('textarea');
    let apiKey;

    try {
        apiKey = await getApiKey();
    } catch (error) {
        console.error('Failed to load API key:', error);
        generateBtn.disabled = true;
        generateBtn.textContent = 'API Error';
        return;
    }

    generateBtn.addEventListener('click', async () => {
        const question = textarea.value.trim();
        if (question !== '') {
            try {
                generateBtn.disabled = true;
                generateBtn.textContent = 'Generating...';

                // Zapisz pytanie do localStorage
                localStorage.setItem('lastQuestion', question);

                const prompt = {
                    persona: `You are a creative assistant to a Game Master running a horror RPG session. You are at the same time an award-winning horror author with a penchant for out-of-the-box solutions, creative ideas, and the ability to create visions that are simultaneously terrifying and fascinating. Your superpower is the ability to describe them in a maximally brief but appealing form.`,
                    
                    guidelines: `Create 6 short, specific horror encounters. Each should be maximum three sentences, build atmosphere through context not adjectives. Focus on psychological horror and anxiety. Avoid clichés and fantasy elements. Take inspiration from Call of Cthulhu, Delta Green, World of Darkness, and authors like King, Simmons, and Lovecraft. Make each encounter ready to use in a modern horror RPG session.`,
                    
                    question: question
                };

                const results = await generateHorrorContent(prompt, apiKey);
                
                // Filtruj i formatuj wyniki przed zapisaniem
                const cleanResults = results
                    .filter(entry => !entry.toLowerCase().includes('here are'))
                    .filter(entry => entry.trim() !== '');

                if (cleanResults.length < 6) {
                    throw new Error('Not enough valid entries generated');
                }

                localStorage.setItem('horrorResults', JSON.stringify(cleanResults));
                window.location.href = 'results.html';
            } catch (error) {
                console.error('Generation error:', error);
                generateBtn.classList.add('error');
                generateBtn.textContent = 'Error! Try again';
                
                // Pokaż bardziej szczegółowy błąd w konsoli
                if (error.message.includes('API key')) {
                    console.error('API Key error. Check your configuration.');
                } else if (error.message.includes('Not enough entries')) {
                    console.error('The API did not generate enough content.');
                }
                
                setTimeout(() => {
                    generateBtn.classList.remove('error');
                    generateBtn.textContent = 'Generate';
                }, 3000);
            } finally {
                generateBtn.disabled = false;
            }
        }
    });

    // Obsługa przycisku Login
    const loginBtn = document.querySelector('.login-btn');
    loginBtn.addEventListener('click', () => {
        console.log('Login clicked');
        // Tutaj możesz dodać logikę logowania
    });
});

async function generateHorrorContent(prompt, apiKey) {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    role: "user",
                    parts: [{
                        text: `
                        ${prompt.persona}
                        
                        ${prompt.guidelines}
                        
                        Generate exactly 6 numbered horror encounters based on the keyword: "${prompt.question}"
                        Format each entry as a number followed by the description.
                        Do not include any introductory or summary text.
                        `
                    }]
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