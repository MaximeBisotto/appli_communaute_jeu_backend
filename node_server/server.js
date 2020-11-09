const express = require('express');
const app = express();
const Client = require('pg');
const sha1 = require('sha1');
//const session = require('express-session');
const crypto = require('crypto');

var config_bdd = require('./config_bdd.json')

const client = new Client.Pool(config_bdd);
/*const client = new Client.Pool({
	user: 'postgres',
	host: '172.17.0.1',
	// host: 'localhost',
	database: 'jeu',
	password: 'mdp',
	port: 5432,
});*/


/*app.use(session({// charge le middleware express-session dans la pile
 	secret: 'ma phrase secrete',
 	saveUninitialized: false, // Session créée uniquement à la première sauvegarde de données
 	resave: false, // pas de session sauvegardée si pas de modif
	store : express.session.MemoryStore,
	cookie : {maxAge : 24 * 3600 * 1000}
}));*/

function getIdUser(token) {
	let idUser;
	client.query("SELECT idUser FROM Token WHERE token='" + request.query.token + "'")
	.then((res) => {
		idUser = res[0][0];
	})
	.catch((err) => {
		// TODO throws a error
		console.log("erreur lors de la connexion");
		console.log(err);
		idUser=null;
      	});
      	return idUser;	
}

/*function insertNewToken(idUser) {
	var token;
	client.query("SELECT token FROM Token WHERE iduser=" + idUser + ";")
	.then((res) => {
		console.log(res);
		var token = res.rows[0].token;
		console.log("token: " + token);	
		if (token == undefined || token == null) {
			token = crypto.randomBytes(64).toString('hex');
			console.log("INSERT INTO Token (Token, idUser, dateCreation) VALUES ('" + token + "', '" + idUser + "', NOW());");
			client.query("INSERT INTO Token (Token, idUser, dateCreation) VALUES ('" + token + "', '" + idUser + "', NOW());")
			.then((res) => {
				//return token;
			})
			.catch((err) => {
				console.log("erreur token");
				console.log(err);
			});
		}
		//response.json(token);
		console.log("fin fonction: " + token);
		return token;
	})
	.catch((err) => {
		console.log("erreur token");
		console.log(err);
	});
	
	//response.json(token);
	//return token;
	//return token;



	var token = crypto.randomBytes(64).toString('hex');
	console.log("INSERT INTO Token (Token, idUser, dateCreation) VALUES ('" + token + "', '" + idUser + "', NOW());");
	client.query("INSERT INTO Token (Token, idUser, dateCreation) VALUES ('" + token + "', '" + idUser + "', NOW());")
	.then((res) => {
		console.log("fghjkjhgfgh");
		return token;
	})
	.catch((err) => {
		// TODO il faudrait ignorer l'exception qui est tout à fait normale si l'utilisateur est déjà inscrit
		client.query("SELECT token FROM Token WHERE iduser=" + idUser + ";")
		.then((res) => {
			console.log("success");
			return res.rows[0].token;
		})
		.catch((err) => {
			console.log("erreur token");
			console.log(err);
		});
		if (err.code != '23505') {
			console.log("error insert token bdd");
			console.log(err);
		}
	});
	//return token;
}*/


/**
 *	Requête GET /login 
 *	
 *	Param: username et password
 *	Response: token (len: 64) or false if the connection failed
 **/
