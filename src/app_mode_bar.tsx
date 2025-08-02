import { Mode } from "./app"

type InputProps = {
    setAppMode : React.Dispatch<React.SetStateAction<Mode>>
}


export function AppModeBar({setAppMode} : InputProps) {
    return (
        <div className = "w-full h-12  flex flex-row">
            <div className="transition-all duration-300 ease-in-out w-1/2 h-12 bg-zinc-200 flex items-center justify-center text-xl text-zinc-900 hover:bg-violet-500 hover:text-2xl" onClick={() => {setAppMode(Mode.PlaySongs)}}>
                Play Songs 
            </div>
            <div className="transition-all duration-300 ease-in-out w-1/2 h-12 bg-zinc-800 flex items-center justify-center text-xl text-zinc-100 hover:bg-violet-500 hover:text-2xl" onClick={() => {setAppMode(Mode.CreatePlaylist)}}>
                Create Playlist
            </div>
        </div>
    )    
}