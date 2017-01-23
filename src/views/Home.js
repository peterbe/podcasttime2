import React, {Component} from 'react';
import { observer, inject } from 'mobx-react';
import views from '../views';
import { FormattedNumber, FormattedRelative } from 'react-intl'
import './Home.css'
import magnify from './magnify.svg'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import loadJS from 'loadjs'
import { ShowServerResponseError, InterceptableLink } from './Common'


class Home extends Component {

  constructor(props) {
    super(props)
    this.onSubmit = this.onSubmit.bind(this)
    this.onChangeSearch = this.onChangeSearch.bind(this)
    this.onPickPodcast = this.onPickPodcast.bind(this)
    this.onRemovePodcast = this.onRemovePodcast.bind(this)
    this.onRemoveAll = this.onRemoveAll.bind(this)
    this.onKeyDownSearch = this.onKeyDownSearch.bind(this)
  }

  onSubmit(event) {
    event.preventDefault()
    let search = this.props.store.app.search
    this.props.store.router.goTo(
      views.home,
      {},
      this.props.store,
      {search: search}
    )
  }

  /* This gets called in the following three scenarios:
     1) The user clicks the "Remove all" button
     2) The user clicks the "Remove" button on the last pick she has left
     3) You exist (go to the home page) and come back to a clean page
  */
  resetPickedPicks() {
    sessionStorage.removeItem('picks')
  }

  updatePickedPicks() {
    const { store } = this.props
    const ids = store.app.picked.map(p => p.id)

    // If you've never done a pick before, this is going to be null.
    let picks = sessionStorage.getItem('picks')

    const formData = new FormData()
    formData.append('ids', ids)
    if (picks) {
      formData.append('picks', picks)
    }
    fetch(`/api/podcasttime/picked`, {
      method: 'POST',
      body: formData
    })
    .then(r => {
      if (r.status !== 200) {
        store.app.serverResponseError = r
      } else {
        return r.json()
      }
    })
    .then(response => {
      if (response) {
        sessionStorage.setItem('picks', response.session_key)
        let persistence = JSON.parse(
          localStorage.getItem('picks') || '{}'
        )
        persistence[response.session_key] = {
          date: new Date(),
          podcasts: store.app.picked.map(p => {
            return {
              id: p.id,
              name: p.name,
              slug: p.slug,
              thumbnail_160: p.thumbnail_160,
            }
          })
        }
        localStorage.setItem('picks', JSON.stringify(persistence))
      }
    })
  }

  onRemovePodcast(event, podcast) {
    event.preventDefault()
    let podcasts = this.props.store.app.picked.filter(p => {
      return p.id !== podcast.id
    })
    this.props.store.app.picked = podcasts
    let ids = podcasts.map(p => p.id)
    if (ids.length) {
      // some left
      this.updatePickedPicks()
      this.props.store.router.goTo(
        views.home_found,
        {ids: ids.join('-')},
        this.props.store,
      )
    } else {
      // all removed
      this.resetPickedPicks()
      this.props.store.router.goTo(
        views.home,
        {},
        this.props.store,
      )
    }
  }

  onRemoveAll(event) {
    event.preventDefault()
    this.props.store.app.picked = []
    this.props.store.app.pickedStats = null
    this.props.store.app.pickedStatsEpisodes = null
    this.resetPickedPicks()
    this.props.store.router.goTo(
      views.home,
      {},
      this.props.store,
    )
  }

