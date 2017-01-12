import React from 'react';
import {Link} from 'mobx-router';
import './ripple.css'


export const Ripple = ({ scale = '2' }) => {
  // Generated on http://loading.io/
  return (
    <div className="uil-ripple-css" style={{transform:'scale(' + scale + ')', textAlign:'center'}}><div></div><div></div></div>
  )
}

export const RippleCentered = ({ scale = 2, margin = 100}) => {
  return (
    <div className="ui centered grid" style={{margin:margin}}>
      <Ripple scale={scale}/>
    </div>
  )
}


function millisecondsToStr (milliseconds) {
  // TIP: to find current time in milliseconds, use:
  // var  current_time_milliseconds = new Date().getTime();

  function numberEnding (number) {
      return (number === 1) ? '' : 's';
  }

  var temp = Math.floor(milliseconds / 1000);
  var years = Math.floor(temp / 31536000);
  if (years) {
      return years + ' year' + numberEnding(years);
  }
  //TODO: Months! Maybe weeks?
  var days = Math.floor((temp %= 31536000) / 86400);
  if (days) {
      return days + ' day' + numberEnding(days);
  }
  var hours = Math.floor((temp %= 86400) / 3600);
  if (hours) {
      return hours + ' hour' + numberEnding(hours);
  }
  var minutes = Math.floor((temp %= 3600) / 60);
  if (minutes) {
      return minutes + ' minute' + numberEnding(minutes);
  }
  var seconds = temp % 60;
  if (seconds) {
      return seconds + ' second' + numberEnding(seconds);
  }
  if (milliseconds) {
      seconds = milliseconds / 1000;
      return seconds + ' second' + numberEnding(seconds);
  }
  return 'less than a second'; //'just now' //or other string you like;
}

export const FormattedDuration = ({ seconds }) => {
  return <span>{ millisecondsToStr(seconds * 1000) }</span>
}

export function equalArrays(arr1, arr2) {
  return (
    arr1.length === arr2.length &&
    arr1.every((x, i) => arr2[i] === x)
  )
}


export function updateDocumentTitle(title) {
  if (!title) {
    document.title = 'Podcast Time - How Much Time Do Your Podcasts Take To Listen To?'
  } else {
    document.title = `${title} - Podcast Time`
  }
}


export const Pagination = ({
  pagination,
  view,
  search = null,
  store,
}) => {

  const prev = (page) => {
    return `← Page ${page}`
  }

  const next = (page) => {
    return `Page ${page} →`
  }

  const current = (number, pages) => {
    return `Page ${number} of ${pages}`
  }

  let nextLink = null
  let queryParams = {}
  if (search) {
    queryParams.search = search
  }
  if (pagination.has_next) {
    nextLink = (
      <li className="page-item">
        <Link
          className="page-link"
          view={view}
          params={{page: pagination.next_page_number}}
          queryParams={queryParams}
          store={store}
        >
          {next(pagination.next_page_number)}
        </Link>
      </li>
    )
  } else {
    nextLink = (
      <li className="page-item disabled">
        <a className="page-link" href="#" tabIndex={-1}>Page{' '}{pagination.num_pages}</a>
      </li>
    )
  }

  let prevLink = null
  if (pagination.has_previous) {
    // let prevURL = '/podcasts'
    // if (search) {
    //   prevURL += '/' + search
    // }
    prevLink = (
      <li className="page-item">
        <Link
          className="page-link"
          view={view}
          params={{page: pagination.previous_page_number}}
          queryParams={queryParams}
          store={store}
        >
          {prev(pagination.previous_page_number)}
        </Link>
      </li>
    )
  } else {
    prevLink = (
      <li className="page-item disabled">
        <a className="page-link" href="#" tabIndex={-1}>Page 1</a>
      </li>
    )
  }

  return (
    <nav aria-label="Pagination">
      <ul className="pagination justify-content-center pagination-lg">
        { prevLink }
        <li className="page-item disabled">
          <a className="page-link" href="#">{current(pagination.number, pagination.num_pages)}</a>
        </li>
        { nextLink }
      </ul>
    </nav>
  )
}


export const ShowServerResponseError = ({ error }) => {
  if (!error) {
    return null
  }
  return (
    <div className="alert alert-danger" role="alert">
      <h2 className="alert-heading">Server Response Error :(</h2>
      <h5>
        Sadly, an error happened <b>trying to talk to the server</b>.
      </h5>
      <p>
        Hopefully, simply refreshing the page might solve it.
      </p>
      <dl className="row">
        <dt className="col-sm-3">URL</dt>
        <dd className="col-sm-9"><code>{error.url}</code></dd>
        <dt className="col-sm-3">Status Code</dt>
        <dd className="col-sm-9"><code>{error.status}</code></dd>
        <dt className="col-sm-3">Status Text</dt>
        <dd className="col-sm-9"><code>{error.statusText}</code></dd>
      </dl>
    </div>
  )
}
