const express = require('express');
const app = express();
const Client = require('pg');
const sha1 = require('sha1');
const crypto = require('crypto');
const bp = require("body-parser");

var config_bdd = require('./config_bdd.json')

const client = new Client.Pool(config_bdd);

app.use(bp.urlencoded({ extended: true }));

/**
 *	Requête GET /login 
 *	
 *	Param: username et password
 *	Response: token (len: 64) or false if the connection failed
 **/
app.post('/login', (request, response) => {
	console.log(request.body);
	if (request.body.username != null && request.body.password !=  null) {
		client.connect(function(err, client, done) {
			if(err) {
				console.log('Erreur lors de la connection avec le serveur PostgreSQL : ' + err.stack);
			}
			else {
				console.log('Connection avec le serveur PostgreSQL réussi');
			}
		});
		var token;
		client.query("SELECT iduser FROM Users WHERE username = '" + request.body.username + "' AND password='" + sha1(request.body.password) + "';")
		.then((res) => {
			if (res != null && res.rowCount == 1) {
				var idUser = res.rows[0].iduser;
				client.query("SELECT token FROM Token WHERE iduser=" + idUser + ";")
				.then((res) => {
					var token = res.rows[0].token;
					if (token == undefined || token == null) {
						token = crypto.randomBytes(64).toString('hex');
						client.query("INSERT INTO Token (Token, idUser, dateCreation) VALUES ('" + token + "', '" + idUser + "', NOW());")
						.then((res) => {
							
						})
						.catch((err) => {
							console.log("erreur token");
							console.log(err);
						});
					}
					response.json(token);
				})
				.catch((err) => {
					console.log("erreur token");
					console.log(err);
				});
			}
			else {
				response.json(false);
			}
		})
		.catch((err) => {
			console.log(err);
        		response.json(false);
      		});
	}
	else {
		console.log("erreur dans les paramètres");
		response.json(false);
	}
});


/**
 * 	Permet d'inscrire un utilisateur
 * 	Requête /register
 * 	Param: username, password, autre élément sur l'utilisateur 
 * 	Response: token
 **/
app.post('/register', (request, response) => {
	if (request.body.username != null && request.body.password !=  null) {
		client.connect(function(err, client, done) {
			if(err) {
				console.log('Erreur lors de la connection avec le serveur PostgreSQL : ' + err.stack);
			}
			else {
				console.log('Connection avec le serveur PostgreSQL réussi');
			}
		});
		// TODO faire une map
		var user = new Object();
		if (request.body.username != null) {
			user.username= "'" + request.body.username + "'";
		}
		if (request.body.name != null) {
			user.name= "'" + request.body.name + "'";
		}
		if (request.body.password != null) {
			user.password= "'" + sha1(request.body.password) + "'";
		}
		if (request.body.mail != null) {
			user.mail= "'" + request.body.mail + "'";
		}
		if (request.body.city != null) {
			user.city= "'" + request.body.city + "'";
		}
		if (request.body.birthdate != null) {
			user.birthdate= "'" + request.body.birthdate + "'";
		}
		if (request.body.mobile != null) {
			user.mobile= "'" + request.body.mobile + "'";
		}
		
		var token;
		client.query("INSERT INTO Users (" + Object.keys(user).toString() + ") VALUES (" + Object.values(user).toString() + ");")
		.then((res) => {
			client.query("SELECT idUser FROM Users WHERE username=" + user.username + ";")
			.then((res) => {
				idUser = res.rows[0].iduser;
				client.query("SELECT token FROM Token WHERE iduser=" + idUser + ";")
				.then((res) => {
					if (res.rowCount == 1) {
						token = res.rows[0].token;
					}
					else {
						token = crypto.randomBytes(64).toString('hex');
						client.query("INSERT INTO Token (Token, idUser, dateCreation) VALUES ('" + token + "', '" + idUser + "', NOW());")
						.then((res) => {
							//return token;
						})
						.catch((err) => {
							console.log("erreur token");
							console.log(err);
							response.json(false);
						});
					}
					response.json(token);
				})
				.catch((err) => {
					console.log("erreur token");
					console.log(err);
					response.json(false);
				});
			})
			.catch((err) => {
				console.log(err);
        			response.json(false);
      			});
		})
		.catch((err) => {
				console.log(err);
      		});
      	}
	else {
		console.log("erreur dans les paramètres");
		response.json(false);
	}
});


