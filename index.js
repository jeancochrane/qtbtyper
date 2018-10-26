import * as tf from '@tensorflow/tfjs';

const doc = document;  // eslint-disable-line no-undef

var textarea = doc.getElementById('textarea');
const wordButtons = doc.getElementsByClassName('word-button');

let vocab = [
    'dolores', 'placeat', 'culpa', 'laborum', 'natus', 'dignissimos', 'et', 'ut',
    'omnis', 'rerum', 'quas', 'exercitationem', 'tempore', 'repellat', 'enim',
    'soluta', 'error', 'deleniti', 'est', 'perspiciatis'
];

let modelFile = null;
let weightsFiles = null;
let model = null;

function handleTextUpload(e, callback) {
    let reader = new FileReader(); // eslint-disable-line no-undef
    reader.onload = callback;
    reader.readAsText(e.target.files[0]);
}

function onVocabLoad(e) {
    vocab = JSON.parse(e.target.result).vocab;
}

doc.getElementById('vocab-upload').addEventListener('change', e => { handleTextUpload(e, onVocabLoad) }, false);
doc.getElementById('json-upload').addEventListener('change', e => { modelFile = e.target.files[0] }, false);
doc.getElementById('weights-upload').addEventListener('change', e => {
    weightsFiles = e.target.files;
    for (let file of weightsFiles) {
        // eslint-disable-next-line no-undef
        console.log(file.name); // eslint-disable-line no-console
    }
    // eslint-disable-next-line no-undef
    console.log(weightsFiles); // eslint-disable-line no-console
    model = tf.loadModel(tf.io.browserFiles([modelFile, ...weightsFiles]));
});

function addFullWord(word) {
    textarea.value += ' ' + word;
}

function getRandomWord(vocab) {
    let randomIndex = Math.floor(Math.random() * vocab.length);
    let randomWord = vocab.splice(randomIndex, 1)[0];  // `splice` returns an array
    return randomWord;
}

function getPredictedWord(vocab, model) {
    const prevInput = textarea.value.split(/\s+/);  // match any number of whitespace-like chars
    const hasPrevInput = !(prevInput.length === 1 && prevInput[0] === '');
    const predictedIdx = (hasPrevInput) ? model.predict(tf.tensor(prevInput)) : getRandomWord(vocab);
    return vocab[predictedIdx];  // use the predicted index to find the predicted word
}

function updateRecs() {
    let vocabCopy = vocab.slice();
    const getWord = (model === null) ? getRandomWord : getPredictedWord;

    for (let button of wordButtons) {
        let newWord = getWord(vocabCopy, model);
        button.value = newWord;
        button.innerHTML = newWord;
    }
}

for (let button of wordButtons) {
    button.addEventListener('click', event => {
        addFullWord(event.target.value);
    });
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
