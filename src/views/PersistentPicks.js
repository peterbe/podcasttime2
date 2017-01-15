import React, {Component} from 'react'
import { observer, inject } from 'mobx-react';
import {Link} from 'mobx-router';
// import { FormattedRelative, FormattedPlural } from 'react-intl'
import views from '../views'


class PersistentPicks extends Component {

  componentDidMount() {
    const picks = JSON.parse(
      localStorage.getItem('picks'), '{}'
    )
    const { store } = this.props
    // console.log("STORE", store);
    let picksList = []
    // console.log('PICKS', picks);

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

  render() {
    const { store } = this.props
    const picksList = store.app.persistentPicks
    if (!picksList.length) {
      return null
    }

    return (
      <div id="persistent">
        <h5
          title="Your previous picks"
          >
          <Link
            className="badge badge-pill badge-danger"
            view={views.my_picks}
            store={store}
          >
            {picksList.length}
          </Link>
        </h5>
      </div>
    )
  }
}
export default inject('store',)(observer(PersistentPicks))
