create table gametype
(
	idtype serial not null
		constraint gametype_pk
			primary key,
	name text not null
);

create table gamesupport
(
	idsupport serial not null
		constraint gamesupport_pk
			primary key,
	name text not null
);

create table games
(
	idgame serial not null
		constraint games_pk
			primary key,
	idtype integer not null
		constraint games_gametype_idtype_fk
			references gametype,
	idsupport integer not null
		constraint games_gamesupport_idsupport_fk
			references gamesupport,
	name varchar not null,
	coast double precision,
	descriptive text not null,
	minplayer integer not null,
	maxplayer integer,
	minold integer not null,
	picturefilename varchar not null
);

create unique index games_name_uindex
	on games (name);

create table users
(
	iduser serial not null
		constraint users_pk
			primary key,
	username varchar not null,
	name varchar,
	password varchar not null,
	mail varchar,
	city varchar,
	birthdate date,
	mobile varchar
);

create unique index user_mail_uindex
	on users (mail);

create unique index user_mobile_uindex
	on users (mobile);

create unique index user_username_uindex
	on users (username);

create table event
(
	idevent serial not null
		constraint event_pk
			primary key,
	idorganisateur serial not null
		constraint event_user_iduser_fk
			references users,
	mobile varchar,
	maxplayer integer not null,
	eventlocation text not null,
	startdate date not null,
	starttime time not null,
	duration integer not null,
	latemax integer
);

comment on column event.duration is 'en minutes';

comment on column event.latemax is 'en minutes';

create table token
(
	token text not null,
	iduser serial not null
		constraint token_pk
			primary key,
	datecreation date not null
);

create unique index token_token_uindex
	on token (token);

create table participation
(
	iduser serial not null
		constraint table_name_users_iduser_fk
			references users,
	idevent serial not null
		constraint table_name_event_idevent_fk
			references event
);


