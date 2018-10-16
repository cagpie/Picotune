import createDomTree from './create-dom-tree';

export default function cloneTemplate (target) {
	const cloneTarget = target.cloneNode(true);
	createDomTree(cloneTarget);
	return cloneTarget;
}