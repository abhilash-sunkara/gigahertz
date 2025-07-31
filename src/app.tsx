import { invoke } from "@tauri-apps/api/core";
import "./globals.css";
import OverLayBar from "./overlay_bar";
import { useRef, useState } from "react";
import { useEffect } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { FileSystem } from "./file_system";
import { MdOutlinePauseCircleFilled, MdOutlinePlayCircleFilled, MdSkipNext, MdSkipPrevious } from "react-icons/md";
import { info } from "tauri-plugin-log-api";
import { SongQueue } from "./song_queue";

type Song = {
  name: String,
  length: String,
  path: String
}

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
  const [playListName, setPlayListName] = useState("");
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

  async function setAudioDevice(index: number){
    await invoke("set_audio_device", {index: index});
    await invoke("set_audio_sink", {});
    songQueue.forEach((s) => {invoke ("play_song", {filePath : s.path})})
  }

  async function createPlaylist() {
    let s:String[] = songQueue.map((s) => s.path)
    let li = s[0].lastIndexOf("/");
    let _s = s[0].substring(0, li);
    console.log(_s + "/" +  playListName)
    await invoke("create_playlist", {songPaths : s, playlistName : _s + "/" + playListName})
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
            <div className = "w-full h-12  flex flex-row">
              <div className="transition-all duration-300 ease-in-out w-1/2 h-12 bg-zinc-200 flex items-center justify-center text-xl text-zinc-900 hover:bg-violet-500 hover:text-2xl" onClick={() => {setAppMode(Mode.PlaySongs)}}>
                Play Songs 
              </div>
              <div className="transition-all duration-300 ease-in-out w-1/2 h-12 bg-zinc-800 flex items-center justify-center text-xl text-zinc-100 hover:bg-violet-500 hover:text-2xl" onClick={() => {setAppMode(Mode.CreatePlaylist)}}>
                Create Playlist
              </div>
            </div>
          </div>
          {appMode == Mode.PlaySongs && <div className = "w-full h-1/12 bg-violet-200 flex flex-col items-center justify-evenly">
            <div className="w-11/12 h-4  rounded-sm flex items-center">
              <div className="w-full h-2 rounded-sm bg-zinc-900"/>
            </div>
            <div className = "flex">
              <div className="text-violet-950 hover:text-zinc-900" onClick={() => {skipSong(-1)}}>
                <MdSkipPrevious size = {36}/>
              </div>
              <div className="text-violet-950 hover:text-zinc-900" onClick={handlePause}>
                {!isPaused && <MdOutlinePauseCircleFilled size = {36}/>}
                {isPaused && <MdOutlinePlayCircleFilled size = {36}/>}
              </div>
              <div className="text-violet-950 hover:text-zinc-900" onClick={() => {skipSong(1)}}>
                <MdSkipNext size = {36}/>
              </div>
            </div>
          </div>}
          {appMode == Mode.CreatePlaylist && <div className = "w-full h-1/12 bg-violet-200 flex flex-col items-center justify-evenly">
            <div className="flex flex-row">
              <div className="w-fit h-fit p-3 bg-violet-500 mr-4 rounded-md">
                Playlist Name
              </div> 
              <input placeholder="playlist.json" name = {"Playlist Name"} className="transition-all duration-300 ease-in-out p-3 rounded-md focus-within:rounded-2xl" onChange={(e) => setPlayListName(e.currentTarget.value)}/>
              <div className="w-fit h-fit p-3 bg-zinc-900 ml-4 rounded-md hover:bg-violet-950" onClick = {() => {createPlaylist()}}>
                Create JSON File
              </div>
            </div>
          </div>}
        </div>
        <SongQueue songQueue={songQueue} setSongQueue={setSongQueue} audioDeviceList={audioDeviceList} showDevices = {showDevices} setShowDevices={setShowDevices} audioDeviceIndex={audioDeviceIndex} setAudioDeviceIndex={setAudioDeviceIndex}/>
      </div>
    </main>
  );
}

export default App;


