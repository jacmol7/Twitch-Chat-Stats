CREATE TABLE public.word (
	word varchar NOT NULL,
	streamer varchar NOT NULL,
	isemote bool NOT NULL,
	count int4 NOT NULL,
	emoteid varchar NULL,
	CONSTRAINT word_pk PRIMARY KEY (word, streamer, isemote)
);
