function getTextoBible(biblia, livro = '', capitulo = 1, versiculo = 1) {
    let indice = biblia.indexOf(`[${livro} ${capitulo}:${versiculo}]`);

    if (indice == -1) return null;

    indice = biblia.indexOf('\n', indice) + 1;

    return biblia.substring(indice, biblia.indexOf('\n', indice));
}

function normalizar(newStringComAcento) {
    var string = newStringComAcento;
    var mapaAcentosHex = {
        a: /[\xE0-\xE6]/g,
        A: /[\xC0-\xC6]/g,
        e: /[\xE8-\xEB]/g,
        E: /[\xC8-\xCB]/g,
        i: /[\xEC-\xEF]/g,
        I: /[\xCC-\xCF]/g,
        o: /[\xF2-\xF6]/g,
        O: /[\xD2-\xD6]/g,
        u: /[\xF9-\xFC]/g,
        U: /[\xD9-\xDC]/g,
        c: /\xE7/g,
        C: /\xC7/g,
        n: /\xF1/g,
        N: /\xD1/g
    };

    for (var letra in mapaAcentosHex) {
        var expressaoRegular = mapaAcentosHex[letra];
        string = string.replace(expressaoRegular, letra);
    }

    string = string.toLowerCase();

    return string;
}

function getLivro(pesquisa = '') {
    const nomeLivros = [
        'Gênesis', 'Êxodo', 'Levítico',
        'Números', 'Deuteronômio', 'Josué',
        'Juízes', 'Rute', '1 Samuel',
        '2 Samuel', '1 Reis', '2 Reis',
        '1 Crônicas', '2 Crônicas', 'Esdras',
        'Neemias', 'Ester', 'Jó',
        'Salmos', 'Provérbios', 'Eclesiastes',
        'Cantares de Salomão', 'Isaías', 'Jeremias',
        'Lamentações', 'Ezequiel', 'Daniel',
        'Oséias', 'Joel', 'Amós',
        'Obadias', 'Jonas', 'Miquéias',
        'Naum', 'Habacuque', 'Sofonias',
        'Ageu', 'Zacarias', 'Malaquias',
        'Mateus', 'Marcos', 'Lucas',
        'João', 'Atos dos Apóstolos', 'Romanos',
        '1 Coríntios', '2 Coríntios', 'Gálatas',
        'Efésios', 'Filipenses', 'Colossenses',
        '1 Tessalonicenses', '2 Tessalonicenses', '1 Timóteo',
        '2 Timóteo', 'Tito', 'Filemon',
        '1 Pedro', '2 Pedro', '1 João',
        '2 João', '3 João', 'Hebreus',
        'Tiago', 'Judas', 'Apocalipse'
    ];

    const siglasLivros = ['Gn', 'Êx', 'Lv', 'Nm', 'Dt', 'Js', 'Jz', 'Rt', '1 Sm',
        '2 Sm', '1 Rs', '2 Rs', '1 Cr', '2 Cr', 'Ed', 'Ne', 'Et', 'Jó', 'Sl', 'Pv', 'Ec',
        'Ct', 'Is', 'Jr', 'Lm', 'Ez', 'Dn', 'Os', 'Jl', 'Am', 'Ob', 'Jn', 'Mq', 'Na',
        'Hc', 'Sf', 'Ag', 'Zc', 'Ml', 'Mt', 'Mc', 'Lc', 'Jo', 'At', 'Rm', '1 Co', '2 Co',
        'Gl', 'Ef', 'Fp', 'Cl', '1 Ts', '2 Ts', '1 Tm', '2 Tm', 'Tt', 'Fm', '1 Pe', '2 Pe',
        '1 Jo', '2 Jo', '3 Jo', 'Hb', 'Tg', 'Jd', 'Ap'];

    for (let n in siglasLivros) {
        if (normalizar(siglasLivros[n]) == normalizar(pesquisa)) {
            return nomeLivros[n];
        }
    }

    for (let livro of nomeLivros) {
        if (normalizar(livro).indexOf(normalizar(pesquisa)) !== -1) {
            return livro;
        };
    }
}

function getRepresentacao(livro, capitulo, versiculo, parenteses = true) {
    if (parenteses) return '\n(' + livro + ' ' + capitulo + ':' + versiculo + ')';
    else return livro + ' ' + capitulo + ':' + versiculo;
}

function interpretarPesquisa(pesquisa = '') {
    let livro, capitulo, versiculo;

    pesquisa = pesquisa.replace(/:/g, ' ');

    while (pesquisa.indexOf('  ') != -1) { // Remover espaços múltiplos
        pesquisa = pesquisa.replace(/  /g, ' ');
    }

    if (pesquisa[pesquisa.length - 1] == ' ') pesquisa = pesquisa.substring(0, pesquisa.length - 1);
    if (pesquisa[0] == ' ') pesquisa = pesquisa.substring(1);

    pesquisa = pesquisa.split(' ');

    versiculo = parseInt(pesquisa.pop());
    capitulo = parseInt(pesquisa.pop());
    livro = pesquisa.toString().replace(/,/g, ' ');
    livro = getLivro(livro);

    return { livro, capitulo, versiculo }
}

function pesquisaParteTextoJs(biblia, pesquisa = '') {
    let indice = normalizar(biblia).indexOf(normalizar(pesquisa));

    if (indice != -1) {
        let referencia, livro, capitulo, versiculo, texto;

        while (indice >= 0) {
            indice--;
            if (biblia[indice] == '[') break;
        }

        referencia = biblia.substring(indice + 1, biblia.indexOf(']', indice));
        referencia = interpretarPesquisa(referencia);
        livro = referencia.livro;
        capitulo = referencia.capitulo;
        versiculo = referencia.versiculo;
        texto = getTextoBible(biblia, livro, capitulo, versiculo);

        return { livro, capitulo, versiculo, texto };
    }
    else {
        return null;
    }
}

function pesquisarReferencia(biblia, pesquisa = '') {
    let livro, capitulo, versiculo;

    if (!!pesquisa) {
        let referencia = interpretarPesquisa(pesquisa);
        livro = referencia.livro;
        capitulo = referencia.capitulo;
        versiculo = referencia.versiculo;

        texto = getTextoBible(biblia, livro, capitulo, versiculo);

        return {
            livro,
            capitulo,
            versiculo,
            texto
        }
    }
}