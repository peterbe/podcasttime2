import React from 'react'

//models
import {Route} from 'mobx-router'

//components
import Home from './Home'
import Picks from './Picks'
import Podcast from './Podcast'
// import Document from 'components/Document';
// import Gallery from 'components/Gallery';
// import Book from 'components/Book';
// import UserProfile from 'components/UserProfile';

const views = {
  home: new Route({
    path: '/',
    component: <Home/>
  }),
  picks_home: new Route({
    path: '/picks',
    component: <Picks/>,
    onEnter: (route, params, store) => {
      return views.picks.onEnter(route, params, store)
    }
  }),
  picks: new Route({
    path: '/picks/:page',
    component: <Picks/>,
    onEnter: (route, params, store) => {
      const page = params.page || 1
      store.app.isFetching = true
      fetch(`/api/podcasttime/picks/data/?page=${page}`)
      .then(r => r.json())
      .then(picks => {
        store.app.page = page
        store.app.isFetching = false
        store.app.setPicks(picks)
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
      // console.log(queryParams);
      // const page = queryParams.page || 1
      // store.app.setTitle('PICKS TITLEXX')
      // console.log("PARAMS", params);
      // let id = params.id
      store.app.isFetching = true
      fetch(`/api/podcasttime/podcasts/data/${params.id}/${params.slug}`)
      .then(r => r.json())
      .then(podcast => {
        // console.log("PODCAST FROM FETCH", podcast);
        // console.log('STORE', store);
        // store.setPicks(picks)
        // store.app.picks = picks
        store.app.setPodcast(podcast)
        store.app.isFetching = false
        // store.app.setPage(page)
        // store.app.title = 'Picks Title'
        // store.app.setTitle('PICKS TITLE')
      })
    }
  }),
  add: new Route({
    path: '/podcasts/add/:id',
    // component: <Void/>,
    onEnter: (route, params, store) => {
      console.log('ADD', store.app.podcast, params.id);
      store.router.goTo(views.home)
    }
  }),
  // userProfile: new Route({
  //   path: '/profile/:username/:tab',
  //   component: <UserProfile/>,
  //   onEnter: () => {
  //     console.log('entering user profile!');
  //   },
  //   beforeExit: () => {
  //     console.log('exiting user profile!');
  //   },
  //   onParamsChange: (route, params) => {
  //     console.log('params changed to', params);
  //   }
  // }),
  // gallery: new Route({
  //   path: '/gallery',
  //   component: <Gallery/>,
  //   beforeExit: () => {
  //     const result = confirm('Are you sure you want to leave the gallery?');
  //     return result;
  //   },
  //   onEnter: (route, params, store, queryParams)=> {
  //     console.log('queryParams', queryParams);
  //   }
  // }),
  // document: new Route({
  //   path: '/document/:id',
  //   component: <Document/>,
  //   beforeEnter: (route, params, store) => {
  //     const userIsLoggedIn = store.app.user;
  //     if (!userIsLoggedIn) {
  //       alert('Only logged in users can enter this route!');
  //       return false;
  //     }
  //   },
  //   onEnter: (route, params) => {
  //     console.log(`entering document with params`, params);
  //   }
  // }),
  // book: new Route({
  //   path: '/book/:id/page/:page',
  //   component: <Book/>,
  //   onEnter: (route, params, store) => {
  //     console.log(`entering book with params`, params);
  //     store.app.setTitle(route.title);
  //   }
  // })
};
export default views;


// const Void = () => {
//
// }
