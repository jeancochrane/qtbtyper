const doc = document;  // eslint-disable-line no-undef

var textarea = doc.getElementById('textarea');
textarea.value = 'Type here to get started!';

function addWord(word) {
    textarea.value += word;
}

function addFullWord(word) {
    textarea.value += ' ' + word + ' ';
}

const wordButtons = doc.getElementsByClassName('word-button');

for (let button of wordButtons) {
    button.addEventListener('click', event => {
        addFullWord(event.target.value);
    })
}

textarea.addEventListener('keypress', event => {
    if (event.key == 'Enter') {
        if (!event.shiftKey) {
            event.preventDefault();
            const firstWord = wordButtons[0].value;
            addFullWord(firstWord);
        }
    }
});

// eslint-disable-next-line no-undef
console.log('Running'); // eslint-disable-line no-console
