/*
	User story:
	- A user can create a post
	Criterion:
	a. A post can be either a single or series of image and video (can be mixed)
	b. A post contains single caption in the form of string (required to post a caption)
	c. The caption can contains hash tags e.g. #photography #skills #this #is #an #arbitrary #hashtags
	d. Each image/ video can contains user tags, which will appear on the respective user profile

	[post]
	
	post_id [PK]
	user_id [FK]
	caption
	created_date
	updated_date
	deleted_date
	
	---
	
	[post_hashtag] -> Handle many-to-many relationship between post and hashtag table
	
	post_id [PK, FK]
	hashtag_id [PK, FK]
	
	---
	
	[hashtag]
	
	hashtag_id [PK]
	name
	created_date
	
	---
	
	[post_detail]
	
	post_detail_id [PK]
	post_id [FK]
	media_url
	media_type [image/ video]
	created_date
	updated_date
	deleted_date
	
	---
	
	[post_detail_usertag] -> Handle many-to-many relationship between post_detail and user table
	
	post_detail_id [PK, FK]
	user_id [PK, FK]
	
	---
*/

create table post (
	post_id varchar(100) primary key,
	user_id varchar(100) not null,
	caption varchar(255) not null,
	created_date timestamp not null default timezone('utc'::text, now()),
	updated_date timestamp,
	deleted_date timestamp,
	foreign key (user_id) references public.user(user_id)
);

create type post_detail_media_type as enum ('image', 'video');

create table post_detail (
	post_detail_id varchar(100) primary key,
	post_id varchar(100) not null,
	media_url varchar(255) not null,
	media_type post_detail_media_type not null,
	created_date timestamp not null default timezone('utc'::text, now()),
	updated_date timestamp,
	deleted_date timestamp,
	foreign key (post_id) references public.post(post_id)
);

create table hashtag (
	hashtag_id varchar(100) primary key,
	name varchar(255),
	created_date timestamp not null default timezone('utc'::text, now())
);

create table post_hashtag (
	post_id varchar(100),
	hashtag_id varchar(100),
	created_date timestamp not null default timezone('utc'::text, now()),
	primary key (post_id, hashtag_id),
	foreign key (post_id) references public.post(post_id),
	foreign key (hashtag_id) references public.hashtag(hashtag_id)
);

create table post_detail_usertag (
	post_detail_id varchar(100),
	user_id varchar(100),
	created_date timestamp not null default timezone('utc'::text, now()),
	primary key (post_detail_id, user_id),
	foreign key (post_detail_id) references public.post_detail(post_detail_id),
	foreign key (user_id) references public.user(user_id)
);

select * from public.user;

select * from public.post;