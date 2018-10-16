/*
 * 曲をリストから選択→currentPlaylistをその曲リストにセット
 * 
 *
 */

const data = {
	currentSong: null,
	currentPlaylist: 'uploaded',
	currentHistoryBacking: 0,
	playlist: {
		history: [],
		uploaded: [],
		search: [],
		local: []
	}
}

const playlistManager = {
	get: function (target) {
		return data[target];
	},
	set: function (target, value) {
		return data[target] = value;
	},
	setCurrentSongByUser: function (song) {
		data.currentSong = song;
		data.playlist.history = data.playlist.history.slice(0, -(data.currentHistoryBacking));
		data.currentHistoryBacking = 0;
	}
}

export default playlistManager;