  onChangeSearch(event) {
    let { store } = this.props
    const search = event.target.value
    store.app.search = search
    if (!search.trim()) {
      // this hides the autocomplete
      store.app.searchResults = null
      store.app.searchHighlight = -1
    } else {
      if (this._findDebounce) {
        clearTimeout(this._findDebounce)
      }
      this._findDebounce = setTimeout(() => {
        let url = `/api/podcasttime/find?q=${search}`
        store.app.isSearching = true
        fetch(url, {
          credentials: 'include',  // XXX WHY DO I HAVE THIS?
        })
        .then(r => {
          if (r.status !== 200) {
            store.app.serverResponseError = r
            store.app.isSearching = false
          } else {
            return r.json()
          }
        })
        .then(results => {
          if (results) {
            store.app.isSearching = false
            // perhaps the user has quickly changed their mind
            if (store.app.search) {
              if (store.app.search === results.q) {
                const ids = store.app.picked.map(p => p.id)
                store.app.searchResults = results.items.filter(item => {
                  return !ids.includes(item.id)
                })
                store.app.searchResultsTotal = results.total
              }
              this._lookforPendingResults(results)
            } else if (store.app.searchResults && store.app.searchResults.length) {
              store.app.searchResults = null
              store.app.searchResultsTotal = null
              store.app.searchHighlight = -1
            }
          }
        })
      }, 200)
    }
  }

  _lookforPendingResults(results) {
    if (!results.items.length) {
      return
    }
    const { store } = this.props
    let allPending = store.app.pendingPodcasts
    let allPendingIds = allPending.map(p => p.id)
    let newPending = false
    results.items.forEach(item => {
      if (!item.last_fetch && !allPendingIds.includes(item.id)) {
        allPendingIds.push(item.id)
        allPending.push(item)
        store.app.pendingPodcasts = allPending
        newPending = true
      }
    })
    if (newPending) {
      this._startPendingRefresh()
    }
  }

