import {extendObservable, action} from 'mobx';

class AppStore {
  constructor() {
    extendObservable(this, {
      title: 'PodcastTime',
      picks: null,
      isFetching: false,
      page: 1,
      podcast: null,
      // user: undefined
    });
  }

  setTitle = action(title => {
    this.title = title;
  })

  setPicks = action(picks => {
    this.picks = picks
  })

  setPodcast = action(podcast => {
    this.podcast = podcast
  })
  // setPage = action(page => this.page = page)
}

export default AppStore
