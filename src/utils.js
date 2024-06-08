function toDegrees(radians) { return radians * (180 / Math.PI ) }
function toRadians(degrees) { return degrees * (Math.PI / 180) }

const defaultObjectSpace = { x: 0, y: 0, z: 0 }

function fillSquares(n) {
  const squares = []

  for (let x = 0; x < n; x++) {
    for (let y = 0; y < n; y++) {
      const cubeMesh = AssetLoader.load(Assets.cube2)
      cubeMesh.translate(0.5, -0.5, 0)
      cubeMesh.resize(50)

      squares.push(new Entity(
        cubeMesh,
        new Vector3((x-n/2)*100, 0, (y-n/2)*100),
        0
      ))
    }
  }

  return squares
}

const defaultLights = [
  // const mid = new Vector3(-6, 165, 0)
  // const cam = new Vector3(-6, 165, 65)
  new Light({ type: LightType.POINT, intensity: new Vector3(1, 0.1, 0.1), position: new Vector3(-20, 180, 0), attenuation: [1, 0.0014, 0.000007] }),
  new Light({ type: LightType.POINT, intensity: new Vector3(0.1, 1, 0.1), position: new Vector3(30, 165, 35), attenuation: [1, 0.0014, 0.000007] }),
  new Light({ type: LightType.POINT, intensity: new Vector3(0.1, 0.1, 1), position: new Vector3(-10, 140, 50), attenuation: [1, 0.0014, 0.000007] }),
  // new Light({ type: LightType.SPOT, intensity: new Vector3(1, 0.1, 0.1), position: new Vector3(-6, 165, 65), direction: new Vector3(0, 0, 1), angle: 30, attenuation: [1, 0.0014, 0.000007] })
  
  // new Light({ type: LightType.AMBIENT, intensity: new Vector3(0.6, 0.6, 0.6) }),
  // new Light({ type: LightType.DIRECTIONAL, intensity: new Vector3(0.5, 0.5, 0.5), direction: new Vector3(0, -1, 1) }),
  // new Light({ type: LightType.POINT, intensity: new Vector3(0.5, 0.5, 0.5), position: new Vector3(0, 500, 0), attenuation: [1, 0.0014, 0.000007] }),
  // new Light({ type: LightType.SPOT, intensity: new Vector3(0.5, 0.5, 0.5), position: new Vector3(0, 200, 0), direction: new Vector3(0, -1, 0), angle: 30, attenuation: [1, 0.0014, 0.000007] })
]

const defaultSquares = [
  // new Square({ width: 1000, height: 0, depth: 1000 }, structuredClone(defaultObjectSpace), { x: -500, y: 0, z: -500 }),
  //
  // new Square({ width: 100, height: 100, depth: 100 }, structuredClone(defaultObjectSpace), { x: 300, y: 0, z: 300 }),
  // new Square({ width: 100, height: 200, depth: 100 }, structuredClone(defaultObjectSpace), { x: 300, y: 0, z: -300 }),
  // new Square({ width: 100, height: 300, depth: 100 }, structuredClone(defaultObjectSpace), { x: -300, y: 0, z: -300 }),
  // new Square({ width: 100, height: 400, depth: 100 }, structuredClone(defaultObjectSpace), { x: -300, y: 0, z: 300 }),

  ...fillSquares(5)
]


function getTriangle(x, y, z) {
  const mesh = AssetLoader.load(Assets.triangle)
  mesh.resize(100)
  return new Entity(
    mesh,
    new Vector3(x, y, z),
    0
  )
}

function getHouse(x, y, z) {
  const mesh = AssetLoader.load(Assets.house)
  mesh.resize(100)
  return new Entity(
    mesh,
    new Vector3(x, y, z),
    0
  )
}

function getFloor(n, size) {
  const squares = []

  for (let x = 0; x < n; x++) {
    for (let y = 0; y < n; y++) {
      const squareMesh = AssetLoader.load(Assets.square)
      const position = new Vector3((x-n/2)*size, 0, (y-n/2)*size)
      squareMesh.resize(size)
      squares.push(new Entity(squareMesh, position, 0))
    }
  }

  return squares
}

