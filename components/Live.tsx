import React, { useState, useEffect, use } from "react"
import { useMyPresence, useOthers } from "@/liveblocks.config"
import LiveCursors from "./cursor/LiveCursors"
import { useCallback } from "react"
import Cursor from "./cursor/Cursor"
import CursorChat from "./cursor/CursorChat"
import { CursorMode } from "@/types/type"


const Live = () => {
  const others = useOthers()
  const [{ cursor }, updateMyPresence] = useMyPresence() as any
  const [cursorState, setCursorState] = useState({
    mode: CursorMode.Hidden,
  })

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    
      const x = e.clientX - e.currentTarget.getBoundingClientRect().x
      const y = e.clientY - e.currentTarget.getBoundingClientRect().y

        updateMyPresence({
           cursor: {x, y}
        })
 }, [])

  const handlePointerLeave = useCallback((e: React.PointerEvent) => {
        setCursorState({mode: CursorMode.Hidden})
    
        updateMyPresence({
            cursor: null,
            message: null
        })  
 }, [])

 const handlePointerDown = useCallback((e: React.PointerEvent) => {
      const x = e.clientX - e.currentTarget.getBoundingClientRect().x
      const y = e.clientY - e.currentTarget.getBoundingClientRect().y

        updateMyPresence({cursor: {x, y}})
 }, [])

  useEffect(() => {
    const onKeyUp = (e: KeyboardEvent) => {
      console.log("Tecla soltada",e.key)
      if(e.key === "/") {
        setCursorState({
          mode: CursorMode.Chat,
          previousMessage: null,
          message: "",
        })
      } else if (e.key === "Escape") {
        updateMyPresence({
          message: ""
        })
        setCursorState({mode: CursorMode.Hidden})
      }
    }

    const onKeyDown = (e: KeyboardEvent) => {
      console.log("Tecla presionada",e.key)
      if(e.key === "/") {
        e.preventDefault()
      }
    }
    window.addEventListener("keyup", onKeyUp)
    window.addEventListener("keydown", onKeyDown)

    return () => {
      window.removeEventListener("keyup", onKeyUp)
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [
    updateMyPresence
  ])

  return (
    <div
        className="h-[100vh] w-full flex justify-center items-center text-center"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
    >
        <h1 className="text-2xl text-white">Collaborative App</h1>

        {
          cursor && (
            <CursorChat
              cursor={cursor}
              cursorState={cursorState}
              setCursorState={setCursorState}
              updateMyPresence={updateMyPresence}
            />
          )
        }
        <LiveCursors others={others} />
    </div>
  )
}

export default Live