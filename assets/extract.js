const fs = require('fs')

const vertex = (line) => {
  return line 
}

const face = (line) => {
  let str = 'f'
  let arr = []

  const split = line.split(' ')
  for (const s of split) {
    if (s == 'f') continue
    let ns = s.split('/')
    arr.unshift(ns[0])
  }

  str += ' ' + arr.join(' ')

  return [
    str,
    [1, 1, 1]
  ]
}

const extract = (path) => {
  const data = fs.readFileSync(path, 'utf8')
  const lines = data.split('\n')
  const vertices = []
  const faces = []
  const colors = []
  const normals = []

  for (const line of lines) {
    const lineStart = line[0]
    const nextCh = line[1]
    const trimmed = line.trim().replace(/\s+/g, ' ')

    if (nextCh != ' ') continue
    if (lineStart == 'v') vertices.push(vertex(trimmed))
    if (lineStart == 'f') {
      const fc = face(trimmed)
      faces.push(fc[0])
      colors.push(fc[1])
    }
    // if (lineStart == 'v') vertices.push(vertex(line))
    // if (lineStart == 'v') vertices.push(vertex(line))
  }

  return {
    vertices,
    faces,
    colors,
    normals
  }
}

function save(data) {
  let str = '' 

  for (const v of data.vertices) {
    str += `${v}\n`
  }
  for (const f of data.faces) {
    str += `${f}\n`
  }
  for (const c of data.colors) {
    str += `c ${c[0]} ${c[1]} ${c[2]}\n`
  }

  fs.writeFileSync('./hand.txt', str)
}

const path = './Hand.obj'

const data = extract(path)
save(data)
