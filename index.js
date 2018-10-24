const doc = document;  // eslint-disable-line no-undef

var textarea = doc.getElementById('textarea');
const wordButtons = doc.getElementsByClassName('word-button');

let vocab = [
    'dolores', 'placeat', 'culpa', 'laborum', 'natus', 'dignissimos', 'et', 'ut',
    'omnis', 'rerum', 'quas', 'exercitationem', 'tempore', 'repellat', 'enim',
    'soluta', 'error', 'deleniti', 'est', 'perspiciatis'
];

function addFullWord(word) {
    textarea.value += ' ' + word + ' ';
}

function updateRecs() {
    let vocabCopy = vocab.slice()
    for (let button of wordButtons) {
        // Sample a new word randomly from the vocab.
        let randomIndex = Math.floor(Math.random() * vocabCopy.length);
        let newWord = vocabCopy.splice(randomIndex, 1)[0];  // `splice` returns an array

        button.value = newWord;
        button.innerHTML = newWord;
    }
}

for (let button of wordButtons) {
    button.addEventListener('click', event => {
        addFullWord(event.target.value);
    })
}

textarea.addEventListener('keypress', event => {
    if (event.key === 'Enter') {
        if (!event.shiftKey) {
            event.preventDefault();
            const firstWord = wordButtons[0].value;
            addFullWord(firstWord);
            updateRecs();
        }
    } else if (event.key === ' ') {
        updateRecs();
    }
});

// eslint-disable-next-line no-undef
console.log('Running'); // eslint-disable-line no-console
