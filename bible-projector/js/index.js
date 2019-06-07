const electron = require('electron');
const fs = require('fs');
const { PythonShell } = require('python-shell');

const pesquisarButton = document.getElementById('pesquisarButton');
const projetarButton = document.getElementById('projetarButton');
const atualizarButton = document.getElementById('atualizarButton');
const ajudaButton = document.getElementById('ajudaButton');
const pesquisarTexto = document.getElementById('pesquisarTexto');
const tamanhoFonteTexto = document.getElementById('tamanhoFonte');
const preview = document.getElementById('textoSelecionado');
const historico = document.getElementById('historico');
const capituloDiv = document.getElementById('capitulo');
const ultimaPesquisa = document.getElementById('ultimaPesquisa');
const versoes = document.getElementById('versoes');

var livro;
var capitulo;
var versiculo;
var biblia;
var texto;
var winProjetor;

const BrowserWindow = electron.remote.BrowserWindow;
const screen = electron.screen;

function salvarPreferencias(livro, capitulo, versiculo, texto) {
    const preferencias = {
        fonte: Number(tamanhoFonteTexto.value),
        textoAtual: {
            livro: livro,
            capitulo: Number(capitulo),
            versiculo: Number(versiculo),
            texto: texto
        },
        versao: versoes.value
    }

    fs.writeFile('data/preferencias.json', JSON.stringify(preferencias), erro => {
        if (erro) {
            preview.value = 'Erro ao enviar informações para o projetor.';
        }
    });
}

function projetar() {
    winProjetor.showInactive();
}

function fecharProjetor() {
    winProjetor.destroy();
}

function criarTelaProjetor() {
    winProjetor = new BrowserWindow({
        title: 'Projetor',
        width: 800, height: 600,
        autoHideMenuBar: true,
        icon: './data/icon.png',
        show: false
    });

    winProjetor.loadFile('windows/projetar.html');

    winProjetor.setFullScreen(true);

    if (screen.getAllDisplays().length > 1) {
        winProjetor.setPosition(window.innerWidth, 0);
    }

    winProjetor.once('closed', () => {
        criarTelaProjetor();
    });
}

function ajuda() {
    const winAjuda = new BrowserWindow({
        title: 'Ajuda',
        width: 800, height: 600,
        autoHideMenuBar: true,
        icon: './data/icon.png',
        show: false
    });

    winAjuda.loadFile('windows/ajuda.html');

    winAjuda.once('ready-to-show', () => {
        winAjuda.show();
    });
}

function avancarVerso() {
    if (!getTextoBible(biblia, livro, capitulo, Number(versiculo) + 1)) {
        preview.value = 'Não há versículos posteriores';
    }
    else {
        preview.value = getTextoBible(biblia, livro, capitulo, ++versiculo) + getRepresentacao(livro, capitulo, versiculo);
        atualizarButton.click();
    }
}

function voltarVerso() {
    if (versiculo > 1) {
        preview.value = getTextoBible(biblia, livro, capitulo, --versiculo) + getRepresentacao(livro, capitulo, versiculo);
        atualizarButton.click();
    }
    else {
        preview.value = 'Não há versículos anteriores';
    }
}

function adicionarVerso() { // Em processo............
    if (!getTextoBible(biblia, livro, capitulo, Number(versiculo) + 1)) {
        preview.value = 'Não há versículos posteriores';
    }
    else {
        preview.value += '<br>' + getTextoBible(biblia, livro, capitulo, ++versiculo) + getRepresentacao(livro, capitulo, versiculo);
        atualizarButton.click();
    }
}

function atualizar() {
    salvarPreferencias(livro, capitulo, versiculo, preview.value);
}

