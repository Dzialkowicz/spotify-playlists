import React, { Component } from 'react';
import './App.css';
import queryString from 'query-string'

let someColor = '#ff0000';
let defaultStyle = {
  color: someColor
};
let fakeServerData = {
  user: {
    name: 'Juba',
    playlists: [
      {
        name: 'My Favourites',
        songs: [{name: 'Parostatkiem',duration: 1234},
                {name: 'Biala Armia',duration: 1355},
                {name: 'Zycie',duration: 4644}]
      },
      {
        name: 'My mums best songs',
        songs: [{name: 'Taka', duration: 1211}, 
                {name: 'Szalona Piesn', duration: 1111}, 
                {name: 'Beat it', duration: 1122}]
      },
      {
        name: 'My dads best songs',
        songs: [{name: 'jakies', duration: 34555}, 
                {name: 'dziwne', duration: 3453}, 
                {name: 'piosnki', duration: 345}]
      },
      {
        name: 'My Agas best songs',
        songs: [{name: 'Despasito', duration: 1211}, 
                {name: 'Despasito 123', duration: 66544}, 
                {name: 'Despasito mix', duration: 4535}]
      }
    ]
  }
};

class PlaylistCounter extends Component{
  render(){
    return(
      <div style={{...defaultStyle, width: "40%", display: "inline-block"}}>
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
    return(
      <div style={{width: "40%", display: "inline-block"}}>
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
          this.props.onTextChange(event.target.value)}/>
      </div>
    );
  }
}

class Playlist extends Component{
  render(){
    let playlist = this.props.playlist;
    return(
      <div style ={{...defaultStyle, width : '25%', display: 'inline-block'}}>
        <img src={playlist.imageUrl}/>
        <h3>{playlist.name}</h3>
          <ul>
            {playlist.songs.map( song =>
            <li>{song.name}</li>
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
      .filter(playlist => playlist.name.toLowerCase().includes(
        this.state.filterString.toLowerCase()
      )) : [];
    return (
      <div className="App">
      {this.state.user ? //If the data will be fetched, display whole site
      <div>
      <h1>
      {//if we have the user, it will get the user name
      this.state.user.name
      }'s plejlisty</h1>
      
      <PlaylistCounter //if we have the user, it will get the user playlists
        playlists={playlistsToRender}/>
      {<HoursCounter //if we have the user, it will get the user playlists
      playlists={playlistsToRender}/>}
      <Filter onTextChange={text => this.setState({filterString: text})}/>
      {//map - it does for each, but with rendering a new object based on transformation we've specified
        playlistsToRender.map((playlist) =>
          <Playlist playlist={playlist}/>
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
