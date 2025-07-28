import { invoke } from "@tauri-apps/api/core";
import "./globals.css";
import OverLayBar from "./overlay_bar";
import { useRef, useState } from "react";
import { useEffect } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { FileSystem } from "./file_system";
import { MdOutlinePauseCircleFilled, MdOutlinePlayCircleFilled, MdSkipNext, MdSkipPrevious } from "react-icons/md";
import { info } from "tauri-plugin-log-api";

type Song = {
  name: String,
  length: String,
  path: String
}

function App() {
  const [songQueue, setSongQueue] = useState<Song[]>([]);
  const [audioDeviceList, setAudioDeviceList] = useState<String[]>([]);
  const [showDevices, setShowDevices] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const hasInitialized = useRef(false);

  function removeTopSongFromQueue() {
    setSongQueue(prevQueue => prevQueue.slice(1));
  }



  /* const unlisten = getCurrentWindow().listen('audio-ended', () => {
    console.log(`Ended song`);
  }); */

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
  }

  async function setAudioDevice(index: number){
    await invoke("set_audio_device", {index: index});
    await invoke("set_audio_sink", {});
    songQueue.forEach((s) => {invoke ("play_song", {filePath : s.path})})
  }

  return (
    <main className="w-full h-full bg-zinc-700" style = {{overflow : "hidden"}}>
      <OverLayBar/>
      {/* <button onClick={() => {add_sine_to_sink()}}>sine</button>
      <button onClick={() => {add_saw_to_sink()}}>saw</button>
      <button onClick={() => {add_square_to_sink()}}>square</button> */}
      <div className="w-full h-full flex">
        <FileSystem setSongQueue={setSongQueue}/>
        
        <div className="h-full w-full flex flex-col">
          <div className = "w-full h-[87.666666666%]"></div>
          <div className = "w-full h-1/12 bg-violet-200 flex flex-col items-center justify-evenly">
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
          </div>
        </div>
        <div className="h-full w-3/12 bg-zinc-800">
          {songQueue.map((item, index) => (
            <div key = {index} className="w-full h-8 bg-zinc-900 text-zinc-200 justify-between flex items-center px-4 mt-0.5 transition-all duration-300 ease-in-out hover:bg-violet-300 hover:text-zinc-950 hover:text-lg hover:h-12" onClick={() => {skipSong(index)}}>
              <h1>{item.name}</h1>
              <h1>{item.length}</h1>
            </div>
          )) }
          <div className="transition-all text-zinc-900 text-lg hover:text-zinc-100 duration-300 ease-in-out w-full h-fit py-3 mt-4 bg-violet-300 flex justify-center items-center hover:bg-zinc-900 hover:text-2xl" onClick={() => {setShowDevices(!showDevices)}}>Show Devices</div>
          {showDevices && audioDeviceList.map((item, index) => (
            <div key = {index} className="w-full h-fit py-3 bg-zinc-900 text-zinc-200 justify-between flex items-center px-4 mt-0.5 transition-all duration-300 ease-in-out hover:bg-violet-300 hover:text-zinc-950 hover:text-lg" onClick={() => {setAudioDevice(index)}}>
              <h1>{item}</h1>
            </div>
          )) }
        </div>
      </div>
    </main>
  );
}

export default App;


