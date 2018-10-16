export default function createElement (tagName, options) {
	var options = options;
	var tag = document.createElement(tagName);
	Object.keys(options).forEach(function(key){
		if(key=='appendTo'){
			options[key].appendChild(tag);
			return;
		} else if(key=='insertBeforeTo'){
			options[key][0].insertBefore(tag, options[key][1]);
			return;
		} else if(key=='style'){
			Object.keys(options[key]).forEach(function(keyStyle){
				tag.style[keyStyle] = options[key][keyStyle];
			});
			return;
		}
		tag[key] = options[key];
	});
	return tag;
}