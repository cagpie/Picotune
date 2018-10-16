import drawDebug from '../../debug/draw-debug';

import createElement from '../../util/create-element';

import { CHORDS, C_CHORDS } from '../../config/chord-name';

import songManager from '../manager/song-manager';
import stateManager from '../manager/state-manager'; 
import parameterManager from '../manager/parameter-manager';

import pAudio from '../pico-audio';

const noteHeight = parameterManager.get('canvasNoteHeight');
const canvasBottomMargin = parameterManager.get('canvasBottomMargin');
const canvasRatio = parameterManager.get('canvasRatio');

const canvas = picotune.content.song.player.display;
const context = canvas.getContext('2d');

// TODO
//pAudio.debug = true;

// playingNotes
const playingNotes = [];
pAudio.trigger.isNoteTrigger = true;
pAudio.trigger.noteOn = (note)=> {
	if (note.channel == 9) return;
	playingNotes.push(note.pitch);
}
pAudio.trigger.noteOff = (note)=> {
	if (note.channel == 9) return;
	playingNotes.some((playNote, idx)=> {
		if (note.pitch == playNote) {
			// playingNotes.splice(idx,1); を軽量化
			if (idx == 0) playingNotes.shift();
			else if (idx == playingNotes.length-1) playingNotes.pop();
			else playingNotes.splice(idx,1);
			return true;
		}
	});
}
pAudio.trigger.play = ()=> {
	playingNotes.length = 0;
}


// PianoRoll Back
const backPianoRoll = createElement('canvas', { width: canvas.width, height: canvas.height });
const backPianoRollContext = backPianoRoll.getContext('2d');

backPianoRollContext.fillStyle = '#fff';
backPianoRollContext.fillRect(0, 0, canvas.width, canvas.height);

backPianoRollContext.fillStyle = '#eee';
for (let i=0; i<12*12; i++) {
	if ([1,3,6,8,10].some(k => i%12==k)) {
		backPianoRollContext.fillStyle = '#eee';
		backPianoRollContext.fillRect(
			0,
			canvas.height - (i+1)*noteHeight + canvasBottomMargin,
			canvas.width,
			noteHeight
		);
	} else if (i%12==0) {
		backPianoRollContext.fillStyle = '#fee';
		backPianoRollContext.fillRect(
			0,
			canvas.height - i*noteHeight + canvasBottomMargin - 1,
			canvas.width,
			2
		);
	}
}

// 鍵盤背景描画
function drawPianorollBack () {
	context.drawImage(backPianoRoll, 0, 0, canvas.width, canvas.height);
}

// tempCanvasからピアノロール描画
function drawPianoroll (x, tempCanvases) {
	function _mod (a, b) {
		return(a*b<0)*b+a%b
	}

	// ピアノロール描画
	let canvasW = tempCanvases[0] ? tempCanvases[0].width : canvas.width;
	if (!stateManager.get('isFavoriteMode')) {
		// 常時スクロール
		let addX = -_mod(x, canvasW);
		for (let i=0; i<Math.ceil(canvas.width/canvasW)+1; i++) {
			let canvasesIdx = Math.floor(x/canvasW)+i;
			let tempCanvas = tempCanvases[canvasesIdx];
			if (tempCanvas) {
				context.drawImage(tempCanvas, addX, 0);
			}
			addX += canvasW;
		}

		// 再生ライン
		context.fillStyle = '#888';
		context.fillRect(Math.floor(canvas.width/2), 0, 1, canvas.height);
	} else {
		// ページ切り替わり
		let subW = canvas.width - canvasW;
		let canvasesBaseIdx = Math.floor((x+Math.ceil(canvas.width/2))/(canvasW+subW));
		let canvasesSubIdx = Math.floor((subW*canvasesBaseIdx)/(canvasW));
		let addX = -(_mod(subW*canvasesBaseIdx, (canvasW)));
		for (let i=0; i<Math.ceil(canvas.width/canvasW); i++) {
			let canvasesIdx = canvasesBaseIdx+canvasesSubIdx+i;
			let tempCanvas = tempCanvases[canvasesIdx];
			if (tempCanvas) {
				context.drawImage(tempCanvas, addX, 0);
			}
			addX += canvasW;
		}

		// 再生ライン
		context.fillStyle = '#888';
		context.fillRect(Math.floor((x+canvas.width/2)%(canvasW+subW)), 0, 1, canvas.height);
	}
}

