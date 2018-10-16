import createElement from '../../util/create-element';

import ChannelColor from '../../config/channel-color';

import songManager from '../manager/song-manager';
import parameterManager from '../manager/parameter-manager';

import pAudio from '../pico-audio';

import render from './draw';


export default function loadFile(file, toneSetting) {
	if(pAudio.states.isPlaying) pAudio.stop();

	const data = pAudio.parseSMF(new Uint8Array(file));

	if(typeof data === 'string') return console.log(data);

	let tempCanvases = [];

	pAudio.setData(data);

	// 音色設定
	if (toneSetting) {
		pAudio.setChannels(toneSetting);
	} else {
		pAudio.initChannels();
	}

	songManager.set('parsedSMF', data);
	songManager.set('duration', pAudio.getTime(data.songLength));
	songManager.set('tempCanvases', tempCanvases);

	// Pre Draw Piano Roll
	// -- Draw BackGround
	const canvas = picotune.content.song.player.display;
	const canvasRatio = songManager.get('drawingRatio');
	const tempCanvasLength = Math.min((data.songLength/canvasRatio), 100000); // 1000000を明示的に上限に

	for (let i=0; i<=tempCanvasLength; i+=canvas.width) {
		tempCanvases.push(createElement('canvas', { width: canvas.width, height: canvas.height }));
	}

	// 背景拍子の描画
	drawPianoRollBeats(data, canvas, tempCanvases, canvasRatio);

	// ノートの描画
	drawPianoRollNotes(data, canvas, tempCanvases, canvasRatio);
/*
	if(pAudio.debug){
		let syoriTimeS3 = performance.now();
		console.log("canvas draw time", syoriTimeS3 - syoriTimeS2);
	}
	// Play


	if(pAudio.debug){
		let syoriTimeE = performance.now();
		console.log("loadFile time", syoriTimeE - syoriTimeS);
	}

*/

	// rendering
	if (!pAudio.isPlayed) {
		function animationRender () {
			let canvasRatio = songManager.get('drawingRatio');

			if (pAudio.states.isPlaying == false) {

			} else if (pAudio.getTiming(pAudio.context.currentTime-pAudio.states.startTime)/canvasRatio < songManager.get('parsedSMF').songLength/canvasRatio-1){
				render();
			}

			window.requestAnimationFrame(animationRender);
		}
		
		animationRender();
	}

	// Play
	pAudio.play();
}

function drawPianoRollBeats (data, canvas, tempCanvases, canvasRatio) {
	data.beatTrack.forEach((beat, idx)=> {
		let i = beat.timing;
		for (let cnt=0; ; cnt++) {
			// 拍子の切り替わりか曲の終わりで描画終了
			if (i >= (data.beatTrack[idx+1] ? data.beatTrack[idx+1].timing : data.songLength)) return;
			
			// 曲長すぎでtempCanvasが無くなっても終了
			const tempCanvas = tempCanvases[Math.floor(i/canvasRatio/canvas.width)];
			if (!tempCanvas) return;

			const context = tempCanvas.getContext('2d');
			context.fillStyle = '#00f';
			context.globalAlpha = ((cnt % beat.value[0]) === 0) ? 0.3 : 0.1;
			context.fillRect(i/canvasRatio%canvas.width, 0, 1, canvas.height);

			i += data.header.resolution/(beat.value[1]/4);
		}
	});
}

function _sortDrawNotes (events, note, noteVariable, lastNoteOffTiming, canvasRatio) {
	let timingOld = -1;
	let idx = events.length-1;

	for(let n=note[noteVariable].length-1; n>=0; n--){
		let v = note[noteVariable][n];
		let t = Math.floor(v.timing/canvasRatio)*canvasRatio;
		if(timingOld==t) continue;
		timingOld = t;
		if(v.timing>lastNoteOffTiming) break;

		let eventObj;
		for(; idx>=0; idx--){
			eventObj = events[idx];
			if(t >= eventObj.timing) break;
		}

		if(eventObj && t==eventObj.timing){
			eventObj[noteVariable] = v.value;
			idx--;
		} else {
			idx++;
			eventObj = {timing:t}
			eventObj[noteVariable] = v.value;
			// events.splice(idx, 0, eventObj); を軽量化
			if(idx == 0) events.unshift(eventObj);
			else if(idx == events.length) events.push(eventObj);
			else events.splice(idx, 0, eventObj);
		}
	}
}

