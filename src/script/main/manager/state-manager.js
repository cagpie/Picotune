import pAudio from '../pico-audio';

const data = {
	get isPlaying () {
		return pAudio.states.isPlaying;
	},

	isFavoriteMode: false,
	isDisplayFavorite: true,

	isRetroMode: false,
	retroModePoly: 3,
	retroModePercPoly: 1,

	isPlayerCard: false
}

const stateManager = {
	get: (target)=> {
		return data[target];
	},
	set: (target, value)=> {
		return data[target] = value;
	}
}

export default stateManager;