app.get('/login', (request, response) => {
	console.log(request.query);
	if (request.query.username != null && request.query.password !=  null) {
		client.connect(function(err, client, done) {
			if(err) {
				console.log('Erreur lors de la connection avec le serveur PostgreSQL : ' + err.stack);
			}
			else {
				console.log('Connection avec le serveur PostgreSQL réussi');
			}
		});
		var token;
		client.query("SELECT iduser FROM Users WHERE username = '" + request.query.username + "' AND password='" + sha1(request.query.password) + "';")
		.then((res) => {
			if (res != null && res.rowCount == 1) {
				var idUser = res.rows[0].iduser;
				client.query("SELECT token FROM Token WHERE iduser=" + idUser + ";")
				.then((res) => {
					console.log(res);
					var token = res.rows[0].token;
					console.log("token: " + token);	
					if (token == undefined || token == null) {
						token = crypto.randomBytes(64).toString('hex');
						client.query("INSERT INTO Token (Token, idUser, dateCreation) VALUES ('" + token + "', '" + idUser + "', NOW());")
						.then((res) => {
							//return token;
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
				console.log("incorrect");
				response.json(false);
			}
		})
		.catch((err) => {
			console.log("erreur lors de la connexion");
			console.log(err);
        		response.json(false);
      		});
	}
	else {
		console.log("erreur dans les paramètres");
		response.json(false);
	}
});



app.get('/register', (request, response) => {
	console.log(request.query);
	if (request.query.username != null && request.query.password !=  null) {
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
		
		var token;
		client.query("INSERT INTO Users (" + Object.keys(user).toString() + ") VALUES (" + Object.values(user).toString() + ");")
		.then((res) => {
			client.query("SELECT idUser FROM Users WHERE username=" + user.username + ";")
			.then((res) => {
				console.log(res);
				idUser = res.rows[0].iduser;
				client.query("SELECT token FROM Token WHERE iduser=" + idUser + ";")
				.then((res) => {
					console.log(res);
					if (res.rowCount == 1) {
						token = res.rows[0].token;
					}
					else {
						token = crypto.randomBytes(64).toString('hex');
						console.log("INSERT INTO Token (Token, idUser, dateCreation) VALUES ('" + token + "', '" + idUser + "', NOW());");
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
				console.log("erreur lors de la connexion");
				console.log(err);
        			response.json(false);
      			});
		})
		.catch((err) => {
				console.log("erreur lors de la connexion");
				console.log(err);
      		});
      		console.log("sdfghjk");
      	}
	else {
		console.log("erreur dans les paramètres");
		response.json(false);
	}
});

app.get('/user/change', (request, response) => {
	console.log(request.query);
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
			console.log(res);
			if (res.rowCount == 1) {
				idUser = res.rows[0].iduser;
				var updateQuery = "UPDATE Users SET " + Object.keys(user)[0] + "=" + Object.values(user)[0] + "";
				for (let i = 1; i < Object.keys(user).length; ++i) {
					updateQuery += ", " + Object.keys(user)[i] + "=" + Object.values(user)[i] + "";
				}
				updateQuery += " WHERE idUser='" + idUser + "';";
				console.log(updateQuery);
				client.query(updateQuery)
				.then((res) => {
					console.log("update");
					response.json(true);
				})
				.catch((err) => {
					console.log("erreur lors de la connexion");
					console.log(err);
        				response.json(false);
      				});
			}
			else {
				response.json(false);
			}
		})
		.catch((err) => {
				console.log("erreur lors de la connexion");
				console.log(err);
        			response.json(false);
      		});
	}
	else {
		console.log("erreur dans les paramètres");
		response.json(false);
	}
});

app.get('/event/create', (request, response) => {
	console.log(request.query);

	if (request.query.eventLocation != null && request.query.startDate != null && request.query.startTime != null && request.query.duration != null && request.query.maxPlayer != null &&  request.query.token != null) {
		client.connect(function(err, client, done) {
			if(err) {
				console.log('Erreur lors de la connection avec le serveur PostgreSQL : ' + err.stack);
			}
			else {
				console.log('Connection avec le serveur PostgreSQL réussi');
			}
		});
		// TODO faire une map
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
				event.idOrganisateur=idUser;
      				
      				console.log("INSERT INTO Event (" + Object.keys(event).toString() + ") VALUES (" + Object.values(event).toString() + ") RETURNING idEvent");
				client.query("INSERT INTO Event (" + Object.keys(event).toString() + ") VALUES (" + Object.values(event).toString() + ") RETURNING idEvent")
				.then((res) => {
					response.json(res.rows[0].idevent);
				})
				.catch((err) => {
					console.log("erreur lors de la connexion");
					console.log(err);
        				response.json(false);
      				});
			}
			else {
				response.json(false);
			}
		})
		.catch((err) => {
				console.log("erreur lors de la connexion");
				console.log(err);
        			response.json(false);
      		});
      		
      		
	}

	else {
		console.log("erreur dans les paramètres");
		response.json(false);
	}

});

app.get('/event/update', (request, response) => {
	console.log(request.query);
	if (request.query.idEvent != null && request.query.token !=  null) {

		client.connect(function(err, client, done) {

			if(err) {
				console.log('Erreur lors de la connection avec le serveur PostgreSQL : ' + err.stack);
			}
			else {
				console.log('Connection avec le serveur PostgreSQL réussi');
			}
		});
		// TODO faire une map
		
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
					console.log("update");
					response.json(true);
				})
				.catch((err) => {
						console.log("erreur lors de la connexion");
						console.log(err);
						response.json(false);

		      		});
					}
		})
		.catch((err) => {
			console.log("erreur lors de la connexion");
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
 * 	Retourne les informations à propos d'un événement
 * 	Requête /event/:idEvent
 * 	Param: idEvent
 * 	Response: Every column in that table TODO définir clairement quand la base sera fixé
 **/
app.get('/event/:idEvent', (request, response) => {
	client.query("SELECT * FROM Event WHERE idEvent = '" + request.params.idEvent + "';")
	.then((res) => {
			console.log(res.rows[0]);
			response.json(res.rows[0]);
		})
		.catch((err) => {
				console.log("erreur lors de la connexion");
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
	client.query("SELECT idUser FROM Token WHERE token='" + request.query.token + "'")
		.then((res) => {
			if (res.rowCount == 1) {
				idUser = res.rows[0].iduser;
				client.query("INSERT INTO participation (idUser,idEvent) INTO (" + idUser + "," + idEvent + ");")
				.then((res) => {
					response.json(true);
				})
				.catch((res) => {
					console.log(err);
					response.json(false);
				})
		})
		.catch((err) => {
				console.log("erreur lors de la connexion");
				response.json(false);
				console.log(err);
      });
      response.json(false);
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
				client.query("DELETE FROM participation WHERE idUser='" + idUser + "' AND idEvent='" + idEvent + "';")
				.then((res) => {
					response.json(true);
				})
				.catch((res) => {
					console.log(err);
					response.json(false);
				})
		})
		.catch((err) => {
				console.log("erreur lors de la connexion");
				response.json(false);
				console.log(err);
      });
      response.json(false);
});

/**
 * 	Retourne la liste des jeux
 * 	Requête /game/
 * 	Param: aucun
 * 	Response: Every column in that table TODO définir clairement quand la base sera fixé
 **/
app.get('/game', (request, response) => {
	client.query("SELECT idgame, games.name, coast, descriptive, minplayer, maxplayer, minold, picturefilename, gamesupport.name, gametype.name FROM games LEFT JOIN gamesupport ON games.idsupport = gamesupport.idsupport LEFT JOIN gametype on gametype.idtype = games.idtype;")
	.then((res) => {
			console.log(res.rows);
			response.json(res.rows);
		})
		.catch((err) => {
				console.log("erreur lors de la connexion");
				console.log(err);
        response.json(false);
      });
});

/**
 * 	Retourne les informations à propos d'un jeu
 * 	Requête /game/:idGame
 * 	Param: idGame

 * 	Response: Every column in that table TODO définir clairement quand la base sera fixé
 **/
app.get('/game/:idGame', (request, response) => {
	client.query("SELECT idgame, games.name, coast, descriptive, minplayer, maxplayer, minold, picturefilename, gamesupport.name, gametype.name FROM games LEFT JOIN gamesupport ON games.idsupport = gamesupport.idsupport LEFT JOIN gametype on gametype.idtype = games.idtype WHERE idGame = '" + request.params.idGame + "';")
	.then((res) => {
			console.log(res.rows[0]);
			response.json(res.rows[0]);
		})
		.catch((err) => {
				console.log("erreur lors de la connexion");
				console.log(err);
        response.json(false);
      });
});

/**
 * 	Retourne la liste des support de jeux
 * 	Requête /game/
 * 	Param: aucun
 * 	Response: Every column in that table TODO définir clairement quand la base sera fixé
 **/
app.get('/game/listSupport', (request, response) => {
	client.query("SELECT name FROM gamesupport;")
	.then((res) => {
		console.log(res.rows);
		response.json(res.rows);
	})
	.catch((err) => {
		console.log("erreur lors de la connexion");
		console.log(err);
        	response.json(false);
      	});
});

/**
 * 	Retourne la liste des types de jeux
 * 	Requête /game/
 * 	Param: aucun
 * 	Response: Every column in that table TODO définir clairement quand la base sera fixé
 **/
app.get('/game/listType', (request, response) => {
	client.query("SELECT name FROM gametype;")
	.then((res) => {
		console.log(res.rows);
		response.json(res.rows);
	})
	.catch((err) => {
			console.log("erreur lors de la connexion");
			console.log(err);
       			response.json(false);
	});
});

var server = app.listen(3018, () => {
	console.log('ecoute sur 3018');
});
