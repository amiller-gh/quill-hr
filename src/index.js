const guid = () => ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c  => (c ^ window.crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
function addStyleString(id, str) {
	var node = document.createElement('style');
	node.id = id;
	node.innerHTML = str;
	document.body.appendChild(node);
}

const STYLES = `
	.quill-hr {
		cursor: pointer;
		display: block;
		width: 100%;
		margin: 0 -0.4em 0.8em;
		outline-offset: 3px;
		transition: box-shadow .15s;
		background-color: rgba(0,0,0,.25);
		height: 1px;
		border: 0px solid transparent;
		border-width: 0.8em 0.4em;
		background-clip: content-box;
		box-sizing: content-box;
		box-shadow: 0 0 0 1px transparent;
	}

	.quill-hr:hover {
		box-shadow: 0 0 0 1px #3eb0ef;
	}

	.quill-hr:focus {
		outline: none;
		box-shadow: 0 0 0 2px #3eb0ef;
	}
`;

function makeEmbed(quill, Quill) {
	if (!document.getElementById('quill-hr-styles')) { addStyleString('quill-hr-styles', STYLES); }

	const Delta = Quill.import('delta');
	const BlockEmbed = Quill.import('blots/block/embed');

	class HrBlot extends BlockEmbed {
		static create(value) {
			let node = super.create();
			node.setAttribute('tabindex', '-1');
			return node;
		}

		static value(node) {
			return {
				format: node.dataset.format || 'center',
			};
		}

		constructor(dom, attrs){
			super(dom, attrs);
			dom._blot = this;
		}

		value() { return HrBlot.value(this.domNode); }
		get isBlock() { return true; }
	}

	HrBlot.blotName = 'divider';
	HrBlot.tagName = 'hr';
	HrBlot.className = 'quill-hr';
	Quill.register(HrBlot);

	return HrBlot;
}

function isQuillHrBlot(node) {
	node = node.domNode || node;
	return !!(node && node.classList && node.classList.contains('quill-hr'));
}

function getPrevQuillHrBlot(node) {
	while (node && node !== node.parent) {
		if (node.prev && isQuillHrBlot(node.prev)) { return node.prev; }
		node = node.parent;
	}
	return null;
}

function getNextQuillHrBlot(node) {
	while (node && node !== node.parent) {
		if (node.next && isQuillHrBlot(node.next)) { return node.next; }
		node = node.parent;
	}
	return null;
}

export const QuillHrBindings = {
	'quill-hr:backspace': {
		key: 'backspace',
		handler: function(range, keycontext) {
			const blot = this.quill.getLeaf(range.index)[0];
			const node = blot.domNode;
			if (isQuillHrBlot(node) || range.length) { return true; }
			const prevQuillImageBlock = getPrevQuillHrBlot(blot);
			if (prevQuillImageBlock && !blot.value()) {
				this.quill.deleteText(range.index, 1, this.quill.constructor.sources.USER);
				this.quill.setSelection(this.quill.getIndex(prevQuillImageBlock), 0);
				prevQuillImageBlock.domNode.focus();
				return false;
			}
			return true;
		}
	},
	'quill-hr:left': {
		key: 37,
		handler: function(range, keycontext) {
			const blot = this.quill.getLeaf(range.index)[0];
			const node = blot.domNode;
			if (isQuillHrBlot(node) || range.length) { return true; }
			const prevQuillImageBlock = getPrevQuillHrBlot(blot);
			if (prevQuillImageBlock && !blot.value()) {
				this.quill.setSelection(this.quill.getIndex(prevQuillImageBlock), 0);
				prevQuillImageBlock.domNode.focus();
				return false;
			}
			return true;
		}
	},
	'quill-hr:right': {
		key: 39,
		handler: function(range, keycontext) {
			const blot = this.quill.getLeaf(range.index)[0];
			const node = blot.domNode;
			if (isQuillHrBlot(node) || range.length) { return true; }
			const nextQuillImageBlock = getNextQuillHrBlot(blot);
			if (nextQuillImageBlock && !blot.value()) {
				this.quill.setSelection(this.quill.getIndex(nextQuillImageBlock), 0);
				nextQuillImageBlock.domNode.focus();
				return false;
			}
			return true;
		}
	},
	'quill-hr:up': {
		key: 'up',
		handler: function(range, keycontext) {
			const blot = this.quill.getLeaf(range.index)[0];
			const prevQuillImageBlock = getPrevQuillHrBlot(blot);
			if (prevQuillImageBlock) {
				this.quill.setSelection(this.quill.getIndex(prevQuillImageBlock), 0);
				prevQuillImageBlock.domNode.focus();
				return false;
			}
			return true;
		}
	},
	'quill-hr:down': {
		key: 'down',
		handler: function(range, keycontext) {
			const blot = this.quill.getLeaf(range.index)[0];
			const nextQuillImageBlock = getNextQuillHrBlot(blot);
			if (nextQuillImageBlock) {
				this.quill.setSelection(this.quill.getIndex(nextQuillImageBlock), 0);
				nextQuillImageBlock.domNode.focus();
				return false;
			}
			return true;
		}
	},
};

export class QuillHr {

	constructor(quill, options = {}) {
		this.quill = quill;
		this.options = options;
		this.handleKeyDown = this.handleKeyDown.bind(this);
		this.insert = this.insert.bind(this);
		this.embed = makeEmbed(quill, quill.constructor);
		this.quill.root.addEventListener('keydown', this.handleKeyDown, true);

    quill.on('editor-change', () => {
      const range = quill.getSelection(false);
      if (range == null) return true;
      const [blot] = quill.getLine(range.index);
      if (isQuillHrBlot(blot.domNode)) { blot.domNode.focus(); }
      return true;
    });

	}

	handleKeyDown(e) {
		const quill = this.quill;

		// TODO: Enable basic text shortcuts anywhere inside of our plugin (stealing them back from Quill).
		if (e.target.classList.contains('quill-hr')) {
			if (e.keyCode === 65 && e.metaKey) {
				e.preventDefault();
				e.stopImmediatePropagation();
				// TODO: Select All
			}
			else if (e.keyCode === 67 && e.metaKey) {
				e.preventDefault();
				e.stopImmediatePropagation();
				// TODO: Copy
			}
			else if ( e.keyCode === 86 && e.metaKey) {
				e.preventDefault();
				e.stopImmediatePropagation();
				// TODO: Paste
			}
		}

		if (!isQuillHrBlot(e.target)) { return; }

		// Delete
		const scrollPos = document.scrollingElement.scrollTop;
		if (e.keyCode === 8) {
			e.preventDefault();
			e.stopPropagation();
			const idx = this.quill.getIndex(e.target._blot);
			quill.deleteText(idx, 1, this.quill.constructor.sources.USER);
			quill.setSelection(idx, 0);
		}
		// Tab Key
		else if (e.keyCode === 9) {
			e.preventDefault();
			e.stopPropagation();
			// TODO: Implement focus trap
		}
		// Enter Key
		else if (e.keyCode === 13 || e.keyCode === 32) {
			e.preventDefault();
			e.stopPropagation();
			const idx = quill.getIndex(e.target._blot);
			quill.insertText(idx + 1, '\n', this.quill.constructor.sources.USER);
			quill.setSelection(idx + 1, quill.constructor.sources.SILENT);
			// TODO: Implement enter and space key functionality.
		}
		// Up / Left Arrow
		else if (e.keyCode === 38 || e.keyCode === 37) {
			e.preventDefault();
			e.stopPropagation();
			const idx = quill.getIndex(e.target._blot);
			const leaf = quill.getLeaf(idx - 1)[0];
			if (!leaf) { e.target.focus(); e.preventDefault(); return false; }
			quill.setSelection(idx - 1, 0);
			if (isQuillHrBlot(leaf)) { leaf.domNode.focus(); }
		}
		// Down / Right Arrow
		else if (e.keyCode === 40 || e.keyCode === 39) {
			e.preventDefault();
			e.stopPropagation();
			const idx = quill.getIndex(e.target._blot);
			const leaf = quill.getLeaf(idx + 1)[0];
			if (!leaf) { e.target.focus(); e.preventDefault(); return false; }
			quill.setSelection(idx + 1, 0);
			if (isQuillHrBlot(leaf)) { leaf.domNode.focus(); }
		}
		document.scrollingElement.scrollTop = scrollPos;
	}

	/* insert into the editor
	*/
	async insert () {
		const quill = this.quill;
		const id = guid();
		const range = quill.getSelection(true);
		const index = (quill.getSelection() || {}).index || this.quill.getLength();
		this.quill.deleteText(range.index, range.length, this.quill.constructor.sources.SILENT);
		quill.insertEmbed(index, 'divider', {
			id,
			format: 'center',
		}, quill.constructor.sources.USER);
		quill.setSelection(range.index + 1, quill.constructor.sources.SILENT);
	}
}