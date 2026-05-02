import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useState, useEffect } from 'react'
import axios from 'axios'

interface EventType {
  id: string
  title: string
  start: string
  end: string
}

export default function CalendarView() {
  const [events, setEvents] = useState<EventType[]>([])

  useEffect(() => {
    axios.get("http://localhost:8080/api/scheduling/events")
      .then(res => setEvents(res.data))
  }, [])

  const handleSelect = (info: any) => {
    const newEvent: EventType = {
      id: Date.now().toString(),
      title: "",
      start: info.startStr,
      end: info.endStr
    }

    setEvents(prev => [...prev, newEvent])
  }

  const renderEventContent = (eventInfo: any) => {
    return (
      <div
        contentEditable
        suppressContentEditableWarning={true}
        onBlur={(e) => {
          const newTitle = (e.target as HTMLElement).innerText

          const updated = events.map(ev =>
            ev.id === eventInfo.event.id
              ? { ...ev, title: newTitle }
              : ev
          )

          setEvents(updated)

          axios.post("http://localhost:8080/api/scheduling/events", {
            title: newTitle,
            start: eventInfo.event.start,
            end: eventInfo.event.end
          })
        }}
      >
        {eventInfo.event.title}
      </div>
    )
  }

  return (
    <FullCalendar
      plugins={[timeGridPlugin, interactionPlugin]}
      initialView="timeGridWeek"
      selectable={true}
      editable={true}
      select={handleSelect}
      events={events}
      eventContent={renderEventContent}
    />
  )
}
