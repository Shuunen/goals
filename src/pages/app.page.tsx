import { useGoals } from '../hooks/use-goals'

export function App() {
  const { items, title, toggleItem } = useGoals()
  return (
    <main>
      <h1 className="title">{title}</h1>
      <ul className="list">
        {items.map((item, index) => (
          <li key={item.title}>
            <label className={`item ${item.isDone ? 'done' : ''}`}>
              <input checked={item.isDone} onChange={() => toggleItem(index)} type="checkbox" />
              <span className="title">{item.title}</span>
            </label>
          </li>
        ))}
      </ul>
    </main>
  )
}
