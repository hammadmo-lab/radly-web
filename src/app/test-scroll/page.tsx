export default function TestScroll() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      overflow: 'scroll',
      WebkitOverflowScrolling: 'touch' as const,
    }}>
      <div style={{ width: '100%', height: '100vh', background: 'red', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 0, padding: 0, flexShrink: 0 }}>
        <h1 style={{ fontSize: '48px', color: 'white', margin: 0 }}>Screen 1 - RED</h1>
      </div>
      <div style={{ width: '100%', height: '100vh', background: 'green', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 0, padding: 0, flexShrink: 0 }}>
        <h1 style={{ fontSize: '48px', color: 'white', margin: 0 }}>Screen 2 - GREEN</h1>
      </div>
      <div style={{ width: '100%', height: '100vh', background: 'yellow', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 0, padding: 0, flexShrink: 0 }}>
        <h1 style={{ fontSize: '48px', color: 'white', margin: 0 }}>Screen 3 - YELLOW</h1>
      </div>
      <div style={{ width: '100%', height: '100vh', background: 'purple', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 0, padding: 0, flexShrink: 0 }}>
        <h1 style={{ fontSize: '48px', color: 'white', margin: 0 }}>Screen 4 - PURPLE</h1>
      </div>
      <div style={{ width: '100%', height: '100vh', background: 'blue', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 0, padding: 0, flexShrink: 0 }}>
        <h1 style={{ fontSize: '48px', color: 'white', margin: 0 }}>Screen 5 - BLUE</h1>
      </div>
    </div>
  )
}
