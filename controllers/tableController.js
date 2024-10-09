// tableController.js

let tables = {};

class Player {
    constructor(id, name){
        this.id = id
        this.name = name
        this.hand = []
        this.hasBet = false
        this.hasTaken = false
        this.pliWon = []
    }
}

// Créer une table
export const createTable = (tableID, maxPlayers) => {
    tables[tableID] = {
        players: [],
        maxPlayers: maxPlayers,
        full: false
    };
};


export const joinTable = (tableId, playerId, io) => {
    const tables = getTables();

    // Vérifier si la table existe
    if (tables[tableId]) {
        const table = tables[tableId];
        const players = table.players

        // Vérifier si la table n'est pas pleine et que le joueur n'est pas déjà dans la table
        if (!table.full && !players.includes(playerId)) {
            const ind = players.length
            console.log("ind :",ind)
            players.push(new Player(playerId, `J${ind+1}`));  // Ajouter le joueur à la table + instancie joueur


            console.log(`Joueur ${playerId} ajouté à la table ${tableId}`);

            // Vérifier si la table est maintenant pleine
            if (players.length === table.maxPlayers) {
                table.full = true;  // Marquer la table comme complète
            } else {
                // Mettre à jour la liste des joueurs de la table pour tous les joueurs
                io.to(tableId).emit('updatePlayers', { players });
            }
        }
    } else {
        console.log(`La table ${tableId} n'existe pas`);
    }
};


// Retirer un joueur d'une table
export const leaveTable = (tableId, playerId, io) => {
    if (tables[tableId]) {
        const table = tables[tableId];
        let players = table.players
        let playersID = []
        players.map((player)=>{
            playersID.push(player.id)
        })
        const playerIndex = playersID.indexOf(playerId);
        if (playerIndex !== -1) {
            players.splice(playerIndex, 1);

            // Si la table devient vide, supprime-la
            if (players.length === 0) {
                delete tables[tableId];
                console.log(`Table ${tableId} supprimée`);
            } else {
                table.full = false;
            }

            io.to(tableId).emit('updatePlayers', { players  });
        }
    }
};

// Retourner toutes les tables
export const getTables = () => tables;

// Retourner les joueurs d'une table
export const getPlayersByTableID = (tableId)=> {
    const tables = getTables()
    return tables[tableId].players
}

export const getPlayersID = (tableId)=> {
    const players = getPlayersByTableID(tableId)
    let playersID = []
    players.map((player)=>(playersID.push(player.id)))
    return playersID
}

