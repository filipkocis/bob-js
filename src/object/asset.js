class AssetLoader {
  static load(obj) {
    const lines = obj.trim().split('\n')

    const vertices = []
    const faces = []
    const colors = []
    const normals = []

    const faceSplits = []
    let currentColor = 0
    let currentNormal = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      if (line.startsWith('v')) {
        vertices.push(AssetLoader.convertVertex(line))
      }
      else if (line.startsWith('f')) {
        const newFaces = AssetLoader.splitFaceToTriangles(line)
        faceSplits.push(newFaces.length)
        faces.push(...newFaces)
      }
      else if (line.startsWith('c')) {
        const newColors = Array(faceSplits[currentColor]).fill(AssetLoader.convertColor(line))
        colors.push(...newColors)
        currentColor++
      }
      else if (line.startsWith('n')) {
        const newNormal = Array(faceSplits[currentNormal]).fill(AssetLoader.convertNormal(line))
        normals.push(...newNormal)
        currentNormal++
      }
      else throw new Error(`Invalid line: '${line}'`)
    }

    if (vertices.length === 0) throw new Error('No vertices found')
    if (faces.length === 0) throw new Error('No faces found')
    if (faces.length !== colors.length && colors.length !== 0) throw new Error('Number of faces and colors does not match')
    if (faces.length !== normals.length && normals.length !== 0) throw new Error('Number of faces and normals does not match')

    return new Mesh(vertices, faces, colors, normals)
  }

  static convertVertex(line) {
    const split = line.split(' ') 
    if (split[0] !== 'v') throw new Error(`Not a vertex: '${line}'`)
    if (split.length !== 4) throw new Error(`Invalid vertex: '${line}'`)

    return split.slice(1).map(Number)
  }

  static convertColor(line) {
    const split = line.split(' ') 
    if (split[0] !== 'c') throw new Error(`Not a color: '${line}'`)
    if (split.length !== 4) throw new Error(`Invalid color: '${line}'`)

    return split.slice(1).map(Number)
  }

  static convertNormal(line) {
    const split = line.split(' ') 
    if (split[0] !== 'n') throw new Error(`Not a normal: '${line}'`)
    if (split.length !== 4) throw new Error(`Invalid normal: '${line}'`)

    return split.slice(1).map(Number)
  }

  static splitFaceToTriangles(face) {
    const split = face.split(' ') 
    if (split[0] !== 'f') throw new Error(`Not a face: '${face}'`)
    if (split.length < 4) throw new Error(`Invalid face: '${face}'`)

    const indices = split.slice(1).map(i => parseInt(i) - 1)
    const faces = []
    const anchor = indices[0]

    for (let i = 1; i < indices.length - 1; i++) {
      faces.push([
        anchor,
        indices[i],
        indices[i + 1],
      ])
    }

    return faces
  }
}

class Assets {
  static get square() {
    return `
v 0.000000 0.000000 0.000000
v 1.000000 0.000000 0.000000
v 1.000000 0.000000 1.000000
v 0.000000 0.000000 1.000000
f 1 2 3 4
c 0 1 0
`
  }

  static get coordinates() {
    return `
v 0.000000 0.000000 0.000000
v 1.000000 0.000000 0.000000
v 0.000000 1.000000 0.000000
v 0.000000 0.000000 1.000000
f 1 2 3
f 4 1 3
c 0 1 0
c 0 0 1
    `
  }

  static get triangle() {
    return `
v 0.000000 1.000000 0.000000
v -1.000000 -1.000000 0.000000
v 1.000000 -1.000000 0.000000
f 1 2 3
c 1 0 0
    `
  }
}
