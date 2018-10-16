export default function createTree (parent, grandParent) {
	if (!parent.children.length) return;

	Array.from(parent.children).forEach((child)=> {
		if (child.className) {
			(grandParent || parent)[child.classList[0]] = child;
			createTree(child);
		} else {
			createTree(child, parent)
		}
	});
}