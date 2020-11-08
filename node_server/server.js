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

app.post('/user/change', (request, response) => {
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
		let idUser;
		client.query("SELECT idUser FROM Token WHERE token='" + request.query.token + "'")
		.then((res) => {
			idUser = res[0][0];
		})
		.catch((err) => {
				console.log("erreur lors de la connexion");
				console.log(err);
        			response.json(false);
      		});
      		
		var updateQuery = "UPDATE User SET " + Object.keys(user)[0] + "='" + Object.entries(user)[0] + "'";
		for (let i = 1; i < Object.keys(user).length; ++i) {
			updateQuery += ", " + Object.keys(user)[i] + "='" + Object.entries(user)[i] + "'";
		}
		updateQuery += " WHERE idUser=" + idUser + ";";  // TODO remplacer la variable request.session.idUser pour ne pas utiliser de session
		client.query(updateQuery)
		.then((res) => {
			console.log("update");
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

app.post('/event/create', (request, response) => {
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
		var event;
		if (request.query.mobile != null) {
			event.mobile= request.query.mobile;
		}
		if (request.query.maxPlayer != null) {
			event.maxPlayer= request.query.maxPlayer;
		}
		if (request.query.eventLocation != null) {
			event.eventLocation= request.query.eventLocation;
		}
		if (request.query.startDate != null) {
			event.startDate= request.query.startDate;
		}
		if (request.query.startTime != null) {
			event.startTime= request.query.startTime;
		}
		if (request.query.duration != null) {
			event.duration= request.query.duration;
		}
		if (request.query.lateMax != null) {
			event.lateMax= request.query.lateMax;
		}
		
		let idUser;
		client.query("SELECT idUser FROM Token WHERE token='" + request.query.token + "'")
		.then((res) => {
			idUser = res[0][0];
		})
		.catch((err) => {
				console.log("erreur lors de la connexion");
				console.log(err);
        			response.json(false);
      		});
      		
      		event.idOrganisateur=idUser;
      		
		client.query("INSERT INTO Event (" + Object.keys(user).toString() + ") VALUES (" + Object.entries(user).toString() + ")")
		.then((res) => {
			//request.session.username = user.username;
			//request.session.idUser = res.rows[0].id;
			console.log("correct");
			response.json(true);
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

app.post('/event/update', (request, response) => {
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
		
		var event;
		if (request.query.mobile != null) {
			event.mobile= request.query.mobile;
		}
		if (request.query.maxPlayer != null) {
			event.maxPlayer= request.query.maxPlayer;
		}
		if (request.query.eventLocation != null) {
			event.eventLocation= request.query.eventLocation;
		}
		if (request.query.startDate != null) {
			event.startDate= request.query.startDate;
		}
		if (request.query.startTime != null) {
			event.startTime= request.query.startTime;
		}
		if (request.query.duration != null) {
			event.duration= request.query.duration;
		}
		if (request.query.lateMax != null) {
			event.lateMax= request.query.lateMax;
		}
		
		let idUser;
		client.query("SELECT idUser FROM Token WHERE token='" + request.query.token + "'")
		.then((res) => {
			idUser = res[0][0];
		})
		.catch((err) => {
				console.log("erreur lors de la connexion");
				console.log(err);
        			response.json(false);
      		});
		var updateQuery = "UPDATE Event SET " + Object.keys(user)[0] + "='" + Object.entries(user)[0] + "'";
		for (let i = 1; i < Object.keys(user).length; ++i) {
			updateQuery += ", " + Object.keys(user)[i] + "='" + Object.entries(user)[i] + "'";
		}
		updateQuery += " WHERE idUser=" + idUser + " AND idEvent=" + request.query.idEvent + ";";
		client.query(updateQuery)
		.then((res) => {
			console.log("update");
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
 *	Param: none
 *	Response: redirection
 **/
app.get('/logout', (request, response) => {
	// TODO delete the token
	client.query("DELETE Token WHERE idUser = " + request.session.idUser + ";");
	/*request.session.destroy(function(err) {
  		// cannot access session here
	});*/
	response.redirect('/');
	
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

var server = app.listen(3018, () => {
	console.log('ecoute sur 3018');
});
