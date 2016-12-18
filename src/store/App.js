import {extendObservable, action} from 'mobx';

class AppStore {
  constructor() {
    extendObservable(this, {
      isSearching: false,
      search: '',
      searchResults: null,
      searchHighlight: -1,
      picked: [],
      pickedStats: null,

      pendingPodcasts: [],

      picks: null,
      isFetching: false,
      page: 1,
      podcast: null,
      podcasts: null,
      podcastsSearch: null,
    })
  }

  setTitle = action(title => {
    this.title = title;
  })

  setPicks = action((picks, page) => {
    this.picks = picks
    this.page = page
  })

  setPodcast = action(podcast => {
    this.podcast = podcast
  })

  setPodcasts = action((podcasts, page) => {
    this.podcasts = podcasts
    this.page = page
  })
}

export default AppStore
