import { createTheme, Slider, ThemeProvider } from "@mui/material"
import { useEffect, useRef, useState } from "react";
import { MdOutlinePauseCircleFilled, MdOutlinePlayCircleFilled, MdSkipNext, MdSkipPrevious } from "react-icons/md"

import { Song } from "./app";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { invoke } from "@tauri-apps/api/core";

type InputProps = {
    skipSong : (i: number) => {},
    handlePause : () => {},
    isPaused : boolean,
    songQueue : Song[]
}

const customTheme = createTheme({
      palette: {
        secondary: {
          main: '#09090b',
          light: '#c4b5fd',
          dark: '#2e1065',
          contrastText: '#fff',
        },
      },
    });

export function PlayBar({skipSong, handlePause, isPaused, songQueue} : InputProps) {
    const isPausedRef = useRef(isPaused);
    const songQueueRef = useRef(songQueue);

    useEffect(() => {
        isPausedRef.current = isPaused;
    }, [isPaused]);

    useEffect(() => {
        songQueueRef.current = songQueue;
        if(songQueue.length == 0){
            setSongLength(100)
        } else {
            setSongLength(songQueue[0].rawLength)
        }
        if(songQueue.length != 0){
            setSongArtist(songQueue[0].artist)
            setSongName(songQueue[0].name)
            setSongGenre(songQueue[0].genre)
            setSongHasMetadata(songQueue[0].hasMetadata)
        }
    }, [songQueue]);

    const [songProgress, setSongProgress] = useState(0);
    const [songLength, setSongLength] = useState(100);
    const [songName, setSongName] = useState<String>("");
    const [songArtist, setSongArtist] = useState<String>("");
    const [songGenre, setSongGenre] = useState<String>("");
    const [songHasMetadata, setSongHasMetadata] = useState<boolean>(false);

     useEffect(() => {
        console.log(songLength)
    }, [songLength]);

    function handleProgressChange(_: React.SyntheticEvent | Event, newValue: number | number[]) {
        console.log("changing song progress")
        setSongProgress(Array.isArray(newValue) ? newValue[0] : newValue);
        invoke("seek_in_music", {position : Array.isArray(newValue) ? newValue[0] : newValue})
    }

    function incrementSongProgress(){
        setSongProgress(prev => prev + 1)
    }

    useEffect(() => {
        const interval = setInterval(() => {
            /* console.log(songQueue.length)
            console.log(isPaused) */
            if(songQueueRef.current.length != 0 && !isPausedRef.current) {
                incrementSongProgress()
            }
        }, 1000);

        getCurrentWindow().listen('audio-ended', () => {
            /* console.log(`Ended song`); */
            setSongProgress(0)
        });

        return () => clearInterval(interval);
    }, []);

    

    return (
        <div className="h-full bg-violet-200 flex flex-col items-center">
            <div className="bg-zinc-900 h-4/5 w-11/12 mt-8"></div>
            {songHasMetadata && songQueueRef.current.length != 0 && <div className = "w-11/12 h-12 pt-4 flex flex-row justify-between items-center">
                <div className = "text-zinc-900 text-lg">
                    {songName} by {songArtist}
                </div>
                <div className = "text-zinc-900 text-lg">
                    Genre : {songGenre}
                </div>
            </div>}
            <div className="w-11/12 h-4 rounded-sm flex items-center pt-4">
                <ThemeProvider theme={customTheme}>
                    <Slider
                        min = {0}
                        max = {songLength}
                        step = {2}
                        color="secondary"
                        value = {songProgress}
                        onChangeCommitted={handleProgressChange}
                        disabled = {!isPausedRef}
                    />
                </ThemeProvider>
                {/* <div className="text-violet-950 hover:text-zinc-900" onClick={() => {setSongProgress(songProgress + 0.5)}}>
                    <MdSkipNext size = {36}/>
                </div> */}
            </div>
            <div className = "flex pt-6">
                <div className="text-violet-950 hover:text-zinc-900" onClick={() => {skipSong(-1); setSongProgress(0)}}>
                    <MdSkipPrevious size = {36}/>
                </div>
                <div className="text-violet-950 hover:text-zinc-900" onClick={handlePause}>
                    {!isPaused && <MdOutlinePauseCircleFilled size = {36}/>}
                    {isPaused && <MdOutlinePlayCircleFilled size = {36}/>}
                </div>
                <div className="text-violet-950 hover:text-zinc-900" onClick={() => {skipSong(1); setSongProgress(0)}}>
                    <MdSkipNext size = {36}/>
                </div>
            </div>
        </div>
    )
}