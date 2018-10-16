import cloneTemplate from '../../util/clone-template';

import pAudio from '../pico-audio';
import picotune from '../picotune';

import * as setSong from '../player/set-song';

const songList = picotune.content.column.search.content.songList;

let word;

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

export function addSearchSongs (idx, searchWord) {
	word = searchWord || word;
	picotune.content.column.search.header.searchWord.innerHTML = word;
	
	songList.setAttribute('data-load', 'loading');

	fetch(`/api/Search.php?i=${idx}&w=${word}`).then((res)=> {
		return res.json();
	}).then((songs)=> {
		let songCount = 0;
		songs.forEach((song)=> {
			if (!song.date) {
				return;
			}
			const songItem = cloneSongItem(song);
			songList.appendChild(songItem);
			songCount++;
		});
		
		songList.setAttribute('data-load', '');
		if (songCount !== 40) {
			songList.setAttribute('data-load', 'loadedall');
		}
	});
}

export function clearSearchSongs () {
	while (songList.firstChild) {
		songList.removeChild(songList.firstChild);
	} 
}
