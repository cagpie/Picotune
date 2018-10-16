import getDefaultToneSetting from '../../util/get-default-tone-setting';

const DB_NAME = 'pt-localsong';
const DB_VERSION = 7;

const req = window.indexedDB.open(DB_NAME, DB_VERSION);

let db;
req.onsuccess = function(e) {
	db = e.target.result;
};

req.onupgradeneeded = function(e){
	const _db = e.target.result;
	if (_db.objectStoreNames.contains('local')) _db.deleteObjectStore('local');
	_db.createObjectStore('local', { keyPath : 'id', autoIncrement: true });
};

const localSongManager = {
	// 全曲
	getSongList: (callback)=> {
		const songList = [];
		
		db
			.transaction(['local'])
			.objectStore('local')
			.openCursor(IDBKeyRange.lowerBound(0), 'prev')
			.onsuccess = (e)=> {
				const result = e.target.result;
				if (!result) {
					callback(songList);
					return;
				}
				songList.push({ id: result.value.id, title: result.value.title });
				result.continue();
			}
	},
	// タイトル検索
	getSong: (title, callback)=> {
		db
			.transaction(['local'])
			.objectStore('local')
			.openCursor(IDBKeyRange.lowerBound(0))
			.onsuccess = (e)=> {
				const result = e.target.result;
				if (!result) {
					callback(null);
					return;
				}
				if (result.value.title === title) {
					callback(result.value);
					return;
				}
				result.continue();
			}
	},
	// ID検索(速い)
	getSongById: (id, callback)=> {
		db
			.transaction(['local'], 'readonly')
			.objectStore('local')
			.get(id)
			.onsuccess = (e)=> {
				const result = e.target.result;
				if (!result) {
					callback(null);
					return;
				}
				callback(result);
			}
	},
	// 保存
	saveSong: (title, file, tone, callback)=> {
		db
			.transaction(['local'], 'readwrite')
			.objectStore('local')
			.put({ title: title, file: file, tone: tone || getDefaultToneSetting() })
			.onsuccess = ()=> {
				if (callback) {
					callback();
				}
			}
	},
	// 上書き保存
	overSaveSongTone: (id, tone, callback)=> {
		localSongManager.getSongById(id, (song)=> {
			song.tone = tone;
			db
			.transaction(['local'], 'readwrite')
			.objectStore('local')
			.put(song)
			.onsuccess = ()=> {
				if (callback) {
					callback();
				}
			}
		})
	}
}

export default localSongManager;
