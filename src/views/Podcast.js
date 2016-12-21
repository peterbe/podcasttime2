import React, {Component} from 'react';
import {observer,inject} from 'mobx-react';
import {Link} from 'mobx-router';
import views from '../views';
import {
  RippleCentered,
  FormattedDuration,
 } from './Common'
import {
  FormattedRelative,
  FormattedDate,
  FormattedNumber,
} from 'react-intl'


class Podcast extends Component {
  constructor(props) {
    super(props)
    this.onAddThis = this.onAddThis.bind(this)
  }

  onAddThis(event) {
    event.preventDefault()
    const { store } = this.props
    let ids = store.app.picked.map(p => p.id)
    if (!ids.includes(store.app.podcast.id)) {
      ids.push(store.app.podcast.id)
    }
    ids = ids.sort()
    store.router.goTo(
      views.home_found,
      {ids: ids.join('-')},
      store,
    )
  }

  render() {

    const { store } = this.props;
    const { podcast, isFetching } = store.app

    return (
      <div className="ui container">

        { isFetching ? <RippleCentered scale={2}/> : null }
        { podcast && podcast._updating ? <p>Updating right now...</p> : null }
        { podcast && podcast._has_error ? <p>Last update failed.</p> : null }
        { podcast ?
          <div>

            <Metadata
              {...podcast}
              episodeCount={podcast.episodes_count}
              />
              <AddLinks
                store={store}
                id={podcast.id}
                onAddThis={this.onAddThis}
                />
            <Episodes
              store={store}
              episodes={podcast.episodes}
              />
          </div>
          : null
        }
      </div>
    )
  }
}

export default inject('store',)(observer(Podcast))


const AddLinks = ({ id, store, onAddThis }) => {
  let homeLink = (
    <Link
      className="ui button"
      view={views.home}
      store={store}
    >
      Back to Home
    </Link>
  )
  if (store.app.picked.length) {
    let ids = store.app.picked.map(p => p.id)
    homeLink = (
      <Link
        className="ui button"
        view={views.home_found}
        params={{ids: ids.join('-')}}
        store={store}
      >
        Back to Home
      </Link>
    )
  }
  return (
    <div className="ui container">
      <a
        className="ui button primary"
        onClick={onAddThis}
      >
        I listen to this!
      </a>
      { homeLink }
    </div>
  )
}


const Metadata = ({
  name,
  thumb,
  total_seconds,
  times_picked,
  last_fetch,
  modified,
  episodeCount,
}) => {
  return (
    <div className="ui items centered">
      <div className="item">
        <div className="image">
        {
          thumb ?
          <img
            className="ui medium rounded image"
            role="presentation"
            style={{float: 'left'}}
            src={thumb.url}/> :
          <img
            role="presentation"
            style={{float: 'left'}}
            src="/static/images/no-image.png"
            width="300" height="300"/>
        }
        </div>
        <div className="content">
          <h1 className="ui header">Title: { name }</h1>
          <div className="ui list">
            <div className="item">
              <div className="header"><FormattedNumber value={episodeCount} /></div>
              Episodes
            </div>
            <div className="item">
              <div className="header"><FormattedDuration seconds={total_seconds}/></div>
              Total amount of content
            </div>
            <div className="item">
              <div className="header"><FormattedNumber value={times_picked}/></div>
              Times picked
            </div>
            <div className="item">
              <div className="header">
                { last_fetch ?
                  <FormattedRelative value={last_fetch}/> :
                  <FormattedRelative value={modified}/>
                }
              </div>
              Since last update
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const Episodes = ({ episodes }) => {
  return (
    <table className="ui celled table">
      <thead>
        <tr>
          <th>Published</th>
          <th>Duration</th>
        </tr>
      </thead>
      <tbody>
        {
          episodes.map(episode => {
            return <EpisodeRow key={episode.guid} episode={episode}/>
          })
        }
      </tbody>
    </table>
  )
}

const EpisodeRow = ({ episode }) => {
  return (
    <tr>
      <td>
        <FormattedDate value={episode.published}/>{' '}
        <small>
          (<FormattedRelative value={episode.published} />)
        </small>
      </td>
      <td>
        <FormattedDuration seconds={episode.duration} />
      </td>
    </tr>
  )
}
