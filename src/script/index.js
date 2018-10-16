import picotune from './main/picotune';

const display = picotune.content.song.player.display;
display.width = display.offsetWidth;

// ディスプレイ初期化
/*
window.addEventListener('resize', ()=> {
	if (display.width != display.offsetWidth) {
		display.width = display.offsetWidth;
	}

	if (!pAudio.states.isPlaying) {
		let context = display.getContext('2d');
		if (!isFirst ||
			(pAudio.hashedDataList instanceof Array && pAudio.hashedDataList.length>0)
			){
			draw(Math.floor(pAudio.getTiming(pAudio.states.stopTime-pAudio.states.startTime)/canvasRatio - display.width/2));
			context.globalAlpha = 0.5;
		} else {
			context.clearRect(0, 0, displat.width, display.height);
		}
		//context.drawImage(stop_icon, Math.floor((canvas.width-376)/2), Math.floor((canvas.height-376)/2));
		context.globalAlpha = 1;
	}
});
*/

import init from './main/init';
import pageEventSetup from './main/page-event';

import controllerSetup from './main/player/controller';

import pickupSongSetup from './main/songlist/pickup-song-manager';
import latestSongSetup from './main/songlist/latest-song-manager';
import localSongSetup from './main/songlist/local-song-manager';

init();
pageEventSetup();

controllerSetup();

pickupSongSetup();
latestSongSetup();
localSongSetup();