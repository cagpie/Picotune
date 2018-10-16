import cloneTemplate from '../../util/clone-template';

import playlistManager  from '../manager/playlist-manager';

import * as setSong from '../player/set-song';

import pAudio from '../pico-audio';
import picotune from '../picotune';

const songList = picotune.content.column.uploaded.content.latest.songList;

function cloneSongItem (song) {
	const songItem = cloneTemplate(picotune.template.uploadedSongItem);
	
	songItem.composer.innerHTML = song.user;
	songItem.uploadedDate.innerHTML = song.date;
	songItem.songName.innerHTML = song.title;

	songItem.addEventListener('click', ()=> {
		pAudio.init();
		setSong.setUploadedSong(song.file);
		playlistManager.setCurrentSongByUser(song.file);
		playlistManager.set('currentPlaylist', 'uploaded');
	});

	return songItem;
}

export function addLatestSongs (idx) {
	console.log(playlistManager.get('playlist'));
	songList.setAttribute('data-load', 'loading');

	fetch(`/api/GetList.php?i=${idx}`).then((res)=> {
		return res.json();
	}).then((songs)=> {
		if (idx === 0) {
			Array.from(songList.children).forEach(dummy=> dummy.remove());
		}

		let songCount = 0;
		songs.forEach((song)=> {
			if (!song.date) {
				return;
			}
			const songItem = cloneSongItem(song);
			songList.appendChild(songItem);

			playlistManager.get('playlist').uploaded.push(song.file)
			songCount++;
		});

		songList.setAttribute('data-load', '');
		if (songCount === 0) {
			songList.setAttribute('data-load', 'loadedall');
		}
	});
}

export default function setup () {
	addLatestSongs(0);
}