import { isQuillHrBlot, getPrevQuillHrBlot, getNextQuillHrBlot } from './utils';

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