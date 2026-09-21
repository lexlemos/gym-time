'use client'

import { useMemo, useState } from 'react'
import { Bell, CalendarDays, ChevronLeft, ChevronRight, Dumbbell, Lock, Music, Shield, UserRound, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type ClassType = 'Standard' | 'Dance' | 'Fight' | 'Private'
type Student = { id: string; name: string }
type GymClass = { id: string; date: string; time: string; classType: ClassType; maxCapacity: number; enrolledStudents: Student[]; isBlocked: boolean }
type Activity = { id: string; message: string; audience: 'member' | 'admin'; read: boolean }

const currentUser = { id: 's8', name: 'Allex' }
const startDate = new Date('2026-09-21T12:00:00')
const pad = (value: number) => String(value).padStart(2, '0')
const keyFor = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
const addDays = (date: Date, amount: number) => { const next = new Date(date); next.setDate(next.getDate() + amount); return next }
const dateLabel = (date: Date) => date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
const timeLabel = (time: string) => { const hour = Number(time.slice(0, 2)); return `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}` }
const getWeek = (date: Date) => { const monday = addDays(date, -((date.getDay() + 6) % 7)); return Array.from({ length: 7 }, (_, index) => addDays(monday, index)) }
const icons = { Standard: Dumbbell, Dance: Music, Fight: Shield, Private: UserRound }
const colors = { Standard: 'bg-sky-100 text-sky-700', Dance: 'bg-violet-100 text-violet-700', Fight: 'bg-red-100 text-red-700', Private: 'bg-amber-100 text-amber-700' }
function classFor(date: Date, hour: number): ClassType { const day = date.getDay(); if ([2, 4].includes(day) && hour >= 17 && hour < 19) return 'Fight'; if ([1, 3, 5].includes(day) && hour === 8) return 'Dance'; return 'Standard' }
function makeSchedule() { return Array.from({ length: 31 }, (_, index) => { const date = addDays(startDate, index); const weekend = [0, 6].includes(date.getDay()); const hours = Array.from({ length: weekend ? 8 : 15 }, (_, hour) => hour + 6); return hours.map((hour) => { const classType = classFor(date, hour); return { id: `${keyFor(date)}-${hour}`, date: keyFor(date), time: `${pad(hour)}:00`, classType, maxCapacity: classType === 'Private' ? 1 : 5, enrolledStudents: [], isBlocked: false } }) }).flat() }

function MonthPicker({ value, onChange, onClose }: { value: Date; onChange: (date: Date) => void; onClose: () => void }) {
  const [month, setMonth] = useState(new Date(value.getFullYear(), value.getMonth(), 1))
  const first = new Date(month.getFullYear(), month.getMonth(), 1)
  const days = Array.from({ length: new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate() }, (_, index) => new Date(month.getFullYear(), month.getMonth(), index + 1))
  const leading = (first.getDay() + 6) % 7
  const withinRange = (date: Date) => date >= startDate && date <= addDays(startDate, 30)
  return <div className="absolute left-0 top-full z-40 mt-2 w-72 border border-slate-200 bg-white p-4 shadow-xl"><div className="mb-3 flex items-center justify-between"><button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} aria-label="Previous month" className="p-1"><ChevronLeft className="size-4" /></button><strong>{month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</strong><button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} aria-label="Next month" className="p-1"><ChevronRight className="size-4" /></button></div><div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400">{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}{Array.from({ length: leading }, (_, index) => <span key={`empty-${index}`} />)}{days.map((day) => <button key={keyFor(day)} disabled={!withinRange(day)} onClick={() => { onChange(day); onClose() }} className={cn('rounded p-1.5 text-xs', keyFor(day) === keyFor(value) && 'bg-slate-950 font-bold text-white', withinRange(day) ? 'hover:bg-slate-100' : 'cursor-not-allowed text-slate-300')}>{day.getDate()}</button>)}</div></div>
}

