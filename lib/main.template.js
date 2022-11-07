const config = {
	"include_title": false, 	//include section title of a talk
	"bind_comments_to_users": true, //all comments are associated with inferred users using timestamp (except last comment)
	"remove_comment_info": true, 	//remove comment username and timestamp
	"debug": false, 		//troubleshooting only
}

const replyButtons = document.querySelectorAll('a[class*="replylink-reply"]');

replyButtons.forEach(button => button.addEventListener('click', async (e) => {
	const [res, metadata] = parse_from_element(button, config);

	console.log(res);
	console.log(metadata);
}));
