import { readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { createClient } from '@supabase/supabase-js'

function splitSqlStatements(input) {
  const statements = []
  let current = ''
  let inSingle = false
  let inDouble = false
  let i = 0

  while (i < input.length) {
    const ch = input[i]
    const next = input[i + 1]

    // Line comments: -- ...\n
    if (!inSingle && !inDouble && ch === '-' && next === '-') {
      while (i < input.length && input[i] !== '\n') i += 1
      continue
    }

    // Toggle quotes (handle escaped single quotes: '')
    if (!inDouble && ch === "'") {
      if (inSingle && next === "'") {
        current += "''"
        i += 2
        continue
      }
      inSingle = !inSingle
      current += ch
      i += 1
      continue
    }

    if (!inSingle && ch === '"') {
      inDouble = !inDouble
      current += ch
      i += 1
      continue
    }

    if (!inSingle && !inDouble && ch === ';') {
      const trimmed = current.trim()
      if (trimmed) statements.push(trimmed)
      current = ''
      i += 1
      continue
    }

    current += ch
    i += 1
  }

  const trimmed = current.trim()
  if (trimmed) statements.push(trimmed)
  return statements
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }

  const supabase = createClient(url, key)

  const schemaPath = path.join(process.cwd(), 'db', 'schema.sql')
  const schema = await readFile(schemaPath, 'utf8')

  if (!schema.trim()) {
    throw new Error('db/schema.sql is empty')
  }

  const statements = splitSqlStatements(schema)
  for (const stmt of statements) {
    const { error } = await supabase.rpc('exec_sql', { sql: stmt })
    if (error) {
      console.error(`❌ Failed to execute statement:`)
      console.error(stmt)
      console.error(error)
      throw error
    }
  }

  console.log('✅ Migrated schema from db/schema.sql')
}

main().catch((err) => {
  console.error('❌ Migration failed')
  console.error(err)
  process.exit(1)
})
