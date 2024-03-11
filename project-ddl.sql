--
-- PostgreSQL database dump
--

-- Dumped from database version 15.3
-- Dumped by pg_dump version 15.3

-- Started on 2024-03-11 23:25:25

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 852 (class 1247 OID 25353)
-- Name: post_detail_media_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.post_detail_media_type AS ENUM (
    'image',
    'video'
);


ALTER TYPE public.post_detail_media_type OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 215 (class 1259 OID 25325)
-- Name: follow; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.follow (
    user_id character varying(100) NOT NULL,
    following_id character varying(100) NOT NULL,
    follow_date timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


ALTER TABLE public.follow OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 25368)
-- Name: hashtag; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hashtag (
    hashtag_id character varying(100) NOT NULL,
    name character varying(255),
    created_date timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


ALTER TABLE public.hashtag OWNER TO postgres;

--
-- TOC entry 216 (class 1259 OID 25341)
-- Name: post; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.post (
    post_id character varying(100) NOT NULL,
    user_id character varying(100) NOT NULL,
    caption character varying(255) NOT NULL,
    created_date timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_date timestamp without time zone,
    deleted_date timestamp without time zone
);


ALTER TABLE public.post OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 25357)
-- Name: post_detail; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.post_detail (
    post_detail_id character varying(100) NOT NULL,
    post_id character varying(100) NOT NULL,
    media_url character varying(255) NOT NULL,
    media_type public.post_detail_media_type NOT NULL,
    created_date timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_date timestamp without time zone,
    deleted_date timestamp without time zone
);


