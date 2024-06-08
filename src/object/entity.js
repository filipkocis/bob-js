class Entity {
  constructor(mesh, position, rotation) {
    this.mesh = mesh
    this.position = position // in world space
    this.rotation = rotation // in degrees (y axis ?) TODO: convert to quaternion

    // convert colors to 0-255 when drawing, otherwise 0-1
    // this.mesh.colors = this.mesh.colors.map(c => [c[0] * 255, c[1] * 255, c[2] * 255])
    this.mesh.material = new Material({
      ambient: new Vector3(0.2, 0.2, 0.2),
      diffuse: new Vector3(0.5, 0.5, 0.5),
      specular: new Vector3(0.5, 0.5, 0.5),
      shininess: 20
    })
  }

  update() {}

  draw(context) {
    const orderedFaces = this.mesh.orderedFaces
    for (let i = 0; i < orderedFaces.length; i++) {
      const face = orderedFaces[i][0]
      const index = orderedFaces[i][1]
      const color = this.mesh.colors[index]
      const points = face.map(i => this.mesh.vertices[i].add(this.position).rotate(this.rotation, new Vector3(0, 1, 0)))

      context.beginPath()
      context.strokeStyle = `rgb(${color[0]} ${color[1]} ${color[2]})`
      context.fillStyle = `rgb(${color[0]} ${color[1]} ${color[2]})`
      context.moveTo(points[0].x, points[0].y)
      
      for (const point of points) context.lineTo(point.x, point.y)

      context.stroke()
      context.fill()
      context.closePath()
      // points.map(p => p.draw(context))
    }
  }

  orderedFacesWith(providedPoints) {
    return this.mesh.faces.map((face, index) => {
      const points = face.map(i => providedPoints[i])
      const depth = (points[0].z + points[1].z + points[2].z) / 3

      return { face, depth, index }
    }).sort((a, b) => b.depth - a.depth).map((f, i) => [f.index, f.depth])
  }

  isFacingCamera(providedPoints, index) {
    const face = this.mesh.faces[index]
    const points = face.map(i => providedPoints[i])
    const normal = Mesh.normal(points) 

    const camera = new Vector3(0, 0, 1)

    return camera.dot(normal) > 0 
  }

  drawWith(context, providedPoints) {
    // const orderedFaces = this.mesh.orderedFaces
    const orderedFaces = this.orderedFacesWith(providedPoints)
    // for (let i = 0; i < orderedFaces.length; i++) {
    for (const orderedFace of orderedFaces) {
      if (orderedFace[1] <= 0) continue
      if (this.isFacingCamera(providedPoints, orderedFace[0]) === false) continue 

      const i = orderedFace[0]
      // const face = orderedFaces[i][0]
      const face = this.mesh.faces[i]
      const index = i

      // const index = orderedFaces[i][1]
      const color = this.mesh.colors[index]
      const points = face.map(i => providedPoints[i])

      points.map(p => p.draw(context))
      // for (const point of points) {
      //   if (point.x < -500) point.x = -500
      //   if (point.y < -500) point.y = -500
      //   if (point.x > 500) point.x = 500
      //   if (point.y > 500) point.y = 500
      // }
      // if (points.some(p => p.z <= 0)) continue
 
      context.beginPath()
      context.strokeStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`
      context.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`
      context.moveTo(points[0].x, points[0].y)
      
      for (let i = 1; i < points.length; i++) context.lineTo(points[i].x, points[i].y)
      context.lineTo(points[0].x, points[0].y)

      context.stroke()
      context.fill()
      context.closePath()
    }
  }
}
