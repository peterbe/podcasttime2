import React, {Component} from 'react'
import { observer, inject } from 'mobx-react';
import {Link} from 'mobx-router';
import { FormattedRelative, FormattedPlural } from 'react-intl'
import views from '../views'


class MyPicks extends Component {

  loadList = (event, group) => {
    event.preventDefault()
    sessionStorage.setItem('picks', group.key)
    const { store } = this.props
    const ids = group.podcasts.map(p => p.id)
    store.router.goTo(
      views.home_found,
      {ids: ids.join('-')},
      store,
    )
  }

  removeList = (event, group) => {
    event.preventDefault()
    if (sessionStorage.getItem('picks') === group.key) {
      sessionStorage.removeItem('picks')
    }
    const { store } = this.props
    const newPersistentPicks = store.app.persistentPicks.filter(g => {
      return g.key !== group.key
    })
    store.app.persistentPicks = newPersistentPicks
    // need to do the same to the localStorage
    let persistence = JSON.parse(
      localStorage.getItem('picks') || '{}'
    )
    let keys = []
    if (persistence) {
      keys = Object.keys(persistence)
    }
    keys = keys.filter(k => k !== group.key)
    let newPersistence = {}
    keys.forEach(key => {
      newPersistence[key] = persistence[key]
    })
    localStorage.setItem('picks', JSON.stringify(newPersistence))
    store.router.goTo(
      views.my_picks,
      {},
      store,
    )
  }

  render() {
    const { store } = this.props
    const picksList = store.app.persistentPicks

    return (
      <div className="">
        <h2 className="">My Picks</h2>
        <h4>Groups of Podcasts you have previously selected</h4>
        {
          !picksList.length ?
          <p style={{marginTop: 50, textAlign: 'center'}}><i>You have none</i></p>
          : null
        }
        <div>
          {
            picksList.map((group, i) => {
              return <Picks
                store={store}
                key={i}
                group={group}
                removeList={this.removeList}
                loadList={this.loadList}
              />
            })
          }
        </div>
      </div>
    )
  }
}
export default inject('store',)(observer(MyPicks))


const Picks = ({ group, store, removeList, loadList }) => {
  return (
    <div
      className=""
      style={{border: '1px solid #555', margin: 15, padding: 10}}>
      <h2>
        { group.podcasts.length }
        {' '}
        <FormattedPlural
          value={group.podcasts.length}
          one="Podcast"
          other="Podcasts"
          />
      </h2>
      <div>
        {
          group.podcasts.map(podcast => {
            return <Podcast
              store={store}
              key={podcast.id}
              podcast={podcast}/>
          })
        }
      </div>
      <p>
        <FormattedRelative value={group.date}/>
        <br/>
        <button
          type="button"
          onClick={e => loadList(e, group)}
          className="btn btn-primary">Load this list</button>
        {' '}
        <button
          type="button"
          onClick={e => removeList(e, group)}
          className="btn btn-danger">Remove list</button>
      </p>
    </div>
  )
}

const Podcast = ({podcast, store}) => {
  return (
    <figure
      className="figure"
      style={{marginRight: 4}}
      title={podcast.name}>
      <Link
        view={views.podcast}
        store={store}
        params={{id: podcast.id, slug: podcast.slug}}>
        <img
          className="figure-img img-fluid rounded"
          src={podcast.thumbnail_160 ? podcast.thumbnail_160 : '/static/podcasttime/images/no-image.png'}
          alt=""
          style={{width: 100}}/>
      </Link>
    </figure>
  )
}
