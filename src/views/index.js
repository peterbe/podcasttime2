import React from 'react'

//models
import {Route} from 'mobx-router'

//components
import Home from './Home'
import Picks from './Picks'
import Podcast from './Podcast'
import Podcasts from './Podcasts'
import About from './About'
// import PersistentPicks from './PersistentPicks'
import MyPicks from './MyPicks'
import AllPodcasts from './AllPodcasts'

//misc
import {
  equalArrays,
  updateDocumentTitle,
} from './Common'


const views = {
  home: new Route({
    path: '/',
    component: <Home/>,
    onEnter: (route, params, store, queryParams) => {
      updateDocumentTitle(null)
      store.app.picked = []
      store.app.pickedStats = null
      store.app.pickedStatsEpisodes = null
      store.app.searchResults = []
      store.app.searchHighlight = -1
      store.app.serverResponseError = null
    }
  }),
  home_found: new Route({
    path: '/mine/:ids',
    component: <Home/>,
    onEnter: (route, params, store, queryParams) => {
      if (params.ids) {
        let ids = params.ids.split('-').sort()
        updateDocumentTitle(`${ids.length} found`)
        let idsJoined = ids.join(',')
        let pickedIds = store.app.picked.map(p => p.id).sort()
        if (!equalArrays(ids, pickedIds)) {
          store.app.isFetching = true
          let url = `/api/podcasttime/find?ids=${idsJoined}`
          fetch(url)
          .then(r => {
            if (r.status !== 200) {
              store.app.serverResponseError = r
            } else {
              return r.json()
            }
          })
          .then(results => {
            if (results) {
              store.app.picked = results.items
              store.app.isSearching = false
            }
          })
        }
        let url = `/api/podcasttime/stats?ids=${idsJoined}`
        fetch(url)
        .then(r => {
          if (r.status !== 200) {
            store.app.serverResponseError = r
          } else {
            return r.json()
          }
        })
        .then(results => {
          store.app.pickedStats = results
          url = `/api/podcasttime/stats/episodes?ids=${ids}`
          fetch(url)
          .then(r => r.json())
          .then(results => {
            store.app.pickedStatsEpisodes = results.episodes
          })

        })
      }
    },
    onParamsChange: (...args) => {
      return views.home_found.onEnter(...args)
    }
  }),
  my_picks: new Route({
    path: '/picks/mine',
    component: <MyPicks/>,
    onEnter: (route, params, store, queryParams) => {
      const picks = JSON.parse(
        localStorage.getItem('picks'), '{}'
      )
      let picksList = []

      // despite its pluralistic name, this is either null or a string
      let currentPick = sessionStorage.getItem('picks')
      // but current pick is only applicable if it's actually used
      if (!store.app.picks) {
        currentPick = null
      }
      let keys = []
      if (picks) {
        keys = Object.keys(picks)
      }
      keys.forEach(key => {
        if (key !== currentPick) {
          let data = picks[key]
          data.key = key
          picksList.push(data)
        }
      })
      picksList.sort((a, b) => b.date - a.date)
      store.app.persistentPicks = picksList
    }
  }),
  picks_home: new Route({
    path: '/picks',
    component: <Picks/>,
    onEnter: (...args) => {
      updateDocumentTitle('Picks')
      return views.picks.onEnter(...args)
    }
  }),
  picks: new Route({
    path: '/picks/:page',
    component: <Picks/>,
    onEnter: (route, params, store) => {
      let page = params.page || 1
      page = parseInt(page, 10)
      if (page > 1) {
        updateDocumentTitle(`Picks - page ${page}`)
      } else {
        updateDocumentTitle('Picks')
      }
      store.app.isFetching = true
      fetch(`/api/podcasttime/picks/data/?page=${page}`)
      .then(r => {
        if (r.status !== 200) {
          store.app.serverResponseError = r
        } else {
          return r.json()
        }
      })
      .then(picks => {
        if (picks) {
          store.app.isFetching = false
          store.app.setPicks(picks, page)
          setTimeout(() => {
            let nextUrl = `/api/podcasttime/picks/data/?page=${page + 1}`
            fetch(nextUrl)
            .then(r => {
              if (r.status === 200) {
                return r.json()
              }
            })
            .then(() => {
              console.log('Preloaded', nextUrl);
            })
          }, 2000)
        }
      })
    },
    onParamsChange: (route, params, store) => {
      return views.picks.onEnter(route, params, store)
    }
  }),
  podcast: new Route({
    path: '/podcasts/:id/:slug',
    component: <Podcast/>,
    onEnter: (route, params, store, queryParams, attempts = 0, updating = false) => {
      // console.log("onEnter", attempts, updating);
      if (store.app.podcast && store.app.podcast.id === params.id && !updating) {
        // A podcast has already been loaded.
        console.log("No need to load podcast");
        updateDocumentTitle(store.app.podcast.name)
        store.app.isFetching = false
        // console.log("Current updating?", store.app.podcast._updating);
        if (store.app.podcast._updating) {
          console.log('Will try to update');
          setTimeout(() => {
            views.podcast.onEnter(
              route, params, store, queryParams, 0, true
            )
          }, 2000)
        }
      } else {
        if (!updating) {
          store.app.isFetching = true
        }
        const url = `/api/podcasttime/find?ids=${params.id}`
        fetch(url)
        .then(r => {
          if (r.status !== 200) {
            store.app.serverResponseError = r
            store.app.isFetching = false
          } else {
            return r.json()
          }
        })
        .then(results => {
          if (results && results.items.length) {
            let podcast = results.items[0]
            store.app.setPodcast(podcast)
            updateDocumentTitle(podcast.name)
            store.app.isFetching = false
            if (store.app.podcastNotFound) {
              store.app.podcastNotFound = false
            }
            if (podcast._updating) {
              if (attempts < 4) {
                setTimeout(() => {
                  views.podcast.onEnter(
                    route, params, store, queryParams, attempts + 1
                  )
                }, 10 * 1000)
              }
            }
          } else {
            store.app.isFetching = false
            store.app.podcastNotFound = true
          }
        })
      }

      // load the episodes
      const episodesUrl = `/api/podcasttime/podcasts/episodes/${params.id}`
      fetch(episodesUrl)
      .then(r => {
        if (r.status !== 200) {
          store.app.serverResponseError = r
          store.app.isFetching = false
        } else {
          return r.json()
        }
      })
      .then(result => {
        if (result) {
          store.app.podcastEpisodes = result.episodes
        }
      })
    },
    onParamsChange: (route, params, store, queryParams) => {
      return views.podcast.onEnter(route, params, store, queryParams)
    }
  }),
  podcasts: new Route({
    path: '/podcasts/:page',
    component: <Podcasts/>,
    onEnter: (route, params, store, queryParams) => {
      if (queryParams && queryParams.search) {
        store.app.podcastsSearch = queryParams.search
      }
      let page = params.page || 1
      page = parseInt(page, 10)
      if (page > 1) {
        updateDocumentTitle(`Podcasts - Page ${page}`)
      } else {
        updateDocumentTitle(`Podcasts`)
      }
      let url = `/api/podcasttime/podcasts/data/?page=${page}`
      if (store.app.podcastsSearch) {
        url += `&search=${store.app.podcastsSearch}`
      }
      fetch(url)
      .then(r => {
        if (r.status !== 200) {
          store.app.serverResponseError = r
        } else {
          return r.json()
        }
      })
      .then(podcasts => {
        if (podcasts) {
          store.app.setPodcasts(podcasts, page)
          store.app.isFetching = false
          document.querySelector('.page-number-header').scrollIntoView()
          if (!store.app.podcastsSearch) {
            setTimeout(() => {
              let nextUrl = `/api/podcasttime/podcasts/data/?page=${page + 1}`
              fetch(nextUrl)
              .then(r => {
                if (r.status === 200) {
                  return r.json()
                }
              })
              .then(() => {
                console.log('Preloaded', nextUrl);
              })
            }, 2000)
          }
        }
      })
    },
    onParamsChange: (route, params, store, queryParams) => {
      store.app.isFetching = true
      store.app.podcasts = null
      return views.podcasts.onEnter(route, params, store, queryParams)
    }
  }),
  podcasts_home: new Route({
    path: '/podcasts',
    component: <Podcasts/>,
    onEnter: (route, params, store, queryParams) => {
      return views.podcasts.onEnter(route, params, store, queryParams)
    }
  }),
  about: new Route({
    path: '/about',
    component: <About/>,
    onEnter: (route, params, store, queryParams) => {
      updateDocumentTitle('About')
      const url = '/api/podcasttime/general-stats/numbers'
      fetch(url)
      .then(r => r.json())
      .then(stats => {
        store.app.statsNumbers = stats.numbers
      })
    }
  }),
  all_table: new Route({
    path: '/all',
    component: <AllPodcasts/>,
  })
}

export default views;
