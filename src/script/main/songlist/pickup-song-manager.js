import cloneTemplate from '../../util/clone-template';

import pAudio from '../pico-audio';
import picotune from '../picotune';

import * as setSong from '../player/set-song';

function cloneSongItem (song) {
	const songItem = cloneTemplate(picotune.template.uploadedSongItem);
	
	songItem.composer.innerHTML = song.user;
	songItem.uploadedDate.innerHTML = song.date;
	songItem.songName.innerHTML = song.title;

	songItem.addEventListener('click', ()=> {
		pAudio.init();
		setSong.setUploadedSong(song.file);
	});

	return songItem;
}

export default function setup () {
	fetch('/api/GetPickup.php').then((res)=> {
		return res.json();
	}).then((songList)=> {
		Array.from(picotune.content.column.uploaded.content.pickup.songList.children).forEach(dummy=> dummy.remove());

		let count = 0;
		songList.forEach((song)=> {
			if (!song.date || (song.title === 'PICOTUNE') || count >= 3) {
				return;
			}
			const songItem = cloneSongItem(song);
			picotune.content.column.uploaded.content.pickup.songList.appendChild(songItem);
			count++;
		})
	});
}