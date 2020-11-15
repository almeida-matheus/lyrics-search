//armazenar as referencias do html em variaveis
const form = document.querySelector('#form')
const searchInput = document.querySelector('#search')
const songsContainer = document.querySelector('#songs-container')
const prevAndNextContainer = document.querySelector('#prev-and-next-container')

const apiUrl = `https://api.lyrics.ovh`


//4 - obtem o objeto response e usa essa funcao para pegar o corpo formatando pra json
//passar para json criando requisição padrão
const fetchData = async url => {
    const response = await fetch(url)
    //await: espera a promise ser resolvida e depois atribui o valor dessa promise para data
    return await response.json()
}

//7 - cors > permite q um site use recursos de outros sites msm em dominios diferentes
const getMoreSongs = async url => {
    const data = await fetchData(`https://cors-anywhere.herokuapp.com/${url}`)
    insertSongsIntoPage(data)
}

//6 - inserir botões de next e prev
const insertNextAndPrevButtons = ({ prev, next }) => { //sem prev, next teria q ter songsInfo.xxx
    prevAndNextContainer.innerHTML = `
    ${prev ? `<button class="btn" onclick="getMoreSongs('${prev}')">Anteriores</button>` : ''}
    ${next ? `<button class="btn" onclick="getMoreSongs('${next}')">Próximas</button>` : ''}
`
}

//5 - const q recebe uma funcao com parametro songsinfo, dentro de dessa funcao pega as info do objeto q esta sendo recebido por parametro 
//e insere as informacoes dentro da string, da string pra tela
// insere lis na tela de acordo com a resposta
const insertSongsIntoPage = ({ data, prev, next }) => { //permite remover o songsInfo.xxx e song.artist.name e song.title
    songsContainer.innerHTML = data.map(({ artist: { name }, title }) => `
        <li class="song">
            <span class="song-artist"><strong>${name}</strong> - ${title}</span>
            <button class="btn" data-artist="${name}" data-song-title="${title}">Ver letra</button>
        </li>
    `).join('')

    // botão prev e next
    if (prev || next) {
        insertNextAndPrevButtons({ prev, next })
        return
    }
    //se a condicao de prev e next nao tiver vai limpar o inner dessa div
    prevAndNextContainer.innerHTML = ''
}

//3 - funcao fetchSongs com o paremetro term (funcao assincrona)
//requisição de acordo com o que foi digitado no input
const fetchSongs = async term => {
    //fetch = versao moderna para fazer requisicoes ajax > dados obtidos sem precisar recarregar a pag
    //como funfa = faz req http e tras dados da url q especifica como argumento
    //pede o browse para trazer dados da url

    //data recebe a promise resolvida do fetch
    //espera o fetch fazer a req e obter a resposta, e so entao retorna a resposta em encapsulada em promise, dps desencapsula e armazena em data
    //await: enquanto nao tiver resposta nenhum codigo pra baixo sera executado (pausa a execucao da funcao)
    const data = await fetchData(`${apiUrl}/suggest/${term}`)
    console.log(data) //ve o objeto response exibido no console porem tem q passar para json
    insertSongsIntoPage(data)
}

// 2 -
const handleFormSubmit = event => {
    //para evitar q o form seja enviado e a pagina recarregada
    //quando form tentar ser enviado, nao vai enviar pq quer lidar com os dados do form dentro dessa funcao
    event.preventDefault()

    //quando aperta enter pega o valor digitado e remove os espaços vazios
    const searchTerm = searchInput.value.trim()
    //console.log(searchTerm)
    searchInput.value = '' //limpar o valor de busca quando o input for feito
    searchInput.focus() //voltar a ter foco quando for limpo

    //se tiver vazio a busca retorna uma mensagem Boolean('') = false
    if (!searchTerm) {
        //innetHTML obtem o valor html dentro da ul
        songsContainer.innerHTML = `<li class="warning-message">Por favor, digite um termo válido</li>`
        return //para a execucao da funcao e ignora td em baixo
    }
    // se o valor o input nao for vazio, passa pra função fetchSongs o que o usuário digitou
    fetchSongs(searchTerm)
}

//1 - ação do botão buscar
//invocacao do eventlistener recebe como 1 parametro o tipo de evento q quer ouvir
form.addEventListener('submit', handleFormSubmit)

//10- inserir informações na página de ver letra
const insertLyricsIntoPage = ({ lyrics, artist, songTitle }) => {
    songsContainer.innerHTML = `
        <li class="lyrics-container">
            <h2><strong>${songTitle}</strong> - ${artist}</h2>
            <p class="lyrics">${lyrics}</p>
        </li>
    `
}

//9 - pegando letra da música e exibindo na tela
const fetchLyrics = async (artist, songTitle) => {
    const data = await fetchData(`${apiUrl}/v1/${artist}/${songTitle}`)
    const lyrics = data.lyrics.replace(/(\r\n|\r|\n)/g, '<br>')
    insertLyricsIntoPage({ lyrics, artist, songTitle })
}

//8 - pegar musica clicada
const handleSongsContainerClick = event => {
    const clickedElement = event.target

    if (clickedElement.tagName === 'BUTTON') {
        const artist = clickedElement.getAttribute('data-artist') //artist; "led zeppelin"
        const songTitle = clickedElement.getAttribute('data-song-title')

        // remover botão prev e next quando a letra da música for clicada
        prevAndNextContainer.innerHTML = ''

        fetchLyrics(artist, songTitle)
    }
}

//evento de click
songsContainer.addEventListener('click', handleSongsContainerClick)