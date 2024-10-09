// socketController.js
import { createTable, joinTable, leaveTable, getTables, getPlayersByTableID } from './tableController.js';
import { startGame, sortHandCard} from './gameController.js';

export const handleSocketConnection = (io) => {
    io.on('connection', (socket) => {
        console.log('Utilisateur connecté:', socket.id);

        // Sélection du nombre de joueurs pour une table
        socket.on('selectedTable', (nbPlayers) => {
            console.log(`Recherche d'une table pour ${nbPlayers} joueurs`);
            const tables = getTables();

            const availableTable = Object.keys(tables).find((tableId) => {
                return tables[tableId].maxPlayers === nbPlayers && !tables[tableId].full;
            });

            if (availableTable) {
                socket.emit('joinTable', { tableId: availableTable });
            } else {
                const newTableId = `table-${Date.now()}`;
                createTable(newTableId, nbPlayers);
                socket.emit('joinTable', { tableId: newTableId });
                console.log('Table créée :', newTableId);
            }
        });

        // Rejoindre une table existante
        socket.on('joinTable', ({ tableId }) => {
            const tables = getTables();
            const players = getPlayersByTableID(tableId)

            if (tables[tableId]) {
                socket.join(tableId);
                joinTable(tableId, socket.id, io);
                console.log(socket.id, 'a rejoint la table:', tableId);
                // Si la table est pleine, démarrer la partie
                if (players.length === tables[tableId].maxPlayers) {
                    startGame(tableId, io); // Démarre le jeu sur une table
                }
            }
        });

        // Quitter une table
        socket.on('leaveTable', ({ tableId }) => {
            socket.leave(tableId);
            leaveTable(tableId, socket.id, io);
            console.log(socket.id, 'a quitté la table:', tableId);
        });

        socket.on("hand", ({tableId}, response)=>{
            const playerID = socket.id
            const players = getPlayersByTableID(tableId)
            const player = players.find((player) => player.id === playerID);
            let hand = sortHandCard(player.hand) 
            response({ hand })

        })

        socket.on('bet', ({bet}, response)=>{
            const message = 'mise reçue par le serveur'
            // broadcast 
            response({message})
        })

        // Déconnexion d'un joueur
        socket.on('disconnect', () => {
            console.log('Utilisateur déconnecté:', socket.id);
            // const tables = getTables();

            // Object.keys(tables).forEach((tableId) => {
            //     const players = getPlayersByTableID(tableId);
            //     const player = players.find((player) => player.id === socket.id);
        
            //     if (player) {
            //         // Retirer le joueur de la table
            //         leaveTable(tableId, socket.id, io);
            //         console.log(`Joueur ${socket.id} retiré de la table ${tableId}`);
        
            //         // Si la table devient vide, la supprimer
            //         if (!tables[tableId]?.players.length) {
            //             delete tables[tableId];  // Supprimer la table si elle est vide
            //             console.log(`Table ${tableId} supprimée.`);
            //         } else {
            //             // Mettre à jour les joueurs restants
            //             io.to(tableId).emit('updatePlayers', { players: tables[tableId].players });
            //         }
            //     }
            // });
        });
    });
};
