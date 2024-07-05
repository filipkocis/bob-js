class Renderer3D {
  constructor(ctx, camera) {
    this.ctx = ctx
    this.camera = camera

    this.viewWidth = this.ctx.canvas.width
    this.viewHeight = this.ctx.canvas.height
    this.viewCenter = new Vector2(this.viewWidth / 2, this.viewHeight / 2)
    
    this.vertices = []
    this.faces = []
    this.colors = []
    this.zBuffer = []
    this.zOrder = []
    this.materials = []

    this.facesLength = 0
    this.verticesLength = 0
  }

  draw(entities, lights) {
    this.clear() // clear the canvas
    
    this.#fillBuffers(entities) // from object to world space
    this.#applyTransformations(lights) // from world to camera space
    this.#applyClip() // clip vertices behind the camera
    this.#applyBackfaceCulling() // remove faces not facing the camera
    this.#applyPhongShading(lights) // phong shading in world space
    this.#applyZBuffer() // sort faces by depth
    this.#applyPerspective() // from camera to screen space

    this.#drawFaces() // draw to canvas
  }

  #applyPhongShading(lights) {
    const ambientLights = lights.filter(l => l.type === LightType.AMBIENT)    
    const ambientIntensity = new Vector3(0, 0, 0)
    for (const light of ambientLights) {
      ambientIntensity.x += light.intensity.x
      ambientIntensity.y += light.intensity.y
      ambientIntensity.z += light.intensity.z
    }

    for (let i = 0; i < this.facesLength; i++) {
      const face = this.faces[i]  
      if (face == null) continue

      const color = this.colors[i]
      const material = this.materials[i]
      if (material == null || color == null) continue

      const kA = material.ambient
      const kD = material.diffuse
      const kS = material.specular

      const vertices = face.map(idx => this.vertices[idx])
      const normal = Mesh.normal(vertices)
      const view = vertices[0].multiply(-1).normalize()

      const ambientTerm = kA.multiplyV(ambientIntensity)
      let diffuseTerm = new Vector3(0, 0, 0) 
      let specularTerm = new Vector3(0, 0, 0)

      for (const light of lights) {
        if (light.type === LightType.AMBIENT) continue

        let L, attenuation = 1.0;
        const intensity = light.intensity

        if (light.type === LightType.POINT || light.type === LightType.SPOT) {
          const position = light.transformedPosition.subtract(vertices[0])
          const distance = position.magnitude()
          L = position.normalize()
          attenuation = 1 / (light.attenuation[0] + light.attenuation[1] * distance + light.attenuation[2] * distance * distance)
        } else if (light.type === LightType.DIRECTIONAL) {
          L = light.transformedDirection.normalize()
        }

        if (light.type === LightType.SPOT) {
          const spotEffect = L.dot(light.transformedDirection.normalize())
          if (spotEffect < Math.cos(toRadians(light.angle))) attenuation = 0.0
          else attenuation *= Math.pow(spotEffect, material.shininess);
        }

        // diffuse
        const nDotL = Math.max(normal.dot(L), 0)
        const diffuse = kD.multiplyV(intensity).multiply(nDotL).multiply(attenuation) 
        diffuseTerm = diffuseTerm.add(diffuse)

        // specular
        const reflection = normal.multiply(2 * nDotL).subtract(L).normalize()
        const rDotV = Math.max(reflection.dot(view), 0)
        const specular = kS.multiplyV(intensity).multiply(Math.pow(rDotV, material.shininess)).multiply(attenuation)
        if (nDotL > 0) {
          specularTerm = specularTerm.add(specular)
        }
      }

      const finalColor = ambientTerm.add(diffuseTerm).add(specularTerm).multiplyAr(color)
      color[0] = Math.min(finalColor.x, 1)
      color[1] = Math.min(finalColor.y, 1)
      color[2] = Math.min(finalColor.z, 1)
    }
  }

  #drawFaces() {
    for (let i = 0; i < this.zOrder.length; i++) {
      const faceIdx = this.zOrder[i]
      const face = this.faces[faceIdx]
      const color = this.colors[faceIdx]
      const context = this.ctx

      const vertices = face.map(idx => this.vertices[idx])
      // vertices.map(v => v.draw(context))

      const r = Math.floor(color[0] * 255)
      const g = Math.floor(color[1] * 255)
      const b = Math.floor(color[2] * 255)
 
      context.beginPath()
      context.strokeStyle = `rgb(${r}, ${g}, ${b})`
      context.fillStyle = `rgb(${r}, ${g}, ${b})`
      context.moveTo(vertices[0].x, vertices[0].y)
      
      for (let j = 1; j < vertices.length; j++) context.lineTo(vertices[j].x, vertices[j].y)
      context.lineTo(vertices[0].x, vertices[0].y)

      context.stroke()
      context.fill()
      context.closePath()
    }
  }

  #applyPerspective() {
    const camera = this.camera
    const factor = 1 / Math.tan(toRadians(camera.fov / 2))
    const aspect = this.viewWidth / this.viewHeight
    const factorX = factor * this.viewWidth / aspect
    const factorY = factor * this.viewHeight 
    const screenOffset = this.viewCenter
    
    for (let i = 0; i < this.verticesLength; i++) {
      const p = this.vertices[i]

      p.x = p.x * factorX / p.z + screenOffset.x
      p.y = p.y * factorY / p.z + screenOffset.y
    }
  }


  #applyZBuffer() {
    this.zBuffer = []
    for (let i = 0; i < this.facesLength; i++) {
      const face = this.faces[i]
      if (face == null) {
        this.zBuffer.push([i, null])
        continue
      } 

      const vertices = face.map(idx => this.vertices[idx])
      const centroid = Mesh.centroid(vertices)
      const distance = centroid.magnitude()

      this.zBuffer.push([i, distance])
    }

    this.zOrder = this.zBuffer
      .sort((a, b) => b[1] - a[1])
      .filter(value => value[1] != null)
      .map(value => value[0])
  }

  #applyBackfaceCulling() {
    for (let i = 0; i < this.facesLength; i++) {
      const face = this.faces[i]
      if (face == null) continue

      const vertices = face.map(idx => this.vertices[idx])
      const normal = Mesh.normal(vertices)

      const view = vertices[0].multiply(-1).normalize()
      if (normal.dot(view) <= 0) this.faces[i] = null      
    }
  }

  #applyClip() {
    for (let i = 0; i < this.facesLength; i++) {
      const face = this.faces[i]
      if (face == null) continue

      const predicate = face.every(i => this.vertices[i].z > 0)
      if (predicate === false) this.faces[i] = null
    }
  }

  #applyTransformations(lights) {
    this.#applyCameraTranslate(lights)
    this.#applyCameraRotate(lights)
  }

  #applyCameraTranslate(lights) {
    const cameraPosition = this.camera.position

    // y is inverted
    for (let i = 0; i < this.verticesLength; i++) {
      const vertex = this.vertices[i]
      vertex.x -= cameraPosition.x
      vertex.y = -(vertex.y - cameraPosition.y)
      vertex.z -= cameraPosition.z
    }

    for (let i = 0; i < lights.length; i++) {
      const position = lights[i].position
      if (!position) continue
      lights[i].transformedPosition = position.copy()
      const pos = lights[i].transformedPosition
      pos.x -= cameraPosition.x
      pos.y = -(pos.y - cameraPosition.y)
      pos.z -= cameraPosition.z
    }
  }

  #applyCameraRotate(lights) {
    const xAxis = new Vector3(1, 0, 0)
    const yAxis = new Vector3(0, 1, 0)
    const zAxis = new Vector3(0, 0, 1)
    const camera = this.camera

    let view = new Vector3(1, 0, 0).rotate(camera.angleH, yAxis).normalize()
    const u = yAxis.cross(view).normalize()
    view = view.rotate(camera.angleV, u)
    
    for (let i = 0; i < this.verticesLength; i++) {
      const vertex = this.vertices[i]
      // return new Vector3(p.x, p.y, p.z).rotate(this.angleH, yAxis).rotate(this.angleV, u)

      // working, no need for view and u idk why
      const rotated = vertex.rotate(camera.angleH, yAxis).rotate(camera.angleV, xAxis) // .rotate(180, zAxis)
      vertex.x = rotated.x
      vertex.y = rotated.y
      vertex.z = rotated.z
    }

    for (let i = 0; i < lights.length; i++) {
      const position = lights[i].transformedPosition
      if (position) {
        const rotatedPos = position.rotate(camera.angleH, yAxis).rotate(camera.angleV, xAxis)
        position.x = rotatedPos.x
        position.y = rotatedPos.y
        position.z = rotatedPos.z
      }

      const direction = lights[i].direction
      if (direction) {
        lights[i].transformedDirection = direction.copy()
        const dir = lights[i].transformedDirection
        const rotatedDir = dir.rotate(camera.angleH, yAxis).rotate(camera.angleV, xAxis)
        dir.x = rotatedDir.x
        dir.y = rotatedDir.y
        dir.z = rotatedDir.z
      }
    }
  }

  #fillBuffers(entities) {
    let meshStart = 0 // index of the first face of the current mesh
    // let realMaterialIndex = 0
    let realFaceIndex = 0
    let realVertexIndex = 0
    let relativeVertexIndex = 0

    for (const entity of entities) {
      const mesh = entity.mesh
      relativeVertexIndex = 0 // relative to the current mesh

      // fill materials buffer
      // this.materials[realMaterialIndex] = mesh.material

      // fill vertices buffer and apply transformations from object space to world space
      for (const vertex of mesh.vertices) {
        const newVertex = vertex.add(entity.position).rotate(entity.rotation, new Vector3(0, 1, 0))
        this.vertices[realVertexIndex] = newVertex

        realVertexIndex++
        relativeVertexIndex++
      }

      // fill buffers
      for (let faceIdx = 0; faceIdx < mesh.faces.length; faceIdx++) {
        const face = mesh.faces[faceIdx]
        // const extractedVertices = face.map(idx => mesh.vertices[idx])
        // const normal = mesh.normal(extractedVertices)

        const faceWithOffset = face.map(idx => idx + meshStart)
        const color = mesh.colors[faceIdx]
        
        this.faces[realFaceIndex] = faceWithOffset
        this.colors[realFaceIndex] = [...color]
        this.zOrder[realFaceIndex] = realFaceIndex
        this.materials[realFaceIndex] = mesh.material

        realFaceIndex++
      }

      meshStart += relativeVertexIndex // mesh.vertices.length
      // realMaterialIndex++
    }

    this.facesLength = realFaceIndex
    this.verticesLength = realVertexIndex
  }

  clear() {
    const ctx = this.ctx
    const canvas = ctx.canvas
    canvas.height = window.innerHeight
  }

  update() {
    if (this.viewHeight != this.ctx.canvas.height || this.viewWidth != this.ctx.canvas.width) {
      this.viewWidth = this.ctx.canvas.width
      this.viewHeight = this.ctx.canvas.height
      this.viewCenter = new Vector2(this.viewWidth / 2, this.viewHeight / 2)
    }
  }
}
