const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const backupDir = path.join(ROOT, '.mobile-backup')

const toBackup = [
  'src/app/admin/users/[userId]',
  'src/app/app/report/[id]'
]

if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir)

for (const rel of toBackup) {
  const p = path.join(ROOT, rel)
  if (fs.existsSync(p)) {
    const dest = path.join(backupDir, rel.replace(/[\/]/g, '__'))

    // Remove existing backup if it exists to avoid ENOTEMPTY error
    if (fs.existsSync(dest)) {
      fs.rmSync(dest, { recursive: true, force: true })
    }

    fs.mkdirSync(path.dirname(dest), { recursive: true })
    fs.renameSync(p, dest)
    console.log('📦 Mobile build: temporarily moved', rel)
  }
}

console.log('✅ Mobile prepare complete')