export default function Page() {
  const [classes, setClasses] = useState<GymClass[]>(makeSchedule)
  const [activities, setActivities] = useState<Activity[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [selectedDate, setSelectedDate] = useState(startDate)
  const [selected, setSelected] = useState<GymClass | null>(null)
  const [dayToCancel, setDayToCancel] = useState<string | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const [editType, setEditType] = useState<ClassType>('Standard')
  const [editCapacity, setEditCapacity] = useState(5)
  const week = useMemo(() => getWeek(selectedDate), [selectedDate])
  const bySlot = useMemo(() => new Map(classes.map((item) => [`${item.date}-${item.time}`, item])), [classes])
  const audience = isAdmin ? 'admin' : 'member'
  const unread = activities.filter((item) => item.audience === audience && !item.read).length

  // Disable 'Previous Week' if currently viewing the start week (current week)
  const isCurrentWeek = week[0].getTime() <= getWeek(startDate)[0].getTime()
  // Disable 'Next Week' if advancing exceeds 1 month (~30 days) from the start date
  const isMaxWeek = addDays(week[0], 7).getTime() > addDays(startDate, 28).getTime()

  const handlePrevWeek = () => {
    if (!isCurrentWeek) setSelectedDate((prev) => addDays(prev, -7))
  }
  const handleNextWeek = () => {
    if (!isMaxWeek) setSelectedDate((prev) => addDays(prev, 7))
  }

  const notify = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(''), 2200) }
  const addActivity = (message: string, target: 'member' | 'admin') => setActivities((items) => [{ id: `${Date.now()}-${Math.random()}`, message, audience: target, read: false }, ...items])
  const updateClass = (id: string, transform: (item: GymClass) => GymClass) => { setClasses((items) => items.map((item) => item.id === id ? transform(item) : item)); setSelected((item) => item?.id === id ? transform(item) : item) }
  const openClass = (item: GymClass) => { setSelected(item); setEditType(item.classType); setEditCapacity(item.maxCapacity) }
  const book = () => { if (!selected || selected.isBlocked || selected.enrolledStudents.length >= selected.maxCapacity || selected.enrolledStudents.some((student) => student.id === currentUser.id)) return; updateClass(selected.id, (item) => ({ ...item, enrolledStudents: [...item.enrolledStudents, currentUser] })); notify('Class booked successfully!') }
  const cancelBooking = () => { if (!selected) return; updateClass(selected.id, (item) => ({ ...item, enrolledStudents: item.enrolledStudents.filter((student) => student.id !== currentUser.id) })); addActivity(`${currentUser.name} canceled their ${selected.classType} class booking.`, 'admin'); notify('Booking canceled.') }
  const blockClass = (item: GymClass) => { updateClass(item.id, (value) => ({ ...value, isBlocked: true, enrolledStudents: [] })); addActivity(`${item.classType} at ${timeLabel(item.time)} was canceled by the admin.`, 'member'); notify('Class canceled.') }
  const toggleBlock = () => { if (!selected) return; const wasBlocked = selected.isBlocked; updateClass(selected.id, (item) => ({ ...item, isBlocked: !item.isBlocked })); if (!wasBlocked) addActivity(`${selected.classType} at ${timeLabel(selected.time)} was canceled by the admin.`, 'member'); notify(wasBlocked ? 'Class reopened.' : 'Class blocked.') }
  const saveChanges = () => { if (!selected) return; const capacity = editType === 'Private' ? 1 : Math.max(1, editCapacity); updateClass(selected.id, (item) => ({ ...item, classType: editType, maxCapacity: capacity })); notify('Class changes saved.') }
  // Check if the selected day to cancel is already fully blocked
  const isDayFullyBlocked = Boolean(
    dayToCancel &&
    classes.filter((c) => c.date === dayToCancel).length > 0 &&
    classes.filter((c) => c.date === dayToCancel).every((c) => c.isBlocked)
  )

  const handleToggleDay = (dateKey: string) => {
    const date = new Date(`${dateKey}T12:00:00`)
    const dayClasses = classes.filter((item) => item.date === dateKey)
    if (!dayClasses.length) return
    const fullyBlocked = dayClasses.every((item) => item.isBlocked)

    if (fullyBlocked) {
      setClasses((items) =>
        items.map((item) => (item.date === dateKey ? { ...item, isBlocked: false } : item))
      )
      addActivity(`All classes on ${dateLabel(date)} were reopened by the admin.`, 'member')
      notify(`All classes on ${dateLabel(date)} restored.`)
    } else {
      setClasses((items) =>
        items.map((item) => (item.date === dateKey ? { ...item, isBlocked: true, enrolledStudents: [] } : item))
      )
      addActivity(`All classes on ${dateLabel(date)} were canceled by the admin.`, 'member')
      notify(`All classes on ${dateLabel(date)} canceled.`)
    }
  }

  const cancelDay = (date: Date) => { const dateKey = keyFor(date); handleToggleDay(dateKey) }
  const markRead = () => setActivities((items) => items.map((item) => item.audience === audience ? { ...item, read: true } : item))
  const renderSlot = (date: Date, hour: number) => {
    const item = bySlot.get(`${keyFor(date)}-${pad(hour)}:00`)
    if (!item) return <div className="h-[76px] border-b border-slate-200 bg-slate-50" />
    const weekend = [0, 6].includes(date.getDay())
    const unavailable = weekend && hour >= 14
    const Icon = icons[item.classType]
    const full = item.enrolledStudents.length >= item.maxCapacity
    const isEnrolled = item.enrolledStudents.some((student) => student.id === currentUser.id)

    return (
      <div className="h-[76px] border-b border-slate-200 bg-white p-1.5">
        <button
          disabled={unavailable}
          onClick={() => openClass(item)}
          className={cn(
            'flex h-full w-full flex-col justify-between rounded-lg border border-slate-200 bg-white p-2 text-left shadow-sm transition hover:border-slate-400 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-50',
            !isAdmin && isEnrolled && 'border-2 border-emerald-500'
          )}
        >
          <span className="flex items-center justify-between">
            <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold', colors[item.classType])}>
              <Icon className="size-3" />{item.classType}
            </span>
            {item.isBlocked && <Lock className="size-3 text-slate-400" />}
          </span>
          <span className="text-[11px] text-slate-500">
            {unavailable ? 'Closed' : `${item.enrolledStudents.length}/${item.maxCapacity}${full ? ' · Full' : ''}`}
          </span>
        </button>
      </div>
    )
  }

  return (
    <main className="flex h-screen w-full flex-col overflow-hidden bg-slate-50 text-slate-900">
      <header className={cn('shrink-0 transition-colors duration-200', isAdmin ? 'bg-slate-900 text-white' : 'bg-white text-slate-900 border-b border-slate-200')}>
        <div className="mx-auto flex min-h-20 w-full max-w-[1440px] items-center justify-between gap-4 px-4 py-3 sm:px-6 md:px-10">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 select-none">
              <div
                className={`flex items-center justify-center w-9 h-9 rounded-lg transition-colors shadow-sm ${isAdmin ? "bg-emerald-500 text-slate-950" : "bg-slate-900 text-white"
                  }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5"
                >
                  <circle cx="12" cy="13" r="8" />
                  <path d="M12 2v3" />
                  <path d="M10 2h4" />
                  <path d="M13 8l-3 5h3l-2 5" />
                </svg>
              </div>
              <span
                className={`text-2xl font-black tracking-tighter ${isAdmin ? "text-white" : "text-slate-900"
                  }`}
              >
                Gym<span className={isAdmin ? "text-emerald-400" : "text-emerald-600"}>Time</span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => { setNotificationsOpen(!notificationsOpen); markRead() }}
                aria-label="Notifications"
                className={cn(
                  'relative flex size-10 items-center justify-center border transition-colors',
                  isAdmin ? 'border-slate-700 bg-slate-800 text-white hover:bg-slate-700' : 'border-slate-200 bg-white text-slate-900 hover:bg-slate-50'
                )}
              >
                <Bell className="size-4" />
                {unread > 0 && <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">{unread}</span>}
              </button>

              {notificationsOpen && (
                <div className="absolute left-1/2 top-full z-50 mt-2 w-80 -translate-x-1/2 rounded-lg border border-slate-200 bg-white p-4 text-slate-900 shadow-xl">
                  <div className="mb-3 flex items-center justify-between">
                    <strong className="text-sm font-bold">Notifications</strong>
                    <button onClick={() => setNotificationsOpen(false)} aria-label="Close notifications" className="text-slate-400 hover:text-slate-600">
                      <X className="size-4" />
                    </button>
                  </div>
                  {activities.filter((item) => item.audience === audience).length > 0 ? (
                    activities.filter((item) => item.audience === audience).map((item) => (
                      <p key={item.id} className="border-t border-slate-100 py-2 text-sm">
                        {item.message}
                      </p>
                    ))
                  ) : (
                    <p className="border-t border-slate-100 py-3 text-center text-xs text-slate-400">
                      No notifications yet.
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className={cn('flex rounded-lg border p-1 transition-colors', isAdmin ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50')}>
              <button
                onClick={() => setIsAdmin(false)}
                className={cn('rounded-md px-3 py-1.5 text-sm font-semibold transition-all', !isAdmin ? 'bg-white text-slate-900 shadow-sm' : isAdmin ? 'text-slate-400 hover:text-white' : 'text-slate-500')}
              >
                Student
              </button>
              <button
                onClick={() => setIsAdmin(true)}
                className={cn('rounded-md px-3 py-1.5 text-sm font-semibold transition-all', isAdmin ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900')}
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      </header>

      {notice && (
        <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 border border-slate-900 bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-xl">
          {notice}
        </div>
      )}

      <section className="mx-auto flex min-h-0 w-full max-w-[1440px] flex-1 flex-col px-4 py-5 sm:px-6 md:px-10">
        <div className="mb-4 flex flex-col items-center justify-center gap-2">
          <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            {isAdmin ? 'Manage Schedule' : 'Book Your Next Workout'}
          </h1>
          <div className="relative flex items-center gap-2">
            <button
              onClick={handlePrevWeek}
              disabled={isCurrentWeek}
              aria-label="Previous Week"
              className="flex size-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              onClick={() => setPickerOpen(!pickerOpen)}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-900 shadow-sm transition hover:bg-slate-50 hover:text-slate-700"
            >
              <CalendarDays className="size-4 text-slate-500" />
              <span>{dateLabel(week[0])} — {dateLabel(week[6])}</span>
            </button>
            <button
              onClick={handleNextWeek}
              disabled={isMaxWeek}
              aria-label="Next Week"
              className="flex size-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white"
            >
              <ChevronRight className="size-4" />
            </button>
            {pickerOpen && <MonthPicker value={selectedDate} onChange={setSelectedDate} onClose={() => setPickerOpen(false)} />}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto border border-slate-200 bg-white">
          <div className="min-w-[1040px]">
            <div className="sticky top-0 z-10 grid grid-cols-[70px_repeat(7,minmax(130px,1fr))] border-b border-slate-200 bg-white">
              <div className="border-r border-slate-200 p-3 text-xs font-bold text-slate-400">TIME</div>
              {week.map((date) => (
                <div key={keyFor(date)} className="border-r border-slate-200 p-3 text-center">
                  <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-500">
                    {date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}
                    <button
                      onClick={() => isAdmin && setDayToCancel(keyFor(date))}
                      disabled={!isAdmin}
                      aria-label={`Cancel entire day ${dateLabel(date)}`}
                      className="text-slate-400 hover:text-red-600 disabled:cursor-default disabled:opacity-30"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                  <div className="text-2xl font-black">{date.getDate()}</div>
                </div>
              ))}
            </div>
            {Array.from({ length: 15 }, (_, index) => index + 6).map((hour) => (
              <div key={hour} className="grid grid-cols-[70px_repeat(7,minmax(130px,1fr))]">
                <div className="border-r border-b border-slate-200 bg-slate-50 p-2 text-[11px] font-semibold text-slate-500">
                  {timeLabel(`${pad(hour)}:00`)}
                </div>
                {week.map((date) => (
                  <div key={`${keyFor(date)}-${hour}`}>{renderSlot(date, hour)}</div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {dayToCancel && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="bulk-cancel-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
          onClick={() => setDayToCancel(null)}
        >
          <div
            className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between">
              <h2 id="bulk-cancel-title" className="text-xl font-bold text-slate-900">
                {isDayFullyBlocked ? 'Restore all classes?' : 'Close gym on this day?'}
              </h2>
              <button
                onClick={() => setDayToCancel(null)}
                aria-label="Close"
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="size-5" />
              </button>
            </div>
            <p className="text-sm text-slate-600">
              {isDayFullyBlocked
                ? 'This will reopen all scheduled classes for this day and allow students to book.'
                : 'This will immediately cancel all scheduled classes for this day and remove enrolled students. This action cannot be undone.'}
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDayToCancel(null)}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  handleToggleDay(dayToCancel)
                  setDayToCancel(null)
                }}
                className={cn(
                  'rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm transition',
                  isDayFullyBlocked
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-red-600 hover:bg-red-700'
                )}
              >
                {isDayFullyBlocked ? 'Restore Classes' : 'Confirm Closure'}
              </button>
            </div>
          </div>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/30 p-4" onClick={() => setSelected(null)}>
          <div className="w-full max-w-md border border-slate-200 bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="mb-5 flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  {dateLabel(new Date(`${selected.date}T12:00:00`))} · {timeLabel(selected.time)}
                </p>
                <h2 className="mt-1 text-2xl font-black">{selected.classType} class</h2>
              </div>
              <button onClick={() => setSelected(null)} aria-label="Close">
                <X className="size-5" />
              </button>
            </div>
            {isAdmin ? (
              <>
                <div className="border-b border-slate-200 pb-5">
                  <h3 className="mb-3 text-sm font-bold">Edit slot</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="text-xs font-bold text-slate-500">
                      Class type
                      <select
                        value={editType}
                        onChange={(event) => setEditType(event.target.value as ClassType)}
                        className="mt-1 h-10 w-full border border-slate-300 bg-white px-2 text-sm text-slate-900"
                      >
                        <option>Standard</option>
                        <option>Dance</option>
                        <option>Fight</option>
                        <option>Private</option>
                      </select>
                    </label>
                    <label className="text-xs font-bold text-slate-500">
                      Max capacity
                      <input
                        type="number"
                        min="1"
                        disabled={editType === 'Private'}
                        value={editType === 'Private' ? 1 : editCapacity}
                        onChange={(event) => setEditCapacity(Number(event.target.value))}
                        className="mt-1 h-10 w-full border border-slate-300 px-2 text-sm text-slate-900 disabled:bg-slate-100"
                      />
                    </label>
                  </div>
                  <button onClick={saveChanges} className="mt-4 w-full bg-slate-950 py-3 text-sm font-bold text-white hover:bg-slate-800">
                    Save changes
                  </button>
                </div>
                <div className="py-5">
                  <h3 className="text-sm font-bold">Enrolled students ({selected.enrolledStudents.length})</h3>
                  {selected.enrolledStudents.length ? (
                    <div className="mt-2 flex flex-col gap-2 text-sm">
                      {selected.enrolledStudents.map((student) => (
                        <div key={student.id} className="border border-slate-200 px-3 py-2">
                          {student.name}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-slate-500">No students enrolled.</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={toggleBlock} className="flex-1 border border-slate-300 py-3 text-sm font-bold">
                    {selected.isBlocked ? 'Reopen class' : 'Block class'}
                  </button>
                  <button onClick={() => blockClass(selected)} className="flex-1 bg-red-600 py-3 text-sm font-bold text-white">
                    Cancel this class
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="mb-5 text-sm text-slate-600">{selected.enrolledStudents.length}/{selected.maxCapacity} spots booked.</p>
                <div className="flex gap-2">
                  {selected.enrolledStudents.some((student) => student.id === currentUser.id) ? (
                    <button onClick={cancelBooking} className="flex-1 border border-red-300 py-3 text-sm font-bold text-red-700">
                      Cancel booking
                    </button>
                  ) : (
                    <button
                      onClick={book}
                      disabled={selected.isBlocked || selected.enrolledStudents.length >= selected.maxCapacity}
                      className="flex-1 bg-slate-950 py-3 text-sm font-bold text-white disabled:opacity-40"
                    >
                      Book class
                    </button>
                  )}
                  <button onClick={() => setSelected(null)} className="border border-slate-300 px-4 py-3 text-sm font-bold">
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
