import {extendObservable, action} from 'mobx';

class AppStore {
  constructor() {
    extendObservable(this, {
      serverResponseError: null,
      isSearching: false,
      search: '',
      searchResults: null,
      searchResultsTotal: null,
      searchHighlight: -1,
      picked: [],
      pickedStats: null,
      pickedStatsEpisodes: null,

      pendingPodcasts: [],

      statsNumbers: null,

      picks: null,
      isFetching: false,
      page: 1,
      podcast: null,
      podcastEpisodes: null,
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