// 五度圏描画
function drawCircleOfFifths (padding) {
	const coFifthWidth = 40;
	const coFifth = [0, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10, 5];
	const coFifthContent = ['C ', 'G ', 'D ', 'A ', 'E ', 'B ', 'F#', 'C#', 'G#', 'D#', 'A#', 'F '];

	function _sort (a, b) {
		if (a < b) return -1;
		if (a > b) return 1;
		return 0;
	}
	
	function _getCoFifthPoint(idx) {
		return {
			x: Math.cos(2*Math.PI/12 * idx - Math.PI/2)*coFifthWidth + (100 + padding),
			y: Math.sin(2*Math.PI/12 * idx - Math.PI/2)*coFifthWidth + (canvas.height - 84)
		};
	}

	let rootNote = 128;
	const playingNotesMod = playingNotes.map((note)=> {
		// コードのルート音推定
		if (note < rootNote) {
			rootNote = note;
		}
		// ド～シのみに絞る
		return (note % 12);
	}).filter((note, idx, arr)=> {
		// 重複をはじく
		return arr.indexOf(note) == idx
	}).sort(_sort);

	const playingNotesForDrawing = playingNotesMod.map((note)=> {
		return coFifth[note];
	}).sort(_sort);

	// 五度圏背景描画
	context.globalAlpha = 0.7;
	context.fillStyle = '#fff';

	context.beginPath();
	context.moveTo(_getCoFifthPoint(0).x, _getCoFifthPoint(0).y);
	for (let i=1; i<12; i++) {
		context.lineTo(_getCoFifthPoint(i).x, _getCoFifthPoint(i).y);
	}
	context.closePath();
	context.fill();

	// 五度圏描画
	context.globalAlpha = 0.4;
	context.fillStyle = '#888';

	context.beginPath();
	playingNotesForDrawing.forEach((u, i)=> {
		if (i==0) {
			context.moveTo(_getCoFifthPoint(u).x, _getCoFifthPoint(u).y);
		} else {
			context.lineTo(_getCoFifthPoint(u).x, _getCoFifthPoint(u).y);
		}
	})
	context.closePath();
	context.fill();

	// 五度圏音階描画
	context.globalAlpha = 1;

	for (let i=0; i<12; i++) {
		context.fillStyle = '#888';
		if ((rootNote !== 128) && (i === coFifth[rootNote%12])) {
			// ルート音のコードだったら色を変える
			context.fillStyle = "#4d4";
		}

		context.fillText(coFifthContent[i], _getCoFifthPoint(i).x-5, _getCoFifthPoint(i).y+2.5);
	}

	// コード名描画
	context.fillStyle = "#000";

	let currentCodeName = '';
	for (let i=0; i<12; i++) {
		Object.keys(C_CHORDS).forEach((code)=> {
			// コードのリストと合致する音を取り出す
			const _list = playingNotesMod.filter((note)=> {
				// 一音ずつずらしたコードと判定
				return C_CHORDS[code].map(n => (n+i)%12).indexOf(note)!=-1
			});
			if ((_list.length === C_CHORDS[code].length) ||
				(_list.length >= 4)) {
					currentCodeName = CHORDS[i]+code.slice(1);
			}
		});

		if (i === rootNote%12) {
			context.fillText(currentCodeName, 100+padding, canvas.height-84);
		}
	}
}

// テンポ描画
function drawTempo (padding) {
	context.fillStyle = '#000';
	context.globalAlpha = 1;

	const currentTiming = Math.floor(pAudio.getTiming((pAudio.context ? pAudio.context.currentTime : 0) - pAudio.states.startTime));
	let bpm = 120;
	pAudio.tempoTrack.some((tempo)=> {
		if (tempo.timing > currentTiming) {
			return true;
		}

		bpm = Math.floor(tempo.value+0.5);
	});

	context.fillText(`BPM ${bpm}`, 50+padding, canvas.height-27);
}

// 拍子描画
function drawBeat (padding) {
	context.fillStyle = '#000';
	context.globalAlpha = 1;

	const currentTiming = Math.floor(pAudio.getTiming((pAudio.context ? pAudio.context.currentTime : 0) - pAudio.states.startTime));
	let beat = '---';
	songManager.get('parsedSMF').beatTrack.some((b)=> {
		if (b.timing > currentTiming) {
			return true;
		}

		beat = b.value.join('/');
	});

	context.fillText(`BEAT ${beat}`, 50+padding, canvas.height-12);
}

// 時間描画
function drawTime (padding) {
	context.fillStyle = '#000';
	context.globalAlpha = 1;

	const baseTime = pAudio.states.isPlaying ? (pAudio.context ? pAudio.context.currentTime : 0) : pAudio.states.stopTime;
	const current = baseTime - pAudio.states.startTime;
	const duration = songManager.get('duration');
	const text = {
		current: `${Math.floor(current/60)}:${('0'+Math.floor(current%60)).slice(-2)}`,
		duration: `${Math.floor(duration/60)}:${('0'+Math.floor(duration%60)).slice(-2)}`
	}

	context.fillText(`TIME ${text.current} / ${text.duration}`, 120+padding, canvas.height-12);
}

