create table if not exists "GameType"
(
	"idType" serial not null
		constraint gametype_pk
			primary key,
	name text not null
);

create table if not exists "GameSupport"
(
	"idSupport" serial not null
		constraint gamesupport_pk
			primary key,
	name varchar not null
);

create table if not exists "Games"
(
	"idGame" serial not null
		constraint games_pk
			primary key,
	"idType" integer not null
		constraint games_gametype_idtype_fk
			references "GameType",
	"idSupport" integer not null
		constraint games_gamesupport_idsupport_fk
			references "GameSupport",
	name varchar not null,
	coast double precision,
	descriptive text not null,
	"minPlayer" integer not null,
	"maxPlayer" integer,
	"minOld" integer not null,
	"pictureFileName" varchar not null
);

create table if not exists "User"
(
	"idUser" serial not null
		constraint user_pk
			primary key,
	username varchar not null,
	name varchar,
	password varchar not null,
	mail varchar,
	city varchar,
	"birthDate" date,
	mobile varchar
);

create unique index if not exists user_mail_uindex
	on "User" (mail);

create unique index if not exists user_mobile_uindex
	on "User" (mobile);

create unique index if not exists user_username_uindex
	on "User" (username);

create table if not exists "Event"
(
	"idEvent" serial not null
		constraint event_pk
			primary key,
	"idOrganisateur" serial not null
		constraint event_user_iduser_fk
			references "User",
	mobile varchar,
	"maxPlayer" integer not null,
	"eventLocation" text not null,
	"startDate" date not null,
	"startTime" time not null,
	duration integer not null,
	"lateMax" integer
);

comment on column "Event".duration is 'en minutes';

comment on column "Event"."lateMax" is 'en minutes';

create table if not exists "Token"
(
	token text not null,
	"idUser" serial not null
		constraint token_pk
			primary key
		constraint token_user_iduser_fk
			references "User",
	"dateCreation" date not null
);

create unique index if not exists token_token_uindex
	on "Token" (token);

create table if not exists "Participation"
(
	"idUser" integer not null
		constraint participation_user_iduser_fk
			references "User",
	"idEvent" integer not null
		constraint participation_event_idevent_fk
			references "Event"
);

