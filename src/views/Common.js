import React from 'react';
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
    document.title = 'PodcastTime - How Much Time Do Your Podcasts Take To Listen To?'
  } else {
    document.title = `${title} - PodcastTime`
  }
}
