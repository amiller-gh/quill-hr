import { isQuillHrBlot } from './utils';
import { QuillHrBindings } from './bindings';

const guid = () => ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c  => (c ^ window.crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));

function addStyleString(id, str) {
	var node = document.createElement('style');
	node.id = id;
	node.innerHTML = str;
  if (document.readyState === 'loading') {
    return document.addEventListener('DOMContentLoaded', () => document.head.appendChild(node));
  }
  document.head.appendChild(node);
}

const CUSTOM_EVENT_NAME = guid('quill-hr-event');
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

function makeEmbed(Quill) {
	if (!document.getElementById('quill-hr-styles')) { addStyleString('quill-hr-styles', STYLES); }

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

class QuillHr {

	constructor(Quill, options = {}) {
		const self = this;

		this.options = options;
		this.embed = makeEmbed(Quill, options);

    const prev = Quill.prototype.setContents;
    Quill.prototype.setContents = function () {
      const quill = this;
      quill.root.addEventListener('keydown', self.handleKeyDown.bind(self, quill), true);

			// Force a text-change event trigger so consumers get the updated markup!
			quill.root.addEventListener(CUSTOM_EVENT_NAME, () => {
				quill.updateContents(new Delta().retain(Infinity), 'user');
      });

			quill.on('editor-change', () => {
				const range = quill.getSelection(false);
				if (range == null) return true;
				const [blot] = quill.getLine(range.index);
				if (isQuillHrBlot(blot.domNode)) { blot.domNode.focus(); }
				return true;
			});

      return prev.apply(quill, arguments);
		}

	}

	handleKeyDown(quill, e) {

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
			const idx = quill.getIndex(e.target._blot);
			quill.deleteText(idx, 1, quill.constructor.sources.USER);
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
			quill.insertText(idx + 1, '\n', quill.constructor.sources.USER);
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
	async insert (quill) {
		const id = guid();
		const range = quill.getSelection(true);
		let index = (quill.getSelection() || {}).index;
		if (!Number.isInteger(index)) {
			index = quill.getLength();
		}

		quill.deleteText(range.index, range.length, quill.constructor.sources.SILENT);
		quill.insertEmbed(index, 'divider', {
			id,
			format: 'center',
		}, quill.constructor.sources.USER);
		quill.setSelection(range.index + 1, quill.constructor.sources.SILENT);
	}
}

export {
	QuillHr,
	QuillHrBindings,
}
