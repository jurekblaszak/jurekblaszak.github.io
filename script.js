document.addEventListener('DOMContentLoaded', () => {
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

    generateBtn.addEventListener('click', () => {
        if (textarea.value.trim() !== '') {
            console.log('Generating with keyword:', textarea.value);
        }
    });

    // Obsługa przycisku Login
    const loginBtn = document.querySelector('.login-btn');
    loginBtn.addEventListener('click', () => {
        console.log('Login clicked');
        // Tutaj możesz dodać logikę logowania
    });
}); 