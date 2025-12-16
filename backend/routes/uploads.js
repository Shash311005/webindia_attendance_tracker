const express = require('express')
const multer = require('multer')
const XLSX = require('xlsx')
const fs = require('fs')
const { query } = require('../db')

const router = express.Router()


const upload = multer({ dest: 'uploads/' })

router.post('/attendance', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    
    const workbook = XLSX.readFile(req.file.path)
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]

    const rows = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      range: 4,
      defval: null
    })

    
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]

      
      const employeeId = row[1]          
      const transactionDate = row[3]     

      if (!employeeId || !transactionDate) continue

      
      const inTimes = []
      const outTimes = []

      
      for (let c = 4; c < row.length - 3; c += 2) {
        if (row[c]) inTimes.push(row[c])
        if (row[c + 1]) outTimes.push(row[c + 1])
      }

      const checkIn = inTimes.length ? inTimes[0] : null
      const checkOut = outTimes.length ? outTimes[outTimes.length - 1] : null

      const totalHours = row[row.length - 1] 

      
      await query(
        `INSERT INTO attendance
         (employee_id, work_date, check_in, check_out, total_hours)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          employeeId,
          new Date(transactionDate), 
          checkIn,
          checkOut,
          totalHours
        ]
      )
    }

    
    fs.unlinkSync(req.file.path)

    res.json({ message: 'Attendance uploaded successfully' })

  } catch (err) {
    console.error('Attendance upload failed:', err)
    res.status(500).json({ error: 'Upload failed' })
  }
})

module.exports = router