// プログレスバー描画
function drawProgerssBar () {
	context.fillStyle = "#f77";
	context.globalAlpha = 0.4;
	context.fillRect(0, canvas.height-5, canvas.width, 5);

	context.fillStyle = "#f00";
	context.globalAlpha = 0.4;
	context.fillRect(0, canvas.height-5, canvas.width*(((pAudio.states.isPlaying ? pAudio.context.currentTime : pAudio.states.stopTime)-pAudio.states.startTime)/songManager.get('duration')), 5);
}

// プログレスバーホバーでマウス位置表示
function drawProgressCurrentPosition () {
	Array.from(canvas.classList).some((className)=> {
		if (className === 'clickable') {
			context.fillStyle = "#800";
			context.globalAlpha = 0.5;
			context.fillRect(canvas.mouse.x-2, canvas.height-5, 5, 5);
		}
	});
}

// いいね描画
function drawFavorites () {
	context.globalAlpha = 1;
	context.fillStyle = "#f77";
	context.textAlign = 'center';
	context.textBaseline = 'middle';

	songManager.get('favorites').forEach((fav)=> {
		if (!fav || fav.length==0) return;
		if (!stateManager.get('isFavoriteMode')) {
			if (fav[0]/canvasRatio-x<-32 || canvas.width+32<fav[0]/canvasRatio-x) return;
			context.fillText('👍', fav[0]/canvasRatio-x, canvas.height*(1-noteHeight/4)+fav[1]*noteHeight/4+canvasBottomMargin);
		} else {
			if (Math.floor((x+canvas.width/2)/canvas.width) != Math.floor((fav[0]/canvasRatio)/canvas.width)) return;
			context.fillText('👍', (fav[0]/canvasRatio)%canvas.width, canvas.height*(1-noteHeight/4)+fav[1]*noteHeight/4+canvasBottomMargin);
		}
	});

	context.textAlign = 'start';
	context.textBaseline = 'alphabetic';
}

// いいねモード
function drawFavoriteMode () {
	context.fillText('ピアノロールをクリックするといいね👍を置くことができます', canvas.width<=canvas.height+200 ? 5 : 230+(canvas.width-608), canvas.width<=canvas.height+200 ? 10 : 372);
	context.textAlign = 'center'; // テキスト左右中央寄せ
	context.textBaseline = 'middle'; // テキスト上下中央寄せ
	context.fillStyle = '#f77';
	context.globalAlpha = 0.5;

	// TODO
	const favX = typeof niceX!=="undefined" && niceX;
	const favY = typeof niceY!=="undefined" && niceY;
	context.fillText('👍', (favX/canvasRatio)%canvas.width, canvas.height*(1-noteHeight/4)+favY*noteHeight/4+canvasBottomMargin);
	
	context.globalAlpha = 1;
	context.textAlign = 'start';
	context.textBaseline = 'alphabetic';
}

// レトロモード
function drawRetroMode () {
	context.fillStyle = '#00f';
	context.globalAlpha = 1;
	
	context.fillText(`RETRO MODE (${stateManager.get('retroModePoly')} + ${stateManager.get('retroModePercPoly')})`, 120+padding, canvas.height-27);
	if (!pAudio.states.isPlaying) {
		context.fillText('レトロモードが有効です。同時発音数が制限されます', 120+padding, canvas.height-43);
	}
}


export function draw (x, tempCanvases) {
	context.globalAlpha = 1;
	const padding = -45;

	// 鍵盤の背景描画
	drawPianorollBack();

	// ノート描画
	drawPianoroll(x, tempCanvases);

	// 五度圏描画
	drawCircleOfFifths(padding);

	// 曲情報描画
	drawTempo(padding);
	drawBeat(padding);
	drawTime(padding);

	// 尺描画
	drawProgerssBar();

	// シーク時に尺にマウス位置描画
	drawProgressCurrentPosition();
	
	// TODO ロゴ描画
	if (false && !stateManager.get('isPlayerCard') && document.getElementById("settingDisplayLogo").checked) {
		context.globalAlpha = 0.8;
		context.drawImage(logo_icon, Math.floor(canvas.width-80), Math.floor(canvas.height-22));
	}

	// いいね描画
	if (stateManager.get('isDisplayFavorite')) {
		drawFavorites();
	}

	// いいねモードの説明描画
	if (stateManager.get('isFavoriteMode')) {
		drawFavoriteMode();
	}

	// レトロモードの説明描画
	if (stateManager.get('isRetroMode') && !pAudio.settings.isWebMIDI) {
		drawRetroMode();
	}

	// デバッグモード
	if (pAudio.debug) {
		drawDebug (context, pAudio, playingNotes, padding)
	}
}

export default function render () {
	const canvasRatio = songManager.get('drawingRatio');
	const tempCanvases = songManager.get('tempCanvases');
	const baseTime = pAudio.states.isPlaying ? pAudio.context.currentTime : pAudio.states.stopTime;

	draw(Math.floor(pAudio.getTiming(baseTime-pAudio.states.startTime)/canvasRatio - canvas.width/2), tempCanvases);
}