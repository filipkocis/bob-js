class Mesh {
  constructor(vertices = [], faces = [], colors = [], normals = [], material = null) {
    this.vertices = vertices.map(v => new Vector3(v[0], v[1], v[2]))
    this.faces = faces
    this.colors = colors
    this.normals = normals
    this.material = material
  }

  mirror(x, y, z) {
    this.vertices = this.vertices.map(
      v => new Vector3(v.x * x, v.y * y, v.z * z)
    )
  }

  flip() {
    this.faces = this.faces.map(face => [face[0], face[2], face[1]])
  }

  resize(factor) {
    this.vertices = this.vertices.map(v => v.multiply(factor))
  }

  translate(x, y, z) {
    this.vertices = this.vertices.map(v => v.add(new Vector3(x, y, z)))
  }

  rotate(angle, v) {
    this.vertices = this.vertices.map(vertex => vertex.rotate(angle, v))
  }

  get orderedFaces() {
    return this.faces.map(face => {
      const points = face.map(i => this.vertices[i])
      const depth = (points[0].z + points[1].z + points[2].z) / 3

      return { face, depth }
    }).sort((a, b) => b.depth - a.depth).map((f, i) => [f.face, i])
  }

  get points() {
    return this.vertices
  }

  static normal(points) {
    const v1 = points[1].subtract(points[0])
    const v2 = points[2].subtract(points[0])
    
    return v1.cross(v2).normalize()
  }

  static centroid(points) {
    return new Vector3(
      (points[0].x + points[1].x + points[2].x) / 3, 
      (points[0].y + points[1].y + points[2].y) / 3, 
      (points[0].z + points[1].z + points[2].z) / 3, 
    )
  }
}
