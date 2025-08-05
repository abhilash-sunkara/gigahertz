import { invoke } from "@tauri-apps/api/core";
import "./globals.css";
import OverLayBar from "./overlay_bar";
import { useRef, useState } from "react";
import { useEffect } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { FileSystem} from "./file_system";
import { info } from "tauri-plugin-log-api";
import { SongQueue } from "./song_queue";
import { PlaylistBar } from "./playlist_bar";
import { PlayBar } from "./play_bar";
import { AppModeBar } from "./app_mode_bar";
import { SongInfoWindow } from "./song_info_window";

export enum Mode {
  PlaySongs,
  CreatePlaylist,
  CreateSongInfo
}

export type Song = {
  rawName: String,
  name: String,
  artist: String,
  genre: String,
  length: String,
  path: String,
  rawLength: number,
  hasMetadata: boolean
}

export type SongMetadata = {
  path : String,
  name : String, 
  artist : String,
  genre : String
}

function App() {
  const [songQueue, setSongQueue] = useState<Song[]>([]);
  const [prevSongQueue, setPrevSongQueue] = useState<Song[]>([]);
  const [audioDeviceList, setAudioDeviceList] = useState<String[]>([]);
  const [audioDeviceIndex, setAudioDeviceIndex] = useState(0);
  const [showDevices, setShowDevices] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [appMode, setAppMode] = useState<Mode>(Mode.PlaySongs)
  const [playlistName, setPlaylistName] = useState("");
  const [shouldReloadFiles, setShouldReloadFiles] = useState(false);
  const hasInitialized = useRef(false);
  const [songNameMetadata, setSongNameMetadata] = useState("")
  const [songPathMetadata, setSongPathMetadata] = useState("")
  const [songArtistMetadata, setSongArtistMetadata] = useState("")
  const [songGenreMetadata, setSongGenreMetadata] = useState("")

  function removeTopSongFromQueue() {
     setSongQueue(prevQueue => {
    const [top, ...rest] = prevQueue;
    if (!top) {
      console.log("No song to move.");
      return prevQueue;
    }

    setPrevSongQueue(ps => [...ps, top]);
    return rest;
  });
  }

  async function createGHSFile() {
    let metadataObject: SongMetadata = {
      path : songPathMetadata,
      name : songNameMetadata,
      genre : songGenreMetadata,
      artist : songArtistMetadata
    }

    let li = songPathMetadata.lastIndexOf(".")


    let ghsPath: string = songPathMetadata.substring(0, li) + ".ghs"

    console.log(ghsPath)
    console.log(metadataObject)

    await invoke("create_song_metadata_file", {path : ghsPath, sm : metadataObject})
    setShouldReloadFiles(true)
  }

  useEffect(() => {
    console.log("edited prev song queue");
    console.log(prevSongQueue);
  }, [prevSongQueue])

  /* const unlisten = getCurrentWindow().listen('audio-ended', () => {
    console.log(`Ended song`);
  }); */

  useEffect(() => {
    console.log(appMode);
  }, [appMode])

  useEffect(() => {
    console.log("edited song queue");
    console.log(songQueue)
  }, [songQueue])

  async function handlePause() {
    if(isPaused){
      await invoke("unpause_song", {});
    } else {
      await invoke("pause_song", {});
    }
    setIsPaused(!isPaused);
  }

  async function skipSong(numTimes: number) {
    info("attempting to skip this many times: " + numTimes)
    console.log("attempting to skip this many times: " + numTimes)
    if(numTimes > 0){
      await invoke("skip_song", {numTimes : numTimes});
      for(let i = 0; i < numTimes; i++){
        removeTopSongFromQueue();
      }
    } else if (numTimes < 0 && prevSongQueue.length > 0) {
      const topSong = prevSongQueue[prevSongQueue.length - 1];
      if (!topSong) return;

      const newPrevQueue = prevSongQueue.slice(0, -1);
      const newSongQueue = [topSong, ...songQueue];

      setPrevSongQueue(newPrevQueue);
      setSongQueue(newSongQueue);

      await invoke("clear_sink");
      for (const song of newSongQueue) {
        await invoke("play_song", { filePath: song.path });
      }
      await invoke("unpause_song");
    }
  }


  /* useEffect(() => {
    for(let s of filteredDirectory){
      info(s.valueOf());
    }
    console.log(filteredDirectory);
  }, [filteredDirectory]) */

  useEffect(() => {
    if (!hasInitialized.current) {
      console.info("useEffectHook");
      createAudioHandler();
      hasInitialized.current = true;

      getCurrentWindow().listen('audio-ended', () => {
        console.log(`Ended song`);
        removeTopSongFromQueue()
      });
    }
  }, []);

  async function createAudioHandler() {
    /* info("function ran on mount"); */
    setAudioDeviceList(await invoke<String[]>("get_audio_devices", {}));
    await invoke("set_audio_device", {index : 0});
    await invoke("set_audio_sink", {});
    setAudioDeviceIndex(0);
  }

  async function createPlaylist() {
    let s:String[] = songQueue.map((s) => s.path)
    let li = s[0].lastIndexOf("/");
    let _s = s[0].substring(0, li);
    console.log(_s + "/" +  playlistName)
    await invoke("create_playlist", {songPaths : s, playlistName : _s + "/" + playlistName})
    setShouldReloadFiles(true);
    setSongQueue([])
  }

  return (
    <main className="w-full h-screen flex flex-col bg-zinc-700 overflow-hidden">
      <OverLayBar/>
      {/* <button onClick={() => {add_sine_to_sink()}}>sine</button>
      <button onClick={() => {add_saw_to_sink()}}>saw</button>
      <button onClick={() => {add_square_to_sink()}}>square</button> */}
      <div className="w-full flex-1 flex overflow-y-auto">
        <FileSystem setSongQueue={setSongQueue} appMode={appMode} shouldReloadFiles = {shouldReloadFiles} setShouldReloadFiles={setShouldReloadFiles} setSongPathMetadata={setSongPathMetadata}/>
        <div className="h-full w-full flex flex-col">
          <AppModeBar setAppMode={setAppMode}/>
          {appMode == Mode.PlaySongs && <PlayBar skipSong={skipSong} isPaused={isPaused} handlePause={handlePause} songQueue={songQueue}/>}
          {appMode == Mode.CreatePlaylist && <PlaylistBar createPlaylist={createPlaylist} setPlaylistName={setPlaylistName}/>}
          {appMode == Mode.CreateSongInfo && <SongInfoWindow setSongArtist={setSongArtistMetadata} setSongGenre={setSongGenreMetadata} setSongName={setSongNameMetadata} setSongPath={setSongPathMetadata} songPathMetadata={songPathMetadata} createGHSFile={createGHSFile}/>}
        </div>
        <SongQueue songQueue={songQueue} setSongQueue={setSongQueue} audioDeviceList={audioDeviceList} showDevices = {showDevices} setShowDevices={setShowDevices} audioDeviceIndex={audioDeviceIndex} setAudioDeviceIndex={setAudioDeviceIndex}/>
      </div>
    </main>
  );
}

export default App;