/**
 * 	Permet de mettre à jour son profil utilisateur
 * 	Requête /user/change
 * 	Param: token, username, autre élément sur l'utilisateur 
 * 	Response: boolean
 **/
app.get('/user/change', (request, response) => {
	if (request.query.username != null && request.query.token !=  null) {

		client.connect(function(err, client, done) {

			if(err) {
				console.log('Erreur lors de la connection avec le serveur PostgreSQL : ' + err.stack);
			}
			else {
				console.log('Connection avec le serveur PostgreSQL réussi');
			}
		});
		// TODO faire une map
		var user = new Object();
		if (request.query.username != null) {
			user.username= "'" + request.query.username + "'";
		}
		if (request.query.name != null) {
			user.name= "'" + request.query.name + "'";
		}
		if (request.query.password != null) {
			user.password= "'" + sha1(request.query.password) + "'";
		}
		if (request.query.mail != null) {
			user.mail= "'" + request.query.mail + "'";
		}
		if (request.query.city != null) {
			user.city= "'" + request.query.city + "'";
		}
		if (request.query.birthdate != null) {
			user.birthdate= "'" + request.query.birthdate + "'";
		}
		if (request.query.mobile != null) {
			user.mobile= "'" + request.query.mobile + "'";
		}
		var idUser;
		client.query("SELECT idUser FROM Token WHERE token='" + request.query.token + "'")
		.then((res) => {
			if (res.rowCount == 1) {
				idUser = res.rows[0].iduser;
				var updateQuery = "UPDATE Users SET " + Object.keys(user)[0] + "=" + Object.values(user)[0] + "";
				for (let i = 1; i < Object.keys(user).length; ++i) {
					updateQuery += ", " + Object.keys(user)[i] + "=" + Object.values(user)[i] + "";
				}
				updateQuery += " WHERE idUser='" + idUser + "';";
				client.query(updateQuery)
				.then((res) => {
					response.json(true);
				})
				.catch((err) => {
					console.log(err);
        				response.json(false);
      				});
			}
			else {
				response.json(false);
			}
		})
		.catch((err) => {
				console.log(err);
        			response.json(false);
      		});
	}
	else {
		console.log("erreur dans les paramètres");
		response.json(false);
	}
});


/**
 * 	Permet de creer un évènement
 * 	Requête /event/create
 * 	Param: token, eventLocation, startDate, startTime, duration, maxPlayer, autre élément sur l'évènement 
 * 	Response: boolean
 **/
app.post('/event/create', (request, response) => {

	if (request.body.eventLocation != null && request.body.startDate != null && request.body.startTime != null && request.body.duration != null && request.body.maxPlayer != null &&  request.body.token != null) {
		client.connect(function(err, client, done) {
			if(err) {
				console.log('Erreur lors de la connection avec le serveur PostgreSQL : ' + err.stack);
			}
			else {
				console.log('Connection avec le serveur PostgreSQL réussi');
			}
		});
		
		var event = new Object();
		if (request.body.mobile != null) {
			event.mobile= "'" + request.body.mobile + "'";
		}
		if (request.body.maxPlayer != null) {
			event.maxPlayer= "'" + request.body.maxPlayer + "'";
		}
		if (request.body.eventLocation != null) {
			event.eventLocation= "'" + request.body.eventLocation + "'";
		}
		if (request.body.startDate != null) {
			event.startDate= "'" + request.body.startDate + "'";
		}
		if (request.body.startTime != null) {
			event.startTime= "'" + request.body.startTime + "'";
		}
		if (request.body.duration != null) {
			event.duration= "'" + request.body.duration + "'";
		}
		if (request.body.lateMax != null) {
			event.lateMax= "'" + request.body.lateMax + "'";
		}
		
		let idUser;
		client.query("SELECT idUser FROM Token WHERE token='" + request.body.token + "'")
		.then((res) => {
			if (res.rowCount == 1) {
				idUser = res.rows[0].iduser;
				event.idOrganisateur=idUser;
      				
				client.query("INSERT INTO Event (" + Object.keys(event).toString() + ") VALUES (" + Object.values(event).toString() + ") RETURNING idEvent")
				.then((res) => {
					response.json(res.rows[0].idevent);
				})
				.catch((err) => {
					console.log(err);
        				response.json(false);
      				});
			}
			else {
				response.json(false);
			}
		})
		.catch((err) => {
				console.log(err);
        			response.json(false);
      		});
      		
      		
	}

	else {
		console.log("erreur dans les paramètres");
		response.json(false);
	}

});