function applyNoiseToFloor(entities) {
  for (const entity of entities) {
    const mesh = entity.mesh
    mesh.vertices = mesh.vertices.map(v => v.add(new Vector3(0, Math.random() * 10, 0)))
  }

  return entities
}

function getNoisyFloor(n, size, strength = 10) {
  const squares = []
  const rOffsets = new Array(n+1).fill(0).map(() => new Array(n+1).fill(0).map(() => Math.random() * strength))
  const cOffsets = new Array(n+1).fill(0).map(() => new Array(n+1).fill(0).map(() => Math.random() * strength))

  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const squareMesh = AssetLoader.load(Assets.square)
      const position = new Vector3((x-n/2)*size, 0, (y-n/2)*size)
      squareMesh.resize(size)

      const bottomLeftNoise = new Vector3(0, rOffsets[y][x] + cOffsets[x][y], 0)
      const bottomRightNoise = new Vector3(0, rOffsets[y][x+1] + cOffsets[x+1][y], 0)
      const topRightNoise = new Vector3(0, rOffsets[y+1][x+1] + cOffsets[x+1][y+1], 0)
      const topLeftNoise = new Vector3(0, rOffsets[y+1][x] + cOffsets[x][y+1], 0)

      squareMesh.vertices[0] = squareMesh.vertices[0].add(bottomLeftNoise)
      squareMesh.vertices[1] = squareMesh.vertices[1].add(bottomRightNoise)
      squareMesh.vertices[2] = squareMesh.vertices[2].add(topRightNoise)
      squareMesh.vertices[3] = squareMesh.vertices[3].add(topLeftNoise)

      squares.push(new Entity(squareMesh, position, 0))
    }
  }

  return squares
}

function getPeakyNoiseFloor(n, size, strength = 10, peaksN = 10, attenuation = [1, 0.0014, 0.000007]) {
  const squares = []
  // const rOffsets = new Array(n+1).fill(0).map(() => new Array(n+1).fill(0))
  // const cOffsets = new Array(n+1).fill(0).map(() => new Array(n+1).fill(0))

  const peaks = new Array(peaksN).fill(0).map(() => new Vector3(
    Math.floor(Math.random() * n * size - n/2 * size),
    Math.random() * strength,
    Math.floor(Math.random() * n * size - n/2 * size),
  ))

  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const squareMesh = AssetLoader.load(Assets.square)
      squareMesh.resize(size)
      squareMesh.translate((x-n/2)*size, 0, (y-n/2)*size)

      for (const vertex of squareMesh.vertices) {
        const peakVector = peaks.reduce((acc, peak) => {
          const distance = new Vector3(vertex.x,0,vertex.z).subtract(new Vector3(peak.x, 0, peak.z)).magnitude()
          const attenuationFactor = 1 / (attenuation[0] + attenuation[1] * distance + attenuation[2] * distance * distance)
          const noise = peak.y * attenuationFactor
          return acc.add(new Vector3(peak.x, noise, peak.z))
        }, new Vector3(0,0,0))

        vertex.y += peakVector.y
      }

      squares.push(new Entity(squareMesh, new Vector3(0,0,0), 0))
    }
  }

  return squares
}

function getCoords() {
  const mesh = AssetLoader.load(Assets.coordinates)
  mesh.resize(50)
  return new Entity(mesh, new Vector3(0, 0, 0), 0)
}

const triangles = [
  getTriangle(0,0,0),
  // getCoords()
]

function objObj() {
  const meshHandL = AssetLoader.load(Assets.objHand)
  const meshHandR = AssetLoader.load(Assets.objHand)
  const meshFootL = AssetLoader.load(Assets.objFoot)
  const meshFootR = AssetLoader.load(Assets.objFoot)
  const meshHead = AssetLoader.load(Assets.objHead)

  meshFootR.mirror(-1, 1, 1)
  meshFootR.flip()

  meshHandR.mirror(-1, 1, 1)
  meshHandR.flip()

  return [
    new Entity(meshHandL, new Vector3(-38,8,4), 0),
    new Entity(meshHandR, new Vector3(28,8,4), 0),
    new Entity(meshFootL, new Vector3(-25,0,5), 0),
    new Entity(meshFootR, new Vector3(15,0,5), 0),
    new Entity(meshHead, new Vector3(-5,15,0), 0),
  ]
}
