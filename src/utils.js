export function isQuillHrBlot(node) {
	node = node.domNode || node;
	return !!(node && node.classList && node.classList.contains('quill-hr'));
}

export function getPrevQuillHrBlot(node) {
	while (node && node !== node.parent) {
		if (node.prev && isQuillHrBlot(node.prev)) { return node.prev; }
		node = node.parent;
	}
	return null;
}

export function getNextQuillHrBlot(node) {
	while (node && node !== node.parent) {
		if (node.next && isQuillHrBlot(node.next)) { return node.next; }
		node = node.parent;
	}
	return null;
}