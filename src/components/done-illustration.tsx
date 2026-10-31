import { type ComponentType, type SVGProps, useEffect, useState } from 'react'

type Illustration = ComponentType<SVGProps<SVGSVGElement>>

// each illustration is a big svg, so they load on demand : only the picked one is ever fetched
// every module of src/assets exports exactly one component, so adding an asset adds a candidate
const loaders = Object.values(import.meta.glob<Record<string, Illustration>>('../assets/*.tsx'))

async function loadRandomIllustration() {
  const load = loaders[Math.floor(Math.random() * loaders.length)]
  return Object.values(await load())[0]
}

// a random animated illustration for a list with every goal done : decorative, the screen reader gets a short status instead
export function DoneIllustration() {
  const [illustration, setIllustration] = useState<Illustration>()
  // picked once per mount, so it doesn't change while the list stays done
  useEffect(() => {
    let isCancelled = false
    const load = async () => {
      const loaded = await loadRandomIllustration()
      if (!isCancelled) setIllustration(() => loaded)
    }
    void load()
    return () => {
      isCancelled = true
    }
  }, [])
  const Art = illustration
  return (
    <div className="done-illustration" role="status">
      {Art ? <Art className="done-illustration-art" /> : undefined}
      <span className="visually-hidden">All goals done</span>
    </div>
  )
}