  _startPendingRefresh(times = 0) {
    let { store } = this.props
    let allPending = store.app.pendingPodcasts
    let allPendingIds = allPending.map(p => p.id)
    if (!allPendingIds.length) {
      return
    }
    let ids = allPendingIds.join(',')
    let url = `/api/podcasttime/find?ids=${ids}`
    fetch(url)
    .then(r => {
      if (r.status !== 200) {
        store.app.serverResponseError = r
      } else {
        return r.json()
      }
    })
    .then(results => {
      if (!results) {
        return
      }
      results.items.forEach(item => {
        if (item.last_fetch) {
          store.app.pendingPodcasts = store.app.pendingPodcasts.filter(p => {
            return p.id !== item.id
          })
          let matches = 0
          if (store.app.searchResults) {
            store.app.searchResults = store.app.searchResults.map(result => {
              if (result.id === item.id) {
                matches++
                return item
              } else {
                return result
              }
            })
          }
          store.app.picked = store.app.picked.map(picked => {
            if (picked.id === item.id) {
              return item
            } else {
              return picked
            }
          })
          if (matches) {
            // at least one was updated!
            // Refresh the fetch thing
            if (store.app.picked.length) {
              const ids = store.app.picked.map(p => p.id)
              let url = `/api/podcasttime/stats?ids=${ids}`
              fetch(url)
              .then(r => r.json())
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
          }
        }
      })
    })
    if (times <= 20) {
      setTimeout(() => {
        this._startPendingRefresh(times + 1)
      }, 1000 + times * 200)
    }
  }

  onKeyDownSearch(event) {
    const { store } = this.props
    let suggestions = store.app.searchResults
    let highlight = store.app.searchHighlight
    if (
      (event.key === 'ArrowDown' || event.key === 'Tab') &&
      highlight < suggestions.length
    ) {
      event.preventDefault()
      store.app.searchHighlight++
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      if (highlight > 0) {
        store.app.searchHighlight--
      }
    } else if (event.key === 'Enter') {
      event.preventDefault()
      if (highlight > -1) {
        this.onPickPodcast(event, suggestions[highlight])
      } else if (store.app.search) {
        if (this._findDebounce) {
          clearTimeout(this._findDebounce)
        }
        // nothing could be autocompleted, the form tried to submit
        let url = `/api/podcasttime/find?q=${store.app.search}&submitted=true`
        store.app.isSearching = true
        fetch(url)
        .then(r => {
          if (r.status !== 200) {
            store.app.serverResponseError = r
            store.app.isSearching = false
          } else {
            return r.json()
          }
        })
        .then(results => {
          if (results) {
            store.app.isSearching = false
            if (store.app.search) {
              const ids = store.app.picked.map(p => p.id)
              store.app.searchResults = results.items.filter(item => {
                return !ids.includes(item.id)
              })
              store.app.searchResultsTotal = results.total

              this._lookforPendingResults(results)

            } else if (store.app.searchResults && store.app.searchResults.length) {
              store.app.searchResults = null
              store.app.searchHighlight = -1
            }
          }
        })
      }
    }
  }

  onPickPodcast(event, podcast) {
    const { store } = this.props
    event.preventDefault()
    if (!store.app.picked.length) {
      sessionStorage.removeItem('picks')
    }
    store.app.picked.push(podcast)
    let ids = store.app.picked.map(p => p.id).sort()
    store.app.searchResults = []
    store.app.searchResultsTotal = null
    store.app.search = ''
    store.app.searchHighlight = -1

    this.updatePickedPicks()
    store.router.goTo(
      views.home_found,
      {ids: ids.join('-')},
      store,
    )
  }

  render() {

    const { store } = this.props;
    const {
      search,
      isSearching,
      searchResults,
      searchResultsTotal,
      searchHighlight,
      picked,
      pickedStats,
      pickedStatsEpisodes,
      serverResponseError,
    } = store.app

    let style = {}
    let podcasts = null
    if (picked.length) {
      podcasts = <PickedPodcasts
        podcasts={picked}
        store={store}
        onRemovePodcast={this.onRemovePodcast}
        onRemoveAll={this.onRemoveAll}
      />
    } else {
      // When you haven't picked any add a margin over the search form
      style.marginTop = 100
    }

    return (
      <div style={style}>
        <h5>Search for the podcasts <i>you</i> listen to</h5>

        <form className="" onSubmit={this.onSubmit}
          style={{marginBottom: 30}}
          >
          <ReactCSSTransitionGroup
            transitionName="fadein"
            transitionAppear={true}
            transitionAppearTimeout={600}
            transitionEnter={false}
            transitionLeave={false}>
            <div className="ac-wrapper">
              <input
                type="search"
                ref="q"
                value={search}
                name="search"
                className="form-control form-control-lg"
                placeholder="Search..."
                onKeyDown={this.onKeyDownSearch}
                onChange={this.onChangeSearch}
              />
              <ShowSearchResultsTotal
                isSearching={isSearching}
                total={searchResultsTotal}
              />
              <ShowAutocomplete
                search={search}
                isSearching={isSearching}
                onPickPodcast={this.onPickPodcast}
                highlight={searchHighlight}
                results={searchResults}
              />
            </div>
          </ReactCSSTransitionGroup>
          <ShowServerResponseError error={serverResponseError}/>
          { podcasts }
          { pickedStats ?
            <PodcastStats
              stats={pickedStats}
            /> : null }
          { pickedStatsEpisodes ?
            <BubblePlot
              episodes={pickedStatsEpisodes}
            /> : null }
        </form>

      </div>
    );
  }
}

export default inject('store',)(observer(Home))


const ShowSearchResultsTotal = ({ total, isSearching }) => {
  if (total === null && !isSearching) {
    return null
  }
  let className = 'badge badge-pill badge-primary'
  let text = 'searching...'
  if (total !== null) {
    if (total === 1) {
      text = '1 found!'
    } else if (total === 0) {
      text = '0 found :('
    } else {
      text = (
        <span>
          <FormattedNumber value={total}/> found
        </span>
      )
    }
    if (total === 0) {
      className = 'badge badge-pill badge-danger'
    } else if (total > 10 && total < 100) {
      className = 'badge badge-pill badge-info'
    } else if (total < 10) {
      className = 'badge badge-pill badge-success'
    }
  }

  return (
    <span
      className={className}
      style={{position: 'absolute', right: 10, top: 17}}
      >
      { text }
    </span>
  )
}

const PodcastStats = ({ stats }) => {
  return (
    <div className="statsxxx clearfix">
      <StatsUnit hours={stats.per_day} unit="per day"/>
      <StatsUnit hours={stats.per_week} unit="per week"/>
      <StatsUnit hours={stats.per_month} unit="per month"/>
    </div>
  )
}


class BubblePlot extends Component {