/**
 * 	Permet de mettre à jour un évènement
 * 	Requête /event/info/:idEvent
 * 	Param: idEvent, token, élément à mettre à jour
 * 	Response: boolean
 **/
app.get('/event/update', (request, response) => {
	if (request.query.idEvent != null && request.query.token !=  null) {

		client.connect(function(err, client, done) {

			if(err) {
				console.log('Erreur lors de la connection avec le serveur PostgreSQL : ' + err.stack);
			}
			else {
				console.log('Connection avec le serveur PostgreSQL réussi');
			}
		});
		
		var event = new Object();
		if (request.query.mobile != null) {
			event.mobile= "'" + request.query.mobile + "'";
		}
		if (request.query.maxPlayer != null) {
			event.maxPlayer= "'" + request.query.maxPlayer + "'";
		}
		if (request.query.eventLocation != null) {
			event.eventLocation= "'" + request.query.eventLocation + "'";
		}
		if (request.query.startDate != null) {
			event.startDate= "'" + request.query.startDate + "'";
		}
		if (request.query.startTime != null) {
			event.startTime= "'" + request.query.startTime + "'";
		}
		if (request.query.duration != null) {
			event.duration= "'" + request.query.duration + "'";
		}
		if (request.query.lateMax != null) {
			event.lateMax= "'" + request.query.lateMax + "'";
		}
		
		let idUser;
		client.query("SELECT idUser FROM Token WHERE token='" + request.query.token + "'")
		.then((res) => {
			if (res.rowCount == 1) {
				idUser = res.rows[0].iduser;
				var updateQuery = "UPDATE Event SET " + Object.keys(event)[0] + "=" + Object.values(event)[0];
				for (let i = 1; i < Object.keys(event).length; ++i) {
					updateQuery += ", " + Object.keys(event)[i] + "=" + Object.values(event)[i];
				}
				updateQuery += " WHERE idOrganisateur=" + idUser + " AND idEvent=" + request.query.idEvent + ";";
				client.query(updateQuery)
				.then((res) => {
					response.json(true);
				})
				.catch((err) => {
					console.log(err);
					response.json(false);
		      		});
			}
		})
		.catch((err) => {
			console.log(err);
			response.json(false);
		});
		
	}
	else {
		console.log("erreur dans les paramètres");
		response.json(false);
	}
});

/**
 *
 *	Requête /logout
 *	Param: token
 *	Response: redirection
 **/
app.get('/logout', (request, response) => {
	if (request.query.token == undefined) {
		response.json(false);
	}
	else {
		client.query("SELECT idUser FROM Token WHERE token='" + request.query.token + "'")
		.then((res) => {
			if (res.rowCount == 1) {
				idUser = res.rows[0].iduser;
				client.query("DELETE Token WHERE idUser = " + request.session.idUser + ";");
				response.json(true);
			}
			else {
				response.json(false);
			}
		response.redirect('/');
		});
	}
	
});

/**
 * 	Retourne les informations à propos de tout les évènements
 * 	Requête /event/info/:idEvent
 * 	Param: idEvent
 * 	Response: l'id de l'event son organisateur, un mobile à contacter, un nombre maximum de joueur, un lieu, une date et heure de début, la durée et le retard maximum autorisé
 **/
app.get('/event/', (request, response) => {
	client.query("SELECT idevent, idorganisateur, event.mobile, maxplayer, eventlocation, startdate, starttime, duration, latemax, username FROM Event LEFT OUTER JOIN users on users.iduser = event.idorganisateur;")
	.then((res) => {
		response.json(res.rows);
	})
	.catch((err) => {
		console.log(err);
        	response.json(false);
      	});
});

/**
 * 	Retourne les informations à propos d'un événement
 * 	Requête /event/info/:idEvent
 * 	Param: idEvent
 * 	Response: l'id de l'event son organisateur, un mobile à contacter, un nombre maximum de joueur, un lieu, une date et heure de début, la durée et le retard maximum autorisé
 **/
app.get('/event/:idEvent', (request, response) => {
	client.query("SELECT idevent, idorganisateur, event.mobile, maxplayer, eventlocation, startdate, starttime, duration, latemax, username FROM Event LEFT OUTER JOIN users on users.iduser = event.idorganisateur WHERE idEvent = '" + request.params.idEvent + "';")
	.then((res) => {
		response.json(res.rows[0]);
	})
	.catch((err) => {
		console.log(err);
        	response.json(false);
      	});
});

