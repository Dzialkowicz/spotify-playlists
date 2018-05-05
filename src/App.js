import React, { Component } from 'react';
import 'reset-css/reset.css';
import './App.css';
import queryString from 'query-string'

let someColor = '#ff0000';
let defaultStyle = {
  color: someColor,
  'font-family': 'Papyrus'
};

let counterStyle = { ...defaultStyle,
  width: "40%",
      display: "inline-block",
      'margin-bottom':'10px',
      'font-size': '24px',
      'line-height': '30px'
}

class PlaylistCounter extends Component{
  render(){
    let playlistCounterStyle= counterStyle
    return(
      <div style={playlistCounterStyle}>
        <h2>{this.props.playlists.length} plejlisty</h2>
      </div>
    );
  }
}

class HoursCounter extends Component{
  render(){
    //[] is a default of what we render (second argument)
    let allSongs = this.props.playlists.reduce((songs, eachPlaylist) =>{
      return songs.concat(eachPlaylist.songs)
    }, [])
    let totalDuration = allSongs.reduce((sum, eachSong) =>{
      return Math.round((sum + eachSong.duration)/60)
    }, [])
    let isTooLow = totalDuration < 5
    let hoursCounterStyle = {...counterStyle,
        color: isTooLow ? 'red' : 'white',
        'font-weight': isTooLow ? 'bold' : 'normal'}
    return(
      <div style={hoursCounterStyle}>
        <h2>{totalDuration} godzinek</h2>
      </div>
    );
  }
}
//Filter usually should be done on the server side
class Filter extends Component{
  render(){
    return(
      <div>
        <img/>
        <input type="text" onKeyUp={event =>
          this.props.onTextChange(event.target.value)}
          style={{...defaultStyle,
            padding: '10px',
            'font-size': '20px',
            color: 'black'
          }}/>
      </div>
    );
  }
}

class Playlist extends Component{
  render(){
    let playlist = this.props.playlist;
    return(
      <div style ={{...defaultStyle,
        width : '25%',
        display: 'inline-block',
        padding: '10px',
        'background-color': this.props.index %2 ? 'pink' : 'green'
      }}>
        <img src={playlist.imageUrl} style={{width: '60px'}}/>
        <h3>{playlist.name}</h3>
          <ul style={{'margin-top': '10px'}}>
            {playlist.songs.map( song =>
            <li style={{'padding-top' : '2px',
                        'font-weight': 'bold'}}>
            {song.name}</li>
            )}
          </ul>
      </div>
    );
  }
}

class App extends Component {
  constructor(){
    super();
    //serverData state needs to be created in constructor
    this.state = {
      serverData: {},
      filterString: '' }
  }
  componentDidMount(){
   let parsed = queryString.parse(window.location.search)
   console.log(parsed)
   let accessToken = parsed.access_token;

   if(!accessToken)
    return;
   //Fetch first arg is endpoint
  fetch('https://api.spotify.com/v1/me', {
    headers: {'Authorization': 'Bearer ' + accessToken}
  }).then(response => response.json())
  .then(data => this.setState({
      user: {
        name: data.display_name}
    }))

 fetch('https://api.spotify.com/v1/me/playlists', {
   headers: {'Authorization': 'Bearer ' + accessToken}
 }).then(response => response.json())
 .then(playlistData => {
  let playlists = playlistData.items
  let trackDataPromises = playlists.map(playlist => {
      let responsePromise = fetch(playlist.tracks.href, {
          headers: {'Authorization': 'Bearer ' + accessToken}
        })
      let trackDataPromise = responsePromise
      .then(response => response.json())
        return trackDataPromise
    })
    let allTracksDataPromises = Promise.all(trackDataPromises)
    let playlistsPromise = allTracksDataPromises
      .then(trackDatas =>{
        trackDatas.forEach((trackData, i) => {
          playlists[i].trackDatas = trackData.items
            .map(item => item.track)
            .map(trackData => ({
              name: trackData.name,
              duration: trackData.duration_ms / 1000
            }))
        })
        return playlists
      })
      return playlistsPromise
 })
 .then(playlists => this.setState({
       playlists: playlists.map(item => {
         return{
          name: item.name,
          imageUrl: item.images[0].url,
          songs: item.trackDatas.slice(0,3)
         }
       })
  }))

  }
  render() {
    let playlistsToRender = this.state.user && 
    this.state.playlists ?
      this.state.playlists
      .filter(playlist => {
        let matchesPlaylist = playlist.name
          .toLowerCase()
          .includes(this.state.filterString.toLowerCase())
        let matchesSong = playlist.songs
          .find(song => song.name
          .toLowerCase()
          .includes(this.state.filterString.toLowerCase()))
        return matchesPlaylist || matchesSong
      })
           : [];
    return (
      <div className="App">
      {this.state.user ? //If the data will be fetched, display whole site
      <div>
      <h1
      style={{...defaultStyle,
              'font-size': '54px',
              'margin-top' : '5px',
            }}>
      {//if we have the user, it will get the user name
      this.state.user.name
      }'s plejlisty</h1>
      
      <PlaylistCounter //if we have the user, it will get the user playlists
        playlists={playlistsToRender}/>
      {<HoursCounter //if we have the user, it will get the user playlists
      playlists={playlistsToRender}/>}
      <Filter onTextChange={text => this.setState({filterString: text})}/>
      {//map - it does for each, but with rendering a new object based on transformation we've specified
        playlistsToRender.map((playlist, i) =>
          <Playlist playlist={playlist} index = {i}/>
        )} 
      </div> : <button onClick={()=> {
        window.location = window.location.href.includes('localhost') ?
         'http://localhost:8888/login' :
          'https://spotify-playlists-backend.herokuapp.com/login' }
        }
       style={{padding: '20px', 'fontSize':'50px', 'marginTop' : '20px'}}>Sign to Spotify</button> //Display Loading if data is not fetched yet
      }
      </div>
    );
  }
}

export default App;
