const express = require('express');
const app = express();
const Client = require('pg');
const sha1 = require('sha1');
//const session = require('express-session');
const crypto = require('crypto');

const client = new Client.Pool({
	user: 'postgres',
	host: '172.17.0.1',
	// host: 'localhost',
	database: 'jeu',
	password: 'mdp',
	port: 5432,
});

/*app.use(session({// charge le middleware express-session dans la pile
 	secret: 'ma phrase secrete',
 	saveUninitialized: false, // Session créée uniquement à la première sauvegarde de données
 	resave: false, // pas de session sauvegardée si pas de modif
	store : express.session.MemoryStore,
	cookie : {maxAge : 24 * 3600 * 1000}
}));*/

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

		client.query("SELECT idUser FROM User WHERE username = '" + request.query.username + "' AND password='" + sha1(request.query.password) + "';")
		.then((res) => {
			console.log("azert");
			if (res != null && res.rowCount == 1) {
				//request.session.username = request.query.username;
				//request.session.idUser = res.rows[0].id;
				console.log("correct");
				// TODO add a token for this user
				var token = crypto.randomBytes(64).toString('hex');
				client.query("INSERT INTO Token (token, idUser, dateCreation) VALUES (" + token + ", " + res[0]["idUser"] + ", NOW());")
				response.json(token);
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



app.post('/register', (request, response) => {
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
		var user;
		if (request.query.username != null) {
			user.username= request.query.username;
		}
		if (request.query.name != null) {
			user.name= request.query.name;
		}
		if (request.query.password != null) {
			user.password= request.query.password;
		}
		if (request.query.mail != null) {
			user.mail= request.query.mail;
		}
		if (request.query.city != null) {
			user.city= request.query.city;
		}
		if (request.query.birthdate != null) {
			user.birthdate= request.query.birthdate;
		}
		if (request.query.mobile != null) {
			user.mobile= request.query.mobile;
		}
		client.query("INSERT INTO User (" + Object.keys(user).toString() + ") VALUES (" + Object.entries(user).toString() + ")")
		.then((res) => {
			//request.session.username = user.username;
			//request.session.idUser = res.rows[0].id;
			console.log("correct");
			var token = crypto.randomBytes(64).toString('hex');
			client.query("INSERT INTO Token (token, idUser, dateCreation) VALUES (" + token + ", " + res[0]["idUser"] + ", NOW());")
			response.json(token);
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
		var user;
		if (request.query.name != null) {
			user.name= request.query.name;
		}
		if (request.query.password != null) {
			user.password= request.query.password;
		}
		if (request.query.mail != null) {
			user.mail= request.query.mail;
		}
		if (request.query.city != null) {
			user.city= request.query.city;
		}
		if (request.query.birthdate != null) {
			user.birthdate= request.query.birthdate;
		}
		if (request.query.mobile != null) {
			user.mobile= request.query.mobile;
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
app.get('/event/:id', (request, response) => {
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
