import picotune from './picotune';

import * as latestSong from './songlist/latest-song-manager';
import * as searchSong from './songlist/search-song-manager';


export default function setup () {
	const header = picotune.header.wrapper.menu;
	const column = picotune.content.column;

	// ---- header
	// header - search
	header.search.searchSubmit.addEventListener('click', (e)=> {
		// submit処理によるページ遷移を抑止
		e.preventDefault();

		searchSong.clearSearchSongs();
		searchSong.addSearchSongs(0, header.search.searchInput.value);
		picotune.setAttribute('data-displaycolumn', 'display-search')
	});

	// header -  local
	header.local.addEventListener('click', ()=> {
		if (picotune.getAttribute('data-displaycolumn') === 'display-local') {
			picotune.setAttribute('data-displaycolumn', '');
			return;
		}
		picotune.setAttribute('data-displaycolumn', 'display-local');
	});


	// column
	[column.search.header, column.local.header].forEach((el)=> {
		el.addEventListener('click', ()=> {
			picotune.setAttribute('data-displaycolumn', '');
		});
	});

	// load more songs by column scroll
	column.addEventListener('scroll', (e)=> {
		// uploaded
		if (!picotune.getAttribute('data-displaycolumn')) {
			const remainScrollY = column.uploaded.offsetHeight - (column.scrollTop + column.offsetHeight);
			if (remainScrollY < 500 && !column.uploaded.content.latest.songList.getAttribute('data-load')) {
				latestSong.addLatestSongs(column.uploaded.content.latest.songList.children.length);
			}
		// search
		} else if (picotune.getAttribute('data-displaycolumn') === 'display-search') {
			const remainScrollY = column.search.offsetHeight - (column.scrollTop + column.offsetHeight);
			if (remainScrollY < 500 && !column.search.content.songList.getAttribute('data-load')) {
				searchSong.addSearchSongs(column.search.content.songList.children.length);
			}
		}
	});

}