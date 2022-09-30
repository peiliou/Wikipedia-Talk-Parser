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

			let text = preprocess(node).innerText;

			if (config.debug) console.log(text)

			nested_comments.unshift(text.trim());

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

	const preprocess = (node) => {
		const has_owner = node.innerText.match(/\([A-Z]+\).*?$/m);

		const clone = node.cloneNode(true);
		if (has_owner) {
			const noises = clone.querySelectorAll('.autosigned');
			noises.forEach(noise => {
				if (config.remove_comment_info) {
					noise.remove();
				} else {
					noise.childNodes[0].remove();
					noise.replaceWith(...noise.childNodes);
				}
			});

			const bullets = clone.querySelectorAll('ul,li');
			bullets.forEach(bullet => {
				bullet.replaceWith(...bullet.childNodes);
			});

			clone.querySelectorAll('.mw-redirect').forEach(el => el.removeAttribute('title'));

			let els = clone.querySelectorAll('a[title*=":"]');
			if (config.debug) console.log(els);

			let el = els[0];
			if (!el) return clone;

			let title_prefix = "";
			els.forEach(e => {
				if (!title_prefix) {
					title_prefix = e.title.split(":")[0];
					if (config.debug) console.log(e.title);
				} else if (e.title.split(":")[0] == title_prefix) {
					el = e;
				}
			});

			while (el.parentNode != clone) {
				let temp = el;
				el = el.parentNode;

				if (config.remove_comment_info) {
					temp.remove();
				}
			}
			if (config.debug) console.log(el);

			const verify = el.querySelectorAll('a[title*=":"]')
			if (verify.length > 0) {
				el = verify[verify.length - 1];
			}

			if (config.debug) console.log(el);

			while (el) {
				let temp = el;
				el = el.nextSibling;
				if (config.remove_comment_info || temp.className && temp.className.includes('replylink')) {
					temp.remove()
				}
			}
		}

		return clone;
	}

	const prepend_if_valid = (stack, node, config) => {
		const has_owner = node.innerText.match(/\([A-Z]+\).*?$/m);

		if (config.debug) console.log(node);

		let text = preprocess(node).innerText;

		if (config.debug) console.log(text);

		const first = stack[0];

		if ((!first || !text.includes(first)) && text) {
			//comment not finished yet
			if (config.bind_comments_to_users && !has_owner) {
				stack[0] = text + stack[0]
			} else {
				stack.unshift(text.trim());
			}
		}
	}

	const remove_nested_comments = (node) => {
		const nested_elements = node.querySelectorAll('a[class*="replylink-reply"]');
		nested_elements.forEach((el, index) => {
			const origin = el.parentNode.parentNode.parentNode;
			if (index > 0) {
				origin.remove();
			}
			el.parentNode.remove();
		});

		if (config.debug) console.log(node);
	}
})();