function drawPianoRollNotes (data, canvas, tempCanvases, canvasRatio) {
	const noteHeight = parameterManager.get('canvasNoteHeight');
	const canvasBottomMargin = parameterManager.get('canvasBottomMargin');
	const percussionNote = {
		y: [0, noteHeight/4, noteHeight/4, noteHeight/4],
		h: [noteHeight, noteHeight/2, noteHeight/2, noteHeight/2],
		a: [1, 0.9, 0.6, 0.2]
	}

	for (let i=data.channels.length-1; i>=0; i--) {
		let barWidth = canvasRatio;
		data.channels[i].notes.forEach((note)=> {
			const events = []; // [{timing, pitchBend, expression, modulation}, ...] (timing ascending order)
			_sortDrawNotes(events, note, 'pitchBend', data.lastNoteOffTiming, canvasRatio);
			_sortDrawNotes(events, note, 'expression', data.lastNoteOffTiming, canvasRatio);
			_sortDrawNotes(events, note, 'modulation', data.lastNoteOffTiming, canvasRatio);

			let holdBeforeStop = Number.MAX_SAFE_INTEGER;
			if (note.holdBeforeStop) {
				_sortDrawNotes(events, note, 'holdBeforeStop', data.lastNoteOffTiming, canvasRatio);
				holdBeforeStop = Math.floor(note.holdBeforeStop[0].timing/canvasRatio)*canvasRatio;
			}

			let pitchBend = note.pitchBend[0].value;
			let expression = note.expression[0].value;
			let modulation = note.modulation[0].value;

			let idx = 1;
			let xStop = (note.stop >= data.lastNoteOffTiming) ? data.lastNoteOffTiming : note.stop;
			for (let x = Math.floor(note.start/canvasRatio)*canvasRatio; x <= xStop; ) {
				if (note.channel != 9) {
					if (idx < events.length) {
						barWidth = events[idx].timing - x;
					} else {
						barWidth = xStop - x + 1;
					}
				}

				for(let c=0; Math.floor(x/canvasRatio/canvas.width)+c <= Math.floor((x+barWidth)/canvasRatio/canvas.width); c++){
					const tempCanvas = tempCanvases[Math.floor(x/canvasRatio/canvas.width) + c];

					if (tempCanvas) {
						const context = tempCanvas.getContext('2d');
						const bar = {
							x: (x/canvasRatio)%canvas.width-c*canvas.width,
							y: 384-(note.pitch+pitchBend)*noteHeight+canvasBottomMargin-noteHeight,
							w: Math.floor(barWidth/canvasRatio),
							h: noteHeight
						};

						context.fillStyle = ChannelColor[note.channel];
						context.globalAlpha = note.velocity*(expression/127);

						// パーカッション
						if(note.channel === 9){
							for(let p=0; p<3; p++){
								const _tempCanvas = tempCanvases[Math.floor((x/canvasRatio + p)/canvas.width) + c];
								const _context = _tempCanvas.getContext('2d');

								_context.globalAlpha = (note.velocity*(expression/127)) * percussionNote.a[p];
								_context.fillRect(bar.x + p, bar.y+(percussionNote.y[p]), 1, percussionNote.h[p]);
							}
							return;
						}

						if (modulation == 0) {
							// モジュレーション無し描画
							if ((note.holdBeforeStop == null) ||
								(noteHeight <= 2) ||
								(x < holdBeforeStop)) {
								context.fillRect(bar.x, bar.y, bar.w, bar.h);
							} else {
								// ホールドは白抜き描画
								context.fillRect(bar.x, bar.y, bar.w, 1);
								context.fillRect(bar.x, bar.y+bar.h-1, bar.w, 1);
								if (idx >= events.length) {
									context.fillRect(bar.x+bar.w-1, bar.y+1, 1, bar.h-2);
								}
							}
						} else {
							// モジュレーション有り描画
							for (let mx=0; mx<bar.w; mx++) {
								let mAng = -Math.sin((bar.x+mx+c*canvas.width) * (Math.PI/180) * 60);
								let mGain = modulation / 127;
								if ((note.holdBeforeStop == null) ||
									(x < holdBeforeStop) ||
									((idx >= events.length) && (mx >= bar.w-1))){
									context.fillRect(bar.x+mx, bar.y+(mAng*bar.h/4)*mGain, 1, bar.h-(mAng*bar.h/2)*mGain);
								} else {
									context.fillRect(bar.x+mx, bar.y+(mAng*bar.h/4)*mGain, 1, 1);
									context.fillRect(bar.x+mx, bar.y+bar.h-1-(mAng*bar.h/4)*mGain, 1, 1);
								}
							}
						}
					}
				}
				
				if (idx < events.length) {
					const ev = events[idx];
					if (ev.pitchBend != null) pitchBend = ev.pitchBend;
					if (ev.expression != null) expression = ev.expression;
					if (ev.modulation != null) modulation = ev.modulation;
				}

				x += barWidth;
				idx++;
			}
		});
	}
}
