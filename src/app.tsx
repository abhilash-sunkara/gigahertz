import { invoke } from "@tauri-apps/api/core";
import "./globals.css";
import OverLayBar from "./overlay_bar";
import { useRef, useState } from "react";
import { useEffect } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { FileSystem, Song } from "./file_system";
import { info } from "tauri-plugin-log-api";
import { SongQueue } from "./song_queue";
import { PlaylistBar } from "./playlist_bar";
import { PlayBar } from "./play_bar";
import { AppModeBar } from "./app_mode_bar";

export enum Mode {
  PlaySongs,
  CreatePlaylist
}

function App() {
  const [songQueue, setSongQueue] = useState<Song[]>([]);
  const [audioDeviceList, setAudioDeviceList] = useState<String[]>([]);
  const [audioDeviceIndex, setAudioDeviceIndex] = useState(0);
  const [showDevices, setShowDevices] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [appMode, setAppMode] = useState<Mode>(Mode.PlaySongs)
  const [playlistName, setPlaylistName] = useState("");
  const [shouldReloadFiles, setShouldReloadFiles] = useState(false);
  const hasInitialized = useRef(false);

  function removeTopSongFromQueue() {
    setSongQueue(prevQueue => prevQueue.slice(1));
  }

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
    await invoke("skip_song", {numTimes : numTimes});
    for(let i = 0; i < numTimes; i++){
      removeTopSongFromQueue();
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
        <FileSystem setSongQueue={setSongQueue} appMode={appMode} shouldReloadFiles = {shouldReloadFiles} setShouldReloadFiles={setShouldReloadFiles}/>
        <div className="h-full w-full flex flex-col justify-between">
          <div className = "w-full h-[87.666666666%]">
            <AppModeBar setAppMode={setAppMode}/>
          </div>
          {appMode == Mode.PlaySongs && <PlayBar skipSong={skipSong} isPaused={isPaused} handlePause={handlePause} songQueue={songQueue}/>}
          {appMode == Mode.CreatePlaylist && <PlaylistBar createPlaylist={createPlaylist} setPlaylistName={setPlaylistName}/>}
        </div>
        <SongQueue songQueue={songQueue} setSongQueue={setSongQueue} audioDeviceList={audioDeviceList} showDevices = {showDevices} setShowDevices={setShowDevices} audioDeviceIndex={audioDeviceIndex} setAudioDeviceIndex={setAudioDeviceIndex}/>
      </div>
    </main>
  );
}

export default App;
