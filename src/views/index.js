import React from 'react'

//models
import {Route} from 'mobx-router'

//components
import Home from './Home'
import Picks from './Picks'
import Podcast from './Podcast'
import Podcasts from './Podcasts'

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
      store.app.searchResults = []
      store.app.searchHighlight = -1
    }
  }),
  home_found: new Route({
    path: '/found/:ids',
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
          .then(r => r.json())
          .then(results => {
            store.app.picked = results.items
            store.app.isSearching = false
          })
        }
        let url = `/api/podcasttime/stats?ids=${idsJoined}`
        fetch(url)
        .then(r => r.json())
        .then(results => {
          store.app.pickedStats = results
        })
      }
    },
    onParamsChange: (...args) => {
      return views.home_found.onEnter(...args)
    }
  }),
  picks_home: new Route({
    path: '/picks',
    component: <Picks/>,
    onEnter: (...args) => {
      return views.picks.onEnter(...args)
    }
  }),
  picks: new Route({
    path: '/picks/:page',
    component: <Picks/>,
    onEnter: (route, params, store) => {
      const page = params.page || 1
      if (page > 1) {
        updateDocumentTitle(`Picks - page ${page}`)
      } else {
        updateDocumentTitle('Picks')
      }
      store.app.isFetching = true
      fetch(`/api/podcasttime/picks/data/?page=${page}`)
      .then(r => r.json())
      .then(picks => {
        // store.app.page = page
        store.app.isFetching = false
        store.app.setPicks(picks, page)
      })
    },
    onParamsChange: (route, params, store) => {
      return views.picks.onEnter(route, params, store)
    }
  }),
  podcast: new Route({
    path: '/podcasts/:id/:slug',
    component: <Podcast/>,
    onEnter: (route, params, store) => {
      if (store.app.podcast && store.app.podcast.id === params.id) {
        // A podcast has already been loaded.
        console.log("Do nothing");
      } else {
        store.app.isFetching = true
        fetch(`/api/podcasttime/podcasts/data/${params.id}/${params.slug}`)
        .then(r => r.json())
        .then(podcast => {
          store.app.setPodcast(podcast)
          updateDocumentTitle(podcast.name)
          store.app.isFetching = false
        })
      }
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
      const page = params.page || 1
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
      .then(r => r.json())
      .then(podcasts => {
        store.app.setPodcasts(podcasts, page)
        store.app.isFetching = false
        document.querySelector('h3').scrollIntoView()
      })
    },
    onParamsChange: (route, params, store, queryParams) => {
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
}

export default views;
