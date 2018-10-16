let monitorFps = 0;
let monitorFpsCnt = 0;
let monitorFpsTime = performance.now();
let monitorFpsInter = 1000;
let noteCntMax = 0;
let noteCntMaxTime = performance.now();
let noteCntMaxTimeout = 3000;
let polyCntMax = 0;
let polyCntMaxTime = performance.now();
let polyCntMaxTimeout = 3000;

export default function drawDebug (context, pAudio, playingNotes, padding) {
	// monitor FPS
	monitorFpsCnt++;
	let nowTime = performance.now();
	let subTime = nowTime-monitorFpsTime;
	if(subTime>=monitorFpsInter){
		monitorFps = monitorFpsCnt * (1000/subTime);
		monitorFpsTime = nowTime;
		monitorFpsCnt = 0;
	}
	context.fillStyle = '#000';
	context.fillText('FPS '+Math.floor(monitorFps)+'.'+Math.floor(monitorFps*10)%10, 50+padding, 27);
	// Reserved Note Cnt, Max
	let noteCnt = pAudio.states.stopFuncs.length;
	if(noteCntMax<=noteCnt){
		noteCntMax = noteCnt;
		noteCntMaxTime = nowTime;
	}
	if(nowTime-noteCntMaxTime>=noteCntMaxTimeout){
		noteCntMax = 0;
		noteCntMaxTime = nowTime;
	}
	context.fillText('Reserved Func Cnt', 50+padding, 42);
	context.fillText(noteCnt, 160+padding, 42);
	context.fillText('Reserved Func Max', 50+padding, 57);
	context.fillText(noteCntMax, 160+padding, 57);
	// Polyphony Cnt
	//let polyCnt = pAudio.states.polyCnt + pAudio.states.percPolyCnt;
	let polyCnt = playingNotes.length;
	if(polyCntMax<=polyCnt){
		polyCntMax = polyCnt;
		polyCntMaxTime = nowTime;
	}
	if(nowTime-polyCntMaxTime>=polyCntMaxTimeout){
		polyCntMax = 0;
		polyCntMaxTime = nowTime;
	}
	context.fillText('Polyphony Cnt', 50+padding, 72);
	context.fillText(polyCnt, 160+padding, 72);
	context.fillText('Polyphony Max', 50+padding, 87);
	context.fillText(polyCntMax, 160+padding, 87);

	context.fillText('Current Time', 50+padding, 102);
	context.fillText(pAudio.context.currentTime, 160+padding, 102);

	context.fillText('updateIntervalTime', 50+padding, 117);
	context.fillText(pAudio.states.updateIntervalTime, 160+padding, 117);

	context.fillText('updateBufTime', 50+padding, 132);
	context.fillText(pAudio.states.updateBufTime, 160+padding, 132);

	context.fillText('updateBufMaxTime', 50+padding, 147);
	context.fillText(pAudio.states.updateBufMaxTime, 160+padding, 147);

	if(pAudio.states.latencyTime != null){
		context.fillText('latencyTime', 50+padding, 162);
		context.fillText(pAudio.states.latencyTime, 160+padding, 162);
	}

	if(pAudio.states.latencyLimitTime != null){
		context.fillText('latencyLimitTime', 50+padding, 177);
		context.fillText(pAudio.states.latencyLimitTime, 160+padding, 177);
	}
}