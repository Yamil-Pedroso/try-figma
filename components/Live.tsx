import React, { useState, useEffect, use } from "react"
import { useBroadcastEvent, useEventListener, useMyPresence, useOthers } from "@/liveblocks.config"
import LiveCursors from "./cursor/LiveCursors"
import { useCallback } from "react"
import Cursor from "./cursor/Cursor"
import CursorChat from "./cursor/CursorChat"
import { CursorMode, CursorState, Reaction, ReactionEvent } from "@/types/type"
import ReactionSelector from "./reaction/ReactionButton"
import FlyingReaction from "./reaction/FlyingReaction"
import useInterval from "@/hooks/useInterval"


const Live = () => {
  const others = useOthers()
  const [{ cursor }, updateMyPresence] = useMyPresence() as any
  const [cursorState, setCursorState] = useState<CursorState>({
    mode: CursorMode.Hidden,
  })
  const [reaction, setReaction] = useState<Reaction[]>([])

  const broadcast = useBroadcastEvent()

  useInterval(() => {
    if(cursorState.mode === CursorMode.Reaction && cursorState.isPressed && cursor) {
      setReaction((reactions) => reactions.concat([
        {
        value: cursorState.reaction,
        timestamp: Date.now(),
        point: { x: cursor.x, y: cursor.y}
        }
      ]))

      broadcast({
        x: cursor.x,
        y: cursor.y,
        value: cursorState.reaction
      })

      useInterval(() => {
        setReaction((reaction) => reaction.filter((r) => r.timestamp > Date.now() - 4000))
      }, 1000)
    }
  }, 100)

  useEventListener((eventData) => {
    const event = eventData.event as ReactionEvent

    setReaction((reactions) => reactions.concat([
      {
        value: event.value,
        timestamp: Date.now(),
        point: { x: event.x, y: event.y}
      }
    ]))
  })

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    e.preventDefault()

    if(cursor == null  || cursorState.mode !== CursorMode.ReactionSelector) {
      const x = e.clientX - e.currentTarget.getBoundingClientRect().x
      const y = e.clientY - e.currentTarget.getBoundingClientRect().y
  
        updateMyPresence({
           cursor: {x, y}
        })
    }
    
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

    setCursorState((state: CursorState) => 
       cursorState.mode === CursorMode.Reaction ? {...state, isPressed: true} : state
    )

 }, [
    cursorState.mode,
    setCursorState
 ])

   const handlePointerUp = useCallback((e: React.PointerEvent) => {
    setCursorState((state: CursorState) => 
      cursorState.mode === CursorMode.Reaction ? {...state, isPressed: false} : state
    )
   }, [
      cursorState.mode,
      setCursorState
   ])

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
      } else if (e.key === "e") {
        setCursorState({mode: CursorMode.ReactionSelector})
      }
    }

    const onKeyDown = (e: KeyboardEvent) => {
      console.log("Tecla presionada", e.key)
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

  const setReactions = useCallback((reaction: string) => 
  {
    setCursorState({ mode: CursorMode.Reaction, reaction, isPressed: false })
  }, [])

  return (
    <div
        className="h-[100vh] w-full flex justify-center items-center text-center"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
    >
        <h1 className="text-2xl text-white">Collaborative App</h1>

        {
           reaction.map((r) => (
            <FlyingReaction 
              key={r.timestamp.toString()}
              x={r.point.x}
              y={r.point.y}
              timestamp={r.timestamp}
              value={r.value}
            />
           ))
        }

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

        {
          cursorState.mode === CursorMode.ReactionSelector && (
            <ReactionSelector 
              setReaction={setReactions}
            />
          )
        }
        <LiveCursors others={others} />
    </div>
  )
}

export default Live