import React, { Component } from 'react';
import './App.css';


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
      <div style={{width: "40%", display: "inline-block"}}>
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

class Filter extends Component{
  render(){
    return(
      <div>
        <img/>
        <input type="text"/>
      </div>
    );
  }
}

class Playlist extends Component{
  render(){
    return(
      <div style ={{...defaultStyle, width : '25%', display: 'inline-block'}}>
        <img/>
        <h3>Playlist Name</h3>
          <ul><li>Song 1</li><li>Song 2</li><li>Song 3</li><li>Song 4</li></ul>
      </div>
    );
  }
}

class App extends Component {
  constructor(){
    super();
    //serverData state needs to be created in constructor
    this.state = {serverData: {} }
  }
  componentDidMount(){
    //initializing server data with fakeserver data at the start
    //setting the timeout to 1 second to show that state auto updates after data is updated
    setTimeout(() =>{
    this.setState({serverData : fakeServerData});
    },1000);
  }
  render() {
    return (
      <div className="App">
      {this.state.serverData.user ? //If the data will be fetched, display whole site
      <div>
      <h1>
      {//if we have the user, it will get the user name
      this.state.serverData.user.name
      } Title</h1>
      <PlaylistCounter playlists={//if we have the user, it will get the user playlists
        this.state.serverData.user.playlists 
        }/>
      <HoursCounter playlists={//if we have the user, it will get the user playlists
        this.state.serverData.user.playlists 
        }/>
      <Filter/>
      <Playlist/>
      <Playlist/>
      <Playlist/>
      <Playlist/>
      </div> : <h1>Loading...</h1> //Display Loading if data is not fetched yet
      }
      </div>
    );
  }
}

export default App;