  shouldComponentUpdate(nextProps, nextState) {
    return this.props.episodes !== nextProps.episodes
  }

  render() {

    const containerWidth = document.querySelector('.container').clientWidth
    const { episodes } = this.props
    loadJS(['https://cdn.plot.ly/plotly-latest.min.js'], {
      success: () => {
        let data = []
        episodes.forEach(group => {
          if (group.episodes.length) {
            data.push({
              name: group.name,
              x: group.episodes.map(e => e.date),
              y: group.episodes.map(e => (e.duration / 60).toFixed(0)),
              mode: 'lines+markers',
              marker: {
                size: 12
              }
            })
          }
        })

        var layout = {
          title: 'Your Podcasts Time Plot',
          showlegend: true,
          legend: {"orientation": "h"},
          height: 600,
          width: containerWidth,
          xaxis: {
            title: 'Time',
            showgrid: false,
            zeroline: false
          },
          yaxis: {
            title: 'Minutes of content',
            showline: false
          }
        };
        window.Plotly.newPlot('plotly', data, layout);
      }
    })

    return (
      <div className="stats">
        <div
          id="plotly"
          style={{width: this.containerWidth, height: 600, textAlign: 'center'}}></div>
      </div>
    )
  }

}

const StatsUnit = ({ hours, unit }) => {
  let minutes = false
  if (hours <= 2) {
    minutes = true
    hours *= 60
  }
  let value = hours.toFixed(1)

//   <h3>
//   Fancy display heading
//   <small class="text-muted">With faded secondary text</small>
// </h3>
  // return (
  //   <div className="ui statistic">
  //     <div className="value">{value}</div>
  //     <div className="label">
  //       {
  //         minutes ?
  //         <i className="minutes">minutes</i> :
  //         <i className="hours">hours</i>
  //       }
  //       {' '}
  //       {unit}
  //     </div>
  //   </div>
  // )
  return (
    <div className="statistic-unit">
      <h1 className="display-3">{value}</h1>
      <p>
        {
          minutes ?
          <i className="minutes">minutes</i> :
          <i className="hours">hours</i>
        }
        {' '}
        {unit}
      </p>
    </div>
  )
  // return (
  //   <h2 className="display-3">
  //     {value}
  //     <br/>
  //     <small className="text-muted">
  //       {
  //         minutes ?
  //         <i className="minutes">minutes</i> :
  //         <i className="hours">hours</i>
  //       }
  //       {' '}
  //       {unit}
  //     </small>
  //   </h2>
  // )
}

const ShowAutocomplete = ({
  results,
  highlight,
  onPickPodcast,
  isSearching,
  search,
}) => {

  if (!results || !results.length) {
    if (isSearching) {
      return (
        <div className="ac-results">
          <div className="searching">
            <div className="image">
              <img src={magnify} alt="searching" />
            </div>
            <p>
              Searching for '{search}'...
            </p>
          </div>
        </div>
      )
    }
    return null
  }
  return (
    <div className="ac-results">
      {
        results.map((result, i) => {
          return <AutocompleteResult
            result={result}
            onPickPodcast={onPickPodcast}
            key={result.id}
            active={i === highlight}
          />
        })
      }
    </div>
  )
}


const AutocompleteResult = ({
  result,
  active,
  onPickPodcast,
}) => {
  let image = null
  if (result.thumbnail_160) {
    image = <img src={result.thumbnail_160} alt={result.name}/>
  }
  let className = 'ac-result clearfix'
  if (active) {
    className += ' active'
  }
  return (
    <ReactCSSTransitionGroup
          transitionName="fadein"
          transitionAppear={true}
          transitionAppearTimeout={400}
          transitionEnter={false}
          transitionLeave={false}>
      <div
        className={className}
        onClick={e => onPickPodcast(e, result)}>
        <div className="image">
          { image }
        </div>
        <p style={{marginLeft: 75}}>
          <b>{ result.name }</b><br/>
          {
            result.last_fetch ?
            <span>
              {
                result.episodes_count ?
                <FormattedNumber value={result.episodes_count}/> :
                '??'
              } episodes,
              {' '}
              about
              {' '}
              {
                result.total_hours !== null ?
                <FormattedTime hours={result.total_hours}/> :
                <em>currently unknown</em>
              }.
            </span>
            : <span>?? episodes</span>
          }
          <br/>
          <ShowLatestEpisode value={result.latest_episode}/>
        </p>
      </div>
    </ReactCSSTransitionGroup>

  )
}

const ShowLatestEpisode = ({ value }) => {
  if (!value) {
    return null
  }
  return (
    <span>
      Last episode: <FormattedRelative value={value}/>
    </span>
  )
}

const FormattedTime = ({ hours }) => {
  hours = hours || 0
  return <span><FormattedNumber value={hours.toFixed(0)}/> hours</span>
}


const PickedPodcasts = ({
  podcasts,
  store,
  onRemovePodcast,
  onRemoveAll,
}) => {
  let style = {};
  if (podcasts.length) {
    style.display = 'block';
  }
  return (
    <div className="selected clearfix" style={style}>
      <h3><i>Your</i> Podcasts...</h3>
      <div className="your-podcasts">
        {
          podcasts.map((podcast) => {
            return <Podcast
              key={podcast.id}
              store={store}
              podcast={podcast}
              onRemovePodcast={onRemovePodcast}
            />
          })
        }
      </div>
      <div className="remove-all">
        <button
          type="button"
          className="btn btn-secondary remove-all"
          title="And start over..."
          onClick={onRemoveAll}
        >Remove All</button>
      </div>
    </div>
  )
}


const Podcast = ({ podcast, onRemovePodcast, store }) => {
  let text = <p>?? episodes</p>
  if (podcast.last_fetch && podcast.episodes_count !== null) {
    text = (
      <p>
        <FormattedNumber value={podcast.episodes_count}/> episodes,
        {' '}
        about <FormattedTime hours={podcast.total_hours}/>.<br/>
        <ShowLatestEpisode value={podcast.latest_episode}/>
      </p>
    )
  }
  let imageURL = podcast.thumbnail_160
  if (!imageURL) {
    imageURL = '/static/images/no-image.png'
  }

  return (
    <ReactCSSTransitionGroup
          transitionName="fadein"
          transitionAppear={true}
          transitionAppearTimeout={500}
          transitionEnterTimeout={50}
          transitionLeaveTimeout={30}>
      <div className="clearfix podcast">
        <div className="actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={e => onRemovePodcast(e, podcast)}
            >Remove</button>
        </div>
        <div className="img">
          <InterceptableLink
            view={views.podcast}
            params={{id: podcast.id, slug: podcast.slug}}
            store={store}
            onClick={e => {
              store.app.podcast = podcast
            }}
          >
            <img src={imageURL} role="presentation" className="rounded"/>
          </InterceptableLink>
        </div>
        <div className="meta">
          <h5>
            <InterceptableLink
              title={podcast.name}
              view={views.podcast}
              params={{id: podcast.id, slug: podcast.slug}}
              store={store}
              onClick={e => {
                store.app.podcast = podcast
              }}
            >
              {podcast.name}
            </InterceptableLink>
          </h5>
          { text }
        </div>
      </div>
    </ReactCSSTransitionGroup>
  )
}
