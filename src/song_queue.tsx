import { info } from "tauri-plugin-log-api";
import { Song } from "./file_system";
import { invoke } from "@tauri-apps/api/core";
import { createTheme, Slider, ThemeProvider } from "@mui/material";
import { useState } from "react";
import { MdOutlineVolumeDown, MdOutlineVolumeUp } from "react-icons/md";


type InputProps = {
    songQueue: Song[],
    setSongQueue: React.Dispatch<React.SetStateAction<Song[]>>,
    audioDeviceList: String[],
    showDevices: boolean,
    setShowDevices: React.Dispatch<React.SetStateAction<boolean>>,
    audioDeviceIndex: number,
    setAudioDeviceIndex: React.Dispatch<React.SetStateAction<number>>,
}

const customTheme = createTheme({
      palette: {
        secondary: {
          main: '#7c3aed',
          light: '#c4b5fd',
          dark: '#2e1065',
          contrastText: '#fff',
        },
      },
    });

export function SongQueue({songQueue, setSongQueue, audioDeviceList, showDevices, setShowDevices, audioDeviceIndex, setAudioDeviceIndex} : InputProps) {

    const volumeMarks = [{value: 0, label: '0'}, {value: 100, label: '100'}, {value: 200, label: '200'}]

    const [volume, setVolume] = useState(100)

    function handleVolumeChange(event: Event, newValue: number){
        console.log(event)
        console.log("new volume: " + newValue / 100)
        setVolume(newValue);
        invoke("set_volume", {volume: newValue / 100})
    }
    
    
    async function skipSong(numTimes: number) {
    info("attempting to skip this many times: " + numTimes)
    console.log("attempting to skip this many times: " + numTimes)
    await invoke("skip_song", {numTimes : numTimes});
    for(let i = 0; i < numTimes; i++){
      removeTopSongFromQueue();
    }
    }


    function removeTopSongFromQueue() {
        setSongQueue(prevQueue => prevQueue.slice(1));
    }

    async function setAudioDevice(index: number){
        setAudioDeviceIndex(index)
        await invoke("set_audio_device", {index: index});
        await invoke("set_audio_sink", {});
        await invoke("set_volume", {volume: volume / 100})
        songQueue.forEach((s) => {invoke ("play_song", {filePath : s.path})})
    }

    return (
        <div className="h-full w-3/12 bg-zinc-800 flex flex-col justify-between">
            <div>
                {songQueue.map((item, index) => (
                    <div key = {index} className="w-full h-8 bg-zinc-900 text-zinc-200 justify-between flex items-center px-4 mt-0.5 transition-all duration-300 ease-in-out hover:bg-violet-300 hover:text-zinc-950 hover:text-lg hover:h-12" onClick={() => {skipSong(index)}}>
                    <h1>{item.name}</h1>
                    <h1>{item.length}</h1>
                    </div>
                )) }
                <div className="text-zinc-100 text-md w-full h-fit p-3 mt-4 bg-zinc-900 flex justify-center items-center">
                    {audioDeviceList[audioDeviceIndex]}
                </div>
                <div className="transition-all text-zinc-900 text-lg hover:text-zinc-100 duration-300 ease-in-out w-full h-fit py-3 bg-violet-300 flex justify-center items-center hover:bg-zinc-900 hover:text-2xl" onClick={() => {setShowDevices(!showDevices)}}>Show Devices</div>
                {showDevices && audioDeviceList.map((item, index) => (
                    <div key = {index} className="w-full h-fit py-3 bg-zinc-900 text-zinc-200 justify-between flex items-center px-4 mt-0.5 transition-all duration-300 ease-in-out hover:bg-violet-300 hover:text-zinc-950 hover:text-lg" onClick={() => {setAudioDevice(index)}}>
                    <h1>{item}</h1>
                    </div>
                )) }
            </div>
            <div className = "w-full h-1/12 bg-zinc-900 px-2 flex flex-row items-center justify-center">
                <div className="text-violet-400 pr-4">
                    <MdOutlineVolumeDown size={24}/>
                </div>
                <ThemeProvider theme={customTheme}>
                    <Slider 
                        color="secondary"
                        min = {0}
                        max = {200}
                        step = {10}
                        defaultValue={100}
                        valueLabelDisplay="auto"
                        value = {volume}
                        onChange={handleVolumeChange}
                        marks = {volumeMarks}
                        componentsProps={{ markLabel: { style: { color: 'white' } } }}
                    />
                </ThemeProvider>
                <div className="text-violet-400 pl-4">
                    <MdOutlineVolumeUp size={24}/>
                </div>
            </div>
        </div>
    )
}