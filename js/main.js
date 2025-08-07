// Typewriter animation
const typewriterElement = document.getElementById('typewriter-text');
const phrases = ["Hi Rayne Molloy", "Let's be productive"];
let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeWriter() {
    const currentPhrase = phrases[phraseIndex];
    
    // Stop after typing "Let's be productive"
    if (phraseIndex === 1 && !isDeleting && charIndex === currentPhrase.length) {
        typewriterElement.style.borderRight = 'none'; // Remove cursor
        return;
    }
    
    if (!isDeleting && charIndex < currentPhrase.length) {
        // Typing forward
        typewriterElement.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
        setTimeout(typeWriter, 100); // Typing speed
    } else if (isDeleting && charIndex > 0) {
        // Backspacing (only for first phrase)
        typewriterElement.textContent = currentPhrase.substring(0, charIndex - 1);
        charIndex--;
        setTimeout(typeWriter, 50); // Backspace speed (faster)
    } else {
        // Only delete the first phrase
        if (phraseIndex === 0) {
            isDeleting = !isDeleting;
        }
        
        // Move to next phrase after backspacing first one
        if (!isDeleting && phraseIndex === 0) {
            phraseIndex++;
            charIndex = 0;
        }
        
        setTimeout(typeWriter, 500); // Pause between phrases
    }
}

// Start the animation after a short delay when page loads
setTimeout(typeWriter, 1000);