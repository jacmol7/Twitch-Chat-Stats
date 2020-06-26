CREATE TABLE public.word (
	word varchar NOT NULL,
	streamer varchar NOT NULL,
	isemote bool NOT NULL,
	count int4 NOT NULL,
	emoteid varchar NULL,
	CONSTRAINT word_pk PRIMARY KEY (word, streamer, isemote)
);

CREATE TABLE public.streamer (
	name varchar NOT NULL,
	lastSeen date NOT NULL,
	CONSTRAINT streamer_pk PRIMARY KEY (name)
);

CREATE INDEX count_index ON public.word USING btree (count DESC NULLS LAST);
