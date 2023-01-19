const parse_from_element = (el) => {
	let node = el.parentNode;

	const nested_comments = [];
	const metadata = [];

	if (el.parentNode.parentNode.parentNode.nodeName == 'DIV' && node.parentNode.parentNode.className == "mw-parser-output") {
		node = node.parentNode;

		const clone = node.cloneNode(true);
		remove_nested_comments(clone, metadata);
		prepend_if_valid(nested_comments, clone);
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
					remove_nested_comments(childNode, metadata);
					prepend_if_valid(nested_comments, childNode);
				}
			}
		}
	}

	const node_name = node.nodeName == 'P' ? 'P' : node.previousElementSibling.nodeName;

	if (config.debug) console.log(node_name);

	while (!node.className.includes("ext-discussiontools-init-section")) {
		node = node.previousElementSibling;

		if (!node) break;

		if (node.className.includes("ext-discussiontools-init-section")) {
			if (config.include_title) {
				break_at_next_call = true;
			} else {
				break;
			}
		}

		if (node.nodeName == node_name || node.nodeName == 'P' || node.className.includes("ext-discussiontools-init-section")) {
			if (config.debug) console.log(node);
			if (node.innerText && node.nodeName != 'TABLE') {

				const clone = node.cloneNode(true);
				remove_nested_comments(clone, metadata);
				prepend_if_valid(nested_comments, clone);
			}
		}
	}

	return [nested_comments, metadata];
}

const preprocess = (node) => {
	const has_owner = node.innerText.match(/\([A-Z]+\)((\s|(\\n))?(\[.*\])|.{0,5})?$/m);

	let clone = node.cloneNode(true);
	clone.querySelectorAll('style,.reference,sub').forEach(noise => noise.remove());

	const bullets = clone.querySelectorAll('ul,li,span,big,b,pre,ol,i');
	bullets.forEach(bullet => {
		bullet.replaceWith(...bullet.childNodes);
	});

	if (has_owner) {
		const noises = clone.querySelectorAll('small');
		noises.forEach(noise => {
			if (config.remove_comment_info) {
				noise.remove();
			} else {
				noise.childNodes[0].remove();
				noise.replaceWith(...noise.childNodes);
			}
		});
		const backup = clone.cloneNode(true);

		clone.querySelectorAll('a:not([title*="User:"])').forEach(el => el.removeAttribute('title'));

		let els = clone.querySelectorAll('a[title*=":"]');
		if (config.debug) console.log(els);

		let el = els[0];
		if (!el) {
			clone = backup;
			els = clone.querySelectorAll('a[title*="Special:"],a[title*="User"]');
			el = els[0];
		}

		let title_prefix = "";
		els.forEach(e => {
			if (!title_prefix) {
				title_prefix = e.title.split(":")[0];
				if (config.debug) console.log(e.title);
			} else if (e.title.split(":")[0] == title_prefix) {
				el = e;
			}
		});
		if (config.debug) console.log(el);

		if (el) {
			while (el.parentNode != clone && !el.title) {
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
	}

	return clone;
}

let break_at_next_call = false;

const prepend_if_valid = (stack, node) => {
	const has_owner = node.innerText.match(/\([A-Z]+\)((\s|(\\n))?(\[.*\])|.{0,5})?$/m);

	if (config.debug) console.log(node);

	let text = preprocess(node).innerText;

	if (config.debug) console.log(text);

	const first = stack[0];

	if (text.length > 1) {
		const is_dup = first ? text.replaceAll('\n', '').includes(first.replaceAll('\n', '')) : false;
		if (!first || !is_dup) {
			//comment not finished yet
			if (config.bind_comments_to_users && !has_owner && !break_at_next_call) {
				stack[0] = text + stack[0];
			} else {
				stack.unshift(text.trim());
				break_at_next_call = false;
			}
		} else if (is_dup) {
			stack[0] = text;
		}
	} else {
		break_at_next_call = true;
	}
}

const remove_nested_comments = (node, metadata) => {
	const nested_elements = node.querySelectorAll('a[class*="replylink-reply"]');
	nested_elements.forEach((el, index) => {
		const origin = el.parentNode.parentNode.parentNode;
		if (origin && index > 0) {
			origin.remove();
		} else {
			let fallback = false;
			let new_md = el.parentNode.getAttribute('data-mw-thread-id');
			if (new_md) {
				new_md = { id: new_md };
				fallback = true;
			} else {
				new_md = JSON.parse(el.parentNode.getAttribute('data-mw-comment'));
			}
			if (metadata.length > 0) {
				if (fallback) {
					if (new_md.id.includes(metadata[0].id)) {
						metadata[0].id = new_md.id;
					} else {
						metadata.unshift(new_md);
					}
				} else {
					if (new_md.timestamp == metadata[0].timestamp) {
						metadata[0] = new_md;
					} else {
						metadata.unshift(new_md);
					}
				}
			} else {
				metadata.unshift(new_md);
			}
		}
		el.parentNode.remove();
	});

	if (config.debug) console.log(node);
}
