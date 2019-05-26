import playlistManager from '../manager/playlist-manager';

import pAudio from '../pico-audio';
import picotune from '../picotune';

import render from './draw';
import * as setSong from './set-song';

export default function setup () {
	const display = picotune.content.song.player.display;
	const {
		logo,
		random,
		loop,
		prev,
		play,
		next,
		like,
		volume,
		volume: {
			mute,
			knob,
			knob: {
				holder,
				holder: {
					current
				}
			}
		},
		setting
	} = picotune.content.song.player.control;

	function _transitionNextSong () {
		const currentHistoryBacking = playlistManager.get('currentHistoryBacking')
		if (currentHistoryBacking > 0) {
			const currentHistoryBacking = playlistManager.get('currentHistoryBacking');
			const historyPlaylist = playlistManager.get('playlist').history;
			const nextIdx = (historyPlaylist.length - 1) - currentHistoryBacking + 1;

			const nextSongId = historyPlaylist[nextIdx];
			if (isNaN(nextSongId)) {
				setSong.setUploadedSong(nextSongId);
			} else {
				setSong.setLocalSong(nextSongId);
			}
			playlistManager.set('currentHistoryBacking', currentHistoryBacking - 1);
		} else {
			// 曲終了時、次に再生する曲を決定する
			const currentSong = playlistManager.get('currentSong');
			const currentPlaylist = playlistManager.get('playlist')[playlistManager.get('currentPlaylist')];
			const nextIdx = currentPlaylist.indexOf(currentSong) + 1;

			// 次の曲が存在したら連続して再生する
			if (currentPlaylist.length > nextIdx) {
				const nextSongId = currentPlaylist[nextIdx];
				if (isNaN(nextSongId)) {
					setSong.setUploadedSong(nextSongId);
				} else {
					setSong.setLocalSong(nextSongId);
				}
			}
		}
	}

	// イベント系
	pAudio.addEventListener('play', ()=> {
		play.classList.add('stop');
	});

	pAudio.addEventListener('stop', ()=> {
		play.classList.remove('stop');
	});

	pAudio.addEventListener('songEnd', ()=> {
		if (!pAudio.isLoop()) {
			_transitionNextSong();
		}
	});

	// アクション系(ボタン)
	function _play() {
		pAudio.init();
		if (pAudio.states.isPlaying) {
			pAudio.stop();
		} else {
			pAudio.play();
		}
	}

	loop.addEventListener('click', ()=> {
		if (pAudio.isLoop()) {
			pAudio.setLoop(false);
			loop.classList.remove('enable-loop');
		} else {
			pAudio.setLoop(true);
			loop.classList.add('enable-loop');
		}
	});

	prev.addEventListener('click', ()=> {
		const currentHistoryBacking = playlistManager.get('currentHistoryBacking');
		const historyPlaylist = playlistManager.get('playlist').history;
		const nextIdx = (historyPlaylist.length - 1) - currentHistoryBacking - 1;

		if (nextIdx < 0) {
			return;
		}

		const nextSongId = historyPlaylist[nextIdx];
		if (isNaN(nextSongId)) {
			setSong.setUploadedSong(nextSongId, true);
		} else {
			setSong.setLocalSong(nextSongId, true);
		}

		playlistManager.set('currentHistoryBacking', currentHistoryBacking + 1);
	});

	play.addEventListener('click', ()=> {
		if (!pAudio.isStarted) {
			return;
		}
		_play();
	});

	next.addEventListener('click', ()=> {
		_transitionNextSong();
	});

	mute.addEventListener('click', ()=> {
		volume.classList.add('knob-open');
	});

	knob.addEventListener('mouseleave', ()=> {
		volume.classList.remove('knob-open');
	})

	let _isVolumeMouseDown = false;
	function _actVolumeKnob (e) {
		if (_isVolumeMouseDown) {
			const max = e.target.offsetHeight;
			let y = max - Math.min(max, Math.max(0, e.layerY));
			current.style.height = `${(y/max)*100}%`;
			pAudio.setMasterVolume(y/max);
		}
	}
	
	holder.addEventListener('mousedown', ()=> {
		_isVolumeMouseDown = true;
	});

	holder.addEventListener('mousemove', (e)=> {
		_actVolumeKnob(e);
	});

	holder.addEventListener('mouseup', (e)=> {
		_actVolumeKnob(e);
		_isVolumeMouseDown = false;
	});


	// アクション系(キャンバス)
	let _isCanvasMouseDown = false;
	let _clickedMouseX = 0;

	function _actCanvas (e) {
		if (!pAudio.isStarted) {
			return;
		}

		display.mouse = {
			x: e.clientX-display.offsetLeft,
			y: e.clientY-display.offsetTop+window.scrollY
		};

		if((e.clientY-display.offsetTop+window.scrollY)<display.offsetHeight*0.9){
			display.classList.remove('clickable');
			// 通常時
			if (_isCanvasMouseDown && !_clickedMouseX) {
				_play();
			}

			// Nice
		} else {
			// シーク
			display.classList.add('clickable');

			if (_isCanvasMouseDown) {
				const posX = (e.clientX-display.offsetLeft)/display.offsetWidth;
				const bgmLength = pAudio.getTime(Number.MAX_SAFE_INTEGER);
				const isPlaying = pAudio.states.isPlaying;

				if (pAudio.states.isPlaying) pAudio.stop();
				pAudio.initStatus(false, true);
				pAudio.setStartTime(posX * bgmLength);
				if (isPlaying) {
					_play();
				} else {
					render();
				}
			}
		}
		
		_clickedMouseX = e.clientX + 1;
	}

	display.addEventListener('mousedown', ()=> {
		_isCanvasMouseDown = true;
		_clickedMouseX = 0;
	});

	display.addEventListener('mousemove', (e)=> {
		_actCanvas(e);
	});

	display.addEventListener('mouseleave', ()=> {
		display.classList.remove('clickable');
	})

	picotune.addEventListener('mouseup', (e)=> {
		if (!_clickedMouseX) {
			_actCanvas(e);
		}
		_isCanvasMouseDown = false;
	});
}