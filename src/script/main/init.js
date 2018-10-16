import picotune from './picotune.js';

import cloneTemplate from '../util/clone-template';
import createElement from '../util/create-element';

export default function setup () {
	// Templete - toneSettingItem の volume 欄の構築
	for (let i=0; i<=20; i++) {
		createElement('option', {
			appendTo: picotune.template.toneSettingItem.volume,
			value: i/10,
			innerHTML: `(Volume) * ${i/10}`,
			className: (i == 10) ? 'default' : null
		});
	}

	// picotuneの初期設定
	picotune.setAttribute('data-displayinfo', '');
	picotune.setAttribute('data-displaycolumn', '');
}