function atualizarHistorico() {
    let textos = [];
    textos = historico.value.split('\n');
    textos.push(ultimaPesquisa.innerHTML);

    // Removendo elementos repetidos e inválidos
    textos = textos.filter((elemento, indice) => {
        return textos.indexOf(elemento) == indice && !!elemento;
    });

    // Atualização da caixa de texto
    let temp = '';
    textos.forEach(texto => {
        temp += texto + '\n';
    });
    temp = temp.substring(0, temp.length - 1);

    historico.value = temp;
}

function pesquisaEncontrada(livro, capitulo, versiculo, texto) {
    ultimaPesquisa.innerHTML = getRepresentacao(livro, capitulo, versiculo, false);
    pesquisarTexto.value = getRepresentacao(livro, capitulo, versiculo, false);
    preview.value = texto + getRepresentacao(livro, capitulo, versiculo);

    if (projetar) {
        atualizar();
        atualizarHistorico();
    }

    capituloDiv.innerHTML = '';

    for (let n = 1; ; n++) {
        const temp = getTextoBible(biblia, livro, capitulo, n);

        if (!!temp) {
            if (n == versiculo) {
                capituloDiv.innerHTML += `<span style="color: rgb(20, 66, 165)">${n} ${temp}</span><br>`;
            }
            else {
                capituloDiv.innerHTML += `${n} ${temp}<br>`;
            }
        }
        else break;
    }
}

function pesquisar(projetar = true, pesquisa = pesquisarTexto.value) {
    const resultado = pesquisarReferencia(biblia, pesquisa);
    livro = resultado.livro;
    capitulo = resultado.capitulo;
    versiculo = resultado.versiculo;
    texto = resultado.texto;

    if (!!livro && !!capitulo && !!versiculo && !!texto)
        pesquisaEncontrada(livro, capitulo, versiculo, texto);
    else {
        preview.value = 'Pesquisa inválida.';
    }
}

function pesquisarPython(projetar = true, pesquisa = pesquisarTexto.value) {
    const python = new PythonShell('query-bible.py', {
        scriptPath: __dirname + '/../py/',
        mode: 'text',
        encoding: 'utf8',
        pythonOptions: ['-u'],
        args: [pesquisa]
    });

    python.once('message', function (message) {
        message = Base64.decode(message);
        message = message.split('<@#$&>');

        livro = message[0];
        capitulo = message[1];
        versiculo = message[2];
        texto = message[3];

        pesquisaEncontrada(livro, capitulo, versiculo, texto);
    });
}

pesquisarButton.onclick = () => pesquisar(true);
atualizarButton.onclick = atualizar;
tamanhoFonteTexto.onchange = () => {
    try {
        salvarPreferencias(livro, capitulo, versiculo, texto);
    }
    catch (e) {
        preview.value = e;
    }
};
projetarButton.onclick = projetar;
ajudaButton.onclick = ajuda;

versoes.onchange = function () {
    biblia = fs.readFileSync('data/bibles/' + versoes.value + '.txt', 'utf-8');
}

pesquisarTexto.addEventListener('keypress', e => {
    if (e.keyCode == 10) {
        pesquisar(false);
    }

    if (e.keyCode == 13) {
        pesquisar(true);
    }
});

document.addEventListener('keydown', e => {
    if (e.keyCode == 115) pesquisarTexto.select(); // F4
    if (e.keyCode == 116) projetar(); // F5
    if (e.keyCode == 117) atualizar(); // F6
    if (e.keyCode == 119) { } // F8
    if (e.keyCode == 120 || e.keyCode == 34) voltarVerso(); // F9 e PageDown
    if (e.keyCode == 121 || e.keyCode == 33) avancarVerso(); // F10 e PageUp
    if (e.keyCode == 112) ajuda(); // F1
    if (e.keyCode == 27) fecharProjetor(); // ESC
});

const preferencias = JSON.parse(fs.readFileSync('data/preferencias.json', 'utf-8'));
tamanhoFonteTexto.value = preferencias.fonte;
biblia = fs.readFileSync('data/bibles/' + preferencias.versao + '.txt', 'utf-8');
versoes.value = preferencias.versao;

criarTelaProjetor();