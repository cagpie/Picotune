import playlistManager from '../manager/playlist-manager';
import localSongManager from '../manager/song-storage-manager';

import picotune from '../picotune';
import loadFile from './load-file';

function loadUploadedSong (fileName) {
	let songInfo;
	let songFile;
	fetch(`/api/GetSong.php?file=${fileName}`).then((res)=> {
		return res.json();
	}).then((info)=> {
		songInfo = info;
		if (songInfo && songFile) {
			putUploadedSong(songFile, songInfo);
		}
	});
	fetch(`/midifiles/${fileName}`).then((res)=> {
		return res.arrayBuffer();
	}).then((file)=> {
		songFile = file;
		if (songInfo && songFile) {
			putUploadedSong(songFile, songInfo);
		}
	});
}

function putUploadedSong (songFile, songInfo) {
	loadFile(songFile, songInfo.setting);

	picotune.setAttribute('data-displayinfo', 'display-uploaded');

	const info = picotune.content.song.info;
	info.composer.innerHTML = songInfo.user;
	info.uploadDate.innerHTML = songInfo.date;
	info.songName.innerHTML = songInfo.title;
	info.songDetail.innerHTML = songInfo.description;

	/*
	for (let i=0; i<16; i++) {
		['wave', 'attenuation', 'volume'].forEach((type, idx)=> {
			const optionNodes = document.getElementsByName(`${type}${i}`)[0].children;

			Array.from(optionNodes).some((optionNode)=> {
				if (+(song.tone[i][idx]) === +(optionNode.value)) {
					optionNode.selected = true;
					return true;
				} 
			});
		});
	}
	*/
}

export function setUploadedSong (fileName, nonHistory) {
	loadUploadedSong(fileName);

	playlistManager.set('currentSong', fileName);
	if (!nonHistory) {
		playlistManager.get('playlist').history.push(fileName);
	}
}

function loadLocalSong (songId, nonHistory) {
	localSongManager.getSongById(songId, (song)=> {
		setLocalSong(song, nonHistory);
	});
}

export function setLocalSong (song, nonHistory) {
	// song(meta&file)がわたってこなかった場合は、ローカルストレージを参照する
	if (!song.file) {
		loadLocalSong(song, nonHistory);
		return;
	}

	loadFile(song.file, song.tone);

	picotune.setAttribute('data-displayinfo', 'display-local');

	const info = picotune.content.song.info;
	info.songName.innerHTML = song.title;

	playlistManager.set('currentSong', song.id);
	if (!nonHistory) {
		playlistManager.get('playlist').history.push(song.id);
	}

	for (let i=0; i<16; i++) {
		['wave', 'attenuation', 'volume'].forEach((type, idx)=> {
			const optionNodes = document.getElementsByName(`${type}${i}`)[0].children;

			Array.from(optionNodes).some((optionNode)=> {
				if (+(song.tone[i][idx]) === +(optionNode.value)) {
					optionNode.selected = true;
					return true;
				} 
			});
		});
	}
}

