(function () {
	'use strict';
	const config = {
		"include_title": false, //include section title of a talk
		"bind_comments_to_users": true, //all comments are associated with inferred users using timestamp (except last comment)
		"remove_comment_info": true, //remove comment username and timestamp
		"debug": true, //troubleshooting only
	}

	const replyButtons = document.querySelectorAll('a[class*="replylink-reply"]');

	replyButtons.forEach(button => button.addEventListener('click', async (e) => {
		const res = parse_from_element(button, config);
		console.log(res);
	}));

	const parse_from_element = (el, config) => {
		const metadata = JSON.parse(el.parentNode.getAttribute('data-mw-comment'));

		let nested_level = metadata.level;

		let node = el.parentNode;

		let nested_comments = [];

		if (nested_level == 1 && node.parentNode.parentNode.className == "mw-parser-output") {
			node = node.parentNode;
			let text = node.innerText.replace(/\n\[\nreply\n\]/g, '');
			const has_owner = text.match(/\([A-Z]+\).*?$/m);

			if (config.debug) console.log(text)

			if (config.remove_comment_info && has_owner) text = sanitize_text(text, config);

			if (config.debug) console.log([text, has_owner])

			nested_comments.unshift(text);

			if (config.debug) console.log(node);
		} else {
			while (node.parentNode.nodeName != 'DIV') {
				const prev = node.parentNode;
				node = node.parentNode.parentNode;

				if (config.debug) console.log(node);

				const pos = Array.prototype.indexOf.call(node.children, prev);
				const clone = node.cloneNode(true);
				for (let i = pos; i >= 0; i--) {
					const childNode = clone.children[i];

					if (childNode.innerText) {
						remove_nested_comments(childNode);
						prepend_if_valid(nested_comments, childNode, config);
					}
				}
			}
		}

		const node_name = node.nodeName == 'P' ? 'P' : node.previousElementSibling.nodeName;

		if (config.debug) console.log(node_name);

		while (node.nodeName[0] != 'H') {
			node = node.previousElementSibling;

			if (!config.include_title && node.nodeName[0] == 'H') break;

			if (node.innerText) {
				if (node.nodeName == node_name || node.nodeName == 'P' || node.nodeName[0] == 'H') {

					if (config.debug) console.log(node);

					const clone = node.cloneNode(true);
					remove_nested_comments(clone);
					prepend_if_valid(nested_comments, clone, config);
				}
			}
		}

		return nested_comments;
	}

	const prepend_if_valid = (stack, node, config) => {
		let text = node.innerText.replace(/Reply\[reply\].?(\\n)*$/mg, '');
		const has_owner = text.match(/\([A-Z]+\).*?$/m);

		if (config.debug) console.log(text);

		if (config.remove_comment_info && has_owner) text = sanitize_text(text, config);

		if (config.debug) console.log(text);

		const first = stack[0];

		if ((!first || !text.includes(first)) && text) {
			//comment not finished yet
			if (config.bind_comments_to_users && !has_owner) {
				stack[0] = text + stack[0]
			} else {
				stack.unshift(text);
			}
		}
	}

	const sanitize_text = (text, config) => {
		const len = text.length;
		if (text[len - 1] == '\n') text = text.substring(0, len - 1);
		text = text.replace(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/mg, ''); //remove ip noise

		let highest_index = -1;
		const split_points = ["\n", " -", "! ", "? ", " —", "--", ".", "  ("];

		for (let sp of split_points) {
			const last_index = text.lastIndexOf(sp);

			if (last_index > highest_index) {
				highest_index = last_index
			}
		}

		return highest_index > 0 ? text.substring(0, highest_index + 1).trim() : text;
	}

	const remove_nested_comments = (node) => {
		const nested_elements = node.querySelectorAll('a[class*="replylink-reply"]');
		nested_elements.forEach((el, index) => {
			const origin = el.parentNode.parentNode.parentNode;
			//console.log(origin);
			if (index > 0) {
				origin.remove();
			}
		});
	}
})();
