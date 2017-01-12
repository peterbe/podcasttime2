import React, {Component} from 'react';
import {observer,inject} from 'mobx-react';
import {Link} from 'mobx-router';
import views from '../views';
import {
  RippleCentered,
  FormattedDuration,
  ShowServerResponseError,
 } from './Common'
import {
  FormattedRelative,
  FormattedDate,
  FormattedNumber,
} from 'react-intl'
import './Podcast.css'

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
    store.router.goTo(
      views.home_found,
      {ids: ids.join('-')},
      store,
    )
  }

  render() {

    const { store } = this.props
    const {
      podcast,
      isFetching,
      serverResponseError,
     } = store.app

    return (
      <div className="">

        <ShowServerResponseError error={serverResponseError}/>

        { isFetching ? <RippleCentered scale={2}/> : null }
        { podcast && podcast._updating ? <p>Updating right now...</p> : null }
        { podcast && podcast._has_error ? <p>Last update failed.</p> : null }
        { podcast ?
          <div>

            <Metadata
              {...podcast}
              episodeCount={podcast.episodes_count}
              />
            <div id="add-links">
              <AddLinks
                store={store}
                id={podcast.id}
                onAddThis={this.onAddThis}
                />
            </div>
            <div id="episodes">
              <Episodes
                store={store}
                episodes={podcast.episodes}
                />
            </div>

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
      className="btn btn-secondary"
      role="button"
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
        className="btn btn-secondary"
        view={views.home_found}
        params={{ids: ids.join('-')}}
        store={store}
      >
        Back to Home
      </Link>
    )
  }
  return (
    <div className="clearfix container">
      <div className="row justify-content-center">
        <a
          className="btn btn-primary"
          role="button"
          onClick={onAddThis}
        >
          I listen to this!
        </a>
        {' '}
        { homeLink }
      </div>
    </div>
  )
}


const Metadata = ({
  name,
  thumb,
  total_seconds,
  times_picked,
  latest_episode,
  last_fetch,
  modified,
  episodeCount,
}) => {
  return (
    <div className="metadata">
      <div className="item row">
        <div className="image col-4">
        {
          thumb ?
          <img
            className="img-thumbnail"
            role="presentation"
            style={{float: 'left'}}
            src={thumb.url}/> :
          <img
            className="img-thumbnail"
            role="presentation"
            style={{float: 'left'}}
            src="/static/images/no-image.png"
            width="300" height="300"/>
        }
        </div>
        <div className="content col-8">
          <h1>Title: { name }</h1>
          <dl className="row">
            <dt className="col-sm-4">Episodes</dt>
            <dd className="col-sm-8"><FormattedNumber value={episodeCount} /></dd>

            <dt className="col-sm-4">Total amount of content</dt>
            <dd className="col-sm-8"><FormattedDuration seconds={total_seconds}/></dd>

            <dt className="col-sm-4">Times picked</dt>
            <dd className="col-sm-8"><FormattedNumber value={times_picked}/></dd>

            <dt className="col-sm-4">Last updated</dt>
            <dd className="col-sm-8">{ last_fetch ?
              <FormattedRelative value={last_fetch}/> :
              <FormattedRelative value={modified}/>
            }</dd>
            <dt className="col-sm-4">Last episode</dt>
            <dd className="col-sm-8">{ latest_episode ?
              <FormattedRelative value={latest_episode}/> :
              <span>none</span>
            }</dd>
          </dl>
        </div>
      </div>
    </div>
  )
}

const Episodes = ({ episodes }) => {
  return (
    <table className="table table-sm">
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
