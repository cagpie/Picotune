import ChannelColor from '../../config/channel-color';

import cloneTemplate from '../../util/clone-template';

import playlistManager from '../manager/playlist-manager';
import localSongManager from '../manager/song-storage-manager';

import * as setSong from '../player/set-song';

import pAudio from '../pico-audio';
import picotune from '../picotune';

const localSongSetting = picotune.content.song.info.localSongSetting;

let currentSongId = null;

function setCurrentSong (song) {
	setSong.setLocalSong(song);
	playlistManager.setCurrentSongByUser(song.id);
	playlistManager.set('currentPlaylist', 'local');
}

function cloneSongItem (song) {
	const songItem = cloneTemplate(picotune.template.localSongItem);
				
	songItem.songName.innerHTML = song.title;

	songItem.addEventListener('click', ()=> {
		pAudio.init();
		localSongManager.getSongById(song.id, setCurrentSong);
	});

	return songItem;
}

export default function setup () {
	const inputFile = picotune.content.column.local.content.util.inputfile;

	// 参照する際の曲の読み込み
	inputFile.onchange = ()=> {
		pAudio.init();

		new Promise((resolve)=> {
			const file = inputFile.files[0];
			const reader = new FileReader();

			reader.onload = (e)=> {
				resolve(e.target.result);
			};

			reader.readAsArrayBuffer(file);
		}).then((file)=> {
			const songName = inputFile.value.split(/\\/).pop();
			localSongManager.getSong(songName, (result)=> {
				// 初めて読み込む曲はローカルに保存
				if (!result) {
					localSongManager.saveSong(songName, file, null, ()=> {
						// auto-incrementで振られたIDが知りたいので、saveしたものをgetする
						localSongManager.getSong(songName, (song)=> {
							const songItem = cloneSongItem(song);
							const songList = picotune.content.column.local.content.songList;
							songList.insertBefore(songItem, songList.firstChild);
							
							setCurrentSong(song);
						})
					});

					return;
				}

				setCurrentSong(result);
			});
		});
	}

	// ローカルに保存されている曲の読み込み
	setTimeout(()=> {
		localSongManager.getSongList((songList)=> {
			songList.forEach((song)=> {
				const songItem = cloneSongItem(song);
				picotune.content.column.local.content.songList.appendChild(songItem);
				playlistManager.get('playlist').local.push(song.id)
			});
		});
	}, 100);

	// localSongSettingの構築
	for (let i=0; i<16; i++) {
		const toneSettingItem = cloneTemplate(picotune.template.toneSettingItem);

		toneSettingItem.channel.innerHTML = `Ch.${i+1}`;
		toneSettingItem.channel.style.backgroundColor = ChannelColor[i];
		toneSettingItem.volume.default.selected = true;

		toneSettingItem.wave.setAttribute('name', `wave${i}`);
		toneSettingItem.attenuation.setAttribute('name', `attenuation${i}`);
		toneSettingItem.volume.setAttribute('name', `volume${i}`);

		const setList = [toneSettingItem.wave, toneSettingItem.attenuation, toneSettingItem.volume];
		setList.forEach((target, idx)=> {
			target.addEventListener('change', ()=> {
				pAudio.channels[i][idx] = +(target.selectedOptions[0].value);
				localSongManager.overSaveSongTone(currentSongId, pAudio.channels);
			});
		});

		localSongSetting.appendChild(toneSettingItem);
	}
}
