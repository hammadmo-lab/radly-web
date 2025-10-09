import { pollUntil } from "./poll"

test("pollUntil stops when condition met", async () => {
  let count = 0
  const fn = async () => {
    count++
    return count
  }
  const result = await pollUntil(fn, v => v >= 3, { intervalMs: 10, maxMs: 500 })
  expect(result.result).toBe(3)
})

test("pollUntil times out when condition not met", async () => {
  let count = 0
  const fn = async () => {
    count++
    return count
  }
  const result = await pollUntil(fn, v => v >= 10, { intervalMs: 10, maxMs: 100 })
  expect(result.timedOut).toBe(true)
  expect(result.result).toBeLessThan(10)
})

test("pollUntil handles abort signal", async () => {
  const controller = new AbortController()
  let count = 0
  const fn = async () => {
    count++
    return count
  }
  
  // Abort after 50ms
  setTimeout(() => controller.abort(), 50)
  
  const result = await pollUntil(fn, v => v >= 10, { 
    intervalMs: 20, 
    maxMs: 500, 
    signal: controller.signal 
  })
  
  expect(result.aborted).toBe(true)
  expect(result.result).toBeUndefined()
})

test("pollUntil returns immediately if condition already met", async () => {
  const fn = async () => 5
  const result = await pollUntil(fn, v => v >= 3, { intervalMs: 100, maxMs: 500 })
  expect(result.result).toBe(5)
})
