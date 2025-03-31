document.addEventListener('DOMContentLoaded', () => {
    const resultsContent = document.getElementById('resultsContent');
    const backBtn = document.querySelector('.back-btn');
    const generateBtn = document.querySelector('.generate-btn');
    
    // Pobierz ostatnie pytanie i wyniki
    const lastQuestion = localStorage.getItem('lastQuestion');
    const results = JSON.parse(localStorage.getItem('horrorResults') || '[]');
    
    // Wyświetl wyniki
    if (results.length > 0) {
        resultsContent.innerHTML = results.map((result, index) => `
            <div class="result-entry">
                <div class="result-number">${index + 1}</div>
                <div class="result-text">${result}</div>
            </div>
        `).join('');
    }

    backBtn.addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    generateBtn.addEventListener('click', async () => {
        if (!lastQuestion) {
            generateBtn.classList.add('error');
            generateBtn.textContent = 'Error: No previous query';
            
            setTimeout(() => {
                generateBtn.classList.remove('error');
                generateBtn.textContent = 'Generate Again';
            }, 3000);
            return;
        }

        try {
            generateBtn.disabled = true;
            generateBtn.textContent = 'Generating...';

            const apiKey = await getApiKey();

            const prompt = {
                persona: `You are a creative assistant to a Game Master running a horror RPG session. You are at the same time an award-winning horror author with a penchant for out-of-the-box solutions, creative ideas, and the ability to create visions that are simultaneously terrifying and fascinating. Your superpower is the ability to describe them in a maximally brief but appealing form.`,
                
                guidelines: `Create exactly 6 numbered horror encounters. Each should be maximum three sentences, build atmosphere through context not adjectives. Focus on psychological horror and anxiety. Avoid clichés and fantasy elements. Take inspiration from Call of Cthulhu, Delta Green, World of Darkness, and authors like King, Simmons, and Lovecraft. Make each encounter ready to use in a modern horror RPG session. Do not include any introductory text or summaries.`,
                
                question: lastQuestion
            };

            const newResults = await generateHorrorContent(prompt, apiKey);
            
            // Filtruj i formatuj wyniki
            const cleanResults = newResults
                .filter(entry => !entry.toLowerCase().includes('here are'))
                .filter(entry => entry.trim() !== '');

            if (cleanResults.length < 6) {
                throw new Error('Not enough valid entries generated');
            }

            localStorage.setItem('horrorResults', JSON.stringify(cleanResults));
            location.reload();

        } catch (error) {
            console.error('Generation error:', error);
            generateBtn.classList.add('error');
            generateBtn.textContent = 'Error! Try again';
            
            setTimeout(() => {
                generateBtn.classList.remove('error');
                generateBtn.textContent = 'Generate Again';
            }, 3000);
        } finally {
            generateBtn.disabled = false;
        }
    });
}); 