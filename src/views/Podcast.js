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
        { podcast ?
          <div>
            <AddLinks
              store={store}
              id={podcast.id}
              onAddThis={this.onAddThis}
              />
            <Metadata
              {...podcast}
              episodeCount={podcast.episodes_count}
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
  return (
    <div className="ui container">
      <a
        className="ui button primary"
        onClick={onAddThis}
      >
        I listen to this!
      </a>
      <Link
        className="ui button"
        view={views.home}
        store={store}
      >
        Go back to Home
      </Link>
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
    <div className="ui segment clearing">
      {
        thumb ?
        <img
          role="presentation"
          style={{float: 'left'}}
          src={thumb.url}/> :
        <img
          role="presentation"
          style={{float: 'left'}}
          src="/static/images/no-image.png"
          width="300" height="300"/>
      }
      <div style={{marginLeft: 330}}>
        <h2>Title: { name }</h2>
        <h3>
          Number of episodes:{' '}
          <FormattedNumber value={episodeCount} />
        </h3>
        <h3>
          Total amount of content:{' '}
          <FormattedDuration seconds={total_seconds}/>
        </h3>
        <h3>
          Times picked: <FormattedNumber value={times_picked}/>
        </h3>
        <h3>
          Last updated:{' '}
          { last_fetch ?
            <FormattedRelative value={last_fetch}/> :
            <FormattedRelative value={modified}/>
          }
        </h3>
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
