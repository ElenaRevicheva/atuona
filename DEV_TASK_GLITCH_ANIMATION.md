# Dev Task: Implement Moving Symbols Glitch Animation

## Objective
Implement a continuous glitch animation for the hero title "GALLERY OF MOMENTS" where symbols continuously move through the text, creating a cyberpunk effect.

## Current State
- Hero title: `<h1 class="hero-glitch" data-text="GALLERY OF MOMENTS">GALLERY OF MOMENTS</h1>`
- CSS glitch effects are working (color shifts, position glitches)
- JavaScript glitch animation is NOT working

## Required Animation Behavior

### Visual Effect Sequence:
```
"GALLERY OF MOMENTS"
↓ (glitch starts)
"M<]&&>._=-$+[#+█▓▒"
↓ (gradual left-to-right reveal)
"GAL&&>._=-$+[#+█▓▒"
↓
"GALLERY._=-$+[#+█▓▒"
↓
"GALLERY OF MOM█▓▒"
↓ (complete)
"GALLERY OF MOMENTS"
```

### Animation Requirements:
1. **Continuous**: Trigger automatically every 2-5 seconds (random interval)
2. **Left-to-right reveal**: Characters reveal from left to right
3. **Symbol replacement**: Use symbols like `M<]&&>._=-$+[#+!@#$%^&*()█▓▒░▄▀▐▌│┤╡╢╖╕╣║`
4. **Smooth timing**: ~30-50ms between character reveals
5. **Hover trigger**: Also trigger immediately on mouse hover

## Technical Implementation

### Key Challenge:
The CSS uses pseudo-elements with `content: attr(data-text)` which may interfere with JavaScript text changes.

### Solution Approach:
```javascript
function glitchText(element) {
    const originalText = element.textContent;
    const glitchChars = 'M<]&&>._=-$+[#+!@#$%^&*()_+-=[]{}|;:,.<>?█▓▒░▄▀▐▌│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌▲►▼◄♠♣♥♦•◘○◙♂♀♪♫☼►◄↕‼¶§▬↨↑↓→←∟↔▲▼';
    
    let iterations = 0;
    const interval = setInterval(() => {
        const glitchedText = originalText.split('').map((char, index) => {
            if (index < iterations) {
                return originalText[index]; // Revealed character
            }
            return glitchChars[Math.floor(Math.random() * glitchChars.length)]; // Random symbol
        }).join('');
        
        // Update BOTH textContent AND data-text attribute
        element.textContent = glitchedText;
        element.setAttribute('data-text', glitchedText);
        
        if (iterations >= originalText.length) {
            clearInterval(interval);
            element.textContent = originalText;
            element.setAttribute('data-text', originalText);
        }
        
        iterations += 1/3; // Control reveal speed
    }, 30);
}

// Make it continuous
function startContinuousGlitch() {
    const heroElement = document.querySelector('.hero-glitch');
    
    function scheduleNext() {
        const delay = Math.random() * 3000 + 2000; // 2-5 seconds
        setTimeout(() => {
            glitchText(heroElement);
            scheduleNext();
        }, delay);
    }
    
    scheduleNext();
    
    // Hover trigger
    heroElement.addEventListener('mouseenter', () => {
        glitchText(heroElement);
    });
}

// Start on page load
document.addEventListener('DOMContentLoaded', startContinuousGlitch);
```

## Testing Requirements
1. Text should visibly change to symbols during glitch
2. Symbols should reveal left-to-right back to original text
3. Animation should repeat every 2-5 seconds automatically
4. Hover should trigger immediate glitch
5. CSS color/position effects should still work alongside JavaScript

## Files to Modify
- `/workspace/index.html` (JavaScript section around line 1400+)

## Expected Result
The hero title "GALLERY OF MOMENTS" should continuously show moving symbols that evolve back into the text, creating a dynamic cyberpunk aesthetic where the text never sits completely still.

## Priority: HIGH
This is a key visual element for the NFT gallery's underground aesthetic.