
import { getTables, getPlayersByTableID } from './tableController.js'

class Card {
    constructor(val, clr){
        this.value = val
        this.color = clr
    }
}

let colors = ["Pique", "Carreau", "Trêfle", "Coeur"]
const values = Array(14).fill().map((_, i) => i+1)
const valuesAtout = Array(22).fill().map((_, i) => i)

function createDeck(){
    let deck = []
    colors.forEach(color => {
        values.forEach(value =>{
            deck.push(new Card(value, color)) 
        })
    })
    valuesAtout.forEach(value =>{
        deck.push(new Card(value, "Atout"))          
    })   
    return deck
}

function shuffleDeck(deck){
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]]
    }
    return deck
}

function dealCards(deck, players){
    let nbCardsChien 
    if (players.length === 4 ){
        nbCardsChien = 6
    } else {
        nbCardsChien = 3
    }
    while (deck.length > nbCardsChien ){
        players.map((player) => (
            player.hand.push(...deck.splice(0,3))
        )) 
    }
    console.log("Cards dealt")
    return deck
}

export const sortHandCard = (plyrHand)=> {
    colors.push("Atout")
    plyrHand.sort(sortingFunction)
    colors.pop()
    return plyrHand

}

function sortingFunction(cardA, cardB){
    const valueA = cardA.value;
    const suitA = cardA.color
    const valueB = cardB.value;
    const suitB = cardB.color
    // Comparer les couleurs des cartes
    if (suitA !== suitB) {
        return colors.indexOf(suitA) - colors.indexOf(suitB);
    }
    // Si les couleurs sont égales, comparer les valeurs
    return valueB - valueA;
}


export const startGame = (tableId, io) => {
    const tables = getTables(); // Récupère les tables actuelles

    if (tables[tableId]) {
        const players = getPlayersByTableID(tableId); // Récupère les joueurs de la table
        console.log("_____________START GAME____________")
        console.log(`La partie de la table ${tableId} commence`)

        let deckCards = createDeck()
        deckCards = shuffleDeck(deckCards)
        console.log("Shuffle deck ok")

        let chien = dealCards(deckCards, players)
        console.log("Chien", chien)

        // Envoie l'événement startGame avec la liste des joueurs au client + cards
        io.to(tableId).emit('startGame', { tableId, players });
        io.to(tableId).emit('dealtCards', {tableId});
        io.to(tableId).emit('startBet', {tableId, players});


    } else {
        console.log(`Table ${tableId} non trouvée pour démarrer le jeu.`);
    }
};