ALTER TABLE public.post_detail OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 25390)
-- Name: post_detail_usertag; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.post_detail_usertag (
    post_detail_id character varying(100) NOT NULL,
    user_id character varying(100) NOT NULL,
    created_date timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


ALTER TABLE public.post_detail_usertag OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 25374)
-- Name: post_hashtag; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.post_hashtag (
    post_id character varying(100) NOT NULL,
    hashtag_id character varying(100) NOT NULL,
    created_date timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


ALTER TABLE public.post_hashtag OWNER TO postgres;

--
-- TOC entry 214 (class 1259 OID 25245)
-- Name: user; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."user" (
    user_id character varying(100) NOT NULL,
    username character varying(255) NOT NULL,
    first_name character varying(255) NOT NULL,
    last_name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    phone_number character varying(20) NOT NULL,
    password character varying(255) NOT NULL,
    date_of_birth date NOT NULL,
    avatar_url character varying(255) DEFAULT 'uploads/default/avatar.jpg'::character varying,
    created_date timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_date timestamp without time zone,
    deleted_date timestamp without time zone,
    email_verified boolean DEFAULT false NOT NULL,
    email_verified_date timestamp without time zone,
    phone_verified boolean DEFAULT false NOT NULL,
    phone_verified_date timestamp without time zone,
    CONSTRAINT user_date_of_birth_check CHECK ((date_of_birth < '2011-01-01'::date)),
    CONSTRAINT user_deleted_date_check CHECK ((deleted_date > created_date)),
    CONSTRAINT user_email_verified_date_check CHECK ((email_verified_date > created_date)),
    CONSTRAINT user_phone_verified_date_check CHECK ((phone_verified_date > created_date)),
    CONSTRAINT user_updated_date_check CHECK ((updated_date > created_date))
);


ALTER TABLE public."user" OWNER TO postgres;

--
-- TOC entry 3385 (class 0 OID 25325)
-- Dependencies: 215
-- Data for Name: follow; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.follow VALUES ('a83d931b-8610-4b2a-8d36-85bd33ef37ce', '0be45935-6be5-4980-9bf6-989d064b24e4', '2024-03-09 04:17:13.174745');
INSERT INTO public.follow VALUES ('a83d931b-8610-4b2a-8d36-85bd33ef37ce', '2d84f0b0-85b2-493d-9ac1-96f7d8f75a95', '2024-03-09 05:01:12.664882');
INSERT INTO public.follow VALUES ('0be45935-6be5-4980-9bf6-989d064b24e4', 'a83d931b-8610-4b2a-8d36-85bd33ef37ce', '2024-03-09 05:04:38.973674');


--
-- TOC entry 3388 (class 0 OID 25368)
-- Dependencies: 218
-- Data for Name: hashtag; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 3386 (class 0 OID 25341)
-- Dependencies: 216
-- Data for Name: post; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 3387 (class 0 OID 25357)
-- Dependencies: 217
-- Data for Name: post_detail; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 3390 (class 0 OID 25390)
-- Dependencies: 220
-- Data for Name: post_detail_usertag; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 3389 (class 0 OID 25374)
-- Dependencies: 219
-- Data for Name: post_hashtag; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 3384 (class 0 OID 25245)
-- Dependencies: 214
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."user" VALUES ('a83d931b-8610-4b2a-8d36-85bd33ef37ce', 'io5tream', 'Felix', 'Andersen', 'idea.andersen@gmail.com', '+6281293872485', '$2b$10$/gcIs3nFVRTmeiXuHNN9fOmbuUnTm5C8aPJb6abrglL22mHXdFKim', '2000-05-12', 'uploads/user/a83d931b-8610-4b2a-8d36-85bd33ef37ce/avatar/avatar.jpg', '2024-03-03 12:00:52.035336', NULL, NULL, false, NULL, false, NULL);
INSERT INTO public."user" VALUES ('0be45935-6be5-4980-9bf6-989d064b24e4', 'andfxx27', 'Felix', 'Andersen', 'andersenfelix307@gmail.com', '+6281293872001', '$2b$10$gogGymnyeoV3S/MGpanVbOIKNULFXKRBZETfRiw.LTlD7XFmZX6iq', '2000-05-12', 'uploads/user/0be45935-6be5-4980-9bf6-989d064b24e4/avatar/avatar.png', '2024-03-05 12:32:46.30964', NULL, NULL, false, NULL, false, NULL);
INSERT INTO public."user" VALUES ('2d84f0b0-85b2-493d-9ac1-96f7d8f75a95', 'monkeydluffy101', 'Felix', 'Andersen', 'monkey.d.luffy@gmail.com', '+6281293872002', '$2b$10$BmBR/VCg3MzmPUJbYXs/U.nyH/zXAtezcUy.LCviom7OEGyKNBRIe', '2000-05-12', 'uploads/user/2d84f0b0-85b2-493d-9ac1-96f7d8f75a95/avatar/avatar.jpg', '2024-03-09 04:55:36.881639', NULL, NULL, false, NULL, false, NULL);


--
-- TOC entry 3223 (class 2606 OID 25330)
-- Name: follow follower_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.follow
    ADD CONSTRAINT follower_pkey PRIMARY KEY (user_id, following_id);


--
-- TOC entry 3229 (class 2606 OID 25373)
-- Name: hashtag hashtag_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hashtag
    ADD CONSTRAINT hashtag_pkey PRIMARY KEY (hashtag_id);


--
-- TOC entry 3227 (class 2606 OID 25362)
-- Name: post_detail post_detail_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_detail
    ADD CONSTRAINT post_detail_pkey PRIMARY KEY (post_detail_id);


--
-- TOC entry 3233 (class 2606 OID 25395)
-- Name: post_detail_usertag post_detail_usertag_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_detail_usertag
    ADD CONSTRAINT post_detail_usertag_pkey PRIMARY KEY (post_detail_id, user_id);


--
-- TOC entry 3231 (class 2606 OID 25379)
-- Name: post_hashtag post_hashtag_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_hashtag
    ADD CONSTRAINT post_hashtag_pkey PRIMARY KEY (post_id, hashtag_id);


--
-- TOC entry 3225 (class 2606 OID 25346)
-- Name: post post_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post
    ADD CONSTRAINT post_pkey PRIMARY KEY (post_id);


--
-- TOC entry 3215 (class 2606 OID 25262)
-- Name: user user_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_email_key UNIQUE (email);


--
-- TOC entry 3217 (class 2606 OID 25264)
-- Name: user user_phone_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_phone_number_key UNIQUE (phone_number);


--
-- TOC entry 3219 (class 2606 OID 25281)
-- Name: user user_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (user_id);


--
-- TOC entry 3221 (class 2606 OID 25266)
-- Name: user user_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_username_key UNIQUE (username);


--
-- TOC entry 3234 (class 2606 OID 25336)
-- Name: follow follower_following_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.follow
    ADD CONSTRAINT follower_following_id_fkey FOREIGN KEY (following_id) REFERENCES public."user"(user_id);


--
-- TOC entry 3235 (class 2606 OID 25331)
-- Name: follow follower_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.follow
    ADD CONSTRAINT follower_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(user_id);


--
-- TOC entry 3237 (class 2606 OID 25363)
-- Name: post_detail post_detail_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_detail
    ADD CONSTRAINT post_detail_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.post(post_id);


--
-- TOC entry 3240 (class 2606 OID 25396)
-- Name: post_detail_usertag post_detail_usertag_post_detail_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_detail_usertag
    ADD CONSTRAINT post_detail_usertag_post_detail_id_fkey FOREIGN KEY (post_detail_id) REFERENCES public.post_detail(post_detail_id);


--
-- TOC entry 3241 (class 2606 OID 25401)
-- Name: post_detail_usertag post_detail_usertag_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_detail_usertag
    ADD CONSTRAINT post_detail_usertag_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(user_id);


--
-- TOC entry 3238 (class 2606 OID 25385)
-- Name: post_hashtag post_hashtag_hashtag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_hashtag
    ADD CONSTRAINT post_hashtag_hashtag_id_fkey FOREIGN KEY (hashtag_id) REFERENCES public.hashtag(hashtag_id);


--
-- TOC entry 3239 (class 2606 OID 25380)
-- Name: post_hashtag post_hashtag_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_hashtag
    ADD CONSTRAINT post_hashtag_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.post(post_id);


--
-- TOC entry 3236 (class 2606 OID 25347)
-- Name: post post_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post
    ADD CONSTRAINT post_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(user_id);


-- Completed on 2024-03-11 23:25:25

--
-- PostgreSQL database dump complete
--

