import * as tf from '@tensorflow/tfjs';

const doc = document;  // eslint-disable-line no-undef

var textarea = doc.getElementById('textarea');
const wordButtons = doc.getElementsByClassName('word-button');

let initialVocab = [
    'dolores', 'placeat', 'culpa', 'laborum', 'natus', 'dignissimos', 'et', 'ut',
    'omnis', 'rerum', 'quas', 'exercitationem', 'tempore', 'repellat', 'enim',
    'soluta', 'error', 'deleniti', 'est', 'perspiciatis'
];

class Vocab {
    constructor(words) {
        this.words = words;
        this.wordToIdx = this.words.reduce((obj, word, idx) => {
            obj[word] = idx;
            return obj;
        }, {});
    }

    get length() {
        return this.words.length;
    }

    toIdx(word) {
        return this.wordToIdx[word];
    }

    toWord(idx) {
        return this.words[idx];
    }
}

let vocab = new Vocab(initialVocab);

let modelFile = null;
let weightsFiles = null;
let model = null;

function handleTextUpload(e, callback) {
    let reader = new FileReader(); // eslint-disable-line no-undef
    reader.onload = callback;
    reader.readAsText(e.target.files[0]);
}

function onVocabLoad(e) {
    vocab = new Vocab(JSON.parse(e.target.result).vocab);
}

doc.getElementById('vocab-upload').addEventListener('change', e => { handleTextUpload(e, onVocabLoad) }, false);
doc.getElementById('json-upload').addEventListener('change', e => { modelFile = e.target.files[0] }, false);
doc.getElementById('weights-upload').addEventListener('change', e => {
    weightsFiles = e.target.files;
    tf.loadModel(tf.io.browserFiles([modelFile, ...weightsFiles]))
      .then(loadedModel => {
        model = loadedModel;
        // eslint-disable-next-line no-undef
        console.log('Model loaded!'); // eslint-disable-line no-console
      });
});

function addFullWord(word) {
    const wordAddition = (textarea.value.endsWith(' ') || textarea.value === '') ? word : ' ' + word;
    textarea.value += wordAddition;
}

function getRandomWord(vocab) {
    // eslint-disable-next-line no-undef
    console.log(); // eslint-disable-line no-console
    let randomIndex = Math.floor(Math.random() * vocab.length);
    let randomWord = vocab.words.splice(randomIndex, 1)[0];  // `splice` returns an array
    return randomWord;
}

function getPredictedWord(vocab, model) {
    let prevInput = textarea.value.split(/\s+/);  // match any number of whitespace-like chars
    const hasPrevInput = !(prevInput.length === 1 && prevInput[0] === '');
    let predictedIdx = 0;
    if (hasPrevInput) {
        if (prevInput.length < 9) {
            // Not yet 9 words -- repeat some of them
            let inputLength = prevInput.length;
            let counter = 0;
            while (prevInput.length < 9) {
                if (counter < inputLength) {
                    prevInput.push(prevInput[counter]);
                    counter++;
                } else {
                    // Reset the counter and start over
                    counter = 0;
                }
            }
        } else {
            // Take the last 9 words
            prevInput = prevInput.slice(0, 9);
        }
        const encodedPrevInput = prevInput.map(word => vocab.toIdx(word));
        const inputVector = tf.oneHot(tf.tensor1d(encodedPrevInput, 'int32'), vocab.length).expandDims(0);
        let preds = model.predict(inputVector);
        preds = preds.flatten();
        preds = tf.log(preds).div(tf.tensor1d([0.5])); // Temperature
        let expPreds = tf.exp(preds);
        preds = expPreds.div(tf.sum(expPreds));
        predictedIdx = tf.multinomial(preds, 1).dataSync()[0];
    } else {
        predictedIdx = getRandomWord(vocab);
    }
    return vocab.toWord(predictedIdx);  // use the predicted index to find the predicted word
}

function updateRecs() {
    let vocabCopy = new Vocab(vocab.words.slice());
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
        updateRecs();
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
