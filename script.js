const charSets = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

// Elementos da tela
const lengthSlider = document.getElementById('length-slider');
const lengthVal = document.getElementById('length-val');
const passwordDisplay = document.getElementById('password-display');
const btnGenerate = document.getElementById('btn-generate');
const btnCopy = document.getElementById('btn-copy');
const strengthBar = document.getElementById('strength-bar');
const strengthText = document.getElementById('strength-text');

// Atualiza o contador
lengthSlider.addEventListener('input', () => {
    lengthVal.textContent = lengthSlider.value;
});

// Geração aleatória sem viés
function getRandomSecureIndex(max) {
    const array = new Uint32Array(1);
    const limit = Math.floor(0x100000000 / max) * max;

    let random;

    do {
        window.crypto.getRandomValues(array);
        random = array[0];
    } while (random >= limit);

    return random % max;
}

// Embaralha a senha
function shufflePassword(passwordArray) {
    for (let i = passwordArray.length - 1; i > 0; i--) {
        const j = getRandomSecureIndex(i + 1);
        [passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]];
    }
    return passwordArray;
}

// Geração da senha
function generatePassword() {
    const length = parseInt(lengthSlider.value);

    let allowedChars = '';
    let passwordArray = [];

    const options = [
        { id: 'chk-uppercase', pool: charSets.uppercase },
        { id: 'chk-lowercase', pool: charSets.lowercase },
        { id: 'chk-numbers', pool: charSets.numbers },
        { id: 'chk-symbols', pool: charSets.symbols }
    ];

    let selectedPools = [];
    let typesCount = 0;

    options.forEach(opt => {
        if (document.getElementById(opt.id).checked) {
            allowedChars += opt.pool;
            selectedPools.push(opt.pool);
            typesCount++;
        }
    });

    if (allowedChars === '' || length === 0) {
        passwordDisplay.textContent = 'Selecione uma opção!';
        updateStrength(0, 0);
        return;
    }

    if (length < selectedPools.length) {
        passwordDisplay.textContent =
            `Escolha no mínimo ${selectedPools.length} caracteres!`;
        updateStrength(0, 0);
        return;
    }

    // Garante um caractere de cada categoria
    selectedPools.forEach(pool => {
        passwordArray.push(pool[getRandomSecureIndex(pool.length)]);
    });

    // Completa o restante
    while (passwordArray.length < length) {
        passwordArray.push(
            allowedChars[getRandomSecureIndex(allowedChars.length)]
        );
    }

    // Embaralha
    passwordArray = shufflePassword(passwordArray);

    const password = passwordArray.join('');
    passwordDisplay.textContent = password;

    // Entropia
    const poolSize = allowedChars.length;
    const entropy = length * Math.log2(poolSize);

    updateStrength(entropy, typesCount);
}

// Atualiza a barra de força
function updateStrength(entropy, typesCount) {

    if (entropy === 0) {
        strengthBar.style.width = '0%';
        strengthBar.style.backgroundColor = '#ccc';
        strengthText.textContent = 'Inexistente';

    } else if (entropy < 40 || typesCount < 2) {
        strengthBar.style.width = '33%';
        strengthBar.style.backgroundColor = '#ff4d4d';
        strengthText.textContent = 'Fraca';

    } else if (entropy < 60 || typesCount < 3) {
        strengthBar.style.width = '66%';
        strengthBar.style.backgroundColor = '#ffaa00';
        strengthText.textContent = 'Média';

    } else {
        strengthBar.style.width = '100%';
        strengthBar.style.backgroundColor = '#00cc66';
        strengthText.textContent = 'Forte';
    }
}

// Copiar senha
btnCopy.addEventListener('click', async () => {

    const text = passwordDisplay.textContent;

    if (
        text &&
        text !== 'Clique em Gerar' &&
        text !== 'Selecione uma opção!'
    ) {
        try {
            await navigator.clipboard.writeText(text);
            alert('Senha copiada com sucesso!');
        } catch (erro) {
            alert('Não foi possível copiar a senha.');
            console.error(erro);
        }
    }

});

// Gerar senha
btnGenerate.addEventListener('click', generatePassword);