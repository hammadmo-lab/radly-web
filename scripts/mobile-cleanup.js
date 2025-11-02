const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const backupDir = path.join(ROOT, '.mobile-backup')

if (fs.existsSync(backupDir)) {
  for (const entry of fs.readdirSync(backupDir)) {
    const src = path.join(backupDir, entry)
    const restored = entry.replace(/__/g, path.sep)
    const dest = path.join(ROOT, restored)
    fs.mkdirSync(path.dirname(dest), { recursive: true })
    fs.renameSync(src, dest)
    console.log('🔁 Restored', restored)
  }
  fs.rmSync(backupDir, { recursive: true, force: true })
}

console.log('✨ Mobile cleanup complete')