/**
 * 	Inscrit un utilisateur à un evenement
 * 	Requête /event/subscribe/:idEvent
 * 	Param: idEvent, token
 * 	Response: true ou false
 **/
app.get('/event/subscribe/:idEvent', (request, response) => {
	client.query("SELECT idUser FROM Token WHERE token='" + request.query.token + "';")
	.then((res) => {
		if (res.rowCount == 1) {
			idUser = res.rows[0].iduser;
			client.query("INSERT INTO participation (idUser,idEvent) VALUES (" + idUser + "," + request.params.idEvent + ");")
			.then((res) => {
				response.json(true);
			})
			.catch((err) => {
				console.log(err);
				response.json(false);
			});
		}
	})
	.catch((err) => {
		response.json(false);
		console.log(err);
      	});
});

/**
 * 	Désinscrit un utilisateur à un evenement
 * 	Requête /event/unsubscribe/:idEvent
 * 	Param: idEvent, token
 * 	Response: true ou false
 **/
app.get('/event/unsubscribe/:idEvent', (request, response) => {
	client.query("SELECT idUser FROM Token WHERE token='" + request.query.token + "'")
	.then((res) => {
		if (res.rowCount == 1) {
			idUser = res.rows[0].iduser;
			client.query("DELETE FROM participation WHERE idUser='" + idUser + "' AND idEvent='" + request.params.idEvent + "';")
			.then((res) => {
				response.json(true);
			})
			.catch((res) => {
				console.log(err);
				response.json(false);
			})
		}
	})
	.catch((err) => {
		response.json(false);
		console.log(err);
      	});
});

/**
 * 	Retourne la liste des jeux
 * 	Requête /game
 * 	Param: aucun
 * 	Response: pour chaque jeu, cela retourne l'id du jeu, son nom, son coût, sa description, le minimum et le maximum de joueur qui peut jouer, l'age minimum, le chemin vers une image, le support et le type
 **/
app.get('/game', (request, response) => {
	client.query("SELECT idgame, games.name as name, coast as cost, descriptive, minplayer, maxplayer, minold, picturefilename, gamesupport.name as support, gametype.name as type FROM games LEFT JOIN gamesupport ON games.idsupport = gamesupport.idsupport LEFT JOIN gametype on gametype.idtype = games.idtype;")
	.then((res) => {
			response.json(res.rows);
		})
		.catch((err) => {
			console.log(err);
        		response.json(false);
	      	});
});

/**
 * 	Retourne les informations à propos d'un jeu
 * 	Requête /game/info/:idGame
 * 	Param: idGame

 * 	Response: l'id du jeu, son nom, son coût, sa description, le minimum et le maximum de joueur qui peut jouer, l'age minimum, le chemin vers une image, le support et le type
 **/
app.get('/game/info/:idGame', (request, response) => {
	client.query("SELECT idgame, games.name, coast, descriptive, minplayer, maxplayer, minold, picturefilename, gamesupport.name, gametype.name FROM games LEFT JOIN gamesupport ON games.idsupport = gamesupport.idsupport LEFT JOIN gametype on gametype.idtype = games.idtype WHERE idGame = '" + request.params.idGame + "';")
	.then((res) => {
		response.json(res.rows[0]);
	})
	.catch((err) => {
		console.log(err);
        	response.json(false);
      	});
});

/**
 * 	Retourne la liste des support de jeux
 * 	Requête /game/listSupport
 * 	Param: aucun
 * 	Response: Une liste contenant les différents types de jeux
 **/
app.get('/game/listSupport', (request, response) => {
	client.query("SELECT name FROM gamesupport;")
	.then((res) => {
		response.json(res.rows);
	})
	.catch((err) => {
		console.log(err);
        	response.json(false);
      	});
});

/**
 * 	Retourne la liste des types de jeux
 * 	Requête /game/listType
 * 	Param: aucun
 * 	Response: Une liste contenant les différents types de jeux
 **/
app.get('/game/listType', (request, response) => {
	client.query("SELECT name FROM gametype;")
	.then((res) => {
		response.json(res.rows);
	})
	.catch((err) => {
		console.log(err);
       		response.json(false);
	});
});

var server = app.listen(3018, () => {
	console.log('ecoute sur 3018');
});
